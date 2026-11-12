# Plan: AGRI-CORP como caso central del GFO Toolkit

- **Propuesto por**: Carlos
- **Fecha**: 11 de noviembre de 2026
- **Rama prevista**: `feat/agricorp-integral`, desde `origin/main` (`5e0b5c1`)
- **Decisión que se registrará**: D-113, que reemplaza en parte a D-110
- **Estado**: propuesta para el equipo; todavía no hay código

---

## 1. Resumen

Hoy la app trata a AGRI-CORP como un ejemplo más. Queremos que sea **el caso que se defiende**: un sistema que toma los estados financieros reales de Corporación Agrícola, S. A. y subsidiarias (AGRI-CORP), completa lo que falta con **supuestos declarados**, y hace que **todos los módulos de empresa** trabajen sobre esos datos.

La idea central para la exposición:

> Cada cifra de la app sale de AGRI-CORP y dice de dónde viene: es **real** (auditada), **derivada** (calculada con cifras reales) o **supuesta** (elegida por el equipo y visible). Si cambiamos un supuesto, el cambio recorre todo el sistema.

Los demás ejemplos (MUNO MODA, Baker, Bartlett, TOR, ejercicios de clase) se conservan, pero pasan a un segundo plano como "Otros ejemplos".

---

## 2. Qué pasa hoy en `main`

Lo comprobamos cargando "AGRI-CORP · histórico real" desde Inicio y recorriendo cada pantalla.

| Módulo | Qué se ve con AGRI-CORP cargada | Motivo |
|---|---|---|
| Estados, Análisis | Funcionan con 2023–2024 | Son los únicos años cargados |
| Apalancamiento | GAF sí; GAO y GAT en N/D | No hay clasificación de costos fijos y variables |
| Mercado | UPA sí; P/U y P/VL en N/D | No hay precio por acción |
| **Punto de equilibrio** | Formulario vacío | El caso guarda equilibrio vacío; "Derivar de los estados" pide unidades |
| **Presupuesto maestro** | Sin supuestos | El caso guarda `supuestos: null` |
| **Inventario** | 0 productos | El caso guarda inventario vacío |
| **Proforma** | Columna "Proforma" con guiones y N/D | Depende del presupuesto maestro, que está vacío |
| **Reportes** | Solo resume Estados | No lee los demás módulos de empresa |

Además:

- El ejemplo **por defecto** de cada módulo es MUNO MODA (o "Tienda de prendas", TOR, etc.), no AGRI-CORP.
- Se pueden **mezclar empresas sin aviso**: con AGRI-CORP en Estados, el botón "Cargar ejemplo" de Equilibrio o Flujo mete datos de MUNO MODA.
- La "unidad de arroz simulada" se presenta como "no es AGRI-CORP", así que tampoco sirve para defender a la empresa.

La causa es **D-110**: se decidió no completar nada que el auditado no publicara. Es una postura rigurosa, pero deja medio sistema vacío justo en la empresa que vamos a defender.

---

## 3. El cambio de enfoque

### 3.1 Tres tipos de cifra

Cada dato que entra a la app lleva una de estas etiquetas, que se ven en pantalla:

| Etiqueta | Qué significa | Ejemplo |
|---|---|---|
| **REAL** | Importe publicado en una fuente identificada (estados auditados, calificadoras) | Ventas 2024: C$ 9,010,443,238 |
| **DERIVADO** | Calculado con cifras reales; la operación se puede reproducir | Rotación de inventario 2023: 6.15 veces |
| **SUPUESTO** | Valor elegido por el equipo para que el sistema funcione; se puede editar | 50 % de las ventas son a crédito |

Lo que no tiene ni dato real ni supuesto aprobado **sigue en N/D**. No se inventa nada en silencio.

### 3.2 Dos capas de AGRI-CORP

Algunos módulos trabajan por **unidades** (precio por unidad, unidades vendidas, productos en bodega), y AGRI-CORP no publica unidades ni precios. Por eso el caso tiene dos capas:

