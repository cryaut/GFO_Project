import store from '../../store.js';
import { estadosGuardados } from '../../utils/estados-guardados.js';
import { UMBRALES, computeDuPont, computeRazones, refreshSavedStates } from '../analisis/index.js';
import { calcularRazonesMercado } from '../analisis/mercado-calculations.js';
import { calcularApalancamiento } from '../apalancamiento/apalancamiento-calculations.js';
import { calcularCVU, normalizarEquilibrio, validarEquilibrio } from '../equilibrio/equilibrio-calculations.js';
import { calcularFlujo } from '../flujo/flujo-calculations.js';
import { calcularInventario } from '../inventario/inventario-calculations.js';
import { calcularPresupuestoMaestro, normalizarSupuestos, validarSupuestos } from '../planeacion/planeacion-calculations.js';
import { construirReporte } from './proforma-calculations.js';
import { proformaUI } from './proforma-ui.js';

// Un módulo con datos dañados no debe impedir el resto del reporte.
function intentar(calculo) {
  try {
    return calculo();
  } catch {
    return null;
  }
}

// Ruta #/proforma: reúne los resultados de cada módulo con sus mismas funciones de cálculo.
export function initProforma() {
  const page = document.getElementById('page-proforma');
  if (!page) return;
  const estados = estadosGuardados(store.get('estados'));
  const ultimo = estados ? estados.periods[estados.periods.length - 1] : null;
  if (estados) refreshSavedStates();
  const supuestos = normalizarSupuestos(store.get('planeacion')?.supuestos);
  const equilibrio = normalizarEquilibrio(store.get('equilibrio'));
  const flujo = calcularFlujo(store.get('flujo'));
  const inventario = calcularInventario(store.get('inventario'));
  const reporte = construirReporte({
    estados,
    razones: estados ? intentar(() => computeRazones(ultimo)) : null,
    dupont: estados ? intentar(() => computeDuPont(ultimo)) : null,
    mercado: estados
      ? intentar(() => calcularRazonesMercado(estados, store.get('razonesMercado'), store.get('apalancamiento')?.dap || {}).at(-1))
      : null,
    apalancamiento: estados ? intentar(() => calcularApalancamiento(estados, store.get('apalancamiento') || {})) : null,
    presupuesto: validarSupuestos(supuestos).length ? null : intentar(() => calcularPresupuestoMaestro(supuestos)),
    equilibrio: validarEquilibrio(equilibrio).length ? null : calcularCVU(equilibrio),
    flujo: flujo.cantidadMovimientos ? flujo : null,
    inventario: inventario.productos.length ? inventario : null,
    umbrales: UMBRALES
  });
  proformaUI(page, { reporte, imprimir: () => window.print() });
}
