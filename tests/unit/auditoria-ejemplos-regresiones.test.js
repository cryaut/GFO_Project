import { expect, it, vi } from 'vitest';
vi.mock('../../js/components/toast.js', () => ({ showToast: vi.fn() }));
import { ejemploBaker, ejemploBartlett, ejemploPractico2 } from '../../js/examples/ejemplos-estados.js';
import { construirEOAF } from '../../js/modules/analisis/eoaf-calculations.js';
import { construirEFE } from '../../js/modules/analisis/efe-calculations.js';
import { variacionesDeCuentas, advertenciasDeBalance } from '../../js/modules/analisis/comprobacion-calculations.js';
import { calcularRazonesMercado } from '../../js/modules/analisis/mercado-calculations.js';
import { estadosResueltos } from '../../js/modules/estados/estados-presentacion-calculations.js';
import { totalesPeriodo } from '../../js/utils/estados-guardados.js';
import { tendenciaEstados } from '../../js/modules/inicio/inicio-calculations.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { crearEjemplo, listarEjemplos } from '../../js/examples/catalogo.js';
import { computarRazonesDesdeDatos } from '../../js/modules/razones/razones-app-adapter.js';
import { DIAS_ANIO } from '../../js/utils/calculate.js';

// Esperados independientes, obtenidos de las fuentes antes de cambiar el código.
it.each([
  ['Baker', ejemploBaker, 1000000],
  ['Bartlett', ejemploBartlett, 636000],
  ['Práctico 2', ejemploPractico2, 95000]
])('H-01: EOAF %s conserva cuentas hoja reportadas y cuadra', (_, crear, esperado) => {
  const d = crear(), copia = structuredClone(d);
  const r = construirEOAF(d, d.periods[0], d.periods[1]);
  expect(r.resumen).toMatchObject({ totalOrigenes: esperado, totalAplicaciones: esperado, diferencia: 0, estado: 'cuadra' });
  expect(r.advertencias.join(' ')).not.toContain('no cumple A = P + O');
  expect(d).toEqual(copia);
});

it.each([
  ['Baker', ejemploBaker, 180000, 780000, -300000, 20000, 1000000],
  ['Bartlett', ejemploBartlett, 231000, 500000, -347000, -61000, 431000]
])('H-02: EFE %s obtiene UN y todas las variaciones de la fuente', (_, crear, un, cfo, cfi, cff, final) => {
  const d = crear(), r = construirEFE(d, d.periods[0], d.periods[1]);
  expect(r.utilidadNeta).toBe(un);
  expect(r.operacion.total).toBe(cfo);
  expect(r.inversion.total).toBe(cfi);
  expect(r.financiamiento.total).toBe(cff);
  expect(r.efectivoFinalCalculado).toBe(final);
  expect(r.diferencia).toBe(0);
  expect(r.estado).toBe('cuadra-sin-verificar');
});

it.each([
  [ejemploBaker, 180000], [ejemploBartlett, 231000], [ejemploPractico2, 77000]
])('H-03: consumidores y tendencia conservan UN disponible', (crear, un) => {
  const d = crear(), p = d.periods.at(-1);
  expect(totalesPeriodo(d, p).utilidadNeta).toBe(un);
  expect(tendenciaEstados(d).utilidadNeta.at(-1)).toBe(un);
  expect(calcularRazonesMercado(d, { periodos: { [p]: { acciones: 100, precio: 10, dividendos: 0 } } }).at(-1).upa).toBe(un / 100);
});

it('H-03: ER ausente no se convierte en UN/UPA cero y no pierde el balance', () => {
  const d = ejemploBaker(), p = d.periods[0];
  const r = totalesPeriodo(d, p);
  expect(r.totalActivos).toBe(2900000);
  expect(r.utilidadNeta).toBeNull();
  expect(r.ventas).toBeNull();
  const mercado = calcularRazonesMercado(d, { periodos: { [p]: { acciones: 100000, precio: 10, dividendos: 0 } } })[0];
  expect(mercado.un).toBeNull();
  expect(mercado.upa).toBeNull();
  expect(mercado.vlpa).toBe(11);
});

