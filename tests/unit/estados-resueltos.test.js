import { describe, expect, it } from 'vitest';
import { estadosResueltos } from '../../js/modules/estados/estados-presentacion-calculations.js';
import { tablasEstadosResueltos } from '../../js/modules/estados/estados-presentacion-ui.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { ejemploEstadosResueltos as ejemplo } from '../fixtures/estados-resueltos.js';
import { analisisHorizontalCompleto, analisisVerticalCompleto } from '../../js/modules/analisis/analisis-calculations.js';


const er = (datos, periodo = datos.periods[0]) => estadosResueltos(datos, periodo).estadoResultados;
const valor = (filas, id) => filas.find(f => f.id === id)?.valor;
function quitar(datos, id) {
  for (const p of datos.periods) {
    delete datos.reportedTotals?.[p]?.[id];
    const nombre = Object.entries(datos.accountIdentities.estadoResultados).find(([, identidad]) => identidad.idCuenta === id)?.[0];
    delete datos.estadoResultados[p][nombre];
  }
}

describe('Estado de resultados completo', () => {
  it('intercala los resultados resueltos en orden docente sin omitir cuentas', () => {
    const datos = ejemplo();
    const filas = er(datos);
    expect(valor(filas, 'is.gross_profit_reported')).toBe(30000);
    expect(valor(filas, 'is.operating_profit_reported')).toBe(11000);
    expect(valor(filas, 'presentacion.uai')).toBe(10000);
    expect(valor(filas, 'is.net_income_reported')).toBe(7000);
    const posicion = id => filas.findIndex(f => f.id === id);
    expect(posicion('is.net_sales_reported')).toBeLessThan(posicion('is.cost_of_sales_reported'));
    expect(posicion('is.cost_of_sales_reported')).toBeLessThan(posicion('is.gross_profit_reported'));
    expect(posicion('is.gross_profit_reported')).toBeLessThan(posicion('is.other_operating_expenses'));
    expect(posicion('is.other_operating_expenses')).toBeLessThan(posicion('is.operating_profit_reported'));
    expect(posicion('is.interest_expense')).toBeLessThan(posicion('presentacion.uai'));
    expect(posicion('presentacion.uai')).toBeLessThan(posicion('is.income_tax_expense'));
    expect(posicion('is.income_tax_expense')).toBeLessThan(posicion('is.net_income_reported'));
    expect(filas.find(f => f.id === 'is.interest_expense').operador).toBe('−');
    expect(filas.find(f => f.id === 'is.gross_profit_reported').origen).toBe('calculado');
    for (const nombre of Object.keys(datos.estadoResultados.Julio)) expect(filas.some(f => f.cuenta === nombre)).toBe(true);
  });

  it('sin impuesto conserva UAI y deja UN en N/D, sin tasa supuesta', () => {
    const datos = ejemplo(); quitar(datos, 'is.income_tax_expense');
    const filas = er(datos);
    expect(valor(filas, 'is.gross_profit_reported')).toBe(30000);
    expect(valor(filas, 'presentacion.uai')).toBe(10000);
    expect(valor(filas, 'is.net_income_reported')).toBeNull();
  });


  it('un impuesto vacío en el borrador no anula la UAI ni se convierte en cero', () => {
    const datos = ejemplo();
    datos.estadoResultados.Julio['Dato is.income_tax_expense'] = '';
    const filas = er(datos);
    expect(valor(filas, 'presentacion.uai')).toBe(10000);
    expect(valor(filas, 'is.net_income_reported')).toBeNull();
    expect(filas.find(f => f.id === 'is.income_tax_expense').valor).toBeNull();
    expect(datos.estadoResultados.Julio['Dato is.income_tax_expense']).toBe('');
  });

  it('cero explícito y pérdida conservan su significado', () => {
    const datos = ejemplo();
    datos.estadoResultados.Julio['Dato is.income_tax_expense'] = 0;
    expect(valor(er(datos), 'is.net_income_reported')).toBe(10000);
    datos.reportedTotals.Julio['is.net_sales_reported'].importe = 0;
    expect(valor(er(datos), 'is.gross_profit_reported')).toBe(-42000);
    expect(valor(er(datos), 'is.net_income_reported')).toBe(-62000);
  });

  it.each(['is.other_operating_expenses', 'is.interest_expense', 'is.nonoperating_income'])(
    'no convierte %s ausente en cero', id => {
      const datos = ejemplo(); quitar(datos, id);
      expect(valor(er(datos), 'is.gross_profit_reported')).toBe(30000);
      expect(valor(er(datos), 'is.net_income_reported')).toBeNull();
    }
  );

  it('no duplica un subtotal reportado y conserva su nombre propio', () => {
    const datos = registrarCuenta(ejemplo(), { periodo: 'Julio', id: 'is.gross_profit_reported', nombre: 'Resultado comercial propio', importe: 30000 });
    const filas = er(datos);
    expect(filas.filter(f => f.id === 'is.gross_profit_reported')).toHaveLength(1);
    expect(filas.find(f => f.id === 'is.gross_profit_reported')).toMatchObject({ cuenta: 'Resultado comercial propio', concepto: 'Utilidad bruta', valor: 30000, origen: 'reportado' });
    expect(valor(filas, 'is.net_income_reported')).toBe(7000);
  });

  it('conserva un importe reportado discordante y lo señala sin validarlo como cálculo', () => {
    const datos = registrarCuenta(ejemplo(), { periodo: 'Julio', id: 'is.gross_profit_reported', nombre: 'UB original', importe: 31000 });
    const fila = er(datos).find(f => f.id === 'is.gross_profit_reported');
    expect(fila.valor).toBe(31000);
    expect(fila.motivos.length).toBeGreaterThan(0);
    expect(tablasEstadosResueltos(datos, ['Julio'])).toContain('Revisar');
  });

  it('no modifica entradas, metadatos ni reportados al resolver y renderizar', () => {
    const datos = ejemplo(); const anterior = structuredClone(datos);
    estadosResueltos(datos, 'Julio'); tablasEstadosResueltos(datos, ['Julio']);
    expect(datos).toEqual(anterior);
  });
});

