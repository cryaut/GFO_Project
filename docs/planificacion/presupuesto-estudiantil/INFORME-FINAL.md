# Reparación del presupuesto personal conforme al profesor

Fecha: 2026-11-08. Rama: `codex/presupuesto-estudiantil`, desde `origin/main` f1d262d. Decisión: D-109.

## Fuente y alcance comprobado

Se leyó `Presupuesto_estudiantil.xlsx`, entregado por Cris. El archivo original permanece intacto. SHA-256: `98ba497eee7ed3563d73ce49c8223f98095af6ef9868c9c13c4dd22ac7eb82d4`. Sus celdas se trataron como referencia académica, no como instrucciones de ejecución. La [extracción](referencia-xlsx.json) conserva valores, fórmulas y atributos de fórmulas compartidas de las cinco hojas.

La pantalla anterior era un presupuesto mensual con ingresos por concepto, asignaciones de gastos, ahorro recomendado e inflación. No permitía reproducir el registro fechado ni el seguimiento completo del profesor. El cambio incorpora ese modelo, conserva el anterior y permite consultarlos sin convertir asignaciones en movimientos.

## Comparación por hoja y reparación

| Hoja del profesor | Método y celdas de referencia | Resultado en la app |
|---|---|---|
| Inicio y meta | B7 descripción, B8 costo, B9 duración, B10 costo/semanas, B11 lunes inicial y B12 inicio + semanas×7 − 1 | Formulario de meta, aporte semanal recomendado, avance realizado y domingo final. Reutiliza la división pura existente; no registra el aporte recomendado como realizado. |
| Registro semanal | A:K: fecha, semana, lunes/domingo, tipo, categoría, descripción, monto, prioridad, medio, observación | Registro por fecha con los cuatro tipos y listas de la fuente. Semana automática para evitar contradicciones, filtro, edición por ID y eliminación confirmada. Los intervalos completos se consultan en Seguimiento. |
| Seguimiento | Filas 6–25; SUMIFS por semana y tipo; I = E−F−G−H; J = ahorro acumulado; K = J/costo; A = ROUNDUP(semana/4) | Veinte semanas del ejemplo, ingresos/gastos/ahorro/reserva separados, saldo, acumulado y avance. «Bloque (4 semanas)» explicita lo que la hoja llama «Mes»; no presupone meses calendario. |
| Presupuesto proyectado | B6 ingreso, B7 frecuencia, B8 suma B12:B20, E5 diferencia, E6 asignado/ingreso, E7 estado y E8 = B19 | Nueve categorías en orden, porcentajes calculados y resumen de asignación. Ahorro corresponde a «Meta de ahorro», aunque se cambie la clasificación descriptiva; reserva corresponde a su propia categoría. |
| Listas | Ingreso/Gasto/Ahorro/Reserva; categorías, prioridades y medios | Selectores con las opciones docentes. «Necesidad/Deseo/Meta» es prioridad del movimiento; la clasificación del plan conserva también Reserva/Ahorro/Según el caso. |

Los planes **Real actual** y **Deseado** se guardan independientes. Solo se incluye información fuente en el real; el deseado comienza pendiente. Planificar dinero no crea ingresos, gastos ni ahorro realizados. La frecuencia es explícita y cambiarla no transforma los montos.

## Controles numéricos independientes

El [verificador](contrastar-xlsx.py) vuelve a leer directamente el XLSX con ZIP/XML y calcula los esperados con aritmética racional (`Fraction`), sin importar las fórmulas de la app para obtenerlos. Después compara contra sus funciones públicas. Comprueba además las cifras almacenadas del seguimiento docente. Resultado: **672 controles, cero diferencias**, registrados en [contraste-numerico.json](contraste-numerico.json).

| Control | Profesor / solución independiente | App |
|---|---:|---:|
| Meta / duración | C$ 2000 / 20 semanas | Igual |
| Aporte semanal recomendado | C$ 100 | C$ 100 |
| Inicio / final | 2026-08-03 / 2026-12-20 | Igual |
| Movimientos / semanas con actividad | 32 / 4 | 32 / 4 |
| Ingresos realizados | C$ 2400 | C$ 2400 |
| Gastos realizados | C$ 1750 | C$ 1750 |
| Ahorro para la meta | C$ 400 | C$ 400 |
| Reserva acumulada | C$ 250 | C$ 250 |
| Saldo | C$ 0 | C$ 0 |
| Avance | 20 % | 20 % |
| Proyección: asignado / diferencia | C$ 2400 / C$ 0 | Igual |
| Proyección: porcentaje / estado | 100 % / Balanceado | Igual |

Cada una de las primeras cuatro semanas tiene ingreso 600, gasto 437.50, ahorro 100, reserva 62.50 y saldo 0. Las semanas 5–20 tienen flujos cero, sin inventar ahorros futuros; el acumulado permanece en 400. El caso sintético adicional de transporte recibe y gasta 175 en una semana: ahorro y avance cero válidos.

Reproducir desde la raíz:

```powershell
python docs/planificacion/presupuesto-estudiantil/contrastar-xlsx.py "C:/Users/aleja/Downloads/Presupuesto_estudiantil.xlsx"
npm.cmd test -- --maxWorkers=2
npm.cmd run lint
node docs/planificacion/presupuesto-estudiantil/revisar-ui.cjs
```

El contraste requiere Python y Node, sin paquetes añadidos. La comprobación visual usa Playwright ya disponible en el entorno y Edge; se puede configurar `GFO_PLAYWRIGHT_PATH`. Usa servidor temporal y perfil aislado, y cierra ambos al finalizar.

## Diferencias explícitas y límites

