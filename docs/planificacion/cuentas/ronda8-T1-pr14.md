# Ronda 8 — Tarea 1: pendientes del PR #14

Fecha de elaboración: 21 de octubre de 2026. Encargo: ronda 8 del 20 de octubre de 2026.

**Estado: listo para revisión de esta tarea documental.** Se agrega la aclaración literal solicitada en D-047 y se reproducen las pruebas, el lint y el inventario de cruces sobre el commit fijado. No se cambia código ni se repiten las restauraciones ya hechas en rondas anteriores. Ningún PR se fusiona.

## Referencias y método

| Referencia | Commit inmutable |
|---|---|
| PR #14 y ejecución de pruebas/lint de esta entrega | `10dfa3abc95995d28b46eac43ea1465b83a18847` |
| Padre para explicar el cambio del número de pruebas | `7e71ad88c88bf8b0dda363dffe2973022c7f47a0` |
| Main, en copia aislada para repetir lint | `2c11c4d77bb098c684217bd34b31a39ab35c82b1` |

Se comprobó que el checkout estaba limpio y su HEAD era `10dfa3a` antes de ejecutar `npm test` y `npm run lint`. Main se consultó en la copia separada `revision-ronda7-main`, también limpia y fijada a `2c11c4d`. Las únicas modificaciones de ronda 8 T1 son documentación; los árboles `js/` y `tests/` se conservan idénticos a `10dfa3a`.

## a. D-047: aclaración literal añadida

En `docs/decisiones.md`, dentro del bloque D-047 y después de la aclaración R6 existente, se añade sin borrar nada:

> Aclaración (20 de octubre de 2026): el cambio de TasaImpuesto en Apalancamiento descrito arriba se revirtió en el commit 10dfa3a (ronda 4). Apalancamiento vuelve a usar la tasa configurada válida (D-005) cuando falta el IR.

La mención «ronda 4» se conserva literalmente porque forma parte del texto solicitado; el commit citado y el informe histórico se titulan ronda 6. No se reescribe el historial para resolver esa diferencia de etiqueta. D-001–D-027 y la numeración D-029–D-034 no se modifican; no se registra D-049.

## b. D-052: siete alias literales y ocho cruces normalizados

La enumeración independiente lee todos los `sinonimos` de las 72 cuentas y aplica la misma función `normalizarCuenta` que usa el identificador. Resultado: **7 alias literalmente compartidos y 8 claves compartidas después de normalizar**, cada una con dos cuentas.

| Sinónimo(s) exactos de origen | Forma normalizada | Cuenta 1 | Cuenta 2 |
|---|---|---|---|
| `Provisiones` | `provisiones` | `bs.current_provisions` — Provisiones corrientes | `bs.long_term_provisions` — Provisiones de largo plazo |
| `Utilidad del ejercicio` | `utilidad ejercicio` | `bs.current_year_result_equity` — Resultado del período incluido en patrimonio | `is.net_income_reported` — Utilidad neta reportada |
| `Reservas` | `reservas` | `bs.legal_reserve` — Reserva legal | `bs.other_reserves` — Otras reservas patrimoniales |
| `Pasivo Corto Plazo` | `pasivo corto plazo` | `bs.other_current_liabilities` — Otros pasivos corrientes | `bs.short_term_borrowings` — Préstamos de corto plazo |
| `Equipos` | `equipos` | `bs.ppe_furniture` — Mobiliario y equipo de oficina | `bs.ppe_machinery` — Maquinaria y equipo |
| `Otros Gastos` | `otros gastos` | `is.noninterest_nonoperating_expenses` — Gastos no operativos distintos de intereses | `is.other_operating_expenses` — Otros gastos operativos |
| `Otros Ingresos` | `otros ingresos` | `is.nonoperating_income` — Ingresos no operativos | `is.other_operating_income` — Otros ingresos operativos |
| `costo de los bienes vendidos` / `costo de bienes vendidos` | `costo bienes vendidos` | `is.cost_of_sales_reported` — Costo de ventas reportado | `is.merchandise_cost` — Costo de mercadería vendida |

