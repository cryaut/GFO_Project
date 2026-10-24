# Investigación de nombres de cuentas

Fecha de consulta: 2026-10-17.

Base: 71 definiciones distintas de los 20 JSON del PR #10, commit `a87ef0af0954e00d3f95ed1476ec3154bc06d768`. La instantánea completa está en `tests/fixtures/cuentas-pr10.json`; el test compara identidad, nombre, clasificación, rol y ausencia. No se integra el motor ni se modifican sus JSON. Se añade `is.interest_income` por aprobación de Carlos en el chat.

## Auditoría de la revisión (2026-10-18), rondas 2 y 3

La primera auditoría revisó las 29 cuentas heredadas como `verified`: rebajó 6 y conservó 23 con citas locales. La regla aprobada en la ronda 3 (D-045) aclara que el PGC español solo es referencia terminológica y no sostiene `verified`. De esas 23, **22 dependían de una cita PGC**, no de una cita específica NIIF/NIC: se rebajan a `partially_verified`. Solo `bs.cash_and_equivalents` conserva `verified`, con la cita específica de IAS 7 ya documentada.

El catálogo queda en **1 verified, 66 partially_verified y 5 ambiguous** (72 cuentas, incluido el id nuevo de intereses). Hay **28 rebajas locales** frente a la instantánea del PR #10: las 6 previas más estas 22. La fixture `tests/fixtures/cuentas-revision-investigacion.json` enumera todas sus causas; ninguna diferencia se oculta cambiando la instantánea original.

Las cuatro cuentas señaladas expresamente son `bs.accumulated_depreciation`, `bs.current_year_result_equity`, `is.operating_amortization`, `is.operating_depreciation`. La prueba solicitada impide que cualquier cuenta `verified` tenga una cita PGC; exige aplicar el mismo criterio también a las otras **18 cuentas** sustentadas así:

- `bs.current_provisions`.
- `bs.inventory_finished_goods`.
- `bs.inventory_merchandise`.
- `bs.inventory_raw_materials`.
- `bs.inventory_work_in_process`.
- `bs.long_term_provisions`.
- `bs.ppe_buildings`.
- `bs.ppe_furniture`.
- `bs.ppe_land`.
- `bs.ppe_other`.
- `bs.ppe_vehicles`.
- `bs.share_capital`.
- `bs.short_term_investments`.
- `bs.taxes_payable`.
- `is.income_tax_expense`.
- `is.interest_expense`.
- `is.product_sales`.
- `is.service_revenue`.

Se conserva el [PGC publicado por el BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884), quinta parte, solo como referencia terminológica española. No afirma normativa aplicable en Nicaragua ni verifica alias, signos o reglas internas. Los enlaces NIIF/NIC generales de esas 22 cuentas aportan contexto, sin una cita que defina la cuenta específica; no se inventa evidencia nueva para mantener su estado anterior.

**Amortización y depreciación.** La frase atribuida a `is.operating_amortization` describe depreciación y no define amortización: se retira de su campo `cita` y se conserva la advertencia de alcance. La definición del PGC conservada para `is.operating_depreciation` es conjunta para las cuentas 680/681/682, no propia de depreciación operativa. Ambas quedan `partially_verified`.

**Intangibles (D-046).** Se corrige la definición local de `bs.intangible_assets`: «monetarios» pasa a «no monetarios», conforme al texto de IAS 38 ya consultado. Se conservan clasificación, tipo y política de ausencia; no cambia un cálculo. La fixture declara la definición original del PR #10 y la local corregida, con su decisión y motivo. El JSON de aquel PR y su instantánea original permanecen sin modificar; la cuenta mantiene `partially_verified`.

**Sincronización v8 pendiente.** El PR #10 sigue referenciado en `a87ef0a`; su orden v8 aún no se ha publicado. Las cuatro rebajas anunciadas ya se aplican localmente, pero no se presenta esto como una sincronización con JSON inexistentes. La prueba compara estados y definiciones con la instantánea, exige que toda diferencia local figure en la fixture y mantiene igualdad estricta con los JSON vivos cuando estén integrados: la reconciliación de las 28 rebajas y la corrección de intangibles sigue siendo un requisito previo a integrar.

