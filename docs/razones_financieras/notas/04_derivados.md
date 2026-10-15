# 04 — Derivados

Tabla de variables intermedias, copiada de `instrucciones_agente_json_razones_financieras_v3.md`. Cada JSON la replica en su sección `derived_values` (autonomía por archivo). Regla de precedencia: primero el total reportado válido; si no existe, la suma de componentes.

| Variable | Definición |
|---|---|
| `ventas_brutas` | `is.sales_total` si existe; si no, suma de `is.gross_sales_components`. |
| `deducciones_ventas` | Suma de `is.sales_returns`, `is.sales_discounts` y `is.sales_allowances`. Las ausentes valen cero. |
| `ventas_netas` | `is.net_sales_reported` si existe; si no, `ventas_brutas − deducciones_ventas` (D7). |
| `costo_ventas` | `is.cost_of_sales_reported` si existe; si no, suma de `is.cost_of_sales_components`. |
| `utilidad_bruta` | `is.gross_profit_reported` si existe; si no, `ventas_netas − costo_ventas`. |
| `gastos_operativos` | Suma de `is.operating_expense_components`. Las ausentes valen cero. |
| `utilidad_operativa` | `is.operating_profit_reported` si existe; si no, `utilidad_bruta + is.other_operating_income − gastos_operativos` (D5). |
| `utilidad_neta` | `is.net_income_reported` si existe; si no, `utilidad_operativa + is.nonoperating_income − is.noninterest_nonoperating_expenses − is.interest_expense − is.income_tax_expense` (D6). |
| `activo_corriente` | `bs.current_assets_total` si existe; si no, suma de `bs.current_assets_components` (ver R5 sobre inventario total). |
| `pasivo_corriente` | `bs.current_liabilities_total` si existe; si no, suma de `bs.current_liabilities_components` (D14). |
| `inventario_total` | `bs.inventory_total` si existe; si no, suma de `bs.inventory_components`. |
| `activos_fijos_netos` | `bs.fixed_assets_net_total` si existe; si no, suma de `bs.ppe_*` más `bs.accumulated_depreciation` con su signo negativo (D3). |
| `pasivo_no_corriente` | Suma de `bs.long_term_borrowings`, `bs.long_term_provisions` y `bs.other_noncurrent_liabilities`. |
| `pasivo_total` | `bs.total_liabilities` si existe; si no, `pasivo_corriente + pasivo_no_corriente`. |
| `activos_totales` | `bs.total_assets` si existe; si no, `activo_corriente + activos_fijos_netos + bs.intangible_assets + bs.long_term_investments + bs.other_noncurrent_assets` (D4). |
| `patrimonio_total` | `bs.total_equity` si existe; si no, suma de `bs.patrimony_components`. |
| `cxc_saldo` | Saldo de cierre de `bs.trade_receivables`. |
| `cxp_saldo` | Saldo de cierre de `bs.trade_payables`. |
| `ventas_credito` | `supp.credit_sales` del periodo actual. No se aproxima con otra cuenta (D8). |
| `pagos_proveedores` | `supp.supplier_payments` del periodo actual. |
| `compras_credito` | `pagos_proveedores + cxp_saldo(actual) − cxp_saldo(anterior)` (D10). |
| `gasto_intereses` | `is.interest_expense`. |

## Conjuntos (`account_sets`)

Conjuntos definidos por la especificación §6 y por esta tabla:

| Conjunto | Miembros |
|---|---|
| `bs.current_assets_components` | `bs.cash_and_equivalents`, `bs.short_term_investments`, `bs.trade_receivables`, `bs.other_current_receivables`, `bs.inventory_total`, `bs.inventory_merchandise`, `bs.inventory_raw_materials`, `bs.inventory_work_in_process`, `bs.inventory_finished_goods`, `bs.prepaid_expenses`, `bs.other_current_assets` (el total de inventario entra como ranura R5: si está reportado, sus componentes aportan cero en esta agregación) |
| `bs.inventory_components` | `bs.inventory_merchandise`, `bs.inventory_raw_materials`, `bs.inventory_work_in_process`, `bs.inventory_finished_goods` |
| `bs.current_liabilities_components` | `bs.trade_payables`, `bs.short_term_borrowings`, `bs.current_portion_long_term_debt`, `bs.taxes_payable`, `bs.accrued_expenses_payable`, `bs.current_provisions`, `bs.other_current_liabilities` |
| `bs.fixed_assets_components` | `bs.ppe_land`, `bs.ppe_buildings`, `bs.ppe_machinery`, `bs.ppe_vehicles`, `bs.ppe_furniture`, `bs.ppe_other`, `bs.accumulated_depreciation` (la depreciación se suma con su signo negativo, D3) |
| `bs.noncurrent_liabilities_components` | `bs.long_term_borrowings`, `bs.long_term_provisions`, `bs.other_noncurrent_liabilities` |
| `bs.patrimony_components` | `bs.share_capital`, `bs.additional_paid_in_capital`, `bs.legal_reserve`, `bs.other_reserves`, `bs.retained_earnings`, `bs.current_year_result_equity`, `bs.other_equity_components` |
| `is.gross_sales_components` | `is.product_sales`, `is.service_revenue`, `is.other_sales_revenue` |
| `is.sales_deduction_components` | `is.sales_returns`, `is.sales_discounts`, `is.sales_allowances` |
| `is.cost_of_sales_components` | `is.merchandise_cost`, `is.product_cost`, `is.service_cost` |
| `is.operating_expense_components` | `is.selling_expenses`, `is.administrative_expenses`, `is.operating_depreciation`, `is.operating_amortization`, `is.other_operating_expenses` |

Los nombres `bs.fixed_assets_components` y `bs.noncurrent_liabilities_components` son convención de esta implementación (la especificación no los nombra); la composición sale de D3 y de la fila `pasivo_no_corriente`.
