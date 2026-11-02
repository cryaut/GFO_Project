# EFE — Reporte ronda 2 (última del módulo)

- **Fecha**: 2026-10-30
- **Rama**: `feat/efe-ronda2`, creada desde `origin/main` en `094bb82` (incluye EFE ronda 1, PR #20).
- **Encargo**: `instrucciones_efe_ronda2_ultima.md`. Esta es la última ronda del módulo; no hay ronda 3.

## 1. Commits

Un commit por tarea:

| SHA | Tarea | Commit | Qué cambió |
|---|---|---|---|
| `fae72cb` | T1 | `fix: excluye los totales reportados duplicados del EOAF y los avisos de balance` | D-072: el mapa de componentes de los totales reportados se traslada de `efe-roles.js` a `comprobacion-calculations.js` y la regla queda en un solo lugar (`esTotalDuplicado`). `variacionesDeCuentas` excluye los totales con componentes en los datos (el EOAF y el EFE heredan la exclusión; el EFE pierde su filtro local) y `totalGrupo` no los suma: `advertenciasDeBalance` recibe los estados como primer argumento porque la regla necesita las identidades. Prueba: los 9 pares del bloque A en el EOAF quedan en `cuadra` con diferencia 0 y sin avisos de «el balance no cumple», incluido A3. |
| `2c68a1a` | T2 | `feat: alimenta Proforma con el EFE como única fuente del flujo` | D-070: adaptador `flujoDesdeEFE(estados)` en `proforma-calculations.js` — toma el último par de periodos, traduce operación, variación neta y saldo final, y solo está disponible si el EFE está en `cuadra` o `cuadra-sin-verificar`. `reunirEntradas` deja de leer `store.get('flujo')`. Los indicadores de flujo citan «Análisis (EFE)» y las alertas apuntan a `#/analisis`; sin EFE utilizable, el faltante dice qué revisar en Análisis, pestaña EFE. |
| `72d1bef` | T4 | `fix: unifica la tolerancia del flujo directo con la del EFE` | D-071: `conciliarConBalance` usa `toleranciaComprobacion(saldoFinal, efectivo)` y `<=` (antes 0.005 con `<`). |
| `0cb9d80` | T3 | `feat: rotula la captura del flujo directo como no oficial` | D-070: la pantalla `#/flujo` lleva la leyenda de captura no oficial y explica que el flujo de Proforma y del panorama de Inicio sale del EFE de Análisis. Sin cambios en su cálculo; la carga de demostración de Inicio se mantiene. |
| `4139a33` | Ajustes de pruebas | `test: adapta las llamadas de balance y el flujo de Proforma a las nuevas reglas` | Las tres pruebas de `advertenciasDeBalance` en `comprobacion.test.js` pasan a la nueva firma (D-072) y la prueba de indicadores de `proforma.test.js` consume el adaptador (D-070). Detalle en la sección 2. |
| *este commit* | T6 | `docs: registra D-070 a D-072 y agrega el reporte de la ronda 2 del EFE` | Decisiones D-070 a D-072 en `docs/decisiones.md` (regla 13 de AGENTS.md) y este archivo. |

T5 (bloque R): **pendiente por falta de datos** — sección 4.

## 2. Pruebas existentes cambiadas (causa D-070 a D-072)

| Prueba (archivo) | Antes | Después | Causa |
|---|---|---|---|
| `comprobacion.test.js` — las tres pruebas de «advertencias de balance» | `advertenciasDeBalance(periodos, bgInicial, bgFinal)` | `advertenciasDeBalance(datos, periodos, bgInicial, bgFinal)`: la regla de totales necesita las identidades de cuenta para saber qué totales duplican a sus componentes. Valores esperados sin cambios | D-072 |
| `proforma.test.js` — «reúne los indicadores de cada módulo» | El renglón «Flujo de operación» mostraba la cifra de la captura manual del flujo directo | Muestra la cifra del EFE de Análisis sobre el mismo fixture (el valor exacto no se cita aquí por ser del conjunto MUNO MODA) | D-070 |
| `proforma.test.js` — importación de `calcularFlujo` | El archivo de pruebas importaba `calcularFlujo` para armar la entrada de flujo | Ya no se usa: la entrada de flujo la construye `flujoDesdeEFE` | D-070 |

Ninguna prueba cambió por una causa fuera de D-070 a D-072. Las variantes del EFE (V0 a V16 y VB) y el bloque A del EFE de la ronda 1 quedaron intactos y siguen en verde.

## 3. Verificación contra el encargo

- **Bloque A (EFE, 9 pares):** los 9 en `cuadra` contra la referencia (pruebas de la ronda 1, sin cambios).
- **Bloque A (EOAF, 9 pares):** los 9 en `cuadra` con diferencia 0 y sin ningún aviso de «el balance no cumple» — `tests/unit/efe-ronda2.test.js`. El par A3 2024 → 2025, que en `main` salía `incompleta` con avisos falsos, queda `cuadra`.
- **Variantes del EFE (V0 a V16, VB):** sin cambios, todas en verde.
- **Proforma (T2):** con A1 2024 → 2025, «Flujo de operación» = 116, «Variación neta del efectivo» = 18 y «Saldo final de efectivo» = 180. Con una captura manual distinta sembrada en `#/flujo`, Proforma muestra las cifras del EFE (116) y no las de la captura. Con un solo periodo de Estados, Proforma muestra el faltante del EFE (necesita dos periodos) sin indicadores de flujo.
- **Flujo directo (T4):** una diferencia de 0.007 concilia; una de 0.011 no concilia.
- **Demo de Proforma:** las cifras de flujo de la demostración cambian por D-070; registrado aquí **sin citar cifras de MUNO MODA**.

## 4. Bloque R: pruebas con estados reales

**Pendiente por falta de datos.** En esta sesión no hubo estados reales: los balances del bloque A son referencias construidas y los datos de demostración tienen cifras de ejemplo. Para cerrar el bloque R hacen falta dos juegos de estados reales de la misma empresa con dos años consecutivos (balance general y estado de resultados, anonimizados); si existe el EFE del contador se usa como referencia y, si no, la referencia se calcularía fuera de la app con las definiciones de D-066 y D-068. No se cuenta como hecho.

## 5. Suite y lint (comandos y salida)

```
npm.cmd test
npm.cmd run lint
```

`npm.cmd test`:

```
 Test Files  51 passed (51)
      Tests  1298 passed (1298)
```

`npm.cmd run lint`:

```
✖ 10 problems (0 errors, 10 warnings)
```

Los 10 avisos son los mismos de `main`, en archivos que esta rama no toca.

## 6. Cierre del módulo

**Módulo EFE cerrado.** T1 a T4 y T6 cumplidos, con el bloque R explícitamente pendiente por falta de estados reales. Ninguna condición de parada se activó: los bloqueos A (EFE y EOAF) cuadran contra sus referencias, A3 ya no muestra avisos falsos de balance, ningún indicador de flujo de Proforma sale de otra fuente que no sea el EFE, ninguna prueba cambió fuera de D-070 a D-072, y no hizo falta tocar `cuentas-catalogo.js`, los JSON de razones, el motor de razones ni `docs/razones_financieras/`.

Pendiente declarado: el bloque R (dos juegos de estados reales de la misma empresa, dos años consecutivos, anonimizados), que no abre otra ronda del módulo.
