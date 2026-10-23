# 13 — Edad promedio del inventario (`actividad_edad_promedio_inventario.json`)

| Campo | Valor |
|---|---|
| id | actividad_edad_promedio_inventario |
| Categoría | actividad |
| Unidad | dias |
| Modo de periodo | flow_with_average_balance |
| Fórmula del profesor | 365 / Rotación de inventarios |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "divide",
  "numerator": {
    "op": "constant",
    "value": 365
  },
  "denominator": {
    "op": "ratio",
    "id": "actividad_rotacion_inventarios"
  }
}
```

## Derivados usados

- `derived.cost_of_sales` (flow)
- `derived.inventory_total` (balance)

## Conjuntos usados

- `cost_of_sales_components`: 3 cuentas
- `inventory_components`: 4 cuentas

## Cuentas usadas

- `is.cost_of_sales_reported` (costo — reported_total)
- `is.merchandise_cost` (costo — detail)
- `is.product_cost` (costo — detail)
- `is.service_cost` (costo — detail)
- `bs.inventory_total` (activo_corriente — reported_total)
- `bs.inventory_merchandise` (activo_corriente — detail)
- `bs.inventory_raw_materials` (activo_corriente — detail)
- `bs.inventory_work_in_process` (activo_corriente — detail)
- `bs.inventory_finished_goods` (activo_corriente — detail)

## Razones dependientes

- `actividad_rotacion_inventarios` — Rotación de inventarios

## Notas

- DIFERENCIA_CONOCIDA_PROFESOR: Edad promedio del inventario 2024 — profesor: 130.60; este trabajo: 125.57 — motivo: D1: promedio.

