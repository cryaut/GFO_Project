# Diagnóstico del ejemplo predeterminado y propuesta de solución

> Registro del diagnóstico previo a la reparación. La implementación local posterior, sus cambios de contrato, resultados y límites se documentan en [Reparación de totales del motor](../reparacion-totales-motor/INFORME-FINAL.md). Las tablas de este diagnóstico conservan el comportamiento anterior para poder compararlo.

Fecha: 2026-11-07. Base examinada: `8197215`, continuación local de Estados resueltos y Proforma. El usuario confirmó que observa el ejemplo predeterminado del botón **Cargar ejemplo** de Estados: `DEMO_MUNOMODA`, no los fixtures de pruebas ni un ejercicio importado externo.

## Veredicto

El problema se reproduce. Hay una deficiencia del modelo de disponibilidad del motor y de su integración con Estados: al reconstruir agregados exige cuentas de un desglose universal que un ejercicio no tiene por qué proporcionar. No se limita a una demo incompleta y no se corrige simplemente rellenándola con ceros. La demo tampoco declara la composición de otros ingresos. No es un fallo general de divisiones ni un motivo para transformar N/D en cero. Hay además N/D correctos por falta de información de crédito, cotización/acciones y periodo anterior.

La presentación anterior tampoco ayudaba: AH mezclaba los estados y Razones mostraba N/D sin sus motivos. Estas dos partes se corrigen en esta rama. **La solución financiera que se propone más abajo todavía no está aplicada.** No se modificaron el motor, la especificación generada, los JSON ni las cifras de la demo.

## Ampliación: totales suficientes y dependencias innecesarias

Ampliación solicitada por Cris el 2026-11-07. Que el código cumpla una decisión anterior sobre datos faltantes no demuestra que el diseño resuelva correctamente los ejercicios. Se registra como **problema funcional prioritario de cálculo/disponibilidad**, además de la inconsistencia entre pantallas. Las pruebas anteriores que terminan en N/D caracterizan el comportamiento actual; no lo validan como resultado deseado para un ejercicio con información suficiente.

### Razón corriente: se necesitan AC y PC, no todas las cuentas del catálogo

La fórmula existente es `AC / PC`. Por ejemplo, si el ejercicio proporciona total de activo corriente 1000 y total de pasivo corriente 400, la razón es **2.5 veces**. Franquicias, inversiones temporales, anticipos o impuestos por pagar individuales no son operandos adicionales de esa división. Los intangibles ni siquiera pertenecen al activo corriente.

Se comprobaron dos rutas diferentes del motor:

1. **Totales reportados con identidad acreditada.** `derived.current_assets` consulta `bs.current_assets_total`; `derived.current_liabilities`, `bs.current_liabilities_total`. Ambos usan `reported_or_calculate`. En una prueba con solo esos dos totales, sin completar el resto del catálogo, la razón corriente **sí devuelve 2.5**. También lo hace con detalle parcial reconocido. Por tanto, no es exacto afirmar que este motor siempre exige todas las cuentas incluso cuando recibe esos dos totales válidos.
2. **Reconstrucción desde las cuentas.** Si no encuentra esos totales como datos acreditados, entra en los conjuntos de detalle. `sum_accounts` exige cada miembro con `requires_data`, y `combinar` propaga cualquier `null`. En esta ruta confunde demasiadas veces «no existe esa cuenta en este ejercicio» con «falta información necesaria para el agregado». Aquí está el bloqueo reproducido de la demo.

En la demo, `reportedTotals` no contiene los dos ids anteriores, aunque Estados muestre subtotales calculados por otro lector:

| Periodo | AC mostrado por Estados | PC mostrado por Estados | RC del motor | Cociente si se acredita la cobertura de esos totales |
|---|---:|---:|---|---:|
| 2023 | 370000 | 160000 | N/D | 2.3125 |
| 2024 | 412000 | 175000 | N/D | 2.3542857143 |

Para RC faltan específicamente tres componentes de AC —inversiones temporales, otras CxC y anticipos— y cuatro de PC —préstamos de corto plazo, porción corriente de deuda a largo plazo, impuestos y gastos acumulados por pagar—. No falta una operación de división. **Los siete faltantes de RC no deben confundirse con los 17 faltantes de BG del conjunto de indicadores.**

