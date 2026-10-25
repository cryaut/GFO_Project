# Dominio financiero

Notación, convenciones de cálculo, tipos de cuenta y catálogo de funciones existentes. Léelo antes de escribir o cambiar una fórmula. Si agregas una función, agrégala al catálogo en el mismo PR.

## Notación

| Símbolo | Significado | En el código |
|---|---|---|
| Ventas | Ingresos por ventas | `ventas` |
| — | Costo de ventas (escríbelo completo; no uses "CV") | `costoVentas` |
| UB | Utilidad bruta | `utilidadBruta` |
| GA, GV | Gastos de administración y gastos de ventas | `gastosAdmin`, `gastosVentas` |
| UAII | Utilidad antes de intereses e impuestos (utilidad operativa) | `utilidadOperativa` en `computeRazones` |
| I | Intereses (gasto financiero) | `intereses` |
| UAI | Utilidad antes de impuestos = UAII + otros ingresos − otros gastos − I | Se deriva en apalancamiento (paso 03) |
| IR | Impuesto sobre la renta (monto) | `impuestos` |
| T | Tasa de impuesto sobre la renta | `tasaImpuesto(ir, uai)`; por defecto `TASA_IR_DEFECTO` (30 %) |
| UN | Utilidad neta | `utilidadNeta` |
| DAP | Dividendos de acciones preferentes | Campo del módulo de apalancamiento (paso 03) |
| UDAC | Utilidad disponible para accionistas comunes = UN − DAP | Se usa en el GAF y el GAT por variación |
| CV, CF | Costos variables y costos fijos | Se derivan en apalancamiento con la clasificación de cada cuenta (paso 03) |
| MC | Margen de contribución = Ventas − CV | Primer parámetro de `gao` y `gat` |
| GAO, GAF, GAT | Grados de apalancamiento operativo, financiero y total | `gao`, `gaf`, `gat` y sus versiones `...Variacion` |
| AC, PC | Activo corriente y pasivo corriente | `activosCorrientes`, `pasivosCorrientes` |
| CxC, CxP | Cuentas por cobrar y cuentas por pagar | `cxC`, `cuentasPorPagar` |
| CNT, CNO | Capital neto de trabajo y capital neto operativo | `capitalNetoTrabajo`, `capitalNetoOperativo` |
| PPC | Plazo promedio de cobro | `plazoCobro`, `PPC` en `computeRazones` |
| P, CVu, Q | Precio, costo variable unitario y unidades (C-V-U) | `precio`, `costoVariableUnitario`, `unidades` en `equilibrio` |
| MCu, RMC | Margen de contribución unitario (P − CVu) y razón de margen (MCu / P) | `margenContribucionUnitario`, `razonMargenContribucion` |
| PE | Punto de equilibrio, en unidades (CF / MCu) o en C$ (CF / RMC) | `puntoEquilibrioUnidades`, `puntoEquilibrioVentas` |
| MS | Margen de seguridad = (ventas − PE) / ventas | `margenSeguridad` |
| CBV | Costo de bienes vendidos = inventario inicial + compras − inventario final | `costoBienesVendidos` |

### Cascada del estado de resultados

Así se calculan hoy la utilidad operativa (`computeRazones`) y la utilidad neta (`computeFinancialTotals`):

```
  Ventas
− Costo de ventas
= Utilidad bruta (UB)
− Gastos de administración (GA) − Gastos de ventas (GV)
= UAII (utilidad operativa)
+ Otros ingresos − Otros gastos − Intereses (I)
= UAI
− Impuesto sobre la renta (IR)
= Utilidad neta (UN)
```

Otros ingresos y otros gastos son no operativos: quedan fuera de la UAII.

## Convenciones de cálculo

