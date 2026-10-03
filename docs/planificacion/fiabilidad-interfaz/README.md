# Fiabilidad y claridad de la interfaz

- **Estado**: En revisión
- **Responsable**: Carlos
- **Rama**: `fix/fiabilidad-interfaz`
- **Última actualización**: 2026-10-03

## Objetivo
Corregir la primera tanda de problemas del diagnóstico general: guardados silenciosos,
borradores perdidos al navegar, edición de activos y presentación de datos en pantallas pequeñas.
La base es `fix/importacion-exportacion` (1178073, PR #7), por indicación del usuario.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Presupuesto y Activos conservan datos y formularios cuando falla el guardado; reset sin referencias compartidas | Completado |
| 2 | Estados conserva el borrador entre rutas y avisa antes de cerrar; textos importados y CSV se muestran como texto | Completado |
| 3 | Formularios y tablas legibles en móvil y en ambos temas; diálogo accesible | Completado |
| 4 | Pruebas y documentación; PR de revisión | En progreso |

## Decisiones clave
- Conservar las correcciones de importación/exportación del PR #7 y presentar esta tanda en una rama independiente.
- Mantener el formato actual de `localStorage` y las fórmulas financieras existentes.
- Guardar el borrador de Estados en la sesión de la pantalla y avisar antes de recargar/cerrar; no publicarlo automáticamente.
- La hoja de ruta completa sigue pendiente; esta tanda cubre los fallos concretos de mayor prioridad.

## Archivos que toca
- Compartidos: `js/store.js` (valores iniciales y reset), `js/app.js` (aviso al cerrar),
  `js/modules/analisis/index.js` (escape de cuentas/periodos) y `CHANGELOG.md`.
- `js/modules/presupuesto/index.js`, `js/modules/activos/`, `js/modules/estados/`.
- `js/components/modal.js`, `js/utils/export.js`, CSS compartido y pruebas unitarias.
- API, arquitectura, manual, catálogo y decisiones.

## Próximo paso
Revisión humana del PR, después de integrar el PR #7. Las mejoras de EFE, EOAF,
proforma, escenarios y reportes completos requieren tandas posteriores con validación financiera.

## Verificación
- 406 pruebas en 38 archivos; 31 regresiones nuevas. Lint sin errores y 7 advertencias preexistentes.
- Navegador con los ejemplos ficticios: borrador de empresa conservado al ir a Análisis y volver;
  Cancelar y Escape cierran Activos; Tab recorre el diálogo y el foco vuelve al botón de apertura.
- Móvil de 390 × 844 y panel de 936 × 828: sin desbordamiento de página, título separado del menú,
  barra de acciones compacta y moneda en una sola línea. Texto auxiliar legible en ambos temas.
- No se agregaron dependencias ni se cambiaron fórmulas o el esquema de datos guardados.
- Fallos de cuota/acceso, aviso `beforeunload` y confirmaciones cubiertos con dobles del navegador.
  La automatización no pudo resolver un diálogo nativo de confirmación de guardado; esa comprobación
  manual queda para la revisión humana. La retención del borrador sí se comprobó en la aplicación real.

## Pendientes de la hoja de ruta
- Recuperación explícita del almacenamiento corrupto y migraciones versionadas.
- Borradores de otros módulos y campos de alta de cuentas todavía sin enviar.
- Revisión financiera de EFE/EOAF, periodos y trazabilidad, proforma de balance completa.
- Rediseño más amplio de Inicio, gráficos, tablas y reportes; escenarios e inventario.
- Actualización de dependencias con acuerdo del equipo, más pruebas reales de navegador.

## Decisiones
[D-021](../../decisiones.md#d-021--el-borrador-de-estados-se-conserva-dentro-de-la-sesión),
[D-022](../../decisiones.md#d-022--captura-estricta-de-activos-y-conservación-de-puntajes-cero) y
[D-023](../../decisiones.md#d-023--etiquetas-csv-protegidas-como-texto).
