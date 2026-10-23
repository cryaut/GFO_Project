const manual = [
  ['bs.cash_and_equivalents',100,150], ['bs.trade_receivables',200,300],
  ['bs.inventory_total',300,500], ['bs.ppe_land',500,700], ['bs.accumulated_depreciation',-100,-200],
  ['bs.trade_payables',100,150], ['bs.short_term_borrowings',50,50], ['bs.long_term_borrowings',200,300],
  ['bs.share_capital',500,700], ['bs.retained_earnings',150,250],
  ['is.sales_total',600,800], ['is.cost_of_sales_reported',300,400],
  ['is.administrative_expenses',60,80], ['is.selling_expenses',30,40],
  ['is.nonoperating_income',10,20], ['is.noninterest_nonoperating_expenses',5,10],
  ['is.interest_expense',5,10], ['is.income_tax_expense',10,20],
  ['supp.credit_sales',500,700], ['supp.supplier_payments',250,300]
];

// Asignación por id del caso MUNO MODA y mapeo explícito de sus cinco rótulos
// ambiguos, según las notas del caso. No hay una inferencia por nombres.
const muno = [
  ['bs.cash_and_equivalents',45000,52000], ['bs.trade_receivables',120000,135000],
  ['bs.inventory_total',180000,195000], ['bs.other_current_assets',25000,30000],
  ['bs.ppe_land',150000,150000], ['bs.ppe_buildings',200000,200000],
  ['bs.ppe_machinery',120000,120000], ['bs.ppe_vehicles',60000,60000],
  ['bs.accumulated_depreciation',-98525,-116475], ['bs.trade_payables',85000,92000],
  ['bs.other_current_liabilities',60000,65000], ['bs.current_provisions',15000,18000],
  ['bs.long_term_borrowings',80000,45000], ['bs.other_noncurrent_liabilities',43860,23085],
  ['bs.share_capital',300000,300000], ['bs.other_reserves',80000,80000], ['bs.retained_earnings',137615,202440],
  ['is.sales_total',850000,920000], ['is.cost_of_sales_reported',510000,545000],
  ['is.administrative_expenses',120000,130000], ['is.selling_expenses',85000,90000],
  ['is.nonoperating_income',15000,18000], ['is.noninterest_nonoperating_expenses',10000,12000],
  ['is.interest_expense',12600,11250], ['is.income_tax_expense',38220,44925]
];

export function entradaDesdeFilas(filas, indice = 1) {
  return { periodos:{ actual:indice ? '2024' : '2023', anterior:indice ? '2023' : null, cantidad:2, indice },
    composicionIngresos:{ current:'excluye_intereses', previous:'excluye_intereses' },
    cuentas:filas.map(([id,anterior,actual]) => indice
      ? { id, estado:'reconocida', origen:'manual', current:actual, previous:anterior }
      : { id, estado:'reconocida', origen:'manual', current:anterior }) };
}

export const entradaManual = () => entradaDesdeFilas(manual);
export const entradaMuno = (indice = 1) => entradaDesdeFilas(muno, indice);
