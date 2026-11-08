import { expect, it } from 'vitest';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { computarRazonesDesdeDatos } from '../../js/modules/razones/razones-app-adapter.js';
import { DEMO_MUNOMODA } from '../../js/modules/estados/index.js';
import { estadosResueltos } from '../../js/modules/estados/estados-presentacion-calculations.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { crearEntradaRazones, calcularRazon, calcularRazonConTraza, evaluarDerivado } from '../../js/modules/razones/razones-motor.js';
import { entradaManual } from './fixtures/razones-casos.js';
import { ESPECIFICACION_RAZONES } from '../../js/modules/razones/especificacion-razones.js';
import { disponibilidadRazones } from '../../js/modules/analisis/analisis-disponibilidad-ui.js';
import { consultarMontoCuenta } from '../../js/modules/estados/cuentas-identificador.js';
import { resultadosReales } from '../../js/modules/proforma/proforma-calculations.js';

const vacio = () => ({ name: 'Ejercicio por totales', periods: ['2024'],
  balanceGeneral: { '2024': { activos: {}, pasivos: {}, patrimonio: {} } }, estadoResultados: { '2024': {} } });
const registrar = (datos, entradas) => registrarCuenta(datos, entradas.map(([id, importe]) =>
  ({ id, nombre: `Cuenta propia ${id}`, importe, periodo: '2024', confirmado: true })));
const razones = datos => computarRazonesDesdeDatos(datos, '2024');

it('calcula RC solo con totales acreditados sin exigir cuentas accesorias', () => {
  const datos = registrar(vacio(), [['bs.current_assets_total', 1000], ['bs.current_liabilities_total', 400]]);
  expect(razones(datos).RC).toBe(2.5); // 1000/400
  expect(razones(registrar(datos, [['bs.cash_and_equivalents', 100]])).RC).toBe(2.5);
});

it('conserva UN reportada aunque la composición del detalle impida comprobarla', () => {
  const datos = registrar(vacio(), [['is.net_sales_reported', 1000], ['is.net_income_reported', 100], ['is.nonoperating_income', 20]]);
  const r = razones(datos);
  expect(r.MN).toBe(0.1); // 100/1000, sin volver a reconstruir UN
  expect(r.notAvailableReasons).toEqual(expect.arrayContaining([
    expect.objectContaining({ campo: 'MN', motivo: 'reported_subtotal_unverifiable' })
  ]));
});

it('sin total ni cobertura confirmada conserva N/D en vez de completar un documento parcial', () => {
  const datos = registrar(vacio(), [['bs.cash_and_equivalents', 1000], ['bs.trade_payables', 400]]);
  expect(razones(datos).RC).toBeNull();
  datos.coberturaEstados = { '2024': { activos: 'parcial', pasivos: 'parcial' } };
  expect(razones(datos).RC).toBeNull();
});

it('calcula conjuntos completos sin crear cuentas en cero y conserva cero como valor', () => {
  const datos = registrar(vacio(), [['bs.cash_and_equivalents', 1000], ['bs.trade_payables', 400]]);
  datos.coberturaEstados = { '2024': { activos: 'completo', pasivos: 'completo' } };
  const copia = structuredClone(datos);
  expect(razones(datos).RC).toBe(2.5);
  expect(razones(datos).capitalNetoTrabajo).toBe(600);
  expect(datos).toEqual(copia);
  const traza = calcularRazonConTraza('liquidez_razon_corriente', crearEntradaRazones(datos, '2024'));
  expect(traza.lecturas).toEqual(expect.arrayContaining([
    expect.objectContaining({ clave:'bs.short_term_investments:current', valor:0, origen:'no_aplica_por_cobertura' })
  ]));
  const cero = registrar(vacio(), [['bs.cash_and_equivalents', 0], ['bs.trade_payables', 400]]);
  cero.coberturaEstados = datos.coberturaEstados;
  expect(razones(cero).RC).toBe(0);
});

