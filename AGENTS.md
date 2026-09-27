# AGENTS.md — GFO Toolkit

Instrucciones para los agentes de IA del equipo (Kiro, Claude Code, Cursor, Copilot, Codex, Gemini, opencode) y para las personas que los usan. Si un pedido en el chat contradice este archivo, sigue este archivo y señala la contradicción.

## El proyecto

Aplicación web de gestión financiera (proyecto final, Ingeniería de Sistemas, UNI RUSB). HTML, CSS y JavaScript vanilla con ES modules, sin framework ni paso de build. Todo corre en el navegador y los datos se guardan en `localStorage`. El código, la interfaz y la documentación están en español.

Tres personas desarrollan en paralelo, cada una en su feature y con su propia IA. Los problemas más caros de este repo vinieron de duplicar funciones y de editar los mismos archivos sin coordinar. Las reglas de abajo existen para evitar eso.

## Al empezar cada sesión

1. Corre `git fetch origin` y `git status`. Nunca trabajes directamente en `main`.
2. Tarea nueva: crea una rama desde `main` actualizado, por ejemplo `git switch -c feat/<tema> origin/main`.
3. Rama existente: trae lo último de `main` con `git merge origin/main` antes de editar.
4. Lee la ficha de la feature en `docs/planificacion/<feature>/README.md`. Si no existe, créala con la plantilla de `docs/planificacion/README.md`.
5. Lee los documentos del mapa de abajo que correspondan a la tarea.

## Comandos

| Acción | Comando |
|---|---|
| Instalar dependencias | `npm install` |
| Tests (una sola ejecución) | `npm test` |
| Un archivo de tests | `npx vitest run tests/unit/<archivo>.test.js` |
| Lint | `npm run lint` |
| Servidor local | `node scripts/dev-server.cjs` y abrir http://127.0.0.1:8080 |

En Windows PowerShell, si `npm` o `npx` fallan por la política de ejecución, usa `npm.cmd` y `npx.cmd`. Un agente nunca debe correr `npm run test:watch` ni dejar el servidor abierto: no terminan.

## Reglas que no se negocian

1. **Nada directo a `main`.** Todo entra por Pull Request desde una rama. Nunca `git push --force` sobre una rama que otra persona usa.
2. **Busca antes de crear.** Antes de escribir una función, búscala con `git grep -n "export function <nombre>"` y en el catálogo de `docs/contexto/dominio-financiero.md`. Si ya existe, úsala. Cada concepto financiero tiene una sola función.
3. **Fórmulas puras en su lugar.** Las fórmulas financieras van en `js/utils/calculate.js`, sin DOM, `window` ni `store`. La lógica propia de un módulo va en `js/modules/<modulo>/<modulo>-calculations.js`; la interfaz, en `index.js` o `<modulo>-ui.js`.
4. **`null` significa N/D.** Una función nueva devuelve `null` si falta un dato o el denominador es 0, nunca `0`. La interfaz muestra "N/D".
5. **Año de 365 días.** Usa la constante `DIAS_ANIO` de `calculate.js`; no escribas 360 ni 365 a mano.
6. **No leas cuentas por nombre fijo** como `er['Ventas']`. Los archivos importados traen nombres propios: usa `computeFinancialTotals` y los tipos de `ACCOUNT_TYPES` en `js/modules/estados/estados-calculations.js`.
7. **Escapa lo que venga del usuario o de un archivo** con `escapeHTML` (`js/utils/html.js`) antes de insertarlo con `innerHTML`.
8. **Guarda módulos completos con `store.setPersisted`.** Lanza un error si `localStorage` falla; `store.set` lo ignora en silencio.
9. **Tests y lint en verde antes de pedir revisión.** Cada fórmula nueva lleva un test con un caso resuelto a mano.
10. **No toques lo que no es de tu tarea.** Sin refactors, renombres, reformateos ni cambios de fin de línea en código ajeno. Si ves un problema fuera de tu alcance, anótalo en el PR.
11. **Sin dependencias nuevas sin acuerdo del equipo.** Si se aprueba una, con versión exacta.
12. **Si una regla te impide terminar, detente y pregunta.** No la saltes ni la "arregles" por tu cuenta.

## Archivos compartidos

Varios módulos dependen de estos archivos. Cámbialos solo si la tarea lo exige y explícalo en la descripción del PR.

| Archivo | Lo usan | Riesgo |
|---|---|---|
| `js/utils/calculate.js` | Análisis, Activos, Presupuesto | Una función declarada dos veces impide que cargue toda la app |
| `js/store.js` | Todos los módulos | Cambiar la forma de los datos guardados rompe datos existentes |
| `js/modules/estados/estados-calculations.js` | Estados, Análisis, Reportes | `ACCOUNT_TYPES` y los totales que todos consumen |
| `js/modules/analisis/index.js` | Pestaña Análisis | Archivo grande con cálculo e interfaz juntos; coordina antes de editarlo |
| `js/app.js`, `index.html` | Router y navegación | Agrega rutas sin reordenar ni renombrar las existentes |
| `CHANGELOG.md` | Todo el equipo | Escribe solo en la subsección de tu módulo |

## Mapa de documentación

Lee solo lo que la tarea necesita.

| Documento | Cuándo leerlo |
|---|---|
| `docs/contexto/arquitectura.md` | Antes de crear o mover archivos, rutas o datos del `store` |
| `docs/contexto/dominio-financiero.md` | Antes de escribir o cambiar fórmulas: notación, convenciones y catálogo de funciones |
| `docs/reglas/flujo-de-trabajo.md` | Ramas, commits, PRs, conflictos, responsables y configuración de cada IA |
| `docs/reglas/codigo.md` | Estructura, estilo, interfaz, seguridad y dependencias |
| `docs/reglas/pruebas-y-documentacion.md` | Qué probar, cómo probarlo y qué documentar |
| `docs/planificacion/` | Plan, decisiones y estado de cada feature |
| `docs/api.md` | Referencia detallada de las funciones públicas |

## Al terminar una tarea

- [ ] `npm test` y `npm run lint` sin errores.
- [ ] Tests nuevos para el código nuevo y para cada bug corregido.
- [ ] `CHANGELOG.md` actualizado en "[Sin publicar]"; `docs/api.md` si agregaste o cambiaste funciones públicas.
- [ ] Ficha de la feature actualizada: qué se hizo, qué falta y qué se decidió.
- [ ] Commits con el formato `tipo: descripción` y archivos agregados por nombre (nunca `git add .`).
- [ ] PR hacia `main` con la plantilla completa. El agente no hace merge: revisa e integra otra persona del equipo.
