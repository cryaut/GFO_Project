# Documentación API — GFO Toolkit

Referencia completa de las funciones públicas de los módulos utilitarios.

## Análisis completo (`js/modules/analisis/analisis-calculations.js`)

Funciones puras, sin DOM ni store. Los adaptadores públicos `computeAH`, `computeAVBalanceGeneral`, `computeAVEstadoResultados` y `computeDuPont` de `analisis/index.js` delegan aquí (D-095).

#### `filasAnalisis(datos, periodo)`
- **Parámetros**: `datos`, estados normalizados; `periodo`, clave de periodo.
- **Retorno**: array de `{ clave, cuenta, grupo, seccion, valor }`. Incluye BG/ER, totales reportados, suplementarios y pendientes, con claves estables y valores finitos o `null`. No suma reportados a sus componentes. Devuelve `[]` sin datos o periodo.
- **Ejemplo**: una cuenta propia `Banco principal: 100` produce una fila con `cuenta: 'Banco principal'`, `grupo: 'Activos'`, `valor: 100`.

#### `analisisHorizontalCompleto(datos, periodos)`
- **Parámetros**: estados normalizados y array de periodos en orden de comparación.
- **Retorno**: array de pares `{ periodo, inicial, final, rows }`; cada fila conserva grupo/nombre y añade `t1`, `t2`, `delta`, `pctDelta`. Una ausencia no se convierte en cero.
- **Fórmula**: delega Δ y porcentaje a `ahDelta` y `ahPctDelta`; porcentaje = Δ/abs(T1).
- **Ejemplo**: 100 → 125 produce Δ=25 y `pctDelta=0.25`; 0 → 10 produce Δ=10 y porcentaje `null`.

#### `analisisVerticalCompleto(datos, periodo)`
- **Parámetros**: estados normalizados y periodo.
- **Retorno**: `{ balanceGeneral, estadoResultados, complementarios }`. Cada estado tiene `base`, `baseValor` y todas sus `rows` con `pctBase`; complementarios no tienen una base inventada.
- **Fórmula**: `av(valor, base)` con guarda de datos finitos y divisor distinto de cero. La base del balance es el activo total. Si está reportado, se conserva y se indica si el desglose es insuficiente o discrepa. La base del ER es ventas netas.
- **Ejemplo**: UN reportada 12000 y ventas netas 200000 → `pctBase=0.06`; base cero o ausente → `null`.

#### `detalleDuPont(datos, periodo)`
- **Parámetros**: estados completos guardados y periodo, con las identidades acreditadas que exige el motor.
- **Retorno**: `{ PM, AT, EM, ROA, ROE, roaDirecto, roeDirecto, utilidadNeta, ventas, activoProm, patrimonioProm, usaPromedios, motivos }`; resultados numéricos o `null`. `computeDuPont` conserva los campos previos y añade ROA, operandos y comprobaciones.
- **Fórmula**: factores y operandos del mismo motor de Razones; ROA=PM×AT y ROE usa la función `dupont` con esos operandos. Directos: resultados ROA y ROE de Razones. No completa datos del motor con el totalizador legado.
- **Ejemplo**: UN=12000, ventas=200000, activo promedio=100000 y patrimonio promedio=60000 → PM=0.06, AT=2, EM=5/3, ROA=0.12, ROE=0.20. Con ventas cero, la descomposición puede ser N/D aunque un directo exista.

## Colección de cuentas (`js/modules/estados/cuentas-*.js`)

`versionCatalogo = '2026-10-20.1'`. Catálogo de 72 definiciones; las 71 del PR #10 conservan ids, nombres canónicos, clasificación, rol y política de ausencia. D-046 corrige únicamente la definición de intangibles a no monetarios. La auditoría D-045 deja 1 `verified`, 66 `partially_verified` y 5 `ambiguous`: PGC es referencia terminológica, no respaldo para `verified`. La fixture declara 28 rebajas de investigación y la diferencia de definición, aparte de la sincronización v8 pendiente. Véase [cuentas/investigacion.md](planificacion/cuentas/investigacion.md).

#### `obtenerCuenta(id)` / `listarCuentas({ grupo } = {})`
Devuelven una copia de la definición (`null` para id inexistente) o una lista en orden estable por id. Grupos: `activos`, `pasivos`, `patrimonio`, `estadoResultados`, `suplementario`. El llamador no puede modificar el catálogo mediante la copia.

La definición puede incluir `agrupadoEn`, id de la cuenta de la que es componente. D-051 declara `is.interest_income.agrupadoEn = 'is.nonoperating_income'`. Ambas conservan `tipoApp: 'otrosIngresos'`; este metadato no cambia la suma actual ni añade agregación automática a `montoCuenta`/`consultarMontoCuenta`. No demuestra que un futuro consumidor de los JSON ejecute el agrupamiento.

#### `identificarCuenta(texto, { grupo, clasificacion, id } = {})`
Función pura. Devuelve `{ estado, id, metodo, candidatos, preseleccion }`; `estado` es `reconocida`, `sugerida` o `no_reconocida`. Solo una reconocida tiene `id`. Los candidatos incluyen id, nombre, grupo, tipo transitorio y puntuación. El orden es id explícito → nombre canónico → sinónimo → contexto → similitud. Un id inválido no cae a un nombre distinto. Grupo/clasificación contradictorios quedan sugeridos; los alias de cuentas ambiguas requieren confirmación. Ejemplo: `identificarCuenta('Efetivo', { grupo: 'activos' })` devuelve una sugerencia, nunca asigna id.

#### `normalizarCuenta(texto)` / `distanciaDamerau(a, b)` / `similitudCuentas(texto, candidato)`
Normalizan a minúsculas sin acentos, convierten signos a espacios, colapsan espacios y eliminan las palabras vacías del encargo. Los dígitos se conservan. La distancia devuelve un entero; la similitud devuelve 0–1: máximo entre Damerau–Levenshtein normalizada por longitud máxima y apoyo simétrico por palabras normalizado por longitud combinada. Dígitos diferentes dan similitud cero. Ejemplo: `similitudCuentas('Efetivo', 'Efectivo') = 14/15`; corto/largo no alcanza 0.92.

#### `sugerirCuentas(texto, cuentas)` / `UMBRALES_SIMILITUD`
Devuelve `{ candidatos, preseleccion }`. Filtra puntuaciones inferiores a 0.80, ordena puntuación descendente e id y conserva hasta cinco candidatos. Solo preselecciona con puntuación ≥0.92 y ventaja ≥0.05. La preselección requiere confirmación; nunca identifica automáticamente.

#### `registrarCuenta(datos, registroORegistros)`
Alta pura y atómica para importación y captura manual. Cada registro admite `{ nombre, grupo, periodo, importe, clasificacion?, id?, confirmado?, reemplazar?, origen? }`. Devuelve `normalizeFinancialData` de una copia; no modifica la entrada ni guarda en el store. `confirmado` registra `confirmacion_manual`, pero no vuelve válido un id/contexto inválido. El lote evita normalizaciones repetidas. Rechaza duplicados y nombres/periodos peligrosos; una cuenta sin id o grupo conserva el monto para revisión.

#### `montoCuenta(datos, periodo, id)` / `consultarMontoCuenta(datos, periodo, id)`
La primera devuelve `number | null`; la segunda `{ valor, motivo }`. Un dato explícito, incluido cero, se devuelve; los detalles con el mismo id suman sus saldos. Un total reportado exige un único dato publicado y nunca suma componentes. En ausencia, solo un detalle con `zero_if_not_reported` devuelve cero; `requires_data`, totales y periodos faltantes devuelven null. Candidatos sin confirmar usan `ambiguous_account_match`; desconocidas relevantes usan `unrecognized_imported_account`. Otros motivos: `missing_required_account_data`, `missing_required_period_balance`, `unknown_account_id`.

