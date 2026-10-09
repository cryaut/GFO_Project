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

Todas devuelven `null` (N/D) si falta el dato o el denominador es 0; la interfaz muestra "N/D" y no genera hallazgos.

#### `ratioCorriente(activosCorrientes, pasivosCorrientes)`
Ratio de liquidez corriente.

- **Parámetros**: `activosCorrientes` (number); `pasivosCorrientes` (number)
- **Retorno**: `number | null` — `null` si `pasivosCorrientes` es 0
- **Fórmula**: `AC / PC`
- **Ejemplo**: `ratioCorriente(30000, 15000)` → `2` (el activo cubre 2× el pasivo)

#### `ratioRapido(activosCorrientes, inventario, pasivosCorrientes)`
Ratio de liquidez rápida (prueba ácida).

- **Parámetros**: `activosCorrientes` (number); `inventario` (number); `pasivosCorrientes` (number)
- **Retorno**: `number | null` — `null` si `pasivosCorrientes` es 0
- **Fórmula**: `(AC - Inventario) / PC`
- **Ejemplo**: `ratioRapido(30000, 8000, 15000)` → `1.47`

#### `rotacionInventario(costoVentas, inventarioPromedio)`
Mide cuántas veces se renueva el inventario.

- **Parámetros**: `costoVentas` (number); `inventarioPromedio` (number)
- **Retorno**: `number | null` — vueltas por periodo; `null` si falta el inventario promedio
- **Fórmula**: `CostoVentas / InventarioPromedio`
- **Ejemplo**: `rotacionInventario(60000, 10000)` → `6`

#### `rotacionCxC(ventasACredito, cxCprom)`
Mide la eficiencia en la cobranza. Idealmente usa ventas a crédito; como el modelo de datos no las separa, Análisis pasa las ventas totales, igual que el plazo de cobro de Gitman (CxC / ventas diarias).

- **Parámetros**: `ventasACredito` (number | null) — ventas a crédito o, si no se conocen, las ventas totales; `cxCprom` (number) — cuentas por cobrar promedio
- **Retorno**: `number | null` — vueltas por periodo; `null` si faltan las ventas o el promedio es 0
- **Fórmula**: `VentasACredito / CxCprom`
- **Ejemplo**: `rotacionCxC(120000, 15000)` → `8`

#### `plazoCobro(rotCxC)`
Días promedio para cobrar.

- **Parámetros**: `rotCxC` (number) — rotación de cuentas por cobrar
- **Retorno**: `number | null` — días; `null` si `rotCxC` es 0 o falta
- **Fórmula**: `DIAS_ANIO / RotCxC`, con `DIAS_ANIO = 365`
- **Ejemplo**: `plazoCobro(8)` → `45.625` días

#### `endeudamiento(pasivoTotal, totalActivo)`
Nivel de endeudamiento sobre activos.

- **Parámetros**: `pasivoTotal` (number); `totalActivo` (number)
- **Retorno**: `number | null` — proporción decimal; `null` si `totalActivo` es 0
- **Fórmula**: `PasivoTotal / TotalActivo`
- **Ejemplo**: `endeudamiento(80000, 200000)` → `0.4` (40%)

#### `margenNeto(utilidadNeta, ventas)`
Porcentaje de utilidad neta sobre ventas.

- **Parámetros**: `utilidadNeta` (number | null); `ventas` (number)
- **Retorno**: `number | null` — proporción decimal; `null` si `ventas` es 0 o falta la utilidad neta
- **Fórmula**: `UtilidadNeta / Ventas`
- **Ejemplo**: `margenNeto(12000, 100000)` → `0.12` (12%)

#### `roa(utilidadNeta, totalActivo)`
Retorno sobre activos totales.

- **Parámetros**: `utilidadNeta` (number | null); `totalActivo` (number)
- **Retorno**: `number | null`; `null` si `totalActivo` es 0 o falta la utilidad neta
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

#### `rotacionCxP(compras, cxPprom)`
Veces que se pagan las cuentas por pagar en el periodo. Reemplaza a `rotacionPasivos`. El llamador calcula `Compras = Costo de Ventas + Inventario Final − Inventario Inicial`; sin inventario comparable se aproxima con el costo de ventas (Análisis lo etiqueta "aprox.").

