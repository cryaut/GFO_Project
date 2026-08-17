import store from '../../store.js';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/format.js';
import { exportJSON, exportCSV, exportHTML } from '../../utils/export.js';
import { showToast } from '../../components/toast.js';

function computeDashboardKPIs() {
  const periods = store.get('estados.periods') || [];
  const lastP = periods[periods.length - 1];
  if (!lastP) return null;

  const bg = store.get('estados.balanceGeneral')?.[lastP] || {};
  const er = store.get('estados.estadoResultados')?.[lastP] || {};
  const activos = bg.activos || {};
  const pasivos = bg.pasivos || {};
  const patrimonio = bg.patrimonio || {};

  const totalActivos = Object.values(activos).reduce((s, v) => s + v, 0);
  const totalPasivos = Object.values(pasivos).reduce((s, v) => s + v, 0);
  const totalPatrimonio = Object.values(patrimonio).reduce((s, v) => s + v, 0);
  const ventas = er['Ventas'] || 0;
  const utilidadNeta = ventas - (er['Costo de Ventas'] || 0) - (er['Gastos de Administracion'] || 0) -
    (er['Gastos de Ventas'] || 0) + (er['Otros Ingresos'] || 0) - (er['Otros Gastos'] || 0);

  const ingreso = store.get('presupuesto.ingresoMensual') || 0;
  const meta = store.get('presupuesto.metaAhorro') || 0;
  const activosCount = (store.get('activos.inventario') || []).length;
  const quizScore = store.get('mercados.quizScore') || 0;

  return {
    totalActivos, totalPasivos, totalPatrimonio,
    ventas, utilidadNeta,
    presupuestoIngreso: ingreso, presupuestoMeta: meta,
    activosCount, quizScore,
    endeudamiento: totalActivos > 0 ? totalPasivos / totalActivos : 0,
    roa: totalActivos > 0 ? utilidadNeta / totalActivos : 0
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
      <div class="kpi-card"><div class="kpi-value">${formatPercent(kpis.endeudamiento)}</div><div class="kpi-label">Endeudamiento</div></div>
      <div class="kpi-card"><div class="kpi-value">${formatPercent(kpis.roa)}</div><div class="kpi-label">ROA</div></div>
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
    const bg = store.get('estados.balanceGeneral') || {};
    if (periods.length === 0) return showToast('No hay datos para exportar', 'warning');

    const headers = ['Cuenta', ...periods];
    const allAccounts = new Set();
    for (const p of periods) {
      const data = bg[p] || {};
      for (const group of ['activos', 'pasivos', 'patrimonio']) {
        Object.keys(data[group] || {}).forEach(a => allAccounts.add(a));
      }
    }
    const rows = Array.from(allAccounts).map(acc => [
      acc,
      ...periods.map(p => {
        const data = bg[p] || {};
        for (const group of ['activos', 'pasivos', 'patrimonio']) {
          if (data[group]?.[acc] !== undefined) return data[group][acc];
        }
        return '';
      })
    ]);
    exportCSV(rows, headers, 'gfo-estados.csv');
    showToast('CSV exportado', 'success');
  });

  page.querySelector('#btnExportHTML')?.addEventListener('click', () => {
    const kpis = computeDashboardKPIs();
    const periods = store.get('estados.periods') || [];
    const bg = store.get('estados.balanceGeneral') || {};
    let html = `<h1>GFO Toolkit — Reporte</h1>`;
    html += `<h2>Resumen</h2>`;
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
      html += `</tbody></table>`;
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
