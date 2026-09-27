# Documentación API — GFO Toolkit

Referencia completa de las funciones públicas de los módulos utilitarios.

---

## calculate.js

Fórmulas financieras puras. Todas las funciones reciben números y retornan números (o objetos con resultados). Ninguna depende de DOM ni de estado global.

Cuando falta un dato o el denominador es 0, las funciones agregadas después de la versión 1.0 devuelven `null` (la interfaz muestra "N/D"). Las funciones originales devuelven 0 en ese caso. Los plazos en días usan `DIAS_ANIO = 365`. El catálogo resumido está en `docs/contexto/dominio-financiero.md`.

### Constante y funciones base

#### `DIAS_ANIO`
Días del año para plazos, edades y ciclos: `365`. Úsala en lugar de escribir el número.

#### `saldoPromedio(saldoInicial, saldoFinal)`
Saldo promedio de un periodo, para rotaciones, ROA, ROE y DuPont.

- **Parámetros**: `saldoInicial` (number) — saldo del periodo anterior; `saldoFinal` (number) — saldo del periodo actual
- **Retorno**: `number` — si falta uno de los dos, devuelve el otro; si faltan ambos, 0
- **Fórmula**: `(saldoInicial + saldoFinal) / 2`
- **Ejemplo**: `saldoPromedio(10000, 20000)` → `15000`; `saldoPromedio(undefined, 20000)` → `20000`

#### `variacion(valorFinal, valorInicial)`
Variación absoluta entre dos saldos (usada en el EFE indirecto).

- **Retorno**: `number`
- **Fórmula**: `valorFinal - valorInicial`
- **Ejemplo**: `variacion(25000, 20000)` → `5000`

### Funciones de Análisis Horizontal (AH)

#### `ah(delta, valorT1)`
Calcula el porcentaje de variación horizontal.

- **Parámetros**: `delta` (number) — variación absoluta; `valorT1` (number) — valor del periodo anterior
- **Retorno**: `number | null` — porcentaje de variación; `null` si `valorT1` es 0 o falta
- **Fórmula**: `delta / |valorT1|`
- **Ejemplo**: `ah(2000, 10000)` → `0.2` (20%); `ah(5, 0)` → `null`

#### `ahDelta(valorT2, valorT1)`
Calcula la variación absoluta entre dos periodos.

- **Parámetros**: `valorT2` (number) — valor actual; `valorT1` (number) — valor anterior
- **Retorno**: `number` — diferencia absoluta
- **Fórmula**: `valorT2 - valorT1`
- **Ejemplo**: `ahDelta(12000, 10000)` → `2000`

#### `ahPctDelta(valorT2, valorT1)`
Calcula la variación porcentual horizontal completa.

- **Parámetros**: `valorT2` (number) — valor actual; `valorT1` (number) — valor anterior
- **Retorno**: `number | null` — porcentaje decimal (ej: 0.20 = 20%); `null` si `valorT1` es 0
- **Fórmula**: `(valorT2 - valorT1) / |valorT1|`
- **Ejemplo**: `ahPctDelta(12000, 10000)` → `0.2`

---

### Función de Análisis Vertical (AV)

#### `av(cuenta, base)`
Calcula el porcentaje que representa una cuenta sobre una base.

- **Parámetros**: `cuenta` (number) — monto de la cuenta; `base` (number) — base de comparación (total activo, ventas, etc.)
- **Retorno**: `number` — proporción decimal
- **Fórmula**: `cuenta / base`
- **Ejemplo**: `av(5000, 20000)` → `0.25` (25%)

---

### Funciones de Razones Financieras

#### `ratioCorriente(activosCorrientes, pasivosCorrientes)`
Ratio de liquidez corriente.

- **Parámetros**: `activosCorrientes` (number); `pasivosCorrientes` (number)
- **Retorno**: `number` — veces que los activos cubren los pasivos
- **Fórmula**: `AC / PC`
- **Ejemplo**: `ratioCorriente(30000, 15000)` → `2` (el activo cubre 2× el pasivo)

#### `ratioRapido(activosCorrientes, inventario, pasivosCorrientes)`
Ratio de liquidez rápida (prueba ácida).

- **Parámetros**: `activosCorrientes` (number); `inventario` (number); `pasivosCorrientes` (number)
- **Retorno**: `number`
- **Fórmula**: `(AC - Inventario) / PC`
- **Ejemplo**: `ratioRapido(30000, 8000, 15000)` → `1.47`