**El octavo que falta en la referencia de siete alias es el cruce de costo.** No es otro alias literal: la normalización elimina `de` y `los`, por lo que ambas variantes terminan en `costo bienes vendidos`. La lista de siete y la de ocho no están contando exactamente lo mismo.

Evidencia en `10dfa3a`: `normalizarCuenta`, `js/modules/estados/cuentas-similitud.js:1–5`; guardia del conjunto completo, `tests/unit/cuentas-identificador.test.js:176–200`. El registro D-052 declara ocho desde su creación en `7e71ad8`, sin añadir un cruce al catálogo en ese commit. No se cambia el catálogo ni la prueba.

## c. Por qué 754 pasó a 753

El cambio se encuentra en `10dfa3a`, contra su padre `7e71ad8`, en `tests/unit/calculate-nd.test.js`: **218 → 217 casos** en ese archivo y **754 → 753** en total. Los otros archivos conservan sus cantidades.

| Instancia de prueba | Cambio en `10dfa3a` | Motivo |
|---|---|---|
| `tasaImpuesto: propagación de N/D > conserva el resultado con datos completos` | Se retira de la tabla genérica `casos` | La tasa vuelve al contrato específico D-005; sus casos completos permanecen cubiertos por Apalancamiento. |
| `tasaImpuesto: propagación de N/D > cada operando obligatorio null produce N/D` | Se retira de la tabla genérica | Imponía N/D a IR/UAI ausentes, contrario a la excepción D-005 restaurada. |
| `tasaImpuesto: propagación de N/D > cada operando obligatorio undefined produce N/D` | Se retira de la tabla genérica | Mismo motivo para `undefined`. |
| `Parámetros opcionales y ceros explícitos > D-005 conserva la tasa configurada con IR o UAI null` | Se añade como instancia de `it.each([null, undefined])` | Comprueba tasa por defecto/configurada, cero válido y alternativa inválida bajo D-005. |
| `Parámetros opcionales y ceros explícitos > D-005 conserva la tasa configurada con IR o UAI undefined` | Se añade como segunda instancia | Mismo contrato para `undefined`. |

El test `la tasa alternativa se usa solo con datos completos y efectiva inválida` se **renombra** a `D-005 usa la tasa alternativa válida si la efectiva no está disponible` y ajusta su esperado para IR ausente. Sigue siendo una prueba, no modifica el conteo. `apalancamiento.test.js` conserva 32 casos y vuelve íntegramente a main; cambian sus expectativas a las originales D-005, no su cantidad. No se divide ni se oculta una prueba fallida.

La cuenta es **754 − 3 + 2 = 753**. `git diff 7e71ad8 10dfa3a -- tests/unit/calculate-nd.test.js tests/unit/apalancamiento.test.js` muestra el cambio; la suite reproducida más abajo confirma 753 casos correctos en 40 archivos. La ronda 8 no vuelve a modificar esos tests.

## d. Las dos incertidumbres contenidas en una fila «no sé»

El archivo de comparación contiene **una fila** con la clasificación «No sé» (`docs/planificacion/cuentas/06-comparacion-utilidad-json.md:63`), y esa fila contiene las dos incertidumbres solicitadas. Las distingue expresamente en sus líneas 78–83. No se inventa una segunda fila.

