import store from '../../store.js';
import { ahorroMensual, saldoSemanal, capacidadAhorro, tasaAhorro } from '../../utils/calculate.js';
import { formatCurrency, formatPercent } from '../../utils/format.js';
import { escapeHTML } from '../../utils/html.js';
import { showToast } from '../../components/toast.js';
import { renderChart, destroyChart } from '../../components/chart.js';

export const presupuestoCalculations = {
  ahorroMensual,
  saldoSemanal,

  totalGastos(gastos) {
    return gastos.reduce((sum, g) => sum + (g.monto || 0), 0);
  },

  totalIngresos(ingresos) {
    return ingresos.reduce((sum, i) => sum + (i.monto || 0), 0);
  },

  // Ingresos por concepto. Los datos guardados antes solo tenían ingresoMensual: se leen
  // como un ingreso regular para no perderlos.
  ingresosDe(ingresos, ingresoMensual) {
    if (Array.isArray(ingresos) && ingresos.length) return ingresos;
    return ingresoMensual > 0 ? [{ concepto: 'Ingreso mensual', monto: ingresoMensual, tipo: 'regular' }] : [];
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

// Ejemplo ficticio para la demostración (docs/planificacion/modulos-guia/01-modulos-obligatorios.md):
// ingresos 22,500, gastos 17,200, capacidad de ahorro 5,300 y meta de 36,000 en 12 meses.
export function ejemploPresupuestoPersonal() {
  const gasto = (concepto, monto, categoria) => ({ concepto, monto, categoria });
  return {
    ingresoMensual: 22500,
    metaAhorro: 36000,
    mesesDisponibles: 12,
    ingresos: [
      { concepto: 'Salario', monto: 18000, tipo: 'regular' },
      { concepto: 'Trabajos independientes', monto: 4500, tipo: 'ocasional' }
    ],
    gastos: [
      gasto('Alquiler', 6000, 'necesidad'), gasto('Alimentación', 4800, 'necesidad'),
      gasto('Transporte', 1500, 'necesidad'), gasto('Servicios básicos', 1200, 'necesidad'),
      gasto('Internet y celular', 900, 'necesidad'), gasto('Entretenimiento', 1400, 'deseo'),
      gasto('Ropa', 800, 'deseo'), gasto('Gastos médicos imprevistos', 600, 'imprevisto')
    ],
    semanas: []
  };
}

// Guarda la sección completa; ingresoMensual queda como el total de ingresos (lo usan Semanas y Reportes).
function guardarPresupuesto(page, cambios, texto) {
  const actual = store.get('presupuesto') || {};
  const siguiente = { ...actual, ...cambios };
  if (cambios.ingresos) siguiente.ingresoMensual = presupuestoCalculations.totalIngresos(cambios.ingresos);
  try {
    store.setPersisted('presupuesto', siguiente);
  } catch (error) {
    showToast(`No se pudo guardar: ${error.message}`, 'error');
    return;
  }
  renderPresupuestoData(page);
  if (texto) showToast(texto, 'success');
}

export function initPresupuesto() {
  const page = document.getElementById('page-presupuesto');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Presupuesto Personal</h1>
      <p class="page-subtitle">Ingresos, gastos por categoría, capacidad de ahorro y saldo disponible. Es independiente del presupuesto maestro de la empresa.</p>
    </div>
    <div class="flex-gap flex-wrap mb-4"><button class="btn btn-secondary" id="btnEjemploPresupuesto">Cargar ejemplo ficticio</button></div>
    <div class="tabs">
      <button class="tab-btn active" data-tab="config">Configuración</button>
      <button class="tab-btn" data-tab="ingresos">Ingresos</button>
      <button class="tab-btn" data-tab="gastos">Gastos</button>
      <button class="tab-btn" data-tab="semanas">Semanas</button>
      <button class="tab-btn" data-tab="resumen">Resumen</button>
    </div>
    <div class="tab-content active" id="tab-config">
      <div class="card">
        <div class="form-row">
          <div class="form-group">
            <span class="form-label">Ingreso mensual total (C$)</span>
            <div class="kpi-value" id="ingresoTotalConfig">C$ 0.00</div>
            <p class="form-hint">Suma de la pestaña Ingresos.</p>
          </div>
          <div class="form-group">
            <label class="form-label" for="metaAhorro">Meta de Ahorro (C$)</label>
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
    <div class="tab-content" id="tab-ingresos">
      <div class="card">
        <div class="form-row mb-4">
          <div class="form-group">
            <label class="form-label" for="ingresoConcepto">Concepto</label>
            <input type="text" class="form-input" id="ingresoConcepto" maxlength="80" placeholder="Ej: Salario">
          </div>
          <div class="form-group">
            <label class="form-label" for="ingresoMonto">Monto mensual (C$)</label>
            <input type="number" class="form-input" id="ingresoMonto" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label" for="ingresoTipo">Tipo</label>
            <select class="form-select" id="ingresoTipo">
              <option value="regular">Regular</option>
              <option value="ocasional">Ocasional</option>
            </select>
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end">
            <button class="btn btn-primary" id="btnAddIngreso">Agregar</button>
          </div>
        </div>
        <div id="ingresosList"></div>
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
        <div id="presupuestoLectura" class="mt-4"></div>
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
    store.set('presupuesto.metaAhorro', parseFloat(page.querySelector('#metaAhorro').value) || 0);
    store.set('presupuesto.mesesDisponibles', parseInt(page.querySelector('#mesesDisponibles').value) || 12);
    renderPresupuestoData(page);
  };

  page.querySelector('#metaAhorro')?.addEventListener('change', saveConfig);
  page.querySelector('#mesesDisponibles')?.addEventListener('change', saveConfig);

  page.querySelector('#btnEjemploPresupuesto')?.addEventListener('click', () => {
    const tieneDatos = (store.get('presupuesto.gastos') || []).length || (store.get('presupuesto.ingresoMensual') || 0) > 0;
    if (tieneDatos && !window.confirm('¿Reemplazar su presupuesto personal por el ejemplo ficticio?')) return;
    guardarPresupuesto(page, ejemploPresupuestoPersonal(), 'Ejemplo ficticio cargado');
  });

  page.querySelector('#btnAddIngreso')?.addEventListener('click', () => {
    const concepto = page.querySelector('#ingresoConcepto').value.trim();
    const monto = parseFloat(page.querySelector('#ingresoMonto').value) || 0;
    const tipo = page.querySelector('#ingresoTipo').value === 'ocasional' ? 'ocasional' : 'regular';
    if (!concepto || monto <= 0) return showToast('Complete concepto y monto', 'warning');
    const ingresos = presupuestoCalculations.ingresosDe(store.get('presupuesto.ingresos'), store.get('presupuesto.ingresoMensual') || 0);
    page.querySelector('#ingresoConcepto').value = '';
    page.querySelector('#ingresoMonto').value = '';
    guardarPresupuesto(page, { ingresos: [...ingresos, { concepto, monto, tipo }] }, 'Ingreso agregado');
  });

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
    const ingresos = presupuestoCalculations
      .ingresosDe(store.get('presupuesto.ingresos'), store.get('presupuesto.ingresoMensual') || 0)
      .map(i => ({ ...i, monto: presupuestoCalculations.ajusteInflacion(i.monto, tasa) }));
    store.set('presupuesto.ingresos', ingresos);
    store.set('presupuesto.ingresoMensual', presupuestoCalculations.totalIngresos(ingresos));
    renderPresupuestoData(page);
    showToast('Ajuste por inflación aplicado', 'info');
  });
}

