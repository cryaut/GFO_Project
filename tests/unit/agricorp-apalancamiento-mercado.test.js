// F2 (D-113): Apalancamiento y Mercado de AGRI-CORP con los supuestos S4–S7.
// Los controles se resuelven a mano con las cifras de F04 (2024) y se escriben en cada caso.
import { describe, expect, it, vi } from 'vitest';
import { element, clic } from './helpers/dom-falso.js';
import { apalancamientoUI } from '../../js/modules/apalancamiento/apalancamiento-ui.js';
import {
  casoHistoricoReal, comportamientoAgricorp, DEPRECIACION_AMORTIZACION, PERIODOS_REALES
} from '../../js/examples/ejemplos-agricorp.js';
import { calcularApalancamiento } from '../../js/modules/apalancamiento/apalancamiento-calculations.js';
import { computarRazonesDesdeDatos } from '../../js/modules/razones/razones-app-adapter.js';
import { calcularRazonesMercado, normalizarDatosMercado } from '../../js/modules/analisis/mercado-calculations.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';

const caso = casoHistoricoReal();
const d = caso.estados;
const apal = calcularApalancamiento(d, caso.apalancamiento);
const periodo = p => apal.periodos.find(x => x.periodo === p);

// Subtotal «antes de partidas financieras» del auditado (F02 p. 6 y F04 p. 8).
const UAII_AUDITADA = { '2022': 335413089, '2023': 296823017, '2024': 357667403, '2025': 196252210 };

describe('UAII igual en Apalancamiento y Análisis', () => {
  it.each(Object.entries(UAII_AUDITADA))('%s: la UAII es el subtotal operativo del auditado', (p, uaii) => {
    expect(periodo(p).variables.uaii).toBe(uaii);
    const r = computarRazonesDesdeDatos(d, p);
    expect(r.margenOperativo * periodo(p).variables.ventas).toBeCloseTo(uaii, 2);
  });

  it('la UAI y la utilidad neta no cambian: los otros gastos e ingresos solo cambian de lado', () => {
    // 2024: UAI = 357,667,403 − 3,682,989 + 53,045,676 + 2,585,160 − 275,824,274 = 133,790,976.
    expect(periodo('2024').variables).toMatchObject({ uai: 133790976, un: 42223948,
      oi: 53045676 + 2585160, og: 3682989, oio: 24995050 });
  });

  it('si la cuenta se identifica como no operativa, «otros gastos» sigue fuera de la UAII (como antes)', () => {
    const datos = normalizeFinancialData(structuredClone(d));
    datos.accountIdentities.estadoResultados['Otros gastos'].idCuenta = 'is.noninterest_nonoperating_expenses';
    const r = calcularApalancamiento(datos, caso.apalancamiento);
    // 2024: 357,667,403 + 17,187,302 (otros gastos vuelve a ser no operativo) = 374,854,705.
    expect(r.periodos.find(x => x.periodo === '2024').variables).toMatchObject({ uaii: 374854705, og: 3682989 + 17187302 });
    expect(r.cuentas.map(c => c.nombre)).not.toContain('Otros gastos');
  });
});

describe('clasificación S4–S6 y grados de 2024', () => {
  // CV = 0.75 × 7,539,860,126 + 0.25 × (562,260,236 + 151,041,897 + 215,360,471 + 17,187,302)
  //      + 192,060,853 = 5,654,895,094.5 + 236,462,476.5 + 192,060,853 = 6,083,418,424.
  // CF = 0.25 × 7,539,860,126 + 0.75 × 945,849,906 = 2,594,352,461.
  // MC = 9,010,443,238 − 6,083,418,424 = 2,927,024,814. UAII = MC − CF + 24,995,050 = 357,667,403.
  it('CV, CF, MC y GAO', () => {
    const v = periodo('2024').variables;
    expect(v.cv).toBeCloseTo(6083418424, 3);
    expect(v.cf).toBeCloseTo(2594352461, 3);
    expect(v.mc).toBeCloseTo(2927024814, 3);
    expect(v.mc - v.cf + v.oio).toBeCloseTo(v.uaii, 3);
    expect(periodo('2024').grados.gao).toBeCloseTo(2927024814 / 357667403, 10);
  });

  it('GAF con la tasa efectiva y los dividendos preferentes pagados', () => {
    // T = 91,567,028 / 133,790,976. GAF = 357,667,403 / (133,790,976 − 7,520,629 / (1 − T)).
    const t = 91567028 / 133790976;
    expect(periodo('2024').grados.gaf).toBeCloseTo(357667403 / (133790976 - 7520629 / (1 - t)), 10);
  });

  it('las cuatro cuentas de gasto y el costo de ventas quedan clasificados con su origen', () => {
    expect(Object.fromEntries(apal.cuentas.map(c => [c.nombre, [c.comportamiento.pctVariable, c.origen]]))).toEqual({
      'Costo de ventas': [0.75, 'guardado'], 'Gastos de mercadeo y ventas': [0.25, 'guardado'],
      'Gastos de administración': [0.25, 'guardado'], 'Gastos de tráfico de almacenes': [0.25, 'guardado'],
      'Gasto por pago mínimo definitivo': [1, 'guardado'], 'Otros gastos': [0.25, 'guardado']
    });
    expect(apal.advertencias.some(a => a.codigo === 'sin-comportamiento')).toBe(false);
  });

  it('sensibilidad: con más costo de ventas variable el GAO baja', () => {
    const gao = pct => calcularApalancamiento(d, { ...caso.apalancamiento, comportamiento: comportamientoAgricorp(pct) })
      .periodos.find(x => x.periodo === '2024').grados.gao;
    // 50 %: CV = 3,769,930,063 + 236,462,476.5 + 192,060,853; MC = 4,811,989,845.5.
    expect(gao(0.5)).toBeCloseTo(4811989845.5 / 357667403, 8);
    expect(gao(0.5)).toBeGreaterThan(gao(0.75));
    expect(gao(0.75)).toBeGreaterThan(gao(0.9));
  });
});

