import { afterEach, expect, it, vi } from 'vitest';
import { estadosUI } from '../../js/modules/estados/estados-ui.js';

// Pantalla de Estados con un documento simulado (mismo enfoque que estados-acceptance):
// corre el render y los manejadores reales; el navegador es falso.
function element() {
  const listeners = new Map();
  const children = new Map();
  let html = '';
  return {
    value: '', files: [], textContent: '', className: '',
    get innerHTML() { return html; },
    set innerHTML(value) {
      html = value;
      children.clear();
      for (const [, id] of value.matchAll(/\bid="([^"]+)"/g)) children.set(`#${id}`, element());
    },
    querySelector(selector) { return children.get(selector) ?? null; },
    querySelectorAll() { return []; },
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
