import store from '../../store.js';
import { ahorroMensual, saldoSemanal } from '../../utils/calculate.js';
import { formatCurrency, formatPercent } from '../../utils/format.js';
import { showToast } from '../../components/toast.js';
import { renderChart, destroyChart } from '../../components/chart.js';

export const presupuestoCalculations = {
  ahorroMensual,
  saldoSemanal,

  totalGastos(gastos) {
    return gastos.reduce((sum, g) => sum + (g.monto || 0), 0);
  },

  distribucion(gastos) {
    const cats = { necesidad: 0, deseo: 0, imprevisto: 0, meta: 0 };
    for (const g of gastos) {
      cats[g.categoria] = (cats[g.categoria] || 0) + (g.monto || 0);
    }
    return cats;
  },

  pctAsignado(monto, ingreso) {
    if (ingreso === 0) return 0;
    return monto / ingreso;
  },

  validarBalance(ingreso, gastos, ahorro, reserva) {
    const total = presupuestoCalculations.totalGastos(gastos) + ahorro + (reserva || 0);
    return Math.abs(total - ingreso) < 0.01;
  },

  ajusteInflacion(monto, tasaInflacion) {
    return monto * (1 + tasaInflacion);
  }
};

export function initPresupuesto() {
  const page = document.getElementById('page-presupuesto');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Presupuesto Personal</h1>
      <p class="page-subtitle">Administra tus finanzas semanales con el método de pagarse primero</p>
    </div>
    <div class="tabs">
      <button class="tab-btn active" data-tab="config">Configuración</button>
      <button class="tab-btn" data-tab="gastos">Gastos</button>
      <button class="tab-btn" data-tab="semanas">Semanas</button>
      <button class="tab-btn" data-tab="resumen">Resumen</button>
    </div>
    <div class="tab-content active" id="tab-config">
      <div class="card">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Ingreso Mensual (C$)</label>
            <input type="number" class="form-input" id="ingresoMensual" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label">Meta de Ahorro (C$)</label>
            <input type="number" class="form-input" id="metaAhorro" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label">Meses Disponibles</label>
            <input type="number" class="form-input" id="mesesDisponibles" min="1" max="24" value="12">
          </div>
        </div>
        <div class="budget-summary" id="budgetSummary"></div>
        <div class="form-group">
          <label class="form-label">Ajuste por Inflación (%)</label>
          <input type="number" class="form-input" id="inflacion" min="0" max="100" step="0.1" value="0">
        </div>
        <button class="btn btn-primary" id="btnAjustar">Aplicar Ajuste Inflación</button>
      </div>
    </div>
    <div class="tab-content" id="tab-gastos">
      <div class="card">
        <div class="form-row mb-4">
          <div class="form-group">
            <label class="form-label">Concepto</label>
            <input type="text" class="form-input" id="gastoConcepto" placeholder="Ej: Transporte">
          </div>
          <div class="form-group">
            <label class="form-label">Monto (C$)</label>
            <input type="number" class="form-input" id="gastoMonto" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label">Categoría</label>
            <select class="form-select" id="gastoCategoria">
              <option value="necesidad">Necesidad</option>
              <option value="deseo">Deseo</option>
              <option value="imprevisto">Imprevisto</option>
              <option value="meta">Meta</option>
            </select>
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end">
            <button class="btn btn-primary" id="btnAddGasto">Agregar</button>
          </div>
        </div>
        <div id="gastosList"></div>
        <div id="gastosChart" style="height:280px;margin-top:var(--space-4)"><canvas id="gastosPieChart"></canvas></div>
      </div>
    </div>
    <div class="tab-content" id="tab-semanas">
      <div class="card">
        <div class="form-row mb-4">
          <div class="form-group">
            <label class="form-label">Semana #</label>
            <input type="number" class="form-input" id="semanaNum" min="1" value="1">
          </div>
          <div class="form-group">
            <label class="form-label">Gasto Semanal (C$)</label>
            <input type="number" class="form-input" id="semanaGasto" min="0" step="0.01">
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end">
            <button class="btn btn-primary" id="btnAddSemana">Registrar</button>
          </div>
        </div>
        <div id="semanasList"></div>
      </div>
    </div>
    <div class="tab-content" id="tab-resumen">
      <div class="card">
        <div class="kpi-grid mb-6" id="presupuestoKpis"></div>
        <div id="validacionBalance"></div>
      </div>
    </div>`;

  bindPresupuestoEvents(page);
  renderPresupuestoData(page);
}

function bindPresupuestoEvents(page) {
  page.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      page.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tab = page.querySelector(`#tab-${btn.dataset.tab}`);
      if (tab) tab.classList.add('active');
    });
  });

  const saveConfig = () => {
    store.set('presupuesto.ingresoMensual', parseFloat(page.querySelector('#ingresoMensual').value) || 0);
    store.set('presupuesto.metaAhorro', parseFloat(page.querySelector('#metaAhorro').value) || 0);
    store.set('presupuesto.mesesDisponibles', parseInt(page.querySelector('#mesesDisponibles').value) || 12);
    renderPresupuestoData(page);
  };

  page.querySelector('#ingresoMensual')?.addEventListener('change', saveConfig);
  page.querySelector('#metaAhorro')?.addEventListener('change', saveConfig);
  page.querySelector('#mesesDisponibles')?.addEventListener('change', saveConfig);

  page.querySelector('#btnAddGasto')?.addEventListener('click', () => {
    const concepto = page.querySelector('#gastoConcepto').value.trim();
    const monto = parseFloat(page.querySelector('#gastoMonto').value) || 0;
    const categoria = page.querySelector('#gastoCategoria').value;
    if (!concepto || monto <= 0) return showToast('Complete concepto y monto', 'warning');
    const gastos = store.get('presupuesto.gastos') || [];
    gastos.push({ concepto, monto, categoria });
    store.set('presupuesto.gastos', gastos);
    page.querySelector('#gastoConcepto').value = '';
    page.querySelector('#gastoMonto').value = '';
    renderPresupuestoData(page);
    showToast('Gasto agregado', 'success');
  });

  page.querySelector('#btnAddSemana')?.addEventListener('click', () => {
    const num = parseInt(page.querySelector('#semanaNum').value) || 1;
    const gasto = parseFloat(page.querySelector('#semanaGasto').value) || 0;
    if (gasto <= 0) return showToast('Ingrese un monto válido', 'warning');
    const semanas = store.get('presupuesto.semanas') || [];
    const existente = semanas.find(s => s.numero === num);
    if (existente) {
      existente.gasto = gasto;
    } else {
      semanas.push({ numero: num, gasto });
    }
    store.set('presupuesto.semanas', semanas);
    page.querySelector('#semanaGasto').value = '';
    renderPresupuestoData(page);
    showToast(`Semana ${num} registrada`, 'success');
  });

  page.querySelector('#btnAjustar')?.addEventListener('click', () => {
    const tasa = (parseFloat(page.querySelector('#inflacion').value) || 0) / 100;
    if (tasa === 0) return showToast('Ingrese una tasa de inflación', 'warning');
    const gastos = store.get('presupuesto.gastos') || [];
    gastos.forEach(g => {
      g.monto = presupuestoCalculations.ajusteInflacion(g.monto, tasa);
    });
    store.set('presupuesto.gastos', gastos);
    const ingreso = store.get('presupuesto.ingresoMensual') || 0;
    store.set('presupuesto.ingresoMensual', presupuestoCalculations.ajusteInflacion(ingreso, tasa));
    renderPresupuestoData(page);
    showToast('Ajuste por inflación aplicado', 'info');
  });
}

