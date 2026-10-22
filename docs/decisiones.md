# Registro de decisiones

Decisiones discutibles del proyecto: las que tenían alternativas razonables y que alguien del equipo, el docente o un usuario podría pedir cambiar. Cada entrada explica qué se eligió, por qué y qué habría que tocar para revertirla, así que un cambio futuro no obliga a reconstruir la discusión.

## Cuándo registrar una decisión

Regístrala si se cumple al menos una de estas condiciones:

- Había dos o más opciones defendibles y se eligió una.
- Se aparta de un libro de texto, de una norma o de lo que ya hacía el código.
- Cambia un resultado que ve el usuario: una cifra, un N/D o una advertencia.
- Afecta a más de un módulo o a un archivo compartido.
- Alguien del equipo no estuvo de acuerdo.

No hace falta registrar nombres de variables, estilo ni detalles que se cambian sin consecuencias.

## Reglas

- Numeración `D-NNN` correlativa. Un número no se reutiliza.
- Una decisión no se borra ni se reescribe. Para cambiarla, crea una entrada nueva y marca la anterior "Reemplazada por D-NNN".
- La entrada va en el mismo commit o PR que aplica la decisión.
- Si la decisión nació en un paso de planificación, enlázalo; el detalle queda allí y aquí el resumen.

## Plantilla

````markdown
### D-NNN — Título corto

- **Fecha**: AAAA-MM-DD
- **Estado**: Vigente | Reemplazada por D-NNN | Revertida
- **Decidió**: nombre (y quién más participó)
- **Área**: módulo o archivos afectados

**Contexto.** Qué problema había y por qué hubo que decidir.

**Opciones.**
1. Opción elegida — ventaja principal / costo principal.
2. Alternativa — ventaja principal / costo principal.

**Decisión.** Qué se eligió y el motivo principal.

**Consecuencias.** Qué cambia para el usuario y para el código; efecto en cifras, si lo hay.

**Para revertirla.** Archivos, funciones y tests que habría que cambiar.

**Referencias.** Paso de planificación, PR o commit.
````

## Índice

| ID | Decisión | Estado |
|---|---|---|
| D-001 | Año de 365 días | Vigente |
| D-002 | Funciones duplicadas: se conserva la versión que devuelve N/D | Vigente |
| D-003 | Una IA puede hacer el merge de un PR aprobado | Vigente |
| D-004 | Costos fijos y variables se marcan en el módulo de apalancamiento | Vigente |
| D-005 | Tasa de impuesto: efectiva o 30 % configurable | Vigente |
| D-006 | Grados de apalancamiento estructurales y por variación | Vigente |
| D-007 | El GAF usa la UAI, con otros ingresos y otros gastos | Vigente |
| D-008 | UAII negativa: se muestra el valor con advertencia | Vigente |
| D-009 | Se calcula con las sugerencias de comportamiento antes de confirmarlas | Vigente |
| D-010 | Presupuesto de caja: el financiamiento requerido no se suma a la caja | Vigente |
| D-011 | Inventario: costo unitario vigente, sin existencia negativa y reposición hasta el mínimo | Vigente |
| D-012 | Flujo de efectivo por método directo, separado del EFE de Análisis | Vigente |
| D-013 | C-V-U: costos desde Apalancamiento y punto de equilibrio N/D sin margen positivo | Vigente |
| D-014 | Presupuesto maestro de una línea con desfase de un periodo e IR sin pagar en el horizonte | Vigente |
| D-015 | Presupuesto personal: capacidad de ahorro antes del ahorro planificado | Vigente |
| D-016 | El reporte integrado reutiliza `computeRazones` de Análisis | Vigente |
| D-017 | Inicio: salud general como proporción de áreas en orden | Vigente |
| D-018 | Presupuesto personal y Activos del hogar se separan de la empresa | Vigente |
| D-019 | Importes con punto: formato elegible, deducción por archivo y aviso de ambigüedad | Vigente |
| D-020 | El importador JSON de Reportes solo acepta respaldos validados | Vigente |
| D-021 | El EOAF clasifica cada cuenta del balance, no seis agregados | Vigente |
| D-022 | La depreciación acumulada se clasifica por su magnitud y no se inventa el gasto | Vigente |
| D-023 | La comprobación usa tolerancia de C$ 0.01 y no redistribuye diferencias | Vigente |
| D-024 | El EFE de Análisis deriva las tres actividades desde dos balances | Vigente |
| D-025 | Dividendos desde las utilidades acumuladas, con respaldo en la variación de patrimonio | Vigente |
| D-026 | Depreciación del periodo por variación de la depreciación acumulada, con advertencias | Vigente |
| D-027 | Las comprobaciones del EOAF y del EFE comparten sus piezas y no muestran sumas parciales | Vigente |

| D-028 | Los 20 JSON de razones v3 van en `docs/razones_financieras/` dentro del proyecto | Vigente |
| D-029 | Convenciones por defecto de los JSON: operandos, periodos, conjuntos y `parent_group` | Vigente |
| D-030 | El botón de cálculo directo de m1 va en las 11 razones de flujo, no en 9 | Reemplazada por D-032 |
| D-031 | El separador decimal del formato numérico queda abierto en `metadata.display` | Cerrada por D-033 |
| D-032 | El control de cálculo directo es único y global en las 11 razones de flujo (reemplaza a D-030) | Vigente |
| D-033 | Formato numérico F1 fijo en los 20 JSON (cierra D-031) | Cerrada |
| D-034 | V12 busca los marcadores prohibidos como placeholder: entre corchetes o en mayúsculas | Vigente |
| D-035 | Una cuenta solo es `verified` con una frase de una norma abierta que respalde su definición concreta | Vigente |
| D-036 | Atribución y numeración de las decisiones del PR #10 | Vigente |

## Decisiones

### D-001 — Año de 365 días

- **Fecha**: 2026-09-26
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: `js/utils/calculate.js` (`DIAS_ANIO`), Análisis y Mercados

**Contexto.** `main` y la rama de Cris usaban 360 días; la de Henry, 365. Al integrar hubo que elegir uno.

**Opciones.**
1. 365 días — año calendario, coincide con el quiz de Mercados / difiere del año comercial de algunos textos.
2. 360 días — año comercial / da plazos distintos a los del calendario.

**Decisión.** 365, en una sola constante.

**Consecuencias.** Plazo de cobro, plazo de pago, edad del inventario y ciclo de conversión cambian respecto de `main`.

**Para revertirla.** Cambiar `DIAS_ANIO` en `calculate.js`, los tests que usan 365 y la pregunta del quiz de Mercados.

**Referencias.** Commit `64acf0b`; [integracion-core](planificacion/integracion-core/README.md).

### D-002 — Funciones duplicadas: se conserva la versión que devuelve N/D

- **Fecha**: 2026-09-26
- **Estado**: Vigente
- **Decidió**: Carlos, al integrar `core`
- **Área**: `js/utils/calculate.js`, `js/modules/analisis/index.js`

**Contexto.** Las ramas de Cris y Henry declaraban `coberturaIntereses`, `margenBruto`, `margenOperativo`, `roe` y `rotacionActivosFijos` dos veces, y la app no cargaba.

**Opciones.**
1. Versión de Cris — devuelve `null` (N/D) si el denominador es 0 / los cambios de texto de Henry no se portaron.
2. Versión de Henry — devuelve 0, que se confunde con un resultado real.

**Decisión.** La de Cris, por la convención N/D. Además, una función por concepto: `rotacionActivos`, `plazoPago`, `cicloConversion`, `deudaPatrimonio` y `rotacionCxP`.

**Consecuencias.** Las razones sin denominador muestran N/D en lugar de 0.

**Para revertirla.** Restaurar las funciones reemplazadas y ajustar `razones-unificadas.test.js`, que falla si reaparecen.

**Referencias.** Commit `497740e`; [integracion-core](planificacion/integracion-core/README.md).

### D-003 — Una IA puede hacer el merge de un PR aprobado

