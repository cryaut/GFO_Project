# 09 — Razón de deuda total

- **Archivo**: `endeudamiento_razon_deuda_total.json` · **metadata.id**: `endeudamiento.razon_deuda_total` · **unit**: `percentage` · **period_mode**: `point_in_time`
- **Investigación (fase 1)**: completada con F1, F2 y NICs confirmadas; ver `02_fuentes.md` y `03_registro_cuentas.md`.

## Fórmula del profesor (tabla «Archivos y fórmulas»)

> Total pasivo / Total activo — modo de periodo: `point_in_time`

**Fórmula descompuesta (`formula_display`):** pasivo_total / activos_totales

**Árbol estructurado (`formula`):**

```json
{
  "op": "divide",
  "numerator": {
    "ref": "derived.pasivo_total"
  },
  "denominator": {
    "ref": "derived.activos_totales"
  }
}
```

## Derivados que intervienen

| derivado | definición |
|---|---|
| `activo_corriente` | Activo corriente | reportado `bs.current_assets_total` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.current_assets_components"}` |
| `activos_fijos_netos` | Activos fijos netos | reportado `bs.fixed_assets_net_total` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.fixed_assets_components"}` |
| `activos_totales` | Activos totales | reportado `bs.total_assets` si es válido; si no, `{"op":"add","left":{"op":"add","left":{"op":"add","left":{"op":"add","left":{"ref":"derived.activo_corriente"},"right":{"ref":"derived.activos_fijos_netos"}},"right":{"ref":"bs.intangible_assets"}},"right":{"ref":"bs.long_term_investments"}},"right":{"ref":"bs.other_noncurrent_assets"}}` |
| `pasivo_corriente` | Pasivo corriente | reportado `bs.current_liabilities_total` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.current_liabilities_components"}` |
| `pasivo_no_corriente` | Pasivo no corriente | `{"op":"sum_accounts","account_set":"bs.noncurrent_liabilities_components"}` |
| `pasivo_total` | Pasivo total | reportado `bs.total_liabilities` si es válido; si no, `{"op":"add","left":{"ref":"derived.pasivo_corriente"},"right":{"ref":"derived.pasivo_no_corriente"}}` |

## Cuentas elementales (cierre completo, 36 cuentas)

| id | Nombre | Categoría | Naturaleza / signo | Ausencia | parent_group | 2023 | 2024 |
|---|---|---|---|---|---|---|---|
| `bs.accrued_expenses_payable` | Gastos acumulados por pagar | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.accumulated_depreciation` | Depreciación acumulada | Correctora, negativa | acreedor / contra_asset | requires_data | `bs.fixed_assets_components` | -98,525 | -116,475 |
| `bs.cash_and_equivalents` | Efectivo y equivalentes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 45,000 | 52,000 |
| `bs.current_assets_total` | Total de activos corrientes | Subtotal reportado | deudor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.current_liabilities_total` | Total de pasivos corrientes | Subtotal reportado | acreedor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.current_portion_long_term_debt` | Porción corriente de deuda de largo plazo | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.current_provisions` | Provisiones corrientes | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 15,000 | 18,000 |
| `bs.fixed_assets_net_total` | Total de activos fijos netos | Subtotal reportado | deudor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.intangible_assets` | Activos intangibles | Activo no corriente | deudor / positive_magnitude | zero_if_not_reported | — | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_finished_goods` | Inventario de productos terminados | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_merchandise` | Inventario de mercaderías | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_raw_materials` | Inventario de materias primas | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_total` | Inventario total | Inventario | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 180,000 | 195,000 |
| `bs.inventory_work_in_process` | Inventario de productos en proceso | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.long_term_borrowings` | Deudas de largo plazo | Pasivo no corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.noncurrent_liabilities_components` | 80,000 | 45,000 |
| `bs.long_term_investments` | Inversiones de largo plazo | Activo no corriente | deudor / positive_magnitude | zero_if_not_reported | — | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.long_term_provisions` | Provisiones de largo plazo | Pasivo no corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.noncurrent_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.other_current_assets` | Otros activos corrientes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 25,000 | 30,000 |
| `bs.other_current_liabilities` | Otros pasivos corrientes | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 60,000 | 65,000 |
| `bs.other_current_receivables` | Otras cuentas por cobrar corrientes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.other_noncurrent_assets` | Otros activos no corrientes | Activo no corriente | deudor / positive_magnitude | zero_if_not_reported | — | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.other_noncurrent_liabilities` | Otros pasivos no corrientes | Pasivo no corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.noncurrent_liabilities_components` | 43,860 | 23,085 |
| `bs.ppe_buildings` | Edificios e instalaciones | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 200,000 | 200,000 |
| `bs.ppe_furniture` | Mobiliario y equipo de oficina | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.ppe_land` | Terrenos | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 150,000 | 150,000 |
| `bs.ppe_machinery` | Maquinaria y equipo | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 120,000 | 120,000 |
| `bs.ppe_other` | Otros activos fijos tangibles | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.ppe_vehicles` | Vehículos | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 60,000 | 60,000 |
| `bs.prepaid_expenses` | Gastos pagados por anticipado | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.short_term_borrowings` | Préstamos de corto plazo | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.short_term_investments` | Inversiones de corto plazo | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.taxes_payable` | Impuestos por pagar | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.total_assets` | Total de activos | Total reportado | deudor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.total_liabilities` | Total de pasivos | Total reportado | acreedor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.trade_payables` | Cuentas por pagar comerciales | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 85,000 | 92,000 |
| `bs.trade_receivables` | Cuentas por cobrar comerciales | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 120,000 | 135,000 |

Conjuntos usados: `bs.current_assets_components`, `bs.current_liabilities_components`, `bs.fixed_assets_components`, `bs.noncurrent_liabilities_components`.

## Periodos

- **Modo** `point_in_time`: cada periodo se calcula con sus saldos de cierre; no requiere periodos anteriores (`requires_previous_period: false`, método `direct_closing`, insignia «Saldo directo, sin promedio»).

## Notas de investigación

- (sin notas adicionales)

## Diferencia conocida con el profesor

| Periodo | Solución del profesor | Este documento | Comentario |
|---|---|---|---|
| — | — | — | sin diferencia conocida |

## Checks (Fase 1e)

| Estado | Calculado | Esperado (doc) | Método | Insignia | Resultado |
|---|---|---|---|---|---|
| m1 off (2023) | `35.42 %` | `35.42 %` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| m1 on (2023) | `35.42 %` | `35.42 %` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| 2024 (m2) | `29.45 %` | `29.45 %` | `direct_closing` | "Saldo directo, sin promedio" | OK |

Detalle completo y chequeos de consistencia en `05_checks.md`.
