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
validador_v6 | raiz=C:\Users\aleja\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 4 validaciones
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
validador_v6 | raiz=C:\Users\aleja\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 6 validaciones
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
validador_v6 | raiz=C:\Users\aleja\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 3 validaciones
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
`docs/decisiones.md`: D-023 (control global, se elimina la atribución «el equipo confirmó» — H7) y
D-024 (de Abierta a Cerrada: separador decimal `.` y de miles `,` — H2).

**Ajuste de V12 documentado aquí (H8).** La primera corrida de B4 falló con `marcador "dato
faltante"` en los 20 archivos: la frase venía del bloque `reglas_generales` **verbatim** de la orden
(«Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.»), que V8
exige copiar sin cambios. El marcador que R3 prohíbe es el placeholder entre corchetes
(`[informacion faltante]`, `[DATO FALTANTE]`) o el token en mayúsculas, no la prosa. Se ajustó el
patrón de V12 a los marcadores reales de R3 (corchetes/mayúsculas + `TODO` mayúsculas + `pendiente`
palabra completa + `DECISION_PENDIENTE` + `???`), no a los datos; el detalle está en la cabecera del
propio script.

Comando: `node notas\validador_v6.mjs --solo V8,V9,V10,V12,V13,V17`

```
validador_v6 | raiz=C:\Users\aleja\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 6 validaciones
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
validador_v6 | raiz=C:\Users\aleja\Desktop\Cris (Temporal)\GFO\Toolkit\GFO_Project\docs\razones_financieras | archivos JSON=20 | 6 validaciones
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

