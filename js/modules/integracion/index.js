import store from '../../store.js';
import { formatCurrency, formatPercent } from '../../utils/format.js';
import { exportJSON, exportCSV, exportHTML } from '../../utils/export.js';
import { showToast } from '../../components/toast.js';
import { computeFinancialTotals } from '../estados/estados-calculations.js';
import { normalizeFinancialData } from '../estados/estados-normalize.js';
import { computeRazones, refreshSavedStates } from '../analisis/index.js';

function getNormalizedStates() {
  // Single source of truth: the same normalized engine Análisis consumes, so
  // imported/custom account names are summed instead of the fixed-name lookup.
  try {
    return normalizeFinancialData({
      name: store.get('estados.name') || 'Datos guardados',
      periods: store.get('estados.periods') || [],
      balanceGeneral: store.get('estados.balanceGeneral') || {},
      estadoResultados: store.get('estados.estadoResultados') || {},
      accountTypes: store.get('estados.accountTypes')
    });
  } catch {
    return null;
  }
}

function getSavedTotals(period) {
  const states = getNormalizedStates();
  return states && states.periods.includes(period) ? computeFinancialTotals(states, period) : null;
}

function computeDashboardKPIs() {
  // Periodos normalizados (orden cronológico) y caché de Análisis refrescada:
  // el ROA/endeudamiento del dashboard salen de computeRazones, la misma lógica
  // que la pestaña Análisis (no un cálculo paralelo con activo de cierre).
  const states = getNormalizedStates();
  const rawPeriods = store.get('estados.periods') || [];
  const periods = states ? states.periods : rawPeriods;
  const lastP = periods[periods.length - 1];
  if (!lastP) return null;

  const shared = getSavedTotals(lastP);
  const bg = store.get('estados.balanceGeneral')?.[lastP] || {};
  const er = store.get('estados.estadoResultados')?.[lastP] || {};
  const sum = source => Object.values(source || {}).reduce((s, v) => s + v, 0);

  const totalActivos = shared ? shared.totalActivos : sum(bg.activos);
  const totalPasivos = shared ? shared.totalPasivos : sum(bg.pasivos);
  const totalPatrimonio = shared ? shared.totalPatrimonio : sum(bg.patrimonio);
  const ventas = shared ? shared.ventas : (er['Ventas'] || 0);
  const utilidadNeta = shared && Number.isFinite(shared.utilidadNeta) ? shared.utilidadNeta
    : (er['Ventas'] || 0) - (er['Costo de Ventas'] || 0) - (er['Gastos de Administracion'] || 0) -
      (er['Gastos de Ventas'] || 0) + (er['Otros Ingresos'] || 0) - (er['Otros Gastos'] || 0);

  refreshSavedStates();
  const razones = computeRazones(lastP);

  const ingreso = store.get('presupuesto.ingresoMensual') || 0;
  const meta = store.get('presupuesto.metaAhorro') || 0;
  const activosCount = (store.get('activos.inventario') || []).length;
  const quizScore = store.get('mercados.quizScore') || 0;

  return {
    totalActivos, totalPasivos, totalPatrimonio,
    ventas, utilidadNeta,
    presupuestoIngreso: ingreso, presupuestoMeta: meta,
    activosCount, quizScore,
    // null (N/D) cuando el denominador no permite calcularla, como en Análisis.
    endeudamiento: razones.endeudamiento,
    roa: razones.ROA
  };
}

