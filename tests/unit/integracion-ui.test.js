import { afterEach, describe, expect, it, vi } from 'vitest';
import { element, clic } from './helpers/dom-falso.js';

// Pantalla de Reportes con dobles de navegador: se ejecutan el render y los manejadores
// reales; el DOM, localStorage, FileReader y la descarga son falsos.

const CLAVE = 'gfo-toolkit-data';

async function montar({ guardado = null, confirmar = true, fallaEnEscritura = null } = {}) {
  vi.resetModules();
  const almacen = new Map();
  if (guardado) almacen.set(CLAVE, JSON.stringify(guardado));
  let escrituras = 0;
  const toasts = [];
  const page = element();
  const confirm = vi.fn(() => confirmar);
  vi.stubGlobal('document', {
    getElementById: id => (id === 'toast-container' ? { appendChild: t => toasts.push(t) } : id === 'page-reportes' ? page : null),
    createElement: () => ({ style: {}, remove() {}, click() {} }),
    body: { appendChild() {}, removeChild() {} }
  });
  vi.stubGlobal('window', { confirm });
  vi.stubGlobal('localStorage', {
    getItem: key => almacen.get(key) ?? null,
    setItem: (key, value) => {
      escrituras += 1;
      if (fallaEnEscritura?.(escrituras)) throw new Error('cuota excedida');
      almacen.set(key, value);
    }
  });
  vi.stubGlobal('FileReader', class {
    readAsText(file) { this.result = file.contents; this.onload(); }
  });
  const descargas = [];
  vi.spyOn(URL, 'createObjectURL').mockImplementation(blob => { descargas.push(blob); return 'blob:falso'; });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

  const { default: store } = await import('../../js/store.js');
  const { initReportes } = await import('../../js/modules/integracion/index.js');
  initReportes();
  return { page, store, almacen, toasts, confirm, descargas };
}

async function importar(page, contenido, { tamano } = {}) {
  const input = page.querySelector('#importFileInput');
  input.files = [{ name: 'respaldo.json', size: tamano ?? contenido.length, contents: contenido }];
  await input.dispatchEvent({ type: 'change' });
}

const ultimoToast = toasts => toasts.at(-1);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Reportes: importar JSON', () => {
  it('valida, pide confirmación y guarda los módulos del respaldo', async () => {
    const { page, store, almacen, toasts, confirm } = await montar();
    await importar(page, JSON.stringify({ presupuesto: { ingresoMensual: 900 }, theme: 'dark' }));
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('presupuesto'));
    expect(store.get('presupuesto.ingresoMensual')).toBe(900);
    expect(JSON.parse(almacen.get(CLAVE)).presupuesto.ingresoMensual).toBe(900);
    expect(store.get('theme')).toBe('light'); // el tema no se importa
    expect(ultimoToast(toasts).textContent).toContain('importados correctamente');
  });

  it('si la persona cancela la confirmación no cambia nada', async () => {
    const { page, store, almacen, toasts } = await montar({ confirmar: false });
    await importar(page, JSON.stringify({ presupuesto: { ingresoMensual: 900 } }));
    expect(store.get('presupuesto.ingresoMensual')).toBe(0);
    expect(almacen.has(CLAVE)).toBe(false);
    expect(ultimoToast(toasts).textContent).toContain('cancelada');
  });

  it('rechaza un JSON de Estados y explica dónde importarlo', async () => {
    const { page, store, toasts, confirm } = await montar();
    const deEstados = { name: 'X', periods: ['2024'], balanceGeneral: {}, estadoResultados: {} };
    await importar(page, JSON.stringify(deEstados));
    expect(confirm).not.toHaveBeenCalled();
    expect(store.get('name')).toBeUndefined(); // antes se creaban claves basura en el store
    expect(store.get('periods')).toBeUndefined();
    expect(ultimoToast(toasts).textContent).toContain('Estados Financieros');
    expect(ultimoToast(toasts).className).toContain('error');
  });

  it('rechaza claves que alterarían el prototipo del store', async () => {
    const { page, store, toasts } = await montar();
    await importar(page, '{"presupuesto":{"__proto__":{"inyectado":true}}}');
    expect(ultimoToast(toasts).textContent).toContain('Clave no permitida');
    expect(store.getAll().presupuesto.inyectado).toBeUndefined();
    expect({}.inyectado).toBeUndefined();
  });

  it('rechaza un módulo con la forma equivocada sin tocar lo guardado', async () => {
    const { page, store, toasts } = await montar();
    await importar(page, JSON.stringify({ presupuesto: { gastos: 'no es lista' } }));
    expect(ultimoToast(toasts).textContent).toContain('presupuesto.gastos debe ser una lista');
    expect(store.get('presupuesto.gastos')).toEqual([]);
  });

  it('rechaza un archivo que supera el máximo y JSON corrupto', async () => {
    const { page, toasts } = await montar();
    await importar(page, '{}', { tamano: 6 * 1024 * 1024 });
    expect(ultimoToast(toasts).textContent).toContain('5 MB');
    await importar(page, '{no es json');
    expect(ultimoToast(toasts).textContent).toContain('JSON inválido');
  });

  it('si el almacenamiento falla a mitad, restaura los módulos ya guardados', async () => {
    // Escritura 1: presupuesto (ok). Escritura 2: flujo (falla). Escritura 3: restauración.
    const { page, store, toasts } = await montar({ fallaEnEscritura: n => n === 2 });
    await importar(page, JSON.stringify({ presupuesto: { ingresoMensual: 700 }, flujo: { saldoInicial: 50 } }));
    expect(ultimoToast(toasts).textContent).toContain('cuota excedida');
    expect(ultimoToast(toasts).textContent).toContain('Se conservaron los datos anteriores');
    expect(store.get('presupuesto.ingresoMensual')).toBe(0);
    expect(store.get('flujo.saldoInicial')).toBeNull();
  });
});

describe('Reportes: reporte HTML', () => {
  const guardado = {
    estados: {
      name: 'Empresa <Demo>', periods: ['2023', '2024'],
      balanceGeneral: {
        '2023': { activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { 'Capital <b>': 100 } },
        '2024': { activos: { Efectivo: 120 }, pasivos: {}, patrimonio: { 'Capital <b>': 120 } }
      },
      estadoResultados: { '2023': { Ventas: 10 }, '2024': { Ventas: 20 } },
      accountTypes: {
        activos: { Efectivo: 'efectivo' }, pasivos: {}, patrimonio: { 'Capital <b>': 'patrimonio' },
        estadoResultados: { Ventas: 'ventas' }
      }
    }
  };

  it('la vista previa muestra el reporte en pantalla, escapado, sin descargar nada', async () => {
    const { page, descargas } = await montar({ guardado });
    await clic(page, 'btnPreviewHTML');
    const vista = page.querySelector('#exportPreview').innerHTML;
    expect(vista).toContain('Balance General');
    expect(vista).toContain('Capital &lt;b&gt;');
    expect(vista).not.toContain('Capital <b>');
    expect(descargas).toHaveLength(0);
  });

  it('descargar genera un documento con título, tablas por periodo y texto escapado', async () => {
    const { page, descargas } = await montar({ guardado });
    await clic(page, 'btnExportHTML');
    expect(descargas).toHaveLength(1);
    const html = await descargas[0].text();
    expect(html).toContain('<h1>GFO Toolkit — Reporte</h1>');
    expect(html).toContain('Estado de Resultados');
    expect(html).toContain('Empresa &lt;Demo&gt;');
    expect(html).not.toContain('Capital <b>');
  });
});
