import { TIPOS_APP } from './cuentas-catalogo.js';
import { tipoCuentaLegada, obtenerCuenta, identificarCuenta } from './cuentas-identificador.js';
export const ACCOUNT_TYPES = TIPOS_APP;

// Explicit mappings take precedence. Unrecognized names are never silently
// treated as current assets, debt or expenses: callers must request a mapping.
export function inferAccountType(group, name) {
  return tipoCuentaLegada(group, name);
}

// Tipo de una cuenta: el explícito de accountTypes o, si no hay, el inferido por el nombre.
// Misma regla que usa computeFinancialTotals; devuelve '' si no se reconoce.
export function resolveAccountType(data, group, name) {
  const explicit = data?.accountTypes?.[group];
  const identidad = data?.accountIdentities?.[group]?.[name];
  if (identidad && identidad.origen !== 'legado' && identidad.estado !== 'reconocida') return '';
  return explicit && Object.hasOwn(explicit, name)
    ? explicit[name] : inferAccountType(group, name);
}

const CAMPOS_REPORTADOS = {
  'bs.current_assets_total': ['activosCorrientes', 'totalActivos'],
  'bs.fixed_assets_net_total': ['activosFijos', 'totalActivos'],
  'bs.total_assets': ['totalActivos'],
  'bs.current_liabilities_total': ['pasivosCorrientes', 'totalPasivos'],
  'bs.total_liabilities': ['totalPasivos'],
  'bs.total_equity': ['totalPatrimonio'],
  'bs.inventory_total': ['inventario', 'activosCorrientes', 'totalActivos'],
  'is.sales_total': ['ventasBrutas', 'ventas', 'utilidadBruta', 'utilidadNeta'],
  'is.net_sales_reported': ['ventas', 'utilidadBruta', 'utilidadNeta'],
  'is.cost_of_sales_reported': ['costoVentas', 'utilidadBruta', 'utilidadNeta'],
  'is.gross_profit_reported': ['utilidadBruta', 'utilidadNeta'],
  'is.operating_profit_reported': [],
  'is.net_income_reported': ['utilidadNeta']
};

function camposDeTipos(group, tipos) {
  const campos = new Set(tipos);
  if (group === 'activos') {
    campos.add('totalActivos');
    if (tipos.some(tipo => ['efectivo', 'cxC', 'inventario', 'activosCorrientesOtros'].includes(tipo))) campos.add('activosCorrientes');
    if (tipos.some(tipo => ['activosFijos', 'depreciacionAcumulada'].includes(tipo))) campos.add('activosFijos');
  } else if (group === 'pasivos') {
    campos.add('totalPasivos');
    if (tipos.some(tipo => tipo !== 'pasivoLargoPlazo')) campos.add('pasivosCorrientes');
  } else if (group === 'patrimonio') campos.add('totalPatrimonio');
  else if (group === 'estadoResultados') {
    campos.add('utilidadNeta');
    if (tipos.some(tipo => ['ventas', 'costoVentas', 'deduccionesVentas'].includes(tipo))) campos.add('utilidadBruta');
    if (tipos.some(tipo => ['ventas', 'deduccionesVentas'].includes(tipo))) campos.add('ventas');
  }
  return [...campos];
}

// La clasificación explícita restringe posibilidades, pero no confirma la identidad.
// Sin contexto se conservan todas las posibilidades dentro del grupo de la fila.
function camposPendientes(data, group, name, id) {
  const tipo = data.accountTypes?.[group]?.[name];
  const identidad = data.accountIdentities?.[group]?.[name];
  const explicitos = ACCOUNT_TYPES[group]?.includes(tipo) ? camposDeTipos(group, [tipo]) : [];
  if (explicitos.length && identidad?.metodo !== 'conflicto_contexto') return explicitos;
  const candidatas = (id ? [id] : identidad?.idCuenta ? [identidad.idCuenta]
    : (identidad?.candidatos || []).map(c => c.id)).map(obtenerCuenta).filter(c => c?.grupo === group);
  const campos = candidatas.flatMap(cuenta => {
    if (CAMPOS_REPORTADOS[cuenta.id]) return CAMPOS_REPORTADOS[cuenta.id];
    const tipos = cuenta.tipoApp ? [cuenta.tipoApp]
      : cuenta.clasificacion === 'gasto_operativo' ? ['gastosAdmin', 'gastosVentas', 'otrosGastos']
        : cuenta.clasificacion === 'ingreso' ? ['ventas', 'otrosIngresos']
          : cuenta.clasificacion === 'deduccion_ingreso' ? ['ventas'] : ACCOUNT_TYPES[group];
    return camposDeTipos(group, tipos);
  });
  return [...new Set(campos.length ? [...explicitos, ...campos] : explicitos.length ? explicitos : camposDeTipos(group, ACCOUNT_TYPES[group]))];
}

const TOLERANCIA = 0.01;

