# 14 — Rotación de cuentas por cobrar (`actividad_rotacion_cuentas_por_cobrar.json`)

| Campo | Valor |
|---|---|
| id | actividad_rotacion_cuentas_por_cobrar |
| Categoría | actividad |
| Unidad | veces |
| Modo de periodo | flow_with_average_balance |
| Fórmula del profesor | Ventas a crédito / CxC promedio |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "divide",
  "numerator": {
    "op": "account",
    "id": "supp.credit_sales"
  },
  "denominator": {
    "op": "average",
    "of": {
      "op": "account",
      "id": "bs.trade_receivables"
    }
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

- ninguna (razón de primer nivel)

## Notas

- DIFERENCIA_CONOCIDA_PROFESOR: Rotación de cuentas por cobrar 2023 y 2024 — profesor: 7.08 y 6.81; este trabajo: N/D — motivo: D8: sin ventas a crédito.