- **Parámetros**: `compras` (number | null); `cxPprom` (number) — cuentas por pagar promedio
- **Retorno**: `number | null` — vueltas por periodo; `null` si falta `compras` o el promedio es 0
- **Fórmula**: `Compras / CxPprom`
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
- **Retorno**: `number | null` — días; `null` si falta el plazo de cobro o alguna rotación
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
Multiplicador de capital (el EM de DuPont). No es el GAO, el GAF ni el GAT: esos grados son `gao`, `gaf` y `gat` (sección Apalancamiento).

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

### Apalancamiento (GAO, GAF y GAT)

Fórmulas y casos especiales en `docs/planificacion/apalancamiento/01-formulas-apalancamiento.md`. Devuelven `null` si falta un dato (`null`, `undefined`, `NaN` o un valor que no es número) o si el denominador es ≈ 0 (menos de medio centavo). Los grados negativos se devuelven tal cual: significan que la empresa está bajo su punto de equilibrio y la interfaz lo advierte.

#### `TASA_IR_DEFECTO`
Tasa de impuesto por defecto: `0.30`, la alícuota general del IR. Se usa cuando la tasa efectiva no tiene sentido.

#### `tasaEfectiva(ir, uai)`
Tasa efectiva de impuesto.

- **Parámetros**: `ir` (number | null) — impuesto sobre la renta del periodo; `uai` (number) — utilidad antes de impuestos
- **Retorno**: `number | null` — `null` si falta un dato, la UAI es ≤ 0 o el resultado queda fuera de [0, 1)
- **Fórmula**: `IR / UAI`
- **Ejemplo**: `tasaEfectiva(30000, 100000)` → `0.3`; `tasaEfectiva(30000, 0)` → `null`

#### `tasaImpuesto(ir, uai, tasaDefecto = TASA_IR_DEFECTO)`
Tasa T para el GAF: la efectiva si existe; si no, la tasa por defecto.

- **Parámetros**: `ir` (number | null) — `null` si el periodo no trae cuenta de impuestos; `0` es un IR informado; `uai` (number); `tasaDefecto` (number)
- **Retorno**: `number | null` — `null` si no hay tasa efectiva y `tasaDefecto` está fuera de [0, 1)
- **Ejemplo**: `tasaImpuesto(30000, 100000)` → `0.3`; `tasaImpuesto(null, 100000)` → `0.3`; `tasaImpuesto(0, 100000)` → `0`

#### `denominadorGaf(uai, dap = 0, t = null)`
Denominador del GAF y del GAT. Con DAP = 0 es la UAI y `t` no se valida.

- **Parámetros**: `uai` (number); `dap` (number) — dividendos de acciones preferentes, ≥ 0; `t` (number) — tasa en [0, 1), necesaria si DAP > 0
- **Retorno**: `number | null` — `null` si falta la UAI, DAP < 0 o DAP > 0 con T inválida
- **Fórmula**: `UAI - DAP / (1 - T)`
- **Ejemplo**: `denominadorGaf(100000, 7000, 0.3)` → `90000`; `denominadorGaf(100000)` → `100000`

#### `gao(mc, uaii)`
Grado de apalancamiento operativo estructural.

- **Parámetros**: `mc` (number) — margen de contribución (Ventas − CV); `uaii` (number)
- **Retorno**: `number | null` — `null` si falta un dato o la UAII es ≈ 0
- **Fórmula**: `MC / UAII`
- **Ejemplo**: `gao(400000, 150000)` → `2.6667`; `gao(160000, -40000)` → `-4`

#### `gaf(uaii, uai, dap = 0, t = null)`
Grado de apalancamiento financiero estructural. Usa la UAI, que incluye otros ingresos y otros gastos (D-007 en `docs/decisiones.md`).

- **Parámetros**: `uaii` (number); `uai` (number); `dap` (number); `t` (number)
- **Retorno**: `number | null` — `null` si falta un dato o `denominadorGaf` es `null` o ≈ 0
- **Fórmula**: `UAII / (UAI - DAP / (1 - T))`
- **Ejemplo**: `gaf(150000, 100000, 7000, 0.3)` → `1.6667`; `gaf(135000, 140000)` → `0.9643`

