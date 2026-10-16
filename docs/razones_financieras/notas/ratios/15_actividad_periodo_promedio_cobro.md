# 15 — Período promedio de cobro (`actividad_periodo_promedio_cobro.json`)

| Campo | Valor |
|---|---|
| id | actividad_periodo_promedio_cobro |
| Categoría | actividad |
| Unidad | dias |
| Modo de periodo | flow_with_average_balance |
| Fórmula del profesor | 365 / Rotación de CxC |

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
    "id": "actividad_rotacion_cuentas_por_cobrar"
  }
}
```

## Derivados usados

- ninguno

## Conjuntos usados

- ninguno

## Cuentas usadas

- `bs.trade_receivables` (activo_corriente — detail)
- `supp.credit_sales` (suplementario — detail)

## Razones dependientes

- `actividad_rotacion_cuentas_por_cobrar` — Rotación de cuentas por cobrar

## Notas

- DIFERENCIA_CONOCIDA_PROFESOR: Período promedio de cobro 2023 y 2024 — profesor: 51.53 y 53.56; este trabajo: N/D — motivo: D8: sin ventas a crédito.

