// F1 (D-113): AGRI-CORP consolidada con los estados auditados 2022–2025 y los supuestos S1–S3.
// Las cifras de control se copian de las fuentes (F02 y F04) o se resuelven a mano; ninguna sale
// del propio código que se prueba.
import { describe, expect, it } from 'vitest';
import {
  casoHistoricoReal, datosSuplementariosAgricorp, flujoRealAgricorp, PERIODOS_REALES, EMPRESA_AGRICORP
} from '../../js/examples/ejemplos-agricorp.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { computarRazonesDesdeDatos, obtenerUtilidadNetaMotor } from '../../js/modules/razones/razones-app-adapter.js';
import { construirEFE } from '../../js/modules/analisis/efe-calculations.js';
import { calcularFlujo } from '../../js/modules/flujo/flujo-calculations.js';

const caso = casoHistoricoReal();
const d = caso.estados;

// Balance: F02 p. 5 (2022–2023) y F04 p. 7 (2024–2025). Resultados: F02 p. 6 y F04 p. 8.
const AUDITADO = {
  '2022': { ac: 3083008736, act: 5205499544, pc: 3064432418, pas: 4205152482, pat: 1000347062, ventas: 8342024681, un: 12128644, operativo: 335413089 },
  '2023': { ac: 3130400003, act: 5289724103, pc: 3694159909, pas: 4459017756, pat: 830706347, ventas: 9355895570, un: -419583311, operativo: 296823017 },
  '2024': { ac: 4196014499, act: 6328132696, pc: 4366612852, pas: 5327911005, pat: 1000221691, ventas: 9010443238, un: 42223948, operativo: 357667403 },
  '2025': { ac: 3402936327, act: 5279969842, pc: 3775103288, pas: 4434585277, pat: 845384565, ventas: 7895371400, un: -157990498, operativo: 196252210 }
};

describe('estados auditados 2022–2025', () => {
  it('carga los cuatro años con el nombre de la empresa', () => {
    expect(d.name).toBe(EMPRESA_AGRICORP);
    expect(d.periods).toEqual(['2022', '2023', '2024', '2025']);
    expect(PERIODOS_REALES).toEqual(d.periods);
  });

  it.each(Object.entries(AUDITADO))('%s reproduce los totales del auditado', (periodo, a) => {
    const t = computeFinancialTotals(d, periodo);
    expect(t.unclassified).toEqual([]);
    expect(t).toMatchObject({ activosCorrientes: a.ac, totalActivos: a.act, pasivosCorrientes: a.pc,
      totalPasivos: a.pas, totalPatrimonio: a.pat, ventas: a.ventas, utilidadNeta: a.un });
    expect(t.totalPasivos + t.totalPatrimonio).toBe(t.totalActivos);
    expect(obtenerUtilidadNetaMotor(d, periodo).valor).toBe(a.un);
  });

  it.each(Object.entries(AUDITADO))('%s: la utilidad operativa es el subtotal «antes de partidas financieras»', (periodo, a) => {
    const r = computarRazonesDesdeDatos(d, periodo);
    expect(r.margenOperativo * a.ventas).toBeCloseTo(a.operativo, 2);
  });

  it('no rellena con cero las partidas que una fuente no presenta', () => {
    expect(Object.hasOwn(d.estadoResultados['2022'], 'Gasto por pago mínimo definitivo')).toBe(false);
    expect(Object.hasOwn(d.estadoResultados['2023'], 'Gasto por pago mínimo definitivo')).toBe(false);
    expect(d.estadoResultados['2024']['Gasto por pago mínimo definitivo']).toBe(192060853);
    expect(Object.hasOwn(d.balanceGeneral['2022'].pasivos, 'Porción corriente de préstamos a largo plazo')).toBe(false);
    expect(d.balanceGeneral['2025'].pasivos['Porción corriente de préstamos a largo plazo']).toBe(215833203);
    // F04 separa la porción corriente: la deuda corriente agregada de 2024 es 1,762,614,697.
    const p = d.balanceGeneral['2024'].pasivos;
    expect(p['Préstamos por pagar (corriente)'] + p['Porción corriente de préstamos a largo plazo']).toBe(1762614697);
  });
});

