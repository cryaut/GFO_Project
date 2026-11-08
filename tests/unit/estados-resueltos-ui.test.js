import { afterEach, expect, it, vi } from 'vitest';
import { element } from './helpers/dom-falso.js';
import { ejemploEstadosResueltos } from '../fixtures/estados-resueltos.js';
import { estadosUI } from '../../js/modules/estados/estados-ui.js';

afterEach(() => vi.unstubAllGlobals());

it('Estados intercala la utilidad bruta dentro del editor, antes de los gastos y UAII', () => {
  const page = element();
  const datos = ejemploEstadosResueltos();
  const save = vi.fn();
  vi.stubGlobal('window', { confirm: () => true });
  estadosUI(page, { initial: datos, demo: datos, save });
  const editor = page.querySelector('#accountEditor').innerHTML;
  expect(editor).toContain('Utilidad bruta');
  expect(editor).toContain('Utilidad operativa (UAII)');
  expect(editor).toContain('Utilidad antes de impuestos (UAI)');
  expect(editor.indexOf('resuelto:is.gross_profit_reported')).toBeLessThan(editor.indexOf('Dato is.other_operating_expenses'));
  expect(editor.indexOf('Dato is.other_operating_expenses')).toBeLessThan(editor.indexOf('resuelto:is.operating_profit_reported'));
  expect(editor).toContain('30,000.00');
  expect(save).not.toHaveBeenCalled();
});

it('un impuesto ausente se muestra N/D en UN sin ocultar la UAI calculable', () => {
  const page = element();
  const datos = ejemploEstadosResueltos();
  delete datos.estadoResultados.Julio['Dato is.income_tax_expense'];
  vi.stubGlobal('window', { confirm: () => true });
  estadosUI(page, { initial: datos, demo: datos, save: vi.fn() });
  const editor = page.querySelector('#accountEditor').innerHTML;
  const uai = editor.slice(editor.indexOf('resuelto:presentacion.uai'), editor.indexOf('resuelto:is.net_income_reported'));
  const neta = editor.slice(editor.indexOf('resuelto:is.net_income_reported'));
  expect(uai).toContain('10,000.00');
  expect(neta).toContain('N/D');
});
