# 18 — Rotación de activos fijos (`actividad_rotacion_activos_fijos.json`)

| Campo | Valor |
|---|---|
| id | actividad_rotacion_activos_fijos |
| Categoría | actividad |
| Unidad | veces |
| Modo de periodo | flow_with_average_balance |
| Fórmula del profesor | Ventas netas / Activos fijos netos promedio |

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
      "id": "derived.fixed_assets_net"
    }
  }
}
```

## Derivados usados

- `derived.gross_sales` (flow)
- `derived.sales_deductions` (flow)
- `derived.net_sales` (flow)
- `derived.fixed_assets_net` (balance)

## Conjuntos usados

- `gross_sales_components`: 3 cuentas
- `sales_deduction_components`: 3 cuentas
- `ppe_components`: 6 cuentas

## Cuentas usadas

- `is.sales_total` (ingreso — reported_total)
- `is.product_sales` (ingreso — detail)
- `is.service_revenue` (ingreso — detail)
- `is.other_sales_revenue` (ingreso — detail)
- `is.sales_returns` (deduccion_ingreso — detail)
- `is.sales_discounts` (deduccion_ingreso — detail)
- `is.sales_allowances` (deduccion_ingreso — detail)
- `is.net_sales_reported` (ingreso — reported_total)
- `bs.fixed_assets_net_total` (activo_fijo — reported_total)
- `bs.ppe_land` (activo_fijo — detail)
- `bs.ppe_buildings` (activo_fijo — detail)
- `bs.ppe_machinery` (activo_fijo — detail)
- `bs.ppe_vehicles` (activo_fijo — detail)
- `bs.ppe_furniture` (activo_fijo — detail)
- `bs.ppe_other` (activo_fijo — detail)
- `bs.accumulated_depreciation` (correctora_activo — contra_account)

## Razones dependientes

- ninguna (razón de primer nivel)

## Notas

- DIFERENCIA_CONOCIDA_PROFESOR: Rotación de activos fijos 2024 — profesor: 2.22; este trabajo: 2.18 — motivo: D1: promedio.

