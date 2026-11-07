import store from '../../store.js';
import { destroyChart, renderChart } from '../../components/chart.js';
import { estadosGuardados } from '../../utils/estados-guardados.js';
import { calcularInventario } from '../inventario/inventario-calculations.js';
import { planeacionUI } from './planeacion-ui.js';
import { ARCHIVO_ENTRADAS, ARCHIVO_REFERENCIA } from './planeacion-escenarios.js';

async function leerArchivoCaso(ruta) {
  const respuesta = await fetch(new URL(`../../../${ruta}`, import.meta.url));
  if (!respuesta.ok) throw new Error(`No está disponible el archivo de referencia ${ruta}.`);
  return respuesta.json();
}

async function cargarReferencia() {
  const [referencia, entradas] = await Promise.all([leerArchivoCaso(ARCHIVO_REFERENCIA), leerArchivoCaso(ARCHIVO_ENTRADAS)]);
  return { referencia, entradas };
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
    graficar: renderChart,
    destruirGrafica: destroyChart
  });
}
