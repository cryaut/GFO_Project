import { TIPOS_APP } from './cuentas-catalogo.js';
import { tipoCuentaLegada, obtenerCuenta } from './cuentas-identificador.js';
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
  'is.gross_profit_reported': ['utilidadBruta', 'utilidadNeta'],
  'is.operating_profit_reported': ['utilidadNeta'],
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
    if (tipos.some(tipo => ['ventas', 'costoVentas'].includes(tipo))) campos.add('utilidadBruta');
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

export function computeFinancialTotals(data, period) {
  const bg = data.balanceGeneral?.[period] || {};
  const er = data.estadoResultados?.[period] || {};
  const totals = Object.fromEntries(Object.values(ACCOUNT_TYPES).flat().map(type => [type, 0]));
  const unclassified = [];
  const sums = {};
  for (const group of Object.keys(ACCOUNT_TYPES)) {
    const accounts = group === 'estadoResultados' ? er : (bg[group] || {});
    sums[group] = 0;
    for (const [name, value] of Object.entries(accounts)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`Importe inválido: ${period} / ${name}`);
      }
      const type = resolveAccountType(data, group, name);
      if (type && !ACCOUNT_TYPES[group].includes(type)) {
        throw new Error(`Clasificación inválida: ${group} / ${name}`);
      }
      sums[group] += value;
      if (type) totals[type] += value;
      else if (value !== 0) unclassified.push({ group, name });
    }
  }
  totals.totalActivos = sums.activos;
  totals.totalPasivos = sums.pasivos;
  totals.totalPatrimonio = sums.patrimonio;
  totals.activosCorrientes = totals.efectivo + totals.cxC + totals.inventario + totals.activosCorrientesOtros;
  totals.pasivosCorrientes = totals.cuentasPorPagar + totals.pasivoCortoPlazo + totals.provisiones;
  totals.activosFijos += totals.depreciacionAcumulada;
  totals.utilidadBruta = totals.ventas - totals.costoVentas;
  totals.utilidadNeta = totals.utilidadBruta - totals.gastosAdmin - totals.gastosVentas
    + totals.otrosIngresos - totals.otrosGastos - totals.intereses - totals.impuestos;
  const reasons = [];
  const pendientes = [
    ...unclassified,
    ...Object.entries(data.reportedTotals?.[period] || {}).map(([id, total]) => ({ group: total.grupo, name: total.nombre, id }))
  ];
  for (const { group, name, id } of pendientes) {
    const identidad = data.accountIdentities?.[group]?.[name] || { estado: id ? 'reconocida' : 'no_reconocida' };
    const motivo = identidad.estado === 'reconocida' ? 'missing_required_account_data'
      : identidad.estado === 'sugerida' ? 'ambiguous_account_match' : 'unrecognized_imported_account';
    const campos = camposPendientes(data, group, name, id);
    reasons.push({ group, name, motivo, campos });
    for (const key of campos) totals[key] = null;
  }
  // El motor por identificadores elegirá total o componentes. Mientras tanto,
  // el motor anterior no publica una suma duplicada cuando ambos están presentes.
  for (const [group, accounts] of Object.entries(data.accountIdentities || {})) {
    const valores = group === 'estadoResultados' ? er : bg[group] || {};
    const presentes = Object.entries(accounts).filter(([name, identidad]) => Object.hasOwn(valores, name)
      && identidad.origen !== 'legado' && identidad.estado === 'reconocida')
      .map(([, identidad]) => obtenerCuenta(identidad.idCuenta)).filter(Boolean);
    for (const total of presentes.filter(cuenta => cuenta.rol === 'reported_total' && cuenta.tipoApp)) {
      if (!presentes.some(cuenta => cuenta.id !== total.id && cuenta.tipoApp === total.tipoApp)) continue;
      const campos = camposDeTipos(group, [total.tipoApp]);
      for (const key of campos) totals[key] = null;
      reasons.push({ group, name: total.nombreCanonico, motivo: 'overlapping_account_aggregation', campos });
    }
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

