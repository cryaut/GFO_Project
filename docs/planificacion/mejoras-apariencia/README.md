# Mejoras de apariencia e Inicio como panorama general

- **Estado**: En revisión
- **Responsable**: Carlos
- **Rama**: `feat/mejoras-apariencia`
- **Última actualización**: 2026-10-21

## Objetivo
Que lo primero que se vea al abrir la app sea un panorama de cómo está la empresa, con interpretaciones. También corregir el tema oscuro (iconos, insignias, tablas), dar un estilo más cuidado con gradientes suaves y separar las finanzas personales de los módulos de la empresa.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Iconos de Inicio e insignias legibles en claro y oscuro | Completado |
| 2 | Inicio: salud general, KPIs, tendencia, alertas y puntos clave por área, con las mismas funciones de cada módulo | Completado |
| 3 | Gradientes suaves, barra lateral, contraste `--ink-*`, foco visible y `prefers-reduced-motion` | Completado |
| 4 | Gráficas recoloreadas al cambiar de tema sin reiniciar la pantalla | Completado |
| 5 | Finanzas personales separadas: menú por secciones, nombres, acento propio, bloque aparte en Inicio y en Reportes | Completado |
| 6 | Ejemplos de empresa y personal que solo llenan módulos vacíos | Completado |
| 7 | Ajuste del fondo general en claro y oscuro, conservando la interfaz actual | Completado |
| 8 | Fondo reactivo al cursor y entrada de estadísticas con movimiento reducido | Completado |

## Decisiones clave
- Salud general como proporción de áreas en orden, penalizada por alertas altas ([D-017](../../decisiones.md)).
- Presupuesto personal y Activos del hogar fuera del panorama de la empresa ([D-018](../../decisiones.md)).
- Inicio no recalcula: usa `reunirEntradas()` y `construirReporte()` de la proforma.
- No se carga la fuente Inter desde un CDN: sería una petición a un tercero y una dependencia nueva; queda para acuerdo del equipo.

## Archivos que toca
Compartidos: `index.html` (barra lateral por secciones; rutas sin cambios), `js/app.js` (ruta `home` → `initInicio`, recoloreado al cambiar de tema), `CHANGELOG.md` y los CSS globales. De otros módulos, solo exports y textos: `proforma/index.js` (`reunirEntradas`), `proforma-calculations.js` (`razon`), `activos/index.js` (`calcularEstado`, `ejemploActivos`, título), `presupuesto/index.js` (etiqueta del encabezado), `integracion/index.js` (resumen por grupos), `components/chart.js`.

Nuevos: `js/modules/inicio/` (`index.js`, `inicio-calculations.js`, `inicio-ui.js`), `tests/unit/inicio.test.js` e `inicio-navegador.test.js`.

## Próximo paso
Revisión del equipo en el navegador (cada quien sus pantallas en claro y oscuro). Pendiente, fuera de esta rama: KPIs del Presupuesto personal con color en línea (`style="color:var(--color-danger)"`), que no usan `--ink-*`.

## Ajuste del fondo — 2026-10-21

- **Rama**: `feat/fondo-suave`.
- Carlos prefiere conservar la pantalla actual y limitar el ajuste a su fondo.
- Se modifican únicamente `--bg-app` y `--gradient-app` en ambos temas: base clara cálida, luz azul amplia y difusa; base oscura neutra con iluminación tenue.
- El fondo es compartido por toda la aplicación. Se mantienen los fondos de tarjetas, encabezado y barra lateral, la tipografía, la distribución y los datos.
- Archivos: `css/variables.css`, esta ficha y la subsección «Inicio y apariencia» de `CHANGELOG.md`.
- Validación: 436 pruebas en verde (34 archivos), lint con 0 errores y 10 advertencias de los archivos no modificados. En navegador se comprueba en ambos temas que el contenido y las dimensiones de los componentes coinciden antes y después.
- Observación fuera del alcance: a 390 px la pantalla actual presenta desborde horizontal; se conserva y se contrasta con el fondo anterior. Este ajuste no modifica reglas de distribución.
- Próximo paso: revisar visualmente el fondo antes de integrar.

## Movimiento del fondo y estadísticas — 2026-10-21

- **Rama**: `feat/fondo-suave`.
- A petición de Carlos, la propuesta se amplía con iluminación flotante y seguimiento del cursor; se mantiene la distribución de la pantalla actual.
- La capa decorativa se recorta al viewport, queda detrás del contenido y no recibe eventos. Solo se activa con ratón y se detiene al ocultar la pestaña. La interpolación del cursor termina cuando alcanza su destino.
- Inicio anima las tarjetas al entrar en vista. Las cifras usan sus formatos existentes, conservan una versión accesible del valor final y no convierten N/D en cero. Un nuevo render o la preferencia de movimiento reducido cancelan los efectos pendientes.
- El fondo y los contadores respetan cambios de la preferencia del sistema. Las gráficas consultan esa preferencia al crearse.
- Compartidos: `js/app.js` inicia el efecto una sola vez; `js/components/chart.js` respeta movimiento reducido; `css/base.css` y `css/variables.css` definen las capas. No se modifican fórmulas, rutas ni datos persistidos.
- Nuevo componente `js/components/movimiento.js`, integrado desde `inicio-ui.js`; documentación en arquitectura, API y manual. Sin dependencias nuevas.
- Validación: 446 pruebas en verde (35 archivos), incluidos 9 casos nuevos de movimiento y un caso de movimiento reducido en gráficas. Lint: 0 errores y las mismas 10 advertencias existentes, sin advertencias nuevas.
- Navegador: se verifica el cursor, las ocho cifras finales contra sus versiones accesibles, el cambio de tema y de ruta, una sola capa decorativa, ausencia de cuadros JavaScript pendientes al detenerse, ancho de 1440 px sin desborde adicional y fondo estático en dispositivo táctil. Al cambiar movimiento reducido, el respaldo CSS oculta los contadores y muestra de inmediato los valores finales; al recargar se desactivan también las animaciones de Chart.js.
- [Demostración animada](demo-fondo-estadisticas.gif) incluida como evidencia para la revisión visual del PR.
- Próximo paso: revisión del PR en borrador antes de integrar.
