import { afterEach, describe, expect, it, vi } from 'vitest';
import { capacidadAhorro, tasaAhorro } from '../../js/utils/calculate.js';
import { clic, element, llenar } from './helpers/dom-falso.js';

describe('fórmulas del presupuesto personal', () => {
  it('capacidad de ahorro = ingresos − gastos', () => {
    expect(capacidadAhorro(22500, 17200)).toBe(5300);
    expect(capacidadAhorro(10000, 12000)).toBe(-2000);
    expect(capacidadAhorro(null, 100)).toBeNull();
  });

  it('tasa de ahorro = capacidad / ingresos', () => {
    expect(tasaAhorro(5300, 22500)).toBeCloseTo(0.235556, 6);
    expect(tasaAhorro(5300, 0)).toBeNull();
  });
});

// El módulo importa toast.js, que busca su contenedor en el DOM al cargarse: se simula
// el navegador antes de importarlo.
async function cargarPresupuesto(datos) {
  vi.resetModules();
  const storage = new Map();
  vi.stubGlobal('localStorage', { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) });
  const page = element();
  const toasts = [];
  vi.stubGlobal('document', {
    getElementById: id => {
      if (id === 'page-presupuesto') return page;
      if (id === 'toast-container') return { appendChild: nodo => toasts.push(nodo.textContent) };
      return null;
    },
    createElement: () => ({ style: {}, remove() {} })
  });
  vi.stubGlobal('window', { confirm: () => true });
  const { default: store } = await import('../../js/store.js');
  if (datos) store.setPersisted('presupuesto', datos);
  const modulo = await import('../../js/modules/presupuesto/index.js');
  modulo.initPresupuesto();
  return { page, store, modulo, toasts };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.useRealTimers();
});

describe('pantalla del presupuesto personal', () => {
  it('con el ejemplo ficticio calcula ingresos, gastos, capacidad de ahorro y saldo disponible', async () => {
    vi.useFakeTimers();
    const { page, store } = await cargarPresupuesto();
    await clic(page, 'btnEjemploPresupuesto');
    expect(store.get('presupuesto.ingresoMensual')).toBe(22500);
    const resumen = page.querySelector('#budgetSummary').innerHTML;
    expect(resumen).toContain('C$ 22,500.00'); // 18,000 + 4,500
    expect(resumen).toContain('C$ 17,200.00');
    expect(resumen).toContain('C$ 5,300.00'); // capacidad de ahorro
    expect(resumen).toContain('C$ 3,000.00'); // 36,000 / 12
    expect(resumen).toContain('C$ 2,300.00'); // saldo disponible
    const lectura = page.querySelector('#presupuestoLectura').innerHTML;
    expect(lectura).toContain('23.56% de sus ingresos');
    expect(lectura).toContain('se cumple y aún quedan C$ 2,300.00');
    expect(lectura).toContain('Necesidad: C$ 14,400.00');
    expect(page.querySelector('#ingresosList').innerHTML).toContain('Trabajos independientes');
    // 22,500 − 17,200 − 3,000 quedan sin asignar a gastos ni a ahorro.
    expect(page.querySelector('#validacionBalance').innerHTML).toContain('Sin asignar: C$ 2,300.00');
  });

  it('lee como ingreso regular el ingresoMensual guardado antes de este cambio', async () => {
    const { page, modulo } = await cargarPresupuesto({ ingresoMensual: 8000, metaAhorro: 0, mesesDisponibles: 12, gastos: [], semanas: [] });
    expect(modulo.presupuestoCalculations.ingresosDe(undefined, 8000)).toEqual([{ concepto: 'Ingreso mensual', monto: 8000, tipo: 'regular' }]);
    expect(modulo.presupuestoCalculations.ingresosDe([], 0)).toEqual([]);
    expect(page.querySelector('#ingresosList').innerHTML).toContain('Ingreso mensual');
    expect(page.querySelector('#budgetSummary').innerHTML).toContain('C$ 8,000.00');
  });

  it('agrega un ingreso y mantiene ingresoMensual como total', async () => {
    vi.useFakeTimers();
    const { page, store } = await cargarPresupuesto({ ingresoMensual: 8000, metaAhorro: 0, mesesDisponibles: 12, gastos: [], semanas: [] });
    llenar(page, { ingresoConcepto: 'Beca', ingresoMonto: '1500', ingresoTipo: 'ocasional' });
    await clic(page, 'btnAddIngreso');
    expect(store.get('presupuesto.ingresos')).toHaveLength(2);
    expect(store.get('presupuesto.ingresoMensual')).toBe(9500);
  });

  it('escapa los conceptos escritos por el usuario', async () => {
    const { page } = await cargarPresupuesto({
      ingresoMensual: 0, metaAhorro: 0, mesesDisponibles: 12, semanas: [],
      ingresos: [{ concepto: '<b>Salario</b>', monto: 100, tipo: 'regular' }],
      gastos: [{ concepto: '<img src=x onerror=alert(1)>', monto: 50, categoria: 'deseo' }]
    });
    expect(page.querySelector('#gastosList').innerHTML).toContain('&lt;img src=x');
    expect(page.querySelector('#gastosList').innerHTML).not.toContain('<img');
    expect(page.querySelector('#ingresosList').innerHTML).toContain('&lt;b&gt;Salario');
  });
});
