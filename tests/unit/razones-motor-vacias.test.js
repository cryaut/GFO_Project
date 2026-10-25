import { expect, it } from 'vitest';
import { ESPECIFICACION_RAZONES } from '../../js/modules/razones/especificacion-razones.js';
import { calcularRazon, calcularRazonConTraza } from '../../js/modules/razones/razones-motor.js';
import { ejemploV3, entradaEjemplo } from './fixtures/razones-ejemplo.js';

// Anexo de D-055: lista independiente de las políticas de la especificación.
const cuentas = [
  'bs.accrued_expenses_payable', 'bs.additional_paid_in_capital', 'bs.cash_and_equivalents',
  'bs.current_portion_long_term_debt', 'bs.current_provisions', 'bs.current_year_result_equity',
  'bs.intangible_assets', 'bs.inventory_finished_goods', 'bs.inventory_merchandise',
  'bs.inventory_raw_materials', 'bs.inventory_work_in_process', 'bs.legal_reserve',
  'bs.long_term_borrowings', 'bs.long_term_investments', 'bs.long_term_provisions',
  'bs.other_current_assets', 'bs.other_current_liabilities', 'bs.other_current_receivables',
  'bs.other_equity_components', 'bs.other_noncurrent_assets', 'bs.other_noncurrent_liabilities',
  'bs.other_reserves', 'bs.ppe_buildings', 'bs.ppe_furniture', 'bs.ppe_land',
  'bs.ppe_machinery', 'bs.ppe_other', 'bs.ppe_vehicles', 'bs.prepaid_expenses',
  'bs.retained_earnings', 'bs.share_capital', 'bs.short_term_borrowings',
  'bs.short_term_investments', 'bs.taxes_payable', 'bs.trade_payables', 'bs.trade_receivables',
  'is.administrative_expenses', 'is.income_tax_expense', 'is.interest_expense',
  'is.merchandise_cost', 'is.noninterest_nonoperating_expenses', 'is.nonoperating_income',
  'is.operating_amortization', 'is.operating_depreciation', 'is.other_operating_expenses',
  'is.other_operating_income', 'is.other_sales_revenue', 'is.product_cost', 'is.product_sales',
  'is.sales_allowances', 'is.sales_discounts', 'is.sales_returns', 'is.selling_expenses',
  'is.service_cost', 'is.service_revenue'
];
const entradaBase = entradaEjemplo(1); // 2024, con saldo anterior de 2023 disponible.
const numero = valor => typeof valor === 'number' && Number.isFinite(valor);
const datoBase = (id, periodo) => entradaBase.cuentas.find(fila => fila.id === id)?.[periodo];

// Recorrido estático de dependencias, sin ejecutar el intérprete ni calcular
// importes. Una rama de componentes queda sustituida si su total reportado
// tiene un número en el v3. Se conservan ambas rutas para clasificar cobertura.
function dependencias(razon, nodo = ESPECIFICACION_RAZONES[razon].razon.formula, periodo = 'current', sustituciones = []) {
  const doc = ESPECIFICACION_RAZONES[razon];
  const p = nodo.period || periodo;
  const recorrer = hijo => dependencias(razon, hijo, p, sustituciones);
  switch (nodo.op) {
    case 'constant': return [];
    case 'account': return [{ id:nodo.id, periodo:p, sustituciones }];
    case 'sum_accounts': return doc.conjuntos[nodo.account_set].map(id => ({ id, periodo:p, sustituciones }));
    case 'derived': return recorrer(doc.derivados.find(derivado => derivado.id === nodo.id).formula);
    case 'ratio': return dependencias(nodo.id, undefined, 'current', sustituciones);
    case 'average': return [...recorrer(nodo.of), ...dependencias(razon, nodo.of, 'previous', sustituciones)];
    case 'add':
    case 'multiply': return nodo.operands.flatMap(recorrer);
    case 'subtract': return [nodo.left,nodo.right].flatMap(recorrer);
    case 'divide': return [nodo.numerator,nodo.denominator].flatMap(recorrer);
    case 'reported_or_calculate': {
      const valor = datoBase(nodo.reported, p);
      const total = { id:nodo.reported, periodo:p, valor };
      return [{ id:nodo.reported, periodo:p, sustituciones },
        ...dependencias(razon, nodo.calculation, p, numero(valor) ? [...sustituciones,total] : sustituciones)];
    }
    default: throw new Error(`Dependencia sin clasificar: ${nodo.op}`);
  }
}

