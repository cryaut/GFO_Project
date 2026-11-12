// F4 (D-113): presupuesto maestro 2025 de AGRI-CORP consolidada desde el cierre real de 2024.
// Los controles se resuelven a mano con las cifras de F04 (columna 2024) y los supuestos S8–S15.
import { describe, expect, it } from 'vitest';
import { casoHistoricoReal, presupuestoAgricorp2025 } from '../../js/examples/ejemplos-agricorp.js';
import { calcularPresupuestoMaestro, normalizarSupuestos, validarSupuestos } from '../../js/modules/planeacion/planeacion-calculations.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';

const s = normalizarSupuestos(presupuestoAgricorp2025());
const p = calcularPresupuestoMaestro(s);
const g = 1.0135;

describe('supuestos 2025', () => {
  it('son válidos y conservan la unidad y la nota del caso', () => {
    expect(validarSupuestos(s)).toEqual([]);
    expect(s.unidad).toContain('C$1 al costo');
    expect(s.nota).toContain('Presupuesto 2025');
  });

  it('las aperturas son los saldos reales del balance 2024', () => {
    expect(s).toMatchObject({ saldoInicialCaja: 284636118, cxcInicial: 1160810469, cxpInicial: 1039869493, inventarioInicial: 1621305239 });
  });

  it('precio = ventas / costo de ventas 2024 y costo unitario 1', () => {
    expect(s.precio).toBe(9010443238 / 7539860126);
    expect(s.costoUnitario).toBe(1);
  });

  it('sin la nota ni la unidad, la forma guardada no cambia', () => {
    const { unidad, nota, ...resto } = presupuestoAgricorp2025();
    expect([unidad, nota].every(Boolean)).toBe(true);
    const normal = normalizarSupuestos(resto);
    expect(Object.hasOwn(normal, 'unidad') || Object.hasOwn(normal, 'nota')).toBe(false);
  });
});

describe('estado de resultados presupuestado 2025', () => {
  it('ventas = ventas 2024 × 1.0135 y costo de ventas = costo 2024 × 1.0135', () => {
    expect(p.totales.ventas).toBeCloseTo(9010443238 * g, 2);
    expect(p.totales.cbv).toBeCloseTo(7539860126 * g, 2);
  });

  it('gastos: variables = (25 % de gastos de operación + pago mínimo) × 1.0135; fijos y depreciación sin cambio', () => {
    // 0.25 × 945,849,906 + 192,060,853 = 428,523,329.5.
    expect(p.totales.gastosVariables).toBeCloseTo(428523329.5 * g, 2);
    // 0.75 × 945,849,906 − 24,995,050 − 149,241,420 = 535,150,959.5.
    expect(p.totales.gastosFijos).toBeCloseTo(535150959.5, 2);
    expect(p.totales.depreciacion).toBeCloseTo(149241420, 2);
  });

  it('UAII 2025 = UAII 2024 + 1.35 % del margen después de costos variables', () => {
    // UAII 2024 = 357,667,403; margen = 9,010,443,238 − 7,539,860,126 − 428,523,329.5 = 1,042,059,782.5.
    expect(p.totales.uaii).toBeCloseTo(357667403 + 0.0135 * 1042059782.5, 2);
  });

  it('utilidad neta = (UAII − intereses de 2024) × (1 − 30 %)', () => {
    expect(p.totales.intereses).toBeCloseTo(275824274, 2);
    expect(p.totales.utilidadNeta).toBeCloseTo((357667403 + 0.0135 * 1042059782.5 - 275824274) * 0.7, 2);
  });
});

describe('inventario y caja', () => {
  it('S15: el inventario final de cada trimestre es el cierre de 2024 × 1.0135 (78.49 días)', () => {
    // Días = 1,621,305,239 / 7,539,860,126 × 365 = 78.486 días sobre el costo del trimestre siguiente.
    expect(s.pctInventarioFinal * 365 / 4).toBeCloseTo(1621305239 / 7539860126 * 365, 8);
    expect(s.pctInventarioFinal * 365 / 4).toBeCloseTo(78.49, 2);
    for (const valor of p.cbv.inventarioFinal) expect(valor).toBeCloseTo(1621305239 * g, 2);
  });

  it('las compras del T1 suben el inventario desde el saldo real de 2024 al ritmo de las ventas', () => {
    const ventasU = 7539860126 * g / 4, finalU = 1621305239 * g;
    // 1,910,412,059.4 + 1,643,192,859.7 − 1,621,305,239 = 1,932,299,680.2.
    expect(p.compras.importe[0]).toBeCloseTo(ventasU + finalU - 1621305239, 2);
    expect(p.compras.importe[0]).toBeCloseTo(1932299680.15, 1);
  });

  it('S15 no libera caja: el saldo final es 431,690,010 (sin la reducción de inventario de 223.3 M)', () => {
    // Con la base anterior (inventario promedio) el cierre era (1,180,606,300 + 1,621,305,239) / 2 × 1.0135
    // = 1,419,868,672.4: compraba 223,324,187.3 menos y la caja final quedaba en 655,014,197.6.
    // 655,014,197.6 − 223,324,187.3 = 431,690,010.3. La utilidad neta y los proveedores no cambian.
    expect(p.cierre.efectivo).toBeCloseTo(431690010.28, 1);
    expect(1621305239 * g - (1180606300 + 1621305239) / 2 * g).toBeCloseTo(223324187.34, 1);
  });

  it('cobros = ventas + CxC inicial − CxC final (50 % del T4)', () => {
    const ventas = 9010443238 * g;
    expect(p.totales.cobros).toBeCloseTo(ventas + 1160810469 - ventas / 4 / 2, 1);
    expect(p.cierre.cxc).toBeCloseTo(ventas / 8, 2);
  });

  it('otros desembolsos: inversión y dividendos de 2024 y el IR por pagar de 2024 en el T1', () => {
    expect(p.totales.otrosDesembolsos).toBeCloseTo(45408357 + 7520629 + 148959541, 2);
    expect(p.supuestos.otrosDesembolsos[0] - p.supuestos.otrosDesembolsos[1]).toBeCloseTo(148959541, 4);
  });

  it('la caja no baja de cero en ningún trimestre: no hace falta financiamiento', () => {
    expect(p.caja.financiamiento.every(f => f === 0)).toBe(true);
    expect(p.caja.saldoFinal[3]).toBeCloseTo(284636118 + p.totales.flujoNeto, 2);
  });
});

describe('contraste con el 2025 auditado', () => {
  const real = computeFinancialTotals(casoHistoricoReal().estados, '2025');

  it('las ventas presupuestadas superan a las reales en 13.5 % y la utilidad pasa de ganancia a pérdida', () => {
    expect(p.totales.ventas / real.ventas - 1).toBeCloseTo(9132084221.713 / 7895371400 - 1, 8);
    expect(real.ventas / p.totales.ventas - 1).toBeCloseTo(-0.1354250346, 8);
    expect(p.totales.utilidadNeta).toBeGreaterThan(0);
    expect(real.utilidadNeta).toBe(-157990498);
  });

  it('el caso de Inicio trae este presupuesto', () => {
    expect(normalizarSupuestos(casoHistoricoReal().planeacion.supuestos)).toEqual(s);
  });
});
