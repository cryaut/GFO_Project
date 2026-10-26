# Contexto maestro — conexión de razones y ronda 19

**Actualizado:** 25 de octubre de 2026 (America/Managua)

**Proyecto:** GFO Toolkit

**Rama:** `feat/razones-app-final`
**Repositorio:** `cryaut/GFO_Project`

Este documento permite retomar el trabajo sin reconstruir la conversación. Resume el objetivo, las decisiones vigentes, lo publicado, el estado local de R4 y el bloqueo actual. La tarea **no está terminada**.

## Objetivo de la línea de trabajo

Conectar las 20 razones financieras basadas en JSON con la aplicación, eliminando lecturas por nombre fijo en Análisis y Reportes. Mantener el motor JSON como fuente de las fórmulas, tratar datos faltantes como N/D y conservar la trazabilidad de identidades y motivos. La tarea 1c es retirar 22 lecturas fijas: 15 en Análisis y 7 en Integración/Reportes; primero hay que definir y probar que los datos no normalizables produzcan N/D sin contaminar otras razones.

Carlos autorizó expresamente hacer 1c en una ronda aparte, **sin cambiar las fórmulas**. Cris ya había aprobado las decisiones D-059 y D-060. Esa autorización no elimina las condiciones de detención de R4 de la instrucción de ronda 19.

## Decisiones y límites que siguen vigentes

- **D-049:** documentos no normalizables dan N/D; las razones no deben depender de nombres fijos.
- **D-055 y D-057:** las cuentas requeridas ausentes son N/D; solo `is.interest_income` conserva cero cuando no se reporta. El catálogo de Estados está sincronizado con esa política.
- **D-056 y D-058:** las razones de la app leen el motor generado a partir de los JSON; las demás fórmulas conservan su ubicación.
- **D-059:** CxC/plazo de cobro requieren `supp.credit_sales`; CxP/plazo de pago requieren `supp.supplier_payments`. No se sustituyen por ventas totales ni por costo de ventas más variación de inventario.
- **D-060:** las pruebas antiguas pueden recibir ceros explícitos, identidades o los datos suplementarios requeridos sin cambiar el esperado. Solo los cambios de esperado expresamente autorizados por D-059 son válidos. Si se construye un importe para reproducir un esperado anterior, se debe decir.
- No cambiar fórmulas, JSON, especificación generada, libros `Esperados`, EFE, EOAF, Comprobación, Mercado ni validador. No usar cifras de MUNO. No hacer merge ni force push.
- No abrir el PR nuevo hasta que T9 y T10 estén en verde; se requiere revisión humana distinta del autor.

## Trabajo ya publicado en la rama

Base de la ronda: `84cbd3132f128d3776e622d0dd3f3c180f3de1c7`.

La ronda 18 dejó publicados seis commits hasta `a2e471a6a8f92c73bdf04759ffd5cf6fddacbd0f`: D-049/D-056/D-057/D-058, adaptación de la regla 3, captura de composición de ingresos, conexión de `computeRazones` al motor, contrato del adaptador y catálogo sincronizado con D-055.

En la ronda 19 ya están publicados estos tres commits:

| SHA | Cambio |
|---|---|
| `b6c3175eb89f206cfe9d078096316522d539291e` | Registra D-059 y D-060. |
| `9c18dc840975ea28fba9035eb3e42ac2ad2af8a1` | Alinea la nota 02 con los JSON de razones. |
| `1628a6fa68b2a2f2b5a5598af17ef29b562cc2fd` | Añade captura por periodo de ventas a crédito y pagos a proveedores en Estados. |

R3 se verificó con **37/37 pruebas focalizadas en dos archivos** y lint focal sin mensajes. R2 reportó 72 cuentas en JSON y nota, con cero diferencias en los campos comparados. Estos resultados no equivalen a una validación final de la ronda.

## Estado de R4: detenido por cinco discrepancias

Se ejecutaron `tests/unit/analisis-nd.test.js` y `tests/unit/analisis-razones.test.js`: **5 fallidas y 7 correctas, 12 en total**. La regla de detención de R19 prohíbe avanzar cuando un esperado no se mantiene después de completar las entradas. Por eso R5–R9 no se completaron y las fórmulas no se tocaron.