## Fuentes abiertas en la ejecución inicial (2026-10-17)

Las fuentes respaldan conceptos; no acreditan por sí solas cada traducción española. Las variantes sin prueba literal se declaran sin fuente externa. No se atribuyen a una norma.

- [ias-1-presentation-of-financial-statements](https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/): «guidelines for their structure and minimum requirements for their content».
- [ias-2-inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/): «Inventories are measured at the lower of cost and net realisable value».
- [ias-7-statement-of-cash-flows](https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/): «Cash comprises cash on hand and demand deposits».
- [ias-12-income-taxes](https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/): «to the extent that it is unpaid, recognised as a liability».
- [ias-16-property-plant-and-equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/): «are expected to be used during more than one period».
- [ias-23-borrowing-costs](https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/): «Other borrowing costs are recognised as an expense».
- [ias-32-financial-instruments-presentation](https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/): «financial assets, financial liabilities and equity instruments».
- [ias-37-provisions-contingent-liabilities-and-contingent-assets](https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/): «A provision is a liability of uncertain timing or amount».
- [ias-38-intangible-assets](https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/): «an identifiable non-monetary asset without physical substance».
- [ifrs-15-revenue-from-contracts-with-customers](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/): «transfer of promised goods or services to the customer».
- [ifrs-9-financial-instruments](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/): «classify and measure financial assets, financial liabilities».
- [Ingresos por intereses](https://www.ifrs.org/projects/completed-projects/2018/presentation-of-interest-revenue-for-particular-financial-instruments-ifrs-9-and-ias-1/): el título oficial contiene «Presentation of interest revenue». Título de proyecto; no define la cuenta.

## Registro por cuenta y sinónimo

Los estados de investigación heredados describen el concepto. «Sin fuente externa literal» no significa sin procedencia: se conserva el alias del JSON identificado o se añade como variante del caso de prueba, sin inventar una referencia. Una cuenta `ambiguous` nunca se asigna automáticamente por alias.

### `bs.accrued_expenses_payable` — Gastos acumulados por pagar

- Grupo: `pasivos`; clasificación: `pasivo_corriente`; rol: `detail`; tipo transitorio: `pasivoCortoPlazo`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Gastos devengados por pagar»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «obligaciones acumuladas»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.accumulated_depreciation` — Depreciación acumulada

- Grupo: `activos`; clasificación: `correctora_activo`; rol: `contra_account`; tipo transitorio: `depreciacionAcumulada`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (281); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 16 Property, Plant and Equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/).
- Sinónimo «Depreciación acumulada de activos fijos»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.additional_paid_in_capital` — Aportes adicionales de capital

- Grupo: `patrimonio`; clasificación: `patrimonio`; rol: `detail`; tipo transitorio: `patrimonio`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Prima en emisión»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «aportes adicionales»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.cash_and_equivalents` — Efectivo y equivalentes

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `detail`; tipo transitorio: `efectivo`.
- Investigación: `verified`.
- Evidencia específica: cita literal y ubicación en `fuentes` de `cuentas-catalogo.js`, auditoría del 2026-10-18. La cita se conserva en un solo lugar.
- Respaldo conceptual: [IAS 7 Statement of Cash Flows](https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/).
- Sinónimo «Efectivo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «caja»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «bancos»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «caja y bancos»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Banco»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Sinónimo «Equivalentes de efectivo»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `bs.current_assets_total` — Total de activos corrientes

- Grupo: `activos`; clasificación: `total`; rol: `reported_total`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Total activo corriente»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «total activo circulante»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.current_liabilities_total` — Total de pasivos corrientes

- Grupo: `pasivos`; clasificación: `total`; rol: `reported_total`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Total pasivo corriente»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «total pasivo circulante»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.current_portion_long_term_debt` — Porción corriente de deuda de largo plazo

- Grupo: `pasivos`; clasificación: `pasivo_corriente`; rol: `detail`; tipo transitorio: `pasivoCortoPlazo`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Vencimientos corrientes de deuda a largo plazo»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.current_provisions` — Provisiones corrientes

- Grupo: `pasivos`; clasificación: `pasivo_corriente`; rol: `detail`; tipo transitorio: `provisiones`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (14 y 529); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 37 Provisions, Contingent Liabilities and Contingent Assets](https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/).
- Sinónimo «Provisiones de corto plazo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Provisiones»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `bs.current_year_result_equity` — Resultado del período incluido en patrimonio

