# Colección de cuentas e identificador

- **Estado**: En revisión
- **Responsable**: Carlos, con Codex
- **Rama**: `feat/cuentas-identificador`
- **Última actualización**: 2026-10-18
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

## Decisiones clave
- Carlos aprobó expresamente las recomendaciones 1–4 de la sección 10 del encargo en el chat: claves por nombre con metadatos, continuar con filas pendientes, otros ingresos/gastos ambiguos salvo la demo, ingresos por intereses como ingreso.
- La propiedad de los JSON corresponde al motor y queda pendiente. Esta rama conserva una instantánea de referencia, sin integrar ni modificar el motor.
- Los dividendos de 2024 siguen sin confirmar; no se añade un dato.
- Los 19 tipos existentes se conservan; una cuenta del catálogo puede tener `tipoApp: null`.
- Los umbrales se calibran contra el corpus. El apoyo por palabras usa longitud combinada para cumplir Efetivo/Efectivo ≥ 0.92; cambiar dígitos impide una sugerencia por similitud.
- La aprobación previa de ajustes en Razones queda reemplazada por la indicación posterior de Carlos de no modificar esa parte (D-044). Se restaura `analisis/index.js` a `main` y se retira el adaptador de disponibilidad de razones. Las correcciones de Estados y Reportes se conservan; no se migra el motor.

## Archivos que toca
`js/modules/estados/cuentas-*.js`, `estados-import.js`, `estados-normalize.js`, `estados-ui.js`, `index.js` y el compartido `estados-calculations.js` (adaptador de identificación y corrección de ingresos por intereses). Pruebas `cuentas-*.test.js` y pruebas afectadas de importación/normalización. Documentación de API, arquitectura, manual, dominio, decisiones y CHANGELOG (solo Estados).

## Pasos

| # | Paso | Estado |
|---|---|---|
| 00 | [Investigación y procedencia](investigacion.md) | Completado |
| 01 | [Validación e informe de entrega](01-validacion.md) | Completado |
| 02 | [Correcciones de revisión](02-correcciones-revision.md) | Implementadas; dependencias externas pendientes |
| 03 | [Excluir razones del alcance](03-excluir-razones.md) | Completado |

## Próximo paso
Revisión del borrador #14: **523 pruebas en 38 archivos pasan; lint sin errores y 10 advertencias previas**. Los pasos 01 y 02 conservan las validaciones anteriores; el paso 03 registra la exclusión de Razones y la validación vigente. Antes de integrar: esperar v8 del PR #10, reconciliar sus estados de investigación (incluidas seis rebajas locales), integrar #10 primero y renumerar D-029–D-034 como D-037–D-042. D-043 y D-044 registran corrección y límite de alcance. Cualquier trabajo en Razones requiere una tarea y autorización posteriores; el dato independiente de dividendos sigue pendiente. No se integra ningún PR desde esta tarea.