#### `gat(mc, uai, dap = 0, t = null)`
Grado de apalancamiento total estructural.

- **Retorno**: `number | null` — mismos casos N/D que `gaf`
- **Fórmula**: `MC / (UAI - DAP / (1 - T))` = GAO × GAF
- **Ejemplo**: `gat(400000, 100000, 7000, 0.3)` → `4.4444`

#### `gaoVariacion(ventasBase, ventas, uaiiBase, uaii)`
GAO por variación entre un periodo base y el siguiente. Primero va el periodo base.

- **Retorno**: `number | null` — `null` si falta un dato, una base es ≤ 0 o las ventas no cambiaron
- **Fórmula**: `%ΔUAII / %ΔVentas`, con `%ΔX = (X − Xbase) / Xbase`
- **Ejemplo**: `gaoVariacion(1000000, 1100000, 150000, 190000)` → `2.6667`

#### `gafVariacion(uaiiBase, uaii, udacBase, udac)`
GAF por variación. UDAC es la utilidad disponible para accionistas comunes (UN − DAP); su variación equivale a la de la UPA si el número de acciones no cambia.

- **Retorno**: `number | null` — `null` si falta un dato, una base es ≤ 0 o la UAII no cambió
- **Fórmula**: `%ΔUDAC / %ΔUAII`
- **Ejemplo**: `gafVariacion(150000, 190000, 63000, 91000)` → `1.6667`

#### `gatVariacion(ventasBase, ventas, udacBase, udac)`
GAT por variación.

- **Retorno**: `number | null` — `null` si falta un dato, una base es ≤ 0 o las ventas no cambiaron
- **Fórmula**: `%ΔUDAC / %ΔVentas`
- **Ejemplo**: `gatVariacion(1000000, 1100000, 63000, 91000)` → `4.4444`

---

### Modelo DuPont

#### `dupont(UN, ventas, activoTotalProm, patrimonio)`
Modelo DuPont de 3 pasos.

- **Parámetros**: `UN` (number) — utilidad neta; `ventas` (number); `activoTotalProm` (number) — activo total promedio; `patrimonio` (number)
- **Retorno**: `object` con `{ PM, AT, EM, ROE }` — cada componente `number | null`; si algún componente es N/D, `ROE` es `null` (nunca `Infinity` ni `NaN`)
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

#### `capacidadAhorro(ingresos, gastos)`
Lo que queda del ingreso después de los gastos, antes del ahorro planificado.

- **Retorno**: `number | null` — C$; negativo si los gastos superan los ingresos
- **Fórmula**: `Ingresos − Gastos`
- **Ejemplo**: `capacidadAhorro(22500, 17200)` → `5300`

#### `tasaAhorro(capacidad, ingresos)`
- **Retorno**: `number | null` — proporción; `null` si los ingresos no son positivos
- **Fórmula**: `Capacidad de ahorro / Ingresos`
- **Ejemplo**: `tasaAhorro(5300, 22500)` → `0.2356`

---

### Punto de equilibrio y C-V-U

Devuelven `null` (N/D) si falta un dato o si el margen de contribución no es positivo: con MCu ≤ 0 no existe punto de equilibrio. Casos en `docs/planificacion/modulos-guia/01-modulos-obligatorios.md`.

#### `margenContribucionUnitario(precio, costoVariableUnitario)`
- **Retorno**: `number | null` — C$ por unidad
- **Fórmula**: `P − CVu`
- **Ejemplo**: `margenContribucionUnitario(800, 520)` → `280`

#### `razonMargenContribucion(mcUnitario, precio)`
- **Retorno**: `number | null` — proporción; `null` si el precio no es positivo
- **Fórmula**: `MCu / P`
- **Ejemplo**: `razonMargenContribucion(280, 800)` → `0.35`

#### `puntoEquilibrioUnidades(costosFijos, mcUnitario)`
- **Retorno**: `number | null` — unidades; `null` si MCu ≤ 0 o CF < 0
- **Fórmula**: `CF / MCu`
- **Ejemplo**: `puntoEquilibrioUnidades(42000, 280)` → `150`