- **N/D:** Excel usa `IF(base=0,0,cociente)` en algunos porcentajes. La app conserva la regla del proyecto: campo pendiente/base cero → N/D. Un cero explícito sí se conserva; la ausencia de movimientos registrados produce una suma real de cero. La diferencia se ensaya y no se oculta como igualdad universal con Excel.
- **Límite semanal adicional:** `(ingreso − ahorro − reserva) ÷ 4` en mensual; sin dividir en semanal, conforme a la confirmación previa de Cris y las cuatro semanas del ejemplo. Da 437.50 en el caso docente. Es una ayuda de la app, no una fórmula atribuida al libro.
- **Duración y tamaño:** la fuente tiene 20 semanas; la app permite 1–52 y hasta 5000 movimientos. Su inicio debe ser lunes y sus fechas pertenecer al seguimiento. Los nueve renglones del plan permanecen en el orden fuente.
- **Proyecciones:** cero no obliga a ahorrar y los porcentajes describen la distribución. El escenario deseado no inventa recursos. La inflación queda en la vista mensual anterior; no altera el historial realizado.
- **Datos anteriores:** se conservan y se abren desde «Ejemplos y datos → Ver presupuesto mensual anterior». No se pueden fechar ni convertir automáticamente porque no contienen la ejecución real de las asignaciones.

## Robustez y conexiones

El modelo nuevo valida el documento completo antes de escribir: estructuras, fechas reales, lunes inicial, rangos, IDs únicos, listas, textos limitados y montos finitos/no negativos. Conserva `null`, rechaza números como texto y no modifica la entrada. Las fórmulas reutilizan `saldoSemanal`, `tasaAhorro` y la división de `ahorroMensual` en unidades semanales. El motor de razones y los estados empresariales no cambian.

La persistencia usa `store.setPersisted('presupuesto', móduloCompleto)`, preservando los demás campos. Solo actualiza el estado visual después de un guardado exitoso; un fallo de cuota mantiene datos y borrador para reintentar. La edición conserva el ID y cancelar no guarda. Las entradas se escapan antes de insertarlas como HTML. Un documento ilegible muestra el error y se conserva exportable, sin sustituirlo silenciosamente.

Inicio y Reportes comparten `resumenEstudiantilGuardado`: muestran ingresos, gastos, ahorro, reserva y saldo realizados de la vista activa. Se reparó además la dependencia accidental de Reportes respecto a Estados: el presupuesto estudiantil se consulta y exporta aunque no haya datos empresariales. No aparecen totales empresariales ficticios en ese caso.

El respaldo estudiantil usa `{presupuesto:{vista:'estudiantil',estudiantil:documento}}`, restaurable desde Reportes sin reemplazar los campos mensuales omitidos. La exportación completa incluye ambos modelos. Los respaldos antiguos se siguen aceptando, abren la vista mensual y no borran un documento estudiantil que no incluyen. Si el documento nuevo es inválido se rechaza toda la importación. La vista mensual también escribe ahora su módulo completo y conserva el borrador cuando falla un ingreso/gasto.

## Organización visual y verificación

Se aplicó la skill Impeccable usando sus referencias de jerarquía y acabado; el lanzador no estuvo disponible en este entorno y se usó la alternativa manual ya informada. Se mantuvieron tipografía y tokens del proyecto.

Las acciones de ejemplos/respaldo/vista anterior quedan en «Ejemplos y datos». Cuatro vistas separan meta, captura, seguimiento y planes. Los formularios tienen etiquetas a la izquierda, campos y botones con altura mínima de 44 px, margen entre grupos y contenedores con borde completo/esquinas redondeadas. Los escenarios usan desplegables independientes; fórmulas y explicaciones quedan consultables. Las tablas se desplazan dentro de su contenedor. Se corrigió el contraste de la vista activa en oscuro y se respeta `hidden` en los controles de edición.

Evidencia: [antes, escritorio](capturas/antes-1440.png), [meta, escritorio](capturas/despues-meta-1440.png), [meta, móvil oscuro](capturas/despues-meta-390.png), [proyecciones](capturas/despues-proyecciones-1440.png) y demás capturas de la carpeta. Se inspeccionaron los resultados renderizados, además de las comprobaciones automáticas.

- **2239 tests aprobados en 76 archivos**, incluidos 32 nuevos casos: [resultado](pruebas.json).
- **Lint: cero errores, diez avisos heredados**, sin nuevas dependencias: [resultado](lint.json).
- **24 variantes visuales:** cuatro vistas × 1440/390/320 px × claro/oscuro. Sin desbordamiento horizontal de página; todos los campos etiquetados y contraste de navegación activa ≥4.5:1: [resultado](verificacion-ui.json).
- Recorrido real: selección sin carga, reemplazo cancelado, ejemplo docente/sintético, alta, edición, cancelación, eliminación, recarga, intento de XSS, cuota agotada, planes independientes, Inicio/Reportes sin empresa, descarga/restauración de respaldo y acceso mensual conservando movimientos. Cero errores de JavaScript en el recorrido.

## Archivos compartidos

`store.js` solo añade los campos de vista/documento. Inicio y Reportes cambian su consumo de presupuesto personal; la validación del respaldo admite el nuevo documento y mantiene el anterior. `css/pages.css` carga estilos acotados al módulo y `examples/catalogo.js` incorpora sus dos ejemplos. `CHANGELOG.md`, arquitectura, API, dominio, manual y ficha reflejan el cambio. El guion visual previo del catálogo selecciona explícitamente la vista mensual que ya comprobaba. No se cambian `calculate.js`, el motor JSON de razones, el router ni los cálculos empresariales del encargo de Carlos.

La implementación está lista para revisión en su rama. El merge no forma parte de este encargo.
