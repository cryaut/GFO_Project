# 00 — Alcance y decisiones iniciales

- **Estado**: En progreso
- **Fecha**: 2026-09-26 (punto de partida actualizado tras integrar `core`)
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

---

## Notación

La notación general del proyecto está en `docs/contexto/dominio-financiero.md`. Para esta feature:

| Símbolo | Significado |
|---------|-------------|
| UAII | Utilidad antes de intereses e impuestos |
| UAI | Utilidad antes de impuestos |
| I | Intereses (gasto financiero) |
| T | Tasa de impuesto sobre la renta |
| DAP | Dividendos de acciones preferentes (por confirmar) |
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

1. **Costos fijos y variables**: ¿vienen separados en los archivos o el sistema debe ayudar a clasificarlos? No siempre se pueden inferir por el nombre de la cuenta.
2. **Datos para GAF**: ¿los archivos traen intereses, impuestos (o la tasa T), DAP y, si se usa UPA, el número de acciones?
3. **Cuentas no reconocidas**: hoy la importación se detiene. ¿Se mantiene así o debe continuar marcando las cuentas dudosas para revisión? Cambiarlo afecta al importador de Estados y hay que acordarlo con Cris.
4. **Otros ingresos y otros gastos**: el código ya los trata como no operativos (fuera de la UAII). ¿Se confirma para el apalancamiento?
5. **Enfoque de las fórmulas**: ¿se calculan con la estructura de costos de un período, con la variación entre dos períodos (por ejemplo, GAO = %ΔUAII / %ΔVentas), o con ambos?
6. **Casos especiales**: ¿qué muestra el sistema con UAII ≤ 0, denominador 0, pérdidas, T fuera de rango o datos faltantes?
7. **Frecuencia e histórico**: ¿anual, trimestral o mensual, y cuántos períodos?
8. **DAP**: confirmar que significa dividendos de acciones preferentes, y dónde se registra en los archivos.

---

## Próximo paso

Integrar `core` en `main`. Después, responder las preguntas abiertas y validar los checkpoints de la ficha. Con eso se cierra este paso y se abre `01-formulas-apalancamiento.md` (CP1).
