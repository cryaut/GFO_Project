import store from './store.js';
import { initPresupuesto } from './modules/presupuesto/index.js';
import { initEstados, hasUnsavedStates } from './modules/estados/index.js';
import { initAnalisis } from './modules/analisis/index.js';
import { initActivos } from './modules/activos/index.js';
import { initMercados } from './modules/mercados/index.js';
import { initReportes } from './modules/integracion/index.js';
import { initApalancamiento } from './modules/apalancamiento/index.js';
import { initInventario } from './modules/inventario/index.js';
import { initEquilibrio } from './modules/equilibrio/index.js';
import { initFlujo } from './modules/flujo/index.js';
import { initPlaneacion } from './modules/planeacion/index.js';
import { initProforma } from './modules/proforma/index.js';
import { initInicio } from './modules/inicio/index.js';
import { refreshChartsTheme } from './components/chart.js';

const routes = {
  'home': { init: initInicio, label: 'Inicio' },
  'presupuesto': { init: initPresupuesto, label: 'Presupuesto personal' },
  'estados': { init: initEstados, label: 'Estados Financieros' },
  'analisis': { init: initAnalisis, label: 'Análisis' },
  'activos': { init: initActivos, label: 'Activos del hogar' },
  'mercados': { init: initMercados, label: 'Mercados' },
  'reportes': { init: initReportes, label: 'Reportes' },
  'glosario': { init: initGlosario, label: 'Glosario' },
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
  if (r && r.init) r.init();
}

function initGlosario() {
  const page = document.getElementById('page-glosario');
  if (!page) return;
  import('./modules/mercados/index.js').then(({ glosario }) => {
    page.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Glosario de Términos Financieros</h1>
        <p class="page-subtitle">${glosario.length} términos definidos</p>
      </div>
      <div class="glossary-grid">
        ${glosario.map(g => `
          <div class="glossary-item">
            <h4>${g.termino}</h4>
            <p>${g.definicion}</p>
          </div>`).join('')}
      </div>`;
  });
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

function init() {
  store.load();
  initThemeToggle();
  initMobileMenu();
  navigate(getRoute());
  window.addEventListener('hashchange', () => navigate(getRoute()));
  window.addEventListener('beforeunload', event => {
    if (!hasUnsavedStates()) return;
    event.preventDefault();
    event.returnValue = '';
  });
}

document.addEventListener('DOMContentLoaded', init);