- **Fecha**: 2026-09-27
- **Estado**: Vigente
- **Decidió**: Carlos; lo confirma el equipo en el PR #1
- **Área**: `AGENTS.md`, `docs/reglas/flujo-de-trabajo.md`

**Contexto.** Las guías prohibían que un agente hiciera merge, lo que obligaba a hacerlo a mano incluso con el PR ya aprobado.

**Opciones.**
1. La IA integra solo si se lo piden y otra persona ya aprobó — agiliza sin quitar la revisión humana.
2. La IA revisa y aprueba por su cuenta — GitHub no lo permite: trabaja con la cuenta del autor y `main` exige la aprobación de otra persona.
3. Mantener la prohibición.

**Decisión.** Opción 1, con las condiciones de "Integrar con una IA".

**Consecuencias.** La aprobación sigue siendo de una persona; la IA solo ejecuta el merge.

**Para revertirla.** Restaurar la frase "El agente no hace merge" en `AGENTS.md` y quitar la sección de `flujo-de-trabajo.md`.

**Referencias.** Commit `c6a5871`, PR #1.

### D-004 — Costos fijos y variables se marcan en el módulo de apalancamiento

- **Fecha**: 2026-09-27
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: módulo de apalancamiento; el importador de Estados no cambia

**Contexto.** El GAO necesita separar costos fijos y variables, y los archivos los clasifican por función (costo de ventas, gastos de administración, gastos de ventas).

**Opciones.**
1. Marcarlos en el módulo, con una sugerencia por tipo — no toca el código de Cris / hay que marcarlos al cargar cada empresa.
2. Columna `Comportamiento` en el archivo — viene lista de origen / exige cambiar el importador, que hoy la lee como periodo y falla.

**Decisión.** Opción 1. Sugerencia: costo de ventas → variable; gastos de administración → fija; el resto lo elige el usuario.

**Consecuencias.** Sin clasificar, el GAO y el GAT estructurales dan N/D; el GAF no depende del MC y se sigue calculando.

**Para revertirla.** Agregar la columna a `META_HEADERS` y al parseo de `estados-import.js` (con Cris) y leerla desde el módulo.

**Referencias.** [Paso 00 de apalancamiento](planificacion/apalancamiento/00-alcance-y-decisiones.md).

### D-005 — Tasa de impuesto: efectiva o 30 % configurable

- **Fecha**: 2026-09-27
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: apalancamiento (GAF y GAT)

**Contexto.** El GAF con DAP necesita la tasa T, y los archivos traen el IR como monto, no la tasa.

**Opciones.**
1. Tasa efectiva IR / UAI y, si no tiene sentido, una tasa configurable con 30 % por defecto — usa los datos reales cuando existen.
2. Siempre una tasa fija — más simple / ignora lo que pagó la empresa.

**Decisión.** Opción 1. El 30 % es la alícuota general del IR según la DGI; con ingresos de hasta C$ 12 millones rige la tabla progresiva del art. 52 de la LCT.

**Consecuencias.** T solo influye si hay DAP.

**Para revertirla.** Cambiar la regla de T en el paso 01 y en la función que la calcule.

**Referencias.** [Paso 00](planificacion/apalancamiento/00-alcance-y-decisiones.md) y [paso 01](planificacion/apalancamiento/01-formulas-apalancamiento.md).

### D-006 — Grados de apalancamiento estructurales y por variación

- **Fecha**: 2026-09-27
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: apalancamiento

**Contexto.** El GAO puede calcularse con la estructura de costos de un periodo (MC / UAII) o con la variación entre dos (%ΔUAII / %ΔVentas), y dan cifras distintas si la estructura cambia: en MUNO MODA 2023, 2.52 o 1.89 frente a 1.80.

**Opciones.**
1. Ambos, con el estructural como principal — la variación sirve de control / dos cifras que explicar.
2. Solo estructural — exige clasificar costos.
3. Solo por variación — no exige clasificar / mezcla el apalancamiento con los cambios de estructura.

**Decisión.** Opción 1. Si los costos no están clasificados, el GAO y el GAT solo se muestran por variación.

**Consecuencias.** Con estructura constante, las dos cifras coinciden; si difieren, cambió la estructura o hay costos mal clasificados.

**Para revertirla.** Quitar las funciones `...Variacion` o las estructurales y sus tests.

**Referencias.** [Paso 00](planificacion/apalancamiento/00-alcance-y-decisiones.md).

### D-007 — El GAF usa la UAI, con otros ingresos y otros gastos

- **Fecha**: 2026-09-27
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: apalancamiento (GAF y GAT)

**Contexto.** En este proyecto otros ingresos (OI) y otros gastos (OG) van después de la UAII, así que UAI = UAII + OI − OG − I, no UAII − I como en los libros de texto.

**Opciones.**
1. GAF = UAII / (UAI − DAP / (1 − T)) — coincide con el GAF por variación / se aparta de la fórmula de los libros.
2. GAF = UAII / (UAII − I − DAP / (1 − T)), la clásica — la del libro / no coincide con el GAF por variación cuando hay OI u OG.

**Decisión.** Opción 1. Si OI = OG = 0, las dos dan lo mismo.

**Consecuencias.** Con OI > OG, el GAF puede quedar por debajo de 1: MUNO MODA 2023 da 0.96 en lugar de 1.00.

**Para revertirla.** Cambiar el denominador de `gaf` y `gat` y los casos del paso 01.

**Referencias.** [Paso 01](planificacion/apalancamiento/01-formulas-apalancamiento.md).

### D-008 — UAII negativa: se muestra el valor con advertencia

- **Fecha**: 2026-09-27
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: apalancamiento

**Contexto.** Con UAII negativa (o un denominador negativo en el GAF), el grado sale negativo.

**Opciones.**
1. Mostrar el valor con una advertencia de que la empresa está bajo su punto de equilibrio — no oculta información.
2. N/D — evita malinterpretar un grado negativo / oculta la situación.

**Decisión.** Opción 1. El N/D queda para denominador 0 o datos faltantes.

**Consecuencias.** La pantalla necesita la advertencia.

**Para revertirla.** Devolver `null` con UAII ≤ 0 y cambiar el caso B del paso 01.

**Referencias.** [Paso 01](planificacion/apalancamiento/01-formulas-apalancamiento.md).

### D-009 — Se calcula con las sugerencias de comportamiento antes de confirmarlas

- **Fecha**: 2026-09-27
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: apalancamiento (pasos 03 y 04)

**Contexto.** Al cargar una empresa, el costo de ventas y los gastos de administración reciben un comportamiento sugerido (D-004). Hay que decidir si los grados se calculan con esa sugerencia o esperan a que el usuario la confirme.

**Opciones.**
1. Calcular con la sugerencia y avisar hasta que se guarde — la pantalla muestra resultados desde la primera carga / el usuario puede leer cifras con una clasificación que no revisó.
2. N/D hasta confirmar — nadie lee cifras sin revisar / la pantalla empieza vacía.

**Decisión.** Opción 1, con la advertencia `clasificacion-sugerida`. Las cuentas sin sugerencia (gastos de ventas) siguen dando N/D hasta que se elijan.

**Consecuencias.** Los resultados pueden cambiar cuando el usuario corrige una sugerencia.

**Para revertirla.** En `resolverComportamiento`, no usar la sugerencia como valor para calcular, y cambiar los tests del paso 03 que la usan.

**Referencias.** [Paso 03](planificacion/apalancamiento/03-datos-y-derivacion.md).

### D-010 — Presupuesto de caja: el financiamiento requerido no se suma a la caja

- **Fecha**: 2026-09-29
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: `planeacion/`, `financiamientoRequerido` en `calculate.js`

**Contexto.** Cuando el saldo final de un periodo queda bajo el saldo mínimo, hay que decidir si el presupuesto simula un préstamo o solo informa cuánto falta.

**Opciones.**
1. Informar el financiamiento requerido (saldo mínimo − saldo final) sin sumarlo a la caja, como el presupuesto de caja de Gitman — fácil de comprobar a mano / el saldo mostrado sigue bajo el mínimo.
2. Simular un préstamo que se suma a la caja y se paga con excedentes — más realista / exige tasa, plazos y reglas de pago que la guía no pide.