describe('Balance general y análisis', () => {
  it('ordena los subtotales del balance y conserva la depreciación negativa', () => {
    const base = { periods: ['2025'], balanceGeneral: { '2025': { activos: {}, pasivos: {}, patrimonio: {} } }, estadoResultados: { '2025': {} } };
    const datos = registrarCuenta(base, [
      ['bs.ppe_machinery', 'Equipo propio', 300], ['bs.cash_and_equivalents', 'Banco propio', 1000],
      ['bs.accumulated_depreciation', 'Desgaste acumulado', -50], ['bs.trade_receivables', 'Clientes propios', 200],
      ['bs.trade_payables', 'Proveedor propio', 400], ['bs.long_term_borrowings', 'Deuda propia', 200],
      ['bs.additional_paid_in_capital', 'Capital propio', 850]
    ].map(([id, nombre, importe]) => ({ id, nombre, importe, periodo: '2025', confirmado: true })));
    const filas = estadosResueltos(datos, '2025').balanceGeneral;
    expect(valor(filas, 'bs.current_assets_total')).toBe(1200);
    expect(valor(filas, 'bs.fixed_assets_net_total')).toBe(250);
    expect(valor(filas, 'bs.total_assets')).toBe(1450);
    expect(valor(filas, 'bs.total_liabilities')).toBe(600);
    expect(valor(filas, 'presentacion.pasivos_patrimonio')).toBe(1450);
    expect(valor(filas, 'bs.accumulated_depreciation')).toBe(-50);
    expect(filas.findIndex(f => f.id === 'bs.current_assets_total')).toBeLessThan(filas.findIndex(f => f.id === 'bs.ppe_machinery'));
    expect(filas.findIndex(f => f.id === 'bs.total_liabilities')).toBeLessThan(filas.findIndex(f => f.id === 'bs.total_equity'));
  });

  it('un grupo de balance sin dato no se presenta como cero', () => {
    const datos = ejemplo();
    datos.balanceGeneral.Julio.activos = { Banco: 100 };
    datos.accountTypes.activos = { Banco: 'efectivo' };
    const filas = estadosResueltos(datos, 'Julio').balanceGeneral;
    expect(valor(filas, 'bs.total_liabilities')).toBeNull();
    expect(valor(filas, 'bs.total_equity')).toBeNull();
    expect(valor(filas, 'presentacion.pasivos_patrimonio')).toBeNull();
  });

  it('AH alinea subtotal reportado/calculado y AV incluye la utilidad resuelta', () => {
    let datos = ejemplo(['2024', '2025']);
    datos = registrarCuenta(datos, { periodo: '2024', id: 'is.gross_profit_reported', nombre: 'Margen propio 2024', importe: 30000 });
    const [ah] = analisisHorizontalCompleto(datos, datos.periods);
    const ub = ah.rows.filter(f => f.id === 'is.gross_profit_reported');
    expect(ub).toHaveLength(1);
    expect(ub[0]).toMatchObject({ t1: 30000, t2: 30000, delta: 0, fuenteT1: { origen: 'reportado' }, fuenteT2: { origen: 'calculado' } });
    const av = analisisVerticalCompleto(datos, '2025');
    expect(av.estadoResultados.rows.find(f => f.id === 'is.gross_profit_reported').pctBase).toBeCloseTo(30000 / 72000, 10);
    const html = tablasEstadosResueltos(datos, datos.periods);
    expect(html).toContain('Margen propio 2024');
    expect(html).toContain('Calculado'); expect(html).toContain('Reportado');
  });

  it('AV conserva ventas netas como base con un ingreso operativo acreditado por id', () => {
    const datos = ejemplo();
    datos.estadoResultados.Julio['Dato is.other_operating_income'] = 1000;
    const av = analisisVerticalCompleto(datos, 'Julio');
    expect(av.estadoResultados.baseValor).toBe(72000);
    expect(av.estadoResultados.rows.find(f => f.id === 'is.operating_profit_reported').valor).toBe(12000);
    expect(av.estadoResultados.rows.find(f => f.id === 'is.net_income_reported').pctBase).toBeCloseTo(8000 / 72000, 10);
  });

  it('escapa nombres originales y no inventa estados sin periodos', () => {
    const datos = registrarCuenta(ejemplo(), { periodo: 'Julio', id: 'is.gross_profit_reported', nombre: '<img src=x onerror=alert(1)>', importe: 30000 });
    const html = tablasEstadosResueltos(datos, ['Julio']);
    expect(html).not.toContain('<img'); expect(html).toContain('&lt;img');
    expect(estadosResueltos(null, '2025')).toEqual({ balanceGeneral: [], estadoResultados: [] });
  });
});
