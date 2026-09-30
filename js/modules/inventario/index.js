import store from '../../store.js';
import { renderChart } from '../../components/chart.js';
import { estadosGuardados, totalesPeriodo } from '../../utils/estados-guardados.js';
import { inventarioUI } from './inventario-ui.js';

// Ruta #/inventario: lee el inventario guardado y el inventario del último balance, si existe.
export function initInventario() {
  const page = document.getElementById('page-inventario');
  if (!page) return;
  const totales = totalesPeriodo(estadosGuardados(store.get('estados')));
  inventarioUI(page, {
    datos: store.get('inventario'),
    // Lanza un error si localStorage falla; la pantalla lo muestra y no cambia nada.
    guardar: datos => store.setPersisted('inventario', datos),
    graficar: renderChart,
    confirmar: texto => window.confirm(texto),
    inventarioContable: totales ? { periodo: totales.periodo, valor: totales.inventario } : null
  });
}
