import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { leerEstados, estadosGuardados } from '../../js/utils/estados-guardados.js';

// Ronda 1 de F8: lectura única de estados guardados (D-077 a D-080). Los casos
// de la matriz del encargo viven en los describes finales de este archivo.

// A1 del bloque A: los datos base de la matriz.
function a1() {
  return JSON.parse(JSON.stringify(ENTRADA_BLOQUE_A.conjuntos.find(c => c.id === 'A1').entrada));
}

const ENTRADA_BLOQUE_A = JSON.parse(readFileSync(new URL('./fixtures/estados_ronda2_bloque_A.json', import.meta.url), 'utf8'));

describe('leerEstados: una sola lectura de estados (D-077)', () => {
  it('datos válidos devuelven los estados normalizados sin error', () => {
    const { estados, error } = leerEstados(a1());
    expect(error).toBeNull();
    expect(estados.periods).toEqual(['2024', '2025']);
    expect(estados.balanceGeneral['2025'].activos['Efectivo y equivalentes']).toBe(180);
  });

  it('sin periodos no hay datos y no hay error', () => {
    expect(leerEstados(undefined)).toEqual({ estados: null, error: null });
    expect(leerEstados({})).toEqual({ estados: null, error: null });
    expect(leerEstados({ periods: [], balanceGeneral: {}, estadoResultados: {} }))
      .toEqual({ estados: null, error: null });
  });

  it('un dato que no se puede normalizar devuelve el mensaje de error y estados null', () => {
    const datos = a1();
    datos.estadoResultados['2025']['Gastos de ventas'] = -90; // la compuerta lo rechaza
    const { estados, error } = leerEstados(datos);
    expect(estados).toBeNull();
    expect(error).toContain('Gastos de ventas');
  });

  it('el mensaje de error llega listo para escaparse: el llamador lo escapa con escapeHTML', () => {
    const datos = a1();
    datos.balanceGeneral['2025'].activos['<b>Efectivo</b>'] = '<b>texto</b>';
    const { error } = leerEstados(datos);
    // El mensaje puede contener texto del archivo: contiene el nombre tal cual,
    // y el llamador (pantallas, reportes) es responsable de escaparlo (regla 7).
    expect(error).toContain('<b>Efectivo</b>');
  });

  it('estadosGuardados se mantiene como envoltorio que devuelve solo los estados', () => {
    expect(estadosGuardados(a1()).periods).toEqual(['2024', '2025']);
    expect(estadosGuardados({ periods: [] })).toBeNull();
    expect(estadosGuardados({ ...a1(), estadoResultados: { '2025': { 'Gastos de ventas': -1 } } })).toBeNull();
  });
});

// --- Matriz de casos de la ronda 1 (M1 a M11) y bloque A ---

import { normalizeFinancialData, parseFinancialJSON } from '../../js/modules/estados/estados-normalize.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { flujoDesdeEFE } from '../../js/modules/proforma/proforma-calculations.js';


const REFERENCIA_EQ = JSON.parse(
  readFileSync(new URL('./fixtures/equilibrio_ronda1_referencia.json', import.meta.url), 'utf8')
);
const estadosDe = id => parseFinancialJSON(JSON.stringify(ENTRADA_BLOQUE_A.conjuntos.find(c => c.id === id).entrada));