**Decisión.** Opción 1. El total del horizonte es el máximo requerido, que es el tamaño de la línea de crédito a gestionar.

**Consecuencias.** En el ejemplo, el trimestre 2 cierra en C$ 19,200 y muestra C$ 20,800 de financiamiento; el trimestre 3 ya tiene excedente.

**Para revertirla.** Cambiar el bloque de caja de `calcularPresupuestoMaestro` y los casos de `planeacion.test.js`.

**Referencias.** [modulos-guia/01](planificacion/modulos-guia/01-modulos-obligatorios.md).

### D-011 — Inventario: costo unitario vigente, sin existencia negativa y reposición hasta el mínimo

- **Fecha**: 2026-09-29
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: `inventario/`

**Contexto.** La guía pide existencia final, valor = existencia × costo unitario, stock mínimo y alerta. Faltaba definir cómo valorar, qué hacer con una salida mayor que la existencia y cuánto sugerir comprar.

**Opciones.**
1. Un costo unitario vigente por producto; se rechaza la salida que deje la existencia negativa en su fecha o después; alerta con existencia ≤ stock mínimo y sugerencia de comprar lo que falta para volver al mínimo — es la fórmula de la guía y se comprueba a mano.
2. Costo promedio ponderado o PEPS por entrada — valoración más precisa / fuera del alcance básico y más difícil de defender.

**Decisión.** Opción 1. La cantidad sugerida es el mínimo a comprar; la persona decide cuánto más.

**Consecuencias.** Si el costo de compra cambia, se edita el costo del producto y se revalúa toda la existencia.

**Para revertirla.** Cambiar `resumenProducto` y `kardex` en `inventario-calculations.js` y sus tests.

**Referencias.** [modulos-guia/01](planificacion/modulos-guia/01-modulos-obligatorios.md).

### D-012 — Flujo de efectivo por método directo, separado del EFE de Análisis

- **Fecha**: 2026-09-29
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: `flujo/`; `computeEFE` de Análisis no cambia

**Contexto.** La guía pide clasificar entradas y salidas de efectivo en operación, inversión y financiamiento, con variación neta y saldo final. Análisis ya tenía un EFE indirecto que solo calcula la operación.

**Opciones.**
1. Módulo nuevo con movimientos clasificados (método directo) y saldo inicial tomado del balance — coincide con las entradas que pide la guía y no toca el código de Henry / conviven dos flujos de operación.
2. Derivar las tres actividades desde dos balances y reemplazar `computeEFE` — más integrado / cambia cifras de Análisis y necesita la demo cuadrada.

**Decisión.** Opción 1 ahora; la derivación desde los estados queda como mejora coordinada con Henry.

**Consecuencias.** El flujo de operación de Análisis (sin depreciación) puede diferir del de este módulo. Si el saldo inicial se tomó de un periodo que tiene uno siguiente, la pantalla compara el saldo final con su efectivo.

**Para revertirla.** Quitar `js/modules/flujo/`, su ruta y la clave `flujo` del `store`.

**Referencias.** [modulos-guia/00](planificacion/modulos-guia/00-brechas-y-prioridades.md).

### D-013 — C-V-U: costos desde Apalancamiento y punto de equilibrio N/D sin margen positivo

- **Fecha**: 2026-09-29
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: `equilibrio/`, fórmulas C-V-U de `calculate.js`

**Contexto.** El C-V-U necesita precio, costo variable unitario y costos fijos; los estados no traen unidades ni separan costos fijos y variables.

**Opciones.**
1. Datos propios del módulo, con la opción de tomarlos de un periodo: P = Ventas / Q y CVu = CV / Q con las unidades que indique la persona, y CF según la clasificación de Apalancamiento (D-004) — una sola clasificación de costos en la app.
2. Pedir siempre los datos a mano — más simple / no reutiliza lo ya registrado.

**Decisión.** Opción 1. Con MCu ≤ 0 el punto de equilibrio es N/D con un aviso; las unidades mínimas se redondean hacia arriba y el valor exacto se muestra con decimales.

**Consecuencias.** Tomado de los estados, la UAII del C-V-U es la misma que la de los estados y Apalancamiento (MUNO 2024: C$ 155,000).

**Para revertirla.** Quitar `baseDesdeEstados` y su botón; cambiar `puntoEquilibrioUnidades` si se quiere otro trato de MCu ≤ 0.

**Referencias.** [modulos-guia/01](planificacion/modulos-guia/01-modulos-obligatorios.md).

### D-014 — Presupuesto maestro de una línea con desfase de un periodo e IR sin pagar en el horizonte

- **Fecha**: 2026-09-29
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: `planeacion/`, `proforma/`

**Contexto.** Un presupuesto maestro puede modelar varios productos, cobranza en varios periodos y pagos de impuestos; había que fijar un alcance académico comprobable a mano.

**Opciones.**
1. Empresa comercial con un producto o línea agregada; lo vendido o comprado a crédito se cobra o se paga el periodo siguiente; intereses pagados en el mismo periodo; IR (tasa configurable, 30 % en el ejemplo) solo sobre la UAI positiva de cada periodo, sin pagarse dentro del horizonte — cubre los presupuestos que pide la guía con supuestos simples.
2. Varios productos y cobranza por antigüedad — más realista / multiplica los supuestos y los casos de prueba.

**Decisión.** Opción 1. El IR queda como "IR por pagar" en los saldos al cierre.

**Consecuencias.** La proforma compara el total del horizonte con el último periodo real; si el horizonte no es un año, lo advierte. No incluye otros ingresos ni otros gastos.

**Para revertirla.** Ampliar `SUPUESTOS` y `calcularPresupuestoMaestro`, y sus tests.

**Referencias.** [modulos-guia/01](planificacion/modulos-guia/01-modulos-obligatorios.md).

### D-015 — Presupuesto personal: capacidad de ahorro antes del ahorro planificado

- **Fecha**: 2026-09-29
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: `presupuesto/`, `capacidadAhorro` y `tasaAhorro` en `calculate.js`

**Contexto.** La guía pide total de ingresos, total de gastos, saldo disponible y capacidad de ahorro. El módulo tenía un solo ingreso y restaba la meta de ahorro como si fuera un gasto.

**Opciones.**
1. Capacidad de ahorro = ingresos − gastos; saldo disponible = capacidad − ahorro planificado; ingresos por concepto — separa lo que se puede ahorrar de lo que se decidió ahorrar.
2. Capacidad = ingresos − gastos − ahorro — mezcla la decisión de ahorrar con la capacidad.

**Decisión.** Opción 1. Los datos guardados con solo `ingresoMensual` se leen como un ingreso regular, e `ingresoMensual` sigue siendo el total para Semanas y Reportes.

**Consecuencias.** El resumen muestra ambas cifras y cuántos meses tomaría la meta si la capacidad no alcanza.

**Para revertirla.** Cambiar `renderPresupuestoData` y `renderResumen` en `presupuesto/index.js`.

**Referencias.** [modulos-guia/01](planificacion/modulos-guia/01-modulos-obligatorios.md).

### D-016 — El reporte integrado reutiliza `computeRazones` de Análisis

- **Fecha**: 2026-09-29
- **Estado**: Vigente
- **Decidió**: Carlos (a confirmar con Henry)
- **Área**: `proforma/index.js`, `js/modules/analisis/index.js`

**Contexto.** El reporte integrado muestra liquidez, endeudamiento, ROA y ROE. Recalcularlos aparte podría dar cifras distintas de las de Análisis, que usa saldos promedio.

**Opciones.**
1. Importar `computeRazones` y `computeDuPont`, y exportar `refreshSavedStates` para no leer estados en caché — mismas cifras que Análisis / toca una línea del archivo de Henry.
2. Recalcular con las fórmulas de `calculate.js` — no toca Análisis / duplica la orquestación.

**Decisión.** Opción 1, con el mismo texto que ya trae `razones-financieras-v3` para esa línea, así el merge no choca.

