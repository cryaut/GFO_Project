# 16 — Rotación de cuentas por pagar (`actividad_rotacion_cuentas_por_pagar.json`)

| Campo | Valor |
|---|---|
| id | actividad_rotacion_cuentas_por_pagar |
| Categoría | actividad |
| Unidad | veces |
| Modo de periodo | flow_with_average_balance |
| Fórmula del profesor | Compras a crédito / CxP promedio |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "divide",
  "numerator": {
    "op": "derived",
    "id": "derived.credit_purchases"
  },
  "denominator": {
    "op": "average",
    "of": {
      "op": "account",
      "id": "bs.trade_payables"
    }
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

- ninguna (razón de primer nivel)

