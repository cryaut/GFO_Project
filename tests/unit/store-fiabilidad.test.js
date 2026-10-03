import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import store from '../../js/store.js';

let storage;
beforeEach(() => {
  storage = new Map();
  vi.stubGlobal('localStorage', { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) });
  store._data = null;
  store._listeners = [];
});
afterEach(() => { store._data = null; store._listeners = []; vi.unstubAllGlobals(); });

it('reset elimina los registros aunque se hayan mutado los arrays leídos', () => {
  store.get('presupuesto.gastos').push({ concepto: 'Alquiler', monto: 6000 });
  store.get('activos.inventario').push({ nombre: 'Laptop' });
  store.reset();
  expect(store.get('presupuesto.gastos')).toEqual([]);
  expect(store.get('activos.inventario')).toEqual([]);
  expect(JSON.parse(storage.get('gfo-toolkit-data')).presupuesto.gastos).toEqual([]);
});

it('una carga sin datos y una carga corrupta reciben valores iniciales independientes', () => {
  store.get('equilibrio.escenario').precio = 100;
  store.get('inventario.productos').push({ nombre: 'Prueba' });
  store.load();
  expect(store.get('equilibrio.escenario.precio')).toBe(0);
  expect(store.get('inventario.productos')).toEqual([]);
  store.get('estados.periods').push('2025');
  storage.set('gfo-toolkit-data', '{roto');
  store.load();
  expect(store.get('estados.periods')).toEqual([]);
});

it('reset fallido conserva memoria y almacenamiento y no notifica éxito', () => {
  store.setPersisted('activos', { inventario: [{ nombre: 'Guardado' }] });
  const before = store.getAll();
  const persisted = storage.get('gfo-toolkit-data');
  const notify = vi.fn();
  store.subscribe(notify);
  localStorage.setItem = () => { throw new Error('Sin espacio'); };
  expect(() => store.reset()).toThrow('Sin espacio');
  expect(store.getAll()).toEqual(before);
  expect(storage.get('gfo-toolkit-data')).toBe(persisted);
  expect(notify).not.toHaveBeenCalled();
});

it('setPersisted aísla el objeto recibido y solo publica si el guardado termina', () => {
  const datos = { gastos: [{ monto: 100 }] };
  store.setPersisted('presupuesto', datos);
  datos.gastos[0].monto = 999;
  expect(store.get('presupuesto.gastos')[0].monto).toBe(100);
  localStorage.setItem = () => { throw new Error('Acceso denegado'); };
  expect(() => store.setPersisted('presupuesto', { gastos: [] })).toThrow('Acceso denegado');
  expect(store.get('presupuesto.gastos')[0].monto).toBe(100);
});