export function initReportes() {
  const page = document.getElementById('page-reportes');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Reportes e Integración</h1>
      <p class="page-subtitle">Exportar datos, dashboard KPIs y reportes</p>
    </div>
    <div class="tabs">
      <button class="tab-btn active" data-tab="dashboard">Dashboard</button>
      <button class="tab-btn" data-tab="export">Exportar</button>
    </div>
    <div class="tab-content active" id="tab-dashboard">
      <div id="dashboardContent"></div>
    </div>
    <div class="tab-content" id="tab-export">
      <div class="card">
        <h3 class="mb-4">Exportar Datos</h3>
        <div class="flex-gap flex-wrap">
          <button class="btn btn-primary" id="btnExportJSON">Exportar JSON</button>
          <button class="btn btn-secondary" id="btnExportCSV">Exportar CSV</button>
          <button class="btn btn-secondary" id="btnExportHTML">Vista Previa HTML</button>
          <button class="btn btn-success" id="btnImportJSON">Importar JSON</button>
          <input type="file" id="importFileInput" accept=".json" style="display:none">
        </div>
        <div id="exportPreview" class="mt-6"></div>
      </div>
    </div>`;

  page.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      page.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      page.querySelector(`#tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });

  renderDashboard(page);
  bindExportEvents(page);
}

function renderDashboard(page) {
  const el = page.querySelector('#dashboardContent');
  if (!el) return;
  const kpis = computeDashboardKPIs();

  if (!kpis) {
    el.innerHTML = '<div class="empty-state"><p>Cargue datos primero (módulo Estados Financieros) para ver el dashboard.</p></div>';
    return;
  }

  el.innerHTML = `
    <div class="kpi-grid mb-8">
      <div class="kpi-card"><div class="kpi-value">${formatCurrency(kpis.totalActivos)}</div><div class="kpi-label">Total Activos</div></div>
      <div class="kpi-card"><div class="kpi-value" style="color:var(--color-danger)">${formatCurrency(kpis.totalPasivos)}</div><div class="kpi-label">Total Pasivos</div></div>
      <div class="kpi-card"><div class="kpi-value" style="color:var(--color-success)">${formatCurrency(kpis.totalPatrimonio)}</div><div class="kpi-label">Patrimonio</div></div>
      <div class="kpi-card"><div class="kpi-value">${formatCurrency(kpis.ventas)}</div><div class="kpi-label">Ventas</div></div>
      <div class="kpi-card"><div class="kpi-value ${kpis.utilidadNeta >= 0 ? '' : 'text-danger'}">${formatCurrency(kpis.utilidadNeta)}</div><div class="kpi-label">Utilidad Neta</div></div>
      <div class="kpi-card"><div class="kpi-value">${kpis.endeudamiento == null ? 'N/D' : formatPercent(kpis.endeudamiento)}</div><div class="kpi-label">Endeudamiento</div></div>
      <div class="kpi-card"><div class="kpi-value">${kpis.roa == null ? 'N/D' : formatPercent(kpis.roa)}</div><div class="kpi-label">ROA</div></div>
      <div class="kpi-card"><div class="kpi-value">${kpis.activosCount}</div><div class="kpi-label">Activos Registrados</div></div>
    </div>
    <div class="card">
      <h3 class="mb-4">Resumen por Módulo</h3>
      <div class="table-wrapper"><table>
        <thead><tr><th>Módulo</th><th>Estado</th><th>Detalle</th></tr></thead>
        <tbody>
          <tr><td>Estados Financieros</td><td><span class="badge badge-success">Activo</span></td><td>${kpis.totalActivos > 0 ? 'Datos cargados' : 'Sin datos'}</td></tr>
          <tr><td>Presupuesto</td><td><span class="badge ${kpis.presupuestoIngreso > 0 ? 'badge-success' : 'badge-warning'}">${kpis.presupuestoIngreso > 0 ? 'Configurado' : 'Sin configurar'}</span></td><td>Ingreso: ${formatCurrency(kpis.presupuestoIngreso)}</td></tr>
          <tr><td>Activos</td><td><span class="badge ${kpis.activosCount > 0 ? 'badge-success' : 'badge-warning'}">${kpis.activosCount > 0 ? 'Con inventario' : 'Sin inventario'}</span></td><td>${kpis.activosCount} activos</td></tr>
          <tr><td>Mercados - Quiz</td><td><span class="badge badge-info">Quiz</span></td><td>Último puntaje: ${kpis.quizScore}/12</td></tr>
        </tbody>
      </table></div>
    </div>`;
}

