# AGRI-CORP como caso central del GFO Toolkit

- **Estado**: En revisión (segunda revisión del PR #37)
- **Responsable**: Carlos
- **Rama**: `feat/agricorp-integral`
- **Última actualización**: 2026-11-12

## Objetivo
Que toda la app trabaje sobre Corporación Agrícola, S. A. y subsidiarias (AGRI-CORP): estados auditados reales 2022–2025 más supuestos declarados y visibles. Las cifras que dependen de un supuesto llevan la etiqueta «SUPUESTO» con su id; lo demás es real o derivado de cifras reales, y el aviso de cada pantalla dice si los datos siguen siendo los del caso. El plan completo, con fuentes y supuestos, está en [PLAN.md](PLAN.md). Decisión: [D-113](../../decisiones.md).

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| F1 | Estados 2022–2025 reales (2022–2023 de F02, 2024–2025 de F04) y supuestos de crédito (S1–S3) | Completado |
| F2 | Apalancamiento con la UAII del auditado (S4–S6) y Mercado con precio ilustrativo (S7) | Completado |
| F3 | Equilibrio en C$1 de ventas, flujos publicados 2022–2025 y composición real de inventario con kárdex de granza | Completado |
| F4 | Presupuesto maestro 2025 desde el cierre real de 2024 (S8–S15) | Completado |
| F5 | Balance proforma y contraste con el 2025 auditado | Completado |
| F6 | Reportes y HTML con todos los módulos | Completado |
| F7 | AGRI-CORP primero en los selectores, aviso de mezcla y mapa de supuestos | Completado |
| F8 | Documentación, revisión en móvil y modo oscuro, PR | Completado |
| R1 | Correcciones de la primera revisión (PLAN, sección 13) | Completado; pendiente de segunda revisión |

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
| S15: días de inventario al cierre de 2024 | 78.49 |
| Inventario final presupuestado 2025 (S15) | 1,643,192,860 |
| Caja final presupuestada 2025 | 431,690,010 |
| Activos del balance proforma 2025 (cuadra) | 6,373,941,205 |

Cada cifra tiene su prueba en `tests/unit/agricorp-*.test.js`. Con S15 corregido, la caja final baja 223,324,187 (antes 655,014,198) y el inventario final sube lo mismo (antes 1,419,868,672); la utilidad neta, los proveedores y el total de activos no cambian.

## Decisiones clave
- Dos capas que no se suman: consolidado real con supuestos y línea de arroz simulada (D-113).
- La utilidad operativa es la del auditado. El ejemplo clasifica «Otros gastos», «Otros ingresos» y el pago mínimo como operativos, así que también cambian la UAII, el margen operativo y la cobertura de Análisis (D-113).
- Donde no hay unidades publicadas se mide en C$; en Inventario no se ponen córdobas en campos de unidades (D-113).
- La proforma 2025 parte del cierre real de 2024 y se contrasta con el 2025 auditado (D-113).
- Costo de quintal C$ 620, movimientos de granza anclados a los saldos reales y stock mínimo de un mes: decididos con Carlos el 2026-11-11.
- **Supuestos S1–S16 aprobados por Cris el 2026-11-12**, declarados y editables.
- S15 usa los días de inventario al cierre de 2024 (78.49), no los del inventario promedio (67.82), porque fija un saldo final (revisión del 2026-11-12).
- El aviso del caso solo afirma «datos reales» mientras la huella de la parte real del módulo coincide; si no, dice «Datos modificados» (revisión del 2026-11-12).

## Archivos que toca
- Datos: `js/examples/ejemplos-agricorp.js`, `js/examples/catalogo.js`.
- Módulos: apalancamiento, equilibrio, flujo, inventario, planeación, proforma (nuevo `proforma-balance-calculations.js`), análisis (EFE, mercado y etiquetas SUPUESTO de CxC/CxP), inicio (nuevo `inicio-supuestos.js`), integración (reporte y respaldo).
- **Compartidos de `AGENTS.md`:** `js/store.js` (clave nueva `casos`), `js/app.js` (aviso de caso encima de la pantalla) y `js/modules/analisis/index.js` (filas del efecto de conversión en el EFE y etiquetas SUPUESTO). `js/utils/calculate.js` y `estados-calculations.js` no cambian.
- Nuevo: `js/utils/casos.js`.
- Áreas de otras personas: Estados y Reportes (Cris), Análisis (Henry). Se avisa en el PR.
- Investigación y trazabilidad: [`investigacion/`](investigacion/), con los dos archivos de investigación (enlaces públicos a cada PDF) y la [tabla de contraste de 2022 y 2025](investigacion/CONTRASTE-2022-2025.md).

## Coordinación: D-113 en la rama del balance proforma
La rama local `feat/balance-proforma-integrado` (Carlos, 7 commits del 2026-11-11 sobre `main`, sin publicar) registra otras tres decisiones con números que chocan con este PR:

| En esa rama | Tema | Número al integrarla |
|---|---|---|
| D-113 | Balance proforma integrado y premisas de clase | D-114 |
| D-114 | Balance proforma conectado a los datos de la empresa (reemplaza en parte a «D-113» de esa rama) | D-115, que reemplaza en parte a D-114 |
| D-115 | AGRI-CORP real: resultado operativo del auditado, balance 2022 y contraste 2025 | D-116 |

D-113 queda para «AGRI-CORP como caso central» porque el PR #37 se publicó primero. Al traer `main` a esa rama hay que renumerar sus tres entradas y sus referencias internas. Además, esa rama toca 13 archivos que este PR también cambia, entre ellos `ejemplos-agricorp.js`, `catalogo.js`, `integracion-reporte.js`, `integracion-respaldo.js` y los de `proforma/`, y las dos crean `proforma-balance-calculations.js` con contenidos distintos. Su D-115 decide lo mismo que este PR para la utilidad operativa, el balance 2022 y el contraste 2025: al integrarla hay que conservar una sola versión de cada función y de cada cifra. Esa rama no se modificó en esta revisión.

## Pasos
| # | Paso | Estado |
|---|---|---|
| — | [Plan del caso central](PLAN.md) | Completado |
| — | [Contraste de 2022 y 2025 con los PDF](investigacion/CONTRASTE-2022-2025.md) | Tabla lista; falta revisar cada cifra contra el PDF |

## Próximo paso
Segunda revisión del PR. Pendientes que no bloquean:
- Contrastar 2022 y 2025 contra los PDF con la tabla de `investigacion/`.
- Decidir si la línea de arroz se lleva a 2025 para alinear los años con el consolidado.
- Decidir si el presupuesto maestro debería admitir costos fijos de producción para que su punto de equilibrio coincida con el de Equilibrio.
- El selector de Estados carga un borrador: si se guarda Baker sobre AGRI-CORP, el aviso dice «Datos modificados», sin nombrar a Baker como otro caso. Para que diga «Empresas mezcladas» con el nombre, Estados tendría que registrar el caso al guardar el borrador (módulo de Cris).
