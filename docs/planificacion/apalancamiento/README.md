# Apalancamiento (GAO, GAF y GAT)

- **Estado**: Planificación
- **Responsable**: Carlos
- **Rama**: `feat/apalancamiento`, local y creada desde `core` mientras se integra el PR #1; después se actualiza con `git merge origin/main`
- **Última actualización**: 2026-09-27

## Objetivo

Calcular automáticamente el GAO, el GAF y el GAT de una empresa a partir de los estados financieros que ya carga el módulo de Estados. El usuario no digita la UAII ni otros subtotales: el sistema los deriva de las cuentas clasificadas y muestra de dónde sale cada número.

## Qué ya resuelve la base (`core`)

- Estados importa JSON, CSV, TSV y Excel, con plantilla descargable y errores que indican la fila.
- Cada cuenta tiene un tipo (`ACCOUNT_TYPES`), incluidos intereses e impuestos. El tipo se infiere por el nombre o se toma de la columna `Clasificacion`.
- `computeFinancialTotals` suma por tipo y calcula la utilidad neta con intereses e impuestos.
- `computeRazones` ya calcula la UAII (utilidad operativa) y la cobertura de intereses.

Por eso esta feature ya no necesita importador ni catálogo propios: extiende el motor de Estados.

## Lo que falta para calcular los grados

| Dato | Situación actual | Qué hace falta |
|---|---|---|
| Costos variables y fijos (GAO) | Las cuentas tienen tipo, pero no comportamiento | El usuario marca cada cuenta operativa como variable, fija o mixta (con % variable) en el módulo, con una sugerencia según el tipo ([paso 00](00-alcance-y-decisiones.md)) |
| UAI | No existe como valor | Derivarla: UAII + otros ingresos − otros gastos − intereses |
| T | No existe | Tasa efectiva (IR / UAI) o, si no tiene sentido, una tasa configurable con 30 % por defecto (paso 00) |
| DAP (GAF) | No existe | Campo opcional por periodo en el módulo, 0 por defecto. No es un gasto del estado de resultados, sino una distribución posterior a la utilidad neta (paso 00) |

## Checkpoints

Actualizados tras integrar `core`. Los checkpoints 4 (importación) y parte del 5 (clasificación) del plan original ya los cubre Estados.

| CP | Meta | Estado |
|---|---|---|
| 1 | Fórmulas, diccionario y casos especiales aprobados, con casos resueltos a mano (paso 01) | En progreso |
| 2 | Motor: funciones puras de GAO, GAF y GAT en `calculate.js`, con tests del CP1 | Pendiente |
| 3 | Datos: comportamiento de costos, UAI, T y DAP sobre el motor de Estados | Pendiente |
| 4 | Pantalla `#/apalancamiento` con traza cuenta → concepto → fórmula → resultado | Pendiente |
| 5 | Memoria de clasificación por empresa para reutilizarla en la siguiente carga | Pendiente, opcional |

## Decisiones clave

- Indicadores: GAO, GAF y GAT. El benchmarking queda fuera por ahora ([paso 00](00-alcance-y-decisiones.md)).
- Entrada: los archivos que ya acepta Estados (Excel y CSV).
- Las funciones devuelven `null` (N/D), nunca 0, como exige `AGENTS.md`.
- Los grados necesitan nombres propios. La función `apalancamiento` ya existe y es el multiplicador de capital de DuPont: no la reutilices ni la renombres.
- Otros ingresos y otros gastos quedan fuera de la UAII, como ya hace el código, pero entran en el GAF a través de la UAI (opción B del [paso 01](01-formulas-apalancamiento.md), [D-007](../../decisiones.md)).
- Costos fijos y variables: los archivos no los separan. El usuario los marca en el módulo, con una sugerencia según el tipo, y se guardan aparte de `estados` ([paso 00](00-alcance-y-decisiones.md)).
- T: tasa efectiva cuando tiene sentido; si no, configurable con 30 % por defecto. DAP: campo opcional, 0 por defecto (paso 00).
- Fórmulas: las estructurales son el resultado principal y las de variación entre periodos, el complemento (paso 00).

## Archivos que tocará

- Nuevos: `js/modules/apalancamiento/` (`index.js` y `apalancamiento-calculations.js`) y sus tests en `tests/unit/`.
- Compartidos:
  - `js/utils/calculate.js`, para las fórmulas;
  - `js/store.js`, para guardar el comportamiento de costos y el DAP (paso 03). El importador no cambia;
  - `js/modules/estados/estados-calculations.js`, solo para exportar `resolveAccountType`, acordado con Cris, que lo revisa (paso 03);
  - `js/app.js` e `index.html`, para la ruta.

## Pasos

| # | Paso | Estado |
|---|---|---|
| 00 | [Alcance y decisiones iniciales](00-alcance-y-decisiones.md) | Completado |
| 01 | [Fórmulas de apalancamiento](01-formulas-apalancamiento.md) | En progreso |
| 02 | [Motor de cálculo](02-motor-de-calculo.md) | Pendiente |
| 03 | [Datos y derivación](03-datos-y-derivacion.md) | Pendiente |
| 04 | [Pantalla](04-pantalla.md) | Pendiente |
| 05 | [Memoria por empresa](05-memoria-por-empresa.md) (opcional) | Pendiente |

El MVP son los pasos 01 a 04 (CP1 a CP4). El 05 queda para después.

## Próximo paso

Aprobar lo que queda del paso 01 (CP1): las fórmulas, los casos especiales y los casos resueltos a mano. Después, revisar las preguntas abiertas de los pasos 02 a 04 y empezar el CP2: las funciones puras con sus tests.
