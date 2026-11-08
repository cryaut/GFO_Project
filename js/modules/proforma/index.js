import store from '../../store.js';
import { leerEstados } from '../../utils/estados-guardados.js';
import { UMBRALES, computeDuPont, computeRazones, refreshSavedStates } from '../analisis/index.js';
import { calcularRazonesMercado } from '../analisis/mercado-calculations.js';
import { calcularApalancamiento } from '../apalancamiento/apalancamiento-calculations.js';
import { calcularCVU, normalizarEquilibrio, validarEquilibrio } from '../equilibrio/equilibrio-calculations.js';
import { calcularInventario } from '../inventario/inventario-calculations.js';
import { calcularPresupuestoMaestro, validarSupuestos } from '../planeacion/planeacion-calculations.js';
import { leerPlaneacion } from '../planeacion/planeacion-escenarios.js';
import { construirReporte, flujoDesdeEFE } from './proforma-calculations.js';
import { proformaUI } from './proforma-ui.js';

// Un módulo con datos dañados no debe impedir el resto del reporte.
function intentar(calculo) {
  try {
    return calculo();
  } catch {
    return null;
  }
}

// Resultados de cada módulo calculados con sus mismas funciones. Exportada: Inicio
// (panorama general) reutiliza estas entradas en vez de repetir la recolección.
// D-078: la lectura es única (leerEstados) y el error de lectura viaja en
// `errorEstados` para que el reporte muestre el aviso real; sin respaldos por
// nombres fijos, ninguna cifra se inventa cuando los estados no se pueden leer.
export function reunirEntradas() {
  const { estados, error: errorEstados } = leerEstados(store.get('estados'));
  const ultimo = estados ? estados.periods[estados.periods.length - 1] : null;
  if (estados) refreshSavedStates();
  const { supuestos, base, escenario, error: errorPlaneacion } = leerPlaneacion(store.get('planeacion'));
  const motivoPresupuesto = errorPlaneacion || (base
    ? (escenario?.capitalTrabajo
      ? 'El escenario activo tiene su propia base histórica. Su presupuesto parcial de capital de trabajo está en Planeación; aún faltan la valorización del costo de ventas, los gastos y la caja para elaborar una proforma completa.'
      : 'El escenario activo tiene su propia base histórica. Consulte sus resultados en Planeación; no se comparan con los estados de otra base en la proforma integrada.') : null);
  const equilibrio = normalizarEquilibrio(store.get('equilibrio'));
  // D-070: el flujo viene del EFE de Análisis (último par de periodos), no de la
  // captura manual del flujo directo, que queda como captura no oficial.
  const flujo = estados ? intentar(() => flujoDesdeEFE(estados)) : flujoDesdeEFE(null);
  const inventario = calcularInventario(store.get('inventario'));
  return {
    estados,
    errorEstados,
    razones: estados ? intentar(() => computeRazones(ultimo)) : null,
    dupont: estados ? intentar(() => computeDuPont(ultimo)) : null,
    mercado: estados
      ? intentar(() => calcularRazonesMercado(estados, store.get('razonesMercado'), store.get('apalancamiento')?.dap || {}).at(-1))
      : null,
    apalancamiento: estados ? intentar(() => calcularApalancamiento(estados, store.get('apalancamiento') || {})) : null,
    presupuesto: motivoPresupuesto || validarSupuestos(supuestos).length
      ? null : intentar(() => calcularPresupuestoMaestro(supuestos, inventario)),
    motivoPresupuesto,
    equilibrio: validarEquilibrio(equilibrio).length ? null : calcularCVU(equilibrio),
    flujo,
    inventario: inventario.productos.length ? inventario : null,
    umbrales: UMBRALES
  };
}

// Ruta #/proforma: reúne los resultados de cada módulo con sus mismas funciones de cálculo.
export function initProforma() {
  const page = document.getElementById('page-proforma');
  if (!page) return;
  const reporte = construirReporte(reunirEntradas());
  proformaUI(page, { reporte, imprimir: () => window.print() });
}
