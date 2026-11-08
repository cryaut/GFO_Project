# Estados resueltos y presentación docente

- **Estado**: Implementada y verificada localmente. Entrega exclusivamente local, sin push ni PR.
- **Rama**: `codex/estados-resueltos-docente`, creada desde `origin/main` (`19c5c6f`).
- **Solicitud**: mostrar los estados completos y ordenados, calculando subtotales ausentes con los datos disponibles y conservando N/D.

## Revisión previa a los cambios

| Fuente docente | Evidencia | Aplicación |
|---|---|---|
| Estados Financieros Basicos, diaps. 2, 6–9 | Resultados, efectivo y balance conectados; gastos entre paréntesis; Activos = Pasivos + Patrimonio | Conservar signos; completar subtotales del balance y ER sin inventar movimientos |
| GFO_Presentacion_Sesion3_Costo_Ventas_Gastos_Estado_Resultados, diaps. 21–25 | Ventas, costo de ventas, utilidad bruta, gastos operativos, utilidad operativa, intereses, utilidad antes de ISR, ISR y utilidad neta | Colocar cada resultado dentro de la secuencia, incluida utilidad bruta en Estados |
| Analisis_apalancamiento_y_C-V-U, diaps. 4–7 | Etiquetas UAII, UAI y UDII; costos variables/fijos corresponden a otro enfoque | Mostrar «Utilidad operativa (UAII)» y «Utilidad antes de impuestos (UAI)» sin sustituir costo de ventas por margen de contribución |
| Estados_financieros_proforma, diaps. 9–10 | Vectra: UB 20000, UAII 10000, UAI 9000, UN 7650; balance por corrientes/fijos y pasivos/patrimonio | Ordenar conservando detalle y nombre propio; reportados y calculados no se suman de nuevo |
| Flujo_Efectivo_GFO_2026, diaps. 7–17 | Operación, inversión, financiamiento; variación neta e inicial + variación = final | Conservar secciones y cálculos existentes; presentar la secuencia final y los signos con claridad |

Las fuentes se leyeron antes de editar la app. Son transcripciones de la carpeta docente `../TEAM.md/PRESENTACIONES_AFOD/PRESENTACIONES_AFOD/`; las diapositivas sin texto suficiente no permiten deducir detalles de formato. El EFE oficial sigue sin compararse con el ejemplo completo de clase por falta de BG/ER. No se crean movimientos de patrimonio o efectivo a partir de omisiones.

## Implementación completada

1. Composición pura de filas resueltas reutilizable por Estados y AH/AV, sin escribir en el store ni modificar el documento importado.
2. Detalle íntegro, subtotales en su lugar y nombres originales. Identidad por id/tipo, nunca por nombre fijo.
3. Subtotales de balance desde computeFinancialTotals; derivados del ER desde las consultas existentes del motor. UAI compone operandos acreditados, sin tasa supuesta; N/D se propaga.
4. Distinguir visualmente dato reportado, cálculo disponible y dato pendiente. No duplicar un subtotal ya importado.
5. Regresiones y navegador en escritorio/móvil y ambos temas; verificar que guardar/exportar conserva las cuentas originales.

## Fuera de alcance

Motor y generado, JSON de razones, fórmulas/convenciones aprobadas, tasas automáticas, AFOD R2, migraciones y reconstrucción de un estado de cambios de patrimonio que no tiene captura propia. No se publica ni integra esta rama.

## Comprobaciones

[Comparación detallada, cambios y límites](COMPARACION.md). Decisión D-096. El defecto original se reprodujo en navegador usando JS/CSS del main inicial fijado, antes de comprobar la rama nueva. Pasan las regresiones de subtotales, N/D, originales y lectura; la comprobación final de suite/lint se registra al cerrar.

Script de navegador: `node docs/planificacion/estados-resueltos-docente/revisar-visual.cjs`; añadir `--antes` reproduce el defecto en la base fijada. Usa Edge y Playwright del runtime existente (`GFO_PLAYWRIGHT_PATH` permite otra instalación), sin dependencias nuevas. Capturas y JSON quedan ignorados. 30 escenarios: Estados, AH, AV, EOAF y EFE × 1440/390/320 px × claro/oscuro. Sin errores de página ni desbordamiento global; edición conserva foco, borrar impuesto mantiene UAI y deja UN N/D; guardar/exportar mantiene el JSON original y navegar no escribe.

## Resultado final

- Suite completa: **2115/2115 pruebas en 68 archivos**, sin fallos (19 pruebas nuevas respecto del main inicial).
- Lint: **0 errores y 10 advertencias existentes**; `git diff --check` limpio.
- Edge: **30 escenarios**, sin errores de página ni desbordamiento global. Capturas de escritorio y móvil oscuro inspeccionadas.
- Se reprodujo el defecto de UB ausente en la base inicial; también falló antes de corregirse la regresión de base de AV con ingresos operativos por id.
- Motor, generado, JSON de razones, datos del profesor y store sin cambios. Ninguna dependencia nueva.
- Entrega solo local: rama nueva desde `origin/main`, con commit revisable; **sin push, sin PR y sin merge**. La publicación/integración queda pendiente de la verificación que solicitó Cris.