| Incertidumbre | Archivo y línea de evidencia | Dato o prueba que la resolvería |
|---|---|---|
| No está probado que un consumidor incorpore el interés separado dentro del agregado `is.nonoperating_income` | `docs/planificacion/cuentas/06-comparacion-utilidad-json.md:82`; relación del catálogo en `js/modules/estados/cuentas-catalogo.js:1587`; operando del JSON de margen neto en `a87ef0a:docs/razones_financieras/rentabilidad_margen_utilidad_neta.json:147–148` | Una traza de alimentación por ids y una prueba de aceptación del consumidor con ventas 100, interés ganado separado 20, gasto por intereses 5 y sin utilidad reportada; contrastar 115 con la app. No se ejecuta el motor ni se propone un cambio. |
| Se desconoce si el importe agregado ya incluye el interés mostrado también por separado | `docs/planificacion/cuentas/06-comparacion-utilidad-json.md:83` y límite de entrada en la línea 74 | El estado de origen con nota o desglose explícito de la composición del agregado, su traza de importación y una prueba de aceptación con ese archivo y utilidad calculada a mano. No hay en el informe un archivo de entrada identificado que permita decidirlo. |

Las líneas de esta sección se refieren al contenido inmutable de `10dfa3a`, excepto el JSON citado, fijado a `a87ef0a`. Ninguna se altera en esta entrega. No se cambia código, no se define política de consolidación y no se propone un arreglo para estas incertidumbres.

## e. Lint: mismas diez advertencias de main

Ambas ejecuciones terminan con **código 0, 0 errores y 10 advertencias**. Al retirar únicamente el prefijo absoluto de cada copia, las tuplas archivo/línea/columna/regla/mensaje coinciden:

| Archivo relativo | Línea:columna | Advertencia en PR #14 y main |
|---|---|---|
| `js/components/tabla.js` | `2:25` | `striped`, asignada y no usada (`no-unused-vars`) |
| `js/modules/activos/index.js` | `3:26` | `formatNumber`, definida y no usada |
| `js/modules/activos/index.js` | `12:7` | `ESTADOS_POSIBLES`, asignada y no usada |
| `js/modules/presupuesto/index.js` | `6:23` | `destroyChart`, definida y no usada |
| `js/utils/export.js` | `69:16` | `e`, definida y no usada |
| `tests/unit/calculate.test.js` | `7:23` | `depAnualLineaRecta`, definida y no usada |
| `tests/unit/calculate.test.js` | `7:43` | `depAcumulada`, definida y no usada |
| `tests/unit/calculate.test.js` | `7:57` | `valorEnLibros`, definida y no usada |
| `tests/unit/calculate.test.js` | `8:3` | `ahorroMensual`, definida y no usada |
| `tests/unit/calculate.test.js` | `8:18` | `saldoSemanal`, definida y no usada |

Todas corresponden a `no-unused-vars`. Se adjuntan a continuación las salidas completas de esta ejecución y después la respuesta íntegra de ronda 6. La misma lista de cruces y las salidas de `npm test`/`npm run lint` de `10dfa3a` se incluyen en la descripción del PR #14.

## Salidas completas reproducidas

### npm test — PR #14, commit 10dfa3a