const rutas = Object.fromEntries(Object.keys(ESPECIFICACION_RAZONES).map(razon => [razon,dependencias(razon)]));
const casos = cuentas.flatMap(cuenta => Object.entries(rutas).flatMap(([razon,todas]) => {
  const usadas = todas.filter(ruta => ruta.id === cuenta);
  if (!usadas.length) return [];
  const efectivas = usadas.filter(ruta => ruta.sustituciones.length === 0);
  const periodos = [...new Set(efectivas.map(ruta => ruta.periodo))];
  const sustituciones = [...new Map(usadas.flatMap(ruta => ruta.sustituciones)
    .map(total => [`${total.id}:${total.periodo}`,total])).values()];
  return [{ cuenta, razon, periodos, sustituciones, clase:efectivas.length ? 'dato necesario' : 'total reportado conservado' }];
}));

it('cubre las 55 cuentas de D-055 y cada razón con dependencia real en el árbol', () => {
  expect(cuentas).toHaveLength(55);
  expect(new Set(cuentas).size).toBe(55);
  expect([...new Set(casos.map(caso => caso.cuenta))].sort()).toEqual([...cuentas].sort());
  for (const cuenta of cuentas) {
    expect(entradaBase.cuentas.find(fila => fila.id === cuenta), cuenta).toBeDefined();
    for (const doc of Object.values(ESPECIFICACION_RAZONES)) {
      const meta = doc.cuentas.find(fila => fila.id === cuenta);
      if (meta) expect(meta.absence_policy, `${doc.razon.id}: ${cuenta}`).toBe('requires_data');
    }
  }
});

it.each(casos)('D-055: $cuenta ausente en $razon ($clase)', caso => {
  const entrada = entradaEjemplo(1);
  entrada.cuentas = entrada.cuentas.filter(fila => fila.id !== caso.cuenta);
  const traza = calcularRazonConTraza(caso.razon, entrada);
  const resultado = traza.resultado;
  if (caso.periodos.length) {
    expect(resultado.valor).toBeNull();
    expect(resultado.metodo).toBe('not_applicable');
    for (const periodo of caso.periodos) {
      expect(resultado.motivos).toEqual(expect.arrayContaining([
        expect.objectContaining({ codigo:'missing_required_account_data', id:caso.cuenta, periodo })
      ]));
    }
  } else {
    // No se inventa N/D cuando un total numérico sustituye a componentes.
    // El esperado viene de Esperados, además de comprobar igualdad con la base.
    const referencia = ejemploV3.esperados.find(celda => celda.id === caso.razon && celda.periodo === '2024' && !celda.control);
    expect(referencia.valor).not.toBeNull();
    const esperado = referencia.valor / (referencia.unidad === 'porcentaje' ? 100 : 1);
    expect(resultado.valor).toBeCloseTo(esperado, 6);
    expect(resultado.valor).toBe(calcularRazon(caso.razon, entradaEjemplo(1)).valor);
    expect(resultado.motivos.some(motivo => motivo.codigo === 'missing_required_account_data' && motivo.id === caso.cuenta)).toBe(false);
    expect(caso.sustituciones.length).toBeGreaterThan(0);
    for (const total of caso.sustituciones) {
      expect(traza.lecturas).toEqual(expect.arrayContaining([
        { clave:`${total.id}:${total.periodo}`, valor:total.valor }
      ]));
    }
  }
});

it('ceros explícitos en los componentes del numerador dan razón corriente cero, con denominador válido', () => {
  const entrada = entradaEjemplo(1);
  const numerador = [
    'bs.cash_and_equivalents', 'bs.short_term_investments', 'bs.trade_receivables',
    'bs.other_current_receivables', 'bs.prepaid_expenses', 'bs.other_current_assets',
    'bs.inventory_merchandise', 'bs.inventory_raw_materials', 'bs.inventory_work_in_process',
    'bs.inventory_finished_goods'
  ];
  for (const cuenta of numerador) entrada.cuentas.find(fila => fila.id === cuenta).current = 0;
  expect(calcularRazon('liquidez_razon_corriente', entrada)).toMatchObject({ valor:0, metodo:'direct_closing', motivos:[] });
});
