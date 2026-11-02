# Estados financieros — Reporte ronda 2 (última)

- **Fecha**: 2026-10-30
- **Rama**: [`feat/estados-calculo-robusto`](https://github.com/cryaut/GFO_Project/tree/feat/estados-calculo-robusto), base `84cbd31`, head de partida `2e59875` (ronda 1 completa).
- **Encargo**: `instrucciones_estados_ronda2_ultima.md`. Esta es la última ronda de Estados; lo no resuelto queda reportado como pendiente.

## 1. Commits y qué cambió en cada uno

| SHA | Tarea | Commit | Qué cambió |
|---|---|---|---|
| `aee6c09` | T1 | `docs: atribuye los ceros de dos fixtures a D-060 caso 1` | Solo el reporte de la ronda 1: la causa de dos filas de la tabla de pruebas pasa de D-062 a D-060 caso 1, con nota sobre dónde está definida D-060. Ninguna prueba ni valor cambió. |
| `d61a742` | T2 | `test: triangula el balance por componentes sin subtotales reportados` | `tests/unit/estados-triangulacion.test.js`: la entrada de la triangulación se extrae a una constante (las pruebas previas quedan iguales) y se agrega el caso sin «Total de activos corrientes» ni «Total de pasivos corrientes». Los doce valores salen de los detalles. |
| `2d0b3ee` | T3 | `test: fija el comportamiento de las columnas genéricas al importar` | `tests/unit/estados-import.test.js`: nuevo describe con los casos (a) y (b) de las columnas genéricas, más el import de `computeFinancialTotals`. |
| `a34d394` | T4 | `test: agrega la batería de 15 conjuntos (referencia, adversariales y periodos)` | Nuevo `tests/unit/estados-bateria.test.js` (bloques A, B y C), el archivo de referencia copiado a `tests/unit/fixtures/estados_ronda2_bloque_A.json`, y una prueba de interfaz nueva en `estados-formato-ui.test.js` para C3 (el selector ofrece las cinco casillas). |
| *este commit* | T5 | `docs: agrega el reporte final de la ronda 2` | Este archivo. |

Ronda 1 completa: 11 commits (10 de trabajo y el commit del reporte), 1217 pruebas en verde al cierre.

## 2. T1 a T3

**T1 — Atribución corregida** en `estados-R1-R2-reporte.md` (sección 3, tabla de pruebas cambiadas):

| Prueba | Causa antes | Causa después |
|---|---|---|
| `cuentas-revision.test.js` — «los 5000 pendientes corrientes solo anulan sus totales posibles…» (ER con `'Costo de Ventas': 0`) | D-062 | **D-060 caso 1** (completar entradas con ceros explícitos; el esperado no cambia) |
| `razones-mercado.test.js` — fixture de mercado (ER con `'Costo de Ventas': 0`) | D-062 | **D-060 caso 1** |

Nota: D-060 está definida en el encargo de la ronda 19 de razones (`instrucciones_carlos_ronda19.md`, «Cambios permitidos en pruebas antiguas al conectar el motor»); no está en `docs/decisiones.md` porque su registro corresponde a la rama `feat/razones-app-final`. Ningún valor esperado cambió con esta corrección.

**T2 — Triangulación por componentes** (`tests/unit/estados-triangulacion.test.js`): el mismo balance sin los dos subtotales reportados. Todos los valores coinciden; no fue necesario detenerse.

| Campo | Esperado | Obtenido |
|---|---|---|
| activosCorrientes | 300 | 300 |
| activosFijos | 240 | 240 |
| totalActivos | 540 | 540 |
| pasivosCorrientes | 90 | 90 |
| totalPasivos | 190 | 190 |
| totalPatrimonio | 350 | 350 |
| ventas (netas) | 480 | 480 |
| utilidadBruta | 280 | 280 |
| utilidadNeta | 150 | 150 |
| razón corriente | 3.33 | 3.3333… (300/90; diferencia 0.0033 ≤ 0.01) |
| motivos | ninguno | ninguno |
| cuadre | 540 = 190 + 350 | equilibrado, diferencia 0 |

**T3 — Columnas genéricas en CSV** (`tests/unit/estados-import.test.js`). Desde la ronda 1, «Ventas», «Costo de Ventas» e «Inventario» se reconocen como totales reportados al importar y se guardan en `reportedTotals`. La prueba fija el comportamiento en los dos casos pedidos:

| Caso | Entrada | Esperado | Obtenido |
|---|---|---|---|
| (a) solo la columna genérica | CSV con Ventas 920000, Costo de Ventas 545000, Inventario 120 y balance mínimo | Los valores no cambian: quedan como totales reportados y los totales calculados los muestran igual; sin avisos de descuadre | `reportedTotals` con `is.sales_total` 920000, `is.cost_of_sales_reported` 545000 y `bs.inventory_total` 120; `ventasBrutas` 920000, `costoVentas` 545000, `inventario` 120; sin `reported_subtotal_mismatch` |
| (b) columna genérica con detalles que no suman | CSV con Ventas 1000 (genérica) y Ventas de Productos 800 (detalle) | Aviso de diferencia y gana el reportado | `ventasBrutas` 1000 (manda el reportado); `reported_subtotal_mismatch` con diferencia 200 |

El comportamiento no se revirtió. Las ventas netas de esos importes siguen la regla D-063: sin deducciones declaradas ni ventas netas reportadas, `ventas`, `utilidadBruta` y `utilidadNeta` son N/D con motivo `missing_required_account_data`.

## 3. Batería de 15 conjuntos (T4)

La batería vive en `tests/unit/estados-bateria.test.js` y se ejecuta con la suite. Comparación con **tolerancia 0.01**. Cada periodo del bloque A también verifica el cuadre (activos = pasivos + patrimonio) y que no queden motivos pendientes. La razón corriente se calcula con los totales de la app (activos corrientes / pasivos corrientes de `computeFinancialTotals`) y se compara con la del archivo.

### Bloque A — balances de referencia (A1 a A5)

Comparación contra el **cálculo de referencia del archivo** (`estados_ronda2_bloque_A.json`, copiado a `tests/unit/fixtures/`): son balances construidos para la batería, no estados de empresas reales, y sus esperados fueron calculados fuera de la app por la sesión de revisión, tal como declara la nota del propio archivo.

Resultado: **14 periodos, 168 campos, 0 diferencias, 14 cuadres, 0 motivos pendientes.** Un valor alterado a propósito (total de activos +1 en A1) sí falla la comparación — prueba incluida en el archivo de la batería.

| Conjunto | Periodo | Campo | Esperado | Obtenido | Diferencia | Motivo | Resultado |
|---|---|---|---|---|---|---|---|
| A1 | 2024 | activosCorrientes | 522 | 522 | 0 | — | pasa |
| A1 | 2024 | activosFijos | 504 | 504 | 0 | — | pasa |
| A1 | 2024 | totalActivos | 1026 | 1026 | 0 | — | pasa |
| A1 | 2024 | pasivosCorrientes | 198 | 198 | 0 | — | pasa |
| A1 | 2024 | totalPasivos | 396 | 396 | 0 | — | pasa |
| A1 | 2024 | totalPatrimonio | 630 | 630 | 0 | — | pasa |
| A1 | 2024 | ventasBrutas | 900 | 900 | 0 | — | pasa |
| A1 | 2024 | ventas | 864 | 864 | 0 | — | pasa |
| A1 | 2024 | costoVentas | 504 | 504 | 0 | — | pasa |
| A1 | 2024 | utilidadBruta | 360 | 360 | 0 | — | pasa |
| A1 | 2024 | utilidadNeta | 99 | 99 | 0 | — | pasa |
| A1 | 2024 | razonCorriente | 2.64 | 2.64 | 0.0036 | — | pasa |
| A1 | 2025 | activosCorrientes | 580 | 580 | 0 | — | pasa |
| A1 | 2025 | activosFijos | 560 | 560 | 0 | — | pasa |
| A1 | 2025 | totalActivos | 1140 | 1140 | 0 | — | pasa |
| A1 | 2025 | pasivosCorrientes | 220 | 220 | 0 | — | pasa |
| A1 | 2025 | totalPasivos | 440 | 440 | 0 | — | pasa |
| A1 | 2025 | totalPatrimonio | 700 | 700 | 0 | — | pasa |
| A1 | 2025 | ventasBrutas | 1000 | 1000 | 0 | — | pasa |
| A1 | 2025 | ventas | 960 | 960 | 0 | — | pasa |
| A1 | 2025 | costoVentas | 560 | 560 | 0 | — | pasa |
| A1 | 2025 | utilidadBruta | 400 | 400 | 0 | — | pasa |
| A1 | 2025 | utilidadNeta | 110 | 110 | 0 | — | pasa |
| A1 | 2025 | razonCorriente | 2.64 | 2.64 | 0.0036 | — | pasa |
| A2 | 2023 | activosCorrientes | 440 | 440 | 0 | — | pasa |
| A2 | 2023 | activosFijos | 192 | 192 | 0 | — | pasa |
| A2 | 2023 | totalActivos | 632 | 632 | 0 | — | pasa |
| A2 | 2023 | pasivosCorrientes | 204 | 204 | 0 | — | pasa |
| A2 | 2023 | totalPasivos | 444 | 444 | 0 | — | pasa |
| A2 | 2023 | totalPatrimonio | 188 | 188 | 0 | — | pasa |
| A2 | 2023 | ventasBrutas | 640 | 640 | 0 | — | pasa |
| A2 | 2023 | ventas | 640 | 640 | 0 | — | pasa |
| A2 | 2023 | costoVentas | 336 | 336 | 0 | — | pasa |
| A2 | 2023 | utilidadBruta | 304 | 304 | 0 | — | pasa |
| A2 | 2023 | utilidadNeta | 54 | 54 | 0 | — | pasa |
| A2 | 2023 | razonCorriente | 2.16 | 2.16 | 0.0031 | — | pasa |
| A2 | 2024 | activosCorrientes | 495 | 495 | 0 | — | pasa |
| A2 | 2024 | activosFijos | 216 | 216 | 0 | — | pasa |
| A2 | 2024 | totalActivos | 711 | 711 | 0 | — | pasa |
| A2 | 2024 | pasivosCorrientes | 230 | 230 | 0 | — | pasa |
| A2 | 2024 | totalPasivos | 500 | 500 | 0 | — | pasa |
| A2 | 2024 | totalPatrimonio | 211 | 211 | 0 | — | pasa |
| A2 | 2024 | ventasBrutas | 720 | 720 | 0 | — | pasa |
| A2 | 2024 | ventas | 720 | 720 | 0 | — | pasa |
| A2 | 2024 | costoVentas | 378 | 378 | 0 | — | pasa |
| A2 | 2024 | utilidadBruta | 342 | 342 | 0 | — | pasa |
| A2 | 2024 | utilidadNeta | 61 | 61 | 0 | — | pasa |
| A2 | 2024 | razonCorriente | 2.15 | 2.15 | 0.0022 | — | pasa |
| A2 | 2025 | activosCorrientes | 550 | 550 | 0 | — | pasa |
| A2 | 2025 | activosFijos | 240 | 240 | 0 | — | pasa |
| A2 | 2025 | totalActivos | 790 | 790 | 0 | — | pasa |
| A2 | 2025 | pasivosCorrientes | 255 | 255 | 0 | — | pasa |
| A2 | 2025 | totalPasivos | 555 | 555 | 0 | — | pasa |
| A2 | 2025 | totalPatrimonio | 235 | 235 | 0 | — | pasa |
| A2 | 2025 | ventasBrutas | 800 | 800 | 0 | — | pasa |
| A2 | 2025 | ventas | 800 | 800 | 0 | — | pasa |
| A2 | 2025 | costoVentas | 420 | 420 | 0 | — | pasa |
| A2 | 2025 | utilidadBruta | 380 | 380 | 0 | — | pasa |
| A2 | 2025 | utilidadNeta | 68 | 68 | 0 | — | pasa |
| A2 | 2025 | razonCorriente | 2.16 | 2.16 | 0.0031 | — | pasa |
| A3 | 2024 | activosCorrientes | 828 | 828 | 0 | — | pasa |
| A3 | 2024 | activosFijos | 902 | 902 | 0 | — | pasa |
| A3 | 2024 | totalActivos | 1730 | 1730 | 0 | — | pasa |
| A3 | 2024 | pasivosCorrientes | 396 | 396 | 0 | — | pasa |
| A3 | 2024 | totalPasivos | 893 | 893 | 0 | — | pasa |
| A3 | 2024 | totalPatrimonio | 837 | 837 | 0 | — | pasa |
| A3 | 2024 | ventasBrutas | 1840 | 1840 | 0 | — | pasa |
| A3 | 2024 | ventas | 1748 | 1748 | 0 | — | pasa |
| A3 | 2024 | costoVentas | 1196 | 1196 | 0 | — | pasa |
| A3 | 2024 | utilidadBruta | 552 | 552 | 0 | — | pasa |
| A3 | 2024 | utilidadNeta | 98 | 98 | 0 | — | pasa |
| A3 | 2024 | razonCorriente | 2.09 | 2.09 | 0.0009 | — | pasa |
| A3 | 2025 | activosCorrientes | 900 | 900 | 0 | — | pasa |
| A3 | 2025 | activosFijos | 980 | 980 | 0 | — | pasa |
| A3 | 2025 | totalActivos | 1880 | 1880 | 0 | — | pasa |
| A3 | 2025 | pasivosCorrientes | 430 | 430 | 0 | — | pasa |
| A3 | 2025 | totalPasivos | 970 | 970 | 0 | — | pasa |
| A3 | 2025 | totalPatrimonio | 910 | 910 | 0 | — | pasa |
| A3 | 2025 | ventasBrutas | 2000 | 2000 | 0 | — | pasa |
| A3 | 2025 | ventas | 1900 | 1900 | 0 | — | pasa |
| A3 | 2025 | costoVentas | 1300 | 1300 | 0 | — | pasa |
| A3 | 2025 | utilidadBruta | 600 | 600 | 0 | — | pasa |
| A3 | 2025 | utilidadNeta | 105 | 105 | 0 | — | pasa |
| A3 | 2025 | razonCorriente | 2.09 | 2.09 | 0.003 | — | pasa |
| A4 | 2024 | activosCorrientes | 263 | 263 | 0 | — | pasa |
| A4 | 2024 | activosFijos | 605 | 605 | 0 | — | pasa |
| A4 | 2024 | totalActivos | 868 | 868 | 0 | — | pasa |
| A4 | 2024 | pasivosCorrientes | 209 | 209 | 0 | — | pasa |
| A4 | 2024 | totalPasivos | 440 | 440 | 0 | — | pasa |
| A4 | 2024 | totalPatrimonio | 428 | 428 | 0 | — | pasa |
| A4 | 2024 | ventasBrutas | 550 | 550 | 0 | — | pasa |
| A4 | 2024 | ventas | 544 | 544 | 0 | — | pasa |
| A4 | 2024 | costoVentas | 363 | 363 | 0 | — | pasa |
| A4 | 2024 | utilidadBruta | 181 | 181 | 0 | — | pasa |
| A4 | 2024 | utilidadNeta | -40 | -40 | 0 | — | pasa |
| A4 | 2024 | razonCorriente | 1.26 | 1.26 | 0.0016 | — | pasa |
| A4 | 2025 | activosCorrientes | 240 | 240 | 0 | — | pasa |
| A4 | 2025 | activosFijos | 550 | 550 | 0 | — | pasa |
| A4 | 2025 | totalActivos | 790 | 790 | 0 | — | pasa |
| A4 | 2025 | pasivosCorrientes | 190 | 190 | 0 | — | pasa |
| A4 | 2025 | totalPasivos | 400 | 400 | 0 | — | pasa |
| A4 | 2025 | totalPatrimonio | 390 | 390 | 0 | — | pasa |
| A4 | 2025 | ventasBrutas | 500 | 500 | 0 | — | pasa |
| A4 | 2025 | ventas | 495 | 495 | 0 | — | pasa |
| A4 | 2025 | costoVentas | 330 | 330 | 0 | — | pasa |
| A4 | 2025 | utilidadBruta | 165 | 165 | 0 | — | pasa |
| A4 | 2025 | utilidadNeta | -35 | -35 | 0 | — | pasa |
| A4 | 2025 | razonCorriente | 1.26 | 1.26 | 0.0032 | — | pasa |
| A5 | 2021 | activosCorrientes | 348 | 348 | 0 | — | pasa |
| A5 | 2021 | activosFijos | 336 | 336 | 0 | — | pasa |
| A5 | 2021 | totalActivos | 684 | 684 | 0 | — | pasa |
| A5 | 2021 | pasivosCorrientes | 132 | 132 | 0 | — | pasa |
| A5 | 2021 | totalPasivos | 264 | 264 | 0 | — | pasa |
| A5 | 2021 | totalPatrimonio | 420 | 420 | 0 | — | pasa |
| A5 | 2021 | ventasBrutas | 600 | 600 | 0 | — | pasa |
| A5 | 2021 | ventas | 576 | 576 | 0 | — | pasa |
| A5 | 2021 | costoVentas | 336 | 336 | 0 | — | pasa |
| A5 | 2021 | utilidadBruta | 240 | 240 | 0 | — | pasa |
| A5 | 2021 | utilidadNeta | 66 | 66 | 0 | — | pasa |
| A5 | 2021 | razonCorriente | 2.64 | 2.64 | 0.0036 | — | pasa |
| A5 | 2022 | activosCorrientes | 406 | 406 | 0 | — | pasa |
| A5 | 2022 | activosFijos | 392 | 392 | 0 | — | pasa |
| A5 | 2022 | totalActivos | 798 | 798 | 0 | — | pasa |
| A5 | 2022 | pasivosCorrientes | 154 | 154 | 0 | — | pasa |
| A5 | 2022 | totalPasivos | 308 | 308 | 0 | — | pasa |
| A5 | 2022 | totalPatrimonio | 490 | 490 | 0 | — | pasa |
| A5 | 2022 | ventasBrutas | 700 | 700 | 0 | — | pasa |
| A5 | 2022 | ventas | 672 | 672 | 0 | — | pasa |
| A5 | 2022 | costoVentas | 392 | 392 | 0 | — | pasa |
| A5 | 2022 | utilidadBruta | 280 | 280 | 0 | — | pasa |
| A5 | 2022 | utilidadNeta | 77 | 77 | 0 | — | pasa |
| A5 | 2022 | razonCorriente | 2.64 | 2.64 | 0.0036 | — | pasa |
| A5 | 2023 | activosCorrientes | 464 | 464 | 0 | — | pasa |
| A5 | 2023 | activosFijos | 448 | 448 | 0 | — | pasa |
| A5 | 2023 | totalActivos | 912 | 912 | 0 | — | pasa |
| A5 | 2023 | pasivosCorrientes | 176 | 176 | 0 | — | pasa |
| A5 | 2023 | totalPasivos | 352 | 352 | 0 | — | pasa |
| A5 | 2023 | totalPatrimonio | 560 | 560 | 0 | — | pasa |
| A5 | 2023 | ventasBrutas | 800 | 800 | 0 | — | pasa |
| A5 | 2023 | ventas | 768 | 768 | 0 | — | pasa |
| A5 | 2023 | costoVentas | 448 | 448 | 0 | — | pasa |
| A5 | 2023 | utilidadBruta | 320 | 320 | 0 | — | pasa |
| A5 | 2023 | utilidadNeta | 88 | 88 | 0 | — | pasa |
| A5 | 2023 | razonCorriente | 2.64 | 2.64 | 0.0036 | — | pasa |
| A5 | 2024 | activosCorrientes | 522 | 522 | 0 | — | pasa |
| A5 | 2024 | activosFijos | 504 | 504 | 0 | — | pasa |
| A5 | 2024 | totalActivos | 1026 | 1026 | 0 | — | pasa |
| A5 | 2024 | pasivosCorrientes | 198 | 198 | 0 | — | pasa |
| A5 | 2024 | totalPasivos | 396 | 396 | 0 | — | pasa |
| A5 | 2024 | totalPatrimonio | 630 | 630 | 0 | — | pasa |
| A5 | 2024 | ventasBrutas | 900 | 900 | 0 | — | pasa |
| A5 | 2024 | ventas | 864 | 864 | 0 | — | pasa |
| A5 | 2024 | costoVentas | 504 | 504 | 0 | — | pasa |
| A5 | 2024 | utilidadBruta | 360 | 360 | 0 | — | pasa |
| A5 | 2024 | utilidadNeta | 99 | 99 | 0 | — | pasa |
| A5 | 2024 | razonCorriente | 2.64 | 2.64 | 0.0036 | — | pasa |
| A5 | 2025 | activosCorrientes | 580 | 580 | 0 | — | pasa |
| A5 | 2025 | activosFijos | 560 | 560 | 0 | — | pasa |
| A5 | 2025 | totalActivos | 1140 | 1140 | 0 | — | pasa |
| A5 | 2025 | pasivosCorrientes | 220 | 220 | 0 | — | pasa |
| A5 | 2025 | totalPasivos | 440 | 440 | 0 | — | pasa |
| A5 | 2025 | totalPatrimonio | 700 | 700 | 0 | — | pasa |
| A5 | 2025 | ventasBrutas | 1000 | 1000 | 0 | — | pasa |
| A5 | 2025 | ventas | 960 | 960 | 0 | — | pasa |
| A5 | 2025 | costoVentas | 560 | 560 | 0 | — | pasa |
| A5 | 2025 | utilidadBruta | 400 | 400 | 0 | — | pasa |
| A5 | 2025 | utilidadNeta | 110 | 110 | 0 | — | pasa |
| A5 | 2025 | razonCorriente | 2.64 | 2.64 | 0.0036 | — | pasa |

### Bloque B — adversariales

| Conjunto | Campo | Esperado | Obtenido | Diferencia | Motivo | Resultado |
|---|---|---|---|---|---|---|
| B1 | Importe con texto en una celda (`Efectivo: "abc"`) | Rechazo con el mensaje exacto de validación y ningún total calculado | `Importe inválido en activos[2024].Efectivo: "abc"`; el parseo aborta antes de calcular | — | — | pasa |
| B2 | Paréntesis en una cuenta de pasivo | Negativo según la convención de la cuenta; el total cuadra con la referencia | `(500)` se lee −500. En un pasivo de convención `positivo` la compuerta lo rechaza con el mensaje de D-061 (que menciona los paréntesis). En la cuenta de patrimonio con convención `conservar` («Resultado del período incluido en patrimonio», ingresado `(150)`) se acepta −150 y el balance cuadra con la referencia: 340 = 90 + 250 | — | — | pasa |
| B3 | Subtotal reportado que no cuadra con sus detalles (480 contra 300) | Gana el reportado; `reported_subtotal_mismatch` con la diferencia; el balance marca rojo | `activosCorrientes` 480; motivo `reported_subtotal_mismatch` con diferencia 180; `balanced` false (720 contra 490, diferencia 230) | 0 (comportamiento) | `reported_subtotal_mismatch` | pasa |
| B4 | Edificios sin depreciación acumulada | `requires_data`; no hay total fijo silencioso | `activosFijos` y `totalActivos` N/D con motivo `missing_required_account_data` | — | `missing_required_account_data` | pasa |
| B5 | «Préstamo a largo plazo» sin identidad | `ambiguous_account_match`; pasivo total N/D con ese motivo; no se asigna identidad | `totalPasivos` N/D; motivo `ambiguous_account_match` con la cuenta como `name` | — | `ambiguous_account_match` | pasa |

Nota sobre B2: el caso pide una «cuenta de pasivo», pero ningún pasivo del catálogo acepta negativos (todos son de convención `positivo`), así que la lectura literal termina en rechazo por D-061 — que es lo que la prueba fija primero. La parte «el total cuadra con la referencia» se cumple con «Resultado del período incluido en patrimonio», cuenta del **patrimonio** (no de pasivos) con convención `conservar`, que admite cualquier signo. Quedan ambas conductas documentadas y fijadas.

### Bloque C — periodos y selector

| Conjunto | Campo | Esperado | Obtenido | Resultado |
|---|---|---|---|---|
| C1 | Dos periodos | Se muestran los dos | `visibles` = ['2021', '2022'] | pasa |
| C2 | Cuatro periodos | Se muestran los cuatro | `visibles` = ['2021'…'2024'] | pasa |
| C3 | Cinco periodos | Por defecto los dos más recientes; el selector ofrece los cinco; no más de cuatro a la vez | `visibles` = ['2024', '2025']; la interfaz dibuja las cinco casillas (prueba en `estados-formato-ui.test.js`); marcando los cinco, `visibles` = los 4 más recientes y `puedeAgregar` false | pasa |
| C4 | Ocho periodos | Mismos predeterminados que C3; al elegir cuatro distintos, los cálculos de cada periodo no cambian | Predeterminados ['2027', '2028']; elegidos ['2021', '2023', '2025', '2027'] quedan como `visibles`; los totales por periodo son idénticos (la selección no entra en `computeFinancialTotals`) | pasa |
| C5 | Cambio de selección | Los cálculos de cada periodo son idénticos antes y después; la selección solo cambia la vista | Totales de los 4 periodos idénticos antes y después de cambiar la selección | pasa |

## 4. Suite y lint (comandos y salida completa)

Comandos (Windows, según AGENTS.md):

```
npm.cmd test
npm.cmd run lint
```

`npm.cmd test`:

```
 Test Files  50 passed (50)
      Tests  1247 passed (1247)
   Duration  ~9.1s
```

`npm.cmd run lint`:

```
✖ 10 problems (0 errors, 10 warnings)
```

Los 10 avisos son los mismos de `main`, en archivos que esta rama no toca (`js/components/tabla.js`, `js/modules/activos/index.js`, `js/modules/presupuesto/index.js`, `js/utils/export.js`, `tests/unit/calculate.test.js`).

## 5. Conclusión

**Estados quedó integrado en `main`**: el PR #19 (`feat/estados-calculo-robusto`) se fusionó el 30 de octubre de 2026 y `main` está en `00c60f3`.

- Los 10 casos de aceptación de la ronda 1, la triangulación con y sin subtotales, y los 15 conjuntos de la batería pasan; 0 valores incorrectos sin motivo.
- Ninguna condición de parada se activó: no hay diferencias sin causa, ningún test existente cambió de valor esperado fuera de lo atribuido (T1 corrigió solo la atribución documental), no se asignó identidad por nombre, no se tocaron JSON, `docs/razones_financieras/` ni el motor de razones.
- Pendiente de integración: actualizar `feat/razones-app-final` con merge de `main` (nunca rebase). Sin ronda 3: lo anterior es trabajo de integración, no de esta rama.
