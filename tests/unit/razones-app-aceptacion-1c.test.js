import { afterEach, expect, it, vi } from 'vitest';
import { documentoAceptacion, cambiarImporte, renombrarFila, retirarIdentidad, filaConId, MAPA_APP_JSON } from '../fixtures/razones-app.js';

afterEach(() => vi.unstubAllGlobals());

// Cada escenario usa la misma API pública que la pantalla y estados persistidos.
// Se aísla la caché del módulo para no reutilizar un documento de otro escenario.
async function razonesEnApp(datos) {
  vi.resetModules();
  const memoria = new Map();
  vi.stubGlobal('localStorage', { getItem:clave => memoria.get(clave) ?? null,
    setItem:(clave,valor) => memoria.set(clave,valor) });
  const { default:store } = await import('../../js/store.js');
  const { computeRazones, refreshSavedStates } = await import('../../js/modules/analisis/index.js');
  store.setPersisted('estados', datos);
  refreshSavedStates();
  return computeRazones('2032');
}

// Inventario B, ronda 7: 15 sitios de Análisis y 7 de Integración.
// Las cifras esperadas son sustituciones manuales del caso ficticio completo.
// Un importe 0/100 conserva su efecto en la fórmula; no se exige que un coste
// de 100 produzca por sí solo una razón 100 ni que coste cero produzca margen cero.
const analisis = [
  ['Análisis:88','Ventas','is.product_sales','rotacionActivos',0,0.1],
  ['Análisis:89','Costo de Ventas','is.merchandise_cost','RotInv',0,1/3],
  ['Análisis:90','Gastos de Administracion','is.administrative_expenses','MN',0.45,0.35],
  ['Análisis:91','Gastos de Ventas','is.selling_expenses','MN',0.4,0.3],
  ['Análisis:92','Otros Ingresos','is.nonoperating_income','MN',0.33,0.43],
  ['Análisis:93','Otros Gastos','is.noninterest_nonoperating_expenses','MN',0.38,0.28],
  ['Análisis:94','Gastos por Intereses','is.interest_expense','MN',0.39,0.29],
  ['Análisis:95','Impuestos','is.income_tax_expense','MN',0.4,0.3],
  ['Análisis:122','Efectivo','bs.cash_and_equivalents','RC',18/7,22/7],
  ['Análisis:123','Cuentas por Cobrar','bs.trade_receivables','RC',22/7,26/7],
  ['Análisis:124','Inventario','bs.inventory_merchandise','RC',2,18/7],
  ['Análisis:125','Activos Corrientes Otros','bs.other_current_assets','RC',24/7,4],
  ['Análisis:128','Cuentas por Pagar','bs.trade_payables','RC',26/3,26/7],
  ['Análisis:129','Pasivo Corto Plazo','bs.short_term_borrowings','RC',26/5,26/9],
  ['Análisis:130','Provisiones','bs.current_provisions','RC',13/3,13/5]
];
const integracion = [0,0,1,2,3,4,5].map((indice, sitio) => [
  `Integración:${sitio === 0 ? '51' : '53–54'}/${sitio}`, ...analisis[indice].slice(1)
]);
const lecturas = [...analisis,...integracion].map(([sitio,rotulo,id,campo,cero,cien]) => ({ sitio, rotulo, id, campo, cero, cien }));
const escenarios = ['ausente','cero','cien','renombrada','sin identidad'];
const casos = lecturas.flatMap(lectura => [false,true].flatMap(conAnterior => escenarios.map(escenario => ({
  ...lectura, conAnterior, escenario
}))));

it('cubre los 22 sitios del inventario B, cinco entradas y uno/dos periodos', () => {
  expect(lecturas).toHaveLength(22);
  expect(new Set(lecturas.map(lectura => lectura.sitio)).size).toBe(22);
  expect(new Set(lecturas.map(lectura => lectura.rotulo)).size).toBe(15);
  expect(casos).toHaveLength(220);
});

it.each(casos)('1c $sitio $rotulo: $escenario, anterior=$conAnterior', async caso => {
  const datos = documentoAceptacion(caso.conAnterior);
  const importe = caso.escenario === 'ausente' ? undefined : caso.escenario === 'cero' ? 0 : 100;
  cambiarImporte(datos, caso.id, importe);
  if (caso.escenario === 'renombrada') renombrarFila(datos, caso.id);
  if (caso.escenario === 'sin identidad') retirarIdentidad(datos, caso.id);
  const salida = await razonesEnApp(datos);
  if (caso.escenario === 'ausente' || caso.escenario === 'sin identidad') {
    expect(salida[caso.campo]).toBeNull();
    const motivos = salida.notAvailableReasons.filter(motivo => motivo.campo === caso.campo);
    expect(motivos.length).toBeGreaterThan(0);
    expect(motivos.some(motivo => motivo.operandos.includes(caso.id))).toBe(true);
    expect(motivos.every(motivo => motivo.periodo && motivo.motivo)).toBe(true);
  } else {
    expect(salida[caso.campo]).toBeCloseTo(caso.escenario === 'cero' ? caso.cero : caso.cien, 6);
    expect(salida.notAvailableReasons.some(motivo => motivo.campo === caso.campo)).toBe(false);
  }
});

it.each([false,true])('P-GLOBAL: el documento inválido no alimenta ninguna de las veinte razones, anterior=%s', async conAnterior => {
  const datos = documentoAceptacion(conAnterior);
  const { grupo, nombre } = filaConId(datos, 'is.administrative_expenses');
  datos.accountTypes[grupo][nombre] = 'clasificacion_fuera_del_contrato';
  const salida = await razonesEnApp(datos);
  for (const campo of Object.keys(MAPA_APP_JSON)) {
    expect(salida[campo], campo).toBeNull();
    expect(salida.notAvailableReasons).toEqual(expect.arrayContaining([
      expect.objectContaining({ campo, periodo:'2032', motivo:'documento_no_normalizable' })
    ]));
  }
});

it.each([false,true])('P-CONSUMIDORES: la identidad no acreditada afecta sus dependientes y conserva liquidez e inventarios, anterior=%s', async conAnterior => {
  const datos = documentoAceptacion(conAnterior);
  const base = await razonesEnApp(datos);
  retirarIdentidad(datos, 'is.administrative_expenses');
  const salida = await razonesEnApp(datos);
  expect(salida.MN).toBeNull();
  expect(salida.margenOperativo).toBeNull();
  expect(salida.RC).toBeCloseTo(26/7, 6);
  expect(salida.RotInv).toBeCloseTo(4/3, 6);
  expect(salida.RC).toBe(base.RC);
  expect(salida.RotInv).toBe(base.RotInv);
  expect(salida.notAvailableReasons.some(motivo => ['RC','RotInv'].includes(motivo.campo))).toBe(false);
});
