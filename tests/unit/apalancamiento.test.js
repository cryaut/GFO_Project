import { describe, it, expect } from 'vitest';
import {
  TASA_IR_DEFECTO, tasaEfectiva, tasaImpuesto, denominadorGaf,
  gao, gaf, gat, gaoVariacion, gafVariacion, gatVariacion
} from '../../js/utils/calculate.js';

// Casos resueltos a mano en docs/planificacion/apalancamiento/01-formulas-apalancamiento.md.
// Los esperados son fracciones exactas, no los valores redondeados del documento.

describe('Apalancamiento — caso A (estructura constante)', () => {
  // I = 50,000; T = 30 %; DAP = 7,000; OI = OG = 0. DAP / (1 − T) = 7,000 / 0.7 = 10,000.
  it('periodo 1: GAO, GAF y GAT estructurales', () => {
    // MC = 1,000,000 − 600,000 = 400,000; UAII = 400,000 − 250,000 = 150,000; UAI = 150,000 − 50,000 = 100,000
    expect(gao(400000, 150000)).toBeCloseTo(8 / 3, 6);          // 400,000 / 150,000
    expect(gaf(150000, 100000, 7000, 0.3)).toBeCloseTo(5 / 3, 6); // 150,000 / (100,000 − 10,000)
    expect(gat(400000, 100000, 7000, 0.3)).toBeCloseTo(40 / 9, 6); // 400,000 / 90,000
  });

  it('periodo 2: GAO, GAF y GAT estructurales', () => {
    // MC = 1,100,000 − 660,000 = 440,000; UAII = 440,000 − 250,000 = 190,000; UAI = 140,000
    expect(gao(440000, 190000)).toBeCloseTo(44 / 19, 6);
    expect(gaf(190000, 140000, 7000, 0.3)).toBeCloseTo(19 / 13, 6); // 190,000 / 130,000
    expect(gat(440000, 140000, 7000, 0.3)).toBeCloseTo(44 / 13, 6); // 440,000 / 130,000
  });

  it('por variación coincide con el estructural del periodo 1', () => {
    // %ΔVentas = 10 %; %ΔUAII = 40,000 / 150,000 = 26.67 %; UDAC = UN − DAP: 63,000 → 91,000, %ΔUDAC = 44.44 %
    expect(gaoVariacion(1000000, 1100000, 150000, 190000)).toBeCloseTo(8 / 3, 6);
    expect(gafVariacion(150000, 190000, 63000, 91000)).toBeCloseTo(5 / 3, 6);
    expect(gatVariacion(1000000, 1100000, 63000, 91000)).toBeCloseTo(40 / 9, 6);
  });

  it('GAT = GAO × GAF', () => {
    expect(gat(400000, 100000, 7000, 0.3))
      .toBeCloseTo(gao(400000, 150000) * gaf(150000, 100000, 7000, 0.3), 6);
  });
});

describe('Apalancamiento — caso B (casos especiales)', () => {
  it('UAII = 0 da N/D', () => {
    // Ventas 500,000; CV 300,000; CF 200,000 → MC 200,000; UAII 0
    expect(gao(200000, 0)).toBeNull();
  });

  it('UAII negativa devuelve el valor (la interfaz advierte, D-008)', () => {
    // Ventas 400,000; CV 240,000; CF 200,000 → MC 160,000; UAII −40,000; GAO = 160,000 / −40,000
    expect(gao(160000, -40000)).toBe(-4);
  });

  it('denominador del GAF igual a 0 da N/D en GAF y GAT', () => {
    // UAII 100,000; I 90,000 → UAI 10,000; DAP / (1 − T) = 7,000 / 0.7 = 10,000; 10,000 − 10,000 = 0
    expect(gaf(100000, 10000, 7000, 0.3)).toBeNull();
    expect(gat(300000, 10000, 7000, 0.3)).toBeNull();
  });

  it('denominador casi 0 (menos de medio centavo) también es N/D', () => {
    expect(gao(1000, 0.004)).toBeNull();
    expect(gaf(1000, -0.001)).toBeNull();
  });

  it('ventas iguales en los dos periodos dan N/D por variación', () => {
    expect(gaoVariacion(1000000, 1000000, 150000, 190000)).toBeNull();
    expect(gatVariacion(1000000, 1000000, 63000, 91000)).toBeNull();
  });

  it('UAII iguales dan N/D en el GAF por variación', () => {
    expect(gafVariacion(150000, 150000, 63000, 91000)).toBeNull();
  });

  it('una base ≤ 0 da N/D por variación', () => {
    // UAII del periodo base negativa
    expect(gaoVariacion(1000000, 1100000, -50000, 10000)).toBeNull();
    expect(gafVariacion(-50000, 10000, 63000, 91000)).toBeNull();
    // Ventas base 0 y UDAC base negativa
    expect(gaoVariacion(0, 1100000, 150000, 190000)).toBeNull();
    expect(gatVariacion(1000000, 1100000, -1000, 91000)).toBeNull();
  });
});

