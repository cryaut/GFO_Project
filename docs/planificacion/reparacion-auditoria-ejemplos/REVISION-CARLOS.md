# Respuesta a la revisión de Carlos del PR #31

Fecha: 2026-11-08 (America/Guatemala). Revisión leída completa antes de implementar: [5816728981](https://github.com/cryaut/GFO_Project/pull/31#pullrequestreview-5816728981), `CHANGES_REQUESTED`, sobre `de788b7`. Se contrastó con el HEAD posterior `021ef67`; no se dio por resuelta la revisión solo por haber solicitado otra.

| Solicitud | Verificación y resolución |
|---|---|
| P1: bloquear copia entre monedas distintas | Seguía pendiente. Flujo compara la moneda de Estados con la de sus movimientos antes de persistir. Planeación compara con su base/supuestos antes de modificar cualquier campo del borrador. Si difieren, muestra un error y retorna sin copiar, guardar, convertir ni reconstruir el formulario. Se conservan incluso ediciones sin guardar. |
| P1: inventario reportado en EFE/EOAF | Ya corregido por `021ef67`. Se volvieron a ejecutar las regresiones: Baker incluye la disminución de inventario de 300000, EOAF 1000000/1000000 y EFE operación 780000. El lector reúne `reportedTotals` y cuentas por identidad y no duplica total/detalle. |
| P1: UN disponible en EFE | Ya corregido por `021ef67`. Se verificaron Baker 180000, Bartlett 231000 y Práctico 2 77000. Se distingue utilidad disponible de flujos que siguen siendo N/D por falta de desglose. |
| P2: activo total reportado como base de AV | Seguía pendiente: la guarda de depreciación anulaba el total aunque fuese reportado. Ahora afecta solo magnitudes que necesitan reconstruirse. El activo reportado conserva 1200 y AV del edificio 1000 es 83.333333… %. El subtotal no acreditado de activos fijos sigue N/D; no se compara un total con un detalle incompleto para inventar una discrepancia. Un PPE neto reportado también conserva su valor. |

La rama/commit local de Carlos `fix/afod-efe-y-moneda` / `36e301c` no existe entre las referencias disponibles de este clon tras `git fetch origin`. Se implementaron las dos solicitudes aún pendientes sobre el HEAD del PR, sin intentar incorporar un commit inaccesible ni duplicar las reparaciones ya presentes.

## Contratos preservados

Se aplican D-099 (total reportado independiente de su desglose) y D-100 (unidad monetaria explícita y sin conversión implícita). No se crea una política financiera nueva, no se cambia la fórmula del AV y no se declara completo el ejercicio para obtener el resultado. `monedaDe` es el lector existente: documentos legados sin moneda siguen C$. Planeación admite actualmente C$; no se añade conversión ni soporte de presupuestos USD por esta corrección.

El aviso de depreciación sigue presente cuando falta ese dato. Sus `campos` solo señalan las cifras que realmente quedaron N/D; una cifra reportada válida no se marca como indisponible. Sin total reportado y sin depreciación se conserva N/D. Un total explícito cero se conserva, y AV con denominador cero continúa N/D.

## Pruebas y revisión

Diez regresiones nuevas en `tests/unit/revision-carlos-pr31.test.js`: incompatibilidad USD/UM en los dos destinos; borrador editado conservado y guardado posterior; compatibilidad USD, C$ y legado; AV 1000/1200; total ausente/cero; PPE neto reportado. Se vuelven a ejecutar las 22 regresiones de la reparación anterior para verificar los dos puntos ya corregidos. Resultado dirigido: 32/32 aprobadas.

Edge reproduce exactamente la secuencia Estados Baker → Flujo MUNO → tomar 2011, y Estados Baker → Planeación MUNO con borrador editado → tomar balance. Confirma ausencia de escrituras incompatibles, conservación de campos y guardado posterior de 777/888. También registra el balance de Carlos y comprueba 83.33 % en la pantalla AV. Se usan servidor/perfil temporales, sin tocar los datos del usuario. Script: `revisar-revision-carlos.cjs`; evidencia: `revision-carlos-navegador.json`. Se repite además el script de 44 escenarios del catálogo.

Validación final: **2202 pruebas en 75 archivos, cero fallos; lint 0 errores y 10 advertencias anteriores**. Edge: tres casos dirigidos y 44 escenarios del catálogo, sin errores JS. [Constancia](revision-carlos-validacion.json).

Se responde a cada punto en el PR después de publicar el commit y se vuelve a solicitar revisión a `char-lie17`. No se marca la revisión humana como aprobada ni se integra el PR.