function renderPresupuestoData(page) {
  const ingreso = store.get('presupuesto.ingresoMensual') || 0;
  const meta = store.get('presupuesto.metaAhorro') || 0;
  const meses = store.get('presupuesto.mesesDisponibles') || 12;
  const gastos = store.get('presupuesto.gastos') || [];
  const semanas = store.get('presupuesto.semanas') || [];

  page.querySelector('#ingresoMensual').value = ingreso;
  page.querySelector('#metaAhorro').value = meta;
  page.querySelector('#mesesDisponibles').value = meses;

  const ahorroM = presupuestoCalculations.ahorroMensual(meta, meses);
  const totalGastos = presupuestoCalculations.totalGastos(gastos);
  const disponibles = ingreso - totalGastos - ahorroM;

  page.querySelector('#budgetSummary').innerHTML = `
    <div class="kpi-card"><div class="kpi-value">${formatCurrency(ingreso)}</div><div class="kpi-label">Ingreso Mensual</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:var(--color-success)">${formatCurrency(ahorroM)}</div><div class="kpi-label">Ahorro Mensual</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:var(--color-danger)">${formatCurrency(totalGastos)}</div><div class="kpi-label">Total Gastos</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:${disponibles >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${formatCurrency(disponibles)}</div><div class="kpi-label">Disponible</div></div>`;

  renderGastosList(page, gastos);
  renderGastosChart(gastos);
  renderSemanas(page, semanas, ahorroM);
  renderResumen(page, ingreso, gastos, ahorroM);
}

