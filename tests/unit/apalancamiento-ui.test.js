import { afterEach, describe, expect, it, vi } from 'vitest';
import store from '../../js/store.js';
import { apalancamientoUI } from '../../js/modules/apalancamiento/apalancamiento-ui.js';

// Doble de frontera, no un parser de DOM (mismo enfoque que estados-acceptance.test.js):
// cada id="…" del HTML asignado se vuelve un elemento consultable con '#id'.
function element() {
  const listeners = new Map();
  const children = new Map();
  let html = '';
  return {
    value: '', textContent: '', className: '',
    get innerHTML() { return html; },
    set innerHTML(value) {
      html = value;
      children.clear();
      for (const [, id] of value.matchAll(/\bid="([^"]+)"/g)) children.set(`#${id}`, element());
    },
    querySelector(selector) { return children.get(selector) ?? null; },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    async dispatchEvent(event) {
      const dispatched = { ...event, target: this, preventDefault() {} };
      for (const handler of listeners.get(event.type) ?? []) await handler.call(this, dispatched);
    }
  };
}

async function cambiar(page, id, value, type = 'change') {
  const el = page.querySelector(`#${id}`);
  expect(el, `#${id} existe`).not.toBeNull();
  el.value = value;
  await el.dispatchEvent({ type });
}

async function guardar(page) {
  await page.querySelector('#guardarApalancamiento').dispatchEvent({ type: 'click' });
}

// Estado de resultados de la demo MUNO MODA; el balance no interviene en el apalancamiento.
function muno() {
  return {
    name: 'MUNO MODA S.A.',
    periods: ['2023', '2024'],
    balanceGeneral: { 2023: {}, 2024: {} },
    estadoResultados: {
      2023: {
        'Ventas': 850000, 'Costo de Ventas': 510000, 'Gastos de Administracion': 120000,
        'Gastos de Ventas': 85000, 'Otros Ingresos': 15000, 'Otros Gastos': 10000
      },
      2024: {
        'Ventas': 920000, 'Costo de Ventas': 545000, 'Gastos de Administracion': 130000,
        'Gastos de Ventas': 90000, 'Otros Ingresos': 18000, 'Otros Gastos': 12000
      }
    }
  };
}

const VACIA = { comportamiento: {}, dap: {}, tasaDefecto: null };

// Índice de la cuenta en la tabla de clasificación (orden de cuentasOperativas).
const GASTOS_VENTAS = 2;

function montar(estados, config = VACIA, guardarFn = vi.fn()) {
  const page = element();
  apalancamientoUI(page, { estados, config, guardar: guardarFn });
  return { page, guardarFn };
}

afterEach(() => {
  store._data = null;
  store._listeners = [];
  vi.unstubAllGlobals();
});

