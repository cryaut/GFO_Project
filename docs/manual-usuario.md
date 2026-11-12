# Manual de Usuario — GFO Toolkit

Guía paso a paso con ejemplos numéricos concretos por módulo.

---

## Tabla de Contenidos

1. [Inicio Rápido](#1-inicio-rápido)
2. [Módulo 1: Presupuesto Personal](#2-módulo-1-presupuesto-personal)
3. [Módulo 2: Estados Financieros](#3-módulo-2-estados-financieros)
4. [Módulo 3: Análisis Financiero](#4-módulo-3-análisis-financiero)
5. [Módulo 4: Activos del Hogar](#5-módulo-4-activos-del-hogar)
6. [Módulo 5: Mercados Financieros](#6-módulo-5-mercados-financieros)
7. [Módulo 6: Reportes e Integración](#7-módulo-6-reportes-e-integración)
8. [Apalancamiento (GAO, GAF y GAT)](#8-apalancamiento-gao-gaf-y-gat)
9. [Control de Inventario](#9-control-de-inventario)
10. [Punto de Equilibrio y C-V-U](#10-punto-de-equilibrio-y-c-v-u)
11. [Flujo de Efectivo](#11-flujo-de-efectivo)
12. [Presupuesto Maestro](#12-presupuesto-maestro)
13. [Proforma y Reporte Integrado](#13-proforma-y-reporte-integrado)

---

## 1. Inicio Rápido

1. Sirve la carpeta con `node scripts/dev-server.cjs` y abre http://127.0.0.1:8080 (los ES modules no cargan desde `file://`).
2. La primera pantalla es **Inicio**, un panorama general de la empresa:
   - **Salud general** (Sólida, Estable o Requiere atención): proporción de áreas dentro de los umbrales, penalizada por alertas altas. Es una lectura educativa, no una calificación crediticia.
   - **Indicadores principales** con la variación contra el periodo anterior, gráfica de ventas y utilidad, y **alertas prioritarias**.
   - **Puntos clave de la empresa**: cada área (liquidez, rentabilidad, endeudamiento, apalancamiento, equilibrio, flujo, presupuesto maestro, inventario) con sus cifras, una interpretación y un enlace al módulo.
   - **Mis finanzas personales**: capacidad de ahorro, meta y estado de los activos del hogar. Es independiente: no afecta la salud de la empresa ni el reporte integrado.
3. Sin datos, Inicio muestra **Cómo empezar** y dos botones: **Cargar ejemplo de empresa** (caso ficticio de MUNO MODA en todos los módulos de la empresa vacíos) y **Cargar ejemplo personal** (presupuesto personal y bienes del hogar). Ninguno reemplaza datos existentes.
4. El menú lateral está agrupado en **Empresa**, **Finanzas personales**, **Aprender** y **Datos**. Los módulos personales llevan un acento verde azulado.
5. Cambia entre tema claro y oscuro con el botón **Tema** al pie del menú; las gráficas abiertas se recolorean sin perder lo que estés editando.
6. Todos los datos se guardan automáticamente en localStorage.

---

Si el EFE aún no se puede calcular, Inicio indica qué falta y permite usar los demás módulos. Si una sección muestra **No se pudo cargar**, pulsa **Volver a intentar** o abre otra sección desde el menú.

## 2. Módulo 1: Presupuesto Personal

### 2.1 Inicio y meta

En **Ejemplos y datos**, selecciona «Plantilla estudiantil del profesor» y pulsa **Cargar ejemplo seleccionado** para explorar los datos del XLSX. Elegir una opción no carga ni reemplaza datos. También hay un caso sintético de transporte con ahorro cero. El reemplazo se confirma cuando ya hay información guardada.

Define nombre, descripción de la meta, costo, duración e inicio en lunes; pulsa **Guardar meta y fechas**. La plantilla propone 2000 en 20 semanas: aporte recomendado de **100 por semana**, del 3 de agosto al 20 de diciembre de 2026. Esa recomendación no se registra automáticamente como ahorro.

### 2.2 Registro semanal

Registra fecha, tipo, categoría, descripción, monto, prioridad y medio; observación es opcional. Los tipos son **Ingreso**, **Gasto**, **Ahorro** y **Reserva**. Usa montos positivos o cero; no escribas un gasto negativo. La fecha determina su semana. Puedes filtrar por semana, editar un movimiento o eliminarlo con confirmación. Si falla el guardado, el formulario y los datos anteriores se conservan para reintentar.

El ejemplo contiene **32 movimientos en cuatro semanas**: ingresos 2400, gastos 1750, ahorro para la meta 400, reserva 250 y saldo 0. El avance real es **20 %**; reserva y ahorro se mantienen separados.

### 2.3 Seguimiento

Consulta las semanas lunes–domingo, agrupadas en bloques de cuatro (no meses calendario). Cada fila muestra ingreso, gasto, ahorro, reserva, saldo, ahorro acumulado y porcentaje de la meta. Las semanas restantes sin movimientos no inventan ingresos ni ahorro: sus flujos son cero y el acumulado permanece en 400.

**Saldo = ingreso − gasto − ahorro − reserva.** El avance usa ahorro realizado ÷ costo. Un cero registrado se conserva; un dato o una base de cálculo pendiente aparece N/D.

### 2.4 Presupuesto proyectado

Abre **Real actual** para distribuir el ingreso que tienes o **Deseado** para preparar otro escenario. Son independientes entre sí y del registro realizado. Cada uno conserva frecuencia, ingreso, las nueve categorías del profesor, clasificación y comentarios. Un campo vacío significa pendiente; escribe 0 si esa partida no requiere dinero.

El ejemplo real reparte 2400: transporte 700, alimentación 500, datos/internet 200, copias/materiales 100, salud 0, ocio 250, reserva 250, meta 400 y otro 0. El total es 2400 (100 %) y la diferencia es cero. Ahorro/reserva se leen de sus categorías aunque cambies el tipo descriptivo. El límite de gasto semanal mensual es **(2400 − 400 − 250) ÷ 4 = 437.50**; para un plan semanal no se divide entre cuatro. Cambiar la frecuencia no convierte cifras. Guarda cada proyección con su propio botón.

### 2.5 Respaldos y presupuesto mensual anterior

En **Ejemplos y datos** puedes descargar el documento estudiantil. Se restaura desde **Reportes → Exportar → Importar JSON**; la importación conserva el presupuesto mensual actual. El respaldo completo de Reportes incluye ambos modelos. Inicio y Reportes muestran los movimientos realizados de la vista activa, sin exigir estados de una empresa para consultar el presupuesto estudiantil.

**Ver presupuesto mensual anterior** abre tus datos previos, con sus herramientas de ingresos, gastos e inflación; **Volver al presupuesto estudiantil** regresa al nuevo registro. Los datos no se convierten ni mezclan. Los respaldos antiguos abren la vista mensual y conservan el documento estudiantil si no lo incluyen.

<details><summary>Referencia de uso del presupuesto mensual anterior</summary>

### 2.1 Definir ingreso y meta de ahorro

**Paso 1:** En la pestaña **Ingresos**, registra cada ingreso del mes con su concepto y tipo (regular u ocasional). El total aparece en **Configuración**. Los datos guardados antes con un solo "ingreso mensual" se muestran como un ingreso regular.

| Concepto | Tipo | Valor |
|----------|------|-------|
| Salario | Regular | C$ 12,000 |

**Paso 2:** Define tu meta de ahorro y el plazo.

| Concepto | Valor |
|----------|-------|
| Meta de ahorro | C$ 3,000 |
| Meses disponibles | 12 |

**Resultado automático:**

```
Ahorro mensual = Meta ÷ Meses = C$ 3,000 ÷ 12 = C$ 250
```

La herramienta calcula C$ 250 como el monto que debes separar cada mes antes de cualquier gasto ("pagarse primero").

### 2.2 Clasificar gastos

Ingresa tus gastos del mes y asígnalos a una categoría:

| Gasto | Categoría | Monto |
|-------|-----------|-------|
| Alimentación | Necesidad | C$ 3,500 |
| Transporte | Necesidad | C$ 1,200 |
| Universidad | Necesidad | C$ 1,500 |
| Renta | Necesidad | C$ 2,500 |
| Salida con amigos | Deseo | C$ 800 |
| Ropa nueva | Deseo | C$ 600 |
| Emergencia médica | Imprevisto | C$ 400 |
| Ahorro (meta) | Meta | C$ 250 |

### 2.3 Verificar el balance

```
Total ingreso:   C$ 12,000
Total gastos:    C$ 10,750
Ahorro:          C$   250
Reserva:         C$     0
─────────────────────────
Saldo semanal:   C$ 1,000
```

La herramienta valida que `gastos + ahorro ≤ ingreso`. Si excedes el ingreso, se muestra una alerta.

### 2.4 Control semanal

Cada semana, registra tus gastos reales. El sistema calcula el saldo acumulado:

| Semana | Ingreso | Gastos | Ahorro | Saldo |
|--------|---------|--------|--------|-------|
| Sem 1 | C$ 3,000 | C$ 2,688 | C$ 63 | C$ 250 |
| Sem 2 | C$ 3,000 | C$ 2,688 | C$ 63 | C$ 250 |
| Sem 3 | C$ 3,000 | C$ 2,688 | C$ 63 | C$ 250 |
| Sem 4 | C$ 3,000 | C$ 2,688 | C$ 61 | C$ 250 |

### 2.5 Ajuste por inflación

Si los precios suben un 5%, actualiza el porcentaje de ajuste y la herramienta recalcula automáticamente todos los montos proyectados.

### 2.6 Capacidad de ahorro y saldo disponible

La pestaña **Resumen** muestra:

```
Capacidad de ahorro = Total de ingresos − Total de gastos
Saldo disponible    = Capacidad de ahorro − Ahorro planificado al mes
```

Con **Cargar ejemplo ficticio** (datos inventados, para no exponer información personal en la defensa): ingresos C$ 22,500 (salario 18,000 + trabajos independientes 4,500) y gastos C$ 17,200 → capacidad de ahorro **C$ 5,300** (23.56 % de los ingresos). Con una meta de C$ 36,000 en 12 meses (C$ 3,000 al mes) quedan **C$ 2,300** disponibles. La interpretación indica además la categoría con más gasto y, si la meta no alcanza, cuántos meses tomaría con la capacidad actual. Este presupuesto es independiente del presupuesto maestro de la empresa.

</details>

---

## 3. Módulo 2: Estados Financieros

### Identificación de cuentas al importar o escribir

El resumen distingue **reconocidas**, **sugeridas** y **no reconocidas**. Una cuenta reconocida guarda su identificador; una sugerida ofrece candidatos y requiere pulsar **Confirmar cuenta**. Si no se reconoce, filtre la lista del catálogo y elija la cuenta correcta. El nombre que escribió se conserva. En **Cuenta nueva** se usa el mismo identificador: los nombres exactos se reconocen al escribir y las sugerencias se confirman al añadir.

Las filas pendientes se importan con sus importes, incluso si falta el grupo; aparecen en la revisión y en la vista del borrador. Puede guardar el conjunto y resolverlas después. Los cálculos que dependen de ellas muestran **N/D** con un motivo; no se sustituyen por cero. La clasificación previa de datos guardados se conserva para compatibilidad. Otros ingresos/gastos genéricos necesitan confirmación fuera del caso ya clasificado de la demostración.

En Estados, una cuenta pendiente con importe cero no afecta los totales de ese periodo, aunque siga en la lista de revisión. Si tiene importe, solo se bloquean los subtotales a los que podría pertenecer y el total de su grupo. Por ejemplo, una cuenta pendiente de activo corriente no bloquea activos fijos ni pasivos. Sin grupo, un importe pendiente afecta todos los totales. Esto también protege datos antiguos sin clasificación. En las razones, un operando N/D se conserva como N/D, también antes de calcular márgenes, cobertura, compras y capital de trabajo. Un solo periodo sigue usando su saldo final; las fórmulas y los resultados con datos completos no cambian.

CSV y Excel admiten una columna opcional `id` (por ejemplo `bs.cash_and_equivalents`). Si es inválido o contradice grupo/clasificación, la cuenta queda pendiente. El lector busca la cabecera `Cuenta` entre las primeras 25 filas de una hoja y avisa si una hoja no tiene tabla de cuentas. No se añaden formatos de archivo.

Los totales reportados sin tipo equivalente y los datos suplementarios aparecen aparte. La consulta por identificador devuelve el total publicado; no inventa una suma de componentes. Si un total y sus componentes se superponen en el motor anterior, su agregado queda N/D hasta resolver el desglose o usar el futuro motor. Los costos/gastos se capturan positivos y la depreciación acumulada negativa. Los intereses ganados son ingresos, no gastos.

### 3.1 Cargar datos: importar, editar o usar la demo

La sección Estados Financieros (`#/estados`) es la puerta de entrada de la información. El flujo es siempre el mismo:

1. **Cargar o editar** el borrador (importar archivo, pegar desde Excel, escribir a mano o cargar el ejemplo).
2. **Revisar el equilibrio** en el panel de validación.
3. **Guardar** para publicar los datos.
4. **Analizar** los datos guardados en `#/analisis`.

El botón **"Cargar ejemplo"** inserta la empresa de demostración MUNO MODA S.A. con dos periodos, útil para explorar la herramienta sin datos propios.

Los controles se agrupan por tarea. **Empresa** y **Guardar estados** están al inicio, con el estado del borrador. En **Cargar datos** están el archivo, la plantilla CSV y los paneles **Pegar celdas desde Excel**, **Formato de importes y ayuda** y **Nuevo conjunto o ejemplo**. Este panel comienza abierto cuando no hay periodos.

En **Periodo de trabajo**, seleccione el periodo que va a editar. Despliegue **Datos complementarios del periodo** para capturar composición de ingresos y datos de rotaciones, o **Administrar periodos** para añadir, renombrar, ordenar o eliminar. Las cuentas se organizan en grupos plegables; cada grupo incluye **Añadir cuenta**. Debajo están **Revisar equilibrio** y **Vista multiperiodo del borrador**, que contiene los periodos visibles y la descarga JSON. Los encabezados desplegables se pueden abrir con Enter o Espacio al navegar con teclado. En móvil, las tablas se desplazan horizontalmente dentro de su recuadro.

> Importante: la importación **reemplaza** el borrador completo; no combina periodos ni cuentas. Sus datos guardados no cambian hasta pulsar **Guardar estados**.

### 3.2 Importar estados financieros externos (JSON, CSV, Excel)

**Importar archivo.** Acepta `.json`, `.csv`, `.tsv`, `.txt`, `.xlsx` y `.xls`. Los periodos se ordenan automáticamente del más antiguo al más reciente.

**JSON.** Un objeto con `name`, `periods`, `balanceGeneral`, `estadoResultados` y, opcionalmente, `accountTypes`. También se admite el envoltorio `{ "estados": { … } }` que exporta el módulo Reportes.

**Tabla ancha (CSV/TSV/Excel).** Una fila por cuenta y una columna por periodo:

| Estado | Grupo | Cuenta | Clasificacion | 2023 | 2024 |
|--------|-------|--------|---------------|------|------|
| Balance | Activos | Efectivo | efectivo | 45000 | 52000 |
| Balance | Pasivos | Cuentas por Pagar | cuentasPorPagar | 85000 | 92000 |
| Balance | Patrimonio | Capital Social | patrimonio | 300000 | 300000 |
| Resultados | | Ventas | ventas | 850000 | 920000 |

- La cabecera **`Cuenta`** es obligatoria; `Estado`, `Grupo` y `Clasificacion` son opcionales.
- `Estado` acepta `Balance` o `Resultados`. `Grupo` acepta `activos`, `pasivos` o `patrimonio`.
- Si omite `Grupo`, la cuenta se ubica a partir de su `Clasificacion`.
- El botón **"Descargar plantilla CSV"** genera este formato listo para editar.

**Tabla larga (una fila por periodo).** Columnas `Periodo`, `Estado`, `Grupo`, `Cuenta` e `Importe`.

**Pegar desde Excel.** Abra **Cargar datos → Pegar celdas desde Excel**, copie el rango (incluidos los encabezados), péguelo y pulse **"Importar tabla pegada"**. Los tabuladores se detectan solos.

**Excel con varias hojas.** Si el libro tiene hojas separadas por estado (`Activos`, `Pasivos`, `Patrimonio`, `Resultados`), cada hoja puede contener solo una columna `Cuenta` y una columna por periodo; el nombre de la hoja aporta el estado y el grupo.

**Importes admitidos.** `45000`, `45,000`, `C$ 12.500,50`, `(500)` y `500-` se interpretan correctamente. Una celda en blanco **omite** la cuenta en ese periodo (no la convierte en cero). Las cuentas cuyo nombre no se reconoce exigen indicar `Clasificacion`; el error indica el número de fila.

**Formato de importes (punto o coma).** Abra **Cargar datos → Formato de importes y ayuda**. Elija en **"Formato de importes al importar CSV/Excel"** cómo escribe sus números:

- **Automático (recomendado):** mira todos los importes del archivo. Si alguno demuestra el formato (`1.234.567` o `12,50` indican coma decimal; `1,234.50`, punto decimal), lo aplica a todo el archivo.
- **Punto decimal** (`1,234.50`) o **Coma decimal** (`1.234,50`): fuerza el formato y rechaza lo que no encaje, con la fila del error.

Un importe como `45.000` es ambiguo (¿45 o cuarenta y cinco mil?). Si el archivo no permite deducirlo, se lee como 45 y, tras importar, el mensaje indica cuántos importes eran ambiguos y en qué fila. Si su archivo usa el punto para miles, elija **Coma decimal** y vuelva a importar.

### 3.3 Balance General — Verificar A = P + O

La demo carga el siguiente Balance General de MUNO MODA S.A.:

**Periodo 2024:**

| Cuenta | Monto |
|--------|-------|
| **Activos** | |
| Efectivo | C$ 52,000 |
| Cuentas por Cobrar | C$ 135,000 |
| Inventario | C$ 195,000 |
| Activos Corrientes Otros | C$ 30,000 |
| Terrenos, Edificios, Equipos y Vehículos | C$ 530,000 |
| Depreciación Acumulada | C$ (116,475) |
| **Total Activos** | **C$ 825,525** |
| **Pasivos** | |
| Cuentas por Pagar | C$ 92,000 |
| Pasivo Corto Plazo | C$ 65,000 |
| Provisiones | C$ 18,000 |
| Pasivo Largo Plazo | C$ 45,000 |
| Otros Pasivos | C$ 23,085 |
| **Total Pasivos** | **C$ 243,085** |
| **Patrimonio** | |
| Capital Social | C$ 300,000 |
| Reservas | C$ 80,000 |
| Utilidades Acumuladas | C$ 202,440 |
| **Total Patrimonio** | **C$ 582,440** |

**Verificación:**

```
Activos  = C$ 825,525
Pasivos + Patrimonio = C$ 243,085 + C$ 582,440 = C$ 825,525
```

La ecuación contable **A = P + O** se cumple en 2023 (C$ 801,475) y en 2024. Las utilidades acumuladas pasan de C$ 137,615 a C$ 202,440. La utilidad neta de 2024 (C$ 104,825) menos ese aumento da C$ 40,000 de distribuciones derivadas; su pago no está confirmado con un dato independiente.

### 3.4 Estado de Resultados

| Concepto | 2023 | 2024 |
|----------|-----:|-----:|
| Ventas | C$ 850,000 | C$ 920,000 |
| Costo de Ventas | C$ 510,000 | C$ 545,000 |
| **Utilidad Bruta** | **C$ 340,000** | **C$ 375,000** |
| Gastos de Administración y de Ventas | C$ 205,000 | C$ 220,000 |
| **UAII (utilidad operativa)** | **C$ 135,000** | **C$ 155,000** |
| Otros Ingresos − Otros Gastos | C$ 5,000 | C$ 6,000 |
| Gastos por Intereses | C$ 12,600 | C$ 11,250 |
| **UAI** | **C$ 127,400** | **C$ 149,750** |
| Impuesto sobre la Renta (30 %) | C$ 38,220 | C$ 44,925 |
| **Utilidad Neta** | **C$ 89,180** | **C$ 104,825** |

### 3.5 Conexión entre estados

La herramienta muestra cómo se conectan:

```
Utilidad Neta (ER) ──→ Se suma a Utilidades Retenidas (BG)
Efectivo (BG) ──→ Se muestra en el EFE
```

---

### Lectura de los ejercicios resueltos

En Estados, las cuentas originales siguen siendo editables. Entre ellas aparecen los subtotales de lectura en su lugar: activos corrientes, activos fijos netos, totales del balance y, en Resultados, utilidad bruta, utilidad operativa (UAII), utilidad antes de impuestos (UAI) y utilidad neta (UN). **Calculado** indica un resultado obtenido con los datos disponibles; **Reportado**, un importe del archivo; **Faltan datos / N/D**, una operación que no se puede completar. **Revisar** junto a un reportado indica motivos de comprobación, sin reemplazar su importe. Los signos +, − y = ayudan a leer; los subtotales no son nuevas operaciones que deban sumarse otra vez.

Los resultados se actualizan al editar. Si vacía el impuesto, por ejemplo, UAI puede seguir calculándose y UN queda N/D; para guardar/exportar deberá completar los importes válidos. Los renglones calculados no se añaden al JSON original. La vista multiperiodo distingue su origen en cada columna.

AH y AV muestran las mismas cuentas y subtotales ordenados, manteniendo las convenciones de variación y las bases vigentes. El EFE de Análisis distingue el efectivo final calculado del saldo observado: una diferencia queda visible y no se compensa automáticamente.

## 4. Módulo 3: Análisis Financiero

Elija el **Periodo de análisis** al inicio. La navegación agrupa las nueve secciones por tarea: comparar estados, rentabilidad y lectura, capital y fondos. Cada sección ofrece **Ver método y criterios**. Al cambiar de periodo se conserva la sección abierta; Mercado mantiene la comparación de todos los periodos. Leer o cambiar de sección no modifica los estados guardados.

**AH** presenta todas las cuentas del balance y del estado de resultados entre periodos consecutivos, hasta el periodo seleccionado, con T1, T2, variación absoluta y relativa. Una cuenta ausente en un periodo muestra N/D, no cero. La convención de porcentaje sigue siendo Δ/valor absoluto de T1. **AV** presenta todas las cuentas sobre total activo (BG) o ventas netas (ER); los totales reportados no se suman otra vez. Suplementarios y cuentas sin grupo se identifican aparte, sin inventar una base.

**DuPont** detalla margen neto, rotación y multiplicador: fórmula, importes y resultado. Muestra ROA = margen × rotación y ROE = margen × rotación × multiplicador, con sus cálculos directos y comprobación. Usa los mismos operandos que Razones; si faltan datos, mantiene N/D. No se redondean factores antes de multiplicar. Si ventas es cero, la descomposición puede ser N/D aunque un rendimiento directo sí exista.

Los ejemplos de esta sección usan cifras pequeñas para ilustrar cada fórmula; no son los datos de la demo MUNO MODA.

El selector de periodo conserva las entradas de Mercado sin guardar, incluso si cambia de sección antes de usarlo. Para persistirlas, pulse **Guardar y calcular** en Mercado.

### 4.1 Análisis Horizontal (AH)

**Ejemplo con Cuentas por Cobrar:**

```
Valor 2023: C$ 10,000
Valor 2024: C$ 12,000

Δ (delta) = C$ 12,000 - C$ 10,000 = C$ 2,000
%Δ = C$ 2,000 ÷ |C$ 10,000| = 0.20 = +20%
```

**Interpretación:** Las cuentas por cobrar aumentaron un 20%, lo que puede indicar ventas a crédito crecientes o dificultades de cobro.

### 4.2 Análisis Vertical (AV)

**Ejemplo sobre Total Activos (BG 2024):**

```
Efectivo:       C$  8,500 ÷ C$ 98,500 = 8.63%
CxC:            C$ 12,000 ÷ C$ 98,500 = 12.18%
Inventario:     C$ 18,000 ÷ C$ 98,500 = 18.27%
Activo Fijo:    C$ 60,000 ÷ C$ 98,500 = 60.91%
```

**Ejemplo sobre Ventas (ER):**

```
Costo de Ventas: C$ 72,000 ÷ C$ 120,000 = 60%
Utilidad Bruta:  C$ 48,000 ÷ C$ 120,000 = 40%
Utilidad Neta:   C$ 10,500 ÷ C$ 120,000 = 8.75%
```

### 4.3 Razones Financieras

#### Liquidez

**Ratio Corriente (RC):**

```
AC = C$ 38,500  (Efectivo + CxC + Inventario)
PC = C$ 25,000  (Cuentas por Pagar + Préstamo CP)

RC = C$ 38,500 ÷ C$ 25,000 = 1.54
```

> Un RC de 1.54 indica que por cada C$ 1 de deuda a corto plazo, hay C$ 1.54 en activos corrientes. Es aceptable (>1.0).

**Ratio Rápido (RR):**

```
RR = (C$ 38,500 - C$ 18,000) ÷ C$ 25,000
RR = C$ 20,500 ÷ C$ 25,000 = 0.82
```

> Un RR de 0.82 es bajo (<1.0), indica que sin vender inventario no se cubren los pasivos a corto plazo.

#### Actividad

**Rotación de Inventario:**

```
Rotación = C$ 72,000 ÷ C$ 18,000 = 4.0 veces
```

> El inventario se renueva 4 veces al año (cada 3 meses).

**Plazo de Cobro:**

```
RotCxC = C$ 120,000 ÷ C$ 12,000 = 10.0
Plazo = 365 ÷ 10 = 36.5 días
```

> En promedio, se cobra 36.5 días después de la venta. La herramienta usa un año de 365 días para todos los plazos (cobro, pago, edad del inventario y ciclo de conversión).

**Rotación de Activos Fijos:**

```
Rotación = Ventas ÷ Activo fijo neto
```

> Cuántos colones de ventas genera cada colón invertido en activos fijos. La herramienta informa `N/D` si no hay activos fijos netos.

**Rotación de Capital de Trabajo:**

```
**Solvencia (Activos ÷ Pasivos):**

```
Solvencia = Activo Total ÷ Pasivo Total
```

> Respaldo de los activos frente a las deudas. Un valor de 2.0 indica que los activos duplican a los pasivos.

**Deuda / Patrimonio**, **Apalancamiento** y **Cobertura de Intereses** aparecen en la pestaña Razones para completar el diagnóstico de endeudamiento.


Rotación = Ventas ÷ CNT
```

> Mide la eficiencia del capital de trabajo. Debe usarse con CNT positivo: un CNT cercano a cero produce valores artificialmente altos.


#### Endeudamiento

```
Endeudamiento = C$ 50,000 ÷ C$ 98,500 = 50.76%
```

> El 50.76% de los activos están financiados con deuda.

#### Rentabilidad

**Margen Neto:**

```
MN = C$ 10,500 ÷ C$ 120,000 = 8.75%
```

**ROA:**

```
ROA = C$ 10,500 ÷ C$ 98,500 = 10.66%
```

### 4.4 Modelo DuPont

DuPont toma la utilidad neta y ventas del motor de razones. Si falta un dato necesario para obtener la utilidad, el margen y el ROE se muestran como N/D, en lugar de tratar esa ausencia como cero.

```
PM  = C$ 10,500 ÷ C$ 120,000 = 0.0875
AT  = C$ 120,000 ÷ C$ 98,500 = 1.218
EM  = C$ 98,500 ÷ C$ 48,500  = 2.031

ROE = PM × AT × EM = 0.0875 × 1.218 × 2.031 = 0.2169 (21.69%)
```

**Interpretación:** Por cada C$ 1 de patrimonio, la empresa genera C$ 0.22 de utilidad neta. El apalancamiento (EM) amplifica el retorno.

### 4.5 Capital Neto de Trabajo

```
CNT = AC - PC = C$ 38,500 - C$ 25,000 = C$ 13,500
```

> Un CNT positivo indica buena capacidad de cubrir obligaciones a corto plazo.

### 4.6 Razones de mercado

En la pestaña **Mercado** de `#/analisis`, ingresa por periodo las acciones comunes en circulación, el precio de mercado por acción y los dividendos pagados, o pulsa **Cargar ejemplo de la demo**. La utilidad neta y el patrimonio salen de los estados guardados, y el DAP, de Apalancamiento.

**Ejemplo hipotético con la demo MUNO MODA 2024** (30,000 acciones, precio C$ 52, suponiendo dividendos C$ 40,000; ese pago sigue sin confirmar):

| Razón | Cálculo | Resultado |
|---|---|---:|
| UPA | (104,825 − 0) / 30,000 | C$ 3.49 por acción |
| P/U | 52 / 3.49 | 14.88 veces |
| Valor en libros por acción | 582,440 / 30,000 | C$ 19.41 |
| P/VL | 52 / 19.41 | 2.68 veces |
| DPA | 40,000 / 30,000 | C$ 1.33 |
| Pago de dividendos | 1.33 / 3.49 | 38.16 % |
| Rendimiento del dividendo | 1.33 / 52 | 2.56 % |

En ese ejemplo, el mercado paga 14.88 veces la utilidad por acción y valora la acción a 2.68 veces su valor en libros. La cifra derivada del cambio del patrimonio (UN − ΔPatrimonio = C$ 40,000) sirve de referencia; no confirma independientemente el pago ni la utilidad.

### 4.7 Origen y Aplicación de Fondos (EOAF)

En la pestaña **EOAF** de `#/analisis` se compara el balance de los dos periodos más recientes y cada variación de cuenta se clasifica como **Origen** (la empresa obtiene fondos) o **Aplicación** (la empresa los pone en marcha).

| Regla | Ejemplo |
|---|---|
| Activo que aumenta | Compra de inventario → Aplicación |
| Activo que disminuye | Cobro de una cuenta por cobrar → Origen |
| Pasivo que aumenta | Préstamo nuevo → Origen |
| Pasivo o patrimonio que disminuye | Dividendos pagados → Aplicación |

La depreciación acumulada creciente se presenta como origen (gasto no efectivo del periodo); una nota lo explica, porque el modelo no guarda ese gasto por separado y por eso no se distingue de un retiro de activos. Los subtotales de la tabla solo suman saldos: nunca generan movimientos.

Al pie está la comprobación: **Total de orígenes** contra **Total de aplicaciones**. Si la diferencia es de un centavo o menos, el estado muestra **Cuadra**; si es mayor, muestra **No cuadra** con la cifra exacta. Si falta el saldo de una cuenta en un periodo o una cuenta no tiene clasificación, la comprobación queda **Comprobación incompleta**, la lista de motivos dice qué corregir y los totales se muestran como **N/D** hasta que los datos estén completos.

**Qué significa «Cuadra»:** que los dos balances cierran (Activos = Pasivos + Patrimonio) y que sus variaciones se explican entre sí. No verifica que los importes capturados sean correctos; si un balance no cierra, una nota lo indica por periodo.

**Ejemplo con la demo MUNO MODA (2023 → 2024):** orígenes y aplicaciones coinciden en C$ 97,775. La mayor fuente son las Utilidades Acumuladas (C$ 64,825) y la mayor aplicación el Pasivo Largo Plazo (C$ 35,000).

> El estado no inventa cifras: una cuenta sin saldo en un periodo se marca "Dato faltante" y una sin clasificar "Sin clasificar". Corríjalas en Estados Financieros y vuelva a abrir Análisis.

### 4.8 Estado de Flujo de Efectivo (EFE)

En la pestaña **EFE** de `#/analisis` se presenta una **estimación por método indirecto y variaciones de dos balances** (el periodo anterior y el último). Con un solo periodo la pestaña explica qué falta. Las variaciones, por sí solas, no identifican cobros y pagos ni separan todas las transacciones no monetarias. Para capturar movimientos de efectivo utilice `#/flujo` y verifique con los documentos de respaldo.

**Las tres actividades:**

- **Operación:** utilidad neta del periodo final + depreciación y amortización del periodo − aumentos de inventario, cuentas por cobrar y otros activos corrientes + aumentos de cuentas por pagar y provisiones.
- **Inversión:** compra (−) o baja (+) de activos fijos.
- **Financiamiento:** variación de la deuda a largo y corto plazo, aportaciones de capital y dividendos.

**Comprobación:** CFO + CFI + CFF debe ser igual a la variación de efectivo (efectivo final − efectivo inicial). La pestaña lo comprueba con una tolerancia de C$ 0.01 y muestra la insignia **Cuadra**, **No cuadra** (con la diferencia exacta) o **Comprobación incompleta** (con los motivos: cuenta sin saldo, sin clasificar o con un importe que no es número, sin estado de resultados o sin efectivo). El estado no ajusta cifras ni distribuye diferencias: si no cuadra, hay que revisar los datos en Estados Financieros. «Cuadra» significa que los balances cierran y sus variaciones se explican entre sí; no valida los importes capturados. Debajo de las cifras, la **Interpretación** dice si la operación generó o consumió efectivo, si alcanzó para cubrir la inversión y si el financiamiento aportó o devolvió fondos.

**Ejemplo con la demo MUNO MODA (2023 → 2024):**

| Actividad | Cálculo | Resultado |
|---|---|---:|
| Operación (CFO) | 104,825 + 17,950 − 15,000 − 15,000 − 5,000 + 7,000 + 3,000 | C$ 97,775 |
| Inversión (CFI) | activos fijos sin cambio | C$ 0 |
| Financiamiento (CFF) | −55,775 (deuda LP) + 5,000 (deuda CP) − 40,000 (dividendos derivados) | C$ −90,775 |
| **Total de flujos** | 97,775 + 0 − 90,775 | **C$ 7,000** |
| Variación de efectivo | 52,000 − 45,000 | C$ 7,000 |

La comprobación cuadra aritméticamente. Los dividendos (C$ 40,000) son derivados de la utilidad neta menos el aumento de resultados y reservas con identidad acreditada; si no es posible separar el patrimonio, se utiliza su variación total con una nota. Los gastos por intereses y los impuestos ya están dentro de la utilidad neta.

**Alcance de la comprobación:** cuadrar significa que la suma estimada coincide con la variación de efectivo; no confirma las actividades ni los dividendos pagados. La conciliación de la utilidad contra el patrimonio tampoco verifica por sí sola los dividendos. El pago de C$ 40,000 continúa sin confirmar. Si reservas y resultados cambian en sentidos opuestos, aparece una advertencia de posibles transferencias internas. Una cuenta sin clasificar con cero en ambos cierres no bloquea EFE ni EOAF; la falta de saldo en uno de ellos sí requiere completar el dato.

---

## 5. Módulo 4: Activos del Hogar

Registra los bienes del hogar (tecnología, electrodomésticos, mobiliario, transporte, herramientas), su depreciación y su condición. Está en la sección **Finanzas personales** del menú y no se mezcla con los activos fijos del balance de la empresa.

### 5.1 Ejemplo: Laptop

**Datos del activo:**

| Campo | Valor |
|-------|-------|
| Categoría | Tecnología |
| Descripción | Laptop Dell Inspiron |
| Costo original | C$ 18,000 |
| Valor residual | C$ 2,400 |
| Vida útil | 5 años |

### 5.2 Depreciación anual (línea recta)

```
Dep. Anual = (Costo - Residual) ÷ Vida Útil
Dep. Anual = (C$ 18,000 - C$ 2,400) ÷ 5
Dep. Anual = C$ 15,600 ÷ 5
Dep. Anual = C$ 3,120
```

La laptop pierde C$ 3,120 de valor cada año.

### 5.3 Depreciación acumulada

Después de 3 años de uso:

```
Dep. Acumulada = Dep. Anual × Años Consumidos
Dep. Acumulada = C$ 3,120 × 3
Dep. Acumulada = C$ 9,360
```

### 5.4 Valor en libros

```
Valor en Libros = Costo - Dep. Acumulada
Valor en Libros = C$ 18,000 - C$ 9,360
Valor en Libros = C$ 8,640
```

Después de 3 años, la laptop vale C$ 8,640 contablemente.

### 5.5 Tabla de depreciación completa

| Año | Dep. Anual | Dep. Acumulada | Valor en Libros |
|-----|-----------|----------------|-----------------|
| 0 | — | C$ 0 | C$ 18,000 |
| 1 | C$ 3,120 | C$ 3,120 | C$ 14,880 |
| 2 | C$ 3,120 | C$ 6,240 | C$ 11,760 |
| 3 | C$ 3,120 | C$ 9,360 | C$ 8,640 |
| 4 | C$ 3,120 | C$ 12,480 | C$ 5,520 |
| 5 | C$ 3,120 | C$ 15,600 | C$ 2,400 |

> Al final de la vida útil (año 5), el valor en libros iguala el valor residual (C$ 2,400).

---

## 6. Módulo 5: Mercados Financieros

### 6.1 Glosario

Navega al glosario para consultar más de 20 términos financieros definidos: mercado, instrumento, bono, acción, BCN, SIBOIF, etc.

### 6.2 Comparador: Bonos vs Acciones

| Criterio | Bonos | Acciones |
|----------|-------|----------|
| Tipo | Deuda | Propiedad |
| Riesgo | Bajo | Alto |
| Renta fija | Sí | No |
| Voto en asamblea | No | Sí |
| Plazo | Corto/largo | Indefinido |

### 6.3 Quiz de Mercados

1. Navega a `#/mercados` y selecciona el quiz.
2. Responde las preguntas de opción múltiple.
3. Tu puntaje se guarda automáticamente.
4. Puedes repetir el quiz para mejorar tu puntuación.

---

## 7. Módulo 6: Reportes e Integración

### 7.1 Exportar a JSON

1. Navega a `#/reportes`.
2. Haz clic en **"Exportar JSON"**.
3. Se descarga `gfo-toolkit-export.json` con los módulos guardados, incluidos los escenarios de Planeación.

### 7.2 Exportar a CSV

1. Selecciona la tabla que deseas exportar.
2. Haz clic en **"Exportar CSV"**.
3. Se descarga un `.csv` compatible con Excel y Google Sheets. Incluye las columnas `Estado`, `Grupo`, `Cuenta` y `Clasificacion`, de modo que el archivo puede volver a importarse en `#/estados` sin edición manual.

### 7.3 Exportar a HTML

1. Haz clic en **"Vista previa del reporte"** para verlo en la página.
2. Haz clic en **"Descargar reporte HTML"** para guardarlo como `gfo-reporte.html`.
3. El reporte incluye el resumen, el Balance General y el Estado de Resultados con una columna por periodo, y los totales por periodo (N/D cuando faltan cuentas por clasificar). Puedes imprimirlo con Ctrl+P.

### 7.4 Importar un respaldo JSON

1. Haz clic en **"Importar JSON"** y selecciona un archivo `.json` generado con **"Exportar JSON"** (máximo 5 MB).
2. La aplicación valida el archivo y muestra qué módulos se van a **reemplazar**; confirma para continuar. Si algo no es válido, no se cambia nada y el mensaje explica el motivo.
3. Todos los módulos del respaldo se guardan juntos. Si falla el almacenamiento, se conserva el último estado válido.

Si el respaldo contiene Inventario, Reportes verifica las fechas reales, los costos declarados y los saldos del kardex en orden cronológico. Una salida que deje existencias negativas impide restaurar el archivo aunque una compra posterior recupere el saldo. El mensaje identifica el campo o movimiento que debes corregir. Las entradas de respaldos antiguos con el costo omitido usan el costo del producto.

Para cargar un archivo de estados financieros (JSON, CSV o Excel) usa **Importar archivo** en `#/estados`; un JSON de Estados no es un respaldo y Reportes lo rechaza.

### 7.5 Dashboard resumen

El dashboard muestra los KPIs de la empresa y un resumen por módulo separado en Empresa, Finanzas personales y Aprender:

- **Estados:** Total activos, pasivos, patrimonio, ventas y utilidad neta, calculados con el mismo motor que Análisis (incluye cuentas importadas con nombres propios)
- **Análisis:** endeudamiento y ROA
- **Finanzas personales:** ingreso del presupuesto personal y cantidad de bienes del hogar registrados
- **Mercados:** Último puntaje del quiz

Para un panorama con interpretaciones, usa **Inicio** (sección 1).

---

## 8. Apalancamiento (GAO, GAF y GAT)

Calcula cuánto se amplifica un cambio en las ventas sobre la utilidad operativa (GAO), un cambio en la UAII sobre la utilidad para accionistas comunes (GAF) y el efecto combinado (GAT). Usa los estados guardados en `#/estados`: no hay que digitar la UAII ni otros subtotales.

### 8.1 Clasificar los costos

1. Guarda tus estados en `#/estados` (o carga el ejemplo MUNO MODA) y navega a `#/apalancamiento`.
2. En **Clasificación de costos**, elige para cada cuenta de costo de ventas, gastos de administración y gastos de ventas si es **Variable** (cambia con las ventas), **Fijo** o **Mixto** (indica qué % es variable).
3. El costo de ventas llega propuesto como variable y los gastos de administración como fijos, con la etiqueta *sugerido*. Revísalos.
4. Pulsa **Guardar y recalcular**. La clasificación se guarda aparte de los estados: reimportar los estados no la borra.

Mientras falte clasificar alguna cuenta, el GAO y el GAT por periodo salen N/D; el GAF y los grados por variación sí se calculan.

### 8.2 Parámetros

- **Tasa de impuesto por defecto:** se usa solo si la tasa efectiva (IR / UAI) no tiene sentido, por ejemplo si no hay cuenta de impuestos o la UAI es negativa. Vacío = 30 %.
- **DAP (dividendos de acciones preferentes):** uno por periodo; vacío = 0. Solo con DAP interviene la tasa T.

### 8.3 Leer los resultados

- **Grados por periodo:** GAO = MC / UAII, GAF = UAII / (UAI − DAP / (1 − T)) y GAT = GAO × GAF. La UAI incluye otros ingresos y otros gastos.
- **Grados por variación:** comparan dos periodos seguidos (%ΔUAII / %ΔVentas, etc.). Si difieren más de 10 % del GAO estructural del periodo base, aparece un aviso: cambió la estructura de costos o hay cuentas mal clasificadas.
- **Traza:** despliega cada periodo para ver cuenta → concepto → fórmula → resultado.
- **Valores negativos:** la empresa está bajo su punto de equilibrio; no se leen como sensibilidad.

**Ejemplo con MUNO MODA 2023** (gastos de ventas clasificados como fijos):

| Concepto | Cálculo | Resultado |
|---|---|---:|
| MC | 850,000 − 510,000 | 340,000 |
| UAII | 850,000 − 510,000 − 120,000 − 85,000 | 135,000 |
| UAI | 135,000 + 15,000 − 10,000 − 12,600 | 127,400 |
| GAO | 340,000 / 135,000 | 2.52 |
| GAF | 135,000 / 127,400 | 1.06 |
| GAT | 340,000 / 127,400 | 2.67 |

Un GAO de 2.52 significa que, si las ventas suben 1 %, la UAII sube 2.52 %.

---

## 9. Control de Inventario

Controla existencias por producto, su valor y cuándo reponer. En `#/inventario`:

1. Pulsa **Cargar ejemplo** (4 prendas de MUNO MODA, datos ficticios) o agrega un producto con su existencia inicial, costo unitario y stock mínimo.
2. En **Registrar movimiento** anota entradas (compras, devoluciones) y salidas (ventas, consumo) con fecha y concepto. Una salida que deje la existencia negativa se rechaza.
3. Pulsa **Kardex** en un producto para ver cada movimiento con su saldo, y editar o eliminar el producto.

| Concepto | Fórmula | Camisa casual |
|---|---|---:|
| Existencia final | inicial + entradas − salidas | 120 + 60 − 145 = 35 |
| Valor del inventario | existencia final × costo unitario | 35 × 350 = C$ 12,250 |
| Alerta de reposición | existencia final ≤ stock mínimo | 35 ≤ 40 → reponer 5 |

El valor total del ejemplo es C$ 78,790 y hay 2 productos por reponer. El presupuesto maestro puede tomar la existencia y el costo de un producto como inventario inicial.

---

## 10. Punto de Equilibrio y C-V-U

En `#/equilibrio` ingresa precio (P), costo variable unitario (CVu), costos fijos (CF), unidades (Q) y, si quieres, una utilidad objetivo. También puedes **Tomar de los estados**: con las unidades vendidas de un periodo, P = Ventas / Q, CVu = CV / Q y CF salen de la clasificación de `#/apalancamiento`.

**Ejemplo (una prenda en un trimestre):** P 800, CVu 520, CF 42,000, Q 250.

| Concepto | Cálculo | Resultado |
|---|---|---:|
| MCu | 800 − 520 | C$ 280 |
| RMC | 280 / 800 | 35 % |
| PE en unidades | 42,000 / 280 | 150 u |
| PE en C$ | 42,000 / 0.35 | C$ 120,000 |
| UAII | 250 × 280 − 42,000 | C$ 28,000 |
| Margen de seguridad | (250 − 150) / 250 | 40 % |
| GAO | 70,000 / 28,000 | 2.5 |

La tabla de **escenarios** cambia ±10 % el precio, el CVu, los CF o el volumen (y uno personalizado). Con volumen +10 % la UAII sube 25 %, es decir, GAO × 10 %. La gráfica muestra dónde los ingresos cortan a los costos totales.

---

## 11. Flujo de Efectivo

En `#/flujo` indica el saldo inicial (o tómalo del efectivo de un periodo del balance) y registra cada entrada o salida de efectivo en su actividad:

- **Operación:** cobros a clientes, pagos a proveedores, sueldos, intereses e impuestos.
- **Inversión:** compra o venta de activos fijos.
- **Financiamiento:** préstamos y sus abonos, aportes y dividendos.

Flujo de una actividad = entradas − salidas; variación neta = operación + inversión + financiamiento; saldo final = saldo inicial + variación neta. En el ejemplo: operación +98,000, inversión −30,000 y financiamiento −45,000 → variación +23,000; con saldo inicial 52,000 el saldo final es C$ 75,000.

Flujo toma el saldo inicial y compara el efectivo del periodo siguiente cuando el balance usa la misma moneda. Si falta el efectivo, la copia conserva el saldo inicial y la conciliación queda N/D. Un cero declarado sí puede copiarse y compararse.

---

## 12. Presupuesto Maestro

En `#/planeacion` se presupuesta una empresa comercial (un producto o línea) de 1 a 12 meses o trimestres. Abre **Supuestos** para completar el presupuesto y pulsa **Calcular y guardar**. Puedes cargar un ejemplo o tomar el efectivo, las cuentas por cobrar y las cuentas por pagar del balance. También puedes tomar el inventario inicial y el costo de un producto de Inventario.

Al tomar los saldos del balance, Planeación copia los importes disponibles en la misma moneda y conserva los valores del borrador donde el balance tiene N/D.

**Resumen** muestra cobros, pagos a proveedores y saldos al cierre del horizonte. Selecciona una tarjeta para consultar sus movimientos o vencimientos. Para los cobros y pagos, el selector de periodo cambia el detalle del panel. **Tablas completas** reúne los presupuestos y sus avisos. Cambiar entre vistas conserva las ediciones en curso. El resumen muestra las cifras guardadas hasta que pulses **Calcular y guardar**.

**Ejemplo MUNO MODA 2025:** ventas de 250, 300, 300 y 400 prendas a C$ 800 (C$ 1,000,000), UAII C$ 182,000 y utilidad neta C$ 119,000. La compra de un vehículo de C$ 120,000 en el trimestre 2 deja la caja en C$ 19,200, bajo el mínimo de C$ 40,000: se requieren **C$ 20,800 de financiamiento**. La caja cierra en C$ 122,360. La UAII del trimestre 1 (28,000) coincide con la del punto de equilibrio.

### Escenarios de Comercial Ejemplo

1. Pulsa **Cargar Comercial Ejemplo** en el resumen inicial o desde **Supuestos** si ya tienes un presupuesto calculado. **Base de capital de trabajo** carga la apertura ficticia de 2025 y los supuestos mensuales de 2026. El selector conserva los escenarios previos y muestra el presupuesto previo sin escenarios como **Presupuesto anterior**.
2. En **Supuestos**, edita las unidades y el costo de compra de cada mes. En los calendarios escribe porcentajes separados por espacios que sumen 100 %. `60 40` en el cobro de saldos iniciales cobra 60 % en enero y 40 % en febrero. `0 100` en el cobro de ventas a crédito cobra todo dos meses después de cada venta.
3. Pulsa **Calcular y guardar** para actualizar el resumen. Las tarjetas de cuentas por cobrar y por pagar muestran qué importes quedan pendientes y cuándo vencen. En **Tablas completas** puedes consultar ventas, cobros, existencias físicas, compras y pagos de todo el horizonte. Un campo vacío queda pendiente y un cero escrito se conserva como cero.
4. En **Supuestos**, pulsa **Duplicar escenario** para copiar la versión guardada y probar otra política. Elige el escenario en **Escenario activo**. Los escenarios comparten el cierre histórico y guardan supuestos independientes.
5. Guarda un respaldo desde **Reportes** para conservar los escenarios y su base. Los respaldos anteriores siguen siendo recuperables.

En **Resumen**, pulsa **Costo de ventas** o **Inventario valorizado** para consultar el importe de un mes. El costo de ventas de la tarjeta cubre el horizonte y el inventario muestra su cierre. En **Tablas completas**, la sección **Inventario valorizado y costo de ventas** presenta la apertura, las compras, el costo de ventas y el cierre de cada mes. La valoración usa el promedio ponderado mensual y muestra N/D en los importes que requieren un dato pendiente. La caja completa y los estados proforma del caso corresponden a etapas posteriores.

En **Caja por calendario**, carga La Pinolera o una variante de Halley. Puedes editar los cobros y pagos por desfase, las ventas de meses anteriores y los desembolsos por fecha. **Calcular y guardar** conserva ese calendario junto al presupuesto. La conciliación presenta por separado la necesidad de fondos y el efectivo tras los préstamos y repagos registrados.

En **Traer datos de otra sección**, selecciona el periodo o producto y abre la vista previa. Marca los campos que quieres copiar. En Planeación y C-V-U, aplica los valores al borrador y pulsa **Calcular y guardar**. Flujo indica en su panel que guarda la copia de inmediato. La procedencia te permite identificar datos que necesitan una nueva vista previa porque cambió la fuente.

---

## 13. Proforma y Reporte Integrado

La vista integrada de `#/proforma` reúne lo que ya calcularon los demás módulos.

El panel **Métodos docentes AFOD** permite comparar los dos métodos de Metroline y consultar Euro Designs, el balance de Leonard y el ER residual de Electrónicas. Las ediciones del panel son temporales y cada ejercicio conserva su propio periodo y moneda.

1. **Estado de resultados proforma.** Muestra el total del presupuesto y el último periodo real de los estados. La variación requiere un histórico anual identificado con el año (`AAAA`) y una proyección de 12 meses o 4 trimestres. Para los demás horizontes, la variación figura como N/D y la pantalla explica el motivo.
2. **Efectivo proyectado:** saldo inicial, flujo neto, saldo final y financiamiento máximo.
3. **Indicadores integrados:** liquidez, endeudamiento, ROE (DuPont), GAO, GAF y GAT, punto de equilibrio, flujo de efectivo, presupuesto e inventario, cada uno con su lectura y un enlace al módulo de origen.
4. **Alertas y decisiones sugeridas:** por ejemplo, gestionar el financiamiento del trimestre 2 o reponer los productos bajo su stock mínimo.

Si falta algún módulo, el reporte indica qué cargar. **Imprimir o guardar como PDF** sirve como evidencia para el informe.


### Consultar los cálculos del presupuesto y la Proforma

En Presupuesto Maestro, el resumen del presupuesto completo abre en **Utilidad neta presupuestada**. Puede elegir **Efectivo final antes de financiamiento**, Cobros, Pagos o saldos. El selector permite consultar **Horizonte completo** o un periodo; el detalle muestra fórmula, datos usados y resultado. Los cambios sin guardar siguen marcados y las consultas no los persisten.

En Proforma, la utilidad proyectada y UAI aparecen primero. **Desarrollo del estado de resultados proyectado** muestra los renglones completos; **Ver cálculo del presupuesto de caja** explica entradas, desembolsos, flujo y cierre. Los resultados reales proceden de los mismos datos acreditados que Estados/Razones. Una entrada requerida ausente produce N/D; no se completa con una tasa o un cero supuesto.

El IR del modelo actual se devenga por periodo y queda por pagar. El financiamiento requerido se informa, todavía no se suma al efectivo. El escenario de Comercial Ejemplo tiene alcance parcial de capital de trabajo: sus cobros/pagos no representan una caja completa y su ER/caja siguen pendientes. Los ejercicios de porcentaje de ventas, fijo-variable, dividendos y balance crítico requieren las capacidades señaladas en la revisión docente; esta vista no los convierte automáticamente en proyecciones resueltas.

### Cuentas opcionales y resultados N/D

Estados y AH/AV muestran las cuentas accesorias sin movimiento en **Ver cuentas opcionales en cero**. Abra el desplegable para consultarlas; en el editor también puede modificarlas. Los datos y los archivos descargados conservan sus cuentas. Un cero no acredita que la cuenta estuviera ausente del ejercicio. Si tiene movimiento en otro periodo, se mantiene visible en el editor y AV; AH y la vista multiperiodo conservan el movimiento entre sus columnas comparadas.

Los subtotales y las razones siguen visibles aunque den cero o N/D. AH presenta el balance y el estado de resultados en tablas separadas. En Razones, **Por qué hay resultados N/D** identifica las cuentas/datos y los indicadores afectados. Declare en Estados la composición de otros ingresos y los datos de crédito cuando disponga de ellos; no introduzca cero para completar datos que desconoce. El primer periodo conserva las restricciones del modo normal del motor.

### Alcance del ejercicio y totales suficientes

En Estados, dentro de **Periodo de trabajo → Alcance del ejercicio**, indique por separado si Activos, Pasivos, Patrimonio y ER están completos. **Completo** significa que se incluyeron todas las partidas de ese grupo y las no listadas no aplican; no lo elija para ocultar un dato desconocido. Si el archivo está incompleto, use **Parcial** o **Sin confirmar**. La declaración se guarda por periodo y no añade cuentas en cero. Una celda vacía sigue N/D.

Los archivos guardados anteriormente conservan sus importes y abren sin confirmar el alcance. Para revisar el ejemplo actualizado, use **Cargar datos → Nuevo conjunto o ejemplo → Cargar ejemplo**, revise el borrador y guarde. Este ejemplo didáctico propio ya declara sus grupos completos; no sustituye ni convierte automáticamente los datos que usted tenía guardados.

Si el ejercicio proporciona AC y PC totales identificados, la razón corriente se calcula con ellos sin pedir todo el desglose. Un total válido puede dar un resultado disponible aunque no pueda comprobarse su detalle: consulte **Resultados con advertencias** en Razones. Sin ventas a crédito/pagos reales, las cinco razones dependientes siguen N/D. El primer periodo de una serie conserva su modo normal; con un único periodo se usa cierre conforme a la convención existente.

### Bartlett con premisas de clase y comprobaciones corregidas

Al tomar saldos de Estados hacia Flujo o Planeación, ambas secciones deben usar la misma moneda. Si difieren, la aplicación avisa y conserva los saldos y las ediciones pendientes del destino. En AV, el activo reportado puede servir de base aunque falte depreciación. En ese caso, la fila muestra «Desglose no comprobable».

En el selector de Estados o Inicio empresa, **Bartlett · razones de clase** añade las premisas de las diapositivas 14–15 solo para 2012: todas las ventas a crédito y compras estimadas como 70 % del costo. Revise la procedencia, cargue y guarde el borrador. Los suplementos se muestran en la vista previa de Estados. Los resultados son 7.08 veces / 51.53 días para cobro, 4.48 veces / 81.41 días para pago y 21.60 días de ciclo. El ejemplo **Bartlett Company** conserva los datos históricos sin esas suposiciones, por lo que puede mostrar N/D en crédito. Una base de compras declarada permite calcular sin pagos a proveedores; no es un pago de caja ni una prueba de compras reales.

Inicio, Mercado y EFE ahora conservan la UN disponible del mismo ER. Baker 2011 no tiene ER: sus utilidades y UPA son N/D, aunque su balance siga disponible. Las ventas netas no se presentan como ventas brutas cero. En Práctico 2 la UN 77000 sí está disponible; el EFE explica que PPE neto requiere desglose y mantiene N/D en los flujos que no puede separar. Para introducir cobros/pagos conocidos use el módulo Flujo de Efectivo.

### Cambiar entre los casos AGRI-CORP

En Inicio abra **Ejemplos de empresa**, seleccione el histórico real o la unidad de arroz simulada y pulse **Cargar ejemplo**. Revise la confirmación: reemplaza los siete módulos de empresa y conserva las finanzas personales. Puede volver a abrir este panel después de cargar, sin borrar datos del navegador. Cancelar no guarda. Si falta espacio de almacenamiento, se conserva el caso anterior completo; libere espacio y vuelva a intentar.

En Estados puede cargar solo el documento como borrador y guardarlo tras revisarlo. El histórico y la unidad ficticia nunca se suman. El presupuesto personal del dossier se ofrece por separado como ejemplo mensual; no reemplaza un documento estudiantil ya cargado.

Análisis → EFE distingue el flujo **reportado** del real, el **simulado** trimestral y la estimación desde balances de los demás ejemplos. La fuente, el intervalo y la comprobación aparecen junto a sus cálculos. La apertura de junio del caso simulado está declarada en el dossier, sin un BG de junio cargado. Inicio, Proforma y Reportes utilizan ese mismo intervalo. En Flujo se muestra una copia editable de los movimientos; cambiarla no cambia el documento de Estados. Si edita los estados, el EFE suministrado queda N/D con la causa; revise y vuelva a importar una versión coherente del documento, sin introducir ceros para ocultar faltantes.

## Ejemplos de cada integrante para la defensa

En Presupuesto personal o Activos del hogar, abre «Ejemplos y datos», elige el nombre del integrante y pulsa «Cargar ejemplo seleccionado». La confirmación reemplaza solo ese módulo. Las hojas conservan sus nombres y columnas; desplaza la tabla horizontalmente para verlas completas. Selecciona una celda para ver su fórmula o editar el dato. Las fórmulas no se reemplazan al editar una entrada.

En los registros Excel puedes registrar movimientos o añadir activos con las columnas de ese archivo; al seleccionar una celda del registro también puedes eliminar la fila completa. El Word de Gabriel permite editar los datos de sus tablas y consultar «Cálculos de la app». Descarga un respaldo antes de reemplazar un caso. Las observaciones explican los ajustes o contradicciones presentes en la fuente. Los ejemplos anteriores siguen en el mismo selector.
