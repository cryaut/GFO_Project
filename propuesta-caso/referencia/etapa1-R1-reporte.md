# Caso ficticio · Etapa 1 · Ronda 1

**Estado** · Ronda 1 con pendientes

**Fecha** · 5 de noviembre de 2026

**Empresa del ejercicio** · Comercial Ejemplo, S.A. (ficticia), una línea agregada y moneda C$

**Rama local** · `propuesta/etapa1-referencia`

## T0 · Línea base y archivos

La referencia parte de `origin/main` en `255b06823394a947c4c6f8e7f3cd023f39b3ec08`. El conector de GitHub confirmó ese SHA como base del PR #26. El cálculo usa Python y su biblioteca estándar, separado de la aplicación. En esta rama se prepararon `inputs.json`, `calculo_referencia.py` y este reporte en `propuesta-caso/referencia/`.

`referencia_resultados.json` y `tests/unit/fixtures/caso_ficticio_referencia.json` quedan pendientes de la tasa de 2025. El ensayo condicional se calculó en memoria y sus resultados se incluyen aquí para revisión.

## T1 y T2 · Entradas y cálculo

- `inputs.json` separa apertura, supuestos de los ejercicios ficticios de 2024 y 2025, proyección de 2026 y resultados manuales de control. Los importes son números JSON sin formato.
- La ronda declara el 30 % para 2024 y 2026. En 2025 declara el pago de C$46,600 y un impuesto causado esperado de C$53,100, pero omite la tasa. `historicos[1].tasa_impuesto` queda en `null` hasta confirmar el dato.
- El costo histórico por unidad permanece en C$100. La proyección conserva el valor de apertura y pondera las compras del mes, con C$108 por unidad comprada desde julio. Las fracciones de unidades resultan del objetivo de la línea agregada.
- El programa calcula y concilia con `fractions.Fraction`. Los calendarios distinguen cobros de CxC, pagos de CxP e impuesto. El préstamo recibido al cierre de junio devenga a partir de julio y el equipo de marzo se deprecia a partir de abril.
- Los valores manuales sirven para verificar los cierres después de calcularlos. La exportación redondea a dos decimales una sola vez, después de las comprobaciones exactas.

## T3 y T4 · Ejecución y cotejo

La ejecución se comprobó con Python 3.13.14. Con las entradas tal como están guardadas, valida la apertura y 2024 y se detiene en `2025 | Falta confirmar la tasa de impuesto.`

En un ensayo separado se asignó **30 % a 2025 solo en memoria**, usando como hipótesis la política de 2024. Esa ejecución reprodujo todos los importes manuales de 2024 y 2025 y aprobó los 17 controles. La hipótesis requiere confirmación antes de generar los archivos definitivos.

| Partida | 2024 | 2025 con tasa de prueba |
|---|---:|---:|
| Ventas | C$600,000.00 | C$714,000.00 |
| Costo de ventas | C$300,000.00 | C$340,000.00 |
| Utilidad antes de impuesto | C$122,000.00 | C$177,000.00 |
| Impuesto causado | C$36,600.00 | C$53,100.00 |
| Utilidad neta | C$85,400.00 | C$123,900.00 |
| Flujo de operación | C$70,000.00 | C$173,000.00 |
| Flujo de financiación | −C$30,000.00 | −C$40,000.00 |
| Efectivo final | C$80,000.00 | C$213,000.00 |
| Activos de cierre | C$350,000.00 | C$441,400.00 |
| Diferencia de balance exacta | C$0.00 | C$0.00 |

### Proyección condicional de 2026

