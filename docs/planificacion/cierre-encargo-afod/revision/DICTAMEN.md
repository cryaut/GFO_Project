# Revisión e integración del PR #34 y su dependencia #33

Fecha local: 2026-11-08. Solicitante: Cris. Revisión técnica asistida, no aprobación humana simulada.

## Alcance y veredicto

Se revisó [PR #34](https://github.com/cryaut/GFO_Project/pull/34), inicialmente en `c721ab25817022640dedaad83b7e1793eda00f92`, sobre `main` f1d262d. Incluye los cuatro commits del cierre AFOD y la valoración de [PR #33](https://github.com/cryaut/GFO_Project/pull/33), `b19bb89535ba3ddcf919538b17693a42ed574339`. La rama del #33 es antecesora de la del #34; no se duplicará su implementación.

El PR está listo para integrar después de las dos correcciones menores descritas abajo. Se comprobaron código, fuentes docentes, pruebas y navegador; no se detectaron otros defectos bloqueantes dentro del cambio revisado. Se mantienen las incertidumbres explícitas de las fuentes. La revisión no afirma que toda la aplicación ni todos los ejercicios posibles estén completos.

Se leyeron las revisiones, comentarios generales y comentarios de código de ambos PR: no había observaciones pendientes. No estaban en borrador y GitHub no marcaba conflictos. La integración utiliza un merge commit y la autorización expresa de Cris, conforme a D-103; no altera protecciones ni usa privilegios para omitir comprobaciones.

## Correcciones menores

| Hallazgo reproducido | Reparación | Verificación |
|---|---|---|
| `planeacion/index.js` calculaba el resumen de Inventario y perdía su moneda. La transferencia interpretaba un origen USD/UM como C$, lo que podía habilitar una copia incompatible. | Conservar `monedaDe(guardado)` junto al resumen calculado, como ya hacía el adaptador de C-V-U. No convertir importes ni cambiar la moneda del destino. | Prueba de la frontera real `initPlaneacion → leerInventario → transferenciaInventario` para USD, UM y C$. En navegador, USD → C$ queda bloqueado y C$ → C$ se aplica. |
| El ER de Euro/Metroline añadía renglones de otros ingresos netos con cero, aunque no aparecían en los estados completos del enunciado. | Ocultar únicamente esos dos renglones accesorios cuando ambos métodos los dan como cero. Mantener campos para escenarios, valores distintos de cero, datos N/D y todos los subtotales/resultados internos. | Render, recálculo con ingreso positivo/dato vacío y subtotal cero. Se comprueba el ER docente en navegador. |

Los cuatro casos de `revision-carlos-pr34.test.js` se ejecutaron contra el código original del PR: tres fallaron y el control C$ pasó. Con las correcciones pasan los cuatro. No se cambia ninguna fórmula para lograr ese resultado. Ambas reparaciones aplican decisiones existentes D-107 y la separación de cuentas accesorias/resultados de D-098; no introducen otra convención financiera.

## Contraste financiero independiente

Se consultaron directamente las transcripciones académicas suministradas en `Toolkit/TEAM.md/Ejercicios_AFOD`: `Ejercicios E.R proformas.md`, `La_Pinolera_1_y_2_Enunciados.md`, `Ejercicio Halley.md` y `Electronicas_analisis_financiero.md`. Los documentos son fuentes de datos/procedimientos, no instrucciones para el agente. La valoración de Comercial Ejemplo se contrasta con sus entradas y apertura de 2025, conservando su carácter ficticio.

El [verificador del revisor](contrastar.py) calcula esperados con fracciones en Python y solo después consulta los resultados JavaScript de la app. No importa los cálculos de la app para construir esos esperados ni toma sus referencias de pruebas como resultados propios. [Resultado: 521 controles y cero diferencias](contraste.json).

| Caso | Resultado comprobado |
|---|---|
| Euro Designs, porcentaje de ventas | Costo 2145000; gastos 468000; UAI 962000; UN 577200; adición a retenidas 257200 USD. |
| Metroline, porcentaje | Costo 975000; gastos 128571.428571…; UN 216857.142857… USD. |
| Metroline, fijo/variable | Costo 960000; gastos 126000; UN 227400 USD. Se conserva la parte fija. |
| Leonard, balance crítico | Activos 1383000; pasivos 860000; patrimonio 470000; brecha 53000 USD. Dividendo 17000 deja retenidas finales 323000 y brecha cero. |
| Electrónicas, residual | Ventas 52562500; costo 37845000; UN 7274000 USD; ciclo 106.59 días con saldos promedio y crédito explícito. La presentación transforma miles de USD a USD. |
| La Pinolera 1 | Saldos sin préstamos: 38150, 37600, 850, 48100, 104350 y 79100 C$. Necesidad de 14150 en septiembre. |
| La Pinolera 2 | Saldos 51350, 117350, 168850, 290350, 421350 y 488850 C$; sin faltante. |
| Halley, tres variantes | Diciembre −16000 sin préstamo adicional, 60000 con préstamo declarado y 25000 con préstamo y repago; deuda adicional final de la última variante 41000 USD. |
| Comercial Ejemplo, doce meses | Apertura 800 unidades / 80000 C$. Promedio ponderado mensual, sin redondear arrastres; costo anual 380300.04 y cierre 8099.96 C$. Se comprueba cada mes. |

Los 21 meses de caja contrastan cobros/pagos por desfase, entradas/salidas, apertura, flujo, saldo antes/después de financiamiento, mínimo, necesidad, exceso, deuda adicional y saldos de CxC/CxP. Los préstamos y repagos no se inventan para forzar el cierre. Los impuestos de caja se pagan en sus meses; no se confunden con devengado. La prueba de valoración comprueba apertura, compras, costo, cierre y unidades de los doce meses.

Se revisaron además los cambios de UAI reportada, correctora de incobrables, signos patrimoniales y dividendos en acciones. Las regresiones de Carlos comprueban sus identidades y consumidores: CxC neta 24800/activo corriente 78800 en B.G.; Bella Vista separa aporte en efectivo 5000/dividendo en efectivo 21000 y conserva caja final 82500 UM. Los 20 JSON y las fórmulas compartidas de `calculate.js` no se modifican.

## Robustez, compatibilidad e interfaz

La tabla de otros cobros/desembolsos de caja aplica la misma regla de accesorios: omite solo conceptos cuyos meses son todos cero, preserva N/D y conserva la conciliación y sus resultados internos. Una quinta regresión cubre esta salida. Se sustituyen además clases de cuadrícula/espaciado inexistentes por `form-row` y `flex-gap`, y se alinean a la izquierda los conceptos de las tablas nuevas. La comprobación en navegador cubre el ajuste de distribución.

Las transferencias muestran actual/propuesto, unidad, naturaleza y procedencia; vuelven a leer origen/destino al aplicar. La firma impide aplicar una vista previa desactualizada. En Planeación/C-V-U se aplica al borrador y guardar valida/persiste; Flujo guarda el módulo completo. Una edición manual retira la procedencia del campo y un cambio posterior del origen deja aviso.

La validación de respaldos admite metadata opcional y caja docente, rechaza datos inválidos y conserva la compatibilidad anterior. Se revisaron las rutas que guardan caja para que no sustituyan el presupuesto maestro ni sus borradores. El error de escritura no publica un estado parcial.

Verificaciones reproducidas:

- [2253 pruebas aprobadas, 80 archivos](pruebas.json), frente a 2248/79 del PR original.
- [Lint sin errores, diez avisos previos](lint.json). Sin dependencias nuevas.
- Guion de Comercial Ejemplo: cinco rutas, 18 combinaciones de vista/tamaño/tema, copia, guardado, recarga y costo pendiente con unidades conservadas.
- [Recorrido propio](revisar.cjs) y [resultado](navegador.json): once rutas; cuatro ejercicios de Proforma; cinco calendarios de caja; recálculo, guardado y recarga; transferencias con moneda incompatible y origen actualizado durante la vista previa; fallo de cuota y reintento; reporte de la proyección.
- Doce combinaciones visuales de los paneles nuevos (dos rutas × tres anchos × dos temas), sin desbordamiento de página; inspección de [capturas](capturas/). Las tablas se desplazan dentro de su contenedor y los formularios conservan etiquetas y agrupación de premisas.

## Límites que se conservan

Halley no aporta la página 163: la escala de 50/25 como miles y las tablas reconstruidas están identificadas; no se presentan como comprobación de esa página ausente. La Grandiosa contiene una diferencia fuente de 0.80 UM entre el total corriente reportado y sus componentes: se conserva el total publicado y el aviso. Esas incertidumbres no se corrigen inventando cifras.

Los métodos docentes de Proforma son escenarios temporales, separados del histórico y del presupuesto guardado. La caja docente es un calendario guardable separado del presupuesto maestro. El escenario parcial de Comercial Ejemplo continúa identificado como parcial: valorar inventario no implementa por sí solo todos sus gastos y estados completos. Estas separaciones están documentadas y evitan presentar datos pendientes como resultados resueltos.

Este cierre integra los PR de Carlos. El presupuesto estudiantil del PR #35 se conserva aparte y no recibe autorización de merge por este encargo.