describe('razones de control (365 días)', () => {
  // Rotación = costo de ventas / inventario promedio. 2023: 7,967,257,505 / 1,295,614,319.5.
  it.each([
    ['2023', 6.149405255, 59.355333541],
    ['2024', 5.381940166, 67.819408759],
    ['2025', 4.080235260, 89.455626155]
  ])('%s: rotación y edad del inventario consolidado', (periodo, rotacion, dias) => {
    const r = computarRazonesDesdeDatos(d, periodo);
    expect(r.RotInv).toBeCloseTo(rotacion, 8);
    expect(r.edadInventario).toBeCloseTo(dias, 6);
  });

  it('2023: ROA y ROE con promedios, como el contraste del documento de investigación', () => {
    const r = computarRazonesDesdeDatos(d, '2023');
    // −419,583,311 / 5,247,611,823.5 y −419,583,311 / 915,526,704.5.
    expect(r.ROA).toBeCloseTo(-0.079957002, 8);
    expect(r.roe).toBeCloseTo(-0.458297184, 8);
  });

  it('2022 no tiene saldos de 2021: las razones con promedio quedan N/D', () => {
    const r = computarRazonesDesdeDatos(d, '2022');
    expect(r.RotInv).toBeNull();
    expect(r.ROA).toBeNull();
    expect(r.RC).toBeCloseTo(3083008736 / 3064432418, 12);
  });
});

describe('supuestos S1–S3', () => {
  const supuestos = datosSuplementariosAgricorp();
  const de = (id, periodo) => supuestos.find(s => s.id === id && s.periodo === periodo)?.importe;

  it('S1: ventas a crédito = 50 % de las ventas de cada año', () => {
    expect(de('supp.credit_sales', '2022')).toBe(4171012340.5);
    expect(de('supp.credit_sales', '2024')).toBe(4505221619);
    expect(de('supp.credit_sales', '2025')).toBe(3947685700);
  });

  it('S1 rotación de CxC 2024: 4,505,221,619 / 1,040,027,994.5 = 4.33 veces y 84.26 días', () => {
    const r = computarRazonesDesdeDatos(d, '2024');
    expect(r.RotCxC).toBeCloseTo(4.331827261, 8);
    expect(r.PPC).toBeCloseTo(84.260054243, 6);
  });

  it('S2–S3: el pago declarado reproduce compras a crédito = 60 % de las compras estimadas', () => {
    // 2024: compras = 7,539,860,126 + 1,621,305,239 − 1,180,606,300 = 7,980,559,065.
    // A crédito: 4,788,335,439. Pagos = 4,788,335,439 − (1,039,869,493 − 404,590,181) = 4,153,056,127.
    expect(de('supp.supplier_payments', '2024')).toBe(4153056127);
    // Rotación de CxP = 4,788,335,439 / ((404,590,181 + 1,039,869,493) / 2) = 6.6299 veces.
    expect(computarRazonesDesdeDatos(d, '2024').rotacionCxP).toBeCloseTo(4788335439 / 722229837, 10);
  });

  it('2022 no declara pagos: no hay inventario de 2021 para estimar compras', () => {
    expect(de('supp.supplier_payments', '2022')).toBeUndefined();
    expect(computarRazonesDesdeDatos(d, '2022').rotacionCxP).toBeNull();
  });

  it('cada supuesto se nombra como tal', () => {
    expect(supuestos.every(s => s.nombre.includes('SUPUESTO'))).toBe(true);
  });
});

describe('flujos publicados y dividendos pagados', () => {
  it.each([
    ['2023', '2024', 190033364, -78516767, 102282062, 284636118],
    ['2024', '2025', 37782108, 214423000, -387590055, 149251171]
  ])('%s → %s cuadra con el balance sin diferencias', (inicial, final, operacion, inversion, financiamiento, efectivoFinal) => {
    const efe = construirEFE(d, inicial, final);
    expect(efe).toMatchObject({ naturaleza: 'flujo_reportado', estado: 'cuadra', diferencia: 0, efectivoFinal,
      operacion: { total: operacion }, inversion: { total: inversion }, financiamiento: { total: financiamiento } });
  });

  it('operación = subtotal publicado + impuesto pagado + intereses cobrados + intereses pagados', () => {
    // 2024: 758,587,482 − 374,194,121 + 12,611,343 − 206,971,340 = 190,033,364.
    expect(calcularFlujo(flujoRealAgricorp('2024')).neto.operacion).toBe(190033364);
  });

  it('los dividendos preferentes pagados de cada flujo alimentan el DAP', () => {
    expect(caso.apalancamiento.dap).toEqual({ '2022': 4443312, '2023': 1948421, '2024': 7520629, '2025': 7520629 });
  });

  it('las acciones comunes son 476,176 en los cuatro años y no hay precio inventado', () => {
    for (const p of PERIODOS_REALES) expect(caso.razonesMercado.periodos[p]).toEqual({ acciones: 476176, precio: null, dividendos: 0 });
  });

  it('un año sin flujo publicado cargado no se inventa', () => {
    expect(() => flujoRealAgricorp('2026')).toThrow('No hay flujo publicado');
  });
});
