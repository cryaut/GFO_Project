# 04 — Pantalla

- **Estado**: Completado
- **Fecha**: 2026-09-27
- **Depende de**: 03

## Objetivo

La ruta `#/apalancamiento`, donde el usuario clasifica los costos, informa el DAP y ve el GAO, el GAF y el GAT de cada periodo con la traza cuenta → concepto → fórmula → resultado. Es el CP4 de la ficha y cierra el MVP.

## Ruta y archivos

Según "Para agregar una ruta" de `docs/contexto/arquitectura.md`:

| Archivo | Cambio |
|---|---|
| `js/modules/apalancamiento/index.js` | `initApalancamiento()`: lee `estados` y `apalancamiento` del `store`, llama a `calcularApalancamiento` y dibuja con la UI |
| `js/modules/apalancamiento/apalancamiento-ui.js` | Todo el HTML y los eventos |
| `js/app.js` | Import y entrada `'apalancamiento'` al final de `routes`; tarjeta en `initHome` |
| `index.html` | `<div class="page" id="page-apalancamiento">` y enlace en la barra lateral, después de Análisis |

`app.js` e `index.html` son compartidos: se agrega al final, sin reordenar.

## Secciones de la pantalla

1. **Sin datos.** Si no hay estados guardados, un mensaje con enlace a `#/estados` y nada más.
2. **Clasificación de costos.** Una fila por cuenta operativa: nombre, tipo, importe del último periodo y un selector Variable / Fijo / Mixto (con campo de % variable si es mixto). Las sugerencias vienen marcadas "sugerido". Botón Guardar.
3. **Parámetros.** DAP por periodo (vacío = 0) y tasa de impuesto por defecto en % (0 a 99.99). Cada periodo indica si usa la tasa efectiva o la por defecto.
4. **Resultados por periodo.** Tabla con GAO, GAF y GAT estructurales. N/D con el motivo en un `title` o una nota. Los negativos llevan la advertencia de punto de equilibrio ([D-008](../../decisiones.md)).
5. **Resultados por variación.** Una fila por par de periodos consecutivos (2023 → 2024), con su GAO, GAF y GAT, y el estructural del periodo base al lado para compararlos. Si difieren mucho, la advertencia `estructura-cambio`.
6. **Traza.** Por periodo, desplegable (`<details>`): cada concepto con su fórmula, las cuentas que lo forman y el resultado. Por ejemplo, "MC = Ventas 850,000 − CV 510,000 = 340,000".
7. **Interpretación.** Una frase por grado, con el valor: "Si las ventas suben 1 %, la UAII sube 2.52 %". Solo cuando el grado es un número positivo.

## Reglas de interfaz

- Todo nombre de cuenta pasa por `escapeHTML` antes de `innerHTML` (regla 7 de `AGENTS.md`).
- `formatNumber` y `formatPercent` convierten `null` en 0: verificar `null` antes y mostrar "N/D".
- Guardar con `store.setPersisted('apalancamiento', ...)`. Si falla, `showToast` con el error y los datos anteriores quedan intactos.
- Los grados se muestran con 2 decimales; la traza, con `formatCurrency`.
- Los textos de las advertencias salen de los códigos del paso 03, en un solo lugar de `apalancamiento-ui.js`.

## Tests

En `tests/unit/apalancamiento-ui.test.js`, con un documento simulado, como `estados-acceptance.test.js`.

| Caso | Esperado |
|---|---|
| Sin estados | Mensaje con enlace a `#/estados` |
| MUNO MODA sin clasificar | Gastos de ventas sin comportamiento; estructurales N/D; variación visible |
| Guardar gastos de ventas como fijo | Se llama a `setPersisted` y el GAO 2023 muestra 2.52 |
| Cuenta con nombre `<img onerror=…>` | Se muestra como texto, sin crear elementos |
| DAP y tasa inválidos (tasa 150 %) | No se guarda; mensaje de error |
| UAII negativa | Valor negativo con advertencia |

Además, prueba manual en el navegador con la demo y con `scripts/sample-estados.csv`, anotada en el PR.

## Documentación

- `docs/manual-usuario.md`: sección de Apalancamiento, con cómo clasificar costos y cómo leer los grados.
- `docs/contexto/arquitectura.md`: la ruta en la tabla de rutas y el módulo en la estructura.
- `CHANGELOG.md` y la ficha.

## Checkpoint

Cumplido el 2026-09-27: 17 tests en `apalancamiento-ui.test.js`; `npm test` con 212 tests en verde y `npm run lint` sin errores. Prueba en Chrome (headless, con `node scripts/dev-server.cjs`): 19 de 19 comprobaciones y sin errores en la consola, con la demo y con `scripts/sample-estados.csv`.

- [x] La ruta funciona desde la barra lateral y la tarjeta de inicio.
- [x] Con la demo, clasificar, guardar y ver los tres grados por periodo y por variación, con traza.
- [x] Tests de la tabla en verde; `npm test` y `npm run lint` sin errores.
- [x] Prueba en el navegador anotada en el PR.

Ajustes al implementar:

- Los errores de guardado se muestran en un mensaje de la página (`#apalancamientoMensaje`), como en Estados, en lugar de `showToast`: `toast.js` busca su contenedor al cargarse y no se puede probar con el documento simulado.
- DAP y tasa se escriben como texto con '.' decimal y ',' de miles (7,000). Un número mal escrito (por ejemplo 1.2.3) se rechaza; no se reutilizó `parseAmountCell`, que lo lee como 123.
- La columna T dice "No interviene (DAP = 0)" cuando no hay DAP.
- Los resultados se recalculan al guardar, no al cambiar un campo; el mensaje avisa de los cambios sin guardar.

## Preguntas abiertas

Resueltas el 2026-09-27:

1. **Gráfico.** Fuera del MVP. Se puede agregar después con `renderChart`.
2. **Integración con Reportes.** Fuera del MVP: toca `integracion/index.js`, que es de Cris.

## Próximo paso

MVP completo. Después, opcional: [05 — Memoria por empresa](05-memoria-por-empresa.md) (CP5).
