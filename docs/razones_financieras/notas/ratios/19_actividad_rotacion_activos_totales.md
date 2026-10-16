# 19 — Rotación de activos totales (`actividad_rotacion_activos_totales.json`)

| Campo | Valor |
|---|---|
| id | actividad_rotacion_activos_totales |
| Categoría | actividad |
| Unidad | veces |
| Modo de periodo | flow_with_average_balance |
| Fórmula del profesor | Ventas netas / Activos totales promedio |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "divide",
  "numerator": {
    "op": "derived",
    "id": "derived.net_sales"
  },
  "denominator": {
    "op": "average",
    "of": {
      "op": "derived",
      "id": "derived.total_assets"
    }
  }
}
```

## Derivados usados

- `derived.gross_sales` (flow)
- `derived.sales_deductions` (flow)
- `derived.net_sales` (flow)
- `derived.inventory_total` (balance)
- `derived.current_assets` (balance)
- `derived.fixed_assets_net` (balance)
- `derived.total_assets` (balance)

## Conjuntos usados

- `gross_sales_components`: 3 cuentas
- `sales_deduction_components`: 3 cuentas
- `current_assets_excluding_inventory`: 6 cuentas
- `inventory_components`: 4 cuentas
- `ppe_components`: 6 cuentas
- `other_noncurrent_assets_components`: 2 cuentas

## Cuentas usadas

- `is.sales_total` (ingreso — reported_total)
- `is.product_sales` (ingreso — detail)
- `is.service_revenue` (ingreso — detail)
- `is.other_sales_revenue` (ingreso — detail)
- `is.sales_returns` (deduccion_ingreso — detail)
- `is.sales_discounts` (deduccion_ingreso — detail)
- `is.sales_allowances` (deduccion_ingreso — detail)
- `is.net_sales_reported` (ingreso — reported_total)
- `bs.current_assets_total` (total — reported_total)
- `bs.cash_and_equivalents` (activo_corriente — detail)
- `bs.short_term_investments` (activo_corriente — detail)
- `bs.trade_receivables` (activo_corriente — detail)
- `bs.other_current_receivables` (activo_corriente — detail)
- `bs.inventory_total` (activo_corriente — reported_total)
- `bs.inventory_merchandise` (activo_corriente — detail)
- `bs.inventory_raw_materials` (activo_corriente — detail)
- `bs.inventory_work_in_process` (activo_corriente — detail)
- `bs.inventory_finished_goods` (activo_corriente — detail)
- `bs.prepaid_expenses` (activo_corriente — detail)
- `bs.other_current_assets` (activo_corriente — detail)
- `bs.fixed_assets_net_total` (activo_fijo — reported_total)
- `bs.ppe_land` (activo_fijo — detail)
- `bs.ppe_buildings` (activo_fijo — detail)
- `bs.ppe_machinery` (activo_fijo — detail)
- `bs.ppe_vehicles` (activo_fijo — detail)
- `bs.ppe_furniture` (activo_fijo — detail)
- `bs.ppe_other` (activo_fijo — detail)
- `bs.accumulated_depreciation` (correctora_activo — contra_account)
- `bs.intangible_assets` (activo_no_corriente — detail)
- `bs.long_term_investments` (activo_no_corriente — detail)
- `bs.other_noncurrent_assets` (activo_no_corriente — detail)
- `bs.total_assets` (total — reported_total)

## Razones dependientes

- ninguna (razón de primer nivel)

## Notas

- DIFERENCIA_CONOCIDA_PROFESOR: Rotación de activos totales 2024 — profesor: 1.11; este trabajo: 1.13 — motivo: D1: promedio.