Una fila pendiente con importe numérico cero en ese periodo no bloquea la política de ausencia; esto también aplica a filas sin grupo. No confirma el id ni convierte un dato requerido ausente en cero.

#### `resumenIdentificacion(datos)`
Cuenta las cuentas por estado, incluidas las pendientes de grupo; una cuenta compartida por varios periodos se cuenta una vez. Devuelve `{ reconocida, sugerida, no_reconocida }`.

#### `resolverClasificacion(grupo, valor)` / `tipoCuentaLegada(grupo, nombre)`
Adaptadores de los 19 tipos anteriores: devuelven un tipo o `''`. Los alias y las excepciones de compatibilidad están en el catálogo; no hay una segunda regla regex. El adaptador legado no confirma identificadores ni se usa para aplicar sugerencias nuevas.

#### `resolveGroup({ estado, grupo, clasif, name, id })` / `resolveClassification(grupo, tipo, nombre, id)`
Adaptadores del importador: el primero devuelve un grupo o `''`; el segundo el resultado completo del identificador. Una cuenta no reconocida no lanza error. El lector sigue rechazando importes y estructuras inválidas, límites excedidos y duplicados. No cambian D-019 ni D-020.

#### `selectorCuenta(contenedor, nombre, grupo, clasificacion?)` / `renderRevisionCuentas(contenedor, datos, cambiar, fallo)`
Interfaz de selección compartida. La primera dibuja estado/candidatos o catálogo filtrable y devuelve la identificación; la segunda muestra resumen y formularios para confirmar pendientes mediante `registrarCuenta`. Escapan el texto procedente de archivos y no guardan en el store.

---

## calculate.js

Fórmulas financieras puras. Todas las funciones reciben números y retornan números (o objetos con resultados). Ninguna depende de DOM ni de estado global.

D-047: un operando numérico obligatorio `null` o `undefined` produce N/D antes de operar. Las fórmulas y convenciones con datos completos se conservan, incluidos casos especiales legados con denominador cero. Los parámetros opcionales mantienen sus defaults declarados; una tasa que no interviene con DAP cero no es un operando requerido. La ronda 6 restaura la excepción D-005: `tasaImpuesto` puede seleccionar una tasa por defecto válida cuando IR/UAI no permiten una efectiva. DuPont conserva su objeto y deja N/D en los componentes afectados. Los plazos usan `DIAS_ANIO = 365`. El catálogo resumido está en `docs/contexto/dominio-financiero.md`.

### Constante y funciones base

#### `DIAS_ANIO`
Días del año para plazos, edades y ciclos: `365`. Úsala en lugar de escribir el número.

#### `saldoPromedio(saldoInicial, saldoFinal)`
Saldo promedio de un periodo, para rotaciones, ROA, ROE y DuPont.

- **Parámetros**: `saldoInicial` (number) — saldo del periodo anterior; `saldoFinal` (number) — saldo del periodo actual
- **Retorno**: `number | null` — N/D si falta cualquiera de los dos saldos. El consumidor selecciona explícitamente saldo final cuando solo hay un periodo.
- **Fórmula**: `(saldoInicial + saldoFinal) / 2`
- **Ejemplo**: `saldoPromedio(10000, 20000)` → `15000`; `saldoPromedio(undefined, 20000)` → `null`

#### `variacion(valorFinal, valorInicial)`
Variación absoluta entre dos saldos (usada en el EFE indirecto).

- **Retorno**: `number | null`
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
- **Retorno**: `number | null` — diferencia absoluta
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
- **Retorno**: `number | null` — proporción decimal
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
Tasa T para el GAF: la efectiva si existe; si no está disponible, la tasa por defecto válida (D-005, restaurada en la ronda 6).

- **Parámetros**: `ir` (number | null) — `null` si el periodo no trae cuenta de impuestos; `0` es un IR informado; `uai` (number); `tasaDefecto` (number)
- **Retorno**: `number | null` — N/D si no hay tasa efectiva y `tasaDefecto` está fuera de [0, 1); IR/UAI ausentes permiten seleccionar una tasa por defecto válida
- **Ejemplo**: `tasaImpuesto(30000, 100000)` → `0.3`; `tasaImpuesto(null, 100000, 0.15)` → `0.15`; `tasaImpuesto(0, 100000)` → `0`

El módulo Apalancamiento conserva IR N/D si no existe cuenta y llama a este helper como en `main`; la selección de la tasa configurada pertenece a `tasaImpuesto`, con origen `defecto` cuando no hay efectiva válida. No calcula una tasa efectiva a partir de un IR ausente. Esta es una excepción explícita al contrato general de operandos obligatorios de D-047.

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
- **Retorno**: `number | null`
- **Fórmula**: `AC - PC`
- **Ejemplo**: `capitalNetoTrabajo(30000, 18000)` → `12000`

#### `capitalNetoOperativo(activosCorrientesOps, pasivosCorrientesOps)`
Capital neto operativo.

- **Parámetros**: `activosCorrientesOps` (number); `pasivosCorrientesOps` (number)
- **Retorno**: `number | null`
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
Calcula el efectivo de operaciones por método indirecto. Análisis ya no la consume en la pestaña EFE (usa `construirEFE`); sigue exportada para sus pruebas.

- **Parámetros**: `utilidadNeta` (number); `ajustes` (number[]) — array de ajustes no efectivos
- **Retorno**: `number | null` — efectivo neto; N/D sin lanzar si falta la utilidad, la lista de ajustes o un elemento de esta
- **Fórmula**: `UtilidadNeta + Σ(ajustes)`
- **Ejemplo**: `efeIndirecto(12000, [3000, -1000, 2000])` → `16000`

---

### Depreciación

#### `depAnualLineaRecta(costoOriginal, valorResidual, vidaUtil)`
Depreciación anual por método de línea recta.

- **Parámetros**: `costoOriginal` (number); `valorResidual` (number); `vidaUtil` (number) — en años
- **Retorno**: `number | null` — depreciación anual
- **Fórmula**: `(CostoOriginal - ValorResidual) / VidaUtil`
- **Ejemplo**: `depAnualLineaRecta(18000, 2400, 5)` → `3120`

#### `depAcumulada(depAnual, aniosConsumidos, vidaUtil)`
Depreciación acumulada con tope de vida útil.

- **Parámetros**: `depAnual` (number); `aniosConsumidos` (number); `vidaUtil` (number)
- **Retorno**: `number | null`
- **Fórmula**: `depAnual × min(aniosConsumidos, vidaUtil)`
- **Ejemplo**: `depAcumulada(3120, 3, 5)` → `9360`

#### `valorEnLibros(costoOriginal, depAcum)`
Valor contable de un activo.

- **Parámetros**: `costoOriginal` (number); `depAcum` (number) — depreciación acumulada
- **Retorno**: `number | null`
- **Fórmula**: `CostoOriginal - DepAcumulada`
- **Ejemplo**: `valorEnLibros(18000, 9360)` → `8640`

---

### Presupuesto

#### `ahorroMensual(metaAhorro, mesesDisponibles)`
Calcula cuánto ahorrar cada mes para alcanzar una meta.

- **Parámetros**: `metaAhorro` (number); `mesesDisponibles` (number)
- **Retorno**: `number | null` — ahorro mensual requerido
- **Fórmula**: `MetaAhorro / MesesDisponibles`
- **Ejemplo**: `ahorroMensual(3000, 12)` → `250`

