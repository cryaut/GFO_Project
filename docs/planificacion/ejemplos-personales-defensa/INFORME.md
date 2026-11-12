# Ejemplos personales para la defensa

Se incorporan los nueve Excel y el Word de `presupuestos_activos.zip`: cinco presupuestos y cinco inventarios. Cada opción aparece con el nombre del integrante en «Ejemplos y datos». Los archivos originales se leen como datos; sus actividades no se ejecutan como instrucciones.

## Conservación de la información

Se conservan todas las hojas, celdas con contenido, fórmulas, resultados guardados, columnas, secciones, orden, celdas combinadas, comentarios y enlaces. El Word conserva sus párrafos y doce tablas de bienes en su orden original. El SHA-256 identifica cada archivo recibido. No se instalan dependencias nuevas ni se cambian los demás ejemplos.

Cada ejemplo con archivo tiene una vista propia dentro de su módulo. Las hojas se eligen por su nombre. Las tablas se desplazan dentro de su contenedor; las filas vacías de la plantilla se pueden mostrar. Seleccionar una celda permite consultar su fórmula o editar su dato. Se pueden registrar movimientos, añadir/eliminar activos en los inventarios de Excel y editar los datos de las tablas de Gabriel. El respaldo conserva el documento completo y el inventario que usa Inicio.

El intérprete admite únicamente la notación y funciones necesarias para los archivos recibidos, con límites de referencias y operaciones. No usa eval, JavaScript dinámico, macros ni llamadas externas. Las expresiones originales se recalculan; las funciones existentes de depreciación y saldo sirven para contrastar resultados sin crear un segundo motor financiero.

## Presupuestos comprobados

| Integrante | Ingresos | Gastos | Ahorro | Reserva | Saldo del archivo |
|---|---:|---:|---:|---:|---:|
| Cris Angel Lumbí Rodríguez | 6965 | 3780 | 2310 | 280 | 805, incluido ajuste de 210 |
| Carlos Castillo | 2100 | 1420 | 620 | 60 | 0 |
| Juan Pablo Sirias Espinoza | 12000 | 10290 | 1200 | 510 | 0 |
| Henry David Lopez Sanchez | 9000 | 6460 | 1500 | 900 | 140 |

Gabriel Eduardo Segovia Fonseca declara planes de gastos de C$7900, C$5740 y C$6040 para agosto, septiembre y octubre. Cada total incluye C$900 de ahorro. No declara ingresos ni movimientos realizados: no se inventan para completar el módulo.

## Activos comprobados

| Integrante | Bienes | Costo original | Valor en libros |
|---|---:|---:|---:|
| Carlos Castillo López | 33 | C$234900 | C$78096.43 |
| Juan Pablo Sirias Espinoza | 18 | C$1115100 | C$830824.05 |
| Cris Angel Lumbí Rodríguez | 20 | C$187600 | C$71504.53 |
| Henry David Lopez Sanchez | 33 | C$258400 | C$84563.21 |
| Gabriel Eduardo Segovia Fonseca | 12 | $4955 | $3649 |

Gabriel utiliza $ sin identificar expresamente la moneda. No se convierte a córdobas; Inicio conserva UM. Se mantienen las condiciones, clasificaciones y recomendaciones escritas, sin fabricar ocho puntajes de condición.

## Diferencias de los originales que se mantienen visibles

- Cris: 30/07/2026 es jueves, aunque la etiqueta dice lunes. Se conservan fecha y cortes originales. `Seguimiento!I10` contiene `=E10-F10-G10-H10+210`. El saldo de movimientos es 6965−3780−2310−280 = 595; el original suma el ajuste explícito de 210 y presenta 805. La app conserva ambos resultados y no inventa un movimiento para explicar el ajuste.
- Carlos usa tres meses y cuatro cortes por mes. No se transforma su plazo en semanas ni se impone el calendario de otro ejemplo.
- Henry y Juan tienen cortes propios, incluidos cierres de mes; no se fuerzan a lunes–domingo.
- Gabriel usa 30 días y cuatro semanas para sus proyecciones, incluso en agosto y octubre. Se conservan los supuestos declarados.
- El Word de Gabriel dice que dos muebles superaron su vida útil, pero sus edades de 15 años están exactamente en el límite de 15. También dice nueve de doce dentro de su vida útil: hay diez estrictamente dentro y dos en el límite. El texto original se conserva y se avisa de la diferencia.
- Algunas multiplicaciones escritas usan cuotas anuales redondeadas: 71.67×2 no es 143.33. Las funciones de la app conservan precisión interna y reproducen los importes finales del documento. Cris sí declara ROUND en su Excel; se respeta su redondeo por resultado.

## Verificación

- 4302 fórmulas de nueve Excel recalculadas; cero diferencias con los resultados que estaban guardados. 166 fórmulas de Cris no tenían resultado almacenado: se evalúan desde su expresión original.
- Los 116 bienes se contrastan con las funciones existentes, incluidos los doce del Word.
- Suite completa: 2488 pruebas en 91 archivos, aprobadas. Después de los últimos ajustes de Inicio/Reportes, 55 pruebas específicas aprobadas. Lint: cero errores y diez advertencias preexistentes.
- Navegador aislado: 54 comprobaciones aprobadas, diez ejemplos, todas sus hojas, 1440 y 390 px, tema oscuro, edición, altas/bajas, recarga, descarga y regreso a los ejemplos anteriores. Sin errores JavaScript ni desborde horizontal persistente. Las capturas se realizan cuando termina la transición del menú.
- OCR local de Windows y revisión visual sobre capturas de escritorio, móvil y cálculos. Evidencias temporales fuera del repositorio.

Los cambios están en `codex/ejemplos-personales-defensa`, creada desde `origin/main` ab0ef68. No se modifica main ni se integran otras ramas en esta entrega.