it('PC cero o un grupo sin datos conservan N/D aunque se marque completo', () => {
  const datos = registrar(vacio(), [['bs.cash_and_equivalents', 1000], ['bs.trade_payables', 0]]);
  datos.coberturaEstados = { '2024': { activos: 'completo', pasivos: 'completo' } };
  expect(razones(datos).RC).toBeNull();
  expect(razones({ ...vacio(), coberturaEstados: datos.coberturaEstados }).RC).toBeNull();
});

it('no pierde la cobertura al normalizar, y rechaza declaraciones inválidas', () => {
  const datos = registrar(vacio(), [['bs.cash_and_equivalents', 1000]]);
  datos.coberturaEstados = { '2024': { activos: 'completo', estadoResultados: 'parcial' } };
  expect(normalizeFinancialData(datos).coberturaEstados).toEqual(datos.coberturaEstados);
  for (const cobertura of [{ '2024': { activos: 'sí' } }, { '2030': { activos: 'completo' } }, { '2024': { suplementario: 'completo' } }]) {
    expect(() => normalizeFinancialData({ ...datos, coberturaEstados: cobertura })).toThrow();
  }
});

it('la demo reparada recupera RC y utilidad sin añadir cuentas que el ejercicio no contiene', () => {
  const datos = normalizeFinancialData(DEMO_MUNOMODA), r = razones(datos);
  expect(r.RC).toBeCloseTo(412000 / 175000, 12);
  expect(r.MN).toBeCloseTo(104825 / 920000, 12);
  expect(r.ROA).toBeCloseTo(104825 / 813500, 12);
  expect(r.roe).toBeCloseTo(104825 / 550027.5, 12);
  expect(r.RotCxC).toBeNull();
  expect(r.rotacionCxP).toBeNull();
  expect(datos.estadoResultados['2024']).not.toHaveProperty('Depreciación operativa');
  expect(consultarMontoCuenta(datos, '2024', 'is.other_operating_income').valor).toBe(0);
  expect(resultadosReales(datos)).toMatchObject({ utilidadNeta:104825, otrosOperativos:0, uai:149750 });
});

it('un importe vaciado en el borrador sigue N/D con cobertura completa, sin anular UAI independiente', () => {
  const datos = normalizeFinancialData(DEMO_MUNOMODA);
  datos.estadoResultados['2024']['Impuesto sobre la Renta'] = '';
  const filas = estadosResueltos(datos, '2024').estadoResultados;
  expect(filas.find(f => f.id === 'is.net_income_reported').valor).toBeNull();
  expect(filas.find(f => f.id === 'presentacion.uai').valor).toBe(149750);
});

it('un ER completo con solo partidas aplicables produce UN sin crear el resto del catálogo', () => {
  const datos = registrar(vacio(), [['is.net_sales_reported', 1000], ['is.cost_of_sales_reported', 400],
    ['is.administrative_expenses', 100], ['is.selling_expenses', 50], ['is.nonoperating_income', 20],
    ['is.noninterest_nonoperating_expenses', 30], ['is.interest_expense', 40], ['is.income_tax_expense', 50]]);
  datos.coberturaEstados = { '2024': { estadoResultados: 'completo' } };
  datos.composicionIngresos = { '2024': 'excluye_intereses' };
  // 1000−400−100−50+20−30−40−50=350; MN=350/1000=35%.
  expect(razones(datos).MN).toBe(0.35);
  expect(Object.keys(datos.estadoResultados['2024'])).toHaveLength(6);
  delete datos.composicionIngresos;
  expect(razones(datos).MN).toBeNull(); // Un ingreso presente aún necesita composición.
});

it('una cobertura completa no acredita importes ambiguos ni pendientes con monto', () => {
  const datos = registrar(vacio(), [['bs.cash_and_equivalents', 1000], ['bs.trade_payables', 400]]);
  datos.balanceGeneral['2024'].activos['Pendiente propio'] = 10;
  datos.coberturaEstados = { '2024': { activos: 'completo', pasivos: 'completo' } };
  expect(razones(datos).RC).toBeNull();
});