#### `puntoEquilibrioVentas(costosFijos, razonMC)`
- **Retorno**: `number | null` — C$; `null` si RMC ≤ 0
- **Fórmula**: `CF / RMC`
- **Ejemplo**: `puntoEquilibrioVentas(42000, 0.35)` → `120000`

#### `unidadesUtilidadObjetivo(costosFijos, utilidadObjetivo, mcUnitario)`
- **Retorno**: `number | null` — unidades; `null` si MCu ≤ 0 o CF + UO < 0
- **Fórmula**: `(CF + UO) / MCu`
- **Ejemplo**: `unidadesUtilidadObjetivo(42000, 42000, 280)` → `300`

#### `margenSeguridad(ventas, ventasEquilibrio)`
- **Retorno**: `number | null` — proporción, negativa bajo el punto de equilibrio; `null` si las ventas no son positivas
- **Fórmula**: `(Ventas − PE) / Ventas`, en unidades o en C$
- **Ejemplo**: `margenSeguridad(250, 150)` → `0.4`

---

### Inventario básico

#### `existenciaFinal(existenciaInicial, entradas, salidas)`
- **Retorno**: `number | null`
- **Fórmula**: `Existencia inicial + Entradas − Salidas`
- **Ejemplo**: `existenciaFinal(120, 60, 145)` → `35`

#### `valorInventario(existencia, costoUnitario)`
- **Retorno**: `number | null` — C$
- **Fórmula**: `Existencia final × Costo unitario`
- **Ejemplo**: `valorInventario(35, 350)` → `12250`

#### `necesitaReposicion(existencia, stockMinimo)`
- **Retorno**: `boolean | null` — `true` si la existencia es menor o igual al stock mínimo
- **Ejemplo**: `necesitaReposicion(35, 40)` → `true`

---

### Flujo de efectivo por actividades

#### `flujoNeto(entradas, salidas)`
- **Fórmula**: `Entradas − Salidas` de una actividad
- **Ejemplo**: `flujoNeto(905000, 807000)` → `98000`

#### `variacionNetaEfectivo(operacion, inversion, financiamiento)`
- **Fórmula**: `Operación + Inversión + Financiamiento`
- **Ejemplo**: `variacionNetaEfectivo(98000, -30000, -45000)` → `23000`

#### `saldoFinalEfectivo(saldoInicial, variacionNeta)`
- **Fórmula**: `Saldo inicial + Variación neta`
- **Ejemplo**: `saldoFinalEfectivo(52000, 23000)` → `75000`

---

### Presupuesto maestro

#### `comprasPresupuestadas(ventasUnidades, inventarioFinalDeseado, inventarioInicial)`
- **Retorno**: `number | null` — unidades; puede ser negativo si sobra inventario (el módulo lo trata como 0 y avisa)
- **Fórmula**: `Ventas + Inventario final deseado − Inventario inicial`
- **Ejemplo**: `comprasPresupuestadas(250, 60, 50)` → `260`

#### `costoBienesVendidos(inventarioInicial, compras, inventarioFinal)`
- **Retorno**: `number | null` — C$
- **Fórmula**: `Inventario inicial + Compras − Inventario final`
- **Ejemplo**: `costoBienesVendidos(24000, 124800, 28800)` → `120000`

#### `financiamientoRequerido(saldoFinal, saldoMinimo)`
Financiamiento del presupuesto de caja (Gitman): no se suma a la caja.

- **Retorno**: `number | null` — C$; 0 si hay excedente
- **Fórmula**: `máx(0, Saldo mínimo − Saldo final)`
- **Ejemplo**: `financiamientoRequerido(19200, 40000)` → `20800`

---

### Razones de mercado

Devuelven `number | null`; `null` si falta un dato o el denominador no es positivo. Ejemplos con la demo MUNO MODA 2024 (UN 104,825, patrimonio 582,440, 30,000 acciones, precio 52, dividendos 40,000):