**Consecuencias.** Las razones con denominador 0 de las funciones legado se muestran N/D en el reporte, aunque en `main` Análisis todavía devuelva 0.

**Para revertirla.** Quitar el `export` de `refreshSavedStates` y calcular las razones dentro de `proforma-calculations.js`.

**Referencias.** [modulos-guia/00](planificacion/modulos-guia/00-brechas-y-prioridades.md).

### D-017 — Inicio: salud general como proporción de áreas en orden

- **Fecha**: 2026-09-30
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: `js/modules/inicio/inicio-calculations.js` (`saludGeneral`, `areasClave`), `proforma/index.js` (`reunirEntradas`)

**Contexto.** El panorama de Inicio necesita un resumen de una línea sobre cómo está la empresa. No existe una calificación estándar que combine liquidez, rentabilidad, deuda, caja, inventario y activos.

**Opciones.**
1. Proporción de áreas evaluadas "en orden" (según los umbrales de Análisis y las reglas de la proforma), bajando un nivel con una alerta alta y a "Requiere atención" con dos — simple y explicable / no pondera áreas.
2. Puntaje ponderado por área — más fino / pesos arbitrarios difíciles de justificar.
3. Un índice externo (p. ej. Z de Altman) — reconocido / pide datos que el modelo no tiene (capital de trabajo de mercado, utilidades retenidas separadas).

**Decisión.** Opción 1: sólida ≥ 80 % sin alertas altas; estable ≥ 50 % o una alerta alta; requiere atención < 50 % o dos o más alertas altas. Las áreas "Referencia" (p. ej. apalancamiento) no cuentan. Para no duplicar la recolección, Inicio usa `reunirEntradas()` de la proforma.

**Consecuencias.** Es una lectura educativa, no una calificación crediticia; la pantalla muestra cuántas áreas están en orden. El margen de seguridad usa el mismo 20 % que la proforma.

**Para revertirla.** Cambiar `saludGeneral` y sus pruebas en `tests/unit/inicio.test.js`.

**Referencias.** CHANGELOG, "Inicio y apariencia".

### D-018 — Presupuesto personal y Activos del hogar se separan de la empresa

- **Fecha**: 2026-09-30
- **Estado**: Vigente
- **Decidió**: Carlos
- **Área**: `index.html` (barra lateral), `js/modules/inicio/`, `js/modules/integracion/index.js`, encabezados de `presupuesto/` y `activos/`

**Contexto.** La guía pide mantener el presupuesto personal separado del presupuesto maestro. El módulo de Activos registra bienes del hogar (categorías Tecnología, Electrodomésticos, Mobiliario…) y no se conecta con los estados financieros, pero aparecía mezclado con los módulos de la empresa y contaba en la salud general de Inicio.

**Opciones.**
1. Secciones en la barra lateral (Empresa, Finanzas personales, Aprender, Datos), nombres "Presupuesto personal" y "Activos del hogar", acento de color propio y bloque aparte en Inicio — todo visible de un vistazo / la barra lateral es algo más larga.
2. Selector "Empresa / Personal" que oculte la mitad del menú — menú corto / más estado que mantener y el evaluador no ve todos los módulos a la vez.
3. Convertir Activos en "Activos fijos" de la empresa y conectarlo con el balance — integración real / cambia el propósito del módulo.

**Decisión.** Opción 1. Las rutas (`#/presupuesto`, `#/activos`) y los datos guardados no cambian; solo la navegación, los textos y Inicio.

**Consecuencias.** La salud general de Inicio deja de contar los activos del hogar (en la demo con bienes deteriorados puede subir). El bloque "Mis finanzas personales" no afecta la salud ni el reporte integrado.

**Para revertirla.** Restaurar la barra lateral plana en `index.html`, volver a incluir `areaActivos` en `areasClave` y quitar `finanzasPersonales` de `panoramaGeneral`, con sus pruebas en `tests/unit/inicio.test.js`.

**Referencias.** [requisitos del proyecto](contexto/requisitos-proyecto-final-gfo.md), CHANGELOG "Inicio y apariencia".

### D-019 — Importes con punto: formato elegible, deducción por archivo y aviso de ambigüedad

- **Fecha**: 2026-10-02
- **Estado**: Vigente
- **Decidió**: Carlos (sesión con IA; pendiente de revisión del equipo)
- **Área**: `js/modules/estados/estados-import.js`, `estados-ui.js`, Reportes (`js/modules/integracion/`)

**Contexto.** `parseAmountCell` leía `45.000` como 45 porque el punto es decimal por convención del proyecto, mientras que el manual decía que se "interpreta correctamente". Un archivo con punto de miles (habitual en hojas de cálculo en español de otros países) se importaba con cifras 1000 veces menores, sin ningún aviso. También leía `0,500` como 500 y `1.2.3` como 123.

**Opciones.**
1. Selector de formato (Automático, Punto decimal, Coma decimal); en Automático se deduce el separador de toda la tabla y, si no hay evidencia, se conserva el punto decimal pero se avisa de cada importe ambiguo — no cambia los archivos que hoy funcionan / una elección más en la pantalla.
2. Cambiar la convención a "el punto agrupa miles" — coincide con el uso de otros países / rompe los archivos actuales, que usan punto decimal (`12.5`), y la plantilla del proyecto.
3. Rechazar todo importe ambiguo — nunca se lee mal / obliga a corregir el archivo aunque sea correcto.

**Decisión.** Opción 1. La convención por defecto no cambia (`45.000` sin más contexto sigue siendo 45), pero deja de ser silenciosa. Se corrigen además `0,500` (0.5) y `1.2.3` (error), que no admitían una lectura razonable como miles. `45,000` sigue siendo 45 000.

**Consecuencias.** Un archivo que mezcla evidencias contradictorias (`12,50` y `1.5`) vuelve al modo por celda con avisos. Los mensajes de error de importe ahora empiezan por `Fila N, cuenta "…", periodo …`. Cambia una cifra visible solo en los casos `0,500` (antes 500) y `1.2.3` (antes 123, ahora error).

**Para revertirla.** Quitar `decimal`/`avisos` de `createBuilder` y de las funciones públicas de `estados-import.js`, el selector `#numberFormat` de `estados-ui.js` y los tests de `estados-import-formatos.test.js` y `estados-formato-ui.test.js`.

**Referencias.** [ficha importación/exportación](planificacion/importacion-exportacion/README.md), CHANGELOG "Módulo 2" y "Módulo 6".

### D-020 — El importador JSON de Reportes solo acepta respaldos validados

- **Fecha**: 2026-10-02
- **Estado**: Vigente
- **Decidió**: Carlos (sesión con IA; pendiente de revisión del equipo)
- **Área**: `js/modules/integracion/` (`index.js`, `integracion-respaldo.js`)

**Contexto.** "Importar JSON" copiaba cada clave del archivo al `store` con `store.set`, sin validar: un archivo malformado dejaba módulos inconsistentes, una clave `__proto__` o con puntos alteraba el árbol del `store`, un JSON de Estados creaba claves sueltas (`name`, `periods`…) y un error de `localStorage` se ignoraba mientras se mostraba "importados correctamente".

**Opciones.**
1. Validar en un módulo puro (claves conocidas, tipos del módulo, `normalizeFinancialData` para `estados`, claves peligrosas, tamaño), confirmar, guardar con `setPersisted` y restaurar si falla — importar es seguro y atómico / un respaldo de una versión con otros campos pierde esos campos (se listan como omitidos).
2. Solo quitar las claves peligrosas — cambio mínimo / sigue aceptando datos con forma incorrecta.
3. Envoltorio versionado `{ app, schemaVersion, data }` — permite migraciones / exige cambiar también la exportación y los respaldos ya descargados dejarían de importarse.

**Decisión.** Opción 1. La opción 3 queda como mejora posible; la validación actual no la impide (el envoltorio solo añadiría un nivel antes de `validarRespaldo`).

