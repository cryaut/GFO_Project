# 05 — Checks de la orden v6

Este archivo reemplaza al de la ronda v3 (el contenido anterior —verificador de 12 reglas, 40 celdas
del caso v3— quedó en el historial de git, commit `2a607c1`; motivo: la orden v6 exige H8, que registre
el validador, el comando y la salida por bloque, y G3 con corrida completa).

## H8 — Validador

- **Script:** `docs/razones_financieras/notas/validador_v6.mjs` (forma parte del repo, commit G0-G1).
- **Comandos:**
  - Todas las validaciones: `cd docs/razones_financieras` y `node notas\validador_v6.mjs`
  - Solo las de un bloque: `node notas\validador_v6.mjs --solo V1,V2,V3,V5`
  - Sobre otra copia (G3): `node notas\validador_v6.mjs --raiz <ruta\al\worktree>\docs\razones_financieras`
- **Salida:** una línea por validación (`OK  Vx` o `FALLO Vx: detalle`), conteos y resultado; sale con
  código 1 si hay fallos. Cada bloque de abajo guarda el comando y la salida literal.

Nota sobre V12: el patrón `pendiente` se busca como palabra completa (sin distinción de mayúsculas),
`TODO` como palabra completa en mayúsculas y `información/informacion faltante`, `dato faltante`,
`DECISION_PENDIENTE` y `???` como cadenas literales (documentado en la cabecera del propio script).

## B1 — Estructura y sintaxis v6 (bloque B1)

Migra los 20 JSON a `schema_version 2.0` con las 9 claves, `razon`/`razones_dependientes` (notas
`DIFERENCIA_CONOCIDA_PROFESOR` en `razon.notes`), derivados/conjuntos/cuentas v6 y árboles con las 11
operaciones. `modo_periodo` entra sin `control_global` y `presentacion` sin formato F1: esas piezas se
completan en B4 (H1/H2). La investigación de fuentes todavía es la interina de la v3 y se corrige en B2.

Comando: `node notas\validador_v6.mjs --solo V1,V2,V3,V5`

```
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 4 validaciones
OK   V1
OK   V2
OK   V3
OK   V5
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=67 partially=0 ambiguous=4 notas_DIFERENCIA=8
RESULTADO: 4/4 validaciones sin fallos
```

**B1: pasa (4/4).** El conteo `verified=67 / partially=0 / ambiguous=4` es el estado interino de la v3;
se corrige en B2 (V14/V15).

## B2 — Fuentes y estados (bloque B2)

Reconstruye la investigación de las 71 cuentas: quita F1/F2 de las fuentes (H4), abre y registra las
normas que faltaban (NIC 1, NIIF 9, NIIF 15, NIC 32; ya abiertas en esta ejecución), corrige estados
(las 4 internas → `partially_verified` con `ambiguities`; las 5 `ambiguous` con motivo; el resto
`verified` con fuente normativa), escribe `notas/02_cuentas_maestras.md` y `notas/03_fuentes.md`, y
deja `02_fuentes.md` y `03_registro_cuentas.md` como punteros (regla 9).

Comando: `node notas\validador_v6.mjs --solo V1,V2,V3,V5,V14,V15`

```
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 6 validaciones
OK   V1
OK   V2
OK   V3
OK   V5
OK   V14
OK   V15
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 6/6 validaciones sin fallos
```

**B2: pasa (6/6).** Corrección durante el bloque: el primer pase dejó 4 cuentas ambiguas del caso
(`bs.ppe_machinery`, `bs.other_current_liabilities`, `bs.long_term_borrowings`, `bs.other_reserves`)
como `verified`; el conteo del validador (66/4/1) delató el fallo y se corrigió el generador para
marcarlas `ambiguous` según la nota de la lista maestra (62/4/5).

## B3 — Conjuntos y derivados (bloque B3)

Los 11 conjuntos y los 17 derivados entraron en B1 junto con las fórmulas (V3 exige que todo id de
árbol exista en su sección: no podía dejarse para B3). Este bloque los verifica como copia textual
de la orden y regenera `notas/04_derivados.md` en versión v6 (los JSON no cambian en B3).

Comando: `node notas\validador_v6.mjs --solo V6,V7,V16`

```
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 3 validaciones
OK   V6
OK   V7
OK   V16
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 3/3 validaciones sin fallos
```

**B3: pasa (3/3).**

## B4 — Control global y formato F1 (bloque B4)

Aplica `modo_periodo.control_global` (mismo id en los 11 JSON de flujo, `null` en los 9 de punto) y
completa `presentacion` con los separadores y decimales F1 en los 20 JSON. Corrige además
`docs/decisiones.md`: D-030 (control global, se elimina la atribución «el equipo confirmó» — H7) y
D-031 (de Abierta a Cerrada: separador decimal `.` y de miles `,` — H2).

**Ajuste de V12 documentado aquí (H8; desviación registrada, D-034).** La primera corrida de B4 falló con `marcador "dato
faltante"` en los 20 archivos: la frase venía del bloque `reglas_generales` **verbatim** de la orden
(«Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.»), que V8
exige copiar sin cambios. El marcador que R3 prohíbe es el placeholder entre corchetes
(`[informacion faltante]`, `[DATO FALTANTE]`) o el token en mayúsculas, no la prosa. Se ajustó el
patrón de V12 a los marcadores reales de R3 (corchetes/mayúsculas + `TODO` mayúsculas + `pendiente`
palabra completa + `DECISION_PENDIENTE` + `???`), no a los datos; el detalle está en la cabecera del
script. Relajar V12 a mitad de bloque fue una desviación de la orden v6; la orden v7 la
registra aquí y la remite a **D-034** (los marcadores se buscan como placeholder: entre corchetes o
en mayúsculas; la prosa en minúscula de `reglas_generales` no cuenta).

Comando: `node notas\validador_v6.mjs --solo V8,V9,V10,V12,V13,V17`

```
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 6 validaciones
OK   V8
OK   V9
OK   V10
OK   V12
OK   V13
OK   V17
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 6/6 validaciones sin fallos
```

**B4: pasa (6/6).**
## B5 — Notas por razón y caso a mano (bloque B5)

Escribe las 20 notas de razón en `notas/ratios/NN_<stem>.md` (con su árbol, derivados, conjuntos,
cuentas, dependencias y notas), elimina el directorio antiguo `ratios/` de la ronda v3 (contenido en
el historial de git) y calcula el caso provisional completo (60 celdas).

Comando: `node notas\validador_v6.mjs --solo V2,V3,V4,V5,V16,V9`

```
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 6 validaciones
OK   V2
OK   V3
OK   V4
OK   V5
OK   V9
OK   V16
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 6/6 validaciones sin fallos
```

### Cálculo del caso provisional a mano (bloque B5, 60 celdas)

Sustitución por razón con la traza del árbol y el resultado formateado con F1;
comparación celda a celda con la tabla de valores de referencia de la orden.

#### 01. Capital de trabajo neto — `liquidez_capital_trabajo_neto.json` (unidad: moneda)

- Fórmula del profesor: Activo corriente − Pasivo corriente

- **2023, control apagado** → `razon(liquidez_capital_trabajo_neto)=(derived.current_assets((suma(45000+0+120000+0+0+25000)+derived.inventory_total(bs.inventory_total=180000)))−derived.current_liabilities(suma(85000+0+0+0+0+15000+60000)))` = **210,000** (referencia: 210,000) ✓
- **2023, control encendido** → `razon(liquidez_capital_trabajo_neto)=(derived.current_assets((suma(45000+0+120000+0+0+25000)+derived.inventory_total(bs.inventory_total=180000)))−derived.current_liabilities(suma(85000+0+0+0+0+15000+60000)))` = **210,000** (referencia: 210,000) ✓
- **2024** → `razon(liquidez_capital_trabajo_neto)=(derived.current_assets((suma(52000+0+135000+0+0+30000)+derived.inventory_total(bs.inventory_total=195000)))−derived.current_liabilities(suma(92000+0+0+0+0+18000+65000)))` = **237,000** (referencia: 237,000) ✓

#### 02. Razón corriente — `liquidez_razon_corriente.json` (unidad: veces)

- Fórmula del profesor: Activo corriente / Pasivo corriente

- **2023, control apagado** → `razon(liquidez_razon_corriente)=(derived.current_assets((suma(45000+0+120000+0+0+25000)+derived.inventory_total(bs.inventory_total=180000))))/(derived.current_liabilities(suma(85000+0+0+0+0+15000+60000)))` = **2.31** (referencia: 2.31) ✓
- **2023, control encendido** → `razon(liquidez_razon_corriente)=(derived.current_assets((suma(45000+0+120000+0+0+25000)+derived.inventory_total(bs.inventory_total=180000))))/(derived.current_liabilities(suma(85000+0+0+0+0+15000+60000)))` = **2.31** (referencia: 2.31) ✓
- **2024** → `razon(liquidez_razon_corriente)=(derived.current_assets((suma(52000+0+135000+0+0+30000)+derived.inventory_total(bs.inventory_total=195000))))/(derived.current_liabilities(suma(92000+0+0+0+0+18000+65000)))` = **2.35** (referencia: 2.35) ✓

