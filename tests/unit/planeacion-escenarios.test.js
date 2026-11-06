import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cambiar, clic, element, mensaje } from './helpers/dom-falso.js';
import { ejemploPlaneacion } from '../../js/modules/planeacion/planeacion-calculations.js';

const referencia = JSON.parse(readFileSync(new URL('./fixtures/caso_ficticio_referencia.json', import.meta.url), 'utf8'));
const CLAVE = 'gfo-toolkit-data';

async function montar(guardado = {}) {
  vi.resetModules();
  const page = element();
  const almacen = new Map([[CLAVE, JSON.stringify(guardado)]]);
  const escritura = vi.fn((clave, valor) => almacen.set(clave, valor));
  const descargar = vi.fn(async () => ({ ok: true, json: async () => structuredClone(referencia) }));
  vi.stubGlobal('document', { getElementById: id => (id === 'page-planeacion' ? page : null) });
  vi.stubGlobal('window', { confirm: vi.fn(() => true) });
  vi.stubGlobal('localStorage', { getItem: clave => almacen.get(clave) ?? null, setItem: escritura });
  vi.stubGlobal('fetch', descargar);
  const { default: store } = await import('../../js/store.js');
  const { initPlaneacion } = await import('../../js/modules/planeacion/index.js');
  initPlaneacion();
  return { page, store, initPlaneacion, escritura, almacen, descargar };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Planeación con la referencia de Comercial Ejemplo', () => {
  it('carga la base de 2025, conserva el presupuesto anterior y recupera una copia independiente', async () => {
    const { page, store, initPlaneacion, descargar } = await montar({ planeacion: { supuestos: ejemploPlaneacion() } });
    await clic(page, 'planCargarCaso');
    expect(descargar.mock.calls[0][0].pathname).toMatch(/propuesta-caso\/referencia\/referencia_resultados\.json$/);
    const inicial = store.get('planeacion');
    expect(inicial.bases).toHaveLength(1);
    expect(inicial.bases[0]).toMatchObject({
      empresa: 'Comercial Ejemplo, S.A. (ficticia)', fechaCorte: '2025-12-31',
      apertura: { saldoInicialCaja: 213000, cxcInicial: 28400, cxpInicial: 25000, inventarioInicial: 800, inventarioValor: 80000 }
    });
    expect(inicial.escenarios.find(e => e.nombre === 'Presupuesto anterior')).toMatchObject({ baseId: null, supuestos: { precio: 800 } });
    expect(page.innerHTML).toMatch(/id="plan-saldoInicialCaja"[^>]*readonly[^>]*value="213000"/);
    await cambiar(page, 'plan-precio', '220', 'input');
    await cambiar(page, 'planOtros-0', '0', 'input');
    await clic(page, 'planGuardarBorrador');
    const baseId = store.get('planeacion.activoId');
    await clic(page, 'planDuplicarEscenario');
    const copiaId = store.get('planeacion.activoId');
    expect(copiaId).not.toBe(baseId);
    await cambiar(page, 'planNombreEscenario', '<Tensión>', 'input');
    await cambiar(page, 'plan-precio', '235', 'input');
    await clic(page, 'planGuardarBorrador');
    store.load();
    initPlaneacion();
    const recuperado = store.get('planeacion');
    expect(recuperado.activoId).toBe(copiaId);
    expect(recuperado.bases).toEqual(inicial.bases);
    const base = recuperado.escenarios.find(e => e.id === baseId);
    const copia = recuperado.escenarios.find(e => e.id === copiaId);
    expect(base.supuestos.precio).toBe(220);
    expect(copia).toMatchObject({ origenId: baseId, nombre: '<Tensión>', baseId: base.baseId, supuestos: { precio: 235 } });
    expect(copia.supuestos.otrosDesembolsos.slice(0, 2)).toEqual([0, null]);
    expect(copia.supuestos).not.toHaveProperty('saldoInicialCaja');
    expect(page.innerHTML).toContain('&lt;Tensión&gt;');
    expect(page.innerHTML).not.toContain('<Tensión>');
    await cambiar(page, 'planEscenario', baseId);
    expect(page.innerHTML).toMatch(/id="plan-precio"[^>]*value="220"/);
    await clic(page, 'planCargarCaso');
    expect(store.get('planeacion.escenarios')).toHaveLength(3);
  });

  it('distingue un monto inválido de un pendiente y conserva el borrador si falla la escritura', async () => {
    const { page, store, escritura, almacen } = await montar();
    await clic(page, 'planCargarCaso');
    const anterior = store.getAll();
    const persistido = almacen.get(CLAVE);
    escritura.mockClear();
    await cambiar(page, 'plan-precio', 'texto', 'input');
    await clic(page, 'planGuardarBorrador');
    expect(mensaje(page, 'planMensaje')).toContain('requiere un número válido');
    expect(escritura).not.toHaveBeenCalled();
    await cambiar(page, 'plan-precio', '222', 'input');
    escritura.mockImplementationOnce(() => { throw new Error('cuota excedida'); });
    await clic(page, 'planGuardarBorrador');
    expect(mensaje(page, 'planMensaje')).toContain('cuota excedida');
    expect(store.getAll()).toEqual(anterior);
    expect(almacen.get(CLAVE)).toBe(persistido);
    await clic(page, 'planGuardarBorrador');
    expect(store.get('planeacion.escenarios')[0].supuestos.precio).toBe(222);
  });

  it('conserva los datos si falta el archivo de referencia', async () => {
    const { page, store, descargar, escritura } = await montar({ planeacion: { supuestos: ejemploPlaneacion() } });
    descargar.mockResolvedValueOnce({ ok: false });
    await clic(page, 'planCargarCaso');
    expect(mensaje(page, 'planMensaje')).toContain('archivo de referencia');
    expect(escritura).not.toHaveBeenCalled();
    expect(store.get('planeacion.supuestos.precio')).toBe(800);
  });

  it('impide que la carga atrasada reemplace Planeación restaurada desde otra pantalla', async () => {
    const { page, store, descargar } = await montar();
    let resolver;
    descargar.mockReturnValueOnce(new Promise(resolve => { resolver = resolve; }));
    const carga = clic(page, 'planCargarCaso');
    const restaurado = { supuestos: { ...ejemploPlaneacion(), precio: 123 } };
    store.setPersisted('planeacion', restaurado);
    resolver({ ok: true, json: async () => referencia });
    await carga;
    expect(store.get('planeacion')).toEqual(restaurado);
    expect(mensaje(page, 'planMensaje')).toContain('Planeación cambió');
  });

  it('muestra el motivo si un escenario guardado referencia una base inexistente', async () => {
    const { page, store, initPlaneacion, escritura } = await montar();
    await clic(page, 'planCargarCaso');
    const danado = { ...store.get('planeacion'), bases: [] };
    store.setPersisted('planeacion', danado);
    escritura.mockClear();
    initPlaneacion();
    expect(page.innerHTML).toContain('base histórica inexistente');
    expect(page.innerHTML).toContain('Restaure un respaldo válido');
    expect(escritura).not.toHaveBeenCalled();
  });

  it('aísla el presupuesto del caso de los estados generales de Proforma', async () => {
    const { page, store } = await montar();
    await clic(page, 'planCargarCaso');
    const { editarEscenario, leerPlaneacion } = await import('../../js/modules/planeacion/planeacion-escenarios.js');
    const { normalizarSupuestos, validarSupuestos } = await import('../../js/modules/planeacion/planeacion-calculations.js');
    const { reunirEntradas } = await import('../../js/modules/proforma/index.js');
    const escenarioCompleto = editarEscenario(store.get('planeacion'), 'Base', normalizarSupuestos(ejemploPlaneacion()));
    store.setPersisted('planeacion', escenarioCompleto);
    expect(validarSupuestos(leerPlaneacion(escenarioCompleto).supuestos)).toEqual([]);
    expect(reunirEntradas()).toMatchObject({ presupuesto: null, motivoPresupuesto: expect.stringContaining('propia base histórica') });
  });
});