| Función | Fórmula | Ejemplo |
|---|---|---|
| `utilidadPorAccion(udac, acciones)` | `(UN − DAP) / acciones` | `utilidadPorAccion(104825, 30000)` → `3.4942` |
| `precioUtilidad(precio, upa)` | `precio / UPA`; `null` si UPA ≤ 0 | `precioUtilidad(52, 3.4942)` → `14.88` |
| `valorLibrosPorAccion(patrimonio, acciones)` | `patrimonio / acciones` | `valorLibrosPorAccion(582440, 30000)` → `19.41` |
| `precioValorLibros(precio, vlpa)` | `precio / VLPA` | `precioValorLibros(52, 19.4147)` → `2.68` |
| `dividendoPorAccion(dividendos, acciones)` | `dividendos / acciones` | `dividendoPorAccion(40000, 30000)` → `1.3333` |
| `razonPagoDividendos(dpa, upa)` | `DPA / UPA` | → `0.3816` |
| `rendimientoDividendo(dpa, precio)` | `DPA / precio` | → `0.0256` |

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

#### `formatCurrencyND(value)`, `formatNumberND(value, decimals)`, `formatPercentND(value, decimals)`
Igual que las anteriores, pero devuelven `"N/D"` si el valor no es un número finito (las de arriba muestran 0).

- **Ejemplo**: `formatCurrencyND(null)` → `"N/D"`; `formatPercentND(0.35)` → `"35.00%"`

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

---

## estados-import.js (selección)

#### `parseAmountCell(valor, { decimal = 'auto', onAmbiguous } = {})`
Convierte una celda de importe (número o texto contable: `C$ 1,234.50`, `(500)`, `500-`) en número.

- **Parámetros**: `valor` — celda; `decimal` — `'auto'` (deduce por celda), `'.'` o `','` (separador decimal; el otro agrupa miles y lo que no encaje se rechaza); `onAmbiguous({ texto, valor })` — se llama en modo `auto` con un punto seguido de tres dígitos (`45.000`, leído como 45)
- **Retorno**: `number | null` — `null` para celdas en blanco o marcas como `n/a`
- **Errores**: `Error('Importe inválido: …')` para texto no numérico o agrupaciones imposibles (`1.2.3`)
- **Ejemplo**: `parseAmountCell('45.000', { decimal: ',' })` → `45000`; `parseAmountCell('0,500')` → `0.5`

#### `inferDecimalStyle(valores)`
Deduce el separador decimal de un conjunto de celdas.

- **Retorno**: `'.'`, `','` o `null` (sin evidencia o contradictoria). `45.000` por sí solo no es evidencia; `1.234.567` o `12,50` sí.
- **Ejemplo**: `inferDecimalStyle(['45.000', '1.234.567'])` → `','`

`importStatementFile`, `tableTextToFinancialData`, `sheetsToFinancialData` y `rowsToFinancialData` reciben `{ decimal, avisos }`: `decimal` igual que arriba (`'auto'` por defecto; en `auto` se infiere de cada tabla) y `avisos`, un arreglo donde se agregan textos como `Fila 5: "45.000" se leyó como 45…`. Un `decimal` distinto de `'auto'`, `'.'` o `','` lanza `Error('Formato de importes no válido: …')`.

---

## integracion-respaldo.js e integracion-reporte.js

Lógica pura de Reportes (sin DOM ni `store`); el `index.js` del módulo lee el `store` y guarda con `setPersisted`.

#### `validarRespaldo(contenido, actuales)`
Valida un respaldo JSON ya parseado antes de tocar el `store`.

- **Parámetros**: `contenido` — objeto del archivo; `actuales` — resultado de `store.getAll()` (define las claves y tipos admitidos)
- **Retorno**: `{ modulos, omitidos }` — `modulos`: módulos validados y copiados (los campos ausentes se completan con los actuales; `estados` sale de `normalizeFinancialData`); `omitidos`: claves o campos desconocidos. `theme` se ignora.
- **Errores**: `Error` en español si no es un objeto, hay claves peligrosas, es demasiado profundo (más de 12 niveles o 200 000 nodos), un campo tiene el tipo equivocado o no hay ningún módulo reconocible
- **Ejemplo**: `validarRespaldo({ presupuesto: { ingresoMensual: 900 } }, store.getAll())`

#### `construirReporteHTML({ kpis, estados })`
Cuerpo HTML del reporte (resumen, Balance General, Estado de Resultados y Totales por periodo), con una columna por periodo y todo texto del usuario escapado.

