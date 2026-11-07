import { afterEach, expect, it, vi } from 'vitest';
import { dupont } from '../../js/utils/calculate.js';
import { calcularCVU } from '../../js/modules/equilibrio/equilibrio-calculations.js';
import { calcularFlujo } from '../../js/modules/flujo/flujo-calculations.js';
import { calcularPresupuestoMaestro, ejemploPlaneacion } from '../../js/modules/planeacion/planeacion-calculations.js';
import { estadosDesdeReferencia } from '../fixtures/razones-app.js';

afterEach(() => vi.unstubAllGlobals());

it('AFOD DuPont diapositiva 10: reproduce los componentes y el ROE directo', () => {
  const r = dupont(12000, 200000, 100000, 60000);
  expect(r.PM).toBeCloseTo(0.06, 10);
  expect(r.AT).toBeCloseTo(2, 10);
  expect(r.EM).toBeCloseTo(100000 / 60000, 10);
  expect(r.ROE).toBeCloseTo(0.20, 10);
});

it('AFOD C-V-U diapositiva 20: 500 unidades cubren C$ 2500 de costos fijos', () => {
  const r = calcularCVU({ precio: 10, costoVariableUnitario: 5, costosFijos: 2500, unidades: 500, utilidadObjetivo: null });
  expect(r.peUnidades).toBe(500);
  expect(r.peVentas).toBe(5000);
  expect(r.uaii).toBe(0);
});

it('AFOD EFE diapositiva 13: los movimientos reales llegan a C$ 52000', () => {
  const casos = [
    ['operacion', 'entrada', 120000], ['operacion', 'salida', 65000],
    ['operacion', 'salida', 20000], ['operacion', 'salida', 8000], ['operacion', 'salida', 7000],
    ['inversion', 'entrada', 5000], ['inversion', 'salida', 18000],
    ['financiamiento', 'entrada', 30000], ['financiamiento', 'salida', 10000]
  ];
  const r = calcularFlujo({ saldoInicial: 25000,
    movimientos: casos.map(([actividad, tipo, monto], i) => ({ id: String(i), concepto: `Movimiento ${i}`, actividad, tipo, monto })) });
  expect(r.neto).toEqual({ operacion: 20000, inversion: -13000, financiamiento: 20000 });
  expect(r.variacionNeta).toBe(27000);
  expect(r.saldoFinal).toBe(52000);
});

it('AFOD El Progreso diapositivas 3–10: conecta ventas, inventario y compras', () => {
  const supuestos = { ...ejemploPlaneacion(), tipoPeriodo: 'Mes', periodos: 3,
    precio: 600, costoUnitario: 350, ventasUnidades: [120, 150, 180],
    inventarioInicial: 30, pctInventarioFinal: 0.2, inventarioFinalUltimo: 40,
    otrosDesembolsos: [0, 0, 0] };
  const r = calcularPresupuestoMaestro(supuestos);
  expect(r.ventas.importe).toEqual([72000, 90000, 108000]);
  expect(r.compras.unidades).toEqual([120, 156, 184]);
  expect(r.compras.importe).toEqual([42000, 54600, 64400]);
  expect(r.totales.compras).toBe(161000);
  expect(r.cbv.costo).toEqual([42000, 52500, 63000]);
  expect(r.totales.cbv).toBe(157500); // Sesión 3, diapositiva 11.
});

it('AFOD presupuesto de caja: reproduce San Rafael al introducir impuestos pagados como otras salidas', () => {
  // La UI no tiene calendario de pago de IR; el caso introduce los montos de
  // las diapositivas 19–21 en otrosDesembolsos. La conciliación de impuestos
  // por pagar queda pendiente de implementar (véase informe AFOD).
  const s = { ...ejemploPlaneacion(), tipoPeriodo: 'Mes', periodos: 3,
    precio: 500, costoUnitario: 300, ventasUnidades: [100, 120, 140],
    inventarioInicial: 20, pctInventarioFinal: 0.2, inventarioFinalUltimo: 32,
    pctContado: 0.6, pctComprasContado: 0.5, cxcInicial: 0, cxpInicial: 0,
    gastosFijos: 6500, pctGastosVariables: 0.05, depreciacion: 500, intereses: 500,
    tasaIR: 0.3, saldoInicialCaja: 5000, saldoMinimoCaja: 5000,
    otrosDesembolsos: [3000, 4050, 5100] };
  const r = calcularPresupuestoMaestro(s);
  expect(r.compras.importe).toEqual([31200, 37200, 43200]);
  expect(r.ventas.cobros).toEqual([30000, 56000, 66000]);
  expect(r.compras.pagos).toEqual([15600, 34200, 40200]);
  expect(r.resultados.ir).toEqual([3000, 4050, 5100]);
  expect(r.caja.saldoFinal).toEqual([6900, 14650, 24850]);
});

it('AFOD Bartlett diapositivas 7–12: razones de liquidez y actividad con saldos acreditados', async () => {
  const periodos = ['2011', '2012'];
  const valores = [
    ['bs.current_assets_total', null, 1223000], ['bs.current_liabilities_total', null, 620000],
    ['bs.inventory_total', 300000, 289000], ['is.cost_of_sales_reported', null, 2088000],
    ['is.sales_total', null, 3074000], ['supp.credit_sales', null, 3074000],
    ['bs.trade_receivables', 365000, 503000], ['bs.trade_payables', 270000, 382000],
    ['bs.fixed_assets_net_total', 2266000, 2374000], ['bs.total_assets', 3270000, 3597000]
  ];
  const entradas = valores.map(([id, inicial, final]) => ({ id,
    '2011': { presente: inicial !== null, valor: inicial },
    '2012': { presente: final !== null, valor: final } }));
  const datos = estadosDesdeReferencia({ periodos, entradas });
  vi.resetModules();
  vi.stubGlobal('localStorage', { getItem: () => null, setItem() {} });
  vi.stubGlobal('document', { getElementById: () => null });
  const { default: store } = await import('../../js/store.js');
  store.setPersisted('estados', datos);
  const { computeRazones } = await import('../../js/modules/analisis/index.js');
  const r = computeRazones('2012');
  expect(r.RC).toBeCloseTo(1223000 / 620000, 8);
  expect(r.RR).toBeCloseTo((1223000 - 289000) / 620000, 8);
  expect(r.RotInv).toBeCloseTo(2088000 / 294500, 8);
  expect(r.edadInventario).toBeCloseTo(294500 * 365 / 2088000, 8);
  expect(r.RotCxC).toBeCloseTo(3074000 / 434000, 8);
  expect(r.PPC).toBeCloseTo(434000 * 365 / 3074000, 8);
  expect(r.rotacionCxP).toBeNull(); // El profesor estima compras; no declara pagos a proveedores.
});