1. **N/D es `null`.** D-047 exige N/D antes de operar cuando falta un operando obligatorio (`null` o `undefined`), incluidas funciones legadas. Los defaults opcionales y tasas que no intervienen mantienen su contrato. No se cambian fórmulas ni casos completos, incluidas las convenciones legadas para denominadores cero. D-048 protege también las operaciones previas de Análisis y conserva sus motivos.
2. **Compara solo números.** En JavaScript `null < 2` es `true`. Antes de comparar una razón con un umbral, verifica `typeof v === 'number' && Number.isFinite(v)` (ver `hayDato` en `analisis/index.js`).
3. **Año de 365 días.** Plazos, edades y ciclos usan `DIAS_ANIO` (`calculate.js`).
4. **Saldos promedio.** Rotaciones, ROA, ROE y DuPont usan `(saldo inicial + saldo final) / 2` con `saldoPromedio`. Con un solo periodo se usa el saldo final.
5. **Signos.** En el estado de resultados, costos y gastos se guardan en positivo y se restan. La depreciación acumulada se guarda en negativo dentro de activos.
6. **Totales por tipo, nunca por nombre.** `computeFinancialTotals(datos, periodo)` suma las cuentas según su tipo. Una cuenta pendiente con importe anula sus totales posibles y deja motivo en `notAvailableReasons`; una sin tipo y distinta de cero aparece en `unclassified`. El alcance depende de clasificación/candidatos; un gasto pendiente puede afectar utilidad neta sin anular utilidad bruta.
7. **Umbrales de interpretación.** Están en `UMBRALES` (`analisis/index.js`) y son referencias educativas: ratio corriente ≥ 1, prueba ácida ≥ 0.5, endeudamiento ≤ 60 %, deuda/patrimonio ≤ 1, cobertura de intereses ≥ 2, margen bruto ≥ 30 %, margen operativo ≥ 10 %, margen neto ≥ 5 %, ROA ≥ 5 %, ROE ≥ 10 % y ciclo de conversión ≤ 60 días. Se cambian ahí, no dentro de las fórmulas.
8. **Moneda.** Córdobas (`C$`) con formato `es-NI` mediante `formatCurrency`.

## Tipos de cuenta (`ACCOUNT_TYPES`)

Definidos en `js/modules/estados/estados-calculations.js`. Cada cuenta de los estados tiene uno de estos tipos en `accountTypes`.

| Grupo | Tipo | Significado |
|---|---|---|
| activos | `efectivo` | Caja, bancos y equivalentes (corriente) |
| activos | `cxC` | Cuentas por cobrar y clientes (corriente) |
| activos | `inventario` | Inventarios y mercaderías (corriente) |
| activos | `activosCorrientesOtros` | Otros activos corrientes |
| activos | `activosFijos` | Terrenos, edificios, equipos y vehículos (no corriente) |
| activos | `depreciacionAcumulada` | Depreciación acumulada, en negativo (se resta de los activos fijos) |
| pasivos | `cuentasPorPagar` | Proveedores (corriente) |
| pasivos | `pasivoCortoPlazo` | Deuda financiera corriente |
| pasivos | `provisiones` | Provisiones (corriente) |
| pasivos | `pasivoLargoPlazo` | Pasivos no corrientes |
| patrimonio | `patrimonio` | Capital, reservas y utilidades acumuladas |
| estadoResultados | `ventas` | Ingresos por ventas o servicios |
| estadoResultados | `costoVentas` | Costo de ventas |
| estadoResultados | `gastosAdmin` | Gastos de administración |
| estadoResultados | `gastosVentas` | Gastos de ventas |
| estadoResultados | `otrosIngresos` | Otros ingresos (no operativos) |
| estadoResultados | `otrosGastos` | Otros gastos (no operativos) |
| estadoResultados | `intereses` | Gastos financieros |
| estadoResultados | `impuestos` | Impuesto sobre la renta |

- Activo corriente = efectivo + cxC + inventario + activosCorrientesOtros.
- Pasivo corriente = cuentasPorPagar + pasivoCortoPlazo + provisiones.

Agregar un tipo (por ejemplo, dividendos preferentes) toca cuatro lugares: `ACCOUNT_TYPES`, las reglas de `inferAccountType`, `TYPE_ALIASES` en `estados-import.js` y `computeFinancialTotals`, además de sus tests. Es un cambio compartido: coordínalo con el responsable de Estados.

## Catálogo de funciones

### `js/utils/calculate.js`

"Legado" identifica convenciones históricas; D-047 unifica el manejo de operandos ausentes, sin modificar casos completos ni sus excepciones con cero.

**Base**

