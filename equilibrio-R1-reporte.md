# Punto de equilibrio y GAO — Reporte ronda 1

- **Fecha**: 2026-10-31
- **Rama**: `feat/equilibrio-robusto`, creada desde `origin/main` en `824047d` (incluye EFE ronda 2, PR #21).
- **Encargo**: `instrucciones_equilibrio_ronda1.md`, con la referencia independiente `equilibrio_ronda1_referencia.json` (copiada a `tests/unit/fixtures/`) y la entrada del bloque A ya en `main`.
- **Bloque R: pendiente por falta de datos reales** (sección 5).

## 1. T0 — Línea base sobre `main` `824047d`

```
npm.cmd test   →  Test Files 51 passed (51) | Tests 1298 passed (1298)
npm.cmd run lint  →  ✖ 10 problems (0 errors, 10 warnings)
```

## 2. Commits

Un commit por tarea:

| SHA | Tarea | Commit | Qué cambió |
|---|---|---|---|
| `aabe70e` | T1 | `fix: da GAO solo con margen y UAII positivos y explica su motivo` | D-073: `gao(mc, uaii)` en `calculate.js` devuelve N/D si `mc ≤ 0` o `uaii ≤ 0` (o casi cero, tolerancia 0.005 de siempre); `esCasiCero` se expone como `casiCero` para que los motivos coincidan. `calcularCVU` devuelve `motivoGao` en el orden del encargo: `sin-ventas`, `margen-no-positivo`, `uaii-no-positiva`, `dato-faltante`. Prueba de cobertura: la matriz manual de 10 casos del JSON de referencia. |
| `559e52c` | T2 | `feat: deriva la base de equilibrio de los estados como fuente única` | D-074: `normalizarEquilibrio` agrega `origen` y `periodo` (datos sin `origen` se leen como manuales); nueva función pura `resolverBase(datos, estados, configApalancamiento)` → `{ origen, base, periodo, error, avisoCF }`; aviso de CF cuando el manual difiere del de estados más de 0,5 % (mínimo 0,005 C$), con las dos cifras y el porcentaje, sin bloquear el guardado. La pantalla reemplaza el botón «Tomar datos» por el selector de origen: en modo estados guarda solo `origen`, `periodo` y `unidades`, muestra los derivados de solo lectura y la limitación del precio promedio; en modo manual muestra el aviso de CF. La validación y el guardado corren sobre los datos efectivos. |
| `83bd55d` | T3 | `fix: conserva los escenarios inválidos como null y los reporta por campo` | D-075: `normalizarEquilibrio` conserva el valor de escenario que no es número como `null` (vacío sigue siendo 0); `validarEquilibrio` reporta cada campo por nombre; `calcularEscenarios` omite el escenario personalizado mientras tenga un `null` (los predefinidos sí se calculan); la tarjeta de escenarios muestra los errores junto al formulario con el que se corrigen, sin tumbar los resultados de la base. |
| `88d7465` | T4 | `fix: distingue la cuenta fuera del catálogo de la sin comportamiento` | D-076: `baseDesdeEstados` separa los motivos según el tipo de faltante de Apalancamiento: fuera del catálogo («sinClasificación») → «La cuenta «X» no está en el catálogo de cuentas: revise su nombre en Estados Financieros.»; sin fijo o variable («sinComportamiento») → «Clasifique en Apalancamiento como fijas o variables: X.» |
| `44f859c` | T5 | `docs: registra D-073 a D-076 de Equilibrio` | Decisiones D-073 a D-076 en `docs/decisiones.md` con la plantilla de la regla 13 de AGENTS.md. |
| *este commit* | T5 | `docs: agrega el reporte de la ronda 1 de Equilibrio` | Este archivo. |

## 3. Pruebas existentes cambiadas (causa D-073 a D-075)

| Prueba (archivo) | Antes | Después | Causa |
|---|---|---|---|
| `apalancamiento.test.js` — «UAII negativa devuelve el valor (la interfaz advierte, D-008)» | `gao(160000, −40000)` → −4 | → N/D (`null`); se agregan margen negativo y casi cero | D-073 |
| `apalancamiento-calculations.test.js` — «UAII negativa: grado negativo con advertencia» | `grados.gao` = 160,000 / −90,000 | `grados.gao` N/D; las advertencias `bajo-equilibrio-operativo` y `bajo-equilibrio-financiero` se mantienen | D-073 |
| `apalancamiento-ui.test.js` — «UAII negativa: muestra el grado negativo con advertencia» | La pantalla contiene «−0.78» | El grado ya no aparece (N/D); la advertencia «punto de equilibrio operativo» se mantiene | D-073 |
| `equilibrio.test.js` — «toma precio y costos de los estados guardados» | Botón «Tomar datos»: `persistir` copiaba precio, CVu y CF a los datos guardados | Nuevo flujo de origen estados: el selector cambia el modo y el formulario guarda solo `origen`, `periodo` y `unidades`; los derivados se muestran de solo lectura y el texto de limitación aparece | D-074 |

Ninguna prueba cambió por una causa fuera de D-073 a D-075. Las pruebas de `normalizarEquilibrio` existentes no dependían de la conversión de escenarios inválidos a 0, así que D-075 no las tocó.

## 4. Matriz manual (10 casos) y bloque A (14 periodos)

Todas las comparaciones contra `equilibrio_ronda1_referencia.json` (calculado fuera de la app), con tolerancia 0.01 en montos y unidades y 0.0001 en GAO. Los diez campos de cada caso de la matriz (`mcu`, `rmc`, `peUnidades`, `peVentas`, `unidadesMinimas`, `msPorcentaje`, `uaii`, `gao`, `motivoGao`, `unidadesObjetivo`) coinciden; la tabla muestra el GAO y su motivo, que es lo que cambia con D-073.

### Matriz manual

| Caso | GAO esperado | GAO obtenido | Diferencia | Motivo |
|---|---|---|---|---|
| M1 | 2 | 2 | 0.00000000 | — |
| M2 | 2 | 2 | 0.00000000 | — |
| M3 | 1 | 1 | 0.00000000 | — |
| M4 | N/D | N/D | 0 (ambos N/D) | margen-no-positivo |
| M5 | N/D | N/D | 0 (ambos N/D) | margen-no-positivo |
| M6 | N/D | N/D | 0 (ambos N/D) | uaii-no-positiva |
| M7 | N/D | N/D | 0 (ambos N/D) | uaii-no-positiva |
| M8 | N/D | N/D | 0 (ambos N/D) | sin-ventas |
| M9 | 3.395971 | 3.395971 | 0.00000000 | — |
| M10 | 400 | 400 | 0.00000000 | — |

Casos clave verificados: M3 (CF = 0 → GAO 1), M5 y M6 (antes +0.8 y −4 → N/D con motivo), M8 (0 unidades → N/D con motivo `sin-ventas`), M10 (UAII pequeña → GAO 400 válido).

### Bloque A desde estados (origen estados, unidades 1000)

CF, UAII y GAO contra la referencia; el GAO de Equilibrio se compara también con el de Apalancamiento para el mismo periodo con la misma configuración (costo de ventas variable; gastos administrativos y de ventas fijos) y coincide.

| Conjunto | Periodo | CF esperado | CF obtenido | UAII esperada | UAII obtenida | GAO esperado | GAO obtenido | Diferencia | Motivo |
|---|---|---|---|---|---|---|---|---|---|
| A1 | 2024 | 216 | 216 | 144 | 144 | 2.5 | 2.5 | 0.00000000 | — |
| A1 | 2025 | 240 | 240 | 160 | 160 | 2.5 | 2.5 | 0.00000000 | — |
| A2 | 2023 | 176 | 176 | 128 | 128 | 2.375 | 2.375 | 0.00000000 | — |
| A2 | 2024 | 198 | 198 | 144 | 144 | 2.375 | 2.375 | 0.00000000 | — |
| A2 | 2025 | 220 | 220 | 160 | 160 | 2.375 | 2.375 | 0.00000000 | — |
| A3 | 2024 | 340 | 340 | 212 | 212 | 2.603774 | 2.603774 | 0.00000000 | — |
| A3 | 2025 | 370 | 370 | 230 | 230 | 2.608696 | 2.608696 | 0.00000000 | — |
| A4 | 2024 | 182 | 182 | -1 | -1 | N/D | N/D | 0 (ambos N/D) | uaii-no-positiva |
| A4 | 2025 | 165 | 165 | 0 | 0 | N/D | N/D | 0 (ambos N/D) | uaii-no-positiva |
| A5 | 2021 | 144 | 144 | 96 | 96 | 2.5 | 2.5 | 0.00000000 | — |
| A5 | 2022 | 168 | 168 | 112 | 112 | 2.5 | 2.5 | 0.00000000 | — |
| A5 | 2023 | 192 | 192 | 128 | 128 | 2.5 | 2.5 | 0.00000000 | — |
| A5 | 2024 | 216 | 216 | 144 | 144 | 2.5 | 2.5 | 0.00000000 | — |
| A5 | 2025 | 240 | 240 | 160 | 160 | 2.5 | 2.5 | 0.00000000 | — |

Vínculo vivo (sin reguardar nada): con origen estados sobre A1 2025, cambiar «Gastos de ventas» a variable baja el CF exactamente 90 y el GAO cambia de 2.5 a 1.6. Aviso de CF: con el CF de estados no hay aviso; con un 10 % más, el aviso muestra las dos cifras y `diferenciaPct` 0.1; sin estados, no hay aviso. Migración: los datos del formato anterior (sin `origen`) se leen como manuales y reproducen M1.

## 5. Bloque R: pruebas con datos reales

**Pendiente por falta de datos.** No hay estados reales en esta sesión; los balances del bloque A son construidos y su referencia se verificó contra el propio fixture. Para cerrar el bloque R hacen falta estados reales de una empresa con su **número de unidades vendidas del mismo periodo** — sin ese dato no hay precio ni costo unitario. No se cuenta como hecho.

## 6. Suite y lint (antes y después)

Antes (T0, `main` `824047d`):

```
npm.cmd test      →  Test Files 51 passed (51) | Tests 1298 passed (1298)
npm.cmd run lint  →  ✖ 10 problems (0 errors, 10 warnings)
```

Después (final de la ronda):

```
npm.cmd test      →  Test Files 51 passed (51) | Tests 1332 passed (1332)
npm.cmd run lint  →  ✖ 10 problems (0 errors, 10 warnings)
```

Los 10 avisos son los mismos de `main`, en archivos que esta rama no toca.

## 7. Conclusión

**Punto de equilibrio queda listo para PR.**

- Los siete hallazgos de partida quedan resueltos: H1 y H2 (fuente única con `resolverBase`), H3, H4 y H5 (GAO N/D con motivo), H6 (escenarios `null` reportados) y H7 (motivos precisos).
- La matriz manual completa y los 14 periodos del bloque A coinciden con la referencia; el GAO de Equilibrio coincide con el de Apalancamiento en cada periodo.
- Ninguna condición de parada se activó: ninguna prueba cambió fuera de D-073 a D-075, ningún dato guardado en el formato anterior cambió de valor calculado (migración verificada), y no hizo falta tocar `cuentas-catalogo.js`, los JSON de razones, el motor, `docs/razones_financieras/`, GAF ni GAT.
- Pendiente: el bloque R (estados reales con unidades vendidas), que se registra en la ronda 2 si llegan los datos.