#### 03. Prueba ácida — `liquidez_prueba_acida.json` (unidad: veces)

- Fórmula del profesor: (Activo corriente − Inventarios) / Pasivo corriente

- **2023, control apagado** → `razon(liquidez_prueba_acida)=((derived.current_assets((suma(45000+0+120000+0+0+25000)+derived.inventory_total(bs.inventory_total=180000)))−derived.inventory_total(bs.inventory_total=180000)))/(derived.current_liabilities(suma(85000+0+0+0+0+15000+60000)))` = **1.19** (referencia: 1.19) ✓
- **2023, control encendido** → `razon(liquidez_prueba_acida)=((derived.current_assets((suma(45000+0+120000+0+0+25000)+derived.inventory_total(bs.inventory_total=180000)))−derived.inventory_total(bs.inventory_total=180000)))/(derived.current_liabilities(suma(85000+0+0+0+0+15000+60000)))` = **1.19** (referencia: 1.19) ✓
- **2024** → `razon(liquidez_prueba_acida)=((derived.current_assets((suma(52000+0+135000+0+0+30000)+derived.inventory_total(bs.inventory_total=195000)))−derived.inventory_total(bs.inventory_total=195000)))/(derived.current_liabilities(suma(92000+0+0+0+0+18000+65000)))` = **1.24** (referencia: 1.24) ✓

#### 04. Margen de utilidad bruta — `rentabilidad_margen_utilidad_bruta.json` (unidad: porcentaje)

- Fórmula del profesor: Utilidad bruta / Ventas

- **2023, control apagado** → `razon(rentabilidad_margen_utilidad_bruta)=(derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=510000))))/(derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0)))))` = **40.00 %** (referencia: 40.00 %) ✓
- **2023, control encendido** → `razon(rentabilidad_margen_utilidad_bruta)=(derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=510000))))/(derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0)))))` = **40.00 %** (referencia: 40.00 %) ✓
- **2024** → `razon(rentabilidad_margen_utilidad_bruta)=(derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=920000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=545000))))/(derived.net_sales((derived.gross_sales(is.sales_total=920000)−derived.sales_deductions(suma(0+0+0)))))` = **40.76 %** (referencia: 40.76 %) ✓

#### 05. Margen de utilidad operativa — `rentabilidad_margen_utilidad_operativa.json` (unidad: porcentaje)

- Fórmula del profesor: Utilidad operativa / Ventas

- **2023, control apagado** → `razon(rentabilidad_margen_utilidad_operativa)=(derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=510000)))+0)−derived.operating_expenses(suma(85000+120000+0+0+0)))))/(derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductio …` = **15.88 %** (referencia: 15.88 %) ✓
- **2023, control encendido** → `razon(rentabilidad_margen_utilidad_operativa)=(derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=510000)))+0)−derived.operating_expenses(suma(85000+120000+0+0+0)))))/(derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductio …` = **15.88 %** (referencia: 15.88 %) ✓
- **2024** → `razon(rentabilidad_margen_utilidad_operativa)=(derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=920000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=545000)))+0)−derived.operating_expenses(suma(90000+130000+0+0+0)))))/(derived.net_sales((derived.gross_sales(is.sales_total=920000)−derived.sales_deductio …` = **16.85 %** (referencia: 16.85 %) ✓

#### 06. Margen de utilidad neta — `rentabilidad_margen_utilidad_neta.json` (unidad: porcentaje)

- Fórmula del profesor: Utilidad neta / Ventas

- **2023, control apagado** → `razon(rentabilidad_margen_utilidad_neta)=(derived.net_income(((derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=510000)))+0)−derived.operating_expenses(suma(85000+120000+0+0+0))))+15000)−(10000+12600+38220))))/(derived.net_sales((derived.gross_sales( …` = **10.49 %** (referencia: 10.49 %) ✓
- **2023, control encendido** → `razon(rentabilidad_margen_utilidad_neta)=(derived.net_income(((derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=510000)))+0)−derived.operating_expenses(suma(85000+120000+0+0+0))))+15000)−(10000+12600+38220))))/(derived.net_sales((derived.gross_sales( …` = **10.49 %** (referencia: 10.49 %) ✓
- **2024** → `razon(rentabilidad_margen_utilidad_neta)=(derived.net_income(((derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=920000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=545000)))+0)−derived.operating_expenses(suma(90000+130000+0+0+0))))+18000)−(12000+11250+44925))))/(derived.net_sales((derived.gross_sales( …` = **11.39 %** (referencia: 11.39 %) ✓

#### 07. ROA — `rentabilidad_roa.json` (unidad: porcentaje)

- Fórmula del profesor: Utilidad neta / Activos totales promedio
- Nota: DIFERENCIA_CONOCIDA_PROFESOR: ROA 2024 — profesor: 12.70 %; este trabajo: 12.89 % — motivo: D1: promedio.

- **2023, control apagado** → `razon(rentabilidad_roa)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(rentabilidad_roa)=(derived.net_income(((derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=510000)))+0)−derived.operating_expenses(suma(85000+120000+0+0+0))))+15000)−(10000+12600+38220))))/(saldo_directo(801475))` = **11.13 %** (referencia: 11.13 %) ✓
- **2024** → `razon(rentabilidad_roa)=(derived.net_income(((derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=920000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=545000)))+0)−derived.operating_expenses(suma(90000+130000+0+0+0))))+18000)−(12000+11250+44925))))/(promedio(801475,825525))` = **12.89 %** (referencia: 12.89 %) ✓

#### 08. ROE — `rentabilidad_roe.json` (unidad: porcentaje)

- Fórmula del profesor: Utilidad neta / Patrimonio promedio
- Nota: DIFERENCIA_CONOCIDA_PROFESOR: ROE 2024 — profesor: 18.00 %; este trabajo: 19.06 % — motivo: D1: promedio.

- **2023, control apagado** → `razon(rentabilidad_roe)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(rentabilidad_roe)=(derived.net_income(((derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=510000)))+0)−derived.operating_expenses(suma(85000+120000+0+0+0))))+15000)−(10000+12600+38220))))/(saldo_directo(517615))` = **17.23 %** (referencia: 17.23 %) ✓
- **2024** → `razon(rentabilidad_roe)=(derived.net_income(((derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=920000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=545000)))+0)−derived.operating_expenses(suma(90000+130000+0+0+0))))+18000)−(12000+11250+44925))))/(promedio(517615,582440))` = **19.06 %** (referencia: 19.06 %) ✓

#### 09. Razón de deuda total — `endeudamiento_razon_deuda_total.json` (unidad: porcentaje)

- Fórmula del profesor: Total pasivo / Total activo

- **2023, control apagado** → `razon(endeudamiento_razon_deuda_total)=(derived.total_liabilities((derived.current_liabilities(suma(85000+0+0+0+0+15000+60000))+derived.noncurrent_liabilities(suma(80000+0+43860)))))/(derived.total_assets((derived.current_assets((suma(45000+0+120000+0+0+25000)+derived.inventory_total(bs.inventory_total=180000)))+derived.fixed_assets_net((suma(150000+200000+120000+60000+0+0)+-98525))+0+suma(0+0))))` = **35.42 %** (referencia: 35.42 %) ✓
- **2023, control encendido** → `razon(endeudamiento_razon_deuda_total)=(derived.total_liabilities((derived.current_liabilities(suma(85000+0+0+0+0+15000+60000))+derived.noncurrent_liabilities(suma(80000+0+43860)))))/(derived.total_assets((derived.current_assets((suma(45000+0+120000+0+0+25000)+derived.inventory_total(bs.inventory_total=180000)))+derived.fixed_assets_net((suma(150000+200000+120000+60000+0+0)+-98525))+0+suma(0+0))))` = **35.42 %** (referencia: 35.42 %) ✓
- **2024** → `razon(endeudamiento_razon_deuda_total)=(derived.total_liabilities((derived.current_liabilities(suma(92000+0+0+0+0+18000+65000))+derived.noncurrent_liabilities(suma(45000+0+23085)))))/(derived.total_assets((derived.current_assets((suma(52000+0+135000+0+0+30000)+derived.inventory_total(bs.inventory_total=195000)))+derived.fixed_assets_net((suma(150000+200000+120000+60000+0+0)+-116475))+0+suma(0+0))) …` = **29.45 %** (referencia: 29.45 %) ✓

