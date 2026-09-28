# 00 — Alcance y decisiones iniciales

- **Estado**: Completado
- **Fecha**: 2026-09-26 (punto de partida actualizado tras integrar `core`); preguntas clave cerradas el 2026-09-27
- **Depende de**: ninguno

---

## Objetivo

Que GFO Toolkit calcule automáticamente el apalancamiento de una empresa (GAO, GAF y GAT) a partir de sus estados financieros. El usuario carga un archivo; el sistema identifica las cuentas, deriva los conceptos intermedios (UAII, UAI, intereses, impuestos, etc.) y aplica las fórmulas. El usuario no ingresa la UAII ni otros subtotales a mano.

---

## Decisiones tomadas

| Tema | Decisión |
|------|----------|
| Indicadores | GAO, GAF y GAT |
| Entrada de datos | Archivos Excel o CSV, con el importador de Estados |
| Automatización | El sistema extrae las cuentas del archivo y deriva los subtotales; el usuario no los digita |
| Catálogo de cuentas | Se usa `ACCOUNT_TYPES` del módulo de Estados y se extiende con lo que falte |
| Clasificación | Automática contra el catálogo. Las asignaciones confirmadas se guardan por empresa y se reutilizan en cargas futuras |
| Fórmulas | Se definen y validan dentro del proyecto, en un paso propio |
| Notación | UAII, UAI, I, T, DAP, etc. (ver abajo) |
| Benchmarking | Fuera de alcance por ahora (comparación entre empresas, por series de tiempo y combinada) |
| Forma de trabajo | Por checkpoints: cada etapa debe funcionar y verificarse antes de construir la siguiente |
| Costos fijos y variables (2026-09-27) | Los archivos no los separan. El usuario marca cada cuenta operativa como variable, fija o mixta (con % variable) en el módulo de apalancamiento, con una sugerencia según el tipo: costo de ventas → variable, gastos de administración → fija. Se guarda aparte de `estados`, así que el importador no cambia |
| Tasa T (2026-09-27) | Tasa efectiva IR / UAI cuando la UAI es positiva, hay IR y el resultado está entre 0 y 1. Si no, tasa configurable con 30 % por defecto, la alícuota general del IR según la DGI (con ingresos de hasta C$ 12 millones rige la tabla progresiva del art. 52 de la LCT) |
| DAP (2026-09-27) | Dividendos de acciones preferentes. Campo opcional por periodo en el módulo, 0 por defecto y visible en la traza |
| Enfoque de las fórmulas (2026-09-27) | Ambos: estructural (un periodo) como resultado principal y por variación entre dos periodos como complemento, o como único resultado si los costos no están clasificados |

---

## Notación

La notación general del proyecto está en `docs/contexto/dominio-financiero.md`. Para esta feature:

| Símbolo | Significado |
|---------|-------------|
| UAII | Utilidad antes de intereses e impuestos |
| UAI | Utilidad antes de impuestos |
| I | Intereses (gasto financiero) |
| T | Tasa de impuesto sobre la renta |
| DAP | Dividendos de acciones preferentes |
| CV, CF | Costos variables y costos fijos |
| MC | Margen de contribución = Ventas − CV |

Ejemplo de uso compartido por el equipo: `GAF = UAII / (UAII - I - DAP / (1 - T))`. Es un ejemplo de notación, no la definición final. Las fórmulas se fijan en el paso de fórmulas.

---

## Punto de partida del código

Revisión de la rama `core` al 2026-09-26, después de integrar las ramas de Cris y Henry:

- **Importación**: Estados acepta JSON, CSV, TSV y Excel, en tabla ancha (una columna por periodo) o larga, con plantilla descargable. Resuelve la pregunta 1 de la versión anterior de este paso.
- **Clasificación**: cada cuenta tiene un tipo de `ACCOUNT_TYPES`, que incluye `intereses` e `impuestos`. El tipo se infiere por el nombre o se toma de la columna `Clasificacion`.
- **Cuentas no reconocidas**: si el nombre no se reconoce y la fila no trae `Clasificacion`, la importación se detiene con un error que indica la fila. No existe un estado "dudosa" ni una revisión antes de guardar.
- **Memoria**: la clasificación se guarda junto con los estados (`accountTypes`), pero no hay memoria por empresa que se reutilice en la carga siguiente.
- **Totales**: `computeFinancialTotals` calcula la utilidad bruta y la neta (con intereses e impuestos). `computeRazones` calcula la UAII como utilidad operativa (ventas − costo de ventas − gastos de administración − gastos de ventas) y la cobertura de intereses.
- **Lo que no existe**:
  - el comportamiento fijo o variable de los costos, necesario para el GAO;
  - el DAP, la UAI y la tasa T, necesarios para el GAF.
