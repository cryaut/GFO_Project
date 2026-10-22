# 01 — Diferencias contra la orden v6 (Fase 1, compuerta G1)

Recorrido de cada requisito de las secciones **Especificación**, **Fuentes** y **Hallazgos** de
`prompt_correccion_agente_razones_v6.md` sobre el árbol limpio del commit `2a607c1` (2026-10-15),
**sin editar nada**. Columnas: ID · requisito · archivos afectados · estado · evidencia · bloque asignado.

Leyenda de estados: `cumple` = el entregado ya satisface el requisito y no se rehace;
`no_cumple` = se corrige en el bloque indicado (B1 a B5). La validación de cada bloque queda en
`05_checks.md`.

## Especificación — estructura de cada archivo

| ID | Requisito | Archivos | Estado | Evidencia (comando → salida) | Bloque |
|---|---|---|---|---|---|
| R-01 | `schema_version: "2.0"` y exactamente las 9 claves de primer nivel (`razon`, `razones_dependientes`, `derivados`, `conjuntos`, `cuentas`, `modo_periodo`, `presentacion`, `reglas_generales`) | 20 JSON | no_cumple | `Select-String *.json -Pattern '"schema_version": "2.0"'` → `0 hit (v3: 1.0=20)`; claves actuales: `schema_version, metadata, normalization_rules, matching_rules, account_catalog, account_sets, aggregation_rules, derived_values, ratio, period_rules, validation_rules` | B1 |
| R-02 | `razon.id` = nombre del archivo sin `.json` (no id con punto) | 20 JSON | no_cumple | `Select-String *.json -Pattern '"id": "[a-z_]+\.[a-z_]+"'` → `459 hit` (v3: `liquidez.capital_trabajo_neto`) | B1 |
| R-03 | `razon.unit` ∈ `veces`, `dias`, `porcentaje`, `moneda` | 20 JSON | no_cumple | `Select-String *.json -Pattern '"unit": "(currency\|ratio\|percentage\|days)"'` → `20 hit` (v3: `currency` etc.) | B1 |
| R-04 | Discrepancias con prefijo `DIFERENCIA_CONOCIDA_PROFESOR:` dentro de `razon.notes` | 20 JSON | no_cumple | `Select-String *.json -Pattern "DIFERENCIA_CONOCIDA_PROFESOR"` → `8 hit` (contenido correcto, pero vive en `metadata.research_notes`; `razon` no existe aún) | B1 |
| R-05 | `razones_dependientes` con la lista completa directa e indirecta (13→12, 15→14, 17→16, 20→12,13,14,15,16,17), cada razón completa y sin repetir | 20 JSON | no_cumple | `Select-String *.json -Pattern "razones_dependientes"` → `0 hit` | B1 |
| R-06 | `derivados` como array de `{id, kind, formula}` | 20 JSON | no_cumple | `Select-String *.json -Pattern '"kind":'` → `0 hit`; v3 usa objeto `derived_values` sin `kind` | B1 |
| R-07 | `conjuntos` con los 11 nombres v6 sin prefijo (`gross_sales_components`, …) | 20 JSON | no_cumple | `Select-String *.json -Pattern '"gross_sales_components"'` → `0 hit`; v3: `bs.current_liabilities_components` (prefijo `bs.`) | B1 (cierre B3) |
| R-08 | `cuentas` como array de objetos `cuenta` v6 (`definition` arriba, `doubtful_synonyms`, `ambiguities` fuera de `research`) | 20 JSON | no_cumple | `Select-String *.json -Pattern '"doubtful_synonyms"'` → `0 hit`; `definition` anidada en `research.definition` | B1 |
| R-09 | Bloques comunes `modo_periodo`, `presentacion`, `reglas_generales` como claves propias | 20 JSON | no_cumple | `Select-String *.json -Pattern "modo_periodo\|reglas_generales"` → `0 hit` (v3: `period_rules`, `ratio.presentation`, `validation_rules`) | B1 |
| R-10 | "Sin sobrantes": todo id usado en un árbol existe en su sección, con la sintaxis de nodos v6 | 20 JSON | no_cumple | `Select-String *.json -Pattern '"ref":'` → `145 hit` y `'"op": "reported_or_calculate"'` → `0 hit` (sintaxis v3, no v6) | B1 |