```text
> gfo-toolkit@1.0.0 test
> vitest run


 RUN  v3.2.7 C:/Users/carlo/Desktop/GFO Project/GFO_Project

 ✓ tests/unit/presupuesto-personal.test.js (6 tests) 308ms
 ✓ tests/unit/cuentas-identificador.test.js (55 tests) 253ms
 ✓ tests/unit/cuentas-registro.test.js (20 tests) 276ms
 ✓ tests/unit/estados-acceptance.test.js (6 tests) 545ms
 ✓ tests/unit/apalancamiento-ui.test.js (17 tests) 399ms
 ✓ tests/unit/planeacion.test.js (17 tests) 295ms
 ✓ tests/unit/analisis-razones.test.js (5 tests) 861ms
   ✓ cobertura de intereses > se calcula con los intereses del estado de resultados  421ms
 ✓ tests/unit/inicio-navegador.test.js (4 tests) 959ms
   ✓ cargar ejemplos > llena los módulos vacíos de la empresa con el caso de MUNO MODA, sin tocar lo personal  606ms
 ✓ tests/unit/proforma.test.js (9 tests) 681ms
 ✓ tests/unit/carga-modulos.test.js (2 tests) 1131ms
   ✓ carga de módulos > js/app.js carga todo el grafo de módulos y registra el arranque  665ms
   ✓ carga de módulos > cada archivo de js/ se puede importar sin errores  464ms
 ✓ tests/unit/integracion-ui.test.js (9 tests) 1153ms
   ✓ Reportes: importar JSON > valida, pide confirmación y guarda los módulos del respaldo  368ms
 ✓ tests/unit/analisis-nd.test.js (8 tests) 1038ms
 ✓ tests/unit/inventario.test.js (19 tests) 73ms
 ✓ tests/unit/eoaf.test.js (24 tests) 1066ms
   ✓ pantalla de EOAF en Análisis > un importe no numérico no deja vacía la pantalla de Análisis  465ms
 ✓ tests/unit/calculate-nd.test.js (217 tests) 38ms
 ✓ tests/unit/cuentas-revision.test.js (15 tests) 1186ms
 ✓ tests/unit/equilibrio.test.js (17 tests) 153ms
 ✓ tests/unit/flujo.test.js (12 tests) 51ms
 ✓ tests/unit/efe.test.js (23 tests) 1443ms
   ✓ pantalla de EFE en Análisis > un importe no numérico guardado no deja vacía la pantalla de Análisis  459ms
 ✓ tests/unit/cuentas-ui.test.js (2 tests) 31ms
 ✓ tests/unit/razones-mercado.test.js (12 tests) 655ms
 ✓ tests/unit/estados-import.test.js (15 tests) 158ms
 ✓ tests/unit/inicio.test.js (17 tests) 587ms
 ✓ tests/unit/comprobacion.test.js (14 tests) 94ms
 ✓ tests/unit/estados-calculations.test.js (28 tests) 427ms
 ✓ tests/unit/format.test.js (18 tests) 32ms
 ✓ tests/unit/estados-formato-ui.test.js (1 test) 44ms
 ✓ tests/unit/estados-import-formatos.test.js (17 tests) 39ms
 ✓ tests/unit/integracion-respaldo.test.js (10 tests) 20ms
 ✓ tests/unit/orden-periodos.test.js (3 tests) 20ms
 ✓ tests/unit/integracion-reporte.test.js (7 tests) 125ms
 ✓ tests/unit/apalancamiento.test.js (32 tests) 11ms
 ✓ tests/unit/apalancamiento-calculations.test.js (21 tests) 55ms
 ✓ tests/unit/calculate.test.js (28 tests) 11ms
 ✓ tests/unit/razones-adicionales.test.js (5 tests) 6ms
 ✓ tests/unit/metodologia-financiera.test.js (10 tests) 8ms
 ✓ tests/unit/razones-unificadas.test.js (8 tests) 8ms
 ✓ tests/unit/presupuesto.test.js (8 tests) 5ms
 ✓ tests/unit/depreciacion.test.js (11 tests) 6ms
 ✓ tests/unit/analisis-reexports.test.js (1 test) 2ms

 Test Files  40 passed (40)
      Tests  753 passed (753)
   Start at  20:14:52
   Duration  3.58s (transform 3.10s, setup 0ms, collect 7.54s, tests 14.25s, environment 10ms, prepare 9.27s)
```

### npm run lint — PR #14, commit 10dfa3a

