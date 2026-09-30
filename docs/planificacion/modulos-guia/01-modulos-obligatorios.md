# 01 — Especificación de los módulos obligatorios

- **Estado**: Completado
- **Fecha**: 2026-09-29
- **Depende de**: 00

## Objetivo
Definir entradas, fórmulas, salidas, integración y un caso resuelto a mano para cada módulo que falta. Los casos forman un **caso integrado ficticio de MUNO MODA 2025** que se comprueba de un módulo a otro y sirve de evidencia para el informe.

## Convenciones comunes
- Patrón de apalancamiento: `<modulo>-calculations.js` (puro), `<modulo>-ui.js` (recibe `page` y `{ datos, guardar }`), `index.js` con `init<Modulo>()`.
- Fórmulas genéricas al final de `calculate.js`; devuelven `null` (N/D) si falta un dato o el denominador no permite calcular.
- Cada pantalla: datos de entrada con etiqueta, botón "Cargar ejemplo", resultados con unidades (C$, %, veces, días, unidades), fórmula visible e interpretación breve.
- Guardado con `store.setPersisted('<clave>', …)`; cada clave nueva se agrega a `defaultData`.

## Caso integrado MUNO MODA 2025 (ficticio)
Una prenda promedio: precio C$ 800, costo de compra C$ 480, comisión 5 % de las ventas (C$ 40 por prenda). Costos fijos trimestrales C$ 42,000 (37,500 en efectivo + 4,500 de depreciación). Saldos iniciales tomados del balance 2024 de la demo: efectivo 52,000, CxC 135,000 y CxP 92,000.

## 1. Inventario básico — `#/inventario` (clave `inventario`)
- **Entradas**: producto (nombre, unidad, existencia inicial, costo unitario, stock mínimo) y movimientos (fecha, tipo entrada o salida, cantidad, concepto).
- **Fórmulas**: existencia final = existencia inicial + entradas − salidas; valor = existencia final × costo unitario; reponer si existencia final ≤ stock mínimo; faltante = stock mínimo − existencia final.
- **Validaciones**: cantidades positivas; una salida no puede dejar la existencia negativa en su fecha; borrar un movimiento tampoco.
- **Salidas**: tabla por producto, kardex con saldo acumulado, valor total, alertas de reposición y gráfico existencia vs. stock mínimo.
- **Integración**: el presupuesto maestro toma la existencia y el costo de un producto; el reporte integrado lista los productos por reponer.
- **Caso**: Camisa: 120 + 60 − (90 + 55) = 35 ≤ 40 → reponer 5; valor 35 × 350 = C$ 12,250. Total de 4 productos: C$ 78,790.

## 2. Punto de equilibrio y C-V-U — `#/equilibrio` (clave `equilibrio`)
- **Entradas**: precio (P), costo variable unitario (CVu), costos fijos (CF), unidades (Q) y utilidad objetivo opcional.
- **Fórmulas**: MCu = P − CVu; RMC = MCu / P; PE unidades = CF / MCu; PE C$ = CF / RMC; UAII = Q × MCu − CF; margen de seguridad = (Q − PEu) / Q; GAO = MC / UAII (`gao`); unidades para la utilidad objetivo = (CF + UO) / MCu. Con MCu ≤ 0 no hay punto de equilibrio (N/D y aviso).
- **Escenarios**: ±10 % en precio, CVu, CF y volumen, más uno personalizado que combina los cuatro cambios.
- **Gráfica**: ingresos totales, costos totales y costos fijos contra unidades, con el punto de equilibrio.
- **Integración**: "Tomar de los estados": con las unidades vendidas del último periodo, P = Ventas / Q, CVu = CV / Q y CF salen de la clasificación de apalancamiento.
- **Caso (T1)**: P 800, CVu 520, CF 42,000, Q 250 → MCu 280, RMC 35 %, PE 150 u = C$ 120,000, UAII 28,000, MS 40 %, GAO 2.5; utilidad objetivo 42,000 → 300 u. Precio +10 % → PE 116.67 u y UAII 48,000.

## 3. Flujo de efectivo — `#/flujo` (clave `flujo`)
- **Entradas**: saldo inicial y movimientos de efectivo (concepto, actividad, entrada o salida, monto).
- **Fórmulas**: flujo de una actividad = entradas − salidas; variación neta = operación + inversión + financiamiento; saldo final = saldo inicial + variación neta.
- **Salidas**: estado de flujo de efectivo por actividad, KPIs, gráfico por actividad e interpretación (si la operación genera o consume efectivo y cómo se financia).
- **Integración**: el saldo inicial se puede tomar del efectivo de un periodo del balance; si hay un periodo siguiente, se compara el saldo final con su efectivo.
- **Caso**: saldo inicial 52,000; operación +98,000; inversión −30,000; financiamiento −45,000 → variación +23,000; saldo final C$ 75,000.

