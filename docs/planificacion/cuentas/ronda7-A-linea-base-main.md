# Ronda 7 — Tarea A: línea base de main

Fecha: 2026-10-20. Resultado: **436 pruebas correctas en 34 archivos; lint con 0 errores y 10 advertencias**. Ambos comandos terminaron con código 0.

## Copia y referencia

- Commit solicitado y ejecutado: `2c11c4d77bb098c684217bd34b31a39ab35c82b1` (`origin/main`, referencia indicada en la ronda 7).
- Copia local aislada: `C:/Users/carlo/Desktop/GFO Project/revision-ronda7-main`, con HEAD separado en ese commit.
- La copia se creó desde el repositorio local mediante `git clone --shared --no-checkout` y se fijó mediante `git checkout --detach <SHA>`. No se mezcló con la rama del PR #14 ni con la del PR #10.
- No se editaron fuentes ni pruebas. Después de las ejecuciones, `git status --short`, `git diff --exit-code` y `git diff --cached --exit-code` no mostraron cambios.

El commit de main no contiene un `package-lock.json` versionado. Para conservar las mismas herramientas usadas en el entorno del PR #14, se copió físicamente su directorio `node_modules` a esta copia, sin enlaces de directorio y sin modificar el origen. Cada copia conserva su propia caché. No se instalaron dependencias nuevas ni fue necesario acceso de red para obtenerlas. Esta es una ejecución del código exacto del commit con las versiones locales indicadas, no una afirmación de instalación reproducible desde un lockfile de ese commit.

| Herramienta | Versión ejecutada |
|---|---|
| Node.js | `v24.15.0` |
| Vitest | `3.2.7` |
| ESLint | `9.39.5` |
| `@eslint/js` | `9.39.5` |
| `globals` | `16.5.0` |

## Resultado y advertencias

Se ejecutaron `npm.cmd test` y `npm.cmd run lint` desde la copia aislada. El sufijo `.cmd` corresponde a Windows PowerShell; ejecuta los mismos scripts `test` y `lint` solicitados.

| Comando | Código de salida | Resultado |
|---|---|---|
| `npm.cmd test` | 0 | 34 archivos, 436 pruebas correctas; 0 fallos |
| `npm.cmd run lint` | 0 | 0 errores, 10 advertencias |

Lista completa de advertencias de esta línea base. Todas son de la regla `no-unused-vars`:

| Archivo de main | Línea:columna | Identificador | Mensaje |
|---|---|---|---|
| `js/components/tabla.js` | 2:25 | `striped` | is assigned a value but never used |
| `js/modules/activos/index.js` | 3:26 | `formatNumber` | is defined but never used |
| `js/modules/activos/index.js` | 12:7 | `ESTADOS_POSIBLES` | is assigned a value but never used |
| `js/modules/presupuesto/index.js` | 6:23 | `destroyChart` | is defined but never used |
| `js/utils/export.js` | 69:16 | `e` | is defined but never used |
| `tests/unit/calculate.test.js` | 7:23 | `depAnualLineaRecta` | is defined but never used |
| `tests/unit/calculate.test.js` | 7:43 | `depAcumulada` | is defined but never used |
| `tests/unit/calculate.test.js` | 7:57 | `valorEnLibros` | is defined but never used |
| `tests/unit/calculate.test.js` | 8:3 | `ahorroMensual` | is defined but never used |
| `tests/unit/calculate.test.js` | 8:18 | `saldoSemanal` | is defined but never used |

Estas diez advertencias ya existen en `main` en el commit fijado. La comparación con el resultado nuevo del PR #14 debe usar sus salidas reales y estos mismos archivos/líneas; este informe no sustituye la ejecución de la ronda 6.

## Salida completa de npm test

