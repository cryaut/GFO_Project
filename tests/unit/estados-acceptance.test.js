import { afterEach, expect, it, vi } from 'vitest';
import store from '../../js/store.js';

// Boundary double, not a DOM parser. The real renderer and application handlers
// run; browser layout, nested account forms and native validation are not tested.
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
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; },
    querySelectorAll(selector) {
      // Only ID selectors are needed by this acceptance path. Other selectors
      // have no matching nodes in this deliberately limited boundary double.
      return children.has(selector) ? [children.get(selector)] : [];
    },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    async dispatchEvent(event) {
      const dispatched = { ...event, target: this, defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; } };
      for (const handler of [this[`on${event.type}`], ...(listeners.get(event.type) ?? [])]) {
        if (handler) await handler.call(this, dispatched);
      }
      return !dispatched.defaultPrevented;
    }
  };
}

afterEach(() => {
  store._data = null;
  store._listeners = [];
  vi.unstubAllGlobals();
});

it('imports external JSON through Estados, previews, saves once and reloads', async () => {
  const page = element();
  const storage = new Map();
  const setItem = vi.fn((key, value) => storage.set(key, value));
  vi.stubGlobal('localStorage', { getItem: key => storage.get(key) ?? null, setItem });
  vi.stubGlobal('document', { getElementById: id => id === 'page-estados' ? page : null });
  vi.stubGlobal('window', { confirm: () => true });
  vi.stubGlobal('FileReader', class {
    readAsText(file) { this.result = file.contents; this.onload(); }
  });
  store._data = null;
  const { initEstados } = await import('../../js/modules/estados/index.js');
  initEstados();
  const input = page.querySelector('#statesFile');
  expect(input).not.toBeNull();
  expect(input.onchange).toBeTypeOf('function');

  const external = {
    name: 'Consultora externa', periods: ['2025'],
    balanceGeneral: { '2025': {
      activos: { 'Cuenta bancaria principal': 150 },
      pasivos: { 'Proveedor regional': 50 },
      patrimonio: { 'Aportes socios': 100 }
    } },
    estadoResultados: { '2025': { 'Servicios profesionales': 300 } },
    accountTypes: {
      activos: { 'Cuenta bancaria principal': 'efectivo' },
      pasivos: { 'Proveedor regional': 'cuentasPorPagar' },
      patrimonio: { 'Aportes socios': 'patrimonio' },
      estadoResultados: { 'Servicios profesionales': 'ventas' }
    }
  };
  input.files = [{ name: 'consultora.json', contents: JSON.stringify(external) }];
  await input.dispatchEvent({ type: 'change' });
  expect(page.querySelector('#statementPreview').innerHTML).toContain('Servicios profesionales');
  expect(page.querySelector('#accountEditor').innerHTML).toContain('Cuenta bancaria principal');
  expect(page.querySelector('#balanceCheck').innerHTML).toContain('Balance equilibrado');
  expect(store.get('estados.periods')).toEqual([]);
  expect(setItem).not.toHaveBeenCalled();

  const notify = vi.fn();
  store.subscribe(notify);
  await page.querySelector('#saveStates').dispatchEvent({ type: 'click' });
  expect(setItem).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledTimes(1);
  expect(store.get('estados')).toEqual(external);
  expect(JSON.parse(storage.get('gfo-toolkit-data')).estados).toEqual(external);

  store._data = null;
  initEstados();
  expect(store.get('estados')).toEqual(external);
  expect(page.querySelector('#statementPreview').innerHTML).toContain('Servicios profesionales');
  expect(page.querySelector('#estadoMessage').textContent).not.toContain('No se pudo');
});

