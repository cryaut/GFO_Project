import { describe, expect, it } from 'vitest';
import { analisisHorizontalCompleto, analisisVerticalCompleto, detalleDuPont, filasAnalisis } from '../../js/modules/analisis/analisis-calculations.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { computarRazonesDesdeDatos } from '../../js/modules/razones/razones-app-adapter.js';
import { estadosDesdeReferencia, ejemploApp } from '../fixtures/razones-app.js';

function vacios(periods = ['2024', '2025']) {
  return { name: 'Caso de prueba', periods,
    balanceGeneral: Object.fromEntries(periods.map(p => [p, { activos: {}, pasivos: {}, patrimonio: {} }])),
    estadoResultados: Object.fromEntries(periods.map(p => [p, {}])) };
}

function ejemploDocente() {
  // Clase DuPont, diaps. 5–10: UN=12000, V=200000, ATprom=100000, Pprom=60000.
  // Los cierres 90000/110000 y 50000/70000 son SINTÉTICOS para acreditar esos
  // promedios en la app; no se atribuyen al enunciado docente.
  return registrarCuenta(vacios(), [
    ['2024', 'bs.total_assets', 'Activos declarados', 90000],
    ['2025', 'bs.total_assets', 'Activos declarados', 110000],
    ['2024', 'bs.total_equity', 'Capital declarado', 50000],
    ['2025', 'bs.total_equity', 'Capital declarado', 70000],
    ['2025', 'is.net_sales_reported', 'Ingresos netos declarados', 200000],
    ['2025', 'is.net_income_reported', 'Resultado declarado', 12000]
  ].map(([periodo, id, nombre, importe]) => ({ periodo, id, nombre, importe, confirmado: true })));
}

describe('AH y AV de todas las cuentas', () => {
  it('AH incluye balance, ER, totales, suplementarios y pendientes; ausencia es N/D', () => {
    const datos = vacios();
    datos.balanceGeneral['2024'].activos = { 'Cuenta propia': 100, 'Solo inicial': 20, 'Base cero': 0 };
    datos.balanceGeneral['2025'].activos = { 'Cuenta propia': 125, 'Solo final': 30, 'Base cero': 10 };
    datos.estadoResultados = { '2024': { 'Intereses particulares': 40 }, '2025': { 'Intereses particulares': 50 } };
    datos.supplementaryAccounts = { '2025': { 'Ventas crédito': 200 } };
    datos.pendingAccounts = [{ nombre: 'Sin grupo', importes: { '2024': 5, '2025': 7 } }];
    const [comparacion] = analisisHorizontalCompleto(datos, datos.periods);
    const cuenta = nombre => comparacion.rows.find(fila => fila.cuenta === nombre);
    expect(cuenta('Cuenta propia')).toMatchObject({ t1: 100, t2: 125, delta: 25, pctDelta: 0.25 });
    expect(cuenta('Intereses particulares')).toMatchObject({ delta: 10, pctDelta: 0.25 });
    expect(cuenta('Solo final')).toMatchObject({ t1: null, delta: null, pctDelta: null });
    expect(cuenta('Solo inicial')).toMatchObject({ t2: null, delta: null, pctDelta: null });
    expect(cuenta('Base cero')).toMatchObject({ delta: 10, pctDelta: null });
    expect(cuenta('Ventas crédito')).toMatchObject({ grupo: 'Datos suplementarios', t1: null });
    expect(cuenta('Sin grupo').delta).toBe(2);
  });

  it('conserva el signo y la convención Δ/abs(base) en contracuentas', () => {
    const datos = vacios();
    datos.balanceGeneral['2024'].activos.Depreciación = -100;
    datos.balanceGeneral['2025'].activos.Depreciación = -150;
    const [ah] = analisisHorizontalCompleto(datos, datos.periods);
    expect(ah.rows[0]).toMatchObject({ delta: -50, pctDelta: -0.5 });
  });

  it('incluye cuentas con nombres propios y cada total reportado sin sumar ni duplicar', () => {
    const datos = ejemploDocente();
    const av = analisisVerticalCompleto(datos, '2025');
    expect(av.balanceGeneral.rows.find(f => f.cuenta === 'Activos declarados').pctBase).toBe(1);
    expect(av.estadoResultados.rows.find(f => f.cuenta === 'Resultado declarado').pctBase).toBe(0.06);
    expect(av.estadoResultados.rows.find(f => f.cuenta === 'Ingresos netos declarados').pctBase).toBe(1);
    datos.balanceGeneral['2025'].activos['Activos declarados'] = 110000;
    expect(filasAnalisis(datos, '2025').filter(f => f.cuenta === 'Activos declarados')).toHaveLength(1);
  });

  it('AV no omite intereses, impuestos ni cuentas desconocidas; no calcula con base cero', () => {
    const datos = registrarCuenta(vacios(), [
      { id: 'is.net_sales_reported', nombre: 'Venta neta propia', periodo: '2025', importe: 0 },
      { id: 'is.interest_expense', nombre: 'Interés propio', periodo: '2025', importe: 10 },
      { id: 'is.income_tax_expense', nombre: 'Impuesto propio', periodo: '2025', importe: 5 }
    ]);
    datos.estadoResultados['2025']['Rubro <importado>'] = 2;
    const av = analisisVerticalCompleto(datos, '2025');
    expect(av.estadoResultados.rows.map(f => f.cuenta)).toEqual(expect.arrayContaining(['Interés propio', 'Impuesto propio', 'Rubro <importado>']));
    expect(av.estadoResultados.rows.every(f => f.pctBase === null)).toBe(true);
    expect(analisisVerticalCompleto(null, '2025').balanceGeneral.baseValor).toBeNull();
  });
});

