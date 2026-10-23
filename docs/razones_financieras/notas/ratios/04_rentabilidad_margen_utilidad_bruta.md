# 4 — Margen de utilidad bruta (`rentabilidad_margen_utilidad_bruta.json`)

| Campo | Valor |
|---|---|
| id | rentabilidad_margen_utilidad_bruta |
| Categoría | rentabilidad |
| Unidad | porcentaje |
| Modo de periodo | point_in_time |
| Fórmula del profesor | Utilidad bruta / Ventas |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "divide",
  "numerator": {
    "op": "derived",
    "id": "derived.gross_profit"
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

## Conjuntos usados

- `gross_sales_components`: 3 cuentas
- `sales_deduction_components`: 3 cuentas
- `cost_of_sales_components`: 3 cuentas

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

## Razones dependientes

- ninguna (razón de primer nivel)

