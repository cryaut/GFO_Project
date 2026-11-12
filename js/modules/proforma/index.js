import store from '../../store.js';
import { leerEstados } from '../../utils/estados-guardados.js';
import { UMBRALES, computeDuPont, computeRazones, refreshSavedStates } from '../analisis/index.js';
import { calcularRazonesMercado, normalizarDatosMercado } from '../analisis/mercado-calculations.js';
import { calcularApalancamiento } from '../apalancamiento/apalancamiento-calculations.js';
import { calcularCVU, normalizarEquilibrio, resolverBase, validarEquilibrio } from '../equilibrio/equilibrio-calculations.js';
import { calcularInventario } from '../inventario/inventario-calculations.js';
import { calcularPresupuestoMaestro, validarSupuestos } from '../planeacion/planeacion-calculations.js';
import { leerPlaneacion } from '../planeacion/planeacion-escenarios.js';
import { construirReporte, flujoDesdeEFE } from './proforma-calculations.js';
import { proformaUI } from './proforma-ui.js';
import { supuestosActivos } from '../../utils/casos.js';

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
      ? 'El escenario activo tiene su propia base histórica y sus resultados parciales están en Planeación. Una proforma completa requiere los gastos y la caja del mismo escenario.'
      : 'El escenario activo tiene su propia base histórica. Consulte sus resultados en Planeación; no se comparan con los estados de otra base en la proforma integrada.') : null);
  const equilibrio = normalizarEquilibrio(store.get('equilibrio'));
  const baseCvu = intentar(() => resolverBase(equilibrio, estados, store.get('apalancamiento')));
  const cVu = baseCvu?.base ? { ...equilibrio, ...baseCvu.base } : equilibrio;
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
      ? intentar(() => {
        const r = calcularRazonesMercado(estados, store.get('razonesMercado'), store.get('apalancamiento')?.dap || {}).at(-1);
        // D-113: la nota de procedencia (precio supuesto) acompaña al indicador.
        const nota = normalizarDatosMercado(store.get('razonesMercado')).nota;
        return r && nota ? { ...r, nota } : r;
      })
      : null,
    apalancamiento: estados ? intentar(() => calcularApalancamiento(estados, store.get('apalancamiento') || {})) : null,
    presupuesto: motivoPresupuesto || validarSupuestos(supuestos).length
      ? null : intentar(() => calcularPresupuestoMaestro(supuestos, inventario)),
    motivoPresupuesto,
    equilibrio: !baseCvu || baseCvu.error || validarEquilibrio(cVu).length ? null : calcularCVU(cVu),
    flujo,
    inventario: inventario.productos.length ? inventario : null,
    // D-113: qué supuestos de AGRI-CORP alimentan cada indicador (para rotularlos). El C-V-U solo
    // usa S4–S6 cuando se deriva de los estados con la clasificación de Apalancamiento.
    supuestos: (() => {
      const activos = supuestosActivos(store.getAll());
      return { ...activos, cvu: activos.costos && equilibrio.origen === 'estados' };
    })(),
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
