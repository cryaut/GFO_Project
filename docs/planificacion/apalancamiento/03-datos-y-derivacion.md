# 03 — Datos y derivación

- **Estado**: Pendiente
- **Fecha**: 2026-09-27
- **Depende de**: 02

## Objetivo

Obtener, para cada periodo de los estados guardados, todas las variables del diccionario del paso 01 (Ventas, CV, CF, MC, UAII, OI, OG, I, UAI, IR, T, UN, DAP y UDAC) y pasarlas a las funciones del paso 02. Es el CP3 de la ficha. Aquí no hay interfaz: todo es lógica pura con tests.

## Qué se guarda

Una sección nueva `apalancamiento` en `defaultData` de `js/store.js`. `setPersisted` rechaza claves que no existan ahí, así que es obligatoria. Es un archivo compartido: se avisa en el PR. Solo se agrega una clave; no cambia la forma de las demás.

```js
apalancamiento: {
  comportamiento: {                 // por nombre de cuenta del estado de resultados
    'Costo de Ventas': { tipo: 'variable' },
    'Gastos de Administracion': { tipo: 'fijo' },
    'Gastos de Ventas': { tipo: 'mixto', pctVariable: 0.4 }
  },
  dap: { '2024': 7000 },            // por periodo; si falta, 0
  tasaDefecto: 0.30                 // TASA_IR_DEFECTO si no se cambió
}
```

- El comportamiento va por cuenta, no por tipo, porque dos cuentas del mismo tipo pueden comportarse distinto.
- Se guarda aparte de `estados` ([D-004](../../decisiones.md)): reimportar los estados no borra la clasificación.
- Las cuentas que ya no existen en los estados se ignoran al calcular, pero no se borran. Así, si vuelven en otra carga, conservan su clasificación.

## Dónde va el código

| Archivo | Contenido |
|---|---|
| `js/modules/apalancamiento/apalancamiento-calculations.js` | Derivación y armado de resultados. Sin DOM, `window` ni `store`: recibe los datos como parámetros |
| `js/utils/calculate.js` | Solo las fórmulas del paso 02; aquí no se agrega nada |
| `js/store.js` | La sección `apalancamiento` |
| `js/modules/estados/estados-calculations.js` | Solo agrega `resolveAccountType`, exportada; lo revisa Cris |

Los estados se leen como en Análisis: `store.get('estados')` y `normalizeFinancialData`. Esa lectura va en `index.js` (CP4), no en `apalancamiento-calculations.js`.

## Funciones del módulo

| Función | Qué hace |
|---|---|
| `cuentasOperativas(estados)` | Lista las cuentas del estado de resultados de tipo `costoVentas`, `gastosAdmin` o `gastosVentas` en cualquier periodo, con su tipo |
| `sugerirComportamiento(tipo)` | `costoVentas` → `'variable'`; `gastosAdmin` → `'fijo'`; cualquier otro → `null` (lo elige el usuario) |
| `resolverComportamiento(cuentas, guardado)` | Para cada cuenta, el comportamiento guardado o, si no hay, la sugerencia, marcando cuál es cuál |
| `derivarPeriodo(estados, periodo, config)` | Todas las variables del diccionario, más la traza y la lista de faltantes |
| `calcularApalancamiento(estados, config)` | Grados estructurales por periodo y por variación por cada par de periodos consecutivos, con sus advertencias |

`config` es la sección `apalancamiento` del `store`.

### Reglas de derivación

- **Totales por tipo** con `computeFinancialTotals`, nunca por nombre de cuenta (regla 6 de `AGENTS.md`). Si `utilidadNeta` sale `null` porque hay cuentas del estado de resultados sin tipo, todo el periodo es N/D y la cuenta sin tipo va a `faltantes`.
- **UAII** = ventas − costoVentas − gastosAdmin − gastosVentas, la misma fórmula que `computeRazones`. No se importa `analisis/index.js`, porque mezcla cálculo e interfaz.
- **CV y CF** se suman cuenta por cuenta. Una mixta aporta `importe × pctVariable` a CV y el resto a CF. Si una cuenta operativa no tiene comportamiento (ni guardado ni sugerido), CV y CF son `null` y los grados estructurales dan N/D.
- **Control**: CV + CF debe ser igual a costoVentas + gastosAdmin + gastosVentas (con la tolerancia del paso 01). Si no, error de programación: el test lo detecta.
- **IR**: `null` si el periodo no tiene ninguna cuenta de tipo `impuestos`, aunque `computeFinancialTotals` devuelva 0 ([paso 02](02-motor-de-calculo.md)). T sale de `tasaImpuesto(ir, uai, config.tasaDefecto)` y se anota si fue efectiva o por defecto.
- **DAP** = `config.dap[periodo]` o 0. **UDAC** = UN − DAP.
- **Variación**: solo entre periodos consecutivos de `estados.periods`, que ya vienen ordenados del más antiguo al más reciente.