describe('Apalancamiento — caso C (MUNO MODA 2023–2024)', () => {
  // UAII 2023 = 850,000 − 510,000 − 120,000 − 85,000 = 135,000; 2024 = 155,000
  it('GAO estructural según la clasificación de gastos de ventas', () => {
    expect(gao(340000, 135000)).toBeCloseTo(2.518519, 6); // gastos de ventas fijos: MC = 850,000 − 510,000
    expect(gao(255000, 135000)).toBeCloseTo(1.888889, 6); // variables: MC = 850,000 − 595,000
  });

  it('GAO por variación', () => {
    // %ΔUAII = 20,000 / 135,000 = 14.81 %; %ΔVentas = 70,000 / 850,000 = 8.24 %
    expect(gaoVariacion(850000, 920000, 135000, 155000)).toBeCloseTo(1.798942, 6);
  });

  it('GAF con otros ingresos y otros gastos (D-007)', () => {
    // UAI = 135,000 + 15,000 − 10,000 = 140,000; sin intereses ni DAP
    expect(gaf(135000, 140000)).toBeCloseTo(0.964286, 6);
  });
});

describe('Apalancamiento — tasa de impuesto', () => {
  it('la tasa por defecto es 30 %', () => {
    expect(TASA_IR_DEFECTO).toBe(0.3);
  });

  it('usa la tasa efectiva cuando tiene sentido', () => {
    expect(tasaImpuesto(30000, 100000)).toBeCloseTo(0.3, 6); // 30,000 / 100,000
    expect(tasaImpuesto(25000, 100000, 0.1)).toBeCloseTo(0.25, 6);
    expect(tasaImpuesto(0, 100000)).toBe(0); // IR informado en 0
  });

  it('usa la tasa por defecto si la efectiva no sirve', () => {
    expect(tasaImpuesto(5000, -10000)).toBe(0.3);  // UAI ≤ 0
    expect(tasaImpuesto(5000, 0)).toBe(0.3);
    expect(tasaImpuesto(null, 100000)).toBe(0.3);  // sin cuenta de impuestos
    expect(tasaImpuesto(120000, 100000)).toBe(0.3); // 1.2, fuera de [0, 1)
    expect(tasaImpuesto(-5000, 100000)).toBe(0.3); // −0.05, fuera de [0, 1)
    expect(tasaImpuesto(null, 100000, 0.15)).toBe(0.15);
  });

  it('da N/D si la tasa por defecto es inválida y no hay efectiva', () => {
    expect(tasaImpuesto(null, 100000, 1.5)).toBeNull();
    expect(tasaImpuesto(null, 100000, 1)).toBeNull();
    expect(tasaImpuesto(null, 100000, -0.1)).toBeNull();
    expect(tasaImpuesto(null, 100000, null)).toBeNull();
    // Con tasa efectiva válida, la por defecto no se usa
    expect(tasaImpuesto(30000, 100000, 1.5)).toBeCloseTo(0.3, 6);
  });

  it('tasaEfectiva devuelve null si no se puede calcular', () => {
    expect(tasaEfectiva(30000, 100000)).toBeCloseTo(0.3, 6);
    expect(tasaEfectiva(null, 100000)).toBeNull();
    expect(tasaEfectiva(30000, 0)).toBeNull();
    expect(tasaEfectiva(120000, 100000)).toBeNull();
  });
});

describe('Apalancamiento — denominador del GAF', () => {
  it('es UAI − DAP / (1 − T), o la UAI si no hay DAP', () => {
    expect(denominadorGaf(100000, 7000, 0.3)).toBeCloseTo(90000, 6);
    expect(denominadorGaf(100000)).toBe(100000);
    expect(denominadorGaf(100000, 0, null)).toBe(100000); // T solo se valida con DAP > 0
    expect(denominadorGaf(-20000)).toBe(-20000);          // negativo: se devuelve (D-008)
  });

  it('valida DAP y T', () => {
    expect(denominadorGaf(100000, -1, 0.3)).toBeNull();
    expect(denominadorGaf(100000, 7000, 1)).toBeNull();
    expect(denominadorGaf(100000, 7000, null)).toBeNull();
    expect(denominadorGaf(100000, 7000, -0.1)).toBeNull();
  });
});

describe('Apalancamiento — datos faltantes', () => {
  const faltantes = [null, undefined, NaN, Infinity, '100'];

  it.each(faltantes)('gao, gaf y gat dan N/D con %s', valor => {
    expect(gao(valor, 150000)).toBeNull();
    expect(gao(400000, valor)).toBeNull();
    expect(gaf(valor, 100000)).toBeNull();
    expect(gaf(150000, valor)).toBeNull();
    expect(gat(valor, 100000)).toBeNull();
    expect(gat(400000, valor)).toBeNull();
  });

  it.each(faltantes)('las funciones por variación dan N/D con %s', valor => {
    expect(gaoVariacion(valor, 1100000, 150000, 190000)).toBeNull();
    expect(gaoVariacion(1000000, 1100000, 150000, valor)).toBeNull();
    expect(gafVariacion(150000, 190000, valor, 91000)).toBeNull();
    expect(gatVariacion(1000000, valor, 63000, 91000)).toBeNull();
  });

  it('DAP o T explícitamente null dan N/D cuando hacen falta', () => {
    expect(gaf(150000, 100000, null)).toBeNull();
    expect(gaf(150000, 100000, 7000)).toBeNull(); // DAP > 0 sin T
    expect(gat(400000, 100000, 7000, 1)).toBeNull();
    expect(gaf(150000, 100000, -1, 0.3)).toBeNull();
  });
});