#### `rotacionInventario(costoVentas, inventarioPromedio)`
Mide cuántas veces se renueva el inventario.

- **Parámetros**: `costoVentas` (number); `inventarioPromedio` (number)
- **Retorno**: `number` — vueltas por periodo
- **Fórmula**: `CostoVentas / InventarioPromedio`
- **Ejemplo**: `rotacionInventario(60000, 10000)` → `6`

#### `rotacionCxC(ventas, cxCprom)`
Mide la eficiencia en la cobranza.

- **Parámetros**: `ventas` (number); `cxCprom` (number) — cuentas por cobrar promedio
- **Retorno**: `number` — vueltas por periodo
- **Fórmula**: `Ventas / CxCprom`
- **Ejemplo**: `rotacionCxC(120000, 15000)` → `8`

#### `plazoCobro(rotCxC)`
Días promedio para cobrar.

- **Parámetros**: `rotCxC` (number) — rotación de cuentas por cobrar
- **Retorno**: `number` — días
- **Fórmula**: `DIAS_ANIO / RotCxC`, con `DIAS_ANIO = 365`
- **Ejemplo**: `plazoCobro(8)` → `45.625` días

#### `endeudamiento(pasivoTotal, totalActivo)`
Nivel de endeudamiento sobre activos.

- **Parámetros**: `pasivoTotal` (number); `totalActivo` (number)
- **Retorno**: `number` — proporción decimal
- **Fórmula**: `PasivoTotal / TotalActivo`
- **Ejemplo**: `endeudamiento(80000, 200000)` → `0.4` (40%)

#### `margenNeto(utilidadNeta, ventas)`
Porcentaje de utilidad neta sobre ventas.

- **Parámetros**: `utilidadNeta` (number); `ventas` (number)
- **Retorno**: `number` — proporción decimal
- **Fórmula**: `UtilidadNeta / Ventas`
- **Ejemplo**: `margenNeto(12000, 100000)` → `0.12` (12%)

#### `roa(utilidadNeta, totalActivo)`
Retorno sobre activos totales.

- **Parámetros**: `utilidadNeta` (number); `totalActivo` (number)
- **Retorno**: `number`
- **Fórmula**: `UtilidadNeta / TotalActivo`
- **Ejemplo**: `roa(12000, 200000)` → `0.06` (6%)

---

### Razones adicionales

Todas devuelven `null` (N/D) si el denominador es 0 o falta.

#### `pruebaDefensiva(efectivo, pasivosCorrientes)`
Liquidez inmediata: cuánto del pasivo corriente cubre el efectivo.

- **Retorno**: `number | null` — `null` si `pasivosCorrientes` es 0
- **Fórmula**: `Efectivo / PC`
- **Ejemplo**: `pruebaDefensiva(45000, 160000)` → `0.28125`

#### `edadInventario(rotInv)`
Días promedio que el inventario tarda en venderse.

- **Parámetros**: `rotInv` (number) — rotación de inventario
- **Retorno**: `number | null` — días
- **Fórmula**: `DIAS_ANIO / RotInv`
- **Ejemplo**: `edadInventario(6)` → `60.83` días

#### `rotacionCxP(costoVentas, cxPprom)`
Veces que se pagan las cuentas por pagar en el periodo. El costo de ventas aproxima las compras. Reemplaza a `rotacionPasivos`.

- **Parámetros**: `costoVentas` (number); `cxPprom` (number) — cuentas por pagar promedio
- **Retorno**: `number | null` — vueltas por periodo
- **Fórmula**: `CostoVentas / CxPprom`
- **Ejemplo**: `rotacionCxP(510000, 85000)` → `6`

#### `plazoPago(rotCxP)`
Días promedio para pagar a proveedores.

- **Parámetros**: `rotCxP` (number) — rotación de cuentas por pagar
- **Retorno**: `number | null` — días
- **Fórmula**: `DIAS_ANIO / RotCxP`
- **Ejemplo**: `plazoPago(6)` → `60.83` días

#### `cicloConversion(plazoCobroDias, rotInv, rotCxP)`
Ciclo de conversión de efectivo: días entre el pago a proveedores y el cobro a clientes.