### Traza

Cada variable lleva de dónde sale, para que la pantalla la muestre sin recalcular:

```js
{ concepto: 'CV', valor: 510000, formula: 'Suma de cuentas variables',
  cuentas: [{ nombre: 'Costo de Ventas', importe: 510000, comportamiento: 'variable', sugerido: true }] }
```

### Advertencias

`calcularApalancamiento` devuelve advertencias con un código, para que la interfaz ponga el texto:

| Código | Cuándo |
|---|---|
| `bajo-equilibrio-operativo` | UAII < 0 |
| `bajo-equilibrio-financiero` | UAI − DAP / (1 − T) < 0 |
| `clasificacion-sugerida` | Algún comportamiento viene de la sugerencia y no se guardó |
| `tasa-por-defecto` | T no es la efectiva |
| `estructura-cambio` | Hay dos periodos y el GAO por variación difiere del estructural del periodo base en más de 10 % |

## Tests

En `tests/unit/apalancamiento-calculations.test.js`, con estados de nombres propios y `accountTypes` explícitos, como pide `pruebas-y-documentacion.md`.

| Caso | Datos | Esperado |
|---|---|---|
| Caso A del paso 01 como estados | Ventas 1,000,000 y 1,100,000; costo de ventas 600,000 y 660,000 (variable); gastos de administración 150,000 y gastos de ventas 100,000 (fijos); intereses 50,000; IR 30,000 y 42,000; DAP 7,000 | Mismos valores que el caso A; T efectiva 0.30 |
| MUNO MODA | Demo, sin guardar clasificación | Gastos de ventas sin comportamiento: estructurales N/D; variación GAO 1.798942 |
| MUNO MODA con gastos de ventas fijos | `comportamiento` con gastos de ventas `'fijo'` | GAO 2023 2.518519; advertencia `clasificacion-sugerida` |
| Mixta | Gastos de ventas 100,000 con `pctVariable` 0.4 | Aporta 40,000 a CV y 60,000 a CF |
| Sin cuenta de impuestos | Caso A sin IR, con DAP | IR `null`; T por defecto; advertencia `tasa-por-defecto` |
| Cuenta sin tipo | Una cuenta del estado de resultados sin tipo | Periodo N/D, con la cuenta en `faltantes` |
| Un solo periodo | Caso A, solo periodo 1 | Sin resultados por variación |
| Cuenta que ya no existe | `comportamiento` con una cuenta que no está en los estados | Se ignora sin error |

## Checkpoint

- [ ] `apalancamiento-calculations.js` con las funciones de la tabla y sin DOM, `window` ni `store`.
- [ ] Sección `apalancamiento` en `defaultData`.
- [ ] `resolveAccountType` exportada desde `estados-calculations.js`, con su test, y revisada por Cris.
- [ ] Todos los casos de la tabla de tests en verde; `npm test` y `npm run lint` sin errores.
- [ ] `docs/contexto/arquitectura.md` (sección del `store` y módulo nuevo) y `docs/api.md` actualizados.

## Preguntas abiertas

Revisadas el 2026-09-27:

1. **Cuentas mixtas en el MVP.** **Resuelta**: sí, con `pctVariable`.
2. **Sugerencias sin confirmar.** **Resuelta**: se usan para calcular, con la advertencia `clasificacion-sugerida` hasta que el usuario guarde ([D-009](../../decisiones.md)).
3. **Tipo de cada cuenta.** Para sumar CV y CF cuenta por cuenta hace falta el tipo de cada una: `accountTypes` o, si falta, `inferAccountType`. `computeFinancialTotals` ya hace esa resolución por dentro, pero no la exporta. **Resuelta** con Cris: Carlos agrega `resolveAccountType(data, group, name)` en `estados-calculations.js` dentro del PR del CP3, y Cris lo revisa. `computeFinancialTotals` no cambia.
4. **Umbral de `estructura-cambio`.** **Resuelta**: 10 %, como referencia educativa.

## Próximo paso

[04 — Pantalla](04-pantalla.md) (CP4).
