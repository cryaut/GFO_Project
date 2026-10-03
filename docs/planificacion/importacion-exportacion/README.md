# Importación y exportación: importes, respaldos y reporte HTML

- **Estado**: En revisión
- **Responsable**: Carlos (sesión con IA)
- **Rama**: `fix/importacion-exportacion`
- **Última actualización**: 2026-10-02

## Objetivo
Que importar y exportar no pierda ni corrompa datos sin avisar: leer bien los importes con punto o coma, validar el respaldo JSON de Reportes antes de tocar el `store` y generar un reporte HTML correcto y seguro.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Importes ambiguos: formato elegible, deducción por archivo y avisos (D-019) | Completado |
| 2 | Importar JSON en Reportes con validación, confirmación y reversión (D-020) | Completado |
| 3 | Reporte HTML con una columna por periodo, Estado de Resultados, N/D y texto escapado | Completado |
| 4 | Codificación Windows-1252, límites en Excel, errores acumulados, modo "combinar" | Pendiente |
| 5 | SheetJS actualizado y local; exportación a Excel/PDF; CSV con `;` | Pendiente (requiere acuerdo del equipo: dependencia) |

## Decisiones clave
- D-019: la convención por defecto (punto decimal) no cambia; deja de ser silenciosa.
- D-020: el importador de Reportes valida por módulo y es atómico. No se cambió `js/store.js` ni la forma de los datos.

## Archivos que toca
`js/modules/estados/estados-import.js` y `estados-ui.js` (responsable de Estados: Cris), `js/modules/integracion/index.js` más dos archivos nuevos (`integracion-respaldo.js`, `integracion-reporte.js`), tests nuevos en `tests/unit/`, `CHANGELOG.md`, `docs/api.md`, `docs/manual-usuario.md`, `docs/decisiones.md`, `docs/contexto/`. No toca `calculate.js`, `store.js`, `app.js` ni `index.html`.

## Pendientes detectados (fuera de este alcance)
Codificación de CSV (Windows-1252), `MAX_ROWS`/`MAX_COLUMNS` no aplican a Excel, errores de importación de uno en uno, importar reemplaza el borrador sin modo "combinar", columnas no numéricas tratadas como periodos, comillas sin cerrar en CSV, hojas de Excel ignoradas sin aviso, SheetJS 0.18.5 por CDN sin SRI, `downloadBlob` revoca la URL de inmediato, CSV sin inyección de fórmulas neutralizada, exportación limitada a Estados, y `store.load()` con copia superficial de `defaultData`.

## Próximo paso
Revisión de Cris (área Estados/Reportes) y PR hacia `main`.
