# 02 — Fuentes

Una entrada por fuente. Solo fuentes abiertas y confirmadas en esta ejecución (R4): las 8 URLs se abrieron el 2026-10-14 con `webfetch` y con una extracción directa del texto del servidor de IFRS Foundation, y el texto devuelto corresponde a la norma indicada. Los dos documentos locales (F1, F2) se leyeron en disco en esta ejecución. Ninguna URL fue inventada. No se usaron respuestas de IA como fuente de verificación.

Hubo acceso a internet en esta ejecución: ninguna cuenta bajó a `partially_verified` por falta de acceso. Resultado de todas las fuentes: `confirmada`. Máximo 3 fuentes por cuenta (ver `03_registro_cuentas.md`).

| id | Título | URL | Afirmación verificada | ¿Abierta en esta ejecución? | Resultado |
|---|---|---|---|---|---|
| `F1` | Instrucciones para el agente: construir 20 JSON de razones financieras v3 (material del profesor) | `J_formulas/instrucciones_agente_json_razones_financieras_v3.md` (documento local) | Fórmulas de las 20 razones, tabla de mapeo del caso MUNO MODA S.A., decisiones D1–D14, reglas R1–R5 y política de ausencia por cuenta | sí — leído en disco en esta ejecución | confirmada |
| `F2` | Especificación del JSON para cuentas, fórmulas y razones financieras | `C:\Users\aleja\Downloads\especificacion_json_razones_financieras.md` (documento local) | Estructura JSON, catálogo canónico de cuentas con sinónimos y clasificación, conjuntos de componentes, reglas de agregación y de periodo | sí — leído en disco en esta ejecución (secciones 5–12) | confirmada |
| `S1` | NIC 1 — Presentación de estados financieros (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/ | La página exige presentar un conjunto completo de estados al menos anualmente, con importes comparativos del año anterior, e incluye el estado de situación financiera | sí — título y texto confirmados («a complete set of financial statements at least annually, with comparative amounts…», «statement of financial position») | confirmada |
| `S2` | NIC 2 — Inventarios (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/ | NIC 2 define el coste de las existencias con métodos de asignación y exige medirlas al menor entre coste y valor neto realizable | sí — título y texto confirmados («Inventories are measured at the lower of cost and net realisable value») | confirmada |
| `S3` | NIC 7 — Estados de flujos de efectivo (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/ | NIC 7 exige el estado de flujos de efectivo y define los equivalentes de efectivo como inversiones a corto plazo, altamente líquidas, de conversión inmediata y con riesgo insignificante de cambio de valor | sí — título y texto confirmados («Cash equivalents are short-term, highly liquid investments…») | confirmada |
| `S4` | NIC 12 — Impuesto sobre la renta (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/ | NIC 12: el impuesto corriente no pagado se reconoce como pasivo y se exige reconocer pasivo o activo de impuesto diferido por las diferencias temporales | sí — título y texto confirmados («current tax», «deferred tax liability … deferred tax asset») | confirmada |
| `S5` | NIC 16 — Propiedades, planta y equipo (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/ | NIC 16: las propiedades, planta y equipo son partidas tangibles usadas durante más de un periodo; regula su reconocimiento, su coste y la depreciación y el deterioro | sí — título y texto confirmados («tangible items … expected to be used during more than one period», «depreciation charges and impairment losses») | confirmada |
| `S6` | NIC 23 — Costos de financiación (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/ | NIC 23: los costes de financiación ajenos a activos elegibles se reconocen como gasto; son intereses y otros costes en que se incurre por la captación de fondos | sí — título y texto confirmados («Other borrowing costs are recognised as an expense», «interest and other costs … borrowing of funds») | confirmada |
| `S7` | NIC 37 — Provisiones, pasivos y activos contingentes (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/ | NIC 37: una provisión es un pasivo de tiempo o importe incierto, reconocido cuando es probable una salida de recursos económicos | sí — título y texto confirmados («A provision is a liability of uncertain timing or amount») | confirmada |
| `S8` | NIC 38 — Activos intangibles (IFRS Foundation) | https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/ | NIC 38: un activo intangible es un activo no monetario identificable sin sustancia física; es identificable cuando es separable o surge de derechos contractuales | sí — título y texto confirmados («An intangible asset is an identifiable non-monetary asset without physical substance») | confirmada |

Corrección de esta ronda: la afirmación de `S8` decía «activo monetario»; el texto de la norma dice **non-monetary** (activo *no* monetario) y quedó corregida arriba.

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