- Grupo: `patrimonio`; clasificación: `patrimonio`; rol: `detail`; tipo transitorio: `patrimonio`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (129); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 1 Presentation of Financial Statements](https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/).
- Sinónimo «Utilidad del ejercicio»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «pérdida del ejercicio»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «resultado del período dentro del patrimonio»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.fixed_assets_net_total` — Total de activos fijos netos

- Grupo: `activos`; clasificación: `activo_fijo`; rol: `reported_total`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18: El enlace a IAS 16 no define este subtotal reportado ni su precedencia interna sobre componentes.
- Respaldo conceptual: [IAS 16 Property, Plant and Equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/).
- Sinónimo «Activo fijo neto»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «propiedad planta y equipo neto»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.intangible_assets` — Activos intangibles

- Grupo: `activos`; clasificación: `activo_no_corriente`; rol: `detail`; tipo transitorio: `activosFijos`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-046: La corrección autorizada D-046 cambia monetarios por no monetarios; se mantiene la rebaja conservadora local y se documenta aparte la diferencia de definición.
- Respaldo conceptual: [IAS 38 Intangible Assets](https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/).
- Sinónimo «Intangibles»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «software capitalizado»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «patentes»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.inventory_finished_goods` — Inventario de productos terminados

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `detail`; tipo transitorio: `inventario`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (35); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 2 Inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/).
- Sinónimo «Productos terminados»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «bienes terminados»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.inventory_merchandise` — Inventario de mercaderías

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `detail`; tipo transitorio: `inventario`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (30); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 2 Inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/).
- Sinónimo «Mercaderías»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «mercancías»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «inventario para la venta»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Mercadería»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `bs.inventory_raw_materials` — Inventario de materias primas

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `detail`; tipo transitorio: `inventario`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (31); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 2 Inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/).
- Sinónimo «Materias primas»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «materiales en almacén para producción»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.inventory_total` — Inventario total

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `reported_total`; tipo transitorio: `inventario`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Inventario»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «existencias totales»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Inventarios»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Sinónimo «Existencias»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Ambigüedad heredada: Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.

### `bs.inventory_work_in_process` — Inventario de productos en proceso

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `detail`; tipo transitorio: `inventario`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (33); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 2 Inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/).
- Sinónimo «Producción en proceso»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «productos en proceso»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.legal_reserve` — Reserva legal

- Grupo: `patrimonio`; clasificación: `patrimonio`; rol: `detail`; tipo transitorio: `patrimonio`.
- Investigación: `ambiguous`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Reserva legal acumulada»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Reservas»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Ambigüedad heredada: Reserva legal: figura del marco legal local, fuera de NIIF; el nombre puede aludir a reservas legales de distintos regímenes. Se clasifica como patrimonio por el nombre y se marca ambiguous porque ninguna norma NIIF la define.

### `bs.long_term_borrowings` — Deudas de largo plazo

- Grupo: `pasivos`; clasificación: `pasivo_no_corriente`; rol: `detail`; tipo transitorio: `pasivoLargoPlazo`.
- Investigación: `ambiguous`.
- Respaldo conceptual: [IFRS 9 Financial Instruments](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/); [IAS 32 Financial Instruments: Presentation](https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/).
- Sinónimo «Préstamos a largo plazo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «obligaciones financieras no corrientes»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Pasivo Largo Plazo»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Sinónimo «Pasivo No Corriente»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Ambigüedad heredada: Nombre genérico del caso «Pasivo Largo Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo no corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).

