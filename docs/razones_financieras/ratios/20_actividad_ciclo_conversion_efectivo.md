# 20 — Ciclo de conversión de efectivo

- **Archivo**: `actividad_ciclo_conversion_efectivo.json` · **metadata.id**: `actividad.ciclo_conversion_efectivo` · **unit**: `days` · **period_mode**: `flow_with_average_balance`
- **Investigación (fase 1)**: completada con F1, F2 y NICs confirmadas; ver `02_fuentes.md` y `03_registro_cuentas.md`.

## Fórmula del profesor (tabla «Archivos y fórmulas»)

> Edad promedio del inventario + Período promedio de cobro − Período promedio de pago — modo de periodo: `flow_with_average_balance`

**Fórmula descompuesta (`formula_display`):** ratio.actividad.edad_promedio_inventario + ratio.actividad.periodo_promedio_cobro − ratio.actividad.periodo_promedio_pago (misma pareja de periodos)

**Árbol estructurado (`formula`):**

```json
{
  "op": "subtract",
  "left": {
    "op": "add",
    "left": {
      "ref": "ratio.actividad.edad_promedio_inventario",
      "period": "previous_current"
    },
    "right": {
      "ref": "ratio.actividad.periodo_promedio_cobro",
      "period": "previous_current"
    }
  },
  "right": {
    "ref": "ratio.actividad.periodo_promedio_pago",
    "period": "previous_current"
  }
}
```

## Derivados que intervienen

| derivado | definición |
|---|---|
| `compras_credito` | Compras a crédito | `{"op":"subtract","left":{"op":"add","left":{"ref":"derived.pagos_proveedores","period":"current"},"right":{"ref":"derived.cxp_saldo","period":"current"}},"right":{"ref":"derived.cxp_saldo","period":"previous"}}` |
| `costo_ventas` | Costo de ventas | reportado `is.cost_of_sales_reported` si es válido; si no, `{"op":"sum_accounts","account_set":"is.cost_of_sales_components"}` |
| `cxc_saldo` | Saldo de cierre de cuentas por cobrar | `{"op":"reference","ref":"bs.trade_receivables"}` |
| `cxp_saldo` | Saldo de cierre de cuentas por pagar | `{"op":"reference","ref":"bs.trade_payables"}` |
| `inventario_total` | Inventario total | reportado `bs.inventory_total` si es válido; si no, `{"op":"sum_accounts","account_set":"bs.inventory_components"}` |
| `pagos_proveedores` | Pagos a proveedores | `{"op":"reference","ref":"supp.supplier_payments","period":"current"}` |
| `ventas_credito` | Ventas a crédito | `{"op":"reference","ref":"supp.credit_sales","period":"current"}` |

## Cuentas elementales (cierre completo, 24 cuentas)

| id | Nombre | Categoría | Naturaleza / signo | Ausencia | parent_group | 2023 | 2024 |
|---|---|---|---|---|---|---|---|
| `bs.accrued_expenses_payable` | Gastos acumulados por pagar | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.cash_and_equivalents` | Efectivo y equivalentes | Activo corriente | deudor / positive_magnitude | zero_if_not_reported | `bs.current_assets_components` | 45,000 | 52,000 |
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
| `is.cost_of_sales_reported` | Costo de ventas reportado | Costo | deudor / expense | not_applicable | — | 510,000 | 545,000 |
| `is.merchandise_cost` | Costo de mercadería vendida | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.product_cost` | Costo de productos vendidos | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `is.service_cost` | Costo de servicios | Costo | deudor / expense | zero_if_not_reported | `is.cost_of_sales_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `supp.credit_sales` | Ventas a crédito | Dato suplementario | acreedor / positive_magnitude | requires_data | — | no aparece (política `requires_data`) | no aparece (política `requires_data`) |
| `supp.supplier_payments` | Pagos a proveedores | Dato suplementario | deudor / positive_magnitude | requires_data | — | no aparece (política `requires_data`) | no aparece (política `requires_data`) |

Conjuntos usados: `bs.current_assets_components`, `bs.current_liabilities_components`, `bs.inventory_components`, `is.cost_of_sales_components`.

## Periodos

- **Modo** `flow_with_average_balance`: el flujo es del periodo actual y el denominador usa el promedio de saldos de cierre de los dos periodos (método `average`, insignia «Promedio {periodo_anterior}–{periodo_actual}»).
- **R1 (m1)**: sin periodo anterior, el resultado es `not_available` con motivo `missing_required_period_balance`. El botón «Mostrar cálculo directo de {primer_periodo}» existe en esta razón con `default: false`; al activarlo, el resultado usa saldos de cierre sin promedio (insignia «Saldo directo, sin promedio»). Si la activación necesita un saldo previo inexistente, sigue en `not_available`.
- **R2**: los cálculos solo usan las dos columnas del periodo (2023 y 2024); no hay columnas intermedias.

## Notas de investigación

- Referencias a las tres razones base con period previous_current (misma pareja de periodos); la convención de referencia entre razones no está definida en el documento.
- Si cualquiera de las tres componentes es N/D, el ciclo es N/D y el motivo nombra la componente faltante.

## Diferencia conocida con el profesor

| Periodo | Solución del profesor | Este documento | Comentario |
|---|---|---|---|
| — | — | — | sin diferencia conocida |

## Checks (Fase 1e)

| Estado | Calculado | Esperado (doc) | Método | Insignia | Resultado |
|---|---|---|---|---|---|
| m1 off (2023) | `N/D` | `N/D` | `not_applicable` | — | OK |
| m1 on (2023) | `N/D` | `N/D` | `not_applicable` | — | OK |
| 2024 (m2) | `N/D` | `N/D` | `not_applicable` | — | OK |

Detalle completo y chequeos de consistencia en `05_checks.md`.
