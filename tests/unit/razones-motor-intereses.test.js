import { expect, it } from 'vitest';
import { calcularRazon, evaluarDerivado } from '../../js/modules/razones/razones-motor.js';
import { entradaDesdeFilas } from './fixtures/razones-casos.js';

const cuentas = [
  ['is.sales_total',1379,1379],
  ['is.cost_of_sales_reported',463,463],
  ['is.administrative_expenses',127,127],
  ['is.selling_expenses',89,89],
  ['is.nonoperating_income',61,61],
  ['is.noninterest_nonoperating_expenses',37,37],
  ['is.interest_expense',43,43],
  ['is.income_tax_expense',79,79],
  // D-055: las cuentas no aplicables de este caso se reportan con cero explícito.
  ['is.sales_returns',0,0], ['is.sales_discounts',0,0], ['is.sales_allowances',0,0],
  ['is.operating_depreciation',0,0], ['is.operating_amortization',0,0],
  ['is.other_operating_expenses',0,0], ['is.other_operating_income',0,0]
];

it('sin línea de intereses ganados calcula utilidad neta sin intereses y sin N/D', () => {
  const entrada = entradaDesdeFilas(cuentas);
  // 1379 - 463 - 127 - 89 + 61 - 37 - 43 - 79 = 602.
  const utilidad = evaluarDerivado('rentabilidad_margen_utilidad_neta', 'derived.net_income', entrada);
  expect(utilidad.valor).toBe(602);
  expect(utilidad.motivos).toEqual([]);
  expect(calcularRazon('rentabilidad_margen_utilidad_neta', entrada).valor).toBeCloseTo(602/1379, 6);
});

it('con línea de intereses ganados suma su importe una sola vez en la utilidad neta', () => {
  const entrada = entradaDesdeFilas([...cuentas, ['is.interest_income',113,113]]);
  // La misma utilidad base más la línea de intereses: 602 + 113 = 715.
  const utilidad = evaluarDerivado('rentabilidad_margen_utilidad_neta', 'derived.net_income', entrada);
  expect(utilidad.valor).toBe(715);
  expect(utilidad.motivos).toEqual([]);
  expect(calcularRazon('rentabilidad_margen_utilidad_neta', entrada).valor).toBeCloseTo(715/1379, 6);
});
