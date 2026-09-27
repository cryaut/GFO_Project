# Flujo de trabajo en equipo

Cómo trabajar en paralelo sin pisarnos. Aplica a las personas y a sus IAs por igual.

## Principios

- **`main` siempre funciona.** Todo entra por Pull Request, con tests y lint en verde.
- **Integra seguido.** Un PR pequeño cada pocos días. Una rama que vive semanas acumula conflictos: así chocaron las ramas de razones y de importación, que repitieron cinco funciones en `calculate.js` y dejaron la app sin cargar.
- **Lo compartido se coordina antes, no después.** Si vas a tocar un archivo de la tabla "Archivos compartidos" de `AGENTS.md`, avisa al equipo antes de empezar.

## Ramas

- Nombre `tipo/tema-corto`, en minúsculas y con guiones: `feat/apalancamiento`, `fix/demo-muno-moda`, `docs/manual-importacion`, `test/razones`, `refactor/analisis-calculations`.
- Siempre desde `main` actualizado: `git fetch origin` y luego `git switch -c feat/<tema> origin/main`.
- Una feature por rama. Si crece, divídela en varios PRs.
- Al empezar cada sesión y antes de pedir revisión, trae lo nuevo con `git merge origin/main`. No uses `rebase` en ramas que otra persona ya descargó.
- Cuando el PR se integra, se borra la rama. Para seguir trabajando, crea otra desde `main`.
- Para unir varias ramas entre sí, usa una rama de integración (como se hizo con `core`), nunca `main`.

## Commits

- Formato `tipo: descripción en español, en presente`, con tipo `feat`, `fix`, `test`, `docs`, `refactor` o `chore`. Por ejemplo: `feat: agrega el grado de apalancamiento operativo`.
- Un commit es un cambio con sentido propio. Los tests van en el mismo commit que el código que prueban.
- Agrega los archivos por nombre (`git add js/utils/calculate.js tests/unit/gao.test.js`). Nunca `git add .` ni `git add -A`.
- Nunca subas `node_modules/`, `.env`, logs ni datos de herramientas locales (`.opencode-data/`, `graphify-out/`).

## Pull Requests

1. Abre el PR como borrador (draft) apenas tengas algo que mostrar. Así el equipo ve qué archivos estás tocando.
2. Completa la plantilla (`.github/pull_request_template.md`).
3. Antes de marcarlo como listo: `git merge origin/main`, `npm test` y `npm run lint`.
4. Lo revisa otra persona del equipo. El autor no aprueba su propio PR, y una IA no reemplaza la revisión.
5. Se integra con **Create a merge commit**, que conserva cada commit con su autor y muestra quién hizo qué. No uses squash ni rebase si el PR tiene commits de varias personas.
6. Después de integrar, borra la rama.

## Conflictos

- Resuelve quien integra más tarde: trae `main` a tu rama con `git merge origin/main` y resuelve ahí, nunca en `main`.
- No descartes el trabajo de otra persona con `--ours` o `--theirs` sin revisar qué se pierde.
- Si dos funciones calculan lo mismo, conserva una (la que cumple `null` para N/D y `DIAS_ANIO`), adapta sus usos y anota la decisión en el mensaje del commit de merge.
- Si no entiendes el código de la otra persona, pregúntale antes de resolver.
- Después de resolver: `npm test`, `npm run lint` y abrir la app en el navegador. El test `carga-modulos` detecta funciones duplicadas e imports rotos.
- Si una IA resolvió el conflicto, revisa el diff tú antes de hacer commit.

## Responsables por área (propuesta)

Basada en quién escribió cada parte; el equipo la confirma en el PR que agrega estas guías. El responsable revisa los PRs que tocan su área.

| Área | Archivos | Responsable |
|---|---|---|
| Estados financieros, importación y motor de totales | `js/modules/estados/` | Cris |
| Reportes e integración | `js/modules/integracion/` | Cris |
| Razones e interpretación | `js/modules/analisis/` | Henry |
| Apalancamiento (GAO, GAF, GAT) | `js/modules/apalancamiento/` (planificado) | Carlos |
| Guías y reglas | `AGENTS.md`, `docs/reglas/`, `docs/contexto/` | Carlos |
| Compartidos | `js/utils/calculate.js`, `js/store.js`, `js/app.js`, `index.html` | Todo el equipo: avisar antes y revisar entre dos |

## Lo que nadie hace sin permiso explícito del equipo

- `git push` directo a `main` o `git push --force` sobre ramas compartidas.
- `git reset --hard`, `git clean -fd` o borrar ramas ajenas.
- Saltar los hooks con `--no-verify`.
- Cambiar la configuración de git de otra persona.

## Proteger `main`

Lo configura el dueño del repositorio (cuenta `cryaut`) en GitHub, en Settings → Rules → Rulesets (o Settings → Branches), con una regla para `main` que:

- exija Pull Request con al menos una aprobación;
- bloquee el force push y el borrado de la rama;
- cuando exista integración continua, exija que los tests pasen.

## Configurar tu IA

Todas las herramientas leen las mismas reglas desde `AGENTS.md`. No hace falta configurar nada más.

| Herramienta | Qué lee |
|---|---|
| Kiro | `AGENTS.md` de la raíz, en cada sesión |
| Cursor | `AGENTS.md` de la raíz |
| GitHub Copilot en VS Code | `AGENTS.md`, si la opción `chat.useAgentsMdFile` está activa |
| Claude Code | `CLAUDE.md`, que importa `AGENTS.md` |
| Gemini CLI | `GEMINI.md`, que importa `AGENTS.md` |
| Codex y opencode | `AGENTS.md` de la raíz |

- No crees archivos de reglas propios de tu herramienta (`.cursor/rules/`, `.kiro/steering/`, `.github/copilot-instructions.md`) con reglas distintas. Si falta una regla, agrégala a `AGENTS.md` o a `docs/reglas/` en un PR, para que valga para todos.
- Tus preferencias personales van en la configuración de usuario de tu herramienta, fuera del repositorio.