El subtotal visible de Estados no se transmite como un agregado calculado con cobertura acreditada al motor. Este vuelve a resolver el grupo bajo otro contrato y termina en N/D. Es una falla de integración y de representación de suficiencia de datos. Sin embargo, copiar automáticamente cualquier subtotal visible a `reportedTotals` tampoco es correcto: un subtotal calculado de un archivo parcial podría omitir importes reales y no fue reportado por la fuente. La solución debe conservar su procedencia y comprobar su cobertura.

### Otro fallo confirmado: un total reportado puede bloquearse al evaluar su desglose

Se reprodujo un caso distinto con **utilidad neta reportada 100** y **ventas netas reportadas 1000**:

| Entrada controlada | Margen neto actual | Resultado esperado usando esos dos totales acreditados |
|---|---|---|
| Solo los totales UN y VN | 10 % | 10 % |
| Mismos totales, más otro ingreso no operativo 20 sin declarar composición | N/D: `composicion_no_declarada` | 10 %, con la limitación de la comprobación del detalle indicada por separado |
| Mismos importes, declarando que otros ingresos excluyen intereses | 10 % | 10 % |

La causa está en `reported_or_calculate`: después de leer un total reportado numérico, también ejecuta `hijo(nodo.calculation, ...)` para compararlo con el desglose. Esa evaluación puede lanzar el error de composición. El adaptador lo convierte en N/D y se pierde un resultado que podía obtenerse del total sin reconstruir la utilidad. El caso es independiente de los siete componentes de RC y no se resuelve cambiando su fórmula.

La comprobación del detalle debe tener su propia disponibilidad. Si falta información para reconstruir un total ya acreditado, la futura corrección debe conservar el total y advertir «desglose no verificable». Una discrepancia numérica comprobable debe seguir señalándose, como exige el contrato actual; no se propone silenciar cuentas ambiguas, errores estructurales ni conflictos de identidad que comprometan la validez del propio total.

### Principio de corrección: pedir los operandos que necesita cada fórmula

| Cálculo | Información mínima pertinente | Detalle que no se debe exigir si los agregados ya están acreditados |
|---|---|---|
| Razón corriente | AC y PC; PC distinto de cero | Desglose universal de todos los activos/pasivos corrientes |
| Capital neto de trabajo | AC y PC | Ese mismo desglose universal |
| Endeudamiento | Pasivo total y activo total | Cada préstamo, provisión, intangible o activo individual |
| Deuda / patrimonio | Pasivo total y patrimonio | Cada componente de capital y reservas |
| Margen bruto | UB y ventas netas, o datos suficientes para derivar UB | Todos los tipos de ventas y costos simultáneamente si hay totales utilizables |
| Margen neto | UN y ventas netas | Desglose íntegro del ER para volver a calcular una UN acreditada |
| ROA / ROE | UN y activos/patrimonio del periodo o promedio según el modo vigente | Cada cuenta individual bajo los saldos acreditados |
| DuPont | UN, ventas netas, activos y patrimonio según el modo vigente | Desgloses que no intervienen en esos factores |

«Información mínima» no modifica las fórmulas aprobadas ni el modo temporal, y no convierte un total de ventas brutas en ventas netas. La prueba ácida necesita además el inventario pertinente; las razones de crédito siguen necesitando los datos específicos de D-059. La unidad de validación debe ser el operando requerido y su suficiencia, no la existencia de todas las cuentas imaginables de una empresa.

### Orden propuesto para arreglarlo

1. Resolver cada agregado con procedencia: **total reportado válido**, o **total calculable con cobertura acreditada**, o **no disponible**. Reutilizar el mismo resultado entre Estados y Análisis sin etiquetar un cálculo como reportado. Un agregado válido no debe anularse solo por faltar detalle accesorio.
2. Separar la evaluación del resultado de la comprobación de su desglose. La ruta de comparación no debe bloquear un total válido por datos que solo necesita para contrastarlo. Conservar los avisos de discrepancia y de detalle incompleto.
3. Para reconstruir un grupo sin total, exigir únicamente sus componentes aplicables al ejercicio y los datos realmente desconocidos. Acreditar «no aplica» o la cobertura completa del grupo; no insertar cuentas ficticias en cero ni tratar toda omisión como cero.
4. Propagar N/D solo a resultados dependientes de un operando indispensable que siga sin conocerse. Mantener 0 como valor válido y N/D para denominadores cero.
5. Después, ajustar la demo y las importaciones a ese contrato común. **Completar la demo por sí solo no cierra este hallazgo.** La nueva regla requiere coordinar las decisiones de ausencia y los archivos del motor/generado; no se implementa en esta ampliación documental.

