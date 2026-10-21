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
| D-029 | Identificadores como metadatos y claves por nombre | Vigente |
| D-030 | Importar filas pendientes sin perder sus montos | Vigente |
| D-031 | Otros ingresos y gastos genéricos requieren confirmación | Vigente |
| D-032 | Los intereses ganados son ingresos | Vigente |
| D-033 | Similitud calibrada como sugerencia confirmable | Vigente |
| D-034 | Propagar N/D en consumidores sin migrar sus fórmulas | Vigente en Reportes; Razones reemplazada por D-044 |
| D-043 | Acotar N/D por importe, posibilidades y periodo | Vigente en Estados/EFE/EOAF; Razones reemplazada por D-044 |
| D-044 | Excluir razones financieras por instrucción de Carlos | Vigente, con excepción D-047/D-048 |
| D-045 | PGC solo como referencia terminológica | Vigente |
| D-046 | Intangibles son activos no monetarios | Vigente |
| D-047 | Propagar N/D en operandos numéricos obligatorios | Vigente |
| D-048 | Proteger operaciones previas de Análisis | Vigente |
| D-051 | Intereses ganados como componente de ingresos no operativos | Vigente |
| D-052 | Conservar sinónimos ambiguos heredados y bloquear cruces nuevos | Vigente |

## Decisiones

Los números nuevos empiezan en D-029 porque D-028 está reservado en la rama del PR #10. Las entradas anteriores no se renumeran ni se modifican.

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

### D-029 — Identificadores como metadatos y claves por nombre

- **Fecha**: 2026-10-17
- **Estado**: Vigente
- **Decidió**: Carlos, aprobación expresa de la recomendación 1 del encargo en el chat
- **Área**: Estados, normalización y respaldos

**Contexto.** Los módulos existentes leen montos con claves por nombre y tipos de cuenta. Sustituirlas por ids exigiría migrarlos junto a los datos guardados.

**Opciones.**
1. Mantener claves por nombre y añadir identidad — permite la transición sin migración masiva.
2. Cambiar las claves por id — uniforma el modelo, pero rompe los lectores actuales.

**Decisión.** Opción 1: `accountIdentities[grupo][nombre]` guarda id, estado, método, candidatos y origen. Un registro común atiende importación y alta manual, pasando siempre por la normalización. Totales sin tipo y suplementarios se conservan aparte.

**Consecuencias.** Los JSON incluyen metadatos nuevos validados; los respaldos anteriores siguen aceptándose y conservan sus tipos. La API por id no fabrica totales. Los 19 tipos no crecen. La propiedad de las copias de los JSON del motor queda pendiente de ese motor.

**Para revertirla.** Cambiar registro, normalización, API de montos y sus pruebas; para optar por ids, migrar antes los consumidores y respaldos.

**Referencias.** [Ficha de cuentas](planificacion/cuentas/README.md), sección 10.1 del encargo.

### D-030 — Importar filas pendientes sin perder sus montos

- **Fecha**: 2026-10-17
- **Estado**: Vigente
- **Decidió**: Carlos, aprobación expresa de la recomendación 2 en el chat
- **Área**: Importación, normalización y revisión de Estados

**Contexto.** Antes una sola cuenta desconocida detenía la importación completa.

**Opciones.**
1. Conservar montos y marcar reconocida/sugerida/no reconocida — permite revisar después.
2. Mantener el error por cuenta — impide trabajar con un archivo parcialmente conocido.

**Decisión.** Opción 1. Una cuenta sin grupo se conserva en `pendingAccounts`. Una cuenta con grupo permanece en su sección. Las sugerencias nunca se aplican solas. El resumen cuenta cuentas únicas entre periodos; errores de estructura, importes, duplicados y claves peligrosas siguen deteniendo la operación de manera atómica.

**Consecuencias.** Los tests que exigían error por cuenta sin tipo pasan a exigir conservación y estado pendiente. Los totales afectados quedan N/D, con `unrecognized_imported_account` o `ambiguous_account_match`. D-019 (importes) y D-020 (validación de respaldos) se conservan.

