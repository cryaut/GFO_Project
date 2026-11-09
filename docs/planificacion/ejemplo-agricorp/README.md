# Ejemplos de AGRI-CORP (real y simulado)

- **Estado**: En revisión
- **Responsable**: Carlos
- **Rama**: `feat/ejemplo-agricorp`
- **Ultima actualización**: 2026-11-09

## Objetivo
Cargar en la app, desde los selectores de ejemplos existentes, los datos del dossier `AGRICORP_GFO_datos_reales_y_simulados_justificados.md`: la AGRI-CORP consolidada (estados auditados 2023 y 2024) y la unidad ficticia `Unidad_Comercial_Arroz_Demo_2027` (julio a septiembre de 2027). Los dos casos van separados y no se suman.

## Checkpoints
| CP | Meta | Estado |
|---|---|---|
| 1 | Datos de los dos casos y del presupuesto personal en `js/examples/ejemplos-agricorp.js` | Completado |
| 2 | Opciones en el catálogo: Estados (solo estados, como borrador) e Inicio (todos los módulos de empresa) | Completado |
| 3 | Cifras del dossier reproducidas por los módulos (balance cuadrado, flujo conciliado, GAO/GAF/GAT, punto de equilibrio, caja, inventario) | Completado |
| 4 | Sin N/D por cuentas "sugeridas": cuentas confirmadas contra el catálogo, cobertura y composición declaradas | Completado |

## Decisiones clave
- Casos separados, sin mezclar cifras reales con simuladas; cargar desde Inicio reemplaza todos los módulos de empresa. Ver D-109.
- Lo calculado (presupuestos, caja, GAO/GAF/GAT, proforma) no se guarda: sale de las fórmulas de cada módulo.

## Verificación de cifras
- Real: activos 6,328,132,696 (2024) y 5,289,724,103 (2023) cuadran con pasivos y patrimonio; utilidad neta 42,223,948 y −419,583,311; flujo 2024: operación 190,033,364, inversión −78,516,767, financiamiento 102,282,062, saldo final 284,636,118 conciliado con el balance.
- Simulado: punto de equilibrio 1,800 sacos y C$1,620,000; agosto GAO 1.75, GAF 1.0742, GAT 1.8798; compras 3,840, 4,280 y 4,680 sacos; efectivo final 1,805,480, 1,990,560 y 2,380,760; balance de septiembre 6,390,760; inventario final 1,000 sacos.

## Archivos que toca
- `js/examples/ejemplos-agricorp.js` (nuevo) y `js/examples/catalogo.js`.
- `js/modules/inicio/index.js` e `inicio-ui.js` (carga completa y mensaje de confirmación).
- No toca `calculate.js`, `store.js`, `estados-calculations.js`, `analisis/index.js`, `app.js` ni `index.html`.

## Pasos
No hay pasos numerados: la feature es pequeña y el detalle está en D-109.

## Próximo paso
Revisión del PR. Pendiente: no hay datos de ventas a crédito ni de pagos a proveedores del caso real, así que cinco razones de actividad de 2024 siguen en N/D por diseño.
