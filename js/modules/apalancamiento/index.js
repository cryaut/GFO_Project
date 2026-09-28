import store from '../../store.js';
import { apalancamientoUI } from './apalancamiento-ui.js';

// Ruta #/apalancamiento: lee los estados y la configuración guardados y dibuja la pantalla.
export function initApalancamiento() {
  const page = document.getElementById('page-apalancamiento');
  if (!page) return;
  apalancamientoUI(page, {
    estados: store.get('estados'),
    config: store.get('apalancamiento'),
    // Lanza un error si localStorage falla; la pantalla lo muestra y no cambia nada.
    guardar: config => store.setPersisted('apalancamiento', config)
  });
}
