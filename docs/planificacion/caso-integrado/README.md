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
- El siguiente corte del caso necesita valorizar las existencias desde el cierre histórico y derivar el costo de ventas. La proyección de caja y el balance proforma también requieren gastos, inversión, deuda, impuestos y dividendos.

## Verificación

Las pruebas comparan los doce meses con la referencia independiente, incluidos saldos, cuotas y fechas de vencimiento. El año termina con C$ 67,980 por cobrar y C$ 21,870 por pagar después de diciembre. La suite ejercita la ruta de Planeación, la recarga, la copia y edición de un escenario, los campos pendientes y el guardado fallido. Reportes comprueba respaldos versionados, vínculos y calendarios inválidos, compatibilidad anterior y fallos del almacenamiento.

`npm.cmd test` pasó 2,035 pruebas en 61 archivos. `npm.cmd run lint` dio 0 errores y 10 advertencias preexistentes.

Las decisiones de persistencia y de calendarios están en D-089 y D-090. Las pruebas automatizadas de interfaz ejecutan los manejadores de la pantalla con un DOM simulado.
