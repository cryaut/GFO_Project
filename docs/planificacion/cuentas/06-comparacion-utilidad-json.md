# Comparación de utilidad neta: app y JSON de razones

**Fecha de revisión:** 20 de octubre de 2026.

**Alcance:** comparación de solo lectura solicitada en la ronda 5 del PR #14. Este informe no propone arreglos ni implementa el motor.

## Versiones comparadas y método

| Fuente | Referencia consultada | Commit inmutable |
|---|---|---|
| App y catálogo de Carlos | `feat/cuentas-identificador` | `ce6daac8954f4d69ef0791a93182de16af46acc9` |
| Especificaciones JSON | `origin/feat/razones-json-v3` | `a87ef0af0954e00d3f95ed1476ec3154bc06d768` |

Se leyeron los archivos mediante `git show <commit>:<ruta>`, sin cambiar de rama, integrar código ni editar los JSON. Los enlaces de evidencia apuntan a esos commits y sus números de línea se verificaron sobre ese contenido, no sobre los archivos de trabajo que puedan cambiar después.

«App» significa aquí el resultado `computeFinancialTotals(...).utilidadNeta`. La tabla describe las clasificaciones predeterminadas del catálogo y un mismo periodo; no da por equivalentes clasificaciones manuales arbitrarias ni datos legados. Los costos y gastos se consideran magnitudes positivas que sus fórmulas restan, conforme a la [convención del JSON, líneas 825–828][json-signos].

La verificación es **estática**: lectura de las operaciones declaradas y del flujo de registro/cálculo de la app. No se ejecutó un intérprete de los JSON ni una prueba de aceptación del motor. «Cambia la utilidad neta» incluye tanto diferencias numéricas como que la app produzca N/D y el JSON declare una ruta de cálculo numérica con datos completos. «Solo presentación» significa que agrupar o separar esos rubros conserva la misma suma bajo las condiciones indicadas. «No sé» identifica una equivalencia que depende de un contrato de alimentación del motor que esta comparación no ejecuta.

## Resultado de la revisión

Las expresiones coinciden para los componentes que tienen tipo equivalente en la app, sin superponer totales y detalles, con ventas ya netas o sin deducciones y sin otros importes que la app deba dejar pendientes. **No son equivalentes para todo el catálogo:** los JSON contemplan componentes operativos y deducciones sin tipo en la app, y tienen una política distinta para los totales reportados.

La app suma todos los importes con el mismo tipo ([líneas 79–89][app-suma]) y después calcula ([líneas 98–100][app-utilidad]):

```text
utilidadBruta = ventas − costoVentas
utilidadNeta = utilidadBruta − gastosAdmin − gastosVentas
               + otrosIngresos − otrosGastos − intereses − impuestos
```

El JSON de margen neto declara esta cadena, con preferencia por los resultados reportados en los nodos que la indican ([utilidad bruta, líneas 77–93][json-bruta]; [utilidad operativa, líneas 104–129][json-operativa]; [utilidad neta, líneas 132–170][json-neta]):

```text
gross_profit = utilidad bruta reportada, si existe;
               si no, net_sales − cost_of_sales
operating_profit = utilidad operativa reportada, si existe;
                   si no, gross_profit + otros ingresos operativos
                          − operating_expenses
net_income = utilidad neta reportada, si existe;
             si no, operating_profit + ingresos no operativos
                    − gastos no operativos distintos de intereses
                    − gasto por intereses − impuesto sobre la renta
```

La app conserva las filas reconocidas sin tipo y los resultados reportados, pero puede anular los totales afectados: registrar un total reportado sin tipo lo lleva a `reportedTotals` ([registro, líneas 34–42][app-registro]); el cálculo incluye esas filas entre las pendientes y asigna `null` a sus campos ([cálculo, líneas 102–112][app-pendientes]). Por tanto, **no corresponde describir esos importes como omitidos silenciosamente o convertidos en cero**. Un detalle sin tipo y con importe distinto de cero entra en ese mismo tratamiento ([líneas 88–89][app-suma]; [campos afectados, líneas 52–67][app-campos]).