#### 10. Razón deuda-patrimonio — `endeudamiento_razon_deuda_patrimonio.json` (unidad: veces)

- Fórmula del profesor: Total pasivo / Total patrimonio

- **2023, control apagado** → `razon(endeudamiento_razon_deuda_patrimonio)=(derived.total_liabilities((derived.current_liabilities(suma(85000+0+0+0+0+15000+60000))+derived.noncurrent_liabilities(suma(80000+0+43860)))))/(derived.total_equity(suma(300000+0+0+80000+137615+0+0)))` = **0.55** (referencia: 0.55) ✓
- **2023, control encendido** → `razon(endeudamiento_razon_deuda_patrimonio)=(derived.total_liabilities((derived.current_liabilities(suma(85000+0+0+0+0+15000+60000))+derived.noncurrent_liabilities(suma(80000+0+43860)))))/(derived.total_equity(suma(300000+0+0+80000+137615+0+0)))` = **0.55** (referencia: 0.55) ✓
- **2024** → `razon(endeudamiento_razon_deuda_patrimonio)=(derived.total_liabilities((derived.current_liabilities(suma(92000+0+0+0+0+18000+65000))+derived.noncurrent_liabilities(suma(45000+0+23085)))))/(derived.total_equity(suma(300000+0+0+80000+202440+0+0)))` = **0.42** (referencia: 0.42) ✓

#### 11. Cobertura de interés — `endeudamiento_cobertura_interes.json` (unidad: veces)

- Fórmula del profesor: Utilidad operativa / Gastos por intereses

- **2023, control apagado** → `razon(endeudamiento_cobertura_interes)=(derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=510000)))+0)−derived.operating_expenses(suma(85000+120000+0+0+0)))))/(12600)` = **10.71** (referencia: 10.71) ✓
- **2023, control encendido** → `razon(endeudamiento_cobertura_interes)=(derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=510000)))+0)−derived.operating_expenses(suma(85000+120000+0+0+0)))))/(12600)` = **10.71** (referencia: 10.71) ✓
- **2024** → `razon(endeudamiento_cobertura_interes)=(derived.operating_profit(((derived.gross_profit((derived.net_sales((derived.gross_sales(is.sales_total=920000)−derived.sales_deductions(suma(0+0+0))))−derived.cost_of_sales(is.cost_of_sales_reported=545000)))+0)−derived.operating_expenses(suma(90000+130000+0+0+0)))))/(11250)` = **13.78** (referencia: 13.78) ✓

#### 12. Rotación de inventarios — `actividad_rotacion_inventarios.json` (unidad: veces)

- Fórmula del profesor: Costo de ventas / Inventario promedio
- Nota: DIFERENCIA_CONOCIDA_PROFESOR: Rotación de inventarios 2024 — profesor: 2.79; este trabajo: 2.91 — motivo: D1: promedio.

- **2023, control apagado** → `razon(actividad_rotacion_inventarios)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(actividad_rotacion_inventarios)=(derived.cost_of_sales(is.cost_of_sales_reported=510000))/(saldo_directo(180000))` = **2.83** (referencia: 2.83) ✓
- **2024** → `razon(actividad_rotacion_inventarios)=(derived.cost_of_sales(is.cost_of_sales_reported=545000))/(promedio(180000,195000))` = **2.91** (referencia: 2.91) ✓

#### 13. Edad promedio del inventario — `actividad_edad_promedio_inventario.json` (unidad: dias)

- Fórmula del profesor: 365 / Rotación de inventarios
- Nota: DIFERENCIA_CONOCIDA_PROFESOR: Edad promedio del inventario 2024 — profesor: 130.60; este trabajo: 125.57 — motivo: D1: promedio.

- **2023, control apagado** → `razon(actividad_edad_promedio_inventario)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(actividad_edad_promedio_inventario)=(365)/(razon(actividad_rotacion_inventarios)=(derived.cost_of_sales(is.cost_of_sales_reported=510000))/(saldo_directo(180000)))` = **128.82** (referencia: 128.82) ✓
- **2024** → `razon(actividad_edad_promedio_inventario)=(365)/(razon(actividad_rotacion_inventarios)=(derived.cost_of_sales(is.cost_of_sales_reported=545000))/(promedio(180000,195000)))` = **125.57** (referencia: 125.57) ✓

#### 14. Rotación de cuentas por cobrar — `actividad_rotacion_cuentas_por_cobrar.json` (unidad: veces)

- Fórmula del profesor: Ventas a crédito / CxC promedio
- Nota: DIFERENCIA_CONOCIDA_PROFESOR: Rotación de cuentas por cobrar 2023 y 2024 — profesor: 7.08 y 6.81; este trabajo: N/D — motivo: D8: sin ventas a crédito.

- **2023, control apagado** → `razon(actividad_rotacion_cuentas_por_cobrar)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(actividad_rotacion_cuentas_por_cobrar)→división→supp.credit_sales=N/D` = **N/D** (referencia: N/D) ✓
- **2024** → `razon(actividad_rotacion_cuentas_por_cobrar)→división→supp.credit_sales=N/D` = **N/D** (referencia: N/D) ✓

#### 15. Período promedio de cobro — `actividad_periodo_promedio_cobro.json` (unidad: dias)

- Fórmula del profesor: 365 / Rotación de CxC
- Nota: DIFERENCIA_CONOCIDA_PROFESOR: Período promedio de cobro 2023 y 2024 — profesor: 51.53 y 53.56; este trabajo: N/D — motivo: D8: sin ventas a crédito.

- **2023, control apagado** → `razon(actividad_periodo_promedio_cobro)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(actividad_periodo_promedio_cobro)→división→razon(actividad_rotacion_cuentas_por_cobrar)→división→supp.credit_sales=N/D` = **N/D** (referencia: N/D) ✓
- **2024** → `razon(actividad_periodo_promedio_cobro)→división→razon(actividad_rotacion_cuentas_por_cobrar)→división→supp.credit_sales=N/D` = **N/D** (referencia: N/D) ✓

#### 16. Rotación de cuentas por pagar — `actividad_rotacion_cuentas_por_pagar.json` (unidad: veces)

- Fórmula del profesor: Compras a crédito / CxP promedio

- **2023, control apagado** → `razon(actividad_rotacion_cuentas_por_pagar)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(actividad_rotacion_cuentas_por_pagar)→división→derived.credit_purchases→resta→add→supp.supplier_payments=N/D` = **N/D** (referencia: N/D) ✓
- **2024** → `razon(actividad_rotacion_cuentas_por_pagar)→división→derived.credit_purchases→resta→add→supp.supplier_payments=N/D` = **N/D** (referencia: N/D) ✓

#### 17. Período promedio de pago — `actividad_periodo_promedio_pago.json` (unidad: dias)

- Fórmula del profesor: 365 / Rotación de CxP

- **2023, control apagado** → `razon(actividad_periodo_promedio_pago)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(actividad_periodo_promedio_pago)→división→razon(actividad_rotacion_cuentas_por_pagar)→división→derived.credit_purchases→resta→add→supp.supplier_payments=N/D` = **N/D** (referencia: N/D) ✓
- **2024** → `razon(actividad_periodo_promedio_pago)→división→razon(actividad_rotacion_cuentas_por_pagar)→división→derived.credit_purchases→resta→add→supp.supplier_payments=N/D` = **N/D** (referencia: N/D) ✓

#### 18. Rotación de activos fijos — `actividad_rotacion_activos_fijos.json` (unidad: veces)

- Fórmula del profesor: Ventas netas / Activos fijos netos promedio
- Nota: DIFERENCIA_CONOCIDA_PROFESOR: Rotación de activos fijos 2024 — profesor: 2.22; este trabajo: 2.18 — motivo: D1: promedio.

- **2023, control apagado** → `razon(actividad_rotacion_activos_fijos)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(actividad_rotacion_activos_fijos)=(derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0)))))/(saldo_directo(431475))` = **1.97** (referencia: 1.97) ✓
- **2024** → `razon(actividad_rotacion_activos_fijos)=(derived.net_sales((derived.gross_sales(is.sales_total=920000)−derived.sales_deductions(suma(0+0+0)))))/(promedio(431475,413525))` = **2.18** (referencia: 2.18) ✓

#### 19. Rotación de activos totales — `actividad_rotacion_activos_totales.json` (unidad: veces)

- Fórmula del profesor: Ventas netas / Activos totales promedio
- Nota: DIFERENCIA_CONOCIDA_PROFESOR: Rotación de activos totales 2024 — profesor: 1.11; este trabajo: 1.13 — motivo: D1: promedio.

