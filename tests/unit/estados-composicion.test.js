import { afterEach, expect, it, vi } from 'vitest';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { element } from './helpers/dom-falso.js';

const datos = () => ({
  name:'Servicios del Sur', periods:['2031','2032'],
  balanceGeneral:{
    '2031':{ activos:{ 'Banco propio':37 }, pasivos:{}, patrimonio:{} },
    '2032':{ activos:{ 'Banco propio':81 }, pasivos:{}, patrimonio:{} }
  },
  estadoResultados:{ '2031':{}, '2032':{} },
  accountTypes:{ activos:{ 'Banco propio':'efectivo' }, pasivos:{}, patrimonio:{}, estadoResultados:{} },
  accountIdentities:{ activos:{
    'Banco propio':{ idCuenta:'bs.cash_and_equivalents', estado:'reconocida', metodo:'id', candidatos:[], origen:'manual' }
  }, pasivos:{}, patrimonio:{}, estadoResultados:{}, suplementario:{} }
});

async function montar(inicial) {
  vi.resetModules();
  const almacen = new Map([['gfo-toolkit-data',JSON.stringify({ estados:inicial })]]);
  const setItem = vi.fn((clave, valor) => almacen.set(clave, valor));
  vi.stubGlobal('localStorage', { getItem:clave => almacen.get(clave) ?? null, setItem });
  vi.stubGlobal('window', { confirm:() => true });
  const page = element();
  vi.stubGlobal('document', { getElementById:id => id === 'page-estados' ? page : null });
  const { default:store } = await import('../../js/store.js');
  const { initEstados, getSavedStates } = await import('../../js/modules/estados/index.js');
  initEstados();
  return { page, store, almacen, setItem, initEstados, getSavedStates };
}

function seleccionar(page, valor) {
  const selector = page.querySelector('#composicionIngresos');
  selector.value = valor;
  selector.onchange({ target:selector });
}

afterEach(() => vi.unstubAllGlobals());

it.each(['sin_declarar','excluye_intereses','incluye_intereses'])('guarda y recarga la composición %s del periodo editado sin cambiar importes', async valor => {
  const original = datos();
  const { page, store, almacen, setItem, initEstados, getSavedStates } = await montar(original);
  seleccionar(page, valor);
  expect(setItem).not.toHaveBeenCalled();
  page.querySelector('#saveStates').onclick();
  expect(setItem).toHaveBeenCalledTimes(1);
  const persistido = JSON.parse(almacen.get('gfo-toolkit-data')).estados;
  expect(persistido.composicionIngresos).toEqual({ '2031':valor, '2032':'sin_declarar' });
  expect(persistido.balanceGeneral).toEqual(original.balanceGeneral);
  expect(persistido.estadoResultados).toEqual(original.estadoResultados);
  store._data = null;
  initEstados();
  expect(getSavedStates().composicionIngresos).toEqual(persistido.composicionIngresos);
  expect(page.innerHTML).toContain(`value="${valor}" selected`);
  const periodo = page.querySelector('#currentPeriod');
  periodo.value = '1';
  await periodo.dispatchEvent({ type:'change' });
  expect(page.innerHTML).toContain('value="sin_declarar" selected');
});

it('los datos legados sin campo se leen sin_declarar, sin inferir de rótulos ni importes', async () => {
  const legado = datos();
  legado.estadoResultados['2031'] = { 'Otros ingresos sin intereses':0 };
  const { page, getSavedStates, almacen, setItem } = await montar(legado);
  expect(getSavedStates().composicionIngresos).toEqual({ '2031':'sin_declarar', '2032':'sin_declarar' });
  expect(page.innerHTML).toContain('value="sin_declarar" selected');
  expect(setItem).not.toHaveBeenCalled();
  expect(JSON.parse(almacen.get('gfo-toolkit-data')).estados).toEqual(legado);
});

it('conserva identidades, tipos, pendientes, totales reportados y suplementarios al guardar y recargar', async () => {
  const original = datos();
  original.composicionIngresos = { '2031':'excluye_intereses', '2032':'incluye_intereses' };
  original.accountIdentities.activos['Total formal'] = {
    idCuenta:'bs.total_assets', estado:'reconocida', metodo:'id', candidatos:[], origen:'importacion'
  };
  original.accountIdentities.suplementario['Crédito propio'] = {
    idCuenta:'supp.credit_sales', estado:'reconocida', metodo:'id', candidatos:[], origen:'importacion'
  };
  original.reportedTotals = { '2031':{ 'bs.total_assets':{ nombre:'Total formal', grupo:'activos', importe:93 } } };
  original.supplementaryAccounts = { '2031':{ 'Crédito propio':63 } };
  original.pendingAccounts = [{ nombre:'Rubro externo', importes:{ '2031':0, '2032':19 },
    identificacion:{ idCuenta:null, estado:'no_reconocida', metodo:null, candidatos:[], origen:'importacion' } }];
  const { page, store, getSavedStates, initEstados } = await montar(original);
  page.querySelector('#saveStates').onclick();
  store._data = null;
  initEstados();
  const recargado = getSavedStates();
  for (const campo of ['balanceGeneral','estadoResultados','accountIdentities','accountTypes','pendingAccounts',
    'reportedTotals','supplementaryAccounts','composicionIngresos']) {
    expect(recargado[campo], campo).toEqual(original[campo]);
  }
  expect(normalizeFinancialData(recargado)).toEqual(recargado);
});

it('renombrar y borrar un periodo mantiene la composición asociada a ese periodo', async () => {
  const original = datos();
  original.composicionIngresos = { '2031':'excluye_intereses', '2032':'incluye_intereses' };
  const { page, store } = await montar(original);
  vi.stubGlobal('FormData', class { get() { return '2033'; } });
  await page.querySelector('#renamePeriod').dispatchEvent({ type:'submit' });
  page.querySelector('#saveStates').onclick();
  expect(store.get('estados.composicionIngresos')).toEqual({ '2032':'incluye_intereses', '2033':'excluye_intereses' });
  await page.querySelector('#deletePeriod').dispatchEvent({ type:'click' });
  page.querySelector('#saveStates').onclick();
  expect(store.get('estados.composicionIngresos')).toEqual({ '2032':'incluye_intereses' });
});

it.each([null, [], { '2031':'inventado' }, { '2039':'excluye_intereses' }])('rechaza una declaración inválida sin inventar composición: %j', composicionIngresos => {
  expect(() => normalizeFinancialData({ ...datos(), composicionIngresos })).toThrow();
});