## Comparación por rubro

En «cuentas» se nombran los identificadores de la app y del JSON. Cuando son los mismos se indica una sola lista para ambos; las excepciones se explicitan.

| Rubro de la app | Equivalente del JSON | Cuentas del catálogo que alimentan cada uno | ¿Coinciden? Clasificación y evidencia |
|---|---|---|---|
| `ventas`, cuando contiene ventas netas reportadas | `derived.net_sales` | Ambos: `is.net_sales_reported`. En la app su tipo es `ventas`; el JSON lo prefiere sobre el cálculo de ventas brutas menos deducciones. | **Sí, condicionado.** Si se presenta por sí solo y no hay solapamiento, el importe neto es el mismo. El nombre genérico `ventas` frente a `net_sales` es **«solo presentación»** en este caso. [Catálogo, líneas 1651–1664][cat-netas]; [JSON, líneas 46–62][json-netas]. |
| `ventas`, cuando contiene ventas brutas o sus componentes; no hay rubro propio de deducciones | `derived.gross_sales`, `derived.sales_deductions` y `derived.net_sales` | Ambos conocen `is.sales_total`, `is.product_sales`, `is.service_revenue`, `is.other_sales_revenue`. El JSON deduce `is.sales_returns`, `is.sales_discounts`, `is.sales_allowances`; esas tres cuentas no tienen `tipoApp` en el catálogo de la app. | **No en el caso de deducciones no nulas registradas sin clasificación adicional: «cambia la utilidad neta».** La app deja N/D los campos afectados; el JSON declara ventas brutas menos las deducciones. Sin deducciones y sin solapamiento sí puede coincidir. [Tipos y deducciones, líneas 1900–2007][cat-ventas-deducciones]; [otras ventas, líneas 1840–1853][cat-otras-ventas]; [servicios, líneas 2052–2065][cat-servicios]; [JSON, líneas 26–74][json-ventas] y [conjuntos, líneas 174–183][json-ventas-conjunto]; [app, líneas 52–67][app-campos] y [102–112][app-pendientes]. |
| `costoVentas` | `derived.cost_of_sales` | Ambos: `is.cost_of_sales_reported` o `is.merchandise_cost`, `is.product_cost`, `is.service_cost`. Todos tienen tipo `costoVentas` en la app. | **Sí si hay solo total o solo detalles y datos suficientes.** El signo de la resta coincide. La diferencia al coexistir total y componentes es **«cambia la utilidad neta»**, detallada en la última fila. [Costo reportado, líneas 1441–1456][cat-costo-total]; [mercadería, líneas 1601–1614][cat-mercaderia]; [productos, líneas 1870–1883][cat-productos]; [servicios, líneas 2034–2046][cat-costo-servicios]; [JSON, líneas 65–74][json-costo] y [conjunto, líneas 184–188][json-costo-conjunto]. |
| `utilidadBruta = ventas − costoVentas` | `derived.gross_profit` | App: las cuentas de ventas y costos de las filas anteriores. JSON: `derived.net_sales`, `derived.cost_of_sales` o `is.gross_profit_reported`. Esta última no tiene `tipoApp` en la app. | **Condicionado.** Coincide con ventas netas y costos equivalentes sin total bruto reportado. Si se registra `is.gross_profit_reported`, la app conserva el dato pero deja `utilidadBruta` y `utilidadNeta` N/D; el JSON usa el total numérico: **«cambia la utilidad neta»**. [Catálogo, líneas 1473–1486][cat-bruta]; [app, líneas 28–30][app-reportados], [98–112][app-utilidad]; [JSON, líneas 77–93][json-bruta]. |
| `gastosAdmin` | Parte de `derived.operating_expenses` | Ambos: `is.administrative_expenses`. App: tipo `gastosAdmin`. JSON: un miembro de `operating_expense_components`, junto a ventas, depreciación, amortización y otros gastos operativos. | **Sí para el componente administrativo: «solo presentación».** Restarlo por separado o dentro de la suma operativa conserva su efecto en utilidad neta. Eso no demuestra equivalencia del conjunto completo. [Catálogo, líneas 1422–1435][cat-admin]; [app, líneas 99–100][app-utilidad]; [JSON, líneas 96–100][json-gastos] y [189–195][json-gastos-conjunto]. |
| `gastosVentas` | Parte de `derived.operating_expenses` | Ambos: `is.selling_expenses`. App: tipo `gastosVentas`; JSON: miembro del mismo conjunto operativo. | **Sí para este componente: «solo presentación».** Se resta en ambos. [Catálogo, líneas 2015–2028][cat-ventas-gasto]; [app, líneas 99–100][app-utilidad]; [JSON, líneas 189–195][json-gastos-conjunto]. |
| Sin tipo propio para depreciación, amortización y otros gastos operativos | Parte de `derived.operating_expenses` | Ambos catálogos contienen `is.operating_depreciation`, `is.operating_amortization`, `is.other_operating_expenses`. Sus `tipoApp` son `null`; el JSON incluye expresamente los tres en `operating_expense_components`. | **No para importes no nulos registrados sin clasificación adicional: «cambia la utilidad neta».** La app deja la utilidad neta N/D; el JSON declara restar los componentes dentro de los gastos operativos. Depreciación y amortización se definen fuera de otras cuentas ya agregadas: no se presupone que falten también cuando ya están incluidas en administración o costo. [Catálogo: amortización, líneas 1710–1722][cat-amortizacion]; [depreciación, líneas 1746–1758][cat-depreciacion]; [otros gastos operativos, líneas 1802–1815][cat-otros-gastos-op]; [app, campos afectados][app-campos] y [propagación N/D, líneas 102–112][app-pendientes]; [JSON, líneas 189–195][json-gastos-conjunto]. |
| No hay un tipo predeterminado para otros ingresos operativos; `otrosIngresos` no identifica por sí solo su carácter operativo | `is.other_operating_income`, sumado dentro de `derived.operating_profit` | App: `is.other_operating_income` tiene `tipoApp: null`. JSON: ese mismo id es un operando explícito. El tipo `otrosIngresos` de la app sí recibe los ingresos no operativos de la fila siguiente. | **No para un importe operativo no nulo registrado sin clasificación adicional: «cambia la utilidad neta».** La app deja N/D los campos afectados, incluida la utilidad neta; el JSON declara sumar el ingreso antes de restar gastos operativos. [Catálogo, líneas 1821–1834][cat-otros-ingresos-op]; [app, campos afectados][app-campos] y [propagación N/D, líneas 102–112][app-pendientes]; [JSON, líneas 112–126][json-operativa]. |
| `otrosIngresos`, para ingresos no operativos distintos del interés separado | `is.nonoperating_income`, sumado después de `derived.operating_profit` | Ambos: `is.nonoperating_income`; la app le asigna `otrosIngresos`. El JSON no usa una categoría genérica que mezcle este id con `is.other_operating_income`. | **Sí para este importe reconocido y no duplicado: «solo presentación».** Sumarlo en el bloque plano de utilidad neta o después del subtotal operativo conserva el efecto final. La distinción operativo/no operativo sí afecta la presentación del subtotal operativo. [Catálogo, líneas 1690–1704][cat-no-operativos-ingreso]; [app, líneas 99–100][app-utilidad]; [JSON, líneas 132–170][json-neta]. |
| `otrosIngresos`, para intereses ganados | D-051: componente de `is.nonoperating_income` | App: `is.interest_income` y `is.nonoperating_income` tienen ambos `tipoApp: 'otrosIngresos'`. JSON: declara `is.nonoperating_income`, cuya definición incluye intereses ganados; no declara el id separado `is.interest_income` en ninguno de los 20 archivos. | **«No sé» para la igualdad ejecutada con el interés separado.** D-051 fija cómo debe alimentarse el agregado, pero la lectura de las fórmulas no demuestra que un consumidor ya materialice esa relación ni que evite repetir un interés ya incluido en un importe agregado. No hay aceptación del motor en este informe. [Interés en catálogo, líneas 1573–1586][cat-interes-ingreso]; [agregado, líneas 1690–1704][cat-no-operativos-ingreso]; [suma app, líneas 87–100][app-suma]; [operando JSON, líneas 147–148][json-neta]; [definición JSON, líneas 678–686][json-no-operativos-ingreso]. |
| `otrosGastos`, para gastos no operativos que no son intereses | `is.noninterest_nonoperating_expenses` | Ambos: `is.noninterest_nonoperating_expenses`, tipo `otrosGastos` en la app. No incluye `is.interest_expense`; tampoco sustituye los otros gastos operativos de la fila anterior. | **Sí para este componente: «solo presentación».** Ambos lo restan de la utilidad neta. Que la etiqueta de la app sea más amplia no cambia este importe correctamente identificado. [Catálogo, líneas 1670–1684][cat-no-operativos-gasto]; [app, líneas 99–100][app-utilidad]; [JSON, líneas 155–157][json-neta]. |
| `intereses` | `is.interest_expense` | Ambos: `is.interest_expense`, gasto financiero; en la app usa tipo `intereses`. `is.interest_income` no alimenta este tipo. | **Sí para el gasto reconocido.** Ambos lo restan; la diferencia de etiqueta es **«solo presentación»**. [Catálogo, líneas 1532–1548][cat-interes-gasto]; [app, líneas 99–100][app-utilidad]; [JSON, líneas 159–161][json-neta]. |
| `impuestos` | `is.income_tax_expense` | Ambos: `is.income_tax_expense`, tipo `impuestos` en la app. La definición se refiere al impuesto sobre la renta del periodo, no a todos los impuestos posibles. | **Sí para esta cuenta.** Ambos la restan; etiqueta abreviada frente al id específico: **«solo presentación»**. [Catálogo, líneas 1492–1507][cat-impuesto]; [app, líneas 99–100][app-utilidad]; [JSON, líneas 163–165][json-neta]. |
| Utilidad calculada frente a utilidad operativa o neta reportada | `derived.operating_profit` y `derived.net_income`, con `reported_or_calculate` | Ambos reconocen `is.operating_profit_reported` e `is.net_income_reported`; ambas cuentas tienen `tipoApp: null`. App: se conservan en `reportedTotals`; JSON: sustituyen el cálculo correspondiente si tienen valor numérico. | **No: «cambia la utilidad neta».** Su presencia hace N/D la utilidad neta de la app; el contrato JSON selecciona el total correspondiente, incluso si vale cero. [Catálogo: operativa, líneas 1783–1796][cat-operativa]; [neta, líneas 1631–1645][cat-neta]; [registro, líneas 38–42][app-registro]; [app, campos de reportados][app-reportados] y [propagación N/D, líneas 102–112][app-pendientes]; [JSON, líneas 104–108][json-operativa], [132–136][json-neta] y [842–846][json-reportados]. |
| Totales de ventas o costo y sus detalles simultáneos | Selección del total en `reported_or_calculate` | App: un total reconocido con `tipoApp` y otra cuenta reconocida del mismo tipo; p. ej., `is.sales_total` + `is.product_sales`, `is.cost_of_sales_reported` + `is.product_cost`, o `is.net_sales_reported` junto a otra cuenta de tipo `ventas`. JSON: cada nodo selecciona su total específico; sus componentes no se añaden a ese total. | **No: «cambia la utilidad neta».** La app anula los campos afectados con `overlapping_account_aggregation`; el JSON usa el total numérico y registra `reported_subtotal_mismatch` si la conciliación comparable supera 0.01, sin reemplazar el total. [App, líneas 116–125][app-solapamiento]; [JSON, líneas 26–74][json-ventas] y [842–846][json-reportados]. |

