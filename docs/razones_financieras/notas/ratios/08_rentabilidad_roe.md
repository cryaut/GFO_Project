# 8 — ROE (`rentabilidad_roe.json`)

| Campo | Valor |
|---|---|
| id | rentabilidad_roe |
| Categoría | rentabilidad |
| Unidad | porcentaje |
| Modo de periodo | flow_with_average_balance |
| Fórmula del profesor | Utilidad neta / Patrimonio promedio |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "divide",
  "numerator": {
    "op": "derived",
    "id": "derived.net_income"
  },
  "denominator": {
    "op": "average",
    "of": {
      "op": "derived",
      "id": "derived.total_equity"
    }
  }
}
```

## Derivados usados

- `derived.gross_sales` (flow)
- `derived.sales_deductions` (flow)
- `derived.net_sales` (flow)
- `derived.cost_of_sales` (flow)
- `derived.gross_profit` (flow)
- `derived.operating_expenses` (flow)
- `derived.operating_profit` (flow)
- `derived.net_income` (flow)
- `derived.total_equity` (balance)

## Conjuntos usados

- `gross_sales_components`: 3 cuentas
- `sales_deduction_components`: 3 cuentas
- `cost_of_sales_components`: 3 cuentas
- `operating_expense_components`: 5 cuentas
- `patrimony_components`: 7 cuentas

## Cuentas usadas

- `is.sales_total` (ingreso — reported_total)
- `is.product_sales` (ingreso — detail)
- `is.service_revenue` (ingreso — detail)
- `is.other_sales_revenue` (ingreso — detail)
- `is.sales_returns` (deduccion_ingreso — detail)
- `is.sales_discounts` (deduccion_ingreso — detail)
- `is.sales_allowances` (deduccion_ingreso — detail)
- `is.net_sales_reported` (ingreso — reported_total)
- `is.cost_of_sales_reported` (costo — reported_total)
- `is.merchandise_cost` (costo — detail)
- `is.product_cost` (costo — detail)
- `is.service_cost` (costo — detail)
- `is.gross_profit_reported` (resultado — reported_total)
- `is.selling_expenses` (gasto_operativo — detail)
- `is.administrative_expenses` (gasto_operativo — detail)
- `is.operating_depreciation` (gasto_operativo — detail)
- `is.operating_amortization` (gasto_operativo — detail)
- `is.other_operating_expenses` (gasto_operativo — detail)
- `is.other_operating_income` (ingreso — detail)
- `is.operating_profit_reported` (resultado — reported_total)
- `is.nonoperating_income` (no_operativo — detail)
- `is.noninterest_nonoperating_expenses` (no_operativo — detail)
- `is.interest_expense` (financiero — detail)
- `is.income_tax_expense` (impuesto — detail)
- `is.net_income_reported` (resultado — reported_total)
- `bs.total_equity` (total — reported_total)
- `bs.share_capital` (patrimonio — detail)
- `bs.additional_paid_in_capital` (patrimonio — detail)
- `bs.legal_reserve` (patrimonio — detail)
- `bs.other_reserves` (patrimonio — detail)
- `bs.retained_earnings` (patrimonio — detail)
- `bs.current_year_result_equity` (patrimonio — detail)
- `bs.other_equity_components` (patrimonio — detail)

## Razones dependientes

- ninguna (razón de primer nivel)

## Notas

- DIFERENCIA_CONOCIDA_PROFESOR: ROE 2024 — profesor: 18.00 %; este trabajo: 19.06 % — motivo: D1: promedio.