#### `saldoSemanal(ingreso, gastos, ahorro, reserva)`
Calcula el saldo disponible al final de la semana.

- **Parámetros**: `ingreso` (number); `gastos` (number); `ahorro` (number); `reserva` (number, opcional)
- **Retorno**: `number | null`
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

Lógica pura de Reportes (sin DOM ni `store`). El `index.js` guarda el respaldo validado con `store.setModulesPersisted(modulos)`.

`setModulesPersisted(modulos)` acepta un objeto con secciones de primer nivel reconocidas. Clona los cambios y escribe el estado completo una vez. Lanza un error si falla la escritura y conserva el último estado válido. Notifica a los suscriptores después del guardado.

#### `getSavedTotals(period)` — `js/modules/integracion/index.js`
Consulta los totales de los estados guardados mediante `computeFinancialTotals`, la misma función usada por Análisis. La utilidad neta incluye intereses e impuestos y conserva N/D.

- **Parámetros**: `period` (`string`) — periodo solicitado explícitamente.
- **Retorno**: objeto de totales o `null` si los estados no pueden normalizarse o el periodo no existe. No sustituye el periodo solicitado por el último disponible.
- **Ejemplo**: con datos guardados solo de 2023, `getSavedTotals('2024')` → `null` (N/D).

#### `validarRespaldo(contenido, actuales)`
Valida un respaldo JSON ya parseado antes de tocar el `store`.

- **Parámetros**: `contenido` — objeto del archivo; `actuales` — resultado de `store.getAll()` (define las claves y tipos admitidos)
- **Retorno**: `{ modulos, omitidos }` — `modulos`: módulos validados y copiados (los campos ausentes se completan con los actuales; `estados` sale de `normalizeFinancialData`); `omitidos`: claves o campos desconocidos. `theme` se ignora.
- **Errores**: `Error` en español si no es un objeto, hay claves peligrosas, es demasiado profundo (más de 12 niveles o 200 000 nodos), un campo tiene el tipo equivocado o no hay ningún módulo reconocible
- **Ejemplo**: `validarRespaldo({ presupuesto: { ingresoMensual: 900 } }, store.getAll())`

Planeación admite el presupuesto anterior `{ supuestos }` y el contrato de escenarios versionado. Un respaldo versionado se valida completo y las bases referidas deben existir.

Los respaldos con Inventario pasan por `validarInventarioRespaldo` antes de solicitar confirmación o persistir el lote.

#### `construirReporteHTML({ kpis, estados })`
Cuerpo HTML del reporte (resumen, Balance General, Estado de Resultados y Totales por periodo), con una columna por periodo y todo texto del usuario escapado.

- **Parámetros**: `kpis` — resultado de `computeDashboardKPIs` o `null`; `estados` — datos normalizados o `null`
- **Retorno**: `string` — HTML sin `<h1>` ni documento; `exportHTML` lo envuelve. Valores `null` se muestran N/D y cuentas ausentes en un periodo, "—".

---

## Razones de la app (D-049, D-056)

`computeRazones(periodo, opciones = {})` conserva las claves que usan Análisis, Integración, Proforma y Reportes; añade `capitalNetoTrabajo` para exponer el vigésimo resultado JSON sin retirar ninguna clave anterior. Las 20 razones provienen del motor por id y los cuatro indicadores complementarios usan sus funciones actuales con la misma entrada. `opciones.mostrar_calculo_directo_primer_periodo` se admite para el harness; la app lo deja apagado.

Devuelve razones numéricas o `null`, `usaPromedios`, `usaComprasReales`, `invProm`, `cxcProm`, `activoProm`, `patrimonioProm`, `denominadores` y `notAvailableReasons`. Este último mantiene `{ campo, periodo, motivo, operandos }`; conserva los motivos del motor y distingue `documento_no_normalizable`, identidad no acreditada, `composicion_no_declarada`, `composicion_incluye_intereses`, datos requeridos ausentes y denominadores cero. Un periodo inexistente no se sustituye por otro. No hay respaldo por nombres fijos.

`computarRazonesDesdeDatos(datos, periodo, opciones = {})`, en `js/modules/razones/razones-app-adapter.js`, adapta un documento guardado conservando sus metadatos de identidad y devuelve ese mismo contrato sin leer store ni DOM. `obtenerUtilidadNetaMotor(datos, periodo)` devuelve `{ valor, metodo, motivos }` para `derived.net_income` de `rentabilidad_margen_utilidad_neta`, sin duplicar la fórmula.

---

## estados-calculations.js (selección)

#### `computeFinancialTotals(data, period)`
Calcula los agregados compartidos. Devuelve totales, `unclassified`, `classificationComplete` y `notAvailableReasons: Array<{ group, name, motivo, campos }>`.

Un total reportado (`rol: reported_total`) es el valor de su tipo y se compara con la suma de sus detalles del mismo tipo; si la diferencia supera 0.01, manda el total y se registra `reported_subtotal_mismatch` con la diferencia (D-062). Un subtotal sin detalles ni total propio en un grupo con total reportado es N/D, nunca 0. `ventas` es ventas netas (ventas menos `deduccionesVentas`) y `ventasBrutas` queda como trazabilidad (D-064). Si el catálogo exige una cuenta ausente (`requires_data`), los totales afectados son N/D con motivo `missing_required_account_data`; un cero declarado cuenta como dato (D-063).

Una cuenta sin tipo con importe cero no aplica al cálculo; permanece pendiente de identificación. Con importe distinto de cero, incluso de origen legado, se anulan sus tipos/subtotales posibles y el total del grupo. Se usa clasificación explícita o candidatos; si hay conflicto de contexto se conservan ambas posibilidades. Sin contexto se consideran todos los tipos de su grupo. Una fila sin grupo y con importe anula todos los totales. Los saldos ausentes no se completan con cero.

- **Ejemplo**: cuenta pendiente de `activosCorrientesOtros` con 5000 → ese tipo, `activosCorrientes` y `totalActivos` son null; `activosFijos` conserva su valor.

#### `validateFinancialData(data)`
Por cada periodo calcula los tres totales y evalúa el equilibrio A = P + O con la tolerancia de un centavo.

- **Retorno**: `Array<{ period, totalActivos, totalPasivos, totalPatrimonio, difference, balanced, diagnostico }>`; `difference` y `balanced` son `null`/`false` si un total es N/D. `diagnostico` es «Falta incluir el resultado del ejercicio en el patrimonio.» cuando el descuadre coincide con la utilidad neta del periodo (diferencia de 0.01 o menos) y `null` en los demás casos.

#### `resolveAccountType(data, group, name)`
Tipo de una cuenta: el de `data.accountTypes[group][name]` si existe (solo propiedades propias); si no, `inferAccountType(group, name)`. Es la misma regla que aplica `computeFinancialTotals`.

- **Retorno**: `string` — un tipo de `ACCOUNT_TYPES`, o `''` si no se reconoce
- **Ejemplo**: `resolveAccountType({}, 'estadoResultados', 'Costo de ventas')` → `'costoVentas'`

#### `seleccionarPeriodos({ periodos, seleccion, maximo })`
D-065: qué periodos se muestran en la vista multiperiodo de Estados. Los cálculos nunca dependen de la selección. `periodos` llega en su orden de presentación (la interfaz usa `ordenarPeriodos`); sin `seleccion`, los predeterminados son todos los periodos si hay `maximo` (4) o menos y los dos más recientes si hay más; una `seleccion` dada manda mientras sus nombres existan y nunca supera el máximo.

