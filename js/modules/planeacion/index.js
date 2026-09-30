import store from '../../store.js';
import { renderChart } from '../../components/chart.js';
import { estadosGuardados } from '../../utils/estados-guardados.js';
import { calcularInventario } from '../inventario/inventario-calculations.js';
import { planeacionUI } from './planeacion-ui.js';

// Ruta #/planeacion: supuestos guardados y, para los saldos iniciales, los estados y el inventario.
export function initPlaneacion() {
  const page = document.getElementById('page-planeacion');
  if (!page) return;
  planeacionUI(page, {
    datos: store.get('planeacion'),
    estados: estadosGuardados(store.get('estados')),
    inventario: calcularInventario(store.get('inventario')),
    // Lanza un error si localStorage falla; la pantalla lo muestra y no cambia nada.
    guardar: datos => store.setPersisted('planeacion', datos),
    graficar: renderChart
  });
}