function renderGastosList(page, gastos) {
  const el = page.querySelector('#gastosList');
  if (!el) return;
  if (gastos.length === 0) {
    el.innerHTML = '<p class="text-muted text-center" style="padding:var(--space-6)">Sin gastos registrados</p>';
    return;
  }
  const cats = { necesidad: 'Necesidad', deseo: 'Deseo', imprevisto: 'Imprevisto', meta: 'Meta' };
  el.innerHTML = gastos.map((g, i) => `
    <div class="flex-between" style="padding:var(--space-2) 0;border-bottom:1px solid var(--border-color)">
      <span>${g.concepto} <span class="badge badge-info">${cats[g.categoria] || g.categoria}</span></span>
      <span class="flex-gap">
        <span class="font-mono">${formatCurrency(g.monto)}</span>
        <button class="btn btn-sm btn-danger" data-del-gasto="${i}">&times;</button>
      </span>
    </div>`).join('');

  el.querySelectorAll('[data-del-gasto]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.delGasto);
      gastos.splice(idx, 1);
      store.set('presupuesto.gastos', gastos);
      renderPresupuestoData(page);
    });
  });
}

function renderGastosChart(gastos) {
  const dist = presupuestoCalculations.distribucion(gastos);
  const labels = ['Necesidad', 'Deseo', 'Imprevisto', 'Meta'];
  const data = [dist.necesidad, dist.deseo, dist.imprevisto, dist.meta];
  const colors = ['#2563eb', '#d97706', '#dc2626', '#16a34a'];

  if (data.every(v => v === 0)) return;

  renderChart('gastosPieChart', {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderSemanas(page, semanas, ahorroM) {
  const el = page.querySelector('#semanasList');
  if (!el) return;
  const ingreso = store.get('presupuesto.ingresoMensual') || 0;
  const semanal = ingreso / 4;
  let saldoAcum = 0;

  const rows = semanas
    .sort((a, b) => a.numero - b.numero)
    .map(s => {
      saldoAcum += semanal - s.gasto - (ahorroM / 4);
      return `<tr>
        <td>Semana ${s.numero}</td>
        <td class="text-right">${formatCurrency(semanal)}</td>
        <td class="text-right text-danger">${formatCurrency(s.gasto)}</td>
        <td class="text-right">${formatCurrency(ahorroM / 4)}</td>
        <td class="text-right ${saldoAcum >= 0 ? 'text-success' : 'text-danger'} font-bold">${formatCurrency(saldoAcum)}</td>
      </tr>`;
    }).join('');

  el.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Semana</th><th class="text-right">Ingreso</th><th class="text-right">Gasto</th><th class="text-right">Ahorro</th><th class="text-right">Saldo</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" class="text-center text-muted">Sin semanas registradas</td></tr>'}</tbody>
      </table>
    </div>`;
}

function renderResumen(page, ingreso, gastos, ahorroM) {
  const kpis = page.querySelector('#presupuestoKpis');
  const validacion = page.querySelector('#validacionBalance');
  if (!kpis) return;

  const totalGastos = presupuestoCalculations.totalGastos(gastos);
  const distribucion = presupuestoCalculations.distribucion(gastos);
  const balanceValido = presupuestoCalculations.validarBalance(ingreso, gastos, ahorroM, 0);

  kpis.innerHTML = `
    <div class="kpi-card"><div class="kpi-value">${formatCurrency(ingreso)}</div><div class="kpi-label">Ingreso</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:var(--color-success)">${formatCurrency(ahorroM)}</div><div class="kpi-label">Ahorro</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:var(--color-danger)">${formatCurrency(totalGastos)}</div><div class="kpi-label">Gastos</div></div>
    <div class="kpi-card"><div class="kpi-value">${formatPercent(presupuestoCalculations.pctAsignado(totalGastos, ingreso))}</div><div class="kpi-label">% Asignado a Gastos</div></div>`;

  if (validacion) {
    validacion.innerHTML = `
      <div class="flex-gap" style="align-items:center">
        <span class="badge ${balanceValido ? 'badge-success' : 'badge-warning'}">${balanceValido ? 'Balance OK' : 'Balance Incompleto'}</span>
        <span class="text-muted">Necesidad: ${formatCurrency(distribucion.necesidad)} | Deseo: ${formatCurrency(distribucion.deseo)} | Imprevisto: ${formatCurrency(distribucion.imprevisto)} | Meta: ${formatCurrency(distribucion.meta)}</span>
      </div>`;
  }
}