- **Parámetros**: `kpis` — resultado de `computeDashboardKPIs` o `null`; `estados` — datos normalizados o `null`
- **Retorno**: `string` — HTML sin `<h1>` ni documento; `exportHTML` lo envuelve. Valores `null` se muestran N/D y cuentas ausentes en un periodo, "—".

---

## estados-calculations.js (selección)

#### `resolveAccountType(data, group, name)`
Tipo de una cuenta: el de `data.accountTypes[group][name]` si existe (solo propiedades propias); si no, `inferAccountType(group, name)`. Es la misma regla que aplica `computeFinancialTotals`.

- **Retorno**: `string` — un tipo de `ACCOUNT_TYPES`, o `''` si no se reconoce
- **Ejemplo**: `resolveAccountType({}, 'estadoResultados', 'Costo de ventas')` → `'costoVentas'`

---

## apalancamiento-calculations.js

`js/modules/apalancamiento/`. Lógica pura: recibe los estados normalizados y la sección `apalancamiento` del `store` (`config`). Plan en `docs/planificacion/apalancamiento/03-datos-y-derivacion.md`.

#### `cuentasOperativas(estados)`
Cuentas del estado de resultados de tipo `costoVentas`, `gastosAdmin` o `gastosVentas` en cualquier periodo, sin repetir.

- **Retorno**: `Array<{ nombre, tipo }>`

#### `sugerirComportamiento(tipo)`
- **Retorno**: `'variable'` para `costoVentas`, `'fijo'` para `gastosAdmin`, `null` para el resto

#### `normalizarComportamiento(valor)`
- **Retorno**: `{ tipo, pctVariable }` con `pctVariable` 1 (variable), 0 (fijo) o en [0, 1] (mixto); `null` si es inválido

#### `resolverComportamiento(cuentas, guardado = {})`
Para cada cuenta, el comportamiento guardado si es válido; si no, la sugerencia.

- **Retorno**: `Array<{ nombre, tipo, comportamiento, origen }>`, con `origen` `'guardado'`, `'sugerido'` o `null` (sin comportamiento)

#### `derivarPeriodo(estados, periodo, config = {}, cuentasResueltas = null)`
Variables del paso 01 para un periodo, con sus grados, traza y faltantes.

- **Retorno**: `{ periodo, variables, grados, traza, faltantes }`
  - `variables`: `ventas`, `cv`, `cf`, `mc`, `uaii`, `oi`, `og`, `i`, `uai`, `ir` (`null` sin cuenta de impuestos), `t`, `origenT` (`'efectiva'`, `'defecto'` o `null`), `un`, `dap`, `udac`, `denominadorGaf`
  - `grados`: `{ gao, gaf, gat }`
  - `traza`: `Array<{ concepto, valor, formula, cuentas }>`
  - `faltantes`: `{ tipo: 'sinClasificacion' | 'sinComportamiento', cuenta }` o `{ tipo: 'dapInvalido', periodo }`
- **N/D**: con una cuenta del estado de resultados sin tipo, todo el periodo; sin comportamiento, `cv`, `cf`, `mc`, GAO y GAT; con DAP inválido, `dap`, `udac`, GAF y GAT

#### `calcularApalancamiento(estados, config = {})`
- **Retorno**: `{ periodos, variaciones, cuentas, advertencias }`
  - `variaciones`: por cada par de periodos consecutivos, `{ desde, hasta, gao, gaf, gat, estructuralBase }`
  - `advertencias`: `{ codigo, ... }` con `codigo` `clasificacion-sugerida`, `sin-comportamiento`, `bajo-equilibrio-operativo`, `bajo-equilibrio-financiero`, `tasa-por-defecto` o `estructura-cambio`

---

## eoaf-calculations.js

`js/modules/analisis/eoaf-calculations.js`. Lógica pura del Estado de Origen y Aplicación de Fondos (EOAF), sin DOM ni `store`. Recibe los estados normalizados (o en bruto) y arma el balance comparado de dos periodos. La interfaz está en `index.js` (`computeEOAF`, que devuelve el resultado completo, y `renderEOAFSection`).

#### `TOLERANCIA_EOAF`
Constante `0.01`: un centavo, más el epsilon de coma flotante escalado a los totales. No se redistribuyen diferencias.