**Para revertirla.** Volver a exigir clasificación en registro, importación y normalización; retirar revisión y actualizar las pruebas.

**Referencias.** [Ficha de cuentas](planificacion/cuentas/README.md), D-034.

### D-031 — Otros ingresos y gastos genéricos requieren confirmación

- **Fecha**: 2026-10-17
- **Estado**: Vigente
- **Decidió**: Carlos, aprobación expresa de la recomendación 3 en el chat
- **Área**: Identificador y compatibilidad de Estados

**Contexto.** Los nombres genéricos no indican si el ingreso/gasto es operativo. MUNO MODA usa la clasificación no operativa previa.

**Opciones.**
1. Preservar el caso previo y preguntar en nuevas altas/importaciones — evita inventar el contexto.
2. Aplicar no operativo siempre — cambia la interpretación de empresas distintas.

**Decisión.** Opción 1. «Otros Ingresos» y «Otros Gastos» permanecen sugeridos hasta confirmar un id, incluso con su tipo transitorio; los datos legados mantienen su tipo explícito o adaptación conocida. Los nombres canónicos específicos e ids explícitos válidos sí se reconocen.

**Consecuencias.** La demo mantiene sus cifras y las importaciones nuevas muestran candidatos operativos/no operativos. Los conceptos sin tipo equivalente siguen disponibles por id y dejan N/D en los cálculos anteriores que no los pueden representar.

**Para revertirla.** Cambiar catálogo/identificador, adaptación legada y corpus; comprobar utilidad operativa y cobertura.

**Referencias.** [Investigación](planificacion/cuentas/investigacion.md), sección 10.3 del encargo.

### D-032 — Los intereses ganados son ingresos

- **Fecha**: 2026-10-17
- **Estado**: Vigente
- **Decidió**: Carlos, aprobación expresa de la recomendación 4 en el chat
- **Área**: Catálogo y adaptación al motor de totales

**Contexto.** La expresión regular de intereses confundía «Ingresos por Intereses» e «Intereses ganados» con gastos financieros.

**Opciones.**
1. Añadir `is.interest_income` y adaptarlo a otros ingresos — corrige el signo sin ampliar los tipos.
2. Dejarlo sin reconocer — evita la resta errónea, pero mantiene una brecha conocida.

**Decisión.** Opción 1. El gasto identificado como `is.interest_expense` conserva su tipo `intereses`. Los ingresos ganados usan `otrosIngresos` durante la transición, sin modificar la fórmula de utilidad.

**Consecuencias.** En un archivo con ventas 100, intereses ganados 20 y gasto por intereses 5, la utilidad es 115, antes 75 por la inferencia incorrecta. La demo no tiene esos ingresos y sus cifras no cambian. No se interpreta el rótulo genérico «Intereses» como ingreso en nuevas altas; requiere contexto/confirmación.

**Para revertirla.** Retirar el nuevo id y sus alias; actualizar identificador y pruebas de signo.

**Referencias.** [Investigación](planificacion/cuentas/investigacion.md), fuente oficial IFRS sobre presentación de ingresos por intereses abierta en esta sesión.

### D-033 — Similitud calibrada como sugerencia confirmable

- **Fecha**: 2026-10-17
- **Estado**: Vigente
- **Decidió**: Codex, calibración técnica autorizada en la sección 10.7; pendiente de revisión del PR
- **Área**: `cuentas-similitud.js`

**Contexto.** Con la medida principal propuesta, Efetivo/Efectivo da 1−1/8 = 0.875, incompatible por sí sola con el ejemplo ≥0.92. La medida por palabras permitía calibración.

**Opciones.**
1. Conservar la principal y normalizar el apoyo por longitud combinada — cumple el corpus de errores sin elegir ids.
2. Bajar el umbral de preselección — facilita sugerir, pero pierde el margen propuesto.

