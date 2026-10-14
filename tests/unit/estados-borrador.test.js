import { afterEach, expect, it, vi } from 'vitest';
import { element, cambiar, clic } from './helpers/dom-falso.js';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

async function pantalla() {
  const page = element();
  const storage = new Map();
  vi.stubGlobal('localStorage', { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) });
  vi.stubGlobal('document', { getElementById: id => id === 'page-estados' ? page : null });
  vi.stubGlobal('window', { confirm: () => true });
  const estados = await import('../../js/modules/estados/index.js');
  const { default: store } = await import('../../js/store.js');
  estados.initEstados();
  return { page, estados, store };
}

it('volver a Estados conserva el borrador y no modifica los estados publicados', async () => {
  const { page, estados, store } = await pantalla();
  await cambiar(page, 'companyName', 'Empresa sin guardar', 'input');
  const field = page.querySelector('#companyName');
  estados.initEstados();
  expect(page.querySelector('#companyName')).toBe(field);
  expect(field.value).toBe('Empresa sin guardar');
  expect(estados.hasUnsavedStates()).toBe(true);
  expect(store.get('estados.name')).toBeUndefined();
  await clic(page, 'saveStates');
  expect(estados.hasUnsavedStates()).toBe(false);
  expect(store.get('estados.name')).toBe('Empresa sin guardar');
  estados.initEstados();
  expect(page.innerHTML).toContain('value="Empresa sin guardar"');
});

it('un error al guardar deja el borrador recuperable al volver a la pantalla', async () => {
  const { page, estados, store } = await pantalla();
  await cambiar(page, 'companyName', 'Pendiente', 'input');
  localStorage.setItem = () => { throw new Error('Cuota agotada'); };
  await clic(page, 'saveStates');
  expect(page.querySelector('#estadoMessage').textContent).toContain('No se pudo guardar');
  estados.initEstados();
  expect(page.querySelector('#companyName').value).toBe('Pendiente');
  expect(estados.hasUnsavedStates()).toBe(true);
  expect(store.get('estados.name')).toBeUndefined();
});

it('loadDemo publica todos los campos una sola vez y no altera la demo al editar', async () => {
  const { estados, store } = await pantalla();
  const write = vi.spyOn(localStorage, 'setItem');
  estados.loadDemo();
  expect(write).toHaveBeenCalledOnce();
  expect(store.get('estados.name')).toBe('MUNO MODA S.A.');
  store.get('estados.balanceGeneral')['2023'].activos.Efectivo = 1;
  expect(estados.DEMO_MUNOMODA.balanceGeneral['2023'].activos.Efectivo).toBe(45000);
});