### Comprobación añadida

```powershell
node docs/planificacion/cuentas-opcionales-nd/comprobar-totales.mjs
```

[Evidencia anterior por totales](evidencia-totales-antes.json): ocho casos sintéticos, más ambos periodos de la demo. Incluye total sin detalle, total con detalle parcial, PC desconocido, PC cero, AC cero y el bloqueo del margen neto descrito arriba. Después de D-099, `comprobar-totales.mjs` verifica los resultados corregidos y escribe [la evidencia actual](evidencia-totales.json). No agrega ceros para completar catálogos y no escribe en el store. Los N/D que documentaban el defecto no se mantienen como resultados deseados de aceptación.

## Evidencia reproducible

Ejecutar desde la raíz:

```powershell
node docs/planificacion/cuentas-opcionales-nd/diagnosticar.mjs
```

[Evidencias completas](evidencias.json): valores de los 24 indicadores, motivos agrupados por periodo/cuenta, subtotales del ER, bases de AV, DuPont y otras secciones. El script normaliza la demo con la misma función que el botón de Estados; no escribe en `localStorage`. Los contrafactuales se construyen en memoria y se identifican como sintéticos.

Se cuentan las 20 razones del motor más cuatro complementarias: prueba defensiva, rotación del capital de trabajo, apalancamiento y solvencia. La pestaña Razones muestra 23; CNT se consulta también por otra pestaña.

| Escenario | Disponibles 2023 / 24 | Disponibles 2024 / 24 | Interpretación |
|---|---:|---:|---|
| Demo original normalizada | 1 | 3 | Reproduce lo que reportó el usuario |
| Solo declarar que otros ingresos excluyen intereses | 1 | 3 | Resuelve una causa, pero quedan otras bloqueando los mismos resultados |
| Composición y cuatro ceros **sintéticos** del ER | 4 | 6 | Aísla el bloqueo de utilidad operativa/neta |
| Lo anterior y 17 ceros **sintéticos** de BG realmente bloqueantes | 13 | 19 | Aísla el bloqueo de los conjuntos del balance |

Estos escenarios prueban causalidad; **no acreditan que las cuentas omitidas valgan cero**. No se agregan cuentas de componentes bajo los totales existentes de inventario, ventas o costo, para evitar fabricar discrepancias entre detalle y total.

### Qué sí se calcula sin completar nada

- Margen bruto 2023: `(850000 − 510000) / 850000 = 40 %`.
- Margen bruto 2024: `(920000 − 545000) / 920000 = 40.7608695652 %`.
- Rotación de inventario 2024: `545000 / ((180000 + 195000) / 2) = 2.9066666667`.
- Edad del inventario 2024: `DIAS_ANIO / rotación = 125.5733944954 días`.

En 2023 solo está disponible el margen bruto; en 2024, los otros dos indicadores anteriores también. Los cuatro complementarios quedan N/D por sus operandos. No se encontraron divisiones incorrectas en estos resultados disponibles.

## Causas y alcance

### 1. Cuentas individuales exigidas dentro de conjuntos

`razones-motor.js`, `leerBase`, aplica `requires_data`: si el id no tiene un importe acreditado, devuelve `missing_required_account_data`. `sum_accounts` y `combinar` propagan el N/D. Es el comportamiento aprobado en D-055/D-057, no una caída del navegador.

En esta demo hay **17 ids de BG** ausentes que bloquean sumas del motor:

