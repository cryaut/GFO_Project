# Caso integrado · Contexto y escenarios

- **Estado** · En revisión en la rama de prueba
- **Responsable** · Carlos
- **Rama** · `test/caso-integrado-excepciones`
- **Base** · Referencia de la etapa 1 en `46fcb28`
- **Última actualización** · 2026-11-05

## Objetivo

Cargar la apertura de Comercial Ejemplo, guardar escenarios independientes y recuperar los datos del caso ante un respaldo inválido o un fallo de escritura.

## Alcance

- Planeación carga la apertura verificada de 2025 y las unidades de venta proyectadas de 2026 desde `propuesta-caso/referencia/referencia_resultados.json`.
- Cada escenario conserva sus supuestos y comparte el cierre identificado. El presupuesto previo se conserva como escenario con apertura editable.
- Reportes exporta y valida el contexto completo. Un respaldo válido se guarda en una sola escritura y un rechazo conserva el último estado válido.
- La proyección integrada de los doce meses corresponde a las etapas de cobros, inventario, impuestos y balance proforma. En este corte, Planeación permite preparar y recuperar los supuestos del caso.

## Verificación

Las pruebas ejercitan la ruta de Planeación, la recarga, la copia y edición de un escenario, los campos pendientes y el guardado fallido. Reportes comprueba respaldos versionados, vínculos inválidos, compatibilidad anterior y fallos del almacenamiento o de un suscriptor.

`npm.cmd test` pasó 2,016 pruebas en 60 archivos. `npm.cmd run lint` dio 0 errores y las 10 advertencias preexistentes. La decisión de diseño está en D-089.

El servidor local respondió HTTP 200 para la aplicación, el módulo de Planeación y el JSON del caso. La comprobación interactiva en el navegador quedó pendiente por un fallo al iniciar la herramienta de control. Las pruebas automatizadas ejecutan los manejadores de la pantalla y simulan los fallos de almacenamiento.
