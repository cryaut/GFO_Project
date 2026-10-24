# Ronda 3: N/D sin cambiar fórmulas

Fecha: 2026-10-18. Rama `feat/cuentas-identificador`; base `origin/main` `2c11c4d`. Alcance adoptado por Carlos después de aclarar que la restricción anterior respondía a que Cris trabajaba en Razones. Las rondas 2/3 comunican la aprobación de Cris de 1a/1b. Se registra la excepción limitada en D-047/D-048 y se corrige solo la atribución de D-044 a Cris, comunicada por Carlos.

## Implementación

- **1a:** `calculate.js` conserva N/D (`null`/`undefined`) antes de operar con operandos obligatorios. No se cambian fórmulas ni resultados con datos completos. DuPont conserva el objeto y sus componentes independientes. EFE no lanza con utilidad/lista/ajustes ausentes ni omite huecos de arrays dispersos.
- **1b:** `computeRazones` protege utilidad bruta, utilidad operativa, compras y capital de trabajo antes de llamar a los helpers. Usa el mismo capital protegido en su denominador. Preserva metadatos al recargar los estados y añade `notAvailableReasons`, con motivos originales por periodo y campo/operandos de la operación previa afectada.
- **Un periodo:** `saldoPromedio` es estricto; Análisis selecciona explícitamente el saldo final cuando no hay periodo previo. La aproximación anterior de compras con costo de ventas sin inventario comparable se conserva.
- **Compatibilidad D-005:** `tasaImpuesto` no deriva T con IR/UAI ausentes. Si no existe cuenta IR, Apalancamiento mantiene IR N/D y selecciona explícitamente la tasa configurada válida, conservando `origenT: defecto`, cifras y avisos. Si existe cuenta IR, usa el helper estricto. Se mantienen intactas sus pruebas de cálculo/UI.
- **Parámetros opcionales:** reserva omitida usa su default cero; DAP omitido conserva cero y no requiere una T inactiva; una tasa por defecto no se consume si hay efectiva válida. Un saldo obligatorio ausente sigue siendo N/D. No se modifican las convenciones legadas para casos completos con cero.

## Fuentes y catálogo

D-045 aplica el criterio de que PGC es referencia terminológica a las cuatro cuentas señaladas y a las otras 18 verificadas por el mismo respaldo. No se eliminan cuentas ni se alteran importes/tipos: el catálogo `2026-10-18.2` queda en **1 verified, 66 partially_verified y 5 ambiguous**. Se retira la cita de depreciación atribuida a amortización y se declara conjunta la de depreciación operativa.

D-046 corrige intangibles a «no monetarios», sin otro cambio de clasificación o cálculo. La fixture declara **28 diferencias de estado y una de definición** con la instantánea original de #10. Se conserva esa instantánea y los JSON ajenos; la sincronización v8 no se declara cerrada. Véase [investigación](investigacion.md).

## Pruebas y resultados

Se reprodujeron antes de corregir los fallos de operandos ausentes, metadatos descartados y restas previas. Una ejecución completa detectó cuatro regresiones por la política D-005: se resolvieron en la selección explícita del consumidor, sin debilitar esas pruebas. La revisión adicional detectó el array disperso en EFE, corregido con su regresión.

Pruebas añadidas:

- `calculate-nd.test.js`: todas las funciones escalares con datos completos y cada operando obligatorio null/undefined; DuPont, EOAF, EFE/listas, opciones inactivas y ceros explícitos.
- `analisis-nd.test.js`: márgenes/cobertura/compras y capital de trabajo N/D, motivos, metadatos al guardar/recargar, cero, un periodo/dos periodos y regresión de las 23 razones existentes en MUNO MODA 2023 y 2024.
- `cuentas-identificador.test.js`: guardia de PGC, corrección de amortización/depreciación y definición de intangibles. Se conserva el contraste explícito con la fuente del PR #10.

Cambios de expectativas anteriores:

| Archivo | Motivo |
|---|---|
| `calculate.test.js` | El helper `saldoPromedio(undefined, final)` ahora es N/D; la selección de un periodo se verifica en integración. |
| `metodologia-financiera.test.js` | Se separa el contrato del helper del caso válido de un periodo, que Análisis conserva explícitamente. |
| `apalancamiento.test.js` | Dos casos de IR ausente pasan de tasa inferida a N/D; la prueba de tasa alternativa inválida usa IR/UAI completos con efectiva inválida, para seguir comprobando ese camino. La integración de Apalancamiento conserva D-005. |
| `cuentas-identificador.test.js` | Se declaran todas las diferencias de investigación/definición; no se edita la instantánea para ocultarlas. |

Validación final: **752 pruebas pasan en 40 archivos**, código 0. Son 229 casos nuevos respecto a la entrega anterior: 218 de helpers, 8 de integración de Análisis y 3 de catálogo. `npm.cmd run lint`: código 0, **0 errores y las 10 advertencias previas**. Las pruebas de cálculo/UI de Apalancamiento permanecen intactas y pasan.

Salida de Vitest:

```text
 Test Files  40 passed (40)
      Tests  752 passed (752)
   Start at  22:58:11
   Duration  3.19s (transform 2.26s, setup 0ms, collect 6.52s, tests 13.87s, environment 10ms, prepare 8.30s)
```

Salida de ESLint:

```text
> gfo-toolkit@1.0.0 lint
> eslint js/ tests/

✖ 10 problems (0 errors, 10 warnings)
```

La descripción del PR pega ambas salidas completas. El ensayo de navegador/Excel del paso 01 es histórico; esta ronda se verifica con pruebas automatizadas de dominio, persistencia, recarga y pantalla existentes, sin presentar ese ensayo como repetido.

## Límites y cierre

No se implementa 1c: las lecturas por nombres fijos permanecen. No se registra D-049, no se conecta el nuevo motor ni se modifica la interfaz. D-001–D-027 permanecen iguales a `main`. Dividendos siguen derivados y sin confirmar. PR #14 se mantiene en borrador, sin merge. Antes de integrar siguen pendientes #10/v8, reconciliación de investigación y numeración D-029–D-034 → D-037–D-042.
