# Estados financieros — Reporte R1 (cálculo y entrada) y R2 (periodos, pruebas y verificación)

- **Fecha**: 2026-10-30
- **Rama**: [`feat/estados-calculo-robusto`](https://github.com/cryaut/GFO_Project/tree/feat/estados-calculo-robusto), creada desde `origin/main` en `84cbd31` (merge del PR #17). No parte de `feat/razones-app-final`, que no fue tocada.
- **Encargo**: `instrucciones_carlos_estados_R1-R2.md`. Nota: el encargo dice "Para Carlos", pero fue asignado y ejecutado por cuenta de Cris Lumbi (los commits salen de su cuenta).
- **Entorno de ejecución**: Windows; los comandos se corrieron con `npm.cmd` y `npx.cmd` según AGENTS.md.

## 1. Commits

Un commit por tarea, formato `tipo: descripción`, archivos agregados por nombre.

| SHA | Tarea | Commit |
|---|---|---|
| `28703e3` | R1-1 (D-062) | `fix: usa el total reportado sin sumarlo a sus detalles` |
| `698d6f3` | R1-2 | `fix: aplica la misma regla de identidad a todas las vías` |
| `45e787f` | R1-3 (D-061) | `fix: aplica la convención de signos del catálogo` |
| `36ef152` | R1-4 (D-063) | `fix: exige los datos que el catálogo marca como necesarios` |
| `b55365f` | R1-5 (D-064) | `fix: presenta las ventas como ventas netas` |
| `8bda684` | R1-6 | `fix: diagnostica el resultado del ejercicio faltante en el patrimonio` |
| `afc7162` | R2-1 (D-065) | `feat: agrega la selección de periodos visibles en Estados` |
| `527cdcc` | R2-2 | `test: verifica los diez casos de aceptación de la tabla` |
| `dc5ca52` | R2-3 | `test: agrega la triangulación con cifras calculadas a mano` |
| `433edc0` | Documentación | `docs: documenta la reparación de estados y su ficha` |
| *este commit* | Reporte | `docs: agrega el reporte de R1-R2` |

R2-4 (regresión) no requirió commit: no hubo que corregir nada, las pruebas y el lint pasaron tal como estaban.

## 2. Decisiones registradas

**5 decisiones**, números D-061 a D-065 (ninguno existía; no fue necesario tomar el siguiente libre) en `docs/decisiones.md` con la plantilla de la regla 13:

- **D-061** — Convención de signos del catálogo (R1-3).
- **D-062** — El total reportado nunca se suma a sus detalles (R1-1).
- **D-063** — Ausencia según la política del catálogo (R1-4).
- **D-064** — Ventas netas (R1-5).
- **D-065** — Selección de periodos visibles (R2-1). El número máximo (4) y los predeterminados (todos con 4 o menos; los dos más recientes con más de 4) son criterio del asistente, autorizado por Cris Lumbi según el encargo.

## 3. Pruebas cambiadas (antes → después, con causa)

Cambios de expectativas ya existentes; las pruebas nuevas se listan al final.

| Prueba (archivo) | Valor antes | Valor después | Causa |
|---|---|---|---|
| `cuentas-registro.test.js` — «una clasificación contradictoria queda sugerida y conserva el importe» | `totalActivos` null | `totalActivos` 100 (manda el total reportado); `activosCorrientes` 20; `activosFijos` null (subtotal sin detalles ni total propio en un grupo con total) | D-062 |
| `cuentas-registro.test.js` — «otros ingresos y gastos genéricos requieren confirmación aun con su tipo» | `inventario` null, motivo `overlapping_account_aggregation` | `inventario` 100; motivo `reported_subtotal_mismatch` con diferencia 40 | D-062 |
| `estados-import.test.js` — tabla ancha (Ventas y Costo de Ventas con tipo) | `{ Ventas: 920000, 'Costo de Ventas': 545000 }` en `estadoResultados` | `{}` en `estadoResultados`; `reportedTotals` con `is.sales_total` 920000 e `is.cost_of_sales_reported` 545000 | D-062 |
| `estados-import.test.js` — misma prueba, clasificación | `accountTypes.estadoResultados['Costo de Ventas'] === 'costoVentas'` | `accountIdentities…['Costo de Ventas'].idCuenta === 'is.cost_of_sales_reported'` | D-062 |
| `estados-import.test.js` — tabla ancha solo con ventas | `{ Ventas: 920000 }` en el estado | `{}` y `reportedTotals['2024']['is.sales_total']` 920000 | D-062 |
| `estados-import.test.js` — tabla con inventario | `{ Efectivo: 150, Inventario: 80 }` en activos | `{ Efectivo: 150 }` y `reportedTotals['2024']['bs.inventory_total']` 80 | D-062 |
| `estados-import.test.js` — `sheetsToFinancialData` | `{ Ventas: 300 }` en el estado | `{}` y `reportedTotals['2024']['is.sales_total']` 300 | D-062 |
| `estados-import-formatos.test.js` — formato de importes | Inventario 1234567.89 y Ventas 500000 en los estados | En `reportedTotals` (`bs.inventory_total` y `is.sales_total`) | D-062 |
| `cuentas-revision.test.js` — «los 5000 pendientes corrientes solo anulan sus totales posibles…» | ER `{ Ventas: 300 }` por periodo | ER `{ Ventas: 300, 'Costo de Ventas': 0 }` (cero declarado del costo) | D-060 caso 1 |
| `razones-mercado.test.js` — fixture de mercado | `estadoResultados['2024'] = { Ventas: 100 }` | `{ Ventas: 100, 'Costo de Ventas': 0 }` | D-060 caso 1 |
| `cuentas-identificador.test.js` — «conserva las 71 identidades del PR #10» | `divergenciasD055` con 55 cuentas | 52 cuentas; las tres deducciones de ventas pasan a `requires_data` | D-063 |

Ninguna prueba cambió de valor esperado por una causa ajena a D-061 a D-065. Las demás diferencias del diff son agregados de 0 explícito (sección 6) y pruebas nuevas:

Nota: los dos fixtures con «Costo de Ventas: 0» se atribuyen a **D-060 caso 1** (completar entradas con ceros explícitos; el esperado no cambia), decisión del encargo de la ronda 19 de razones (`instrucciones_carlos_ronda19.md`); su alta en `docs/decisiones.md` corresponde a esa rama. Corregido en la ronda 2 de Estados (`estados-R2-reporte.md`).

- R1-2: pruebas de igualdad de resultados entre vías (interfaz, importación, JSON) en 10 archivos.
- R1-3: 35 líneas en `estados-import.test.js` para la compuerta de signos (positivo, negativo, conservar).
- R1-4: 104 líneas en `estados-calculations.test.js` (depreciación exigida, deducciones exigidas, cero declarado).
- R1-5: 3 pruebas (resta de deducciones, trazabilidad de `ventasBrutas`, tipo `deduccionesVentas` en catálogo y selector).
- R1-6: 2 pruebas del `diagnostico` y 1 del alias «Resultado del ejercicio».
- R2-1: 6 pruebas de `seleccionarPeriodos` y 7 de interfaz en `estados-formato-ui.test.js`.
- R2-2: `tests/unit/estados-robustez.test.js` (11 pruebas, casos 1 a 10 con 3a y 3b separados).
- R2-3: `tests/unit/estados-triangulacion.test.js` (4 pruebas).

## 4. Textos exactos de los mensajes de la compuerta

Se aplican en `normalizeFinancialData` (`estados-normalize.js`, función `validarSigno`), así que cubren la interfaz, la importación y los JSON por igual. `{fila}` es el número de fila de la importación tabular; en JSON y datos guardados es 0. `{cuenta}` es el nombre tal como lo escribió la persona y `{periodo}` el periodo. Primer error encontrado aborta la carga (suficiente en esta ronda).

**Cuenta con convención `positivo` e importe negativo:**

```
Fila {fila}, cuenta «{cuenta}», periodo {periodo}: esta cuenta se captura en positivo. Quite el signo negativo o los paréntesis. Si es una devolución o un descuento, use su cuenta de deducción.
```

**Depreciación acumulada con importe positivo (convención `negativo`):**

```
Fila {fila}, cuenta «{cuenta}», periodo {periodo}: la depreciación acumulada se captura en negativo.
```

Las cuentas `conservar` (utilidad o pérdida del ejercicio, utilidades retenidas, utilidad bruta y neta reportadas) no se validan. Los datos guardados que ya no pasan la compuerta no se borran: la interfaz los muestra en modo lectura con el mensaje «No se pudieron editar los datos guardados: … No se han borrado.»

## 5. Los 10 casos de la tabla con los valores obtenidos

Verificados en `tests/unit/estados-robustez.test.js` (R2-2). Todos dan la columna "Debe dar".

| # | Entrada | Obtenido | Regla |
|---|---|---|---|
| 1 | Costo de ventas −400 | Rechazo en la compuerta con el mensaje de convención positiva (Fila 0 desde JSON; se verifica también Fila 7 por la vía de registro) | D-061 |
| 2 | Gasto de administración −200 | Rechazo en la compuerta con el mismo mensaje | D-061 |
| 3a | Depreciación acumulada +200 | Rechazo en la compuerta con el mensaje de depreciación | D-061 |
| 3b | Depreciación acumulada −200 | Pasa; activos fijos 300; total de activos 800; balance equilibrado; sin motivos | D-061 |
| 4 | Edificio 300 sin depreciación | Activos fijos y total de activos N/D; motivo `missing_required_account_data` | D-063 |
| 5 | Ventas de detalle 800 + 200 y total «Ventas netas» 1000 que cuadra, desde JSON | Ventas 1000 (ventas brutas 1000); sin motivos | D-062 |
| 6 | El mismo caso por la vía de la interfaz (`registrarCuenta`) | Ventas 1000; sin motivos; idéntico al caso 5 (misma regla para todas las vías) | D-062 |
| 7 | Total de activos corrientes 500 que cuadra con sus cuentas | Activos corrientes 500; sin motivos | D-062 |
| 8 | Total de activos corrientes 480 con cuentas que suman 500 | Activos corrientes 480 (manda el total); aviso `reported_subtotal_mismatch` con diferencia −20 | D-062 |
| 9 | Solo «Total de activos» 1000, sin detalles | Total de activos 1000; activos corrientes y activos fijos N/D (nunca 0) | D-062 |
| 10 | Devoluciones 50 (descuentos 0 y rebajas 0 declarados), ventas 1000, costo 400, gastos 200, 100, 20, impuesto 50 | Ventas netas 950; utilidad bruta 550; utilidad neta 180; sin motivos | D-063, D-064 |

## 6. Ceros explícitos agregados

- **Datos de demostración** (`DEMO_MUNOMODA` en `js/modules/estados/index.js`): 0 explícito en devoluciones, descuentos y rebajas sobre ventas de **cada periodo** del estado de resultados (2023 y 2024). Pasan la compuerta (convención `positivo`). No se cambió ninguna otra cifra del demo. (Por el encargo, no se copian cifras aquí.)
- **Pruebas** (causa D-063; los valores esperados no cambian): agregan los tres ceros explícitos en sus estados de resultados de base `analisis-nd.test.js`, `analisis-razones.test.js`, `apalancamiento-calculations.test.js`, `apalancamiento-ui.test.js`, `cuentas-revision.test.js`, `efe.test.js`, `equilibrio.test.js`, `inicio.test.js`, `integracion-reporte.test.js`, `integracion-ui.test.js` y `proforma.test.js`.
- **Casos de la tabla** (sección 5): el caso 10 declara descuentos 0 y rebajas 0 además de devoluciones 50.
- **Triangulación** (sección 7): declara descuentos 0 y rebajas 0 junto a devoluciones 20.

## 7. Triangulación con cifras calculadas a mano (R2-3)

Verificada en `tests/unit/estados-triangulacion.test.js`. Entrada: efectivo 250; cuentas por cobrar 50; edificios 300; depreciación acumulada −60; cuentas por pagar 90; pasivo largo plazo 100; capital 200; «Resultado del ejercicio» 150; ventas 500; devoluciones 20; costo 200; gastos de administración 100; impuesto 30. Valores calculados por el código:

| Valor | Calculado |
|---|---|
| Activos corrientes | 300 |
| Activos fijos netos | 240 |
| Total de activos | 540 |
| Pasivos corrientes | 90 |
| Total de pasivos | 190 |
| Total de patrimonio | 350 |
| Ventas brutas (trazabilidad) | 500 |
| Ventas netas | 480 |
| Utilidad bruta | 280 |
| Utilidad neta | 150 |
| Cuadre (A = P + O) | equilibrado, diferencia 0 |
| `diagnostico` | null (la utilidad ya está en el patrimonio) |
| Razón corriente (motor de razones, `liquidez_razon_corriente`) | 3.333333… (300/90), presentada **3.33** |

## 8. Regresión (R2-4)

- Pruebas que importan `modules/estados` (`git grep -l "modules/estados" tests`): **24 archivos, 405 pruebas, todas en verde.**
- `npm.cmd test` completo:

```
 Test Files  49 passed (49)
      Tests  1217 passed (1217)
   Duration  ~6.2s
```

- `npm.cmd run lint`:

```
✖ 10 problems (0 errors, 10 warnings)
```

Los 10 avisos son preexistentes en `main` y están en archivos que esta rama no toca (`js/components/tabla.js`, `js/modules/activos/index.js`, `js/modules/presupuesto/index.js`, `js/utils/export.js`, `tests/unit/calculate.test.js`).

## 9. Batería de 15 conjuntos (R2-5)

**Pendiente.** Los archivos no están en el repositorio: se buscó «batería», «conjuntos» y «casos» en el repo y en el workspace local; lo único parecido (`docs/razones_financieras/*.json`, `scripts/sample-estados.*`) son especificaciones de razones y un ejemplo único, no la batería de 15 conjuntos de estados. No se inventaron datos, según el encargo.

## 10. Pull Request

- La rama está empujada: <https://github.com/cryaut/GFO_Project/tree/feat/estados-calculo-robusto>
- Enlace para abrir el PR hacia `main` (la CLI `gh` no está disponible en este entorno): <https://github.com/cryaut/GFO_Project/pull/new/feat/estados-calculo-robusto>
- Revisor: pedir uno distinto del autor (Carlos o Henry), según la regla 1 de AGENTS.md y el encargo. Pendiente de asignación en GitHub al abrir el PR.

## 11. Qué no se tocó (verificación del encargo)

Sin cambios en JSON de razones, `js/modules/razones/especificacion-razones.js` ni el motor de razones; sin cambios en la hoja Esperados de ningún libro; sin selector de periodos en Análisis ni Reportes; sin importación de todos los errores de una vez; sin cuentas suplementarias dentro del estado de resultados (pendiente c); sin cifras de MUNO nuevas (solo los ceros exigidos por D-063 en las fixtures existentes).
