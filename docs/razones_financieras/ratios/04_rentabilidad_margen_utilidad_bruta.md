# 04 — Margen de utilidad bruta

- **Archivo**: `rentabilidad_margen_utilidad_bruta.json` · **metadata.id**: `rentabilidad.margen_utilidad_bruta` · **unit**: `percentage` · **period_mode**: `point_in_time`
- **Investigación (fase 1)**: completada con F1, F2 y NICs confirmadas; ver `02_fuentes.md` y `03_registro_cuentas.md`.

## Fórmula del profesor (tabla «Archivos y fórmulas»)

> Utilidad bruta / Ventas — modo de periodo: `point_in_time`

**Fórmula descompuesta (`formula_display`):** utilidad_bruta / ventas_netas (D7; en el caso no hay deducciones)

**Árbol estructurado (`formula`):**

```json
{
  "op": "divide",
  "numerator": {
    "ref": "derived.utilidad_bruta"
  },
  "denominator": {
    "ref": "derived.ventas_netas"
  }
}
```

## Derivados que intervienen

| derivado | definición |
|---|---|
| `costo_ventas` | Costo de ventas | reportado `is.cost_of_sales_reported` si es válido; si no, `{"op":"sum_accounts","account_set":"is.cost_of_sales_components"}` |
| `deducciones_ventas` | Deducciones de ventas | `{"op":"sum_accounts","account_set":"is.sales_deduction_components"}` |
| `utilidad_bruta` | Utilidad bruta | reportado `is.gross_profit_reported` si es válido; si no, `{"op":"subtract","left":{"ref":"derived.ventas_netas"},"right":{"ref":"derived.costo_ventas"}}` |
| `ventas_brutas` | Ventas brutas | reportado `is.sales_total` si es válido; si no, `{"op":"sum_accounts","account_set":"is.gross_sales_components"}` |
| `ventas_netas` | Ventas netas | reportado `is.net_sales_reported` si es válido; si no, `{"op":"subtract","left":{"ref":"derived.ventas_brutas"},"right":{"ref":"derived.deducciones_ventas"}}` |

## Cuentas elementales (cierre completo, 13 cuentas)

| id | Nombre | Categoría | Naturaleza / signo | Ausencia | parent_group | 2023 | 2024 |
|---|---|---|---|---|---|---|---|
| `is.cost_of_sales_reported` | Costo de ventas reportado | Costo | deudor / expense | not_applicable | — | 510,000 | 545,000 |
| `is.gross_profit_reported` | Utilidad bruta reportada | Total reportado, resultado | depends_on_context / signed_balance | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `is.merchandise_cost` | Costo de mercadería vendida | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.net_sales_reported` | Ventas netas reportadas | Total reportado, ingreso | acreedor / revenue | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `is.other_sales_revenue` | Otras ventas ordinarias | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.product_cost` | Costo de productos vendidos | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.product_sales` | Ventas de productos | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_allowances` | Rebajas sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_discounts` | Descuentos sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_returns` | Devoluciones sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_total` | Ventas totales | Ingreso bruto | acreedor / revenue | not_applicable | — | 850,000 | 920,000 |
| `is.service_cost` | Costo de servicios | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.service_revenue` | Ingresos por servicios | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |

Conjuntos usados: `is.cost_of_sales_components`, `is.gross_sales_components`, `is.sales_deduction_components`.

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
| m1 off (2023) | `40.00 %` | `40.00 %` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| m1 on (2023) | `40.00 %` | `40.00 %` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| 2024 (m2) | `40.76 %` | `40.76 %` | `direct_closing` | "Saldo directo, sin promedio" | OK |

Detalle completo y chequeos de consistencia en `05_checks.md`.