| Capa | Qué es | Dónde se usa |
|---|---|---|
| **AGRI-CORP · consolidado** | Estados auditados reales + supuestos. Trabaja en C$, con la unidad "C$1 de ventas" donde un módulo pide unidades | Todos los módulos de empresa. Es la capa principal |
| **AGRI-CORP · línea de arroz (escenario simulado)** | La unidad de arroz que ya existe (jul–sep 2027), presentada como una línea de negocio de AGRI-CORP con datos simulados | Donde se quiere mostrar el detalle por unidad: precio por saco, kárdex, punto de equilibrio en sacos |

La capa consolidada es la que sostiene la defensa; la línea de arroz sirve para explicar la mecánica por unidad.

### 3.3 Qué decisiones anteriores se reemplazan

| Antes (D-110) | Ahora (D-113) |
|---|---|
| AGRI-CORP es un ejemplo opcional | AGRI-CORP es el ejemplo por defecto de todos los módulos de empresa |
| Lo que el auditado no trae queda vacío | Se completa con supuestos declarados y etiquetados |
| Solo 2023–2024 | 2022–2025 completos, todos reales |
| La unidad de arroz "no es AGRI-CORP" | Es la línea de arroz de AGRI-CORP, rotulada como escenario simulado |
| Cargar AGRI-CORP deja vacíos Equilibrio, Presupuesto e Inventario | Cargar AGRI-CORP llena los siete módulos de empresa |
| Sin balance proforma | Balance proforma 2025 contrastado con el balance real 2025 |

---

## 4. Fuentes

Todas las cifras reales salen de dos archivos de investigación (consulta del 11 de noviembre de 2026) y de los PDF que citan:

- *AGRI-CORP: estados, datos útiles y supuestos para GFO*: balances, resultados, totales de flujo y supuestos propuestos.
- *AGRI-CORP: detalle de flujos de efectivo e inventarios*: cada partida de los flujos 2022–2025 (operación, inversión y financiamiento), la depreciación y las inversiones de cada año, y el inventario por categoría (granza, sal, productos terminados, repuestos, etc.).

Documentos citados:

| ID | Documento | Uso en la app |
|---|---|---|
| F01 | Estados consolidados auditados 2022 | Contraste de 2022 |
| F02 | Estados consolidados auditados 2023 (con comparativo 2022) | Balance y resultados 2022 y 2023; flujo 2022; inventario por categoría 2022–2023 (nota 12) |
| F03 | Estados consolidados auditados 2024 | Flujos 2023 y 2024 línea por línea; inventario por categoría 2024; acciones (nota 34) |
| F04 | Estados consolidados auditados 2025 (BDO) | Balance y resultados 2024 y 2025; flujo 2025; inventario por categoría 2025 |
| F05 | Suplemento del prospecto 2023 | Crecimiento de ventas proyectado (1.35 %) |
| F06 | Calificación de SCRiesgo, junio 2024 | Contraste de rotaciones |
| F07 | Calificación de Moody's Local, diciembre 2025 | Contraste de 2025 |

Salvedades que se respetan:

- 2022 y 2023 tienen opinión calificada del auditor (no se consolidó Industrias San Francisco). Se indica en la app.
- El balance de 2022 tiene dos presentaciones (F01 y F02). Se usa **F02**, que es la comparable con 2023.
- 2024 tiene dos presentaciones (F03 y F04). Se usa **F04** para 2024 y 2025, con el pago mínimo definitivo en línea propia. Así el año base y el año de contraste se leen igual.
- No se mezclan líneas de distintas versiones de un mismo flujo. Cada año usa una sola versión: 2022 de F02, 2023 y 2024 de F03, 2025 de F04.
- En 2025, el flujo de inversión es positivo (C$ 214,423,000) aunque el rótulo de F04 diga «usado en». Se conserva el signo publicado.