| Función | Qué calcula |
|---|---|
| `DIAS_ANIO` | Constante: 365 |
| `saldoPromedio(inicial, final)` | (inicial + final) / 2; N/D si falta un saldo. Análisis selecciona saldo final explícitamente con un solo periodo. |
| `variacion(final, inicial)`, `ahDelta(t2, t1)` | Diferencia absoluta |
| `ah(delta, t1)`, `ahPctDelta(t2, t1)` | Variación relativa; `null` si t1 es 0 |
| `av(cuenta, base)` | cuenta / base (legado) |

**Liquidez**

| Función | Qué calcula |
|---|---|
| `ratioCorriente(AC, PC)` | AC / PC (legado) |
| `ratioRapido(AC, inventario, PC)` | (AC − inventario) / PC (legado) |
| `pruebaDefensiva(efectivo, PC)` | efectivo / PC; `null` si PC es 0 |
| `capitalNetoTrabajo(AC, PC)` | AC − PC |
| `capitalNetoOperativo(ACop, PCop)` | AC operativo − PC operativo |

**Actividad**

| Función | Qué calcula |
|---|---|
| `rotacionInventario(costoVentas, inventarioProm)` | Veces por periodo (legado) |
| `edadInventario(rotInv)` | DIAS_ANIO / rotInv |
| `rotacionCxC(ventas, cxcProm)` | Veces por periodo (legado) |
| `plazoCobro(rotCxC)` | DIAS_ANIO / rotCxC (legado) |
| `rotacionCxP(costoVentas, cxpProm)` | Veces por periodo; el costo de ventas aproxima las compras |
| `plazoPago(rotCxP)` | DIAS_ANIO / rotCxP |
| `cicloConversion(plazoCobroDias, rotInv, rotCxP)` | Plazo de cobro + edad del inventario − plazo de pago |
| `rotacionActivos(ventas, activoProm)` | Ventas / activo total promedio |
| `rotacionActivosFijos(ventas, activosFijosNetos)` | Ventas / activo fijo neto |
| `rotacionCapitalTrabajo(ventas, CNT)` | Ventas / CNT |

**Endeudamiento y cobertura**

| Función | Qué calcula |
|---|---|
| `endeudamiento(pasivo, activo)` | Pasivo / activo (legado) |
| `deudaPatrimonio(pasivo, patrimonio)` | Pasivo / patrimonio |
| `apalancamiento(activoProm, patrimonioProm)` | Multiplicador de capital de DuPont. No es GAO, GAF ni GAT: esos son `gao`, `gaf` y `gat` |
| `solvencia(activo, pasivo)` | Activo / pasivo |
| `coberturaIntereses(UAII, intereses)` | UAII / I |

**Rentabilidad**

| Función | Qué calcula |
|---|---|
| `margenBruto(UB, ventas)` | UB / ventas |
| `margenOperativo(UB, GA, GV, ventas)` | (UB − GA − GV) / ventas |
| `margenNeto(UN, ventas)` | UN / ventas (legado) |
| `roa(UN, activoProm)` | UN / activo promedio (legado) |
| `roe(UN, patrimonioProm)` | UN / patrimonio promedio |
| `dupont(UN, ventas, activoProm, patrimonioProm)` | `{ PM, AT, EM, ROE }` con ROE = PM × AT × EM (legado) |

**Apalancamiento.** Devuelven `null` si falta un dato o el denominador es ≈ 0; los grados negativos se devuelven tal cual.

| Función | Qué calcula |
|---|---|
| `TASA_IR_DEFECTO` | Constante: 0.30 |
| `tasaEfectiva(IR, UAI)` | IR / UAI; `null` si UAI ≤ 0 o el resultado no está en [0, 1) |
| `tasaImpuesto(IR, UAI, tasaDefecto)` | La tasa efectiva o, si no existe, `tasaDefecto` |
| `denominadorGaf(UAI, DAP, T)` | UAI − DAP / (1 − T); la UAI si DAP = 0 |
| `gao(MC, UAII)` | MC / UAII |
| `gaf(UAII, UAI, DAP, T)` | UAII / (UAI − DAP / (1 − T)) |
| `gat(MC, UAI, DAP, T)` | MC / (UAI − DAP / (1 − T)) = GAO × GAF |
| `gaoVariacion(ventasBase, ventas, UAIIbase, UAII)` | %ΔUAII / %ΔVentas |
| `gafVariacion(UAIIbase, UAII, UDACbase, UDAC)` | %ΔUDAC / %ΔUAII |
| `gatVariacion(ventasBase, ventas, UDACbase, UDAC)` | %ΔUDAC / %ΔVentas |

