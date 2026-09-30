# Corrección de razones financieras (auditoría)

- **Estado**: En revisión
- **Responsable**: Equipo GFO
- **Rama**: `razones-financieras-v3`
- **Última actualización**: 2026-09-29

## Objetivo
Aplicar las correcciones de la auditoría del módulo de Razones Financieras: sin resultados financieros falsos (semántica `null` = N/D), promedios sin cuentas ausentes, ROA/endeudamiento coherentes entre Análisis y Reportes, y orden cronológico de periodos.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Correcciones implementadas en `razones-financieras-v3`, verificadas con arnés de 83 comprobaciones | Completado |
| 2 | `npm test` y `npm run lint` en verde (requiere `node_modules`) | Pendiente |
| 3 | PR aprobado e integrado a `main` | Pendiente |

## Decisiones clave
- ~~`rotacionCxC` exige ventas a crédito; el modelo no las distingue → RotCxC/PPC/CCC quedan N/D con nota, sin aproximar con ventas totales.~~ Cambiado al integrar con `feat/modulos-guia`: Análisis usa las ventas totales (como Gitman), porque el N/D dejaba sin plazo de cobro ni ciclo de conversión a cualquier empresa.
- Promedios: cuenta ausente en un periodo → `null` (N/D); un solo periodo → saldo final (metodología documentada, inalterada).
- RotCxP usa compras reales; sin inventario comparable usa costo de ventas y la tarjeta lo etiqueta "aprox.".
- `computeDashboardKPIs` reutiliza `computeRazones` de Análisis (mismo criterio y N/D).
- Orden cronológico único en `normalizeFinancialData` (`sortPeriods`); las vías degradadas (datos sin clasificación válida) conservan el comportamiento anterior.

## Archivos que toca
`js/utils/calculate.js`, `js/modules/analisis/index.js`, `js/modules/estados/estados-normalize.js`, `js/modules/estados/estados-import.js`, `js/modules/integracion/index.js`, `tests/unit/calculate.test.js`, `tests/unit/analisis-razones.test.js`, `docs/api.md`, `CHANGELOG.md` (compartidos según `AGENTS.md`).

## Pasos
| # | Paso | Estado |
|---|---|---|
| 00 | Correcciones de la auditoría | Completado |

## Próximo paso
Pedir revisión del PR hacia `main`; bloqueado por los checkpoints 2 (tests/lint sin `node_modules` en este entorno) y 3 (aprobación de otra persona).
