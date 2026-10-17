# Colección de cuentas e identificador

- **Estado**: En revisión
- **Responsable**: Carlos, con Codex
- **Rama**: `feat/cuentas-identificador`
- **Última actualización**: 2026-10-17

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

## Decisiones clave
- Carlos aprobó expresamente las recomendaciones 1–4 de la sección 10 del encargo en el chat: claves por nombre con metadatos, continuar con filas pendientes, otros ingresos/gastos ambiguos salvo la demo, ingresos por intereses como ingreso.
- La propiedad de los JSON corresponde al motor y queda pendiente. Esta rama conserva una instantánea de referencia, sin integrar ni modificar el motor.
- Los dividendos de 2024 siguen sin confirmar; no se añade un dato.
- Los 19 tipos existentes se conservan; una cuenta del catálogo puede tener `tipoApp: null`.
- Los umbrales se calibran contra el corpus. El apoyo por palabras usa longitud combinada para cumplir Efetivo/Efectivo ≥ 0.92; cambiar dígitos impide una sugerencia por similitud.
- Carlos aprobó el ajuste mínimo de lectura/propagación de N/D en Análisis y Reportes para resolver la contradicción entre R1 y la exclusión inicial de consumidores (D-034). Se conservan fórmulas y no se migra el motor.

## Archivos que toca
`js/modules/estados/cuentas-*.js`, `estados-import.js`, `estados-normalize.js`, `estados-ui.js`, `index.js` y el compartido `estados-calculations.js` (adaptador de identificación y corrección de ingresos por intereses). Pruebas `cuentas-*.test.js` y pruebas afectadas de importación/normalización. Documentación de API, arquitectura, manual, dominio, decisiones y CHANGELOG (solo Estados).

## Pasos

| # | Paso | Estado |
|---|---|---|
| 00 | [Investigación y procedencia](investigacion.md) | Completado |
| 01 | [Validación e informe de entrega](01-validacion.md) | Completado |

## Próximo paso
Revisión humana del PR en borrador. Calidad: 509 pruebas en verde y lint sin errores (10 advertencias previas). Los resultados, la prueba del Excel FDL y los límites están en el informe de validación. El motor JSON, las fórmulas de razones y el rediseño visual quedan fuera del alcance.