---

## 5. Los supuestos

Todos vienen de la sección 11 del archivo de investigación o de decisiones del equipo. Ninguno es un dato confirmado de AGRI-CORP.

| # | Supuesto | Valor | Dónde se edita | A qué afecta |
|---|---|---|---|---|
| S1 | Ventas a crédito | 50 % de las ventas de cada año | Estados (dato suplementario) | Rotación de CxC, plazo de cobro, ciclo de conversión |
| S2 | Compras al contado / a crédito | 40 % / 60 % | Estados y Presupuesto | Rotación de CxP, plazo de pago, pagos a proveedores |
| S3 | Base de compras | Costo de ventas + inventario final − inventario inicial | Estados (dato suplementario) | Pagos a proveedores. Es una aproximación docente; 2022 queda N/D porque falta el inventario de 2021 |
| S4 | Costo de ventas | 75 % variable, 25 % fijo | Apalancamiento | GAO, GAT, punto de equilibrio |
| S5 | Gastos de operación | 25 % variable, 75 % fijo | Apalancamiento | GAO, GAT, punto de equilibrio |
| S6 | Pago mínimo definitivo | Variable (se calcula sobre ingresos) | Apalancamiento | GAO, punto de equilibrio |
| S7 | Precio por acción común | C$ 100 (ilustrativo) | Mercado | P/U, P/VL |
| S8 | Crecimiento de ventas 2025 | 1.35 % (derivado de la proyección en US$ de F05) | Presupuesto maestro | Todo lo proyectado |
| S9 | Reparto trimestral 2025 | Cuatro trimestres iguales | Presupuesto maestro | Caja, inventario, flujo proyectado |
| S10 | Impuesto sobre la renta | 30 % de la UAI positiva; el pago mínimo sigue como gasto aparte (% de ventas) | Presupuesto maestro | ER y balance proforma |
| S11 | Dividendos 2025 | Los preferentes pagados en 2024: C$ 7,520,629 | Apalancamiento (DAP) | Utilidades retenidas proforma, GAF |
| S12 | Partidas sin regla de proyección | Sin cambio respecto de 2024 | Proforma | Balance proforma |
| S13 | Depreciación y amortización 2025 | Las de 2024: PPE 117,394,766 + derecho de uso 12,667,239 + intangibles 19,179,415 = **149,241,420** | Proforma | PPE e intangibles proforma |
| S14 | Inversión en activo fijo 2025 | La de 2024: PPE 36,286,932 + intangibles 9,121,425 = **45,408,357** | Proforma | PPE proforma, flujo de inversión proyectado |
| S15 | Política de inventario final | Días de inventario de 2024: 67.82 días (DERIVADO) | Presupuesto maestro | Compras, pagos, inventario proforma |
| S16 | Kárdex de granza | Costo hipotético por quintal; la cantidad sale de dividir el saldo real entre ese costo | Inventario | Kárdex, stock mínimo y alertas |

**Dividendos de años anteriores:** ya no quedan en N/D. Los flujos traen los dividendos preferentes **pagados**: 4,443,312 (2022), 1,948,421 (2023), 7,520,629 (2024) y 7,520,629 (2025). Se cargan como DAP con la etiqueta "pagado según flujo". El dato es real, pero un pago no siempre es igual al dividendo declarado, así que se rotula.

**S11, S13 y S14 se pueden contrastar con lo que pasó en 2025:**

| Supuesto | Valor proyectado | Real 2025 | Diferencia |
|---|---:|---:|---:|
| S11 Dividendos | 7,520,629 | 7,520,629 | 0 |
| S13 Depreciación y amortización | 149,241,420 | 135,522,070 | −9.2 % |
| S14 Inversión | 45,408,357 | 35,248,627 | −22.4 % |

**Sensibilidad que se documenta:** GAO con 50 %, 75 % y 90 % del costo de ventas como variable.

**Lo que sigue en N/D a propósito:**