```text
> gfo-toolkit@1.0.0 lint
> eslint js/ tests/


C:\Users\carlo\Desktop\GFO Project\GFO_Project\js\components\tabla.js
  2:25  warning  'striped' is assigned a value but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\GFO_Project\js\modules\activos\index.js
   3:26  warning  'formatNumber' is defined but never used               no-unused-vars
  12:7   warning  'ESTADOS_POSIBLES' is assigned a value but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\GFO_Project\js\modules\presupuesto\index.js
  6:23  warning  'destroyChart' is defined but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\GFO_Project\js\utils\export.js
  69:16  warning  'e' is defined but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\GFO_Project\tests\unit\calculate.test.js
  7:23  warning  'depAnualLineaRecta' is defined but never used  no-unused-vars
  7:43  warning  'depAcumulada' is defined but never used        no-unused-vars
  7:57  warning  'valorEnLibros' is defined but never used       no-unused-vars
  8:3   warning  'ahorroMensual' is defined but never used       no-unused-vars
  8:18  warning  'saldoSemanal' is defined but never used        no-unused-vars

✖ 10 problems (0 errors, 10 warnings)
```

### npm run lint — main aislado, commit 2c11c4d

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

## Comprobaciones documentales de esta entrega

- Salidas de lint iguales después de sustituir exclusivamente el prefijo absoluto de cada copia. SHA-256 normalizado: `89590bd789cc3ae32b2b1c0bf045a4633cca8ce95f992601bc8b3af1612ee398`.
- `git diff 10dfa3a -- js/ tests/`: vacío.
- Prefijo de decisiones anterior a D-047 y sufijo desde D-048: idénticos a 10dfa3a. No se renumeran decisiones ni se registra D-049.
- El octavo cruce se enumeró independientemente desde el catálogo; el resultado íntegro está en la evidencia externa `pr14-cruces-10dfa3a.json`.

## Anexo — Respuesta íntegra de ronda 6 en Markdown

Se reproduce sin reescribir el informe histórico `docs/planificacion/cuentas/07-ronda6-validacion.md` tal como está en `10dfa3a`. Sus fechas, resultados y vínculos relativos pertenecen a esa entrega; los resultados nuevos están arriba. El anexo se consulta con sus vínculos relativos desde la carpeta versionada de cuentas.

---

# Ronda 6: restauración de D-005 y verificación del PR #14

Fecha: 2026-10-20. Rama `feat/cuentas-identificador`; base de esta ronda `7e71ad88c88bf8b0dda363dffe2973022c7f47a0`. `origin/main` consultado: `2c11c4d77bb098c684217bd34b31a39ab35c82b1`. Las referencias `origin/cuentas-id` del encargo no existen en este remoto; el PR #14 usa la rama indicada.

## 1. Tasa de impuesto restaurada

Se retira únicamente la guarda de ausencia de `tasaImpuesto`, que vuelve a ser idéntica a la función de `main`. Sin una tasa efectiva disponible selecciona la tasa configurada válida (D-005). Antes del cambio, la observación de `tasaImpuesto(null, 100000)` y de la variante con 0.15 configurado devolvió null en ambos casos; ahora se recuperan 0.30 y 0.15.

`apalancamiento-calculations.js` y `tests/unit/apalancamiento.test.js` se restauran completos a `main`; el diff de esos dos archivos contra esa referencia está vacío. `saldoPromedio` permanece idéntico a la base de esta ronda. Las demás guardas de D-047/D-048 siguen vigentes.

El [diff completo de calculate.js y Apalancamiento contra main](ronda6-diff-con-main.patch) incluye todos los cambios actuales del PR en esos archivos, con contexto cero. El helper restaurado no aparece como cambio contra `main`; los otros helpers sí conservan las guardas de N/D autorizadas anteriormente. Apalancamiento no aporta diferencias.

`git grep -n tasaImpuesto -- js/ tests/` identifica un solo consumidor de producción: `js/modules/apalancamiento/apalancamiento-calculations.js:133` (importación en línea 6). La definición está en `js/utils/calculate.js:290`; el resto de usos está en las pruebas `apalancamiento.test.js` y `calculate-nd.test.js`. No hay otro consumidor de producción que adaptar.