Ronda 6: `tasaImpuesto` conserva la política D-005 de `main`, incluida una tasa configurada válida con IR/UAI ausentes. Apalancamiento delega esa selección en el helper y mantiene IR N/D si no existe cuenta. Es la excepción aclarada en D-047; `saldoPromedio` y las demás guardas de N/D se conservan.

**Flujos, activos y presupuesto**

| Función | Qué calcula |
|---|---|
| `eoaf(cuenta, cambio, tipo)` | Clasifica un cambio como `'Origen'` o `'Aplicacion'`; `null` si el cambio es 0 |
| `efeIndirecto(UN, ajustes)` | UN + suma de ajustes (pruebas; la pestaña EFE usa `construirEFE`) |
| `construirEFE(datos, inicial, final)` | EFE indirecto: operación (UN + depreciación + capital de trabajo), inversión, financiamiento y comprobación CFO+CFI+CFF = Δ efectivo (tolerancia 0.01). Dividendos = UN − ΔRE si hay utilidades acumuladas; depreciación = Δ de la magnitud de la depreciación acumulada |
| `depAnualLineaRecta(costo, residual, vidaUtil)` | (costo − residual) / vida útil; 0 si la vida útil es ≤ 0 |
| `depAcumulada(depAnual, anios, vidaUtil)` | depAnual × mín(años, vida útil) |
| `valorEnLibros(costo, depAcumulada)` | costo − depreciación acumulada |
| `ahorroMensual(meta, meses)` | meta / meses |
| `saldoSemanal(ingreso, gastos, ahorro, reserva)` | ingreso − gastos − ahorro − reserva |
| `capacidadAhorro(ingresos, gastos)` | ingresos − gastos (presupuesto personal) |
| `tasaAhorro(capacidad, ingresos)` | capacidad / ingresos; `null` si los ingresos no son positivos |

**Estado de Origen y Aplicación de Fondos (EOAF).** Se arma en `js/modules/analisis/eoaf-calculations.js` con el balance comparado de dos periodos (los dos más recientes, como el resto de Análisis). Cada variación se clasifica con el grupo y el tipo de `ACCOUNT_TYPES`: activo que aumenta = aplicación, activo que disminuye = origen; pasivo o patrimonio que aumenta = origen y que disminuye = aplicación; sin variación no genera movimiento. La depreciación acumulada se clasifica por la variación de su magnitud (magnitud creciente = origen) porque el modelo no guarda el gasto del periodo por separado. Los subtotales y totales solo suman saldos y no generan movimientos; la comprobación es `Σ orígenes − Σ aplicaciones` con tolerancia de C$ 0.01, sin redistribuir diferencias.

**Punto de equilibrio y C-V-U.** `null` si falta un dato o el margen de contribución no es positivo.

| Función | Qué calcula |
|---|---|
| `margenContribucionUnitario(P, CVu)` | P − CVu |
| `razonMargenContribucion(MCu, P)` | MCu / P |
| `puntoEquilibrioUnidades(CF, MCu)` | CF / MCu |
| `puntoEquilibrioVentas(CF, RMC)` | CF / RMC |
| `unidadesUtilidadObjetivo(CF, UO, MCu)` | (CF + UO) / MCu |
| `margenSeguridad(ventas, ventasEquilibrio)` | (ventas − PE) / ventas, en unidades o en C$ |

**Inventario, flujo de efectivo y presupuesto maestro.** `null` si falta un dato.

| Función | Qué calcula |
|---|---|
| `existenciaFinal(inicial, entradas, salidas)` | inicial + entradas − salidas |
| `valorInventario(existencia, costoUnitario)` | existencia × costo unitario |
| `necesitaReposicion(existencia, stockMinimo)` | `true` si existencia ≤ stock mínimo |
| `flujoNeto(entradas, salidas)` | entradas − salidas de una actividad |
| `variacionNetaEfectivo(operacion, inversion, financiamiento)` | suma de los tres flujos |
| `saldoFinalEfectivo(saldoInicial, variacionNeta)` | saldo inicial + variación neta |
| `comprasPresupuestadas(ventas, invFinalDeseado, invInicial)` | unidades a comprar; puede ser negativo |
| `costoBienesVendidos(invInicial, compras, invFinal)` | CBV en C$ |
| `financiamientoRequerido(saldoFinal, saldoMinimo)` | máx(0, saldo mínimo − saldo final) |