**Decisión.** Opción 1, con apoyo simétrico para penalizar palabras omitidas. Efetivo/Efectivo da 1−1/15 = 0.9333. Se conservan 0.80 mínimo, 0.92 preselección, ventaja 0.05 y hasta cinco candidatos. Dígitos diferentes dan cero. Un empate no se preselecciona.

**Consecuencias.** Todos los resultados difusos son sugeridos y requieren confirmación. Las variantes sin acentos, signos o mayúsculas que normalizan al mismo texto se reconocen por la regla exacta de R1; no son coincidencias difusas. El corpus exige cero reconocimientos incorrectos.

**Para revertirla.** Cambiar medida de apoyo/umbrales y recalibrar los corpus positivo y negativo.

**Referencias.** `tests/unit/cuentas-identificador.test.js`, sección 8 del encargo.

### D-034 — Propagar N/D en consumidores sin migrar sus fórmulas

- **Fecha**: 2026-10-17
- **Estado**: Vigente en Reportes; Razones reemplazada por D-044
- **Decidió**: Carlos, aprobación expresa del ajuste mínimo adicional en el chat
- **Área**: Totales compartidos, lectura de Análisis y Reportes

**Contexto.** R1 exige N/D por cuentas pendientes, pero el alcance inicial excluía consumidores. Análisis y Reportes reconstruían los estados descartando metadatos; algunas operaciones convertían null en cero y Reportes reemplazaba utilidad N/D por un cálculo alternativo.

**Opciones.**
1. Preservar metadatos y propagar disponibilidad — cumple R1 sin migrar el motor.
2. Documentar la limitación — seguirían apareciendo ceros o cifras parciales tras guardar.

**Decisión.** Opción 1. Los lectores conservan el objeto completo; el adaptador puro `aplicarDisponibilidadRazones` anula los campos afectados y conserva motivos. Reportes muestra N/D y respeta la utilidad compartida. Un total junto a componentes del mismo tipo no se suma dos veces: el agregado anterior queda N/D con `overlapping_account_aggregation`; la API devuelve el total publicado.

**Consecuencias.** Cambios mínimos en dos consumidores, aprobados como excepción al alcance inicial. Las fórmulas se conservan y no se migra ningún módulo a `montoCuenta`. La ambigüedad puede invalidar conservadoramente varias razones del mismo grupo, hasta que el motor pueda determinar dependencias por cuenta. Los importes originales quedan conservados. No se confirma un dato de dividendos.

**Para revertirla.** Retirar la propagación de disponibilidad y el guardado de metadatos de los lectores; ello vuelve a dejar incompleto R1.

**Referencias.** [Ficha de cuentas](planificacion/cuentas/README.md), D-029–D-033, `cuentas-consumidores.test.js`.


### D-043 — Acotar N/D por importe, posibilidades y periodo

- **Fecha**: 2026-10-18
- **Estado**: Vigente en el borrador; pendiente de revisión humana
- **Decidió**: Carlos autorizó proceder con las correcciones de las revisiones recibidas; los documentos atribuyen a Cris la aprobación previa de las reglas 1–3. Codex implementa y verifica, sin confirmar decisiones aún reservadas a Cris.
- **Área**: Estados compartidos, disponibilidad de razones y comprobaciones EFE/EOAF

**Contexto.** La protección conservadora de D-034 anulaba un grupo completo aunque la cuenta pendiente fuera cero o solo pudiera pertenecer a un subtotal. Un desconocido legado podía aumentar el total sin aviso. En EFE, los dividendos derivados comparten la utilidad de operación y su conciliación no la verifica independientemente.

**Opciones.**
1. Conservar el bloqueo por grupo y exigir revisión incluso con cero — oculta resultados completos y mantiene la inconsistencia legada.
2. Omitir pendientes de importe cero y acotar la disponibilidad por posibilidades y entradas efectivas — conserva los importes y explica la incertidumbre restante.

