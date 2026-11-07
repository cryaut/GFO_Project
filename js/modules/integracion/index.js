import store from '../../store.js';
import { formatCurrency, formatCurrencyND, formatPercent } from '../../utils/format.js';
import { escapeHTML as esc } from '../../utils/html.js';
import { exportJSON, exportCSV, exportHTML, importJSON } from '../../utils/export.js';
import { showToast } from '../../components/toast.js';
import { computeFinancialTotals } from '../estados/estados-calculations.js';
import { leerEstados } from '../../utils/estados-guardados.js';
import { computeRazones, refreshSavedStates } from '../analisis/index.js';
import { obtenerUtilidadNetaMotor } from '../razones/razones-app-adapter.js';
import { validarRespaldo, MAX_RESPALDO_BYTES } from './integracion-respaldo.js';
import { construirReporteHTML } from './integracion-reporte.js';

// D-077: una sola lectura. Devuelve { estados, error } para quien necesita el
// motivo y solo los estados para el resto.
function leerGuardados() {
  return leerEstados(store.get('estados'));
}

function getNormalizedStates() {
  // Single source of truth: the same normalized engine Análisis consumes, so
  // imported/custom account names are summed instead of the fixed-name lookup.
  return leerGuardados().estados;
}

export function getSavedTotals(period) {
  const states = getNormalizedStates();
  return states && states.periods.includes(period) ? computeFinancialTotals(states, period) : null;
}