it('keeps saved data intact when an invalid JSON is imported', async () => {
  const storage = new Map([['gfo-toolkit-data', JSON.stringify({
    estados: { name: 'Guardada', periods: ['2024'],
      balanceGeneral: { '2024': { activos: { 'Efectivo': 10 }, pasivos: {}, patrimonio: { 'Capital Social': 10 } } },
      estadoResultados: { '2024': {} } }
  })]]);
  const setItem = vi.fn((key, value) => storage.set(key, value));
  vi.stubGlobal('localStorage', { getItem: key => storage.get(key) ?? null, setItem });
  vi.stubGlobal('document', { getElementById: id => id === 'page-estados' ? page : null });
  vi.stubGlobal('window', { confirm: () => true });
  vi.stubGlobal('FileReader', class {
    readAsText(file) { this.result = file.contents; this.onload(); }
  });
  store._data = null;
  const { initEstados } = await import('../../js/modules/estados/index.js');
  const page = element();
  vi.stubGlobal('document', { getElementById: id => id === 'page-estados' ? page : null });
  initEstados();
  const input = page.querySelector('#statesFile');
  input.files = [{ name: 'roto.json', contents: '{ no es json' }];
  await input.dispatchEvent({ type: 'change' });
  expect(page.querySelector('#estadoMessage').textContent).toContain('JSON inválido');
  expect(store.get('estados.name')).toBe('Guardada');
  page.querySelector('#saveStates').dispatchEvent({ type: 'click' });
  expect(store.get('estados.name')).toBe('Guardada');
  // Saving after a rejected import must republish exactly the stored data,
  // never the corrupt payload that was refused.
  const persisted = JSON.parse(storage.get('gfo-toolkit-data')).estados;
  expect(persisted.name).toBe('Guardada');
  expect(persisted.periods).toEqual(['2024']);
  expect(persisted.balanceGeneral['2024'].activos).toEqual({ Efectivo: 10 });
});

it('propagates a storage failure instead of claiming a successful save', async () => {
  const page = element();
  const setItem = vi.fn(() => { throw new Error('QuotaExceededError'); });
  vi.stubGlobal('localStorage', { getItem: () => null, setItem });
  vi.stubGlobal('document', { getElementById: id => id === 'page-estados' ? page : null });
  vi.stubGlobal('window', { confirm: () => true });
  store._data = null;
  const { initEstados } = await import('../../js/modules/estados/index.js');
  initEstados();
  page.querySelector('#saveStates').dispatchEvent({ type: 'click' });
  expect(page.querySelector('#estadoMessage').textContent).toContain('No se pudo guardar');
  expect(page.querySelector('#estadoMessage').className).toBe('text-danger');
});

