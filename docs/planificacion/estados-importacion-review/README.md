# Estados organizados e importación con revisión

- **Estado**: En revisión
- **Responsable**: Carlos
- **Rama**: `feat/estados-importacion-review`
- **Última actualización**: 2026-10-12

## Objetivo

Completar el flujo Importar → Revisar y corregir → Aplicar al borrador → Guardar → Analizar. Separar los estados, mostrar nombres completos y resolver cuentas desconocidas sin editar el archivo original.

## Checkpoints

| CP | Meta | Estado |
|---|---|---|
| 1 | Estado de situación financiera y estado de resultados separados; títulos y acciones según el flujo | Completado |
| 2 | Catálogo inicial con alias, clasificación, fuentes y descarga JSON | Completado |
| 3 | Revisión por filas, corrección manual, errores acumulados, exclusión de subtotales, búsqueda y paginación | Completado |
| 4 | Plantilla Excel equilibrada, formato documentado, lector local y límites | Completado |
| 5 | Contrato de asistencia con IA, deshabilitado y sin peticiones | Completado |
| 6 | Pruebas del importador y flujo hasta publicación; navegador real, Excel sin red, temas y móvil | Completado |

## Decisiones clave

- D-024: la revisión se mantiene fuera del borrador publicado y exige aplicación explícita; no hay coincidencias aproximadas automáticas.
- D-025: SheetJS se actualiza a 0.20.3 y se distribuye localmente para importar Excel sin CDN. No se añaden dependencias de npm.
- Catálogo ejecutable en un módulo JavaScript, para reutilizarlo de forma síncrona desde el motor sin duplicar datos; JSON descargable generado desde ese mismo módulo.
- Se mantienen los tipos contables y las fórmulas. Las cuentas no cubiertas exigen revisión; no se pretende enumerar todo plan de cuentas posible.

## Archivos que toca

Estados: catálogo, lector, revisión, contrato de IA y editor. Compartidos: `estados-calculations.js` (consulta del catálogo, sin cambios de fórmulas), `analisis/index.js` (textos), `integracion/index.js` (orden y secciones de acciones) y `css/pages.css` (estilos de Estados y pestañas de Análisis). También plantilla, lector con licencia, pruebas y documentación. No modifica el store ni las rutas.

## Validación

- Pruebas de reconocimiento, clasificación manual, importes, duplicados, subtotales, claves reservadas, límites, codificación, cancelación y lecturas que terminan fuera de orden.
- Navegador Edge con conexiones externas bloqueadas: plantilla Excel → revisión → guardado → Análisis; corrección de cuenta e importe; rechazo de JSON; temas claro/oscuro y ancho de 390 píxeles sin desbordar la página.
- Plantilla renderizada y revisada en ambas hojas. Datos de ejemplo: activos 425000 y 477000; pasivos 225000 y 217000; patrimonio 200000 y 260000; utilidad neta 112000 y 132300.

## Próximo paso

Revisión del equipo con los Excel reales de las soluciones. Permanecen fuera del avance: combinar conjuntos, interpretar formatos arbitrarios, exportar Excel/PDF e implementar un proveedor de IA. Los cambios están preparados localmente; no se publicaron ni se integraron a main.
