import { describe, it, expect } from 'vitest';
import { ahorroMensual, saldoSemanal } from '../../js/utils/calculate.js';

describe('Presupuesto - Cálculos (AC-1.x)', () => {
  it('AC-1.2: Ahorro mensual = Meta ÷ Meses', () => {
    expect(ahorroMensual(12000, 12)).toBe(1000);
    expect(ahorroMensual(6000, 6)).toBe(1000);
    expect(ahorroMensual(10000, 4)).toBe(2500);
  });

  it('Meses 0 o negativos retorna meta completa', () => {
    expect(ahorroMensual(12000, 0)).toBe(12000);
    expect(ahorroMensual(12000, -3)).toBe(12000);
  });

  it('AC-1.4: Saldo semanal = Ingreso - Gastos - Ahorro - Reserva', () => {
    expect(saldoSemanal(5000, 3000, 1000, 500)).toBe(500);
    expect(saldoSemanal(5000, 3000, 1000, 0)).toBe(1000);
  });

  it('Saldo sin reserva', () => {
    expect(saldoSemanal(8000, 5000, 2000)).toBe(1000);
  });

  it('Saldo negativo indica exceso de gastos', () => {
    expect(saldoSemanal(3000, 2500, 1000, 0)).toBe(-500);
  });
});

describe('Presupuesto - Validación balance', () => {
  function validarBalance(ingreso, gastos, ahorro, reserva) {
    const total = gastos.reduce((s, g) => s + g.monto, 0) + ahorro + (reserva || 0);
    return Math.abs(total - ingreso) < 0.01;
  }

  it('Balance válido cuando gastos+ahorro = ingreso', () => {
    expect(validarBalance(5000, [{ monto: 3500 }], 1500, 0)).toBe(true);
  });

  it('Balance inválido cuando no cuadra', () => {
    expect(validarBalance(5000, [{ monto: 2000 }], 1500, 0)).toBe(false);
  });
});

describe('Presupuesto - Distribución', () => {
  function distribucion(gastos) {
    const cats = { necesidad: 0, deseo: 0, imprevisto: 0, meta: 0 };
    for (const g of gastos) cats[g.categoria] = (cats[g.categoria] || 0) + g.monto;
    return cats;
  }

  it('Distribuye correctamente por categoría', () => {
    const gastos = [
      { categoria: 'necesidad', monto: 1500 },
      { categoria: 'deseo', monto: 800 },
      { categoria: 'imprevisto', monto: 200 },
      { categoria: 'meta', monto: 500 }
    ];
    const d = distribucion(gastos);
    expect(d.necesidad).toBe(1500);
    expect(d.deseo).toBe(800);
    expect(d.imprevisto).toBe(200);
    expect(d.meta).toBe(500);
  });
});
