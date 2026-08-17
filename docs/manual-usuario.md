# Manual de Usuario — GFO Toolkit

Guía paso a paso con ejemplos numéricos concretos por módulo.

---

## Tabla de Contenidos

1. [Inicio Rápido](#1-inicio-rápido)
2. [Módulo 1: Presupuesto Personal](#2-módulo-1-presupuesto-personal)
3. [Módulo 2: Estados Financieros](#3-módulo-2-estados-financieros)
4. [Módulo 3: Análisis Financiero](#4-módulo-3-análisis-financiero)
5. [Módulo 4: Activos y Depreciación](#5-módulo-4-activos-y-depreciación)
6. [Módulo 5: Mercados Financieros](#6-módulo-5-mercados-financieros)
7. [Módulo 6: Reportes e Integración](#7-módulo-6-reportes-e-integración)

---

## 1. Inicio Rápido

1. Abre `index.html` en tu navegador (o sirve con `python3 -m http.server 8000`).
2. Usa el menú lateral para navegar entre módulos.
3. Activa el modo oscuro con el botón en la parte inferior del sidebar.
4. Todos los datos se guardan automáticamente en localStorage.

---

## 2. Módulo 1: Presupuesto Personal

### 2.1 Definir ingreso y meta de ahorro

**Paso 1:** Ingresa tu ingreso mensual.

| Concepto | Valor |
|----------|-------|
| Ingreso mensual | C$ 12,000 |

**Paso 2:** Define tu meta de ahorro y el plazo.

| Concepto | Valor |
|----------|-------|
| Meta de ahorro | C$ 3,000 |
| Meses disponibles | 12 |

**Resultado automático:**

```
Ahorro mensual = Meta ÷ Meses = C$ 3,000 ÷ 12 = C$ 250
```

La herramienta calcula C$ 250 como el monto que debes separar cada mes antes de cualquier gasto ("pagarse primero").

### 2.2 Clasificar gastos

Ingresa tus gastos del mes y asígnalos a una categoría:

| Gasto | Categoría | Monto |
|-------|-----------|-------|
| Alimentación | Necesidad | C$ 3,500 |
| Transporte | Necesidad | C$ 1,200 |
| Universidad | Necesidad | C$ 1,500 |
| Renta | Necesidad | C$ 2,500 |
| Salida con amigos | Deseo | C$ 800 |
| Ropa nueva | Deseo | C$ 600 |
| Emergencia médica | Imprevisto | C$ 400 |
| Ahorro (meta) | Meta | C$ 250 |

### 2.3 Verificar el balance

```
Total ingreso:   C$ 12,000
Total gastos:    C$ 10,750
Ahorro:          C$   250
Reserva:         C$     0
─────────────────────────
Saldo semanal:   C$ 1,000
```

La herramienta valida que `gastos + ahorro ≤ ingreso`. Si excedes el ingreso, se muestra una alerta.

### 2.4 Control semanal

Cada semana, registra tus gastos reales. El sistema calcula el saldo acumulado:

| Semana | Ingreso | Gastos | Ahorro | Saldo |
|--------|---------|--------|--------|-------|
| Sem 1 | C$ 3,000 | C$ 2,688 | C$ 63 | C$ 250 |
| Sem 2 | C$ 3,000 | C$ 2,688 | C$ 63 | C$ 250 |
| Sem 3 | C$ 3,000 | C$ 2,688 | C$ 63 | C$ 250 |
| Sem 4 | C$ 3,000 | C$ 2,688 | C$ 61 | C$ 250 |

### 2.5 Ajuste por inflación

Si los precios suben un 5%, actualiza el porcentaje de ajuste y la herramienta recalcula automáticamente todos los montos proyectados.

---

## 3. Módulo 2: Estados Financieros

### 3.1 Cargar la demo MUNO MODA

1. Navega a `#/estados`.
2. Haz clic en **"Cargar Demo MUNO MODA"**.
3. Se cargan los datos de la empresa MUNO MODA S.A. para dos periodos.

### 3.2 Balance General — Verificar A = P + O

La demo carga el siguiente Balance General:

**Periodo 2024:**

| Cuenta | Monto |
|--------|-------|
| **Activos** | |
| Efectivo | C$ 8,500 |
| Cuentas por Cobrar | C$ 12,000 |
| Inventario | C$ 18,000 |
| Activo Fijo Neto | C$ 60,000 |
| **Total Activos** | **C$ 98,500** |
| **Pasivos** | |
| Cuentas por Pagar | C$ 10,000 |
| Préstamo Corto Plazo | C$ 15,000 |
| Préstamo Largo Plazo | C$ 25,000 |
| **Total Pasivos** | **C$ 50,000** |
| **Patrimonio** | |
| Capital Social | C$ 30,000 |
| Utilidades Retenidas | C$ 18,500 |
| **Total Patrimonio** | **C$ 48,500** |

**Verificación:**

```
Activos  = C$ 98,500
Pasivos + Patrimonio = C$ 50,000 + C$ 48,500 = C$ 98,500
```

La ecuación contable **A = P + O** se cumple.

### 3.3 Estado de Resultados

| Concepto | Monto |
|----------|-------|
| Ventas | C$ 120,000 |
| Costo de Ventas | C$ 72,000 |
| **Utilidad Bruta** | **C$ 48,000** |
| Gastos Operativos | C$ 28,000 |
| **Utilidad Operativa** | **C$ 20,000** |
| Gastos Financieros | C$ 5,000 |
| **Utilidad Antes de Impuestos** | **C$ 15,000** |
| Impuestos (30%) | C$ 4,500 |
| **Utilidad Neta** | **C$ 10,500** |

### 3.4 Conexión entre estados

La herramienta muestra cómo se conectan:

```
Utilidad Neta (ER) ──→ Se suma a Utilidades Retenidas (BG)
Efectivo (BG) ──→ Se muestra en el EFE
```

---

## 4. Módulo 3: Análisis Financiero

Usando los datos de la demo MUNO MODA (Periodo 2023 → 2024):

### 4.1 Análisis Horizontal (AH)

**Ejemplo con Cuentas por Cobrar:**

```
Valor 2023: C$ 10,000
Valor 2024: C$ 12,000

Δ (delta) = C$ 12,000 - C$ 10,000 = C$ 2,000
%Δ = C$ 2,000 ÷ |C$ 10,000| = 0.20 = +20%
```

**Interpretación:** Las cuentas por cobrar aumentaron un 20%, lo que puede indicar ventas a crédito crecientes o dificultades de cobro.

### 4.2 Análisis Vertical (AV)

**Ejemplo sobre Total Activos (BG 2024):**

```
Efectivo:       C$  8,500 ÷ C$ 98,500 = 8.63%
CxC:            C$ 12,000 ÷ C$ 98,500 = 12.18%
Inventario:     C$ 18,000 ÷ C$ 98,500 = 18.27%
Activo Fijo:    C$ 60,000 ÷ C$ 98,500 = 60.91%
```

**Ejemplo sobre Ventas (ER):**

```
Costo de Ventas: C$ 72,000 ÷ C$ 120,000 = 60%
Utilidad Bruta:  C$ 48,000 ÷ C$ 120,000 = 40%
Utilidad Neta:   C$ 10,500 ÷ C$ 120,000 = 8.75%
```

### 4.3 Razones Financieras

#### Liquidez

**Ratio Corriente (RC):**

```
AC = C$ 38,500  (Efectivo + CxC + Inventario)
PC = C$ 25,000  (Cuentas por Pagar + Préstamo CP)

RC = C$ 38,500 ÷ C$ 25,000 = 1.54
```

> Un RC de 1.54 indica que por cada C$ 1 de deuda a corto plazo, hay C$ 1.54 en activos corrientes. Es aceptable (>1.0).

**Ratio Rápido (RR):**

```
RR = (C$ 38,500 - C$ 18,000) ÷ C$ 25,000
RR = C$ 20,500 ÷ C$ 25,000 = 0.82
```

> Un RR de 0.82 es bajo (<1.0), indica que sin vender inventario no se cubren los pasivos a corto plazo.

#### Actividad

**Rotación de Inventario:**

```
Rotación = C$ 72,000 ÷ C$ 18,000 = 4.0 veces
```

> El inventario se renueva 4 veces al año (cada 3 meses).

**Plazo de Cobro:**

```
RotCxC = C$ 120,000 ÷ C$ 12,000 = 10.0
Plazo = 360 ÷ 10 = 36 días
```

> En promedio, se cobra 36 días después de la venta.

#### Endeudamiento

```
Endeudamiento = C$ 50,000 ÷ C$ 98,500 = 50.76%
```

> El 50.76% de los activos están financiados con deuda.

#### Rentabilidad

**Margen Neto:**

```
MN = C$ 10,500 ÷ C$ 120,000 = 8.75%
```

**ROA:**

```
ROA = C$ 10,500 ÷ C$ 98,500 = 10.66%
```

### 4.4 Modelo DuPont

```
PM  = C$ 10,500 ÷ C$ 120,000 = 0.0875
AT  = C$ 120,000 ÷ C$ 98,500 = 1.218
EM  = C$ 98,500 ÷ C$ 48,500  = 2.031

ROE = PM × AT × EM = 0.0875 × 1.218 × 2.031 = 0.2169 (21.69%)
```

**Interpretación:** Por cada C$ 1 de patrimonio, la empresa genera C$ 0.22 de utilidad neta. El apalancamiento (EM) amplifica el retorno.

### 4.5 Capital Neto de Trabajo

```
CNT = AC - PC = C$ 38,500 - C$ 25,000 = C$ 13,500
```

> Un CNT positivo indica buena capacidad de cubrir obligaciones a corto plazo.

---

## 5. Módulo 4: Activos y Depreciación

### 5.1 Ejemplo: Laptop

**Datos del activo:**

| Campo | Valor |
|-------|-------|
| Categoría | Tecnología |
| Descripción | Laptop Dell Inspiron |
| Costo original | C$ 18,000 |
| Valor residual | C$ 2,400 |
| Vida útil | 5 años |

### 5.2 Depreciación anual (línea recta)

```
Dep. Anual = (Costo - Residual) ÷ Vida Útil
Dep. Anual = (C$ 18,000 - C$ 2,400) ÷ 5
Dep. Anual = C$ 15,600 ÷ 5
Dep. Anual = C$ 3,120
```

La laptop pierde C$ 3,120 de valor cada año.

### 5.3 Depreciación acumulada

Después de 3 años de uso:

```
Dep. Acumulada = Dep. Anual × Años Consumidos
Dep. Acumulada = C$ 3,120 × 3
Dep. Acumulada = C$ 9,360
```

### 5.4 Valor en libros

```
Valor en Libros = Costo - Dep. Acumulada
Valor en Libros = C$ 18,000 - C$ 9,360
Valor en Libros = C$ 8,640
```

Después de 3 años, la laptop vale C$ 8,640 contablemente.

### 5.5 Tabla de depreciación completa

| Año | Dep. Anual | Dep. Acumulada | Valor en Libros |
|-----|-----------|----------------|-----------------|
| 0 | — | C$ 0 | C$ 18,000 |
| 1 | C$ 3,120 | C$ 3,120 | C$ 14,880 |
| 2 | C$ 3,120 | C$ 6,240 | C$ 11,760 |
| 3 | C$ 3,120 | C$ 9,360 | C$ 8,640 |
| 4 | C$ 3,120 | C$ 12,480 | C$ 5,520 |
| 5 | C$ 3,120 | C$ 15,600 | C$ 2,400 |

> Al final de la vida útil (año 5), el valor en libros iguala el valor residual (C$ 2,400).

---

## 6. Módulo 5: Mercados Financieros

### 6.1 Glosario

Navega al glosario para consultar más de 20 términos financieros definidos: mercado, instrumento, bono, acción, BCN, SIBOIF, etc.

### 6.2 Comparador: Bonos vs Acciones

| Criterio | Bonos | Acciones |
|----------|-------|----------|
| Tipo | Deuda | Propiedad |
| Riesgo | Bajo | Alto |
| Renta fija | Sí | No |
| Voto en asamblea | No | Sí |
| Plazo | Corto/largo | Indefinido |

### 6.3 Quiz de Mercados

1. Navega a `#/mercados` y selecciona el quiz.
2. Responde las preguntas de opción múltiple.
3. Tu puntaje se guarda automáticamente.
4. Puedes repetir el quiz para mejorar tu puntuación.

---

## 7. Módulo 6: Reportes e Integración

### 7.1 Exportar a JSON

1. Navega a `#/reportes`.
2. Haz clic en **"Exportar JSON"**.
3. Se descarga un archivo `gfo-export.json` con todos los datos.

### 7.2 Exportar a CSV

1. Selecciona la tabla que deseas exportar.
2. Haz clic en **"Exportar CSV"**.
3. Se descarga un archivo `.csv` compatible con Excel y Google Sheets.

### 7.3 Exportar a HTML

1. Haz clic en **"Vista Previa HTML"**.
2. Se genera un reporte con estilos profesionales.
3. Puedes imprimirlo directamente con Ctrl+P.

### 7.4 Importar datos

1. Haz clic en **"Importar JSON"**.
2. Selecciona un archivo `.json` exportado previamente.
3. Los datos se cargan y reemplazan el contenido actual.

### 7.5 Dashboard resumen

El dashboard muestra los KPIs principales de todos los módulos:

- **Presupuesto:** Ahorro mensual, saldo disponible
- **Estados:** Total activos, utilidad neta
- **Análisis:** RC, ROA, margen neto
- **Activos:** Total en libros, depreciación acumulada
- **Mercados:** Último puntaje del quiz
