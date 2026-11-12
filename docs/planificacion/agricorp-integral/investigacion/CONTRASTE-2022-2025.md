# Contraste de 2022 y 2025 con los PDF originales

Tabla para revisar, contra el documento publicado, las cifras que la app carga para 2022 y 2025 en el caso «AGRI-CORP · consolidado» (`js/examples/ejemplos-agricorp.js`).

- **Valor en la app**: lo que carga el ejemplo, leído con `casoHistoricoReal()` y `computeFinancialTotals` el 12 de noviembre de 2026.
- **Investigación**: las tablas de [AGRICORP_estados_datos_y_supuestos.md](AGRICORP_estados_datos_y_supuestos.md) y [AGRICORP_flujos_e_inventarios_detallados.md](AGRICORP_flujos_e_inventarios_detallados.md). En todas las filas, el valor de la app es igual al de la investigación (diferencia 0).
- **PDF, página**: dónde está la cifra en el documento publicado. Las páginas son las numeradas en el documento; la del visor puede ser otra.
- **Revisado contra el PDF**: se marca al comprobar la cifra en el PDF. Hasta ahora nadie ha hecho ese contraste: la columna está vacía a propósito.

Cifras en C$. Los gastos del estado de resultados se cargan en positivo; el auditado los muestra con signo negativo.

## Documentos