- **Convención N/D**: las funciones nuevas devuelven `null`. Para los grados es clave: una UAII de 0 no significa un grado de 0.
- **Nombre ocupado**: `apalancamiento(activoProm, patrimonioProm)` ya existe y es el multiplicador de capital de DuPont.
- **Datos de prueba**: la demo MUNO MODA no cuadra (el activo queda por debajo de pasivo + patrimonio por C$ 70,200 en 2023 y C$ 46,150 en 2024) y no trae intereses ni impuestos. No sirve para probar el GAF: hacen falta casos propios.

---

## Checkpoints propuestos (borrador, por validar)

Versión original. La ficha de la feature (`README.md`) tiene la versión ajustada a lo que ya existe.

| CP | Meta | Se cumple cuando |
|----|------|------------------|
| 1 | Fórmulas y diccionario | Variables, fórmulas de GAO, GAF y GAT y reglas para casos especiales documentadas y aprobadas, con casos resueltos a mano |
| 2 | Motor de cálculo | Funciones puras de GAO, GAF y GAT con tests que reproducen los casos del CP1 |
| 3 | Catálogo y derivación | Existe el catálogo estándar; el sistema deriva UAII, UAI y demás conceptos desde cuentas clasificadas, valida la consistencia entre estados (A = P + O, utilidad → patrimonio) y compara lo derivado con los subtotales reportados cuando el archivo los trae |
| 4 | Importación Excel/CSV | Hay una plantilla de carga y el sistema convierte el archivo a la estructura interna sin pasos manuales. **Cubierto por Estados** |
| 5 | Clasificación automática | Las cuentas se asignan al catálogo, las dudosas se marcan para revisión y las confirmadas se reutilizan en la siguiente carga de la misma empresa. **Asignación cubierta por Estados; faltan la revisión de dudosas y la memoria por empresa** |
| 6 | Flujo completo | Cargar archivo → revisar clasificación → ver GAO, GAF y GAT por período con trazabilidad (cuenta → concepto → fórmula → resultado) |

---

## Preguntas abiertas

Revisadas el 2026-09-27. Se conserva el texto original de cada pregunta.

1. **Costos fijos y variables**: ¿vienen separados en los archivos o el sistema debe ayudar a clasificarlos? No siempre se pueden inferir por el nombre de la cuenta.
   **Resuelta**: no vienen separados. La plantilla, `scripts/sample-estados.*` y MUNO MODA clasifican por función, y una columna `Comportamiento` hoy se lee como periodo (la importación falla con `Importe inválido: Variable`). El usuario los marca en el módulo (ver Decisiones).
2. **Datos para GAF**: ¿los archivos traen intereses, impuestos (o la tasa T), DAP y, si se usa UPA, el número de acciones?
   **Resuelta**: intereses e IR se importan como montos (tipos `intereses` e `impuestos`), aunque ningún archivo de ejemplo los trae. T y DAP no vienen (ver Decisiones). El número de acciones no se pide: el paso 01 usa la variación de UN − DAP, que equivale a la de la UPA si las acciones no cambian.
3. **Cuentas no reconocidas**: hoy la importación se detiene. ¿Se mantiene así o debe continuar marcando las cuentas dudosas para revisión? Cambiarlo afecta al importador de Estados y hay que acordarlo con Cris.
   **Pospuesta** al CP3, para acordarla con Cris. No afecta a las fórmulas.
   **Propuesta de Cris (2026-09-27)**: si el usuario tiene una API key, un asistente de IA sugiere el tipo de las cuentas no reconocidas. Por decidir: es una dependencia externa (regla 11), sería el primer envío de datos fuera del navegador (hoy `arquitectura.md` dice que no hay ninguno) y exige que el importador deje de detenerse ante cuentas dudosas. Sería una feature propia de Estados, fuera del MVP de apalancamiento.
4. **Otros ingresos y otros gastos**: el código ya los trata como no operativos (fuera de la UAII). ¿Se confirma para el apalancamiento?
   **Pasa al paso 01**, porque cambia la fórmula del GAF.
5. **Enfoque de las fórmulas**: ¿se calculan con la estructura de costos de un período, con la variación entre dos períodos (por ejemplo, GAO = %ΔUAII / %ΔVentas), o con ambos?
   **Resuelta**: con ambos (ver Decisiones).
6. **Casos especiales**: ¿qué muestra el sistema con UAII ≤ 0, denominador 0, pérdidas, T fuera de rango o datos faltantes?
   **Pasa al paso 01**, que propone una regla para cada caso.
7. **Frecuencia e histórico**: ¿anual, trimestral o mensual, y cuántos períodos?
   **Pospuesta** al CP4 (pantalla). Las fórmulas no dependen de la frecuencia.
8. **DAP**: confirmar que significa dividendos de acciones preferentes, y dónde se registra en los archivos.
   **Resuelta**: significa dividendos de acciones preferentes y no viene en los archivos; se registra en el módulo (ver Decisiones).

---

## Próximo paso

Paso cerrado. Sigue [01 — Fórmulas de apalancamiento](01-formulas-apalancamiento.md) (CP1).