- **Constante**: `MAXIMO_PERIODOS_VISIBLES = 4`
- **Retorno**: `{ visibles, predeterminados, puedeAgregar }`
- **Ejemplo**: `seleccionarPeriodos({ periodos: ['2020','2021','2022','2023','2024','2025'] })` → `{ visibles: ['2024','2025'], predeterminados: ['2024','2025'], puedeAgregar: true }`

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

`js/modules/analisis/eoaf-calculations.js`. Lógica pura del Estado de Origen y Aplicación de Fondos (EOAF), sin DOM ni `store`. Recibe los estados normalizados (o en bruto) y arma el balance comparado de dos periodos. La interfaz está en `index.js` (`computeEOAF`, que devuelve el resultado completo, y `renderEOAFSection`). La selección del par de periodos, la tolerancia y la advertencia de balance son comunes con el EFE: ver `comprobacion-calculations.js`.

#### `clasificarMovimientoEOAF(grupo, tipo, saldoInicial, saldoFinal)`
Clasifica la variación de una cuenta del balance con el grupo (`'activos'`, `'pasivos'`, `'patrimonio'`) y el tipo de `ACCOUNT_TYPES`.

- **Retorno**: `{ clasificacion, monto, motivo }`
  - `clasificacion`: `'Origen'`, `'Aplicacion'`, `'Sin movimiento'` o `null` (incompleto)
  - `monto`: valor absoluto de la variación, o `null`
  - `motivo`: `'falta-saldo'` (un saldo no existe), `'sin-clasificar'` (cuenta sin tipo), `'signo-cambiado'` (depreciación que cambia de signo con la misma magnitud) o `null`
- **Reglas**: activo que aumenta → `'Aplicacion'`; activo que disminuye → `'Origen'`; pasivo/patrimonio que aumenta → `'Origen'`; que disminuye → `'Aplicacion'`. En `depreciacionAcumulada` manda la magnitud (creciente → `'Origen'`).
- Dos saldos numéricos cero devuelven `'Sin movimiento'` incluso sin tipo. Un saldo ausente o un saldo no clasificado distinto de cero sigue siendo incompleto.
- **Ejemplo**: `clasificarMovimientoEOAF('activos', 'efectivo', 100, 130)` → `{ clasificacion: 'Aplicacion', monto: 30, motivo: null }`

#### `etiquetaFalta(motivo)`
Etiqueta corta para la interfaz: `'Dato faltante'`, `'Sin clasificar'`, `'Revisar'` o `null`.

#### `construirEOAF(datos, periodoInicial, periodoFinal)`
Estado completo: secciones con filas y subtotales, resumen de la comprobación, advertencias e interpretación.

- **Retorno**: `{ periodos, incompleto?, secciones, resumen, advertencias, interpretacion }`
  - `secciones`: por grupo, `{ id, titulo, filas, subtotal }`; cada fila tiene `cuenta`, `tipo`, `saldoInicial`, `saldoFinal`, `variacion`, `clasificacion`, `origen`, `aplicacion`, `falta`, `etiqueta` y `mensaje`
  - `subtotal`: `{ saldoInicial, saldoFinal, variacion, completo }`; es `null` si falta algún saldo
  - `resumen`: `{ totalOrigenes, totalAplicaciones, diferencia, estado, tolerancia, motivos }` con `estado` `'cuadra'`, `'no-cuadra'` o `'incompleta'` (hay motivos). Con `'incompleta'`, `totalOrigenes`, `totalAplicaciones` y `diferencia` son `null` (N/D): una suma parcial se leería como cifra firme; el detalle sigue en las filas
  - `incompleto`: con menos de dos periodos o sin balance de uno de ellos; entonces `secciones: []` y `resumen: null`
- **N/D**: los saldos faltantes (ausentes o que no son un número finito) se reportan como filas con `falta: 'falta-saldo'`, no como 0; los subtotales de esa sección quedan en `null`
- **Ejemplo**: `construirEOAF(estados, '2023', '2024')` con la demo MUNO MODA → `{ resumen: { totalOrigenes: 97775, totalAplicaciones: 97775, diferencia: 0, estado: 'cuadra' } }`

#### `interpretarEOAF(resultado)`
Lectura breve del estado en una o dos frases (mayor fuente, mayor aplicación, o la diferencia exacta si no cuadra).

- **Retorno**: `string`; los nombres de cuenta que aparecen pueden venir de un archivo importado: el llamador debe escaparlos (`escapeHTML`) antes de insertarlos en HTML

---

## efe-calculations.js

`js/modules/analisis/efe-calculations.js`. Lógica pura del Estado de Flujo de Efectivo por método indirecto (D-024), sin DOM ni `store`. Recibe los estados normalizados (o crudos con `accountTypes`) y dos periodos. La interfaz está en `index.js` (`computeEFE(period)`, que compara `period` con el periodo inmediatamente anterior, y `renderEFESection`). Comparte con el EOAF la selección del par de periodos, la tolerancia y la advertencia de balance (`comprobacion-calculations.js`).

#### `esResultadoAcumulado(nombre)`
`true` si el nombre corresponde a una cuenta de resultados acumulados o del ejercicio: utilidad(es) o resultado(s) acumulado(s), retenida(s), del ejercicio o del periodo; ganancias acumuladas o retenidas; pérdidas acumuladas; resultados de ejercicios anteriores. Es una consulta por nombre conservada por compatibilidad; el cálculo de `construirEFE` utiliza identificadores acreditados (D-088).

- **Ejemplo**: `esResultadoAcumulado('Utilidad acumulada')` → `true`; `esResultadoAcumulado('Reserva legal')` → `false`

#### `construirEFE(datos, periodoInicial, periodoFinal)`
Estima operación, inversión y financiamiento a partir de variaciones entre balances y comprueba su suma con la variación de efectivo. No confirma por sí sola los movimientos de efectivo ni los dividendos.

- **Retorno**: `{ periodos, incompleto?, naturaleza?, utilidadNeta, operacion, inversion, financiamiento, totalFlujos, efectivoInicial, efectivoFinal, variacionEfectivo, diferencia, tolerancia, estado, motivos, advertencias, interpretacion }`. Si se construye la estimación, `naturaleza` es `estimacion_por_variaciones`.
  - Cada actividad: `{ items: [{ concepto, monto, falta }], total }`; `monto` es `null` (N/D) si falta un dato. Un cambio de 0 es `0`, nunca `-0`
  - `estado`: `'cuadra'` (|diferencia| ≤ tolerancia), `'no-cuadra'` o `'incompleta'` (motivos: cuenta sin saldo, sin clasificar o con importe inválido, sin estado de resultados del periodo final, sin efectivo)
  - Sin balance de un periodo: `incompleto` y el resto en `null`
  - No lanza con importes que no son números: la cuenta o el estado de resultados quedan como motivo
- **Identidad**: CFO + CFI + CFF = efectivo final − efectivo inicial (D-024, D-025, D-026)
- **Advertencias**: límite de la estimación y necesidad de confirmar movimientos reales y no monetarios, además de balance que no cumple A = P + O, estado de resultados vacío, depreciación, dividendos negativos o identidades patrimoniales sin confirmar.
- **Patrimonio**: resultados y reservas se identifican por id. Una variación sin identidad confirmada impide atribuir su monto a aportaciones o dividendos; se conserva la variación agregada con advertencia (D-088).
- **Nota**: los nombres de cuenta de `motivos` y `advertencias` vienen del archivo: el llamador debe escaparlos con `escapeHTML`

#### `interpretarEFE(resultado)`
Lectura del estado: si la estimación cuadra o no y qué sugieren sus signos. La calcula `construirEFE`; se expone para pruebas. Aun cuando cuadre y la utilidad concilie, los dividendos y movimientos deben confirmarse con datos independientes.

