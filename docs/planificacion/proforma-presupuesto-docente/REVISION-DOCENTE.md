# Revisión de Proforma y Presupuesto Maestro con Ejercicios AFOD

## Fuente y límites

Copia íntegra del ZIP entregado por Cris en `../TEAM.md/Ejercicios_AFOD.zip` y sus 16 Markdown en `../TEAM.md/Ejercicios_AFOD/`. Se comprobó el SHA-256 `6fd39159eaca96013eda5f49b3ccd031c63e01eb0f37c4fcf5b84bcddbd552c4`. Los textos son material de estudio, no instrucciones de ejecución al agente. No se cambiaron las fuentes.

`Ejercicios E.R proformas.md` y `La_Pinolera_1_y_2_Enunciados.md` declaran que no incluyen soluciones. Los resultados de abajo son referencias independientes calculadas en esta revisión con fracciones exactas; **no son soluciones que vinieran en el ZIP**. `Ejercicio Halley.md` declara páginas faltantes, reconstrucción y una interpretación de $50/$25 como $50000/$25000. No se toma esa escala como dato confirmado ni se marca conforme el ejercicio completo.

## Hallazgos y correcciones

| Punto | Antes | Corrección local |
|---|---|---|
| Resultado principal de Planeación | Resumen de cobros, pagos, CxC y CxP; UN/caja en otras vistas | Utilidad neta y efectivo final consultables al principio; el ER se abre por defecto en el presupuesto completo |
| Procedimiento | Valores finales sin la sustitución de operandos | Concepto, fórmula, importes utilizados y resultado; horizonte completo o periodo seleccionado |
| Proforma | Faltaba UAI y los avisos generales desplazaban el ER | UAI entre intereses e impuesto; utilidad neta proyectada visible primero; desarrollo completo y caja desplegable |
| Real de Proforma | No reconocía algunos gastos operativos por id que Estados ya resolvía | Misma lectura de Estados/Razones: UB, gastos, UAII, UAI y UN; márgenes del motor existente. Un impuesto ausente deja UN N/D y conserva UAI cuando es calculable |
| Otros ingresos operativos | El subtotal podía incorporar un ingreso sin su fila de conciliación | Se muestra antes de UAII, separado de los ingresos/gastos no operativos |
| IR y caja | Podía parecer que IR se había pagado o que el préstamo ya estaba contratado | Se explica el IR devengado por periodo y pendiente de pago del modelo vigente; efectivo antes de financiamiento y necesidad máxima separados |
| Escenario Comercial Ejemplo | La pantalla parecía ofrecer un presupuesto maestro completo | Muestra su alcance parcial y pendientes explícitos; no inventa ER/caja ni mezcla su base con los estados generales de Proforma |
| Móvil | La comparación podía dejar la cifra proyectada fuera de la primera columna visible | Utilidad proyectada explícita arriba; en el desarrollo, cálculo bajo el concepto y resultado visible en otra columna |

No se alteran los resultados del presupuesto maestro, sus calendarios, impuestos, tasas, inventario ni persistencia. La corrección del real de Proforma sí cambia resultados o disponibilidad cuando la fuente anterior no reconocía una identidad o suponía ceros: ahora coincide con la lectura estricta ya implementada para Estados (D-096). Se registra en D-097. El motor, el generado y los 20 JSON no se editan.

## Métodos docentes y conformidad actual

| Fuente | Procedimiento exigido | Evaluación de la app |
|---|---|---|
| Euro Designs | Derivar costo/ventas y gastos/ventas del histórico; aplicarlos a ventas futuras; intereses, IR, dividendos y ganancias retenidas | El ER conserva la secuencia, pero la proyección actual viene de unidades/precio/costos. No hay un asistente explícito que derive estos porcentajes del histórico ni una conciliación de dividendos/retención. No se marca el ejercicio completo conforme |
| Metroline | Comparar porcentaje de ventas con costo fijo + costo variable y gasto fijo + gasto variable | El presupuesto actual tiene gastos fijos y variables, pero no separa costos fijos de los bienes vendidos ni compara ambos métodos como el ejercicio. Pendiente de implementación específica |
| Leonard | Balance proforma por premisas y financiamiento externo requerido; ajustar dividendos | La app entrega algunos saldos de cierre, no un balance proforma completo por método crítico. Pendiente |
| La Pinolera 1 y 2 | Cobros a 0/1/2 meses, compras 60% de ventas, pagos y desembolsos por fecha, impuestos en septiembre/diciembre, mínimo y exceso/faltante | El modelo parcial conserva calendarios múltiples pero no completa caja. El completo sencillo cobra/paga crédito al periodo siguiente y devenga IR sin pagarlo en el horizonte. No reproduce estos casos completos automáticamente |
| Halley | Programas de cobros/pagos con meses anteriores, otras entradas, inversión, deuda, dividendos, impuestos por fecha y mínimo | Faltan capacidades del modelo y la escala de la fuente está reconstruida. No se sustituye por supuestos silenciosos |