## Especificación — objeto `cuenta`

| ID | Requisito | Archivos | Estado | Evidencia (comando → salida) | Bloque |
|---|---|---|---|---|---|
| R-11 | `classification` con el vocabulario de la lista maestra (17 valores) | 20 JSON | no_cumple | `Select-String *.json -Pattern '"classification"'` → `0 hit`; v3 usa `category` libre (`E24 muestra: Inventario`) | B1 |
| R-12 | `absence_policy` según lista maestra: reportados → `not_applicable`, `bs.accumulated_depreciation` y `supp.*` → `requires_data` | 20 JSON | no_cumple | parse → `bs.inventory_total: status=verified absence=zero_if_not_reported` (debe ser `not_applicable`); `bs.accumulated_depreciation absence=requires_data` (ya cumple) | B1 |
| R-13 | `research.status` con las reglas de estado: las internas (`bs.inventory_total`, `is.sales_total`, `supp.*`) son `partially_verified` con `ambiguities` | 20 JSON | no_cumple | parse → `bs.inventory_total status=verified` (es interna); V15 fallaría hoy | B2 |
| R-14 | `verified` solo con fuente abierta en esta ejecución que respalde la definición concreta | 20 JSON | no_cumple | script → `6 instancias verified sin fuente https (supp.credit_sales, supp.supplier_payments, …)`; `Select-String *.json -Pattern "ifrs-15\|ifrs-9-financial\|ias-32-financial"` → `0 hit` (faltan NIIF 15, NIIF 9, NIC 32; NIC 1 sin secciones) | B2 |
| R-15 | F1 y F2 (documentos del proyecto) quitadas del registro de fuentes (H4) | 20 JSON | no_cumple | `Select-String *.json -Pattern "instrucciones_agente_json_razones_financieras_v3"` → `F1 en 20 archivos`; `-Pattern "especificacion_json_razones_financieras"` → `F2 en 20 archivos` | B2 |
| R-16 | `research.sources[].source_type` ∈ vocabulario v6 (`accounting_standard`, …) | 20 JSON | no_cumple | `Select-String *.json -Pattern '"source_type": "(norma_internacional\|documento_local)"'` → `979 hit` | B2 |
| R-17 | Máximo 3 fuentes por cuenta (R4) | 20 JSON | cumple | script → `max fuentes por cuenta: 3` | — |
| R-18 | `bs.legal_reserve` marcada `ambiguous` (marco legal local) | 20 JSON | no_cumple | parse → `bs.legal_reserve status=verified sources=2` | B2 |
| R-19 | Existe `notas/02_cuentas_maestras.md` con las 71 cuentas (`id — clasificación — rol — política`) | notas | no_cumple | `Test-Path docs\razones_financieras\notas\02_cuentas_maestras.md` → `False` | B2 |
| R-20 | Existe `notas/03_fuentes.md` con tabla cuenta–fuente–afirmación–abierta | notas | no_cumple | `Test-Path docs\razones_financieras\notas\03_fuentes.md` → `False` | B2 |
| R-21 | Fuentes faltantes abiertas (NIC 1 secciones de clasificación/estructura, NIIF 15, NIIF 9, NIC 32) y registradas | notas + 20 JSON | no_cumple | evidencia de apertura en `03_fuentes.md` (B2): hoy los JSON contienen `0 hit` de esas URLs (R-14); las 11 normas se abrieron el 2026-10-15 y se registran allí | B2 |

## Especificación — nodos de fórmula

