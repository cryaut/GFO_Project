# Reparación de los cinco hallazgos de los ejemplos AFOD

Fecha: 2026-11-07. Base auditada: `de788b7ebc2d340f962613f4c74bf1cf3808bd59` del PR #31. Reparación preparada en `codex/reparacion-auditoria-ejemplos`, creada desde `origin/main` (`19c5c6f`) e incorporando las entregas dependientes del catálogo. Integración propuesta mediante el PR #31, con revisión humana de Carlos; este informe no constituye su aprobación.

Cris eligió expresamente **corregir primero los cinco fallos**. Los nuevos métodos de Proforma y los calendarios completos de caja quedan para otro trabajo. Se reparan las lecturas y la disponibilidad de resultados, conservando los datos originales de los ejercicios.

## Resultado verificable

La auditoría inicial tenía 2106 comprobaciones: 1911 coincidencias, 120 N/D justificados, 7 diferencias numéricas, 52 N/D indebidos, 11 ceros indebidos y 5 premisas docentes ausentes. Son celdas repetidas en varias vistas, no 75 errores distintos.

El contraste posterior tiene **2391 comprobaciones: 2252 coincidencias y 139 N/D justificados; ninguna diferencia pendiente**. Incluye el nuevo escenario de clase y Mercado asociado. `comparar-antes-despues.py` verifica las **70 celdas erróneas originales conservando exactamente sus esperados** y comprueba por separado las cinco premisas docentes resueltas. El Bartlett histórico sigue sin recibir crédito supuesto.

Suite final: **2192 pruebas aprobadas, 74 archivos, cero fallos**; incluye 22 regresiones focalizadas y una prueba adicional de política de la nueva cuenta. Lint: **0 errores y 10 advertencias preexistentes**. Edge: cinco casos, 45 vistas y cuatro variantes de pantalla/tema, sin errores JavaScript ni desbordamiento global.

| Verificación | Evidencia |
|---|---|
| Aritmética independiente, sin importar fórmulas de la app | [Resumen](verificacion-independiente/resumen.json), [soluciones exactas](verificacion-independiente/soluciones-independientes.json), [comparación CSV](verificacion-independiente/comparacion.csv) |
| Errores anteriores corregidos sin mover la respuesta esperada | [Antes/después por celda](verificacion-independiente/antes-despues.json) |
| Regresiones con referencias resueltas a mano | [Tests de H-01 a H-05](../../../tests/unit/auditoria-ejemplos-regresiones.test.js) |
| Suite, lint, sincronía de JSON y cuentas maestras | [Constancia de validación](validacion.json) |
| Carga/guardado, Inicio y siete pestañas de Análisis | [QA reproducible](revisar-navegador.cjs), [resultado](verificacion-visual.json) |

## H-01. EOAF omitía cuentas conservadas como totales reportados

**Causa.** El importador guarda inventario total, PPE neto y patrimonio total en `reportedTotals`. La comprobación recorría únicamente `balanceGeneral`. Además, descartaba un total con solo detectar algún componente, aunque el desglose fuera parcial. Un estado podía perder cifras o aparentar cuadre por omitir ambos lados.

**Solución.** `comprobacion-calculations.js` reúne ambas representaciones sin modificar la entrada. Resuelve totales desde los menores hasta los mayores y conserva una sola representación por concepto. Usa detalle cuando su suma concilia dentro de la tolerancia; si no, conserva el reportado, excluye sus componentes de esa agregación y avisa. Un inventario total sin desglose sigue siendo una cuenta hoja. PPE neto incluye PPE y depreciación, sin absorber intangibles, inversiones u otros activos ajenos al subtotal canónico. El total de activos sí conserva esas partidas.

Los reportados se enlazan por id aunque cambien de etiqueta. Un saldo inválido, una doble representación contradictoria o un periodo ausente quedan N/D. No se completa el año ausente con cero. La consulta pública `esTotalDuplicado` se mantiene por compatibilidad como indicador de solapamiento estructural; la selección financiera ya no depende de ella.

