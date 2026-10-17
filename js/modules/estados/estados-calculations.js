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
      else unclassified.push({ group, name });
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
  // Unknown income-statement accounts make profit indeterminate, not zero.
  if (unclassified.some(account => account.group === 'estadoResultados')) {
    totals.utilidadBruta = null;
    totals.utilidadNeta = null;
  }
  const reasons = [];
  const pendientes = [
    ...unclassified.filter(({ group, name }) => data.accountIdentities?.[group]?.[name]?.origen !== 'legado'
      && data.accountIdentities?.[group]?.[name]),
    ...Object.values(data.reportedTotals?.[period] || {}).map(total => ({ group: total.grupo, name: total.nombre }))
  ];
  for (const { group, name } of pendientes) {
    const identidad = data.accountIdentities?.[group]?.[name] || { estado: 'reconocida' };
    const motivo = identidad.estado === 'reconocida' ? 'missing_required_account_data'
      : identidad.estado === 'sugerida' ? 'ambiguous_account_match' : 'unrecognized_imported_account';
    reasons.push({ group, name, motivo });
    if (group === 'estadoResultados') {
      for (const key of ACCOUNT_TYPES.estadoResultados) totals[key] = null;
    } else {
      for (const key of ACCOUNT_TYPES[group]) totals[key] = null;
      for (const key of group === 'activos' ? ['totalActivos', 'activosCorrientes', 'activosFijos']
        : group === 'pasivos' ? ['totalPasivos', 'pasivosCorrientes'] : ['totalPatrimonio']) totals[key] = null;
    }
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
      totals[total.tipoApp] = null;
      if (group === 'activos') { totals.activosCorrientes = null; totals.totalActivos = null; }
      if (group === 'estadoResultados') { totals.utilidadBruta = null; totals.utilidadNeta = null; }
      reasons.push({ group, name: total.nombreCanonico, motivo: 'overlapping_account_aggregation' });
    }
  }
  const sinGrupo = data.pendingAccounts?.filter(fila => Object.hasOwn(fila.importes, period)) || [];
  if (sinGrupo.length) {
    for (const key of Object.keys(totals)) totals[key] = null;
    reasons.push({ group: '', name: '', motivo: sinGrupo.some(fila => fila.identificacion.estado === 'sugerida')
      ? 'ambiguous_account_match' : 'unrecognized_imported_account' });
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

