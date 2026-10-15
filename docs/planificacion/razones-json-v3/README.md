# JSON autónomos de razones financieras v3

- **Estado**: En progreso
- **Responsable**: Alejandro (con agente IA)
- **Rama**: `feat/razones-json-v3`
- **Última actualización**: 2026-10-14

## Objetivo
Generar los 20 JSON deterministas de razones financieras que pide `instrucciones_agente_json_razones_financieras_v3.md` (fórmulas del profesor, semántica N/D, promedios y botón de cálculo directo de m1), autosuficientes en `docs/razones_financieras/`, con sus notas de trabajo y checks contra el caso MUNO MODA S.A.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Fase 0: notas de control, decisiones, registro de cuentas y derivados | Completado |
| 2 | 20 JSON válidos con sus notas `ratios/NN_*.md` y checks del caso | En progreso |
| 3 | Fase 2: consistencia de ids/nombres/signos, sin marcadores, botón de m1 e insignias | Pendiente |
| 4 | `npm test` y `npm run lint` en verde | Pendiente |
| 5 | PR aprobado e integrado a `main` | Pendiente |

## Decisiones clave
- Los JSON van en `docs/razones_financieras/` (ruta relativa pedida por el documento de instrucciones, dentro del proyecto porque pide ejecutar las pruebas del proyecto).
- Cada archivo es autónomo: catálogo, conjuntos, derivados y reglas completos, aunque se repitan (instrucción explícita; prevalece sobre la especificación, que prefiere un `financial-rules.json` único).
- Convenciones de implementación no resueltas por el documento (literales `{"value": 365}`, refs a otra razón `{"ref": "ratio.<id>", "period": "current_pair"}`, conjuntos `bs.fixed_assets_components` y `bs.noncurrent_liabilities_components`, `parent_group` contextual) documentadas en el reporte final y en `docs/decisiones.md`.

## Archivos que toca
- `docs/razones_financieras/` (nuevo: 20 JSON + `notas/`)
- `docs/planificacion/razones-json-v3/` (esta ficha)
- `docs/planificacion/README.md` (fila de la feature)
- `CHANGELOG.md`, `docs/decisiones.md` (compartidos según `AGENTS.md`)

## Pasos
| # | Paso | Estado |
|---|---|---|
| 00 | Fase 0 — preparación de notas | Completado |
| 01 | Fase 1 — 20 razones: nota, investigación, JSON y check | En progreso |
| 02 | Fase 2 — consistencia y validaciones globales | Pendiente |
| 03 | Fase 3 — reporte final y PR | Pendiente |

## Próximo paso
Completar la Fase 1 (orden 1,2,3,4,5,6,9,10,11,7,8,12..20) y registrar las fuentes en `02_fuentes.md`.