#### `seleccionarPeriodoPar(periodos)`
El par de periodos a comparar: los dos más recientes en orden cronológico (`ordenarPeriodos`); con nombres sin año ("Marzo") se respeta el orden que dejó el usuario.

- **Retorno**: `{ periodoInicial, periodoFinal, periodos }` o `{ incompleto }` si hay menos de dos periodos distintos
- **Ejemplo**: `seleccionarPeriodoPar(['2025', '2023', '2024'])` → `{ periodoInicial: '2024', periodoFinal: '2025', periodos: ['2023', '2024', '2025'] }`

#### `clasificarMovimientoEOAF(grupo, tipo, saldoInicial, saldoFinal)`
Clasifica la variación de una cuenta del balance con el grupo (`'activos'`, `'pasivos'`, `'patrimonio'`) y el tipo de `ACCOUNT_TYPES`.

- **Retorno**: `{ clasificacion, monto, motivo }`
  - `clasificacion`: `'Origen'`, `'Aplicacion'`, `'Sin movimiento'` o `null` (incompleto)
  - `monto`: valor absoluto de la variación, o `null`
  - `motivo`: `'falta-saldo'` (un saldo no existe), `'sin-clasificar'` (cuenta sin tipo), `'signo-cambiado'` (depreciación que cambia de signo con la misma magnitud) o `null`
- **Reglas**: activo que aumenta → `'Aplicacion'`; activo que disminuye → `'Origen'`; pasivo/patrimonio que aumenta → `'Origen'`; que disminuye → `'Aplicacion'`. En `depreciacionAcumulada` manda la magnitud (creciente → `'Origen'`).
- **Ejemplo**: `clasificarMovimientoEOAF('activos', 'efectivo', 100, 130)` → `{ clasificacion: 'Aplicacion', monto: 30, motivo: null }`

#### `etiquetaFalta(motivo)`
Etiqueta corta para la interfaz: `'Dato faltante'`, `'Sin clasificar'`, `'Revisar'` o `null`.

#### `construirEOAF(datos, periodoInicial, periodoFinal)`
Estado completo: secciones con filas y subtotales, resumen de la comprobación, advertencias e interpretación.

- **Retorno**: `{ periodos, incompleto?, secciones, resumen, advertencias, interpretacion }`
  - `secciones`: por grupo, `{ id, titulo, filas, subtotal }`; cada fila tiene `cuenta`, `tipo`, `saldoInicial`, `saldoFinal`, `variacion`, `clasificacion`, `origen`, `aplicacion`, `falta`, `etiqueta` y `mensaje`
  - `subtotal`: `{ saldoInicial, saldoFinal, variacion, completo }`; es `null` si falta algún saldo
  - `resumen`: `{ totalOrigenes, totalAplicaciones, diferencia, estado, tolerancia, motivos }` con `estado` `'cuadra'`, `'no-cuadra'` o `'incompleta'` (hay motivos)
  - `incompleto`: con menos de dos periodos o sin balance de uno de ellos; entonces `secciones: []` y `resumen: null`
- **N/D**: los saldos faltantes se reportan como filas con `falta: 'falta-saldo'`, no como 0; los subtotales de esa sección quedan en `null`
- **Ejemplo**: `construirEOAF(estados, '2023', '2024')` con la demo MUNO MODA → `{ resumen: { totalOrigenes: 97775, totalAplicaciones: 97775, diferencia: 0, estado: 'cuadra' } }`

#### `interpretarEOAF(resultado)`
Lectura breve del estado en una o dos frases (mayor fuente, mayor aplicación, o la diferencia exacta si no cuadra).

- **Retorno**: `string`; los nombres de cuenta que aparecen pueden venir de un archivo importado: el llamador debe escaparlos (`escapeHTML`) antes de insertarlos en HTML

---

## Módulos de la guía: inventario, equilibrio, flujo, planeación y proforma

Lógica pura en `js/modules/<modulo>/<modulo>-calculations.js` (sin DOM ni `store`). Cada pantalla (`<modulo>-ui.js`) recibe `page` y `{ datos, guardar, graficar? }`; su `index.js` lee el `store` y guarda con `setPersisted`.