1. **Costo N/D / liquidez:** se esperaba `RC = 10`, pero se obtuvo `null`. El fixture aún no acredita todos los componentes requeridos para calcular la razón corriente.
2. **Gasto administrativo pendiente:** la estructura histórica del motivo esperaba `utilidadOperativa` y `gastosAdmin`; el motor reporta motivos por razón e ids. Los valores de margen bruto (`0.6`) y los N/D financieros previstos se conservan.
3. **Activo corriente pendiente:** el motivo histórico `capitalNetoTrabajo` / `activosCorrientes` no coincide con el contrato de motivos del motor; margen bruto (`0.6`) y rotación de activos fijos (`2`) se conservan.
4. **Cero explícito:** márgenes y cobertura dan cero como se esperaba, pero `notAvailableReasons` no queda vacío porque faltan otras cuentas requeridas no relacionadas con esos ceros.
5. **Plazos con ventas a crédito:** se esperaba `rotacionCxP = 8` (y luego plazo `45.625`, ciclo `82.125`), pero se obtuvo `null`; el caso no declara pagos a proveedores ni el saldo previo necesario. No se inventó un dato para hacerlo pasar.

Los dos casos de dos periodos que incluyen pagos declarados de `430` sí conservan `440 / 45 = 9.777777…`; el importe se documentó como construido para reproducir ese esperado, conforme a D-060. Esto no resuelve el quinto fallo de un periodo.

### Qué debe aclararse antes de retomar

- Qué entradas acreditadas o ceros explícitos completan la liquidez del primer caso, manteniendo `RC = 10`.
- Si las pruebas de los casos 2 y 3 deben verificar el formato vigente de motivos del motor; si sí, qué ids, campos y motivos se consideran el esperado válido.
- Si el caso 4 debe completar con ceros explícitos los demás datos requeridos o si la aserción de motivos se limita a las razones afectadas, sin alterar los ceros numéricos esperados.
- Qué entradas comprobables permiten conservar la rotación CxP esperada de `8` en el caso 5. Si no hay datos reales suficientes, Cris debe decidir cómo resolver la incompatibilidad con D-059/D-060; no cambiar fórmulas ni fabricar importes.

## Cambios locales de este checkpoint

Al preparar este contexto, el árbol contenía cambios sin commit en:

- Modificados: `tests/unit/analisis-nd.test.js`, `tests/unit/analisis-razones.test.js` (preparación R4; su ejecución focalizada tiene los cinco fallos descritos).
- Nuevos: `tests/fixtures/razones-app-ejercicios-v2.json`, `tests/fixtures/razones-app.js`, `tests/unit/razones-app-aceptacion-1c.test.js` y `tests/integration/razones-app-comparacion.test.js` (harness/fixtures de aceptación y comparación; R7/R8 aún no ejecutadas en esta ronda).

Los ajustes de R4 y los harnesses se publican como trabajo pendiente para preservar el estado, no como pruebas aprobadas ni como cierre de tareas. No se ha realizado una ejecución de pruebas nueva para esta publicación.

Para preservar el corte se crearon estos commits de checkpoint y se subieron a `origin/feat/razones-app-final` con un `git push` normal el 25 de octubre de 2026:

| SHA | Contenido | Estado de verificación |
|---|---|---|
| `d6ccad1` | Fixtures de R4 en los dos tests antiguos de Análisis. | Subido; la última ejecución focalizada tuvo 5 fallos y 7 aciertos; detenerse según R19. |
| `98358a0` | Fixtures y harnesses de aceptación 1c / comparación app. | Subido; no ejecutados en esta ronda. |
| `7123765` | Este contexto maestro. | Subido. |

La comparación R8 de 60/240 celdas **no se ejecutó**. La aceptación 1c tampoco se ejecutó. No se ha retirado todavía ninguna de las 22 lecturas fijas: R5 está pendiente.

## Publicación y límites de sincronización

Al preparar el checkpoint, `HEAD` y la referencia conocida `origin/feat/razones-app-final` coincidían en `1628a6fa68b2a2f2b5a5598af17ef29b562cc2fd`; las diferencias eran los archivos locales enumerados arriba. El `git fetch origin` falló por una limitación de red/DNS del entorno, pero el push normal se completó: `origin/feat/razones-app-final` avanzó de `1628a6f` a `7123765`. No hubo force push. Al registrar la actualización de este documento, el árbol de trabajo estaba limpio y no hay PR nuevo abierto.

El reporte detallado de la ejecución anterior está en el espacio de trabajo, fuera del repositorio: `../ronda19-R1-razones-final.md`. Este archivo maestro sí forma parte del repositorio.

## Próximo paso seguro

1. Confirmar que este checkpoint quedó en `feat/razones-app-final` y fue subido sin force push.
2. Resolver con Cris las cinco aclaraciones de R4 anteriores.
3. Reanudar R4, conservando fórmulas y valores esperados salvo el cambio N/D que D-059 autoriza expresamente. Si vuelve a fallar un esperado, detenerse y reportar el valor esperado y el obtenido.
4. Solo cuando R4 quede resuelta, seguir en orden con R5 (las 22 lecturas y su política de N/D), R6, R7, R8 y R9. No afirmar que 1c está implementada hasta retirar las lecturas y aprobar las pruebas indicadas.
