# Planificación

Plan, decisiones y estado de cada feature. Cada feature tiene su propia carpeta, con una ficha (`README.md`) y sus pasos numerados. Así dos personas pueden planificar en paralelo sin que choquen los números.

## Features

| Feature | Responsable | Estado | Ficha |
|---|---|---|---|
| Integración de ramas y guías (`core`) | Carlos | Completada (PR #1) | [integracion-core](integracion-core/README.md) |
| Apalancamiento (GAO, GAF y GAT) | Carlos | En revisión | [apalancamiento](apalancamiento/README.md) |
| Módulos obligatorios de la guía (inventario, C-V-U, flujo, presupuesto maestro, proforma y presupuesto personal) | Carlos | En revisión | [modulos-guia](modulos-guia/README.md) |

Agrega una fila cuando empieces una feature y actualiza el estado cuando cambie.

## Convenciones

- **Carpeta**: `docs/planificacion/<feature>/`, en minúsculas y con guiones. Si se puede, usa el mismo nombre que la rama (`feat/<feature>`).
- **Ficha**: el `README.md` de la carpeta. Es lo primero que lee cualquier persona o IA que vaya a trabajar en la feature, así que debe estar al día.
- **Pasos**: archivos `NN-tema.md` dentro de la carpeta, numerados desde 00 en cada feature. El número define el orden y no se reutiliza.
- **Estados de una feature**: Planificación, En progreso, En revisión, Completada o Pausada.
- **Estados de un paso**: Pendiente, En progreso, Completado o Reemplazado por NN. Un paso pasa a Completado solo cuando se cumplen todos los criterios de su checkpoint.
- **Cambios de decisión**: no borres el paso anterior. Márcalo "Reemplazado por NN" y crea uno nuevo, para conservar el historial.
- **Notación**: la de `docs/contexto/dominio-financiero.md`.

## Plantilla de ficha (`<feature>/README.md`)

````markdown
# <Nombre de la feature>

- **Estado**: Planificación | En progreso | En revisión | Completada | Pausada
- **Responsable**: <nombre>
- **Rama**: `feat/<feature>`
- **Última actualización**: AAAA-MM-DD

## Objetivo
Qué problema resuelve y para quién, en dos o tres líneas.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | … | Pendiente |

## Decisiones clave
- Decisión y motivo, con enlace al paso donde se tomó.

## Archivos que toca
Incluye los compartidos de `AGENTS.md`, para que el equipo lo sepa desde el principio.

## Pasos
| # | Paso | Estado |
|---|---|---|
| 00 | [Alcance](00-alcance.md) | En progreso |

## Próximo paso
Qué sigue y qué lo bloquea.
````

## Plantilla de paso (`NN-tema.md`)

````markdown
# NN — Título del paso

- **Estado**: Pendiente | En progreso | Completado | Reemplazado por NN
- **Fecha**: AAAA-MM-DD
- **Depende de**: NN

## Objetivo
Qué queremos lograr en este paso y por qué.

## Decisiones
- Decisión tomada y su motivo.

## Checkpoint
- [ ] Criterio verificable que confirma que el paso funciona.

## Preguntas abiertas
- Tema por definir.

## Próximo paso
Qué sigue al cerrar este paso.
````
