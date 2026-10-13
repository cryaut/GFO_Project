// Catálogo inicial para las categorías que entiende el motor de GFO.
// Fuentes, alcance y criterios: docs/catalogo-cuentas.md. Los alias son
// convenciones de importación del proyecto, no un plan de cuentas obligatorio.
export const CATALOGO_VERSION = '1.0.0';
export const ACCOUNT_LABELS = {
  efectivo: 'Efectivo y equivalentes', cxC: 'Cuentas por cobrar', inventario: 'Inventarios',
  activosCorrientesOtros: 'Otros activos corrientes', activosFijos: 'Activos no corrientes',
  depreciacionAcumulada: 'Depreciación acumulada (importe negativo)',
  cuentasPorPagar: 'Cuentas por pagar operativas', pasivoCortoPlazo: 'Deuda financiera corriente',
  provisiones: 'Provisiones corrientes operativas', pasivoLargoPlazo: 'Pasivos no corrientes',
  patrimonio: 'Patrimonio', ventas: 'Ingresos por ventas y servicios', costoVentas: 'Costo de ventas',
  gastosAdmin: 'Gastos administrativos', gastosVentas: 'Gastos de ventas',
  otrosIngresos: 'Otros ingresos', otrosGastos: 'Otros gastos', intereses: 'Gastos financieros', impuestos: 'Impuesto sobre la renta'
};
export const GROUP_LABELS = {
  activos: 'Activos', pasivos: 'Pasivos', patrimonio: 'Patrimonio', estadoResultados: 'Estado de resultados'
};

