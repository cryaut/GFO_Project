# 03 — Fuentes (auditoría por cuenta)

Registro histórico de fuentes consultadas en la ronda v7 (HTTP GET con verificación de
título y texto el 2026-10-15). Estas aperturas no se presentan como repetidas en la ronda 7 del 2026-10-20. Los documentos del proyecto (F1: instrucciones de la ronda v3;
F2: especificación) **no** son fuentes de definición y fueron quitados de los JSON (H4).

Auditoría v7 (D-035): una cuenta es `verified` solo si una **frase textual de menos de 15
palabras** de una norma abierta en esta ejecución confirma su definición concreta; la frase queda
escrita en esta tabla y en el campo `supports` de la cuenta. Sin frase específica la cuenta pasa a
`partially_verified` con `sources: []`. La evidencia de apertura de cada norma es su título y la
fecha del registro de aperturas de abajo (V14 solo compara la URL contra `REGISTRO_APERTURAS`).

## Reconciliación del 2026-10-20

**Aclaración (22 de octubre de 2026, ronda 10 A1).** Esta sección registra la reconciliación histórica de ronda 7. El conteo actual es **0 verified, 66 partially_verified y 5 ambiguous**; la rebaja posterior de efectivo y el retiro de las cuatro fuentes de v8 se describen en las secciones de ronda 8. El párrafo original se conserva sin reescribirlo.

Los estados de las 71 cuentas se alinean con el catálogo del PR #14 en `7e71ad8`: **1 verified, 65 partially_verified y 5 ambiguous**. Se rebajan 28 cuentas, incluidas las cuatro señaladas por la tarea. Las fuentes y frases de esta tabla se conservan como registro de la ronda v7, sin otorgarles por ello verificación específica. No se añaden citas ni se afirma haber reabierto normas.

La premisa de la instrucción no coincide con `a87ef0a`: los JSON citan IFRS, no PGC; la cita de `is.operating_amortization` ya habla de amortización en IAS 38, no de depreciación. Se conserva esa cita, sin simular una corrección inexistente. La definición de intangibles se corrige a no monetarios según la excepción expresa. Véase el [informe de ronda 7](../../planificacion/razones-json-v3/ronda7-C-cierre-pr10.md).

## Registro de aperturas

| Fuente | URL | Abierta el |
|---|---|---|
| IAS 1 Presentation of Financial Statements | https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/ | 2026-10-15 |
| IAS 2 Inventories | https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/ | 2026-10-15 |
| IAS 7 Statement of Cash Flows | https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/ | 2026-10-15 |
| IAS 12 Income Taxes | https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/ | 2026-10-15 |
| IAS 16 Property, Plant and Equipment | https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/ | 2026-10-15 |
| IAS 23 Borrowing Costs | https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/ | 2026-10-15 |
| IAS 32 Financial Instruments: Presentation | https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/ | 2026-10-15 |
| IAS 37 Provisions, Contingent Liabilities and Contingent Assets | https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/ | 2026-10-15 |
| IAS 38 Intangible Assets | https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/ | 2026-10-15 |
| IFRS 15 Revenue from Contracts with Customers | https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/ | 2026-10-15 |
| IFRS 9 Financial Instruments | https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/ | 2026-10-15 |

IFRS 9 se abrió también en esta ejecución, pero no aporta frase textual de menos de 15 palabras que
defina alguna cuenta concreta de este caso: ninguna cuenta queda `verified` con NIIF 9.

## Tabla cuenta–fuente (una fila por cuenta)