| Archivo | Funciones públicas |
|---|---|
| `inventario/inventario-calculations.js` | `normalizarInventario(datos)`, `movimientosDeProducto(datos, productoId)`, `kardex(producto, movimientos)` → `{ filas, entradas, salidas, saldoFinal, primerNegativo }`, `resumenProducto(producto, movimientos)`, `calcularInventario(datos)` → `{ productos, valorTotal, unidadesTotales, porReponer, costoReposicionTotal }`, `validarProducto(datos, producto, idEditado)`, `validarMovimiento(datos, movimiento)`, `validarBorradoMovimiento(datos, id)`, `ejemploInventario()` |
| `equilibrio/equilibrio-calculations.js` | `normalizarEquilibrio(datos)`, `validarEquilibrio(datos)`, `calcularCVU(datos)` → `{ mcu, rmc, peUnidades, peVentas, unidadesMinimas, ventas, mcTotal, uaii, msUnidades, msVentas, msPorcentaje, gao, unidadesObjetivo, … }`, `aplicarCambios(datos, cambios)`, `calcularEscenarios(datos)`, `puntosGrafica(resultado)`, `baseDesdeEstados(estados, configApalancamiento, periodo, unidades)`, `ejemploEquilibrio()` |
| `flujo/flujo-calculations.js` | `normalizarFlujo(datos)`, `validarMovimientoFlujo(movimiento)`, `calcularFlujo(datos)` → `{ actividades, neto, totalEntradas, totalSalidas, variacionNeta, saldoFinal }`, `conciliarConBalance(resultado, estados, periodoBase)`, `ejemploFlujo()` |
| `planeacion/planeacion-calculations.js` | `SUPUESTOS`, `normalizarSupuestos(datos)`, `validarSupuestos(s)`, `ajustarLista(lista, n)`, `calcularPresupuestoMaestro(s)` → `{ ventas, compras, cbv, gastos, caja, resultados, equilibrio, cierre, totales, financiamientoMaximo, periodoFinanciamiento, avisos }`, `ejemploPlaneacion()` |
| `proforma/proforma-calculations.js` | `resultadosReales(estados)`, `resultadosProforma(presupuesto)`, `compararResultados(real, proforma)`, `indicadoresIntegrados(entradas, periodo)`, `alertasIntegradas(entradas)`, `construirReporte(entradas)` → `{ real, proforma, comparacion, efectivo, indicadores, alertas, faltantes }`, `razon(razones, clave, denominador?)` (razón de Análisis con N/D si su denominador es 0) |
| `inicio/inicio-calculations.js` | `tendenciaEstados(estados)` → `{ periodos, ventas, utilidadNeta, totalActivos }`, `kpisPrincipales(entradas)`, `areasClave(entradas)` (solo empresa), `resumenActivos(lista)` → `{ cantidad, costoTotal, valorLibros, pctDepreciado, requierenAtencion }`, `finanzasPersonales(presupuesto, activos)` (presupuesto personal y activos del hogar), `saludGeneral(areas, alertas)` → `{ nivel, puntaje, ok, alerta, texto }` (D-017), `panoramaGeneral(entradas, reporte, { presupuesto, activos })` |

Inicio reutiliza la recolección de la proforma: `proforma/index.js` exporta `reunirEntradas()`, y `inicio/index.js` exporta `initInicio()`, `cargarEjemploEmpresa()` y `cargarEjemploPersonal()` (solo llenan módulos vacíos; devuelven los nombres cargados). Activos exporta `calcularEstado(activo)` y `ejemploActivos()`. `js/components/chart.js` exporta `refreshChartsTheme()`, que recolorea ejes y leyendas de las gráficas abiertas al cambiar de tema.

Códigos de `avisos` del presupuesto maestro: `financiamiento`, `sin-compras`, `bajo-stock-minimo`, `perdida`, `bajo-equilibrio` y `sin-margen`.

Utilidades: `js/utils/form.js` (`leerNumero(texto)` → `{ vacio, valor }`, `nuevoId(prefijo)`, `fechaHoy()`), `js/utils/estados-guardados.js` (`estadosGuardados(estados)`, `totalesPeriodo(estados, periodo)`). `js/modules/analisis/index.js` exporta ahora `refreshSavedStates()` para que el reporte integrado no use estados en caché.