| Concepto | Resultado |
|---|---:|
| Unidades vendidas | 3,660 |
| Ventas | C$805,200.00 |
| Compras | C$308,400.00 |
| Costo de ventas | C$380,300.04 |
| Utilidad antes de impuesto | C$216,241.96 |
| Impuesto causado | C$64,872.59 |
| Utilidad neta | C$151,369.37 |
| Flujo de operación | C$198,297.96 |
| Flujo de inversión | −C$60,000.00 |
| Flujo de financiación | C$18,000.00 |
| Caja mínima de los cierres | C$200,616.00 en enero |
| Efectivo final | C$369,297.96 |
| CxC final | C$67,980.00 |
| Inventario final | 75 unidades por C$8,099.96 |
| CxP final | C$21,870.00 |
| Impuesto por pagar final | C$6,338.55 |
| Deuda final | C$98,000.00 |
| Activo fijo bruto y depreciación acumulada | C$260,000.00 y −C$104,500.00 |
| Resultados acumulados finales | C$374,669.37 |

En diciembre se conservan dos cohortes de ventas a crédito. De noviembre quedan C$21,780 para enero de 2027. De diciembre quedan C$23,100 para enero y C$23,100 para febrero. El saldo de proveedores es la parte a crédito de diciembre y se paga en enero. El impuesto por pagar equivale al causado en diciembre y vence en enero.

Los doce balances cuadran exactamente antes de exportar. Los totales mostrados a centavos pueden presentar una diferencia de C$0.01 al volver a sumar partidas redondeadas. Se conserva la comprobación exacta.

## T5 y T6 · Fixture y matriz

El fixture se copiará del JSON que genere la ejecución completa después de confirmar la tasa. Los resultados de abajo distinguen los controles verificados con las entradas declaradas y los que se corrieron en el ensayo condicional.

| ID | Evidencia | Estado |
|---|---|---|
| E1-01 | Apertura de 2023 cuadra en C$300,000.00. | Conforme |
| E1-02 | Cierre de 2024 reproduce todos los importes manuales. | Conforme |
| E1-03 | Cierre de 2025 reproduce todos los importes manuales. | Condicional |
| E1-04 | Operación de C$70,000.00 y financiación de −C$30,000.00 en 2024. | Conforme |
| E1-05 | Operación de C$173,000.00 y financiación de −C$40,000.00 en 2025. | Conforme en el ensayo condicional |
| E1-06 | Diferencia de balance exacta igual a cero en los doce meses. | Condicional |
| E1-07 | Enero y febrero son los únicos meses sin compras. Sobran 447.5 y 155 unidades sobre los objetivos. | Condicional |
| E1-08 | Los diez meses con compras cierran con sus objetivos de inventario. | Condicional |
| E1-09 | Julio valora 360 unidades disponibles en C$38,300.00. El costo promedio es C$106.39 al mostrarlo. | Condicional |
| E1-10 | Los doce saldos de caja son positivos. | Condicional |
| E1-11 | CxC cierra en C$67,980.00 y concilia las cohortes de noviembre y diciembre. | Condicional |
| E1-12 | CxP cierra en C$21,870.00, el crédito de diciembre. | Condicional |
| E1-13 | Impuesto por pagar de C$6,338.55, igual al causado de diciembre. | Condicional |
| E1-14 | Deuda de C$98,000.00 después de recibir C$50,000.00 y amortizar C$12,000.00. | Condicional |
| E1-15 | Activo fijo bruto C$260,000.00 y depreciación acumulada −C$104,500.00. | Condicional |
| E1-16 | Resultados acumulados de C$374,669.37 después del dividendo. | Condicional |
| E1-17 | Caja final de C$369,297.96 conciliada con apertura y flujos. | Condicional |

## Reproducción y pendientes

El script lee `inputs.json` junto al archivo y escribe `referencia_resultados.json` en esa misma carpeta tras validar la matriz. Desde la raíz de la rama se ejecuta con Python 3.

```powershell
python propuesta-caso/referencia/calculo_referencia.py
```

Queda confirmar la tasa de impuesto de 2025, producir el JSON definitivo y su copia de fixture, y solicitar la reproducción a Cris o a la persona revisora que designe. La etapa 2 requiere su propia autorización.
