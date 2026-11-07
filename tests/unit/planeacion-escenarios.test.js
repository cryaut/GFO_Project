import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cambiar, clic, element, enviar, mensaje } from './helpers/dom-falso.js';
import { ejemploPlaneacion } from '../../js/modules/planeacion/planeacion-calculations.js';

const referencia = JSON.parse(readFileSync(new URL('./fixtures/caso_ficticio_referencia.json', import.meta.url), 'utf8'));
const entradas = JSON.parse(readFileSync(new URL('../../propuesta-caso/referencia/inputs.json', import.meta.url), 'utf8'));
const CLAVE = 'gfo-toolkit-data';

async function montar(guardado = {}) {
  vi.resetModules();
  const page = element();
  const almacen = new Map([[CLAVE, JSON.stringify(guardado)]]);
  const escritura = vi.fn((clave, valor) => almacen.set(clave, valor));
  const descargar = vi.fn(async url => ({
    ok: true, json: async () => structuredClone(url.pathname.endsWith('/inputs.json') ? entradas : referencia)
  }));
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
    expect(descargar.mock.calls[1][0].pathname).toMatch(/propuesta-caso\/referencia\/inputs\.json$/);
    const inicial = store.get('planeacion');
    expect(inicial.bases).toHaveLength(1);
    expect(inicial.bases[0]).toMatchObject({
      empresa: 'Comercial Ejemplo, S.A. (ficticia)', fechaCorte: '2025-12-31',
      apertura: { saldoInicialCaja: 213000, cxcInicial: 28400, cxpInicial: 25000, inventarioInicial: 800, inventarioValor: 80000 }
    });
    expect(inicial.escenarios.find(e => e.nombre === 'Presupuesto anterior')).toMatchObject({ baseId: null, supuestos: { precio: 800 } });
    expect(page.innerHTML).toMatch(/id="plan-cxcInicial"[^>]*readonly[^>]*value="28400"/);
    expect(page.innerHTML).toMatch(/id="plan-cobrosApertura"[^>]*value="60 40"/);
    expect(page.innerHTML).toContain('Ventas y cobros');
    expect(page.innerHTML).toContain('2027-02');
    expect(page.innerHTML).not.toContain('id="planChart"');
    const baseId = store.get('planeacion.activoId');
    await clic(page, 'planVer-supuestos');
    await clic(page, 'planDuplicarEscenario');
    const copiaId = store.get('planeacion.activoId');
    expect(copiaId).not.toBe(baseId);
    await cambiar(page, 'planNombreEscenario', '<Tensión>', 'input');
    await cambiar(page, 'plan-precio', '235', 'input');
    await cambiar(page, 'planCostoCompra-0', '0', 'input');
    await cambiar(page, 'planCostoCompra-1', '', 'input');
    await cambiar(page, 'plan-cobrosCredito', '0 100', 'input');
    await enviar(page, 'formPlaneacion');
    store.load();
    initPlaneacion();
    const recuperado = store.get('planeacion');
    expect(recuperado.activoId).toBe(copiaId);
    expect(recuperado.bases).toEqual(inicial.bases);
    const base = recuperado.escenarios.find(e => e.id === baseId);
    const copia = recuperado.escenarios.find(e => e.id === copiaId);
    expect(base.supuestos.precio).toBe(220);
    expect(base.capitalTrabajo).toMatchObject({ costosCompra: entradas.proyeccion_2026.costo_compra_unitario, cobrosCredito: [0.5, 0.5] });
    expect(copia).toMatchObject({ origenId: baseId, nombre: '<Tensión>', baseId: base.baseId, supuestos: { precio: 235 } });
    expect(copia.capitalTrabajo.costosCompra.slice(0, 2)).toEqual([0, null]);
    expect(copia.capitalTrabajo.cobrosCredito).toEqual([0, 1]);
    expect(copia.supuestos).not.toHaveProperty('saldoInicialCaja');
    expect(page.innerHTML).toContain('&lt;Tensión&gt;');
    expect(page.innerHTML).not.toContain('<Tensión>');
    expect(page.innerHTML).toMatch(/id="plan-cobrosCredito"[^>]*value="0 100"/);
    await cambiar(page, 'planEscenario', baseId);
    expect(page.innerHTML).toMatch(/id="plan-precio"[^>]*value="220"/);
    await clic(page, 'planVer-supuestos');
    await clic(page, 'planCargarCaso');
    expect(store.get('planeacion.escenarios')).toHaveLength(3);
  });

  it('agrega la referencia nueva a un respaldo v1 y conserva el caso guardado anteriormente', async () => {
    const { crearCasoComercial } = await import('../../js/modules/planeacion/planeacion-escenarios.js');
    const anterior = crearCasoComercial(null, referencia, entradas);
    const escenario = anterior.escenarios[0];
    delete escenario.capitalTrabajo;
    escenario.id = anterior.activoId = 'comercial-ejemplo-base';
    escenario.nombre = 'Mi caso de la primera etapa';
    escenario.supuestos.precio = 333;
    escenario.supuestos.costoUnitario = 111;
    const { page, store, escritura } = await montar({ planeacion: anterior });
    expect(page.querySelector('#planGuardarBorrador')).not.toBeNull();
    expect(page.querySelector('#planCostoCompra-0')).toBeNull();
    expect(escritura).not.toHaveBeenCalled();
    await clic(page, 'planCargarCaso');
    expect(store.get('planeacion.bases')).toEqual(anterior.bases);
    expect(store.get('planeacion.escenarios')).toHaveLength(2);
    expect(store.get('planeacion.escenarios')[0]).toEqual(escenario);
    expect(page.innerHTML).toContain('Ventas y cobros');
    await cambiar(page, 'planEscenario', escenario.id);
    expect(page.innerHTML).toMatch(/id="plan-precio"[^>]*value="333"/);
  });

  it('muestra N/D para un calendario pendiente y mantiene disponibles las compras', async () => {
    const { page, store } = await montar();
    await clic(page, 'planCargarCaso');
    await clic(page, 'planVer-supuestos');
    await cambiar(page, 'plan-cobrosCredito', '', 'input');
    await enviar(page, 'formPlaneacion');
    expect(store.get('planeacion.escenarios')[0].capitalTrabajo.cobrosCredito).toBeNull();
    expect(page.innerHTML).toContain('<h3>Cobros pendientes</h3><p>N/D.');
    expect(page.innerHTML).toContain('<h3>Pagos pendientes</h3><div');
    const resumen = page.querySelector('#planResumen');
    expect(resumen.innerHTML).toContain('Hay resultados pendientes');
    expect(resumen.innerHTML).toContain('C$ 311,530.00');
    await clic(resumen, 'planTarjetaCxC');
    expect(resumen.querySelector('#planDetalleContenido').innerHTML).toContain('N/D.');
  });

  it('abre el resumen y permite consultar cobros, pagos y vencimientos sin atravesar las tablas', async () => {
    const { page, escritura } = await montar();
    await clic(page, 'planCargarCaso');
    escritura.mockClear();
    expect(page.innerHTML).toContain('Horizonte 2026-01 a 2026-12');
    expect(page.querySelector('#planVista-resumen').hidden).toBe(false);
    expect(page.querySelector('#planVista-supuestos').hidden).toBe(true);
    expect(page.querySelector('#planVista-tablas').hidden).toBe(true);
    const resumen = page.querySelector('#planResumen');
    const detalle = resumen.querySelector('#planDetalleContenido');
    expect(resumen.innerHTML).toContain('C$ 765,620.00');
    expect(detalle.innerHTML).toContain('C$ 73,040.00');

    await clic(resumen, 'planTarjetaPagos');
    await cambiar(resumen, 'planPeriodoConsulta', '0');
    expect(detalle.innerHTML).toContain('C$ 25,000.00');
    await clic(resumen, 'planTarjetaCxC');
    expect(resumen.querySelector('#planDetallePeriodo').hidden).toBe(true);
    expect(detalle.innerHTML).toContain('2027-02');
    expect(detalle.innerHTML).toContain('C$ 23,100.00');
    expect(resumen.querySelector('#planTarjetaCxC').getAttribute('aria-pressed')).toBe('true');

    await clic(page, 'planVer-tablas');
    expect(page.querySelector('#planVista-resumen').hidden).toBe(true);
    expect(page.querySelector('#planVista-tablas').hidden).toBe(false);
    await clic(page, 'planVer-resumen');
    expect(page.querySelector('#planResumen')).toBe(resumen);
    expect(detalle.innerHTML).toContain('2027-02');
    expect(escritura).not.toHaveBeenCalled();
  });

  it('conserva el borrador entre vistas y actualiza las cifras del resumen al guardar', async () => {
    const { page, store, escritura } = await montar();
    await clic(page, 'planCargarCaso');
    escritura.mockClear();
    await clic(page, 'planVer-supuestos');
    const precio = page.querySelector('#plan-precio');
    await cambiar(page, 'plan-precio', '235', 'input');
    await clic(page, 'planVer-resumen');
    expect(page.querySelector('#planBorradorPendiente').hidden).toBe(false);
    expect(page.querySelector('#planResumen').innerHTML).toContain('C$ 765,620.00');
    await clic(page, 'planVer-tablas');
    await clic(page, 'planVer-supuestos');
    expect(page.querySelector('#plan-precio')).toBe(precio);
    expect(precio.value).toBe('235');
    expect(escritura).not.toHaveBeenCalled();
    await enviar(page, 'formPlaneacion');
    expect(escritura).toHaveBeenCalledTimes(1);
    expect(store.get('planeacion.escenarios')[0].supuestos.precio).toBe(235);
    expect(page.querySelector('#planVista-resumen').hidden).toBe(false);
    expect(page.querySelector('#planResumen').innerHTML).toContain('C$ 815,885.00');
  });

  it('recupera los porcentajes y costos pequeños al guardar un escenario otra vez', async () => {
    const { page, store, initPlaneacion } = await montar();
    await clic(page, 'planCargarCaso');
    await cambiar(page, 'plan-pctContado', '12.3456789', 'input');
    await cambiar(page, 'planCostoCompra-6', '0.00000001', 'input');
    await cambiar(page, 'plan-cobrosCredito', '0.000001 99.999999', 'input');
    await enviar(page, 'formPlaneacion');
    const guardado = store.get('planeacion');
    expect(guardado.escenarios[0].supuestos.pctContado).toBeCloseTo(0.123456789, 12);
    expect(guardado.escenarios[0].capitalTrabajo.costosCompra[6]).toBe(1e-8);
    expect(guardado.escenarios[0].capitalTrabajo.cobrosCredito[0]).toBe(1e-8);
    store.load();
    initPlaneacion();
    await enviar(page, 'formPlaneacion');
    expect(mensaje(page, 'planMensaje')).toContain('Presupuesto parcial guardado');
    expect(store.get('planeacion')).toEqual(guardado);
  });

  it('distingue un monto inválido de un pendiente y conserva el borrador si falla la escritura', async () => {
    const { page, store, escritura, almacen } = await montar();
    await clic(page, 'planCargarCaso');
    const anterior = store.getAll();
    const persistido = almacen.get(CLAVE);
    escritura.mockClear();
    await cambiar(page, 'plan-precio', 'texto', 'input');
    await enviar(page, 'formPlaneacion');
    expect(mensaje(page, 'planMensaje')).toContain('requiere un número válido');
    expect(escritura).not.toHaveBeenCalled();
    await cambiar(page, 'plan-precio', '222', 'input');
    await cambiar(page, 'plan-pagosCredito', '60 60', 'input');
    await enviar(page, 'formPlaneacion');
    expect(mensaje(page, 'planMensaje')).toContain('que sumen 100 %');
    expect(escritura).not.toHaveBeenCalled();
    await cambiar(page, 'plan-pagosCredito', '0 100', 'input');
    escritura.mockImplementationOnce(() => { throw new Error('cuota excedida'); });
    await enviar(page, 'formPlaneacion');
    expect(mensaje(page, 'planMensaje')).toContain('cuota excedida');
    expect(store.getAll()).toEqual(anterior);
    expect(almacen.get(CLAVE)).toBe(persistido);
    await enviar(page, 'formPlaneacion');
    expect(store.get('planeacion.escenarios')[0].supuestos.precio).toBe(222);
    expect(store.get('planeacion.escenarios')[0].capitalTrabajo.pagosCredito).toEqual([0, 1]);
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
    const resultado = { presupuesto: null, motivoPresupuesto: expect.stringContaining('propia base histórica') };
    expect(reunirEntradas()).toMatchObject(resultado);
    const casoAnterior = structuredClone(store.get('planeacion'));
    delete casoAnterior.escenarios[0].capitalTrabajo;
    const escenarioCompleto = editarEscenario(casoAnterior, 'Base', normalizarSupuestos(ejemploPlaneacion()));
    store.setPersisted('planeacion', escenarioCompleto);
    expect(validarSupuestos(leerPlaneacion(escenarioCompleto).supuestos)).toEqual([]);
    expect(reunirEntradas()).toMatchObject(resultado);
  });
});
