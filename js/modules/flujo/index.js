import store from '../../store.js';
import { renderChart } from '../../components/chart.js';
import { estadosGuardados } from '../../utils/estados-guardados.js';
import { flujoUI } from './flujo-ui.js';

// Ruta #/flujo: movimientos de efectivo guardados y, para el saldo inicial, los estados guardados.
export function initFlujo() {
  const page = document.getElementById('page-flujo');
  if (!page) return;
  let datos = store.get('flujo');
  const leerEstados = () => estadosGuardados(store.get('estados'));
  flujoUI(page, {
    datos,
    estados: leerEstados(),
    leerEstados,
    // Lanza un error si localStorage falla; la pantalla lo muestra y no cambia nada.
    guardar: nuevos => {
      if (datos !== store.get('flujo')) throw new Error('Flujo cambió. Vuelva a abrir la pantalla para guardar sobre los datos vigentes');
      store.setPersisted('flujo', nuevos);
      datos = store.get('flujo');
    },
    graficar: renderChart,
    confirmar: texto => window.confirm(texto)
  });
}