function renderPresupuestoData(page) {
  const ingresos = presupuestoCalculations.ingresosDe(store.get('presupuesto.ingresos'), store.get('presupuesto.ingresoMensual') || 0);
  const ingreso = presupuestoCalculations.totalIngresos(ingresos);
  const meta = store.get('presupuesto.metaAhorro') || 0;
  const meses = store.get('presupuesto.mesesDisponibles') || 12;
  const gastos = store.get('presupuesto.gastos') || [];
  const semanas = store.get('presupuesto.semanas') || [];

  const totalConfig = page.querySelector('#ingresoTotalConfig');
  if (totalConfig) totalConfig.textContent = formatCurrency(ingreso);
  page.querySelector('#metaAhorro').value = meta;
  page.querySelector('#mesesDisponibles').value = meses;

  const ahorroM = presupuestoCalculations.ahorroMensual(meta, meses);
  const totalGastos = presupuestoCalculations.totalGastos(gastos);
  // Capacidad de ahorro = ingresos − gastos; saldo disponible = lo que queda después del ahorro planificado.
  const capacidad = capacidadAhorro(ingreso, totalGastos);
  const disponibles = capacidad - ahorroM;

  page.querySelector('#budgetSummary').innerHTML = `
    <div class="kpi-card"><div class="kpi-value">${formatCurrency(ingreso)}</div><div class="kpi-label">Total de ingresos</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:var(--color-danger)">${formatCurrency(totalGastos)}</div><div class="kpi-label">Total de gastos</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:${capacidad >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${formatCurrency(capacidad)}</div><div class="kpi-label">Capacidad de ahorro</div></div>
    <div class="kpi-card"><div class="kpi-value">${formatCurrency(ahorroM)}</div><div class="kpi-label">Ahorro planificado al mes</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:${disponibles >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${formatCurrency(disponibles)}</div><div class="kpi-label">Saldo disponible</div></div>`;

  renderIngresosList(page, ingresos);
  renderGastosList(page, gastos);
  renderGastosChart(gastos);
  renderSemanas(page, semanas, ahorroM);
  renderResumen(page, ingreso, gastos, ahorroM, meta);
}

