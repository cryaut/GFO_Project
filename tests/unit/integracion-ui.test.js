import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { element, clic } from './helpers/dom-falso.js';
import { crearCasoComercial, duplicarEscenario } from '../../js/modules/planeacion/planeacion-escenarios.js';
import { ejemploPlaneacion } from '../../js/modules/planeacion/planeacion-calculations.js';

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
  const setItem = vi.fn((key, value) => {
    escrituras += 1;
    if (fallaEnEscritura?.(escrituras)) throw new Error('cuota excedida');
    almacen.set(key, value);
  });
  vi.stubGlobal('document', {
    getElementById: id => (id === 'toast-container' ? { appendChild: t => toasts.push(t) } : id === 'page-reportes' ? page : null),
    createElement: () => ({ style: {}, remove() {}, click() {} }),
    body: { appendChild() {}, removeChild() {} }
  });
  vi.stubGlobal('window', { confirm });
  vi.stubGlobal('localStorage', {
    getItem: key => almacen.get(key) ?? null,
    setItem
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
  return { page, store, almacen, toasts, confirm, descargas, setItem };
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
    const { page, store, almacen, toasts, confirm, setItem } = await montar();
    const cambio = vi.fn();
    store.subscribe(cambio);
    await importar(page, JSON.stringify({ presupuesto: { ingresoMensual: 900 }, flujo: { saldoInicial: 50 }, theme: 'dark' }));
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('presupuesto'));
    expect(store.get('presupuesto.ingresoMensual')).toBe(900);
    expect(JSON.parse(almacen.get(CLAVE)).presupuesto.ingresoMensual).toBe(900);
    expect(JSON.parse(almacen.get(CLAVE)).flujo.saldoInicial).toBe(50);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(cambio).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      presupuesto: expect.objectContaining({ ingresoMensual: 900 }),
      flujo: expect.objectContaining({ saldoInicial: 50 })
    }));
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

  it.each([
    [{ fecha: '2026-02-31' }, 'no existe en el calendario'],
    [{ costoUnitario: -1 }, 'El costo unitario de inventario.movimientos[0]'],
    [{ tipo: 'salida', cantidad: 2 }, 'Existencia insuficiente en el movimiento "salida"']
  ])('rechaza un kardex inválido (%j) antes de confirmar o escribir otros módulos', async (cambio, motivo) => {
    const producto = { id: 'p1', nombre: 'Artículo', unidad: 'unidades', existenciaInicial: 1, costoUnitario: 20, stockMinimo: 0 };
    const guardado = { flujo: { saldoInicial: 12 }, inventario: { productos: [producto], movimientos: [] } };
    const { page, store, almacen, toasts, confirm, setItem } = await montar({ guardado });
    const antes = store.getAll();
    const inventario = {
      productos: [producto],
      movimientos: [
        { id: 'salida', productoId: 'p1', fecha: '2026-02-01', tipo: 'entrada', cantidad: 1, ...cambio },
        { id: 'reposición', productoId: 'p1', fecha: '2026-03-01', tipo: 'entrada', cantidad: 1, costoUnitario: 20 }
      ]
    };
    await importar(page, JSON.stringify({ flujo: { saldoInicial: 900 }, inventario }));
    expect(ultimoToast(toasts).textContent).toContain(motivo);
    expect(confirm).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(store.getAll()).toEqual(antes);
    expect(almacen.get(CLAVE)).toBe(JSON.stringify(guardado));
  });

  it('rechaza un archivo que supera el máximo y JSON corrupto', async () => {
    const { page, toasts } = await montar();
    await importar(page, '{}', { tamano: 6 * 1024 * 1024 });
    expect(ultimoToast(toasts).textContent).toContain('5 MB');
    await importar(page, '{no es json');
    expect(ultimoToast(toasts).textContent).toContain('JSON inválido');
  });

  it('si la escritura del respaldo falla conserva todos los módulos y el respaldo anterior', async () => {
    const guardado = { flujo: { saldoInicial: 12, periodoBase: '2024', movimientos: [] } };
    const { page, store, almacen, toasts, setItem } = await montar({ guardado, fallaEnEscritura: () => true });
    const previo = store.getAll();
    const cambio = vi.fn();
    store.subscribe(cambio);
    await importar(page, JSON.stringify({ presupuesto: { ingresoMensual: 700 }, flujo: { saldoInicial: 50 } }));
    expect(ultimoToast(toasts).textContent).toContain('cuota excedida');
    expect(ultimoToast(toasts).textContent).toContain('Se conservaron los datos anteriores');
    expect(store.getAll()).toEqual(previo);
    expect(almacen.get(CLAVE)).toBe(JSON.stringify(guardado));
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(cambio).not.toHaveBeenCalled();
  });

  it('un observador que falla después de guardar no revierte el respaldo ni impide las otras notificaciones', async () => {
    const { page, store, toasts, setItem } = await montar();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cambio = vi.fn();
    store.subscribe(() => { throw new Error('observador fallido'); });
    store.subscribe(cambio);
    await importar(page, JSON.stringify({ presupuesto: { ingresoMensual: 900 }, flujo: { saldoInicial: 50 } }));
    expect(store.get('presupuesto.ingresoMensual')).toBe(900);
    expect(store.get('flujo.saldoInicial')).toBe(50);
    expect(ultimoToast(toasts).textContent).toContain('importados correctamente');
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(cambio).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalled();
  });

  it('restaura escenarios desde un respaldo y rechaza referencias inválidas antes de escribir', async () => {
    const referencia = JSON.parse(readFileSync(new URL('./fixtures/caso_ficticio_referencia.json', import.meta.url), 'utf8'));
    const entradas = JSON.parse(readFileSync(new URL('../../propuesta-caso/referencia/inputs.json', import.meta.url), 'utf8'));
    const caso = duplicarEscenario(crearCasoComercial(null, referencia, entradas), 'escenario-copia');
    const { page, store, almacen, toasts, setItem, confirm, descargas } = await montar();
    await importar(page, JSON.stringify({ planeacion: caso }));
    expect(store.get('planeacion')).toEqual(caso);
    await clic(page, 'btnExportJSON');
    const respaldo = await descargas.at(-1).text();
    expect(JSON.parse(respaldo).planeacion).toEqual(caso);
    const antes = almacen.get(CLAVE);
    setItem.mockClear();
    confirm.mockClear();
    const invalido = JSON.parse(respaldo);
    invalido.planeacion.escenarios[0].baseId = 'sin-base';
    invalido.flujo.saldoInicial = 900;
    await importar(page, JSON.stringify(invalido));
    expect(ultimoToast(toasts).textContent).toContain('base histórica inexistente');
    expect(confirm).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(almacen.get(CLAVE)).toBe(antes);
    expect(store.get('flujo.saldoInicial')).toBeNull();

    const calendarioInvalido = JSON.parse(respaldo);
    calendarioInvalido.planeacion.escenarios[1].capitalTrabajo.cobrosCredito = [0.25, 0.25];
    calendarioInvalido.flujo.saldoInicial = 900;
    await importar(page, JSON.stringify(calendarioInvalido));
    expect(ultimoToast(toasts).textContent).toContain('que sumen 100 %');
    expect(confirm).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(almacen.get(CLAVE)).toBe(antes);

    const legado = { supuestos: ejemploPlaneacion() };
    await importar(page, JSON.stringify({ planeacion: legado }));
    expect(store.get('planeacion')).toEqual(legado);
    await importar(page, respaldo);
    expect(store.get('planeacion')).toEqual(caso);
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
      Servicios: 1000,
      'Devoluciones sobre ventas': 0, 'Descuentos sobre ventas': 0, 'Rebajas sobre ventas': 0,
      Insumos: 400, Administracion: 100, Publicidad: 50,
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
    },
    accountIdentities: {
      pasivos: {
        Prestamo: { idCuenta: 'bs.long_term_borrowings', estado: 'reconocida', metodo: 'contexto', candidatos: [], origen: 'importacion' }
      },
      patrimonio: {
        Aportes: { idCuenta: 'bs.additional_paid_in_capital', estado: 'reconocida', metodo: 'contexto', candidatos: [], origen: 'importacion' }
      },
      estadoResultados: {
        Servicios: { idCuenta: 'is.service_revenue', estado: 'reconocida', metodo: 'contexto', candidatos: [], origen: 'importacion' },
        Insumos: { idCuenta: 'is.service_cost', estado: 'reconocida', metodo: 'contexto', candidatos: [], origen: 'importacion' }
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
    // El documento anterior solo acredita dos identidades de resultados; el
    // motor no convierte las demás filas en identidades por su nombre.
    const razones = computeRazones('2023');
    expect(razones.MN).toBeNull();
    expect(razones.notAvailableReasons.some(m => m.campo === 'MN')).toBe(true);
    expect(store.get('analisis.resultados')).toEqual({});
    expect(page.querySelector('#dashboardContent').innerHTML).toMatch(/N\/D<\/div><div class="kpi-label">Utilidad Neta/);
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
