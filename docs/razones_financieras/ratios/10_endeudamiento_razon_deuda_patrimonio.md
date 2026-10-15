# 10 — Razón deuda-patrimonio

- **Archivo**: `endeudamiento_razon_deuda_patrimonio.json` · **metadata.id**: `endeudamiento.razon_deuda_patrimonio` · **unit**: `ratio` · **period_mode**: `point_in_time`
- **Investigación (fase 1)**: completada con F1, F2 y NICs confirmadas; ver `02_fuentes.md` y `03_registro_cuentas.md`.

## Fórmula del profesor (tabla «Archivos y fórmulas»)

> Total pasivo / Total patrimonio — modo de periodo: `point_in_time`

**Fórmula descompuesta (`formula_display`):** pasivo_total / patrimonio_total

**Árbol estructurado (`formula`):**

```json
{
  "op": "divide",
  "numerator": {
    "ref": "derived.pasivo_total"
  },
  "denominator": {
    "ref": "derived.patrimonio_total"
  }
}
```

## Derivados que intervienen

| derivado | definición |
|---|---|
| `pasivo_corriente` | Pasivo corriente | reportado `bs.current_liabilities_total` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.current_liabilities_components"}` |
| `pasivo_no_corriente` | Pasivo no corriente | `{"op":"sum_accounts","account_set":"bs.noncurrent_liabilities_components"}` |
| `pasivo_total` | Pasivo total | reportado `bs.total_liabilities` si es válido; si no, `{"op":"add","left":{"ref":"derived.pasivo_corriente"},"right":{"ref":"derived.pasivo_no_corriente"}}` |
| `patrimonio_total` | Patrimonio total | reportado `bs.total_equity` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.patrimony_components"}` |

## Cuentas elementales (cierre completo, 20 cuentas)

| id | Nombre | Categoría | Naturaleza / signo | Ausencia | parent_group | 2023 | 2024 |
|---|---|---|---|---|---|---|---|
| `bs.accrued_expenses_payable` | Gastos acumulados por pagar | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.additional_paid_in_capital` | Aportes adicionales de capital | Patrimonio | acreedor / positive_magnitude | zero_if_not_reported | `bs.patrimony_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.current_liabilities_total` | Total de pasivos corrientes | Subtotal reportado | acreedor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.current_portion_long_term_debt` | Porción corriente de deuda de largo plazo | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.current_provisions` | Provisiones corrientes | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 15,000 | 18,000 |
| `bs.current_year_result_equity` | Resultado del período incluido en patrimonio | Patrimonio | acreedor / positive_magnitude | zero_if_not_reported | `bs.patrimony_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.legal_reserve` | Reserva legal | Patrimonio | acreedor / positive_magnitude | zero_if_not_reported | `bs.patrimony_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.long_term_borrowings` | Deudas de largo plazo | Pasivo no corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.noncurrent_liabilities_components` | 80,000 | 45,000 |
| `bs.long_term_provisions` | Provisiones de largo plazo | Pasivo no corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.noncurrent_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.other_current_liabilities` | Otros pasivos corrientes | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 60,000 | 65,000 |
| `bs.other_equity_components` | Otros componentes del patrimonio | Patrimonio | acreedor / positive_magnitude | zero_if_not_reported | `bs.patrimony_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.other_noncurrent_liabilities` | Otros pasivos no corrientes | Pasivo no corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.noncurrent_liabilities_components` | 43,860 | 23,085 |
| `bs.other_reserves` | Otras reservas patrimoniales | Patrimonio | acreedor / positive_magnitude | zero_if_not_reported | `bs.patrimony_components` | 80,000 | 80,000 |
| `bs.retained_earnings` | Utilidades retenidas | Patrimonio | acreedor / positive_magnitude | zero_if_not_reported | `bs.patrimony_components` | 137,615 | 202,440 |
| `bs.share_capital` | Capital social | Patrimonio | acreedor / positive_magnitude | zero_if_not_reported | `bs.patrimony_components` | 300,000 | 300,000 |
| `bs.short_term_borrowings` | Préstamos de corto plazo | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.taxes_payable` | Impuestos por pagar | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.total_equity` | Total patrimonio | Total reportado | acreedor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.total_liabilities` | Total de pasivos | Total reportado | acreedor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.trade_payables` | Cuentas por pagar comerciales | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 85,000 | 92,000 |

Conjuntos usados: `bs.current_liabilities_components`, `bs.noncurrent_liabilities_components`, `bs.patrimony_components`.

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
| m1 off (2023) | `0.55` | `0.55` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| m1 on (2023) | `0.55` | `0.55` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| 2024 (m2) | `0.42` | `0.42` | `direct_closing` | "Saldo directo, sin promedio" | OK |

Detalle completo y chequeos de consistencia en `05_checks.md`.
