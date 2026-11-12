import store from './store.js';
import { initPresupuesto } from './modules/presupuesto/index.js';
import { initEstados } from './modules/estados/index.js';
import { initAnalisis } from './modules/analisis/index.js';
import { initActivos } from './modules/activos/index.js';
import { initReportes } from './modules/integracion/index.js';
import { initApalancamiento } from './modules/apalancamiento/index.js';
import { initInventario } from './modules/inventario/index.js';
import { initEquilibrio } from './modules/equilibrio/index.js';
import { initFlujo } from './modules/flujo/index.js';
import { initPlaneacion } from './modules/planeacion/index.js';
import { initProforma } from './modules/proforma/index.js';
import { initInicio } from './modules/inicio/index.js';
import { avisoCaso, bannerCaso } from './utils/casos.js';
import { refreshChartsTheme } from './components/chart.js';
import { escapeHTML } from './utils/html.js';

const routes = {
  'home': { init: initInicio, label: 'Inicio' },
  'presupuesto': { init: initPresupuesto, label: 'Presupuesto personal' },
  'estados': { init: initEstados, label: 'Estados Financieros' },
  'analisis': { init: initAnalisis, label: 'Análisis' },
  'activos': { init: initActivos, label: 'Activos del hogar' },
  'reportes': { init: initReportes, label: 'Reportes' },
  'apalancamiento': { init: initApalancamiento, label: 'Apalancamiento' },
  'inventario': { init: initInventario, label: 'Inventario' },
  'equilibrio': { init: initEquilibrio, label: 'Punto de Equilibrio' },
  'flujo': { init: initFlujo, label: 'Flujo de Efectivo' },
  'planeacion': { init: initPlaneacion, label: 'Presupuesto Maestro' },
  'proforma': { init: initProforma, label: 'Proforma y Reporte' }
};

function getRoute() {
  const hash = window.location.hash.replace('#/', '') || 'home';
  return hash;
}

function navigate(route) {
  if (!Object.hasOwn(routes, route)) route = 'home';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const page = document.getElementById(`page-${route}`);
  const nav = document.querySelector(`[data-route="${route}"]`);
  if (page) page.classList.add('active');
  if (nav) nav.classList.add('active');

  const r = routes[route];
  if (r && r.init) {
    try {
      r.init();
    } catch (error) {
      console.error(`No se pudo cargar la sección ${r.label}`, error);
      if (page) {
        page.innerHTML = `<div class="card" role="alert">
          <h1 class="page-title">No se pudo cargar ${escapeHTML(r.label)}</h1>
          <p>Vuelve a intentarlo o abre otra sección desde el menú.</p>
          <button type="button" class="btn btn-primary" id="reintentarRuta">Volver a intentar</button>
        </div>`;
        page.querySelector('#reintentarRuta')?.addEventListener('click', () => navigate(route));
      }
    }
  }
}

function initThemeToggle() {
  const saved = store.get('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    store.set('theme', next);
    // Las gráficas leen el tema al dibujarse: se recolorean sin reiniciar la pantalla.
    refreshChartsTheme();
  });
}

function initMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('menuToggle');
  toggle?.addEventListener('click', () => sidebar?.classList.toggle('open'));
  sidebar?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => sidebar?.classList.remove('open'));
  });
}

// D-113: aviso del caso de los datos (AGRI-CORP consolidado, línea de arroz o empresas
// mezcladas), encima de la pantalla activa. Vive fuera de las páginas porque cada módulo
// reescribe su página entera.
function actualizarBannerCaso() {
  const main = document.getElementById('app');
  if (!main) return;
  let banner = document.getElementById('bannerCaso');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'bannerCaso';
    main.prepend(banner);
  }
  try {
    banner.innerHTML = bannerCaso(avisoCaso(getRoute(), store.getAll()));
  } catch {
    banner.innerHTML = '';
  }
}

function init() {
  store.load();
  initThemeToggle();
  initMobileMenu();
  window.addEventListener('hashchange', () => { navigate(getRoute()); actualizarBannerCaso(); });
  store.subscribe(actualizarBannerCaso);
  navigate(getRoute());
  actualizarBannerCaso();
}

document.addEventListener('DOMContentLoaded', init);
