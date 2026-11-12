# Ejemplos personales para la defensa

- **Estado**: Integrado.
- **Responsable**: Codex, por solicitud de Cris.
- **Rama**: `codex/ejemplos-personales-defensa`, desde `origin/main` (`ab0ef68`).
- **Última actualización**: 2026-11-12.

## Objetivo

Precargar los cinco presupuestos y los cinco inventarios de `presupuestos_activos.zip`, identificados por integrante. Conservar nombres, datos, hojas, columnas, fórmulas y orden; activar las diferencias de formato solo en el ejemplo que las declara.

## Checkpoints

| CP | Meta | Estado |
|---|---|---|
| 1 | Leer los nueve XLSX y el DOCX; inventariar diferencias | Completado |
| 2 | Incorporar ejemplos y vistas compatibles con los formatos originales | Completado |
| 3 | Contrastar cálculos, persistencia, respaldo y ejemplos anteriores | Completado |
| 4 | Revisar pantalla y OCR en escritorio/móvil, documentar resultados | Completado |

## Archivos compartidos previstos

Catálogo de ejemplos, normalización/respaldo de los módulos personales, documentación de arquitectura y decisiones. No se cambian datos empresariales ni el motor de razones. Los cambios pendientes de la copia principal se conservan fuera de este worktree.

## Entrega y validación

[Informe de fuentes, cifras, diferencias y pruebas](INFORME.md). D-118 registra el formato opcional de cada archivo. Se conservan los ejemplos anteriores y los cambios pendientes de las otras copias de trabajo.

## Revisión del PR #39

Correcciones antes del merge, registradas en D-118: criterios de `COUNTIF` con celdas vacías, fila huérfana en `Evaluación` al eliminar un activo, carga diferida de los documentos y validación de los anexos. Pendiente menor: las celdas vacías de una hoja no se pueden editar desde la tabla (solo las que tienen contenido).

## Próximo paso

Integrado a main por PR #39.
