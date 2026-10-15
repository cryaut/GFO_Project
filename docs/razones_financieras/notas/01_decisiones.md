# 01 — Decisiones y reglas vigentes

Copiadas de `instrucciones_agente_json_razones_financieras_v3.md`. Prevalecen sobre la especificación.

## Decisiones

| Id | Decisión | Validación con el caso MUNO MODA S.A. |
|---|---|---|
| D1 | Fórmulas de la tabla "Archivos y fórmulas". ROA y ROE usan denominador promedio. | ROA 2024 = 12.89 %; ROE 2024 = 19.06 % |
| D2 | Árbol de periodos: ver R1. | Ver Ejemplo |
| D3 | Activos fijos netos = terrenos + edificios + equipos + vehículos + depreciación acumulada. La depreciación acumulada llega negativa y se suma con su signo. | Rotación de activos fijos 2023 directa = 1.97 |
| D4 | Activos totales = activo corriente + activos fijos netos + intangibles netos. Los intangibles valen cero si no se reportan. | Activos totales 2023 = 801,475 |
| D5 | Utilidad operativa = utilidad bruta − gastos operativos. Otros ingresos, otros gastos e intereses no entran. | Margen operativo 2023 = 15.88 % |
| D6 | Utilidad neta = utilidad operativa + ingresos no operativos − gastos no operativos − intereses − impuesto sobre la renta. | Utilidad neta 2023 = 89,180; 2024 = 104,825 |
| D7 | Ventas netas = ventas brutas − devoluciones, descuentos y rebajas. En el caso no hay deducciones. | Margen bruto 2023 = 40.00 % |
| D8 | Ventas a crédito son un dato suplementario (`supp.credit_sales`). **Nunca se igualan a ventas netas ni a ventas totales.** Si no existe el dato, la rotación de CxC y el período de cobro son N/D. | No hay `supp.credit_sales` en el caso: rotación de CxC, período de cobro y ciclo son N/D |
| D9 | Compras totales no intervienen en ninguna razón y no se calculan. | — |
| D10 | Compras a crédito = pagos a proveedores + CxP de cierre actual − CxP de cierre anterior. Supuesto S2: no hay devoluciones, descuentos ni otros ajustes a compras o CxP distintos de los pagos. El dato `supp.supplier_payments` es suplementario. Si falta, la rotación de CxP, el período de pago y el ciclo son N/D con motivo `missing_required_account_data`. En m1 siempre son N/D, porque requieren la CxP de cierre anterior. | No hay `supp.supplier_payments` en el caso: rotación de CxP, período de pago y ciclo son N/D |
| D11 | El caso no trae subtotales reportados. Los totales se calculan desde cuentas, salvo los totales sin desglose de R5. | — |
| D12 | Una cuenta catalogada ausente con `zero_if_not_reported` aporta cero dentro de la suma. No bloquea el total. | Intangibles = 0 |
| D13 | Gastos y costos llegan como magnitudes positivas y se restan explícitamente. La depreciación acumulada llega negativa. | — |
| D14 | Pasivo corriente = cuentas por pagar + pasivo corto plazo + provisiones. Pasivo no corriente = pasivo largo plazo + otros pasivos. | Capital de trabajo 2023 = 210,000 |

## Reglas de periodos

**R1. Árbol de periodos.** Aplica a las razones de modo `flow_with_average_balance` (7, 8 y 12–20).

- **Un solo periodo en el estado:** cálculo directo con saldos de cierre de ese periodo, marcado siempre.
- **Dos o más periodos (m1, m2, ..., mn):**
  - Cada año mi con i ≥ 2 muestra solo el método con promedio. Etiqueta interna: `m(i−1)_mi`.
  - m1 no tiene periodo anterior. Por defecto muestra N/D con motivo `missing_required_period_balance`.
  - Un botón "Mostrar cálculo directo de m1", desactivado por defecto, muestra el cálculo directo de m1 con sus saldos de cierre. Es el único año que puede calcularse de forma directo cuando hay varios periodos.
  - Si el resultado de m1 necesita un saldo previo que no existe (CxP o inventario inicial, por ejemplo), sigue en N/D aunque el botón esté activo.

**R2. Promedio.**

- Promedio = (saldo de cierre del periodo anterior + saldo de cierre del periodo actual) / 2.
- El flujo (ventas, costo de ventas, utilidad neta) es del periodo actual de la pareja.
- No uses el cierre actual como sustituto del promedio cuando existe periodo anterior.
- No reemplaces un saldo faltante por cero para fabricar un promedio.

**R3. Sin marcadores.** Está prohibido escribir `[informacion faltante]`, `[DATO FALTANTE]`, `TODO`, `pendiente` o `???` como valor de un campo. Si un dato falta, usar:

- Cuenta sin fuente verificable: `research.status: "partially_verified"`, `sources: []` y la falta descrita en `ambiguities`.
- Resultado no calculable: `not_available` con el motivo de `validation_rules`.
- Decisión no resuelta: aplicar la regla de la tabla de decisiones y escribir `DECISION_PENDIENTE: <decisión>` en `metadata.research_notes`. Esa palabra solo aparece en `research_notes`.

**R4. Fuentes.**

- No inventar URLs. Solo las que se abrieron y confirmaron.
- Sin acceso a internet: `sources: []` y `research.status: "partially_verified"` en las cuentas afectadas, y mención en el reporte.
- No usar respuestas de otra IA como fuente de verificación.

**Marca de cálculo directo.** Cada valor calculado con saldos de cierre sin promedio lleva la insignia "Saldo directo, sin promedio" (razones `point_in_time` en todos los periodos, valores de un solo periodo y m1 con botón activo).