**Consecuencias.** Importar pide confirmación y muestra los módulos que se reemplazan. `theme` sigue sin importarse. Los campos que el archivo no trae se conservan del módulo actual. No se cambió la forma de los datos guardados ni `js/store.js`.

**Para revertirla.** Volver al bucle `store.set` de `bindExportEvents` y eliminar `integracion-respaldo.js` con sus tests.

**Referencias.** [ficha importación/exportación](planificacion/importacion-exportacion/README.md).

### D-021 — El EOAF clasifica cada cuenta del balance, no seis agregados

- **Fecha**: 2026-10-09
- **Estado**: Vigente
- **Decidido**: Henry (sesión con IA; pendiente de revisión del equipo)
- **Área**: `js/modules/analisis/eoaf-calculations.js`, `js/modules/analisis/index.js`

**Contexto.** La pestaña EOAF clasificaba seis agregados (Activos Corrientes, Activos Fijos, Pasivos Corrientes, Pasivos Largo Plazo, Patrimonio y Utilidades del periodo) y sumaba dos veces el mismo movimiento: el aumento de un activo contaba como aplicación del agregado *y* como origen cuando venía de financiarse, y no había comprobación. Un estado que no cuadra no se veía.

**Opciones.**
1. Balance comparado cuenta por cuenta, con el grupo y el tipo de `ACCOUNT_TYPES`, subtotales por sección y comprobación `Σ orígenes − Σ aplicaciones` — es el estado del libro y lo que el docente pidió / depende de que cada cuenta tenga tipo; las sin tipo se reportan.
2. Seguir con agregados y solo corregir el doble conteo — cambio mínimo / no explica de dónde salen los fondos ni permite auditarlo.
3. Método directo de efectivo (ya existe en `#/flujo`) — no duplica pantallas / responde otra pregunta y pide información que el balance no trae.

**Decisión.** Opción 1. Los subtotales y la fila "Total Pasivos y Patrimonio" solo muestran saldos y nunca generan movimientos; los totales salen de las cuentas. La comparación usa los dos periodos más recientes (`seleccionarPeriodoPar`), el mismo criterio que el resto de Análisis.

**Consecuencias.** El EOAF crece de seis renglones a una fila por cuenta y puede mostrar advertencias nuevas (descuadre de A = P + O, cuentas sin clasificar). Las cifras de orígenes y aplicaciones cambian por completo respecto de la versión anterior: antes eran agregados con doble conteo, ahora son variaciones reales.

**Para revertirla.** Restaurar la versión anterior de `computeEOAF`/`renderEOAFSection` en `index.js` y eliminar `eoaf-calculations.js` con `tests/unit/eoaf.test.js`.

**Referencias.** [ficha origen-y-aplicacion](planificacion/origen-y-aplicacion/README.md), CHANGELOG "Módulo 3", `docs/api.md` "eoaf-calculations.js".

### D-022 — La depreciación acumulada se clasifica por su magnitud y no se inventa el gasto

- **Fecha**: 2026-10-09
- **Estado**: Vigente
- **Decidido**: Henry (sesión con IA; pendiente de revisión del equipo)
- **Área**: `js/modules/analisis/eoaf-calculations.js`

**Contexto.** La depreciación acumulada es un contra-activo: en los libros baja el valor en libros sin que salga efectivo. El EOAF clásico la trata como un origen por el gasto del periodo, pero el modelo de datos de GFO no guarda ese gasto por separado y la cuenta puede estar guardada en positivo o en negativo.

**Opciones.**
1. Clasificar por la variación de la magnitud (magnitud creciente → Origen; decreciente → Aplicación) e informar la limitación con una nota — funciona con ambas convenciones de signo / no distingue gasto de retiro.
2. Clasificar siempre como origen mientras la magnitud no baje a cero — más simple / convierte un retiro de activo en origen falso.
3. No clasificar la depreciación acumulada hasta que el modelo traiga el gasto — estricto / el estado deja de cuadrar en cualquier empresa que depreció.

**Decisión.** Opción 1. Si la cuenta cambia de signo con la misma magnitud no se clasifica: se reporta como dato a revisar. La nota explica que el gasto del periodo no está en el modelo y que por eso no se distingue del retiro o venta de activos.

**Consecuencias.** Un retiro de activo (activos fijos y su depreciación que bajan a cero) cuadra sin duplicar el movimiento, pero la pantalla puede no distinguir "depreció" de "vendió"; el usuario debe leer la nota. Un signo positivo en la depreciación acumulada genera además una advertencia.

**Para revertirla.** Cambiar la rama `depreciacionAcumulada` de `clasificarMovimientoEOAF` y sus advertencias, con sus pruebas.

**Referencias.** [ficha origen-y-aplicacion](planificacion/origen-y-aplicacion/README.md), CHANGELOG "Módulo 3".

### D-023 — La comprobación usa tolerancia de C$ 0.01 y no redistribuye diferencias

- **Fecha**: 2026-10-09
- **Estado**: Vigente
- **Decidido**: Henry (sesión con IA; pendiente de revisión del equipo)
- **Área**: `js/modules/analisis/eoaf-calculations.js`

**Contexto.** `Σ orígenes − Σ aplicaciones` debe dar cero en un balance que cierra, pero los redondeos de coma flotante dejan centavos de diferencia, y un descuadre real del balance (A ≠ P + O) se refleja en el EOAF. Había que decidir qué se tolera y qué se hace con lo que sobra.

**Opciones.**
1. Tolerancia de C$ 0.01 más un epsilon escalado a los totales (la misma regla que `validateFinancialData`); si la diferencia la supera se muestra la cifra exacta — honesto / hay que explicar por qué "cuadra" con centavos.
2. Tolerancia de 0 (cero exacto) — el más estricto / centavos de coma flotante marcarían "No cuadra" en balances que sí cierran.
3. Ajustar la diferencia a una cuenta (por ejemplo Utilidades Acumuladas) — el estado siempre cuadra / inventa un movimiento que no ocurrió y oculta descuadres reales.

**Decisión.** Opción 1, con tres estados: `cuadra`, `no-cuadra` (con la diferencia exacta en KPI e interpretación) e `incompleta` cuando hay saldos faltantes o cuentas sin clasificar. Tampoco se completa un saldo ausente con 0: la fila queda con "Dato faltante".

**Consecuencias.** Un descuadre de C$ 20 en el balance aparece como "No cuadra" con la cifra exacta y una nota por periodo, en lugar de quedarse invisible. Una empresa con cuentas sin tipo nunca ve "Cuadra": ve "Comprobación incompleta" con la lista de motivos.

**Para revertirla.** Cambiar `TOLERANCIA_EOAF` y la lógica de `estado` en `construirEOAF`, con sus pruebas.

**Referencias.** [ficha origen-y-aplicacion](planificacion/origen-y-aplicacion/README.md), CHANGELOG "Módulo 3".

### D-024 — El EFE de Análisis deriva las tres actividades desde dos balances

- **Fecha**: 2026-10-09
- **Estado**: Vigente
- **Decidió**: Henry (propuesta 3 de `modulos-guia/02-valor-agregado.md`); sesión con IA
- **Área**: `js/modules/analisis/` (`efe-calculations.js`, `index.js`), `tests/unit/efe.test.js`

**Contexto.** `computeEFE` solo calculaba el flujo operativo con tres ajustes de capital de trabajo, sin depreciación, sin inversión ni financiamiento y sin comprobación. La guía pide flujos por actividad y D-012 dejó la derivación desde los estados "como mejora coordinada con Henry"; la propuesta 3 del plan de valor agregado la aprobó.

**Opciones.**
1. Reemplazar `computeEFE` por un EFE indirecto completo (tres actividades + comprobación CFO+CFI+CFF = Δ efectivo) — una sola cifra de operación y el tablero cumple la guía / cambia cifras que hoy ve el usuario.
2. Agregar una pestaña nueva junto al EFE viejo — no cambia cifras existentes / conviven dos EFE con CFO distinto y el usuario no sabe cuál creer.
3. Derivar el EFE con el método directo desde `#/flujo` — mismo enfoque que ese módulo / `#/flujo` es de captura manual, no deriva de los estados, y D-012 lo dejó separado.