**Razones de mercado.** `null` si falta un dato o el denominador no es positivo (P/U con UPA ≤ 0 es N/D). Uso por periodo en `js/modules/analisis/mercado-calculations.js`.

| Función | Qué calcula |
|---|---|
| `utilidadPorAccion(UDAC, acciones)` | UPA = (UN − DAP) / acciones comunes |
| `precioUtilidad(precio, UPA)` | P/U |
| `valorLibrosPorAccion(patrimonio, acciones)` | Patrimonio común / acciones |
| `precioValorLibros(precio, VLPA)` | P/VL |
| `dividendoPorAccion(dividendos, acciones)` | DPA |
| `razonPagoDividendos(DPA, UPA)` | DPA / UPA |
| `rendimientoDividendo(DPA, precio)` | DPA / precio |

**Nombres reemplazados.** No los vuelvas a crear; el test `razones-unificadas` falla si reaparecen.

| Nombre anterior | Usa |
|---|---|
| `rotacionActivosTotales` | `rotacionActivos` |
| `periodoPromedioPago` | `plazoPago` |
| `cicloConversionEfectivo` | `cicloConversion` |
| `razonDeudaPatrimonio` | `deudaPatrimonio` |
| `rotacionPasivos` | `rotacionCxP` |

### Otros módulos con lógica reutilizable

D-051: los intereses ganados (`is.interest_income`) son componente de los ingresos no operativos (`is.nonoperating_income`) al calcular la utilidad neta sin utilidad reportada. El catálogo lo expresa mediante `agrupadoEn`; ambas cuentas conservan `tipoApp: 'otrosIngresos'`. Es una relación de catálogo: las consultas por id siguen devolviendo solo ese id y no agregan componentes automáticamente. Las fórmulas actuales y los JSON se conservan.

Disponibilidad de cuentas (D-043 y excepción limitada D-047/D-048 a D-044): una cuenta pendiente con saldo cero no aplica al cálculo de ese periodo. Con importe distinto de cero se invalidan sus tipos/subtotales posibles y el total del grupo, incluidos datos legados sin tipo; se conservan los importes. Los motivos de Estados enumeran `campos`. Análisis preserva los metadatos y protege utilidad bruta/operativa, compras y capital de trabajo antes de llamar a los helpers; no se reinstala el adaptador que anulaba razones por grupo. El resultado incluye `notAvailableReasons`. Los nombres fijos de respaldo permanecen pendientes (1c). EFE/EOAF solo omiten la falta de clasificación cuando **ambos saldos explícitos son cero**. EFE deriva dividendos: conciliar no verifica UN independientemente.

