# Apalancamiento (GAO, GAF y GAT)

- **Estado**: Planificación
- **Responsable**: Carlos
- **Rama**: `feat/apalancamiento`, que se crea desde `main` cuando se integre `core`
- **Última actualización**: 2026-09-26

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
| Costos variables y fijos (GAO) | Las cuentas tienen tipo, pero no comportamiento | Marcar cada cuenta de costo o gasto como variable, fija o mixta (con % variable) |
| UAI | No existe como valor | Derivarla: UAII + otros ingresos − otros gastos − intereses |
| T | No existe | Tasa efectiva (impuestos / UAI) o una tasa configurable si la efectiva no tiene sentido |
| DAP (GAF) | No existe | Decidir dónde se registra: no es un gasto del estado de resultados, sino una distribución posterior a la utilidad neta |

## Checkpoints

Actualizados tras integrar `core`. Los checkpoints 4 (importación) y parte del 5 (clasificación) del plan original ya los cubre Estados.

| CP | Meta | Estado |
|---|---|---|
| 1 | Fórmulas, diccionario y casos especiales aprobados, con casos resueltos a mano (paso 01) | Pendiente |
| 2 | Motor: funciones puras de GAO, GAF y GAT en `calculate.js`, con tests del CP1 | Pendiente |
| 3 | Datos: comportamiento de costos, UAI, T y DAP sobre el motor de Estados | Pendiente |
| 4 | Pantalla `#/apalancamiento` con traza cuenta → concepto → fórmula → resultado | Pendiente |
| 5 | Memoria de clasificación por empresa para reutilizarla en la siguiente carga | Pendiente, opcional |

## Decisiones clave

- Indicadores: GAO, GAF y GAT. El benchmarking queda fuera por ahora ([paso 00](00-alcance-y-decisiones.md)).
- Entrada: los archivos que ya acepta Estados (Excel y CSV).
- Las funciones devuelven `null` (N/D), nunca 0, como exige `AGENTS.md`.
- Los grados necesitan nombres propios. La función `apalancamiento` ya existe y es el multiplicador de capital de DuPont: no la reutilices ni la renombres.
- Otros ingresos y otros gastos quedan fuera de la UAII, como ya hace el código. Falta confirmarlo (pregunta 5 del paso 00).

## Archivos que tocará

- Nuevos: `js/modules/apalancamiento/` (`index.js` y `apalancamiento-calculations.js`) y sus tests en `tests/unit/`.
- Compartidos:
  - `js/utils/calculate.js`, para las fórmulas;
  - `js/modules/estados/estados-calculations.js` y `estados-import.js`, para el comportamiento de costos y el DAP. Hay que coordinarlo con Cris, responsable de Estados;
  - `js/app.js` e `index.html`, para la ruta.

## Pasos

| # | Paso | Estado |
|---|---|---|
| 00 | [Alcance y decisiones iniciales](00-alcance-y-decisiones.md) | En progreso |
| 01 | Fórmulas de apalancamiento | Pendiente |

## Próximo paso

Integrar `core` en `main`. Después, responder las preguntas abiertas del paso 00 y abrir `01-formulas-apalancamiento.md`.