- **Parámetros**: `plazoCobroDias` (number) — plazo de cobro en días; `rotInv` (number); `rotCxP` (number)
- **Retorno**: `number | null` — días; `null` si falta alguna rotación
- **Fórmula**: `plazoCobroDias + edadInventario(rotInv) - plazoPago(rotCxP)`
- **Ejemplo**: `cicloConversion(36.5, 4, 8)` → `82.125` días (36.5 + 91.25 − 45.625)

#### `rotacionActivos(ventas, activoTotalProm)`
Ventas generadas por cada unidad de activo total.

- **Retorno**: `number | null`
- **Fórmula**: `Ventas / ActivoTotalProm`
- **Ejemplo**: `rotacionActivos(850000, 400000)` → `2.125`

#### `rotacionActivosFijos(ventas, activosFijosNetos)`
Ventas generadas por cada unidad de activo fijo neto.

- **Retorno**: `number | null`
- **Fórmula**: `Ventas / ActivoFijoNeto`
- **Ejemplo**: `rotacionActivosFijos(850000, 400000)` → `2.125`

#### `rotacionCapitalTrabajo(ventas, capitalNetoTrabajoValor)`
Ventas generadas por cada unidad de capital neto de trabajo.

- **Retorno**: `number | null`
- **Fórmula**: `Ventas / CNT`
- **Ejemplo**: `rotacionCapitalTrabajo(850000, 170000)` → `5`

#### `deudaPatrimonio(pasivoTotal, patrimonio)`
Deuda por cada unidad de patrimonio.

- **Retorno**: `number | null`
- **Fórmula**: `PasivoTotal / Patrimonio`
- **Ejemplo**: `deudaPatrimonio(300000, 200000)` → `1.5`

#### `apalancamiento(activoTotalProm, patrimonioProm)`
Multiplicador de capital (el EM de DuPont). No es el GAO, el GAF ni el GAT: esos grados usarán funciones con nombre propio.

- **Retorno**: `number | null`
- **Fórmula**: `ActivoTotalProm / PatrimonioProm`
- **Ejemplo**: `apalancamiento(400000, 200000)` → `2`

#### `solvencia(activoTotal, pasivoTotal)`
Activos por cada unidad de pasivo.

- **Retorno**: `number | null`
- **Fórmula**: `ActivoTotal / PasivoTotal`
- **Ejemplo**: `solvencia(400000, 160000)` → `2.5`

#### `coberturaIntereses(utilidadOperativa, intereses)`
Veces que la utilidad operativa (UAII) cubre los intereses.

- **Retorno**: `number | null` — `null` si no hay intereses
- **Fórmula**: `UAII / Intereses`
- **Ejemplo**: `coberturaIntereses(500, 100)` → `5`

#### `margenBruto(utilidadBruta, ventas)`
- **Retorno**: `number | null` — proporción decimal
- **Fórmula**: `UtilidadBruta / Ventas`
- **Ejemplo**: `margenBruto(200, 500)` → `0.4` (40%)

#### `margenOperativo(utilidadBruta, gastosAdmin, gastosVentas, ventas)`
- **Retorno**: `number | null` — proporción decimal
- **Fórmula**: `(UtilidadBruta - GastosAdmin - GastosVentas) / Ventas`
- **Ejemplo**: `margenOperativo(200, 40, 30, 500)` → `0.26` (26%)

#### `roe(utilidadNeta, patrimonioProm)`
Retorno sobre el patrimonio.

- **Retorno**: `number | null`
- **Fórmula**: `UtilidadNeta / PatrimonioProm`
- **Ejemplo**: `roe(50000, 200000)` → `0.25` (25%)

---

### Modelo DuPont

#### `dupont(UN, ventas, activoTotalProm, patrimonio)`
Modelo DuPont de 3 pasos.

- **Parámetros**: `UN` (number) — utilidad neta; `ventas` (number); `activoTotalProm` (number) — activo total promedio; `patrimonio` (number)
- **Retorno**: `object` con `{ PM, AT, EM, ROE }`
  - `PM` — Margen Neto = UN / Ventas
  - `AT` — Rotación de Activos = Ventas / ActivoTotalProm
  - `EM` — Apalancamiento = ActivoTotalProm / Patrimonio
  - `ROE` — Retorno sobre Patrimonio = PM × AT × EM
- **Ejemplo**: `dupont(12000, 100000, 200000, 120000)` → `{ PM: 0.12, AT: 0.5, EM: 1.67, ROE: 0.1 }`