## D-051 y límite de la comparación del interés

La instrucción de ronda 5, aprobada por Cris Lumbi el 19 de octubre de 2026, establece: **los intereses ganados son componente de `is.nonoperating_income` al calcular utilidad neta sin utilidad reportada**. Esta es la intención de catálogo que se documenta en el PR #14; conserva `tipoApp: 'otrosIngresos'` en ambas cuentas y no modifica las fórmulas JSON.

El commit de app aquí citado precede a esa anotación de ronda 5. El JSON consultado ya define ingresos no operativos incluyendo intereses, pero su expresión utiliza únicamente el agregado `is.nonoperating_income`. La relación nueva del catálogo no demuestra por sí sola la igualdad de un motor ejecutándose: la aceptación numérica con intereses corresponde a la rama del motor y queda fuera de este informe. Tampoco se asume si un importe agregado concreto incluye o excluye un interés presentado adicionalmente; esta revisión no contiene archivos de entrada que lo acrediten.

## Datos que resolverían el «no sé» (ronda 6)

En esta versión hay **una fila** clasificada «no sé», la de intereses ganados; no hay dos diferencias independientes con esa etiqueta. Esa fila contiene dos incertidumbres que se pueden comprobar por separado. No se modifica código ni se propone un arreglo de utilidad neta.