export function computeFinancialTotals(data, period) {
  const bg = data.balanceGeneral?.[period] || {};
  const er = data.estadoResultados?.[period] || {};
  const accountsByGroup = {
    activos: bg.activos || {},
    pasivos: bg.pasivos || {},
    patrimonio: bg.patrimonio || {},
    estadoResultados: er
  };
  const detail = Object.fromEntries(Object.values(ACCOUNT_TYPES).flat().map(type => [type, 0]));
  const present = new Set();
  const idsPresentes = new Set();
  const reported = {};
  const groupReported = new Set();
  const unclassified = [];
  const reasons = [];

  // Una identidad reconocida manda; sin metadatos se identifica por nombre, igual que la compuerta.
  const identidadDe = (group, name) => {
    const guardada = data.accountIdentities?.[group]?.[name];
    if (guardada) return guardada.estado === 'reconocida' ? guardada.idCuenta : null;
    const inferida = identificarCuenta(name, { grupo: group });
    return inferida.estado === 'reconocida' ? inferida.id : null;
  };

  for (const group of Object.keys(ACCOUNT_TYPES)) {
    const accounts = accountsByGroup[group];
    for (const [name, value] of Object.entries(accounts)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`Importe inválido: ${period} / ${name}`);
      }
      const type = resolveAccountType(data, group, name);
      if (type && !ACCOUNT_TYPES[group].includes(type)) {
        throw new Error(`Clasificación inválida: ${group} / ${name}`);
      }
      const id = identidadDe(group, name);
      const cuenta = id ? obtenerCuenta(id) : null;
      if (cuenta?.rol === 'reported_total') {
        idsPresentes.add(id);
        if (!Object.hasOwn(reported, id)) reported[id] = { nombre: name, grupo: group, importe: value };
        groupReported.add(group);
        continue;
      }
      if (id) idsPresentes.add(id);
      if (type) {
        detail[type] += value;
        present.add(type);
      } else if (value !== 0) unclassified.push({ group, name });
    }
  }

  for (const [id, total] of Object.entries(data.reportedTotals?.[period] || {})) {
    const cuenta = obtenerCuenta(id);
    if (!cuenta) continue;
    idsPresentes.add(id);
    if (!Object.hasOwn(reported, id)) {
      reported[id] = { nombre: total.nombre, grupo: total.grupo || cuenta.grupo, importe: total.importe };
    }
    groupReported.add(total.grupo || cuenta.grupo);
  }

  const hayReportado = id => Object.hasOwn(reported, id);
  const excedeTolerancia = (a, b) => Math.abs(a - b) > TOLERANCIA + Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
  const usarReportado = (id, calculado) => {
    const total = reported[id];
    if (calculado === null || calculado === undefined) return total.importe;
    if (excedeTolerancia(total.importe, calculado)) {
      reasons.push({
        group: total.grupo,
        name: total.nombre,
        motivo: 'reported_subtotal_mismatch',
        campos: CAMPOS_REPORTADOS[id] || [],
        diferencia: total.importe - calculado
      });
    }
    return total.importe;
  };
  const componente = (detalle, hayDetalle, reportadoId) => hayReportado(reportadoId)
    ? usarReportado(reportadoId, hayDetalle ? detalle : null)
    : (hayDetalle ? detalle : 0);
  const subtotal = (detalle, hayDetalle, grupo, reportadoId) => hayReportado(reportadoId)
    ? usarReportado(reportadoId, hayDetalle ? detalle : null)
    : (hayDetalle ? detalle : (groupReported.has(grupo) ? null : 0));

  const inventario = componente(detail.inventario, present.has('inventario'), 'bs.inventory_total');
  const activosCorrientesDetalle = detail.efectivo + detail.cxC + inventario + detail.activosCorrientesOtros;
  const hayCorrientes = ['efectivo', 'cxC', 'inventario', 'activosCorrientesOtros'].some(tipo => present.has(tipo))
    || hayReportado('bs.inventory_total');
  const activosCorrientes = subtotal(activosCorrientesDetalle, hayCorrientes, 'activos', 'bs.current_assets_total');
  const activosFijosDetalle = detail.activosFijos + detail.depreciacionAcumulada;
  const hayFijos = present.has('activosFijos') || present.has('depreciacionAcumulada');
  const activosFijos = subtotal(activosFijosDetalle, hayFijos, 'activos', 'bs.fixed_assets_net_total');
  const totalActivosCalculado = activosCorrientes === null || activosFijos === null ? null : activosCorrientes + activosFijos;
  const totalActivos = hayReportado('bs.total_assets')
    ? usarReportado('bs.total_assets', totalActivosCalculado)
    : (totalActivosCalculado !== null ? totalActivosCalculado : (groupReported.has('activos') ? null : 0));

  const pasivosCorrientesDetalle = detail.cuentasPorPagar + detail.pasivoCortoPlazo + detail.provisiones;
  const hayPasivosCorrientes = ['cuentasPorPagar', 'pasivoCortoPlazo', 'provisiones'].some(tipo => present.has(tipo));
  const pasivosCorrientes = subtotal(pasivosCorrientesDetalle, hayPasivosCorrientes, 'pasivos', 'bs.current_liabilities_total');
  const totalPasivosCalculado = pasivosCorrientes === null ? null : pasivosCorrientes + detail.pasivoLargoPlazo;
  const totalPasivos = hayReportado('bs.total_liabilities')
    ? usarReportado('bs.total_liabilities', totalPasivosCalculado)
    : (totalPasivosCalculado !== null ? totalPasivosCalculado : (groupReported.has('pasivos') ? null : 0));

  const totalPatrimonio = subtotal(detail.patrimonio, present.has('patrimonio'), 'patrimonio', 'bs.total_equity');

  const hayVentasDetalle = present.has('ventas');
  const ventasBrutas = hayReportado('is.sales_total')
    ? usarReportado('is.sales_total', hayVentasDetalle ? detail.ventas : null)
    : (hayVentasDetalle ? detail.ventas : (groupReported.has('estadoResultados') ? null : 0));
  const deducciones = detail.deduccionesVentas || 0;
  const ventasNetasCalculadas = ventasBrutas === null ? null : ventasBrutas - deducciones;
  const ventas = hayReportado('is.net_sales_reported')
    ? usarReportado('is.net_sales_reported', ventasNetasCalculadas)
    : (ventasNetasCalculadas !== null ? ventasNetasCalculadas : (groupReported.has('estadoResultados') ? null : 0));
  const costoVentas = hayReportado('is.cost_of_sales_reported')
    ? usarReportado('is.cost_of_sales_reported', present.has('costoVentas') ? detail.costoVentas : null)
    : (present.has('costoVentas') ? detail.costoVentas : (groupReported.has('estadoResultados') ? null : 0));
  const utilidadBrutaCalculada = ventas === null || costoVentas === null ? null : ventas - costoVentas;
  const utilidadBruta = hayReportado('is.gross_profit_reported')
    ? usarReportado('is.gross_profit_reported', utilidadBrutaCalculada)
    : (utilidadBrutaCalculada !== null ? utilidadBrutaCalculada : (groupReported.has('estadoResultados') ? null : 0));
  const gastos = detail.gastosAdmin + detail.gastosVentas - detail.otrosIngresos
    + detail.otrosGastos + detail.intereses + detail.impuestos;
  const utilidadNetaCalculada = utilidadBruta === null ? null : utilidadBruta - gastos;
  const utilidadNeta = hayReportado('is.net_income_reported')
    ? usarReportado('is.net_income_reported', utilidadNetaCalculada)
    : (utilidadNetaCalculada !== null ? utilidadNetaCalculada : (groupReported.has('estadoResultados') ? null : 0));

  const totals = {
    ...detail,
    inventario,
    activosCorrientes, activosFijos, totalActivos,
    pasivosCorrientes, totalPasivos, totalPatrimonio,
    ventasBrutas, ventas, costoVentas, utilidadBruta, utilidadNeta
  };

  for (const { group, name } of unclassified) {
    const identidad = data.accountIdentities?.[group]?.[name] || { estado: 'no_reconocida' };
    const motivo = identidad.estado === 'reconocida' ? 'missing_required_account_data'
      : identidad.estado === 'sugerida' ? 'ambiguous_account_match' : 'unrecognized_imported_account';
    const campos = camposPendientes(data, group, name, null);
    reasons.push({ group, name, motivo, campos });
    for (const key of campos) totals[key] = null;
  }

  const sinGrupo = data.pendingAccounts?.filter(fila => Object.hasOwn(fila.importes, period) && fila.importes[period] !== 0) || [];
  if (sinGrupo.length) {
    for (const key of Object.keys(totals)) totals[key] = null;
    reasons.push({ group: '', name: '', motivo: sinGrupo.some(fila => fila.identificacion.estado === 'sugerida')
      ? 'ambiguous_account_match' : 'unrecognized_imported_account', campos: Object.keys(totals) });
  }
  return { ...totals, unclassified, classificationComplete: unclassified.length === 0 && reasons.length === 0, notAvailableReasons: reasons };
}

export function validateFinancialData(data) {
  return (data.periods || []).map(period => {
    const { totalActivos, totalPasivos, totalPatrimonio } = computeFinancialTotals(data, period);
    const complete = [totalActivos, totalPasivos, totalPatrimonio].every(value => value !== null);
    const difference = complete ? totalActivos - totalPasivos - totalPatrimonio : null;
    return {
      period, totalActivos, totalPasivos, totalPatrimonio, difference,
      balanced: complete && Math.abs(difference) <= 0.01 + Number.EPSILON * Math.max(1, Math.abs(totalActivos))
    };
  });
}

export function estadosCalculations(data, period) {
  return computeFinancialTotals(data, period);
}
