# 00 — Alcance

- **Estado**: Completado
- **Fecha**: 2026-10-09
- **Depende de**: —

## Objetivo

Auditar el EOAF existente y decidir qué debe mostrar, antes de escribir código.

## Decisiones

- La pestaña EOAF queda como está en la navegación (`data-tab="eoaf"`); no se crean rutas ni pantallas nuevas.
- El estado se arma con el balance comparado de dos periodos (los dos más recientes), que es lo que el docente pidió y el criterio que ya usa el resto de Análisis.
- Se mantiene `eoaf(cuenta, cambio, tipo)` de `calculate.js` como regla base por concepto; la lógica de la pantalla vive en `js/modules/analisis/eoaf-calculations.js`, no en `calculate.js`.
- Auditoría del código anterior: `computeEOAF` clasificaba seis agregados, contaba dos veces el mismo movimiento y no comprobaba nada; se reemplaza entero (D-021).

## Checkpoint

- [x] Lista de casos de prueba acordada (activos/pasivos/patrimonio ±, depreciación, retiros, saldos en cero y negativos, selección de períodos, datos faltantes, cuadre y descuadre, escape de HTML).

## Preguntas abiertas

- Ninguna abierta. El gasto de depreciación del periodo no está en el modelo: se informa como limitación (D-022).

## Próximo paso

01 — Implementación.