function computeDashboardKPIs() {
  // Periodos normalizados (orden cronológico) y caché de Análisis refrescada:
  // el ROA/endeudamiento del dashboard salen de computeRazones, la misma lógica
  // que la pestaña Análisis (no un cálculo paralelo con activo de cierre).
  const { estados, error } = leerGuardados();
  const rawPeriods = store.get('estados.periods') || [];
  const periods = estados ? estados.periods : rawPeriods;
  const lastP = periods[periods.length - 1];
  if (!lastP) return null;

  // D-078: sin respaldo por nombres fijos. Sin estados legibles, los totales
  // salen N/D (null) y el estado del dashboard es el error real.
  const shared = getSavedTotals(lastP);
  const lectura = {
    estado: estados ? 'ok' : 'error',
    mensaje: error ? `No se pudieron leer los estados guardados: ${error}` : null
  };

  refreshSavedStates();
  const razones = computeRazones(lastP);

  const ingreso = store.get('presupuesto.ingresoMensual') || 0;
  const meta = store.get('presupuesto.metaAhorro') || 0;
  const activosCount = (store.get('activos.inventario') || []).length;
  const quizScore = store.get('mercados.quizScore') || 0;

  return {
    totalActivos: shared ? shared.totalActivos : null,
    totalPasivos: shared ? shared.totalPasivos : null,
    totalPatrimonio: shared ? shared.totalPatrimonio : null,
    ventas: shared ? shared.ventas : null,
    utilidadNeta: estados ? obtenerUtilidadNetaMotor(store.get('estados'), lastP).valor : null,
    presupuestoIngreso: ingreso, presupuestoMeta: meta,
    activosCount, quizScore,
    lectura,
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
          <button class="btn btn-secondary" id="btnPreviewHTML">Vista previa del reporte</button>
          <button class="btn btn-secondary" id="btnExportHTML">Descargar reporte HTML</button>
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

  // D-078: el estado de Estados Financieros es el real — activo, o con error
  // visible cuando los estados guardados no se pueden leer (nunca «Activo» fijo).
  const enError = kpis.lectura.estado === 'error';
  const aviso = enError
    ? `<p class="form-hint mb-4" style="color:var(--color-danger)">${esc(kpis.lectura.mensaje)}</p>`
    : '';
  const insigniaEstados = enError
    ? '<span class="badge badge-danger">Con error</span>'
    : '<span class="badge badge-success">Activo</span>';
  const detalleEstados = enError
    ? 'Los estados guardados no se pueden leer: las cifras de la empresa salen N/D.'
    : kpis.totalActivos != null ? 'Datos cargados' : 'Sin datos';

  el.innerHTML = `
    ${aviso}
    <div class="kpi-grid mb-8">
      <div class="kpi-card"><div class="kpi-value">${formatCurrencyND(kpis.totalActivos)}</div><div class="kpi-label">Total Activos</div></div>
      <div class="kpi-card"><div class="kpi-value" style="color:var(--color-danger)">${formatCurrencyND(kpis.totalPasivos)}</div><div class="kpi-label">Total Pasivos</div></div>
      <div class="kpi-card"><div class="kpi-value" style="color:var(--color-success)">${formatCurrencyND(kpis.totalPatrimonio)}</div><div class="kpi-label">Patrimonio</div></div>
      <div class="kpi-card"><div class="kpi-value">${formatCurrencyND(kpis.ventas)}</div><div class="kpi-label">Ventas</div></div>
      <div class="kpi-card"><div class="kpi-value ${kpis.utilidadNeta != null && kpis.utilidadNeta >= 0 ? '' : 'text-danger'}">${formatCurrencyND(kpis.utilidadNeta)}</div><div class="kpi-label">Utilidad Neta</div></div>
      <div class="kpi-card"><div class="kpi-value">${kpis.endeudamiento == null ? 'N/D' : formatPercent(kpis.endeudamiento)}</div><div class="kpi-label">Endeudamiento</div></div>
      <div class="kpi-card"><div class="kpi-value">${kpis.roa == null ? 'N/D' : formatPercent(kpis.roa)}</div><div class="kpi-label">ROA</div></div>
    </div>
    <div class="card">
      <h3 class="mb-4">Resumen por Módulo</h3>
      <div class="table-wrapper"><table>
        <thead><tr><th>Módulo</th><th>Estado</th><th>Detalle</th></tr></thead>
        <tbody>
          <tr><th scope="rowgroup" colspan="3">Empresa</th></tr>
          <tr><td>Estados Financieros</td><td>${insigniaEstados}</td><td>${detalleEstados}</td></tr>
          <tr><th scope="rowgroup" colspan="3">Finanzas personales (independientes de la empresa)</th></tr>
          <tr><td>Presupuesto personal</td><td><span class="badge ${kpis.presupuestoIngreso > 0 ? 'badge-success' : 'badge-warning'}">${kpis.presupuestoIngreso > 0 ? 'Configurado' : 'Sin configurar'}</span></td><td>Ingreso: ${formatCurrency(kpis.presupuestoIngreso)}</td></tr>
          <tr><td>Activos del hogar</td><td><span class="badge ${kpis.activosCount > 0 ? 'badge-success' : 'badge-warning'}">${kpis.activosCount > 0 ? 'Con bienes' : 'Sin bienes'}</span></td><td>${kpis.activosCount} bienes registrados</td></tr>
          <tr><th scope="rowgroup" colspan="3">Aprender</th></tr>
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

  const cuerpoReporte = () => {
    const { error } = leerGuardados();
    // D-078: el reporte distingue «no hay datos» de «hay datos que no se leen».
    return construirReporteHTML({ kpis: computeDashboardKPIs(), estados: getNormalizedStates(), errorEstados: error });
  };

  page.querySelector('#btnPreviewHTML')?.addEventListener('click', () => {
    const preview = page.querySelector('#exportPreview');
    if (preview) preview.innerHTML = `<div class="card">${cuerpoReporte()}</div>`;
  });

  page.querySelector('#btnExportHTML')?.addEventListener('click', () => {
    exportHTML(`<h1>GFO Toolkit — Reporte</h1>${cuerpoReporte()}`, 'gfo-reporte.html');
    showToast('Reporte HTML generado', 'success');
  });

  const importInput = page.querySelector('#importFileInput');
  page.querySelector('#btnImportJSON')?.addEventListener('click', () => importInput?.click());
  importInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > MAX_RESPALDO_BYTES) throw new Error('El archivo supera el máximo de 5 MB.');
      const { modulos, omitidos } = validarRespaldo(await importJSON(file), store.getAll());
      const nombres = Object.keys(modulos);
      if (!window.confirm(`Se reemplazarán los datos de: ${nombres.join(', ')}. ¿Continuar?`)) {
        showToast('Importación cancelada', 'warning');
        return;
      }
      try {
        store.setModulesPersisted(modulos);
      } catch (error) {
        throw new Error(`No se pudo guardar (${error.message}). Se conservaron los datos anteriores.`);
      }
      const nota = omitidos.length ? ` (se omitieron ${omitidos.length} elementos desconocidos)` : '';
      showToast(`Datos importados correctamente${nota}`, 'success');
      renderDashboard(page);
    } catch (err) {
      showToast('Error al importar: ' + err.message, 'error');
    } finally {
      importInput.value = '';
    }
  });
}