**Decisión.** Opción 1, en la rama `flujo-de-efectivo` y con la aprobación de Henry. El módulo `#/flujo` (D-012) no cambia.

**Consecuencias.** La pestaña EFE muestra las tres actividades, KPIs CFO/CFI/CFF, la variación de efectivo y la comprobación con estados `cuadra`, `no-cuadra` o `incompleta` (tolerancia C$ 0.01, más epsilon escalado; nunca se ajustan cifras). Cambian las cifras de la demo: CFO C$ 97,775, CFF C$ −90,775 y Δ efectivo C$ 7,000 que sí cuadra. `efeIndirecto` de `calculate.js` sigue exportado (lo usan sus tests) pero Análisis ya no lo consume. Conflicto de merge esperado con `origen-y-aplicacion` en `analisis/index.js`.

**Para revertirla.** Restaurar el `computeEFE` anterior en `index.js`, retirar `efe-calculations.js` y `tests/unit/efe.test.js`.

**Referencias.** [02-valor-agregado propuesta 3](planificacion/modulos-guia/02-valor-agregado.md), [ficha flujo-de-efectivo](planificacion/flujo-de-efectivo/README.md), D-012.

### D-025 — Dividendos desde las utilidades acumuladas, con respaldo en la variación de patrimonio

- **Fecha**: 2026-10-09
- **Estado**: Vigente
- **Decidió**: Henry (sesión con IA; pendiente de revisión del equipo)
- **Área**: `js/modules/analisis/efe-calculations.js`

**Contexto.** El modelo no guarda una cuenta de dividendos: en Financiamiento hay que separar aportaciones de capital de dividendos usando solo los estados.

**Opciones.**
1. Si el patrimonio trae cuentas de resultados acumuladas: dividendos = UN − ΔRE y aportaciones = ΔPatrimonio − ΔRE; si no, ΔPatrimonio total con la UN descontada y advertencia — las dos formas reconcilian exactamente / depende del nombre de la cuenta RE.
2. Siempre ΔPatrimonio − UN como "dividendos" — simple / mezcla aportaciones con dividendos y da dividendos negativos cuando hay aportaciones.
3. No mostrar dividendos; solo ΔPatrimonio — sin inferencias / menos informativo y no coincide con la demo.

**Decisión.** Opción 1. La detección de RE es un `esResultadoAcumulado` local por nombre, porque partir `ACCOUNT_TYPES` en subtipos de patrimonio cambiaría el patrimonio que consumen las razones.

**Consecuencias.** Con la demo (Utilidades Acumuladas) los dividendos salen C$ −40,000 y las aportaciones 0; sin RE se muestra la variación de patrimonio con la UN en negativo y una advertencia. Ninguna variación inventa datos: si falta el saldo o la UN, el renglón queda N/D y la comprobación pasa a `incompleta`.

**Para revertirla.** Quitar `esResultadoAcumulado` y el bloque condicional de Financiamiento en `construirEFE`.

**Referencias.** [ficha flujo-de-efectivo](planificacion/flujo-de-efectivo/README.md).

### D-026 — Depreciación del periodo por variación de la depreciación acumulada, con advertencias

- **Fecha**: 2026-10-09
- **Estado**: Vigente
- **Decidió**: Henry (sesión con IA; pendiente de revisión del equipo)
- **Área**: `js/modules/analisis/efe-calculations.js`

**Contexto.** El modelo no guarda el gasto de depreciación del periodo; el balance solo trae la depreciación acumulada. Sin ese ajuste el CFO queda subestimado cuando los activos fijos cambian.

**Opciones.**
1. Depreciación = Δ de la magnitud de la depreciación acumulada (|final| − |inicial|), con advertencia si la cuenta está en signo positivo o si disminuye (posible baja de activos) — usa el dato disponible y avisa del límite / es una estimación, no el gasto del libro.
2. No incluir depreciación — hereda el error del EFE anterior / la comprobación no cuadra cuando hay activos fijos.
3. Pedir el gasto al usuario en una pantalla nueva — dato exacto / otra captura manual que mantener.

**Decisión.** Opción 1. La tolerancia de la comprobación es `TOLERANCIA_EFE` = 0.01 (misma que el EOAF y `validateFinancialData`) más `Number.EPSILON` escalado a las magnitudes.

**Consecuencias.** El CFO incluye la depreciación no efectiva. Una depreciación en signo positivo (captura equivocada) se advierte y la comprobación puede no cuadrar hasta corregir el signo; una depreciación que baja se advierte como posible baja de activos, cuyo reembolso va a Inversión. Intereses e impuestos quedan dentro de la UN, como en el método indirecto clásico.

**Para revertirla.** Quitar `deltaDepreciacion` y sus advertencias de `construirEFE`.

**Referencias.** [ficha flujo-de-efectivo](planificacion/flujo-de-efectivo/README.md).

### D-027 — Las comprobaciones del EOAF y del EFE comparten sus piezas y no muestran sumas parciales

- **Fecha**: 2026-10-16
- **Estado**: Vigente
- **Decidió**: Carlos, con una IA, al integrar los PR #11 y #12 de Henry (rama `feat/integra-efe-eoaf`, PR #13); pendiente de revisión de Henry
- **Área**: `js/modules/analisis/` (`comprobacion-calculations.js`, `eoaf-calculations.js`, `efe-calculations.js`, `index.js`)

**Contexto.** Los dos PR se escribieron por separado y repitieron la selección del par de periodos, la tolerancia, la unión de cuentas entre periodos y el aviso de balance descuadrado. Al probarlos con casos límite aparecieron además cuatro problemas visibles: con un importe que no es número guardado, `computeEFE` lanzaba y toda la pantalla de Análisis quedaba vacía (en `main` se renderizaba); la demo mostraba `C$ -0.00` en la fila de activos fijos; el EOAF incompleto mostraba sumas parciales como si fueran totales; y las cuentas de utilidades en singular o del ejercicio repartían mal los dividendos.

**Opciones.**
1. Un módulo común `comprobacion-calculations.js` con una sola tolerancia y una sola selección de periodos, y los dos estados lo usan — una función por concepto, como pide `AGENTS.md` / renombra funciones públicas ya documentadas (`TOLERANCIA_EOAF`, `TOLERANCIA_EFE`, `seleccionarPeriodoEFE`).
2. Dejar las copias y documentar que son iguales — sin renombres / se separan con el tiempo; `carga-modulos` no las detecta porque los nombres difieren.
3. Que el EFE reutilice las funciones del EOAF — sin archivo nuevo / acopla un estado al nombre del otro.

**Decisión.** Opción 1. Con la comprobación incompleta, los totales (orígenes, aplicaciones y diferencia del EOAF) son `null` (N/D) y no una suma parcial. El EFE no lanza con importes inválidos: los reporta como motivo. Un cambio de 0 se informa como `0`, nunca `-0`. `computeEFE(period)` usa `period` como cierre. `esResultadoAcumulado` reconoce el singular y las cuentas del resultado del ejercicio.

**Consecuencias.** `TOLERANCIA_EOAF`, `TOLERANCIA_EFE` y `seleccionarPeriodoEFE` dejan de existir; `TOLERANCIA_COMPROBACION` y `seleccionarPeriodoPar` (ahora con `periodoFinal` opcional) viven en el módulo común. Lo que dicen D-021, D-023 y D-026 sobre esos nombres sigue siendo válido en el fondo (tolerancia de C$ 0.01, dos periodos más recientes) y no se reescribe. Para el usuario: la pantalla de Análisis ya no se vacía con un importe inválido, el EOAF incompleto muestra N/D en los tres indicadores, el EFE avisa si un balance no cierra y explica en una frase qué hicieron la operación, la inversión y el financiamiento, y el pie aclara que «Cuadra» confirma que los balances cierran, no que los importes capturados sean correctos.

**Para revertirla.** Restaurar las constantes y `seleccionarPeriodo*` en cada `*-calculations.js`, quitar `comprobacion-calculations.js` y `tests/unit/comprobacion.test.js`, y revertir los casos nuevos de `efe.test.js` y `eoaf.test.js`.

