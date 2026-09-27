import { describe, expect, it } from 'vitest';
import * as calculate from '../../js/utils/calculate.js';

const { DIAS_ANIO, rotacionCxP, plazoPago, edadInventario, cicloConversion } = calculate;

describe('razones de actividad unificadas', () => {
  it('rotación de CxP = costo de ventas / CxP promedio', () => {
    expect(rotacionCxP(400, 50)).toBe(8);
    expect(rotacionCxP(400, 0)).toBeNull();
    expect(rotacionCxP(400, undefined)).toBeNull();
  });

  it('edad del inventario = DIAS_ANIO / rotación de inventario', () => {
    expect(edadInventario(4)).toBeCloseTo(DIAS_ANIO / 4, 6); // 91.25 días
    expect(edadInventario(0)).toBeNull();
    expect(edadInventario(null)).toBeNull();
  });

  it('el ciclo de conversión es plazo de cobro + edad del inventario − plazo de pago', () => {
    expect(cicloConversion(36.5, 4, 8)).toBeCloseTo(36.5 + edadInventario(4) - plazoPago(8), 6);
    expect(cicloConversion(36.5, 4, 8)).toBeCloseTo(82.125, 6);
    expect(cicloConversion(36.5, 4, 0)).toBeNull();
    expect(cicloConversion(36.5, 0, 8)).toBeNull();
  });
});

describe('una función por concepto', () => {
  // Al unir las ramas de Cris y Henry quedaron dos funciones para el mismo concepto.
  // Se conservó una. Si una rama vieja reintroduce el nombre de la izquierda, usa
  // la función de la derecha en su lugar.
  const reemplazos = {
    rotacionActivosTotales: 'rotacionActivos',
    periodoPromedioPago: 'plazoPago',
    cicloConversionEfectivo: 'cicloConversion',
    razonDeudaPatrimonio: 'deudaPatrimonio',
    rotacionPasivos: 'rotacionCxP'
  };

  it.each(Object.entries(reemplazos))('%s fue reemplazada por %s', (anterior, actual) => {
    expect(calculate[anterior]).toBeUndefined();
    expect(calculate[actual]).toBeTypeOf('function');
  });
});
