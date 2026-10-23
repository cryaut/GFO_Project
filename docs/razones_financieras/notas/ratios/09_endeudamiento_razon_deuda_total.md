# 9 — Razón de deuda total (`endeudamiento_razon_deuda_total.json`)

| Campo | Valor |
|---|---|
| id | endeudamiento_razon_deuda_total |
| Categoría | endeudamiento |
| Unidad | porcentaje |
| Modo de periodo | point_in_time |
| Fórmula del profesor | Total pasivo / Total activo |

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
    "id": "derived.total_assets"
  }
}
```

## Derivados usados

- `derived.inventory_total` (balance)
- `derived.current_assets` (balance)
- `derived.current_liabilities` (balance)
- `derived.fixed_assets_net` (balance)
- `derived.noncurrent_liabilities` (balance)
- `derived.total_liabilities` (balance)
- `derived.total_assets` (balance)

## Conjuntos usados

- `current_assets_excluding_inventory`: 6 cuentas
- `inventory_components`: 4 cuentas
- `current_liabilities_components`: 7 cuentas
- `ppe_components`: 6 cuentas
- `other_noncurrent_assets_components`: 2 cuentas
- `noncurrent_liabilities_components`: 3 cuentas

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
- `bs.fixed_assets_net_total` (activo_fijo — reported_total)
- `bs.ppe_land` (activo_fijo — detail)
- `bs.ppe_buildings` (activo_fijo — detail)
- `bs.ppe_machinery` (activo_fijo — detail)
- `bs.ppe_vehicles` (activo_fijo — detail)
- `bs.ppe_furniture` (activo_fijo — detail)
- `bs.ppe_other` (activo_fijo — detail)
- `bs.accumulated_depreciation` (correctora_activo — contra_account)
- `bs.intangible_assets` (activo_no_corriente — detail)
- `bs.long_term_investments` (activo_no_corriente — detail)
- `bs.other_noncurrent_assets` (activo_no_corriente — detail)
- `bs.total_assets` (total — reported_total)
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

## Razones dependientes

- ninguna (razón de primer nivel)