**Referencias.** PR #13 (integración de #11 y #12), [ficha flujo-de-efectivo](planificacion/flujo-de-efectivo/README.md), [ficha origen-y-aplicacion](planificacion/origen-y-aplicacion/README.md), D-021, D-023, D-024, D-025, D-026.
### D-028 — Los 20 JSON de razones v3 van en `docs/razones_financieras/` dentro del proyecto

- **Fecha**: 2026-10-14
- **Estado**: Vigente
- **Decidió**: Cris Lumbi (con agente IA)
- **Área**: `docs/razones_financieras/` (nuevo), `docs/planificacion/razones-json-v3/`

**Contexto.** El documento de instrucciones pide 20 archivos JSON con una ruta relativa `razones_financieras/...` sin decir desde dónde se mide, y a la vez pide ejecutar las pruebas del proyecto. Medida desde el propio documento (`J_formulas/`), la carpeta quedaría fuera del repo y no pasaría por PR.

**Opciones.**
1. Dentro del proyecto, en `GFO_Project/docs/razones_financieras/` — se versiona, se revisa en PR y convive con el mapa de documentación / una extracción posterior solo mueve la carpeta sin tocar su contenido.
2. Junto al documento de instrucciones, en `J_formulas/razones_financieras/` — literal al pie de la letra / fuera del repo: sin revisión del equipo ni historial de cambios.

**Decisión.** Opción 1. El documento pide ejecutar las pruebas del proyecto, así que su raíz de trabajo es el proyecto; `AGENTS.md` exige además que todo lo entregable entre por PR.

**Consecuencias.** Los archivos entran al repo en la rama `feat/razones-json-v3` y se revisan con el resto de la documentación. Ningún módulo del repo lee todavía estos JSON (son assets autónomos de documentación), así que no hay riesgo de código.

**Para revertirla.** Mover la carpeta a `J_formulas/razones_financieras/`, marcar esta entrada como reemplazada por una nueva y corregir la ficha y el índice de `docs/planificacion/`.

**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `J_formulas/instrucciones_agente_json_razones_financieras_v3.md`.

### D-029 — Convenciones por defecto de los JSON: operandos, periodos, conjuntos y `parent_group`

- **Fecha**: 2026-10-14
- **Estado**: Vigente
- **Decidió**: Cris Lumbi (con agente IA)
- **Área**: `docs/razones_financieras/*.json` (20 archivos)

**Contexto.** El documento fija los nombres de campo y la semántica N/D, pero no resuelve la forma de los operandos literales, la sintaxis de las referencias a otra razón, el nombre de los conjuntos de cuentas con padre, si `parent_group` arrastra su conjunto al archivo ni qué hacer cuando falta la depreciación acumulada.

**Opciones.**
1. Operandos como `{"ref": ...}` y `{"value": 365}`; refs cruzadas `{"ref": "ratio.<id>", "period": "previous_current"}`; conjuntos propios `bs.fixed_assets_components` y `bs.noncurrent_liabilities_components`; `parent_group` siempre con el conjunto completo incluido; depreciación acumulada `requires_data` — cada JSON se evalúa por separado, sin contexto externo / repite maquinaria en varios archivos.
2. `op` explícito en todos los operandos y periodos crudos `m1`/`m2` — más uniforme / se aparta de los ejemplos de la sección 10 de la especificación y obliga a resolver tokens en cada referencia.
3. `parent_group` contextual (solo el conjunto que corresponde al periodo) y depreciación ausente en 0 — menos cuentas por archivo / no se evalúa sin saber el periodo y aproxima un importe que la especificación exige conservar.

**Decisión.** Opción 1. El documento de instrucciones manda sobre la especificación en los detalles de presentación, y es la única opción que permite evaluar cada JSON de forma autónoma.

**Consecuencias.** No cambia ninguna cifra visible. Si falta la depreciación acumulada, las razones que la necesitan quedan en `N/D` con motivo `missing_required_account_data` en lugar de inflar el activo neto.

**Para revertirla.** Regenerar los 20 JSON con otra sintaxis y crear la entrada que reemplace a esta.

