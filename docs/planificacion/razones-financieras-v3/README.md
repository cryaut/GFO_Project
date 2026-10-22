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
- Orden cronológico único en `normalizeFinancialData` (`sortPeriods`); las vías degradadas (datos sin clasificación válida) conservan el comportamiento anterior. Ajustado al integrar con `feat/modulos-guia`: solo se ordenan solos los periodos que empiezan con un año (`ordenarPeriodos`), porque el orden alfabético ponía "Abril" antes que "Marzo" y anulaba el reordenado manual de Estados.

## Archivos que toca
`js/utils/calculate.js`, `js/modules/analisis/index.js`, `js/modules/estados/estados-normalize.js`, `js/modules/estados/estados-import.js`, `js/modules/integracion/index.js`, `tests/unit/calculate.test.js`, `tests/unit/analisis-razones.test.js`, `docs/api.md`, `CHANGELOG.md` (compartidos según `AGENTS.md`).

## Pasos
| # | Paso | Estado |
|---|---|---|
| 00 | Correcciones de la auditoría | Completado |

## Próximo paso
Pedir revisión del PR hacia `main`; bloqueado por los checkpoints 2 (tests/lint sin `node_modules` en este entorno) y 3 (aprobación de otra persona).

## Ronda 9 — patrimonio anterior en Mercado

- **Rama independiente**: `fix/mercado-patrimonio-anterior`, desde `origin/main` (`2c11c4d`).
- **Alcance aprobado**: exigir que `anterior.totalPatrimonio` sea numérico antes de calcular dividendos implícitos. Con N/D se devuelve `null`; no cambian otras fórmulas ni datos de ejemplo.
- **Archivos**: una guarda en `mercado-calculations.js`, una prueba de regresión en `razones-mercado.test.js`, esta ficha y la nota del changelog.
- **Regresión**: el caso UN = 100, patrimonio actual = 1000 y patrimonio previo = `null` produce `-900` antes de la guarda y N/D después. Se simula solo el subtotal previo con un spy: el productor de `main` aún no devuelve ese subtotal N/D de forma natural.
- **Esperados existentes**: no se modifican, incluido el periodo sin anterior y la nota «2024: C$ 40,000.00» del ejemplo.
- **Validación**: 437 pruebas en verde (34 archivos); lint con 0 errores y las 10 advertencias heredadas. La prueba nueva falla antes de la guarda con `expected -900 to be null` y pasa después.
- **Estado**: pendiente de revisión en su propio PR; no se fusiona y no toca los PR #14 ni #10, 1c ni el motor de razones.
