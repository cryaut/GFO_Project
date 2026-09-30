import store from '../../store.js';
import { renderChart } from '../../components/chart.js';
import { estadosGuardados } from '../../utils/estados-guardados.js';
import { equilibrioUI } from './equilibrio-ui.js';

// Ruta #/equilibrio: datos guardados del C-V-U y, para tomar precio y costos de un periodo,
// los estados y la clasificación de costos de Apalancamiento.
export function initEquilibrio() {
  const page = document.getElementById('page-equilibrio');
  if (!page) return;
  equilibrioUI(page, {
    datos: store.get('equilibrio'),
    estados: estadosGuardados(store.get('estados')),
    configApalancamiento: store.get('apalancamiento'),
    // Lanza un error si localStorage falla; la pantalla lo muestra y no cambia nada.
    guardar: datos => store.setPersisted('equilibrio', datos),
    graficar: renderChart
  });
}