| Grupo | Ids que faltan |
|---|---|
| Activos (8) | `bs.short_term_investments`, `bs.other_current_receivables`, `bs.prepaid_expenses`, `bs.ppe_furniture`, `bs.ppe_other`, `bs.intangible_assets`, `bs.long_term_investments`, `bs.other_noncurrent_assets` |
| Pasivos (5) | `bs.short_term_borrowings`, `bs.current_portion_long_term_debt`, `bs.taxes_payable`, `bs.accrued_expenses_payable`, `bs.long_term_provisions` |
| Patrimonio (4) | `bs.additional_paid_in_capital`, `bs.other_reserves`, `bs.current_year_result_equity`, `bs.other_equity_components` |

Por ejemplo, la demo ya tiene efectivo, CxC, inventario y otros activos corrientes. El motor requiere además inversiones temporales, otras CxC y anticipos. La suma AC queda N/D y afecta RC, RR, CNT y varios indicadores dependientes. En PC también faltan cuatro componentes. AT y patrimonio incompletos se propagan a endeudamiento, rotaciones, ROA, ROE y DuPont.

Esto no significa que una empresa deba tener todas esas cuentas; significa que el modelo actual no distingue suficientemente «no aplica en este ejercicio» de «no informado». En inventario, la demo tiene un total acreditado y no exige inventar materias primas u otros componentes para poder calcular la rotación.

### 2. Cuatro componentes del ER no detallados

Faltan `is.other_operating_income`, `is.operating_depreciation`, `is.operating_amortization` e `is.other_operating_expenses`. La demo sí proporciona administración y ventas, pero no acredita si esos importes contienen depreciación/amortización o si existen otras partidas separadas. El motor no puede suponerlo sin riesgo de omisión o doble conteo.

Por eso UB sí existe —340000 y 375000—, mientras que gastos operativos, UAII, UAI y UN se bloquean. D-096/D-097 extendieron esa misma disponibilidad a la lectura resuelta y al real de Proforma. Los fixtures anteriores con ceros explícitos acreditaban un caso completo, pero no detectaban esta incompatibilidad de la demo real. Se añadió una prueba específica sin completar campos.

En el **contrafactual** con esos cuatro componentes en cero y composición declarada:

| Paso | 2023 | 2024 |
|---|---:|---:|
| UB | 340000 | 375000 |
| Administración + ventas | 205000 | 220000 |
| UAII | 135000 | 155000 |
| UAI | 127400 | 149750 |
| IR dado por la demo | 38220 | 44925 |
| UN | 89180 | 104825 |

Se reutilizan las consultas existentes para verificar estas cifras. La tabla no afirma que el ejercicio original haya proporcionado los cuatro ceros ni autoriza sumarle nuevamente la depreciación del BG al ER.

### 3. Composición de otros ingresos sin declarar

La demo trae Otros Ingresos 15000 y 18000, con identidad `is.nonoperating_income`, pero no incluye `composicionIngresos`. Queda `sin_declarar`. D-051/D-056 exigen confirmar que excluye intereses ganados para no duplicarlos: el adaptador devuelve `composicion_no_declarada`. Declararlo es necesario y por sí solo no resuelve los cuatro faltantes anteriores.

La captura ya existe en Estados, dentro de las opciones del periodo. No debe deducirse su respuesta por el nombre «Otros Ingresos» ni por el importe.

### 4. N/D legítimos de crédito y periodos

La demo no trae `supp.credit_sales` ni `supp.supplier_payments`. D-059 exige datos reales para rotación de CxC/CxP, sus plazos y ciclo de conversión. Aunque se completaran todos los conjuntos anteriores, **cinco indicadores de 2024 seguirían N/D**: rotación CxC, PPC, rotación CxP, plazo de pago y ciclo de conversión. No corresponde usar ventas totales o una aproximación de compras para forzar el resultado.

El primer periodo es 2023 y no hay 2022. D-032 deja apagado el modo directo para las 11 razones de flujo: su N/D es correcto bajo esa convención. El motor soporta `mostrar_calculo_directo_primer_periodo`, pero la interfaz de Análisis no lo ofrece. Antes afirmaba que sin periodo anterior usaba saldos finales, aunque no enviaba esa opción. **Se corrigió el texto**, sin activar el modo ni cambiar la convención.

En la prueba contrafactual completa, el control directo solo de diagnóstico aumenta 2023 de 13 a 19 resultados disponibles. Los otros cinco siguen requiriendo información de crédito. No se habilitó ese control en la aplicación.

