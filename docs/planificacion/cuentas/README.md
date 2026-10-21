# Colección de cuentas e identificador

- **Estado**: En revisión
- **Responsable**: Carlos, con Codex
- **Rama**: `feat/cuentas-identificador`
- **Última actualización**: 2026-10-20
- **PR**: [#14 — borrador](https://github.com/cryaut/GFO_Project/pull/14)

## Objetivo
Unificar la identificación de cuentas de importación y alta manual mediante identificadores estables, investigación trazable y sugerencias que requieren confirmación. Conservar las claves por nombre y los estados guardados existentes.

## Checkpoints

| CP | Meta | Estado |
|---|---|---|
| 1 | Investigar y cubrir las 71 cuentas de los 20 JSON | Completado |
| 2 | Similitud e identificador con corpus positivo y negativo | Completado |
| 3 | Registro común, normalización e importación sin pérdida de filas | Completado |
| 4 | Alta manual y revisión de pendientes | Completado |
| 5 | Regresión de la demo, tests, lint, navegador y PR | Completado |
| 6 | Correcciones de las revisiones PR #14 y PR #13 | Implementadas y probadas; coordinación externa pendiente |
| 7 | Excluir razones por indicación posterior de Carlos | Completado; 523 pruebas en 38 archivos |
| 8 | Excepción de ronda 3: N/D en helpers y operaciones previas | Completada; 752 pruebas en 40 archivos |
| 9 | Ronda 5: puente de intereses y comparación en lectura | Completado; criterio de sinónimos aprobado por Carlos en D-052 |
| 10 | Ronda 6: restaurar D-005, historial y evidencias | Completado; 753 pruebas; 1c confirmada solo para una ronda aparte |
| 11 | Ronda 7 A/B: línea base e inventario | Informes independientes; sin implementar 1c |

## Decisiones clave
- Carlos aprobó expresamente las recomendaciones 1–4 de la sección 10 del encargo en el chat: claves por nombre con metadatos, continuar con filas pendientes, otros ingresos/gastos ambiguos salvo la demo, ingresos por intereses como ingreso.
- La propiedad de los JSON corresponde al motor y queda pendiente. Esta rama conserva una instantánea de referencia, sin integrar ni modificar el motor.
- Los dividendos de 2024 siguen sin confirmar; no se añade un dato.
- Los 19 tipos existentes se conservan; una cuenta del catálogo puede tener `tipoApp: null`.
- Los umbrales se calibran contra el corpus. El apoyo por palabras usa longitud combinada para cumplir Efetivo/Efectivo ≥ 0.92; cambiar dígitos impide una sugerencia por similitud.
- D-044 limitó el trabajo en Razones por instrucción de Cris comunicada por Carlos. La ronda 3 y la aclaración posterior de Carlos autorizan la excepción D-047/D-048: solo propagar N/D en `calculate.js` y operaciones previas de Análisis, conservando fórmulas, interfaz y un periodo. No se retiran nombres fijos (1c), no se restaura el adaptador por grupos ni se conecta el motor.
- D-045/D-046 dejan PGC como referencia terminológica y corrigen intangibles a no monetarios. Catálogo: 1 verificada, 66 parciales y 5 ambiguas; diferencias explícitas con #10.
- D-051, aprobada por Cris el 2026-10-19: `is.interest_income` declara `agrupadoEn: 'is.nonoperating_income'`. Se conservan los dos tipos `otrosIngresos` y todas las fórmulas. D-052 registra la aprobación expresa de Carlos del 2026-10-20: conservar los ocho cruces normalizados heredados y bloquear otros nuevos, sin afirmar unicidad absoluta ni ampliar la depuración.
- Ronda 6: `tasaImpuesto` y Apalancamiento se restauran a `main` según D-005, con aclaración añadida a D-047; `saldoPromedio` se conserva. D-044 recupera el bloque original de `b15ddde` y añade la aclaración literal de la atribución a Cris, sin inventar motivos.
- Carlos confirmó expresamente el 2026-10-20 retirar los 22 accesos por nombres fijos en una ronda aparte, definiendo y probando antes los datos no normalizables. En estas rondas no se implementa 1c ni se registra D-049.

## Archivos que toca
`js/modules/estados/cuentas-*.js`, `estados-import.js`, `estados-normalize.js`, `estados-ui.js`, `index.js` y el compartido `estados-calculations.js` (identificación e ingresos por intereses). La excepción de ronda 3 toca `js/utils/calculate.js` y operaciones previas/lectura de metadatos en `analisis/index.js`. La ronda 6 restaura `tasaImpuesto`, `apalancamiento-calculations.js` y las pruebas originales de Apalancamiento a `main`. Pruebas de cuentas, importación, helpers y regresión; API, arquitectura, manual, dominio, decisiones y CHANGELOG.

## Pasos

| # | Paso | Estado |
|---|---|---|
| 00 | [Investigación y procedencia](investigacion.md) | Completado |
| 01 | [Validación e informe de entrega](01-validacion.md) | Completado |
| 02 | [Correcciones de revisión](02-correcciones-revision.md) | Implementadas; dependencias externas pendientes |
| 03 | [Excluir razones del alcance](03-excluir-razones.md) | Completado |
| 04 | [Ronda 3: excepción limitada y validación vigente](04-ronda3-nd.md) | Completada; revisión humana pendiente |
| 05 | [Ronda 5: puente de intereses](05-ronda5-puente-intereses.md) | Completado; D-051 aplicada y criterio de sinónimos D-052 aprobado |
| 06 | [Comparación de utilidad app/JSON](06-comparacion-utilidad-json.md) | Lectura de referencias inmutables; sin arreglos propuestos |
| 07 | [Ronda 6: restauración y validación](07-ronda6-validacion.md) | 753 pruebas en 40 archivos; lint 0 errores/10 advertencias previas |
| A | [Ronda 7: línea base de main](ronda7-A-linea-base-main.md) | 436 pruebas en 34 archivos; lint 0 errores/10 advertencias |
| B | [Ronda 7: nombres fijos y operaciones](ronda7-B-inventario-nombres-fijos.md) | Inventario en lectura; no autoriza ni implementa 1c |

## Próximo paso
Revisión humana de las restauraciones de ronda 6 y los informes A/B. 1c está confirmada para una ronda aparte, con el contrato y las pruebas de datos no normalizables por definir; la decisión de sinónimos D-052 está cerrada. Validación vigente: **753 pruebas en 40 archivos, lint sin errores y 10 advertencias ya reproducidas en main**, con salidas completas en el paso 07 y el PR; los pasos anteriores conservan sus resultados históricos. Coordinar el cierre separado del PR #10 antes de integrar sus JSON y reconciliar sus estados/definición con el catálogo; integrar #10 primero y renumerar D-029–D-034 como D-037–D-042 justo antes de integrar #14. D-049 y D-050 no se implementan aquí. El dato independiente de dividendos sigue pendiente. No se integra ningún PR desde esta tarea.