**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/01_decisiones.md`.

### D-030 — El botón de cálculo directo de m1 va en las 11 razones de flujo, no en 9

- **Fecha**: 2026-10-14
- **Estado**: Reemplazada por D-032
- **Decidió**: Cris Lumbi (con agente IA)
- **Área**: `docs/razones_financieras/*.json` (`ratio.presentation.first_period_toggle`)

**Contexto.** El punto 8 del documento habla de "9 razones de flujo (7, 8, 12–20)" y pide el botón de cálculo directo solo en ellas. El paréntesis enumera 11 razones y la tabla de valores esperados confirma 11: la columna "m1 off" muestra 9 con valor y 11 `N/D`, y las 9 con valor son exactamente las razones de punto.

**Opciones.**
1. Botón en las 11 razones de flujo (7, 8, 12–20) — el paréntesis y los conteos del documento cuadran; el botón es presentación, por defecto apagado, y no altera ningún valor / el número "9" queda interpretado como desliz.
2. Botón en "9" razones — sigue el número escrito / la enumeración del paréntesis tiene 11 ítems, habría que adivinar cuáles quedan fuera y los conteos de la tabla no quedarían justificados.
3. Botón solo donde el caso concreto usa un promedio — depende de los datos y no de la fórmula / el mismo JSON cambiaría de presentación según los datos cargados.

**Decisión.** Opción 1. Con el botón encendido o apagado, las razones de flujo sin datos completos (14, 15, 16, 17, 20 con el caso MUNO MODA) siguen en `N/D`: primero por `missing_required_account_data` o `missing_required_period_balance`, según el estado, así que tener el botón presente en las 11 no cambia ninguna celda de la tabla esperada.

**Consecuencias.** Los 11 JSON de flujo traen `first_period_toggle` con `default: false` (y `period_rules.first_period.toggle.default: false`); los 9 de punto lo traen en `null`. Si el profesor confirma otra lectura, se ajusta la presentación sin mover ninguna cifra.

**Para revertirla.** Quitar el toggle de las razones señaladas y crear la entrada que reemplace a esta.

**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/05_checks.md`.

Corrección 2026-10-15: no hubo confirmación del equipo; la frase se retiró.

### D-031 — El separador decimal del formato numérico queda abierto en `metadata.display`

- **Fecha**: 2026-10-14
- **Estado**: Cerrada por D-033
- **Decidió**: Cris Lumbi (con agente IA)
- **Área**: `docs/razones_financieras/*.json` (`metadata.display.decimal_separator`)

**Contexto.** El reporte inicial de la entrega presentó los valores con formato `en-US` (punto decimal, coma de millares) como formato por defecto. En la revisión se pidió no fijar el separador decimal hasta que el usuario lo confirme, y dejar esa única decisión abierta de forma explícita dentro de los JSON.

**Opciones.**
1. `metadata.display.decimal_separator` con el marcador `DECISION_PENDIENTE` en los 20 JSON — la decisión queda visible para quien revise o consuma el archivo / el que formatea debe leer el campo antes de imprimir.
2. Fijar `en-US` (o `es-VE`) desde ahora — formato determinado / podría cambiar cifras que ve el usuario sin acuerdo del equipo.

**Decisión.** Opción 1, abierta: no se fija el separador decimal; cada JSON lo declara en `metadata.display` como `DECISION_PENDIENTE: separador decimal (punto o coma) por confirmar con el usuario`. Es la única decisión abierta de la entrega: las 8 diferencias conocidas con la solución del profesor no son decisiones abiertas y por eso pasaron a `DIFERENCIA_CONOCIDA_PROFESOR` dentro de `metadata.research_notes`.

**Consecuencias.** Las tablas de las notas muestran importes con coma de millares solo como texto de documentación; ningún JSON fija el formato. Cuando el usuario confirme, se reemplaza el valor en los 20 archivos y esta entrada se marca como reemplazada por una nueva.

**Para revertirla.** Confirmar el separador, actualizar los 20 JSON y crear la entrada que reemplace a esta.

**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/02_fuentes.md`.

### D-032 — El control de cálculo directo es único y global en las 11 razones de flujo (reemplaza a D-030)

- **Fecha**: 2026-10-15
- **Estado**: Vigente (reemplaza a D-030)
- **Decidió**: Cris Lumbi
- **Área**: `docs/razones_financieras/*.json` (`modo_periodo.control_global`)

**Contexto.** D-030 quedó reemplazada: su texto mezclaba el planteamiento original con una atribución de confirmación al equipo que no existía. La orden de corrección v7 pide una entrada nueva (AGENTS.md regla 13) que fije lo decidido sin atribuciones.

**Opciones.**
1. Un solo control global en las 11 razones de flujo, apagado por defecto / un control por razón o "9 razones": la enumeración del documento tiene 11 ítems y los conteos de su tabla confirman 11.

**Decisión.** Un solo control de cálculo directo, global, apagado por defecto, en las 11 razones de flujo. Solo afecta al primer periodo de cada serie. No hay un control por razón ni hay 9 razones.

**Consecuencias.** Igual que D-030: los 11 JSON de flujo traen `modo_periodo.control_global` (`default: false`) y los 9 de punto lo traen en `null`. Ninguna celda de la tabla esperada cambia.

**Para revertirla.** Cambiar el alcance del control en los 20 JSON y crear la entrada que reemplace a esta.

**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/05_checks.md`.

### D-033 — Formato numérico F1 fijo en los 20 JSON (cierra D-031)

- **Fecha**: 2026-10-15
- **Estado**: Cerrada (cierra D-031)
- **Decidió**: Cris Lumbi
- **Área**: `docs/razones_financieras/*.json` (`presentacion`)

**Contexto.** D-031 dejó el separador decimal como única decisión abierta de la entrega v3, con el marcador en `metadata.display`. En la revisión del PR #10 se pidió fijar el formato.

**Opciones.**
1. Formato F1: punto decimal, coma de miles, sufijo ` %`, decimales 0 en moneda y 2 en el resto / mantener el marcador abierto (las decisiones abiertas se reportan en el chat, no en los archivos).

**Decisión.** Formato numérico F1: separador decimal `.`, separador de miles `,`, sufijo de porcentaje ` %`, decimales: moneda 0, el resto 2.

**Consecuencias.** Los 20 JSON declaran el formato en `presentacion`; el marcador de D-031 desaparece de los archivos (lo comprueba V12/V17). Solo cambia cómo se imprime el valor, no el valor.

**Para revertirla.** Cambiar `presentacion` en los 20 JSON y crear la entrada que reemplace a esta.

**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/05_checks.md`.

### D-034 — V12 busca los marcadores prohibidos como placeholder: entre corchetes o en mayúsculas

- **Fecha**: 2026-10-15
- **Estado**: Vigente
- **Decidió**: agente, ratificado por Cris Lumbi (con dos condiciones)
- **Área**: `docs/razones_financieras/notas/validador_v6.mjs` (V12)

**Contexto.** La primera corrida de B4 hizo fallar V12 con `marcador "dato…"` dentro de la prosa de `reglas_generales`, que cita los marcadores que prohíbe. Relajar V12 a mitad de bloque fue una desviación de la orden v6, que pide registrarla.

**Opciones.**
1. Buscar los marcadores como placeholder: entre corchetes o en mayúsculas (la prosa en minúscula de `reglas_generales` no cuenta) / dejar V12 como estaba (marcaría la cita legítima de la regla) / borrar la cita de `reglas_generales` (pierde la explicación del límite).

**Decisión.** Los marcadores prohibidos se buscan como placeholder: entre corchetes o en mayúsculas. La prosa en minúscula de `reglas_generales` no cuenta.

**Consecuencias.** V12 sigue detectando marcadores reales en los campos (R3); la desviación queda registrada en `notas/05_checks.md` (condiciones de la ratificación: esta orden fija la regla y la desviación se registra allí).

**Para revertirla.** Restaurar el patrón original de V12 y crear la entrada que reemplace a esta.

**Referencias.** `docs/razones_financieras/notas/05_checks.md`, orden `prompt_correccion_agente_razones_v7.md`.

### D-035 — Una cuenta solo es `verified` con una frase de una norma abierta que respalde su definición concreta

- **Fecha**: 2026-10-15
- **Estado**: Vigente
- **Decidió**: Cris Lumbi
- **Área**: `docs/razones_financieras/*.json` (`cuentas[].research`), `docs/razones_financieras/notas/03_fuentes.md`

**Contexto.** El audit de fuentes del PR #10 mostró la misma justificación genérica ("NIC 1 exige presentar un juego completo de estados financieros…") repetida en 29 cuentas, también para cuentas de resultado como `is.merchandise_cost` o `is.service_cost`, que una norma general no define.

**Opciones.**
1. `verified` solo con una frase textual de menos de 15 palabras de una norma abierta en la misma ejecución que confirme la definición concreta de la cuenta, con la frase registrada en `03_fuentes.md` / aceptar la justificación genérica repetida (aprueba cuentas que la norma no nombra).

**Decisión.** Una cuenta es `verified` solo si una norma abierta en esta ejecución respalda su definición concreta. Una justificación genérica repetida en varias cuentas no basta. Sin frase específica, la cuenta pasa a `partially_verified`.

**Consecuencias.** En los 20 JSON solo cambian `cuentas[].research.status` y `cuentas[].research.sources`. Las clasificaciones, las 5 `ambiguous` y las cuentas internas del caso no cambian.

**Para revertirla.** Abrir una norma que respalde la cuenta, actualizar la frase en `03_fuentes.md` y crear la entrada que reemplace a esta.

**Referencias.** [ficha razones-json-v3](planificacion/razones-json-v3/README.md), `docs/razones_financieras/notas/03_fuentes.md`, `docs/razones_financieras/notas/05_checks.md`.

### D-036 — Atribución y numeración de las decisiones del PR #10

- **Fecha**: 2026-10-20
- **Estado**: Vigente
- **Decidió**: Cris Lumbi; instrucción comunicada por Carlos mediante la tarea maestra y la ronda 7
- **Área**: Decisiones y referencias de los JSON autónomos del PR #10

**Contexto.** La rama del PR #10 usaba D-021 a D-028, mientras `main` ya ocupaba D-001 a D-027. Las entradas del PR #10 atribuían las decisiones a Alejandro, nombre que la instrucción recibida corrige a Cris Lumbi.

**Opciones.**
1. Conservar D-001 a D-027 de `main` y trasladar las ocho entradas del PR #10 a D-028 a D-035 — conserva ambas series sin colisión.
2. Mantener los números duplicados — haría ambiguas las referencias y confundiría decisiones distintas.

**Decisión.** Se adopta la opción 1 y se atribuyen las decisiones trasladadas a Cris Lumbi. D-021→D-028, D-022→D-029, D-023→D-030, D-024→D-031, D-025→D-032, D-026→D-033, D-027→D-034 y D-028→D-035. Se actualizan las referencias activas. Las salidas históricas y mensajes de commits dentro de bloques de evidencia se conservan literalmente con su numeración original.

**Consecuencias.** D-001 a D-027 de `main` permanecen intactas. Se conservan las ocho decisiones del PR #10 y sus estados de reemplazo/cierre; cambia su identificación y atribución, sin cambiar fórmulas ni resultados. La ficha y el informe explican el mapeo para leer la evidencia histórica. No se renumeran decisiones del PR #14.

**Para revertirla.** Registrar una decisión posterior de numeración y actualizar de forma coordinada todas las referencias; no reutilizar números ocupados ni borrar las decisiones preservadas.

**Referencias.** [Ficha razones-json-v3](planificacion/razones-json-v3/README.md), [informe de ronda 7](planificacion/razones-json-v3/ronda7-C-cierre-pr10.md), `instrucciones_carlos_ronda7.md` y sección 2 de `tarea_maestra_motor_razones.md` recibidas por Carlos.