- Cualquier cifra de 2022 que necesite saldos de 2021.
- Cantidades físicas reales de inventario (sacos, quintales): no se publican. El kárdex usa S16.

---

## 6. Cada módulo con AGRI-CORP

### Estados financieros

- Balance y estado de resultados de **2022, 2023, 2024 y 2025**, todos reales, con las cuentas confirmadas en el catálogo.
- Datos suplementarios S1–S3 marcados como **SUPUESTO**.
- Controles: activos 2022 = 5,205,499,544; 2023 = 5,289,724,103; 2024 = 6,328,132,696; 2025 = 5,279,969,842. Utilidad neta: 12,128,644; −419,583,311; 42,223,948; −157,990,498.

### Análisis (razones, DuPont, EFE)

- Lee Estados. Con 2022 cargado, las razones de 2023 con saldos promedio ya se calculan.
- Con S1–S3, las rotaciones de CxC y CxP dejan de estar en N/D.
- Controles de rotación de inventario (DERIVADO, coinciden con el anexo):

  | Año | Rotación | Días |
  |---|---:|---:|
  | 2023 | 6.15 veces | 59.36 |
  | 2024 | 5.38 veces | 67.82 |
  | 2025 | 4.08 veces | 89.46 |

- Rotación de CxC 2024 = 4.33 veces (84.26 días), hipotética por S1.
- El EFE de Análisis usa el flujo **publicado** de cada año como flujo documentado: misma fuente, mismo intervalo y todas sus partidas.
- Las cifras de SCRiesgo (10.84 veces en CxC, 33 días) se citan como contraste externo, no se cargan.

### Apalancamiento (GAO, GAF, GAT)

- Clasificación de costos S4–S6 con el comportamiento `mixto` que el módulo ya admite.
- DAP de 2022 a 2025 con los dividendos preferentes pagados según cada flujo.
- GAO y GAT dejan de estar en N/D y llevan la etiqueta **SUPUESTO**.
- **UAII igual en toda la app:** hoy Apalancamiento calcula la UAII solo con costo de ventas, gastos de administración y gastos de ventas (541,920,508 en 2024). Análisis ya usa el subtotal del auditado «antes de partidas financieras» (357,667,403), que además incluye el pago mínimo definitivo, otros gastos y otros ingresos. F2 hace que Apalancamiento use la misma UAII.
- **Prueba de coherencia con un dato real:** la depreciación y amortización de 2024 (149,241,420) es un costo fijo seguro. La app comprueba que los costos fijos que resultan de S4–S5 no sean menores que esa cifra.

### Razones de mercado

- 476,176 acciones comunes (F03, nota 34) y precio S7.
- P/U y P/VL se rotulan como "ilustrativo". El valor nominal de C$ 1,000 no es un precio de mercado.

### Punto de equilibrio

- **Consolidado:** se deriva de los estados de 2024 con la clasificación de Apalancamiento. No hay que capturar nada. La unidad es "C$1 de ventas", así que el punto de equilibrio sale directamente en C$.
- **Línea de arroz:** precio, costo variable y costos fijos por saco; punto de equilibrio en sacos.
- Escenarios de sensibilidad (precio, costo variable, costos fijos, volumen) sobre la base consolidada.

### Flujo de efectivo

Este módulo queda **100 % real**, sin supuestos.

- **Un año por carga**, con selector de 2022, 2023, 2024 y 2025. El año por defecto es el último cargado (2025), el mismo que usan Análisis, Inicio y Proforma.
- **Inversión y financiamiento:** todas las partidas publicadas, línea por línea. Por ejemplo, en 2024:
  - adiciones de PPE −36,286,932;
  - contratación de préstamos 4,240,845,895 y pagos −4,061,137,253;
  - dividendos preferentes −7,520,629.
