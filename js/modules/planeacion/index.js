import store from '../../store.js';
import { renderChart } from '../../components/chart.js';
import { estadosGuardados } from '../../utils/estados-guardados.js';
import { calcularInventario } from '../inventario/inventario-calculations.js';
import { planeacionUI } from './planeacion-ui.js';
import { ARCHIVO_REFERENCIA } from './planeacion-escenarios.js';

async function cargarReferencia() {
  const respuesta = await fetch(new URL(`../../../${ARCHIVO_REFERENCIA}`, import.meta.url));
  if (!respuesta.ok) throw new Error('El archivo de referencia de Comercial Ejemplo no está disponible.');
  return respuesta.json();
}

// Ruta #/planeacion: supuestos guardados y, para los saldos iniciales, los estados y el inventario.
export function initPlaneacion() {
  const page = document.getElementById('page-planeacion');
  if (!page) return;
  let datos = store.get('planeacion');
  planeacionUI(page, {
    datos,
    estados: estadosGuardados(store.get('estados')),
    inventario: calcularInventario(store.get('inventario')),
    // Lanza un error si localStorage falla; la pantalla lo muestra y no cambia nada.
    guardar: nuevos => {
      if (datos !== store.get('planeacion')) {
        throw new Error('Planeación cambió. Vuelva a abrir la pantalla para guardar sobre los datos vigentes');
      }
      store.setPersisted('planeacion', nuevos);
      datos = store.get('planeacion');
    },
    cargarReferencia,
    graficar: renderChart
  });
}