**Decisión.** Opción 2; precisa la propagación de D-034. Una cuenta pendiente con saldo numérico cero no aplica a los cálculos del periodo. Con importe, se anulan tipos/subtotales posibles y total del grupo, usando tipo explícito o candidatos; conflictos conservan ambas posibilidades y la falta de contexto considera todo su grupo. La regla incluye desconocidos legados, preservando las clasificaciones conocidas de la demo. Cada motivo enumera campos; las razones distinguen entradas actuales y promedios/compras del periodo anterior. EFE/EOAF solo omiten la falta de tipo si ambos saldos explícitos son cero. EFE reconoce pérdida del ejercicio/periodo y advierte reservas/resultados opuestos. Se aclara que los dividendos son derivados y cuadrar no comprueba UN de forma independiente, sin cambiar la fórmula.

**Consecuencias.** Se conservan demo, importes, fórmulas y los 19 tipos. La identidad pendiente sigue en revisión. El dato independiente de dividendos y la retirada de nombres fijos siguen pendientes de Cris. La auditoría rebaja conservadoramente seis estados sin evidencia suficiente; v8 y la reconciliación con los JSON de PR #10 siguen pendientes. D-043 reserva la posición posterior al bloque acordado D-037–D-042; D-029–D-034 se renumerarán justo antes de integrar, después de PR #10, sin editar ahora D-001–D-027.

**Para revertirla.** Retirar el alcance por campos y las excepciones cero de los consumidores, con sus pruebas; esto reintroduce los fallos documentados y requiere decisión nueva.

**Referencias.** [Correcciones y pendientes](planificacion/cuentas/02-correcciones-revision.md), D-030, D-034; instrucciones_amigo_pr14.md y revision_pr13_para_carlos.md recibidos por Carlos.


### D-044 — Excluir razones financieras por instrucción de Carlos

- **Fecha**: 2026-10-18
- **Estado**: Vigente
- **Decidió**: Carlos, indicación expresa posterior: «la parte de las razones no la modifiques»
- **Área**: Alcance del PR #14 y reversión de los ajustes específicos de Razones

**Contexto.** D-034 y parte de D-043 autorizaron adaptar disponibilidad en Razones. Después de publicarse la revisión, Carlos excluye esa parte del trabajo.

**Opciones.**
1. Retirar la integración específica de Razones y preservar el resto de la corrección — respeta el límite actualizado del usuario.
2. Mantener el adaptador porque no cambia fórmulas — seguiría modificando su comportamiento y no cumple el límite.

**Decisión.** Opción 1. Se restaura analisis/index.js completo a origin/main, se elimina cuentas-disponibilidad.js y sus pruebas exclusivas, y se retiran las afirmaciones de propagación específica en Razones de la documentación vigente. Se mantienen importación, catálogo, totales de Estados/Reportes y correcciones EFE/EOAF en sus archivos propios. Esta decisión reemplaza únicamente el alcance de Razones de D-034/D-043, sin reescribir sus motivos históricos.

**Consecuencias.** Las fórmulas, código de razones, interfaz y pruebas originales quedan como en main. Los totales compartidos de Estados siguen alimentando esos módulos, de modo que corregir una cuenta puede modificar una entrada; no se garantiza aquí la adaptación de N/D/metadatos en Razones para pendientes. Esa adaptación, la retirada de nombres fijos y cualquier otra modificación de Razones quedan fuera de esta entrega. La reversión se registra en un commit nuevo, sin force push ni merge.

**Para revertirla.** Obtener autorización expresa para una tarea de Razones y recuperar o rediseñar el adaptador con sus pruebas; no reintroducirlo como cambio incidental de importación.

**Referencias.** [Exclusión de razones y validación vigente](planificacion/cuentas/03-excluir-razones.md), D-034, D-043, instrucción directa de Carlos en este chat.

Aclaración (18 de octubre de 2026): la decisión y la instrucción fueron de Cris Lumbi. Carlos la transmitió en el chat.


### D-045 — PGC solo como referencia terminológica