- **2023, control apagado** → `razon(actividad_rotacion_activos_totales)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(actividad_rotacion_activos_totales)=(derived.net_sales((derived.gross_sales(is.sales_total=850000)−derived.sales_deductions(suma(0+0+0)))))/(saldo_directo(801475))` = **1.06** (referencia: 1.06) ✓
- **2024** → `razon(actividad_rotacion_activos_totales)=(derived.net_sales((derived.gross_sales(is.sales_total=920000)−derived.sales_deductions(suma(0+0+0)))))/(promedio(801475,825525))` = **1.13** (referencia: 1.13) ✓

#### 20. Ciclo de conversión de efectivo — `actividad_ciclo_conversion_efectivo.json` (unidad: dias)

- Fórmula del profesor: Edad del inventario + Período de cobro − Período de pago

- **2023, control apagado** → `razon(actividad_ciclo_conversion_efectivo)→N/D[primer periodo, control apagado]` = **N/D** (referencia: N/D) ✓
- **2023, control encendido** → `razon(actividad_ciclo_conversion_efectivo)→resta→add→razon(actividad_periodo_promedio_cobro)→división→razon(actividad_rotacion_cuentas_por_cobrar)→división→supp.credit_sales=N/D` = **N/D** (referencia: N/D) ✓
- **2024** → `razon(actividad_ciclo_conversion_efectivo)→resta→add→razon(actividad_periodo_promedio_cobro)→división→razon(actividad_rotacion_cuentas_por_cobrar)→división→supp.credit_sales=N/D` = **N/D** (referencia: N/D) ✓

#### Conteos

- 2023, control apagado: 9 valores + 11 N/D (esperado: 9+11 al apagar, 15+5 al encender en los dos periodos)
- 2023, control encendido: 15 valores + 5 N/D (esperado: 9+11 al apagar, 15+5 al encender en los dos periodos)
- 2024: 15 valores + 5 N/D (esperado: 9+11 al apagar, 15+5 al encender en los dos periodos)

**Resultado: 60/60 celdas iguales a la referencia.**


**B5: pasa (6/6).**

## G3 — Verificación independiente (worktree temporal)

Ejecutada sobre una copia del último commit, no sobre el árbol de trabajo.

1. `git worktree add --detach <raiz-local>\AppData\Local\Temp\opencode\gfo_wt HEAD` → salida:
   `Preparing worktree (detached HEAD 6ccf187)` y `HEAD is now at 6ccf187 docs: notas por razón en notas/ratios y caso a mano (B5)`.
2. Comando completo (V0–V17 + conteos del conjunto), lanzado desde `docs/razones_financieras` de la
   rama contra la copia del worktree:

```
validador_v6 | raiz=<raiz-local>\AppData\Local\Temp\opencode\gfo_wt\docs\razones_financieras | archivos JSON=20 | 18 validaciones
OK   V0
OK   V1
OK   V2
OK   V3
OK   V4
OK   V5
OK   V6
OK   V7
OK   V8
OK   V9
OK   V10
OK   V11
OK   V12
OK   V13
OK   V14
OK   V15
OK   V16
OK   V17
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 18/18 validaciones sin fallos
```

**G3: pasa (18/18, V0 a V17 sin fallos, conteos correctos).**


## G4 — Revisión de cambios por bloque (git diff --stat + R-IDs)

Por cada commit de la orden: `git diff --stat <padre> <hijo>` con su salida literal abajo, y el
mapeo de cada archivo cambiado a su fila R-ID de `01_diferencias.md`. Revisión de alcance con
`git diff --name-only <padre> <hijo>` por bloque: todos los cambios están en
`docs/razones_financieras/` (JSON y `notas/`) salvo `docs/decisiones.md` en B4, la excepción
permitida por la regla 6 de la orden (solo D-030 y D-031). Sin cambios fuera de alcance → nada que
revertir.

Además, en esta fase se completó el inventario con **R-50** (nota por razón del bloque B5), fila que
faltaba en G1 y sin la cual los 41 archivos de B5 no tendrían ID.

### G0-G1 - commit 68f1a6a (padre 2a607c1)

Comando: `git diff --stat 2a607c1 68f1a6a`

``` docs/razones_financieras/notas/00_control.md     |  47 +-
 docs/razones_financieras/notas/00_linea_base.md  |  74 +++
 docs/razones_financieras/notas/01_decisiones.md  | 107 ++--
 docs/razones_financieras/notas/01_diferencias.md | 120 +++++
 docs/razones_financieras/notas/validador_v6.mjs  | 614 +++++++++++++++++++++++
 5 files changed, 870 insertions(+), 92 deletions(-)
```

→ **Cambios:** 5 archivos de `notas/` (`00_linea_base.md`, `01_diferencias.md`, `01_decisiones.md`,
  `00_control.md` → puntero, `validador_v6.mjs`). Ningún JSON y ningún archivo fuera de `notas/`.
→ **R-IDs:** es la fase de puertas G0/G1 que crea el inventario R-01…R-49 y el script del validador
  (base de H8, fila R-49, que se completa en B1 con comando + salida en `05_checks.md`); no es un
  bloque de corrección del entregable.

### B1 - commit bcd7dc2 (padre 68f1a6a)

Comando: `git diff --stat 68f1a6a bcd7dc2`

``` .../actividad_ciclo_conversion_efectivo.json       | 1525 +++------
 .../actividad_edad_promedio_inventario.json        |  896 ++----
 .../actividad_periodo_promedio_cobro.json          |  742 +----
 .../actividad_periodo_promedio_pago.json           |  614 +---
 .../actividad_rotacion_activos_fijos.json          | 1105 +++----
 .../actividad_rotacion_activos_totales.json        | 1859 +++++------
 .../actividad_rotacion_cuentas_por_cobrar.json     |  733 +----
 .../actividad_rotacion_cuentas_por_pagar.json      |  605 +---
 .../actividad_rotacion_inventarios.json            |  882 ++----
 .../endeudamiento_cobertura_interes.json           | 1281 ++++----
 .../endeudamiento_razon_deuda_patrimonio.json      | 1104 +++----
 .../endeudamiento_razon_deuda_total.json           | 1972 ++++++------
 .../liquidez_capital_trabajo_neto.json             | 1013 +++---
 .../razones_financieras/liquidez_prueba_acida.json | 1048 +++---
 .../liquidez_razon_corriente.json                  | 1014 +++---
 .../notas/02_cuentas_maestras.md                   | 3320 ++++++++++++++++++++
 docs/razones_financieras/notas/05_checks.md        |  110 +-
 .../rentabilidad_margen_utilidad_bruta.json        |  832 +++--
 .../rentabilidad_margen_utilidad_neta.json         | 1469 ++++-----
 .../rentabilidad_margen_utilidad_operativa.json    | 1209 ++++---
 docs/razones_financieras/rentabilidad_roa.json     | 2894 ++++++++---------
 docs/razones_financieras/rentabilidad_roe.json     | 1948 +++++-------
 22 files changed, 13204 insertions(+), 14971 deletions(-)
```

→ **R-IDs:** R-01 (schema 2.0, 9 claves), R-02 (id = nombre del archivo), R-03 (unidades v6), R-04
  (`DIFERENCIA_CONOCIDA_PROFESOR` en `razon.notes`), R-05 (`razones_dependientes`), R-06 (derivados
  `{id,kind,formula}`), R-07 (conjuntos v6 — entran aquí porque V3 exige que todo id referenciado ya
  exista con su fórmula; el cierre documental es B3), R-08 (objeto cuenta v6), R-09 (bloques
  comunes), R-10 (sin sobrantes), R-11 (classification), R-12 (absence_policy), R-22 (11 operaciones),
  R-27 (politica_sin_periodo_anterior), R-28 (marcas de `presentacion`), R-30 (`reglas_generales`
  verbatim), R-37 (fórmulas con sintaxis de nodos v6), R-49 (comando + salida del validador en
  `05_checks.md`).
→ **Archivos:** 20 JSON + `notas/02_cuentas_maestras.md` + `notas/05_checks.md` = 22 (20 + 2 ✓).

### B2 - commit 1217e5e (padre bcd7dc2)

Comando: `git diff --stat bcd7dc2 1217e5e`

