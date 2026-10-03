import { afterEach, expect, it, vi } from 'vitest';
import { nodo } from './helpers/formulario-falso.js';

vi.mock('../../js/components/chart.js', () => ({ renderChart: vi.fn(), destroyChart: vi.fn() }));
vi.mock('../../js/components/toast.js', () => ({ showToast: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); vi.clearAllMocks(); });

async function pantalla() {
  const page = nodo();
  const storage = new Map();
  vi.stubGlobal('document', { getElementById: id => id === 'page-presupuesto' ? page : null });
  vi.stubGlobal('window', { confirm: () => true });
  vi.stubGlobal('localStorage', { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) });
  const { default: store } = await import('../../js/store.js');
  store.setPersisted('presupuesto', { ingresoMensual: 1000, metaAhorro: 100, mesesDisponibles: 12,
    ingresos: [{ concepto: 'Salario', tipo: 'regular', monto: 1000 }],
    gastos: [{ concepto: 'Transporte', categoria: 'necesidad', monto: 100 }],
    semanas: [{ numero: 2, gasto: 20 }, { numero: 1, gasto: 10 }] });
  const { initPresupuesto } = await import('../../js/modules/presupuesto/index.js');
  const { showToast } = await import('../../js/components/toast.js');
  initPresupuesto();
  return { page, store, showToast, storage };
}

it.each([
  ['btnAddIngreso', { ingresoConcepto: 'Extra', ingresoMonto: '100', ingresoTipo: 'regular' }],
  ['btnAddGasto', { gastoConcepto: 'Comida', gastoMonto: '100', gastoCategoria: 'necesidad' }],
  ['btnAddSemana', { semanaNum: '1', semanaGasto: '500' }],
  ['btnAjustar', { inflacion: '10' }]
])('%s fallido conserva datos y entradas para reintentar', async (button, fields) => {
  const { page, store, showToast, storage } = await pantalla();
  const before = store.getAll();
  const persisted = storage.get('gfo-toolkit-data');
  for (const [id, value] of Object.entries(fields)) page.querySelector(`#${id}`).value = value;
  localStorage.setItem = () => { throw new Error('Sin espacio'); };
  await page.querySelector(`#${button}`).dispatchEvent({ type: 'click' });
  expect(store.getAll()).toEqual(before);
  expect(storage.get('gfo-toolkit-data')).toBe(persisted);
  for (const [id, value] of Object.entries(fields)) expect(page.querySelector(`#${id}`).value).toBe(value);
  expect(showToast).toHaveBeenLastCalledWith('No se pudo guardar: Sin espacio', 'error');
});

it('la inflación guarda ingresos y gastos en una sola escritura sin alterar los objetos anteriores', async () => {
  const { page, store } = await pantalla();
  const original = store.get('presupuesto');
  const write = vi.spyOn(localStorage, 'setItem');
  page.querySelector('#inflacion').value = '10';
  await page.querySelector('#btnAjustar').dispatchEvent({ type: 'click' });
  expect(write).toHaveBeenCalledOnce();
  expect(store.get('presupuesto.ingresoMensual')).toBe(1100);
  expect(store.get('presupuesto.gastos')[0].monto).toBeCloseTo(110);
  expect(original.gastos[0].monto).toBe(100);
  expect(original.ingresos[0].monto).toBe(1000);
});

it('configuración y eliminación fallidas no cambian los datos publicados', async () => {
  const { page, store } = await pantalla();
  const before = store.getAll();
  localStorage.setItem = () => { throw new Error('Sin espacio'); };
  page.querySelector('#metaAhorro').value = '999';
  await page.querySelector('#metaAhorro').dispatchEvent({ type: 'change' });
  await page.querySelector('#gastosList').querySelector('[data-del-gasto]').dispatchEvent({ type: 'click' });
  await page.querySelector('#ingresosList').querySelector('[data-del-ingreso]').dispatchEvent({ type: 'click' });
  expect(store.getAll()).toEqual(before);
  expect(Number(page.querySelector('#metaAhorro').value)).toBe(999);
});

it('mostrar las semanas no cambia su orden guardado y eliminar el último gasto limpia su gráfica', async () => {
  const { page, store } = await pantalla();
  expect(store.get('presupuesto.semanas').map(s => s.numero)).toEqual([2, 1]);
  const { destroyChart } = await import('../../js/components/chart.js');
  await page.querySelector('#gastosList').querySelector('[data-del-gasto]').dispatchEvent({ type: 'click' });
  expect(store.get('presupuesto.gastos')).toEqual([]);
  expect(destroyChart).toHaveBeenCalledWith('gastosPieChart');
});