- **Operación:** el módulo usa el método directo y los estados publican el indirecto. Para no inventar cobros ni pagos, operación se carga con:
  - el subtotal publicado "Efectivo de operación antes de intereses e impuestos" (758,587,482 en 2024), rotulado como subtotal del método indirecto;
  - las tres líneas que sí son de caja: impuesto pagado (−374,194,121), intereses cobrados (12,611,343) e intereses pagados (−206,971,340).
- **Conciliación:** saldo inicial + neto = saldo final, igual al efectivo del balance en los cuatro años. En 2022 y 2023 se incluye el efecto de conversión publicado (323,599 y 180,394).
- **Detalle indirecto completo:** depreciación, variaciones de CxC, inventario, proveedores, etc. se ve en el EFE de Análisis como flujo documentado.
- **Proyectado 2025:** cobros y pagos que salen del presupuesto maestro, por trimestre, con columna de contraste contra el flujo real de 2025.

### Inventario

El anexo trae el inventario **real por categoría** de 2022 a 2025, en C$. Advierte que no hay cantidades físicas y que no se deben poner córdobas en un campo de unidades. Por eso el módulo tiene dos partes:

- **Composición real (solo lectura, REAL):**
  - categorías por año: granza de arroz, sal, productos terminados producidos y adquiridos, insumos, repuestos, empaque, importaciones en tránsito, otros;
  - estimación por deterioro;
  - inventario neto, con rotación y días por año;
  - nota: parte de la granza garantiza préstamos (nota 12).
- **Kárdex de granza de arroz (SUPUESTO S16):**
  - parte del saldo real de granza al cierre de 2024, C$ 848,279,169;
  - el equipo elige un costo hipotético por quintal y la app calcula la cantidad;
  - entradas y salidas de 2025 simuladas con promedio ponderado, la misma política contable de la empresa (nota 2.9);
  - stock mínimo hipotético.

  Así la cantidad y el costo unitario quedan claramente como supuestos, pero el valor de partida es real.
- **Línea de arroz:** su kárdex por saco sigue disponible como segundo ejemplo.

### Presupuesto maestro

- Proyección de **2025 en cuatro trimestres**, desde el cierre real de 2024.
- Aperturas reales: caja 284,636,118; clientes 1,160,810,469; proveedores 1,039,869,493; inventario 1,621,305,239.
- Ventas 2025 = 9,010,443,238 × 1.0135 = **9,132,084,222** (S8), repartidas en partes iguales (S9).
- Costo de ventas 83.68 % de las ventas (proporción 2024). Cobros, compras e inventario con S1, S2 y S15 (67.82 días de inventario).
- **Unidad del presupuesto:** "C$1 al costo". El costo unitario es 1 y el precio es ventas ÷ costo de 2024 = 1.1950. Así el inventario del presupuesto se lee directamente en C$ y coincide con el balance (apertura 1,621,305,239).
- El impuesto pagado y los intereses pagados del presupuesto se contrastan con los reales de 2025 (393,877,433 y 327,207,977).

### Proforma y balance proforma (nuevo)

Una sola cadena:

```
Estados 2024 (apertura) ──► Presupuesto maestro 2025 ──► ER proforma 2025 ──► Balance proforma al 31-dic-2025
                                                                                 │
                                                       Estados 2025 (real) ◄─────┘  contraste
```

- **ER proforma:** real 2024, proforma 2025, real 2025 y variación.
- **Balance proforma:**
  - caja, clientes, inventario y proveedores al cierre salen del presupuesto;
  - propiedad, planta y equipo, derecho de uso e intangibles = apertura + inversión (S14) − depreciación y amortización (S13);
  - utilidades retenidas = apertura + utilidad neta − dividendos;
  - el resto, sin cambio y editable partida por partida;
  - si no cuadra, se muestra el **financiamiento externo requerido**. No se crea ningún préstamo automático.
