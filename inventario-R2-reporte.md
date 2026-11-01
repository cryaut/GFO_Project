# Inventario — Reporte ronda 2 (corrección de la ronda 1; última del módulo)

- **Fecha**: 2026-11-01
- **Rama**: `feat/inventario-robusto`, sobre la ronda 1 en `038689e` (sin rama nueva). El PR lo abre Cris, con revisor distinto del autor, después de esta ronda.
- **Encargo**: `instrucciones_inventario_ronda2.md`. Esta es la ronda 2 de 2, la última del módulo; no hay ronda 3.
- **Bloque R: pendiente por falta de datos reales** (sección 5).

## 1. T0 — Línea base sobre `038689e`

```
npm.cmd test      →  Test Files 53 passed (53) | Tests 1379 passed (1379)
npm.cmd run lint  →  ✖ 10 problems (0 errors, 10 warnings)
```

## 2. Commits

| SHA | Tarea | Commit | Qué cambió |
|---|---|---|---|
| `e3e1cde` | T1 | `fix: valida la forma del inventario del respaldo y cuenta las listas inválidas` | H1 y H2 (D-083 aplicado como estaba escrito): en `validarModulo`, el caso `inventario` pasa primero por las mismas validaciones de forma que el resto de módulos (`esObjeto` y tipos de campo, con los mensajes de `main`), y después por `normalizarInventario` con el rechazo por descartes. `normalizarInventario` cuenta como descarte una `productos` o `movimientos` que no sea lista. |
| `2aa94ca` | T2 | `feat: avisa cuando Planeación no tiene producto vinculado y afina el faltante` | D-085 (H3): `calcularPresupuestoMaestro` agrega el aviso `sin-producto-vinculado` cuando los supuestos traen `productoInventario` y no `productoId`; `textoAviso` muestra el texto del encargo; la pista de «Tomar de Inventario» solo dice que el mínimo se lee del producto cuando hay `productoId`. H4 (D-082): `descripcionReposicion` elige «Bajo el mínimo» vs «Llegó al mínimo» con `faltante > TOLERANCIA_REPOSICION`. |
| *este commit* | T5/T6 | `docs: registra D-085 y agrega el reporte de la ronda 2 de Inventario` | Decisiones D-085 y este archivo. |

T4 (pruebas C1 a C11) quedó dentro del commit de T1/T2: se agregaron por partes al mismo `inventario-robusto.test.js` y se confirmaron en la suite final.

## 3. Pruebas existentes cambiadas (causa D-082, D-083 o D-085)

Ninguna prueba existente cambió en esta ronda. Los casos nuevos (C1 a C11) viven en la sección «ronda 2» de `tests/unit/inventario-robusto.test.js`.

## 4. Matriz de casos (C1 a C11)

| Caso | Esperado | Obtenido |
|---|---|---|
| C1. Respaldo con `inventario: null` | Rechazado con «El módulo "inventario" debe ser un objeto.»; el store no cambia | Cumple: `validarRespaldo` lanza ese texto antes de tocar el store |
| C2. Respaldo con `inventario: "abc"` | Rechazado con el mismo texto | Cumple |
| C3. Respaldo con `productos` que no es lista | Rechazado con «inventario.productos debe ser una lista.» | Cumple |
| C4. Respaldo con `movimientos` que no es lista | Rechazado con el mensaje de tipo de `main` | Cumple: «inventario.movimientos debe ser una lista.» |
| C5. Respaldo válido | Aceptado y normalizado como hoy | Cumple: `modulos.inventario` con los productos y movimientos normalizados |
| C6. Respaldo con registros descartados | Rechazado con el conteo (D-083) | Cumple: «El inventario del respaldo tiene registros descartados (Movimiento con fecha inválida: 1). No se importó nada.» |
| C7. `normalizarInventario({ productos: "x" })` | `descartados` incluye la lista inválida | Cumple: «Lista de productos inválida: 1» (y «Lista de movimientos inválida» para el caso simétrico) |
| C8. Presupuesto con `productoInventario` y sin `productoId` | Aviso `sin-producto-vinculado` visible; sin alerta de stock por nombre | Cumple: el aviso está en la lista y no hay `bajo-stock-minimo` |
| C9. Presupuesto con `productoId` y mínimo vigente | Alerta con el mínimo del producto (M9 y M11 de la ronda 1) | Cumple: con mínimo 80, los cuatro periodos avisan (el Trimestre 3 por igualdad) y no hay `sin-producto-vinculado` |
| C10. Existencia 0.5999999 con mínimo 0.6 | Alerta con «Llegó al mínimo»; sin «comprar al menos 0.0000001» | Cumple: `descripcionReposicion` elige «Llegó al mínimo: programe una compra.» con `TOLERANCIA_REPOSICION` |
| C11. Regresión M0 a M11 de la ronda 1 | Todas siguen en verde | Cumple: la matriz de la ronda 1 (M0 a M11) corre en el mismo archivo y la suite está en verde |

## 5. Bloque R (estados reales)

**Pendiente.** No hay inventario real de una empresa en esta sesión. No cuenta como hecho.

## 6. Suite y lint (después de la ronda)

```
npm.cmd test      →  Test Files 53 passed (53) | Tests 1390 passed (1390)
npm.cmd run lint  →  ✖ 10 problems (0 errors, 10 warnings)
```

Los 10 avisos son los mismos de `main`, en archivos que esta rama no toca.

## 7. Cierre del módulo

**Ronda 2 completa.** T0 a T6 cumplidos. Módulo Inventario cerrado; el bloque R queda como pendiente por falta de datos reales.

- H1 corregido: el respaldo de inventario pasa primero por las validaciones de forma de `main` (`inventario: null`, `"abc"`, listas inválidas → rechazado con los mismos mensajes) y después por `normalizarInventario` con el rechazo por descartes.
- H2 corregido: una lista que no sea lista cuenta como descarte en `normalizarInventario`.
- H3 corregido con D-085: los datos anteriores sin `productoId` muestran el aviso `sin-producto-vinculado` y ninguna alerta de stock por nombre.
- H4 corregido: el faltante usa `TOLERANCIA_REPOSICION`; C10 no muestra «comprar al menos 0.0000001».
- H5 corregido: el SHA de T4 del reporte R1 es `80a8054` y el reporte tiene una sección «Corrección» que supera su sección 7 y precisa el alcance de D-083.
- Ninguna condición de parada se activó: ninguna cifra de Estados, EFE, Equilibrio, Análisis o Dashboards cambió; ningún respaldo válido se rechazó (C5 acepta); la regresión M0-M11 se mantuvo; no se tocó `js/modules/razones/`, `cuentas-catalogo.js`, los JSON de razones ni `docs/razones_financieras/`.