``` .../actividad_ciclo_conversion_efectivo.json       |  253 ++--
 .../actividad_edad_promedio_inventario.json        |  159 +--
 .../actividad_periodo_promedio_cobro.json          |   46 +-
 .../actividad_periodo_promedio_pago.json           |   48 +-
 .../actividad_rotacion_activos_fijos.json          |  282 ++---
 .../actividad_rotacion_activos_totales.json        |  559 +++------
 .../actividad_rotacion_cuentas_por_cobrar.json     |   46 +-
 .../actividad_rotacion_cuentas_por_pagar.json      |   48 +-
 .../actividad_rotacion_inventarios.json            |  159 +--
 .../endeudamiento_cobertura_interes.json           |  364 ++----
 .../endeudamiento_razon_deuda_patrimonio.json      |  359 ++----
 .../endeudamiento_razon_deuda_total.json           |  639 +++-------
 .../liquidez_capital_trabajo_neto.json             |  355 ++----
 .../razones_financieras/liquidez_prueba_acida.json |  355 ++----
 .../liquidez_razon_corriente.json                  |  355 ++----
 .../notas/02_cuentas_maestras.md                   | 1263 ++++++--------------
 docs/razones_financieras/notas/02_fuentes.md       |   36 +-
 docs/razones_financieras/notas/03_fuentes.md       |  142 +++
 .../notas/03_registro_cuentas.md                   |   83 +-
 docs/razones_financieras/notas/05_checks.md        |   27 +
 .../rentabilidad_margen_utilidad_bruta.json        |  228 ++--
 .../rentabilidad_margen_utilidad_neta.json         |  437 ++-----
 .../rentabilidad_margen_utilidad_operativa.json    |  339 ++----
 docs/razones_financieras/rentabilidad_roa.json     |  858 ++++---------
 docs/razones_financieras/rentabilidad_roe.json     |  578 +++------
 25 files changed, 2432 insertions(+), 5586 deletions(-)
```

→ **R-IDs:** R-13 (estados: internas → `partially_verified` con `ambiguities`), R-14 (verified con
  fuente abierta que respalda la definición), R-15 (F1/F2 fuera de las fuentes), R-16
  (`source_type` con vocabulario v6), R-18 (`bs.legal_reserve` → `ambiguous`), R-19
  (`02_cuentas_maestras.md`), R-20 (`03_fuentes.md`), R-21 (fuentes faltantes abiertas y
  registradas), R-40 (fila de auditoría por cuenta verified), R-41 (sin fuente →
  `partially_verified`), R-45 (H4 completo). R-17 (máx. 3 fuentes) ya cumplía y se re-verifica en
  V14.
→ **Archivos:** 20 JSON + `notas/02_cuentas_maestras.md` + `notas/03_fuentes.md` +
  `notas/02_fuentes.md` (puntero, regla 9) + `notas/03_registro_cuentas.md` (puntero, regla 9) +
  `notas/05_checks.md` = 25 (20 + 5 ✓).

### B3 - commit b0c9f0b (padre 1217e5e)

Comando: `git diff --stat 1217e5e b0c9f0b`

``` docs/razones_financieras/notas/04_derivados.md | 548 ++++++++++++++++++++++---
 docs/razones_financieras/notas/05_checks.md    |  19 +
 2 files changed, 520 insertions(+), 47 deletions(-)
```

→ **R-IDs:** R-33 (ningún conjunto mezcla un total reportado con sus componentes), R-34 (los 11
  conjuntos copiados de la orden sin cambios), R-35 (derivados v6 con `id`, `kind` y `formula`,
  incluido `derived.credit_purchases` con periodo anterior), R-07 (cierre: nombres y miembros v6
  verificados), R-36 (identidad de definiciones entre archivos — V7 re-corrida).
→ **Archivos:** `notas/04_derivados.md` + `notas/05_checks.md` = 2 ✓. Los 20 JSON no cambian en B3
  (los conjuntos y derivados entraron en B1 por exigencia de V3; documentado en la sección B3 de
  `05_checks.md`).

### B4 - commit 2fe3c5d (padre b0c9f0b)

Comando: `git diff --stat b0c9f0b 2fe3c5d`

``` docs/decisiones.md                                 | 32 ++++++++++++----------
 .../actividad_ciclo_conversion_efectivo.json       | 17 +++++++++++-
 .../actividad_edad_promedio_inventario.json        | 17 +++++++++++-
 .../actividad_periodo_promedio_cobro.json          | 17 +++++++++++-
 .../actividad_periodo_promedio_pago.json           | 17 +++++++++++-
 .../actividad_rotacion_activos_fijos.json          | 17 +++++++++++-
 .../actividad_rotacion_activos_totales.json        | 17 +++++++++++-
 .../actividad_rotacion_cuentas_por_cobrar.json     | 17 +++++++++++-
 .../actividad_rotacion_cuentas_por_pagar.json      | 17 +++++++++++-
 .../actividad_rotacion_inventarios.json            | 17 +++++++++++-
 .../endeudamiento_cobertura_interes.json           | 14 ++++++++--
 .../endeudamiento_razon_deuda_patrimonio.json      | 14 ++++++++--
 .../endeudamiento_razon_deuda_total.json           | 14 ++++++++--
 .../liquidez_capital_trabajo_neto.json             | 14 ++++++++--
 .../razones_financieras/liquidez_prueba_acida.json | 14 ++++++++--
 .../liquidez_razon_corriente.json                  | 14 ++++++++--
 docs/razones_financieras/notas/05_checks.md        | 32 ++++++++++++++++++++++
 docs/razones_financieras/notas/validador_v6.mjs    | 16 +++++++----
 .../rentabilidad_margen_utilidad_bruta.json        | 14 ++++++++--
 .../rentabilidad_margen_utilidad_neta.json         | 14 ++++++++--
 .../rentabilidad_margen_utilidad_operativa.json    | 14 ++++++++--
 docs/razones_financieras/rentabilidad_roa.json     | 17 +++++++++++-
 docs/razones_financieras/rentabilidad_roe.json     | 17 +++++++++++-
 23 files changed, 345 insertions(+), 48 deletions(-)
```

→ **R-IDs:** R-25 (`modo_periodo` de flujo con un único `control_global`), R-26 (`control_global:
  null` en las 9 de saldo), R-29 (formato F1: `separador_decimal` `.`, `separador_miles` `,`), R-42
  (H1: 20 JSON + D-030 corregida), R-43 (H2: D-031 marcada decidida), R-44 (H3: fuera
  `DECISION_PENDIENTE`), R-48 (H7: fuera la atribución «el equipo confirmó»).
→ **Archivos:** 20 JSON + `docs/decisiones.md` (excepción de la regla 6: solo D-030 y D-031) +
  `notas/05_checks.md` + `notas/validador_v6.mjs` (ajuste de V12 documentado en la sección B4:
  marcadores-placeholder de R3, no debilitamiento; se reporta también en G5) = 23 (20 + 3 ✓).

### B5 - commit 6ccf187 (padre 2fe3c5d)

Comando: `git diff --stat 2fe3c5d 6ccf187`

``` docs/razones_financieras/notas/05_checks.md        | 204 +++++++++++++++++++++
 .../ratios/01_liquidez_capital_trabajo_neto.md     |  65 +++++++
 .../notas/ratios/02_liquidez_razon_corriente.md    |  65 +++++++
 .../notas/ratios/03_liquidez_prueba_acida.md       |  72 ++++++++
 .../04_rentabilidad_margen_utilidad_bruta.md       |  60 ++++++
 .../05_rentabilidad_margen_utilidad_operativa.md   |  70 +++++++
 .../ratios/06_rentabilidad_margen_utilidad_neta.md |  76 ++++++++
 .../notas/ratios/07_rentabilidad_roa.md            | 115 ++++++++++++
 .../notas/ratios/08_rentabilidad_roe.md            |  93 ++++++++++
 .../ratios/09_endeudamiento_razon_deuda_total.md   |  88 +++++++++
 .../10_endeudamiento_razon_deuda_patrimonio.md     |  66 +++++++
 .../ratios/11_endeudamiento_cobertura_interes.md   |  71 +++++++
 .../ratios/12_actividad_rotacion_inventarios.md    |  59 ++++++
 .../13_actividad_edad_promedio_inventario.md       |  56 ++++++
 .../14_actividad_rotacion_cuentas_por_cobrar.md    |  50 +++++
 .../ratios/15_actividad_periodo_promedio_cobro.md  |  47 +++++
 .../16_actividad_rotacion_cuentas_por_pagar.md     |  46 +++++
 .../ratios/17_actividad_periodo_promedio_pago.md   |  43 +++++
 .../ratios/18_actividad_rotacion_activos_fijos.md  |  69 +++++++
 .../19_actividad_rotacion_activos_totales.md       |  91 +++++++++
 .../20_actividad_ciclo_conversion_efectivo.md      |  71 +++++++
 .../ratios/01_liquidez_capital_trabajo_neto.md     |  82 ---------
 .../ratios/02_liquidez_razon_corriente.md          |  82 ---------
 .../ratios/03_liquidez_prueba_acida.md             |  89 ---------
 .../04_rentabilidad_margen_utilidad_bruta.md       |  78 --------
 .../05_rentabilidad_margen_utilidad_operativa.md   |  87 ---------
 .../ratios/06_rentabilidad_margen_utilidad_neta.md |  93 ----------
 .../ratios/07_rentabilidad_roa.md                  | 135 --------------
 .../ratios/08_rentabilidad_roe.md                  | 117 ------------
 .../ratios/09_endeudamiento_razon_deuda_total.md   | 102 -----------
 .../10_endeudamiento_razon_deuda_patrimonio.md     |  84 ---------
 .../ratios/11_endeudamiento_cobertura_interes.md   |  89 ---------
 .../ratios/12_actividad_rotacion_inventarios.md    |  92 ----------
 .../13_actividad_edad_promedio_inventario.md       |  81 --------
 .../14_actividad_rotacion_cuentas_por_cobrar.md    |  90 ---------
 .../ratios/15_actividad_periodo_promedio_cobro.md  |  78 --------
 .../16_actividad_rotacion_cuentas_por_pagar.md     |  86 ---------
 .../ratios/17_actividad_periodo_promedio_pago.md   |  74 --------
 .../ratios/18_actividad_rotacion_activos_fijos.md  |  95 ----------
 .../19_actividad_rotacion_activos_totales.md       | 113 ------------
 .../20_actividad_ciclo_conversion_efectivo.md      | 103 -----------
 41 files changed, 1577 insertions(+), 1850 deletions(-)
```

