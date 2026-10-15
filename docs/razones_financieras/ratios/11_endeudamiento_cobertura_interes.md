# 11 — Razón de cobertura de interés

- **Archivo**: `endeudamiento_cobertura_interes.json` · **metadata.id**: `endeudamiento.cobertura_interes` · **unit**: `ratio` · **period_mode**: `point_in_time`
- **Investigación (fase 1)**: completada con F1, F2 y NICs confirmadas; ver `02_fuentes.md` y `03_registro_cuentas.md`.

## Fórmula del profesor (tabla «Archivos y fórmulas»)

> Utilidad operativa / Gastos por intereses — modo de periodo: `point_in_time`

**Fórmula descompuesta (`formula_display`):** utilidad_operativa / gasto_intereses; gasto_intereses = is.interest_expense

**Árbol estructurado (`formula`):**

```json
{
  "op": "divide",
  "numerator": {
    "ref": "derived.utilidad_operativa"
  },
  "denominator": {
    "ref": "derived.gasto_intereses"
  }
}
```

## Derivados que intervienen

| derivado | definición |
|---|---|
| `costo_ventas` | Costo de ventas | reportado `is.cost_of_sales_reported` si es válido; si no, `{"op":"sum_accounts","account_set":"is.cost_of_sales_components"}` |
| `deducciones_ventas` | Deducciones de ventas | `{"op":"sum_accounts","account_set":"is.sales_deduction_components"}` |
| `gasto_intereses` | Gastos por intereses | `{"op":"reference","ref":"is.interest_expense"}` |
| `gastos_operativos` | Gastos operativos | `{"op":"sum_accounts","account_set":"is.operating_expense_components"}` |
| `utilidad_bruta` | Utilidad bruta | reportado `is.gross_profit_reported` si es válido; si no, `{"op":"subtract","left":{"ref":"derived.ventas_netas"},"right":{"ref":"derived.costo_ventas"}}` |
| `utilidad_operativa` | Utilidad operativa | reportado `is.operating_profit_reported` si es válido; si no, `{"op":"subtract","left":{"op":"add","left":{"ref":"derived.utilidad_bruta"},"right":{"ref":"is.other_operating_income"}},"right":{"ref":"derived.gastos_operativos"}}` |
| `ventas_brutas` | Ventas brutas | reportado `is.sales_total` si es válido; si no, `{"op":"sum_accounts","account_set":"is.gross_sales_components"}` |
| `ventas_netas` | Ventas netas | reportado `is.net_sales_reported` si es válido; si no, `{"op":"subtract","left":{"ref":"derived.ventas_brutas"},"right":{"ref":"derived.deducciones_ventas"}}` |

## Cuentas elementales (cierre completo, 21 cuentas)

| id | Nombre | Categoría | Naturaleza / signo | Ausencia | parent_group | 2023 | 2024 |
|---|---|---|---|---|---|---|---|
| `is.administrative_expenses` | Gastos administrativos | Gasto operativo | deudor / expense | zero_if_not_reported | `is.operating_expense_components` | 120,000 | 130,000 |
| `is.cost_of_sales_reported` | Costo de ventas reportado | Costo | deudor / expense | not_applicable | — | 510,000 | 545,000 |
| `is.gross_profit_reported` | Utilidad bruta reportada | Total reportado, resultado | depends_on_context / signed_balance | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `is.interest_expense` | Gastos por intereses | Financiero, intereses | deudor / expense | zero_if_not_reported | — | 12,600 | 11,250 |
| `is.merchandise_cost` | Costo de mercadería vendida | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.net_sales_reported` | Ventas netas reportadas | Total reportado, ingreso | acreedor / revenue | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `is.operating_amortization` | Amortización operativa | Gasto operativo | deudor / expense | zero_if_not_reported | `is.operating_expense_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.operating_depreciation` | Depreciación operativa | Gasto operativo | deudor / expense | zero_if_not_reported | `is.operating_expense_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.operating_profit_reported` | Utilidad operativa reportada | Total reportado, resultado | depends_on_context / signed_balance | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `is.other_operating_expenses` | Otros gastos operativos | Gasto operativo | deudor / expense | zero_if_not_reported | `is.operating_expense_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.other_operating_income` | Otros ingresos operativos | Ingreso operativo | acreedor / revenue | zero_if_not_reported | — | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.other_sales_revenue` | Otras ventas ordinarias | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.product_cost` | Costo de productos vendidos | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.product_sales` | Ventas de productos | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_allowances` | Rebajas sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_discounts` | Descuentos sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_returns` | Devoluciones sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_total` | Ventas totales | Ingreso bruto | acreedor / revenue | not_applicable | — | 850,000 | 920,000 |
| `is.selling_expenses` | Gastos de ventas | Gasto operativo | deudor / expense | zero_if_not_reported | `is.operating_expense_components` | 85,000 | 90,000 |
| `is.service_cost` | Costo de servicios | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.service_revenue` | Ingresos por servicios | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |

Conjuntos usados: `is.cost_of_sales_components`, `is.gross_sales_components`, `is.operating_expense_components`, `is.sales_deduction_components`.

## Periodos

- **Modo** `point_in_time`: cada periodo se calcula con sus saldos de cierre; no requiere periodos anteriores (`requires_previous_period: false`, método `direct_closing`, insignia «Saldo directo, sin promedio»).

## Notas de investigación

- Si el gasto por intereses es cero, el resultado es not_available con motivo zero_denominator (regla de la razón 11).

## Diferencia conocida con el profesor

| Periodo | Solución del profesor | Este documento | Comentario |
|---|---|---|---|
| — | — | — | sin diferencia conocida |

## Checks (Fase 1e)

| Estado | Calculado | Esperado (doc) | Método | Insignia | Resultado |
|---|---|---|---|---|---|
| m1 off (2023) | `10.71` | `10.71` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| m1 on (2023) | `10.71` | `10.71` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| 2024 (m2) | `13.78` | `13.78` | `direct_closing` | "Saldo directo, sin promedio" | OK |

Detalle completo y chequeos de consistencia en `05_checks.md`.