| Incertidumbre | Dato o prueba que permitiría resolverla |
|---|---|
| El consumidor de los JSON incorpora el id separado `is.interest_income` dentro de `is.nonoperating_income` | Traza de alimentación por ids y una prueba de aceptación ejecutada en la rama del motor con intereses separados, sin utilidad reportada. El caso ya documentado de ventas 100, intereses ganados 20 y gasto por intereses 5 permite contrastar el resultado esperado 115 con la app. La presencia de `agrupadoEn` por sí sola no prueba esa ejecución. |
| Un importe de ingresos no operativos ya contiene los intereses que también aparecen desglosados | Un estado de origen con nota o desglose que indique expresamente si el agregado incluye el interés, más la traza de importación de esas filas. Una prueba de aceptación con ese mismo archivo y utilidad esperada calculada a mano permitiría comprobar si se cuenta el interés una o dos veces. Sin conocer la composición del agregado no se puede afirmar equivalencia. |

Estas comprobaciones no se implementan ni ejecutan en el PR #14; pertenecen a la aceptación del motor y a la evidencia del archivo de entrada. La ausencia del dato se conserva como incertidumbre, sin inventar una segunda fila «no sé».

## Revisión completa de los 20 JSON

Se enumeraron los 20 archivos `.json` directamente bajo `docs/razones_financieras/` en el commit JSON indicado, se analizaron como JSON y se buscó **la definición dentro de `derivados`**, distinguiéndola de referencias al id en la fórmula principal. Exactamente tres contienen `derived.net_income`:

