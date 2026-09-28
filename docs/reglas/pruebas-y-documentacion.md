# Pruebas y documentación

## Pruebas

Vitest, con los archivos en `tests/unit/<tema>.test.js` (nombres en español con guiones).

| Acción | Comando |
|---|---|
| Todos los tests | `npm test` |
| Un archivo | `npx vitest run tests/unit/<archivo>.test.js` |

En PowerShell usa `npm.cmd` y `npx.cmd` si la política de ejecución bloquea `npm`. Un agente nunca corre `npm run test:watch`.

### Qué probar según el cambio

| Cambio | Test mínimo |
|---|---|
| Fórmula nueva | Un caso resuelto a mano, con el cálculo en un comentario, y el caso N/D (`null`) |
| Corrección de un bug | Un test que falla sin la corrección y pasa con ella |
| Cálculo que usa estados financieros | Datos con nombres de cuenta propios y `accountTypes` explícitos (ver `analisis-razones.test.js`) |
| Pantalla | Render con un documento simulado (ver `estados-acceptance.test.js`) |
| Archivo nuevo en `js/` | Nada adicional: `carga-modulos.test.js` ya lo importa |

### Patrones

- **Globales del navegador.** Simula `document`, `window` o `localStorage` con `vi.stubGlobal(...)` antes de un import dinámico (`await import('../../js/...')`), y limpia con `vi.unstubAllGlobals()` en `afterEach`. Un `import` estático se evalúa antes del stub.
- **Módulos con caché.** `analisis/index.js` guarda los estados que leyó. Usa `vi.resetModules()` e importa de nuevo en cada caso.
- **Decimales.** Usa `toBeCloseTo(esperado, 6)`.
- **Tests guardianes.** `carga-modulos` (funciones duplicadas e imports rotos), `analisis-reexports` (reexportadores de Análisis) y `razones-unificadas` (nombres reemplazados). Si fallan, te están avisando de un problema real: corrige el código, no el test.

## Documentación

| Si cambiaste… | Actualiza |
|---|---|
| Algo visible para el usuario o para el equipo | `CHANGELOG.md`, sección "[Sin publicar]", en la subsección de tu módulo |
| Una función pública | `docs/api.md` y el catálogo de `docs/contexto/dominio-financiero.md` |
| El uso de una pantalla | `docs/manual-usuario.md` |
| Estructura, rutas o datos del `store` | `docs/contexto/arquitectura.md` |
| Notación o convenciones de cálculo | `docs/contexto/dominio-financiero.md` |
| El avance de tu feature | `docs/planificacion/<feature>/README.md` |
| Una decisión discutible (ver criterios en el archivo) | `docs/decisiones.md`, con su plantilla |
| Reglas de trabajo | `AGENTS.md` o `docs/reglas/`, con acuerdo del equipo en el PR |

### Entrada en `docs/api.md`

```markdown
#### `nombreFuncion(param1, param2)`
Qué calcula, en una línea.

- **Parámetros**: `param1` (number) — qué es; `param2` (number) — qué es
- **Retorno**: `number | null` — `null` si …
- **Fórmula**: `…`
- **Ejemplo**: `nombreFuncion(…)` → `…`
```

### `CHANGELOG.md`

- Escribe bajo `## [Sin publicar]`, en la subsección de tu módulo (por ejemplo `### Módulo 3: Análisis Financiero`). Si no existe, créala.
- Una línea por cambio, con el mismo estilo que las existentes.
- Al publicar una versión, la sección se renombra con el número y la fecha.