it('Analysis shows extended ratios from imported custom accounts', async () => {
  const storage = new Map();
  vi.stubGlobal('localStorage', { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) });
  vi.stubGlobal('window', { confirm: () => true });
  store._data = null;
  store.setPersisted('estados', {
    name: 'Importada', periods: ['2024', '2025'],
    balanceGeneral: {
      '2024': {
        activos: { 'Banco regional': 250, 'Cartera clientes': 100, 'Mercadería': 150 },
        pasivos: { 'Fábrica textil': 80, 'Préstamo bancario': 100 },
        patrimonio: { 'Socios fundadores': 320 }
      },
      '2025': {
        activos: { 'Banco regional': 300, 'Cartera clientes': 140, 'Mercadería': 160 },
        pasivos: { 'Fábrica textil': 90, 'Préstamo bancario': 90 },
        patrimonio: { 'Socios fundadores': 420 }
      }
    },
    estadoResultados: {
      '2024': { 'Ingresos por consultoría': 400, 'Papelería y fletes': 150, 'Renta oficina': 60, 'Publicidad': 40 },
      '2025': { 'Ingresos por consultoría': 500, 'Papelería y fletes': 180, 'Renta oficina': 70, 'Publicidad': 50 }
    },
    accountTypes: {
      activos: { 'Banco regional': 'efectivo', 'Cartera clientes': 'cxC', 'Mercadería': 'inventario' },
      pasivos: { 'Fábrica textil': 'cuentasPorPagar', 'Préstamo bancario': 'pasivoLargoPlazo' },
      patrimonio: { 'Socios fundadores': 'patrimonio' },
      estadoResultados: {
        'Ingresos por consultoría': 'ventas', 'Papelería y fletes': 'costoVentas',
        'Renta oficina': 'gastosAdmin', 'Publicidad': 'gastosVentas'
      }
    }
  });
  const page = element();
  vi.stubGlobal('document', { getElementById: id => id === 'page-analisis' ? page : null });
  const { initAnalisis } = await import('../../js/modules/analisis/index.js');
  initAnalisis();
  // Razones extendidas visibles en la pestaña Razones
  for (const etiqueta of ['Ciclo de Conversión', 'Prueba Defensiva', 'Deuda / Patrimonio',
    'Apalancamiento', 'Cobertura de Intereses', 'Margen Bruto', 'ROE', 'Rotación Pasivos', 'Plazo Pago',
    'Rotación Activos Fijos', 'Rotación Capital de Trabajo', 'Solvencia']) {
    expect(page.innerHTML, etiqueta).toContain(etiqueta);
  }
  // Valores exactos con el motor compartido (periodo 2025):
  // RC = (300+140+160)/90 = 6.67; ROE = 200/370 = 54.05%; Margen bruto = 320/500 = 64%
  expect(page.innerHTML).toContain('6.67');
  expect(page.innerHTML).toContain('54.05%');
  expect(page.innerHTML).toContain('64.00%');
  expect(page.innerHTML).not.toContain('NaN');
  store._data = null;
});
it('Reportes resumes imported custom accounts instead of fixed account names', async () => {
  const storage = new Map();
  vi.stubGlobal('localStorage', { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) });
  vi.stubGlobal('window', { confirm: () => true });
  store._data = null;
  store.setPersisted('estados', {
    name: 'Importada', periods: ['2024'],
    balanceGeneral: { '2024': {
      activos: { 'Banco regional': 300 },
      pasivos: { 'Préstamo bancario': 100 },
      patrimonio: { 'Socios fundadores': 200 }
    } },
    estadoResultados: { '2024': { 'Ingresos por consultoría': 500, 'Papelería y fletes': 200 } },
    accountTypes: {
      activos: { 'Banco regional': 'efectivo' },
      pasivos: { 'Préstamo bancario': 'pasivoLargoPlazo' },
      patrimonio: { 'Socios fundadores': 'patrimonio' },
      estadoResultados: { 'Ingresos por consultoría': 'ventas', 'Papelería y fletes': 'costoVentas' }
    }
  });
  const page = element();
  vi.stubGlobal('document', { getElementById: id => id === 'page-reportes' ? page : null });
  const { initReportes } = await import('../../js/modules/integracion/index.js');
  initReportes();
  const html = page.querySelector('#dashboardContent').innerHTML;
  expect(html).toContain('300.00'); // Total activos
  expect(html).toContain('500.00'); // Ventas desde la cuenta importada
  expect(html).not.toContain('NaN');
  store._data = null;
});

it('imports an external CSV through the Estados file input and publishes it', async () => {
  const page = element();
  const storage = new Map();
  vi.stubGlobal('localStorage', { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) });
  vi.stubGlobal('document', { getElementById: id => id === 'page-estados' ? page : null });
  vi.stubGlobal('window', { confirm: () => true });
  vi.stubGlobal('FileReader', class {
    readAsText(file) { this.result = file.contents; this.onload(); }
  });
  store._data = null;
  const { initEstados } = await import('../../js/modules/estados/index.js');
  initEstados();

  const csv = [
    'Estado,Grupo,Cuenta,Clasificacion,2024',
    'Balance,Activos,Banco regional,efectivo,150',
    'Balance,Pasivos,Proveedor regional,cuentasPorPagar,50',
    'Balance,Patrimonio,Aportes socios,patrimonio,100',
    'Resultados,,Servicios profesionales,ventas,300'
  ].join('\n');
  const input = page.querySelector('#statesFile');
  input.files = [{ name: 'externa.csv', contents: csv }];
  await input.dispatchEvent({ type: 'change' });

  expect(page.querySelector('#statementPreview').innerHTML).toContain('Servicios profesionales');
  expect(page.querySelector('#accountEditor').innerHTML).toContain('Banco regional');
  expect(page.querySelector('#balanceCheck').innerHTML).toContain('Balance equilibrado');
  expect(store.get('estados.periods')).toEqual([]); // todavía es borrador

  await page.querySelector('#saveStates').dispatchEvent({ type: 'click' });
  expect(store.get('estados.name')).toBe('externa');
  expect(store.get('estados.periods')).toEqual(['2024']);
  expect(store.get('estados.balanceGeneral')['2024'].activos).toEqual({ 'Banco regional': 150 });
  expect(store.get('estados.estadoResultados')['2024']).toEqual({ 'Servicios profesionales': 300 });
  store._data = null;
});