| Archivo | Definición de `derived.net_income` |
|---|---|
| `actividad_ciclo_conversion_efectivo.json` | No contiene definición |
| `actividad_edad_promedio_inventario.json` | No contiene definición |
| `actividad_periodo_promedio_cobro.json` | No contiene definición |
| `actividad_periodo_promedio_pago.json` | No contiene definición |
| `actividad_rotacion_activos_fijos.json` | No contiene definición |
| `actividad_rotacion_activos_totales.json` | No contiene definición |
| `actividad_rotacion_cuentas_por_cobrar.json` | No contiene definición |
| `actividad_rotacion_cuentas_por_pagar.json` | No contiene definición |
| `actividad_rotacion_inventarios.json` | No contiene definición |
| `endeudamiento_cobertura_interes.json` | No contiene definición |
| `endeudamiento_razon_deuda_patrimonio.json` | No contiene definición |
| `endeudamiento_razon_deuda_total.json` | No contiene definición |
| `liquidez_capital_trabajo_neto.json` | No contiene definición |
| `liquidez_prueba_acida.json` | No contiene definición |
| `liquidez_razon_corriente.json` | No contiene definición |
| `rentabilidad_margen_utilidad_bruta.json` | No contiene definición |
| `rentabilidad_margen_utilidad_neta.json` | [Líneas 132–170][json-neta] |
| `rentabilidad_margen_utilidad_operativa.json` | No contiene definición |
| `rentabilidad_roa.json` | [Líneas 137–175][json-roa] |
| `rentabilidad_roe.json` | [Líneas 137–175][json-roe] |

