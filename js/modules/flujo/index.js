import store from '../../store.js';
import { renderChart } from '../../components/chart.js';
import { estadosGuardados } from '../../utils/estados-guardados.js';
import { flujoUI } from './flujo-ui.js';

// Ruta #/flujo: movimientos de efectivo guardados y, para el saldo inicial, los estados guardados.
export function initFlujo() {
  const page = document.getElementById('page-flujo');
  if (!page) return;
  flujoUI(page, {
    datos: store.get('flujo'),
    estados: estadosGuardados(store.get('estados')),
    // Lanza un error si localStorage falla; la pantalla lo muestra y no cambia nada.
    guardar: datos => store.setPersisted('flujo', datos),
    graficar: renderChart,
    confirmar: texto => window.confirm(texto)
  });
}