### `bs.long_term_investments` — Inversiones de largo plazo

- Grupo: `activos`; clasificación: `activo_no_corriente`; rol: `detail`; tipo transitorio: `activosFijos`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Inversiones permanentes»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «inversiones no corrientes»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.long_term_provisions` — Provisiones de largo plazo

- Grupo: `pasivos`; clasificación: `pasivo_no_corriente`; rol: `detail`; tipo transitorio: `pasivoLargoPlazo`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (14); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 37 Provisions, Contingent Liabilities and Contingent Assets](https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/).
- Sinónimo «Provisiones no corrientes»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Provisiones»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `bs.other_current_assets` — Otros activos corrientes

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `detail`; tipo transitorio: `activosCorrientesOtros`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Otros activos circulantes»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Activos Corrientes Otros»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `bs.other_current_liabilities` — Otros pasivos corrientes

- Grupo: `pasivos`; clasificación: `pasivo_corriente`; rol: `detail`; tipo transitorio: `pasivoCortoPlazo`.
- Investigación: `ambiguous`.
- Respaldo conceptual: [IAS 1 Presentation of Financial Statements](https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/).
- Sinónimo «Otros pasivos circulantes»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Pasivo Corto Plazo»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Ambigüedad heredada: Nombre genérico del caso «Pasivo Corto Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).

### `bs.other_current_receivables` — Otras cuentas por cobrar corrientes

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `detail`; tipo transitorio: `activosCorrientesOtros`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Deudores varios corrientes»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «otras cuentas por cobrar de corto plazo»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.other_equity_components` — Otros componentes del patrimonio

- Grupo: `patrimonio`; clasificación: `patrimonio`; rol: `detail`; tipo transitorio: `patrimonio`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Otras cuentas patrimoniales que no tengan un identificador más específico»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.other_noncurrent_assets` — Otros activos no corrientes

- Grupo: `activos`; clasificación: `activo_no_corriente`; rol: `detail`; tipo transitorio: `activosFijos`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Otros activos a largo plazo»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.other_noncurrent_liabilities` — Otros pasivos no corrientes

- Grupo: `pasivos`; clasificación: `pasivo_no_corriente`; rol: `detail`; tipo transitorio: `pasivoLargoPlazo`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Otros pasivos a largo plazo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Otros Pasivos»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `bs.other_reserves` — Otras reservas patrimoniales

- Grupo: `patrimonio`; clasificación: `patrimonio`; rol: `detail`; tipo transitorio: `patrimonio`.
- Investigación: `ambiguous`.
- Respaldo conceptual: [IAS 1 Presentation of Financial Statements](https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/).
- Sinónimo «Reservas»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «otras reservas de capital o patrimonio»: sin fuente externa literal; procedencia: JSON del PR #10.
- Ambigüedad heredada: Nombre genérico del caso «Reservas»: el detalle de la reserva es incierto, pero su clasificación en el patrimonio es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).

### `bs.ppe_buildings` — Edificios e instalaciones

- Grupo: `activos`; clasificación: `activo_fijo`; rol: `detail`; tipo transitorio: `activosFijos`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (211); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 16 Property, Plant and Equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/).
- Sinónimo «Edificios»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «construcciones de uso operativo»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.ppe_furniture` — Mobiliario y equipo de oficina

- Grupo: `activos`; clasificación: `activo_fijo`; rol: `detail`; tipo transitorio: `activosFijos`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (216); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 16 Property, Plant and Equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/).
- Sinónimo «Mobiliario»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «muebles y enseres»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «equipo de oficina»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Equipos»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `bs.ppe_land` — Terrenos

- Grupo: `activos`; clasificación: `activo_fijo`; rol: `detail`; tipo transitorio: `activosFijos`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (210); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 16 Property, Plant and Equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/).
- Sinónimo «Terrenos de uso operativo»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.ppe_machinery` — Maquinaria y equipo

