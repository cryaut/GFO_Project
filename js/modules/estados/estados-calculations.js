export const ACCOUNT_TYPES = {
  activos: ['efectivo', 'cxC', 'inventario', 'activosCorrientesOtros', 'activosFijos', 'depreciacionAcumulada'],
  pasivos: ['cuentasPorPagar', 'pasivoCortoPlazo', 'provisiones', 'pasivoLargoPlazo'],
  patrimonio: ['patrimonio'],
  estadoResultados: ['ventas', 'costoVentas', 'gastosAdmin', 'gastosVentas', 'otrosIngresos', 'otrosGastos', 'intereses', 'impuestos']
};

function normalizeName(name) {
  return String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Explicit mappings take precedence. Unrecognized names are never silently
// treated as current assets, debt or expenses: callers must request a mapping.
export function inferAccountType(group, name) {
  const key = normalizeName(name);
  if (!key) return '';
  const rules = {
    activos: [
      ['depreciacionAcumulada', /\bdepreciacion acumulada\b/],
      ['efectivo', /\b(efectivo|caja|bancos?|equivalentes de efectivo)\b/],
      ['cxC', /\b(cuentas por cobrar|clientes|deudores comerciales)\b/],
      ['inventario', /\b(inventarios?|existencias|mercaderias|mercancias)\b/],
      ['activosCorrientesOtros', /\b(activos corrientes otros|otros activos corrientes)\b/],
      ['activosFijos', /\b(terrenos|edificios|equipos|vehiculos|maquinaria|mobiliario|activos fijos|propiedad planta)\b/]
    ],
    pasivos: [
      ['cuentasPorPagar', /\b(cuentas por pagar|proveedores|acreedores comerciales)\b/],
      ['provisiones', /\bprovisiones\b/],
      ['pasivoCortoPlazo', /\b(corto plazo|pasivos corrientes|pasivo corriente)\b/],
      ['pasivoLargoPlazo', /\b(largo plazo|no corrientes|no corriente|otros pasivos)\b/]
    ],
    estadoResultados: [
      ['costoVentas', /\b(costos? de ventas|costos? de lo vendido)\b/],
      ['gastosVentas', /\b(gastos de ventas|gastos comerciales)\b/],
      ['gastosAdmin', /\b(gastos de administracion|gastos administrativos)\b/],
      ['otrosIngresos', /\botros ingresos\b/],
      ['otrosGastos', /\botros gastos\b/],
      ['intereses', /\b(gastos financieros|gastos de intereses|intereses pagados|intereses)\b/],
      ['impuestos', /\b(impuestos?|impuesto sobre la renta)\b/],
      ['ventas', /\b(ventas|ingresos operacionales|ingresos por servicios)\b/]
    ]
  };
  if (group === 'patrimonio') return 'patrimonio';
  // Non-current liabilities must not match the shorter 'pasivo corriente'.
  if (group === 'pasivos' && /\bno corrientes?\b/.test(key)) return 'pasivoLargoPlazo';
  return rules[group]?.find(([, pattern]) => pattern.test(key))?.[0] || '';
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
      const explicit = data.accountTypes?.[group];
      const type = explicit && Object.hasOwn(explicit, name)
        ? explicit[name] : inferAccountType(group, name);
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
  return { ...totals, unclassified, classificationComplete: unclassified.length === 0 };
}

export function validateFinancialData(data) {
  return (data.periods || []).map(period => {
    const { totalActivos, totalPasivos, totalPatrimonio } = computeFinancialTotals(data, period);
    const difference = totalActivos - totalPasivos - totalPatrimonio;
    return {
      period, totalActivos, totalPasivos, totalPatrimonio, difference,
      balanced: Math.abs(difference) <= 0.01 + Number.EPSILON * Math.max(1, Math.abs(totalActivos))
    };
  });
}

export function estadosCalculations(data, period) {
  return computeFinancialTotals(data, period);
}

