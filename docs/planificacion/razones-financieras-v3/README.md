# Corrección de razones financieras (auditoría)

- **Estado**: En revisión
- **Responsable**: Equipo GFO
- **Rama**: `razones-financieras-v3`
- **Última actualización**: 2026-09-29

## Objetivo
Aplicar las correcciones de la auditoría del módulo de Razones Financieras: sin resultados financieros falsos (semántica `null` = N/D), promedios sin cuentas ausentes, ROA/endeudamiento coherentes entre Análisis y Reportes, y orden cronológico de periodos.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Correcciones implementadas en `razones-financieras-v3`, verificadas con arnés de 83 comprobaciones | Completado |
| 2 | `npm test` y `npm run lint` en verde (requiere `node_modules`) | Pendiente |
| 3 | PR aprobado e integrado a `main` | Pendiente |

## Decisiones clave
- ~~`rotacionCxC` exige ventas a crédito; el modelo no las distingue → RotCxC/PPC/CCC quedan N/D con nota, sin aproximar con ventas totales.~~ Cambiado al integrar con `feat/modulos-guia`: Análisis usa las ventas totales (como Gitman), porque el N/D dejaba sin plazo de cobro ni ciclo de conversión a cualquier empresa.
- Promedios: cuenta ausente en un periodo → `null` (N/D); un solo periodo → saldo final (metodología documentada, inalterada).
- RotCxP usa compras reales; sin inventario comparable usa costo de ventas y la tarjeta lo etiqueta "aprox.".
- `computeDashboardKPIs` reutiliza `computeRazones` de Análisis (mismo criterio y N/D).
- Orden cronológico único en `normalizeFinancialData` (`sortPeriods`); las vías degradadas (datos sin clasificación válida) conservan el comportamiento anterior. Ajustado al integrar con `feat/modulos-guia`: solo se ordenan solos los periodos que empiezan con un año (`ordenarPeriodos`), porque el orden alfabético ponía "Abril" antes que "Marzo" y anulaba el reordenado manual de Estados.

## Archivos que toca
`js/utils/calculate.js`, `js/modules/analisis/index.js`, `js/modules/estados/estados-normalize.js`, `js/modules/estados/estados-import.js`, `js/modules/integracion/index.js`, `tests/unit/calculate.test.js`, `tests/unit/analisis-razones.test.js`, `docs/api.md`, `CHANGELOG.md` (compartidos según `AGENTS.md`).

## Pasos
| # | Paso | Estado |
|---|---|---|
| 00 | Correcciones de la auditoría | Completado |

## Próximo paso
Pedir revisión del PR hacia `main`; bloqueado por los checkpoints 2 (tests/lint sin `node_modules` en este entorno) y 3 (aprobación de otra persona).

## Ronda 9 — patrimonio anterior en Mercado

- **Rama independiente**: `fix/mercado-patrimonio-anterior`, desde `origin/main` (`2c11c4d`).
- **Alcance aprobado**: exigir que `anterior.totalPatrimonio` sea numérico antes de calcular dividendos implícitos. Con N/D se devuelve `null`; no cambian otras fórmulas ni datos de ejemplo.
- **Archivos**: una guarda en `mercado-calculations.js`, una prueba de regresión en `razones-mercado.test.js`, esta ficha y la nota del changelog.
- **Regresión**: el caso UN = 100, patrimonio actual = 1000 y patrimonio previo = `null` produce `-900` antes de la guarda y N/D después. Se simula solo el subtotal previo con un spy: el productor de `main` aún no devuelve ese subtotal N/D de forma natural.
- **Esperados existentes**: no se modifican, incluido el periodo sin anterior y la nota «2024: C$ 40,000.00» del ejemplo.
- **Validación**: 437 pruebas en verde (34 archivos); lint con 0 errores y las 10 advertencias heredadas. La prueba nueva falla antes de la guarda con `expected -900 to be null` y pasa después.
- **Estado**: pendiente de revisión en su propio PR; no se fusiona y no toca los PR #14 ni #10, 1c ni el motor de razones.

## Motor de razones — ronda 12 (22 de octubre de 2026)

- **Rama de trabajo**: feat/motor-razones, creada desde main f197530 y con PR #14 incorporado en 73f56130c4f6500b5f56de0ab49bc5a3333ab5bb. Esta rama no tiene PR mientras cuentas no esté fusionado.
- **Arquitectura**: D-050, opción C; JSON originales intactos → generador Node sin dependencias nuevas → especificacion-razones.js → intérprete puro sin DOM ni store. No se conecta a computeRazones. Las secciones anteriores son el registro de la auditoría y Mercado, no el estado actual del motor.
- **Generación**: conserva las nueve claves y research completo. Emite literales JS con comillas simples; pasa ESLint sin exclusiones. La huella incluye nombres y contenido JSON con LF normalizado para evitar diferencias CRLF entre sistemas. No incluye fechas. El módulo generado no se edita a mano.
- **Flujo**: cambiar JSON, ejecutar node scripts/generar-especificacion-razones.mjs y confirmar ambos en el mismo commit; npm test comprueba sincronía real y los dos errores sintéticos.
- **Contrato**: crearEntradaRazones enlaza filas con accountIdentities por su clave estructural; nunca identifica por nombres fijos. Conserva pendientes, candidatos y valores current/previous. Recibe composición por token: excluye_intereses. Un subtotal de entrada que ya contenga intereses o no acredite composición se rechaza al consumirlo. calcularRazonConTraza muestra la formación de cada agregado de D-051 desde sus líneas.
- **Periodos**: control mostrar_calculo_directo_primer_periodo apagado por defecto; un solo periodo admite cierre directo según el JSON. Con varios periodos, el primero es N/D salvo control; siguientes usan promedio. Una referencia explícita al saldo anterior nunca se sustituye por cierre actual.
- **Precisión**: el motor guarda el valor completo. Solo formatearResultadoRazon aplica los decimales, separadores y sufijo del bloque presentacion, conforme D-033. N/D nunca se muestra como cero.
- **Aceptación**: piloto 9/9; 20 casos a mano; 60/60 celdas de B5 y regresiones de activos/UN comparadas con la app. Ningún árbol usa dividendos: cero celdas bloqueadas por ese dato, sin inventar dependencias desde el texto de una definición. La prueba independiente de intereses separados da 115 tanto en motor como en app.
- **Pendiente**: validación completa final y revisión del equipo. La propuesta de regla 3 de AGENTS.md figura en R2; el archivo de reglas no cambia. No se abre ni fusiona PR del motor en esta ronda mientras #14 siga abierto.

### Archivos y comprobaciones del motor

scripts/generar-especificacion-razones.mjs; js/modules/razones/especificacion-razones.js (generado); razones-motor.js; razones-presentacion.js; fixtures de casos por id; pruebas de sincronía, piloto, 20 razones, MUNO MODA y N/D. Las salidas completas finales y las 60 celdas se entregan en ronda12-R2-motor.md.
