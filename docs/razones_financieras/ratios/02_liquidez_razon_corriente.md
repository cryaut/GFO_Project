# 02 — Razón corriente

- **Archivo**: `liquidez_razon_corriente.json` · **metadata.id**: `liquidez.razon_corriente` · **unit**: `ratio` · **period_mode**: `point_in_time`
- **Investigación (fase 1)**: completada con F1, F2 y NICs confirmadas; ver `02_fuentes.md` y `03_registro_cuentas.md`.

## Fórmula del profesor (tabla «Archivos y fórmulas»)

> Activo corriente / Pasivo corriente — modo de periodo: `point_in_time`

**Fórmula descompuesta (`formula_display`):** activo_corriente / pasivo_corriente (cada uno: total reportado válido o suma de componentes)

**Árbol estructurado (`formula`):**

```json
{
  "op": "divide",
  "numerator": {
    "ref": "derived.activo_corriente"
  },
  "denominator": {
    "ref": "derived.pasivo_corriente"
  }
}
```

## Derivados que intervienen

| derivado | definición |
|---|---|
| `activo_corriente` | Activo corriente | reportado `bs.current_assets_total` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.current_assets_components"}` |
| `pasivo_corriente` | Pasivo corriente | reportado `bs.current_liabilities_total` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.current_liabilities_components"}` |

## Cuentas elementales (cierre completo, 20 cuentas)

| id | Nombre | Categoría | Naturaleza / signo | Ausencia | parent_group | 2023 | 2024 |
|---|---|---|---|---|---|---|---|
| `bs.accrued_expenses_payable` | Gastos acumulados por pagar | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.cash_and_equivalents` | Efectivo y equivalentes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 45,000 | 52,000 |
| `bs.current_assets_total` | Total de activos corrientes | Subtotal reportado | deudor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.current_liabilities_total` | Total de pasivos corrientes | Subtotal reportado | acreedor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.current_portion_long_term_debt` | Porción corriente de deuda de largo plazo | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.current_provisions` | Provisiones corrientes | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 15,000 | 18,000 |
| `bs.inventory_finished_goods` | Inventario de productos terminados | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_merchandise` | Inventario de mercaderías | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_raw_materials` | Inventario de materias primas | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_total` | Inventario total | Inventario | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 180,000 | 195,000 |
| `bs.inventory_work_in_process` | Inventario de productos en proceso | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.other_current_assets` | Otros activos corrientes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 25,000 | 30,000 |
| `bs.other_current_liabilities` | Otros pasivos corrientes | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 60,000 | 65,000 |
| `bs.other_current_receivables` | Otras cuentas por cobrar corrientes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.prepaid_expenses` | Gastos pagados por anticipado | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.short_term_borrowings` | Préstamos de corto plazo | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.short_term_investments` | Inversiones de corto plazo | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.taxes_payable` | Impuestos por pagar | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.trade_payables` | Cuentas por pagar comerciales | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 85,000 | 92,000 |
| `bs.trade_receivables` | Cuentas por cobrar comerciales | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 120,000 | 135,000 |

Conjuntos usados: `bs.current_assets_components`, `bs.current_liabilities_components`.

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
| m1 off (2023) | `2.31` | `2.31` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| m1 on (2023) | `2.31` | `2.31` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| 2024 (m2) | `2.35` | `2.35` | `direct_closing` | "Saldo directo, sin promedio" | OK |

Detalle completo y chequeos de consistencia en `05_checks.md`.