Se retiran los tres casos generados que imponían a `tasaImpuesto` el contrato general de N/D y se añaden dos casos de D-005 (null/undefined), con IR o UAI ausentes, tasa configurada cero válida y tasa inválida. La prueba existente de alternativa se ajusta al contrato restaurado. Los casos completos y las expectativas originales siguen cubiertos por `apalancamiento.test.js`. El total pasa de 754 a **753**, sin ocultar una prueba fallida.

## 2. Historial de D-044 y D-047

`git log -S '### D-044' -- docs/decisiones.md` localiza su creación en `b15ddde`. Se recupera íntegramente ese bloque, incluido el título «por instrucción de Carlos», `Estado: Vigente` y la línea original de `Decidió`. Se añade después, sin atribuir motivos nuevos:

> Aclaración (18 de octubre de 2026): la decisión y la instrucción fueron de Cris Lumbi. Carlos la transmitió en el chat.

D-047 conserva todo su texto histórico y añade la aclaración del 20 de octubre sobre la excepción D-005 y la restauración solicitada. Una revisión independiente compara ambos bloques con el historial; D-001–D-027 permanecen intactas.

## 3. Pruebas, lint y línea base

| Referencia | Pruebas | Archivos | Lint | Códigos |
|---|---|---|---|---|
| main 2c11c4d, copia aislada | 436 correctas | 34 | 0 errores, 10 advertencias | 0 / 0 |
| PR #14 después de R6 | 753 correctas | 40 | 0 errores, 10 advertencias | 0 / 0 |

Las diez advertencias coinciden con la [línea base de main, salida y lista completa](ronda7-A-linea-base-main.md): `tabla.js:2:25`, `activos/index.js:3:26` y `12:7`, `presupuesto/index.js:6:23`, `utils/export.js:69:16`, `calculate.test.js:7:23`, `7:43`, `7:57`, `8:3` y `8:18`. **No hay advertencias nuevas**. Las salidas completas siguientes también se pegan en la descripción del PR; este informe no reemplaza esa entrega.

### Salida completa de npm test

