# Comparación con las presentaciones y cambios aplicados

Las fuentes se leyeron antes de modificar la aplicación. Las referencias están en `../TEAM.md/PRESENTACIONES_AFOD/PRESENTACIONES_AFOD/`; se conserva el material original.

| Estado / sección | Presentación y diapositivas | Antes | Resultado local |
|---|---|---|---|
| Estado de resultados | Sesión 3, 21–25; Proforma, 9 | Filas en orden de importación; subtotales ausentes o apartados | Ventas y deducciones, ventas netas, costo, UB, ingresos/gastos operativos, UAII, otros resultados/intereses, UAI, impuesto y UN. Las cuentas originales permanecen, con +, − y =; los subtotales aparecen junto al detalle |
| Etiquetas | Apalancamiento y C-V-U, 4–7 | Podía faltar el resultado operativo dentro del estado | Utilidad operativa (UAII) y utilidad antes de impuestos (UAI). UN mantiene la nomenclatura existente; corresponde a utilidad después de impuestos (UDII) de la diapositiva. No se cambia el ER comercial por el enfoque margen de contribución de Apalancamiento |
| Balance general | Proforma, 10; Estados Básicos, 8 | Grupos y resumen de totales separados | Activos corrientes y subtotal; activos fijos/depreciación y neto; total activos; pasivos corrientes y largo plazo; total pasivos; patrimonio y total; total pasivos + patrimonio. La depreciación acumulada conserva signo negativo |
| AH/AV | Lectura de los mismos estados resueltos | Solo filas importadas | Incluyen detalle y subtotales, sin duplicar un reportado. AH alinea el mismo subtotal entre periodos y muestra origen por columna; AV conserva las bases activo total / ventas netas y la convención Δ/abs(T1) pertenece a AH |
| EFE indirecto | Flujo, 7–17 | Secciones y comprobaciones existentes; saldo observado y flujos podían leerse sin un cierre calculado separado | Conserva operación, inversión y financiamiento. Presenta total de flujos, efectivo inicial, cierre calculado y saldo observado por separado; no oculta un descuadre ni transforma estimaciones en movimientos confirmados |
| EOAF | Documentación vigente del módulo | Ya mostraba cuentas, subtotales, orígenes/aplicaciones y comprobación | Conservado; se verificó su render junto a los estados nuevos. No se le atribuye a una imagen sin transcripción una convención adicional |
| Flujo directo y Proforma | Flujo, 11–17; Proforma, 9 y siguientes | Ya muestran su secuencia de actividades/cierre y UB/UAII/UN respectivamente | Se revisan y se conservan sus cálculos y estructuras; no se reemplazan por datos reconstruidos desde el ER |
| Cambios en patrimonio | Estados Básicos, 2–3 | Sin captura independiente de movimientos de patrimonio | No se fabrica un estado completo a partir de dos saldos. Los detalles del patrimonio y sus totales siguen visibles; reservas, aportes y dividendos requieren sus movimientos para acreditarse |

## Ejemplos y convenciones

La Sesión 3, diapositiva 22, resuelve julio: 72000 − 42000 = UB 30000; menos gastos 19000 = UAII 11000; menos intereses 1000 = UAI 10000; menos impuesto 3000 = UN 7000. Las pruebas usan esos operandos. Los ceros de partidas adicionales, la distribución técnica de gastos y los periodos de dos columnas son **sintéticos y explícitos** para satisfacer el contrato de datos de la app; no se atribuyen al profesor. La diapositiva de Vectra usa 15 % y la Sesión 3 usa 30 %: ninguna tasa se aplica automáticamente a un archivo importado.

Un impuesto ausente o vacío deja UN en N/D y conserva UAI si los demás operandos están acreditados. Un cero explícito sigue siendo cero. Un reportado se conserva con su importe y nombre; un motivo de discrepancia se muestra como «Revisar». Los datos faltantes no se suplen para forzar coincidencias. Se mantienen las políticas explícitas del catálogo, incluidas las ausencias opcionales definidas allí; no se agregan políticas nuevas.

El ER usa los mismos derivados que Razones/DuPont, incluidos gastos e ingresos operativos acreditados por id que no tienen tipoApp general. Se corrigió además que un ingreso operativo conocido anulara indebidamente la base de ventas netas de AV: el concepto de base es el mismo; su disponibilidad ahora proviene de esa lectura. La prueba específica falla antes de corregirlo. Esto no modifica el totalizador legado usado por otros consumidores ni el motor/generado.

## Evidencia y límites

El script `revisar-visual.cjs --antes` sirve las versiones de JS/CSS del main inicial fijado a `19c5c6f`, con un perfil desechable: reproduce la ausencia de UB en el editor. Sin argumento comprueba la rama local: UB en su posición, cambios de gasto sin perder foco, impuesto vacío, exportación y guardado sin cuentas calculadas, y 30 escenarios de tamaño/tema/vista. Los servidores y navegadores se cierran. No se usa el perfil ni los datos del usuario.

Las regresiones cubren pérdidas, ceros, N/D, nombres propios, escape HTML, subtotales reportados, entradas inmutables, AH/AV y cierre del EFE distinto del observado. El EFE oficial **no fue comparado con la clase**, porque su ejemplo carece de BG/ER completos. La aplicación no crea cuentas de cierre patrimonial, tasas, pagos o dividendos que falten en el archivo. No se ejecuta AFOD R2.

La entrega se queda en una rama local desde origin/main; sin push ni PR. D-096 registra la decisión de presentación y sus fuentes.
