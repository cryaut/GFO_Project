import { afterEach, expect, it, vi } from 'vitest';
import { nodo } from './helpers/formulario-falso.js';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

it('avisa antes de cerrar solo mientras exista un borrador, y recupera Inicio para rutas desconocidas', async () => {
  const pages = { 'page-estados': nodo(), 'page-home': nodo() };
  const documentEvents = new Map();
  const windowEvents = new Map();
  vi.stubGlobal('document', {
    documentElement: { setAttribute() {} },
    getElementById: id => pages[id] ?? null,
    querySelector: () => null, querySelectorAll: selector => selector === '.page' ? Object.values(pages) : [],
    addEventListener: (type, handler) => documentEvents.set(type, handler)
  });
  vi.stubGlobal('window', { location: { hash: '#/estados' }, confirm: () => true,
    addEventListener: (type, handler) => windowEvents.set(type, handler) });
  vi.stubGlobal('localStorage', { getItem: () => null, setItem() {} });
  await import('../../js/app.js');
  documentEvents.get('DOMContentLoaded')();
  const event = { preventDefault: vi.fn(), returnValue: undefined };
  windowEvents.get('beforeunload')(event);
  expect(event.preventDefault).not.toHaveBeenCalled();
  const empresa = pages['page-estados'].querySelector('#companyName');
  empresa.value = 'Borrador';
  await empresa.dispatchEvent({ type: 'input' });
  windowEvents.get('beforeunload')(event);
  expect(event.preventDefault).toHaveBeenCalledOnce();
  expect(event.returnValue).toBe('');
  window.location.hash = '#/ruta-inexistente';
  windowEvents.get('hashchange')();
  expect(pages['page-home'].classList.contains('active')).toBe(true);
  window.location.hash = '#/estados';
  windowEvents.get('hashchange')();
  expect(pages['page-estados'].querySelector('#companyName')).toBe(empresa);
  await pages['page-estados'].querySelector('#saveStates').dispatchEvent({ type: 'click' });
  event.preventDefault.mockClear();
  windowEvents.get('beforeunload')(event);
  expect(event.preventDefault).not.toHaveBeenCalled();
});