Identifica los dividendos como derivados de las utilidades acumuladas y aclara que cuadrar no valida independientemente la utilidad neta. Se conservan la fórmula y la falta de confirmación del dato de dividendos. `construirEFE` reconoce «pérdida del ejercicio/periodo», omite el motivo sin clasificación cuando ambos saldos son cero y advierte movimientos opuestos entre reservas y resultados, sin redistribuir importes.

`conciliarConBalance(resultado, estados, periodoBase)` devuelve `null` cuando no hay comparación aplicable. Si las monedas difieren o falta efectivo acreditado en el periodo siguiente, devuelve `{ periodo, efectivo: null, diferencia: null, cuadra: null, motivo }` con `moneda_incompatible` o `efectivo_no_disponible`, respectivamente. Un efectivo declarado en cero puede conciliarse cuando coincide la moneda (D-087 y D-100).

---

## comprobacion-calculations.js

`js/modules/analisis/comprobacion-calculations.js`. Piezas comunes de las comprobaciones del EOAF y del EFE (D-027), sin DOM ni `store`.

#### `TOLERANCIA_COMPROBACION`
Constante `0.01`: un centavo, la misma tolerancia de `validateFinancialData`. No se redistribuyen diferencias.

#### `toleranciaComprobacion(...totales)`
Tolerancia efectiva: `TOLERANCIA_COMPROBACION` más `Number.EPSILON` escalado al mayor total en valor absoluto (mínimo 1). Los valores `null` o no finitos no cuentan.

- **Ejemplo**: `toleranciaComprobacion(5, 3)` → `0.01 + Number.EPSILON * 5`

#### `seleccionarPeriodoPar(periodos, periodoFinal?)`
El par de periodos a comparar. Sin `periodoFinal`: los dos más recientes en orden cronológico (`ordenarPeriodos`); con nombres sin año ("Marzo") se respeta el orden que dejó el usuario. Con `periodoFinal` en la lista: ese cierre contra el inmediatamente anterior; si no está en la lista, los dos más recientes. Los periodos repetidos cuentan una vez.

- **Retorno**: `{ periodoInicial, periodoFinal, periodos }` o `{ incompleto }` (menos de dos periodos, periodos no distintos o cierre sin periodo anterior)
- **Ejemplo**: `seleccionarPeriodoPar(['2025', '2023', '2024'])` → `{ periodoInicial: '2024', periodoFinal: '2025', periodos: ['2023', '2024', '2025'] }`; `seleccionarPeriodoPar(['2023', '2024', '2025'], '2024')` → `{ periodoInicial: '2023', periodoFinal: '2024', … }`

#### `variacionesDeCuentas(datos, grupo, periodoInicial, periodoFinal)`
Variación de cada cuenta de un grupo del balance (`'activos'`, `'pasivos'` o `'patrimonio'`) entre dos periodos: primero las cuentas del periodo inicial y después las que solo aparecen en el final.

- **Retorno**: `[{ cuenta, grupo, id, tipo, requiereDesglose, saldoInicial, saldoFinal, variacion }]`; `tipo` es `''` si la cuenta no se reconoce. D-101 reúne cuentas y `reportedTotals` y conserva una sola representación acreditada; `requiereDesglose` impide clasificar totales mixtos o PPE neto como una actividad de caja.
- **N/D**: un saldo ausente o que no es un número finito queda en `null` y la variación también; nunca se completa con 0 ni se suma como texto

#### `advertenciasDeBalance(datos, periodos, bgInicial, bgFinal)`
Una advertencia por periodo cuyo balance no cumple A = P + O (más allá de la tolerancia), con la diferencia exacta. `periodos` es `{ inicial, final }`.

- **Retorno**: `string[]`

---

## Módulos de la guía: inventario, equilibrio, flujo, planeación y proforma

Lógica pura en `js/modules/<modulo>/<modulo>-calculations.js` (sin DOM ni `store`). Cada pantalla (`<modulo>-ui.js`) recibe `page` y `{ datos, guardar, graficar? }`; su `index.js` lee el `store` y guarda con `setPersisted`.

| Archivo | Funciones públicas |
|---|---|
| `inventario/inventario-calculations.js` | `normalizarInventario(datos)`, `movimientosDeProducto(datos, productoId)`, `kardex(producto, movimientos)` → `{ filas, entradas, salidas, saldoFinal, primerNegativo }`, `resumenProducto(producto, movimientos)`, `calcularInventario(datos)` → `{ productos, valorTotal, unidadesTotales, porReponer, costoReposicionTotal }`, `validarProducto(datos, producto, idEditado)`, `validarMovimiento(datos, movimiento)`, `validarBorradoMovimiento(datos, id)`, `validarInventarioRespaldo(datos)`, `ejemploInventario()` |
| `equilibrio/equilibrio-calculations.js` | `normalizarEquilibrio(datos)`, `validarEquilibrio(datos)`, `calcularCVU(datos)` → `{ mcu, rmc, peUnidades, peVentas, unidadesMinimas, ventas, mcTotal, uaii, msUnidades, msVentas, msPorcentaje, gao, unidadesObjetivo, … }`, `aplicarCambios(datos, cambios)`, `calcularEscenarios(datos)`, `puntosGrafica(resultado)`, `baseDesdeEstados(estados, configApalancamiento, periodo, unidades)`, `ejemploEquilibrio()` |
| `flujo/flujo-calculations.js` | `normalizarFlujo(datos)`, `validarMovimientoFlujo(movimiento)`, `calcularFlujo(datos)` → `{ actividades, neto, totalEntradas, totalSalidas, variacionNeta, saldoFinal }`, `conciliarConBalance(resultado, estados, periodoBase)`, `ejemploFlujo()` |
| `planeacion/planeacion-calculations.js` | `SUPUESTOS`, `normalizarSupuestos(datos)`, `validarSupuestos(s, { parcial = false } = {})`, `ajustarLista(lista, n)`, `calcularPresupuestoMaestro(s)` → `{ ventas, compras, cbv, gastos, caja, resultados, equilibrio, cierre, totales, financiamientoMaximo, periodoFinanciamiento, avisos }`, `ejemploPlaneacion()` |
| `planeacion/planeacion-escenarios.js` | `tieneEscenarios(datos)` detecta el discriminante de versión. `validarEscenarios(datos)` verifica la forma, bases y supuestos parciales y devuelve los datos o lanza un error. `leerPlaneacion(datos)` devuelve `{ escenario, base, supuestos, error }` para el formato vigente o anterior. |
| `proforma/proforma-calculations.js` | `resultadosReales(estados)`, `resultadosProforma(presupuesto)`, `compararResultados(real, proforma)`, `indicadoresIntegrados(entradas, periodo)`, `alertasIntegradas(entradas)`, `construirReporte(entradas)` → `{ real, proforma, comparacion, motivoComparacion, efectivo, indicadores, alertas, faltantes }`, `razon(razones, clave, denominador?)` (razón de Análisis con N/D si su denominador es 0) |
| `inicio/inicio-calculations.js` | `tendenciaEstados(estados)` → `{ periodos, ventas, utilidadNeta, totalActivos }`, `kpisPrincipales(entradas)`, `areasClave(entradas)` (solo empresa), `resumenActivos(lista)` → `{ cantidad, costoTotal, valorLibros, pctDepreciado, requierenAtencion }`, `finanzasPersonales(presupuesto, activos)` (presupuesto personal y activos del hogar), `saludGeneral(areas, alertas)` → `{ nivel, puntaje, ok, alerta, texto }` (D-017), `panoramaGeneral(entradas, reporte, { presupuesto, activos })` |