| ID | Requisito | Archivos | Estado | Evidencia (comando → salida) | Bloque |
|---|---|---|---|---|---|
| R-22 | Solo las 11 operaciones permitidas (`account`, `derived`, `ratio`, `constant`, `sum_accounts`, `add`, `subtract`, `multiply`, `divide`, `average`, `reported_or_calculate`) | 20 JSON | no_cumple | `'"op": "reported_or_calculate"'` → `0 hit`; `'"ref":'` → `145 hit` (op. v3 no existen en v6) | B1 |
| R-23 | `period`: `current` por defecto; `previous` en el primer periodo → N/D (R2c) | 20 JSON | cumple | `Select-String *.json -Pattern '"period": "previous"\|"previous_period"'` → `10 hit` (la semántica ya está implementada; se migra a la sintaxis v6 en B1 sin cambiar el sentido) | — |
| R-24 | `average` solo en modo `flow_with_average_balance` | 20 JSON | cumple | `Select-String liquidez_razon_corriente.json -Pattern '"op": "average"'` → `0 hit` (razón de saldo sin promedio) | — |

## Especificación — bloques comunes

| ID | Requisito | Archivos | Estado | Evidencia (comando → salida) | Bloque |
|---|---|---|---|---|---|
| R-25 | `modo_periodo` de flujo idéntico en las 11 razones, con un único `control_global` apagado por defecto (H1) | 11 (y 9 con `null`) | no_cumple | `Select-String *.json -Pattern "control_global"` → `0 hit`; hoy el control está en `first_period_toggle` por razón → `20 hit`; `docs/decisiones.md:75` → `D-030 … El botón … va en las 11 razones de flujo, no en 9 | Vigente` | B4 |
| R-26 | `modo_periodo` de saldo de cierre idéntico en las 9 razones, con `control_global: null` | 9 JSON | no_cumple | `Select-String *.json -Pattern "control_global"` → `0 hit` | B4 |
| R-27 | `politica_sin_periodo_anterior` en el bloque de flujo | 11 JSON | no_cumple | `Select-String *.json -Pattern "politica_sin_periodo_anterior"` → `0 hit` | B1 |
| R-28 | `presentacion` con `marca_directa`, `marca_promedio` (solo flujo) y `nota_directa` | 20 JSON | no_cumple | `Select-String *.json -Pattern "marca_directa"` → `0 hit` (v3: `direct_badge`) | B1 |
| R-29 | Formato F1 en `presentacion`: `separador_decimal` `.`, `separador_miles` `,`, `sufijo_porcentaje`, `decimales` (H2) | 20 JSON | no_cumple | `Select-String *.json -Pattern "separador_decimal"` → `0 hit` | B4 |
| R-30 | `reglas_generales` copiado textualmente en los 20 | 20 JSON | no_cumple | `Select-String *.json -Pattern "reglas_generales"` → `0 hit` (v3: `validation_rules` + `normalization_rules` propios) | B1 |
| R-31 | Los 20 se agrupan 11 flujo / 9 saldo de cierre | 20 JSON | cumple | `Select-String *.json -Pattern '"period_mode": "flow_with_average_balance"'` → `11 hit` | — |
| R-32 | Razones 1–6, 9–11 con marca de saldo directo y sin control (R1b) | 9 JSON | cumple | `Select-String liquidez_razon_corriente.json -Pattern "direct_badge"` → `1 hit` (la marca existe en v3; se renombra en B1) | — |

## Especificación — conjuntos y derivados

| ID | Requisito | Archivos | Estado | Evidencia (comando → salida) | Bloque |
|---|---|---|---|---|---|
| R-33 | Ningún conjunto mezcla un total reportado con sus componentes (V6) | 20 JSON | no_cumple | script → `miembros de sets que son totales reportados: 11` | B3 |
| R-34 | Los 11 conjuntos copiados de la orden sin cambios (nombres y miembros v6) | 20 JSON | no_cumple | `Select-String *.json -Pattern '"gross_sales_components"'` → `0 hit`; v3: `sets v3: bs.current_liabilities_components` | B3 |
| R-35 | Derivados v6 con `id`, `kind` y `formula` (incluye `derived.credit_purchases` con periodo anterior, D10) | 20 JSON | no_cumple | `Select-String *.json -Pattern '"derived\.'` → `0 hit`; v3: `derived keys: compras_credito, cxp_saldo, pagos_proveedores` | B3 |
| R-36 | Una cuenta/derivado/conjunto con el mismo `id` tiene la misma definición en todos los archivos (V7) | 20 JSON | cumple | `Select-String notas\05_checks.md -Pattern "identidad"` → `\| Identidad de cuentas entre archivos … \| OK \| 71 cuentas con identidad única \|` (re-verificado en B3 con V7) | — |