---

### Capital Neto

#### `capitalNetoTrabajo(activosCorrientes, pasivosCorrientes)`
Capital neto de trabajo.

- **Parámetros**: `activosCorrientes` (number); `pasivosCorrientes` (number)
- **Retorno**: `number`
- **Fórmula**: `AC - PC`
- **Ejemplo**: `capitalNetoTrabajo(30000, 18000)` → `12000`

#### `capitalNetoOperativo(activosCorrientesOps, pasivosCorrientesOps)`
Capital neto operativo.

- **Parámetros**: `activosCorrientesOps` (number); `pasivosCorrientesOps` (number)
- **Retorno**: `number`
- **Fórmula**: `AC operativos - PC operativos`
- **Ejemplo**: `capitalNetoOperativo(25000, 16000)` → `9000`

---

### EOAF (Origen y Aplicación de Fondos)

#### `eoaf(cuenta, cambio, tipo)`
Clasifica automáticamente un movimiento como Origen o Aplicación de Fondos.

- **Parámetros**: `cuenta` (string) — nombre de la cuenta; `cambio` (number) — variación absoluta; `tipo` (string) — `'activo'` o `'pasivo'`
- **Retorno**: `object | null` con `{ cuenta, cambio, tipo, clasificacion, monto }`
  - Si es activo y aumenta → `'Aplicacion'`; si disminuye → `'Origen'`
  - Si es pasivo/patrimonio y aumenta → `'Origen'`; si disminuye → `'Aplicacion'`
- **Ejemplo**: `eoaf('Inventario', 5000, 'activo')` → `{ cuenta: 'Inventario', cambio: 5000, tipo: 'activo', clasificacion: 'Aplicacion', monto: 5000 }`

---

### Flujo de Efectivo

#### `efeIndirecto(utilidadNeta, ajustes)`
Calcula el efectivo de operaciones por método indirecto.

- **Parámetros**: `utilidadNeta` (number); `ajustes` (number[]) — array de ajustes no efectivos
- **Retorno**: `number` — efectivo neto de operaciones
- **Fórmula**: `UtilidadNeta + Σ(ajustes)`
- **Ejemplo**: `efeIndirecto(12000, [3000, -1000, 2000])` → `16000`

---

### Depreciación

#### `depAnualLineaRecta(costoOriginal, valorResidual, vidaUtil)`
Depreciación anual por método de línea recta.

- **Parámetros**: `costoOriginal` (number); `valorResidual` (number); `vidaUtil` (number) — en años
- **Retorno**: `number` — depreciación anual
- **Fórmula**: `(CostoOriginal - ValorResidual) / VidaUtil`
- **Ejemplo**: `depAnualLineaRecta(18000, 2400, 5)` → `3120`

#### `depAcumulada(depAnual, aniosConsumidos, vidaUtil)`
Depreciación acumulada con tope de vida útil.

- **Parámetros**: `depAnual` (number); `aniosConsumidos` (number); `vidaUtil` (number)
- **Retorno**: `number`
- **Fórmula**: `depAnual × min(aniosConsumidos, vidaUtil)`
- **Ejemplo**: `depAcumulada(3120, 3, 5)` → `9360`

#### `valorEnLibros(costoOriginal, depAcum)`
Valor contable de un activo.

- **Parámetros**: `costoOriginal` (number); `depAcum` (number) — depreciación acumulada
- **Retorno**: `number`
- **Fórmula**: `CostoOriginal - DepAcumulada`
- **Ejemplo**: `valorEnLibros(18000, 9360)` → `8640`

---

### Presupuesto

#### `ahorroMensual(metaAhorro, mesesDisponibles)`
Calcula cuánto ahorrar cada mes para alcanzar una meta.

- **Parámetros**: `metaAhorro` (number); `mesesDisponibles` (number)
- **Retorno**: `number` — ahorro mensual requerido
- **Fórmula**: `MetaAhorro / MesesDisponibles`
- **Ejemplo**: `ahorroMensual(3000, 12)` → `250`

#### `saldoSemanal(ingreso, gastos, ahorro, reserva)`
Calcula el saldo disponible al final de la semana.

- **Parámetros**: `ingreso` (number); `gastos` (number); `ahorro` (number); `reserva` (number, opcional)
- **Retorno**: `number`
- **Fórmula**: `Ingreso - Gastos - Ahorro - Reserva`
- **Ejemplo**: `saldoSemanal(3000, 2200, 250, 100)` → `450`