it('la cobertura no sustituye un importe explícito nulo en el intérprete', () => {
  const entrada = entradaManual();
  entrada.coberturaEstados = { current: { activos:'completo', pasivos:'completo' } };
  entrada.cuentas.find(c => c.id === 'bs.cash_and_equivalents').current = null;
  expect(calcularRazon('liquidez_razon_corriente', entrada).valor).toBeNull();
  for (const cobertura of [[], null, { current:{ activos:true } }]) {
    expect(() => calcularRazon('liquidez_razon_corriente', { ...entrada, coberturaEstados:cobertura })).toThrow();
  }
});

it('sin cobertura del periodo anterior no inventa promedios ni cambia las restricciones temporales', () => {
  const datos = normalizeFinancialData(DEMO_MUNOMODA);
  datos.coberturaEstados['2023'].activos = 'parcial';
  expect(razones(datos).RC).toBeCloseTo(412000 / 175000, 12);
  expect(razones(datos).ROA).toBeNull();
  expect(computarRazonesDesdeDatos(datos, '2023').RotInv).toBeNull();
});

it('mantiene la tolerancia y los avisos de discrepancia en totales reportados', () => {
  const entrada = entradaManual();
  entrada.cuentas.push({ id:'bs.current_assets_total', estado:'reconocida', current:900 });
  const r = calcularRazon('liquidez_razon_corriente', entrada);
  expect(r.valor).toBe(4.5); // 900/200; no sumar otra vez los detalles.
  expect(r.motivos).toEqual(expect.arrayContaining([expect.objectContaining({ codigo:'reported_subtotal_mismatch' })]));
});

it('el total protegido no silencia fallos inesperados del intérprete ni deja falsas dependencias cíclicas', () => {
  const datos = registrar(vacio(), [['is.net_sales_reported', 1000], ['is.net_income_reported', 100], ['is.nonoperating_income', 20]]);
  const entrada = crearEntradaRazones(datos, '2024');
  const r = evaluarDerivado('rentabilidad_margen_utilidad_neta', 'derived.net_income', entrada);
  expect(r.valor).toBe(100);
  expect(r.motivos[0].codigo).toBe('reported_subtotal_unverifiable');
  const id = 'rentabilidad_margen_utilidad_neta', original = ESPECIFICACION_RAZONES[id];
  const roto = { ...ESPECIFICACION_RAZONES, [id]: { ...original,
    derivados: original.derivados.map(d => d.id === 'derived.net_income' ? { ...d, formula:{ op:'desconocida' } } : d) } };
  expect(() => evaluarDerivado(id, 'derived.net_income', entrada, {}, roto)).toThrow(/operación desconocida/);
});

it('el totalizador y la lectura estricta respetan la misma declaración de ausencia', () => {
  const datos = registrar(vacio(), [['bs.ppe_buildings', 1000], ['is.sales_total', 1000], ['is.cost_of_sales_reported', 400]]);
  expect(computeFinancialTotals(datos, '2024').totalActivos).toBeNull();
  datos.coberturaEstados = { '2024': { activos:'completo', estadoResultados:'completo' } };
  const t = computeFinancialTotals(datos, '2024');
  expect(t.totalActivos).toBe(1000);
  expect(t.ventas).toBe(1000);
  expect(estadosResueltos(datos, '2024').estadoResultados.find(f => f.id === 'is.gross_profit_reported').valor).toBe(600);
});

it('distingue un aviso de comprobación de la falta de un resultado en la interfaz', () => {
  const html = disponibilidadRazones({ MN:0.1, notAvailableReasons:[{ campo:'MN', motivo:'reported_subtotal_unverifiable',
    operandos:['is.net_income_reported'], periodo:'<2024>' }] });
  expect(html).toContain('Resultados con advertencias');
  expect(html).not.toContain('Por qué hay resultados N/D');
  expect(html).toContain('&lt;2024&gt;');
});