## 4. Presupuesto maestro — `#/planeacion` (clave `planeacion`)
Empresa comercial, un producto o línea agregada, de 1 a 12 periodos.
- **Supuestos**: unidades a vender por periodo, precio, % de ventas al contado (el resto se cobra el periodo siguiente), CxC inicial, inventario inicial (u), % de las ventas del periodo siguiente como inventario final deseado, inventario final del último periodo, costo unitario de compra, % de compras al contado (el resto se paga el periodo siguiente), CxP inicial, % de gastos variables sobre ventas, gastos fijos en efectivo, depreciación, intereses y otros desembolsos por periodo, tasa de IR, saldo inicial y saldo mínimo de caja.
- **Presupuestos**: ventas (u × P) y cobros; compras (u = ventas + inv. final deseado − inv. inicial) y pagos; CBV (inv. inicial + compras − inv. final); gastos de operación (variables + fijos + depreciación); caja (saldo inicial + cobros − desembolsos = saldo final; financiamiento requerido = saldo mínimo − saldo final si es positivo, sin inyectarlo a la caja, como Gitman); estado de resultados presupuestado.
- **Integración**: CxC, CxP y efectivo iniciales desde el último balance; inventario inicial y costo desde un producto de Inventario; aviso si el inventario final deseado queda bajo su stock mínimo.
- **Caso (4 trimestres)**: ventas 250, 300, 300 y 400 u (C$ 1,000,000); inv. inicial 50 u, 20 % de las ventas siguientes, 56 u al cierre → compras 260, 300, 320 y 376 u; CBV C$ 600,000; gastos de operación C$ 218,000; UAII 182,000; UN 119,000 (intereses 3,000 por trimestre, IR 30 %). Caja con 60 % de contado, 50 % de compras al contado y una compra de vehículo de C$ 120,000 en T2: saldos finales 102,100, 19,200, 57,900 y 122,360; financiamiento requerido C$ 20,800 en T2. La UAII de T1 (28,000) coincide con la del punto de equilibrio.

## 5. Proforma y reporte integrado — `#/proforma` (sin datos propios)
- **Estado de resultados proforma**: total del presupuesto contra el último periodo real, con variación y márgenes.
- **Efectivo proyectado**: saldo inicial, flujo neto, saldo final y financiamiento máximo requerido.
- **Indicadores integrados**: liquidez, endeudamiento, ROE (DuPont) de Análisis; GAO, GAF y GAT; PE y margen de seguridad; flujo de efectivo; inventario (valor y productos por reponer).
- **Alertas y decisiones**: reglas simples y explicadas (financiamiento requerido, reposición, margen de seguridad bajo, liquidez bajo el umbral).
- Cada bloque indica de qué módulo viene y enlaza a él; si falta el módulo de origen, muestra qué cargar.

## 6. Presupuesto personal — `#/presupuesto`
- Ingresos por concepto (regular u ocasional); total de ingresos y de gastos por categoría.
- Capacidad de ahorro = ingresos − gastos (C$ y % de los ingresos); saldo disponible = capacidad de ahorro − ahorro planificado; aviso si la meta no alcanza.
- `escapeHTML` en los conceptos; ejemplo ficticio; se conserva `ingresoMensual` como total para el dashboard.
- **Caso**: ingresos 22,500; gastos 17,200 → capacidad 5,300 (23.56 %); meta 36,000 en 12 meses → 3,000 al mes → disponible 2,300.

## Checkpoint
- [x] Cada fórmula nueva tiene un test con el caso de arriba y su caso N/D.
- [x] Cada pantalla tiene un test de render con documento simulado y ejemplo cargado.
- [x] El caso integrado da las mismas cifras en los cinco módulos (verificado en tests y en Chrome).
- [x] `npm test` y `npm run lint` sin errores; las pantallas funcionan en el navegador.

## Preguntas abiertas
- Razones de mercado: ¿los datos (acciones, precio, dividendos) se capturan en Análisis (Henry) o en Estados (Cris)?
- Demo coherente de MUNO MODA (cuadre, intereses, IR, depreciación y dividendos): la corrige Cris o se acuerda en equipo.

## Próximo paso
Implementar en el orden 1 → 6 y marcar los checkpoints de la ficha.