- Grupo: `activos`; clasificación: `activo_fijo`; rol: `detail`; tipo transitorio: `activosFijos`.
- Investigación: `ambiguous`.
- Respaldo conceptual: [IAS 16 Property, Plant and Equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/).
- Sinónimo «Maquinaria»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «equipo productivo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Equipos»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Ambigüedad heredada: Nombre genérico del caso «Equipos»: el detalle de la cuenta es incierto, pero su clasificación en activo fijo es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).

### `bs.ppe_other` — Otros activos fijos tangibles

- Grupo: `activos`; clasificación: `activo_fijo`; rol: `detail`; tipo transitorio: `activosFijos`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (219); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 16 Property, Plant and Equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/).
- Sinónimo «Propiedad, planta y equipo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «otros activos fijos tangibles»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.ppe_vehicles` — Vehículos

- Grupo: `activos`; clasificación: `activo_fijo`; rol: `detail`; tipo transitorio: `activosFijos`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (218); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 16 Property, Plant and Equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/).
- Sinónimo «Equipo de transporte»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «vehículos de uso operativo»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.prepaid_expenses` — Gastos pagados por anticipado

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `detail`; tipo transitorio: `activosCorrientesOtros`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Pagos anticipados»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «seguros pagados por anticipado»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.retained_earnings` — Utilidades retenidas

- Grupo: `patrimonio`; clasificación: `patrimonio`; rol: `detail`; tipo transitorio: `patrimonio`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Resultados acumulados»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «utilidades acumuladas»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Utilidad acumulada»: sin fuente externa literal; variante singular del corpus previo del EFE.

### `bs.share_capital` — Capital social

- Grupo: `patrimonio`; clasificación: `patrimonio`; rol: `detail`; tipo transitorio: `patrimonio`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (100); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 32 Financial Instruments: Presentation](https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/).
- Sinónimo «Capital emitido»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «capital aportado»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «capital social pagado»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.short_term_borrowings` — Préstamos de corto plazo

- Grupo: `pasivos`; clasificación: `pasivo_corriente`; rol: `detail`; tipo transitorio: `pasivoCortoPlazo`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Deudas bancarias de corto plazo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «obligaciones financieras corrientes»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Pasivo Corto Plazo»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Sinónimo «Documentos por Pagar a Corto Plazo»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `bs.short_term_investments` — Inversiones de corto plazo

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `detail`; tipo transitorio: `activosCorrientesOtros`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (54); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 7 Statement of Cash Flows](https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/).
- Sinónimo «Inversiones temporales»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «valores negociables de corto plazo»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.taxes_payable` — Impuestos por pagar

- Grupo: `pasivos`; clasificación: `pasivo_corriente`; rol: `detail`; tipo transitorio: `pasivoCortoPlazo`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (475); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 12 Income Taxes](https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/).
- Sinónimo «Tributos por pagar»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «impuestos corrientes por pagar»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.total_assets` — Total de activos

- Grupo: `activos`; clasificación: `total`; rol: `reported_total`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Total activo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «activo total»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «total de recursos»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.total_equity` — Total patrimonio

- Grupo: `patrimonio`; clasificación: `total`; rol: `reported_total`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Patrimonio total»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «capital contable total»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «patrimonio neto»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.total_liabilities` — Total de pasivos

- Grupo: `pasivos`; clasificación: `total`; rol: `reported_total`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Pasivo total»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «total pasivo»: sin fuente externa literal; procedencia: JSON del PR #10.

### `bs.trade_payables` — Cuentas por pagar comerciales

- Grupo: `pasivos`; clasificación: `pasivo_corriente`; rol: `detail`; tipo transitorio: `cuentasPorPagar`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «CxP»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «proveedores»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «cuentas por pagar a proveedores»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Cuentas por Pagar»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `bs.trade_receivables` — Cuentas por cobrar comerciales

- Grupo: `activos`; clasificación: `activo_corriente`; rol: `detail`; tipo transitorio: `cxC`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «CxC»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «clientes»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «cuentas por cobrar a clientes»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «deudores comerciales»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Cuentas por Cobrar»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `is.administrative_expenses` — Gastos administrativos