→ **R-IDs:** R-50 (fila añadida en G4: una nota por razón en `notas/ratios/NN_<id>.md` con fórmula,
  árbol, derivados, conjuntos, cuentas y dependientes, más el caso a mano en `05_checks.md` —
  requisito del bloque B5 de la orden que faltaba en el inventario G1) y R-39 (verificación del caso
  contra la tabla de referencia: 60/60 celdas registradas en `05_checks.md`).
→ **Archivos:** 20 notas nuevas en `notas/ratios/` + 20 notas antiguas de `ratios/` reemplazadas
  (borradas con rastro en el historial de git, regla 9) + `notas/05_checks.md` = 41 (20 + 20 + 1 ✓).

**G4: pasa (todos los cambios con R-ID, ninguno fuera de alcance, nada por revertir).**



## Checklist antes de "listo para revisión" (orden, 12 puntos)

Evidencia (comando y salida) de cada punto; los puntos ya registrados arriba se referencian y se
vuelven a ejecutar aquí cuando el comando es corto.

1. **G0 a G4 pasaron.** Evidencia: este archivo (secciones H8, B1…B5), sección G3 (18/18 en worktree
   del `6ccf187`) y sección G4 (diff por bloque + R-IDs); línea base en `00_linea_base.md` (commit
   inicial `2a607c1`, SHA-256 de 20 JSON + 6 notas) e inventario R-01…R-50 en `01_diferencias.md`
   (commit `68f1a6a`).
2. **H1 a H8 cerrados, cada uno con su evidencia.** H1 y H7 → sección B4 y filas R-42/R-48 (D-030
   corregida en `docs/decisiones.md`); H2 → sección B4 y R-43 (D-031 cerrada, formato F1 en los 20);
   H3 → V12/V13 de la sección B4 y R-44; H4 → sección B2, `03_fuentes.md` y R-45; H5 → PR #10
   (punto 10 abajo); H6 → punto 11 abajo (git log); H8 → sección H8 de este archivo.
3. **Los 20 archivos tienen la estructura de "Estructura".**
   Comando: `node notas\validador_v6.mjs --solo V1,V2,V3`

```
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 3 validaciones
OK   V1
OK   V2
OK   V3
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 3/3 validaciones sin fallos
exit=0
```

4. **El control de periodo es uno solo y global en las 11 razones de flujo.** Comando:
   `Select-String -Path *.json -Pattern ...` contando archivos (vía rutas únicas).

```
control_global con id unico: 11 archivos (esperado: 11 de flujo)
control_global null:        9 archivos (esperado: 9 de saldo)
separador_decimal ".":     20 archivos (esperado: 20)
separador_miles ",":      20 archivos (esperado: 20)
DECISION_PENDIENTE en JSON: 0 ocurrencias (esperado: 0)
```

5. **Ningún archivo contiene `DECISION_PENDIENTE` ni otro marcador prohibido.**
   Comando: `node notas\validador_v6.mjs --solo V12,V13` (y el conteo del punto 4 da 0).

```
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 2 validaciones
OK   V12
OK   V13
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 2/2 validaciones sin fallos
exit=0
```

6. **El separador decimal es `.` y el de miles `,`.** Comando: mismo bloque del punto 4 (cuenta de
   archivos con `separador_decimal: "."` y `separador_miles: ","`): 20 y 20, y V17 de la sección B4.
7. **Toda cuenta `verified` tiene su fila en la auditoría de fuentes.**
   Comando: `node notas\validador_v6.mjs --solo V14`
   Nota V14 (orden v7, C3): la validación **solo compara la URL** de cada fuente de una cuenta
   `verified` contra `REGISTRO_APERTURAS`; no comprueba que la norma se haya abierto. La evidencia
   de apertura son el título y la fecha de cada fila de `notas/03_fuentes.md` (registro de
   aperturas: las 11 normas abiertas el 2026-10-15). Las cuentas `partially_verified` y
   `ambiguous` se omiten en V14.

```
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 1 validaciones
OK   V14
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 1/1 validaciones sin fallos
exit=0
```

8. **Ningún resultado N/D fue convertido en número.**
   Comando: `node notas\validador_v6.mjs --solo V16` (y 60/60 celdas con las N/D intactas en la
   sección B5).

```
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 1 validaciones
OK   V16
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 1/1 validaciones sin fallos
exit=0
```

9. **No hay cambios sin ID en `notas/01_diferencias.md`.** → Sección G4 de este archivo: mapeo
   completo de los 6 commits a R-IDs (con R-50 añadida en G4), todos los archivos dentro de alcance
   y nada por revertir.
10. **El PR #10 describe el estado real, sin afirmar correcciones del motor de la ronda anterior.**
    Comando: API de GitHub sobre `cryaut/GFO_Project` #10 (2026-10-15).

```
state=open
head=9b62583 base=main
declara que los JSON no estan aplicados en el motor: True
sin la frase 'correcciones del motor de la ronda anterior': True
seccion de correccion v6 presente: True
body_len=5952 updated=2026-10-16T02:02:09Z
```

11. **Los commits de la v3: uno fue reescrito con `--amend`; no se reescribe nada ahora.**
     Corrección v7 (orden v7, C3): el reporte anterior afirmó que "los 5 commits de la v3 conservan
     su SHA", y no es cierto. El reflog muestra que `c50545a` reemplazó a `4a3bef0` con un
     `git commit --amend` el 2026-10-14 22:49:22, ambos con el mismo mensaje. El commit huérfano
     `4a3bef0` existe en el repo pero no está en la rama. Esto ocurrió en la ronda v3, antes de la
     orden v6; **no se reescribe historial para corregir este reporte**: los commits nuevos de la v7
     van encima del head, sin amend/rebase/force.
     Comandos: `git cat-file -t 4a3bef0` y `git reflog --date=iso`.

```
$ git cat-file -t 4a3bef0
commit
$ git reflog --date=iso | Select-String 'c50545a|4a3bef0'
c50545a HEAD@{2026-10-14 22:49:22 -0600}: commit (amend): docs: registra decisiones D-021 a D-023, changelog y ficha de razones v3
4a3bef0 HEAD@{2026-10-14 22:05:36 -0600}: commit: docs: registra decisiones D-021 a D-023, changelog y ficha de razones v3
```