- **Fecha**: 2026-10-18
- **Estado**: Vigente
- **Decidió**: Cris Lumbi, aprobación comunicada en las rondas 2 y 3; aplicada por Carlos
- **Área**: Catálogo, investigación y pruebas de evidencia

**Contexto.** Las citas específicas de 22 cuentas verificadas procedían del PGC español; no acreditan su verificación NIIF/NIC para el catálogo del proyecto. La ronda 2 señala cuatro y exige una guardia contra cualquier verified sustentado por PGC.

**Opciones.**
1. Mantener verified apoyado en PGC — conserva los estados previos, pero incumple el criterio acordado.
2. Rebajar esas cuentas y conservar la fuente como referencia terminológica — deja visible el alcance real de la evidencia.

**Decisión.** Opción 2. Las cuatro señaladas y las otras 18 en idéntica situación pasan a partially_verified. Se retira de amortización la cita que habla de depreciación; la de depreciación se identifica como conjunta de 680/681/682.

**Consecuencias.** El catálogo queda en 1 verified, 66 partially_verified y 5 ambiguous. La fixture enumera 28 rebajas frente al PR #10 (6 anteriores y 22 actuales), sin modificar su instantánea original ni sus JSON. No cambia identificación, tipo, importe ni fórmula; la sincronización upstream sigue pendiente.

**Para revertirla.** Obtener citas específicas válidas y registrar una decisión nueva antes de subir un estado; mantener la guardia de evidencia.

**Referencias.** [Ronda 3 y validación](planificacion/cuentas/04-ronda3-nd.md); instrucciones_amigo_pr14_ronda2.md e instrucciones_carlos_pr14_ronda3.md recibidas por Carlos.


### D-046 — Intangibles son activos no monetarios

- **Fecha**: 2026-10-18
- **Estado**: Vigente
- **Decidió**: Cris Lumbi, corrección aprobada en las rondas 2 y 3
- **Área**: Definición del catálogo y contraste con PR #10

**Contexto.** La definición heredada decía monetarios, en contradicción con la referencia IAS 38 ya documentada.

**Opciones.**
1. Esperar a modificar el JSON ajeno — conserva temporalmente una definición incorrecta local.
2. Corregir el catálogo local y declarar la diferencia — cumple la corrección sin editar otro PR.

**Decisión.** Opción 2. En bs.intangible_assets se cambia únicamente monetarios por no monetarios. La fixture conserva texto de referencia, texto local, motivo y decisión.

**Consecuencias.** Se mantienen clasificación, tipo, signo, política de ausencia y estado parcialmente verificado. No cambia ningún cálculo ni JSON del PR #10. Su futura integración debe reconciliar la definición.

**Para revertirla.** Registrar una decisión nueva y coordinar antes cualquier cambio conceptual; no modificar la instantánea para ocultar diferencias.

**Referencias.** [Ronda 3 y validación](planificacion/cuentas/04-ronda3-nd.md); instrucciones_amigo_pr14_ronda2.md e instrucciones_carlos_pr14_ronda3.md recibidas por Carlos.


### D-047 — Propagar N/D en operandos numéricos obligatorios

- **Fecha**: 2026-10-18
- **Estado**: Vigente
- **Decidió**: Cris Lumbi aprobó 1a según ronda 3; Carlos adoptó la excepción limitada tras aclarar el origen de D-044 en este chat
- **Área**: js/utils/calculate.js y contratos de consumidores

**Contexto.** Null participa como cero en la aritmética de JavaScript. Los helpers antiguos podían devolver resultados numéricos o NaN al recibir importes ausentes; tasaImpuesto infería una tasa con IR ausente.

**Opciones.**
1. Proteger solo denominadores — no evita numeradores/restas falsos.
2. Validar operandos obligatorios antes de operar — propaga N/D sin modificar las fórmulas.

**Decisión.** Opción 2. Null/undefined de un operando obligatorio devuelve null. EFE valida utilidad, lista y elementos de ajustes (incluidos huecos); DuPont conserva su objeto con N/D en componentes afectados. Defaults opcionales declarados y tasas inactivas cuando DAP=0 mantienen su contrato. No se cambian casos numéricos completos ni convenciones legadas de cero.