| ID | Documento | Enlace |
|---|---|---|
| F01 | Estados consolidados auditados 2022 (presentación original de 2022) | [agricorp.com.ni](https://agricorp.com.ni/wp-content/uploads/2023/04/Agricorp_Informe_Consolidado_2022.pdf) |
| F02 | Estados consolidados auditados 2023, con comparativo 2022 | [invercasa.com.ni](https://invercasa.com.ni/wp-content/uploads/2025/05/Auditado-2023.pdf) |
| F04 | Estados consolidados auditados 2025 (BDO), con comparativo 2024 | [invercasa.com.ni](https://invercasa.com.ni/wp-content/uploads/2026/08/2025-Agricorp-Informe-consolidado-2025.pdf) |

Los tres enlaces respondían con un PDF (HTTP 200) el 12 de noviembre de 2026.

## 2022: columna comparativa de F02

La app usa F02 para 2022 porque es la presentación comparable con 2023. F01 presenta otro balance de 2022 (sección 3 de la investigación): activos y pasivos totales de 5,236,592,603 y 4,236,245,541, C$ 31,093,059 más que F02 en cada total, con el mismo patrimonio. No se ha confirmado la causa.

### Balance general (F02, p. 5)

| Concepto | Valor en la app | PDF, página | Revisado contra el PDF |
|---|---:|---|---|
| Efectivo | 230,869,144 | F02 p. 5 | |
| Cuentas por cobrar a clientes | 807,443,466 | F02 p. 5 | |
| Inventarios | 1,410,622,339 | F02 p. 5 | |
| Total activos | 5,205,499,544 | F02 p. 5 (F01 p. 5: 5,236,592,603) | |
| Préstamos por pagar, corriente | 1,682,185,298 | F02 p. 5 | |
| Proveedores | 453,159,401 | F02 p. 5 | |
| Total pasivos | 4,205,152,482 | F02 p. 5 (F01 p. 5: 4,236,245,541) | |
| Total patrimonio | 1,000,347,062 | F02 p. 5 y F01 p. 5 | |

### Estado de resultados (F02, p. 6)

| Concepto | Valor en la app | PDF, página | Revisado contra el PDF |
|---|---:|---|---|
| Ingresos de contratos con clientes | 8,342,024,681 | F02 p. 6 | |
| Costo de ventas | 7,086,559,300 | F02 p. 6 | |
| Gastos de mercadeo y ventas | 511,800,132 | F02 p. 6 | |
| Gastos de administración | 141,592,808 | F02 p. 6 | |
| Gastos de tráfico de almacenes | 185,810,532 | F02 p. 6 | |
| Otros gastos (incluye el pago mínimo; F02 no lo separa) | 117,936,673 | F02 p. 6 | |
| Otros ingresos | 37,087,853 | F02 p. 6 | |
| Subtotal antes de partidas financieras (la app lo calcula con las líneas anteriores) | 335,413,089 | F02 p. 6 | |
| Gastos financieros | 247,792,263 | F02 p. 6 | |
| Provisión para el impuesto sobre la renta | 50,786,334 | F02 p. 6 | |
| Utilidad neta consolidada | 12,128,644 | F02 p. 6 | |

### Flujo de efectivo (F02, p. 8) e inventario (F02, nota 12, p. 36)

| Concepto | Valor en la app | PDF, página | Revisado contra el PDF |
|---|---:|---|---|
| Efectivo neto de operación | −31,168,276 | F02 p. 8 (F01 p. 8: −71,605,688) | |
| Efectivo neto de inversión | −140,875,763 | F02 p. 8 (F01 p. 8: −67,827,336) | |
| Efectivo neto de financiamiento | 292,479,444 | F02 p. 8 (F01 p. 8: 259,868,428) | |
| Efecto de conversión | 323,599 | F02 p. 8 | |
| Efectivo al inicio / al final | 110,110,140 / 230,869,144 | F02 p. 8 | |
| Granza de arroz (materia prima) | 821,158,348 | F02 nota 12, p. 36 | |
| Inventario antes de deterioro | 1,412,682,659 | F02 nota 12, p. 36 | |
| Estimación por deterioro | 2,060,320 | F02 nota 12, p. 36 | |

## 2025: columna 2025 de F04

### Balance general (F04, p. 7)

| Concepto | Valor en la app | PDF, página | Revisado contra el PDF |
|---|---:|---|---|
| Efectivo y equivalentes | 149,251,171 | F04 p. 7 | |
| Cuentas por cobrar a clientes | 1,073,865,816 | F04 p. 7 | |
| Inventarios | 1,546,028,593 | F04 p. 7 | |
| Total activos | 5,279,969,842 | F04 p. 7 | |
| Préstamos por pagar, corriente | 1,525,967,690 | F04 p. 7 | |
| Porción corriente de préstamos a largo plazo | 215,833,203 | F04 p. 7 | |
| Proveedores | 644,576,373 | F04 p. 7 | |
| Total pasivos | 4,434,585,277 | F04 p. 7 | |
| Total patrimonio | 845,384,565 | F04 p. 7 | |

### Estado de resultados (F04, p. 8)

| Concepto | Valor en la app | PDF, página | Revisado contra el PDF |
|---|---:|---|---|
| Ingresos de contratos con clientes | 7,895,371,400 | F04 p. 8, nota 24 | |
| Costo de ventas | 6,461,733,590 | F04 p. 8, nota 25 | |
| Gastos de mercadeo y ventas | 640,070,996 | F04 p. 8 | |
| Gastos de administración | 143,295,077 | F04 p. 8 | |
| Gastos de tráfico de almacenes | 267,787,833 | F04 p. 8 | |
| Gasto por pago mínimo definitivo | 188,682,180 | F04 p. 8 | |
| Otros gastos | 18,652,400 | F04 p. 8 | |
| Otros ingresos | 21,102,886 | F04 p. 8 | |
| Subtotal antes de partidas financieras (la app lo calcula con las líneas anteriores) | 196,252,210 | F04 p. 8 | |
| Gastos financieros | 327,207,977 | F04 p. 8 | |
| Provisión para el impuesto sobre la renta | 57,425,953 | F04 p. 8 | |
| Pérdida neta consolidada | −157,990,498 | F04 p. 8 | |

### Flujo de efectivo (F04, p. 10) e inventario (F04, nota 12, pp. 47–48)

| Concepto | Valor en la app | PDF, página | Revisado contra el PDF |
|---|---:|---|---|
| Efectivo neto de operación | 37,782,108 | F04 p. 10 | |
| Efectivo neto de inversión (positivo aunque el rótulo diga «usado en») | 214,423,000 | F04 p. 10 | |
| Efectivo neto de financiamiento | −387,590,055 | F04 p. 10 | |
| Efectivo al inicio / al final | 284,636,118 / 149,251,171 | F04 p. 10 | |
| Granza de arroz (materia prima) | 902,648,496 | F04 nota 12, p. 47 | |
| Inventario antes de deterioro | 1,553,580,129 | F04 nota 12, p. 47 | |
| Estimación por deterioro | 7,551,536 | F04 nota 12, p. 48 | |

## Cómo reproducir los valores de la app

```js
// En la consola del navegador con la app abierta (http://127.0.0.1:8080).
const { casoHistoricoReal } = await import('/js/examples/ejemplos-agricorp.js');
const { computeFinancialTotals } = await import('/js/modules/estados/estados-calculations.js');
const e = casoHistoricoReal().estados;
computeFinancialTotals(e, '2022'); // totales de 2022
e.estadoResultados['2025'];         // cuentas del estado de resultados de 2025
```

Las pruebas `tests/unit/agricorp-estados-reales.test.js` fijan los activos, pasivos, patrimonio, ventas, utilidad neta y subtotal operativo de los cuatro años.
