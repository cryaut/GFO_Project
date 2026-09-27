# Integración de ramas y guías (`core`)

- **Estado**: En revisión (PR en borrador de `core` hacia `main`)
- **Responsable**: Carlos
- **Rama**: `core`
- **Última actualización**: 2026-09-27

## Objetivo

Unir en una rama de integración el trabajo de Cris (`fix/estados-import-razones`, que ya incluía la rama `Test`) y el de Henry (`razones-financieras`), dejar una sola función por concepto financiero y establecer guías para que las IAs del equipo trabajen con las mismas reglas. `main` no se tocó: todo llega por el PR.

## Qué se hizo

| Commit | Cambio |
|---|---|
| `98b5552` | Merge de la rama de Cris, sin conflictos: importador, clasificación de cuentas, motor de totales y correcciones metodológicas |
| `497740e` | Merge de la rama de Henry. Conflicto en `analisis/index.js`, resuelto sobre el motor de Cris; 5 funciones duplicadas eliminadas; nombres unificados; corrección de la cobertura de intereses |
| `64acf0b` | Año de 365 días con la constante `DIAS_ANIO` |
| `621a99b` | Tests de carga de módulos, razones unificadas y cobertura de intereses |
| `d71aac7` | `AGENTS.md`, puentes para Claude Code y Gemini CLI, contexto, reglas y plantilla de PR |
| Siguientes | Planificación por feature, documentación de las funciones nuevas en `docs/api.md` y `CHANGELOG.md` |

## Decisiones

| Tema | Decisión | Motivo |
|---|---|---|
| Funciones repetidas con el mismo nombre (`coberturaIntereses`, `margenBruto`, `margenOperativo`, `roe`, `rotacionActivosFijos`) | Se conservó la versión de Cris | Devuelve `null` (N/D) en vez de 0 |
| Mismo concepto con otro nombre | Una función por concepto: `rotacionActivos`, `plazoPago`, `cicloConversion` y `deudaPatrimonio` | Evitar dos resultados distintos para la misma razón |
| `rotacionPasivos` (Cris) | Pasó a llamarse `rotacionCxP` (nombre de Henry) | Se calculaba con las cuentas por pagar |
| Días del año | 365, en `DIAS_ANIO` | Decisión de Carlos; antes `main` y Cris usaban 360 y Henry 365 |
| Etiquetas de la pestaña Razones | Se mantuvieron las de Cris | Los cambios de Henry eran de texto |
| Capital de trabajo dentro de Razones | No se portó | Ya está en la pestaña CNT/CNO |
| Insignia del ciclo de conversión | Dos niveles (OK hasta 60 días, Revisión después) en lugar de tres | Igual que el resto de las insignias |
| Guías para IAs | Un solo `AGENTS.md`; `CLAUDE.md` y `GEMINI.md` solo lo importan | Una fuente de reglas para todas las herramientas |
| Método de integración recomendado | "Create a merge commit" | Conserva los commits de Cris y de Henry con su autor |
| Merge por IA | Permitido si quien usa la IA lo pide y otra persona del equipo ya aprobó el PR | Agiliza la integración sin quitar la revisión humana, que además exige la protección de `main` |

## Resultados verificados

- Tests: 61 en `main`, 128 tras integrar la rama de Cris y 142 al final (13 archivos).
- Lint: de 8 errores en `main` a 0 errores; quedan 11 advertencias por variables sin uso.
- `carga-modulos.test.js` falla si se vuelve a duplicar una función en `calculate.js` (probado agregando un `roe` repetido).
- Los tests de cobertura de intereses fallan sin la corrección de `getERData` (probado quitándola).

## Pendiente (fuera de esta rama)

- Que Cris y Henry revisen el PR, en especial la resolución del conflicto en su código, las guías y la tabla de responsables.
- Proteger `main`: lo hace el dueño del repositorio (pasos en `docs/reglas/flujo-de-trabajo.md`).
- Actualizar SheetJS: el importador carga `xlsx@0.18.5` desde jsDelivr, una versión con vulnerabilidades conocidas al leer archivos manipulados.
- Corregir la demo MUNO MODA, que no cuadra.
- `store.reset()` copia los valores iniciales de forma superficial.
- `package-lock.json` está en `.gitignore`, así que cada persona puede instalar versiones distintas de Vitest y ESLint.
- Integración continua que corra `npm test` y `npm run lint` en cada PR.
- Probar en el navegador las pestañas Estados, Análisis y Reportes con la demo y con `scripts/sample-estados.csv`.