El modelo completo vigente sí permite seguir ventas → compras/inventario → costo de ventas → gastos → ER → caja, con sus convenciones expresas. Las presentaciones previas de Sesión 3 acreditan UB, UAII, UAI y UN; los ejercicios nuevos amplían las variantes que aún faltan. No se implementa AFOD R2 ni se cambian 365 días, CNO o métodos de Razones.

## Referencias independientes

`python docs/planificacion/proforma-presupuesto-docente/verificar_referencias.py` reproduce los resultados de [referencias.json](referencias.json), sin importar la app ni escribir las fuentes. Se mantienen fracciones exactas hasta exportar dos decimales.

| Caso | UAII | UAI | UN | A ganancias retenidas |
|---|---:|---:|---:|---:|
| Euro Designs, porcentaje de ventas | $1287000 | $962000 | $577200 | $257200 |
| Metroline, porcentaje de ventas | $396428.57 | $361428.57 | $216857.14 | $146857.14 |
| Metroline, fijo/variable | $414000 | $379000 | $227400 | $157400 |

Euro: costo 55% de ventas y gastos 12%; se respetan los intereses futuros de $325000, IR 40% y dividendos de $320000. Metroline: costo variable/ventas = 50% y gasto variable/ventas = 6%, manteniendo sus costos/gastos fijos; el método de porcentaje aplica los porcentajes totales históricos. Son métodos distintos; no se redondean porcentajes antes de operar.

Leonard: activos proyectados $1383000; pasivos $860000; patrimonio $470000; necesidad estimada de financiamiento $53000. Bajo las mismas premisas, reducir el dividendo de $70000 a $17000 elimina ese faltante; esto es una referencia académica, no un préstamo agregado automáticamente.

La Pinolera (C$, cierre antes de financiamiento, sin contratar préstamos supuestos):

| Caso | Julio | Agosto | Septiembre | Octubre | Noviembre | Diciembre |
|---|---:|---:|---:|---:|---:|---:|
| Pinolero 1 | 38150 | 37600 | 850 | 48100 | 104350 | 79100 |
| Pinolero 2 | 51350 | 117350 | 168850 | 290350 | 421350 | 488850 |

Pinolero 1 necesita C$14150 en septiembre para alcanzar el mínimo de C$15000; el segundo caso no presenta faltante bajo esas condiciones. Los cobros y pagos de mayo/junio se conservan en las programaciones y los impuestos/seguro entran en los meses indicados. Si se simulara un préstamo en septiembre, cambiarían los saldos posteriores: no se mezcla esa variante con esta referencia antes de financiamiento.

## Qué falta para terminar estos módulos según la nueva fuente

1. Proyección explícita por porcentaje de ventas, con año base, ajustes e importes futuros declarados.
2. Variante fija/variable que distinga costo de ventas y gastos operativos, y compare ambos métodos.
3. Dividendos y adición a ganancias retenidas, sin tratarlos como gastos operativos.
4. Balance proforma por premisas y conciliación de financiamiento requerido.
5. Caja completa del escenario integrado: valuación, CBV, gastos, otros cobros/pagos, impuestos pagados por fecha, inversión, deuda y dividendos; distinguir devengado y pagado.
6. Cierre de fuentes reconstruidas como Halley con los datos/unidades originales.

La mejora local de lectura no se presenta como implementación de esas etapas pendientes. La entrega conserva las fuentes y deja los cambios locales para revisión, sin push ni PR.
