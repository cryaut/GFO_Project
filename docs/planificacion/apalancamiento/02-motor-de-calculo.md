# 02 — Motor de cálculo

- **Estado**: Pendiente
- **Fecha**: 2026-09-27
- **Depende de**: 01

## Objetivo

Escribir en `js/utils/calculate.js` las funciones puras de GAO, GAF y GAT del paso 01, con tests que reproducen sus casos resueltos a mano. Es el CP2 de la ficha. Las funciones reciben números ya derivados (MC, UAII, UAI…): sacarlos de los estados es el CP3.

## Funciones

Todas devuelven `number` o `null` (N/D). Ninguna lee el DOM, `window` ni `store`.

| Función | Fórmula | N/D cuando |
|---|---|---|
| `TASA_IR_DEFECTO` | Constante: 0.30 | — |
| `tasaImpuesto(ir, uai, tasaDefecto = TASA_IR_DEFECTO)` | IR / UAI si UAI > 0, `ir` es un número y el resultado está en [0, 1); si no, `tasaDefecto` | `tasaDefecto` fuera de [0, 1) y no se puede usar la efectiva |
| `gao(mc, uaii)` | MC / UAII | Falta un dato o UAII ≈ 0 |
| `gaf(uaii, uai, dap = 0, t = null)` | UAII / (UAI − DAP / (1 − T)) | Falta un dato, DAP < 0, DAP > 0 con T fuera de [0, 1) o denominador ≈ 0 |
| `gat(mc, uai, dap = 0, t = null)` | MC / (UAI − DAP / (1 − T)) | Igual que `gaf` |
| `gaoVariacion(ventasBase, ventas, uaiiBase, uaii)` | %ΔUAII / %ΔVentas | Falta un dato, una base ≤ 0 o %ΔVentas = 0 |
| `gafVariacion(uaiiBase, uaii, udacBase, udac)` | %ΔUDAC / %ΔUAII | Falta un dato, una base ≤ 0 o %ΔUAII = 0 |
| `gatVariacion(ventasBase, ventas, udacBase, udac)` | %ΔUDAC / %ΔVentas | Falta un dato, una base ≤ 0 o %ΔVentas = 0 |

Reglas comunes:

- **Falta un dato** es `null`, `undefined` o un valor que no es un número finito.
- **≈ 0** significa valor absoluto menor que 0.005 (medio centavo), según el paso 01. La tolerancia va en una constante interna, no exportada.
- **Valores negativos** (UAII < 0 o denominador del GAF < 0) se devuelven tal cual; la advertencia es de la interfaz ([D-008](../../decisiones.md)).
- **Orden de parámetros**: en las funciones por variación va primero el periodo base y después el actual. Por dentro usan `ahPctDelta(actual, base)`, que tiene el orden inverso.
- **T solo se valida si DAP > 0.** Con DAP = 0, `gaf` y `gat` aceptan `t = null`.
- **`ir = null` y `ir = 0` no son lo mismo.** `null` significa que el periodo no trae una cuenta de impuestos, y se usa la tasa por defecto. `0` es un IR informado, y da T = 0. Como `computeFinancialTotals` devuelve 0 cuando no hay cuenta de impuestos, el CP3 debe pasar `null` en ese caso.

`apalancamiento` (multiplicador de DuPont) no se toca.

## Tests

Van en `tests/unit/apalancamiento.test.js`. Se comparan con `toBeCloseTo(valor, 6)`, usando fracciones exactas en lugar de los valores redondeados del paso 01.

| Grupo | Casos | Esperado |
|---|---|---|
| Caso A, periodo 1 | `gao(400000, 150000)`, `gaf(150000, 100000, 7000, 0.3)`, `gat(400000, 100000, 7000, 0.3)` | 8/3, 5/3, 40/9 |
| Caso A, periodo 2 | Mismas funciones con MC 440,000, UAII 190,000 y UAI 140,000 | 44/19, 19/13, 44/13 |
| Caso A, variación | `gaoVariacion(1e6, 1.1e6, 150000, 190000)`, `gafVariacion(150000, 190000, 63000, 91000)`, `gatVariacion(1e6, 1.1e6, 63000, 91000)` | 8/3, 5/3, 40/9: iguales al periodo 1 |
| Caso B | UAII 0; UAII −40,000 con MC 160,000; denominador del GAF 0; ventas iguales; UAII base negativa | `null`, −4, `null`, `null`, `null` |
| Caso C, MUNO MODA | `gao(340000, 135000)`, `gao(255000, 135000)`, `gaoVariacion(850000, 920000, 135000, 155000)`, `gaf(135000, 140000)` | 2.518519, 1.888889, 1.798942, 0.964286 |
| `tasaImpuesto` | IR 30,000 con UAI 100,000; UAI ≤ 0; `ir` null; IR / UAI = 1.2; IR 0; tasa por defecto 1.5 sin tasa efectiva | 0.30, 0.30, 0.30, 0.30, 0, `null` |
| Datos faltantes | Cada función con un argumento `null`, `undefined` o `NaN` | `null` |
| Validación de DAP y T | DAP −1; DAP > 0 con T = 1 o T = null | `null` |

Cada test lleva en un comentario el cálculo a mano, como pide `docs/reglas/pruebas-y-documentacion.md`.

## Documentación en el mismo PR

- `docs/api.md`: una entrada por función, con la plantilla de `pruebas-y-documentacion.md`.
- `docs/contexto/dominio-financiero.md`: las funciones en el catálogo y T, MC, UAI, UDAC, GAO, GAF y GAT en la notación, que hoy dicen "No existe todavía".
- `CHANGELOG.md`: subsección de apalancamiento en "[Sin publicar]".
- Ficha de la feature: CP2 en la tabla de checkpoints.

`calculate.js` es compartido: avisar al equipo al abrir el PR en borrador. Solo se agregan funciones, sin cambiar las existentes.

## Checkpoint

- [ ] Las funciones de la tabla existen en `calculate.js`, con los nombres y parámetros de este paso.
- [ ] `apalancamiento.test.js` cubre todos los grupos de la tabla de tests, y pasa.
- [ ] `npm test` y `npm run lint` sin errores; `carga-modulos` confirma que no hay nombres duplicados.
- [ ] Documentación de la sección anterior actualizada.

## Preguntas abiertas

- Ninguna. Si al escribir los tests aparece un caso que el paso 01 no cubre, se anota aquí y se decide antes de seguir.

## Próximo paso

CP3: derivar Ventas, CV, CF, MC, UAII, UAI, IR, T, DAP y UDAC desde los estados de cada periodo, con la clasificación fija o variable del módulo ([D-004](../../decisiones.md)).
