import { afterEach, expect, it, vi } from 'vitest';
import { element } from './helpers/dom-falso.js';
import { estadosDesdeReferencia, ejemploApp } from '../fixtures/razones-app.js';

afterEach(() => vi.unstubAllGlobals());

async function montar(datos) {
  vi.resetModules();
  const page = element();
  vi.stubGlobal('localStorage', { getItem: () => null, setItem() {} });
  vi.stubGlobal('document', { getElementById: id => id === 'page-analisis' ? page : null });
  const { default: store } = await import('../../js/store.js');
  store.setPersisted('estados', datos);
  const { initAnalisis } = await import('../../js/modules/analisis/index.js');
  initAnalisis();
  return { page, store };
}

it('conserva las nueve secciones y cambia de periodo sin escribir estados', async () => {
  const datos = estadosDesdeReferencia(ejemploApp);
  const { page, store } = await montar(datos);
  expect([...page.innerHTML.matchAll(/data-tab="/g)]).toHaveLength(9);
  expect(page.innerHTML).toContain('ROA y ROE: descomposición y comprobación');
  const guardados = structuredClone(store.get('estados'));
  page.querySelector('#analysisPeriod').onchange({ target: { value: datos.periods[0] } });
  expect(page.innerHTML).toContain(`value="${datos.periods[0]}" selected`);
  expect(store.get('estados')).toEqual(guardados);
});

it('escapa los nombres propios en AH y AV en vez de convertirlos en HTML', async () => {
  const datos = estadosDesdeReferencia(ejemploApp);
  for (const periodo of datos.periods) datos.estadoResultados[periodo]['<img src=x onerror=alert(1)>'] = 0;
  datos.name = '<script>empresa</script>';
  const { page } = await montar(datos);
  expect(page.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
  expect(page.innerHTML).toContain('&lt;script&gt;empresa&lt;/script&gt;');
  expect(page.innerHTML).not.toContain('<img src=x');
  expect(page.innerHTML).not.toContain('<script>empresa');
});
