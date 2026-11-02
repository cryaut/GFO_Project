# EFE — Reporte ronda 1

- **Fecha**: 2026-10-30
- **Rama**: `feat/efe-robusto`, creada desde `origin/main` en `00c60f3` (incluye Estados, PR #19).
- **Encargo**: `instrucciones_efe_ronda1.md`, con la referencia independiente del bloque A (`efe_ronda1_referencia_bloque_A.json`, copiada a `tests/unit/fixtures/`) y la entrada del bloque A ya en `main` (`tests/unit/fixtures/estados_ronda2_bloque_A.json`).

## 1. Commits

Un commit por tarea:

| SHA | Tarea | Commit | Qué cambió |
|---|---|---|---|
| `5e6a433` | T1 | `feat: clasifica el EFE por rol del id de cuenta` | Nueva tabla `js/modules/analisis/efe-roles.js` con el rol por id del catálogo (D-066). `variacionesDeCuentas` (compartida con EOAF) devuelve ahora el `id` de cada fila; cambio aditivo, el EOAF no se altera. `construirEFE` clasifica por rol en lugar del tipo general: los renglones de operación se consolidan en «activos de operación» y «pasivos de operación», la inversión usa los activos de inversión y el financiamiento una sola línea de deuda. Prueba de cobertura: todo activo y pasivo del catálogo tiene rol. |
| `c07dde8` | T2 | `fix: excluye los totales reportados con componentes del EFE` | D-067: `efe-roles.js` agrega el mapa de componentes de cada total reportado del balance. Un total con componentes en los datos no entra (la variación la explican ellas); sin componentes, el total se conserva porque es el único dato del concepto (caso del demo, registrado con causa D-066 y D-067, sin cifras). Prueba: el par A3 2024 → 2025 queda en cuadra contra la referencia. |
| `82f6e28` | T3 | `fix: mueve las reservas al destino de utilidades del EFE` | D-068: las reservas (misma regla de nombres del aviso de sentidos opuestos, `/\breservas?\b/`) se suman a las utilidades acumuladas y cuentas del resultado como destino de utilidades: dividendos = utilidad neta − Δ(destino); aportaciones = Δpatrimonio − Δ(destino). El aviso de ausencia ahora menciona «ni reservas». |
| `93eab6f` | T4 | `feat: concilia la utilidad del EFE contra el balance con tercer estado` | D-069: si existe la cuenta de resultado del periodo en el patrimonio (por id `bs.current_year_result_equity`) y no coincide con la utilidad neta (tolerancia de `toleranciaComprobacion`), el estado es **no cuadra** con motivo `utilidad_no_conciliada` y la diferencia en el nuevo campo `conciliacionUtilidad`. Si no existe, el estado es **cuadra (sin verificar la utilidad)**: tercer estado con insignia propia en Análisis y advertencia visible. La interpretación afirma la verificación solo cuando concilia, y pide confirmación independiente cuando no. |
| `ada1800` | T5 | `test: verifica el bloque A y las variantes del EFE contra sus esperados` | Bloque A: los 9 pares contra la referencia (operación, inversión, financiamiento, dividendos, aportaciones; tolerancia 0.01; todos en cuadra). Variantes V0 a V16 y VB con los esperados de la tabla del encargo. |
| *este commit* | T6 | `docs: agrega el reporte de la ronda 1 del EFE` | Este archivo. |

## 2. Hallazgos de partida, resueltos

| Hallazgo | Decisión que lo resuelve | Verificación |
|---|---|---|
| H1: reservas tratadas como aportación | D-068 | V6: dividendos −30 y aportaciones 0 con reserva 20 de traspaso interno |
| H2: clasificación por tipo general | D-066 | V11, V12, V13 (inversiones de corto plazo, provisiones de largo plazo y gastos acumulados en su rol correcto) y la prueba de cobertura del catálogo |
| H3: totales reportados del balance | D-067 | El par A3 2024 → 2025 pasa a cuadra con la referencia |
| H4: la utilidad no se compara con el balance | D-069 | VB: no cuadra con diferencia 50 y motivo `utilidad_no_conciliada` |

## 3. Pruebas existentes cambiadas (antes → después, con causa)

| Prueba (archivo) | Antes | Después | Causa |
|---|---|---|---|
| `efe.test.js` — «arma las tres actividades…» | Renglones por tipo: Inventario −15, Cuentas por Cobrar +10, Cuentas por Pagar +10, Provisiones 0 | Renglones por rol: «activos de operación» −5 (inventario +15 y CxC −10 consolidados) y «pasivos de operación» +10 | D-066 |
| `efe.test.js` — «arma las tres actividades…» | Renglón «Venta o baja de activos fijos» y renglones de deuda separados («largo plazo», «corto plazo financiero») | «Venta o baja de activos de inversión» y un solo renglón «Aumento de deuda» | D-066 |
| `efe.test.js` — demo MUNO MODA (unitaria) | Totales de las tres actividades con la clasificación anterior y la deuda partida en dos renglones | Totales recalculados con los roles D-066 y un renglón de deuda consolidado. Cambio registrado **sin cifras** de MUNO MODA, como pide el encargo | D-066 |
| `efe.test.js` — pantalla de la demo | El bloque contiene «Venta o baja de activos fijos» | Contiene «Venta o baja de activos de inversión» | D-066 |
| `efe.test.js` — datos de las pruebas del EFE | Nombres que el tipo legado resolvía pero que por id quedan sugeridos («Equipos», «Prestamo Largo Plazo») o que son el total reportado («Inventario») | Nombres canónicos del catálogo («Maquinaria y equipo», «Deudas de largo plazo», «Inventario de mercaderías»): el rol por id exige la identidad reconocida | D-066 |
| `efe.test.js` — «arma las tres actividades…» | `estado` «cuadra» (sin verificación de utilidad) | `estado` «cuadra-sin-verificar»; `conciliacionUtilidad` null; la interpretación dice que la utilidad «no se pudo conciliar» | D-069 |
| `efe.test.js` — «la interpretación dice si la operación alcanza…» (caso consume) | `estado` «cuadra» | «cuadra-sin-verificar» | D-069 |
| `efe.test.js` — «sin cuentas de utilidades acumuladas…» | `estado` «cuadra» | «cuadra-sin-verificar» | D-069 |
| `efe.test.js` — «baja de activos fijos…» | `estado` «cuadra» | «cuadra-sin-verificar» | D-069 |
| `efe.test.js` — «sin estado de resultados…» (ER vacío) | `estado` «cuadra» | «cuadra-sin-verificar» + advertencia «No hay cuenta de resultado del periodo» | D-069 |
| `efe.test.js` — «las cuentas del resultado del ejercicio…» | Sin afirmación de conciliación | Se agrega: `conciliacionUtilidad` conciliada con diferencia 0 (el estado sigue «cuadra») | D-069 |
| `efe.test.js` — demo MUNO MODA (unitaria) | `estado` «cuadra» | «cuadra-sin-verificar» (la demo no tiene cuenta de resultado en el patrimonio) | D-069 |
| `cuentas-revision.test.js` — «cuadrar el EFE con dividendos derivados…» | `estado` «cuadra»; la interpretación decía «no valida de forma independiente la utilidad neta» | «cuadra-sin-verificar»; la interpretación pide «confirmación con un dato independiente» (misma intención: el cuadre no valida la utilidad) | D-069 |
| `cuentas-revision.test.js` — «un cambio en utilidad puede compensarse…» | `estado` «cuadra» | «cuadra-sin-verificar» | D-069 |

Ninguna prueba cambió por una causa fuera de D-066 a D-069.

Pruebas nuevas (resumen): cobertura de roles y separación por id (T1); par A3 y total sin componentes (T2); traspaso a reservas (T3); conciliación fallida y pantalla del tercer estado (T4); los 9 pares del bloque A y las 18 variantes V0–V16 y VB (T5).

## 4. Variantes contra la tabla del encargo

| Caso | Esperado tras la ronda | Resultado |
|---|---|---|
| V0 | cuadra; operación 100; inversión −20; financiamiento −30; dividendos −30; aportaciones 0 | Cumple, con la utilidad verificada |
| V1 | cuadra sin verificar utilidad; financiamiento −30 | Cumple |
| V2 | cuadra sin verificar utilidad; advertencia; financiamiento −30 | Cumple |
| V3 | financiamiento 20; aportaciones 50; dividendos −30 | Cumple |
| V4 | operación −20; inversión −20; financiamiento 0; dividendos 0 | Cumple |
| V5 | financiamiento −150; dividendos −150 | Cumple |
| V6 | dividendos −30; aportaciones 0 | Cumple (H1 resuelto) |
| V7 | rechazo en la captura | Cumple (compuerta de signos de Estados) |
| V8 | incompleta; motivo de clasificación | Cumple |
| V9 | incompleta; motivo de efectivo | Cumple |
| V10 | no cuadra; diferencia −10 | Cumple |
| V11 | operación 100; inversión −50; financiamiento −30 | Cumple (H2 resuelto) |
| V12 | operación 130; inversión −20; financiamiento −30 | Cumple (H2 resuelto) |
| V13 | operación 140; inversión −20; financiamiento −30 | Cumple (H2 resuelto) |
| V14 | igual que V0 | Cumple |
| V15 | igual que V0 | Cumple |
| V16 | igual que V0 | Cumple |
| VB | no cuadra; diferencia 50; motivo `utilidad_no_conciliada` | Cumple (H4 resuelto) |

**Bloque A:** los 9 pares coinciden con `efe_ronda1_referencia_bloque_A.json` (tolerancia 0.01) y todos quedan en cuadra, incluido A3. En `main` fallaban 8 de 9.

## 5. Suite y lint (comandos y salida)

```
npm.cmd test
npm.cmd run lint
```

`npm.cmd test`:

```
 Test Files  50 passed (50)
      Tests  1281 passed (1281)
```

`npm.cmd run lint`:

```
✖ 10 problems (0 errors, 10 warnings)
```

Los 10 avisos son los mismos de `main`, en archivos que esta rama no toca.

## 6. Conclusión

- Los cuatro hallazgos de partida (H1 a H4) quedan resueltos con D-066 a D-069, verificados por las variantes y el bloque A.
- Ninguna condición de parada se activó: los 9 pares del bloque A coinciden con la referencia, las 18 variantes dan su esperado, ninguna prueba cambió fuera de las causas D-066 a D-069, y no hizo falta tocar `cuentas-catalogo.js`, los JSON de razones, el motor, el flujo directo ni Proforma.
- Pendiente para la ronda 2 (última, sujeta a confirmación de Cris): sacar el flujo directo de Proforma e Inicio con el EFE como única fuente, unificar la tolerancia del flujo directo y revisar EOAF.
- La rama queda lista para PR cuando Cris lo indique; el encargo prohíbe abrirlo desde aquí.
