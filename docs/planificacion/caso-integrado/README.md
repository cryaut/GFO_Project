# Caso integrado · Escenarios y capital de trabajo

- **Estado** · En revisión en la rama de prueba
- **Responsable** · Carlos
- **Rama** · `test/caso-integrado-excepciones`
- **Base** · Referencia de la etapa 1 en `46fcb28`
- **Última actualización** · 2026-11-06

## Objetivo

Cargar la apertura de Comercial Ejemplo, guardar escenarios independientes y reproducir el capital de trabajo mensual desde los supuestos del caso.

## Alcance

- Planeación carga la apertura verificada de 2025 desde `propuesta-caso/referencia/referencia_resultados.json` y los supuestos editables desde `propuesta-caso/referencia/inputs.json`.
- Cada escenario conserva sus supuestos y comparte el cierre identificado. El presupuesto previo se conserva como escenario con apertura editable.
- Reportes exporta y valida el contexto completo. Un respaldo válido se guarda en una sola escritura y un rechazo conserva el último estado válido.
- El presupuesto parcial proyecta ventas, existencias físicas, compras, cobros y pagos de los doce meses. Los costos cambian por mes y las cuotas de crédito posteriores a diciembre conservan sus fechas.
- La ronda de fiabilidad de Proforma e Inventario limita las variaciones a horizontes comparables y verifica el kardex completo antes de restaurar un respaldo.
- Planeación abre con una cuadrícula y un panel de consulta. Supuestos y Tablas completas permanecen a un clic. Cambiar de vista conserva las ediciones en curso.
- El siguiente corte del caso necesita valorizar las existencias desde el cierre histórico y derivar el costo de ventas. La proyección de caja y el balance proforma también requieren gastos, inversión, deuda, impuestos y dividendos.

## Verificación

Las pruebas comparan los doce meses con la referencia independiente, incluidos saldos, cuotas y fechas de vencimiento. El año termina con C$ 67,980 por cobrar y C$ 21,870 por pagar después de diciembre. La suite ejercita la ruta de Planeación, la recarga, la copia y edición de un escenario, los campos pendientes y el guardado fallido. Reportes comprueba respaldos versionados, vínculos y calendarios inválidos, compatibilidad anterior y fallos del almacenamiento.

`npm.cmd test` pasó 2,057 pruebas en 61 archivos. `npm.cmd run lint` dio 0 errores y 10 advertencias preexistentes.

En Chrome, el resumen, las tablas y los supuestos se probaron a 320, 390 y 1280 px, incluidos el tema oscuro, la consulta por periodo y la recuperación de los supuestos guardados al recargar. A 390 px de ancho, la primera sección de resultados comenzaba a 2,715 px desde el inicio de la página. La primera tarjeta del resumen comienza a 367 px en el mismo caso.

Las decisiones de persistencia y de calendarios están en D-089 y D-090. Las reglas de comparabilidad y de restauración de Inventario están en D-091 y D-092. El piloto de Planeación está documentado en D-093.

## Preparación de integración · 2026-11-07

Cris solicita terminar e integrar los PR prioritarios, con excepción puntual a la revisión humana obligatoria. Esta autorización incluye el alcance funcional existente de este PR, además de la referencia: escenarios, capital de trabajo parcial, persistencia en lote y validación de respaldos. No añade las etapas de caja y balance completos. Se incorpora main con #26 y #29, resolviendo únicamente conflictos documentales y conservando D-087 a D-093 y D-095.

La referencia independiente conserva sus 17 controles y coincide exactamente con el JSON publicado. [Verificación reproducible en Edge](revisar-integracion.cjs): `node docs/planificacion/caso-integrado/revisar-integracion.cjs`. Usa Playwright del runtime existente, sin dependencias nuevas ni perfil del usuario; cierra navegador y servidor. Comprueba cinco rutas, 18 combinaciones de tamaño/tema/vista, vencimientos posteriores al cierre, borrador entre vistas, copia de escenario, guardado y recarga. Sin errores de página ni desbordamiento.

Resultado combinado con #26 y #29: **2089/2089 pruebas**, 65 archivos; lint 0 errores y 10 advertencias existentes.
