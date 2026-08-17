import store from '../../store.js';
import { formatCurrency, formatNumber } from '../../utils/format.js';
import { showToast } from '../../components/toast.js';

export const DEMO_MUNOMODA = {
  name: 'MUNO MODA S.A.',
  periods: ['2023', '2024'],
  balanceGeneral: {
    '2023': {
      activos: {
        'Efectivo': 45000,
        'Cuentas por Cobrar': 120000,
        'Inventario': 180000,
        'Activos Corrientes Otros': 25000,
        'Terrenos': 150000,
        'Edificios': 200000,
        'Equipos': 120000,
        'Vehiculos': 60000,
        'Depreciacion Acumulada': -98525
      },
      pasivos: {
        'Cuentas por Pagar': 85000,
        'Pasivo Corto Plazo': 60000,
        'Provisiones': 15000,
        'Pasivo Largo Plazo': 80000,
        'Otros Pasivos': 43860
      },
      patrimonio: {
        'Capital Social': 300000,
        'Reservas': 80000,
        'Utilidades Acumuladas': 207815
      }
    },
    '2024': {
      activos: {
        'Efectivo': 52000,
        'Cuentas por Cobrar': 135000,
        'Inventario': 195000,
        'Activos Corrientes Otros': 30000,
        'Terrenos': 150000,
        'Edificios': 200000,
        'Equipos': 120000,
        'Vehiculos': 60000,
        'Depreciacion Acumulada': -116475
      },
      pasivos: {
        'Cuentas por Pagar': 92000,
        'Pasivo Corto Plazo': 65000,
        'Provisiones': 18000,
        'Pasivo Largo Plazo': 75000,
        'Otros Pasivos': 33860
      },
      patrimonio: {
        'Capital Social': 300000,
        'Reservas': 80000,
        'Utilidades Acumuladas': 207815
      }
    }
  },
  estadoResultados: {
    '2023': {
      'Ventas': 850000,
      'Costo de Ventas': 510000,
      'Gastos de Administracion': 120000,
      'Gastos de Ventas': 85000,
      'Otros Ingresos': 15000,
      'Otros Gastos': 10000
    },
    '2024': {
      'Ventas': 920000,
      'Costo de Ventas': 545000,
      'Gastos de Administracion': 130000,
      'Gastos de Ventas': 90000,
      'Otros Ingresos': 18000,
      'Otros Gastos': 12000
    }
  }
};

function getSum(cuentas) {
  return Object.values(cuentas).reduce((s, v) => s + v, 0);
}

function computeTotals(data, period) {
  const bg = data.balanceGeneral[period];
  const er = data.estadoResultados[period];
  const totalActivos = getSum(bg.activos);
  const totalPasivos = getSum(bg.pasivos);
  const totalPatrimonio = getSum(bg.patrimonio);
  const ventas = er['Ventas'] || 0;
  const costoVentas = er['Costo de Ventas'] || 0;
  const utilidadBruta = ventas - costoVentas;
  const utilidadNeta = utilidadBruta - (er['Gastos de Administracion'] || 0) - (er['Gastos de Ventas'] || 0) + (er['Otros Ingresos'] || 0) - (er['Otros Gastos'] || 0);
  return { totalActivos, totalPasivos, totalPatrimonio, ventas, costoVentas, utilidadNeta, utilidadBruta };
}

export function getDemoData() {
  return DEMO_MUNOMODA;
}

export function loadDemo() {
  store.set('estados.balanceGeneral', DEMO_MUNOMODA.balanceGeneral);
  store.set('estados.estadoResultados', DEMO_MUNOMODA.estadoResultados);
  store.set('estados.periods', DEMO_MUNOMODA.periods);
  return DEMO_MUNOMODA;
}

export function initEstados() {
  const page = document.getElementById('page-estados');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header flex-between">
      <div>
        <h1 class="page-title">Estados Financieros</h1>
        <p class="page-subtitle">Balance General y Estado de Resultados multiperiodo</p>
      </div>
      <button class="btn btn-primary" id="btnLoadDemo">Cargar Demo MUNO MODA</button>
    </div>
    <div class="tabs">
      <button class="tab-btn active" data-tab="bg">Balance General</button>
      <button class="tab-btn" data-tab="er">Estado de Resultados</button>
      <button class="tab-btn" data-tab="conexion">Conexión</button>
    </div>
    <div class="tab-content active" id="tab-bg">
      <div id="bgContent"></div>
    </div>
    <div class="tab-content" id="tab-er">
      <div id="erContent"></div>
    </div>
    <div class="tab-content" id="tab-conexion">
      <div id="conexionContent"></div>
    </div>`;

  bindEstadosEvents(page);
  renderEstadosData(page);
}

function bindEstadosEvents(page) {
  page.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      page.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      page.querySelector(`#tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });

  page.querySelector('#btnLoadDemo')?.addEventListener('click', () => {
    loadDemo();
    renderEstadosData(page);
    showToast('Demo MUNO MODA cargada', 'success');
  });
}

function renderEstadosData(page) {
  const periods = store.get('estados.periods') || [];
  const bg = store.get('estados.balanceGeneral') || {};
  const er = store.get('estados.estadoResultados') || {};

  renderBG(page, periods, bg);
  renderER(page, periods, er);
  renderConexion(page, periods, bg, er);
}

