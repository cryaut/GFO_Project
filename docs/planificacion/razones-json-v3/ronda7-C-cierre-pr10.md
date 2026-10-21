# Ronda 7 — Tarea C: cierre de preparación del PR #10

Fecha: 2026-10-20. Responsable de decisiones: Cris Lumbi; corrección ejecutada por Carlos con Codex. Rama `feat/razones-json-v3`, en copia aislada `C:\Users\carlo\Desktop\GFO Project\revision-ronda7-pr10`. No se mezcló con el checkout del PR #14 ni se fusionó ningún PR.

## Resultado

Los requisitos enumerados en la tarea C quedan aplicados y verificados para revisión: **436 pruebas en 34 archivos**, lint **0 errores / 10 advertencias** y validador **18/18**, todos con código 0. Se resolvieron los conflictos con `main`, se conservaron sus decisiones D-001–D-027 y se añadieron D-028–D-035 del PR #10 más D-036 de atribución.

**Límite documental:** no se recibió ni se encontró `prompt_correccion_agente_razones_v8.md` en Downloads, el espacio de trabajo ni el historial de nombres del repositorio. Se aplican las instrucciones explícitas de `instrucciones_carlos_ronda7.md` y la sección 2 de `tarea_maestra_motor_razones.md`. No se certifican requisitos adicionales de un adjunto ausente.

## Referencias fijadas

| Referencia | SHA |
|---|---|
| Base del PR #10 | `a87ef0af0954e00d3f95ed1476ec3154bc06d768` |
| `origin/main` incorporado | `2c11c4d77bb098c684217bd34b31a39ab35c82b1` |
| Catálogo consultado, solo en lectura | `7e71ad88c88bf8b0dda363dffe2973022c7f47a0` |
| Merge local con correcciones y conflictos resueltos | `1aa48fc58820eadc0fb825b44d5ccb1a920bb510` |

La copia se creó desde el repositorio local y se verificaron los remotos con `git fetch origin`. La incorporación de `main` se hizo con merge, preservando ambos padres. No se usó rebase, force push ni descarte de cambios ajenos. El repositorio no tiene lockfile en esta referencia; se copió `node_modules` del entorno existente para ejecutar las herramientas, sin añadir dependencias ni archivos de instalación al PR.

## 1. Estados y fuentes de las cuentas

Se compararon las 71 cuentas distintas de los 20 JSON con el catálogo fijado. Se alinean **28 estados de cuenta, en 157 apariciones**, todos de `verified` a `partially_verified`. El resultado para esos 71 ids es **1 verified, 65 partially_verified y 5 ambiguous**. Los 72 registros del catálogo incluyen además `is.interest_income`, que no está en los JSON y no se incorpora en esta ronda.

| Cuenta | Cambio de estado | Apariciones |
|---|---|---|
| `bs.accumulated_depreciation` | `verified` → `partially_verified` | 4 |
| `bs.current_provisions` | `verified` → `partially_verified` | 5 |
| `bs.current_year_result_equity` | `verified` → `partially_verified` | 2 |
| `bs.fixed_assets_net_total` | `verified` → `partially_verified` | 4 |
| `bs.intangible_assets` | `verified` → `partially_verified` | 3 |
| `bs.inventory_finished_goods` | `verified` → `partially_verified` | 9 |
| `bs.inventory_merchandise` | `verified` → `partially_verified` | 9 |
| `bs.inventory_raw_materials` | `verified` → `partially_verified` | 9 |
| `bs.inventory_work_in_process` | `verified` → `partially_verified` | 9 |
| `bs.long_term_provisions` | `verified` → `partially_verified` | 2 |
| `bs.ppe_buildings` | `verified` → `partially_verified` | 4 |
| `bs.ppe_furniture` | `verified` → `partially_verified` | 4 |
| `bs.ppe_land` | `verified` → `partially_verified` | 4 |
| `bs.ppe_other` | `verified` → `partially_verified` | 4 |
| `bs.ppe_vehicles` | `verified` → `partially_verified` | 4 |
| `bs.share_capital` | `verified` → `partially_verified` | 2 |
| `bs.short_term_investments` | `verified` → `partially_verified` | 6 |
| `bs.taxes_payable` | `verified` → `partially_verified` | 5 |
| `is.cost_of_sales_reported` | `verified` → `partially_verified` | 9 |
| `is.income_tax_expense` | `verified` → `partially_verified` | 3 |
| `is.interest_expense` | `verified` → `partially_verified` | 4 |
| `is.merchandise_cost` | `verified` → `partially_verified` | 9 |
| `is.operating_amortization` | `verified` → `partially_verified` | 5 |
| `is.operating_depreciation` | `verified` → `partially_verified` | 5 |
| `is.other_sales_revenue` | `verified` → `partially_verified` | 8 |
| `is.product_cost` | `verified` → `partially_verified` | 9 |
| `is.product_sales` | `verified` → `partially_verified` | 8 |
| `is.service_revenue` | `verified` → `partially_verified` | 8 |