`crearCasoComercial(datos, referencia, entradas)` toma el cierre de 2025 de `referencia_resultados.json` y los supuestos proyectados de `inputs.json`. Selecciona el escenario de capital de trabajo si ya existe o lo agrega conservando los anteriores. `seleccionarEscenario(datos, id)`, `duplicarEscenario(datos, id)` y `editarEscenario(datos, nombre, supuestos, capitalTrabajo?)` preparan los datos para que el llamador los guarde. Al omitir `capitalTrabajo` en la edición se conserva su valor guardado. Con `parcial: true`, `validarSupuestos` admite `null` para un dato pendiente y conserva las validaciones de tipo y rango.

#### `validarCapitalTrabajo(capital, supuestos)`

Devuelve una lista de errores. El escenario usa meses y el costo escalar queda en `null`. `capital.costosCompra` contiene un costo no negativo o `null` por mes. Los cuatro calendarios, `cobrosApertura`, `cobrosCredito`, `pagosApertura` y `pagosCredito`, son `null` si están pendientes o listas de 1 a 12 fracciones que suman 1 dentro de una tolerancia de `1e-7`. La primera fracción de apertura se aplica al primer mes del presupuesto. La primera fracción de crédito se aplica al mes siguiente al movimiento. Un cero explícito salta un plazo.

#### `calcularCapitalTrabajo(s, capital, fechaCorte, valorInventarioInicial = null)`

Recibe los supuestos mensuales ya validados con su apertura, la configuración anterior, la fecha de corte `AAAA-MM-DD` y el valor monetario de apertura. Devuelve `{ etiquetas, unidadesVendidas, existencias, costosCompra, valoracion, ventas, compras }`. Cada fila de existencias contiene `{ inicial, objetivo, compras, final }` en unidades. Cada bloque de ventas o compras incluye `meses`, `totales` de movimientos y `pendientes` después del horizonte.

`valoracion` contiene `meses` con `{ inicial, compras, costoVentas, final }` en C$ y `costoVentasTotal` para el horizonte. El cierre mensual multiplica las existencias finales por el costo promedio de las unidades disponibles. El costo de ventas es el valor disponible menos el cierre. El cierre se arrastra con toda su precisión. Una partida que requiere un dato ausente devuelve `null` y se conservan los ceros conocidos. El costo del horizonte requiere todos los meses (D-104).

Cada mes monetario devuelve `{ importe, contado, credito, liquidado, total, apertura, cierre, vencimientos }`. `liquidado` recoge los vencimientos de los saldos de apertura y del crédito de meses previos. `total` suma el contado del mes y la liquidación de crédito. Los vencimientos tienen `{ origen, vence, importe }`, con meses `AAAA-MM`. Un cálculo pendiente queda en `null`. Una lista de vencimientos vacía indica que se conoce que no hay partidas para ese plazo.

Inicio reutiliza la recolección de la proforma: `proforma/index.js` exporta `reunirEntradas()`, y `inicio/index.js` exporta `initInicio()`, `cargarEjemploEmpresa()` y `cargarEjemploPersonal()` (solo llenan módulos vacíos; devuelven los nombres cargados). Activos exporta `calcularEstado(activo)` y `ejemploActivos()`. `js/components/chart.js` exporta `refreshChartsTheme()`, que recolorea ejes y leyendas de las gráficas abiertas al cambiar de tema.

`areasClave(entradas)` omite el área de flujo si `entradas.flujo.disponible === false`: ese estado solo contiene un motivo y no totales. `panoramaGeneral` conserva el motivo entre los faltantes del reporte, sin evaluar ese flujo como salud financiera ni impedir que Inicio cargue.

Códigos de `avisos` del presupuesto maestro: `financiamiento`, `sin-compras`, `bajo-stock-minimo`, `perdida`, `bajo-equilibrio` y `sin-margen`.

`compararResultados(real, proforma)` conserva ambos valores de cada fila. Calcula la variación relativa y la diferencia de márgenes en puntos solo si el periodo real es un año `AAAA` y la proyección cubre 12 meses o 4 trimestres. En los demás casos `variacion` y `puntos` quedan en `null`. Si están presentes ambos resultados y falta comparabilidad temporal, `construirReporte` explica la causa en `motivoComparacion`.

`planeacionUI(page, opciones)` mantiene en la pantalla las vistas Resumen, Supuestos y Tablas completas. El borrador y la selección de consulta se conservan al cambiar de vista. `resumenPlaneacionUI(panel, presupuesto, capital)` presenta la salida de `calcularPresupuestoMaestro` o `calcularCapitalTrabajo`, según `capital`. Planeación puede recibir `destruirGrafica(id)` para retirar una gráfica al reemplazar la pantalla. Invoca `graficar(id, config)` al mostrar las tablas del presupuesto maestro.

`validarCajaDocente(plan)` valida el calendario opcional de Planeación. `proyectarCajaDocente(plan)` devuelve los meses del horizonte, cuotas de cobro y pago por origen, saldos diferidos, caja antes y después de operaciones declaradas y necesidad máxima. Los meses anteriores contribuyen al calendario y el efectivo comienza en la apertura declarada. Un importe que requiere una entrada desconocida queda en `null`.

`calcularERDocente(supuestos, metodo)` calcula porcentaje de ventas o fijo/variable. `calcularBalanceDocente(supuestos)` devuelve el balance por partida, la diferencia, la necesidad de fondos y el dividendo que elimina la diferencia cuando es viable. `calcularERResidualDocente(supuestos)` deriva ventas y gastos desde las premisas de rotación, costo sobre ventas y utilidad objetivo, y devuelve la actividad proyectada con crédito declarado.

`transferenciaBalance`, `transferenciaInventario`, `transferenciaCvuPlaneacion` y `transferenciaCvuInventario` devuelven `{ origen, filas, error }`. `firmaTransferencia` coteja el origen y los valores vigentes antes de aplicar. `fichaTransferencia` registra la revisión de una copia y `validarProcedencia` valida sus campos al restaurar un respaldo. La interfaz distingue valor actual, propuesto, unidad y naturaleza, y aplica únicamente las filas válidas que el usuario selecciona.

#### `validarInventarioRespaldo(datos)`

Recibe el módulo de Inventario del respaldo y devuelve `{ productos, movimientos }` normalizados. Lanza un error si la normalización descarta registros, una fecha no existe en el calendario, un costo explícito no es un número finito mayor o igual a cero, o cualquier saldo intermedio del kardex cae bajo la tolerancia de existencias. Valida por producto y fecha. Si dos movimientos comparten fecha, respeta el orden del archivo. Una entrada legada con la propiedad `costoUnitario` omitida usa el costo del producto según D-081.

Utilidades: `js/utils/form.js` (`leerNumero(texto)` → `{ vacio, valor }`, `nuevoId(prefijo)`, `fechaHoy()`), `js/utils/estados-guardados.js` (`estadosGuardados(estados)`, `totalesPeriodo(estados, periodo)`). `js/modules/analisis/index.js` exporta ahora `refreshSavedStates()` para que el reporte integrado no use estados en caché.


## Presentación de estados resueltos (D-096)

### `estadosResueltos(datos, periodo)`

