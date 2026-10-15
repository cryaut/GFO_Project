# 17 — Período promedio de pago

- **Archivo**: `actividad_periodo_promedio_pago.json` · **metadata.id**: `actividad.periodo_promedio_pago` · **unit**: `days` · **period_mode**: `flow_with_average_balance`
- **Investigación (fase 1)**: completada con F1, F2 y NICs confirmadas; ver `02_fuentes.md` y `03_registro_cuentas.md`.

## Fórmula del profesor (tabla «Archivos y fórmulas»)

> 365 / Rotación de CxP — modo de periodo: `flow_with_average_balance`

**Fórmula descompuesta (`formula_display`):** 365 / ratio.actividad.rotacion_cuentas_por_pagar[previous_current] (misma pareja de periodos; hereda N/D si 16 es N/D)

**Árbol estructurado (`formula`):**

```json
{
  "op": "divide",
  "numerator": {
    "value": 365
  },
  "denominator": {
    "ref": "ratio.actividad.rotacion_cuentas_por_pagar",
    "period": "previous_current"
  }
}
```

## Derivados que intervienen

| derivado | definición |
|---|---|
| `compras_credito` | Compras a crédito | `{"op":"subtract","left":{"op":"add","left":{"ref":"derived.pagos_proveedores","period":"current"},"right":{"ref":"derived.cxp_saldo","period":"current"}},"right":{"ref":"derived.cxp_saldo","period":"previous"}}` |
| `cxp_saldo` | Saldo de cierre de cuentas por pagar | `{"op":"reference","ref":"bs.trade_payables"}` |
| `pagos_proveedores` | Pagos a proveedores | `{"op":"reference","ref":"supp.supplier_payments","period":"current"}` |

## Cuentas elementales (cierre completo, 8 cuentas)

| id | Nombre | Categoría | Naturaleza / signo | Ausencia | parent_group | 2023 | 2024 |
|---|---|---|---|---|---|---|---|
| `bs.accrued_expenses_payable` | Gastos acumulados por pagar | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.current_portion_long_term_debt` | Porción corriente de deuda de largo plazo | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.current_provisions` | Provisiones corrientes | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 15,000 | 18,000 |
| `bs.other_current_liabilities` | Otros pasivos corrientes | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 60,000 | 65,000 |
| `bs.short_term_borrowings` | Préstamos de corto plazo | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.taxes_payable` | Impuestos por pagar | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | no aparece (política `zero_if_not_reported`) | no aparece (política `zero_if_not_reported`) |
| `bs.trade_payables` | Cuentas por pagar comerciales | Pasivo corriente | acreedor / positive_magnitude | zero_if_not_reported | `bs.current_liabilities_components` | 85,000 | 92,000 |
| `supp.supplier_payments` | Pagos a proveedores | Dato suplementario | deudor / positive_magnitude | requires_data | — | no aparece (política `requires_data`) | no aparece (política `requires_data`) |

Conjuntos usados: `bs.current_liabilities_components`.

## Periodos

- **Modo** `flow_with_average_balance`: el flujo es del periodo actual y el denominador usa el promedio de saldos de cierre de los dos periodos (método `average`, insignia «Promedio {periodo_anterior}–{periodo_actual}»).
- **R1 (m1)**: sin periodo anterior, el resultado es `not_available` con motivo `missing_required_period_balance`. El botón «Mostrar cálculo directo de {primer_periodo}» existe en esta razón con `default: false`; al activarlo, el resultado usa saldos de cierre sin promedio (insignia «Saldo directo, sin promedio»). Si la activación necesita un saldo previo inexistente, sigue en `not_available`.
- **R2**: los cálculos solo usan las dos columnas del periodo (2023 y 2024); no hay columnas intermedias.

## Notas de investigación

- Referencia a la razón base con period previous_current (misma pareja de periodos); la convención de referencia entre razones no está definida en el documento.

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
