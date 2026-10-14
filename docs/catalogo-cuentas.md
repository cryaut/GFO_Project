# Catálogo inicial de cuentas e importación

Versión 1.0.0, 12 de octubre de 2026. Fuente ejecutable: `js/modules/estados/estados-catalogo.js`. El botón **Descargar catálogo JSON** permite consultar sus 35 cuentas, nombres alternativos y clasificaciones.

## Fuentes y alcance

La separación entre estado de situación financiera y estado de resultados, y entre activos, pasivos y patrimonio, toma como referencia [IAS 1, presentación de estados financieros](https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/) y las secciones 4 y 5 de [NIIF para las PYMES, texto oficial](https://www.ifrs.org/content/dam/ifrs/publications/ifrs-for-smes/english/2015/ifrs-for-smes-standard-part-a.pdf?bypass=on). Estas fuentes describen categorías de presentación; no establecen los alias en español que debe admitir GFO.

Los nombres alternativos y su traducción a los tipos del motor son decisiones del proyecto para sus ejercicios. No constituyen un plan de cuentas universal ni una certificación de cumplimiento de NIIF. El plazo de una deuda y la función de un gasto requieren contexto: **Préstamo bancario**, **Alquiler**, **Sueldos** o **Provisiones**, sin más información, se dejan pendientes en la revisión. Las clasificaciones finales corresponden al archivo o a la selección de la persona que lo revisa.

El catálogo reutiliza las categorías existentes de `ACCOUNT_TYPES`; las fórmulas y el esquema guardado no cambian. No se incorporaron automáticamente instrumentos, activos intangibles o partidas cuya naturaleza no está diferenciada en el motor actual. Ampliar esos tipos requiere revisar sus fórmulas y sus pruebas antes de añadir alias.

## Regla de reconocimiento

1. La clasificación explícita del archivo tiene prioridad si es válida para el grupo.
2. Se buscan coincidencias exactas del nombre principal o de sus alias, sin distinguir mayúsculas, acentos o espacios repetidos.
3. Dentro de un grupo identificado se conservan las reglas existentes del motor. La revisión muestra si la clasificación provino del archivo, del catálogo, de una regla o de una corrección manual.
4. Una cuenta desconocida o una contradicción entre estado y grupo queda pendiente. El usuario puede cambiar el nombre, asignar grupo y tipo o excluir la fila de forma explícita.

Se conserva el nombre original; los alias no fusionan automáticamente cuentas. Los duplicados con igual nombre normalizado, grupo y periodo bloquean la aplicación. La clasificación de una cuenta debe ser consistente entre periodos.

## Formato exacto del archivo

Plantilla descargable: `scripts/gfo-plantilla-estados.xlsx`. Incluye dos hojas con datos ficticios en córdobas, periodos 2023 y 2024 y estados de situación equilibrados. Reemplace los ejemplos por sus datos.

**Tabla ancha:** `Estado | Grupo | Cuenta | Clasificacion | 2023 | 2024`. Los nombres de las columnas de periodo empiezan con un año; por ejemplo, `2024-T1` también es válido. Para otros nombres de periodo use la tabla larga.

**Tabla larga:** `Periodo | Estado | Grupo | Cuenta | Clasificacion | Importe`.

- `Cuenta` es obligatorio. El encabezado puede aparecer dentro de las primeras 25 filas; la revisión avisa de las filas iniciales omitidas.
- `Estado`: **Estado de situación financiera** o **Estado de resultados**. También se admiten **Balance** y **Resultados**.
- `Grupo`: **Activos**, **Pasivos**, **Patrimonio** o **Estado de resultados**. En Resultados puede estar vacío.
- `Clasificacion`: un identificador del motor (`efectivo`, `cxC`, `inventario`, etc.) o uno de los nombres admitidos por el importador. Puede omitirse para reconocer o clasificar la cuenta durante la revisión.
- Una hoja llamada **Activos**, **Pasivos**, **Patrimonio** o **Resultados** aporta su grupo/estado si las columnas se omiten. En las otras hojas incluya esos campos o utilice cuentas identificables por el catálogo.
- Importes numéricos de Excel: se leen como números, independientemente del formato visible. En CSV o texto elija el separador decimal si es ambiguo. Se admite UTF-8, UTF-16 con marca de codificación y Windows-1252 con aviso.
- Una celda vacía es dato ausente; un cero se conserva. La depreciación acumulada debe ser negativa o cero. Los gastos del ejemplo se ingresan positivos.
- Las filas de totales y resultados intermedios reconocidos se excluyen y aparecen en la revisión. El resultado del ejercicio dentro del patrimonio se conserva como cuenta real. No se omiten totales desconocidos silenciosamente.
- Las hojas sin tabla se enumeran como excluidas. No se admite interpretar automáticamente un informe con columnas o filas de formato arbitrario.

Límites: **10 MB, 50 hojas, 5000 filas físicas acumuladas, 120 columnas, 20000 celdas de importes, 100 periodos y 200 cuentas por grupo y periodo**. Nombres de cuentas: hasta 120 caracteres; periodos: hasta 40. No se admiten claves reservadas que puedan alterar objetos JavaScript.

## Revisión y guardado

Importar abre una revisión independiente del borrador. Los problemas se reúnen por fila; los filtros, la búsqueda y las páginas de 30 filas permiten revisar archivos grandes. Se pueden corregir nombres, clasificaciones e importes o excluir filas. No se puede aplicar mientras haya problemas o no exista ningún importe.

**Aplicar al borrador** reemplaza el conjunto completo, con confirmación si había datos. **Guardar estados** publica el borrador para Análisis y Reportes. Un balance descuadrado se informa con su diferencia; no se ajustan importes para forzarlo. Cancelar o rechazar un archivo conserva los datos anteriores. Las lecturas antiguas que terminan después de una importación nueva se descartan.

Los respaldos JSON se validan con el contrato existente y también requieren aplicar antes de reemplazar el borrador. Un JSON estructuralmente inválido se rechaza; la corrección por filas corresponde a los formatos tabulares.

## Asistencia con IA

`estados-import-ia.js` contiene un estado deshabilitado, el contrato de petición para cuentas pendientes y una función que rechaza la ejecución. No se envían documentos ni se guardan claves. Un servicio futuro deberá devolver sugerencias de grupo, tipo y explicación por identificador; requerirán validación y revisión humana antes de aplicarse.

## Lector Excel local

SheetJS CE **0.20.3**, versión fija distribuida por su [CDN oficial y documentación de instalación](https://docs.sheetjs.com/docs/getting-started/installation/standalone/), se conserva en `assets/vendor/` con su licencia Apache 2.0. Así la lectura de Excel funciona sin red. SHA-256 de `xlsx-0.20.3.full.min.js`: `cc015130aa8521e7f088f88898eba949ccdcbfb38df0bd129b44b7273c3a6f41`.
