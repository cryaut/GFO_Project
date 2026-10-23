# 12 — Rotación de inventarios (`actividad_rotacion_inventarios.json`)

| Campo | Valor |
|---|---|
| id | actividad_rotacion_inventarios |
| Categoría | actividad |
| Unidad | veces |
| Modo de periodo | flow_with_average_balance |
| Fórmula del profesor | Costo de ventas / Inventario promedio |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "divide",
  "numerator": {
    "op": "derived",
    "id": "derived.cost_of_sales"
  },
  "denominator": {
    "op": "average",
    "of": {
      "op": "derived",
      "id": "derived.inventory_total"
    }
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

- ninguna (razón de primer nivel)

## Notas

- DIFERENCIA_CONOCIDA_PROFESOR: Rotación de inventarios 2024 — profesor: 2.79; este trabajo: 2.91 — motivo: D1: promedio.