Composición pura en `js/modules/estados/estados-presentacion-calculations.js`. Recibe los estados o su borrador estructurado y devuelve `{ balanceGeneral, estadoResultados }`, listas ordenadas con detalle y subtotales. Cada fila conserva `cuenta`, `valor`, `grupo`, `seccion`, `clave` y, cuando corresponde, `id`, `concepto`, `operador`, `origen`, `subtotal`, `orden`, `valorCalculo` y `motivos`. `valor` preserva un reportado, mientras `valorCalculo` expresa su disponibilidad para operar; AV toma de él la base de ventas netas. Una fila calculada no modifica datos, identidades, reportados ni store. Valor faltante = `null`; periodo inexistente = listas vacías. Los grupos de balance sin datos no se convierten en cero. Usa totales existentes y los derivados del ER del motor; la consulta temporal de UAI conserva su expresión antes del impuesto. Un importe incompleto del borrador no invalida subtotales independientes ni elude la validación de guardado.

Ejemplo docente de julio con partidas complementarias acreditadas explícitamente: ventas 72000, costo 42000 y gastos 19000 producen UB 30000 y UAII 11000; intereses 1000 dan UAI 10000; impuesto 3000 da UN 7000. Sin el impuesto, UN = `null` y UAI sigue en 10000.

### Renderizado común

`js/modules/estados/estados-presentacion-ui.js` exporta `etiquetaFilaEstado(fila, { mostrarOrigen = true } = {})`, `origenFilaEstado(fila, cuentaVisible = fila?.cuenta)` y `tablasEstadosResueltos(datos, periodos)`. Devuelven HTML escapado con nombres originales, concepto canónico, signos y procedencia. La tabla distingue reportado/calculado por periodo. No persisten información.

`filasAnalisis`, `analisisHorizontalCompleto` y `analisisVerticalCompleto` consumen esta lectura. AH añade `fuenteT1` y `fuenteT2` para distinguir procedencia y nombres por columna; no modifica Δ/abs(T1). Los datos suplementarios y pendientes se conservan. Los valores reportados discordantes no se sustituyen: se señalan para revisión.

### `construirEFE`: cierre calculado

Añade `efectivoFinalCalculado`, igual a efectivo inicial + total de flujos cuando ambos son finitos; si falta un operando, `null`. Se presenta por separado de `efectivoFinal`, que sigue siendo el saldo observado del balance. `diferencia`, conciliación, tolerancia, naturaleza estimada y actividades conservan su contrato.


## Desarrollo de Planeación y fuente de Proforma (D-097)

`desarrolloPresupuesto(presupuesto, indice = null)` en `planeacion-desarrollo-calculations.js` devuelve `{ etiqueta, resultados, caja }` para un presupuesto completo ya calculado. `null` selecciona el horizonte; un índice válido, su periodo. Cada paso incluye clave, concepto, fórmula descriptiva, expresión con operandos/formato y valor existente; un valor no finito se conserva N/D. No calcula ni persiste otro presupuesto. Devuelve `null` sin presupuesto completo o con índice fuera de rango. El IR agregado suma periodos y los saldos de caja usan apertura/cierre, no sumas de saldos.

`tablaDesarrollo(pasos)` en `planeacion-desarrollo-ui.js` genera HTML escapado, con concepto, cálculo y resultado; en móvil el cálculo queda bajo el concepto. La usan Planeación y Proforma. `resumenPlaneacionUI` ofrece Resultado/Caja en el modelo completo y consulta de horizonte/periodo; el modelo parcial conserva cobros/pagos y saldos, con pendientes declarados.

`resultadosReales` ahora consume `estadosResueltos` y los márgenes de `computarRazonesDesdeDatos`. Expone `uai` y `otrosOperativos`, además de los campos previos, y conserva N/D según las mismas identidades/entradas que Estados y Razones. `resultadosProforma` conserva los totales de Planeación y añade su `uai`. Los otros ingresos operativos y no operativos no están modelados en la proyección y quedan `null`, que la comparación identifica como no aplicables a esa columna.

`construirReporte` añade `desarrollo` (o `null`) y `motivoPresupuesto` para explicar una proyección ausente. El real y la proyección permanecen separados y las variaciones siguen limitadas a coberturas anuales comparables. La traza no altera el estado guardado ni el reporte de financiamiento requerido.

## Cuentas opcionales y disponibilidad (D-098)

`separarCuentasOpcionales(filas, fuentes = fila => [fila])`, en `estados-presentacion-ui.js`, devuelve `{ visibles, opcionales }` preservando orden y referencias, sin mutarlas. Solo compacta ids accesorios enumerados en ese archivo cuando todas las fuentes existen, tienen origen `importado`, valor exactamente cero y no son subtotales. Un dato ausente, N/D, desconocido, principal o calculado conserva su fila. El callback permite examinar todos los periodos en el editor/AV, las columnas elegidas en la vista multiperiodo y el par de AH. Ejemplo: una devolución importada con cero en ambos periodos se compacta; Franquicias 60000/0 conserva ambos valores. No interpreta ni cambia `absence_policy`.

`desplegableCuentasOpcionales(filas, contenido)` devuelve el HTML de un `<details>` cerrado, con cantidad y explicación, o cadena vacía sin filas. `contenido` debe ser HTML ya escapado por el render de tablas. No modifica ni elimina datos; en el editor las filas conservan sus manejadores e índices.

`disponibilidadRazones(razones)`, en `analisis-disponibilidad-ui.js`, presenta los motivos existentes de los indicadores N/D de la pestaña Razones (23, sin CNT). Agrupa causa/cuenta/periodo, traduce ids conocidos a nombres de catálogo y lista indicadores afectados. Conserva cero como resultado calculable; devuelve cadena vacía sin N/D. Escapa todos los textos de los datos. No consulta el store ni ejecuta fórmulas.

## Reparación de disponibilidad del motor (D-099)

- `normalizeFinancialData` conserva y valida `coberturaEstados?: { [periodo]: { activos?, pasivos?, patrimonio?, estadoResultados? } }`. Valores permitidos: `sin_confirmar`, `parcial`, `completo`. Rechaza periodos/grupos adicionales, arrays y valores desconocidos. Sin el campo no lo agrega; mantiene compatibilidad con archivos anteriores.
- `GRUPOS_COBERTURA`, `ESTADOS_COBERTURA` y `coberturaCompleta(coberturaDelPeriodo, grupo)` en `estados-cobertura.js` comparten el vocabulario. La función devuelve booleano y solo reconoce el literal `completo`.
- `crearEntradaRazones` traduce la cobertura a `current`/`previous`, sin añadir cuentas. El intérprete conserva N/D en importe explícito inválido, grupo sin datos, suplemento desconocido o pendiente con monto. Solo el detalle realmente ausente en un grupo completo con datos puede aportar cero confirmado. Las cuentas reportadas no se rellenan con cero.
- `calcularRazon`/`evaluarDerivado` conservan el total reportado si solo falla su comprobación. Motivo nuevo `reported_subtotal_unverifiable`, con `id`, `periodo`, `causas`; no es una indisponibilidad del resultado. `reported_subtotal_mismatch` conserva su contrato y tolerancia. `calcularRazonConTraza` añade `origen: 'no_aplica_por_cobertura'` únicamente a las lecturas cuyo cero provenga de esa declaración.
- `motivoComposicion(error, entrada)` se traslada del adaptador al motor y se exporta para compartir la clasificación de los dos errores contractuales de composición. Devuelve motivo o `null`; no clasifica ni silencia errores inesperados.
- `crearContextoRazonesGuardadas(datos, periodo, { cuentasNoDisponibles = [] } = {})` admite la proyección del editor: entradas `{ id, periodo }` marcan importes explícitamente desconocidos de un borrador con campos vaciados. No se persiste esa proyección. La cobertura no convierte estos campos en cero.
- `consultarMontoCuenta` y `montoCuenta` aceptan la cobertura para detalle ausente, con las mismas restricciones de grupo con datos; no cambian importes presentes, reportados ni pendientes. `computeFinancialTotals` aplica la declaración también a depreciación/deducciones ausentes; no reemplaza todo su algoritmo de sumas.
- `loadDemo` guarda mediante `setPersisted('estados', normalizeFinancialData(getDemoData()))`, módulo completo con sus metadatos, y propaga el fallo de persistencia. Los importes originales de la demo no cambian.
- `disponibilidadRazones` ahora puede devolver un panel **Resultados con advertencias** aunque no haya N/D, sin contar avisos de totales como indisponibilidades. El resto de su contrato y el escape de textos se mantienen.

