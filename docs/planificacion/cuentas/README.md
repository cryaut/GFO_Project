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
| 9 | Ronda 5: puente de intereses y comparación en lectura | D-051 aplicada; unicidad absoluta de sinónimos pendiente de decisión |

## Decisiones clave
- Carlos aprobó expresamente las recomendaciones 1–4 de la sección 10 del encargo en el chat: claves por nombre con metadatos, continuar con filas pendientes, otros ingresos/gastos ambiguos salvo la demo, ingresos por intereses como ingreso.
- La propiedad de los JSON corresponde al motor y queda pendiente. Esta rama conserva una instantánea de referencia, sin integrar ni modificar el motor.
- Los dividendos de 2024 siguen sin confirmar; no se añade un dato.
- Los 19 tipos existentes se conservan; una cuenta del catálogo puede tener `tipoApp: null`.
- Los umbrales se calibran contra el corpus. El apoyo por palabras usa longitud combinada para cumplir Efetivo/Efectivo ≥ 0.92; cambiar dígitos impide una sugerencia por similitud.
- D-044 limitó el trabajo en Razones por instrucción de Cris comunicada por Carlos. La ronda 3 y la aclaración posterior de Carlos autorizan la excepción D-047/D-048: solo propagar N/D en `calculate.js` y operaciones previas de Análisis, conservando fórmulas, interfaz y un periodo. No se retiran nombres fijos (1c), no se restaura el adaptador por grupos ni se conecta el motor.
- D-045/D-046 dejan PGC como referencia terminológica y corrigen intangibles a no monetarios. Catálogo: 1 verificada, 66 parciales y 5 ambiguas; diferencias explícitas con #10.
- D-051, aprobada por Cris el 2026-10-19: `is.interest_income` declara `agrupadoEn: 'is.nonoperating_income'`. Se conservan los dos tipos `otrosIngresos` y todas las fórmulas. La guardia de alias admite explícitamente ocho cruces normalizados heredados; no se afirma unicidad absoluta ni aprobación de su depuración.

## Archivos que toca
`js/modules/estados/cuentas-*.js`, `estados-import.js`, `estados-normalize.js`, `estados-ui.js`, `index.js` y el compartido `estados-calculations.js` (identificación e ingresos por intereses). La excepción de ronda 3 toca `js/utils/calculate.js`, operaciones previas/lectura de metadatos en `analisis/index.js` y la selección explícita de tasa configurada en `apalancamiento-calculations.js`. Pruebas de cuentas, importación, helpers y regresión; API, arquitectura, manual, dominio, decisiones y CHANGELOG.

## Pasos

| # | Paso | Estado |
|---|---|---|
| 00 | [Investigación y procedencia](investigacion.md) | Completado |
| 01 | [Validación e informe de entrega](01-validacion.md) | Completado |
| 02 | [Correcciones de revisión](02-correcciones-revision.md) | Implementadas; dependencias externas pendientes |
| 03 | [Excluir razones del alcance](03-excluir-razones.md) | Completado |
| 04 | [Ronda 3: excepción limitada y validación vigente](04-ronda3-nd.md) | Completada; revisión humana pendiente |
| 05 | [Ronda 5: puente de intereses](05-ronda5-puente-intereses.md) | D-051 aplicada; requisito literal de sinónimos pendiente |
| 06 | [Comparación de utilidad app/JSON](06-comparacion-utilidad-json.md) | Lectura de referencias inmutables; sin arreglos propuestos |

## Próximo paso
Revisar D-051 y la comparación en el borrador #14; cerrar la decisión sobre los sinónimos compartidos. Validación vigente: **754 pruebas en 40 archivos, lint sin errores y 10 advertencias previas**, con detalle en el paso 05; el paso 04 y los anteriores conservan sus resultados históricos. Antes de integrar: esperar v8 del PR #10, reconciliar 28 diferencias de investigación y una de definición, integrar #10 primero y renumerar D-029–D-034 como D-037–D-042. D-045–D-048 y D-051 registran las correcciones actuales; D-049 y D-050 no se implementan aquí. 1c y el dato independiente de dividendos siguen pendientes. No se integra ningún PR desde esta tarea.