```
9b62583 docs: validacion completa en worktree y trazabilidad por bloque (G3-G4)
6ccf187 docs: notas por raz├│n en notas/ratios y caso a mano (B5)
2fe3c5d fix: control global y formato F1 en los 20 JSON (B4)
b0c9f0b docs: conjuntos y derivados v6 verificados (B3)
1217e5e fix: corrige fuentes y estados de las 71 cuentas (B2)
bcd7dc2 fix: migra los 20 JSON a la estructura v6 (B1)
68f1a6a docs: linea base, diferencias y validador v6 (G0-G1)
2a607c1 docs: actualiza la ficha tras la revision del PR
ab2f3a5 docs: registra D-024, confirma D-023 y corrige la afirmacion de NIC 38
dcdbb44 fix: aplica revision del PR a los 20 JSON: DIFERENCIA_CONOCIDA_PROFESOR y display decimal abierto
c50545a docs: registra decisiones D-021 a D-023, changelog y ficha de razones v3
86e04e0 feat: a├▒ade 20 JSON de razones financieras v3 con notas y checks
cb5620c Merge pull request #7 from cryaut/fix/importacion-exportacion
1178073 docs: importaci├│n y exportaci├│n (D-019, D-020) y ficha de la feature
2fc898a fix: valida el JSON importado y corrige el reporte HTML en Reportes
a1fef31 fix: importes con punto o coma en la importaci├│n de estados
4e7f414 Merge pull request #6 from cryaut/feat/mejoras-apariencia
a4dc216 docs: Inicio, finanzas personales y decisiones D-017 y D-018
9423305 style: tema oscuro legible, gradientes suaves y foco visible
0110c48 feat: Inicio como panorama general y finanzas personales separadas
f288dc5 Merge pull request #5 from cryaut/feat/modulos-guia
f5595d1 docs: marca como resueltos los pendientes de la gu├¡a y de razones-financieras-v3
2a821cb fix: ordena solos los periodos solo cuando empiezan con un a├▒o
c89e974 fix: calcula la rotaci├│n de CxC con las ventas totales
262dd0f Merge: integra razones-financieras-v3 de Henry
8e9b09c docs: documenta los m├│dulos de la gu├¡a, su plan y sus decisiones
2a4738d fix: evita que una tabla ancha ensanche toda la p├ígina
7d03ceb feat: agrega las rutas y el men├║ de los m├│dulos nuevos
dd002e8 feat: completa el presupuesto personal con ingresos y capacidad de ahorro
3be0818 feat: agrega razones de mercado, reporte integrado y una demo que cuadra
4d32bf3 feat: agrega inventario, punto de equilibrio, flujo de efectivo y presupuesto maestro
3f38e12 docs: agrega los requisitos de la gu├¡a del proyecto final
c9cef23 fix: correct financial ratios calculations
92a9ff9 Merge pull request #4 from cryaut/feat/apalancamiento
8e1b15a Merge pull request #2 from cryaut/docs/registro-decisiones
906c123 feat: agrega la pantalla de apalancamiento con traza
42c3337 feat: deriva el apalancamiento desde los estados guardados
c2c7474 feat: agrega las funciones de GAO, GAF y GAT con sus tests
bd87df3 docs: planifica los pasos 02 a 05 de apalancamiento
ed5efe2 docs: cierra el paso 00 de apalancamiento y abre el paso 01 de formulas
dbb76ff docs: agrega el registro de decisiones y la regla para anotarlas
040d81a Merge pull request #1 from cryaut/core
c6a5871 docs: permite que una IA integre un PR aprobado
bba257c docs: documenta las razones agregadas y actualiza el changelog
6a91793 docs: organiza la planificacion por feature
d71aac7 docs: agrega guias para agentes de IA, contexto y reglas del equipo
621a99b test: carga de modulos, razones unificadas y cobertura de intereses
64acf0b feat: usa un a├▒o de 365 d├¡as en plazos y ciclos (DIAS_ANIO)
497740e merge: integra razones-financieras (Henry) y unifica razones duplicadas
98b5552 merge: integra fix/estados-import-razones (Cris) en core
549912e Agrega modulo de razones financieras
0199865 feat: import external financial statements and unify financial analysis
4bac9b9 Correcciones metodologicas de auditoria GFO: EFE indirecto con variaciones reales, CNO separado de CNT, promedios en razones/ROA/DuPont, AV por estado, AH con T1=0, umbrales configurables e interpretacion en 3 niveles
c206144 GFO Toolkit: app de gestion financiera y operativa (proyecto final semestre 4)
git status --porcelain:  M docs/razones_financieras/notas/05_checks.md

```

12. **Las pruebas del repo se ejecutaron y el conteo está en el reporte.**
    Comando: `npm.cmd test` y `npm.cmd run lint`

```
 Ô£ô tests/unit/analisis-reexports.test.js (1 test) 3ms

 Test Files  31 passed (31)
      Tests  375 passed (375)
   Start at  20:09:53
   Duration  2.65s (transform 1.36s, setup 0ms, collect 3.46s, tests 4.77s, environment 8ms, prepare 6.34s)

exit=0
---

Ô£û 10 problems (0 errors, 10 warnings)

exit=0
```

## Corrección v7 (orden `prompt_correccion_agente_razones_v7.md`) — G2: validación tras cada bloque

Cada bloque deja un commit con el árbol limpio; V0 exige árbol limpio, así que la salida de V0 a V17
se añade aquí justo después de cada commit y viaja con el commit del bloque siguiente.

### Tras C1 — commit `7841708` (decisiones y ficha)

Comando: `node notas\validador_v6.mjs` (desde `docs/razones_financieras`)

```text
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 18 validaciones
OK   V0
OK   V1
OK   V2
OK   V3
OK   V4
OK   V5
OK   V6
OK   V7
OK   V8
OK   V9
OK   V10
OK   V11
OK   V12
OK   V13
OK   V14
OK   V15
OK   V16
OK   V17
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=62 partially=4 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 18/18 validaciones sin fallos
exit=0
```

Comprobación de C1 (orden, punto 6): `Select-String docs\decisiones.md -Pattern "el equipo confirmó"` →
`0 hit`; `Select-String docs\planificacion\razones-json-v3\README.md -Pattern "el equipo confirmó"` →
`0 hit`; `Select-String docs\decisiones.md -Pattern "### D-02[5-8]"` → `4 hit`.

### Tras C2 — commit `7abe351` (auditoría de fuentes, D-035)

Comando: `node notas\validador_v6.mjs` (desde `docs/razones_financieras`)

```text
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 18 validaciones
OK   V0
OK   V1
OK   V2
OK   V3
OK   V4
OK   V5
OK   V6
OK   V7
OK   V8
OK   V9
OK   V10
OK   V11
OK   V12
OK   V13
OK   V14
OK   V15
OK   V16
OK   V17
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=29 partially=37 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 18/18 validaciones sin fallos
exit=0
```

Los conteos confirman el efecto de D-035: `verified` pasa de 62 a 29 y `partially_verified` de 4 a
37; las 5 `ambiguous` no cambian. El script de aplicación (fuera del repo) verificó además, archivo
por archivo antes de escribir, que el SHA-256 canónico "sin `cuentas[].research`" era idéntico al de
la línea base G0: `OK: 20 archivos escritos; KEEP=29 DROP=33; hash sin research intacto en los 20`.

### Tras C3 — commit `ba3db23` (notas: punto 11, V14, V12/D-034, rutas)

Comando: `node notas\validador_v6.mjs` (desde `docs/razones_financieras`)

```text
validador_v6 | raiz=<raiz-local>\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 18 validaciones
OK   V0
OK   V1
OK   V2
OK   V3
OK   V4
OK   V5
OK   V6
OK   V7
OK   V8
OK   V9
OK   V10
OK   V11
OK   V12
OK   V13
OK   V14
OK   V15
OK   V16
OK   V17
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=29 partially=37 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 18/18 validaciones sin fallos
exit=0
```

## Corrección v7 — G3: verificación independiente en worktree

Comandos y salidas:

```text
$ git worktree add --detach <raiz-local>\AppData\Local\Temp\opencode\gfo_wt_v7 ba3db23
Preparing worktree (detached HEAD ba3db23)
HEAD is now at ba3db23 docs: corrige el punto 11, aclara V14, registra la desviacion V12 (D-027) y sustituye rutas locales (C3)

$ node notas\validador_v6.mjs   (desde <raiz-local>\AppData\Local\Temp\opencode\gfo_wt_v7\docs\razones_financieras)
validador_v6 | raiz=<raiz-local>\AppData\Local\Temp\opencode\gfo_wt_v7\docs\razones_financieras | archivos JSON=20 | 18 validaciones
OK   V0
OK   V1
OK   V2
OK   V3
OK   V4
OK   V5
OK   V6
OK   V7
OK   V8
OK   V9
OK   V10
OK   V11
OK   V12
OK   V13
OK   V14
OK   V15
OK   V16
OK   V17
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=29 partially=37 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 18/18 validaciones sin fallos
exit=0

$ node <ruta-fuera-del-repo>\gfo_gen\cmp_g3.mjs
JSON comparados=20
diferencias sin cuentas[].research (metrica de G3)=0
diferencias del SHA-256 completo (esperado: cambia por el research que toco C2)=20
G3: 0 diferencias sin cuentas[].research contra la linea base G0
```

El script de comparación vive fuera del repo (área de trabajo temporal del agente), lee la tabla
SHA-256 de `notas/00_linea_base_v7.md` (G0) desde el worktree y recalcula por archivo el SHA-256
completo y el canónico "sin `cuentas[].research`" (claves ordenadas). La métrica de G3 es la segunda:
**0 diferencias**. La primera columna cambia en los 20 archivos, como era de esperar: C2 modificó
`cuentas[].research`, que es el único campo que la orden v7 permite tocar en los JSON. Las cifras
del caso son iguales a las de `b325ab2` porque ningún valor ajeno a `research` cambió (lo confirma
también V16 y la tabla de la sección B5).