## Especificación — fórmulas de las 20 razones

| ID | Requisito | Archivos | Estado | Evidencia (comando → salida) | Bloque |
|---|---|---|---|---|---|
| R-37 | Las 20 fórmulas copiadas de la orden con la sintaxis de nodos v6 | 20 JSON | no_cumple | `'"op": "reported_or_calculate"'` → `0 hit`; `'"ref":'` → `145 hit` | B1 |
| R-38 | Ninguna fórmula ajustada para cuadrar un valor del caso | 20 JSON | cumple | `Select-String *.json -Pattern "DIFERENCIA_CONOCIDA_PROFESOR"` → `8 hit` (discrepancias etiquetadas, no ajustadas) | — |
| R-39 | Verificación del caso contra la tabla de referencia | notas/05_checks | cumple | `Select-String notas\05_checks.md -Pattern "40/40"` → `\| 40 celdas del caso iguales a la tabla del documento \| OK \| 40/40 OK \|` (la reejecución completa de la tabla v6, 60 celdas, queda en B5) | — |

## Fuentes (sección "Fuentes: qué abrir y para qué")

| ID | Requisito | Archivos | Estado | Evidencia (comando → salida) | Bloque |
|---|---|---|---|---|---|
| R-40 | Cada `verified` con fila en la auditoría `notas/03_fuentes.md` (URL + texto que confirma) | 20 JSON + notas | no_cumple | `Test-Path notas\03_fuentes.md` → `False` (sin auditoría no hay fila posible) | B2 |
| R-41 | Una cuenta sin fuente abierta que la respalde queda `partially_verified` | 20 JSON | no_cumple | script → `6 instancias verified sin fuente https` (las `supp.*` y otras quedaban `verified` sin respaldo) | B2 |

## Hallazgos H1–H8

| ID | Requisito | Archivos | Estado | Evidencia (comando → salida) | Bloque |
|---|---|---|---|---|---|
| R-42 | H1: un solo control global en `modo_periodo.control_global`; corregir los 20 y D-030 | 20 JSON + `docs/decisiones.md` | no_cumple | `Select-String *.json -Pattern "control_global"` → `0 hit`; `Select-String docs\decisiones.md -Pattern "D-030"` → `75: … El botón … va en las 11 razones de flujo, no en 9 … Vigente` | B4 |
| R-43 | H2: separador `.` y miles `,` decididos; fuera `DECISION_PENDIENTE` de `metadata.display`; D-031 marcada decidida | 20 JSON + `docs/decisiones.md` | no_cumple | `Select-String *.json -Pattern "DECISION_PENDIENTE"` → `20 hit` (en `metadata.display`); `Select-String docs\decisiones.md -Pattern "D-031"` → `76: … queda abierto en metadata.display \| Abierta` | B4 |
| R-44 | H3: ninguna etiqueta en campos; única etiqueta permitida `DIFERENCIA_CONOCIDA_PROFESOR` en `razon.notes` | 20 JSON | no_cumple | `DECISION_PENDIENTE → 20 hit` en campos (`metadata.display`) — viola R3/V13 | B4 |
| R-45 | H4: quitar F1/F2 de fuentes; abrir fuentes que faltan; corregir estados | 20 JSON + notas | no_cumple | ver R-14, R-15, R-16, R-40, R-41 (F1 en 20, F2 en 20, `0 hit` de NIIF 15/9 y NIC 32) | B2 |
| R-46 | H5: no afirmar que las "correcciones del motor de la ronda anterior" están aplicadas; corregirlo en el PR si aparece | PR #10 | cumple | API GitHub (2026-10-15): cuerpo del PR sin líneas con "correcci" (`(ninguna)`); el cuerpo ya dice que los JSON "aún no están aplicados en el motor ni en la app" | — |
| R-47 | H6: sin reescritura de historial (sin amend/rebase/force) | repo | cumple | `git log --oneline -6` → `86e04e0`, `c50545a`, `dcdbb44`, `ab2f3a5`, `2a607c1` (5 commits intactos; esta orden trabaja solo con commits nuevos) | — |
| R-48 | H7: no atribuir aprobaciones inexistentes (texto "el equipo confirmó" en D-030) | `docs/decisiones.md` | no_cumple | `Get-Content docs\decisiones.md [563]` → `… En revisión (2026-10-14) el equipo confirmó que el «9» de la v3 es un error del documento…` | B4 |
| R-49 | H8: script o descripción exacta + comando + salida en `notas/05_checks.md` | notas/05_checks | no_cumple | `Select-String notas\05_checks.md -Pattern "validador\|node .*\.mjs\|script"` → `(ninguno)` (el "verificador 12/12" no estaba registrado) | B1 |
| R-50 | Una nota por razón en `notas/ratios/NN_<id>.md` con la fórmula del profesor, el árbol y las listas de derivados, conjuntos, cuentas y razones dependientes; caso a mano registrado en `05_checks.md` (orden, bloque B5) | notas | no_cumple (fila añadida en G4: el inventario de G1 la omitió y sin ella los cambios de B5 no tienen ID) | `Test-Path notas\ratios` → `False` en `2a607c1` (las notas vivían en `ratios/` de la raíz); tras B5: 20 notas en `notas/ratios/` y 60/60 celdas en `05_checks.md` | B5 |