- **Contraste con la realidad:** ventas proyectadas 9,132M contra 7,895M reales, un error de **−13.5 %**. Es un buen punto para la defensa: muestra qué supuestos fallaron y por qué.
- Los supuestos del balance se guardan con el presupuesto del que dependen. Nunca se guardan resultados.
- La línea de arroz usa la misma cadena; su balance de apertura se declara en sus supuestos.

### Reportes

- El resumen por módulo incluye **todos** los módulos de empresa y el nombre de la empresa.
- El HTML exportado incluye el balance proforma y el contraste.

---

## 7. Cómo se conectan los supuestos

Los módulos ya están encadenados. Cambiar un supuesto se nota en todo el sistema:

| Si cambia… | Se actualiza… |
|---|---|
| Ventas a crédito (S1) | Rotación de CxC, plazo de cobro, ciclo de conversión, cobros del presupuesto |
| Clasificación de costos (S4–S6) | GAO, GAT, punto de equilibrio |
| Crecimiento (S8) | Presupuesto, caja, flujo proyectado, inventario, ER proforma, balance proforma |
| Impuesto (S10) | Utilidad neta proforma, utilidades retenidas, financiamiento requerido |
| Dividendos (S11) | GAF, utilidades retenidas proforma |

En la defensa se puede hacer en vivo: se cambia un supuesto y se recorre el efecto.

---

## 8. Piezas nuevas para la defensa

### 8.1 Mapa de supuestos en Inicio

Una tabla única con cada supuesto (S1–S12):

- su valor;
- su etiqueta (REAL, DERIVADO o SUPUESTO);
- su fuente;
- un enlace al módulo donde se edita.

Responde "¿de dónde sale esta cifra?" sin recorrer módulo por módulo. Se calcula con los datos guardados; no duplica la captura.

### 8.2 Procedencia en cada pantalla

- Cada módulo muestra arriba "AGRI-CORP · consolidado" o "AGRI-CORP · línea de arroz".
- Las cifras supuestas llevan su etiqueta.
- Si se carga un ejemplo de otra empresa en un solo módulo, la pantalla avisa que hay empresas mezcladas.

### 8.3 Selectores de ejemplos

- AGRI-CORP consolidado aparece **primero y preseleccionado** en todos los módulos de empresa; la línea de arroz, segunda.
- Los demás ejemplos pasan a "Otros ejemplos".
- Inicio carga AGRI-CORP por defecto y llena los siete módulos de empresa en una sola escritura.

---

## 9. Fases de trabajo

Cada fase termina con `npm test` y `npm run lint` en verde y un commit propio.

