import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
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
