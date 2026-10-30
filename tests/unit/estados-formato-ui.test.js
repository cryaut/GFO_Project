import { afterEach, expect, it, vi } from 'vitest';
import { estadosUI } from '../../js/modules/estados/estados-ui.js';

// Pantalla de Estados con un documento simulado (mismo enfoque que estados-acceptance):
// corre el render y los manejadores reales; el navegador es falso.
function element() {
  const listeners = new Map();
  const children = new Map();
  const casillas = [];
  let html = '';
  return {
    value: '', files: [], textContent: '', className: '', checked: false, disabled: false,
    get innerHTML() { return html; },
    set innerHTML(value) {
      html = value;
      children.clear();
      casillas.length = 0;
      for (const [, id] of value.matchAll(/\bid="([^"]+)"/g)) children.set(`#${id}`, element());
      for (const [, attrs] of value.matchAll(/<input type="checkbox" data-periodo([^>]*)>/g)) {
        const casilla = element();
        casilla.value = /value="([^"]*)"/.exec(attrs)?.[1] ?? '';
        casilla.checked = /\bchecked\b/.test(attrs);
        casilla.disabled = /\bdisabled\b/.test(attrs);
        casillas.push(casilla);
      }
    },
    querySelector(selector) { return children.get(selector) ?? null; },
    querySelectorAll(selector) { return selector === 'input[data-periodo]' ? [...casillas] : []; },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    async dispatchEvent(event) {
      const dispatched = { ...event, target: this, preventDefault() {} };
      for (const handler of [this[`on${event.type}`], ...(listeners.get(event.type) ?? [])]) {
        if (handler) await handler.call(this, dispatched);
      }
    }
  };
}

afterEach(() => vi.unstubAllGlobals());

const VACIO = { name: 'Mi empresa', periods: [], balanceGeneral: {}, estadoResultados: {} };
const CSV = 'Estado,Grupo,Cuenta,Clasificacion,2023\nBalance,Activos,Efectivo,efectivo,45.000';

async function importarCSV(page) {
  const input = page.querySelector('#statesFile');
  input.files = [{ name: 'estados.csv', contents: CSV }];
  await input.dispatchEvent({ type: 'change' });
}

it('avisa de importes ambiguos y el formato "coma decimal" los lee como miles', async () => {
  const page = element();
  vi.stubGlobal('window', { confirm: () => true });
  vi.stubGlobal('FileReader', class {
    readAsText(file) { this.result = file.contents; this.onload(); }
  });
  estadosUI(page, { initial: VACIO, demo: VACIO, save: () => {} });
  expect(page.innerHTML).toContain('id="numberFormat"');
  expect(page.innerHTML).toContain('for="numberFormat"');

  await importarCSV(page);
  const mensaje = () => page.querySelector('#estadoMessage').textContent;
  expect(mensaje()).toContain('Atención: 1 importe(s) ambiguo(s)');
  expect(mensaje()).toContain('"45.000" se leyó como 45');
  expect(page.querySelector('#accountEditor').innerHTML).toContain('value="45"');

  // La persona elige "Coma decimal" y vuelve a importar: 45.000 = 45 mil, sin avisos.
  const formato = page.querySelector('#numberFormat');
  formato.value = ',';
  await formato.dispatchEvent({ type: 'change' });
  await importarCSV(page);
  expect(mensaje()).not.toContain('Atención');
  expect(page.querySelector('#accountEditor').innerHTML).toContain('value="45000"');
  expect(page.innerHTML).toMatch(/<option value="," selected>/);
});

// D-065: datos de prueba equilibrados (activos 100 = patrimonio 100) con N periodos.
const conPeriodos = n => ({
  name: 'Prueba',
  periods: Array.from({ length: n }, (_, i) => `${2020 + i}`),
  balanceGeneral: Object.fromEntries(Array.from({ length: n }, (_, i) => [`${2020 + i}`,
    { activos: { 'Efectivo': 100 }, pasivos: {}, patrimonio: { 'Capital Social': 100 } }])),
  estadoResultados: Object.fromEntries(Array.from({ length: n }, (_, i) => [`${2020 + i}`, {}]))
});

const casillasDe = page => page.querySelectorAll('input[data-periodo]');

it('D-065: con un solo periodo no muestra el selector', () => {
  const page = element();
  estadosUI(page, { initial: conPeriodos(1), demo: conPeriodos(1), save: () => {} });
  expect(page.innerHTML).not.toContain('id="periodSelector"');
});

