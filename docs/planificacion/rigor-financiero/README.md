# Rigor financiero y comparación con AFOD

- **Estado:** En revisión
- **Responsable:** Carlos con Codex
- **Rama:** `fix/rigor-financiero`
- **Fecha:** 2026-11-04

## Objetivo

Corregir la incoherencia de DuPont, reconocer las cuentas de patrimonio del EFE por identidad y expresar los límites de un flujo indirecto calculado desde variaciones de saldos. Comparar las presentaciones AFOD y los módulos solicitados con la implementación y registrar evidencia y diferencias.

## Pasos

1. Reproducir los tres hallazgos y corregirlos con pruebas que distingan datos faltantes, ceros, identidades y estimaciones.
2. Inventariar y contrastar las presentaciones y sus ejercicios contra las funciones reales.
3. Contrastar los módulos mínimos y sus integraciones con el documento proporcionado.
4. Ejecutar las comprobaciones y entregar un informe con limitaciones y pendientes.

## Resultado y revisión

- Se corrigieron DuPont, identificación patrimonial del EFE y presentación de sus estimaciones. También se corrigió la conciliación del flujo directo con efectivo N/D y la suma de gastos incompletos en Proforma.
- [Comparación de las 14 presentaciones y matriz de los nueve módulos](01-comparacion-afod-y-modulos.md). Los impuestos del presupuesto de caja son un pendiente de alta prioridad, documentado con el caso San Rafael.
- Suite automatizada del árbol revisado: **2029 pruebas en 61 archivos**, sin fallos. Lint: **0 errores y 10 advertencias previas**. Se mantienen pendientes las pruebas con estados reales y la revisión humana del cambio.
- Las tres correcciones priorizadas no convierten el EFE derivado en un flujo de caja confirmado, ni cierran las demás diferencias identificadas en el informe.

## Límites

- Mantener las fórmulas aprobadas de razones; no convertir ausencias en cero.
- Una conciliación aritmética no confirma que las variaciones sean cobros o pagos reales.
- No afirmar que un documento o módulo está conforme sin evidencia suficiente.

## Preparación de integración · 2026-11-07

Se incorporó main con el diseño de Estados y se resolvió el índice de planificación conservando ambas fichas. Cris autorizó expresamente integrar los PR prioritarios con una excepción puntual a la revisión humana obligatoria; no se modifican las protecciones de GitHub. Validación de la integración resuelta: 2029/2029 pruebas; lint 0 errores y 10 advertencias existentes; navegación de Análisis, Flujo, Proforma, Planeación y Estados en Edge sin errores de página. El detalle ROA/ROE y la conservación del borrador de Mercado se coordinan posteriormente en PR #29.