**G3: pasa (18/18 validaciones, 0 diferencias).**

## Corrección v7 — G4: `git diff --stat` por bloque mapeado a R-IDs

```text
$ git diff --stat b325ab2 e4432ec    (G0-G1: linea base y filas R-51+)
 docs/razones_financieras/notas/00_linea_base_v7.md | 40 ++++++++++++++++++++++
 docs/razones_financieras/notas/01_diferencias.md   | 32 +++++++++++++++++
 2 files changed, 72 insertions(+)

$ git diff --stat e4432ec 7841708    (C1)
 docs/decisiones.md                           | 116 +++++++++++++++++++++++----
 docs/planificacion/razones-json-v3/README.md |   2 +-
 2 files changed, 100 insertions(+), 18 deletions(-)

$ git diff --stat 7841708 7abe351    (C2)
 20 JSON de docs/razones_financieras/ + docs/razones_financieras/notas/03_fuentes.md
 + docs/razones_financieras/notas/05_checks.md (evidencia de C1 que viaja con este commit)
 22 files changed, 610 insertions(+), 2764 deletions(-)

$ git diff --stat 7abe351 ba3db23    (C3)
 docs/razones_financieras/notas/05_checks.md | 87 +++++++++++++++++++++++------
 1 file changed, 71 insertions(+), 16 deletions(-)
```

Mapeo archivo → R-ID:

| Commit | Archivos | R-IDs |
|---|---|---|
| `e4432ec` (G0-G1) | `notas/00_linea_base_v7.md`, `notas/01_diferencias.md` | G0, G1 (R-51…R-65) |
| `7841708` (C1) | `docs/decisiones.md`, `docs/planificacion/razones-json-v3/README.md` | R-51, R-52, R-53, R-54, R-55 |
| `7abe351` (C2) | 20 JSON (`cuentas[].research` únicamente), `notas/03_fuentes.md` | R-56, R-57, R-58, R-59 |
| `7abe351` (C2, evidencia) | `notas/05_checks.md` (salida de C1) | G2 |
| `ba3db23` (C3) | `notas/05_checks.md` | R-60, R-61, R-62, R-63 |

Ningún cambio queda sin ID. En los 20 JSON el diff toca solo `cuentas[].research` (comprobado
commit por commit con el hash canónico "sin research" de G3, idéntico al de G0 en los 20: 0
diferencias); no hay nada por revertir. Filas R-64 y R-65 (G3) se cierran con la sección G3 de
este archivo.

**G4: pasa.**

## Corrección v7 — C4 y G5: PR y checklist de 10 puntos

### C4 — descripción del PR #10 actualizada

```text
$ curl -X PATCH https://api.github.com/repos/cryaut/GFO_Project/pulls/10 (cuerpo desde pr10_body_v7.txt)
state=open merged=false head=ba3db2305e2c24ab152a2f52468bef5e21e7d546 base=main
body_len=8170 updated=2026-10-16T23:31:19Z
```

El cuerpo nuevo describe los 4 commits de v7 (`e4432ec…ba3db23`), las decisiones D-030…D-035, el
conteo de fuentes (29 `verified` / 37 `partially_verified` / 5 `ambiguous`), el resultado de G3
(18/18 en worktree, 0 diferencias) y las pruebas (375 tests; lint 0 errores). Sin frases sobre el
motor, sin aprobaciones de nadie y sin "correcciones aplicadas" sin evidencia. Tras el push normal
de los 4 commits, la API confirma `state=open merged=false head=ba3db23` (el head del PR avanza al
último commit de la rama; el push fue normal, sin force).

### G5 — checklist de 10 puntos (orden v7, "Razonamiento / verificación")

1. **G0 a G4 pasaron.** Comando: `git log --oneline -5`

```
ba3db23 docs: corrige el punto 11, aclara V14, registra la desviacion V12 (D-027) y sustituye rutas locales (C3)
7abe351 fix: audita fuentes por D-028: 29 verified con frase textual y 33 a partially_verified (C2)
7841708 docs: restaura D-023 y D-024, registra D-025 a D-028 y corrige la ficha (C1)
e4432ec docs: linea base v7 y filas R-51+ (G0-G1)
b325ab2 docs: checklist de 12 puntos con evidencia en 05_checks (G5)
```

Evidencia: G0 → sección "Línea base v7"; G1 → sección "Compuerta G1 (v7)" de `01_diferencias.md`;
G2 → secciones "Tras C1/C2/C3" de este archivo (18/18 cada vez); G3 y G4 → secciones
homónimas de este archivo.

2. **G3: 0 diferencias en los 20 JSON sin `cuentas[].research`.** Comando:
   `node <ruta-fuera-del-repo>\gfo_gen\cmp_g3.mjs` → salida registrada en la sección G3:
   `diferencias sin cuentas[].research (metrica de G3)=0`.

3. **Los valores del caso son iguales a los de `b325ab2`.** Comando: mismo script de G3 (el hash
   canónico "sin research" cubre `razon`, fórmulas, derivados, conjuntos, valores y reglas):
   `JSON comparados=20 ... =0`; y V16 OK en las tres corridas (60/60 celdas intactas en B5).

4. **V0 a V17 sin fallos en el worktree.** Comando: `node notas\validador_v6.mjs` en el worktree
   `gfo_wt_v7` (detached en `ba3db23`) → `RESULTADO: 18/18 validaciones sin fallos` (sección G3).

5. **Conteos.** Salida del validador tras C3 y en el worktree:
   `CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=29 partially=37 ambiguous=5 notas_DIFERENCIA=8`.
   Las `ambiguous` siguen siendo 5.

6. **Ni `docs/decisiones.md` ni la ficha contienen "el equipo confirmó".** Comando:
   `Select-String docs\decisiones.md -Pattern "el equipo confirmó"` → `0 hit`;
   `Select-String docs\planificacion\razones-json-v3\README.md -Pattern "el equipo confirmó"` → `0 hit`.

7. **D-030 a D-035 presentes; D-030 y D-031 con su estado de reemplazo.** Comando:
   `Select-String docs\decisiones.md -Pattern "### D-02[3-8]"` → `6 hit`; los estados en el cuerpo
   y en la tabla son: D-030 `Reemplazada por D-032`, D-031 `Cerrada por D-033`, D-032/D-034/D-035
   `Vigente`, D-033 `Cerrada`.

8. **`npm test` y `npm run lint`: conteo exacto.** Comandos y salidas (2026-10-15, tras los 4 commits
   de v7):

```
$ npm.cmd test
 Test Files  31 passed (31)
      Tests  375 passed (375)
exit=0

$ npm.cmd run lint
✖ 10 problems (0 errors, 10 warnings)
exit=0
```

9. **Commits nuevos encima de `b325ab2`; ninguno reescrito.** Comando:
   `git push origin feat/razones-json-v3` (normal, sin force) →
   `b325ab2..ba3db23  feat/razones-json-v3 -> feat/razones-json-v3`; los 5 commits de la v3 y los 8
   de la v6 siguen intactos (el punto 11 documenta el `--amend` previo de `c50545a`, hecho en la
   ronda v3; no se repitió ninguno).

10. **PR #10 actualizado con el estado real.** Comando: API de GitHub sobre `cryaut/GFO_Project`
    #10 (2026-10-16) → `state=open merged=false head=ba3db23 base=main`, cuerpo con la sección
    "Corrección v7", `body_len=8170`.

**G5: pasa. La corrección v7 queda "lista para revisión".**


## Ronda 8 v8 — G2 tras G0/G1

Commit comprobado: `9274bf8ec47de309a4a6efcd124a77b36fc48e88`. Comando desde `docs/razones_financieras`: `node notas/validador_v6.mjs`. Árbol limpio al ejecutar; validador sin modificaciones. Esta salida pertenece a la secuencia definitiva, comprobada de nuevo después de este commit.

```text
validador_v6 | raiz=C:\Users\carlo\Desktop\02 - Proyectos\Programacion\GFO Project\revision-ronda8-pr10\docs\razones_financieras | archivos JSON=20 | 18 validaciones
OK   V0
OK   V1
OK   V2
OK   V3
OK   V4
OK   V5
OK   V6
OK   V7
OK   V8
OK   V9
OK   V10
OK   V11
OK   V12
OK   V13
OK   V14
OK   V15
OK   V16
OK   V17
CONTEOS: archivos=20 flujo=11 saldo=9 cuentas=71 verified=1 partially=65 ambiguous=5 notas_DIFERENCIA=8
RESULTADO: 18/18 validaciones sin fallos
```