Las cuatro cuentas señaladas (`bs.accumulated_depreciation`, `bs.current_year_result_equity`, `is.operating_amortization`, `is.operating_depreciation`) quedan parciales en todas sus apariciones.

### Discrepancia entre la premisa de la orden y la base recibida

En `a87ef0a`, las cuatro cuentas citan páginas de IFRS; sus JSON no contienen una URL del PGC español. Además, `is.operating_amortization` ya cita IAS 38 con «An intangible asset with a finite useful life is amortised», una frase de amortización. No hay allí una frase de depreciación que sustituir. Se conserva esa cita válida como registro histórico, sin presentarla como una nueva consulta ni fabricar una corrección. La rebaja de estado sí se aplica por la orden expresa de alinear con el catálogo.

La tabla de `notas/03_fuentes.md` conserva las fuentes y frases anteriores, actualiza los estados y explica esta diferencia de premisa. El cambio de números D-028→D-035 en `research.sources[].supports` es solo actualización de referencias internas, sin modificar las frases citadas.

### Definición de intangibles

Se cambia únicamente «Activos monetarios» por «Activos no monetarios», según la excepción explícita, en las tres apariciones de `bs.intangible_assets`:

- `docs/razones_financieras/actividad_rotacion_activos_totales.json`.
- `docs/razones_financieras/endeudamiento_razon_deuda_total.json`.
- `docs/razones_financieras/rentabilidad_roa.json`.

No cambian clasificación, rol, signo, política de ausencia ni fórmula.

### Otras diferencias encontradas: reportadas y conservadas

Entre los campos equivalentes comparados (id, nombre canónico, definición, grupo, clasificación, rol, ausencia, sinónimos, sinónimos dudosos y ambigüedades), solo se encontró la definición de intangibles ya autorizada y diferencias de sinónimos en 24 ids. Las listas siguientes se conservan sin sincronizar. Los metadatos propios del adaptador de la app (`tipoApp`, `agrupadoEn`) y la estructura distinta de fuentes no se trasladan al esquema JSON.

| Cuenta | Campo | JSON conservado | Catálogo de referencia |
|---|---|---|---|
| `bs.cash_and_equivalents` | `synonyms` | ["Efectivo","caja","bancos","caja y bancos"] | ["Efectivo","caja","bancos","caja y bancos","Banco","Equivalentes de efectivo"] |
| `bs.current_provisions` | `synonyms` | ["Provisiones de corto plazo"] | ["Provisiones de corto plazo","Provisiones"] |
| `bs.inventory_merchandise` | `synonyms` | ["Mercaderías","mercancías","inventario para la venta"] | ["Mercaderías","mercancías","inventario para la venta","Mercadería"] |
| `bs.inventory_total` | `synonyms` | ["Inventario","existencias totales"] | ["Inventario","existencias totales","Inventarios","Existencias"] |
| `bs.legal_reserve` | `synonyms` | ["Reserva legal acumulada"] | ["Reserva legal acumulada","Reservas"] |
| `bs.long_term_borrowings` | `synonyms` | ["Préstamos a largo plazo","obligaciones financieras no corrientes"] | ["Préstamos a largo plazo","obligaciones financieras no corrientes","Pasivo Largo Plazo","Pasivo No Corriente"] |
| `bs.long_term_provisions` | `synonyms` | ["Provisiones no corrientes"] | ["Provisiones no corrientes","Provisiones"] |
| `bs.other_current_assets` | `synonyms` | ["Otros activos circulantes"] | ["Otros activos circulantes","Activos Corrientes Otros"] |
| `bs.other_current_liabilities` | `synonyms` | ["Otros pasivos circulantes"] | ["Otros pasivos circulantes","Pasivo Corto Plazo"] |
| `bs.other_noncurrent_liabilities` | `synonyms` | ["Otros pasivos a largo plazo"] | ["Otros pasivos a largo plazo","Otros Pasivos"] |
| `bs.ppe_furniture` | `synonyms` | ["Mobiliario","muebles y enseres","equipo de oficina"] | ["Mobiliario","muebles y enseres","equipo de oficina","Equipos"] |
| `bs.ppe_machinery` | `synonyms` | ["Maquinaria","equipo productivo"] | ["Maquinaria","equipo productivo","Equipos"] |
| `bs.retained_earnings` | `synonyms` | ["Resultados acumulados","utilidades acumuladas"] | ["Resultados acumulados","utilidades acumuladas","Utilidad acumulada"] |
| `bs.short_term_borrowings` | `synonyms` | ["Deudas bancarias de corto plazo","obligaciones financieras corrientes"] | ["Deudas bancarias de corto plazo","obligaciones financieras corrientes","Pasivo Corto Plazo","Documentos por Pagar a Corto Plazo"] |
| `bs.trade_payables` | `synonyms` | ["CxP","proveedores","cuentas por pagar a proveedores"] | ["CxP","proveedores","cuentas por pagar a proveedores","Cuentas por Pagar"] |
| `bs.trade_receivables` | `synonyms` | ["CxC","clientes","cuentas por cobrar a clientes","deudores comerciales"] | ["CxC","clientes","cuentas por cobrar a clientes","deudores comerciales","Cuentas por Cobrar"] |
| `is.cost_of_sales_reported` | `synonyms` | ["Costo de ventas","costo de los bienes vendidos"] | ["Costo de ventas","costo de los bienes vendidos","Costos de ventas","Costo de lo vendido"] |
| `is.income_tax_expense` | `synonyms` | ["Impuesto sobre la renta","impuesto a las ganancias del período"] | ["Impuesto sobre la renta","impuesto a las ganancias del período","Impuestos","IR"] |
| `is.interest_expense` | `synonyms` | ["Intereses pagados o devengados","gastos financieros por intereses"] | ["Intereses pagados o devengados","gastos financieros por intereses","Gastos de intereses","Gastos financieros","Intereses pagados"] |
| `is.noninterest_nonoperating_expenses` | `synonyms` | ["Otros gastos no operativos","gastos no operacionales excluyendo intereses identificados por separado"] | ["Otros gastos no operativos","gastos no operacionales excluyendo intereses identificados por separado","Otros Gastos"] |
| `is.nonoperating_income` | `synonyms` | ["Otros ingresos no operativos","ingresos financieros no clasificados en otra cuenta específica"] | ["Otros ingresos no operativos","Otros Ingresos"] |
| `is.other_operating_expenses` | `synonyms` | ["Otros gastos de operación"] | ["Otros gastos de operación","Otros Gastos"] |
| `is.other_operating_income` | `synonyms` | ["Otros ingresos de operación si pertenecen a la actividad operativa"] | ["Otros ingresos de operación si pertenecen a la actividad operativa","Otros Ingresos"] |
| `is.sales_total` | `synonyms` | ["Ventas","ventas ordinarias totales"] | ["Ventas","ventas ordinarias totales","Ingresos operacionales"] |

