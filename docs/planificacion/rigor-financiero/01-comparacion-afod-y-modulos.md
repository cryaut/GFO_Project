# Comparación financiera con AFOD y módulos mínimos

Fecha: 2026-11-04. Revisión del código de `fix/rigor-financiero`, partiendo de `origin/main` en `255b068`. El documento recoge una revisión funcional y pruebas de ejemplos, no una certificación contable ni una comprobación visual completa de cada pantalla.

## Fuentes y límites

- Archivo entregado: `C:\Users\carlo\Desktop\06 - Archivo\Comprimidos\PRESENTACIONES_AFOD.zip`; SHA-256 `90daae4390049d078c0b065212d7c8a0a5a017640f97a9519e0b0a518c5a16aa`. Contiene **14 Markdown**. Se extrajeron copias de lectura en `.afod-revision/PRESENTACIONES_AFOD/`, junto al repositorio; el ZIP original no se modificó.
- Documento de requisitos: `C:\Users\carlo\Downloads\modulos-funcionales-proyecto.md`; SHA-256 `904503a2e57b7cecf0a6984e1c1e159bbfcf0cb44e59d940f94de31fefd83eb2`. La sección 7.1 enumera siete módulos principales y dos complementarios obligatorios; 7.2 pide reutilización de datos, unidades e interpretación.
- Cada referencia AFOD se identifica por archivo y diapositiva. Los Markdown contienen marcadores de imágenes que no incluyen el contenido visual; una diapositiva sin texto extraído no se pudo contrastar por completo. Las presentaciones son referencia de clase, no prueban automáticamente que una política sirva para todos los tipos de empresa.
- No se usaron datos reales de FDL en esta tanda. Los casos de clase son ficticios. Las cifras de AFOD no sustituyen la evaluación de aplicabilidad para entidades financieras.

## Correcciones realizadas

1. **DuPont:** utiliza la utilidad neta y ventas del motor de razones. Si falta una cuenta requerida, se mantiene N/D en el margen y el ROE descompuesto. Con datos completos se conserva la fórmula de tres factores y se compara con el ROE directo. Casos en `tests/unit/rigor-financiero.test.js`.
2. **Patrimonio del EFE:** resultados retenidos, resultado del periodo y reservas se seleccionan por identificador acreditado. Si una cuenta patrimonial sin identidad confirmada cambia, se evita atribuir automáticamente su variación a aportes o dividendos y se usa el desglose agregado con advertencia. Los dividendos que sí se derivan siguen siendo estimaciones.
3. **Alcance del EFE indirecto:** se identifica como estimación por variaciones, se advierte antes de las tablas que cuadrar no confirma cobros, pagos ni dividendos y se evita afirmar que la conciliación de utilidad verifica dividendos. Proforma identifica como estimado el flujo operativo procedente de ese EFE. El módulo `Flujo de Efectivo` permite registrar movimientos por método directo.
4. **Conciliación del flujo directo:** si el saldo de efectivo del balance siguiente es N/D, la diferencia y `cuadra` también quedan N/D y la pantalla lo explica. Un cero declarado sigue siendo cero.
5. **Resultado real en Proforma:** si un gasto administrativo o de ventas requerido es N/D, los gastos de operación y la UAII no se calculan por coerción de `null` a cero. También se protegen los otros ingresos netos.

Se mantiene la fórmula de DuPont; no se modificaron los 20 JSON. Las advertencias no transforman automáticamente las estimaciones en un EFE verificado ni separan por sí solas transacciones no monetarias.

## Contraste por presentación

