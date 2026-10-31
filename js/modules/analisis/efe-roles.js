// D-066: rol del EFE por id del catálogo de cuentas. El tipo general (tipoApp)
// mezcla cuentas que el flujo de efectivo separa: gastos acumulados, impuestos
// por pagar, provisiones y otros pasivos corrientes son operación, mientras que
// los préstamos de corto plazo son financiamiento; las inversiones de corto
// plazo son inversión, no capital de trabajo; las provisiones de largo plazo
// son operación. La depreciación acumulada se suma como no efectivo en la
// operación. Los totales reportados también tienen rol aquí, pero no entran en
// el EFE (D-067): el estado usa sus componentes.
//
// La tabla vive en este archivo y no en cuentas-catalogo.js, porque esa rama
// también la cambia feat/razones-app-final.
export const ROLES_EFE = {
  efectivo: [
    'bs.cash_and_equivalents'
  ],
  operacion: [
    'bs.trade_receivables',
    'bs.inventory_merchandise', 'bs.inventory_raw_materials',
    'bs.inventory_work_in_process', 'bs.inventory_finished_goods',
    'bs.inventory_total',
    'bs.prepaid_expenses', 'bs.other_current_receivables', 'bs.other_current_assets',
    'bs.accumulated_depreciation',
    'bs.trade_payables', 'bs.taxes_payable', 'bs.accrued_expenses_payable',
    'bs.current_provisions', 'bs.other_current_liabilities', 'bs.long_term_provisions',
    'bs.current_assets_total', 'bs.current_liabilities_total'
  ],
  inversion: [
    'bs.ppe_buildings', 'bs.ppe_furniture', 'bs.ppe_land',
    'bs.ppe_machinery', 'bs.ppe_other', 'bs.ppe_vehicles',
    'bs.intangible_assets', 'bs.long_term_investments',
    'bs.other_noncurrent_assets', 'bs.short_term_investments',
    'bs.total_assets', 'bs.fixed_assets_net_total'
  ],
  financiamiento: [
    'bs.short_term_borrowings', 'bs.current_portion_long_term_debt',
    'bs.long_term_borrowings', 'bs.other_noncurrent_liabilities',
    'bs.total_liabilities'
  ]
};

const rolPorId = new Map(Object.entries(ROLES_EFE).flatMap(([rol, ids]) => ids.map(id => [id, rol])));

// Rol del EFE para un id del catálogo; null si el id no existe o no tiene rol.
export function rolEFE(id) {
  return id ? rolPorId.get(id) ?? null : null;
}

// D-067: componentes del catálogo de cada total reportado del balance. Un total
// se excluye del EFE solo cuando alguna de sus componentes está en los datos:
// entonces la variación la explican ellas y el total duplicaría. Sin
// componentes en los datos, el total es el único dato de ese concepto y se
// conserva (por ejemplo un «Inventario» sin desglose). Las listas cubren las
// componentes brutas; la depreciación acumulada va en su propio renglón.
export const COMPONENTES_TOTALES = {
  'bs.inventory_total': [
    'bs.inventory_merchandise', 'bs.inventory_raw_materials',
    'bs.inventory_work_in_process', 'bs.inventory_finished_goods'
  ],
  'bs.current_assets_total': [
    'bs.cash_and_equivalents', 'bs.trade_receivables', 'bs.other_current_receivables',
    'bs.prepaid_expenses', 'bs.other_current_assets', 'bs.short_term_investments',
    'bs.inventory_merchandise', 'bs.inventory_raw_materials',
    'bs.inventory_work_in_process', 'bs.inventory_finished_goods'
  ],
  'bs.fixed_assets_net_total': [
    'bs.ppe_buildings', 'bs.ppe_furniture', 'bs.ppe_land', 'bs.ppe_machinery',
    'bs.ppe_other', 'bs.ppe_vehicles', 'bs.intangible_assets',
    'bs.other_noncurrent_assets', 'bs.long_term_investments'
  ],
  'bs.total_assets': [
    'bs.cash_and_equivalents', 'bs.trade_receivables', 'bs.other_current_receivables',
    'bs.prepaid_expenses', 'bs.other_current_assets', 'bs.short_term_investments',
    'bs.inventory_merchandise', 'bs.inventory_raw_materials',
    'bs.inventory_work_in_process', 'bs.inventory_finished_goods',
    'bs.ppe_buildings', 'bs.ppe_furniture', 'bs.ppe_land', 'bs.ppe_machinery',
    'bs.ppe_other', 'bs.ppe_vehicles', 'bs.intangible_assets',
    'bs.other_noncurrent_assets', 'bs.long_term_investments'
  ],
  'bs.current_liabilities_total': [
    'bs.trade_payables', 'bs.taxes_payable', 'bs.accrued_expenses_payable',
    'bs.current_provisions', 'bs.other_current_liabilities',
    'bs.short_term_borrowings', 'bs.current_portion_long_term_debt'
  ],
  'bs.total_liabilities': [
    'bs.trade_payables', 'bs.taxes_payable', 'bs.accrued_expenses_payable',
    'bs.current_provisions', 'bs.other_current_liabilities',
    'bs.short_term_borrowings', 'bs.current_portion_long_term_debt',
    'bs.long_term_borrowings', 'bs.long_term_provisions', 'bs.other_noncurrent_liabilities'
  ],
  'bs.total_equity': [
    'bs.share_capital', 'bs.additional_paid_in_capital', 'bs.retained_earnings',
    'bs.current_year_result_equity', 'bs.legal_reserve', 'bs.other_reserves',
    'bs.other_equity_components'
  ]
};