describe('DuPont con procedimiento y fuentes coherentes', () => {
  it('reproduce a mano 6% × 2 = ROA 12%; × 100000/60000 = ROE 20%', () => {
    const dp = detalleDuPont(ejemploDocente(), '2025');
    expect(dp.PM).toBe(0.06);
    expect(dp.AT).toBe(2);
    expect(dp.EM).toBeCloseTo(5 / 3, 12);
    expect(dp.ROA).toBeCloseTo(0.12, 12);
    expect(dp.ROE).toBeCloseTo(0.20, 12);
    expect(dp.ROA).toBeCloseTo(dp.roaDirecto, 12);
    expect(dp.ROE).toBeCloseTo(dp.roeDirecto, 12);
  });

  it('conserva N/D si falta UN aunque el totalizador anterior pudiera completar otra cifra', () => {
    const datos = ejemploDocente();
    delete datos.reportedTotals['2025']['is.net_income_reported'];
    const dp = detalleDuPont(datos, '2025');
    expect(dp.utilidadNeta).toBeNull();
    expect(dp.PM).toBeNull();
    expect(dp.ROA).toBeNull();
    expect(dp.ROE).toBeNull();
    expect(dp.roeDirecto).toBeNull();
  });

  it('sin ventas no declara válida una descomposición aunque el rendimiento directo exista', () => {
    const datos = ejemploDocente();
    datos.reportedTotals['2025']['is.net_sales_reported'].importe = 0;
    const dp = detalleDuPont(datos, '2025');
    expect(dp.PM).toBeNull();
    expect(dp.ROA).toBeNull();
    expect(dp.ROE).toBeNull();
    expect(dp.roaDirecto).toBe(0.12);
  });

  it('mantiene factores y rendimientos coherentes en los periodos del fixture existente', () => {
    const datos = estadosDesdeReferencia(ejemploApp);
    for (const periodo of datos.periods) {
      const r = computarRazonesDesdeDatos(datos, periodo);
      const dp = detalleDuPont(datos, periodo);
      expect(dp.PM).toBe(r.MN);
      expect(dp.AT).toBe(r.rotacionActivos);
      expect(dp.roeDirecto).toBe(r.roe);
      if (dp.ROE !== null) expect(dp.ROE).toBeCloseTo(r.roe, 12);
      if (dp.ROA !== null) expect(dp.ROA).toBeCloseTo(r.ROA, 12);
    }
  });
});