it('D-065: con tres periodos todos quedan visibles por defecto', () => {
  const page = element();
  estadosUI(page, { initial: conPeriodos(3), demo: conPeriodos(3), save: () => {} });
  expect(page.innerHTML).toContain('id="periodSelector"');
  expect(page.innerHTML).toContain('3 de 4 seleccionados');
  const casillas = casillasDe(page);
  expect(casillas).toHaveLength(3);
  expect(casillas.map(c => c.checked)).toEqual([true, true, true]);
});

it('D-065: con seis periodos los predeterminados son los dos más recientes', () => {
  const page = element();
  estadosUI(page, { initial: conPeriodos(6), demo: conPeriodos(6), save: () => {} });
  expect(page.innerHTML).toContain('2 de 4 seleccionados');
  expect(casillasDe(page).filter(c => c.checked).map(c => c.value)).toEqual(['2024', '2025']);
  expect(page.innerHTML).not.toContain('Máximo 4 periodos');
});

it('D-065: al llegar a 4 las casillas no marcadas se deshabilitan', async () => {
  const page = element();
  estadosUI(page, { initial: conPeriodos(6), demo: conPeriodos(6), save: () => {} });
  let casillas = casillasDe(page);
  for (const casilla of casillas.filter(c => !c.checked)) {
    casilla.checked = true;
    await casilla.dispatchEvent({ type: 'change' });
    casillas = casillasDe(page);
  }
  expect(casillasDe(page).filter(c => c.checked)).toHaveLength(4);
  expect(page.innerHTML).toContain('4 de 4 seleccionados');
  expect(page.innerHTML).toContain('Máximo 4 periodos');
  expect(casillas.filter(c => !c.checked).every(c => c.disabled)).toBe(true);
});

it('D-065: el botón Predeterminados restaura la selección inicial', async () => {
  const page = element();
  estadosUI(page, { initial: conPeriodos(6), demo: conPeriodos(6), save: () => {} });
  const casilla = casillasDe(page).find(c => !c.checked);
  casilla.checked = true;
  await casilla.dispatchEvent({ type: 'change' });
  expect(page.innerHTML).toContain('3 de 4 seleccionados');
  await page.querySelector('#defaultPeriods').dispatchEvent({ type: 'click' });
  expect(page.innerHTML).toContain('2 de 4 seleccionados');
  expect(casillasDe(page).filter(c => c.checked).map(c => c.value)).toEqual(['2024', '2025']);
});

it('D-065: la selección solo cambia las columnas, no los totales', async () => {
  const page = element();
  estadosUI(page, { initial: conPeriodos(3), demo: conPeriodos(3), save: () => {} });
  const vista = () => page.querySelector('#statementPreview').innerHTML;
  expect(vista()).toContain('<th>2020</th>');
  expect(vista()).toContain('<th>2021</th>');
  // Desmarcar 2020 y 2022 deja solo 2021 como columna visible.
  for (const valor of ['2020', '2022']) {
    const casilla = casillasDe(page).find(c => c.value === valor);
    casilla.checked = false;
    await casilla.dispatchEvent({ type: 'change' });
  }
  expect(page.innerHTML).toContain('1 de 4 seleccionados');
  expect(vista()).toContain('<th>2021</th>');
  expect(vista()).not.toContain('<th>2020</th>');
  expect(vista()).not.toContain('<th>2022</th>');
  // El total del periodo visible conserva su cifra: la selección no recalcula nada.
  expect(vista()).toContain('C$ 100.00');
});

it('D-065: la selección no se guarda en el store', async () => {
  const page = element();
  const guardados = [];
  vi.stubGlobal('window', { confirm: () => true });
  estadosUI(page, { initial: conPeriodos(3), demo: conPeriodos(3), save: datos => guardados.push(datos) });
  const casilla = casillasDe(page)[0];
  casilla.checked = false;
  await casilla.dispatchEvent({ type: 'change' });
  await page.querySelector('#saveStates').dispatchEvent({ type: 'click' });
  expect(guardados).toHaveLength(1);
  expect(Object.keys(guardados[0])).toEqual(expect.arrayContaining(['periods', 'balanceGeneral', 'estadoResultados']));
  expect(Object.keys(guardados[0])).not.toContain('seleccionVisibles');
  expect(Object.keys(guardados[0])).not.toContain('periodosVisibles');
});