La comparación estructural de los objetos analizados encontró **una sola variante** de `derived.net_income` entre las tres definiciones. También son iguales sus ocho derivados de resultados (`gross_sales`, `sales_deductions`, `net_sales`, `cost_of_sales`, `gross_profit`, `operating_expenses`, `operating_profit`, `net_income`) y los cuatro conjuntos de cuentas que esos derivados usan. No se afirma que los documentos completos sean idénticos: ROA y ROE incluyen otros derivados para sus denominadores.

La búsqueda del identificador exacto `is.interest_income` en el contenido de los 20 JSON devolvió cero apariciones. Esto verifica su ausencia en esas especificaciones, sin inferir el comportamiento de un motor ni cambios de otra ronda no aportada.

## Evidencias inmutables

Todos los enlaces anteriores conservan el SHA de la versión comparada. Los resultados de pruebas o validaciones que se registren para cambios posteriores del PR #14 no forman parte de esta comparación estática ni sustituyen la aceptación pendiente del motor.

[app-suma]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/estados-calculations.js#L79-L100
[app-utilidad]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/estados-calculations.js#L98-L112
[app-reportados]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/estados-calculations.js#L28-L30
[app-campos]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/estados-calculations.js#L52-L67
[app-pendientes]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/estados-calculations.js#L102-L112
[app-solapamiento]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/estados-calculations.js#L116-L125
[app-registro]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-registro.js#L34-L42
[cat-admin]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1422-L1435
[cat-costo-total]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1441-L1456
[cat-bruta]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1473-L1486
[cat-impuesto]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1492-L1507
[cat-interes-gasto]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1532-L1548
[cat-interes-ingreso]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1573-L1586
[cat-mercaderia]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1601-L1614
[cat-neta]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1631-L1645
[cat-netas]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1651-L1664
[cat-no-operativos-gasto]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1670-L1684
[cat-no-operativos-ingreso]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1690-L1704
[cat-amortizacion]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1710-L1722
[cat-depreciacion]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1746-L1758
[cat-operativa]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1783-L1796
[cat-otros-gastos-op]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1802-L1815
[cat-otros-ingresos-op]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1821-L1834
[cat-otras-ventas]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1840-L1853
[cat-productos]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1870-L1883
[cat-ventas-deducciones]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L1900-L2007
[cat-ventas-gasto]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L2015-L2028
[cat-costo-servicios]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L2034-L2046
[cat-servicios]: https://github.com/cryaut/GFO_Project/blob/ce6daac8954f4d69ef0791a93182de16af46acc9/js/modules/estados/cuentas-catalogo.js#L2052-L2065
[json-ventas]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L26-L74
[json-ventas-conjunto]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L174-L183
[json-netas]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L46-L62
[json-costo]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L65-L74
[json-costo-conjunto]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L184-L188
[json-bruta]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L77-L93
[json-gastos]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L96-L100
[json-gastos-conjunto]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L189-L195
[json-operativa]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L104-L129
[json-neta]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L132-L170
[json-no-operativos-ingreso]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L678-L686
[json-signos]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L825-L828
[json-reportados]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_margen_utilidad_neta.json#L842-L846
[json-roa]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_roa.json#L137-L175
[json-roe]: https://github.com/cryaut/GFO_Project/blob/a87ef0af0954e00d3f95ed1476ec3154bc06d768/docs/razones_financieras/rentabilidad_roe.json#L137-L175
