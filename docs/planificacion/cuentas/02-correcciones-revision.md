# Correcciones de las revisiones PR #14 y PR #13

Fecha: 2026-10-18. Rama: `feat/cuentas-identificador`. Base: `origin/main`, `2c11c4d`. Carlos autorizó proceder con las correcciones después de revisar los dos documentos recibidos. Los puntos que esos documentos reservan a Cris permanecen pendientes.

**Cambio de alcance posterior:** Carlos indicó «la parte de las razones no la modifiques». El ajuste específico descrito en el punto 4 se retiró, junto con sus pruebas exclusivas; `analisis/index.js` se restauró a `main`. Este informe conserva la entrega previa de 526 pruebas; el estado vigente y la nueva validación están en [03-excluir-razones.md](03-excluir-razones.md). Las afirmaciones sobre propagación en Razones que siguen describen esa versión anterior, no el código entregado ahora.

## Correcciones aplicadas

1. Cuenta pendiente con cero: conserva la identificación pendiente y los importes, pero no anula totales, políticas de ausencia ni razones de ese periodo. Dos saldos cero tampoco bloquean EFE/EOAF. Un saldo ausente sigue siendo N/D.
2. Cuenta pendiente con importe: se anulan tipos/subtotales posibles y total de su grupo. Clasificación explícita o candidatos restringen el alcance; un conflicto conserva ambas posibilidades. Sin contexto se consideran las posibilidades de su grupo. Una fila sin grupo con importe afecta todos los totales. Los motivos incluyen `campos`.
3. Legado: una cuenta desconocida no altera silenciosamente el total. Se conserva la compatibilidad de nombres/tipos conocidos de la demo.
4. Razones: N/D sigue las entradas efectivas de cada indicador. Los saldos anteriores solo afectan promedios/compras. Un pendiente corriente no bloquea rotación de activos fijos, margen ni prueba defensiva si sus entradas están completas.
5. Intereses: prueba explícita MUNO MODA + ingreso por intereses 20 = utilidad neta 104845. La regresión original permanece intacta.
6. EFE: reconoce pérdida del ejercicio/periodo, advierte movimientos opuestos de reservas y resultados y muestra dividendos derivados. La conciliación no valida independientemente UN porque esta aparece en operación y en la inferencia de dividendos. Se mantienen fórmula e importes; no se confirma el pago de 40000.
7. Aceptación JSON: se comparan por separado nombre, periodos, importes y tipos **con la entrada original** antes/después de recargar; metadatos se verifican aparte. No se usa el propio normalizador como resultado esperado.

## Investigación y sincronización

Se auditaron las 29 cuentas antes `verified`: 23 tienen cita literal específica y ubicación en sus fuentes; seis bajan a `partially_verified`. El catálogo `2026-10-18.1` tiene **23 verified, 44 partially_verified y 5 ambiguous**. Las fuentes y el alcance terminológico del PGC español están en [investigación](investigacion.md). No se impone normativa española a una empresa nicaragüense. El título del proyecto IFRS de intereses se describe como título que no define la cuenta.

Las seis rebajas locales, declaradas en `tests/fixtures/cuentas-revision-investigacion.json`, son activos fijos netos reportados, intangibles, costo de ventas reportado, costo de mercaderías, otras ventas y costo de productos. En intangibles hay una contradicción concreta: la definición heredada dice monetarios y IAS 38 dice no monetarios. No se editan los JSON ni las definiciones compartidas unilateralmente.

Consulta de GitHub: PR #10 sigue abierto en `a87ef0af0954e00d3f95ed1476ec3154bc06d768`, sin v8. Las cuatro rebajas anunciadas para v8 (depreciación acumulada, resultado del ejercicio en patrimonio, depreciación y amortización operativas) deben sincronizarse cuando se publiquen. Ahora esas cuatro tienen evidencia local específica nueva, pero no se declara cerrada la sincronización.