function bindExportEvents(page) {
  page.querySelector('#btnExportJSON')?.addEventListener('click', () => {
    const data = store.getAll();
    exportJSON(data, 'gfo-toolkit-export.json');
    showToast('JSON exportado', 'success');
  });

  page.querySelector('#btnExportCSV')?.addEventListener('click', () => {
    const periods = store.get('estados.periods') || [];
    if (periods.length === 0) return showToast('No hay datos para exportar', 'warning');
    const bg = store.get('estados.balanceGeneral') || {};
    const er = store.get('estados.estadoResultados') || {};
    const types = store.get('estados.accountTypes') || {};
    const accountNames = (statement, group) => {
      const names = new Set();
      for (const p of periods) {
        const scope = group ? statement[p]?.[group] : statement[p];
        Object.keys(scope || {}).forEach(name => names.add(name));
      }
      return [...names];
    };

    // Estado/Grupo/Cuenta/Clasificacion make the CSV round-trip through the
    // Estados importer, instead of a period-only sheet that could not be reloaded.
    const headers = ['Estado', 'Grupo', 'Cuenta', 'Clasificacion', ...periods];
    const rows = [];
    for (const group of ['activos', 'pasivos', 'patrimonio']) {
      for (const account of accountNames(bg, group)) {
        rows.push(['Balance', group, account, types[group]?.[account] || '',
          ...periods.map(p => bg[p]?.[group]?.[account] ?? '')]);
      }
    }
    for (const account of accountNames(er)) {
      rows.push(['Resultados', '', account, types.estadoResultados?.[account] || '',
        ...periods.map(p => er[p]?.[account] ?? '')]);
    }
    if (rows.length === 0) return showToast('No hay cuentas para exportar', 'warning');
    exportCSV(rows, headers, 'gfo-estados.csv');
    showToast('CSV exportado (reimportable en Estados)', 'success');
  });

  page.querySelector('#btnExportHTML')?.addEventListener('click', () => {
    const kpis = computeDashboardKPIs();
    const periods = store.get('estados.periods') || [];
    const bg = store.get('estados.balanceGeneral') || {};
    let html = '<h1>GFO Toolkit — Reporte</h1>';
    html += '<h2>Resumen</h2>';
    if (kpis) {
      html += `<p>Total Activos: ${formatCurrency(kpis.totalActivos)} | Total Pasivos: ${formatCurrency(kpis.totalPasivos)} | Patrimonio: ${formatCurrency(kpis.totalPatrimonio)}</p>`;
      html += `<p>Ventas: ${formatCurrency(kpis.ventas)} | Utilidad Neta: ${formatCurrency(kpis.utilidadNeta)}</p>`;
    }
    if (periods.length > 0) {
      html += `<h2>Balance General</h2><table><thead><tr><th>Cuenta</th>${periods.map(p => `<th>${p}</th>`).join('')}</tr></thead><tbody>`;
      for (const p of periods) {
        const data = bg[p] || {};
        for (const [group, label] of [['activos', 'Activos'], ['pasivos', 'Pasivos'], ['patrimonio', 'Patrimonio']]) {
          for (const [k, v] of Object.entries(data[group] || {})) {
            html += `<tr><td>${k}</td><td>${formatCurrency(v)}</td></tr>`;
          }
        }
      }
      html += '</tbody></table>';
    }
    exportHTML(html, 'gfo-reporte.html');
    showToast('Reporte HTML generado', 'success');
  });

  const importInput = page.querySelector('#importFileInput');
  page.querySelector('#btnImportJSON')?.addEventListener('click', () => importInput?.click());
  importInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { importJSON } = await import('../../utils/export.js');
      const data = await importJSON(file);
      Object.keys(data).forEach(key => {
        if (key !== 'theme') store.set(key, data[key]);
      });
      showToast('Datos importados correctamente', 'success');
      renderDashboard(page);
    } catch (err) {
      showToast('Error al importar: ' + err.message, 'error');
    }
    importInput.value = '';
  });
}
