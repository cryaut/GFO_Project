# Estados financieros: cálculo robusto (R1-R2)

- **Estado**: En revisión
- **Responsable**: Cris Lumbi (asistencia del agente)
- **Rama**: `feat/estados-calculo-robusto`
- **Última actualización**: 2026-10-30

## Objetivo
Que el módulo de Estados deje de producir cifras incorrectas sin avisar: convención de signos, totales reportados, datos exigidos por el catálogo, ventas netas y selección de periodos visibles. Es el primer módulo de la lista de reparación; encargo en `instrucciones_carlos_estados_R1-R2.md`.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | R1: cálculo y entrada (tareas R1-1 a R1-6, decisiones D-061 a D-064) | Completado |
| 2 | R2: periodos, pruebas y verificación (D-065, casos 1-10, triangulación, regresión) | Completado |
| 3 | R2-5: batería de 15 conjuntos contra la rama | Pendiente (los archivos no están en el repo) |

## Decisiones clave
- D-061 a D-065 registradas en `docs/decisiones.md` (signos, total reportado, ausencia según catálogo, ventas netas, selección de periodos).

## Archivos que toca
`js/modules/estados/` (catálogo, cálculos, normalización, registro, interfaz), `js/modules/estados/index.js` (demostración), pruebas unitarias de Estados y de los módulos que consumen estados. Compartidos de `AGENTS.md` afectados: `estados-calculations.js`.

## Pasos
| # | Paso | Estado |
|---|---|---|
| 00 | R1-1 a R1-4: total reportado, identidad única, signos, datos exigidos | Completado |
| 01 | R1-5 y R1-6: ventas netas y diagnóstico del cuadre | Completado |
| 02 | R2-1: selector de periodos (D-065) | Completado |
| 03 | R2-2 y R2-3: casos 1-10 y triangulación | Completado |
| 04 | R2-4: regresión completa (test y lint en verde) | Completado |
| 05 | R2-5: batería de 15 conjuntos | Pendiente |

## Próximo paso
Abrir el PR hacia `main` con revisor distinto del autor. La batería de 15 conjuntos queda pendiente hasta que sus archivos estén disponibles; no se inventan datos. Al integrar, `feat/razones-app-final` se actualiza con merge de main (nunca rebase).
