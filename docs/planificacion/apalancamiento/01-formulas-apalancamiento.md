# 01 — Fórmulas de apalancamiento

- **Estado**: Completado
- **Fecha**: 2026-09-27
- **Depende de**: 00

## Objetivo

Fijar las fórmulas de GAO, GAF y GAT, de dónde sale cada variable y qué devuelve el sistema en los casos especiales. Los casos resueltos a mano de este paso serán los tests del CP2.

## Diccionario de variables

Todas son por periodo y en córdobas. Los montos del estado de resultados salen de `computeFinancialTotals`, con costos y gastos en positivo.

| Símbolo | Cómo se obtiene |
|---|---|
| Ventas | Cuentas de tipo `ventas` |
| CV | Cuentas operativas marcadas como variables, más la parte variable de las mixtas |
| CF | Cuentas operativas marcadas como fijas, más la parte fija de las mixtas |
| MC | Ventas − CV |
| UAII | Ventas − costo de ventas − GA − GV, igual que en `computeRazones` |
| OI, OG | Cuentas de tipo `otrosIngresos` y `otrosGastos` |
| I | Cuentas de tipo `intereses` |
| UAI | UAII + OI − OG − I |
| IR | Cuentas de tipo `impuestos` |
| UN | UAI − IR (`utilidadNeta`) |
| T | IR / UAI si la UAI es positiva, hay IR y el resultado está entre 0 y 1; si no, la tasa configurable (30 % por defecto) |
| DAP | Campo opcional por periodo; 0 si no se informa |
| UDAC | Utilidad disponible para accionistas comunes = UN − DAP |

Las cuentas operativas son las de tipo `costoVentas`, `gastosAdmin` y `gastosVentas`. Control: CV + CF = costo de ventas + GA + GV, de modo que MC − CF = UAII. Si una cuenta operativa no tiene comportamiento asignado, las fórmulas estructurales dan N/D.

## Fórmulas

Estructurales, con los datos de un periodo:

- GAO = MC / UAII
- GAF = UAII / (UAI − DAP / (1 − T))
- GAT = GAO × GAF = MC / (UAI − DAP / (1 − T))

Por variación, entre un periodo base (t−1) y el siguiente (t), con %ΔX = (Xt − Xt−1) / Xt−1, que ya calcula `ahPctDelta`:

- GAO = %ΔUAII / %ΔVentas
- GAF = %ΔUDAC / %ΔUAII
- GAT = %ΔUDAC / %ΔVentas

Notas:

- Si CF, CV / Ventas, I, OI, OG, T y DAP no cambian entre los dos periodos, el resultado por variación es igual al estructural del periodo base (caso A). Si difieren, cambió la estructura o hay costos mal clasificados.
- T solo interviene si DAP > 0. Con DAP = 0, GAF = UAII / UAI.
- %ΔUDAC reemplaza a %ΔUPA: son iguales si el número de acciones no cambia, así que no hace falta pedirlo.

## Otros ingresos y otros gastos en el GAF: opción B

Es la pregunta 4 del paso 00; se eligió B el 2026-09-27 ([D-007](../../decisiones.md)). Las dos opciones dejan OI y OG fuera de la UAII, como el código actual, así que el GAO no cambia. Lo que cambia es el GAF:

| Opción | GAF | MUNO MODA 2023 (OI 15,000, OG 10,000, sin I ni DAP) |
|---|---|---:|
| A, clásica | UAII / (UAII − I − DAP / (1 − T)) | 1.0000 |
| B, elegida | UAII / (UAI − DAP / (1 − T)) | 0.9643 (135,000 / 140,000) |

B da lo mismo que A cuando OI = OG = 0, y es la única que coincide con el GAF por variación, que parte de la UN (y la UN incluye OI y OG).

## Casos especiales (propuesta)