### 5. Dos lectores con distinta disponibilidad

El totalizador `computeFinancialTotals` todavía acepta algunas sumas de tipos que el motor estricto no puede completar. En la demo produce AT 801475/825525, PC 160000/175000 y patrimonio 517615/582440; ambos balances cuadran. También produce UN 89180/104825.

Esto explica que CNT/CNO, EOAF o EFE puedan mostrar cifras mientras Razones/DuPont muestran N/D. **La coherencia pendiente es entre contratos de entrada**, no una diferencia de multiplicar o dividir:

| Sección | Resultado de la demo sin completar | Diagnóstico |
|---|---|---|
| AH | Compara cuentas numéricas; los subtotales incompletos siguen N/D | La tabla combinada era un problema de presentación; ahora BG/ER separados |
| AV | Base BG 801475/825525; base ER 850000/920000 | No está todo indisponible; gastos/utilidades dependen de las causas anteriores |
| Razones | 1/24 y 3/24 disponibles | Conjuntos incompletos, composición y restricciones temporales |
| CNT/CNO | CNT 210000/237000; CNO 200000/220000 | Lee el totalizador por tipos, con otra disponibilidad |
| EOAF | Orígenes y aplicaciones 97775, diferencia 0 | Conciliación por variaciones, con advertencia sobre depreciación |
| EFE | Operación 102775; inversión 0; financiamiento −95775; variación 7000 | `cuadra-sin-verificar`; conserva advertencias de estimación y falta de resultado del periodo en patrimonio |
| DuPont | Ventas disponibles; utilidad, activos/patrimonio promedio y factores bloqueados | Propagación del motor; no sustituirlos con el lector legado a escondidas |
| Interpretación/evolución | Depende de las razones; no interpreta N/D como malo o bueno | Consecuencia de la disponibilidad anterior |
| Mercado sin capturas adicionales | Indicadores por acción y de cotización N/D | Faltan acciones/precio/dividendos; no se inventan |

El EFE no confirma movimientos reales por el hecho de cuadrar. Tampoco se da por comparado el ejemplo oficial V1-05 con la clase: su pendiente histórico conserva la causa aceptada.

## Cuentas en cero: qué cambió

El importador y `estadosResueltos` no rellenan indiscriminadamente todas las cuentas del catálogo. La demo ya contiene Devoluciones, Descuentos y Rebajas sobre ventas con cero explícito. Algunos fixtures de QA, separados de la demo, sí añadían ceros sintéticos para acreditar todos los operandos. Esos fixtures no se cargan en el navegador del usuario.

El formato actual no conserva una prueba que permita distinguir un cero digitado del archivo de un cero añadido previamente por otra herramienta. Por eso **no se borran datos ni se etiqueta un cero como ausencia**.

Se aplicó una regla exclusivamente visual, D-098:

- Cuentas accesorias reconocidas por id —devoluciones, deducciones, intangibles como Franquicias, ciertos «otros» e inversiones, entre otras enumeradas en el helper— pueden ir a **Ver cuentas opcionales en cero**. No se adivina la identidad por nombres.
- Solo se compactan si todos los importes examinados son exactamente cero y son filas importadas de detalle. El desplegable comienza cerrado y permite revisar/editar esas cuentas.
- Subtotales calculados o reportados, razones, importes N/D, cuentas desconocidas y cuentas principales se mantienen en la vista principal. Un importe pequeño distinto de cero no se considera cero.
- Si hay movimiento en otro periodo, la cuenta se conserva: por ejemplo, Franquicias 60000 → 0 sigue visible en AH, en el editor y en AV. El editor y AV consultan todos los periodos del documento; AH examina su par y la vista multiperiodo sus columnas elegidas. Una ausencia en una columna no equivale a cero y conserva la fila.
- Guardar/exportar mantienen las cuentas originales, sus ceros e identidades. No cambia ninguna operación financiera.

La fuente `TEAM.md/Ejercicios_AFOD/Mundo_Moda_analisis_financiero.md` sí reporta Franquicias 60000 en 2018 y cero en 2019, con una nota de clasificación. Ese cero es evidencia de un cambio y no debe eliminarse. Ese libro tiene AT 871475/1094142.25 y no es la demo MUNO MODA 2023/2024; no se mezclan sus cifras ni se presenta esta demo como reproducción exacta del profesor.