```text

> gfo-toolkit@1.0.0 test
> vitest run


 RUN  v3.2.7 C:/Users/carlo/Desktop/GFO Project/GFO_Project

 ✓ tests/unit/estados-calculations.test.js (28 tests) 417ms
 ✓ tests/unit/apalancamiento-ui.test.js (17 tests) 515ms
 ✓ tests/unit/planeacion.test.js (17 tests) 417ms
 ✓ tests/unit/estados-acceptance.test.js (6 tests) 918ms
   ✓ imports external JSON through Estados, previews, saves once and reloads  371ms
 ✓ tests/unit/analisis-razones.test.js (5 tests) 1218ms
   ✓ cobertura de intereses > se calcula con los intereses del estado de resultados  484ms
   ✓ cobertura de intereses > genera un hallazgo cuando está bajo el umbral  346ms
 ✓ tests/unit/inicio-navegador.test.js (4 tests) 1307ms
   ✓ cargar ejemplos > llena los módulos vacíos de la empresa con el caso de MUNO MODA, sin tocar lo personal  872ms
 ✓ tests/unit/proforma.test.js (9 tests) 1047ms
   ✓ estado de resultados proforma frente al real > real 2024 y proforma de cuatro trimestres  350ms
 ✓ tests/unit/razones-mercado.test.js (12 tests) 1073ms
   ✓ demo MUNO MODA coherente > cuadra A = P + O en los dos periodos  319ms
 ✓ tests/unit/inicio.test.js (17 tests) 1111ms
   ✓ tendencia y KPIs > serie por periodo y variación contra el periodo anterior  405ms
 ✓ tests/unit/carga-modulos.test.js (2 tests) 1635ms
   ✓ carga de módulos > js/app.js carga todo el grafo de módulos y registra el arranque  1067ms
   ✓ carga de módulos > cada archivo de js/ se puede importar sin errores  566ms
 ✓ tests/unit/integracion-ui.test.js (9 tests) 1563ms
   ✓ Reportes: importar JSON > valida, pide confirmación y guarda los módulos del respaldo  617ms
 ✓ tests/unit/eoaf.test.js (24 tests) 1521ms
   ✓ pantalla de EOAF en Análisis > presenta el balance comparado, los subtotales y la comprobación  422ms
   ✓ pantalla de EOAF en Análisis > un importe no numérico no deja vacía la pantalla de Análisis  495ms
 ✓ tests/unit/analisis-nd.test.js (8 tests) 1571ms
   ✓ costo N/D conserva N/D antes de restar márgenes, cobertura y compras  486ms
 ✓ tests/unit/cuentas-identificador.test.js (55 tests) 239ms
 ✓ tests/unit/cuentas-registro.test.js (20 tests) 295ms
 ✓ tests/unit/estados-import.test.js (15 tests) 166ms
 ✓ tests/unit/presupuesto-personal.test.js (6 tests) 146ms
 ✓ tests/unit/cuentas-revision.test.js (15 tests) 1669ms
   ✓ la cuenta pendiente con cero en ambos años no cambia los totales ni EFE/EOAF de MUNO MODA  552ms
 ✓ tests/unit/efe.test.js (23 tests) 1737ms
   ✓ pantalla de EFE en Análisis > un importe no numérico guardado no deja vacía la pantalla de Análisis  471ms
 ✓ tests/unit/equilibrio.test.js (17 tests) 80ms
 ✓ tests/unit/comprobacion.test.js (14 tests) 87ms
 ✓ tests/unit/calculate-nd.test.js (217 tests) 48ms
 ✓ tests/unit/apalancamiento-calculations.test.js (21 tests) 67ms
 ✓ tests/unit/integracion-reporte.test.js (7 tests) 222ms
 ✓ tests/unit/format.test.js (18 tests) 36ms
 ✓ tests/unit/estados-formato-ui.test.js (1 test) 47ms
 ✓ tests/unit/flujo.test.js (12 tests) 99ms
 ✓ tests/unit/apalancamiento.test.js (32 tests) 13ms
 ✓ tests/unit/integracion-respaldo.test.js (10 tests) 29ms
 ✓ tests/unit/inventario.test.js (19 tests) 89ms
 ✓ tests/unit/orden-periodos.test.js (3 tests) 23ms
 ✓ tests/unit/metodologia-financiera.test.js (10 tests) 9ms
 ✓ tests/unit/calculate.test.js (28 tests) 13ms
 ✓ tests/unit/estados-import-formatos.test.js (17 tests) 41ms
 ✓ tests/unit/cuentas-ui.test.js (2 tests) 42ms
 ✓ tests/unit/razones-adicionales.test.js (5 tests) 7ms
 ✓ tests/unit/razones-unificadas.test.js (8 tests) 6ms
 ✓ tests/unit/depreciacion.test.js (11 tests) 5ms
 ✓ tests/unit/presupuesto.test.js (8 tests) 6ms
 ✓ tests/unit/analisis-reexports.test.js (1 test) 4ms

 Test Files  40 passed (40)
      Tests  753 passed (753)
   Start at  22:29:08
   Duration  6.40s (transform 4.05s, setup 0ms, collect 9.15s, tests 19.53s, environment 11ms, prepare 12.45s)
```

### Salida completa de npm run lint

