import store from '../../store.js';
import { renderChart } from '../../components/chart.js';
import { estadosGuardados, totalesPeriodo } from '../../utils/estados-guardados.js';
import { computarRazonesDesdeDatos } from '../razones/razones-app-adapter.js';
import { inventarioUI } from './inventario-ui.js';

// Inventario del balance, rotación y edad por periodo, con las mismas funciones que Análisis.
// Un periodo que no se puede leer queda fuera (la pantalla muestra N/D).
function indicadoresPorPeriodo(estados) {
  if (!estados) return {};
  return Object.fromEntries(estados.periods.flatMap(periodo => {
    try {
      const razones = computarRazonesDesdeDatos(estados, periodo);
      return [[periodo, { inventario: totalesPeriodo(estados, periodo)?.inventario ?? null,
        rotacion: razones.RotInv, dias: razones.edadInventario }]];
    } catch {
      return [];
    }
  }));
}

// Ruta #/inventario: lee el inventario guardado y el inventario del último balance, si existe.
export function initInventario() {
  const page = document.getElementById('page-inventario');
  if (!page) return;
  const estados = estadosGuardados(store.get('estados'));
  const totales = totalesPeriodo(estados);
  inventarioUI(page, {
    datos: store.get('inventario'),
    // Lanza un error si localStorage falla; la pantalla lo muestra y no cambia nada.
    guardar: datos => store.setPersisted('inventario', datos),
    graficar: renderChart,
    confirmar: texto => window.confirm(texto),
    inventarioContable: totales ? { periodo: totales.periodo, valor: totales.inventario } : null,
    indicadores: store.get('inventario')?.composicion ? indicadoresPorPeriodo(estados) : {}
  });
}