**Consecuencias.** SaldoPromedio exige dos saldos; Análisis aplica explícitamente la regla de saldo final de un periodo (D-048). TasaImpuesto exige IR/UAI informados; Apalancamiento conserva D-005 seleccionando explícitamente su tasa configurada válida solo cuando no existe cuenta IR, sin inventar IR ni cambiar esa política. Se ajustan pruebas de esos contratos y se mantienen las pruebas de integración de Apalancamiento/UI originales. Excepción limitada a D-044; el motor nuevo no se conecta.

**Aclaración (20 de octubre de 2026, ronda 6).** Se restaura `tasaImpuesto` a `origin/main`: cuando la efectiva no está disponible, devuelve la tasa configurada válida según D-005, incluso con IR o UAI ausentes. Apalancamiento vuelve a llamar al helper como en `main`; sus pruebas originales se restauran. Esta precisión deja sin efecto la restricción de IR/UAI de la consecuencia anterior solo para `tasaImpuesto`. `saldoPromedio` y las demás guardas de D-047/D-048 se conservan. El texto histórico anterior no se borra.

**Para revertirla.** Revertir guardas y sus pruebas reintroduciría los números falsos; para cambiar políticas, registrar otra decisión coordinada.

**Referencias.** [Ronda 3 y validación](planificacion/cuentas/04-ronda3-nd.md); instrucciones_amigo_pr14_ronda2.md e instrucciones_carlos_pr14_ronda3.md recibidas por Carlos.


### D-048 — Proteger operaciones previas de Análisis

- **Fecha**: 2026-10-18
- **Estado**: Vigente
- **Decidió**: Cris Lumbi aprobó 1b según ronda 3; Carlos adoptó la excepción limitada en este chat
- **Área**: computeRazones en js/modules/analisis/index.js

**Contexto.** Aunque calculate.js sea estricto, una resta previa convierte null en cero y pierde la evidencia de ausencia antes de llamar al helper. Al releer los estados se descartaban metadatos de cuentas pendientes.

**Opciones.**
1. Proteger solo calculate.js — siguen apareciendo márgenes, compras y capital de trabajo falsos.
2. Proteger también las operaciones previas y preservar metadatos — permite que el helper reciba N/D real.

**Decisión.** Opción 2. Se validan operandos de utilidad bruta/operativa, compras y capital neto de trabajo; su N/D se conserva, incluido el denominador mostrado de rotación del capital de trabajo. Se releen metadatos y se conservan motivos originales por periodo, añadiendo campo/operandos de operaciones previas en notAvailableReasons. Un solo periodo selecciona saldo final explícitamente; la aproximación de compras sin inventario comparable permanece.

**Consecuencias.** Se mantienen fórmulas, interfaz, cifras completas de MUNO MODA 2023/2024 y ceros válidos. No se reinstala el adaptador de anulación por grupos ni se conecta el motor. No se retiran nombres fijos: 1c y cualquier futura D-049 requieren confirmación aparte.

**Para revertirla.** Retirar la protección previa volvería a permitir coerciones; revisar junto a D-047 y sus pruebas antes de otra modificación.

**Referencias.** [Ronda 3 y validación](planificacion/cuentas/04-ronda3-nd.md); instrucciones_amigo_pr14_ronda2.md e instrucciones_carlos_pr14_ronda3.md recibidas por Carlos.

### D-051 — Intereses ganados como componente de ingresos no operativos

- **Fecha**: 2026-10-19
- **Estado**: Vigente
- **Decidió**: Cris Lumbi; aprobación comunicada por Carlos en instrucciones_carlos_pr14_ronda5.md
- **Área**: Catálogo de cuentas y documentación del PR #14

**Contexto.** La app ya suma intereses ganados e ingresos no operativos mediante `otrosIngresos`, pero el catálogo no expresaba la relación entre los dos ids. Un alias excluía cuentas específicas y contradecía la definición que incluye intereses ganados.

