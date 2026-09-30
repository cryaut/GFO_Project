# 02 — Valor agregado (después de lo obligatorio)

- **Estado**: Pendiente
- **Fecha**: 2026-09-29
- **Depende de**: 01 y los pendientes obligatorios del checkpoint 8

## Objetivo
Proponer mejoras que suban la nota sin arriesgar lo obligatorio. El criterio es lo que la guía evalúa: integración entre módulos, interpretación, un caso completo comprobable y una defensa donde cualquiera cambia un dato y explica el efecto.

## Antes del valor agregado: pendientes obligatorios de otras áreas
Resueltos en `feat/modulos-guia`: razones de mercado (pestaña Mercado de Análisis), demo de MUNO MODA que cuadra con intereses, IR y dividendos, e integración de `razones-financieras-v3` con sus dos correcciones.

## Propuestas priorizadas
| # | Mejora | Valor para la evaluación | Esfuerzo | Toca áreas de otros |
|---|---|---|---|---|
| 1 | **Caso integrado de un clic** en Inicio: carga estados, clasificación, inventario, C-V-U, flujo, presupuestos y presupuesto personal; y `docs/caso-integrado.md` con la comprobación manual de cada cifra | Alto: es la evidencia de "Resultados" y del anexo de cálculos | Bajo | No |
| 2 | **Balance general proforma** con los saldos al cierre del presupuesto y el financiamiento externo requerido como cifra de ajuste (Gitman) | Alto: completa los "estados proforma" | Medio | No |
| 3 | **Flujo de efectivo desde los estados** (indirecto, tres actividades) y un solo EFE con Análisis | Alto: integración y una sola cifra de operación | Medio | Sí (Henry) |
| 4 | **Compras sugeridas desde Inventario**: usar los faltantes de reposición como supuesto del presupuesto de compras | Medio: la integración inventario → compras que sugiere la guía | Bajo | No |
| 5 | **Sensibilidad C-V-U**: deslizadores de precio, costo y volumen y gráfico de tornado (qué variable mueve más la UAII) | Medio: apoya "modificar un dato y explicar el efecto" | Bajo | No |
| 6 | **Dashboard** con KPIs de los módulos nuevos y accesos directos | Medio: la guía recomienda un panel principal | Bajo | Sí (Cris) |
| 7 | **Reporte imprimible con portada** (sistema, integrantes, docente, grupo, fecha) y estilos de impresión | Medio: capturas y anexos para el informe | Bajo | No |
| 8 | Inventario con costo promedio ponderado, punto de reorden (demanda × tiempo de entrega + stock de seguridad) y rotación por producto | Bajo a medio | Medio | No |
| 9 | Presupuesto maestro con varios productos, cobranza en dos periodos y pago del IR | Bajo a medio | Alto | No |
| 10 | Prueba de humo en navegador (el script CDP de esta revisión) como comando del proyecto | Bajo para la nota, alto para no romper nada | Bajo | No |

## Recomendación
Hacer 1, 2 y 4 primero: son bajos en riesgo, no dependen de otras personas y refuerzan lo que se evalúa. El 3 y el 6 conviene acordarlos con Henry y Cris. Del 8 al 10, solo si queda tiempo.

## Checkpoint
- [ ] El equipo elige qué mejoras hacer y en qué orden.
- [ ] Cada mejora elegida tiene su paso en esta carpeta antes de empezar.

## Próximo paso
Elegir en equipo las mejoras y empezar por la 1.
