# Origen y Aplicación de Fondos (EOAF)

- **Estado**: En revisión
- **Responsable**: Henry
- **Rama**: `origen-y-aplicacion`
- **Última actualización**: 2026-10-09

## Objetivo

Que la pestaña **EOAF** de `#/analisis` presente un Estado de Origen y Aplicación de Fondos que un docente pueda auditar: una fila por cuenta del balance comparado, clasificación con las reglas del libro (activo que sube = aplicación, pasivo o patrimonio que sube = origen), depreciación acumulada tratada como contra-activo y una comprobación `Σ orígenes − Σ aplicaciones` que se declara cuadrada o no.

## Checkpoints

| CP | Meta | Estado |
|---|---|---|
| 1 | Lógica pura del EOAF en su propio módulo, con los 12 casos de prueba exigidos | Completado |
| 2 | Pantalla de Análisis con balance comparado, subtotales, comprobación e interpretación | Completado |
| 3 | Tests y lint en verde; documentación (CHANGELOG, api, dominio, decisiones, manual) al día | Completado |
| 4 | PR revisado por otra persona y mergeado a `main` | Pendiente |

## Decisiones clave

- [D-021](../decisiones.md#d-021--el-eoaf-clasifica-cada-cuenta-del-balance-no-seis-agregados): clasificar cada cuenta del balance, no seis agregados con doble conteo.
- [D-022](../decisiones.md#d-022--la-depreciación-acumulada-se-clasifica-por-su-magnitud-y-no-se-inventa-el-gasto): depreciación acumulada por variación de magnitud; no se inventa el gasto del periodo.
- [D-023](../decisiones.md#d-023--la-comprobación-usa-tolerancia-de-c-001-y-no-redistribuye-diferencias): tolerancia de C$ 0.01, sin redistribuir diferencias; estados `cuadra`, `no-cuadra` e `incompleta`.

## Archivos que toca

| Archivo | Qué |
|---|---|
| `js/modules/analisis/eoaf-calculations.js` | Nuevo: lógica pura (`construirEOAF`, `clasificarMovimientoEOAF`, `seleccionarPeriodoPar`, `interpretarEOAF`, `TOLERANCIA_EOAF`) |
| `js/modules/analisis/index.js` | `computeEOAF` devuelve el estado completo; `renderEOAFSection` arma la tabla y la comprobación |
| `tests/unit/eoaf.test.js` | Nuevo: 24 pruebas |
| `CHANGELOG.md`, `docs/api.md`, `docs/contexto/dominio-financiero.md`, `docs/contexto/arquitectura.md`, `docs/decisiones.md`, `docs/manual-usuario.md` | Documentación |
| `docs/planificacion/` | Esta ficha |

No toca `main`, `js/utils/calculate.js`, `js/modules/estados/` ni `js/store.js`.

## Pasos

| # | Paso | Estado |
|---|---|---|
| 00 | [Alcance](00-alcance.md) | Completado |
| 01 | [Implementación](01-implementacion.md) | Completado |

## Fuera de alcance (anotado para el PR)

- La sección de estructura de razones de `index.js` inserta nombres de cuenta sin `escapeHTML` (un nombre de archivo con HTML se ejecuta en esa tabla). No es de esta feature; el bloque del EOAF sí escapa. Bug preexistente fuera del alcance de la Etapa 1.
- Flujo de Efectivo (`#/flujo`, pestaña EFE), DuPont y el método directo no se modifican: son la Etapa 2 y siguen la autorización de Henry.

## Próximo paso

Abrir el PR de `origen-y-aplicacion` hacia `main` con la plantilla del flujo de trabajo y esperar la revisión. Después, con autorización, la Etapa 2 en la rama `flujo-de-efectivo`.
