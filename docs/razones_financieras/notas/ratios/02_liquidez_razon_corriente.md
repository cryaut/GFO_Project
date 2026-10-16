# 2 — Razón corriente (`liquidez_razon_corriente.json`)

| Campo | Valor |
|---|---|
| id | liquidez_razon_corriente |
| Categoría | liquidez |
| Unidad | veces |
| Modo de periodo | point_in_time |
| Fórmula del profesor | Activo corriente / Pasivo corriente |

## Árbol de la fórmula (copia textual de la orden)

```json
{
  "op": "divide",
  "numerator": {
    "op": "derived",
    "id": "derived.current_assets"
  },
  "denominator": {
    "op": "derived",
    "id": "derived.current_liabilities"
  }
}
```

## Derivados usados

- `derived.inventory_total` (balance)
- `derived.current_assets` (balance)
- `derived.current_liabilities` (balance)

## Conjuntos usados

- `current_assets_excluding_inventory`: 6 cuentas
- `inventory_components`: 4 cuentas
- `current_liabilities_components`: 7 cuentas

## Cuentas usadas

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
- `bs.current_liabilities_total` (total — reported_total)
- `bs.trade_payables` (pasivo_corriente — detail)
- `bs.short_term_borrowings` (pasivo_corriente — detail)
- `bs.current_portion_long_term_debt` (pasivo_corriente — detail)
- `bs.taxes_payable` (pasivo_corriente — detail)
- `bs.accrued_expenses_payable` (pasivo_corriente — detail)
- `bs.current_provisions` (pasivo_corriente — detail)
- `bs.other_current_liabilities` (pasivo_corriente — detail)

## Razones dependientes

- ninguna (razón de primer nivel)

