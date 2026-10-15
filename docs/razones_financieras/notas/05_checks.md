# 05 — Checks

## Valores calculados vs tabla del documento (Fase 1e)

Formato de cada celda: *calculado / esperado*.

| N.º | Razón | m1 off (2023) | m1 on (2023) | 2024 | Resultado |
|---:|---|---|---|---|---|
| 1 | Capital de trabajo neto | `210,000` / `210,000` | `210,000` / `210,000` | `237,000` / `237,000` | OK |
| 2 | Razón corriente | `2.31` / `2.31` | `2.31` / `2.31` | `2.35` / `2.35` | OK |
| 3 | Prueba ácida | `1.19` / `1.19` | `1.19` / `1.19` | `1.24` / `1.24` | OK |
| 4 | Margen de utilidad bruta | `40.00 %` / `40.00 %` | `40.00 %` / `40.00 %` | `40.76 %` / `40.76 %` | OK |
| 5 | Margen de utilidad operativa | `15.88 %` / `15.88 %` | `15.88 %` / `15.88 %` | `16.85 %` / `16.85 %` | OK |
| 6 | Margen de utilidad neta | `10.49 %` / `10.49 %` | `10.49 %` / `10.49 %` | `11.39 %` / `11.39 %` | OK |
| 7 | ROA (rendimiento sobre activos) | `N/D` / `N/D` | `11.13 %` / `11.13 %` | `12.89 %` / `12.89 %` | OK |
| 8 | ROE (rendimiento sobre patrimonio) | `N/D` / `N/D` | `17.23 %` / `17.23 %` | `19.06 %` / `19.06 %` | OK |
| 9 | Razón de deuda total | `35.42 %` / `35.42 %` | `35.42 %` / `35.42 %` | `29.45 %` / `29.45 %` | OK |
| 10 | Razón deuda-patrimonio | `0.55` / `0.55` | `0.55` / `0.55` | `0.42` / `0.42` | OK |
| 11 | Razón de cobertura de interés | `10.71` / `10.71` | `10.71` / `10.71` | `13.78` / `13.78` | OK |
| 12 | Rotación de inventarios | `N/D` / `N/D` | `2.83` / `2.83` | `2.91` / `2.91` | OK |
| 13 | Edad promedio del inventario | `N/D` / `N/D` | `128.82` / `128.82` | `125.57` / `125.57` | OK |
| 14 | Rotación de cuentas por cobrar | `N/D` / `N/D` | `N/D` / `N/D` | `N/D` / `N/D` | OK |
| 15 | Período promedio de cobro | `N/D` / `N/D` | `N/D` / `N/D` | `N/D` / `N/D` | OK |
| 16 | Rotación de cuentas por pagar | `N/D` / `N/D` | `N/D` / `N/D` | `N/D` / `N/D` | OK |
| 17 | Período promedio de pago | `N/D` / `N/D` | `N/D` / `N/D` | `N/D` / `N/D` | OK |
| 18 | Rotación de activos fijos | `N/D` / `N/D` | `1.97` / `1.97` | `2.18` / `2.18` | OK |
| 19 | Rotación de activos totales | `N/D` / `N/D` | `1.06` / `1.06` | `1.13` / `1.13` | OK |
| 20 | Ciclo de conversión de efectivo | `N/D` / `N/D` | `N/D` / `N/D` | `N/D` / `N/D` | OK |

**Conteos**: m1 off → 9 con valor y 11 N/D (esperado: 9 con valor y 11 N/D); m1 on → 15 con valor y 5 N/D (esperado: 15 con valor y 5 N/D); 2024 → 15 con valor y 5 N/D (esperado: 15 con valor y 5 N/D).

## Diferencias conocidas con la solución del profesor (confirmadas en el documento)

| Razón | Periodo | Solución del profesor | Este documento | Comentario |
|---|---|---|---|---|
| 7 ROA (rendimiento sobre activos) | 2024 | `12.70 %` | `12.89 %` | comentario en esta prueba; por confirmar con el profesor |
| 8 ROE (rendimiento sobre patrimonio) | 2024 | `18.00 %` | `19.06 %` | comentario en esta prueba; por confirmar con el profesor |
| 12 Rotación de inventarios | 2024 | `2.79` | `2.91` | comentario en esta prueba; por confirmar con el profesor |
| 13 Edad promedio del inventario | 2024 | `130.60` | `125.57` | comentario en esta prueba; por confirmar con el profesor |
| 14 Rotación de cuentas por cobrar | 2023 y 2024 | `7.08 y 6.81` | `N/D (falta ventas a crédito)` | comentario en esta prueba; por confirmar con el profesor |
| 15 Período promedio de cobro | 2023 y 2024 | `51.53 y 53.56` | `N/D (falta ventas a crédito)` | comentario en esta prueba; por confirmar con el profesor |
| 18 Rotación de activos fijos | 2024 | `2.22` | `2.18` | comentario en esta prueba; por confirmar con el profesor |
| 19 Rotación de activos totales | 2024 | `1.11` | `1.13` | comentario en esta prueba; por confirmar con el profesor |

Motivos: D1 exige denominador promedio para ROA/ROE/rotaciones (el profesor usó saldos de cierre en 2024); D8 prohíbe aproximar ventas a crédito con ventas totales o netas (el profesor las aproximó). Estas diferencias están por confirmar con el profesor.

## Ecuación contable (caso, calculada por el generador)

| Periodo | Activos totales | Pasivos + patrimonio | Resultado |
|---|---|---|---|
| 2023 | `801,475` | `283,860` + `517,615` | cuadra |
| 2024 | `825,525` | `243,085` + `582,440` | cuadra |

## Chequeos de consistencia (Fase 2 y verificaciones)

| Verificación | Resultado | Detalle |
|---|---|---|
| JSON válidos | OK | 20/20 parseados |
| Marcadores prohibidos en los 20 JSON | OK | ninguno |
| DECISION_PENDIENTE solo en metadata.research_notes | OK | correcto |
| Todos los id referenciados están definidos | OK | correcto |
| Identidad de cuentas entre archivos (id/nombre/clasificación/signo) | OK | 71 cuentas con identidad única |
| Botón de m1: 11 razones de flujo con default false; 9 de punto sin toggle | OK | 11 flujo / 9 punto |
| research.status válido y 1–3 fuentes confirmadas por cuenta | OK | correcto |
| Metadatos igual a la tabla y operadores de la lista permitida | OK | correcto |
| 40 celdas del caso iguales a la tabla del documento | OK | 40/40 OK |
| Conteos de celdas con valor y N/D | OK | m1 off: 9 con valor y 11 N/D (esperado 9 con valor y 11 N/D); m1 on: 15 con valor y 5 N/D (esperado 15 con valor y 5 N/D); 2024: 15 con valor y 5 N/D (esperado 15 con valor y 5 N/D) |
| Cada resultado no N/D declara método e insignia | OK | correcto |
| Ecuación contable activos = pasivos + patrimonio | OK | 2023: 801,475 = 283,860 + 517,615 ; 2024: 825,525 = 243,085 + 582,440 |