function renderIngresosList(page, ingresos) {
  const el = page.querySelector('#ingresosList');
  if (!el) return;
  if (ingresos.length === 0) {
    el.innerHTML = '<p class="text-muted text-center" style="padding:var(--space-6)">Sin ingresos registrados</p>';
    return;
  }
  const tipos = { regular: 'Regular', ocasional: 'Ocasional' };
  el.innerHTML = ingresos.map((i, k) => `
    <div class="flex-between" style="padding:var(--space-2) 0;border-bottom:1px solid var(--border-color)">
      <span>${escapeHTML(i.concepto)} <span class="badge badge-success">${escapeHTML(tipos[i.tipo] || i.tipo)}</span></span>
      <span class="flex-gap">
        <span class="font-mono">${formatCurrency(i.monto)}</span>
        <button class="btn btn-sm btn-danger" data-del-ingreso="${k}" aria-label="Eliminar ${escapeHTML(i.concepto)}">&times;</button>
      </span>
    </div>`).join('') + `
    <div class="flex-between font-bold" style="padding:var(--space-2) 0"><span>Total de ingresos</span><span class="font-mono">${formatCurrency(presupuestoCalculations.totalIngresos(ingresos))}</span></div>`;

  el.querySelectorAll('[data-del-ingreso]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.delIngreso);
      guardarPresupuesto(page, { ingresos: ingresos.filter((_, k) => k !== idx) });
    });
  });
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
      <span>${escapeHTML(g.concepto)} <span class="badge badge-info">${escapeHTML(cats[g.categoria] || g.categoria)}</span></span>
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

