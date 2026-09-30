# Mejoras de apariencia e Inicio como panorama general

- **Estado**: En revisión
- **Responsable**: Carlos
- **Rama**: `feat/mejoras-apariencia`
- **Última actualización**: 2026-09-30

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
