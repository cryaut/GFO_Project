# 15 — Período promedio de cobro

- **Archivo**: `actividad_periodo_promedio_cobro.json` · **metadata.id**: `actividad.periodo_promedio_cobro` · **unit**: `days` · **period_mode**: `flow_with_average_balance`
- **Investigación (fase 1)**: completada con F1, F2 y NICs confirmadas; ver `02_fuentes.md` y `03_registro_cuentas.md`.

## Fórmula del profesor (tabla «Archivos y fórmulas»)

> 365 / Rotación de CxC — modo de periodo: `flow_with_average_balance`

**Fórmula descompuesta (`formula_display`):** 365 / ratio.actividad.rotacion_cuentas_por_cobrar[previous_current] (misma pareja de periodos; hereda N/D si 14 es N/D)

**Árbol estructurado (`formula`):**

```json
{
  "op": "divide",
  "numerator": {
    "value": 365
  },
  "denominator": {
    "ref": "ratio.actividad.rotacion_cuentas_por_cobrar",
    "period": "previous_current"
  }
}
```

## Derivados que intervienen

| derivado | definición |
|---|---|
| `cxc_saldo` | Saldo de cierre de cuentas por cobrar | `{"op":"reference","ref":"bs.trade_receivables"}` |
| `ventas_credito` | Ventas a crédito | `{"op":"reference","ref":"supp.credit_sales","period":"current"}` |

## Cuentas elementales (cierre completo, 12 cuentas)

| id | Nombre | Categoría | Naturaleza / signo | Ausencia | parent_group | 2023 | 2024 |
|---|---|---|---|---|---|---|---|
| `bs.cash_and_equivalents` | Efectivo y equivalentes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 45,000 | 52,000 |
| `bs.inventory_finished_goods` | Inventario de productos terminados | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_merchandise` | Inventario de mercaderías | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_raw_materials` | Inventario de materias primas | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.inventory_total` | Inventario total | Inventario | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 180,000 | 195,000 |
| `bs.inventory_work_in_process` | Inventario de productos en proceso | Inventario / activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.other_current_assets` | Otros activos corrientes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 25,000 | 30,000 |
| `bs.other_current_receivables` | Otras cuentas por cobrar corrientes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.prepaid_expenses` | Gastos pagados por anticipado | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.short_term_investments` | Inversiones de corto plazo | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.trade_receivables` | Cuentas por cobrar comerciales | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 120,000 | 135,000 |
| `supp.credit_sales` | Ventas a crédito | Dato suplementario | acreedor / positive_magnitude | requires_data | — | no aparece (política `requires_data`) | no aparece (política `requires_data`) |

Conjuntos usados: `bs.current_assets_components`.

## Periodos

- **Modo** `flow_with_average_balance`: el flujo es del periodo actual y el denominador usa el promedio de saldos de cierre de los dos periodos (método `average`, insignia «Promedio {periodo_anterior}–{periodo_actual}»).
- **R1 (m1)**: sin periodo anterior, el resultado es `not_available` con motivo `missing_required_period_balance`. El botón «Mostrar cálculo directo de {primer_periodo}» existe en esta razón con `default: false`; al activarlo, el resultado usa saldos de cierre sin promedio (insignia «Saldo directo, sin promedio»). Si la activación necesita un saldo previo inexistente, sigue en `not_available`.
- **R2**: los cálculos solo usan las dos columnas del periodo (2023 y 2024); no hay columnas intermedias.

## Notas de investigación

- Referencia a la razón base con period previous_current (misma pareja de periodos); la convención de referencia entre razones no está definida en el documento.
- DECISION_PENDIENTE: el profesor aproxima ventas a crédito con ventas totales (51.53 y 53.56); este documento exige no aproximar (D8). Por confirmar con el profesor; valores en 05_checks.md.

## Diferencia conocida con el profesor

| Periodo | Solución del profesor | Este documento | Comentario |
|---|---|---|---|
| 2023 y 2024 | `51.53 y 53.56` | `N/D (falta ventas a crédito)` | confirmada en el documento como diferencia de método |

## Checks (Fase 1e)

| Estado | Calculado | Esperado (doc) | Método | Insignia | Resultado |
|---|---|---|---|---|---|
| m1 off (2023) | `N/D` | `N/D` | `not_applicable` | — | OK |
| m1 on (2023) | `N/D` | `N/D` | `not_applicable` | — | OK |
| 2024 (m2) | `N/D` | `N/D` | `not_applicable` | — | OK |

Detalle completo y chequeos de consistencia en `05_checks.md`.
