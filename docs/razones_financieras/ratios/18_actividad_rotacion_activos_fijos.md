# 18 — Rotación de activos fijos

- **Archivo**: `actividad_rotacion_activos_fijos.json` · **metadata.id**: `actividad.rotacion_activos_fijos` · **unit**: `ratio` · **period_mode**: `flow_with_average_balance`
- **Investigación (fase 1)**: completada con F1, F2 y NICs confirmadas; ver `02_fuentes.md` y `03_registro_cuentas.md`.

## Fórmula del profesor (tabla «Archivos y fórmulas»)

> Ventas netas / Activos fijos netos promedio — modo de periodo: `flow_with_average_balance`

**Fórmula descompuesta (`formula_display`):** ventas_netas[current] / average(activos_fijos_netos[previous], activos_fijos_netos[current])

**Árbol estructurado (`formula`):**

```json
{
  "op": "divide",
  "numerator": {
    "ref": "derived.ventas_netas",
    "period": "current"
  },
  "denominator": {
    "op": "average",
    "values": [
      {
        "ref": "derived.activos_fijos_netos",
        "period": "previous"
      },
      {
        "ref": "derived.activos_fijos_netos",
        "period": "current"
      }
    ],
    "required_periods": 2,
    "if_previous_period_missing": "not_available"
  }
}
```

## Derivados que intervienen

| derivado | definición |
|---|---|
| `activos_fijos_netos` | Activos fijos netos | reportado `bs.fixed_assets_net_total` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.fixed_assets_components"}` |
| `deducciones_ventas` | Deducciones de ventas | `{"op":"sum_accounts","account_set":"is.sales_deduction_components"}` |
| `ventas_brutas` | Ventas brutas | reportado `is.sales_total` si es válido; si no, `{"op":"sum_accounts","account_set":"is.gross_sales_components"}` |
| `ventas_netas` | Ventas netas | reportado `is.net_sales_reported` si es válido; si no, `{"op":"subtract","left":{"ref":"derived.ventas_brutas"},"right":{"ref":"derived.deducciones_ventas"}}` |

## Cuentas elementales (cierre completo, 16 cuentas)

| id | Nombre | Categoría | Naturaleza / signo | Ausencia | parent_group | 2023 | 2024 |
|---|---|---|---|---|---|---|---|
| `bs.accumulated_depreciation` | Depreciación acumulada | Correctora, negativa | acreedor / contra_asset | requires_data | `bs.fixed_assets_components` | -98,525 | -116,475 |
| `bs.fixed_assets_net_total` | Total de activos fijos netos | Subtotal reportado | deudor / positive_magnitude | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `bs.ppe_buildings` | Edificios e instalaciones | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 200,000 | 200,000 |
| `bs.ppe_furniture` | Mobiliario y equipo de oficina | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.ppe_land` | Terrenos | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 150,000 | 150,000 |
| `bs.ppe_machinery` | Maquinaria y equipo | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 120,000 | 120,000 |
| `bs.ppe_other` | Otros activos fijos tangibles | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.ppe_vehicles` | Vehículos | Activo fijo, bruto | deudor / positive_magnitude | zero_if_not_reported | `bs.fixed_assets_components` | 60,000 | 60,000 |
| `is.net_sales_reported` | Ventas netas reportadas | Total reportado, ingreso | acreedor / revenue | not_applicable | — | no aparece (política `not_applicable`) | no aparece (política `not_applicable`) |
| `is.other_sales_revenue` | Otras ventas ordinarias | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.product_sales` | Ventas de productos | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_allowances` | Rebajas sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_discounts` | Descuentos sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_returns` | Devoluciones sobre ventas | Contra-ingreso, correctora | deudor / other | zero_if_not_reported | `is.sales_deduction_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.sales_total` | Ventas totales | Ingreso bruto | acreedor / revenue | not_applicable | — | 850,000 | 920,000 |
| `is.service_revenue` | Ingresos por servicios | Ingreso bruto | acreedor / revenue | zero_if_not_reported | `is.gross_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |

Conjuntos usados: `bs.fixed_assets_components`, `is.gross_sales_components`, `is.sales_deduction_components`.

## Periodos

- **Modo** `flow_with_average_balance`: el flujo es del periodo actual y el denominador usa el promedio de saldos de cierre de los dos periodos (método `average`, insignia «Promedio {periodo_anterior}–{periodo_actual}»).
- **R1 (m1)**: sin periodo anterior, el resultado es `not_available` con motivo `missing_required_period_balance`. El botón «Mostrar cálculo directo de {primer_periodo}» existe en esta razón con `default: false`; al activarlo, el resultado usa saldos de cierre sin promedio (insignia «Saldo directo, sin promedio»). Si la activación necesita un saldo previo inexistente, sigue en `not_available`.
- **R2**: los cálculos solo usan las dos columnas del periodo (2023 y 2024); no hay columnas intermedias.

## Notas de investigación

- DECISION_PENDIENTE: diferencia de método con la solución del profesor (promedio D1 frente a saldos de cierre) por confirmar con el profesor; valores en 05_checks.md.

## Diferencia conocida con el profesor

| Periodo | Solución del profesor | Este documento | Comentario |
|---|---|---|---|
| 2024 | `2.22` | `2.18` | confirmada en el documento como diferencia de método |

## Checks (Fase 1e)

| Estado | Calculado | Esperado (doc) | Método | Insignia | Resultado |
|---|---|---|---|---|---|
| m1 off (2023) | `N/D` | `N/D` | `not_applicable` | — | OK |
| m1 on (2023) | `1.97` | `1.97` | `direct_closing` | "Saldo directo, sin promedio" | OK |
| 2024 (m2) | `2.18` | `2.18` | `average` | "Promedio 2023–2024" | OK |

Detalle completo y chequeos de consistencia en `05_checks.md`.