- Grupo: `estadoResultados`; clasificación: `gasto_operativo`; rol: `detail`; tipo transitorio: `gastosAdmin`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Gastos de administración»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «gastos generales y administrativos»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.cost_of_sales_reported` — Costo de ventas reportado

- Grupo: `estadoResultados`; clasificación: `costo`; rol: `reported_total`; tipo transitorio: `costoVentas`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18: IAS 2 explica el gasto por inventarios vendidos, pero no define este total reportado con precedencia interna.
- Respaldo conceptual: [IAS 2 Inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/).
- Sinónimo «Costo de ventas»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «costo de los bienes vendidos»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Costos de ventas»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Sinónimo «Costo de lo vendido»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `is.gross_profit_reported` — Utilidad bruta reportada

- Grupo: `estadoResultados`; clasificación: `resultado`; rol: `reported_total`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Ganancia bruta»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «resultado bruto»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.income_tax_expense` — Gasto por impuesto sobre la renta

- Grupo: `estadoResultados`; clasificación: `impuesto`; rol: `detail`; tipo transitorio: `impuestos`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (630 y 6300); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 12 Income Taxes](https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/).
- Sinónimo «Impuesto sobre la renta»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «impuesto a las ganancias del período»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Impuestos»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Sinónimo «IR»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `is.interest_expense` — Gastos por intereses

- Grupo: `estadoResultados`; clasificación: `financiero`; rol: `detail`; tipo transitorio: `intereses`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (662); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IAS 23 Borrowing Costs](https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/).
- Sinónimo «Intereses pagados o devengados»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «gastos financieros por intereses»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Gastos de intereses»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Sinónimo «Gastos financieros»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Sinónimo «Intereses pagados»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `is.interest_income` — Ingresos por intereses