```text

> gfo-toolkit@1.0.0 test
> vitest run


 RUN  v3.2.7 C:/Users/carlo/Desktop/GFO Project/revision-ronda7-main

 ✓ tests/unit/estados-import.test.js (15 tests) 48ms
 ✓ tests/unit/estados-calculations.test.js (28 tests) 48ms
 ✓ tests/unit/presupuesto-personal.test.js (6 tests) 513ms
   ✓ pantalla del presupuesto personal > con el ejemplo ficticio calcula ingresos, gastos, capacidad de ahorro y saldo disponible  375ms
 ✓ tests/unit/estados-acceptance.test.js (6 tests) 539ms
   ✓ imports external JSON through Estados, previews, saves once and reloads  385ms
 ✓ tests/unit/inicio.test.js (17 tests) 130ms
 ✓ tests/unit/razones-mercado.test.js (12 tests) 191ms
 ✓ tests/unit/apalancamiento-ui.test.js (17 tests) 282ms
 ✓ tests/unit/proforma.test.js (9 tests) 302ms
 ✓ tests/unit/analisis-razones.test.js (5 tests) 917ms
   ✓ cobertura de intereses > se calcula con los intereses del estado de resultados  551ms
 ✓ tests/unit/planeacion.test.js (17 tests) 279ms
 ✓ tests/unit/eoaf.test.js (24 tests) 607ms
 ✓ tests/unit/inicio-navegador.test.js (4 tests) 1040ms
   ✓ cargar ejemplos > llena los módulos vacíos de la empresa con el caso de MUNO MODA, sin tocar lo personal  725ms
 ✓ tests/unit/efe.test.js (23 tests) 708ms
 ✓ tests/unit/integracion-ui.test.js (9 tests) 1186ms
   ✓ Reportes: importar JSON > valida, pide confirmación y guarda los módulos del respaldo  499ms
 ✓ tests/unit/integracion-reporte.test.js (7 tests) 63ms
 ✓ tests/unit/equilibrio.test.js (17 tests) 161ms
 ✓ tests/unit/comprobacion.test.js (14 tests) 44ms
 ✓ tests/unit/flujo.test.js (12 tests) 58ms
 ✓ tests/unit/inventario.test.js (19 tests) 168ms
 ✓ tests/unit/apalancamiento-calculations.test.js (21 tests) 24ms
 ✓ tests/unit/estados-formato-ui.test.js (1 test) 47ms
 ✓ tests/unit/estados-import-formatos.test.js (17 tests) 29ms
 ✓ tests/unit/orden-periodos.test.js (3 tests) 24ms
 ✓ tests/unit/calculate.test.js (28 tests) 13ms
 ✓ tests/unit/integracion-respaldo.test.js (10 tests) 18ms
 ✓ tests/unit/format.test.js (18 tests) 38ms
 ✓ tests/unit/apalancamiento.test.js (32 tests) 12ms
 ✓ tests/unit/carga-modulos.test.js (2 tests) 2135ms
   ✓ carga de módulos > js/app.js carga todo el grafo de módulos y registra el arranque  1236ms
   ✓ carga de módulos > cada archivo de js/ se puede importar sin errores  897ms
 ✓ tests/unit/metodologia-financiera.test.js (10 tests) 10ms
 ✓ tests/unit/razones-unificadas.test.js (8 tests) 6ms
 ✓ tests/unit/presupuesto.test.js (8 tests) 7ms
 ✓ tests/unit/depreciacion.test.js (11 tests) 9ms
 ✓ tests/unit/razones-adicionales.test.js (5 tests) 7ms
 ✓ tests/unit/analisis-reexports.test.js (1 test) 4ms

 Test Files  34 passed (34)
      Tests  436 passed (436)
   Start at  22:27:40
   Duration  4.29s (transform 5.96s, setup 0ms, collect 10.29s, tests 9.67s, environment 10ms, prepare 16.10s)
```

## Salida completa de npm run lint

```text

> gfo-toolkit@1.0.0 lint
> eslint js/ tests/


C:\Users\carlo\Desktop\GFO Project\revision-ronda7-main\js\components\tabla.js
  2:25  warning  'striped' is assigned a value but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\revision-ronda7-main\js\modules\activos\index.js
   3:26  warning  'formatNumber' is defined but never used               no-unused-vars
  12:7   warning  'ESTADOS_POSIBLES' is assigned a value but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\revision-ronda7-main\js\modules\presupuesto\index.js
  6:23  warning  'destroyChart' is defined but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\revision-ronda7-main\js\utils\export.js
  69:16  warning  'e' is defined but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\revision-ronda7-main\tests\unit\calculate.test.js
  7:23  warning  'depAnualLineaRecta' is defined but never used  no-unused-vars
  7:43  warning  'depAcumulada' is defined but never used        no-unused-vars
  7:57  warning  'valorEnLibros' is defined but never used       no-unused-vars
  8:3   warning  'ahorroMensual' is defined but never used       no-unused-vars
  8:18  warning  'saldoSemanal' is defined but never used        no-unused-vars

✖ 10 problems (0 errors, 10 warnings)
```
