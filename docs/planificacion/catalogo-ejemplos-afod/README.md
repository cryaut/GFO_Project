# Catálogo seleccionable de ejemplos AFOD

- **Estado**: Implementada y verificada; publicación en preparación.
- **Rama**: `codex/catalogo-ejemplos-afod`, creada desde origin/main e incorporando las cuatro entregas locales anteriores, necesarias para los estados resueltos y su motor.
- **Responsable**: Solicitud de Cris, 2026-11-07.

## Objetivo

Sustituir la carga ciega del ejemplo por un panel que permita elegir y conocer su fuente, alcance y unidad. Incorporar ejercicios compatibles del ZIP Ejercicios_AFOD y ejemplos ficticios adicionales. Verificar los resultados y abrir PR con solicitud de revisión a Carlos (`char-lie17`, identidad corroborada en el historial Git y colaborador del repositorio).

## Alcance

Estados, Inicio, Flujo, Equilibrio, Inventario, Planeación, Presupuesto personal y Mercado. Los ejemplos limitados por su enunciado lo dicen antes de cargarse; no se inventan datos para completar razones. Se conservan las funciones de cálculo y persistencia. Se documentan los ejercicios que requieren capacidades todavía no implementadas.

## Checkpoints

| CP | Meta | Estado |
|---|---|---|
| 1 | Catálogo y trazabilidad con las fuentes | Completado |
| 2 | Paneles de selección en todos los puntos de carga | Completado |
| 3 | Cálculos, pruebas y revisión visual | 2169 pruebas; lint sin errores; matriz Edge |
| 4 | PR y solicitud de revisión a Carlos | Pendiente |

## Publicación

La petición actual autoriza publicar esta rama y abrir el PR; reemplaza la restricción anterior de mantener las entregas solo locales. El PR incluirá y explicará las cuatro entregas dependientes sin publicar. El merge queda pendiente de la revisión humana solicitada.

## Evidencias

[Informe final y comparación docente](INFORME-FINAL.md), [fuentes y huellas](fuentes.json), [verificación de cálculos](verificacion-calculos.json) y [verificación visual](verificacion-visual.json). La matriz visual se reproduce con `node docs/planificacion/catalogo-ejemplos-afod/revisar-visual.cjs`, usando Playwright instalado en el entorno de QA o la ruta `GFO_PLAYWRIGHT_PATH`; no es una nueva dependencia del producto.
