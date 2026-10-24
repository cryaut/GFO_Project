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

describe('Reportes: utilidad neta y periodo solicitado (ronda 15)', () => {
  const estadosConIntereses = () => ({
    name: 'Servicios del Lago', periods: ['2023'],
    balanceGeneral: { '2023': {
      activos: { Banco: 1000 }, pasivos: { Prestamo: 300 }, patrimonio: { Aportes: 700 }
    } },
    estadoResultados: { '2023': {
      Servicios: 1000, Insumos: 400, Administracion: 100, Publicidad: 50,
      'Intereses ganados': 30, 'Gasto extraordinario': 10,
      'Intereses pagados': 20, 'Renta del ejercicio': 90
    } },
    accountTypes: {
      activos: { Banco: 'efectivo' }, pasivos: { Prestamo: 'pasivoLargoPlazo' },
      patrimonio: { Aportes: 'patrimonio' },
      estadoResultados: {
        Servicios: 'ventas', Insumos: 'costoVentas', Administracion: 'gastosAdmin',
        Publicidad: 'gastosVentas', 'Intereses ganados': 'otrosIngresos',
        'Gasto extraordinario': 'otrosGastos', 'Intereses pagados': 'intereses',
        'Renta del ejercicio': 'impuestos'
      }
    }
  });

  it('usa la utilidad neta de Análisis con intereses e impuestos, sin caché guardada', async () => {
    const { page, store } = await montar({ guardado: { estados: estadosConIntereses() } });
    const { getSavedTotals } = await import('../../js/modules/integracion/index.js');
    const { computeRazones, refreshSavedStates } = await import('../../js/modules/analisis/index.js');
    refreshSavedStates();
    // 1000 - 400 - 100 - 50 + 30 - 10 - 20 - 90 = 360.
    expect(getSavedTotals('2023').utilidadNeta).toBe(360);
    expect(computeRazones('2023').MN * 1000).toBeCloseTo(360, 6);
    expect(store.get('analisis.resultados')).toEqual({});
    expect(page.querySelector('#dashboardContent').innerHTML).toMatch(/360\.00[\s\S]*?Utilidad Neta/);
  });

  it('un periodo inexistente da N/D sin sustituirlo por el disponible', async () => {
    const { page, store } = await montar({ guardado: { estados: estadosConIntereses() } });
    const { getSavedTotals } = await import('../../js/modules/integracion/index.js');
    const { formatCurrencyND } = await import('../../js/utils/format.js');
    expect(getSavedTotals('2023').utilidadNeta).toBe(360);
    expect(getSavedTotals('2024')).toBeNull();
    expect(formatCurrencyND(getSavedTotals('2024')?.utilidadNeta ?? null)).toBe('N/D');
    expect(store.get('estados.periods')).toEqual(['2023']);
    expect(getSavedTotals('2023').utilidadNeta).toBe(360);
    expect(page.innerHTML).not.toContain('<select');
  });

  it('sin estados normalizables muestra N/D y no la fórmula de seis términos', async () => {
    const estados = estadosConIntereses();
    estados.estadoResultados['2023'] = { Ventas: 1000, 'Costo de Ventas': 400 };
    estados.accountTypes.estadoResultados = { Ventas: 'tipo_invalido', 'Costo de Ventas': 'costoVentas' };
    const { page } = await montar({ guardado: { estados } });
    const html = page.querySelector('#dashboardContent').innerHTML;
    expect(html).toMatch(/N\/D<\/div><div class="kpi-label">Utilidad Neta/);
    expect(html).not.toMatch(/600\.00<\/div><div class="kpi-label">Utilidad Neta/);
  });
});