it.each([ejemploBaker, ejemploBartlett, ejemploPractico2])('H-04: ventas netas reportadas no acreditan bruto cero', crear => {
  const d = crear(), p = d.periods.at(-1);
  const er = estadosResueltos(d, p).estadoResultados;
  expect(er.find(f => f.id === 'is.sales_total')?.valor ?? null).toBeNull();
  expect(er.find(f => f.id === 'is.net_sales_reported').valorCalculo).toBeGreaterThan(0);
});

it('H-04: un bruto cero explícito sigue siendo un dato válido', () => {
  let d = ejemploPractico2();
  d = registrarCuenta(d, [{ id: 'is.sales_total', nombre: 'Bruto declarado cero', periodo: '2024', importe: 0 }]);
  expect(estadosResueltos(d, '2024').estadoResultados.find(f => f.id === 'is.sales_total').valor).toBe(0);
});

it('H-01: enlaza la misma cuenta reportada aunque cambie de etiqueta', () => {
  const d = ejemploBaker();
  d.reportedTotals['2012']['bs.inventory_total'].nombre = 'Mercadería al cierre';
  const filas = variacionesDeCuentas(d, 'activos', '2011', '2012');
  expect(filas.filter(f => f.id === 'bs.inventory_total')).toHaveLength(1);
  expect(filas.find(f => f.id === 'bs.inventory_total')).toMatchObject({ saldoInicial: 900000, saldoFinal: 600000, variacion: -300000 });
});

it('H-01: totales anidados sin detalle no se suman repetidamente', () => {
  const d = ejemploPractico2();
  for (const p of d.periods) {
    d.balanceGeneral[p].activos = {};
    delete d.reportedTotals[p]['bs.inventory_total'];
    d.reportedTotals[p]['bs.current_assets_total'] = { nombre: 'Corriente', grupo: 'activos', importe: p === '2023' ? 250000 : 315000 };
  }
  const filas = variacionesDeCuentas(d, 'activos', '2023', '2024');
  expect(filas.some(f => f.id === 'bs.total_assets')).toBe(false);
  expect(filas.map(f => f.id)).toEqual(['bs.fixed_assets_net_total', 'bs.current_assets_total']);
  expect(filas.reduce((s, f) => s + f.variacion, 0)).toBe(95000);
  expect(advertenciasDeBalance(d, { inicial: '2023', final: '2024' }, d.balanceGeneral['2023'], d.balanceGeneral['2024'])).toEqual([]);
});

it('H-02: PPE neto no acredita depreciación cero ni compras brutas de activos', () => {
  const d = ejemploPractico2(), r = construirEFE(d, '2023', '2024');
  expect(r.utilidadNeta).toBe(77000);
  expect(r.estado).toBe('incompleta');
  expect(r.operacion.total).toBeNull();
  expect(r.inversion.total).toBeNull();
  expect(r.motivos.join(' ')).toContain('necesita desglose');
  expect(r.advertencias.join(' ')).not.toContain('se estima con la variación');
});

it('H-01: conserva un total frente a detalle parcial sin duplicarlo', () => {
  const d = ejemploBaker();
  d.balanceGeneral['2011'].activos['Inventario de mercaderías'] = 400000;
  const filas = variacionesDeCuentas(d, 'activos', '2011', '2012');
  expect(filas.find(f => f.id === 'bs.inventory_total').saldoInicial).toBe(900000);
  expect(filas.some(f => f.id === 'bs.inventory_merchandise')).toBe(false);
  expect(advertenciasDeBalance(d, { inicial:'2011', final:'2012' }, d.balanceGeneral['2011'], d.balanceGeneral['2012']).join(' ')).toContain('detalle disponible');
});

it('H-01: duplicados contradictorios, saldo inválido y periodo ausente quedan N/D', () => {
  const d = ejemploBaker();
  d.balanceGeneral['2011'].activos.Inventarios = 3;
  expect(variacionesDeCuentas(d, 'activos', '2011', '2012').find(f => f.id === 'bs.inventory_total').variacion).toBeNull();
  delete d.balanceGeneral['2011'].activos.Inventarios;
  d.reportedTotals['2011']['bs.inventory_total'].importe = 'abc';
  expect(variacionesDeCuentas(d, 'activos', '2011', '2012').find(f => f.id === 'bs.inventory_total').saldoInicial).toBeNull();
  delete d.reportedTotals['2011']['bs.inventory_total'];
  expect(variacionesDeCuentas(d, 'activos', '2011', '2012').find(f => f.id === 'bs.inventory_total').saldoInicial).toBeNull();
});