## Corrección v7 — filas R-51 en adelante (orden `prompt_correccion_agente_razones_v7.md`)

Recorrido de los requisitos de **C1**, **C2**, **C3** y **G3** de la orden v7 sobre el árbol limpio
del commit `b325ab2` (2026-10-15), sin editar nada. Mismas columnas que la tabla v6:
ID · requisito · archivos · estado · evidencia (comando → salida) · bloque.

| ID | Requisito | Archivos | Estado | Evidencia (comando → salida) | Bloque |
|---|---|---|---|---|---|
| R-51 | C1: D-030 restaurada al texto de `ab2f3a5` con Estado `Reemplazada por D-032`, sin la frase que atribuye al equipo la confirmación del «9» y con la nota de corrección al final | `docs/decisiones.md` | no_cumple | `Select-String docs\decisiones.md -Pattern "D-030"` → 2 hit: fila 75 con estado `Vigente` y entrada 549 con "el equipo confirmó" (línea 565) | C1 |
| R-52 | C1: D-031 restaurada al texto de `ab2f3a5` con Estado `Cerrada por D-033` | `docs/decisiones.md` | no_cumple | fila 76 → `Cerrada (decidida 2026-10-15)` (estado actual, no el que fija la orden) | C1 |
| R-53 | C1: D-032, D-033, D-034 y D-035 añadidas al final del archivo con la plantilla propia (Decidió y Fecha 2026-10-15) | `docs/decisiones.md` | no_cumple | `Select-String docs\decisiones.md -Pattern "D-032\|D-033\|D-034\|D-035"` → `0 hit` | C1 |
| R-54 | C1: tabla de decisiones del inicio del archivo con los estados de D-030 a D-035 | `docs/decisiones.md` | no_cumple | la tabla termina en la fila 76 (D-031): faltan las 4 filas nuevas y los estados de reemplazo | C1 |
| R-55 | C1: en `docs/planificacion/razones-json-v3/README.md` línea 24 se quita solo la frase "(en revisión el equipo confirmó que el «9» de la v3 es un error del documento)" | ficha README | no_cumple | `Get-Content README.md [23]` → la línea contiene la frase completa entre paréntesis | C1 |
| R-56 | C2 (D-035): una cuenta sigue `verified` solo con frase textual de menos de 15 palabras de una norma abierta en esta ejecución que confirme su definición concreta, con la frase en `notas/03_fuentes.md` | 20 JSON + `notas/03_fuentes.md` | no_cumple | `03_fuentes.md` → 142 líneas con 29 filas de la misma justificación genérica "NIC 1 exige presentar un juego completo…" (vale también para `is.merchandise_cost`, `is.product_cost`, `is.service_cost`, `is.net_sales_reported`) | C2 |
| R-57 | C2: sin frase específica la cuenta pasa a `partially_verified`; en los JSON solo cambia `cuentas[].research.status` y, si hace falta, `research.sources` | 20 JSON | no_cumple | validador → `verified=62 partially=4 ambiguous=5` (tras C2 se espera `verified=29 partially=37 ambiguous=5`) | C2 |
| R-58 | C2: no se cambian la clasificación de cuentas, las 5 `ambiguous` ni las cuentas internas (`bs.inventory_total`, `is.sales_total`, `supp.*`) | 20 JSON | cumple | validador → `cuentas=71 ambiguous=5`; restricción vigente, se re-verifica en G2 y G3 | C2 |
| R-59 | C2: no se declara abierta una norma que no se pudo abrir (las cuentas de esa norma pasan a `partially_verified`) | `notas/03_fuentes.md` + 20 JSON | no_cumple | hoy la tabla no registra título y fecha de apertura por cuenta; tras C2 cada fila conservada lleva la frase textual y la fecha 2026-10-15 | C2 |
| R-60 | C3: punto 11 de `notas/05_checks.md` corregido: `c50545a` reemplazó a `4a3bef0` con `--amend`; sin reescritura de historial para arreglarlo | `notas/05_checks.md` | no_cumple | línea 675 → "los 5 commits de la v3 conservan su SHA" (falso: `git cat-file -t 4a3bef0` → `commit`) | C3 |
| R-61 | C3: nota de V14 que aclara que la validación solo compara la URL con `REGISTRO_APERTURAS` y que la evidencia de apertura es el título y la fecha en `03_fuentes.md` | `notas/05_checks.md` | no_cumple | V14 registrado en la línea 638 sin esa aclaración | C3 |
| R-62 | C3: desviación de V12 registrada en `05_checks.md` remitiendo a D-034 | `notas/05_checks.md` | no_cumple | líneas 96–101: el ajuste de V12 remite a H8/B4, no a D-034 | C3 |
| R-63 | C3: rutas locales `C:\Users\…` sustituidas por `<raiz-local>` sin cambiar salidas ni números | `notas/05_checks.md` | no_cumple | `Select-String notas\05_checks.md -Pattern "C:\\Users"` → `11 hit` | C3 |
| R-64 | G3: en un worktree temporal, en el último commit, V0 a V17 sin fallos y 0 diferencias de SHA-256 "sin `cuentas[].research`" contra G0, con un script fuera del repo | repo + `notas/05_checks.md` | no_cumple | se ejecuta al cerrar C1–C3; el comando y la salida quedan en `05_checks.md` | G3 |
| R-65 | G3: sin cambio de fórmulas, valores, lógica del validador ni de D-001 a D-029 (comprobado por hash y por `git diff` por bloque) | 20 JSON + `notas/validador_v6.mjs` + `docs/decisiones.md` | no_cumple | se comprueba con los SHA-256 de `00_linea_base_v7.md` (G0) y con el mapeo de la sección G4 | G3 |

