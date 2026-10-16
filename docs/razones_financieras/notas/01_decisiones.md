# 01 — Decisiones y reglas vigentes (según la orden v6)

Este archivo **reemplaza** al `01_decisiones.md` de la ronda v3 (su contenido quedó en el historial de
git; el motivo del reemplazo: la orden v6 cambió la R1 —de control por razón a **control global**— y
agrega R1b, R2b, R2d y F1). Fuente única de esta versión: `prompt_correccion_agente_razones_v6.md`
(2026-10-15). Las decisiones del proyecto (D-021…D-024) viven en `docs/decisiones.md`; las correcciones
de D-023 (H1) y D-024 (H2) se aplican allí en el bloque B4.

## Decisiones financieras

| Id | Decisión |
|---|---|
| D1 | Las fórmulas son las de la tabla del profesor. ROA y ROE usan denominador promedio. Las rotaciones usan promedio. |
| D2 | El tratamiento de periodos sigue R1 y R2. |
| D3 | Activos fijos netos = `bs.ppe_*` + `bs.accumulated_depreciation`. La depreciación acumulada llega negativa y se suma con su signo. |
| D4 | Activos totales = activo corriente + activos fijos netos + intangibles + inversiones de largo plazo + otros activos no corrientes. Los ausentes valen cero. |
| D5 | Utilidad operativa = utilidad bruta + otros ingresos operativos − gastos operativos. Los ingresos y gastos no operativos no entran. |
| D6 | Utilidad neta = utilidad operativa + ingresos no operativos − gastos no operativos − gastos por intereses − impuesto sobre la renta. |
| D7 | Ventas netas = ventas brutas − devoluciones − descuentos − rebajas. En las razones 4 a 6, "Ventas" significa ventas netas. |
| D8 | Ventas a crédito son el dato suplementario `supp.credit_sales`. **Nunca se igualan a ventas netas.** Sin el dato, la razón 14 es N/D. |
| D9 | Las compras totales no se usan en ninguna razón. |
| D10 | Compras a crédito = `supp.supplier_payments` del periodo actual + cuentas por pagar del cierre actual − cuentas por pagar del cierre anterior. Supuesto: no hay devoluciones, descuentos ni otros ajustes. Sin el dato, las razones 16, 17 y 20 son N/D. En el primer periodo siempre son N/D. |
| D11 | Un total reportado válido se usa primero. Si no existe, se suman sus componentes. |
| D12 | Una cuenta ausente con `zero_if_not_reported` vale cero. Con `requires_data`, el resultado es N/D. |
| D13 | Los gastos y costos son magnitudes positivas que se restan explícitamente. La depreciación acumulada es negativa. |
| D14 | Pasivo corriente = cuentas por pagar + pasivo corto plazo + provisiones (y los demás componentes del conjunto). Pasivo no corriente = pasivo largo plazo + provisiones de largo plazo + otros pasivos no corrientes. |

## Reglas de periodo

| Id | Regla |
|---|---|
| R1 | **Razones de flujo** (7, 8 y 12 a 20). Si el estado trae **un solo periodo**, todas se calculan en directo con saldos de cierre, marcadas, sin control. Si trae **dos o más periodos**, cada periodo desde el segundo usa promedio. El primer periodo muestra N/D por defecto. Un **control global**, apagado por defecto, muestra el cálculo directo **solo del primer periodo**, marcado. Ese control afecta a todas las razones de flujo a la vez. |
| R1b | **Razones de saldo de cierre** (1 a 6, 9 a 11). Cada periodo muestra su valor de cierre. Todo valor lleva la marca de saldo directo. No tienen control. |
| R2 | Promedio = (cierre del periodo anterior + cierre del periodo actual) / 2. El flujo (ventas, costo, utilidad) es del periodo actual. |
| R2b | No se usa el cierre actual como sustituto del promedio cuando existe periodo anterior. No se reemplaza un saldo faltante por cero. |
| R2c | Un nodo que necesita un saldo del periodo anterior de forma directa no admite saldo directo. En el primer periodo siempre es N/D. |
| R2d | El método de un resultado derivado es el peor de los métodos de sus entradas. Si una entrada es saldo directo, el resultado es saldo directo y lleva la marca. |

## Reglas generales

| Id | Regla |
|---|---|
| R3 | Ningún campo contiene marcadores como `[informacion faltante]`, `[DATO FALTANTE]`, `TODO`, `pendiente`, `DECISION_PENDIENTE` o `???`. Un dato faltante se modela con `requires_data` (cuentas suplementarias) o con `not_available` y su motivo. |
| R4 | Fuentes. No inventes URLs. Una cuenta es `verified` solo si una fuente abierta **en esta ejecución** respalda **su definición concreta**. Los documentos del proyecto no son fuentes de definición. Máximo 3 fuentes por cuenta. No uses respuestas de otra IA como fuente. |
| R5 | Total sin desglose: si el estado trae solo un total, se usa la cuenta total (`bs.inventory_total`, `is.sales_total`). Sus componentes no se suman en esa agregación. |
| F1 | Formato numérico: punto decimal y coma de miles (`2.31`, `210,000`). Porcentajes con dos decimales y espacio antes del signo (`40.00 %`). Moneda sin decimales. Días y veces con dos decimales. |

## Notas

- La R1 de este archivo es la de la orden v6 (**control global** en `modo_periodo.control_global`);
  sustituye a la lectura v3 de "control por razón" que recogía la entrada D-023.
- Discrepancias con la solución del profesor: van en `razon.notes` de cada JSON con el prefijo
  `DIFERENCIA_CONOCIDA_PROFESOR:` (razones 7, 8, 12, 13, 14, 15, 18, 19).
