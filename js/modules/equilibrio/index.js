import store from '../../store.js';
import { supuestosActivos } from '../../utils/casos.js';
import { renderChart } from '../../components/chart.js';
import { estadosGuardados } from '../../utils/estados-guardados.js';
import { monedaDe } from '../../utils/moneda.js';
import { calcularInventario } from '../inventario/inventario-calculations.js';
import { leerPlaneacion } from '../planeacion/planeacion-escenarios.js';
import { calcularCapitalTrabajo, calcularPresupuestoMaestro, validarSupuestos } from '../planeacion/planeacion-calculations.js';
import { equilibrioUI } from './equilibrio-ui.js';

function fuentesCvu() {
  const guardado = store.get('inventario');
  const inventario = { ...calcularInventario(guardado), moneda: monedaDe(guardado) };
  const lectura = leerPlaneacion(store.get('planeacion'));
  const { supuestos, escenario, base } = lectura;
  if (!supuestos) return { inventario, planeacion: null };
  const capital = escenario?.capitalTrabajo;
  const resultado = !capital && !validarSupuestos(supuestos).length ? calcularPresupuestoMaestro(supuestos) : null;
  const periodos = capital ? calcularCapitalTrabajo(supuestos, capital, base.fechaCorte).etiquetas
    : resultado?.etiquetas ?? supuestos.ventasUnidades.map((_, i) => `${supuestos.tipoPeriodo} ${i + 1}`);
  const unidad = inventario.productos.find(p => p.id === supuestos.productoId)?.unidad;
  return { inventario, planeacion: { ...lectura, resultado, periodos, unidad } };
}

// Ruta #/equilibrio: datos guardados del C-V-U y, para tomar precio y costos de un periodo,
// los estados y la clasificación de costos de Apalancamiento.
export function initEquilibrio() {
  const page = document.getElementById('page-equilibrio');
  if (!page) return;
  let datos = store.get('equilibrio');
  equilibrioUI(page, {
    datos,
    estados: estadosGuardados(store.get('estados')),
    configApalancamiento: store.get('apalancamiento'),
    supuestos: supuestosActivos(store.getAll()),
    // Lanza un error si localStorage falla; la pantalla lo muestra y no cambia nada.
    guardar: nuevos => {
      if (datos !== store.get('equilibrio')) throw new Error('C-V-U cambió. Abra de nuevo la pantalla antes de guardar.');
      store.setPersisted('equilibrio', nuevos);
      datos = store.get('equilibrio');
    },
    leerFuentes: fuentesCvu,
    graficar: renderChart
  });
}
