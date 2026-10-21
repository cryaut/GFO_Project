# Ronda 5: intereses y comparación de utilidad

Fecha de implementación: 2026-10-20. Encargo: `instrucciones_carlos_pr14_ronda5.md`, recibido por Carlos, fechado 2026-10-19. Rama `feat/cuentas-identificador`, PR #14; base de esta ronda `ce6daac8954f4d69ef0791a93182de16af46acc9`. D-051 registra la aprobación de Cris Lumbi, sin reutilizar D-049 ni D-050.

## Cambio aplicado

Se elige el campo opcional `agrupadoEn: 'is.nonoperating_income'` en `is.interest_income`, porque `obtenerCuenta` y `listarCuentas` ya devuelven una copia de la definición completa. No hace falta exportar un mapa separado. Ambas cuentas conservan `tipoApp: 'otrosIngresos'`. La nota de intereses explica la relación D-051 y se retira solo el alias «ingresos financieros no clasificados en otra cuenta específica»; la definición de ingresos no operativos queda intacta.

Catálogo `2026-10-20.1`: siguen siendo 72 cuentas, 1 verificada, 66 parciales y 5 ambiguas. La aprobación del agrupamiento no añade evidencia externa ni eleva estados de investigación. API, dominio e investigación documentan la relación. Las consultas por id siguen consultando ese id; el campo no ejecuta una agregación automática ni demuestra la aceptación de un motor futuro.

## Sinónimos: conflicto detectado en el encargo

La exigencia «ningún sinónimo aparece en dos cuentas» contradice siete alias exactos compartidos ya existentes, que forman ocho colisiones al aplicar la normalización del identificador. Varias están probadas para exigir contexto o confirmación; eliminarlas cambiaría la identificación anterior y D-031. Se consultó a Carlos sobre conservar esos casos o ampliar la depuración. Mientras no se cierre esa elección, se conserva el comportamiento previo y se añade una guardia contra colisiones nuevas o cambios en las cuentas participantes.

La guardia **no equivale a unicidad absoluta**. No se da por cerrado ese requisito literal ni se eliminan aliases adicionales. La depuración completa sigue pendiente de decisión; no se atribuye su aprobación a Cris.

| Sinónimo normalizado compartido | Cuentas existentes |
|---|---|
| `costo bienes vendidos` | `is.cost_of_sales_reported`, `is.merchandise_cost` |
| `equipos` | `bs.ppe_furniture`, `bs.ppe_machinery` |
| `otros gastos` | `is.noninterest_nonoperating_expenses`, `is.other_operating_expenses` |
| `otros ingresos` | `is.nonoperating_income`, `is.other_operating_income` |
| `pasivo corto plazo` | `bs.other_current_liabilities`, `bs.short_term_borrowings` |
| `provisiones` | `bs.current_provisions`, `bs.long_term_provisions` |
| `reservas` | `bs.legal_reserve`, `bs.other_reserves` |
| `utilidad ejercicio` | `bs.current_year_result_equity`, `is.net_income_reported` |

El primer caso proviene de «costo de los bienes vendidos» y «costo de bienes vendidos»; los demás comparten el texto exacto antes de normalizar. La colisión de utilidad cruza patrimonio/estado de resultados y puede resolverse con el grupo. No se afirma que todos los casos tengan idéntico tratamiento.

## Validación

Se reprodujo el fallo de la nueva prueba de agrupación antes del cambio: 1 fallida y 73 correctas en los dos archivos de cuentas. El caso existente con ventas 100, intereses ganados 20 e intereses pagados 5 conservó utilidad neta 115. Se refuerza ese mismo caso con la comprobación del tipo `otrosIngresos`, sin duplicarlo ni añadir una prueba de aceptación app/JSON.

Las pruebas nuevas comprueban la relación D-051, ambos tipos, la nota, la retirada del alias y las ocho colisiones heredadas. Validación final: `npm.cmd test`, **754 pruebas correctas en 40 archivos**, código 0; `npm.cmd run lint`, **0 errores y las 10 advertencias previas**, código 0. La descripción del PR pega ambas salidas completas. No se repite el ensayo histórico de navegador/Excel por este cambio de metadatos.

```text
 Test Files  40 passed (40)
      Tests  754 passed (754)
   Start at  21:35:51
   Duration  3.13s (transform 2.49s, setup 0ms, collect 6.97s, tests 13.17s, environment 10ms, prepare 8.11s)
```

```text
> gfo-toolkit@1.0.0 lint
> eslint js/ tests/

✖ 10 problems (0 errors, 10 warnings)
```

## Comparación en lectura y límites

La [tabla de comparación de utilidad](06-comparacion-utilidad-json.md) fija referencias inmutables de la app y de `feat/razones-json-v3`, indica ids y líneas y clasifica diferencias sin proponer arreglos. Se revisan los 20 JSON; tres definen `derived.net_income`. No se ejecuta ni modifica el nuevo motor.

Desde `ce6daac` no cambian fórmulas, `calculate.js`, Análisis, totales, 1c, D-001–D-027 ni archivos de razones JSON. D-049 y D-050 permanecen fuera de esta rama. La referencia de #10 sigue siendo `a87ef0af0954e00d3f95ed1476ec3154bc06d768`; no se declara sincronización con v8. El PR #14 permanece en borrador, sin merge.
