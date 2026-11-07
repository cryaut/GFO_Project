# Proforma y presupuesto: procedimiento visible

- Estado: Implementada y verificada; entrega local, sin push ni PR.
- Rama: `codex/proforma-presupuesto-docente`, creada desde origin/main e incorporando el commit local dc4d96b de Estados resueltos.
- Fuente nueva: `../TEAM.md/Ejercicios_AFOD.zip` y 16 Markdown extraídos en `../TEAM.md/Ejercicios_AFOD/`.
- SHA-256 del ZIP: `6fd39159eaca96013eda5f49b3ccd031c63e01eb0f37c4fcf5b84bcddbd552c4`.

## Revisión previa

Proforma omite UAI y la sustitución de operandos. El resumen de Planeación abre con cobros/pagos y saldos, y oculta ER/caja en Tablas completas. El modelo completo calcula los resultados, pero el caso Comercial Ejemplo es parcial según D-090 y no tiene todavía ER/caja. Deben distinguirse, sin mostrar un cero o un resultado ficticio.

Fuentes principales: Ejercicios E.R proformas (Euro Designs, Metroline y Leonard); La_Pinolera_1_y_2_Enunciados; Ejercicio Halley. Las dos primeras son enunciados sin soluciones; Halley declara una reconstrucción y escala inferida. Se conservan como fuentes, no como instrucciones al agente ni como resultados ya verificados.

## Alcance

Mostrar resultado y caja completos cuando el presupuesto ya los calcula, con procedimiento del horizonte y del periodo. Completar UAI en Proforma, distinguir sus fuentes y explicar IR devengado/pagado y financiamiento informado. Mantener independientes los escenarios parciales, sus resultados disponibles, borradores y N/D. No introducir métodos docentes nuevos ni cambiar fórmulas, calendarios, tasas o persistencia para forzar coincidencias. Documentar los métodos por porcentaje de ventas, fijo/variable, balance crítico y pagos de impuestos por fecha que aún no implementa el modelo actual.

## Entrega y validación

[Revisión docente, hallazgos, referencias y pendientes](REVISION-DOCENTE.md). D-097 registra la fuente coherente del real y la presentación del desarrollo. Se incluyen `verificar_referencias.py` y `referencias.json`; sus resultados independientes no son soluciones originales del ZIP ni nuevas funciones de la app.

- **2125/2125 pruebas en 69 archivos**, 10 regresiones nuevas respecto de la rama anterior. Lint: **0 errores y 10 advertencias existentes**. Diff sin errores de espacios.
- La regresión de gastos operativos por id falló antes de corregirse. Casos de cero, dato ausente, UAI independiente del impuesto y otros ingresos operativos mantienen la lectura de Estados/Razones.
- Edge: **24 escenarios** (completo/parcial × Planeación/Proforma × 1440/390/320 px × claro/oscuro), sin errores de página ni desbordamiento global. Capturas de escritorio y de cálculos/resultados en móvil inspeccionadas. Consultar tarjetas, periodo y rutas no escribe el store.
- Script: `node docs/planificacion/proforma-presupuesto-docente/revisar-visual.cjs`; `--antes` reproduce el resumen anterior sin UAI sobre `dc4d96b`. Usa Edge y Playwright del runtime existente; servidor/perfiles desechables se cierran. Se detienen transiciones solo durante la medición para evitar medir un viewport en animación.
- Rama y commit exclusivamente locales. Conserva el trabajo previo de Estados resueltos y los documentos pendientes; sin push ni PR.
