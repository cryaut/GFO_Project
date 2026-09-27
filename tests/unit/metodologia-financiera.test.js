import { describe, it, expect } from 'vitest';
import {
  saldoPromedio, variacion, rotacionInventario, rotacionCxC,
  roa, dupont, capitalNetoTrabajo, capitalNetoOperativo, efeIndirecto
} from '../../js/utils/calculate.js';

describe('Metodología financiera — promedios (Auditoría #3)', () => {
  it('Inventario promedio = (inicial + final) / 2', () => {
    const invProm = saldoPromedio(10000, 20000);
    expect(invProm).toBe(15000);
    expect(rotacionInventario(45000, invProm)).toBeCloseTo(3, 4);
  });

  it('CxC promedio = (inicial + final) / 2', () => {
    const cxcProm = saldoPromedio(30000, 50000);
    expect(cxcProm).toBe(40000);
    expect(rotacionCxC(200000, cxcProm)).toBeCloseTo(5, 4);
  });

  it('sin periodo inicial se usa el saldo final como aproximación', () => {
    expect(saldoPromedio(undefined, 20000)).toBe(20000);
  });
});

describe('Metodología financiera — ROA con activo promedio (Auditoría #4)', () => {
  it('ROA = UN / activo promedio', () => {
    const activoProm = saldoPromedio(300000, 500000);
    expect(activoProm).toBe(400000);
    expect(roa(50000, activoProm)).toBeCloseTo(0.125, 3);
  });

  it('usar solo el saldo final sobreestima el ROA cuando el activo creció', () => {
    const roaPromedio = roa(50000, saldoPromedio(300000, 500000));
    const roaFinal = roa(50000, 500000);
    expect(roaFinal).toBeLessThan(roaPromedio);
  });
});

describe('Metodología financiera — DuPont con promedios reales (Auditoría #5)', () => {
  it('ROE = PM × AT × EM usando activo y patrimonio promedio', () => {
    const activoProm = saldoPromedio(350000, 450000);
    const patrimonioProm = saldoPromedio(180000, 220000);
    const { ROE } = dupont(50000, 850000, activoProm, patrimonioProm);
    const esperado = (50000 / 850000) * (850000 / 400000) * (400000 / 200000);
    expect(ROE).toBeCloseTo(esperado, 6);
  });
});

describe('Metodología financiera — CNO ≠ CNT (Auditoría #2)', () => {
  it('CNO excluye efectivo/otros del AC y deuda financiera del PC', () => {
    const AC = 100000, efectivo = 30000, otros = 0;
    const cxC = 40000, inventario = 30000;
    const PC = 60000, cxp = 35000, provisiones = 0;

    const CNT = capitalNetoTrabajo(AC, PC);
    const CNO = capitalNetoOperativo(cxC + inventario, cxp + provisiones);

    expect(efectivo + otros).toBe(30000);
    expect(CNO).toBe(35000);
    expect(CNO).not.toBe(CNT);
    expect(CNT).toBe(40000);
  });
});

describe('Metodología financiera — EFE indirecto con variaciones reales (Auditoría #1)', () => {
  it('CFO = UN − ΔInventario − ΔCxC + ΔPasivos operativos', () => {
    const dInv = variacion(25000, 20000);
    const dCxC = variacion(52000, 48000);
    const dPasOp = variacion(31000, 28000);
    expect(dInv).toBe(5000);
    expect(dCxC).toBe(4000);
    expect(dPasOp).toBe(3000);

    const CFO = efeIndirecto(80000, [-dInv, -dCxC, dPasOp]);
    expect(CFO).toBe(80000 - 5000 - 4000 + 3000);
    expect(CFO).toBe(74000);
  });

  it('disminución de activos operativos libera efectivo', () => {
    const dCxC = variacion(30000, 45000);
    expect(dCxC).toBe(-15000);
    const CFO = efeIndirecto(50000, [-dCxC]);
    expect(CFO).toBe(65000);
  });

  it('sin dos periodos no hay ajustes: CFO = UN', () => {
    expect(efeIndirecto(80000, [])).toBe(80000);
  });
});
