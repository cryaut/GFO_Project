// Ruta #/home: panorama general. Reutiliza la recolección de la proforma para que cada
// cifra salga de la misma función que la muestra en su módulo.
import store from '../../store.js';
import { renderChart } from '../../components/chart.js';
import { showToast } from '../../components/toast.js';
import { calcularEstado, ejemploActivos } from '../activos/index.js';
import { ejemploMercado, normalizarDatosMercado } from '../analisis/mercado-calculations.js';
import { casoHistoricoReal, casoOperativoSimulado } from '../../examples/ejemplos-agricorp.js';
import { ejemploEquilibrio, normalizarEquilibrio } from '../equilibrio/equilibrio-calculations.js';
import { getDemoData } from '../estados/index.js';
import { crearEjemplo } from '../../examples/catalogo.js';
import { normalizeFinancialData } from '../estados/estados-normalize.js';
import { ejemploFlujo, normalizarFlujo } from '../flujo/flujo-calculations.js';
import { ejemploInventario, normalizarInventario } from '../inventario/inventario-calculations.js';
import { ejemploPlaneacion, normalizarSupuestos } from '../planeacion/planeacion-calculations.js';
import { tieneEscenarios } from '../planeacion/planeacion-escenarios.js';
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

// Casos AGRI-CORP: reemplazan todos los módulos de empresa. Lo que el caso no usa queda vacío
// para no mezclar el caso histórico real con la unidad simulada.
function cargarCasoAgricorp(id) {
  const caso = id === 'agricorp-historico' ? casoHistoricoReal() : casoOperativoSimulado();
  const { cargados, guardar } = registro();
  guardar('estados', normalizeFinancialData(caso.estados), 'Estados financieros');
  guardar('apalancamiento', caso.apalancamiento, 'Apalancamiento');
  guardar('razonesMercado', normalizarDatosMercado(caso.razonesMercado), 'Razones de mercado');
  guardar('flujo', normalizarFlujo(caso.flujo), 'Flujo de efectivo');
  guardar('inventario', caso.inventario ? normalizarInventario(caso.inventario) : { productos: [], movimientos: [] }, 'Inventario');
  guardar('equilibrio', normalizarEquilibrio(caso.equilibrio ?? null), 'Punto de equilibrio');
  guardar('planeacion', caso.planeacion ? { supuestos: normalizarSupuestos(caso.planeacion.supuestos) } : { supuestos: null }, 'Presupuesto maestro');
  return cargados;
}

// Carga el ejemplo ficticio de MUNO MODA en los módulos de la empresa, con los mismos datos
// que el botón "Cargar ejemplo" de cada uno. Solo escribe en los módulos vacíos.
export function cargarEjemploEmpresa(id = 'actual') {
  if (id.startsWith('agricorp-')) return cargarCasoAgricorp(id);
  const { cargados, guardar } = registro();
  if (id !== 'actual') {
    guardar('estados', normalizeFinancialData(crearEjemplo('inicioEmpresa', id, getDemoData)), 'Estados financieros');
    return cargados;
  }
  let periodos = store.get('estados')?.periods;
  if (vacio(periodos)) {
    const estados = normalizeFinancialData(getDemoData());
    guardar('estados', estados, 'Estados financieros');
    periodos = estados.periods;
  }
  if (!Object.keys(store.get('razonesMercado')?.periodos || {}).length) guardar('razonesMercado', ejemploMercado(periodos), 'Razones de mercado');
  const planeacion = store.get('planeacion');
  if (!planeacion?.supuestos && !tieneEscenarios(planeacion)) {
    guardar('planeacion', { supuestos: normalizarSupuestos(ejemploPlaneacion()) }, 'Presupuesto maestro');
  }
  if (store.get('equilibrio')?.precio == null) guardar('equilibrio', normalizarEquilibrio(ejemploEquilibrio()), 'Punto de equilibrio');
  if (vacio(store.get('flujo')?.movimientos)) guardar('flujo', normalizarFlujo(ejemploFlujo()), 'Flujo de efectivo');
  if (vacio(store.get('inventario')?.productos)) guardar('inventario', normalizarInventario(ejemploInventario()), 'Inventario');
  return cargados;
}

// Ejemplo de finanzas personales (presupuesto personal y activos del hogar), solo si están vacíos.
export function cargarEjemploPersonal(id = 'actual') {
  const { cargados, guardar } = registro();
  const personal = store.get('presupuesto');
  if (vacio(personal?.gastos) && vacio(personal?.ingresos)) guardar('presupuesto', { ...personal, ...crearEjemplo('inicioPersonal', id, ejemploPresupuestoPersonal) }, 'Presupuesto personal');
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
  return (id = 'actual') => {
    try {
      const cargados = cargar(id);
      showToast(cargados.length ? `Ejemplo ${nombre} seleccionado cargado: ${cargados.join(', ')}.` : 'Esos módulos ya tenían datos; no se reemplazaron.', 'success');
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