| Caso | Resultado |
|---|---|
| Falta un dato o hay una cuenta operativa sin comportamiento | Estructurales: N/D. Por variación: se calculan si hay dos periodos |
| Denominador 0: UAII en el GAO; UAI − DAP / (1 − T) en el GAF y el GAT | N/D |
| UAII < 0, o UAI − DAP / (1 − T) < 0 | Se devuelve el valor negativo y la interfaz advierte que la empresa está bajo su punto de equilibrio operativo o financiero |
| Un solo periodo | Por variación: N/D |
| %ΔVentas = 0 (GAO y GAT) o %ΔUAII = 0 (GAF) | N/D |
| Base ≤ 0 en una variación (Ventas, UAII o UDAC del periodo t−1) | N/D: un porcentaje sobre una base negativa no mide sensibilidad |
| T efectiva fuera de [0, 1), UAI ≤ 0 o sin IR | Se usa la tasa configurable |
| Tasa configurable fuera de [0, 1) | N/D, y la interfaz no permite guardarla |

Un denominador se trata como 0 si su valor absoluto es menor que 0.005 (medio centavo), para que un error de redondeo no produzca un grado enorme en lugar de N/D.

## Casos resueltos a mano

### Caso A: estructura constante

I = 50,000; T = 30 %; DAP = 7,000; OI = OG = 0. Las ventas suben 10 % y el CV es el 60 % de las ventas.

| Concepto | Periodo 1 | Periodo 2 |
|---|---:|---:|
| Ventas | 1,000,000 | 1,100,000 |
| CV | 600,000 | 660,000 |
| MC | 400,000 | 440,000 |
| CF | 250,000 | 250,000 |
| UAII | 150,000 | 190,000 |
| UAI | 100,000 | 140,000 |
| IR | 30,000 | 42,000 |
| UN | 70,000 | 98,000 |
| UDAC | 63,000 | 91,000 |
| DAP / (1 − T) | 10,000 | 10,000 |
| GAO | 2.6667 | 2.3158 |
| GAF | 1.6667 | 1.4615 |
| GAT | 4.4444 | 3.3846 |

Por variación del periodo 1 al 2: %ΔVentas = 10 %, %ΔUAII = 26.67 % y %ΔUDAC = 44.44 %. Resultan GAO = 2.6667, GAF = 1.6667 y GAT = 4.4444, los mismos valores que los estructurales del periodo 1.

### Caso B: casos especiales

| Datos | Resultado esperado |
|---|---|
| Ventas 500,000; CV 300,000; CF 200,000 (UAII = 0) | GAO N/D |
| Ventas 400,000; CV 240,000; CF 200,000 (MC = 160,000; UAII = −40,000) | GAO = −4, con advertencia |
| UAII 100,000; I 90,000; DAP 7,000; T 30 % (UAI − DAP / (1 − T) = 10,000 − 10,000 = 0) | GAF y GAT N/D |
| Ventas iguales en los dos periodos | GAO y GAT por variación N/D |
| UAII del periodo base negativa | GAO y GAF por variación N/D |

### Caso C: MUNO MODA, con cambios de estructura entre 2023 y 2024

Costo de ventas variable y gastos de administración fijos, según la sugerencia del paso 00.

| Cálculo | GAO |
|---|---:|
| Estructural 2023, gastos de ventas fijos | 2.5185 (340,000 / 135,000) |
| Estructural 2023, gastos de ventas variables | 1.8889 (255,000 / 135,000) |
| Por variación 2023 → 2024 | 1.7989 (14.81 % / 8.24 %) |

Como la demo no trae intereses, impuestos ni DAP, su GAF solo depende de la opción A o B.

## Checkpoint

Aprobado el 2026-09-27: Carlos delegó la aprobación ("toma las riendas y procede como consideres").

- [x] Fórmulas estructurales y por variación aprobadas.
- [x] Elegida la opción A o B para otros ingresos y otros gastos (B).
- [x] Casos especiales aprobados.
- [x] Casos A, B y C revisados, para usarlos como tests en el CP2.

## Preguntas abiertas

Ninguna. Resueltas el 2026-09-27:

- GAF: opción B, con la UAI ([D-007](../../decisiones.md)).
- UAII negativa: se devuelve el valor con advertencia, no N/D ([D-008](../../decisiones.md)).

## Próximo paso

CP2: funciones puras en `js/utils/calculate.js`, con los casos A, B y C como tests. Nombres propuestos: `gao`, `gaf`, `gat`, `gaoVariacion`, `gafVariacion` y `gatVariacion`. `apalancamiento` ya existe (multiplicador de DuPont) y no se toca.