function renderResumen(page, ingreso, gastos, ahorroM, meta = 0) {
  const kpis = page.querySelector('#presupuestoKpis');
  const validacion = page.querySelector('#validacionBalance');
  if (!kpis) return;

  const totalGastos = presupuestoCalculations.totalGastos(gastos);
  const distribucion = presupuestoCalculations.distribucion(gastos);
  const balanceValido = presupuestoCalculations.validarBalance(ingreso, gastos, ahorroM, 0);
  const capacidad = capacidadAhorro(ingreso, totalGastos);
  const tasa = tasaAhorro(capacidad, ingreso);
  const disponible = capacidad - ahorroM;

  kpis.innerHTML = `
    <div class="kpi-card"><div class="kpi-value">${formatCurrency(ingreso)}</div><div class="kpi-label">Total de ingresos</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:var(--color-danger)">${formatCurrency(totalGastos)}</div><div class="kpi-label">Total de gastos</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:${capacidad >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${formatCurrency(capacidad)}</div><div class="kpi-label">Capacidad de ahorro (${tasa === null ? 'N/D' : formatPercent(tasa)} de los ingresos)</div></div>
    <div class="kpi-card"><div class="kpi-value">${formatCurrency(ahorroM)}</div><div class="kpi-label">Ahorro planificado al mes</div></div>
    <div class="kpi-card"><div class="kpi-value" style="color:${disponible >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${formatCurrency(disponible)}</div><div class="kpi-label">Saldo disponible</div></div>
    <div class="kpi-card"><div class="kpi-value">${ingreso > 0 ? formatPercent(presupuestoCalculations.pctAsignado(totalGastos, ingreso)) : 'N/D'}</div><div class="kpi-label">% de ingresos en gastos</div></div>`;

  if (validacion) {
    // Gastos + ahorro frente a los ingresos: cuánto queda sin asignar o cuánto falta.
    const estado = balanceValido
      ? '<span class="badge badge-success">Todo el ingreso está asignado</span>'
      : (disponible > 0
        ? `<span class="badge badge-info">Sin asignar: ${formatCurrency(disponible)}</span>`
        : `<span class="badge badge-danger">Faltan ${formatCurrency(-disponible)}</span>`);
    validacion.innerHTML = `
      <div class="flex-gap" style="align-items:center">
        ${estado}
        <span class="text-muted">Necesidad: ${formatCurrency(distribucion.necesidad)} | Deseo: ${formatCurrency(distribucion.deseo)} | Imprevisto: ${formatCurrency(distribucion.imprevisto)} | Meta: ${formatCurrency(distribucion.meta)}</span>
      </div>`;
  }

  const lectura = page.querySelector('#presupuestoLectura');
  if (!lectura) return;
  const frases = [];
  if (ingreso <= 0) {
    frases.push('Registre sus ingresos en la pestaña Ingresos para calcular su capacidad de ahorro.');
  } else if (capacidad >= 0) {
    frases.push(`Después de cubrir sus gastos le quedan ${formatCurrency(capacidad)} al mes (${formatPercent(tasa)} de sus ingresos): esa es su capacidad de ahorro.`);
  } else {
    frases.push(`Sus gastos superan sus ingresos por ${formatCurrency(-capacidad)}: no hay capacidad de ahorro. Reduzca gastos de tipo deseo o busque ingresos adicionales.`);
  }
  if (ingreso > 0 && ahorroM > 0) {
    if (disponible >= 0) {
      frases.push(`La meta de ${formatCurrency(meta)} (${formatCurrency(ahorroM)} al mes) se cumple y aún quedan ${formatCurrency(disponible)} disponibles.`);
    } else if (capacidad > 0) {
      frases.push(`Para ahorrar ${formatCurrency(ahorroM)} al mes faltan ${formatCurrency(-disponible)}. Con su capacidad actual, la meta tomaría ${Math.ceil(meta / capacidad)} meses.`);
    } else {
      frases.push('Con los gastos actuales la meta de ahorro no se puede cumplir.');
    }
  }
  const mayor = Object.entries(distribucion).sort((a, b) => b[1] - a[1])[0];
  const nombres = { necesidad: 'Necesidad', deseo: 'Deseo', imprevisto: 'Imprevisto', meta: 'Meta' };
  if (totalGastos > 0 && mayor) {
    frases.push(`La categoría con más gasto es ${nombres[mayor[0]] || escapeHTML(mayor[0])}: ${formatCurrency(mayor[1])} (${formatPercent(mayor[1] / totalGastos)} de los gastos).`);
  }
  lectura.innerHTML = `<h4 class="mb-2">Interpretación</h4><ul>${frases.map(f => `<li>${f}</li>`).join('')}</ul>
    <p class="form-hint">Capacidad de ahorro = ingresos − gastos. Saldo disponible = capacidad de ahorro − ahorro planificado.</p>`;
}
