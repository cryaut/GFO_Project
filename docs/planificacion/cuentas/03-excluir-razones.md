# Excluir razones del alcance

**Historial:** la ronda 3 autoriza después una excepción limitada a esta exclusión. La atribución de la restricción se aclara como instrucción de Cris comunicada por Carlos. La implementación y validación vigentes están en [04-ronda3-nd.md](04-ronda3-nd.md); las cifras de este paso corresponden a la reversión anterior.

Fecha: 2026-10-18. Carlos indicó después de la entrega: «se me olvido decir que la parte de las razones no la modifiques». Esta instrucción reemplaza la autorización previa de adaptar N/D en Razones (D-034 y la parte correspondiente de D-043). Decisión vigente: D-044.

## Cambios retirados

- Se restaura **todo** `js/modules/analisis/index.js` a `origin/main` (`2c11c4d`): lectura de estados, cálculo de razones, presentación y demás funciones del archivo.
- Se elimina `cuentas-disponibilidad.js`, creado exclusivamente para anular razones y registrar motivos según sus entradas.
- Se elimina `cuentas-consumidores.test.js`, que contenía dos pruebas exclusivas del adaptador retirado, y el caso del periodo previo de `cuentas-revision.test.js`. En los demás casos se retiran las comprobaciones de ese adaptador y se mantienen las de importes, subtotales, legado, intereses, EFE y EOAF. Quedan 15 regresiones de revisión.
- Se retira la referencia a la API eliminada y se actualizan ficha, manual, catálogo de funciones, CHANGELOG y descripción del PR.

## Qué se conserva

Importación, catálogo y evidencias, identificación/revisión manual, metadatos en los datos guardados, protección de totales en Estados y Reportes, corrección de ingresos por intereses y correcciones EFE/EOAF en sus archivos propios.

Las fórmulas de `js/utils/calculate.js`, archivos de razones y sus pruebas originales no cambian frente a `main`. Tampoco se modifican los JSON del motor. `git diff origin/main -- js/modules/analisis/index.js` queda vacío. El ajuste se publica como un commit nuevo; no se reescribe el historial del borrador.

Los totales compartidos de Estados siguen corregidos y alimentan a los consumidores existentes. Esto puede cambiar un valor de entrada cuando se corrige su cuenta, aunque la implementación de Razones permanezca igual. La propagación específica de N/D/metadatos en Razones queda fuera de esta entrega y pendiente del equipo responsable; no se garantiza aquí el comportamiento propuesto en la revisión para cuentas pendientes dentro de Razones.

## Validación vigente

`npm.cmd test`: **523 pruebas pasan en 38 archivos**, código 0. La reducción de tres pruebas corresponde exclusivamente a la funcionalidad de Razones retirada; las pruebas originales de razones siguen intactas y pasan.

```text
 Test Files  38 passed (38)
      Tests  523 passed (523)
   Start at  16:12:27
   Duration  3.22s (transform 2.03s, setup 0ms, collect 5.90s, tests 13.35s, environment 10ms, prepare 8.37s)
```

`npm.cmd run lint`: código 0, sin errores; conserva las diez advertencias previas.

```text
> gfo-toolkit@1.0.0 lint
> eslint js/ tests/

✖ 10 problems (0 errors, 10 warnings)
```

PR #14 permanece en borrador. Siguen pendientes v8/reconciliación de investigación con #10, numeración previa a integración y confirmación independiente de dividendos. Cualquier modificación de Razones se tratará en otra tarea con autorización expresa.