| Caso | Antes: orígenes / aplicaciones | Después | Diferencia después |
|---|---|---|---|
| Baker 2011→2012 | 700000 / 1000000 | 1000000 / 1000000 | 0 |
| Bartlett 2011→2012 | 625000 / 636000 | 636000 / 636000 | 0 |
| Práctico 2 2023→2024 | 50000 / 35000 | 95000 / 95000 | 0 |

**Regresiones.** Los tres docentes; no mutación; etiqueta cambiada; subtotales anidados; detalle parcial; contradicción; importe inválido; periodo ausente; PPE neto con inversión de largo plazo separada. No se exige que desaparezcan advertencias legítimas sobre estimaciones.

## H-02. EFE perdía UN y variaciones disponibles

**Causa.** El EFE obtenía UN del totalizador legado, que no interpreta todos los gastos operativos identificados que sí entiende el motor. También heredaba la omisión de inventarios reportados de H-01. Por eso el ER resuelto mostraba UN y el flujo no podía usarla.

**Solución.** Conserva la validación de importes y obtiene UN mediante `obtenerUtilidadNetaMotor`, función ya existente. Las variaciones usan la selección común reparada. Un ER vacío no acredita utilidad cero. Los errores contractuales dejan N/D con motivo; no se atrapan indiscriminadamente errores inesperados del intérprete.

Un agregado de activo/pasivo corriente o total sin desglose puede mezclar efectivo, operación, inversión o financiamiento: el EFE solicita desglose y no lo asigna completo a una actividad. PPE ya neto tampoco acredita depreciación cero ni compras brutas. En ese caso se conservan UN y saldos conocidos, pero depreciación, operación, inversión y cierre calculado quedan N/D donde corresponde. No se muestra una nota que afirme haber estimado depreciación si no existe el saldo para hacerlo.

| Caso | UN | Operación | Inversión | Financiamiento | Caja final calculada |
|---|---|---|---|---|---|
| Baker 2012, USD | 180000 | 780000 | −300000 | 20000 | 1000000 |
| Bartlett 2012, USD | 231000 | 500000 | −347000 | −61000 | 431000 |
| MUNO 2024, C$, estimación condicional | 104825 | 102775 | 0 | −95775 | 52000 |
| Práctico 2, UM | 77000 | N/D | N/D | −7000 estimado por variación | N/D |

En Baker y Bartlett, UN, operación y financiamiento antes eran N/D. Práctico 2 recupera la UN acreditada y conserva una comprobación incompleta: su fuente no permite certificar los flujos por actividad. El financiamiento mostrado es una estimación de Δdeuda + Δpatrimonio − UN, no prueba de cobros/pagos.

**Límite conservado.** El EFE de Análisis sigue siendo una estimación desde saldos. Cuadrar algebraicamente no confirma movimientos, dividendos, bajas de activos ni que toda la variación de depreciación acumulada sea gasto. Baker/Bartlett coinciden numéricamente con las reconstrucciones de sus fuentes; eso no convierte el estimador en un registro de caja. Flujo conserva los ejemplos directos con movimientos declarados.

## H-03. Inicio y Mercado usaban otra utilidad y fabricaban ceros

**Causa.** Inicio y Mercado consumían la utilidad del totalizador legado. Un ER con gastos reconocidos solo por el motor podía dar N/D allí. Un balance sin ER podía recibir UN cero, propagándose a UPA y otras razones de mercado.

**Solución.** `totalesPeriodo` conserva los totales válidos del balance y obtiene ventas brutas, ventas netas, UB y UN del ER resuelto existente. Mercado reutiliza esa función. Inicio ya la consumía: no requiere otra fórmula ni otra cuenta de utilidad. La lectura no modifica datos guardados.

**Resultados.** Inicio, Mercado y Estados concuerdan en UN de Baker 180000, Bartlett 231000 y Práctico 2 77000. Baker 2011 conserva A=2900000 y patrimonio=1100000, pero UN/UPA son N/D porque no hay ER. Con 100000 acciones, el valor en libros 2011 sí es 11.