---

## format.js

Funciones de formateo para presentación de datos. Manejan valores nulos e indefinidos de forma segura.

#### `formatCurrency(value, currency = 'C$')`
Formatea un número como moneda.

- **Parámetros**: `value` (number) — valor numérico; `currency` (string) — prefijo de moneda
- **Retorno**: `string` — valor formateado con separadores de miles y 2 decimales
- **Ejemplo**: `formatCurrency(12000.5)` → `"C$ 12,000.50"`

#### `formatNumber(value, decimals = 2)`
Formatea un número con separadores de miles.

- **Parámetros**: `value` (number); `decimals` (number) — decimales a mostrar
- **Retorno**: `string`
- **Ejemplo**: `formatNumber(1234567, 0)` → `"1,234,567"`

#### `formatPercent(value, decimals = 2)`
Formatea un decimal como porcentaje (multiplica por 100).

- **Parámetros**: `value` (number) — proporción decimal; `decimals` (number) — decimales
- **Retorno**: `string` — terminado en `%`
- **Ejemplo**: `formatPercent(0.1234)` → `"12.34%"`

#### `formatPercentRaw(value, decimals = 2)`
Formatea un valor ya en porcentaje (no multiplica por 100).

- **Parámetros**: `value` (number) — valor ya en porcentaje; `decimals` (number) — decimales
- **Retorno**: `string` — terminado en `%`
- **Ejemplo**: `formatPercentRaw(12.34)` → `"12.34%"`

#### `parseNumber(str)`
Convierte una cadena con formato a número limpio.

- **Parámetros**: `str` (string | number) — entrada a parsear
- **Retorno**: `number` — valor numérico limpio, o 0 si no es válido
- **Ejemplo**: `parseNumber("C$ 12,000.50")` → `12000.5`

---

## html.js

#### `escapeHTML(value)`
Escapa `&`, `<`, `>`, `"` y `'` para insertar texto de forma segura con `innerHTML`. Úsala con todo texto que venga del usuario o de un archivo importado.

- **Parámetros**: `value` (any) — `null` y `undefined` se convierten en cadena vacía
- **Retorno**: `string`
- **Ejemplo**: `escapeHTML('<b>Caja & Bancos</b>')` → `"&lt;b&gt;Caja &amp; Bancos&lt;/b&gt;"`

---

## export.js

Funciones de exportación e importación de datos. Manejan descarga de archivos y lectura desde el navegador.

#### `exportJSON(data, filename = 'gfo-export.json')`
Exporta un objeto como archivo JSON descargable.

- **Parámetros**: `data` (any) — datos a serializar; `filename` (string) — nombre del archivo
- **Retorno**: `void` — descarga el archivo automáticamente
- **Ejemplo**: `exportJSON({ activos: [...] }, "mi-inventario.json")`

#### `exportCSV(rows, headers, filename = 'gfo-export.csv')`
Exporta filas de datos como archivo CSV descargable.

- **Parámetros**: `rows` (Array<Array>) — filas de datos; `headers` (Array<string>) — encabezados de columna; `filename` (string) — nombre del archivo
- **Retorno**: `void` — descarga el archivo con encoding UTF-8 BOM
- **Ejemplo**: `exportCSV([["Laptop", "18000"], ["Mouse", "500"]], ["Artículo", "Precio"], "inventario.csv")`

#### `exportHTML(htmlContent, filename = 'gfo-report.html')`
Genera y descarga un reporte HTML completo con estilos integrados.

- **Parámetros**: `htmlContent` (string) — contenido HTML del reporte; `filename` (string) — nombre del archivo
- **Retorno**: `void` — descarga el archivo HTML con doctype, estilos y footer
- **Ejemplo**: `exportHTML("<h1>Reporte Mensual</h1><table>...</table>", "reporte-enero.html")`

#### `importJSON(file)`
Importa y parsea un archivo JSON seleccionado por el usuario.

- **Parámetros**: `file` (File) — archivo JSON seleccionado
- **Retorno**: `Promise<object>` — datos parseados
- **Ejemplo**: `const data = await importJSON(fileInput.files[0])`
- **Errores**: Rechaza con `Error('Archivo JSON inválido')` o `Error('Error al leer archivo')`
