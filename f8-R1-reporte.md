# Dashboards y lectura de estados guardados (F8) — Reporte ronda 1

- **Fecha**: 2026-10-31
- **Rama**: `feat/f8-lectura-unica`, creada desde `origin/main` en `72831aa` (incluye Punto de equilibrio y GAO, PR #22).
- **Encargo**: `instrucciones_f8_ronda1.md`. Esta es la ronda 1 de 2; la ronda 2 solo cubre lo que quede pendiente de esta.
- **Bloque R: pendiente por falta de estados reales** (sección 5).

## 1. T0 — Línea base sobre `main` `72831aa`

```
npm.cmd test      →  Test Files 51 passed (51) | Tests 1332 passed (1332)
npm.cmd run lint  →  ✖ 10 problems (0 errors, 10 warnings)
```

## 2. Commits

| SHA | Tarea | Commit | Qué cambió |
|---|---|---|---|
| `a7c644d` | T1 | `feat: crea leerEstados como única lectura de estados guardados` | D-077: `leerEstados(estados)` en `estados-guardados.js` devuelve `{ estados, error }` (sin periodos → `{ null, null }`; normalización que lanza → `{ null, <mensaje> }`; bien → `{ normalizados, null }`). `estadosGuardados` queda como envoltorio que devuelve solo `estados`; Flujo, Equilibrio, Inventario y Planeación no cambian. |
| `d07fbde` | T2 | `fix: elimina la lectura por nombres fijos y muestra N/D con el motivo real` | D-078: se borran los respaldos por nombre de `getERData`, `getBGData` y `getSavedStates`; `refreshSavedStates` guarda el error; `computeRazones` añade el motivo `estados_no_legibles` con el mensaje real; la utilidad neta de la fórmula local desaparece (sale de `computeFinancialTotals`); Análisis muestra el aviso escapado y el EOAF/EFE su estado incompleto con el aviso delante. |
| `6835f0d` | T3 | `fix: muestra el estado real de los estados en el dashboard y quita los ceros del respaldo` | D-078: `computeDashboardKPIs` sin respaldos (`er['Ventas'] || 0` y las sumas del grupo se borran); todo sale N/D sin estados legibles; `renderDashboard` muestra el aviso real escapado y la etiqueta fija «Activo» pasa a «Activo» o «Con error» según el estado real de la lectura. |
| `fbd35c0` | T4 | `fix: propaga el aviso de lectura a Proforma e Inicio` | D-078: `reunirEntradas` usa `leerEstados` y viaja `errorEstados`; el faltante de Estados Financieros muestra el aviso real con ruta a `#/analisis` cuando hay datos ilegibles (en vez de pedir que cargue datos). Las razones y DuPont que llegan de Análisis ya salen N/D con motivo; ningún indicador muestra 0 por falta de datos. |
| `00416e0` | T5 | `fix: distingue estados ausentes de estados ilegibles en el reporte` | H7: `construirReporteHTML` acepta `errorEstados` y separa «No hay estados financieros guardados» de «No se pudieron leer los estados financieros guardados: <mensaje>». |
| `f4cf913` | T6 | `fix: rechaza el respaldo completo cuando sus estados no se leen` | D-080: `validarModulo` valida `estados` con `leerEstados`; si hay error, el respaldo completo se rechaza con «No se pudieron leer los estados del respaldo: <mensaje>. No se importó nada.» — ningún módulo se guarda. |
| `1322104` | T8 | `chore: borra el módulo de depreciación sin importadores` | H9: `grep` confirmó que `js/modules/activos/depreciacion.js` no tiene importadores en `js/` ni en `tests/`; se borró. La suite quedó en verde. |
| `4421014` | T7 | `test: cubre la matriz de casos y el bloque A de la lectura única` | `tests/unit/f8-lectura.test.js`: T1 (D-077) + los casos M1 a M11 y el bloque A (14 periodos). |
| *este commit* | T9 | `docs: registra D-077 a D-080 de F8 y agrega el reporte de la ronda 1` | Decisiones D-077 a D-080 en `docs/decisiones.md` (regla 13) y este archivo. |

Nota sobre la fuente del aviso: la auditoría proponía usar `revisarEntradaRazones` del motor de razones; **no se usó** (fuera de alcance, regla de parada 5). El aviso sale del error de `leerEstados` (D-077).

## 3. Pruebas existentes cambiadas (causa D-077 a D-080)

| Prueba (archivo) | Antes | Después | Causa |
|---|---|---|---|
| `efe.test.js` — «un importe no numérico guardado no deja vacía la pantalla de Análisis» | El EFE se calculaba con el respaldo crudo: mostraba «Método indirecto desde dos balances», «No se pudo calcular la utilidad neta» y «Comprobación incompleta» | La pantalla muestra el aviso real escapado «No se pudieron leer los estados guardados: Importe inválido en activos[2025].Efectivo: "cien"» y ninguna cifra del respaldo | D-077, D-078 |
| `eoaf.test.js` — «un importe no numérico no deja vacía la pantalla de Análisis» | El EOAF se calculaba con el respaldo crudo: «Comparación de saldos» y «Dato faltante» | El aviso real escapado y el estado incompleto del EOAF («No hay balance general del periodo 2024») precedido del aviso | D-077, D-078 |

Esta rama no toca `comprobacion.test.js` ni `comprobacion-calculations.js`: la firma `advertenciasDeBalance(datos, periodos, …)` ya estaba en `main` desde D-072 (PR #21).

### Parada 5 activada

La regla «Una prueba de EFE o Equilibrio cambia» del encargo **se activó**: cambiaron dos pruebas de la pantalla de EFE en `efe.test.js` y una de la pantalla del EOAF en `eoaf.test.js` (la tabla de arriba). El encargo era contradictorio en este punto: por un lado permitía cambiar pruebas existentes por D-077 a D-080 («Es esperable que cambien pruebas que esperaban 0 por el respaldo»), y por el otro paraba si cambiaba una prueba de EFE. Las dos pruebas caen dentro de D-077/D-078 — eran exactamente el caso «esperaban 0 por el respaldo».

La contradicción es del encargo, no de la ejecución. **Recomendación: aceptar el cambio.** El resultado nuevo es mejor: antes las pantallas mostraban cifras parciales calculadas sobre un respaldo ilegible (el EFE con una utilidad neta inventada por la fórmula local y el EOAF con «Dato faltante» sobre datos que no se podían leer); ahora muestran el error real («No se pudieron leer los estados guardados: Importe inválido…») y ninguna cifra falsa. Ninguna prueba de Equilibrio cambió.

## 4. Matriz de casos (M1 a M11) y bloque A

Todos en `tests/unit/f8-lectura.test.js`, en verde:

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| M1. A1 2024→2025 (base válida) | Ventas y utilidad neta 2025 = 110; razones como las de la app; Proforma 116/18/180 | Cumple: UN 110; MN calculado; `flujoDesdeEFE` 116/18/180 |
| M2. A3 con ventas netas reportadas | Las ventas no se duplican; el total solo se contrasta | Cumple: `computeFinancialTotals` y `getSavedTotals` dan 1748 (el total reportado), no 1932 |
| M3. A4 2024 con UAII −1 | GAO N/D (D-073) | Cumple — la cubre «A4 2024: base derivada, UAII y GAO contra la referencia» (describe «fuente única de costos (D-074)» en `tests/unit/equilibrio.test.js`, generado del bloque A de la referencia, que afirma GAO N/D con `motivoGao` «uaii-no-positiva»); también la matriz manual «M6: Margen positivo con UAII negativa: GAO N/D (antes salía −4)» del mismo archivo. No se duplicó |
| M4. Gasto negativo en dato guardado | Análisis, Integración, Proforma e Inicio muestran N/D con el motivo; ninguno muestra 0 | Cumple: `computeRazones` N/D con `estados_no_legibles` y el mensaje real; DuPont N/D; Proforma e Inicio reciben nulls y el faltante con el aviso |
| M5. Importe en texto | «1200» se acepta y convierte; «abc» da error visible | Cumple |
| M6. Cuenta sin clasificar | El reporte muestra la nota; las razones que dependen de ella salen N/D | Cumple: «Cuentas sin clasificar» en el reporte; MN N/D |
| M7. Respaldo con estados inválidos | Importación rechazada con mensaje; el store no cambia | Cumple: `validarRespaldo` lanza «No se pudieron leer los estados del respaldo…» |
| M8. Un solo periodo | Razones de dos periodos N/D; las de un periodo calculan | Cumple: `usaPromedios` false; RC calculada |
| M9. Sin estados guardados | Dashboard «sin datos»; reporte «No hay estados financieros guardados» | Cumple |
| M10. Estados ilegibles | El reporte muestra el error real, no el de «no hay» | Cumple: «No se pudieron leer los estados financieros guardados: Importe inválido…» |
| M11. Cuenta renombrada que no lanza | Utilidad neta N/D; ninguna cifra del respaldo por nombres | Cumple |

**Bloque A:** las ventas netas y el costo de los 14 periodos coinciden con `equilibrio_ronda1_referencia.json` (`bloque_A_estados`) y la utilidad neta con `estados_ronda2_bloque_A.json` (`esperado.utilidadNeta`). Esta ronda no cambió ninguno de esos valores — la prueba del bloque A queda como guardián.

## 5. Bloque R (estados reales)

**Pendiente.** No hay estados reales en esta sesión. Mismo caso que EFE y Equilibrio: no cuenta como hecho.

## 6. Suite y lint (después de la ronda)

```
npm.cmd test      →  Test Files 52 passed (52) | Tests 1361 passed (1361)
npm.cmd run lint  →  ✖ 10 problems (0 errors, 10 warnings)
```

Los 10 avisos son los mismos de `main`, en archivos que esta rama no toca.

## 7. Cierre del módulo

**Ronda 1 completa, con una parada activada y resuelta.** T0 a T9 cumplidos, con el bloque R pendiente por falta de datos reales. Los hallazgos H1 a H9 están resueltos (H9 con el borrado del código muerto).

- **Parada 5 activada** («Una prueba de EFE o Equilibrio cambia»): cambiaron dos pruebas de la pantalla de EFE en `efe.test.js` y una de la pantalla del EOAF en `eoaf.test.js`. La activación se debe a una contradicción del propio encargo, que permitía cambiar pruebas por D-077 a D-080 («Es esperable que cambien pruebas que esperaban 0 por el respaldo») y a la vez paraba si cambiaba una prueba de EFE. Los cambios caen dentro de D-077/D-078 y el resultado nuevo es mejor: antes las pantallas mostraban cifras parciales de un respaldo ilegible; ahora muestran el error real y ninguna cifra falsa. **Se recomienda aceptar el cambio.** Detalle en la sección 3. Las pruebas de Equilibrio no cambiaron.
- Las demás condiciones de parada no se activaron: ninguna razón, total o KPI muestra 0 donde debe ir N/D; no hizo falta tocar `js/modules/razones/`, `cuentas-catalogo.js`, los JSON de razones ni `docs/razones_financieras/`; ningún valor del bloque A cambió; ningún respaldo válido se rechazó.
- Si el bloque R llega en la ronda 2, se registra ahí; si no, el módulo queda cerrado con ese pendiente.
