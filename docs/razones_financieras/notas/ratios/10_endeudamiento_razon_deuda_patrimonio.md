# 10 — Razón deuda-patrimonio (`endeudamiento_razon_deuda_patrimonio.json`)

| Campo | Valor |
|---|---|
| id | endeudamiento_razon_deuda_patrimonio |
| Categoría | endeudamiento |
| Unidad | veces |
| Modo de periodo | point_in_time |
| Fórmula del profesor | Total pasivo / Total patrimonio |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "divide",
  "numerator": {
    "op": "derived",
    "id": "derived.total_liabilities"
  },
  "denominator": {
    "op": "derived",
    "id": "derived.total_equity"
  }
}
```

## Derivados usados

- `derived.current_liabilities` (balance)
- `derived.noncurrent_liabilities` (balance)
- `derived.total_liabilities` (balance)
- `derived.total_equity` (balance)

## Conjuntos usados

- `current_liabilities_components`: 7 cuentas
- `noncurrent_liabilities_components`: 3 cuentas
- `patrimony_components`: 7 cuentas

## Cuentas usadas

- `bs.current_liabilities_total` (total — reported_total)
- `bs.trade_payables` (pasivo_corriente — detail)
- `bs.short_term_borrowings` (pasivo_corriente — detail)
- `bs.current_portion_long_term_debt` (pasivo_corriente — detail)
- `bs.taxes_payable` (pasivo_corriente — detail)
- `bs.accrued_expenses_payable` (pasivo_corriente — detail)
- `bs.current_provisions` (pasivo_corriente — detail)
- `bs.other_current_liabilities` (pasivo_corriente — detail)
- `bs.long_term_borrowings` (pasivo_no_corriente — detail)
- `bs.long_term_provisions` (pasivo_no_corriente — detail)
- `bs.other_noncurrent_liabilities` (pasivo_no_corriente — detail)
- `bs.total_liabilities` (total — reported_total)
- `bs.total_equity` (total — reported_total)
- `bs.share_capital` (patrimonio — detail)
- `bs.additional_paid_in_capital` (patrimonio — detail)
- `bs.legal_reserve` (patrimonio — detail)
- `bs.other_reserves` (patrimonio — detail)
- `bs.retained_earnings` (patrimonio — detail)
- `bs.current_year_result_equity` (patrimonio — detail)
- `bs.other_equity_components` (patrimonio — detail)

## Razones dependientes

- ninguna (razón de primer nivel)