| Cuenta | Fuente | Afirmación que la respalda | Abierta en esta ejecución | Estado |
|---|---|---|---|---|
| `bs.accrued_expenses_payable` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.accumulated_depreciation` | — (`sources: []`) | La frase anterior describe el alcance de IAS 16; no define depreciación acumulada. Fuente retirada por v8 T1. | no se certifica apertura nueva | `partially_verified` |
| `bs.additional_paid_in_capital` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.cash_and_equivalents` | — (`sources: []`) | La frase literal se confirmó en el resumen oficial de IAS 7, pero la norma PDF no pudo abrirse sin suscripción; se aplica la rebaja conservadora de v8 T2. | resumen sí; norma no | `partially_verified` |
| `bs.current_assets_total` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.current_liabilities_total` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.current_portion_long_term_debt` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.current_provisions` | IAS 37 Provisions, Contingent Liabilities and Contingent Assets — https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/ | «A provision is a liability of uncertain timing or amount» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.current_year_result_equity` | — (`sources: []`) | La frase anterior enumera un estado financiero; no define esta cuenta. Fuente retirada por v8 T1. | no se certifica apertura nueva | `partially_verified` |
| `bs.fixed_assets_net_total` | IAS 16 Property, Plant and Equipment — https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/ | «Property, plant and equipment are tangible items» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.intangible_assets` | IAS 38 Intangible Assets — https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/ | «An intangible asset is an identifiable non-monetary asset without physical substance» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.inventory_finished_goods` | IAS 2 Inventories — https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/ | «the carrying amount of those inventories is recognised as an expense» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.inventory_merchandise` | IAS 2 Inventories — https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/ | «Inventories are measured at the lower of cost and net realisable value» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.inventory_raw_materials` | IAS 2 Inventories — https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/ | «The cost of inventories includes all costs of purchase, costs of conversion» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.inventory_total` | — (cuenta interna del caso) | — (cuenta interna: se llena o se calcula desde los datos del caso; D-035 no aplica) | — | `partially_verified` |
| `bs.inventory_work_in_process` | IAS 2 Inventories — https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/ | «costs of conversion (direct labour and production overhead)» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.legal_reserve` | — (cuenta ambigua) | — (mapeo según el caso; las 5 cuentas `ambiguous` no cambian, orden v7) | — | `ambiguous` |
| `bs.long_term_borrowings` | — (cuenta ambigua) | — (mapeo según el caso; las 5 cuentas `ambiguous` no cambian, orden v7) | — | `ambiguous` |
| `bs.long_term_investments` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.long_term_provisions` | IAS 37 Provisions, Contingent Liabilities and Contingent Assets — https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/ | «A provision is a liability of uncertain timing or amount» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.other_current_assets` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.other_current_liabilities` | — (cuenta ambigua) | — (mapeo según el caso; las 5 cuentas `ambiguous` no cambian, orden v7) | — | `ambiguous` |
| `bs.other_current_receivables` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.other_equity_components` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.other_noncurrent_assets` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.other_noncurrent_liabilities` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.other_reserves` | — (cuenta ambigua) | — (mapeo según el caso; las 5 cuentas `ambiguous` no cambian, orden v7) | — | `ambiguous` |
| `bs.ppe_buildings` | IAS 16 Property, Plant and Equipment — https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/ | «Property, plant and equipment are tangible items» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.ppe_furniture` | IAS 16 Property, Plant and Equipment — https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/ | «Property, plant and equipment are tangible items» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.ppe_land` | IAS 16 Property, Plant and Equipment — https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/ | «Property, plant and equipment are tangible items» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.ppe_machinery` | — (cuenta ambigua) | — (mapeo según el caso; las 5 cuentas `ambiguous` no cambian, orden v7) | — | `ambiguous` |
| `bs.ppe_other` | IAS 16 Property, Plant and Equipment — https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/ | «Property, plant and equipment are tangible items» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.ppe_vehicles` | IAS 16 Property, Plant and Equipment — https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/ | «Property, plant and equipment are tangible items» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.prepaid_expenses` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.retained_earnings` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.share_capital` | IAS 32 Financial Instruments: Presentation — https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/ | «financial instruments are classified into financial assets, financial liabilities and equity instruments» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.short_term_borrowings` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.short_term_investments` | IAS 7 Statement of Cash Flows — https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/ | «Cash equivalents are short-term, highly liquid investments» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.taxes_payable` | IAS 12 Income Taxes — https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/ | «to the extent that it is unpaid, recognised as a liability» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `bs.total_assets` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.total_equity` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.total_liabilities` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.trade_payables` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `bs.trade_receivables` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.administrative_expenses` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.cost_of_sales_reported` | IAS 2 Inventories — https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/ | «the carrying amount of those inventories is recognised as an expense» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `is.gross_profit_reported` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.income_tax_expense` | IAS 12 Income Taxes — https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/ | «Income taxes include all domestic and foreign taxes that are based on taxable profits» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `is.interest_expense` | IAS 23 Borrowing Costs — https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/ | «Borrowing costs are interest and other costs that an entity incurs» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `is.merchandise_cost` | IAS 2 Inventories — https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/ | «the carrying amount of those inventories is recognised as an expense» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `is.net_income_reported` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.net_sales_reported` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.noninterest_nonoperating_expenses` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.nonoperating_income` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.operating_amortization` | — (`sources: []`) | No se certifica la cita histórica como definición de la cuenta en una norma abierta en esta ejecución. Se conserva parcial y se retira la fuente por v8 T1. | no se certifica apertura nueva | `partially_verified` |
| `is.operating_depreciation` | — (`sources: []`) | No se certifica una definición específica en una norma abierta en esta ejecución. Se conserva parcial y se retira la fuente histórica por v8 T1. | no se certifica apertura nueva | `partially_verified` |
| `is.operating_profit_reported` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.other_operating_expenses` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.other_operating_income` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.other_sales_revenue` | IFRS 15 Revenue from Contracts with Customers — https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/ | «recognises revenue to depict the transfer of promised goods or services to the customer» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `is.product_cost` | IAS 2 Inventories — https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/ | «The cost of inventories includes all costs of purchase, costs of conversion» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `is.product_sales` | IFRS 15 Revenue from Contracts with Customers — https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/ | «recognises revenue to depict the transfer of promised goods or services to the customer» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `is.sales_allowances` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.sales_discounts` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.sales_returns` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.sales_total` | — (cuenta interna del caso) | — (cuenta interna: se llena o se calcula desde los datos del caso; D-035 no aplica) | — | `partially_verified` |
| `is.selling_expenses` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.service_cost` | — | (sin frase específica; la norma general no define esta cuenta, D-035) | — | `partially_verified` |
| `is.service_revenue` | IFRS 15 Revenue from Contracts with Customers — https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/ | «recognises revenue to depict the transfer of promised goods or services to the customer» (frase textual de la norma) | sí (2026-10-15) | `partially_verified` |
| `supp.credit_sales` | — (cuenta interna del caso) | — (cuenta interna: se llena o se calcula desde los datos del caso; D-035 no aplica) | — | `partially_verified` |
| `supp.supplier_payments` | — (cuenta interna del caso) | — (cuenta interna: se llena o se calcula desde los datos del caso; D-035 no aplica) | — | `partially_verified` |

