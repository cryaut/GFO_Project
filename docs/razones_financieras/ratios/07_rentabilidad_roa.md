# 07 — ROA (rendimiento sobre activos)

- **Archivo**: `rentabilidad_roa.json` · **metadata.id**: `rentabilidad.roa` · **unit**: `percentage` · **period_mode**: `flow_with_average_balance`
- **Investigación (fase 1)**: completada con F1, F2 y NICs confirmadas; ver `02_fuentes.md` y `03_registro_cuentas.md`.

## Fórmula del profesor (tabla «Archivos y fórmulas»)

> Utilidad neta / Activos totales promedio — modo de periodo: `flow_with_average_balance`

**Fórmula descompuesta (`formula_display`):** utilidad_neta[current] / average(activos_totales[previous], activos_totales[current])

**Árbol estructurado (`formula`):**

```json
{
  "op": "divide",
  "numerator": {
    "ref": "derived.utilidad_neta",
    "period": "current"
  },
  "denominator": {
    "op": "average",
    "values": [
      {
        "ref": "derived.activos_totales",
        "period": "previous"
      },
      {
        "ref": "derived.activos_totales",
        "period": "current"
      }
    ],
    "required_periods": 2,
    "if_previous_period_missing": "not_available"
  }
}
```

## Derivados que intervienen

| derivado | definición |
|---|---|
| `activo_corriente` | Activo corriente | reportado `bs.current_assets_total` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.current_assets_components"}` |
| `activos_fijos_netos` | Activos fijos netos | reportado `bs.fixed_assets_net_total` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.fixed_assets_components"}` |
| `activos_totales` | Activos totales | reportado `bs.total_assets` si es válido; si no, `{"op":"add","left":{"op":"add","left":{"op":"add","left":{"op":"add","left":{"ref":"derived.activo_corriente"},"right":{"ref":"derived.activos_fijos_netos"}},"right":{"ref":"bs.intangible_assets"}},"right":{"ref":"bs.long_term_investments"}},"right":{"ref":"bs.other_noncurrent_assets"}}` |
| `costo_ventas` | Costo de ventas | reportado `is.cost_of_sales_reported` si es válido; si no, `{"op":"sum_accounts","account_set":"is.cost_of_sales_components"}` |
| `deducciones_ventas` | Deducciones de ventas | `{"op":"sum_accounts","account_set":"is.sales_deduction_components"}` |
| `gastos_operativos` | Gastos operativos | `{"op":"sum_accounts","account_set":"is.operating_expense_components"}` |
| `utilidad_bruta` | Utilidad bruta | reportado `is.gross_profit_reported` si es válido; si no, `{"op":"subtract","left":{"ref":"derived.ventas_netas"},"right":{"ref":"derived.costo_ventas"}}` |
| `utilidad_neta` | Utilidad neta | reportado `is.net_income_reported` si es válido; si no, `{"op":"subtract","left":{"op":"subtract","left":{"op":"subtract","left":{"op":"add","left":{"ref":"derived.utilidad_operativa"},"right":{"ref":"is.nonoperating_income"}},"right":{"ref":"is.noninterest_nonoperating_expenses"}},"right":{"ref":"is.interest_expense"}},"right":{"ref":"is.income_tax_expense"}}` |
| `utilidad_operativa` | Utilidad operativa | reportado `is.operating_profit_reported` si es válido; si no, `{"op":"subtract","left":{"op":"add","left":{"ref":"derived.utilidad_bruta"},"right":{"ref":"is.other_operating_income"}},"right":{"ref":"derived.gastos_operativos"}}` |
| `ventas_brutas` | Ventas brutas | reportado `is.sales_total` si es válido; si no, `{"op":"sum_accounts","account_set":"is.gross_sales_components"}` |
| `ventas_netas` | Ventas netas | reportado `is.net_sales_reported` si es válido; si no, `{"op":"subtract","left":{"ref":"derived.ventas_brutas"},"right":{"ref":"derived.deducciones_ventas"}}` |

## Cuentas elementales (cierre completo, 49 cuentas)

