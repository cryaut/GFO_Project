# 6 — Margen de utilidad neta (`rentabilidad_margen_utilidad_neta.json`)

| Campo | Valor |
|---|---|
| id | rentabilidad_margen_utilidad_neta |
| Categoría | rentabilidad |
| Unidad | porcentaje |
| Modo de periodo | point_in_time |
| Fórmula del profesor | Utilidad neta / Ventas |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "divide",
  "numerator": {
    "op": "derived",
    "id": "derived.net_income"
  },
  "denominator": {
    "op": "derived",
    "id": "derived.net_sales"
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

## Conjuntos usados

- `gross_sales_components`: 3 cuentas
- `sales_deduction_components`: 3 cuentas
- `cost_of_sales_components`: 3 cuentas
- `operating_expense_components`: 5 cuentas

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

## Razones dependientes

- ninguna (razón de primer nivel)

