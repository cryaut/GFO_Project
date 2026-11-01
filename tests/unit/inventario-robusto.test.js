import { describe, expect, it } from 'vitest';
import { necesitaReposicion, TOLERANCIA_REPOSICION } from '../../js/utils/calculate.js';
import { descripcionReposicion } from '../../js/modules/inventario/inventario-calculations.js';

// Ronda 1 de Inventario (F7): regla única de reposición (D-082), valuación a
// costo promedio ponderado móvil (D-081), descartes visibles (D-083) y totales
// de existencia con una sola unidad (D-084). Los datos viven en este archivo:
// no se usa la demostración (ejemploInventario).

// Casos de frontera de la regla de reposición (T1, D-082).
describe('regla única de reposición (D-082)', () => {
  it('enteros: la existencia igual al mínimo da alerta', () => {
    expect(necesitaReposicion(40, 40)).toBe(true);
    expect(necesitaReposicion(35, 40)).toBe(true);
  });

  it('H1: decimales en el mínimo — 0.3 + 0.1 + 0.2 frente a 0.6 da alerta', () => {
    // La suma flotante da 0.6000000000000001: con la tolerancia 1e-6 cuenta como igualado.
    expect(necesitaReposicion(0.3 + 0.1 + 0.2, 0.6)).toBe(true);
    expect(TOLERANCIA_REPOSICION).toBe(1e-6);
  });

  it('debajo del mínimo da alerta y encima no', () => {
    expect(necesitaReposicion(4, 6)).toBe(true);
    expect(necesitaReposicion(6.001, 6)).toBe(false);
  });

  it('mínimo 0: sin política de reposición, no hay alerta', () => {
    expect(necesitaReposicion(0, 0)).toBe(false);
    expect(necesitaReposicion(5, 0)).toBe(false);
  });
});

// Productos y movimientos base de la matriz (sin costo en los movimientos: M0).
// Se definen en la sección de la matriz, más abajo.

describe('redacción única de la alerta (T2, D-082)', () => {
  it('faltante mayor que 0: «Bajo el mínimo» con cantidad y costo estimado', () => {
    const p = { nombre: 'Tornillo', unidad: 'unidades', reponer: true, faltante: 3, costoReposicion: 12.5 };
    expect(descripcionReposicion(p)).toBe('Bajo el mínimo: comprar al menos 3 unidades (costo estimado C$ 12.50) para volver al mínimo.');
  });

  it('faltante 0 (igual al mínimo): «Llegó al mínimo»', () => {
    const p = { nombre: 'Tornillo', unidad: 'unidades', reponer: true, faltante: 0, costoReposicion: 0 };
    expect(descripcionReposicion(p)).toBe('Llegó al mínimo: programe una compra.');
  });

  it('sin reposición devuelve cadena vacía', () => {
    expect(descripcionReposicion({ reponer: false })).toBe('');
  });
});