Esto incluye el alias de ingresos financieros retirado del catálogo por D-051 pero todavía presente en el JSON; se reporta y se conserva porque la tarea C pide no corregir diferencias que no sean de estado, salvo la excepción de intangibles. No se añade un puente ejecutable de intereses ni se inicia el motor.

## 2. Numeración y atribución

| Número anterior del PR #10 | Número actual |
|---|---|
| D-021 | D-028 |
| D-022 | D-029 |
| D-023 | D-030 |
| D-024 | D-031 |
| D-025 | D-032 |
| D-026 | D-033 |
| D-027 | D-034 |
| D-028 | D-035 |

Se trasladaron las ocho entradas como un bloque separado, con el mapeo simultáneo para evitar colisiones. Las referencias activas del catálogo JSON, notas, ficha y CHANGELOG se actualizaron. Las salidas históricas dentro de bloques de evidencia conservan sus números y mensajes originales; el mapeo anterior permite interpretarlas sin atribuirles una ejecución nueva.

Las líneas `Decidió` que nombraban a Alejandro ahora nombran a Cris Lumbi. D-036 registra la corrección y el origen de la instrucción. No se renumeró ninguna decisión del PR #14. Una comparación de cada entrada completa contra `origin/main` verificó las 27 decisiones protegidas sin cambios.

### Diff de decisiones contra main: solo la incorporación renumerada y su atribución

El diff siguiente contiene las filas y entradas añadidas D-028–D-036; no elimina ni modifica D-001–D-027 de main.