it('H-01: PPE neto no absorbe inversiones de largo plazo ajenas al subtotal', () => {
  let d = ejemploPractico2();
  for (const [p, importe] of [['2023',10000], ['2024',15000]]) {
    d = registrarCuenta(d, { id:'bs.long_term_investments', nombre:'Inversión de largo plazo', periodo:p, importe, confirmado:true });
    d.reportedTotals[p]['bs.total_assets'].importe += importe;
    d.reportedTotals[p]['bs.total_equity'].importe += importe;
  }
  const filas = variacionesDeCuentas(d, 'activos', '2023', '2024');
  expect(filas.find(f => f.id === 'bs.fixed_assets_net_total').variacion).toBe(30000);
  expect(filas.find(f => f.id === 'bs.long_term_investments').variacion).toBe(5000);
  expect(construirEOAF(d, '2023', '2024').resumen).toMatchObject({ totalOrigenes:100000, totalAplicaciones:100000, diferencia:0 });
});

it('H-05: escenario docente declara premisas y reproduce cinco resultados de clase', () => {
  const original = ejemploBartlett(), copia = structuredClone(original);
  const d = crearEjemplo('estados', 'bartlett-clase', () => original);
  const r = computarRazonesDesdeDatos(d, '2012');
  // Diapositivas 14–15: CxC promedio 434000; CxP promedio 326000.
  expect(r.RotCxC).toBeCloseTo(3074000 / 434000, 12);
  expect(r.PPC).toBeCloseTo(DIAS_ANIO * 434000 / 3074000, 12);
  expect(r.rotacionCxP).toBeCloseTo(1461600 / 326000, 12);
  expect(r.usaComprasReales).toBe(false);
  expect(r.plazoPago).toBeCloseTo(DIAS_ANIO * 326000 / 1461600, 12);
  expect(r.cicloConversion).toBeCloseTo(DIAS_ANIO * 294500 / 2088000 + r.PPC - r.plazoPago, 12);
  expect(listarEjemplos('estados').find(e => e.id === 'bartlett-clase').detalle).toContain('70 %');
  expect(d.balanceGeneral).toEqual(original.balanceGeneral);
  expect(d.estadoResultados).toEqual(original.estadoResultados);
  expect(original).toEqual(copia);
  const historico = computarRazonesDesdeDatos(original, '2012');
  expect(historico.RotCxC).toBeNull();
  expect(historico.rotacionCxP).toBeNull();
  expect(d.supplementaryAccounts['2011']).toBeUndefined();
  expect(construirEFE(d, '2011', '2012')).toEqual(construirEFE(original, '2011', '2012'));
});

it('H-05: compras cero declaradas se conservan; no sustituyen los pagos ni usan el costo como aproximación', () => {
  const d = registrarCuenta(ejemploBartlett(), { id:'supp.credit_purchases', nombre:'Compras a crédito declaradas', periodo:'2012', importe:0, confirmado:true });
  const r = computarRazonesDesdeDatos(d, '2012');
  expect(r.rotacionCxP).toBe(0);
  expect(r.plazoPago).toBeNull();
  expect(r.cicloConversion).toBeNull();
  expect(r.RotCxC).toBeNull();
});

it('H-05: la pantalla conserva los dos decimales de plazos y ciclo docentes', async () => {
  vi.resetModules();
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
  const { default: store } = await import('../../js/store.js');
  store.setPersisted('estados', crearEjemplo('estados', 'bartlett-clase', ejemploBartlett));
  const page = { innerHTML:'', querySelectorAll:() => [] };
  vi.stubGlobal('document', { getElementById: id => id === 'page-analisis' ? page : null });
  try {
    const { initAnalisis } = await import('../../js/modules/analisis/index.js');
    initAnalisis();
    for (const valor of ['51.48','51.53','81.41','21.60']) expect(page.innerHTML).toContain(valor);
  } finally { vi.unstubAllGlobals(); vi.resetModules(); }
});
