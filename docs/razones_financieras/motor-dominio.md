## Razones conectadas a la app (D-050, D-056, ronda 18)

Análisis construye la entrada por ids desde los estados guardados y consulta el motor de los 20 JSON. Integración y Proforma reutilizan `computeRazones`; la utilidad neta de Análisis y Reportes usa el derivado `derived.net_income`. La composición de ingresos es una declaración por periodo persistida en Estados, con valor inicial `sin_declarar`, sin inferencia por rótulos ni importes.

Los documentos no normalizables no alimentan resultados y dejan `documento_no_normalizable`; las identidades no acreditadas anulan solo los conceptos dependientes. Los errores de composición se conservan como `composicion_no_declarada` o `composicion_incluye_intereses` por razón. Los motivos se adaptan a `{ campo, periodo, motivo, operandos }`, conservando el contrato de las pantallas.

Los JSON y su generado son la única fuente de las 20 razones. Apalancamiento, solvencia, rotación de capital de trabajo y la prueba defensiva preexistente conservan sus funciones actuales, con cifras de la misma entrada y N/D cuando falta un operando. Esta última también está fuera de los 20 JSON y se preserva para conservar su clave pública. Solo el formateador redondea. D-057 sincroniza las políticas del catálogo y D-058 registra la excepción de la regla 3.
