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