## Solución propuesta, después del diagnóstico

### Prioridad 1 — Resolver agregados suficientes y declarar el alcance de cada ejercicio

La ampliación anterior tiene prioridad: resolver los agregados y separar cálculo/comprobación antes de limitar el trabajo a completar la demo. Los pasos siguientes complementan ese arreglo del motor y su integración.

1. Revisar la demo como **ejemplo didáctico propio de la app**, separado de los ejercicios docentes. Documentar sus supuestos y qué totales/composición están acreditados. Su botón debería ofrecer un caso utilizable para demostrar los módulos y señalar expresamente los indicadores que no puede resolver.
2. Añadir una declaración de cobertura por estado/grupo: «completo», «parcial» o «sin confirmar». Para las partidas, distinguir **reportada** —incluido cero—, **no aplica confirmado** y **no informada**. Omitir una fila en un archivo parcial debe conservar N/D. No basta con esconderla.
3. Representar «no aplica» sin crear cuentas contables en cero dentro del documento. Los operandos podrán usar esa declaración solo bajo una regla acordada y trazable. Administración que ya incluye depreciación no debe sumarla otra vez. Los totales que sí vengan del ejercicio se reutilizan con las reglas actuales y sus comprobaciones.

Este es el arreglo recomendado para el problema de fondo. Requiere una decisión posterior que delimite D-055/D-057/D-063, normalización, persistencia y contrato de entrada del motor; **no un cambio global de `requires_data` a cero**. El motor/generado/JSON permanecen fuera de esta entrega, conforme al alcance anterior del usuario.

Una alternativa acotada es reconstruir únicamente la demo con datos y totales expresamente acreditados como parte de su definición didáctica. Es más rápida, pero no resuelve los importados parciales. Un subtotal calculado bajo supuestos no debe etiquetarse como «reportado por el profesor».

### Prioridad 2 — Mantener los N/D que corresponden y hacerlos accionables

- Pedir ventas a crédito y pagos reales a proveedores cuando se quieran esas cinco razones; si el ejercicio no los da, seguir mostrando N/D con causa.
- Conservar el control global de cálculo directo apagado por defecto. Si se expone en Análisis, debe ser único, explicar el uso de saldo de cierre, afectar solo el primer periodo y mantener el cambio identificado. No habilitarlo silenciosamente.
- Unificar gradualmente la política de disponibilidad del totalizador y del motor para CNT, EFE y Mercado, con regresiones y decisiones explícitas. Cambiar todos esos lectores de golpe podría convertir cifras válidas bajo su contrato en N/D y afectar el flujo; queda como trabajo separado.

### Criterios para aceptar la corrección financiera futura

| Caso | Resultado esperado |
|---|---|
| Cuenta accesoria no aplicable confirmada | No aparece como cuenta ficticia; su tratamiento en cálculos conserva la declaración |
| Cuenta no informada en documento parcial | N/D solo en resultados que realmente dependen de ella |
| Cuenta reportada cero o subtotal calculado cero | Se conserva el valor; los resultados internos siguen visibles |
| Franquicias 60000 → 0 | Ambos saldos y variación −60000 / −100 % conservados |
| Falta IR | UAI independiente disponible cuando corresponda; UN N/D |
| Faltan ventas a crédito/pagos | Las cinco razones dependientes siguen N/D |
| Primer periodo | Modo normal y directo verificables, distintos y rotulados |
| Documento completo | Estados, Razones, DuPont y Proforma usan el mismo alcance acreditado; ROA/ROE coinciden con su descomposición |

## Verificación de esta entrega

Se reprodujeron antes los ceros visibles y el AH combinado en Edge. Después se verificaron 16 combinaciones de Estados/AH/AV/Razones, escritorio/móvil y claro/oscuro, sin errores de página ni desbordamiento del documento. También se comprobó la edición de una cuenta compactada, conservación de datos y una razón calculada igual a cero visible. Se usan perfiles desechables, no los datos del navegador del usuario.

Suite final y lint: ver la ficha de esta feature. La propuesta financiera queda pendiente de una tarea específica; el diagnóstico y las correcciones de presentación sí forman parte de esta rama local.