| id | Nombre | Categoría | Naturaleza / signo | Ausencia | parent_group | 2023 | 2024 |
|---|---|---|---|---|---|---|---|
| `bs.accumulated_depreciation` | Depreciación acumulada | Correctora, negativa | acreedor / contra_asset | requires_data | `bs.fixed_assets_components` | -98,525 | -116,475 |
| `bs.cash_and_equivalents` | Efectivo y equivalentes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 45,000 | 52,000 |
| `bs.current_assets_total` | Total de activos corrientes | Subtotal reportado | deudor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.fixed_assets_net_total` | Total de activos fijos netos | Subtotal reportado | deudor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.intangible_assets` | Activos intangibles | Activo no corriente | deudor / positive_magnitude | zero_if_not_reported | — | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_finished_goods` | Inventario de productos terminados | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_merchandise` | Inventario de mercaderías | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_raw_materials` | Inventario de materias primas | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_total` | Inventario total | Inventario | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 180,000 | 195,000 |
| `bs.inventory_work_in_process` | Inventario de productos en proceso | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.long_term_investments` | Inversiones de largo plazo | Activo no corriente | deudor / positive_magnitude | zero_if_not_reported | — | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.other_current_assets` | Otros activos corrientes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 25,000 | 30,000 |
| `bs.other_current_receivables` | Otras cuentas por cobrar corrientes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.other_noncurrent_assets` | Otros activos no corrientes | Activo no corriente | deudor / positive_magnitude | zero_if_not_reported | — | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.ppe_buildings` | Edificios e instalaciones | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 200,000 | 200,000 |
| `bs.ppe_furniture` | Mobiliario y equipo de oficina | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.ppe_land` | Terrenos | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 150,000 | 150,000 |
| `bs.ppe_machinery` | Maquinaria y equipo | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 120,000 | 120,000 |
| `bs.ppe_other` | Otros activos fijos tangibles | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.ppe_vehicles` | Vehículos | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 60,000 | 60,000 |
| `bs.prepaid_expenses` | Gastos pagados por anticipado | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.short_term_investments` | Inversiones de corto plazo | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.total_assets` | Total de activos | Total reportado | deudor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.trade_receivables` | Cuentas por cobrar comerciales | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 120,000 | 135,000 |
| `is.administrative_expenses` | Gastos administrativos | Gasto operativo | deudor / expense | zero_if_not_reported | `is.operating_expense_components` | 120,000 | 130,000 |
| `is.cost_of_sales_reported` | Costo de ventas reportado | Costo | deudor / expense | not_applicable | — | 510,000 | 545,000 |
| `is.gross_profit_reported` | Utilidad bruta reportada | Total reportado, resultado | depends_on_context / signed_balance | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `is.income_tax_expense` | Gasto por impuesto sobre la renta | Impuesto | deudor / expense | zero_if_not_reported | — | 38,220 | 44,925 |
| `is.interest_expense` | Gastos por intereses | Financiero, intereses | deudor / expense | zero_if_not_reported | — | 12,600 | 11,250 |
| `is.merchandise_cost` | Costo de mercadería vendida | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.net_income_reported` | Utilidad neta reportada | Total reportado, resultado | depends_on_context / signed_balance | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `is.net_sales_reported` | Ventas netas reportadas | Total reportado, ingreso | acreedor / revenue | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `is.noninterest_nonoperating_expenses` | Gastos no operativos distintos de intereses | No operativo | deudor / expense | zero_if_not_reported | — | 10,000 | 12,000 |
| `is.nonoperating_income` | Ingresos no operativos | No operativo | acreedor / revenue | zero_if_not_reported | — | 15,000 | 18,000 |
| `is.operating_amortization` | Amortización operativa | Gasto operativo | deudor / expense | zero_if_not_reported | `is.operating_expense_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.operating_depreciation` | Depreciación operativa | Gasto operativo | deudor / expense | zero_if_not_reported | `is.operating_expense_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.operating_profit_reported` | Utilidad operativa reportada | Total reportado, resultado | depends_on_context / signed_balance | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `is.other_operating_expenses` | Otros gastos operativos | Gasto operativo | deudor / expense | zero_if_not_reported | `is.operating_expense_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.other_operating_income` | Otros ingresos operativos | Ingreso operativo | acreedor / revenue | zero_if_not_reported | — | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.other_sales_revenue` | Otras ventas ordinarias | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.product_cost` | Costo de productos vendidos | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.product_sales` | Ventas de productos | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_allowances` | Rebajas sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_discounts` | Descuentos sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_returns` | Devoluciones sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_total` | Ventas totales | Ingreso bruto | acreedor / revenue | not_applicable | — | 850,000 | 920,000 |
| `is.selling_expenses` | Gastos de ventas | Gasto operativo | deudor / expense | zero_if_not_reported | `is.operating_expense_components` | 85,000 | 90,000 |
| `is.service_cost` | Costo de servicios | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.service_revenue` | Ingresos por servicios | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |

Conjuntos usados: `bs.current_assets_components`, `bs.fixed_assets_components`, `is.cost_of_sales_components`, `is.gross_sales_components`, `is.operating_expense_components`, `is.sales_deduction_components`.

## Periodos

- **Modo** `flow_with_average_balance`: el flujo es del periodo actual y el denominador usa el promedio de saldos de cierre de los dos periodos (método `average`, insignia «Promedio {periodo_anterior}–{periodo_actual}»).
- **R1 (m1)**: sin periodo anterior, el resultado es `not_available` con motivo `missing_required_period_balance`. El botón «Mostrar cálculo directo de {primer_periodo}» existe en esta razón con `default: false`; al activarlo, el resultado usa saldos de cierre sin promedio (insignia «Saldo directo, sin promedio»). Si la activación necesita un saldo previo inexistente, sigue en `not_available`.
- **R2**: los cálculos solo usan las dos columnas del periodo (2023 y 2024); no hay columnas intermedias.

## Notas de investigación

- DIFERENCIA_CONOCIDA_PROFESOR: diferencia de método con la solución del profesor (promedio D1 frente a saldos de cierre) por confirmar con el profesor; valores en 05_checks.md.

## Diferencia conocida con el profesor

| Periodo | Solución del profesor | Este documento | Comentario |
|---|---|---|---|
| 2024 | `12.70 %` | `12.89 %` | confirmada en el documento como diferencia de método |

## Checks (Fase 1e)

| Estado | Calculado | Esperado (doc) | Método | Insignia | Resultado |
|---|---|---|---|---|---|
| m1 off (2023) | `N/D` | `N/D` | `not_applicable` | — | OK |
| m1 on (2023) | `11.13 %` | `11.13 %` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| 2024 (m2) | `12.89 %` | `12.89 %` | `average` | "Promedio 2023–2024" | OK |

Detalle completo y chequeos de consistencia en `05_checks.md`.
