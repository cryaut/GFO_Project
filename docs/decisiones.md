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