| Fase | Contenido | Resultado verificable |
|---|---|---|
| **F1** ✅ | Estados 2022–2025 reales (presentación F04) y datos suplementarios S1–S3 | Activos y utilidad neta de los cuatro años coinciden con los auditados; rotaciones de control. **Hecho**: además se adjuntan los flujos publicados de 2024 y 2025 (cuadran con diferencia 0) y los dividendos pagados de 2022–2025. Los flujos de 2022 y 2023 esperan a F3, porque tienen efecto de conversión |
| **F2** ✅ | Apalancamiento (S4–S6, DAP) y Mercado (acciones, S7) | GAO, GAT, P/U y P/VL con cifra y etiqueta. **Hecho**: la UAII de Apalancamiento es el subtotal operativo del auditado, igual que en Análisis (357,667,403 en 2024); GAO 2024 = 8.18 y GAF = 3.25. Aviso si los costos fijos quedan bajo la depreciación publicada. Mercado muestra la nota SUPUESTO del precio. Pendiente para F6–F7: la etiqueta "ilustrativo" en los indicadores de Proforma e Inicio |
| **F3** ✅ | Equilibrio, Flujo e Inventario sobre AGRI-CORP, consolidado y línea de arroz | Punto de equilibrio en C$ y en sacos; flujo real 2022–2025 línea por línea, conciliado con el balance; composición real de inventario y kárdex de granza. **Hecho**: PE 2024 = C$ 7,909,413,340 en C$1 de ventas, margen de seguridad 12.22 % y la misma UAII y GAO de Apalancamiento (los otros ingresos operativos reducen el CF). Flujos 2022–2025 con efecto de conversión, en Análisis y en el selector de Flujo. Composición real que coincide con el balance en los cuatro años y kárdex de granza (C$ 620/quintal, consumo = rotación 2025 × granza promedio, stock mínimo = un mes) que cierra en el saldo real de 2025. El respaldo JSON conserva estos campos y el origen del C-V-U. El flujo proyectado 2025 pasa a F4, porque sale del presupuesto |
| **F4** ✅ | Presupuesto maestro 2025 trimestral (S8–S10) | Caja, cobros, pagos e inventario por trimestre. **Hecho**: ventas 9,132,084,222; UAII 371,735,210 (= UAII 2024 + 1.35 % del margen después de costos variables); utilidad neta 67,137,655; caja final 655,014,198 sin financiamiento; inventario final 1,419,868,672 (67.82 días). Otros ingresos operativos netos de los gastos fijos; D&A de 2024 como depreciación; el IR por pagar de 2024 sale en el T1; saldo mínimo de caja 0. Limitación: el módulo usa costeo absorbente, así que su propio punto de equilibrio trata todo el costo de ventas como variable (el del caso está en Punto de equilibrio). Pendiente para F5: hoy Proforma compara la proyección contra el último periodo (real 2025); debe mostrar real 2024 (base), proforma 2025 y real 2025 (contraste) |
| **F5** ✅ | Balance proforma y contraste con 2025 real | El balance cuadra o muestra el financiamiento requerido; columna real 2025. **Hecho**: el presupuesto declara su periodo base (2024) y reparte los otros desembolsos (inversión, dividendos, IR pagado). El balance proforma abre con el real de 2024, cierra con el presupuesto y se contrasta con el real de 2025: activos 6,373,941,205 = pasivos + patrimonio (cuadra, sin financiamiento externo). El ER compara base 2024, proforma 2025 y real 2025 con el desvío (real − proforma) / |proforma|: ventas −13.54 %, UAII −47.21 %, utilidad neta de +67.1 M a −158.0 M. Sin periodo base, Proforma funciona como antes |
| **F6** ✅ | Proforma y Reportes integrados | Reportes resume todos los módulos; el HTML incluye el balance proforma. **Hecho**: el resumen por módulo del dashboard muestra los siete módulos de empresa con su cifra clave o el motivo de lo que falta. El HTML exportado agrega el ER proforma (base, proforma, contraste y desvío), el balance proforma, los indicadores integrados y el estado de los módulos. P/U y P/VL de Proforma y del reporte dicen «SUPUESTO: precio ilustrativo» cuando el precio tiene nota |
| **F7** ✅ | Mapa de supuestos, procedencia, selectores e Inicio | Inicio carga AGRI-CORP por defecto; aviso de mezcla de empresas. **Hecho**: AGRI-CORP va primero y preseleccionado, en su propio grupo, en los selectores de Inicio, Estados, Flujo, Equilibrio, Presupuesto, Inventario y Mercado; los demás ejemplos quedan en «Otros ejemplos». La unidad simulada se llama «AGRI-CORP · línea de arroz (escenario simulado)». Un registro `casos` en el store guarda de qué caso viene cada módulo; cada pantalla de empresa muestra arriba el caso o el aviso «Empresas mezcladas». Inicio muestra el mapa de supuestos con el valor vigente de S1–S16, su fuente y el módulo donde se edita |
| **F8** ✅ | Pruebas, revisión en navegador (1440 y 390 px, claro y oscuro), ficha, D-113 y PR | PR listo para revisión. **Hecho**: D-113, ficha, CHANGELOG y api.md. A 390 px en modo oscuro ninguna pantalla de empresa se desborda; se corrigió el desbordamiento de Apalancamiento (etiquetas `sr-only` de la tabla fuera de su contenedor) |