## Catálogo y unidad monetaria (D-100)

- `listarEjemplos(modulo)` y `crearEjemplo(modulo, id, actual)`, en `js/examples/catalogo.js`: metadatos clonados y datos nuevos por selección; id desconocido lanza error. `actual` aporta la fábrica existente del módulo, sin dependencia circular con sus pantallas. Los datos docentes se registran con `registrarCuenta`, identidades y cobertura explícita.
- `ejemploBaker`, `ejemploBartlett`, `ejemploPractico2`, `completarEjemploMuno(base)` en `ejemplos-estados.js` generan documentos nuevos; la última conserva BG/ER y declara suplementos ficticios sin mutar la base. `getDemoData` y `loadDemo` ofrecen esta versión integral.
- `panelEjemplos(modulo, boton, opciones?)`, `vincularEjemplos(page, modulo)` y `ejemploSeleccionado(page, modulo, actual)` en `components/ejemplos.js`: HTML escapado, actualización de metadatos y lectura explícita de selección. El selector no escribe en el store; WeakMap conserva su estado durante redibujados de un contenedor.
- `monedaDe(datos)` y `normalizarMoneda(datos)` en `utils/moneda.js`: C$ por compatibilidad, USD o UM explícitos; el normalizador rechaza otras unidades y conserva la ausencia del campo. Se propaga en los normalizadores de Estados, Flujo y Equilibrio y sus resultados. El formato usa el segundo argumento ya existente de `formatCurrency`/`formatCurrencyND`, sin conversión de divisas.
- `resultadosReales` declara su moneda. La comparación de Proforma conserva cada columna y sus importes, pero no calcula variaciones entre monedas distintas. Los indicadores monetarios de Mercado/EFE llevan su moneda cuando está declarada. `interpretarEOAF` e `interpretarEFE` aceptan un segundo argumento opcional de moneda (C$ por defecto), sin cambiar el cálculo.

## Reparación del contraste independiente (D-101 y D-102)

Revisión de Carlos (2026-11-08): `computeFinancialTotals` conserva activos totales/PPE neto reportados cuando falta depreciación para reconstruirlos; los avisos identifican únicamente las magnitudes no disponibles. AV utiliza el activo reportado como base sin exigir cobertura completa. Las acciones de tomar saldos en `flujoUI` y `planeacionUI` verifican `monedaDe` antes de modificar o persistir; un rechazo conserva el destino y las ediciones del borrador.

- `totalesPeriodo(estados, periodo?)` conserva la validación y los totales del balance; ventas brutas, ventas netas, UB y UN se leen de `estadosResueltos`. Devuelve N/D para ER vacío sin perder el balance. Ejemplo: Baker 2011 conserva A 2900000 y devuelve `utilidadNeta: null`; Baker 2012 devuelve 180000. Inicio y Mercado comparten esa lectura.
- `construirEFE` usa `obtenerUtilidadNetaMotor`. Un ER vacío no acredita cero. PPE neto sin desglose deja depreciación/inversión N/D; UN y efectivo disponibles se conservan. Los resultados siguen siendo estimaciones de saldos, incluso cuando cuadran.
- `esTotalDuplicado` se conserva como consulta estructural de ids por compatibilidad. No certifica que el detalle concilie; la selección de `variacionesDeCuentas` comprueba importes y evita sumar reportado y componentes juntos. Los avisos de balance explican cuándo el detalle no puede comprobar un total.
- `ejemploBartlettClase()` devuelve un documento nuevo identificado como razones de clase, con los BG/ER de Bartlett y suplementos solo en 2012. Se ofrece como `bartlett-clase` en Estados e Inicio empresa. No muta el histórico.
- `supp.credit_purchases`: base de compras declarada, suplementaria y positiva, requiere dato; ausencia N/D y cero explícito válido. Los tres derivados JSON de compras usan `reported_or_calculate`: dato declarado primero, fórmula anterior de pagos + ΔCxP si falta. No hay porcentaje automático de CBV. `usaComprasReales` conserva su uso legado para compras derivadas y es falso para una base declarada que podría ser estimada.
- El motor no deduce ventas brutas cero desde una venta neta reportada sin bruto ni componentes, aunque ER esté completo. Un bruto cero explícito se conserva; sus discrepancias con el neto no se corrigen silenciosamente.


## Presupuesto estudiantil (D-109)

Archivo `js/modules/presupuesto/presupuesto-calculations.js`, sin DOM/store:

| Exportación | Contrato |
|---|---|
| `nuevoPresupuestoEstudiantil()` | Documento nuevo `{version:1, meta:{nombre,descripcion,costo:null,semanas:20,inicio:null}, movimientos:[], proyecciones:{real,deseada}}`; cada plan tiene frecuencia, ingreso nullable y nueve partidas `{categoria,monto,tipo,comentario}`. |
| `normalizarEstudiantil(datos)` | Copia validada o excepción descriptiva. Fechas ISO reales, lunes inicial, 1–52 semanas; hasta 5000 movimientos con ID único, fecha dentro del periodo, tipos/listas válidos y monto finito no negativo. Planes con sus nueve categorías en orden, montos nullable y clasificaciones válidas. No modifica la entrada. |
| `semanaDeFecha(fecha,inicio,duracion)` | Semana 1..duración o `null` si es inválida/fuera de rango. |
| `desplazarFecha(fecha,dias)` | Fecha ISO por desplazamiento UTC o `null` con entrada inválida. |
| `calcularSeguimiento(datos)` | Documento validado → `{semanas,ingreso,gasto,ahorro,reserva,saldo,avance,aporteRecomendado,final}`. Cada semana incluye bloque, desde/hasta, cuatro flujos, saldo, acumulado, avance y cantidad de movimientos. |
| `calcularProyeccion(plan)` | Plan normalizado → `{total,ahorro,reserva,diferencia,porcentaje,estado,limiteSemanal,partidas}`; partidas incluyen porcentaje del ingreso. Pendiente/base cero conserva N/D; clasificación no cambia el destino de ahorro/reserva. |
| `resumenEstudiantilGuardado(presupuesto)` | `null` si no hay modelo estudiantil activo; resumen realizado para Inicio/Reportes, o `{estudiantil:true, ingresos:null,gastos:null,metaAhorro:null,error}` si es ilegible. Nunca hace fallback a otro modelo al fallar. |

`presupuestoEstudiantilUI(page,{inicial,guardar,verMensual})` usa cuatro vistas, guardado explícito y edición por ID. `guardar(documento)` debe lanzar si la persistencia falla. `initPresupuesto()` conserva las exportaciones anteriores desde `presupuesto-mensual.js`. `ejemploEstudiantil` y `ejemploSoloTransporte` crean copias nuevas desde `ejemplos-estudiantiles.js`.

`resumenPresupuestoEstudiantil(resumen)` en `integracion-reporte.js` genera HTML escapado, compartido por el dashboard, vista previa y descarga. Funciona sin estados empresariales. Los respaldos estudiantiles usan `{presupuesto:{vista:'estudiantil',estudiantil:documento}}` y se restauran con la validación habitual de Reportes, conservando los demás campos del módulo.
