# AGRI-CORP como caso central del GFO Toolkit

- **Estado**: En revisión
- **Responsable**: Carlos
- **Rama**: `feat/agricorp-integral`
- **Última actualización**: 2026-11-11

## Objetivo
Que toda la app trabaje sobre Corporación Agrícola, S. A. y subsidiarias (AGRI-CORP): estados auditados reales 2022–2025 más supuestos declarados y visibles, para defender un sistema donde cada cifra dice si es real, derivada o supuesta. El plan completo, con fuentes y supuestos, está en [PLAN.md](PLAN.md). Decisión: [D-113](../../decisiones.md).

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| F1 | Estados 2022–2025 reales y supuestos de crédito (S1–S3) | Completado |
| F2 | Apalancamiento con la UAII del auditado (S4–S6) y Mercado con precio ilustrativo (S7) | Completado |
| F3 | Equilibrio en C$1 de ventas, flujos publicados 2022–2025 y composición real de inventario con kárdex de granza | Completado |
| F4 | Presupuesto maestro 2025 desde el cierre real de 2024 (S8–S15) | Completado |
| F5 | Balance proforma y contraste con el 2025 auditado | Completado |
| F6 | Reportes y HTML con todos los módulos | Completado |
| F7 | AGRI-CORP primero en los selectores, aviso de mezcla y mapa de supuestos | Completado |
| F8 | Documentación, revisión en móvil y modo oscuro, PR | En revisión |

## Cifras de control
| Concepto | Valor |
|---|---:|
| Activos 2024 (auditado) | 6,328,132,696 |
| Utilidad operativa 2024 (subtotal auditado) | 357,667,403 |
| Rotación de inventario 2023 / 2024 / 2025 | 6.15 / 5.38 / 4.08 |
| GAO 2024 (S4–S6) | 8.18 |
| Punto de equilibrio 2024 (C$1 de ventas) | 7,909,413,340 |
| Ventas presupuestadas 2025 | 9,132,084,222 |
| Utilidad neta presupuestada 2025 / real 2025 | 67,137,655 / −157,990,498 |
| Activos del balance proforma 2025 (cuadra) | 6,373,941,205 |

Cada cifra tiene su prueba en `tests/unit/agricorp-*.test.js`.

## Decisiones clave
- Dos capas que no se suman: consolidado real con supuestos y línea de arroz simulada (D-113).
- La utilidad operativa es la del auditado; Apalancamiento y Equilibrio usan la misma frontera operativa que Análisis (D-113).
- Donde no hay unidades publicadas se mide en C$; en Inventario no se ponen córdobas en campos de unidades (D-113).
- La proforma 2025 parte del cierre real de 2024 y se contrasta con el 2025 auditado (D-113).
- Costo de quintal C$ 620, movimientos de granza anclados a los saldos reales y stock mínimo de un mes: decididos con el usuario el 2026-11-11.

## Archivos que toca
- Datos: `js/examples/ejemplos-agricorp.js`, `js/examples/catalogo.js`.
- Módulos: apalancamiento, equilibrio, flujo, inventario, planeación, proforma (nuevo `proforma-balance-calculations.js`), análisis (EFE y mercado), inicio (nuevo `inicio-supuestos.js`), integración (reporte y respaldo).
- **Compartidos de `AGENTS.md`:** `js/store.js` (clave nueva `casos`), `js/app.js` (aviso de caso encima de la pantalla) y `js/modules/analisis/index.js` (filas del efecto de conversión en el EFE). `js/utils/calculate.js` y `estados-calculations.js` no cambian.
- Nuevo: `js/utils/casos.js`.
- Áreas de otras personas: Estados y Reportes (Cris), Análisis (Henry). Se avisa en el PR.

## Pasos
| # | Paso | Estado |
|---|---|---|
| — | [Plan del caso central](PLAN.md) | Completado |

## Próximo paso
Revisión del PR por el equipo. Pendientes que no bloquean: decidir si la línea de arroz se lleva a 2025 para alinear los años con el consolidado, y si el presupuesto maestro debería admitir costos fijos de producción para que su punto de equilibrio coincida con el de Equilibrio.
