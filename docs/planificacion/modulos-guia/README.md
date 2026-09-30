# Módulos obligatorios de la guía del Proyecto Final

- **Estado**: En revisión
- **Responsable**: Carlos
- **Rama**: `feat/modulos-guia`
- **Última actualización**: 2026-09-29

## Objetivo
Cubrir todos los módulos que pide la guía (`docs/contexto/requisitos-proyecto-final-gfo.md`) con cálculos correctos, integrados entre sí y con interpretación. Primero lo obligatorio; el valor agregado se planifica en el paso 02.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Brechas contra la guía y veredicto de `razones-financieras-v3` | Completado |
| 2 | Inventario básico (`#/inventario`) | Completado |
| 3 | Punto de equilibrio y C-V-U (`#/equilibrio`) | Completado |
| 4 | Flujo de efectivo por actividades (`#/flujo`) | Completado |
| 5 | Presupuesto maestro (`#/planeacion`) | Completado |
| 6 | Proforma y reporte integrado (`#/proforma`) | Completado |
| 7 | Presupuesto personal completo (ingresos, capacidad de ahorro, `escapeHTML`) | Completado |
| 8 | Pendientes de otras áreas: razones de mercado, demo coherente y `razones-financieras-v3` integrada con sus dos correcciones | Completado |
| 9 | `npm test` (310 en verde), `npm run lint` (0 errores) y prueba en navegador de todas las rutas | Completado |

## Decisiones clave
- Los módulos nuevos siguen el patrón de apalancamiento: `<modulo>-calculations.js` puro, `<modulo>-ui.js` y un `index.js` que lee el `store`.
- Las fórmulas genéricas nuevas van al final de `calculate.js` y devuelven `null` (N/D) si falta un dato.
- Decisiones discutibles: D-010 a D-016 en `docs/decisiones.md`.
- Los ejemplos forman un caso ficticio coherente de MUNO MODA 2025 que se comprueba entre módulos.

## Archivos que toca
Nuevos: `js/modules/{inventario,equilibrio,flujo,planeacion,proforma}/`, `js/utils/form.js`, `js/utils/estados-guardados.js`, seis archivos de tests y `tests/unit/helpers/dom-falso.js`.
Compartidos (se agregó al final, sin reordenar): `js/utils/calculate.js`, `js/utils/format.js`, `js/store.js` (claves nuevas en `defaultData`), `js/app.js`, `index.html`, `CHANGELOG.md`, `docs/api.md`, `docs/contexto/*.md`, `docs/decisiones.md`, `docs/manual-usuario.md`.
De otras áreas: `js/modules/presupuesto/index.js` (sin responsable asignado) y una línea de `js/modules/analisis/index.js` (exportar `refreshSavedStates`, idéntica a la de `razones-financieras-v3`).

## Pasos
| # | Paso | Estado |
|---|---|---|
| 00 | [Brechas, veredicto de v3 y prioridades](00-brechas-y-prioridades.md) | Completado |
| 01 | [Especificación de los módulos obligatorios](01-modulos-obligatorios.md) | Completado |
| 02 | [Valor agregado](02-valor-agregado.md) | Pendiente |

## Próximo paso
Revisión del PR por otra persona del equipo. Después, elegir las mejoras del paso 02.
