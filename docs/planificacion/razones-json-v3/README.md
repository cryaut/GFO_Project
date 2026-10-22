# JSON autónomos de razones financieras v3

- **Estado**: En revisión
- **Responsable**: Cris Lumbi (decisiones); Carlos con Codex (correcciones de ronda 7)
- **Rama**: `feat/razones-json-v3`
- **Última actualización**: 2026-10-20

## Objetivo
Generar los 20 JSON deterministas de razones financieras que pide `instrucciones_agente_json_razones_financieras_v3.md` (fórmulas del profesor, semántica N/D, promedios y botón de cálculo directo de m1), autosuficientes en `docs/razones_financieras/`, con sus notas de trabajo y checks contra el caso MUNO MODA S.A.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Fase 0: notas de control, decisiones, registro de cuentas y derivados | Completado |
| 2 | 20 JSON válidos con sus notas `ratios/NN_*.md` y checks del caso | Completado |
| 3 | Fase 2: consistencia de ids/nombres/signos, sin marcadores, botón de m1 e insignias | Completado |
| 4 | `npm test` y `npm run lint` en verde | Completado |
| 5 | PR aprobado e integrado a `main` | Pendiente |
| 6 | Ronda 7: estados alineados, numeración y conflictos de main | Completado para los requisitos enumerados: 436 pruebas, lint sin errores y validador 18/18 |

## Decisiones clave
- Los JSON van en `docs/razones_financieras/` (ruta relativa pedida por el documento de instrucciones, dentro del proyecto porque pide ejecutar las pruebas del proyecto): **D-028**.
- Cada archivo es autónomo: catálogo, conjuntos, derivados y reglas completos, aunque se repitan (instrucción explícita; prevalece sobre la especificación, que prefiere un `financial-rules.json` único).
- Convenciones de implementación no resueltas por el documento (literales `{"value": 365}`, refs a otra razón `{"ref": "ratio.<id>", "period": "previous_current"}`, conjuntos `bs.fixed_assets_components` y `bs.noncurrent_liabilities_components`, `parent_group` siempre con su conjunto completo incluido, depreciación acumulada `requires_data`): **D-029**.
- El botón de cálculo directo de m1 va en las 11 razones de flujo (7, 8, 12–20), no en 9: el paréntesis del documento enumera 11 y la columna "m1 off" (9 con valor / 11 N/D) confirma 11 razones de flujo: **D-030**.
- El separador decimal queda fijado en **D-033** (D-026 antes de la renumeración de ronda 7), con formato F1. El control por razón de **D-030** fue reemplazado por el control global de **D-032**. La numeración vigente de las ocho decisiones del PR #10 es D-028 a D-035; D-036 registra su atribución a Cris Lumbi.

## Ronda 7 (2026-10-20)

- Copia aislada de `a87ef0a`, con `origin/main` `2c11c4d` incorporado mediante merge. Se conservan intactas D-001 a D-027 de main; se añaden las ocho decisiones renumeradas y D-036. Las referencias activas cambian; las salidas históricas dentro de bloques de evidencia conservan su numeración original.
- Los 71 ids de los JSON coinciden en estado con el catálogo del PR #14 en `7e71ad8`: **1 verified, 65 partially_verified y 5 ambiguous**. Son 28 cuentas rebajadas, con 157 apariciones. El catálogo tiene además `is.interest_income`, fuera de estos JSON; no se añade en esta ronda.
- Intangibles pasa a «no monetarios» en sus tres apariciones. No se cambian fórmulas ni otras definiciones. Las diferencias adicionales de alias y ambigüedades se reportan sin corregir.
- La premisa de fuentes de la orden no coincide con `a87ef0a`: los JSON citan IFRS, no PGC, y amortización ya tiene una frase de IAS 38 sobre amortización. Se conserva esa cita; no se inventa una corrección de depreciación. Las fuentes anteriores no se presentan como reabiertas en esta ronda.
- El adjunto completo `prompt_correccion_agente_razones_v8.md` no está disponible. Se aplican los requisitos enumerados en la ronda 7 y la sección 2 de la tarea maestra, sin certificar instrucciones adicionales de un documento no recibido.
- Validación de código: **436 pruebas en 34 archivos**; lint **0 errores y 10 advertencias**. El primer validador pasó V1–V17 y falló V0 por árbol sucio durante la corrección; después del commit `1aa48fc`, con el árbol limpio, pasa **18/18**. El [informe de entrega](ronda7-C-cierre-pr10.md) contiene las salidas completas y el resultado final.

## Qué se hizo
- Fases 0–3 completadas: `notas/00_control.md`, `01_decisiones.md` (D1–D14, R1–R5), `02_fuentes.md` (10 fuentes confirmadas), `03_registro_cuentas.md` (71 cuentas), `04_derivados.md`.
- 20 JSON en `docs/razones_financieras/` y 20 notas `ratios/NN_*.md` con fórmula, árbol de descomposición, cuentas, periodos y checks.
- `notas/05_checks.md`: 40/40 celdas del caso iguales a la tabla del documento, conteos 9/11, 15/5 y 15/5, ecuación contable cuadrada y 12 verificaciones de consistencia en verde.
- `npm test` (31 archivos, 375 pruebas) y `npm run lint` (0 errores) en verde; los avisos de lint son preexistentes y no tocan esta tarea.
- Revisión 2026-10-14 aplicada: las 8 diferencias con la solución del profesor pasaron a `DIFERENCIA_CONOCIDA_PROFESOR` en `metadata.research_notes` (las 8 URLs se reabrieron y verificaron con texto de la norma; se corrigió la afirmación de NIC 38 en `02_fuentes.md`), `DECISION_PENDIENTE` quedó solo en `metadata.display`, el mensaje del commit `4a3bef0` se corrigió (`c50545a`) y la descripción del PR aclara que los JSON aún no se aplican en el motor ni en la app.

## Qué falta
- Aprobación del equipo y merge del PR (CP5). El agente no hace el merge sin petición expresa.

## Archivos que toca
- `docs/razones_financieras/` (nuevo: 20 JSON + `notas/` + `ratios/NN_*.md`)
- `docs/planificacion/razones-json-v3/` (esta ficha)
- `docs/planificacion/README.md` (fila de la feature)
- `CHANGELOG.md`, `docs/decisiones.md` (compartidos según `AGENTS.md`)

## Pasos
| # | Paso | Estado |
|---|---|---|
| 00 | Fase 0 — preparación de notas | Completado |
| 01 | Fase 1 — 20 razones: nota, investigación, JSON y check | Completado |
| 02 | Fase 2 — consistencia y validaciones globales | Completado |
| 03 | Fase 3 — reporte final y PR | Completado |
| 04 | [Ronda 7 — reconciliación y preparación del PR #10](ronda7-C-cierre-pr10.md) | Completado para los requisitos enumerados; adjunto v8 completo no recibido |

## Próximo paso
Presentar los cambios enumerados para revisión del equipo en el PR #10, con las salidas completas en su descripción. No fusionar el PR ni iniciar el motor de razones. Cualquier requisito adicional del adjunto v8 no disponible debe contrastarse cuando se aporte.
