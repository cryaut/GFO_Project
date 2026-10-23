# 20 — Ciclo de conversión de efectivo (`actividad_ciclo_conversion_efectivo.json`)

| Campo | Valor |
|---|---|
| id | actividad_ciclo_conversion_efectivo |
| Categoría | actividad |
| Unidad | dias |
| Modo de periodo | flow_with_average_balance |
| Fórmula del profesor | Edad del inventario + Período de cobro − Período de pago |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "subtract",
  "left": {
    "op": "add",
    "operands": [
      {
        "op": "ratio",
        "id": "actividad_edad_promedio_inventario"
      },
      {
        "op": "ratio",
        "id": "actividad_periodo_promedio_cobro"
      }
    ]
  },
  "right": {
    "op": "ratio",
    "id": "actividad_periodo_promedio_pago"
  }
}
```

## Derivados usados

- `derived.cost_of_sales` (flow)
- `derived.inventory_total` (balance)
- `derived.credit_purchases` (flow)

## Conjuntos usados

- `cost_of_sales_components`: 3 cuentas
- `inventory_components`: 4 cuentas

## Cuentas usadas

- `is.cost_of_sales_reported` (costo — reported_total)
- `is.merchandise_cost` (costo — detail)
- `is.product_cost` (costo — detail)
- `is.service_cost` (costo — detail)
- `bs.trade_receivables` (activo_corriente — detail)
- `bs.inventory_total` (activo_corriente — reported_total)
- `bs.inventory_merchandise` (activo_corriente — detail)
- `bs.inventory_raw_materials` (activo_corriente — detail)
- `bs.inventory_work_in_process` (activo_corriente — detail)
- `bs.inventory_finished_goods` (activo_corriente — detail)
- `bs.trade_payables` (pasivo_corriente — detail)
- `supp.credit_sales` (suplementario — detail)
- `supp.supplier_payments` (suplementario — detail)

## Razones dependientes

- `actividad_rotacion_inventarios` — Rotación de inventarios
- `actividad_edad_promedio_inventario` — Edad promedio del inventario
- `actividad_rotacion_cuentas_por_cobrar` — Rotación de cuentas por cobrar
- `actividad_periodo_promedio_cobro` — Período promedio de cobro
- `actividad_rotacion_cuentas_por_pagar` — Rotación de cuentas por pagar
- `actividad_periodo_promedio_pago` — Período promedio de pago

