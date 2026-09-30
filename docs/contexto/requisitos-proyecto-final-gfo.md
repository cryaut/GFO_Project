# Requisitos funcionales y contexto académico del Proyecto Final GFO

## Propósito de este documento

Este archivo traduce la guía académica **Guía paso a paso del Proyecto Final** a requisitos que una IA o una persona desarrolladora pueda usar para construir y validar la aplicación. 


La aplicación es un proyecto integrador de **Gestión Financiera Operativa (IS2122)**. Debe ayudar a registrar información, automatizar cálculos, presentar resultados comprensibles y apoyar decisiones financieras. Es una aplicación académica funcional: no se exige un sistema contable ni de facturación completo.

> **Cómo interpretar la guía:** portada, índice, introducción, marco teórico, conclusiones, bibliografía y anexos son requisitos del informe y de la defensa. Sirven para explicar, demostrar y validar el sistema; no son módulos que haya que implementar en la interfaz.

## Alcance académico obligatorio

- El desarrollo funcional se concentra en la **Unidad 2: Análisis Financiero** y la **Unidad 3: Planeación Financiera**.
- Las Unidades 1 y 4 no forman parte del alcance funcional obligatorio de este proyecto final.
- El sistema debe integrar los resultados entre módulos. No debe ser una colección de calculadoras aisladas.
- Los cálculos deben ser correctos, estar relacionados entre sí y mostrar resultados interpretables.
- La aplicación puede ser web o de escritorio. No se exige un lenguaje, framework o herramienta específica.
- Una base de datos es opcional. Si existe, debe poder describirse cómo guarda los datos, sus tablas y relaciones. Si no existe, debe estar claro cómo se administran los datos durante la ejecución.

## Objetivo funcional

Construir una herramienta tecnológica que reciba información financiera, la procese mediante cálculos de análisis y planeación financiera, y entregue indicadores, proyecciones, gráficos o reportes que ayuden a tomar decisiones.

Los objetivos específicos que el sistema debe poder cubrir son:

- Registrar o importar datos financieros.
- Automatizar cálculos financieros.
- Generar resultados y presentarlos de forma clara.
- Mostrar gráficos o reportes cuando ayuden a interpretar los datos.
- Permitir análisis de escenarios cuando corresponda.
- Incluir aplicaciones prácticas de presupuesto personal y control básico de inventario.

## Módulos funcionales requeridos

| Módulo | Datos de entrada | Capacidades y resultados esperados |
| --- | --- | --- |
| Estados financieros | Cuentas y valores de uno o más períodos. | Organizar Balance General y Estado de Resultados; dejar sus totales disponibles para los demás módulos. |
| Análisis financiero | Datos de estados financieros. | Ejecutar análisis horizontal y vertical, razones financieras y sistema DuPont; mostrar indicadores, comparaciones, interpretación básica y/o gráficos. |
| Punto de equilibrio y C-V-U | Precio, unidades, costos variables y costos fijos. | Calcular margen de contribución, punto de equilibrio en unidades y monetario; analizar cambios de precio, costo variable, costo fijo o volumen; incluir gráfica cuando sea útil. |
| Apalancamiento | Datos operativos y financieros necesarios. | Calcular GAO, GAF y GAT y dar una explicación básica del resultado. |
| Flujo de efectivo | Entradas y salidas de efectivo. | Clasificar actividades de operación, inversión y financiamiento; calcular flujos por actividad, variación neta y saldo final. |
| Planeación y presupuestos | Supuestos y datos de planificación. | Elaborar presupuestos de ventas, compras, costo de bienes vendidos, gastos de operación y caja; proyectar el saldo de efectivo. |
| Proforma o reporte integrado | Resultados de módulos anteriores. | Resumir resultados financieros o proyecciones que apoyen una decisión; considerar los fundamentos de estados proforma. |
| Presupuesto personal | Ingresos y gastos por categoría. Se permiten datos ficticios. | Calcular total de ingresos, total de gastos, saldo disponible y capacidad de ahorro; clasificar gastos y mostrar un resumen o gráfico sencillo. Es independiente del presupuesto maestro empresarial. |
| Control básico de inventario | Producto, existencia inicial, entradas, salidas, costo unitario y stock mínimo. | Calcular existencia final, valor del inventario y alerta de reposición cuando aplique. |

### Fórmulas y criterios mínimos

- Incluir en la documentación y en el código las fórmulas, conceptos y criterios de interpretación que realmente se utilicen.
- Para inventario se debe aplicar como mínimo:
  - `existencia final = existencia inicial + entradas - salidas`
  - `valor del inventario = existencia final × costo unitario`
- El módulo de inventario debe admitir un **stock mínimo** y mostrar una alerta sencilla cuando sea necesario reponer.
- El presupuesto personal debe mantenerse separado del presupuesto maestro empresarial; sus conceptos no se deben presentar como componentes formales de este último.
- El análisis financiero debe contemplar, según existan datos suficientes, razones de liquidez, actividad, endeudamiento, rentabilidad y mercado.
- La interpretación debe respetar la unidad del resultado: `C$`, `%`, veces, días o unidades.

## Integración esperada entre módulos

La información ingresada una vez debe reutilizarse cuando sea posible. Por ejemplo, ventas, activos, pasivos, patrimonio, UAII, intereses y utilidad neta pueden alimentar automáticamente análisis, razones, DuPont, apalancamiento, presupuestos o reportes integrados.

El flujo esperado es:

```text
Datos financieros → Estados financieros → Análisis y cálculos → Planeación y presupuestos → Reporte integrado / decisión
                                      ↘ Presupuesto personal (aplicación práctica independiente)
                                      ↘ Inventario básico (puede apoyar compras cuando haya stock bajo)
```

- Se recomienda un panel principal o dashboard para acceder a los módulos y ver indicadores relevantes.
- La interfaz debe permitir entrada de datos, procesamiento, visualización de resultados y navegación clara.
- Cuando sea viable, una existencia baja de inventario puede señalar necesidades futuras de compra. Esa relación puede permanecer en un nivel básico.
- El código debe permitir identificar dónde se hacen los cálculos financieros principales.

## Datos, privacidad y calidad de resultados

- Usar casos con datos reales o ficticios coherentes. Para presupuesto personal, usar datos ficticios durante la demostración cuando sea necesario proteger la privacidad.
- Cada resultado relevante debe poder rastrearse a sus datos de entrada y a la fórmula o lógica aplicada.
- El sistema debe mostrar al menos un caso completo: entrada de datos, cálculo y resultado.
- Los resultados del sistema deben coincidir con cálculos manuales o ejercicios desarrollados en clase.
- Cada módulo debe explicar, al menos de forma breve, qué significa su resultado o qué decisión financiera puede apoyar.

## Qué debe poder demostrarse

Durante la defensa, cualquier integrante debe poder explicar el funcionamiento general de la aplicación, aunque otro integrante haya programado parte del sistema. Debe poder:

- Ejecutar un módulo y explicar sus datos de entrada.
- Indicar la fórmula o lógica financiera usada.
- Interpretar el resultado.
- Modificar un dato y explicar el efecto del cambio.
- Localizar o describir la parte del código que realiza el cálculo.
- Repetir esa explicación con un caso de presupuesto personal o movimientos de inventario.

## Requisitos del informe impreso y su propósito

Los siguientes elementos se piden porque el entregable académico debe documentar y defender el sistema. No deben implementarse como páginas de la aplicación salvo que el equipo decida voluntariamente generar reportes.

| Apartado del informe | Qué debe documentar | Evidencia que aporta la aplicación |
| --- | --- | --- |
| Portada | Título o nombre del sistema, integrantes, asignatura, docente, grupo y fecha. | Ninguna función; solo identificación del entregable. |
| Índice | Apartados y páginas del informe. | Ninguna función; navegación del documento impreso. |
| Introducción | Problema financiero atendido, importancia de análisis y planeación, módulos y tecnologías usadas. | Descripción general de la aplicación y sus módulos. |
| Antecedentes | Uso de tecnología en análisis financiero y conceptos relacionados. | Justificación del problema y de las capacidades del sistema. |
| Objetivos | Propósito global y metas concretas del sistema. | Funciones implementadas y su alcance. |
| Marco teórico | Conceptos, fórmulas e interpretación de análisis financiero, flujo de efectivo, presupuestos, presupuesto personal e inventario. | Fórmulas aplicadas y resultados del sistema. |
| Desarrollo del proyecto | Arquitectura, módulos, integración, tecnología y manejo de datos. | Código, pantallas, flujo de información y almacenamiento. |
| Resultados | Capturas, caso completo, comprobación manual e información útil para decidir. | Ejecuciones reales de los módulos y gráficos/reportes. |
| Trabajo en equipo y defensa individual | Participación, dominio del sistema y explicación de cambios. | Demostración individual de módulos, fórmulas y código. |
| Conclusiones | Resultados, utilidad, precisión y limitaciones. | Hallazgos obtenidos al probar el sistema. |
| Recomendaciones | Mejoras futuras, ampliaciones y acciones financieras basadas en el caso. | Limitaciones identificadas y oportunidades de mejora. |
| Bibliografía | Libros, artículos, material académico, documentación técnica y sitios confiables, con formato consistente. | Fuentes de fórmulas, conceptos y tecnología. |
| Anexos | Código o repositorio, diagramas, estructura de datos, capturas, manual de uso y cálculos de comprobación. | Material técnico y evidencias de validación. |

## Criterios de completitud para una IA

Antes de considerar terminado el proyecto, comprobar que:

- [ ] Están cubiertos los módulos obligatorios de análisis financiero y planeación financiera.
- [ ] Presupuesto personal e inventario básico están implementados como aplicaciones prácticas obligatorias.
- [ ] Los módulos reutilizan datos y presentan una relación lógica entre entrada, cálculo y salida.
- [ ] Cada cálculo muestra sus unidades y, cuando corresponda, una interpretación breve.
- [ ] Existe un caso de prueba completo y coherente que puede comprobarse manualmente.
- [ ] Es posible mostrar capturas o resultados que sirvan de evidencia para el informe.
- [ ] Un integrante puede cambiar datos de ejemplo y explicar el resultado y la fórmula.
- [ ] No se ha ampliado innecesariamente el alcance hacia un sistema contable o de facturación completo.
- [ ] Los apartados de presentación impresa se tratan como documentación del proyecto, no como funcionalidades de la interfaz.

## Fuente y nota de interpretación

Fuente: `Guia_Actualizada_Proyecto_Final_GFO_2026.docx`, proporcionada para el Proyecto Final de Gestión Financiera Operativa 2026.

La guía indica que estos requerimientos actualizan un enfoque anterior y que la rúbrica se elaborará posteriormente con base en el alcance definitivo acordado. Si una instrucción futura especifica una rúbrica o una decisión de alcance distinta, debe registrarse y aplicarse sin perder los módulos obligatorios descritos aquí.
