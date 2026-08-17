# Documentación API — GFO Toolkit

Referencia completa de las funciones públicas de los módulos utilitarios.

---

## calculate.js

Fórmulas financieras puras. Todas las funciones reciben números y retornan números (o objetos con resultados). Ninguna depende de DOM ni de estado global.

### Funciones de Análisis Horizontal (AH)

#### `ah(delta, valorT1)`
Calcula el porcentaje de variación horizontal.

- **Parámetros**: `delta` (number) — variación absoluta; `valorT1` (number) — valor del periodo anterior
- **Retorno**: `number` — porcentaje de variación
- **Fórmula**: `delta / |valorT1|`
- **Ejemplo**: `ah(2000, 10000)` → `0.2` (20%)

#### `ahDelta(valorT2, valorT1)`
Calcula la variación absoluta entre dos periodos.

- **Parámetros**: `valorT2` (number) — valor actual; `valorT1` (number) — valor anterior
- **Retorno**: `number` — diferencia absoluta
- **Fórmula**: `valorT2 - valorT1`
- **Ejemplo**: `ahDelta(12000, 10000)` → `2000`

#### `ahPctDelta(valorT2, valorT1)`
Calcula la variación porcentual horizontal completa.

- **Parámetros**: `valorT2` (number) — valor actual; `valorT1` (number) — valor anterior
- **Retorno**: `number` — porcentaje decimal (ej: 0.20 = 20%)
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
- **Fórmula**: `360 / RotCxC`
- **Ejemplo**: `plazoCobro(8)` → `45` días

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