---

## 10. Áreas del equipo que se tocan

Este documento sirve de aviso para quienes mantienen estas áreas:

| Área | Responsable | Qué cambia |
|---|---|---|
| Estados (`js/modules/estados/`) | Cris | Se agregan periodos y datos suplementarios al ejemplo; la presentación de 2022–2024 pasa a la de F04. El motor no cambia |
| Reportes (`js/modules/integracion/`) | Cris | El resumen incluye todos los módulos y el balance proforma |
| Análisis (`js/modules/analisis/`) | Henry | Sin cambios de fórmulas; recibe cuatro años y los datos de crédito |
| Apalancamiento, Equilibrio, Flujo, Inventario, Presupuesto, Proforma | Carlos | Ejemplos de AGRI-CORP, etiquetas de procedencia y balance proforma |
| Catálogo de ejemplos e Inicio | Todos | AGRI-CORP por defecto; los demás ejemplos se conservan |

No se agregan dependencias. Las fórmulas siguen la convención del proyecto: año de 365 días y `null` (N/D) cuando falta un dato.

---

## 11. Riesgos y cómo se manejan

| Riesgo | Manejo |
|---|---|
| La unidad "C$1 de ventas" da "unidades" de miles de millones y puede confundir | Las etiquetas cambian a "C$ de ventas" o "C$ al costo" cuando se usa esa unidad. En Inventario no se usa: ahí hay composición real en C$ y un kárdex con cantidades hipotéticas declaradas |
| Mezclar el método indirecto publicado con el módulo de flujo directo | Operación se carga como subtotal publicado más las tres líneas de caja; el detalle indirecto queda en el EFE de Análisis |
| Que un supuesto se lea como dato real | Etiqueta visible en cada cifra y mapa de supuestos en Inicio |
| La proforma 2025 falla contra el real (−13.5 %) | Se presenta como hallazgo: el modelo usa la expectativa publicada en 2023 y 2025 fue un año de caída |
| Opiniones calificadas del auditor en 2022–2023 | Aviso visible en Estados |
| Ejemplos de otras empresas mezclados con AGRI-CORP | Aviso de mezcla y AGRI-CORP por defecto |

---

## 12. Decisiones confirmadas

1. **Crecimiento 2025:** 1.35 % (F05), editable.
2. **Impuesto:** 30 % de la UAI positiva; el pago mínimo definitivo sigue como gasto en línea propia (2.13 % de las ventas en 2024), para no contarlo dos veces.
3. **Dividendos 2025:** se repiten los preferentes de 2024.
4. **Trimestres:** reparto igual de las ventas. No se usa la venta real del primer trimestre de 2025, porque no se conocía al proyectar.
5. **Proyección:** 2025 desde 2024, contrastada con el 2025 auditado.
6. **Capas:** consolidado en C$ como capa principal y línea de arroz para el detalle por unidad.
7. **Depreciación e inversión 2025:** se repiten las de 2024 (S13 y S14) y se contrastan con las reales de 2025.
8. **Flujo de efectivo:** real línea por línea; operación como subtotal publicado más las líneas de caja.

**Pendiente de decidir en equipo:** el costo hipotético por quintal de granza (S16). Con él, la app calcula cuántos quintales representan los C$ 848,279,169 del cierre de 2024.

---

## 13. Qué necesitamos del equipo

- **Todos:** revisar las secciones 5 y 12. Si alguien no está de acuerdo con un supuesto, hay que decirlo antes de F1.
- **Todos:** proponer el costo por quintal de granza para el kárdex (S16).
- **Cris:** confirmar que no hay trabajo en curso en Estados o Reportes que choque con F1 y F6.
- **Henry:** confirmar que Análisis acepta cuatro periodos y los datos de crédito sin cambios.
- Para la exposición: elegir quién explica cada bloque (datos reales, supuestos, proyección y contraste).