La comparación docente de UPA usa sus acciones y DAP, diferenciándolos de los datos ficticios del selector de Mercado: Baker `(180000−10000)/100000 = 1.70`; Bartlett `(231000−10000)/76262 = 2.897904592…`. No se atribuye el ejemplo ficticio de 30000 acciones al profesor.

**Regresiones.** UN compartida, tendencia de Inicio, UPA, balance disponible sin ER y ausencia conservada en las razones que requieren utilidad. La auditoría contrasta también ambos ejemplos ficticios de Mercado para cada estado.

## H-04. Ventas brutas desconocidas aparecían como cero

**Causa.** La cobertura completa convertía en cero componentes de ventas brutas no listados, aunque la fuente solo reportara ventas netas. El bruto se reconstruía erróneamente como cero y contaminaba AV y AH.

**Solución.** El motor distingue partida no aplicable de magnitud bruta no informada. Si existe venta neta reportada y no hay bruto ni componentes brutos, su lectura conserva N/D. No reconstruye hacia atrás desde el neto ni supone deducciones cero. Las ventas netas reportadas siguen disponibles, al igual que los subtotales dependientes acreditados. Un bruto cero explícito se conserva y no se reemplaza por el neto.

**Resultados.** Las 11 celdas que antes presentaban ceros indebidos ahora muestran N/D justificado; AV y AH conservan sus demás resultados. Se prueban Baker, Bartlett y Práctico 2, además del cero explícito.

## H-05. Faltaban las premisas de Bartlett usadas por el profesor

**Causa.** El caso histórico del ZIP no declara ventas a crédito ni compras estimadas. Las diapositivas de razones sí emplean premisas adicionales. Obtener números a partir del histórico sin declararlas habría sido asumir información.

**Fuente leída antes de modificar.** `Razones_Financieras_Liquidez_Actividad.md`, diapositivas 14–15: se supone que todas las ventas fueron a crédito y se estiman compras como `70 % × 2088000 = 1461600`. CxC promedio `(365000+503000)/2 = 434000`; CxP promedio `(270000+382000)/2 = 326000`. Se usa 365 días y promedios; no saldos de cierre.

**Solución.** Nueva opción **Bartlett · razones de clase** en los paneles existentes de Estados e Inicio empresa. El documento guardado se identifica como `Bartlett Company · razones de clase`. Registra esas premisas únicamente para 2012 y conserva BG/ER y USD. Las etiquetas de los suplementos y la descripción del selector indican que las compras son estimadas. El Bartlett histórico permanece separado y conserva sus N/D de crédito.

Para no simular pagos se añade el id suplementario `supp.credit_purchases`: base declarada de compras para la rotación. Los tres JSON que definen compras usan el operador existente `reported_or_calculate`; si falta ese dato conservan la fórmula anterior `pagos + CxP final − CxP inicial`. Las divisiones, promedios y días no se modifican. La estimación del 70 % no se ejecuta automáticamente sobre otros ejercicios. El catálogo y la cuenta maestra se sincronizan; el archivo generado procede del script existente.

| Resultado docente | Fórmula independiente | Valor presentado |
|---|---|---|
| Rotación de CxC | 3074000 / 434000 | 7.08 veces |
| Plazo de cobro | 365 × 434000 / 3074000 | 51.53 días |
| Rotación de CxP | 1461600 / 326000 | 4.48 veces |
| Plazo de pago | 365 × 326000 / 1461600 | 81.41 días |
| Edad del inventario | 365 × 294500 / 2088000 | 51.48 días |
| Ciclo de conversión | edad + cobro − pago, sin redondear factores | 21.60 días |

La prueba de navegador detectó que Análisis redondeaba los días a enteros. Las cuatro métricas de días ahora muestran dos decimales, como la presentación JSON vigente y la fuente docente, conservando precisión interna. El diseño, la agrupación de botones y las tablas se conservan. Se siguió el criterio de refinamiento de Impeccable; su cargador de contexto no estuvo disponible y se consultaron las instrucciones locales y la ficha de diseño existente.

