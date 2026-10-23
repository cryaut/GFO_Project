# 17 — Período promedio de pago (`actividad_periodo_promedio_pago.json`)

| Campo | Valor |
|---|---|
| id | actividad_periodo_promedio_pago |
| Categoría | actividad |
| Unidad | dias |
| Modo de periodo | flow_with_average_balance |
| Fórmula del profesor | 365 / Rotación de CxP |

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
    "id": "actividad_rotacion_cuentas_por_pagar"
  }
}
```

## Derivados usados

- `derived.credit_purchases` (flow)

## Conjuntos usados

- ninguno

## Cuentas usadas

- `bs.trade_payables` (pasivo_corriente — detail)
- `supp.supplier_payments` (suplementario — detail)

## Razones dependientes

- `actividad_rotacion_cuentas_por_pagar` — Rotación de cuentas por pagar