```text

> gfo-toolkit@1.0.0 lint
> eslint js/ tests/


C:\Users\carlo\Desktop\GFO Project\GFO_Project\js\components\tabla.js
  2:25  warning  'striped' is assigned a value but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\GFO_Project\js\modules\activos\index.js
   3:26  warning  'formatNumber' is defined but never used               no-unused-vars
  12:7   warning  'ESTADOS_POSIBLES' is assigned a value but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\GFO_Project\js\modules\presupuesto\index.js
  6:23  warning  'destroyChart' is defined but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\GFO_Project\js\utils\export.js
  69:16  warning  'e' is defined but never used  no-unused-vars

C:\Users\carlo\Desktop\GFO Project\GFO_Project\tests\unit\calculate.test.js
  7:23  warning  'depAnualLineaRecta' is defined but never used  no-unused-vars
  7:43  warning  'depAcumulada' is defined but never used        no-unused-vars
  7:57  warning  'valorEnLibros' is defined but never used       no-unused-vars
  8:3   warning  'ahorroMensual' is defined but never used       no-unused-vars
  8:18  warning  'saldoSemanal' is defined but never used        no-unused-vars

✖ 10 problems (0 errors, 10 warnings)
```

## 4. D-052: lista verificable de cruces

Son **siete alias exactos compartidos y ocho cruces normalizados**; el octavo no es otro alias exacto, sino dos variantes que se normalizan igual. Carlos aprobó conservarlos y bloquear cruces nuevos. La prueba de `cuentas-identificador.test.js` verifica el conjunto de ocho y sus participantes.

| Sinónimo(s) de origen | Forma normalizada | Cuenta 1 | Cuenta 2 |
|---|---|---|---|
| Provisiones | `provisiones` | `bs.current_provisions` | `bs.long_term_provisions` |
| Utilidad del ejercicio | `utilidad ejercicio` | `bs.current_year_result_equity` | `is.net_income_reported` |
| Reservas | `reservas` | `bs.legal_reserve` | `bs.other_reserves` |
| Pasivo Corto Plazo | `pasivo corto plazo` | `bs.other_current_liabilities` | `bs.short_term_borrowings` |
| Equipos | `equipos` | `bs.ppe_furniture` | `bs.ppe_machinery` |
| Otros Gastos | `otros gastos` | `is.noninterest_nonoperating_expenses` | `is.other_operating_expenses` |
| Otros Ingresos | `otros ingresos` | `is.nonoperating_income` | `is.other_operating_income` |
| costo de los bienes vendidos / costo de bienes vendidos | `costo bienes vendidos` | `is.cost_of_sales_reported` | `is.merchandise_cost` |

La verificación de D-031 y los casos de importación se documentan con archivo/línea en el [inventario de ronda 7 B](ronda7-B-inventario-nombres-fijos.md). «Otros ingresos» y «Otros gastos» se envían a confirmación; «Utilidad del ejercicio» con grupo de resultados se reconoce por contexto como utilidad reportada, mientras que sin grupo queda sugerida. Se conserva ese comportamiento y se reporta la diferencia; no se altera el importador en esta ronda.

## 5. Incertidumbres de utilidad

El [informe de comparación](06-comparacion-utilidad-json.md) contiene una sola fila «no sé», con dos incertidumbres: si el consumidor materializa el interés separado en el agregado y si el agregado ya incluye ese interés. Se añade qué traza, archivo de origen y prueba de aceptación permitirían resolver cada una. No se inventa una segunda fila, no se propone un arreglo y no se ejecuta el motor.

## 6. Confirmación de 1c

Carlos confirmó expresamente en el chat del 2026-10-20: **sí, retirar las 22 lecturas por nombres fijos en una ronda aparte**, definiendo y probando antes el tratamiento de datos que no se pueden normalizar. La confirmación se pidió con el inventario B y sus efectos concretos disponibles; no se deduce de la entrega de los documentos. En estas rondas 6/7 solo se registra la respuesta: **no se implementa 1c ni se registra D-049**. La ronda futura deberá conservar las fórmulas y definir los casos de aceptación P1/P2 antes de cambiar los respaldos.

## Límites y tarea C

D-051, intangibles, catálogo y citas del PR #14 no cambian. No se renumeran D-029–D-034 ni se modifica el motor. La tarea C de ronda 7 se trabaja en otra copia y rama; no se mezclan sus JSON con este PR. Ningún PR se fusiona.
