# Inventario: stock mínimo, valuación y datos descartados (F7) — Reporte ronda 1

- **Fecha**: 2026-11-01
- **Rama**: `feat/inventario-robusto`, creada desde `origin/main` en `59492f9` (incluye Dashboards y lectura de estados, PR #23).
- **Encargo**: `instrucciones_inventario_ronda1.md`. Esta es la ronda 1 de 2; la ronda 2 cubre solo lo que quede pendiente.
- **Bloque R: pendiente por falta de un inventario real de una empresa** (sección 5).

## 1. T0 — Línea base sobre `main` `59492f9`

```
npm.cmd test      →  Test Files 52 passed (52) | Tests 1361 passed (1361)
npm.cmd run lint  →  ✖ 10 problems (0 errors, 10 warnings)
```

## 2. Commits

Un commit por tarea. T1 y T2 comparten commit porque ambas implementan D-082 sobre el mismo archivo:

| SHA | Tarea | Commit | Qué cambió |
|---|---|---|---|
| `87ffcb3` | T1+T2 | `fix: unifica la regla y la redacción de reposición en las tres pantallas` | D-082: `TOLERANCIA_REPOSICION = 1e-6` exportada desde `calculate.js` y usada por `necesitaReposicion` (mínimo 0 = sin política) y por el kardex (la constante local de `inventario-calculations.js` se retiró). Nueva `descripcionReposicion(producto)` con la redacción única, usada por `textoAlerta` de Inventario, el área de Inicio y el indicador de Proforma. |
| `80a8054` | T4 (+T6) | `feat: valúa a costo promedio ponderado móvil, cuenta descartes y N/D con unidades distintas` | D-081: el kardex calcula el costo promedio ponderado móvil y el costo de las salidas; `resumenProducto` expone `costoPromedio`, `costoSalidas` y `valor` (existencia final × promedio); las entradas pueden traer `costoUnitario`; `validarMovimiento` exige costo ≥ 0 en las entradas; `inventario-ui` agrega el campo `movCosto` (visible solo para entradas) y la etiqueta «Costo de la existencia inicial». T6: `unidadesTotales` N/D con unidades distintas (D-084). T5 (modelo): `normalizarInventario` devuelve `descartados`. |
| `3756467` | T3 (+T5) | `feat: guarda productoId en Planeación, alerta por igualdad y rechaza inventarios con descartes` | D-082: Planeación usa `necesitaReposicion` (la igualdad avisa) y deja de copiar el mínimo: los supuestos guardan `productoId`, el mínimo vigente se lee del producto en Inventario al calcular, y «Tomar de Inventario» guarda `productoId` y el costo promedio vigente. D-083: `integracion-respaldo.js` valida `inventario` con `normalizarInventario` y rechaza el respaldo completo si hay descartados. |
| *este commit* | T8 | `docs: registra D-081 a D-084 y agrega el reporte de la ronda 1 de Inventario` | Decisiones y este archivo. |

T7 (matriz) quedó dentro del commit de T4/T5 porque comparte el archivo de pruebas: la matriz se agregó por partes al mismo `inventario-robusto.test.js` y se confirmó completa en la suite final.

## 3. Pruebas existentes cambiadas (causa D-081 a D-084)

| Prueba (archivo) | Antes | Después | Causa |
|---|---|---|---|
| `inventario.test.js` — «carga el ejemplo, lo guarda y muestra valor, alertas y gráfico» | `Comprar al menos 5 prendas` | `Bajo el mínimo: comprar al menos 5 prendas` — la redacción única de `descripcionReposicion` | D-082 |
| `inventario.test.js` — «acepta una entrada válida» | Una entrada sin costo era válida | La entrada exige costo unitario ≥ 0; se agregó `costoUnitario` al caso válido y el caso sin costo ahora espera el error | D-081 |
| `inventario.test.js` — «descarta datos guardados inválidos…» | `normalizarInventario(undefined)` → `{ productos: [], movimientos: [] }`; sin registro de descartes | → `{ productos: [], movimientos: [], descartados: [] }`; se afirman los motivos y conteos de los descartes | D-083 |
| `inventario.test.js` — «registra una entrada que quita la alerta» | La entrada del formulario no llevaba costo | Se llena `movCosto: '800'` en el formulario | D-081 |
| `planeacion.test.js` — «avisa cuando el inventario final queda bajo el stock mínimo» | `calcularPresupuestoMaestro({ ...ejemplo, stockMinimo: 70 })` con `<` | `calcularPresupuestoMaestro(supuestos, inventario)` con `productoId` y el mínimo del producto; caso nuevo de igualdad con mínimo 80 (el Trimestre 3 ahora avisa) | D-082 |
| `planeacion.test.js` — «toma los saldos del balance y el inventario de un producto» | El guardado incluía `stockMinimo: 40` copiado | Incluye `productoId: 'demo-camisa'` y `costoUnitario: 350` (el costo promedio de la demo coincide con el costo inicial: sin costo en movimientos) | D-082 |

Ninguna prueba de Estados, EFE, Equilibrio, Análisis o Dashboards (F8) cambió.

## 4. Matriz de casos (M0 a M11)

Todos en `tests/unit/inventario-robusto.test.js`, en verde (tolerancia 0.01; el caso M4 con 1e-6 en el promedio):

| Caso | Esperado | Obtenido |
|---|---|---|
| M0. Regresión: movimientos sin costo | Valor, existencia y alertas iguales a `main` | Existencia 8, promedio 4, valor 32, sin alerta (mínimo 4); la entrada sin costo cuenta en el aviso |
| M1. Existencia igual al mínimo (enteros) | Alerta, «Llegó al mínimo» | Cumple: reponer true, faltante 0, texto «Llegó al mínimo: programe una compra.» |
| M2. Decimales igual al mínimo (0.3 + 0.1 + 0.2 vs 0.6) | Alerta | Cumple: existencia 0.6000000000000001 ≤ 0.6 + 1e-6; texto «Llegó al mínimo» |
| M3. Existencia debajo del mínimo | Alerta; faltante = mínimo − existencia; costo = faltante × costo promedio | Cumple: faltante 2, costo 8 (2 × 4) |
| M4. Compra a precio distinto | Promedio 170/15 = 11.3333; salida 8 u → costo 90.6667; final 7 u; valor 79.3333 | Cumple (diferencias 0 con tolerancia 1e-6) |
| M5. Salida que deja la existencia en 0 | Alerta con mínimo 5; sin alerta con mínimo 0; nunca negativa | Cumple |
| M6. Fecha mal escrita en dato importado | Descartada y contada; respaldo rechazado (D-083) | Cumple: descartado «Movimiento con fecha inválida: 2»; `validarRespaldo` lanza «El inventario del respaldo tiene registros descartados…» |
| M7. Existencia inicial negativa en dato importado | Descartada con su motivo | Cumple: «Producto con campo numérico inválido o negativo: 1» |
| M8. Entrada sin costo (dato anterior) | Usa el costo del producto; cuenta en el aviso | Cumple: promedio 6 (el costo del producto), `movimientosSinCosto` 1 |
| M9. Mínimo cambia en Inventario | Planeación alerta con el valor nuevo | Cumple: con mínimo 50 no hay aviso; al subirlo a 70, los Trimestres 1, 2 y 4 avisan |
| M10. Productos con unidades distintas | Existencia total N/D | Cumple: `unidadesTotales` null |
| M11. Planeación con inventario final igual al mínimo | Aparece la alerta (antes no, por `<`) | Cumple: con mínimo 80, el Trimestre 3 (inventario 80 = 80) avisa |

La prueba M9/M11 de la matriz es la misma de `planeacion.test.js` (caso del mínimo 80 por igualdad), referida aquí sin duplicar.

## 5. Bloque R (estados reales)

**Pendiente.** No hay inventario real de una empresa en esta sesión. No cuenta como hecho.

## 6. Suite y lint (después de la ronda)

```
npm.cmd test      →  Test Files 53 passed (53) | Tests 1379 passed (1379)
npm.cmd run lint  →  ✖ 10 problems (0 errors, 10 warnings)
```

Los 10 avisos son los mismos de `main`, en archivos que esta rama no toca.

## 7. Cierre del módulo

**Ronda 1 completa.** T0 a T8 cumplidos, con el bloque R pendiente por falta de un inventario real de una empresa. Los hallazgos H1 a H6 están resueltos (H1 tolerancia, H2 descartes visibles y respaldo, H3 regla única y mínimo vigente, H4 redacción única, H5 valuación a promedio, H6 N/D con unidades distintas). Ninguna condición de parada se activó: ninguna cifra de Estados, EFE, Equilibrio, Análisis o Dashboards cambió; la regresión M0 se mantuvo; no se tocó `js/modules/razones/`, `cuentas-catalogo.js`, los JSON de razones ni `docs/razones_financieras/`; ningún respaldo válido se rechazó; Planeación no cambió cifras del presupuesto (solo el aviso, por D-082). No quedó nada abierto: si el bloque R llega en la ronda 2, se registra ahí.

## 8. Corrección (ronda 2, 2026-11-01)

La verificación de Cris encontró dos problemas que esta ronda no mencionaba, corregidos en la ronda 2 (`inventario-R2-reporte.md`): una regresión crítica en el respaldo de inventario (aceptaba inventarios con forma inválida, contra D-083) y la pérdida silenciosa del aviso de stock en Planeación para datos guardados sin `productoId` (D-085). Por lo tanto:

- La sección 7 de este reporte queda **superada** por la ronda 2: sí quedaba algo abierto y el cierre «Ronda 1 completa» correspondía a un estado que la ronda 2 corrige.
- D-083 cubre también **listas no válidas** (`productos` o `movimientos` que no sean listas cuentan como descartes), no solo los registros individuales con forma inválida.
