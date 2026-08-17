import { describe, it, expect } from 'vitest';
import { depAnualLineaRecta, depAcumulada, valorEnLibros } from '../../js/utils/calculate.js';

describe('Depreciación Línea Recta (AC-4.2)', () => {
  it('Dep. anual = (Costo - Residual) / Vida Útil', () => {
    expect(depAnualLineaRecta(16000, 4000, 4)).toBe(3000);
    expect(depAnualLineaRecta(20000, 2000, 5)).toBe(3600);
  });

  it('Ejemplo computadora portátil del plan (AC-4.8)', () => {
    expect(depAnualLineaRecta(26000, 0, 4)).toBe(6500);
  });

  it('Vida útil 0 retorna 0', () => {
    expect(depAnualLineaRecta(10000, 0, 0)).toBe(0);
  });

  it('Costo igual a residual retorna 0', () => {
    expect(depAnualLineaRecta(5000, 5000, 5)).toBe(0);
  });
});

describe('Depreciación Acumulada (AC-4.3)', () => {
  it('Dep. acum. = dep. anual × años (no supera vida útil)', () => {
    expect(depAcumulada(3000, 2, 4)).toBe(6000);
  });

  it('Si años > vida útil, limita a vida útil', () => {
    expect(depAcumulada(3000, 10, 4)).toBe(12000);
  });

  it('0 años = 0 dep. acumulada', () => {
    expect(depAcumulada(3000, 0, 5)).toBe(0);
  });
});

describe('Valor en Libros (AC-4.4)', () => {
  it('Valor libros = Costo - Dep. acumulada', () => {
    expect(valorEnLibros(20000, 8000)).toBe(12000);
  });

  it('Sin depreciación = costo original', () => {
    expect(valorEnLibros(15000, 0)).toBe(15000);
  });

  it('Dep. total = costo = 0 libros', () => {
    expect(valorEnLibros(20000, 20000)).toBe(0);
  });
});

describe('Escenario completo depreciación', () => {
  it('Flujo completo: costo → dep anual → acum → libros', () => {
    const costo = 26000;
    const residual = 0;
    const vida = 4;
    const anios = 2;
    const anual = depAnualLineaRecta(costo, residual, vida);
    const acum = depAcumulada(anual, anios, vida);
    const libros = valorEnLibros(costo, acum);
    expect(anual).toBe(6500);
    expect(acum).toBe(13000);
    expect(libros).toBe(13000);
  });
});
