import store from './store.js';
import { initPresupuesto } from './modules/presupuesto/index.js';
import { initEstados } from './modules/estados/index.js';
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

const routes = {
  'home': { init: initHome, label: 'Inicio' },
  'presupuesto': { init: initPresupuesto, label: 'Presupuesto' },
  'estados': { init: initEstados, label: 'Estados Financieros' },
  'analisis': { init: initAnalisis, label: 'Análisis' },
  'activos': { init: initActivos, label: 'Activos' },
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
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const page = document.getElementById(`page-${route}`);
  const nav = document.querySelector(`[data-route="${route}"]`);
  if (page) page.classList.add('active');
  if (nav) nav.classList.add('active');

  const r = routes[route];
  if (r && r.init) r.init();
}

function initHome() {
  const page = document.getElementById('page-home');
  if (!page) return;
  page.innerHTML = `
    <div class="home-hero">
      <h1>GFO <span style="color:var(--color-primary)">Toolkit</span></h1>
      <p class="subtitle">Herramienta de Gestión Financiera Operativa. Presupuesto, estados financieros, análisis, activos y mercados — todo en un solo lugar.</p>
    </div>
    <div class="module-grid">
      <a href="#/presupuesto" class="module-card">
        <div class="module-card-icon budget">$</div>
        <h3>Presupuesto Personal</h3>
        <p>Administra tus finanzas semanales con el método de pagarse primero. Controla ingresos, gastos y ahorro.</p>
      </a>
      <a href="#/estados" class="module-card">
        <div class="module-card-icon states">%</div>
        <h3>Estados Financieros</h3>
        <p>Balance General y Estado de Resultados multiperiodo. Cargue la demo MUNO MODA S.A.</p>
      </a>
      <a href="#/analisis" class="module-card">
        <div class="module-card-icon analysis">+</div>
        <h3>Análisis Financiero</h3>
        <p>AH, AV, Razones, CNT/CNO, EOAF, EFE, DuPont e Interpretación heurística.</p>
      </a>
      <a href="#/activos" class="module-card">
        <div class="module-card-icon assets">*</div>
        <h3>Activos y Depreciación</h3>
        <p>Inventario de activos, depreciación línea recta, evaluación de condición y recomendación.</p>
      </a>
      <a href="#/mercados" class="module-card">
        <div class="module-card-icon markets">~</div>
        <h3>Mercados Financieros</h3>
        <p>Glosario interactivo, comparador bonos vs acciones, sistema financiero nicaragüense y quiz.</p>
      </a>
      <a href="#/reportes" class="module-card">
        <div class="module-card-icon reports">#</div>
        <h3>Reportes e Integración</h3>
        <p>Exportar JSON/CSV/HTML, dashboard con KPIs y resumen global de módulos.</p>
      </a>
      <a href="#/apalancamiento" class="module-card">
        <div class="module-card-icon analysis">×</div>
        <h3>Apalancamiento</h3>
        <p>GAO, GAF y GAT por periodo a partir de los estados guardados, con la traza de cada cálculo.</p>
      </a>
      <a href="#/equilibrio" class="module-card">
        <div class="module-card-icon analysis">=</div>
        <h3>Punto de Equilibrio y C-V-U</h3>
        <p>Margen de contribución, punto de equilibrio en unidades y en C$, margen de seguridad, escenarios y gráfica.</p>
      </a>
      <a href="#/flujo" class="module-card">
        <div class="module-card-icon states">⇅</div>
        <h3>Flujo de Efectivo</h3>
        <p>Entradas y salidas por actividades de operación, inversión y financiamiento; variación neta y saldo final.</p>
      </a>
      <a href="#/planeacion" class="module-card">
        <div class="module-card-icon budget">▦</div>
        <h3>Presupuesto Maestro</h3>
        <p>Presupuestos de ventas, compras, costo de bienes vendidos, gastos de operación y caja, con saldo proyectado.</p>
      </a>
      <a href="#/proforma" class="module-card">
        <div class="module-card-icon reports">∑</div>
        <h3>Proforma y Reporte Integrado</h3>
        <p>Estado de resultados proforma, efectivo proyectado, indicadores de todos los módulos y alertas para decidir.</p>
      </a>
      <a href="#/inventario" class="module-card">
        <div class="module-card-icon assets">▣</div>
        <h3>Control de Inventario</h3>
        <p>Existencia final, valor del inventario, kardex por producto y alertas de reposición con stock mínimo.</p>
      </a>
    </div>`;
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
}

document.addEventListener('DOMContentLoaded', init);
