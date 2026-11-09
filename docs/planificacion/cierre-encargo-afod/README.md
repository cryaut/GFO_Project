# Cierre de las entregas AFOD

- **Base** · `f1d262d`, merge del PR #31.
- **Dependencia** · PR #33, valoración mensual de Comercial Ejemplo.
- **Estado** · Implementación y contraste de los casos verificables con las premisas disponibles.

## Casos

| Caso | Procedimiento y resultado |
| --- | --- |
| Euro Designs | Proforma por porcentaje de ventas. Utilidad neta USD 577,200 y adición a retenidas USD 257,200. |
| Metroline | Se muestran porcentaje de ventas y fijo/variable por separado. Utilidades netas USD 216,857.14 y USD 227,400.00. |
| Leonard | Balance por partida. Activos USD 1,383,000 frente a pasivo y patrimonio por USD 1,330,000. La brecha es USD 53,000. Con dividendos de USD 17,000 el balance cuadra. |
| La Pinolera | Dos calendarios de julio a diciembre, con cohortes de mayo/junio y pagos de IR y seguro en sus fechas. El caso 1 requiere C$14,150 en septiembre y el caso 2 mantiene el mínimo. |
| Halley | Reconstrucción identificada. Saldo de diciembre de USD −16,000 antes de un préstamo adicional, USD 60,000 al declarar el préstamo y USD 25,000 al declarar también el repago. |
| Bella Vista | El suplemento explícito de 5,000 por dividendos en acciones deja aporte de efectivo 5,000 y dividendo en efectivo 21,000. La caja final sigue en 82,500 UM. |
| Dayton y Exportaciones Electrónicas | La UAI acreditada se muestra en Estados, AH, AV y Proforma, con aviso si no puede comprobarse su desglose. |
| Mundo Moda y La Grandiosa | Se conserva el signo de los componentes patrimoniales confirmados. |

Los ejercicios de Proforma usan escenarios temporales separados del histórico y del presupuesto guardado. Planeación guarda el calendario docente como parte del módulo y conserva los supuestos del presupuesto maestro. El calendario distingue impuestos pagados, amortización programada y operaciones adicionales de financiamiento.

## Transferencias

| Origen → destino | Contrato |
| --- | --- |
| Estados → Flujo | Efectivo por identidad y periodo. Copia guardada de forma atómica; la edición manual retira su procedencia. |
| Estados → Planeación | Efectivo, CxC y CxP del periodo elegido. Se aplican únicamente campos seleccionados y disponibles al borrador. |
| Inventario → Planeación | Copia editable de existencia y costo promedio. El stock mínimo sigue vinculado al producto vigente. |
| Planeación → C-V-U | Precio y unidades de un periodo explícito, con costos calculados en el presupuesto completo si están disponibles. |
| Inventario → C-V-U | Costo promedio únicamente si el usuario confirma que representa el costo variable unitario de la misma línea. |
| Estados → Análisis, Apalancamiento y Proforma | Lecturas en vivo del histórico guardado con empresa, periodo y procedencia visible. |
| Planeación → Proforma, Inicio y Reportes | Lectura en vivo del mismo presupuesto validado. Reportes incluye los importes de proyección y los motivos N/D que entrega Proforma. |

La vista previa incluye valor actual, propuesto, unidad y naturaleza. Antes de aplicar se vuelve a leer el origen. La procedencia registra una revisión por campo. Si cambia la fuente después de guardar, se avisa al usuario. El respaldo reconoce la metadata opcional y valida la caja docente sin exigir esos campos a los respaldos anteriores.

## Límites verificados

- Halley carece de la página 163 y la escala de los saldos 50 y 25 se reconstruye como miles de USD. La app identifica esa interpretación.
- La Grandiosa reporta 27,053.44 UM de pasivo corriente. El detalle suma 27,054.24 UM. El sistema conserva el total publicado y la evidencia separa las razones afectadas.
- B.G. S.A. sigue con una restricción al importar su provisión negativa de 1,200 UM. Su contraste usa los totales informados y la fila queda marcada como pendiente de soporte para la cuenta correctora de CxC.
- La proyección residual de Exportaciones Electrónicas tiene referencia independiente. La carga de escenarios de crédito proyectado y su reproducción completa quedan por incorporar.

## Verificación

Las pruebas dirigidas cotejan los cinco calendarios, los cuatro métodos o variantes de Proforma, el dividendo no monetario y la UAI por identidad. La matriz de las 16 fuentes y el comparador conservan el origen, los valores esperados, los valores observados y las diferencias. El reporte de cierre relaciona esa evidencia con el commit probado.
