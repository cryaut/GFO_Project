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
| UAI | Utilidad antes de impuestos | No existe todavía |
| IR | Impuesto sobre la renta (monto) | `impuestos` |
| T | Tasa de impuesto sobre la renta | No existe todavía |
| UN | Utilidad neta | `utilidadNeta` |
| DAP | Dividendos de acciones preferentes | No existe todavía (planificado en apalancamiento) |
| CV, CF | Costos variables y costos fijos | No existen todavía (planificado en apalancamiento) |
| MC | Margen de contribución = Ventas − CV | No existe todavía |
| GAO, GAF, GAT | Grados de apalancamiento operativo, financiero y total | No existen todavía (ver `docs/planificacion/apalancamiento/`) |
| AC, PC | Activo corriente y pasivo corriente | `activosCorrientes`, `pasivosCorrientes` |
| CxC, CxP | Cuentas por cobrar y cuentas por pagar | `cxC`, `cuentasPorPagar` |
| CNT, CNO | Capital neto de trabajo y capital neto operativo | `capitalNetoTrabajo`, `capitalNetoOperativo` |
| PPC | Plazo promedio de cobro | `plazoCobro`, `PPC` en `computeRazones` |

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

1. **N/D es `null`.** Las funciones nuevas devuelven `null` si falta un dato o el denominador es 0, y la interfaz muestra "N/D". Las funciones originales de `main` (marcadas "legado" en el catálogo) devuelven 0; no cambies ese comportamiento sin acuerdo, porque la pestaña Análisis depende de él.
2. **Compara solo números.** En JavaScript `null < 2` es `true`. Antes de comparar una razón con un umbral, verifica `typeof v === 'number' && Number.isFinite(v)` (ver `hayDato` en `analisis/index.js`).
3. **Año de 365 días.** Plazos, edades y ciclos usan `DIAS_ANIO` (`calculate.js`).
4. **Saldos promedio.** Rotaciones, ROA, ROE y DuPont usan `(saldo inicial + saldo final) / 2` con `saldoPromedio`. Con un solo periodo se usa el saldo final.
5. **Signos.** En el estado de resultados, costos y gastos se guardan en positivo y se restan. La depreciación acumulada se guarda en negativo dentro de activos.
6. **Totales por tipo, nunca por nombre.** `computeFinancialTotals(datos, periodo)` suma las cuentas según su tipo. Si una cuenta del estado de resultados no tiene tipo, la utilidad bruta y la neta salen `null` y la cuenta aparece en `unclassified`.
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

"Legado" indica que la función devuelve 0 en lugar de `null` cuando el denominador es 0.

**Base**

| Función | Qué calcula |
|---|---|
| `DIAS_ANIO` | Constante: 365 |
| `saldoPromedio(inicial, final)` | (inicial + final) / 2; si falta uno, usa el otro; si faltan ambos, 0 |
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
| `apalancamiento(activoProm, patrimonioProm)` | Multiplicador de capital de DuPont. No es GAO, GAF ni GAT: esos necesitan nombres propios |
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

**Flujos, activos y presupuesto**

| Función | Qué calcula |
|---|---|
| `eoaf(cuenta, cambio, tipo)` | Clasifica un cambio como `'Origen'` o `'Aplicacion'`; `null` si el cambio es 0 |
| `efeIndirecto(UN, ajustes)` | UN + suma de ajustes |
| `depAnualLineaRecta(costo, residual, vidaUtil)` | (costo − residual) / vida útil; 0 si la vida útil es ≤ 0 |
| `depAcumulada(depAnual, anios, vidaUtil)` | depAnual × mín(años, vida útil) |
| `valorEnLibros(costo, depAcumulada)` | costo − depreciación acumulada |
| `ahorroMensual(meta, meses)` | meta / meses |
| `saldoSemanal(ingreso, gastos, ahorro, reserva)` | ingreso − gastos − ahorro − reserva |

**Nombres reemplazados.** No los vuelvas a crear; el test `razones-unificadas` falla si reaparecen.

| Nombre anterior | Usa |
|---|---|
| `rotacionActivosTotales` | `rotacionActivos` |
| `periodoPromedioPago` | `plazoPago` |
| `cicloConversionEfectivo` | `cicloConversion` |
| `razonDeudaPatrimonio` | `deudaPatrimonio` |
| `rotacionPasivos` | `rotacionCxP` |

### Otros módulos con lógica reutilizable

| Archivo | Funciones |
|---|---|
| `js/modules/estados/estados-calculations.js` | `ACCOUNT_TYPES`, `inferAccountType(grupo, nombre)`, `computeFinancialTotals(datos, periodo)`, `validateFinancialData(datos)` (cuadre A = P + O por periodo) |
| `js/modules/estados/estados-normalize.js` | `normalizeFinancialData(entrada)`, `parseFinancialJSON(texto)` |
| `js/modules/estados/estados-import.js` | `importStatementFile(archivo)`, `tableTextToFinancialData(texto)`, `sheetsToFinancialData(hojas)`, `parseAmountCell(valor)`, `tabularTemplateCSV()` |
| `js/modules/analisis/index.js` | `computeRazones(periodo)`, `computeAH`, `computeAV`, `computeDuPont`, `computeCNTCNO`, `computeEOAF`, `computeEFE`, `UMBRALES` |
| `js/utils/format.js` | `formatCurrency`, `formatNumber`, `formatPercent`, `formatPercentRaw`, `parseNumber`. Convierten `null` en 0: verifica `null` antes de formatear |
| `js/utils/html.js` | `escapeHTML(valor)` |