```diff
diff --git a/docs/decisiones.md b/docs/decisiones.md
index 7c9ff4d..d249727 100644
--- a/docs/decisiones.md
+++ b/docs/decisiones.md
@@ -80,0 +81,10 @@ No hace falta registrar nombres de variables, estilo ni detalles que se cambian
+| D-028 | Los 20 JSON de razones v3 van en `docs/razones_financieras/` dentro del proyecto | Vigente |
+| D-029 | Convenciones por defecto de los JSON: operandos, periodos, conjuntos y `parent_group` | Vigente |
+| D-030 | El botón de cálculo directo de m1 va en las 11 razones de flujo, no en 9 | Reemplazada por D-032 |
+| D-031 | El separador decimal del formato numérico queda abierto en `metadata.display` | Cerrada por D-033 |
+| D-032 | El control de cálculo directo es único y global en las 11 razones de flujo (reemplaza a D-030) | Vigente |
+| D-033 | Formato numérico F1 fijo en los 20 JSON (cierra D-031) | Cerrada |
+| D-034 | V12 busca los marcadores prohibidos como placeholder: entre corchetes o en mayúsculas | Vigente |
+| D-035 | Una cuenta solo es `verified` con una frase de una norma abierta que respalde su definición concreta | Vigente |
+| D-036 | Atribución y numeración de las decisiones del PR #10 | Vigente |
+
@@ -661,0 +672,189 @@ No hace falta registrar nombres de variables, estilo ni detalles que se cambian
+
+### D-028 — Los 20 JSON de razones v3 van en `docs/razones_financieras/` dentro del proyecto
+
+- **Fecha**: 2026-10-14
+- **Estado**: Vigente
+- **Decidió**: Cris Lumbi (con agente IA)
+- **Área**: `docs/razones_financieras/` (nuevo), `docs/planificacion/razones-json-v3/`
+
+**Contexto.** El documento de instrucciones pide 20 archivos JSON con una ruta relativa `razones_financieras/...` sin decir desde dónde se mide, y a la vez pide ejecutar las pruebas del proyecto. Medida desde el propio documento (`J_formulas/`), la carpeta quedaría fuera del repo y no pasaría por PR.
+
+**Opciones.**
+1. Dentro del proyecto, en `GFO_Project/docs/razones_financieras/` — se versiona, se revisa en PR y convive con el mapa de documentación / una extracción posterior solo mueve la carpeta sin tocar su contenido.
+2. Junto al documento de instrucciones, en `J_formulas/razones_financieras/` — literal al pie de la letra / fuera del repo: sin revisión del equipo ni historial de cambios.
+
+**Decisión.** Opción 1. El documento pide ejecutar las pruebas del proyecto, así que su raíz de trabajo es el proyecto; `AGENTS.md` exige además que todo lo entregable entre por PR.
+
+**Consecuencias.** Los archivos entran al repo en la rama `feat/razones-json-v3` y se revisan con el resto de la documentación. Ningún módulo del repo lee todavía estos JSON (son assets autónomos de documentación), así que no hay riesgo de código.
+
+**Para revertirla.** Mover la carpeta a `J_formulas/razones_financieras/`, marcar esta entrada como reemplazada por una nueva y corregir la ficha y el índice de `docs/planificacion/`.
+
+**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `J_formulas/instrucciones_agente_json_razones_financieras_v3.md`.
+
+### D-029 — Convenciones por defecto de los JSON: operandos, periodos, conjuntos y `parent_group`
+
+- **Fecha**: 2026-10-14
+- **Estado**: Vigente
+- **Decidió**: Cris Lumbi (con agente IA)
+- **Área**: `docs/razones_financieras/*.json` (20 archivos)
+
+**Contexto.** El documento fija los nombres de campo y la semántica N/D, pero no resuelve la forma de los operandos literales, la sintaxis de las referencias a otra razón, el nombre de los conjuntos de cuentas con padre, si `parent_group` arrastra su conjunto al archivo ni qué hacer cuando falta la depreciación acumulada.
+
+**Opciones.**
+1. Operandos como `{"ref": ...}` y `{"value": 365}`; refs cruzadas `{"ref": "ratio.<id>", "period": "previous_current"}`; conjuntos propios `bs.fixed_assets_components` y `bs.noncurrent_liabilities_components`; `parent_group` siempre con el conjunto completo incluido; depreciación acumulada `requires_data` — cada JSON se evalúa por separado, sin contexto externo / repite maquinaria en varios archivos.
+2. `op` explícito en todos los operandos y periodos crudos `m1`/`m2` — más uniforme / se aparta de los ejemplos de la sección 10 de la especificación y obliga a resolver tokens en cada referencia.
+3. `parent_group` contextual (solo el conjunto que corresponde al periodo) y depreciación ausente en 0 — menos cuentas por archivo / no se evalúa sin saber el periodo y aproxima un importe que la especificación exige conservar.
+
+**Decisión.** Opción 1. El documento de instrucciones manda sobre la especificación en los detalles de presentación, y es la única opción que permite evaluar cada JSON de forma autónoma.
+
+**Consecuencias.** No cambia ninguna cifra visible. Si falta la depreciación acumulada, las razones que la necesitan quedan en `N/D` con motivo `missing_required_account_data` en lugar de inflar el activo neto.
+
+**Para revertirla.** Regenerar los 20 JSON con otra sintaxis y crear la entrada que reemplace a esta.
+
+**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/01_decisiones.md`.
+
+### D-030 — El botón de cálculo directo de m1 va en las 11 razones de flujo, no en 9
+
+- **Fecha**: 2026-10-14
+- **Estado**: Reemplazada por D-032
+- **Decidió**: Cris Lumbi (con agente IA)
+- **Área**: `docs/razones_financieras/*.json` (`ratio.presentation.first_period_toggle`)
+
+**Contexto.** El punto 8 del documento habla de "9 razones de flujo (7, 8, 12–20)" y pide el botón de cálculo directo solo en ellas. El paréntesis enumera 11 razones y la tabla de valores esperados confirma 11: la columna "m1 off" muestra 9 con valor y 11 `N/D`, y las 9 con valor son exactamente las razones de punto.
+
+**Opciones.**
+1. Botón en las 11 razones de flujo (7, 8, 12–20) — el paréntesis y los conteos del documento cuadran; el botón es presentación, por defecto apagado, y no altera ningún valor / el número "9" queda interpretado como desliz.
+2. Botón en "9" razones — sigue el número escrito / la enumeración del paréntesis tiene 11 ítems, habría que adivinar cuáles quedan fuera y los conteos de la tabla no quedarían justificados.
+3. Botón solo donde el caso concreto usa un promedio — depende de los datos y no de la fórmula / el mismo JSON cambiaría de presentación según los datos cargados.
+
+**Decisión.** Opción 1. Con el botón encendido o apagado, las razones de flujo sin datos completos (14, 15, 16, 17, 20 con el caso MUNO MODA) siguen en `N/D`: primero por `missing_required_account_data` o `missing_required_period_balance`, según el estado, así que tener el botón presente en las 11 no cambia ninguna celda de la tabla esperada.
+
+**Consecuencias.** Los 11 JSON de flujo traen `first_period_toggle` con `default: false` (y `period_rules.first_period.toggle.default: false`); los 9 de punto lo traen en `null`. Si el profesor confirma otra lectura, se ajusta la presentación sin mover ninguna cifra.
+
+**Para revertirla.** Quitar el toggle de las razones señaladas y crear la entrada que reemplace a esta.
+
+**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/05_checks.md`.
+
+Corrección 2026-10-15: no hubo confirmación del equipo; la frase se retiró.
+
+### D-031 — El separador decimal del formato numérico queda abierto en `metadata.display`
+
+- **Fecha**: 2026-10-14
+- **Estado**: Cerrada por D-033
+- **Decidió**: Cris Lumbi (con agente IA)
+- **Área**: `docs/razones_financieras/*.json` (`metadata.display.decimal_separator`)
+
+**Contexto.** El reporte inicial de la entrega presentó los valores con formato `en-US` (punto decimal, coma de millares) como formato por defecto. En la revisión se pidió no fijar el separador decimal hasta que el usuario lo confirme, y dejar esa única decisión abierta de forma explícita dentro de los JSON.
+
+**Opciones.**
+1. `metadata.display.decimal_separator` con el marcador `DECISION_PENDIENTE` en los 20 JSON — la decisión queda visible para quien revise o consuma el archivo / el que formatea debe leer el campo antes de imprimir.
+2. Fijar `en-US` (o `es-VE`) desde ahora — formato determinado / podría cambiar cifras que ve el usuario sin acuerdo del equipo.
+
+**Decisión.** Opción 1, abierta: no se fija el separador decimal; cada JSON lo declara en `metadata.display` como `DECISION_PENDIENTE: separador decimal (punto o coma) por confirmar con el usuario`. Es la única decisión abierta de la entrega: las 8 diferencias conocidas con la solución del profesor no son decisiones abiertas y por eso pasaron a `DIFERENCIA_CONOCIDA_PROFESOR` dentro de `metadata.research_notes`.
+
+**Consecuencias.** Las tablas de las notas muestran importes con coma de millares solo como texto de documentación; ningún JSON fija el formato. Cuando el usuario confirme, se reemplaza el valor en los 20 archivos y esta entrada se marca como reemplazada por una nueva.
+
+**Para revertirla.** Confirmar el separador, actualizar los 20 JSON y crear la entrada que reemplace a esta.
+
+**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/02_fuentes.md`.
+
+### D-032 — El control de cálculo directo es único y global en las 11 razones de flujo (reemplaza a D-030)
+
+- **Fecha**: 2026-10-15
+- **Estado**: Vigente (reemplaza a D-030)
+- **Decidió**: Cris Lumbi
+- **Área**: `docs/razones_financieras/*.json` (`modo_periodo.control_global`)
+
+**Contexto.** D-030 quedó reemplazada: su texto mezclaba el planteamiento original con una atribución de confirmación al equipo que no existía. La orden de corrección v7 pide una entrada nueva (AGENTS.md regla 13) que fije lo decidido sin atribuciones.
+
+**Opciones.**
+1. Un solo control global en las 11 razones de flujo, apagado por defecto / un control por razón o "9 razones": la enumeración del documento tiene 11 ítems y los conteos de su tabla confirman 11.
+
+**Decisión.** Un solo control de cálculo directo, global, apagado por defecto, en las 11 razones de flujo. Solo afecta al primer periodo de cada serie. No hay un control por razón ni hay 9 razones.
+
+**Consecuencias.** Igual que D-030: los 11 JSON de flujo traen `modo_periodo.control_global` (`default: false`) y los 9 de punto lo traen en `null`. Ninguna celda de la tabla esperada cambia.
+
+**Para revertirla.** Cambiar el alcance del control en los 20 JSON y crear la entrada que reemplace a esta.
+
+**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/05_checks.md`.
+
+### D-033 — Formato numérico F1 fijo en los 20 JSON (cierra D-031)
+
+- **Fecha**: 2026-10-15
+- **Estado**: Cerrada (cierra D-031)
+- **Decidió**: Cris Lumbi
+- **Área**: `docs/razones_financieras/*.json` (`presentacion`)
+
+**Contexto.** D-031 dejó el separador decimal como única decisión abierta de la entrega v3, con el marcador en `metadata.display`. En la revisión del PR #10 se pidió fijar el formato.
+
+**Opciones.**
+1. Formato F1: punto decimal, coma de miles, sufijo ` %`, decimales 0 en moneda y 2 en el resto / mantener el marcador abierto (las decisiones abiertas se reportan en el chat, no en los archivos).
+
+**Decisión.** Formato numérico F1: separador decimal `.`, separador de miles `,`, sufijo de porcentaje ` %`, decimales: moneda 0, el resto 2.
+
+**Consecuencias.** Los 20 JSON declaran el formato en `presentacion`; el marcador de D-031 desaparece de los archivos (lo comprueba V12/V17). Solo cambia cómo se imprime el valor, no el valor.
+
+**Para revertirla.** Cambiar `presentacion` en los 20 JSON y crear la entrada que reemplace a esta.
+
+**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/05_checks.md`.
+
+### D-034 — V12 busca los marcadores prohibidos como placeholder: entre corchetes o en mayúsculas
+
+- **Fecha**: 2026-10-15
+- **Estado**: Vigente
+- **Decidió**: agente, ratificado por Cris Lumbi (con dos condiciones)
+- **Área**: `docs/razones_financieras/notas/validador_v6.mjs` (V12)
+
+**Contexto.** La primera corrida de B4 hizo fallar V12 con `marcador "dato…"` dentro de la prosa de `reglas_generales`, que cita los marcadores que prohíbe. Relajar V12 a mitad de bloque fue una desviación de la orden v6, que pide registrarla.
+
+**Opciones.**
+1. Buscar los marcadores como placeholder: entre corchetes o en mayúsculas (la prosa en minúscula de `reglas_generales` no cuenta) / dejar V12 como estaba (marcaría la cita legítima de la regla) / borrar la cita de `reglas_generales` (pierde la explicación del límite).
+
+**Decisión.** Los marcadores prohibidos se buscan como placeholder: entre corchetes o en mayúsculas. La prosa en minúscula de `reglas_generales` no cuenta.
+
+**Consecuencias.** V12 sigue detectando marcadores reales en los campos (R3); la desviación queda registrada en `notas/05_checks.md` (condiciones de la ratificación: esta orden fija la regla y la desviación se registra allí).
+
+**Para revertirla.** Restaurar el patrón original de V12 y crear la entrada que reemplace a esta.
+
+**Referencias.** `docs/razones_financieras/notas/05_checks.md`, orden `prompt_correccion_agente_razones_v7.md`.
+
+### D-035 — Una cuenta solo es `verified` con una frase de una norma abierta que respalde su definición concreta
+
+- **Fecha**: 2026-10-15
+- **Estado**: Vigente
+- **Decidió**: Cris Lumbi
+- **Área**: `docs/razones_financieras/*.json` (`cuentas[].research`), `docs/razones_financieras/notas/03_fuentes.md`
+
+**Contexto.** El audit de fuentes del PR #10 mostró la misma justificación genérica ("NIC 1 exige presentar un juego completo de estados financieros…") repetida en 29 cuentas, también para cuentas de resultado como `is.merchandise_cost` o `is.service_cost`, que una norma general no define.
+
+**Opciones.**
+1. `verified` solo con una frase textual de menos de 15 palabras de una norma abierta en la misma ejecución que confirme la definición concreta de la cuenta, con la frase registrada en `03_fuentes.md` / aceptar la justificación genérica repetida (aprueba cuentas que la norma no nombra).
+
+**Decisión.** Una cuenta es `verified` solo si una norma abierta en esta ejecución respalda su definición concreta. Una justificación genérica repetida en varias cuentas no basta. Sin frase específica, la cuenta pasa a `partially_verified`.
+
+**Consecuencias.** En los 20 JSON solo cambian `cuentas[].research.status` y `cuentas[].research.sources`. Las clasificaciones, las 5 `ambiguous` y las cuentas internas del caso no cambian.
+
+**Para revertirla.** Abrir una norma que respalde la cuenta, actualizar la frase en `03_fuentes.md` y crear la entrada que reemplace a esta.
+
+**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/03_fuentes.md`, `docs/razones_financieras/notas/05_checks.md`.
+
+### D-036 — Atribución y numeración de las decisiones del PR #10
+
+- **Fecha**: 2026-10-20
+- **Estado**: Vigente
+- **Decidió**: Cris Lumbi; instrucción comunicada por Carlos mediante la tarea maestra y la ronda 7
+- **Área**: Decisiones y referencias de los JSON autónomos del PR #10
+
+**Contexto.** La rama del PR #10 usaba D-021 a D-028, mientras `main` ya ocupaba D-001 a D-027. Las entradas del PR #10 atribuían las decisiones a Alejandro, nombre que la instrucción recibida corrige a Cris Lumbi.
+
+**Opciones.**
+1. Conservar D-001 a D-027 de `main` y trasladar las ocho entradas del PR #10 a D-028 a D-035 — conserva ambas series sin colisión.
+2. Mantener los números duplicados — haría ambiguas las referencias y confundiría decisiones distintas.
+
+**Decisión.** Se adopta la opción 1 y se atribuyen las decisiones trasladadas a Cris Lumbi. D-021→D-028, D-022→D-029, D-023→D-030, D-024→D-031, D-025→D-032, D-026→D-033, D-027→D-034 y D-028→D-035. Se actualizan las referencias activas. Las salidas históricas y mensajes de commits dentro de bloques de evidencia se conservan literalmente con su numeración original.
+
+**Consecuencias.** D-001 a D-027 de `main` permanecen intactas. Se conservan las ocho decisiones del PR #10 y sus estados de reemplazo/cierre; cambia su identificación y atribución, sin cambiar fórmulas ni resultados. La ficha y el informe explican el mapeo para leer la evidencia histórica. No se renumeran decisiones del PR #14.
+
+**Para revertirla.** Registrar una decisión posterior de numeración y actualizar de forma coordinada todas las referencias; no reutilizar números ocupados ni borrar las decisiones preservadas.
+
+**Referencias.** [Ficha razones-json-v3](planificacion/razones-json-v3/README.md), [informe de ronda 7](planificacion/razones-json-v3/ronda7-C-cierre-pr10.md), `instrucciones_carlos_ronda7.md` y sección 2 de `tarea_maestra_motor_razones.md` recibidas por Carlos.
```

## 3. Conflictos con main

`git merge origin/main` detectó conflictos en `docs/decisiones.md` y `docs/planificacion/README.md`.

- Decisiones: se conserva el documento de main completo, se agregan las ocho decisiones renumeradas del PR y D-036.
- Planificación: se conservan todas las filas de main, incluidas EOAF y EFE, y se agrega la fila de JSON autónomos.
- El resto del merge conserva el contenido que trae main; no se implementan cambios de JavaScript ni pruebas propios de esta tarea. `git diff origin/main HEAD -- js tests` queda vacío.

## 4. Validación

Las salidas siguientes son completas, sin omitir archivos, advertencias ni conteos. El primer validador detectó V0 por árbol sucio durante la corrección, mientras V1–V17 ya pasaban. Después del commit `1aa48fc`, con el árbol limpio, V0–V17 pasan. No se eliminó ni relajó ninguna validación.

### npm.cmd test — código 0

```text

> gfo-toolkit@1.0.0 test
> vitest run


 RUN  v3.2.7 C:/Users/carlo/Desktop/GFO Project/revision-ronda7-pr10

 ✓ tests/unit/estados-calculations.test.js (28 tests) 41ms
 ✓ tests/unit/estados-import.test.js (15 tests) 37ms
 ✓ tests/unit/presupuesto-personal.test.js (6 tests) 335ms
 ✓ tests/unit/estados-acceptance.test.js (6 tests) 357ms
 ✓ tests/unit/apalancamiento-ui.test.js (17 tests) 196ms
 ✓ tests/unit/razones-mercado.test.js (12 tests) 174ms
 ✓ tests/unit/inicio.test.js (17 tests) 180ms
 ✓ tests/unit/analisis-razones.test.js (5 tests) 718ms
   ✓ cobertura de intereses > se calcula con los intereses del estado de resultados  408ms
 ✓ tests/unit/proforma.test.js (9 tests) 342ms
 ✓ tests/unit/eoaf.test.js (24 tests) 493ms
 ✓ tests/unit/planeacion.test.js (17 tests) 321ms
 ✓ tests/unit/inicio-navegador.test.js (4 tests) 838ms
   ✓ cargar ejemplos > llena los módulos vacíos de la empresa con el caso de MUNO MODA, sin tocar lo personal  552ms
 ✓ tests/unit/efe.test.js (23 tests) 665ms
 ✓ tests/unit/integracion-reporte.test.js (7 tests) 74ms
 ✓ tests/unit/integracion-ui.test.js (9 tests) 1041ms
   ✓ Reportes: importar JSON > valida, pide confirmación y guarda los módulos del respaldo  331ms
 ✓ tests/unit/equilibrio.test.js (17 tests) 113ms
 ✓ tests/unit/comprobacion.test.js (14 tests) 46ms
 ✓ tests/unit/carga-modulos.test.js (2 tests) 1415ms
   ✓ carga de módulos > js/app.js carga todo el grafo de módulos y registra el arranque  807ms
   ✓ carga de módulos > cada archivo de js/ se puede importar sin errores  606ms
 ✓ tests/unit/apalancamiento-calculations.test.js (21 tests) 20ms
 ✓ tests/unit/estados-formato-ui.test.js (1 test) 44ms
 ✓ tests/unit/inventario.test.js (19 tests) 97ms
 ✓ tests/unit/flujo.test.js (12 tests) 84ms
 ✓ tests/unit/estados-import-formatos.test.js (17 tests) 29ms
 ✓ tests/unit/integracion-respaldo.test.js (10 tests) 16ms
 ✓ tests/unit/format.test.js (18 tests) 36ms
 ✓ tests/unit/calculate.test.js (28 tests) 15ms
 ✓ tests/unit/orden-periodos.test.js (3 tests) 27ms
 ✓ tests/unit/apalancamiento.test.js (32 tests) 17ms
 ✓ tests/unit/metodologia-financiera.test.js (10 tests) 10ms
 ✓ tests/unit/razones-unificadas.test.js (8 tests) 5ms
 ✓ tests/unit/razones-adicionales.test.js (5 tests) 7ms
 ✓ tests/unit/depreciacion.test.js (11 tests) 6ms
 ✓ tests/unit/presupuesto.test.js (8 tests) 7ms
 ✓ tests/unit/analisis-reexports.test.js (1 test) 4ms

 Test Files  34 passed (34)
      Tests  436 passed (436)
   Start at  22:31:33
   Duration  3.58s (transform 4.18s, setup 0ms, collect 8.14s, tests 7.81s, environment 10ms, prepare 13.43s)
```

### npm.cmd run lint — código 0

```text

> gfo-toolkit@1.0.0 lint
> eslint js/ tests/


C:\Users\carlo\Desktop\GFO Project\revision-ronda7-pr10\js\components\tabla.js
  2:25  warning  'striped' is assigned a value but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\revision-ronda7-pr10\js\modules\activos\index.js
   3:26  warning  'formatNumber' is defined but never used               no-unused-vars
  12:7   warning  'ESTADOS_POSIBLES' is assigned a value but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\revision-ronda7-pr10\js\modules\presupuesto\index.js
  6:23  warning  'destroyChart' is defined but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\revision-ronda7-pr10\js\utils\export.js
  69:16  warning  'e' is defined but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\revision-ronda7-pr10\tests\unit\calculate.test.js
  7:23  warning  'depAnualLineaRecta' is defined but never used  no-unused-vars
  7:43  warning  'depAcumulada' is defined but never used        no-unused-vars
  7:57  warning  'valorEnLibros' is defined but never used       no-unused-vars
  8:3   warning  'ahorroMensual' is defined but never used       no-unused-vars
  8:18  warning  'saldoSemanal' is defined but never used        no-unused-vars

✖ 10 problems (0 errors, 10 warnings)
```

Las 10 advertencias están en los mismos archivos y líneas de main, cuyo código y pruebas se conservaron. El informe A aporta la ejecución de línea base; esta tarea no introduce advertencias nuevas.

### node notas/validador_v6.mjs — código 0

Ejecutado desde `docs/razones_financieras` con el árbol limpio:

```text
validador_v6 | raiz=C:\Users\carlo\Desktop\02 - Proyectos\Programacion\GFO Project\revision-ronda7-pr10\docs\razones_financieras | archivos JSON=20 | 18 validaciones
OK   V0
OK   V1
OK   V2
OK   V3
OK   V4
OK   V5
OK   V6
OK   V7
OK   V8
OK   V9
OK   V10
OK   V11
OK   V12
OK   V13
OK   V14
OK   V15
OK   V16
OK   V17
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=1 partially=65 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 18/18 validaciones sin fallos
```

### Comprobaciones de alcance

- 20 JSON analizados; 71 ids distintos, sin cuentas añadidas o eliminadas.
- 157 cambios de `research.status`, 3 correcciones de definición de intangibles y 163 referencias D-028→D-035 en textos `supports`.
- La comparación estructural contra `a87ef0a` rechaza cualquier otro cambio JSON: las fórmulas, los conjuntos, las reglas, los operandos y las cifras quedan iguales.
- D-001–D-027 de main intactas, sin ids de decisión duplicados; se preservan las ocho entradas del PR #10.
- Sin modificaciones del validador, sin motor, sin 1c/D-049 y sin merge de PR.

## 5. Entrega y revisión

Los requisitos enumerados quedan listos para revisión humana, sujetos a contrastar cualquier contenido adicional del archivo v8 no aportado. El responsable del chat coordina la actualización de la rama y de la descripción del PR #10 con estas salidas. Este agente no hace push ni cambia la descripción del PR por su cuenta.

Este informe también se entrega como `C:\Users\carlo\Desktop\GFO Project\ronda7-C-cierre-pr10.md`. Su incorporación posterior a git solo documenta el trabajo: no altera los JSON ni el código validados.
