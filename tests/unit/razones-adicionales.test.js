import { describe, it, expect } from 'vitest';
import {
  pruebaDefensiva, rotacionActivos, rotacionCxP, plazoPago,
  cicloConversion, coberturaIntereses, deudaPatrimonio, apalancamiento,
  margenBruto, margenOperativo, roe,
  rotacionActivosFijos, rotacionCapitalTrabajo, solvencia
} from '../../js/utils/calculate.js';

describe('razones adicionales', () => {
  it('cobertura de intereses y márgenes con denominador válido', () => {
    expect(coberturaIntereses(500, 100)).toBe(5);
    expect(margenBruto(200, 500)).toBe(0.4);
    expect(margenOperativo(200, 40, 30, 500)).toBe(0.26);
    expect(roe(50000, 200000)).toBe(0.25);
  });

  it('rotaciones, plazos y ciclo de conversión', () => {
    expect(rotacionActivos(850000, 400000)).toBeCloseTo(2.125, 6);
    expect(rotacionCxP(510000, 85000)).toBe(6);
    expect(plazoPago(6)).toBe(60);
    // PPC 36 días + PPM 60 días − PPO 50 días = 46
    expect(cicloConversion(36, 6, 7.2)).toBeCloseTo(36 + 60 - 360 / 7.2, 6);
  });

  it('prueba defensiva, deuda/patrimonio y apalancamiento', () => {
    expect(pruebaDefensiva(45000, 160000)).toBeCloseTo(0.28125, 6);
    expect(deudaPatrimonio(300000, 200000)).toBe(1.5);
    expect(apalancamiento(400000, 200000)).toBe(2);
  });

  it('rotación de activos fijos, del capital de trabajo y solvencia', () => {
    expect(rotacionActivosFijos(850000, 400000)).toBeCloseTo(2.125, 6);
    expect(rotacionCapitalTrabajo(850000, 170000)).toBe(5);
    expect(solvencia(400000, 160000)).toBe(2.5);
  });

  it('devuelven N/D (null) cuando el denominador es 0', () => {
    expect(pruebaDefensiva(100, 0)).toBeNull();
    expect(rotacionActivos(100, 0)).toBeNull();
    expect(rotacionCxP(100, 0)).toBeNull();
    expect(plazoPago(0)).toBeNull();
    expect(cicloConversion(30, 0, 5)).toBeNull();
    expect(coberturaIntereses(500, 0)).toBeNull();
    expect(deudaPatrimonio(100, 0)).toBeNull();
    expect(apalancamiento(100, 0)).toBeNull();
    expect(margenBruto(100, 0)).toBeNull();
    expect(margenOperativo(100, 0, 0, 0)).toBeNull();
    expect(roe(100, 0)).toBeNull();
    expect(rotacionActivosFijos(100, 0)).toBeNull();
    expect(rotacionCapitalTrabajo(100, 0)).toBeNull();
    expect(solvencia(100, 0)).toBeNull();
  });
});
