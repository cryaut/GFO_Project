const manual = [
  ['bs.cash_and_equivalents',100,150], ['bs.trade_receivables',200,300],
  ['bs.inventory_total',300,500], ['bs.ppe_land',500,700], ['bs.accumulated_depreciation',-100,-200],
  ['bs.trade_payables',100,150], ['bs.short_term_borrowings',50,50], ['bs.long_term_borrowings',200,300],
  ['bs.share_capital',500,700], ['bs.retained_earnings',150,250],
  ['is.sales_total',600,800], ['is.cost_of_sales_reported',300,400],
  ['is.administrative_expenses',60,80], ['is.selling_expenses',30,40],
  ['is.nonoperating_income',10,20], ['is.noninterest_nonoperating_expenses',5,10],
  ['is.interest_expense',5,10], ['is.income_tax_expense',10,20],
  ['supp.credit_sales',500,700], ['supp.supplier_payments',250,300],
  // D-055: cuentas no aplicables declaradas en cero, en ambos periodos.
  // Los desgloses de inventario, ventas y costo no se declaran: se usan sus totales reportados.
  ['bs.short_term_investments',0,0], ['bs.other_current_receivables',0,0],
  ['bs.prepaid_expenses',0,0], ['bs.other_current_assets',0,0],
  ['bs.ppe_buildings',0,0], ['bs.ppe_machinery',0,0], ['bs.ppe_vehicles',0,0],
  ['bs.ppe_furniture',0,0], ['bs.ppe_other',0,0], ['bs.intangible_assets',0,0],
  ['bs.long_term_investments',0,0], ['bs.other_noncurrent_assets',0,0],
  ['bs.current_portion_long_term_debt',0,0], ['bs.taxes_payable',0,0],
  ['bs.accrued_expenses_payable',0,0], ['bs.current_provisions',0,0],
  ['bs.other_current_liabilities',0,0], ['bs.long_term_provisions',0,0],
  ['bs.other_noncurrent_liabilities',0,0], ['bs.additional_paid_in_capital',0,0],
  ['bs.legal_reserve',0,0], ['bs.other_reserves',0,0],
  ['bs.current_year_result_equity',0,0], ['bs.other_equity_components',0,0],
  ['is.sales_returns',0,0], ['is.sales_discounts',0,0], ['is.sales_allowances',0,0],
  ['is.operating_depreciation',0,0], ['is.operating_amortization',0,0],
  ['is.other_operating_expenses',0,0], ['is.other_operating_income',0,0]
];

export function entradaDesdeFilas(filas, indice = 1) {
  return { periodos:{ actual:indice ? '2024' : '2023', anterior:indice ? '2023' : null, cantidad:2, indice },
    composicionIngresos:{ current:'excluye_intereses', previous:'excluye_intereses' },
    cuentas:filas.map(([id,anterior,actual]) => indice
      ? { id, estado:'reconocida', origen:'manual', current:actual, previous:anterior }
      : { id, estado:'reconocida', origen:'manual', current:anterior }) };
}

export const entradaManual = () => entradaDesdeFilas(manual);
