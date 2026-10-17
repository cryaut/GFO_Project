import { expect, it } from 'vitest';
import { element } from './helpers/dom-falso.js';
import { selectorCuenta, renderRevisionCuentas } from '../../js/modules/estados/cuentas-ui.js';
import { tableTextToFinancialData } from '../../js/modules/estados/estados-import.js';

it('el alta exacta aporta id oculto y la sugerida pide confirmación sin asignarlo', () => {
  const contenedor = element();
  expect(selectorCuenta(contenedor, 'Efectivo', 'activos').estado).toBe('reconocida');
  expect(contenedor.innerHTML).toContain('type="hidden" name="idCuenta" value="bs.cash_and_equivalents"');
  expect(selectorCuenta(contenedor, 'Efetivo', 'activos').estado).toBe('sugerida');
  expect(contenedor.innerHTML).toContain('Confirme la selección');
  expect(contenedor.innerHTML).toContain('name="idCuenta" required');
  expect(contenedor.innerHTML).not.toContain('type="hidden"');
});

it('la revisión escapa nombres importados y muestra el resumen de los tres estados', () => {
  const contenedor = element();
  const datos = tableTextToFinancialData('Cuenta,Grupo,2024\nEfectivo,activos,10\nEfetivo,activos,20\n<img src=x onerror=alert(1)>,activos,30');
  renderRevisionCuentas(contenedor, datos, () => {}, () => {});
  expect(contenedor.innerHTML).toContain('1 reconocidas · 1 sugeridas · 1 no reconocidas');
  expect(contenedor.innerHTML).toContain('&lt;img');
  expect(contenedor.innerHTML).not.toContain('<img');
});
