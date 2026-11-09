import { describe, expect, it } from 'vitest';
import { analisisHorizontalCompleto, analisisVerticalCompleto } from '../../js/modules/analisis/analisis-calculations.js';
import { construirEFE } from '../../js/modules/analisis/efe-calculations.js';
import { identificarCuenta } from '../../js/modules/estados/cuentas-identificador.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { estadosResueltos } from '../../js/modules/estados/estados-presentacion-calculations.js';
import { resultadosReales } from '../../js/modules/proforma/proforma-calculations.js';
import { computarRazonesDesdeDatos } from '../../js/modules/razones/razones-app-adapter.js';
import { ejemploEstadosResueltos } from '../fixtures/estados-resueltos.js';

const uai = (datos, periodo) => estadosResueltos(datos, periodo).estadoResultados
  .find(fila => fila.id === 'presentacion.uai');

describe('UAI acreditada de Dayton y Electrónicas', () => {
  it.each([
    ['Utilidad neta antes de impuestos', [24688, 13926]],
    ['Utilidad antes de impuesto', [5676000, 7274000]]
  ])('conserva y traza el subtotal «%s» sin inferir la composición de otros ingresos', (nombre, importes) => {
    const periodo = ['2023', '2024'];
    const base = ejemploEstadosResueltos(periodo);
    base.composicionIngresos['2024'] = 'sin_declarar';
    const datos = registrarCuenta(base, periodo.map((p, i) => ({
      nombre, grupo: 'estadoResultados', periodo: p, importe: importes[i], origen: 'importacion'
    })));
    expect(identificarCuenta(nombre, { grupo: 'estadoResultados' })).toMatchObject({
      estado: 'reconocida', id: 'is.pretax_income_reported'
    });
    expect(uai(datos, '2024')).toMatchObject({
      cuenta: nombre, origen: 'reportado', valor: importes[1], valorCalculo: importes[1],
      motivos: [expect.objectContaining({ codigo: 'reported_subtotal_unverifiable' })]
    });
    expect(datos.composicionIngresos['2024']).toBe('sin_declarar');
    expect(resultadosReales(datos).uai).toBe(importes[1]);
    expect(analisisVerticalCompleto(datos, '2024').estadoResultados.rows.find(fila => fila.id === 'presentacion.uai'))
      .toMatchObject({ valor: importes[1] });
    expect(analisisHorizontalCompleto(datos, periodo)[0].rows.find(fila => fila.id === 'presentacion.uai').delta)
      .toBe(importes[1] - importes[0]);
    expect(estadosResueltos(datos, '2024').estadoResultados.filter(fila => fila.cuenta === nombre)).toHaveLength(1);
  });

  it.each([0, -100])('conserva %s y avisa si no coincide con el detalle calculable', importe => {
    const datos = registrarCuenta(ejemploEstadosResueltos(), {
      id: 'is.pretax_income_reported', nombre: 'UAI del original', periodo: 'Julio', importe
    });
    expect(uai(datos, 'Julio')).toMatchObject({
      valor: importe, valorCalculo: importe,
      motivos: [expect.objectContaining({ codigo: 'reported_subtotal_mismatch', reportado: importe, calculado: 10000 })]
    });
    expect(uai(ejemploEstadosResueltos(), 'Julio')).toMatchObject({ origen: 'calculado', valor: 10000 });
  });
});

it('conserva un componente patrimonial negativo confirmado sin inferir su naturaleza de efectivo', () => {
  const base = ejemploEstadosResueltos(['2020']);
  base.balanceGeneral['2020'].patrimonio = {};
  base.accountIdentities.patrimonio = {};
  base.accountTypes.patrimonio = {};
  base.coberturaEstados = { '2020': { patrimonio: 'completo' } };
  const datos = registrarCuenta(base, [
    { nombre: 'Capital', id: 'bs.share_capital', importe: 36000 },
    { nombre: 'Resultado del periodo', id: 'bs.current_year_result_equity', importe: 12600 },
    { nombre: 'Dividendos o retiros (−)', id: 'bs.other_equity_components', importe: -1003.14 },
    { nombre: 'Pasivo de La Grandiosa', id: 'bs.total_liabilities', importe: 77053.44 }
  ].map(registro => ({ ...registro, periodo: '2020', confirmado: true })));
  const filas = estadosResueltos(datos, '2020').balanceGeneral;
  expect(filas.find(fila => fila.id === 'bs.other_equity_components')?.valor).toBe(-1003.14);
  expect(filas.find(fila => fila.id === 'bs.total_equity')?.valor).toBeCloseTo(47596.86, 6);
  expect(computarRazonesDesdeDatos(datos, '2020').deudaPatrimonio).toBeCloseTo(77053.44 / 47596.86, 8);
});

