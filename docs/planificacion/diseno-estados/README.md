# Claridad visual de Estados financieros

- **Estado**: En revisión
- **Responsable**: Diseño solicitado por Cris; ejecución con Codex
- **Rama**: `codex/diseno-estados`
- **Última actualización**: 2026-11-06

## Objetivo
Separar acciones de carga, edición de periodos y revisión/guardado. Dar espacio a botones y formularios, y revelar opciones secundarias bajo paneles desplegables nativos. Se conservan ids, manejadores, cálculos, validación y persistencia existentes.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Revisar el módulo y una skill de diseño en GitHub | Completado: Impeccable 4.8.0 instalada y leída |
| 2 | Reorganizar exclusivamente presentación HTML/CSS de Estados | Completado |
| 3 | Comprobar importación, edición y guardado con las pruebas existentes; lint | Completado: 2015 pruebas, 60 archivos; lint sin errores |
| 4 | Revisar tamaños y temas del resultado renderizado | Completado: Edge, escritorio y móvil, claro y oscuro |

## Decisiones clave
Solo diseño: se usa la identidad, tipografía y paleta existentes. Impeccable se aplica en modo Operate: jerarquía, separación por tarea, densidad contenida y revelado progresivo. Los paneles nativos evitan mover formularios a modales y conservar el foco resulta más simple. No se altera ninguna decisión financiera ni se inicia AFOD R2.

## Archivos que toca
Plantillas de `js/modules/estados/estados-ui.js` y estilos en la sección Estados de `css/pages.css`, acotados por `#page-estados`; manual, ficha y changelog del módulo. Los cambios anteriores de Inicio y AFOD se conservan.

## Skill aplicada
[Impeccable](https://github.com/pbakaus/impeccable/tree/main/cursor-plugin/skills/impeccable), versión 4.8.0. Skill y referencias layout/operate/craft-floor/polish leídas. Su lanzador context no pudo crear la caché externa; se siguió su alternativa de leer directamente el contexto del proyecto. PRODUCT.md y DESIGN.md no existen; se usan la implementación y los tokens actuales como referencia, sin inventar un sistema nuevo. No se instalan dependencias en la aplicación.

## Resultado y comprobaciones

- Guardado principal separado de importación y administración de periodos. Paneles nativos para opciones secundarias, formularios etiquetados y botones separados con objetivos de al menos 44 px.
- Grupos de cuentas plegables con periodo y cantidad de cuentas visibles; alta de cuentas en un desplegable propio. Vista multiperiodo y descarga en otro panel.
- Mismos identificadores, campos, opciones, manejadores, normalización y cálculos. No cambia la estructura guardada ni las API públicas.
- `npm.cmd test`: **2015/2015**, **60/60 archivos**. Las cinco suites focalizadas de Estados también pasaron: **45/45**.
- `npm.cmd run lint`: **0 errores**, 10 advertencias preexistentes en archivos ajenos a esta tarea. `git diff --check` sin incidencias.
- [Script de revisión](revisar-visual.cjs) ejecutado con Playwright del runtime existente y Edge headless en contextos desechables. El servidor usa un puerto local efímero y se cierra al terminar. No usa el perfil ni datos del usuario. Para repetir: `node docs/planificacion/diseno-estados/revisar-visual.cjs`; `GFO_PLAYWRIGHT_PATH` permite indicar otra instalación existente de Playwright.
- Resultado estructurado generado localmente: antes/después respecto a `origin/main` (`255b068`), escritorio 1440×1000 y móvil 390×844, temas claro/oscuro; opciones abiertas también a 320 px. Antes la página se extendía a 623 px en móvil de 390 px; ahora conserva 390 px y las tablas se desplazan internamente. A 320 px las opciones abiertas tampoco desbordan.
- Revisión de capturas: jerarquía, separación de botones, tablas y ambos temas. Se corrigieron texto auxiliar tenue y cercanía del título al botón de menú móvil. Las capturas desactivan transiciones para mostrar los colores finales del tema.
- Navegador: paneles accesibles mediante teclado, campos complementarios y selector de periodos presentes, nombre preservado al cambiar de periodo, ausencia de errores de página y de escrituras antes de guardar. El objeto completo `estados` guardado después de editar la misma demo es **idéntico** entre las versiones.

### Ajuste solicitado tras la revisión

Los contenedores de Activos, Pasivos, Patrimonio y Resultados tenían solo borde inferior y el contenido sin separación lateral. Se añadió borde completo, radio de 12 px, separación vertical de 24 px y espacio interior de 24 px en escritorio / 16 px en móvil. Se retiró la regla que alineaba a la derecha todos los inputs del grupo: los campos editables y las etiquetas ahora empiezan a la izquierda, incluidos Cuenta nueva y el filtro del catálogo. Se conserva el formato numérico tabular y no se cambia ninguna lógica.

La revisión de navegador verifica los estilos calculados en los cuatro grupos y los tamaños de 1440, 390 y 320 px. Incluye capturas del contenedor y su formulario en escritorio y móvil. Guardado idéntico y ausencia de desbordamiento de página comprobados de nuevo.

## Evidencia visual

El script genera `capturas/` y `verificacion-visual.json` junto a esta ficha: pantalla vacía, demo, temas claro/oscuro, opciones abiertas, edición de cuentas y vista multiperiodo. Estos artefactos se conservan localmente y no se versionan, para mantener pequeño el commit.

## Pendiente

Revisión humana del diseño. No se agregan decisiones financieras; los trabajos anteriores de Inicio y AFOD conservan su alcance y estado.