| Archivo | Funciones |
|---|---|
| `js/modules/estados/cuentas-identificador.js` | `obtenerCuenta(id)`, `listarCuentas({ grupo })`, `identificarCuenta(texto, { grupo, clasificacion, id })`, `montoCuenta(datos, periodo, id)`, `consultarMontoCuenta(datos, periodo, id)`, `resumenIdentificacion(datos)`, `resolverClasificacion(grupo, valor)`, `tipoCuentaLegada(grupo, nombre)`, `versionCatalogo` |
| `js/modules/estados/cuentas-similitud.js` | `normalizarCuenta(texto)`, `distanciaDamerau(a, b)`, `similitudCuentas(texto, candidato)`, `sugerirCuentas(texto, cuentas)`, `UMBRALES_SIMILITUD` (nunca confirma) |
| `js/modules/estados/cuentas-registro.js` | `registrarCuenta(datos, registroORegistros)` (alta común que devuelve datos normalizados) |
| `js/modules/estados/estados-calculations.js` | `ACCOUNT_TYPES`, `inferAccountType(grupo, nombre)`, `resolveAccountType(datos, grupo, nombre)` (tipo explícito o inferido), `computeFinancialTotals(datos, periodo)`, `validateFinancialData(datos)` (cuadre A = P + O por periodo) |
| `js/modules/apalancamiento/apalancamiento-calculations.js` | `cuentasOperativas`, `sugerirComportamiento`, `normalizarComportamiento`, `resolverComportamiento`, `derivarPeriodo`, `calcularApalancamiento` |
| `js/modules/estados/estados-normalize.js` | `normalizeFinancialData(entrada)`, `parseFinancialJSON(texto)`, `sortPeriods(periodos)` (siempre ordena; lo usa el importador), `ordenarPeriodos(periodos)` (ordena solo si todos empiezan con un año) |
| `js/modules/estados/estados-import.js` | `importStatementFile(archivo, { decimal, avisos })`, `tableTextToFinancialData(texto, { decimal, avisos })`, `sheetsToFinancialData(hojas, { decimal, avisos })`, `parseAmountCell(valor, { decimal, onAmbiguous })`, `inferDecimalStyle(valores)`, `FORMATOS_IMPORTE`, `tabularTemplateCSV()` |
| `js/modules/integracion/integracion-respaldo.js` | `validarRespaldo(contenido, actuales)` → `{ modulos, omitidos }`, `MAX_RESPALDO_BYTES` |
| `js/modules/integracion/index.js` | `getSavedTotals(periodo)` → totales compartidos de `computeFinancialTotals` o `null` si los estados no pueden normalizarse o el periodo no existe; no sustituye el periodo solicitado (D-053/D-054) |
| `js/modules/integracion/integracion-reporte.js` | `construirReporteHTML({ kpis, estados })` |
| `js/modules/analisis/index.js` | `computeRazones(periodo)`, `computeAH`, `computeAV`, `computeDuPont`, `computeCNTCNO`, `computeEOAF(periods)` (EOAF completo: compara el par de periodos más recientes), `computeEFE`, `UMBRALES`, `refreshSavedStates()` (relee los estados guardados antes de reutilizar `computeRazones` fuera de Análisis) |
| `js/modules/analisis/comprobacion-calculations.js` | `TOLERANCIA_COMPROBACION`, `toleranciaComprobacion(...totales)`, `seleccionarPeriodoPar(periodos, periodoFinal?)`, `variacionesDeCuentas(datos, grupo, periodoInicial, periodoFinal)`, `advertenciasDeBalance(periodos, bgInicial, bgFinal)` (piezas comunes de las comprobaciones del EOAF y el EFE, D-027) |
| `js/modules/analisis/eoaf-calculations.js` | `clasificarMovimientoEOAF(grupo, tipo, saldoInicial, saldoFinal)`, `etiquetaFalta(motivo)`, `construirEOAF(datos, periodoInicial, periodoFinal)` → `{ periodos, incompleto?, secciones, resumen, advertencias, interpretacion }`, `interpretarEOAF(resultado)` |
| `js/modules/analisis/efe-calculations.js` | `esResultadoAcumulado`, `construirEFE`, `interpretarEFE` (EFE por método indirecto, sin DOM ni store) |
| `js/utils/format.js` | `formatCurrency`, `formatNumber`, `formatPercent`, `formatPercentRaw`, `parseNumber`. Convierten `null` en 0: verifica `null` antes de formatear |
| `js/utils/html.js` | `escapeHTML(valor)` |
| `js/modules/inventario/inventario-calculations.js` | `calcularInventario`, `kardex`, `resumenProducto`, `validarMovimiento` y el resto en `docs/api.md` |
| `js/modules/equilibrio/equilibrio-calculations.js` | `calcularCVU`, `calcularEscenarios`, `puntosGrafica`, `baseDesdeEstados` (P, CVu y CF desde Estados y Apalancamiento) |
| `js/modules/flujo/flujo-calculations.js` | `calcularFlujo`, `conciliarConBalance` |
| `js/modules/planeacion/planeacion-calculations.js` | `calcularPresupuestoMaestro`, `validarSupuestos`, `SUPUESTOS` |
| `js/modules/proforma/proforma-calculations.js` | `construirReporte`, `resultadosReales`, `resultadosProforma`, `alertasIntegradas` |
| `js/utils/form.js`, `js/utils/estados-guardados.js` | `leerNumero`, `nuevoId`, `fechaHoy`; `estadosGuardados`, `totalesPeriodo` |
| `js/utils/format.js` (N/D) | `formatCurrencyND`, `formatNumberND`, `formatPercentND`: muestran "N/D" en lugar de 0 |
