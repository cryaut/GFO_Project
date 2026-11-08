import { afterEach, expect, it, vi } from 'vitest';
import { element } from './helpers/dom-falso.js';
import { estadosUI } from '../../js/modules/estados/estados-ui.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { computarRazonesDesdeDatos } from '../../js/modules/razones/razones-app-adapter.js';

afterEach(() => vi.unstubAllGlobals());

function montar() {
  const datos = registrarCuenta({ name:'Caso propio', periods:['2024'],
    balanceGeneral:{ '2024':{ activos:{}, pasivos:{}, patrimonio:{} } }, estadoResultados:{ '2024':{} } }, [
    { id:'bs.cash_and_equivalents', nombre:'Banco propio', periodo:'2024', importe:1000, confirmado:true },
    { id:'bs.trade_payables', nombre:'Proveedor propio', periodo:'2024', importe:400, confirmado:true }
  ]);
  const page = element(), save = vi.fn();
  vi.stubGlobal('window', { confirm:() => true });
  estadosUI(page, { initial:datos, demo:datos, save });
  return { page, save, datos };
}

it('el archivo anterior abre sin confirmar cobertura y no lo guarda automáticamente', () => {
  const { page, save } = montar();
  expect(page.innerHTML).toContain('Alcance del ejercicio');
  expect(page.innerHTML).toContain('value="sin_confirmar" selected');
  expect(save).not.toHaveBeenCalled();
});

it('guarda la declaración por grupo sin agregar cuentas; devuelve RC disponible', () => {
  const { page, save, datos } = montar();
  for (const grupo of ['activos', 'pasivos']) page.querySelector(`#coverage-${grupo}`).onchange({ target:{ value:'completo' } });
  expect(save).not.toHaveBeenCalled();
  page.querySelector('#saveStates').onclick();
  const salida = save.mock.calls[0][0];
  expect(salida.balanceGeneral).toEqual(datos.balanceGeneral);
  expect(salida.coberturaEstados).toEqual({ '2024':{ activos:'completo', pasivos:'completo' } });
  expect(computarRazonesDesdeDatos(salida, '2024').RC).toBe(2.5);
});

it('volver a parcial restaura N/D y no modifica los importes', () => {
  const { page, save, datos } = montar();
  for (const grupo of ['activos', 'pasivos']) page.querySelector(`#coverage-${grupo}`).onchange({ target:{ value:'completo' } });
  page.querySelector('#coverage-activos').onchange({ target:{ value:'parcial' } });
  page.querySelector('#saveStates').onclick();
  const salida = save.mock.calls[0][0];
  expect(computarRazonesDesdeDatos(salida, '2024').RC).toBeNull();
  expect(salida.balanceGeneral).toEqual(datos.balanceGeneral);
});

it('renombra y elimina periodos sin dejar cobertura asociada a un periodo inexistente', async () => {
  const { page, save } = montar();
  page.querySelector('#coverage-activos').onchange({ target:{ value:'completo' } });
  vi.stubGlobal('FormData', class { get() { return '2025'; } });
  await page.querySelector('#renamePeriod').dispatchEvent({ type:'submit' });
  page.querySelector('#saveStates').onclick();
  expect(save.mock.calls[0][0].coberturaEstados).toEqual({ '2025':{ activos:'completo' } });
  await page.querySelector('#deletePeriod').dispatchEvent({ type:'click' });
  page.querySelector('#saveStates').onclick();
  expect(save.mock.calls[1][0].coberturaEstados).toEqual({});
  expect(save.mock.calls[1][0].periods).toEqual([]);
});

it('una declaración inválida muestra el error y conserva el borrador original', () => {
  const { page, save } = montar();
  page.querySelector('#coverage-activos').onchange({ target:{ value:'automático' } });
  expect(page.querySelector('#estadoMessage').textContent).toContain('Cobertura');
  page.querySelector('#saveStates').onclick();
  expect(save.mock.calls[0][0]).not.toHaveProperty('coberturaEstados');
});
