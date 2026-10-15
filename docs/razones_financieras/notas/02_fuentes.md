# 02 — Fuentes

Una entrada por fuente. Solo fuentes abiertas y confirmadas en esta ejecución (R4): las URLs se abrieron con `webfetch` y el texto devuelto corresponde a la norma indicada. Ninguna URL fue inventada. No se usaron respuestas de IA como fuente de verificación.

Resultado de todas: `confirmada`. Máximo 3 fuentes por cuenta (ver `03_registro_cuentas.md`).

| id | Título | URL | Afirmación verificada | Resultado |
|---|---|---|---|---|
| `F1` | Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor) | `J_formulas/instrucciones_agente_json_razones_financieras_v3.md` (documento local) | Fórmulas de las 20 razones, tabla de mapeo del caso MUNO MODA S.A., decisiones D1–D14, reglas R1–R5 y política de ausencia por cuenta | confirmada |
| `F2` | Especificación del JSON para cuentas, fórmulas y razones financieras | `C:\Users\aleja\Downloads\especificacion_json_razones_financieras.md` (documento local) | Estructura JSON, catálogo canónico de cuentas con sinónimos y clasificación, conjuntos de componentes, reglas de agregación y de periodo | confirmada |
| `S1` | NIC 1 — Presentación de estados financieros (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/ | NIC 1 fija los requisitos generales de presentación del conjunto completo de estados con cifras comparativas, regula la presentación del estado de situación financiera y la presentación o clasificación de partidas | confirmada |
| `S2` | NIC 2 — Inventarios (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/ | NIC 2 define los inventarios, su coste y su reconocimiento como gasto cuando se venden (costo de ventas), incluida la medición al coste o al valor neto realizable | confirmada |
| `S3` | NIC 7 — Estados de flujos de efectivo (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/ | NIC 7 exige el estado de flujos de efectivo y define los equivalentes de efectivo como inversiones a corto plazo, altamente líquidas, de conversión casi inmediata | confirmada |
| `S4` | NIC 12 — Impuesto sobre la renta (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/ | NIC 12 obliga a reconocer el impuesto corriente y el diferido como gasto en el periodo en que se obtiene la utilidad | confirmada |
| `S5` | NIC 16 — Propiedades, planta y equipo (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/ | NIC 16: las propiedades, planta y equipo son partidas tangibles usadas durante más de un periodo; regula su reconocimiento, su coste y la depreciación a lo largo de su vida útil | confirmada |
| `S6` | NIC 23 — Costos de financiación (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/ | NIC 23: los costos de financiación (intereses de deudas) se reconocen como gasto en el periodo en que se incurren | confirmada |
| `S7` | NIC 37 — Provisiones, pasivos y activos contingentes (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/ | NIC 37: una provisión es un pasivo de tiempo o importe incierto, reconocido cuando es probable la salida de recursos y puede estimarse el importe | confirmada |
| `S8` | NIC 38 — Activos intangibles (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/ | NIC 38: un activo intangible es un activo monetario no financiero identificable sin sustancia física, reconocido cuando es probable su beneficio económico y puede medirse su coste | confirmada |

## Cuentas por fuente (resumen)

- `S1`: casi todo el catálogo del balance y del estado de resultados (presentación de partidas y clasificación).
- `S2`: `bs.inventory_total`, `bs.inventory_*`, `is.cost_of_sales_reported`, `is.merchandise_cost`, `is.product_cost`, `is.service_cost`.
- `S3`: `bs.cash_and_equivalents`.
- `S4`: `is.income_tax_expense`.
- `S5`: `bs.ppe_*`, `bs.accumulated_depreciation`.
- `S6`: `is.interest_expense`.
- `S7`: `bs.current_provisions`, `bs.long_term_provisions`.
- `S8`: `bs.intangible_assets`.
- `F1` + `F2`: las 26 cuentas de la tabla de mapeo del caso (nombre del caso, id y clasificación) y el catálogo completo.
