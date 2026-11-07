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
  const contenidoPrimero = page.querySelector('#tab-dupont').innerHTML;
  page.querySelector('#analysisPeriod').onchange({ target: { value: datos.periods.at(-1) } });
  expect(page.querySelector('#tab-dupont').innerHTML).not.toBe(contenidoPrimero);
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


it('conserva Mercado sin guardar al cambiar periodos, incluso con cero o campos vacíos', async () => {
  const datos = estadosDesdeReferencia(ejemploApp);
  const { page, store } = await montar(datos);
  const mercado = page.querySelector('#mercadoContenido');
  const valores = { 'mer-acciones-0': '12345', 'mer-precio-0': '10', 'mer-dividendos-0': '100',
    'mer-acciones-1': '0', 'mer-precio-1': '', 'mer-dividendos-1': '25.50' };
  for (const [id, valor] of Object.entries(valores)) mercado.querySelector(`#${id}`).value = valor;
  const persistir = vi.spyOn(store, 'setPersisted');
  for (const periodo of [datos.periods[0], datos.periods.at(-1)]) {
    page.querySelector('#analysisPeriod').onchange({ target: { value: periodo } });
    const actual = page.querySelector('#mercadoContenido');
    for (const [id, valor] of Object.entries(valores)) expect(actual.querySelector(`#${id}`).value).toBe(valor);
    expect(actual).toBe(mercado);
  }
  expect(persistir).not.toHaveBeenCalled();
});