- Grupo: `estadoResultados`; clasificación: `ingreso_financiero`; rol: `detail`; tipo transitorio: `otrosIngresos`.
- Investigación: `partially_verified`.
- Respaldo conceptual: [IFRS: Presentation of interest revenue](https://www.ifrs.org/projects/completed-projects/2018/presentation-of-interest-revenue-for-particular-financial-instruments-ifrs-9-and-ias-1/).
- Sinónimo «Intereses ganados»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Sinónimo «Intereses devengados a favor»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Agrupación D-051, aprobada por Cris Lumbi el 2026-10-19: `agrupadoEn: 'is.nonoperating_income'`. Se suma a los ingresos no operativos como componente al calcular la utilidad neta sin utilidad reportada. Conserva `tipoApp: 'otrosIngresos'`; la relación no cambia la fórmula actual ni el estado de investigación.

### `is.merchandise_cost` — Costo de mercadería vendida

- Grupo: `estadoResultados`; clasificación: `costo`; rol: `detail`; tipo transitorio: `costoVentas`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18: La fuente anterior describe inventarios en general, sin definir esta cuenta específica de mercaderías vendidas.
- Respaldo conceptual: [IAS 2 Inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/).
- Sinónimo «Costo de ventas de mercaderías»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «costo de bienes vendidos»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.net_income_reported` — Utilidad neta reportada

- Grupo: `estadoResultados`; clasificación: `resultado`; rol: `reported_total`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Utilidad del ejercicio»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «ganancia neta»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «resultado neto»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.net_sales_reported` — Ventas netas reportadas

- Grupo: `estadoResultados`; clasificación: `ingreso`; rol: `reported_total`; tipo transitorio: `ventas`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Ventas netas»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «ventas netas totales»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.noninterest_nonoperating_expenses` — Gastos no operativos distintos de intereses

- Grupo: `estadoResultados`; clasificación: `no_operativo`; rol: `detail`; tipo transitorio: `otrosGastos`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Otros gastos no operativos»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «gastos no operacionales excluyendo intereses identificados por separado»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Otros Gastos»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `is.nonoperating_income` — Ingresos no operativos

- Grupo: `estadoResultados`; clasificación: `no_operativo`; rol: `detail`; tipo transitorio: `otrosIngresos`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Otros ingresos no operativos»: sin fuente externa literal; procedencia: JSON del PR #10.
- Ronda 5/D-051: se retira «ingresos financieros no clasificados en otra cuenta específica», procedente del JSON del PR #10, por contradecir la inclusión de intereses ganados. La definición se conserva.
- Sinónimo «Otros Ingresos»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `is.operating_amortization` — Amortización operativa

- Grupo: `estadoResultados`; clasificación: `gasto_operativo`; rol: `detail`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La frase del PGC es conjunta para 680/681/682 y describe depreciación, no define amortización. Se retira como cita específica; las fuentes restantes solo aportan contexto conceptual.
- Respaldo conceptual: [IAS 38 Intangible Assets](https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/).
- Sinónimo «Amortización de activos usados en operaciones, bajo la misma regla de no duplicación»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.operating_depreciation` — Depreciación operativa

- Grupo: `estadoResultados`; clasificación: `gasto_operativo`; rol: `detail`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La definición del PGC es conjunta para 680/681/682, no propia de depreciación operativa. Solo es referencia terminológica; IAS 16 aporta contexto conceptual sin cita específica de esta cuenta.
- Respaldo conceptual: [IAS 16 Property, Plant and Equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/).
- Sinónimo «Depreciación de activos usados en operaciones, solo si no está incluida ya en otra cuenta agregada utilizada»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.operating_profit_reported` — Utilidad operativa reportada

- Grupo: `estadoResultados`; clasificación: `resultado`; rol: `reported_total`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Resultado operativo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «utilidad de operación»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.other_operating_expenses` — Otros gastos operativos

- Grupo: `estadoResultados`; clasificación: `gasto_operativo`; rol: `detail`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Otros gastos de operación»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Otros Gastos»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `is.other_operating_income` — Otros ingresos operativos

- Grupo: `estadoResultados`; clasificación: `ingreso`; rol: `detail`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Otros ingresos de operación si pertenecen a la actividad operativa»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Otros Ingresos»: sin fuente externa literal; procedencia: variante del proyecto / corpus.

### `is.other_sales_revenue` — Otras ventas ordinarias

- Grupo: `estadoResultados`; clasificación: `ingreso`; rol: `detail`; tipo transitorio: `ventas`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18: IFRS 15 describe ingresos de contratos, sin definir una cuenta residual de otras ventas.
- Respaldo conceptual: [IFRS 15 Revenue from Contracts with Customers](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/).
- Sinónimo «Otras ventas»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «otras ventas operativas si efectivamente son ventas»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.product_cost` — Costo de productos vendidos

- Grupo: `estadoResultados`; clasificación: `costo`; rol: `detail`; tipo transitorio: `costoVentas`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18: La fuente anterior describe inventarios en general, sin definir específicamente el coste de producción de los productos vendidos.
- Respaldo conceptual: [IAS 2 Inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/).
- Sinónimo «Costo de producción vendido»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «costo de productos vendidos»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.product_sales` — Ventas de productos

- Grupo: `estadoResultados`; clasificación: `ingreso`; rol: `detail`; tipo transitorio: `ventas`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (701 (definición conjunta 700/705)); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IFRS 15 Revenue from Contracts with Customers](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/).
- Sinónimo «Ventas de mercaderías»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «ventas de bienes»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.sales_allowances` — Rebajas sobre ventas

- Grupo: `estadoResultados`; clasificación: `deduccion_ingreso`; rol: `detail`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Rebajas y bonificaciones sobre ventas»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.sales_discounts` — Descuentos sobre ventas

- Grupo: `estadoResultados`; clasificación: `deduccion_ingreso`; rol: `detail`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Descuentos concedidos sobre ventas»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.sales_returns` — Devoluciones sobre ventas

- Grupo: `estadoResultados`; clasificación: `deduccion_ingreso`; rol: `detail`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Devoluciones de ventas»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «ventas devueltas»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.sales_total` — Ventas totales