CONTEOS vigentes (2026-10-20): cuentas=71 verified=1 partially_verified=65 ambiguous=5

**Aclaración (22 de octubre de 2026, ronda 10 A1).** La etiqueta «vigentes» de la línea anterior corresponde al 20 de octubre y queda como registro histórico; desde la rebaja de efectivo en ronda 8 el conteo vigente es **cuentas=71 verified=0 partially_verified=66 ambiguous=5**. No se certifican aperturas nuevas ni se cambian fuentes o estados en A1.

## Ronda 8 v8 — Tarea 1 (2026-10-21)

Las cuatro cuentas señaladas ya eran parciales en 1481e79, pero conservaban objetos de fuente. Se retiran esos objetos en todas sus apariciones y se mantiene `partially_verified` con `sources: []`. No se modifican definiciones, estados ambiguos ni cuentas internas. Las demás aperturas de 2026-10-15 continúan como historia y no se presentan como realizadas hoy.

## Ronda 8 v8 — Tarea 2 y registro de acceso (2026-10-21)

Solo `bs.cash_and_equivalents` seguía en verified. Se abrió [la página oficial de IAS 7](https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/): su sección About contiene literalmente «Cash comprises cash on hand and demand deposits» (9 palabras). Esto verifica el texto del resumen, no constituye apertura de la norma completa.

La búsqueda devolvió [el PDF oficial IAS 7, edición 2024](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2024/issued/part-a/ias-7-statement-of-cash-flows.pdf?bypass=on). Al abrirlo, la respuesta fue una página HTML redirigida a [IFRS Digital subscription required](https://www.ifrs.org/premium/). No se declara leído el PDF ni se usa el snippet indexado como norma abierta. Un intento anterior de URL de publicación devolvió inaccesible; tampoco se presenta como apertura.

Por la regla expresa de v8 («si no puedes abrir la norma, la cuenta pasa a partially_verified»), efectivo pasa a parcial con sources vacío en todas sus apariciones. Ninguna cuenta se eleva a verified ni se certifican normas históricas como reabiertas.

Conteos finales por id único: **0 verified / 66 partially_verified / 5 ambiguous (71 cuentas)**. No quedan cuentas verified cuya cita deba darse por comprobada; las cinco ambiguas y las cuatro cuentas internas se conservaron íntegras. La rebaja es de investigación documental, sin cambio de datos ni de cálculo.