describe('comprobación contra la depreciación publicada', () => {
  it('suma depreciación de PPE, de derecho de uso y amortización (anexo, tabla 2)', () => {
    expect(DEPRECIACION_AMORTIZACION).toEqual({ '2022': 131530315, '2023': 146127828, '2024': 149241420, '2025': 135522070 });
  });

  it('con S4–S5 los costos fijos superan la depreciación en los cuatro años', () => {
    expect(apal.advertencias.some(a => a.codigo === 'cf-menor-depreciacion')).toBe(false);
  });

  it('guardar desde la pantalla conserva la clasificación y la depreciación de referencia', async () => {
    const page = element(), guardar = vi.fn();
    apalancamientoUI(page, { estados: d, config: caso.apalancamiento, guardar });
    expect(page.innerHTML).toContain('Otros gastos operativos');
    await clic(page, 'guardarApalancamiento');
    const guardado = guardar.mock.calls[0][0];
    expect(guardado.depreciacionAmortizacion).toEqual({ ...DEPRECIACION_AMORTIZACION });
    expect(guardado.comportamiento).toEqual(caso.apalancamiento.comportamiento);
    expect(guardado.dap).toEqual(caso.apalancamiento.dap);
  });

  it('una clasificación con casi todo variable se avisa', () => {
    const todoVariable = Object.fromEntries(Object.keys(comportamientoAgricorp()).map(n => [n, { tipo: 'variable' }]));
    const r = calcularApalancamiento(d, { ...caso.apalancamiento, comportamiento: todoVariable });
    const avisos = r.advertencias.filter(a => a.codigo === 'cf-menor-depreciacion');
    expect(avisos.map(a => a.periodo)).toEqual(PERIODOS_REALES);
    expect(avisos[2]).toMatchObject({ cf: 0, depreciacion: 149241420 });
  });
});

describe('Mercado con el precio supuesto S7', () => {
  const mercado = calcularRazonesMercado(d, caso.razonesMercado, caso.apalancamiento.dap);

  it('2024: UPA = (42,223,948 − 7,520,629) / 476,176 y P/U = 100 / UPA', () => {
    const r = mercado.find(x => x.periodo === '2024');
    expect(r.upa).toBeCloseTo(34703319 / 476176, 10);
    expect(r.pu).toBeCloseTo(100 / (34703319 / 476176), 10);
    expect(r.pvl).toBeCloseTo(100 / (1000221691 / 476176), 10);
  });

  it('con utilidad negativa (2023 y 2025) la P/U no se interpreta', () => {
    expect(mercado.find(x => x.periodo === '2023').pu).toBeNull();
    expect(mercado.find(x => x.periodo === '2025').pu).toBeNull();
  });

  it('la nota de procedencia se conserva al normalizar y una demasiado larga se descarta', () => {
    expect(normalizarDatosMercado(caso.razonesMercado).nota).toContain('ilustrativo');
    expect(normalizarDatosMercado({ periodos: {}, nota: 'x'.repeat(501) })).toEqual({ periodos: {} });
    expect(normalizarDatosMercado({ periodos: {}, nota: 42 })).toEqual({ periodos: {} });
  });
});