## Compuerta G1 (v7)

- [x] Ninguna fila sin estado (15 filas: R-51…R-65).
- [x] Cada `no_cumple` tiene un bloque asignado (C1, C2, C3 o G3).
- [x] Nada editado aún: los comandos corrieron sobre el árbol limpio de `b325ab2`.

**G1 (v7): pasa.**

## Notas reemplazadas (regla 9 de la orden)

Reemplazos con rastro (el contenido anterior queda en el historial de git y el archivo nuevo explica el cambio):

| Archivo v3 | Reemplazo v6 | Motivo | Cuándo |
|---|---|---|---|
| `notas/00_control.md` | `notas/00_linea_base.md` + `notas/01_diferencias.md` | el control de fases v3 no corresponde al flujo G0–G5 de la orden v6 | commit G0-G1 |
| `notas/01_decisiones.md` | misma ruta, contenido según la orden v6 | R1 cambió (control global) y las reglas R1b–R2d/F1 se agregan | commit G0-G1 |
| `notas/02_fuentes.md` | `notas/03_fuentes.md` | H4: tabla cuenta–fuente con "abierta en esta ejecución" | B2 |
| `notas/03_registro_cuentas.md` | `notas/02_cuentas_maestras.md` | la lista maestra v6 (71 cuentas con clasificación/rol/política) | B2 |
| `notas/04_derivados.md` | misma ruta, contenido v6 (17 derivados con `kind`) | los ids/kinds de la v3 no son los de la orden | B3 |
| `notas/05_checks.md` | misma ruta, reescrito con el validador v6 | H8: script + comandos + salidas por bloque y de G3 | B1…G3 |
| `ratios/NN_*.md` (raíz) | `notas/ratios/NN_*.md` | la orden ubica las notas por razón en `notas/ratios/` | B5 |