**Regresiones.** Cinco resultados de actividad; cero declarado de compras; ausencia sin aproximar por costo; año previo sin premisas inventadas; no mutación del histórico; EFE idéntico con y sin los suplementos; dos decimales en el HTML. `usaComprasReales` es falso para una base declarada que podría ser estimada.

## Convenciones preservadas y alcance de la comparación docente

- Orden y etiquetas docentes del ER ya resuelto: UB, UAII, UAI y UN. No se reordenan cuentas que ya estaban correctas ni se insertan cálculos como cuentas originales.
- Costos/gastos son magnitudes positivas restadas por la fórmula; depreciación acumulada conserva signo negativo; DAP se usa para acciones comunes, no como gasto del ER.
- USD miles de Baker/Bartlett se convierte a USD completos multiplicando por 1000; Práctico 2 usa UM porque `$` no identifica moneda. No se convierte moneda por suposición.
- Liquidez usa cierre; actividad, ROA y ROE usan promedios cuando existe periodo anterior. Los días de la app proceden de DIAS_ANIO. El primer periodo mantiene su política y un denominador cero conserva N/D.
- AH con base negativa conserva la convención de la app `abs(base)`. La documentación disponible no acredita atribuir esa variante al profesor. CNO conserva su definición vigente, diferenciándola de una convención docente no demostrada.
- Las fuentes disponibles son transcripciones Markdown con marcadores de imágenes. Se verifican los datos y métodos legibles; no se certifica la apariencia completa de diapositivas originales que no están disponibles.
- Proforma/Presupuesto, inventario, personal, TOR y Comercial Ejemplo se vuelven a contrastar. No se implementan en esta reparación métodos docentes adicionales de Proforma ni caja con calendarios/impuestos completos. Los presupuestos ficticios mantienen IR devengado por pagar y financiamiento requerido informado sin sumarlo automáticamente a caja.

## Cómo reproducir

Desde la raíz del repositorio:

~~~powershell
npm.cmd test -- --maxWorkers=2
npm.cmd run lint
node scripts/verificar-cuentas-maestras.mjs
node scripts/generar-especificacion-razones.mjs
node docs/planificacion/reparacion-auditoria-ejemplos/verificacion-independiente/extraer-app.mjs . docs/planificacion/reparacion-auditoria-ejemplos/verificacion-independiente
python docs/planificacion/reparacion-auditoria-ejemplos/verificacion-independiente/resolver-independiente.py
node docs/planificacion/reparacion-auditoria-ejemplos/revisar-navegador.cjs
~~~

El resolutor usa biblioteca estándar Python y fracciones exactas; no importa JS ni usa resultados calculados para fijar esperados. Las cifras docentes están transcritas en el resolutor y `datos-docentes-independientes.json`. Las entradas ficticias se extraen por separado. El exportador usa APIs reales de la app y escribe instantáneas locales regenerables. El comparador antes/después recibe como argumento la carpeta de la auditoría original `de788b7`, conservada localmente.

QA usa Edge con perfil temporal y Playwright del entorno existente, sin dependencia nueva del producto. Recorre cinco estados, guardado, Inicio y siete pestañas de Análisis; comprueba UN/UPA, EOAF, EFE, los resultados de clase y N/D de Baker 2011. Añade 1440/390 px y claro/oscuro, sin desbordamiento global ni errores JavaScript. Las capturas se generan localmente. El script cierra navegador y servidor al terminar y no toca el perfil ni almacenamiento del usuario.

## Revisión e integración

Los cambios compartidos necesarios son `comprobacion-calculations.js`, EFE/Mercado, `estados-guardados.js`, catálogo/motor/adaptador de razones y las cuatro celdas de días de `analisis/index.js`. No hay cambios en `store.js`, `calculate.js`, router ni dependencias. D-101 y D-102 explican las decisiones y sus alternativas.

Carlos debe revisar especialmente: selección reportado/detalle parcial; conservación de N/D; separar estimación de movimientos efectivos; y lectura de compras declaradas en los tres JSON con la alternativa anterior. También las entregas previas incluidas en el PR #31. El usuario debe elegir/cargar los ejemplos actualizados y guardar el borrador; no se sobrescriben ni migran automáticamente datos guardados.
