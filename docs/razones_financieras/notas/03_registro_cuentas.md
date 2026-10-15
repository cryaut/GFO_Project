# 03 — Registro de cuentas (Fase 1b)

Catálogo completo investigado: 71 cuentas — 26 mapeadas en el caso MUNO MODA S.A., 2 suplementarias y 43 del catálogo de la especificación que intervienen en las fórmulas (o como candidatas a subtotal reportado). Estado de investigación: `investigada` si todas sus fuentes están `confirmada` en `02_fuentes.md`; `ambigua` si el nombre del caso no fija su detalle (4 cuentas, motivo en `ambiguities` de cada JSON). Máximo 3 fuentes por cuenta (R4).

| id | Nombre canónico | Sinónimo del caso | Clasificación | Política de ausencia | Estado | Fuentes | Razones |
|---|---|---|---|---|---|---|---|
| `bs.cash_and_equivalents` | Efectivo y equivalentes | Efectivo | Activo corriente | zero_if_not_reported | investigada | F1 F2 S3 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.short_term_investments` | Inversiones de corto plazo | — | Activo corriente | zero_if_not_reported | investigada | F2 S1 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.trade_receivables` | Cuentas por cobrar comerciales | Cuentas por Cobrar | Activo corriente | zero_if_not_reported | investigada | F1 F2 S1 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.other_current_receivables` | Otras cuentas por cobrar corrientes | — | Activo corriente | zero_if_not_reported | investigada | F2 S1 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.inventory_total` | Inventario total | Inventario | Inventario | zero_if_not_reported | investigada | F1 F2 S2 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.inventory_merchandise` | Inventario de mercaderías | — | Inventario / activo corriente | zero_if_not_reported | investigada | F2 S2 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.inventory_raw_materials` | Inventario de materias primas | — | Inventario / activo corriente | zero_if_not_reported | investigada | F2 S2 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.inventory_work_in_process` | Inventario de productos en proceso | — | Inventario / activo corriente | zero_if_not_reported | investigada | F2 S2 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.inventory_finished_goods` | Inventario de productos terminados | — | Inventario / activo corriente | zero_if_not_reported | investigada | F2 S2 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.prepaid_expenses` | Gastos pagados por anticipado | — | Activo corriente | zero_if_not_reported | investigada | F2 S1 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.other_current_assets` | Otros activos corrientes | Activos Corrientes Otros | Activo corriente | zero_if_not_reported | investigada | F1 F2 S1 | 1, 2, 3, 7, 9, 12, 13, 14, 15, 19, 20 |
| `bs.current_assets_total` | Total de activos corrientes | — | Subtotal reportado | not_applicable | investigada | F2 S1 | 1, 2, 3, 7, 9, 19 |
| `bs.ppe_land` | Terrenos | Terrenos | Activo fijo, bruto | zero_if_not_reported | investigada | F1 F2 S5 | 7, 9, 18, 19 |
| `bs.ppe_buildings` | Edificios e instalaciones | Edificios | Activo fijo, bruto | zero_if_not_reported | investigada | F1 F2 S5 | 7, 9, 18, 19 |
| `bs.ppe_machinery` | Maquinaria y equipo | Equipos | Activo fijo, bruto | zero_if_not_reported | ambigua | F1 F2 S5 | 7, 9, 18, 19 |
| `bs.ppe_vehicles` | Vehículos | Vehiculos | Activo fijo, bruto | zero_if_not_reported | investigada | F1 F2 S5 | 7, 9, 18, 19 |
| `bs.ppe_furniture` | Mobiliario y equipo de oficina | — | Activo fijo, bruto | zero_if_not_reported | investigada | F2 S5 | 7, 9, 18, 19 |
| `bs.ppe_other` | Otros activos fijos tangibles | — | Activo fijo, bruto | zero_if_not_reported | investigada | F2 S5 | 7, 9, 18, 19 |
| `bs.accumulated_depreciation` | Depreciación acumulada | Depreciacion Acumulada | Correctora, negativa | requires_data | investigada | F1 F2 S5 | 7, 9, 18, 19 |
| `bs.fixed_assets_net_total` | Total de activos fijos netos | — | Subtotal reportado | not_applicable | investigada | F2 S1 | 7, 9, 18, 19 |
| `bs.intangible_assets` | Activos intangibles | (no aparece en el caso) | Activo no corriente | zero_if_not_reported | investigada | F1 F2 S8 | 7, 9, 19 |
| `bs.long_term_investments` | Inversiones de largo plazo | — | Activo no corriente | zero_if_not_reported | investigada | F2 S1 | 7, 9, 19 |
| `bs.other_noncurrent_assets` | Otros activos no corrientes | — | Activo no corriente | zero_if_not_reported | investigada | F2 S1 | 7, 9, 19 |
| `bs.total_assets` | Total de activos | — | Total reportado | not_applicable | investigada | F2 S1 | 7, 9, 19 |
| `bs.trade_payables` | Cuentas por pagar comerciales | Cuentas por Pagar | Pasivo corriente | zero_if_not_reported | investigada | F1 F2 S1 | 1, 2, 3, 9, 10, 16, 17, 20 |
| `bs.short_term_borrowings` | Préstamos de corto plazo | — | Pasivo corriente | zero_if_not_reported | investigada | F2 S1 | 1, 2, 3, 9, 10, 16, 17, 20 |
| `bs.current_portion_long_term_debt` | Porción corriente de deuda de largo plazo | — | Pasivo corriente | zero_if_not_reported | investigada | F2 S1 | 1, 2, 3, 9, 10, 16, 17, 20 |
| `bs.taxes_payable` | Impuestos por pagar | — | Pasivo corriente | zero_if_not_reported | investigada | F2 S1 | 1, 2, 3, 9, 10, 16, 17, 20 |
| `bs.accrued_expenses_payable` | Gastos acumulados por pagar | — | Pasivo corriente | zero_if_not_reported | investigada | F2 S1 | 1, 2, 3, 9, 10, 16, 17, 20 |
| `bs.current_provisions` | Provisiones corrientes | Provisiones | Pasivo corriente | zero_if_not_reported | investigada | F1 F2 S7 | 1, 2, 3, 9, 10, 16, 17, 20 |
| `bs.other_current_liabilities` | Otros pasivos corrientes | Pasivo Corto Plazo | Pasivo corriente | zero_if_not_reported | ambigua | F1 F2 S1 | 1, 2, 3, 9, 10, 16, 17, 20 |
| `bs.current_liabilities_total` | Total de pasivos corrientes | — | Subtotal reportado | not_applicable | investigada | F2 S1 | 1, 2, 3, 9, 10 |
| `bs.long_term_borrowings` | Deudas de largo plazo | Pasivo Largo Plazo | Pasivo no corriente | zero_if_not_reported | ambigua | F1 F2 S1 | 9, 10 |
| `bs.long_term_provisions` | Provisiones de largo plazo | — | Pasivo no corriente | zero_if_not_reported | investigada | F2 S7 | 9, 10 |
| `bs.other_noncurrent_liabilities` | Otros pasivos no corrientes | Otros Pasivos | Pasivo no corriente | zero_if_not_reported | investigada | F1 F2 S1 | 9, 10 |
| `bs.total_liabilities` | Total de pasivos | — | Total reportado | not_applicable | investigada | F2 S1 | 9, 10 |
| `bs.share_capital` | Capital social | Capital Social | Patrimonio | zero_if_not_reported | investigada | F1 F2 S1 | 8, 10 |
| `bs.additional_paid_in_capital` | Aportes adicionales de capital | — | Patrimonio | zero_if_not_reported | investigada | F2 S1 | 8, 10 |
| `bs.legal_reserve` | Reserva legal | — | Patrimonio | zero_if_not_reported | investigada | F2 S1 | 8, 10 |
| `bs.other_reserves` | Otras reservas patrimoniales | Reservas | Patrimonio | zero_if_not_reported | ambigua | F1 F2 S1 | 8, 10 |
| `bs.retained_earnings` | Utilidades retenidas | Utilidades Acumuladas | Patrimonio | zero_if_not_reported | investigada | F1 F2 S1 | 8, 10 |
| `bs.current_year_result_equity` | Resultado del período incluido en patrimonio | — | Patrimonio | zero_if_not_reported | investigada | F2 S1 | 8, 10 |
| `bs.other_equity_components` | Otros componentes del patrimonio | — | Patrimonio | zero_if_not_reported | investigada | F2 S1 | 8, 10 |
| `bs.total_equity` | Total patrimonio | — | Total reportado | not_applicable | investigada | F2 S1 | 8, 10 |
| `is.sales_total` | Ventas totales | Ventas | Ingreso bruto | not_applicable | investigada | F1 F2 S1 | 4, 5, 6, 7, 8, 11, 18, 19 |
| `is.net_sales_reported` | Ventas netas reportadas | — | Total reportado, ingreso | not_applicable | investigada | F2 S1 | 4, 5, 6, 7, 8, 11, 18, 19 |
| `is.product_sales` | Ventas de productos | — | Ingreso bruto | zero_if_not_reported | investigada | F2 S1 | 4, 5, 6, 7, 8, 11, 18, 19 |
| `is.service_revenue` | Ingresos por servicios | — | Ingreso bruto | zero_if_not_reported | investigada | F2 S1 | 4, 5, 6, 7, 8, 11, 18, 19 |
| `is.other_sales_revenue` | Otras ventas ordinarias | — | Ingreso bruto | zero_if_not_reported | investigada | F2 S1 | 4, 5, 6, 7, 8, 11, 18, 19 |
| `is.sales_returns` | Devoluciones sobre ventas | — | Contra-ingreso, correctora | zero_if_not_reported | investigada | F2 S1 | 4, 5, 6, 7, 8, 11, 18, 19 |
| `is.sales_discounts` | Descuentos sobre ventas | — | Contra-ingreso, correctora | zero_if_not_reported | investigada | F2 S1 | 4, 5, 6, 7, 8, 11, 18, 19 |
| `is.sales_allowances` | Rebajas sobre ventas | — | Contra-ingreso, correctora | zero_if_not_reported | investigada | F2 S1 | 4, 5, 6, 7, 8, 11, 18, 19 |
| `is.cost_of_sales_reported` | Costo de ventas reportado | Costo de Ventas | Costo | not_applicable | investigada | F1 F2 S2 | 4, 5, 6, 7, 8, 11, 12, 13, 20 |
| `is.merchandise_cost` | Costo de mercadería vendida | — | Costo | zero_if_not_reported | investigada | F2 S2 | 4, 5, 6, 7, 8, 11, 12, 13, 20 |
| `is.product_cost` | Costo de productos vendidos | — | Costo | zero_if_not_reported | investigada | F2 S2 | 4, 5, 6, 7, 8, 11, 12, 13, 20 |
| `is.service_cost` | Costo de servicios | — | Costo | zero_if_not_reported | investigada | F2 S1 | 4, 5, 6, 7, 8, 11, 12, 13, 20 |
| `is.gross_profit_reported` | Utilidad bruta reportada | — | Total reportado, resultado | not_applicable | investigada | F2 S1 | 4, 5, 6, 7, 8, 11 |
| `is.selling_expenses` | Gastos de ventas | Gastos de Ventas | Gasto operativo | zero_if_not_reported | investigada | F1 F2 S1 | 5, 6, 7, 8, 11 |
| `is.administrative_expenses` | Gastos administrativos | Gastos de Administracion | Gasto operativo | zero_if_not_reported | investigada | F1 F2 S1 | 5, 6, 7, 8, 11 |
| `is.operating_depreciation` | Depreciación operativa | — | Gasto operativo | zero_if_not_reported | investigada | F2 S5 | 5, 6, 7, 8, 11 |
| `is.operating_amortization` | Amortización operativa | — | Gasto operativo | zero_if_not_reported | investigada | F2 S8 | 5, 6, 7, 8, 11 |
| `is.other_operating_expenses` | Otros gastos operativos | — | Gasto operativo | zero_if_not_reported | investigada | F2 S1 | 5, 6, 7, 8, 11 |
| `is.other_operating_income` | Otros ingresos operativos | — | Ingreso operativo | zero_if_not_reported | investigada | F2 S1 | 5, 6, 7, 8, 11 |
| `is.operating_profit_reported` | Utilidad operativa reportada | — | Total reportado, resultado | not_applicable | investigada | F2 S1 | 5, 6, 7, 8, 11 |
| `is.nonoperating_income` | Ingresos no operativos | Otros Ingresos | No operativo | zero_if_not_reported | investigada | F1 F2 S1 | 6, 7, 8 |
| `is.noninterest_nonoperating_expenses` | Gastos no operativos distintos de intereses | Otros Gastos | No operativo | zero_if_not_reported | investigada | F1 F2 S1 | 6, 7, 8 |
| `is.interest_expense` | Gastos por intereses | Gastos por Intereses | Financiero, intereses | zero_if_not_reported | investigada | F1 F2 S6 | 6, 7, 8, 11 |
| `is.income_tax_expense` | Gasto por impuesto sobre la renta | Impuesto sobre la Renta | Impuesto | zero_if_not_reported | investigada | F1 F2 S4 | 6, 7, 8 |
| `is.net_income_reported` | Utilidad neta reportada | — | Total reportado, resultado | not_applicable | investigada | F2 S1 | 6, 7, 8 |
| `supp.credit_sales` | Ventas a crédito | — | Dato suplementario | requires_data | investigada | F1 F2 | 14, 15, 20 |
| `supp.supplier_payments` | Pagos a proveedores | — | Dato suplementario | requires_data | investigada | F1 F2 | 16, 17, 20 |

**Cuentas ambiguas (motivo):** `bs.ppe_machinery` («Equipos»), `bs.other_current_liabilities` («Pasivo Corto Plazo»), `bs.long_term_borrowings` («Pasivo Largo Plazo»), `bs.other_reserves` («Reservas»): nombres genéricos del caso; la clasificación es segura y el detalle no altera ningún resultado. Se registraron como `ambiguous` con su nota en `ambiguities`.