- Grupo: `estadoResultados`; clasificación: `ingreso`; rol: `reported_total`; tipo transitorio: `ventas`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Ventas»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «ventas ordinarias totales»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «Ingresos operacionales»: sin fuente externa literal; procedencia: variante del proyecto / corpus.
- Ambigüedad heredada: Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo.

### `is.selling_expenses` — Gastos de ventas

- Grupo: `estadoResultados`; clasificación: `gasto_operativo`; rol: `detail`; tipo transitorio: `gastosVentas`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Gastos comerciales»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «gastos de distribución si el criterio de clase los clasifica como operativos»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.service_cost` — Costo de servicios

- Grupo: `estadoResultados`; clasificación: `costo`; rol: `detail`; tipo transitorio: `costoVentas`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Costos de servicios prestados»: sin fuente externa literal; procedencia: JSON del PR #10.

### `is.service_revenue` — Ingresos por servicios

- Grupo: `estadoResultados`; clasificación: `ingreso`; rol: `detail`; tipo transitorio: `ventas`.
- Investigación: `partially_verified`.
- Revisión 2026-10-18, D-045: La cita específica procede del PGC español (705 (definición conjunta 700/705)); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.
- Respaldo conceptual: [IFRS 15 Revenue from Contracts with Customers](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/).
- Sinónimo «Ventas de servicios»: sin fuente externa literal; procedencia: JSON del PR #10.
- Sinónimo «ingresos por servicios prestados»: sin fuente externa literal; procedencia: JSON del PR #10.

### `supp.credit_sales` — Ventas a crédito

- Grupo: `suplementario`; clasificación: `suplementario`; rol: `detail`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Ventas a crédito del periodo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Ambigüedad heredada: Dato suplementario del caso (D8): ventas a crédito reportadas solo por el caso; sin fuente externa. Se usa con requires_data y nunca se iguala a ventas netas.

### `supp.supplier_payments` — Pagos a proveedores

- Grupo: `suplementario`; clasificación: `suplementario`; rol: `detail`; tipo transitorio: `None`.
- Investigación: `partially_verified`.
- Sin fuente externa conceptual verificada en esta ejecución. Se conserva la definición propuesta del JSON.
- Sinónimo «Pagos a proveedores del periodo»: sin fuente externa literal; procedencia: JSON del PR #10.
- Ambigüedad heredada: Dato suplementario del caso (D10): pagos a proveedores reportados solo por el caso; sin fuente externa. Se usa con requires_data para derivar compras a crédito.

## Compatibilidad y límites

Los nombres de `COMPATIBILIDAD_LEGADA` solo conservan un tipo de los datos anteriores y nunca asignan ids. Procedencia de todos ellos: reglas anteriores de `inferAccountType` y corpus existente del repositorio, sin fuente externa literal: Equipos → activosFijos; Pasivo Corto Plazo → pasivoCortoPlazo; Provisiones → provisiones; Pasivo Largo Plazo, Pasivo No Corriente y Prestamo Largo Plazo → pasivoLargoPlazo; Capital y Reservas → patrimonio; Otros Ingresos → otrosIngresos; Otros Gastos → otrosGastos; Intereses → intereses. Los alias de clasificación de `ALIAS_CLASIFICACION` proceden de `TYPE_ALIASES` anterior; se conservaron como tipos explícitos, sin atribuirles fuentes externas ni convertirlos en ids.

La demostración conserva tipos explícitos y las cifras exigidas. Equipos, Reservas, Provisiones y Pasivo Corto/Largo Plazo siguen siendo ambiguos como identificadores aunque su tipo antiguo sea conocido. Otros Ingresos/Gastos solo son no operativos en el caso de demostración o tras confirmación. Los totales reportados sin equivalente en los 19 tipos se conservan por separado; no se inventa una fórmula para ellos. Los módulos consumidores siguen usando su API vigente. No se confirma ni se agrega un dato de dividendos.