| Presentación AFOD | Comparación con el sistema | Resultado y límite |
|---|---|---|
| `GFO- Introduccion.md` | Liquidez, rentabilidad, riesgo, proyecciones y separación entre dato y decisión frente a Inicio, Análisis y Planeación. | Hay indicadores y escenarios; la calidad de las conclusiones depende de entradas y supuestos. Evaluación conceptual, no prueba de cada decisión. |
| `De contabilidad a Gestion Financiera.md` | Diaps. 4–11: estados, costos, presupuesto y diferencia entre utilidad y efectivo. | Existen Estados, costos de venta y flujo directo; no toda la información contable se deriva de transacciones. |
| `Estados Financieros Basicos.md` | Diap. 2: balance, resultados, efectivo y cambios en patrimonio. Diaps. 4–9 enlazan los tres primeros. | Hay balance/resultados y flujo; el EFE indirecto no sustituye movimientos. No se identificó un estado completo de cambios en patrimonio como módulo específico; no figura como módulo separado obligatorio en 7.1. El caso del club queda pendiente de prueba integral. |
| `Razones_Financieras_Liquidez_Actividad.md` | Diaps. 7–17: liquidez, promedio, 365 días y caso Bartlett. | En el caso construido con importes acreditados coinciden RC, prueba ácida, inventario y cobro; véase prueba AFOD. La diap. 15 estima compras como 70 % del costo: el motor vigente exige pagos reales y saldos de CxP, por lo que devuelve N/D sin ese dato. No se fabricaron pagos para hacer coincidir el ejemplo. |
| `Analisis_Dupont.md` | Diaps. 5–10: UN / ventas × ventas / activo promedio × activo / patrimonio promedio. | El ejemplo 12.000 / 200.000 / 100.000 / 60.000 produce 20 %; la app corrige propagación N/D y compara con ROE directo. La prueba del ejemplo usa la función de fórmula; el caso completo y ausente se verifica mediante la API de Análisis. |
| `Analisis_apalancamiento_y_C-V-U.md` | Diaps. 5–10 y 17–20: GAO/GAF/GAT, variaciones y PE. | El caso PE de precio 10, CV 5 y CF 2.500 produce 500 unidades y ventas 5.000. Hay cálculos directos y por variación de apalancamiento; aún falta contrastar el caso completo de UPA con sus supuestos y tratamiento de dividendos preferentes. |
| `Flujo_Efectivo_GFO_2026.md` | Diaps. 5, 11–17: movimientos reales por actividad; método indirecto como complemento. | Con los nueve movimientos de la diap. 13 el módulo directo devuelve operación 20.000, inversión −13.000, financiamiento 20.000, variación 27.000 y saldo final 52.000. La pestaña indirecta queda identificada como estimación por saldos. |
| `Presentacion_Sesion1_Planeacion_Presupuesto_Maestro.md` | Diaps. 10–17: ventas, compras, costo, gastos, utilidad y efectivo. | Planeación encadena esos presupuestos y separa contado de crédito; su política de cobro/pago al periodo siguiente es un supuesto fijo, no un calendario arbitrario. |
| `Presentacion_Sesion2_Ventas_y_Compras_Comercial_El_Progreso.md` | Diaps. 3–10: ventas 120/150/180, compras 120/156/184 y C$ 161.000. | Reproducido con `calcularPresupuestoMaestro`; el último inventario deseado se introduce como 40 unidades. |
| `GFO_Presentacion_Sesion3_Costo_Ventas_Gastos_Estado_Resultados.md` | Diaps. 6–15 y 19–25: CBV, gastos, depreciación, intereses e impuesto. | El caso anterior reproduce CBV 42.000/52.500/63.000, total 157.500. Existen gastos, depreciación e IR proyectados; los gastos fijos y el porcentaje variable tienen un solo supuesto para todos los periodos. La comparación completa por partidas queda pendiente. |
| `Presupuesto_de_Caja 2026.md` | Diaps. 13–21: San Rafael cobra 60 % al contado, paga 50 % de compras y paga impuestos el mismo mes. | Con impuestos introducidos en «otros desembolsos», los saldos de caja coinciden: 6.900/14.650/24.850. **No es una integración completa de IR:** el cierre sigue informando 12.150 como impuesto por pagar aunque se hayan registrado esos pagos como otras salidas. Véase P1 abajo. |
| `Estados_financieros_proforma.md` | Diaps. 7–16 y 18–26: porcentaje de ventas y método crítico con balance proyectado. | La app muestra estado de resultados presupuestado y reporte integrado; no se encontró un balance proforma completo por el método crítico ni cálculo equivalente a la brecha Vectra de 8.293. El requisito 7.1 admite resumen o proyección; esto es una brecha frente al material más amplio, no prueba de incumplimiento del mínimo. La diapositiva usa 360 días para CxC y 365 para CxP; documentar el supuesto antes de comparar con la convención de 365 de la app. |
| `Presupuesto_estudiantil_actualizado.md` | Diaps. 3–16: ingreso, gastos por categorías, reserva y meta. | Presupuesto personal registra ingresos y gastos, categorías, meta y cálculos mensuales/semanales. La comparación proyectado vs real por categoría y el horizonte semestral requieren revisión adicional; no se afirma que estén implementados como en el material. |
| `Mercados_Instituciones_Financieras_Ingenieria_Sistemas.md` | Diaps. 5–13: instituciones, bonos, acciones y riesgo. | Hay módulo educativo de Mercados, glosario, comparador y quiz; no se validaron exhaustivamente sus contenidos ni datos legales o de mercado. No es uno de los nueve módulos de 7.1. |