const cuenta = (nombre, grupo, tipo, alias = []) => ({ nombre, grupo, tipo, alias });
export const ACCOUNT_CATALOG = [
  cuenta('Efectivo', 'activos', 'efectivo', ['Caja', 'Caja general', 'Caja chica', 'Efectivo y equivalentes', 'Equivalentes de efectivo']),
  cuenta('Bancos', 'activos', 'efectivo', ['Banco', 'Cuenta corriente bancaria', 'Depósitos bancarios a la vista']),
  cuenta('Cuentas por cobrar comerciales', 'activos', 'cxC', ['Cuentas por cobrar', 'Clientes', 'Deudores comerciales', 'Cartera de clientes']),
  cuenta('Inventarios', 'activos', 'inventario', ['Inventario', 'Existencias', 'Mercadería', 'Mercaderías', 'Mercancías', 'Inventario de mercaderías']),
  cuenta('Materias primas', 'activos', 'inventario', ['Inventario de materias primas']),
  cuenta('Productos en proceso', 'activos', 'inventario', ['Producción en proceso']),
  cuenta('Productos terminados', 'activos', 'inventario', ['Inventario de productos terminados']),
  cuenta('Otros activos corrientes', 'activos', 'activosCorrientesOtros', ['Activos corrientes otros']),
  cuenta('Pagos anticipados corrientes', 'activos', 'activosCorrientesOtros', ['Gastos pagados por anticipado corrientes', 'Seguros pagados por anticipado corrientes']),
  cuenta('Propiedad, planta y equipo', 'activos', 'activosFijos', ['Propiedades planta y equipo', 'Activos fijos', 'Activos no corrientes']),
  cuenta('Terrenos', 'activos', 'activosFijos', ['Terreno']),
  cuenta('Edificios', 'activos', 'activosFijos', ['Edificio', 'Construcciones']),
  cuenta('Maquinaria', 'activos', 'activosFijos', ['Maquinarias']),
  cuenta('Equipo de oficina', 'activos', 'activosFijos', ['Equipos de oficina', 'Mobiliario', 'Muebles y enseres']),
  cuenta('Equipo de computación', 'activos', 'activosFijos', ['Equipos de computación', 'Equipo informático']),
  cuenta('Vehículos', 'activos', 'activosFijos', ['Equipo de transporte', 'Equipos de transporte']),
  cuenta('Depreciación acumulada', 'activos', 'depreciacionAcumulada', ['Depreciación acumulada de edificios', 'Depreciación acumulada de maquinaria', 'Depreciación acumulada de vehículos', 'Depreciación acumulada de equipos']),
  cuenta('Cuentas por pagar comerciales', 'pasivos', 'cuentasPorPagar', ['Cuentas por pagar', 'Proveedores', 'Acreedores comerciales']),
  cuenta('Deuda financiera corriente', 'pasivos', 'pasivoCortoPlazo', ['Préstamos a corto plazo', 'Préstamo bancario a corto plazo', 'Obligaciones financieras a corto plazo', 'Porción corriente de deuda a largo plazo']),
  cuenta('Provisiones corrientes operativas', 'pasivos', 'provisiones', ['Provisiones corrientes']),
  cuenta('Pasivos no corrientes', 'pasivos', 'pasivoLargoPlazo', ['Pasivo no corriente', 'Deuda a largo plazo', 'Préstamos a largo plazo', 'Préstamo bancario a largo plazo', 'Obligaciones financieras a largo plazo']),
  cuenta('Capital social', 'patrimonio', 'patrimonio', ['Capital', 'Capital aportado', 'Aportes de socios', 'Aportaciones de socios']),
  cuenta('Reservas', 'patrimonio', 'patrimonio', ['Reserva legal', 'Reservas de capital']),
  cuenta('Utilidades retenidas', 'patrimonio', 'patrimonio', ['Ganancias retenidas', 'Resultados acumulados', 'Utilidades acumuladas', 'Pérdidas acumuladas']),
  cuenta('Resultado del ejercicio', 'patrimonio', 'patrimonio', ['Utilidad del ejercicio', 'Pérdida del ejercicio']),
  cuenta('Patrimonio', 'patrimonio', 'patrimonio', ['Patrimonio neto', 'Capital contable']),
  cuenta('Ventas', 'estadoResultados', 'ventas', ['Ventas netas', 'Ingresos por ventas', 'Ingresos operacionales', 'Ingresos de actividades ordinarias']),
  cuenta('Ingresos por servicios', 'estadoResultados', 'ventas', ['Ingresos por consultoría', 'Servicios prestados']),
  cuenta('Costo de ventas', 'estadoResultados', 'costoVentas', ['Costos de ventas', 'Costo de lo vendido', 'Costo de mercadería vendida', 'Costo de servicios']),
  cuenta('Gastos administrativos', 'estadoResultados', 'gastosAdmin', ['Gastos de administración', 'Gastos generales y administrativos']),
  cuenta('Gastos de ventas', 'estadoResultados', 'gastosVentas', ['Gastos comerciales', 'Gastos de comercialización', 'Publicidad y mercadeo']),
  cuenta('Otros ingresos', 'estadoResultados', 'otrosIngresos', ['Otros ingresos no operativos']),
  cuenta('Otros gastos', 'estadoResultados', 'otrosGastos', ['Otros gastos no operativos']),
  cuenta('Gastos financieros', 'estadoResultados', 'intereses', ['Gastos de intereses', 'Intereses pagados', 'Intereses']),
  cuenta('Impuesto sobre la renta', 'estadoResultados', 'impuestos', ['Gasto por impuesto sobre la renta', 'Impuestos', 'Impuesto a las ganancias', 'IR'])
];

export function normalizeAccountName(name) {
  return String(name ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function matchCatalogAccount(name, group = '') {
  const key = normalizeAccountName(name);
  const candidates = ACCOUNT_CATALOG.filter(account => (!group || account.grupo === group)
    && [account.nombre, ...account.alias].some(alias => normalizeAccountName(alias) === key));
  const classifications = new Set(candidates.map(account => `${account.grupo}:${account.tipo}`));
  return classifications.size === 1 ? candidates[0] : null;
}

const SUBTOTALS = new Set([
  'total activo', 'total activos', 'total activos corrientes', 'total activos no corrientes',
  'total pasivo', 'total pasivos', 'total pasivos corrientes', 'total pasivos no corrientes',
  'total patrimonio', 'total pasivo y patrimonio', 'total pasivos y patrimonio',
  'total pasivos mas patrimonio', 'utilidad bruta', 'utilidad operativa', 'utilidad neta',
  'resultado bruto', 'resultado operativo', 'resultado neto', 'resultado del ejercicio',
  'utilidad del ejercicio', 'perdida del ejercicio'
]);
export function isStatementSubtotal(name, group = '') {
  const key = normalizeAccountName(name);
  // El resultado del ejercicio puede ser una cuenta real dentro del patrimonio.
  if (group === 'patrimonio' && !key.startsWith('total ')) return false;
  return SUBTOTALS.has(key);
}