## Compuerta G1

- [x] Ninguna fila sin estado (49 filas al cerrar G1: R-01…R-49; R-50 se añadió después en G4, al detectar que faltaba la fila de la nota por razón del bloque B5).
- [x] Cada `no_cumple` tiene un bloque asignado (B1…B5).
- [x] Nada editado aún: los comandos corrieron sobre el árbol limpio de `2a607c1`.

**G1: pasa.**

## Ronda 8 — G1 de la orden v8 (2026-10-21)

Estado inicial auditado en `1481e79`. No se reemplazan las correcciones autorizadas de rondas 3 a 7. «D-024/D-026» de la orden v8 corresponden a D-031/D-033 tras la renumeración aprobada.

| ID | Punto | Estado inicial | Evidencia / acción autorizada |
|---|---|---|---|
| R-66 | T1: resultado del ejercicio parcial con sources vacío | Cumplido tras T1 | Ya parcial, pero conserva una cita genérica de IAS 1; se retirará la fuente. |
| R-67 | T1: depreciación acumulada parcial con sources vacío | Cumplido tras T1 | Ya parcial, pero conserva una cita de alcance de IAS 16; se retirará la fuente. |
| R-68 | T1: depreciación operativa con cita específica o parcial sin fuentes | Cumplido tras T1 | Ya parcial; no se confirma norma abierta para sostener la fuente y se retirará. |
| R-69 | T1: amortización operativa con cita específica o parcial sin fuentes | Cumplido tras T1 | Ya parcial; no se certifica la cita histórica como norma abierta en esta ejecución y se retirará. |
| R-70 | T2: toda cuenta verified con norma abierta y frase literal comprobada ahora | No cumplido | Solo efectivo es verified. La frase está en el resumen oficial, pero abrir el PDF oficial conduce a suscripción. Se aplicará la alternativa de v8: parcial sin fuentes. |
| R-71 | T3: ficha con separador fijado y sin decisión abierta | Cumplido en contenido; literal antiguo no aplica | La ficha ya remite a D-033 cerrada; se hará explícita la frase de cierre conservando la numeración actual. |
| R-72 | G0: línea base v8 en a87ef0a y 20 hashes canónicos | Cumplido | `00_linea_base_v8.md`, hashes leídos directamente de Git. |
| R-73 | G1: filas R-66 en adelante, con estado y evidencia | Cumplido | Esta tabla. |
| R-74 | G2: commits separados para tareas 1, 2 y 3 con V0–V17 | No cumplido | Se crearán commits normales y se registrará cada salida limpia en 05_checks. |
| R-75 | G3: cero diferencias fuera de research contra a87ef0a | No cumplido por cambios heredados | Tres definiciones de intangibles fueron corregidas a no monetarios en `1aa48fc`; se conservarán por la orden de R8 de no reemplazar rondas anteriores. Se informará también la comparación incremental desde 1481e79. |
| R-76 | G4: estadística por commit y correspondencia con IDs | No cumplido | Se registrará al finalizar. |
| R-77 | G5: declarar listo únicamente si G0–G4 pasan | Aplicable | No se declarará G3=0 global ni listo para revisión mientras exista la diferencia heredada. |
| R-78 | R8 T3b: quitar línea en blanco extra antes de D-028 | No cumplido | El diff contra main muestra un salto adicional al final de D-027; se quitará sin alterar su contenido. |
| R-79 | R8 T3c: salidas completas del commit final en el PR | No cumplido | Se adjuntarán npm test, lint y validador en la descripción y en el reporte. |

**G1 v8: pasa como inventario inicial; G3 literal continúa no cumplido y no se oculta.**
