// Ruta #/home: panorama general. Reutiliza la recolección de la proforma para que cada
// cifra salga de la misma función que la muestra en su módulo.
import store from '../../store.js';
import { renderChart } from '../../components/chart.js';
import { showToast } from '../../components/toast.js';
import { calcularEstado, ejemploActivos } from '../activos/index.js';
import { ejemploMercado } from '../analisis/mercado-calculations.js';
import { ejemploEquilibrio, normalizarEquilibrio } from '../equilibrio/equilibrio-calculations.js';
import { DEMO_MUNOMODA } from '../estados/index.js';
import { normalizeFinancialData } from '../estados/estados-normalize.js';
import { ejemploFlujo, normalizarFlujo } from '../flujo/flujo-calculations.js';
import { ejemploInventario, normalizarInventario } from '../inventario/inventario-calculations.js';
import { ejemploPlaneacion, normalizarSupuestos } from '../planeacion/planeacion-calculations.js';
import { ejemploPresupuestoPersonal, presupuestoCalculations } from '../presupuesto/index.js';
import { reunirEntradas } from '../proforma/index.js';
import { construirReporte } from '../proforma/proforma-calculations.js';
import { panoramaGeneral } from './inicio-calculations.js';
import { inicioUI } from './inicio-ui.js';

const vacio = valor => !Array.isArray(valor) || valor.length === 0;

function registro() {
  const cargados = [];
  const guardar = (clave, valor, nombre) => {
    store.setPersisted(clave, valor);
    cargados.push(nombre);
  };
  return { cargados, guardar };
}

// Carga el ejemplo ficticio de MUNO MODA en los módulos de la empresa, con los mismos datos
// que el botón "Cargar ejemplo" de cada uno. Solo escribe en los módulos vacíos.
export function cargarEjemploEmpresa() {
  const { cargados, guardar } = registro();
  let periodos = store.get('estados')?.periods;
  if (vacio(periodos)) {
    const estados = normalizeFinancialData(DEMO_MUNOMODA);
    guardar('estados', estados, 'Estados financieros');
    periodos = estados.periods;
  }
  if (!Object.keys(store.get('razonesMercado')?.periodos || {}).length) guardar('razonesMercado', ejemploMercado(periodos), 'Razones de mercado');
  if (!store.get('planeacion')?.supuestos) guardar('planeacion', { supuestos: normalizarSupuestos(ejemploPlaneacion()) }, 'Presupuesto maestro');
  if (store.get('equilibrio')?.precio == null) guardar('equilibrio', normalizarEquilibrio(ejemploEquilibrio()), 'Punto de equilibrio');
  if (vacio(store.get('flujo')?.movimientos)) guardar('flujo', normalizarFlujo(ejemploFlujo()), 'Flujo de efectivo');
  if (vacio(store.get('inventario')?.productos)) guardar('inventario', normalizarInventario(ejemploInventario()), 'Inventario');
  return cargados;
}

// Ejemplo de finanzas personales (presupuesto personal y activos del hogar), solo si están vacíos.
export function cargarEjemploPersonal() {
  const { cargados, guardar } = registro();
  const personal = store.get('presupuesto');
  if (vacio(personal?.gastos) && vacio(personal?.ingresos)) guardar('presupuesto', { ...personal, ...ejemploPresupuestoPersonal() }, 'Presupuesto personal');
  if (vacio(store.get('activos')?.inventario)) guardar('activos', { ...store.get('activos'), inventario: ejemploActivos() }, 'Activos del hogar');
  return cargados;
}

// Totales del presupuesto personal con las mismas funciones que su pantalla.
function totalesPersonales() {
  const p = store.get('presupuesto') || {};
  const ingresos = presupuestoCalculations.ingresosDe(p.ingresos, p.ingresoMensual || 0);
  return {
    ingresos: presupuestoCalculations.totalIngresos(ingresos),
    gastos: presupuestoCalculations.totalGastos(p.gastos || []),
    metaAhorro: p.metaAhorro || 0,
    mesesDisponibles: p.mesesDisponibles || 12
  };
}

function conAviso(cargar, nombre) {
  return () => {
    try {
      const cargados = cargar();
      showToast(cargados.length ? `Ejemplo ${nombre} cargado (datos ficticios): ${cargados.join(', ')}.` : 'Esos módulos ya tenían datos.', 'success');
    } catch (error) {
      showToast(`No se pudo cargar el ejemplo: ${error.message}`, 'error');
    }
    initInicio();
  };
}

export function initInicio() {
  const page = document.getElementById('page-home');
  if (!page) return;
  const entradas = reunirEntradas();
  const activos = (store.get('activos.inventario') || []).map(a => ({ ...a, estado: calcularEstado(a) }));
  const panorama = panoramaGeneral(entradas, construirReporte(entradas), { presupuesto: totalesPersonales(), activos });
  inicioUI(page, {
    panorama,
    graficar: renderChart,
    cargarEjemploEmpresa: conAviso(cargarEjemploEmpresa, 'de empresa'),
    cargarEjemploPersonal: conAviso(cargarEjemploPersonal, 'personal')
  });
}
