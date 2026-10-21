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