describe('Pantalla de apalancamiento', () => {
  it('sin estados guardados muestra el enlace a Estados y nada más', () => {
    const { page } = montar({ periods: [], balanceGeneral: {}, estadoResultados: {} });
    expect(page.innerHTML).toContain('href="#/estados"');
    expect(page.querySelector('#guardarApalancamiento')).toBeNull();
  });

  it('con estados inválidos muestra el error sin romper la página', () => {
    const { page } = montar({ periods: ['2023'], balanceGeneral: {}, estadoResultados: {} });
    expect(page.innerHTML).toContain('No se pudieron leer los estados guardados');
    expect(page.innerHTML).toContain('href="#/estados"');
  });

  it('MUNO MODA sin clasificar: GAO N/D, variación visible y aviso', () => {
    const { page } = montar(muno());
    const html = page.innerHTML;
    expect(html).toContain('Gastos de Ventas');
    expect(html).toContain('N/D');
    expect(html).toContain('1.80');            // GAO por variación 2023 → 2024
    expect(html).toContain('Falta clasificar');
    expect(html).toContain('sugerido');         // costo de ventas y administración
  });

  it('clasificar gastos de ventas como fijos, guardar y ver el GAO 2023', async () => {
    const { page, guardarFn } = montar(muno());
    await cambiar(page, `comp-${GASTOS_VENTAS}`, 'fijo');
    expect(page.querySelector('#apalancamientoMensaje').textContent).toContain('sin guardar');
    await guardar(page);
    expect(guardarFn).toHaveBeenCalledTimes(1);
    expect(guardarFn.mock.calls[0][0]).toEqual({
      comportamiento: {
        'Costo de Ventas': { tipo: 'variable' },
        'Gastos de Administracion': { tipo: 'fijo' },
        'Gastos de Ventas': { tipo: 'fijo' }
      },
      dap: {},
      tasaDefecto: null
    });
    const html = page.innerHTML;
    expect(html).toContain('2.52');             // 340,000 / 135,000
    expect(html).toContain('0.96');             // GAF con la UAI (D-007)
    expect(html).not.toContain('sugerido');
    expect(page.querySelector('#apalancamientoMensaje').textContent).toContain('Guardado');
  });

  it('una cuenta mixta guarda el % variable como fracción', async () => {
    const { page, guardarFn } = montar(muno());
    await cambiar(page, `comp-${GASTOS_VENTAS}`, 'mixto');
    await cambiar(page, `pct-${GASTOS_VENTAS}`, '40', 'input');
    await guardar(page);
    expect(guardarFn.mock.calls[0][0].comportamiento['Gastos de Ventas'])
      .toEqual({ tipo: 'mixto', pctVariable: 0.4 });
  });

  it('guarda DAP y tasa por defecto válidos', async () => {
    const { page, guardarFn } = montar(muno());
    expect(page.innerHTML).toContain('No interviene (DAP = 0)');
    await cambiar(page, 'dap-1', '7,000', 'input');
    await cambiar(page, 'tasaDefecto', '25', 'input');
    await guardar(page);
    const config = guardarFn.mock.calls[0][0];
    expect(config.dap).toEqual({ 2024: 7000 });
    expect(config.tasaDefecto).toBe(0.25);
    // 2024 tiene DAP y no hay cuenta de impuestos: usa la tasa por defecto guardada
    expect(page.innerHTML).toContain('25.00% (por defecto)');
    expect(page.innerHTML).toContain('tasa por defecto de 25.00%');
  });

  it.each([
    ['tasaDefecto', '150', 'tasa'],
    ['tasaDefecto', 'abc', 'tasa'],
    ['dap-0', '-5', 'DAP'],
    ['dap-0', '1.2.3', 'DAP']
  ])('no guarda con %s = %s', async (id, valor, texto) => {
    const { page, guardarFn } = montar(muno());
    await cambiar(page, id, valor, 'input');
    await guardar(page);
    expect(guardarFn).not.toHaveBeenCalled();
    const mensaje = page.querySelector('#apalancamientoMensaje');
    expect(mensaje.textContent).toContain(texto);
    expect(mensaje.className).toBe('text-danger');
  });

  it('rechaza un % variable fuera de 0 a 100', async () => {
    const { page, guardarFn } = montar(muno());
    await cambiar(page, `comp-${GASTOS_VENTAS}`, 'mixto');
    await cambiar(page, `pct-${GASTOS_VENTAS}`, '120', 'input');
    await guardar(page);
    expect(guardarFn).not.toHaveBeenCalled();
    expect(page.querySelector('#apalancamientoMensaje').textContent).toContain('% variable');
  });

  it('si falla el guardado, avisa y conserva los datos anteriores', async () => {
    const falla = vi.fn(() => { throw new Error('Cuota de almacenamiento excedida'); });
    const { page } = montar(muno(), VACIA, falla);
    await cambiar(page, `comp-${GASTOS_VENTAS}`, 'fijo');
    await guardar(page);
    const mensaje = page.querySelector('#apalancamientoMensaje');
    expect(mensaje.textContent).toContain('Cuota de almacenamiento excedida');
    expect(mensaje.className).toBe('text-danger');
    expect(page.innerHTML).not.toContain('2.52'); // sigue con la configuración guardada
  });

  it('escapa los nombres de cuenta', () => {
    const datos = muno();
    const nombre = '<img src=x onerror=alert(1)>';
    for (const periodo of datos.periods) datos.estadoResultados[periodo][nombre] = 1000;
    datos.accountTypes = { estadoResultados: { [nombre]: 'gastosVentas' } };
    const { page } = montar(datos);
    expect(page.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(page.innerHTML).not.toContain('<img');
  });

  it('UAII negativa: muestra el grado negativo con advertencia', () => {
    const datos = muno();
    datos.estadoResultados[2023]['Ventas'] = 600000; // UAII = 600,000 − 715,000 = −115,000
    const config = { ...VACIA, comportamiento: { 'Gastos de Ventas': { tipo: 'fijo' } } };
    const { page } = montar(datos, config);
    // MC = 600,000 − 510,000 = 90,000; GAO = 90,000 / −115,000 = −0.78
    expect(page.innerHTML).toContain('-0.78');
    expect(page.innerHTML).toContain('punto de equilibrio operativo');
  });

  it('explica cómo leer los grados positivos', () => {
    const config = { ...VACIA, comportamiento: { 'Gastos de Ventas': { tipo: 'fijo' } } };
    const { page } = montar(muno(), config);
    expect(page.innerHTML).toContain('Si las ventas cambian 1 %, la UAII cambia');
    expect(page.innerHTML).toContain('<details');   // traza por periodo
    expect(page.innerHTML).toContain('MC / UAII');
  });
});

describe('initApalancamiento con el store', () => {
  it('lee estados y configuración guardados y persiste la clasificación', async () => {
    const storage = new Map([['gfo-toolkit-data', JSON.stringify({ estados: muno() })]]);
    const setItem = vi.fn((key, value) => storage.set(key, value));
    const page = element();
    vi.stubGlobal('localStorage', { getItem: key => storage.get(key) ?? null, setItem });
    vi.stubGlobal('document', { getElementById: id => id === 'page-apalancamiento' ? page : null });
    store._data = null;
    const { initApalancamiento } = await import('../../js/modules/apalancamiento/index.js');
    initApalancamiento();
    expect(page.innerHTML).toContain('MUNO MODA S.A.');

    await cambiar(page, `comp-${GASTOS_VENTAS}`, 'fijo');
    await guardar(page);
    expect(setItem).toHaveBeenCalledTimes(1);
    const guardado = JSON.parse(storage.get('gfo-toolkit-data'));
    expect(guardado.apalancamiento.comportamiento['Gastos de Ventas']).toEqual({ tipo: 'fijo' });
    expect(guardado.estados.name).toBe('MUNO MODA S.A.');

    // Al volver a entrar a la ruta se usa lo guardado.
    initApalancamiento();
    expect(page.innerHTML).toContain('2.52');
  });

  it('no hace nada si la página no existe', async () => {
    vi.stubGlobal('document', { getElementById: () => null });
    const { initApalancamiento } = await import('../../js/modules/apalancamiento/index.js');
    expect(() => initApalancamiento()).not.toThrow();
  });
});