La prueba compara los estados con la instantánea y exige exactamente las seis diferencias conservadoras declaradas, sin ocultarlas. Cuando existan JSON vivos integrados, exige **igualdad estricta** de `research.status` con `estadoInvestigacion`: habrá que reconciliar las diferencias antes de integrar #14. La instantánea original no se modifica para hacer pasar la comparación.

## Pruebas anteriores modificadas y motivo

| Archivo y prueba | Cambio y justificación |
|---|---|
| `estados-import.test.js`, «explica los errores con el número de fila» | La cuenta sin grupo pasa de lanzar error a conservarse en `pendingAccounts`; una clasificación contradictoria pasa de error a sugerida. Decisión 2 aprobada, D-030. Duplicados y archivo vacío siguen rechazándose. |
| `estados-calculations.test.js`, antes «rechaza cuentas personalizadas sin clasificación» | Exige conservación y `no_reconocida`, por la misma decisión; no se debilita la validación estructural ni de importes. |
| `estados-acceptance.test.js`, importación JSON | Compara los campos originales directamente y verifica metadatos añadidos aparte. Conserva comprobación de persistencia única, notificación y recarga. |
| `estados-acceptance.test.js`, importación CSV | La entrada añade ids explícitos para que los nombres propios queden confirmados y el balance de esa prueba siga calculable. La importación sin id y la conservación de pendientes tienen cobertura independiente. |
| `cuentas-identificador.test.js`, definiciones de PR #10 | Añade contraste de estados y registro explícito de las seis rebajas locales; compara estados estrictamente con los futuros JSON vivos. Añade guardia de cita/ubicación para verificadas. |

Las expectativas de clasificación contradictoria, las cifras originales, fórmulas, los 20 JSON y `js/utils/calculate.js` se conservan. Las correcciones incluyen pruebas nuevas en `cuentas-revision.test.js`.

## Validación

La primera ejecución reprodujo siete fallos de producto en los diez casos iniciales; además se corrigió un error de preparación del caso de dos periodos. Los casos de ingreso por intereses y saldo ausente ya pasaban. El ensayo completo detectó un caso de conflicto explícito/candidato que se corrigió conservando su prueba anterior; otro caso nuevo se ajustó porque el contexto identificaba correctamente una cuenta única.

Resultado final: **526 pruebas pasan en 39 archivos**, incluidas 17 pruebas nuevas en esta corrección (16 regresiones y una guardia de evidencia). `npm.cmd run lint` termina con **0 errores y 10 advertencias previas**. Ambos comandos terminan con código 0. Los tests de pantalla EFE/EOAF y persistencia forman parte de la suite; la prueba con navegador/Excel del paso 01 es evidencia anterior y no se presenta como repetida en esta corrección.

Salida final de Vitest:

```text
 Test Files  39 passed (39)
      Tests  526 passed (526)
   Start at  16:08:12
   Duration  3.11s (transform 2.08s, setup 0ms, collect 6.38s, tests 12.80s, environment 10ms, prepare 8.15s)
```

Salida final de ESLint:

```text
> gfo-toolkit@1.0.0 lint
> eslint js/ tests/

✖ 10 problems (0 errors, 10 warnings)
```

Las advertencias previas corresponden a `tabla.js`, `activos/index.js`, `presupuesto/index.js`, `utils/export.js` y `calculate.test.js`; no se agregan advertencias en los archivos corregidos. La descripción del PR incluye las salidas completas.

## Pendientes antes de integrar

- Publicación de v8 y coordinación de estados de investigación/definición de intangibles con el dueño del PR #10. No se ha enviado ningún mensaje al equipo.
- Orden aprobado: integrar #10 primero. Sus decisiones D-028–D-035 y atribución D-036; las nuestras D-029–D-034 → D-037–D-042 justo antes de integrar. D-001–D-027 se conservan. Nueva corrección D-043.
- Confirmación de Cris para retirar el fallback por nombres fijos de Análisis: no implementado.
- Confirmar dividendos de 2024 y acordar una entrada independiente si se desea comprobar UN: no implementado.
- Revisión humana del borrador #14. No se ha fusionado ningún PR.