function bellaVista() {
  const periodos = ['2015', '2016'];
  const base = {
    name: 'Bella Vista', moneda: 'UM', periods: periodos,
    balanceGeneral: Object.fromEntries(periodos.map(periodo => [periodo, { activos: {}, pasivos: {}, patrimonio: {} }])),
    estadoResultados: { '2015': {}, '2016': {} }
  };
  // AFOD, Bella Vista §2. Caja, bancos y valores de la solución se agrupan
  // como equivalentes acreditados por el propio ejercicio.
  const saldos = [
    ['bs.cash_and_equivalents', 'Caja, bancos y valores', 50000, 82500],
    ['bs.trade_receivables', 'Clientes', 10000, 8000],
    ['bs.short_term_investments', 'Documentos por cobrar', 5000, 8000],
    ['bs.inventory_total', 'Inventario', 25000, 43000],
    ['bs.prepaid_expenses', 'Interés pagado por adelantado', 3000, 1500],
    ['bs.ppe_machinery', 'Maquinaria', 168000, 173000],
    ['bs.ppe_furniture', 'Mobiliario y equipo', 168000, 170000],
    ['bs.accumulated_depreciation', 'Depreciación acumulada', -28000, -63000],
    ['bs.long_term_investments', 'Documentos por cobrar a largo plazo', 0, 4000],
    ['bs.trade_payables', 'Proveedores', 30000, 40000],
    ['bs.accrued_expenses_payable', 'Acreedores', 25000, 30000],
    ['bs.short_term_borrowings', 'Documentos por pagar', 20000, 25000],
    ['bs.long_term_borrowings', 'Documentos y obligaciones a largo plazo', 44500, 50000],
    ['bs.share_capital', 'Capital social', 240000, 250000],
    ['bs.current_year_result_equity', 'Utilidad del ejercicio', 28000, 16500],
    ['bs.retained_earnings', 'Utilidad de ejercicios anteriores', 3000, 3600],
    ['bs.legal_reserve', 'Reserva legal', 10500, 11900]
  ];
  return registrarCuenta(base, [
    ...saldos.flatMap(([id, nombre, ...importes]) => periodos.map((periodo, i) => ({
      id, nombre, periodo, importe: importes[i], confirmado: true
    }))),
    { id: 'is.net_income_reported', nombre: 'Utilidad neta informada', periodo: '2016', importe: 16500 }
  ]);
}

function conDividendos(datos, importe, periodo = '2016') {
  return registrarCuenta(datos, {
    nombre: 'Dividendos en acciones', grupo: 'suplementario', periodo, importe, origen: 'importacion'
  });
}

const montosFinanciamiento = resultado => resultado.financiamiento.items.map(fila => fila.monto);

describe('Dividendo no monetario de Bella Vista', () => {
  it('excluye 5000 de ambas magnitudes usando el dato explícito del periodo final', () => {
    const datos = normalizeFinancialData(conDividendos(bellaVista(), 5000));
    const resultado = construirEFE(datos, '2015', '2016');
    // AFOD §1.3 y §3: deuda 10500, aporte de efectivo 5000 y dividendo en efectivo 21000.
    expect(montosFinanciamiento(resultado)).toEqual([10500, 5000, -21000]);
    expect(resultado.financiamiento.total).toBe(-5500);
    expect(resultado.operacion.total).toBe(52000);
    expect(resultado.inversion.total).toBe(-14000);
    expect(resultado.efectivoFinalCalculado).toBe(82500);
    expect(resultado.advertencias.join(' ')).toContain('dividendos en acciones declarados para 2016');
  });

  it('conserva el EFE legado si el ajuste falta, vale cero o corresponde a otro periodo', () => {
    const datos = bellaVista();
    for (const caso of [datos, conDividendos(datos, 0), conDividendos(datos, 5000, '2015')]) {
      const resultado = construirEFE(caso, '2015', '2016');
      expect(montosFinanciamiento(resultado)).toEqual([10500, 10000, -26000]);
      expect(resultado.advertencias.join(' ')).not.toContain('dividendos en acciones declarados');
    }
  });

  it('distingue una declaración incompatible de la ausencia y rechaza una magnitud negativa', () => {
    const datos = bellaVista();
    expect(() => conDividendos(datos, -5000)).toThrow(/se captura en positivo/);
    const resultado = construirEFE(conDividendos(datos, 27000), '2015', '2016');
    expect(montosFinanciamiento(resultado)).toEqual([10500, null, null]);
    expect(resultado.estado).toBe('incompleta');
    expect(resultado.motivos.join(' ')).toContain('superan las distribuciones derivadas del patrimonio');
  });
});
