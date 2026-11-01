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