function renderBG(page, periods, bg) {
  const el = page.querySelector('#bgContent');
  if (!el) return;
  if (periods.length === 0) {
    el.innerHTML = '<div class="empty-state"><p>No hay datos. Cargue la demo o ingrese datos manualmente.</p></div>';
    return;
  }

  let html = '<div class="table-wrapper"><table class="statement-table"><thead><tr><th>Cuenta</th>';
  periods.forEach(p => html += `<th class="text-right">${p}</th>`);
  html += '</tr></thead><tbody>';

  if (bg[periods[0]]) {
    const accountGroups = [
      { label: 'ACTIVOS', accounts: Object.keys(bg[periods[0]].activos || {}) },
      { label: 'PASIVOS', accounts: Object.keys(bg[periods[0]].pasivos || {}) },
      { label: 'PATRIMONIO', accounts: Object.keys(bg[periods[0]].patrimonio || {}) }
    ];

    for (const group of accountGroups) {
      html += `<tr><td class="font-bold">${group.label}</td>`;
      periods.forEach(() => html += '<td></td>');
      html += '</tr>';
      for (const acc of group.accounts) {
        html += `<tr><td style="padding-left:var(--space-6)">${acc}</td>`;
        periods.forEach(p => {
          const val = bg[p]?.[group.label === 'ACTIVOS' ? 'activos' : group.label === 'PASIVOS' ? 'pasivos' : 'patrimonio']?.[acc] || 0;
          const cls = val < 0 ? 'text-danger' : '';
          html += `<td class="text-right font-mono ${cls}">${formatCurrency(val)}</td>`;
        });
        html += '</tr>';
      }
    }

    html += `<tr class="font-bold" style="border-top:2px solid var(--border-color-strong)"><td>TOTAL ACTIVOS</td>`;
    periods.forEach(p => {
      const tot = Object.values(bg[p]?.activos || {}).reduce((s, v) => s + v, 0);
      html += `<td class="text-right font-mono">${formatCurrency(tot)}</td>`;
    });
    html += '</tr>';

    html += `<tr class="font-bold"><td>TOTAL PASIVOS + PATRIMONIO</td>`;
    periods.forEach(p => {
      const tot = Object.values(bg[p]?.pasivos || {}).reduce((s, v) => s + v, 0) +
                  Object.values(bg[p]?.patrimonio || {}).reduce((s, v) => s + v, 0);
      html += `<td class="text-right font-mono">${formatCurrency(tot)}</td>`;
    });
    html += '</tr>';
  }

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function renderER(page, periods, er) {
  const el = page.querySelector('#erContent');
  if (!el) return;
  if (periods.length === 0) {
    el.innerHTML = '<div class="empty-state"><p>No hay datos de estado de resultados.</p></div>';
    return;
  }

  let html = '<div class="table-wrapper"><table class="statement-table"><thead><tr><th>Cuenta</th>';
  periods.forEach(p => html += `<th class="text-right">${p}</th>`);
  html += '</tr></thead><tbody>';

  const accounts = Object.keys(er[periods[0]] || {});
  const ventas = er[periods[0]]?.['Ventas'] || 1;

  for (const acc of accounts) {
    html += `<tr><td>${acc}</td>`;
    periods.forEach(p => {
      const val = er[p]?.[acc] || 0;
      const cls = val < 0 ? 'text-danger' : '';
      html += `<td class="text-right font-mono ${cls}">${formatCurrency(val)}</td>`;
    });
    html += '</tr>';
  }

  periods.forEach(p => {
    const data = er[p] || {};
    const utilidad = (data['Ventas'] || 0) - (data['Costo de Ventas'] || 0) -
                     (data['Gastos de Administracion'] || 0) - (data['Gastos de Ventas'] || 0) +
                     (data['Otros Ingresos'] || 0) - (data['Otros Gastos'] || 0);
    html += `<tr class="font-bold" style="border-top:2px solid var(--border-color-strong)"><td>UTILIDAD NETA</td>`;
    periods.forEach(pp => {
      const d = er[pp] || {};
      const u = (d['Ventas'] || 0) - (d['Costo de Ventas'] || 0) -
                (d['Gastos de Administracion'] || 0) - (d['Gastos de Ventas'] || 0) +
                (d['Otros Ingresos'] || 0) - (d['Otros Gastos'] || 0);
      html += `<td class="text-right font-mono ${u < 0 ? 'text-danger' : 'text-success'}">${formatCurrency(u)}</td>`;
    });
    html += '</tr>';
    return;
  });

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function renderConexion(page, periods, bg, er) {
  const el = page.querySelector('#conexionContent');
  if (!el) return;
  if (periods.length < 2) {
    el.innerHTML = '<div class="empty-state"><p>Se necesitan al menos 2 periodos para ver la conexión entre estados.</p></div>';
    return;
  }

  let html = '<div class="card"><h3 class="mb-4">Conexión: Estado de Resultados → Balance General</h3>';
  html += '<div class="table-wrapper"><table><thead><tr><th>Concepto</th><th class="text-right">Valor</th></tr></thead><tbody>';

  for (const p of periods) {
    const data = er[p] || {};
    const u = (data['Ventas'] || 0) - (data['Costo de Ventas'] || 0) -
              (data['Gastos de Administracion'] || 0) - (data['Gastos de Ventas'] || 0) +
              (data['Otros Ingresos'] || 0) - (data['Otros Gastos'] || 0);
    html += `<tr><td>Utilidad Neta ${p}</td><td class="text-right font-mono ${u < 0 ? 'text-danger' : 'text-success'}">${formatCurrency(u)}</td></tr>`;
  }

  html += '</tbody></table></div>';
  html += '<p class="text-muted mt-4" style="font-size:var(--font-size-sm)">La Utilidad Neta del Estado de Resultados se traslada a las Utilidades Acumuladas del Patrimonio en el Balance General.</p>';
  html += '</div>';
  el.innerHTML = html;
}
