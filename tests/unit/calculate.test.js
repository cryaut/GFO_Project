import { describe, it, expect } from 'vitest';
import {
  ahDelta, ahPctDelta, ah, av,
  ratioCorriente, ratioRapido, rotacionInventario, rotacionCxC, plazoCobro,
  endeudamiento, margenNeto, roa,
  dupont, capitalNetoTrabajo, capitalNetoOperativo,
  eoaf, efeIndirecto, depAnualLineaRecta, depAcumulada, valorEnLibros,
  ahorroMensual, saldoSemanal
} from '../../js/utils/calculate.js';

describe('AH - Análisis Horizontal', () => {
  it('delta calcula diferencia correctamente', () => {
    expect(ahDelta(135, 120)).toBe(15);
    expect(ahDelta(100, 150)).toBe(-50);
    expect(ahDelta(50, 50)).toBe(0);
  });

  it('pctDelta calcula variación relativa correctamente', () => {
    expect(ahPctDelta(135, 120)).toBeCloseTo(0.125, 4);
    expect(ahPctDelta(100, 150)).toBeCloseTo(-0.3333, 4);
    expect(ahPctDelta(800, 700)).toBeCloseTo(0.1428, 3);
  });

  it('ah retorna delta / |t1|', () => {
    expect(ah(10, 200)).toBeCloseTo(0.05, 4);
    expect(ah(-10, 200)).toBeCloseTo(-0.05, 4);
    expect(ah(5, 0)).toBe(0);
  });
});

describe('AV - Análisis Vertical', () => {
  it('av calcula proporción correctamente', () => {
    expect(av(120000, 400000)).toBeCloseTo(0.3, 4);
    expect(av(0, 500)).toBe(0);
    expect(av(100, 0)).toBe(0);
  });
});

describe('Razones Financieras (AC-3.3)', () => {
  it('RC = AC / PC', () => {
    expect(ratioCorriente(900000, 280000)).toBeCloseTo(3.214, 2);
    expect(ratioCorriente(200, 100)).toBe(2);
    expect(ratioCorriente(100, 0)).toBe(0);
  });

  it('RR = (AC - Inventario) / PC', () => {
    expect(ratioRapido(900000, 180000, 280000)).toBeCloseTo(2.571, 2);
    expect(ratioRapido(500, 200, 100)).toBe(3);
  });

  it('RotInv = CostoVentas / InventarioProm', () => {
    expect(rotacionInventario(510000, 180000)).toBeCloseTo(2.833, 2);
  });

  it('RotCxC = Ventas / CxCprom', () => {
    expect(rotacionCxC(850000, 120000)).toBeCloseTo(7.083, 2);
  });

  it('PPC = 360 / RotCxC', () => {
    expect(plazoCobro(7.083)).toBeCloseTo(50.83, 1);
  });

  it('Endeudamiento = PasivoTotal / TotalActivo', () => {
    expect(endeudamiento(280000, 400000)).toBe(0.7);
    expect(endeudamiento(0, 500)).toBe(0);
  });

  it('MN = UN / Ventas', () => {
    expect(margenNeto(50000, 850000)).toBeCloseTo(0.0588, 3);
  });

  it('ROA = UN / TotalActivo', () => {
    expect(roa(50000, 400000)).toBeCloseTo(0.125, 3);
  });
});

describe('CNT/CNO (AC-3.4)', () => {
  it('CNT = AC - PC', () => {
    expect(capitalNetoTrabajo(900000, 280000)).toBe(620000);
  });

  it('CNO = AC ops - PC ops', () => {
    expect(capitalNetoOperativo(850000, 260000)).toBe(590000);
  });
});

describe('DuPont (AC-3.7)', () => {
  it('ROE = PM × AT × EM correctamente', () => {
    const result = dupont(50000, 850000, 400000, 500000);
    expect(result.PM).toBeCloseTo(0.0588, 3);
    expect(result.AT).toBeCloseTo(2.125, 3);
    expect(result.EM).toBeCloseTo(0.8, 3);
    expect(result.ROE).toBeCloseTo(result.PM * result.AT * result.EM, 6);
  });

  it('ROE es 0 cuando ventas es 0', () => {
    const result = dupont(0, 0, 100000, 50000);
    expect(result.ROE).toBe(0);
  });
});

describe('EOAF (AC-3.5)', () => {
  it('Activo aumento → Aplicación', () => {
    const r = eoaf('Inventario', 5000, 'activo');
    expect(r.clasificacion).toBe('Aplicacion');
    expect(r.monto).toBe(5000);
  });

  it('Activo disminución → Origen', () => {
    const r = eoaf('Efectivo', -3000, 'activo');
    expect(r.clasificacion).toBe('Origen');
    expect(r.monto).toBe(3000);
  });

  it('Pasivo aumento → Origen', () => {
    const r = eoaf('CxC por Pagar', 2000, 'pasivo');
    expect(r.clasificacion).toBe('Origen');
  });

  it('Pasivo disminución → Aplicación', () => {
    const r = eoaf('Préstamos', -4000, 'pasivo');
    expect(r.clasificacion).toBe('Aplicacion');
  });

  it('Cambio 0 retorna null', () => {
    expect(eoaf('Cuenta', 0, 'activo')).toBeNull();
  });
});

describe('EFE (AC-3.6)', () => {
  it('CFO = UN + ajustes', () => {
    expect(efeIndirecto(100000, [20000, -5000, 10000])).toBe(125000);
  });

  it('CFO con ajustes vacíos = UN', () => {
    expect(efeIndirecto(80000, [])).toBe(80000);
  });
});

describe('RC con datos del plan (AC-3.x)', () => {
  it('RC=(900+210)/(810+95) del ejemplo del plan', () => {
    const AC = 900 + 210;
    const PC = 810 + 95;
    const rc = ratioCorriente(AC, PC);
    expect(rc).toBeCloseTo(1.2265, 2);
  });
});
