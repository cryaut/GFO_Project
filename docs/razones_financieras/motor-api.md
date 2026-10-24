## Motor de razones desde especificación JSON (D-050; rama de trabajo)

Módulos puros js/modules/razones/razones-motor.js y razones-presentacion.js. No leen DOM, store ni archivos; el generado especificacion-razones.js contiene todos los JSON. No están conectados a Análisis.

### crearEntradaRazones(datos, periodo, opciones = {})

Adapta datos normalizados de PR #14 a `{ cuentas, periodos, composicionIngresos }`. Cada cuenta conserva id, estado, origen, grupo/tipo, candidatos y valores current/previous que existan. Las claves originales solo enlazan metadatos; no se buscan nombres financieros. Una fila sin identidad se conserva para revisión. `periodos` contiene actual, anterior (null si no existe), cantidad e indice. `opciones.composicionIngresos` declara por token current/previous si otros ingresos excluye intereses; una declaración incluye_intereses provoca error de entrada al leer la cuenta de otros ingresos. La composición se exige para cualquier importe numérico explícito, incluido cero; los importes por sí solos no acreditan composición. La ausencia de esa línea conserva su política declarada de ausencia, sin fabricarla desde un monto null.

### calcularRazon(id, entrada, opciones = {}, especificacion = ESPECIFICACION_RAZONES)

Devuelve `{ valor: number|null, metodo, motivos }` para el periodo actual. Opciones acepta el booleano mostrar_calculo_directo_primer_periodo (false por defecto). Métodos: average, direct_closing o not_applicable en N/D. Motivos incluyen codigo, id/periodo o archivo/ruta; pendientes añaden camposAfectados por dependencia. Errores de esquema, ciclos y composición de entrada se lanzan; datos ausentes y denominador cero devuelven N/D. No modifica entrada ni especificación y no redondea. El último argumento permite especificaciones sintéticas en pruebas, sin editar los JSON reales.

### calcularRazonConTraza(id, entrada, opciones = {}, especificacion = ESPECIFICACION_RAZONES)

Devuelve `{ resultado, agregaciones, lecturas }`. Resultado conserva el contrato anterior. Agregaciones es un arreglo vacío por compatibilidad; lecturas enumera una lectura por id y periodo con su valor. La suma de intereses pertenece al árbol JSON, sin agregación automática por `agrupadoEn`.

### evaluarDerivado(idRazon, idDerivado, entrada, opciones = {}, especificacion = ESPECIFICACION_RAZONES)

Consulta un nodo derivado de la especificación, con el mismo contrato valor/metodo/motivos. Permite comprobar activos y utilidad del ejemplo v3 directamente desde los árboles. No aplica la compuerta de primer periodo de una razón completa a un subtotal aislado de cierre.

### revisarEntradaRazones(entrada)

Enumera filas sugeridas, no reconocidas o con id desconocido para revisión, incluso con saldo cero. Un saldo cero no anula resultados; un importe o null pendiente se acota según candidatos, grupo y tipo a los campos posibles del periodo correspondiente.

### calcularRazones(entrada, opciones = {}, especificacion = ESPECIFICACION_RAZONES)

Devuelve `{ razones: { [id]: resultado }, revision }`; cada resultado mantiene el contrato individual. Resuelve dependencias declaradas antes que consumidores y rechaza ciclos.

### formatearResultadoRazon(id, resultado, especificacion = ESPECIFICACION_RAZONES)

Presenta el valor completo según unidad y presentacion del JSON: decimales, separadores y sufijo de porcentaje. Null se muestra como N/D. Solo esta capa redondea; no modifica resultado.valor.
