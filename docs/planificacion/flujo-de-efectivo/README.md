# Flujo de efectivo desde los estados (EFE de Análisis)

- **Estado**: En revisión
- **Responsable**: Henry
- **Rama**: `flujo-de-efectivo`
- **Última actualización**: 2026-10-16

## Objetivo

Que la pestaña EFE de Análisis muestre el estado de flujo de efectivo completo por método indirecto —operación, inversión y financiamiento— derivado de dos balances, con la comprobación CFO + CFI + CFF = variación de efectivo. Resuelve la propuesta 3 de `modulos-guia/02-valor-agregado.md` y lo que D-012 dejó pendiente ("mejora coordinada con Henry").

## Checkpoints

| CP | Meta | Estado |
|---|---|---|
| 1 | Módulo puro `efe-calculations.js` con las tres actividades y la comprobación | Completado |
| 2 | `computeEFE` y `renderEFESection` reescritos; exportación de `computeEFE` intacta | Completado |
| 3 | Pruebas con casos resueltos a mano (demo, sintético, no-cuadra, depreciación, datos faltantes, escape) | Completado |
| 4 | Documentación: CHANGELOG, api, dominio, arquitectura, decisiones D-024..D-026 y manual §4.8 | Completado |

## Decisiones clave

- D-024: el EFE de Análisis pasa a tres actividades derivadas de dos balances; se conserva `efeIndirecto` de `calculate.js` para sus pruebas.
- D-025: dividendos = UN − ΔRE si hay cuentas de utilidades acumuladas; si no, variación total del patrimonio con advertencia.
- D-026: depreciación del periodo = Δ de la magnitud de la depreciación acumulada, con advertencias de signo positivo y de baja de activos.
- D-027: el EFE y el EOAF comparten selección de periodos, tolerancia y advertencia de balance (`comprobacion-calculations.js`); el EFE ya no lanza con importes inválidos ni muestra `C$ -0.00`.

## Archivos que toca

- `js/modules/analisis/efe-calculations.js` (nuevo), `js/modules/analisis/comprobacion-calculations.js` (nuevo, compartido con el EOAF), `js/modules/analisis/index.js` (`computeEFE`, `renderEFESection`, imports)
- `tests/unit/efe.test.js` (nuevo)
- Docs: `CHANGELOG.md`, `docs/api.md`, `docs/contexto/dominio-financiero.md`, `docs/contexto/arquitectura.md`, `docs/decisiones.md` (D-024..D-026), `docs/manual-usuario.md` (§4.8), esta ficha y `docs/planificacion/README.md`

Compartidos según `AGENTS.md`: `js/modules/analisis/index.js`. La integración con `origen-y-aplicacion` (EOAF) se hizo en la rama `feat/integra-efe-eoaf` (PR #13): el conflicto en ese archivo se resolvió manteniendo ambas secciones. `#/flujo` (método directo, D-012) no se toca.

## Pasos

| # | Paso | Estado |
|---|---|---|
| 00 | [Alcance y diseño](00-alcance.md) | Completado |

## Próximo paso

Revisión del equipo y PR hacia `main` (lo aprueba otra persona; ninguna rama se fusiona sin ese visto bueno).