Las pruebas numéricas de esta tabla están en `tests/unit/afod-casos-profesor.test.js`. Las coincidencias declaradas para ellas corresponden a esos casos y supuestos, no a una verificación automática de todas las diapositivas.

## Módulos mínimos: contraste con secciones 7.1 y 7.2

| Módulo solicitado | Evidencia en el código | Estado de la revisión |
|---|---|---|
| Estados financieros | `js/modules/estados/`: importación, identidad, balance, resultados y múltiples periodos. | Presente; faltan pruebas de importación de la empresa real y revisión de todas las clasificaciones. |
| Análisis financiero | `js/modules/analisis/index.js`, motor `razones/`, AH, AV y DuPont. | Presente; DuPont y N/D se corrigen aquí. Faltan contrastes independientes de todas las razones e interpretaciones. |
| Punto de equilibrio y C-V-U | `equilibrio-calculations.js`: margen, PE, escenarios y gráfica. | Presente; caso 500 unidades comprobado. |
| Apalancamiento | `apalancamiento-calculations.js`: GAO, GAF, GAT y variaciones. | Presente; revisar supuestos de CV/CF, UPA y dividendos preferentes con ejercicios del profesor. |
| Flujo de efectivo | `flujo/`: actividades, movimientos, variación, saldo final y conciliación; Análisis tiene EFE indirecto. | Presente; ejemplo directo contrastado y conciliación con saldo N/D corregida. El indirecto es una estimación. |
| Planeación y presupuestos | `planeacion-calculations.js`: ventas, compras, CBV, gastos, caja y resultados. | Presente; revisar la política de pago de impuestos y ampliar opciones de calendario si se requieren para clase. |
| Proforma / reporte integrado | `proforma-calculations.js`: resultados presupuestados, comparación, indicadores y alertas. | Presente como resumen/proyección; balance proforma completo por método crítico no encontrado. |
| Presupuesto personal, obligatorio complementario | `presupuesto/index.js`: ingresos, gastos, meta, ahorro y distribución. | Presente; verificar con el caso semestral de clase sin usar información privada. |
| Inventario, obligatorio complementario | `inventario-calculations.js`: movimientos, existencias, valorización, reposición; Planeación puede vincular producto por id. | Presente; el costo usa promedio ponderado móvil, que debe explicarse al compararlo con un ejemplo a costo unitario fijo. |

Estos estados indican presencia y alcance observado, no una certificación integral de funcionamiento en navegador ni la resolución de los ejercicios de cada módulo.

## Pendientes financieros priorizados

**P1 — Pagos de IR en presupuesto maestro.** `calcularPresupuestoMaestro` indica que el IR se causa pero no se paga durante el horizonte y fija `cierre.irPorPagar = totales.ir`. San Rafael lo paga en cada mes. Si se introducen los 3.000/4.050/5.100 como otras salidas se reproducen las cajas, pero el cierre conserva 12.150 como saldo por pagar. Hace falta capturar pagos de IR por periodo y conciliar impuesto inicial + causado − pagado, sin duplicar el desembolso ni asumir una política tributaria universal.

**P1 — Consistencia entre totales y motor en el resto de consumidores.** DuPont se corrigió y Proforma deja de sumar N/D como cero en gastos. Aún deben contrastarse todas las fuentes de utilidad, ventas y datos faltantes de Proforma, Apalancamiento, EFE y Reportes; comparten conceptos pero no todas las rutas usan el mismo contrato del motor.

**P1 — Flujos estimados frente a movimientos reales.** El aviso nuevo previene una interpretación concluyente, pero el EFE indirecto no recibe un detalle completo de adquisiciones a crédito, bajas, ajustes no monetarios o dividendos efectivamente pagados. Hace falta un diseño de captura/conciliación y pruebas con estados y notas, no inferirlos del cuadre.

**P2 — Ejercicios completos de clase.** Pendientes: caso de apalancamiento con UPA, club Barcelona Nica, comparación entre actividades directas e indirectas y Vectra con balance proforma. Para Bartlett falta decidir cómo ingresar una compra estimada sin presentarla como dato real; la decisión D-059 vigente exige pagos de proveedores.

**P2 — Horizontes y fechas.** Probar cómo se comparan periodos mensuales, trimestrales y anuales, incluyendo 365 días de razones frente al ejemplo Vectra que usa 360 para CxC. No inferir que 30 días, un trimestre o un balance de apertura corresponden a un año completo.

**P2 — Validación de datos reales y presentación.** Probar un estado completo con su origen y notas, revisar cuentas ambiguas, conciliación y N/D en navegador. Para FDL, revisar por separado si las razones comerciales y clasificaciones aplican a una entidad financiera; no concluir desempeño a partir de umbrales genéricos.
