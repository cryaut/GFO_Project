# 00 — Brechas, veredicto de v3 y prioridades

- **Estado**: Completado
- **Fecha**: 2026-09-29
- **Depende de**: —

## Objetivo
Saber qué pide la guía que la app todavía no hace, en qué estado está `main` y si conviene integrar la rama `razones-financieras-v3`.

## Estado de `main` (92a9ff9)
- Contiene los PR #1 (core), #2 (decisiones) y #4 (apalancamiento). Las ramas `Test`, `fix/estados-import-razones` y `razones-financieras` ya están incluidas.
- `npm test`: 212 pruebas en verde (16 archivos). `npm run lint`: 0 errores, 11 advertencias conocidas.

## Veredicto de `razones-financieras-v3` (c9cef23, Henry)
Parte de `040d81a` (PR #1): no tiene los PR #2 ni #4. Un merge de prueba con `main` da un solo conflicto trivial (`docs/planificacion/README.md`) y 215 pruebas en verde. **No se integra tal cual**: se porta sobre `main` después de corregir dos regresiones.

Lo que conviene conservar:
- N/D en RC, RR, rotación de inventario, endeudamiento, margen neto, ROA y DuPont (sin `NaN` ni `Infinity`); solo las usa `analisis/index.js`.
- Interpretación y evolución que no evalúan razones N/D.
- Rotación de CxP con compras reales (Costo de ventas + Inv. final − Inv. inicial). MUNO 2024: 6.16 → 6.33 veces; plazo de pago 59.3 → 57.7 días.
- Dashboard con `computeRazones`, igual que Análisis.

Lo que hay que corregir antes:
1. `rotacionCxC(null, …)` deja **siempre** en N/D la rotación de CxC, el plazo de cobro y el ciclo de conversión (MUNO 2024 pasa de 7.22 veces, 50.6 días y 116.9 días a N/D), mientras la CxP sí se aproxima. Propuesta: usar ventas totales como aproximación documentada, igual que el costo de ventas en CxP, y etiquetarla "aprox.".
2. `sortPeriods` dentro de `normalizeFinancialData` anula los botones de reordenar periodos de Estados y ordena mal los nombres de mes (`Marzo, Abril` → `Abril, Marzo`). Propuesta: ordenar solo al importar, como antes.
3. Faltan las entradas en `decisiones.md` (cambian cifras visibles) y actualizar el catálogo de `dominio-financiero.md` (sigue diciendo "legado").

## Brechas contra la guía
| Módulo | Estado en `main` | Qué falta |
|---|---|---|
| Estados financieros | Cumple | La demo MUNO MODA no cuadra (−70,200 en 2023 y −46,150 en 2024) y no trae intereses ni IR: no sirve como "caso completo coherente" |
| Análisis financiero | Casi completo | Razones de **mercado** (UPA, P/U, valor en libros por acción, DPA) |
| Punto de equilibrio y C-V-U | **No existe** | Todo |
| Apalancamiento | Cumple | — |
| Flujo de efectivo | Parcial | Solo el flujo operativo indirecto en Análisis; faltan inversión, financiamiento, variación neta y saldo final |
| Planeación y presupuestos | **No existe** | Presupuestos de ventas, compras, CBV, gastos de operación, caja y saldo proyectado |
| Proforma / reporte integrado | **No existe** | Reportes solo tiene dashboard y exportación |
| Presupuesto personal | Parcial | Un solo ingreso; no calcula la capacidad de ahorro; `g.concepto` se inserta sin `escapeHTML` |
| Inventario básico | **No existe** | Todo (el módulo Activos es de activos fijos) |

## Prioridades
1. Módulos que no existen, en orden de dependencia: inventario → punto de equilibrio → flujo de efectivo → presupuesto maestro → proforma y reporte integrado.
2. Completar el presupuesto personal.
3. Coordinar con sus responsables: razones de mercado (Henry), demo coherente (Cris) y la versión corregida de v3 (Henry).
4. Después, valor agregado.

## Próximo paso
[01 — Especificación de los módulos obligatorios](01-modulos-obligatorios.md).
