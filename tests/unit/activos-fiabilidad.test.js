import { afterEach, expect, it, vi } from 'vitest';
import { validarActivo } from '../../js/modules/activos/activos-calculations.js';
import { nodo } from './helpers/formulario-falso.js';

vi.mock('../../js/components/chart.js', () => ({ renderChart: vi.fn(), destroyChart: vi.fn() }));
vi.mock('../../js/components/toast.js', () => ({ showToast: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); vi.clearAllMocks(); });

const bien = (cambios = {}) => ({ nombre: 'Laptop', categoria: 'Tecnología', costoOriginal: 1000,
  vidaUtil: 5, valorResidual: 100, aniosConsumidos: 0, costoReposicion: 1200,
  condicion: { scores: [0, 5, 5, 5, 5, 5, 5, 5], score: 43.75 }, ...cambios });

it.each([
  { costoOriginal: -1 }, { costoOriginal: Infinity }, { vidaUtil: 0 }, { vidaUtil: 1.5 },
  { aniosConsumidos: -1 }, { valorResidual: 1001 }, { costoReposicion: NaN },
  { condicion: { scores: [11, 5, 5, 5, 5, 5, 5, 5] } }, { condicion: { scores: [] } }
])('rechaza un registro inválido %j', cambios => { expect(validarActivo(bien(cambios)).length).toBeGreaterThan(0); });

it('acepta importes y condición cero, incluso si el bien superó su vida útil', () => {
  expect(validarActivo(bien({ costoOriginal: 0, valorResidual: 0, costoReposicion: 0, aniosConsumidos: 6 }))).toEqual([]);
});

async function pantalla(datos = [bien()]) {
  const page = nodo();
  const overlay = nodo({ class: 'hidden' });
  const events = new Map();
  const storage = new Map();
  vi.stubGlobal('document', {
    activeElement: null,
    getElementById: id => ({ 'page-activos': page, 'modal-overlay': overlay })[id] ?? null,
    addEventListener: (type, handler) => events.set(type, handler),
    removeEventListener: type => events.delete(type)
  });
  vi.stubGlobal('window', { confirm: vi.fn(() => true) });
  vi.stubGlobal('localStorage', { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) });
  const { default: store } = await import('../../js/store.js');
  store.setPersisted('activos', { inventario: datos });
  const { initActivos } = await import('../../js/modules/activos/index.js');
  const { showToast } = await import('../../js/components/toast.js');
  initActivos();
  const list = page.querySelector('#activosList');
  return { page, overlay, list, store, events, showToast };
}

it('editar conserva el puntaje 0; Cancelar y Escape cierran y devuelven el foco', async () => {
  const { overlay, list, store, events } = await pantalla();
  const button = list.querySelector('[data-edit-asset]');
  button.focus();
  await button.dispatchEvent({ type: 'click' });
  expect(overlay.querySelector('#assetCondicion0').value).toBe('0');
  expect(overlay.innerHTML).toContain('role="dialog"');
  await overlay.querySelectorAll('[data-close-modal]')[1].dispatchEvent({ type: 'click' });
  expect(overlay.classList.contains('hidden')).toBe(true);
  expect(document.activeElement).toBe(button);
  await button.dispatchEvent({ type: 'click' });
  events.get('keydown')({ key: 'Escape', preventDefault() {} });
  expect(overlay.innerHTML).toBe('');
  expect(events.has('keydown')).toBe(false);
  expect(store.get('activos.inventario')[0].condicion.scores[0]).toBe(0);
});

it('un error al agregar conserva el inventario y los campos del diálogo', async () => {
  const { page, overlay, store, showToast } = await pantalla([]);
  await page.querySelector('#btnAddAsset').dispatchEvent({ type: 'click' });
  for (const [id, value] of Object.entries({ assetNombre: 'TV', assetCategoria: 'Tecnología', assetCosto: '500', assetVidaUtil: '5', assetResidual: '0', assetAnios: '0' })) overlay.querySelector(`#${id}`).value = value;
  localStorage.setItem = () => { throw new Error('Sin espacio'); };
  await overlay.querySelector('#btnSaveAsset').dispatchEvent({ type: 'click' });
  expect(store.get('activos.inventario')).toEqual([]);
  expect(overlay.classList.contains('hidden')).toBe(false);
  expect(overlay.querySelector('#assetNombre').value).toBe('TV');
  expect(showToast).toHaveBeenLastCalledWith('No se pudo guardar: Sin espacio', 'error');
});

it('editar y eliminar fallidos no mutan el inventario original', async () => {
  const { overlay, list, store } = await pantalla();
  const before = store.getAll();
  await list.querySelector('[data-edit-asset]').dispatchEvent({ type: 'click' });
  overlay.querySelector('#assetCategoria').value = 'Tecnología';
  overlay.querySelector('#assetCosto').value = '999';
  localStorage.setItem = () => { throw new Error('Sin espacio'); };
  await overlay.querySelector('#btnSaveAsset').dispatchEvent({ type: 'click' });
  expect(store.getAll()).toEqual(before);
  await overlay.querySelectorAll('[data-close-modal]')[1].dispatchEvent({ type: 'click' });
  await list.querySelector('[data-del-asset]').dispatchEvent({ type: 'click' });
  expect(store.getAll()).toEqual(before);
  expect(window.confirm).toHaveBeenCalledOnce();
});

it('escapa nombres y categorías en tarjetas y atributos del formulario', async () => {
  const { list, overlay } = await pantalla([bien({ nombre: '"><img src=x onerror=alert(1)>', categoria: '<b>Propia</b>' })]);
  expect(list.innerHTML).not.toContain('<img');
  expect(list.innerHTML).toContain('&lt;b&gt;Propia&lt;/b&gt;');
  await list.querySelector('[data-edit-asset]').dispatchEvent({ type: 'click' });
  expect(overlay.innerHTML).not.toContain('<img');
  expect(overlay.innerHTML).toContain('&quot;&gt;&lt;img');
});
