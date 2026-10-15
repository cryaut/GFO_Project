# JSON autónomos de razones financieras v3

- **Estado**: En revisión
- **Responsable**: Alejandro (con agente IA)
- **Rama**: `feat/razones-json-v3`
- **Última actualización**: 2026-10-14

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

## Decisiones clave
- Los JSON van en `docs/razones_financieras/` (ruta relativa pedida por el documento de instrucciones, dentro del proyecto porque pide ejecutar las pruebas del proyecto): **D-021**.
- Cada archivo es autónomo: catálogo, conjuntos, derivados y reglas completos, aunque se repitan (instrucción explícita; prevalece sobre la especificación, que prefiere un `financial-rules.json` único).
- Convenciones de implementación no resueltas por el documento (literales `{"value": 365}`, refs a otra razón `{"ref": "ratio.<id>", "period": "previous_current"}`, conjuntos `bs.fixed_assets_components` y `bs.noncurrent_liabilities_components`, `parent_group` siempre con su conjunto completo incluido, depreciación acumulada `requires_data`): **D-022**.
- El botón de cálculo directo de m1 va en las 11 razones de flujo (7, 8, 12–20), no en 9: el paréntesis del documento enumera 11 y la columna "m1 off" (9 con valor / 11 N/D) confirma 11 razones de flujo: **D-023** (en revisión el equipo confirmó que el «9» de la v3 es un error del documento).
- El separador decimal del formato numérico no se fija: queda como `DECISION_PENDIENTE` en `metadata.display` de los 20 JSON hasta que el usuario lo confirme: **D-024** (única decisión abierta).

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

## Próximo paso
Esperar la revisión del equipo en el PR (`docs/reglas/flujo-de-trabajo.md`). Cualquier cambio de convención que surja en la revisión se registra como entrada nueva en `docs/decisiones.md`.