**Opciones.**
1. Añadir `agrupadoEn` a la entrada de intereses ganados — conserva la relación junto a su definición y las consultas públicas la exponen mediante copia.
2. Exportar un mapa `COMPONENTES_DE` separado — permite declarar la misma relación, pero introduce otra estructura innecesaria porque el catálogo admite el campo opcional.

**Decisión.** Los intereses ganados son componente de los ingresos no operativos al calcular la utilidad neta sin utilidad reportada. Aprobado por Cris Lumbi el 19 de octubre de 2026. Sin cambio de fórmulas en los JSON.

**Consecuencias.** Implementado el 2026-10-20 como `is.interest_income.agrupadoEn = 'is.nonoperating_income'`. Ambas cuentas conservan `tipoApp: 'otrosIngresos'`; se actualiza la nota de intereses y se retira únicamente el alias contradictorio de ingresos no operativos, sin cambiar su definición. No cambia la utilidad que calcula la app. Este metadato no agrega componentes automáticamente en las consultas por id ni conecta el motor. La comparación con los JSON se documenta en lectura; la aceptación app/JSON pertenece al motor. D-049 (1c) y D-050 (opción C del motor) no se registran ni se implementan aquí.

**Para revertirla.** Retirar el campo y ajustar la nota del catálogo, sus pruebas, API e investigación mediante una decisión posterior coordinada. No requiere cambiar fórmulas actuales.

**Referencias.** [Ronda 5](planificacion/cuentas/05-ronda5-puente-intereses.md), [comparación de utilidad](planificacion/cuentas/06-comparacion-utilidad-json.md), [PR #14](https://github.com/cryaut/GFO_Project/pull/14), instrucciones_carlos_pr14_ronda5.md recibidas por Carlos.

### D-052 — Conservar sinónimos ambiguos heredados y bloquear cruces nuevos

- **Fecha**: 2026-10-20
- **Estado**: Vigente
- **Decidió**: Carlos, elección expresa en el chat al aclarar el requisito de sinónimos de la ronda 5
- **Área**: Criterio de validación del catálogo y documentación del PR #14

**Contexto.** La ronda 5 pedía unicidad absoluta de sinónimos, pero el catálogo ya tenía siete alias exactos compartidos y ocho cruces tras normalizar. Eliminar todos esos casos cambiaría la identificación previa y las ambigüedades que D-031 y el corpus conservan para pedir contexto o confirmación.

**Opciones.**
1. Conservar los casos heredados documentados y bloquear cruces nuevos — mantiene la compatibilidad y hace visibles las excepciones.
2. Ampliar el alcance para depurar los casos existentes — permitiría buscar unicidad absoluta, pero cambiaría la identificación y requeriría revisar cada caso.

**Decisión.** Carlos aprueba «Conservar los ambiguos existentes y bloquear duplicados nuevos». Se mantienen los ocho cruces normalizados enumerados en el informe de ronda 5. La prueba existente compara ese conjunto y sus cuentas participantes para detectar otros cruces o cambios; este criterio sustituye la exigencia literal de unicidad absoluta para esta entrega.

**Consecuencias.** Se cierra el pendiente de sinónimos sin modificar catálogo, identificador, fórmulas ni pruebas. No se afirma que todos los sinónimos sean únicos ni se autoriza depurar los casos heredados. D-031 y D-051 se conservan; esta elección se atribuye a Carlos, sin atribuirla a Cris.

**Para revertirla.** Acordar la revisión de los casos heredados, registrar una decisión posterior y actualizar catálogo, corpus y guardia junto con las regresiones de identificación afectadas.

**Referencias.** [Ronda 5 y lista de cruces](planificacion/cuentas/05-ronda5-puente-intereses.md), `tests/unit/cuentas-identificador.test.js`, [PR #14](https://github.com/cryaut/GFO_Project/pull/14), aprobación expresa de Carlos en el chat del 2026-10-20.