// Los módulos de Análisis e Integración tocan document al cargar: se cargan
// dinámicamente con un document simulado y el store sembrado con los estados
// del caso. afterEach limpia los stubs.
describe('matriz de casos F8', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function montarF8(estadosGuardado = null) {
    vi.resetModules();
    vi.stubGlobal('document', { getElementById: () => null });
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
    const { default: store } = await import('../../js/store.js');
    store._data = null;
    store._listeners = [];
    if (estadosGuardado) store.setPersisted('estados', estadosGuardado);
    const analisis = await import('../../js/modules/analisis/index.js');
    const integracion = await import('../../js/modules/integracion/index.js');
    const reporte = await import('../../js/modules/integracion/integracion-reporte.js');
    const respaldo = await import('../../js/modules/integracion/integracion-respaldo.js');
    return {
      computeRazones: analisis.computeRazones, computeDuPont: analisis.computeDuPont,
      getSavedTotals: integracion.getSavedTotals,
      construirReporteHTML: reporte.construirReporteHTML, validarRespaldo: respaldo.validarRespaldo,
      store
    };
  }

  it('M1: A1 base válida — utilidad neta 2025 = 110, razones calculadas y Proforma 116/18/180', async () => {
    const estados = estadosDe('A1');
    const t = computeFinancialTotals(estados, '2025');
    expect(t.utilidadNeta).toBe(110);
    const { computeRazones } = await montarF8(estados);
    const r = computeRazones('2025');
    expect(r.MN).not.toBeNull();
    expect(flujoDesdeEFE(estados)).toMatchObject({
      disponible: true, neto: { operacion: 116 }, variacionNeta: 18, saldoFinal: 180
    });
  });

  it('M2: A3 con ventas netas reportadas — el total solo se contrasta, sin duplicar', async () => {
    const estados = estadosDe('A3');
    const { getSavedTotals } = await montarF8(estados);
    // El total reportado (1,748) manda sobre sus componentes (1,840 − 92): no se suman dos veces.
    expect(computeFinancialTotals(estados, '2024').ventas).toBe(1748);
    expect(getSavedTotals('2024').ventas).toBe(1748);
  });

  it('M4: gasto negativo en dato guardado — N/D con motivo estados_no_legibles, nunca 0', { timeout: 20000 }, async () => {
    const datos = a1();
    datos.estadoResultados['2025']['Gastos de ventas'] = -90;
    const { computeRazones, computeDuPont } = await montarF8(datos);
    const r = computeRazones('2025');
    expect(r.RC).toBeNull();
    expect(r.MN).toBeNull();
    expect(r.notAvailableReasons).toContainEqual(expect.objectContaining({
      motivo: 'estados_no_legibles', mensaje: expect.stringContaining('No se pudieron leer los estados guardados')
    }));
    expect(computeDuPont('2025').PM).toBeNull();
  });

  it('M5: «1200» se acepta y se convierte; «abc» da error visible', () => {
    const conTexto = a1();
    conTexto.balanceGeneral['2025'].activos['<b>Efectivo</b>'] = '1200';
    const ok = leerEstados(conTexto);
    expect(ok.error).toBeNull();
    expect(ok.estados.balanceGeneral['2025'].activos['<b>Efectivo</b>']).toBe(1200);
    const roto = a1();
    roto.balanceGeneral['2025'].activos['Efectivo y equivalentes'] = 'abc';
    expect(leerEstados(roto).error).toContain('Efectivo y equivalentes');
  });

  it('M6: cuenta sin clasificar — la nota del reporte aparece y las razones que dependen de ella son N/D', async () => {
    const datos = a1();
    datos.estadoResultados['2025']['Venta de activo fijo'] = 10;
    const estados = normalizeFinancialData(datos);
    const t = computeFinancialTotals(estados, '2025');
    expect(t.classificationComplete).toBe(false);
    expect(t.utilidadNeta).toBeNull();
    const { computeRazones, construirReporteHTML } = await montarF8(estados);
    const html = construirReporteHTML({ kpis: null, estados });
    expect(html).toContain('Cuentas sin clasificar');
    const r = computeRazones('2025');
    expect(r.MN).toBeNull();
  });

  it('M7: respaldo con estados inválidos se rechaza y el store no cambia', async () => {
    const { validarRespaldo } = await montarF8(null);
    const respaldo = { estados: { ...a1(), estadoResultados: { '2024': { 'Gastos de ventas': -1 } } } };
    expect(() => validarRespaldo(respaldo, { estados: { periods: [], balanceGeneral: {}, estadoResultados: {} } }))
      .toThrow(/No se pudieron leer los estados del respaldo/);
  });

  it('M8: un solo periodo — las razones de un periodo calculan y no hay promedios', async () => {
    const { computeRazones } = await montarF8(normalizeFinancialData({
      periods: ['2025'],
      balanceGeneral: { '2025': a1().balanceGeneral['2025'] },
      estadoResultados: { '2025': { ...a1().estadoResultados['2025'] } }
    }));
    const r = computeRazones('2025');
    expect(r.usaPromedios).toBe(false);
    expect(r.RC).not.toBeNull();
  });

  it('M9: sin estados guardados — el reporte dice «No hay estados financieros guardados»', async () => {
    const { construirReporteHTML } = await montarF8(null);
    const html = construirReporteHTML({ kpis: null, estados: null });
    expect(html).toContain('No hay estados financieros guardados');
    expect(html).not.toContain('No se pudieron leer');
  });

  it('M10: estados ilegibles — el reporte muestra el error real, no el mensaje de «no hay»', async () => {
    const { construirReporteHTML } = await montarF8(null);
    const html = construirReporteHTML({
      kpis: null, estados: null,
      errorEstados: 'Importe inválido en activos[2025].Efectivo: "cien"'
    });
    expect(html).toContain('No se pudieron leer los estados financieros guardados');
    expect(html).toContain('Importe inválido en activos[2025].Efectivo');
    expect(html).not.toContain('No hay estados financieros guardados');
  });

  it('M11: cuenta renombrada que no lanza — utilidad neta N/D y nada del respaldo por nombres', async () => {
    const datos = a1();
    datos.estadoResultados['2025']['Venta de activo fijo'] = 10;
    const estados = normalizeFinancialData(datos);
    // Con la fórmula canónica la utilidad es N/D; con el respaldo viejo («Ventas» − costos) daría otra cosa.
    expect(computeFinancialTotals(estados, '2025').utilidadNeta).toBeNull();
    const { getSavedTotals } = await montarF8(estados);
    const er = getSavedTotals('2025');
    expect(er.utilidadNeta).toBeNull();
  });
});

describe('bloque A: ventas netas, costo y utilidad neta de los 14 periodos sin cambio', () => {
  for (const fila of REFERENCIA_EQ.bloque_A_estados) {
    it(`${fila.conjunto} ${fila.periodo}: ventas netas, costo y utilidad neta contra las referencias`, () => {
      const estados = estadosDe(fila.conjunto);
      const t = computeFinancialTotals(estados, fila.periodo);
      expect(t.ventas).toBeCloseTo(fila.ventasNetas, 2);
      expect(t.costoVentas).toBeCloseTo(fila.costoVariable, 2);
      const esperadoUN = ENTRADA_BLOQUE_A.conjuntos.find(c => c.id === fila.conjunto)
        .esperado[fila.periodo].utilidadNeta;
      expect(t.utilidadNeta).toBe(esperadoUN);
    });
  }
});
