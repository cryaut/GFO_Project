# 00 — Control de la tarea

## Resumen por razón

| Fase | Estado |
|---|---|
| 0 — preparación | completada |
| 1 — investigación | completada |
| 2 — generación de JSON | completada |
| 3 — validación y cierre | completada |

| N.º | Razón | Archivo JSON | Estado | Avance | Notas |
|---:|---|---|---|---|---|
| 01 | Capital de trabajo neto | `liquidez_capital_trabajo_neto.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/01_liquidez_capital_trabajo_neto.md` ✔ |
| 02 | Razón corriente | `liquidez_razon_corriente.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/02_liquidez_razon_corriente.md` ✔ |
| 03 | Prueba ácida | `liquidez_prueba_acida.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/03_liquidez_prueba_acida.md` ✔ |
| 04 | Margen de utilidad bruta | `rentabilidad_margen_utilidad_bruta.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/04_rentabilidad_margen_utilidad_bruta.md` ✔ |
| 05 | Margen de utilidad operativa | `rentabilidad_margen_utilidad_operativa.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/05_rentabilidad_margen_utilidad_operativa.md` ✔ |
| 06 | Margen de utilidad neta | `rentabilidad_margen_utilidad_neta.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/06_rentabilidad_margen_utilidad_neta.md` ✔ |
| 07 | ROA (rendimiento sobre activos) | `rentabilidad_roa.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/07_rentabilidad_roa.md` ✔ |
| 08 | ROE (rendimiento sobre patrimonio) | `rentabilidad_roe.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/08_rentabilidad_roe.md` ✔ |
| 09 | Razón de deuda total | `endeudamiento_razon_deuda_total.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/09_endeudamiento_razon_deuda_total.md` ✔ |
| 10 | Razón deuda-patrimonio | `endeudamiento_razon_deuda_patrimonio.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/10_endeudamiento_razon_deuda_patrimonio.md` ✔ |
| 11 | Razón de cobertura de interés | `endeudamiento_cobertura_interes.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/11_endeudamiento_cobertura_interes.md` ✔ |
| 12 | Rotación de inventarios | `actividad_rotacion_inventarios.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/12_actividad_rotacion_inventarios.md` ✔ |
| 13 | Edad promedio del inventario | `actividad_edad_promedio_inventario.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/13_actividad_edad_promedio_inventario.md` ✔ |
| 14 | Rotación de cuentas por cobrar | `actividad_rotacion_cuentas_por_cobrar.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/14_actividad_rotacion_cuentas_por_cobrar.md` ✔ |
| 15 | Período promedio de cobro | `actividad_periodo_promedio_cobro.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/15_actividad_periodo_promedio_cobro.md` ✔ |
| 16 | Rotación de cuentas por pagar | `actividad_rotacion_cuentas_por_pagar.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/16_actividad_rotacion_cuentas_por_pagar.md` ✔ |
| 17 | Período promedio de pago | `actividad_periodo_promedio_pago.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/17_actividad_periodo_promedio_pago.md` ✔ |
| 18 | Rotación de activos fijos | `actividad_rotacion_activos_fijos.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/18_actividad_rotacion_activos_fijos.md` ✔ |
| 19 | Rotación de activos totales | `actividad_rotacion_activos_totales.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/19_actividad_rotacion_activos_totales.md` ✔ |
| 20 | Ciclo de conversión de efectivo | `actividad_ciclo_conversion_efectivo.json` | terminada | 20/20 | notas/01–05 ✔ · `ratios/20_actividad_ciclo_conversion_efectivo.md` ✔ |

**Avance final**: 20/20 razones terminadas. Las notas de fase están en `notas/`; cada razón tiene su nota en `ratios/NN_*.md`.

## Notas de fase

- **Fase 0**: decisiones D1–D14 y reglas R1–R5 copiadas en `notas/01_decisiones.md`; tabla de derivados en `notas/04_derivados.md`; estructura y hoja de vida en el resto.
- **Fase 1**: 10 fuentes confirmadas (`notas/02_fuentes.md`), 71 cuentas investigadas (`notas/03_registro_cuentas.md`), 20 notas en `ratios/` y 20 JSON en este directorio.
- **Fase 2**: chequeos en `notas/05_checks.md`: todas las verificaciones OK.
- **Fase 3**: commits nombrados y PR hacia `main`; ver `docs/planificacion/razones-json-v3/README.md`.
