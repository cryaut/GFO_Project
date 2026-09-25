import store from '../../store.js';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/format.js';
import {
  ahDelta, ahPctDelta, av, ratioCorriente, ratioRapido,
  rotacionInventario, rotacionCxC, endeudamiento,
  margenNeto, roa, dupont, capitalNetoTrabajo, capitalNetoOperativo,
  eoaf, efeIndirecto, rotacionCxP, periodoPromedioPago, rotacionActivosFijos,
  rotacionActivosTotales, edadInventario, cicloConversionEfectivo,
  razonDeudaPatrimonio, coberturaIntereses, margenBruto, margenOperativo, roe
} from '../../utils/calculate.js';
import { showToast } from '../../components/toast.js';

function getERData(period) {
  const er = store.get('estados.estadoResultados')?.[period] || {};
  const ventas = er['Ventas'] || 0;
  const costoVentas = er['Costo de Ventas'] || 0;
  const utilidadBruta = ventas - costoVentas;
  const gastosAdmin = er['Gastos de Administracion'] || 0;
  const gastosVentas = er['Gastos de Ventas'] || 0;
  const utilidadOperativa = utilidadBruta - gastosAdmin - gastosVentas;
  const otrosIngresos = er['Otros Ingresos'] || 0;
  const otrosGastos = er['Otros Gastos'] || 0;
  const gastosIntereses = er['Gastos por Intereses'] || 0;
  const utilidadAntesImpuestos = utilidadOperativa + otrosIngresos - otrosGastos - gastosIntereses;
  const impuestos = er['Impuestos'] || 0;
  const utilidadNeta = utilidadAntesImpuestos - impuestos;
  const UAII = utilidadOperativa;
  
  return {
    ventas, costoVentas, utilidadBruta, utilidadOperativa, gastosAdmin, gastosVentas,
    otrosIngresos, otrosGastos, gastosIntereses, utilidadAntesImpuestos, impuestos,
    utilidadNeta, UAII
  };
}

function getAccountAverage(periods, accountType, accountName) {
  if (periods.length === 0) return 0;
  if (periods.length === 1) {
    const data = store.get('estados.balanceGeneral')?.[periods[0]]?.[accountType]?.[accountName] || 0;
    return data;
  }
  const lastPeriod = periods[periods.length - 1];
  const prevPeriod = periods[periods.length - 2];
  const lastValue = store.get('estados.balanceGeneral')?.[lastPeriod]?.[accountType]?.[accountName] || 0;
  const prevValue = store.get('estados.balanceGeneral')?.[prevPeriod]?.[accountType]?.[accountName] || 0;
  return (lastValue + prevValue) / 2;
}

function getBGData(period) {
  const bg = store.get('estados.balanceGeneral')?.[period] || {};
  const activos = bg.activos || {};
  const pasivos = bg.pasivos || {};
  const patrimonio = bg.patrimonio || {};

  const activosCorrientes = (activos['Efectivo'] || 0) + (activos['Cuentas por Cobrar'] || 0) +
    (activos['Inventario'] || 0) + (activos['Activos Corrientes Otros'] || 0);
  const inventario = activos['Inventario'] || 0;
  const cxC = activos['Cuentas por Cobrar'] || 0;
  const pasivosCorrientes = (pasivos['Cuentas por Pagar'] || 0) + (pasivos['Pasivo Corto Plazo'] || 0) +
    (pasivos['Provisiones'] || 0);
  const cxP = pasivos['Cuentas por Pagar'] || 0;
  const totalActivos = Object.values(activos).reduce((s, v) => s + v, 0);
  const totalPasivos = Object.values(pasivos).reduce((s, v) => s + v, 0);
  const totalPatrimonio = Object.values(patrimonio).reduce((s, v) => s + v, 0);

  return {
    activosCorrientes, inventario, cxC, pasivosCorrientes, cxP,
    totalActivos, totalPasivos, totalPatrimonio,
    activosFijos: totalActivos - activosCorrientes
  };
}

function computeAH(periods) {
  const results = [];
  for (let i = 1; i < periods.length; i++) {
    const t1 = getBGData(periods[i - 1]);
    const t2 = getBGData(periods[i]);
    const cuentas = [
      { nombre: 'Activos Corrientes', v1: t1.activosCorrientes, v2: t2.activosCorrientes },
      { nombre: 'Inventario', v1: t1.inventario, v2: t2.inventario },
      { nombre: 'CxC', v1: t1.cxC, v2: t2.cxC },
      { nombre: 'Total Activos', v1: t1.totalActivos, v2: t2.totalActivos },
      { nombre: 'Pasivos Corrientes', v1: t1.pasivosCorrientes, v2: t2.pasivosCorrientes },
      { nombre: 'Total Pasivos', v1: t1.totalPasivos, v2: t2.totalPasivos },
      { nombre: 'Patrimonio', v1: t1.totalPatrimonio, v2: t2.totalPatrimonio }
    ];
    const rows = cuentas.map(c => ({
      cuenta: c.nombre, t1: c.v1, t2: c.v2,
      delta: ahDelta(c.v2, c.v1), pctDelta: ahPctDelta(c.v2, c.v1)
    }));
    results.push({ periodo: `${periods[i - 1]} → ${periods[i]}`, rows });
  }
  return results;
}

function computeAV(period) {
  const bg = getBGData(period);
  const er = getERData(period);
  const ta = bg.totalActivos || 1;
  const activos = store.get('estados.balanceGeneral')?.[period]?.activos || {};
  const pasivos = store.get('estados.balanceGeneral')?.[period]?.pasivos || {};
  const patrimonio = store.get('estados.balanceGeneral')?.[period]?.patrimonio || {};

  const rows = [];
  for (const [k, v] of Object.entries(activos)) {
    rows.push({ cuenta: k, valor: v, pctBase: av(v, ta), tipo: 'Activo' });
  }
  for (const [k, v] of Object.entries(pasivos)) {
    rows.push({ cuenta: k, valor: v, pctBase: av(v, ta), tipo: 'Pasivo' });
  }
  for (const [k, v] of Object.entries(patrimonio)) {
    rows.push({ cuenta: k, valor: v, pctBase: av(v, ta), tipo: 'Patrimonio' });
  }
  return rows;
}

function computeRazones(period) {
  const periods = store.get('estados.periods') || [];
  const bg = getBGData(period);
  const er = getERData(period);
  
  const RC = ratioCorriente(bg.activosCorrientes, bg.pasivosCorrientes);
  const RR = ratioRapido(bg.activosCorrientes, bg.inventario, bg.pasivosCorrientes);
  const CNT = capitalNetoTrabajo(bg.activosCorrientes, bg.pasivosCorrientes);
  
  const inventarioProm = getAccountAverage(periods, 'activos', 'Inventario');
  const cxCprom = getAccountAverage(periods, 'activos', 'Cuentas por Cobrar');
  const cxPprom = getAccountAverage(periods, 'pasivos', 'Cuentas por Pagar');
  const activosFijosProm = bg.activosFijos;
  const activosTotalesProm = bg.totalActivos;
  const patrimonioProm = bg.totalPatrimonio;
  
  const RotInv = rotacionInventario(er.costoVentas, inventarioProm);
  const EdadInv = edadInventario(RotInv);
  const RotCxC = rotacionCxC(er.ventas, cxCprom);
  const PPC = RotCxC === 0 ? 0 : 365 / RotCxC;
  const RotCxP = rotacionCxP(er.costoVentas, cxPprom);
  const PPP = periodoPromedioPago(RotCxP);
  const RotAF = rotacionActivosFijos(er.ventas, activosFijosProm);
  const RotAT = rotacionActivosTotales(er.ventas, activosTotalesProm);
  const CCE = cicloConversionEfectivo(EdadInv, PPC, PPP);
  
  const endeudamientoTotal = endeudamiento(bg.totalPasivos, activosTotalesProm);
  const deudaPatrimonio = razonDeudaPatrimonio(bg.totalPasivos, patrimonioProm);
  const coberturaInt = coberturaIntereses(er.UAII, er.gastosIntereses);
  
  const margenBr = margenBruto(er.utilidadBruta, er.ventas);
  const margenOp = margenOperativo(er.utilidadOperativa, er.ventas);
  const margenNt = margenNeto(er.utilidadNeta, er.ventas);
  const ROE = roe(er.utilidadNeta, patrimonioProm);
  const ROA = roa(er.utilidadNeta, activosTotalesProm);
  
  return { 
    RC, RR, CNT,
    RotInv, EdadInv, RotCxC, PPC, RotCxP, PPP, RotAF, RotAT, CCE,
    endeudamiento: endeudamientoTotal, deudaPatrimonio, coberturaInt,
    margenBruto: margenBr, margenOperativo: margenOp, margenNeto: margenNt, ROE, ROA
  };
}

function computeCNTCNO(period) {
  const bg = getBGData(period);
  const CNT = capitalNetoTrabajo(bg.activosCorrientes, bg.pasivosCorrientes);
  const CNO = capitalNetoOperativo(bg.activosCorrientes, bg.pasivosCorrientes);
  return { CNT, CNO };
}

function computeEOAF(periods) {
  if (periods.length < 2) return [];
  const t1 = getBGData(periods[0]);
  const t2 = getBGData(periods[1]);
  const items = [
    { cuenta: 'Activos Corrientes', cambio: t2.activosCorrientes - t1.activosCorrientes, tipo: 'activo' },
    { cuenta: 'Inventario', cambio: t2.inventario - t1.inventario, tipo: 'activo' },
    { cuenta: 'Total Activos', cambio: t2.totalActivos - t1.totalActivos, tipo: 'activo' },
    { cuenta: 'Pasivos Corrientes', cambio: t2.pasivosCorrientes - t1.pasivosCorrientes, tipo: 'pasivo' },
    { cuenta: 'Total Pasivos', cambio: t2.totalPasivos - t1.totalPasivos, tipo: 'pasivo' },
    { cuenta: 'Patrimonio', cambio: t2.totalPatrimonio - t1.totalPatrimonio, tipo: 'pasivo' }
  ];
  return items.map(i => eoaf(i.cuenta, i.cambio, i.tipo)).filter(Boolean);
}

function computeEFE(period) {
  const er = getERData(period);
  const bg = getBGData(period);
  const ajustes = [
    -(bg.inventario || 0) * 0.01,
    -(bg.cxC || 0) * 0.01,
    bg.pasivosCorrientes * 0.01
  ];
  const CFO = efeIndirecto(er.utilidadNeta, ajustes);
  return { CFO, utilidadNeta: er.utilidadNeta, ajustes };
}

function computeDuPont(period) {
  const bg = getBGData(period);
  const er = getERData(period);
  const activoProm = bg.totalActivos;
  return dupont(er.utilidadNeta, er.ventas, activoProm, bg.totalPatrimonio);
}

function interpretacion(razones) {
  const hallazgos = [];
  if (razones.RC < 1) {
    hallazgos.push({ hallazgo: 'Razón Corriente menor a 1', causa: 'Posible dificultad para cubrir obligaciones a corto plazo', riesgo: 'Riesgo de liquidez', accion: 'Evaluar conversión de inventarios y cobranza' });
  }
  if (razones.RR < 0.5) {
    hallazgos.push({ hallazgo: 'Prueba Ácida baja', causa: 'Dependencia significativa de inventarios para cubrir obligaciones', riesgo: 'Riesgo de liquidez inmediata', accion: 'Reducir niveles de inventario o aumentar activos líquidos' });
  }
  if (razones.endeudamiento > 0.6) {
    hallazgos.push({ hallazgo: 'Alto nivel de endeudamiento', causa: 'Dependencia significativa de financiamiento ajeno', riesgo: 'Riesgo financiero elevado', accion: 'Revisar estructura de capital y planes de reducción de deuda' });
  }
  if (razones.deudaPatrimonio > 1) {
    hallazgos.push({ hallazgo: 'Deuda superior al patrimonio', causa: 'La empresa está financiada principalmente con deuda', riesgo: 'Riesgo de insolvencia', accion: 'Evaluar planes de capitalización o reducción de deuda' });
  }
  if (razones.coberturaInt < 2) {
    hallazgos.push({ hallazgo: 'Cobertura de intereses baja', causa: 'La utilidad operativa no cubre holgadamente los gastos financieros', riesgo: 'Riesgo de incumplimiento de obligaciones financieras', accion: 'Aumentar utilidad operativa o renegociar condiciones de deuda' });
  }
  if (razones.margenBruto < 0.3) {
    hallazgos.push({ hallazgo: 'Margen bruto bajo', causa: 'Costo de ventas elevado respecto a ventas', riesgo: 'Rentabilidad comprometida desde la producción', accion: 'Revisar costos de producción y proveedores' });
  }
  if (razones.margenOperativo < 0.1) {
    hallazgos.push({ hallazgo: 'Margen operativo bajo', causa: 'Gastos operativos elevados', riesgo: 'Dificultad para cubrir gastos financieros', accion: 'Optimizar gastos de administración y ventas' });
  }
  if (razones.margenNeto < 0.05) {
    hallazgos.push({ hallazgo: 'Margen neto bajo', causa: 'Costos o gastos elevados respecto a ventas', riesgo: 'Rentabilidad comprometida', accion: 'Optimizar costos operativos y revisar precios de venta' });
  }
  if (razones.ROA < 0.05) {
    hallazgos.push({ hallazgo: 'ROA bajo', causa: 'Baja eficiencia en el uso de activos para generar utilidades', riesgo: 'Subutilización de recursos', accion: 'Evaluar activos improductivos y planes de inversión' });
  }
  if (razones.ROE < 0.1) {
    hallazgos.push({ hallazgo: 'ROE bajo', causa: 'Baja rentabilidad sobre el patrimonio invertido', riesgo: 'Rendimiento insuficiente para accionistas', accion: 'Mejorar eficiencia operativa y estructura de capital' });
  }
  if (razones.CCE > 60) {
    hallazgos.push({ hallazgo: 'Ciclo de conversión de efectivo largo', causa: 'La empresa tarda demasiado en convertir inventarios en efectivo', riesgo: 'Problemas de liquidez operativa', accion: 'Optimizar gestión de inventarios, cobranza y pagos' });
  }
  if (hallazgos.length === 0) {
    hallazgos.push({ hallazgo: 'Indicadores dentro de rangos aceptables', causa: 'Situación financiera estable', riesgo: 'Riesgo controlado', accion: 'Mantener monitoreo periódico' });
  }
  return hallazgos;
}

function renderAHSection(periods) {
  const ahData = computeAH(periods);
  if (ahData.length === 0) return '<p class="text-muted">Se necesitan al menos 2 periodos.</p>';
  let html = '';
  for (const ah of ahData) {
    html += `<h4 class="mb-2">${ah.periodo}</h4>
      <div class="table-wrapper mb-6"><table>
        <thead><tr><th>Cuenta</th><th class="text-right">Periodo T1</th><th class="text-right">Periodo T2</th><th class="text-right">Δ</th><th class="text-right">%Δ</th></tr></thead>
        <tbody>${ah.rows.map(r => `<tr>
          <td>${r.cuenta}</td>
          <td class="text-right font-mono">${formatCurrency(r.t1)}</td>
          <td class="text-right font-mono">${formatCurrency(r.t2)}</td>
          <td class="text-right font-mono ${r.delta < 0 ? 'text-danger' : 'text-success'}">${formatCurrency(r.delta)}</td>
          <td class="text-right font-mono">${formatPercent(r.pctDelta)}</td>
        </tr>`).join('')}</tbody>
      </table></div>`;
  }
  return html;
}

function renderAVSection(period) {
  const avData = computeAV(period);
  return `<div class="table-wrapper"><table>
    <thead><tr><th>Cuenta</th><th class="text-right">Valor</th><th class="text-right">% Base</th><th>Tipo</th></tr></thead>
    <tbody>${avData.map(r => `<tr>
      <td>${r.cuenta}</td>
      <td class="text-right font-mono">${formatCurrency(r.valor)}</td>
      <td class="text-right font-mono">${formatPercent(r.pctBase)}</td>
      <td><span class="badge badge-info">${r.tipo}</span></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function renderRazonesSection(period) {
  const r = computeRazones(period);
  const items = [
    ['Razones de Liquidez', ''],
    ['Razón Corriente', formatNumber(r.RC), r.RC >= 1 ? 'badge-success' : 'badge-danger'],
    ['Prueba Ácida', formatNumber(r.RR), r.RR >= 0.5 ? 'badge-success' : 'badge-warning'],
    ['Capital de Trabajo Neto', formatCurrency(r.CNT), r.CNT >= 0 ? 'badge-success' : 'badge-danger'],
    ['Razones de Actividad', ''],
    ['Rotación de Inventarios', formatNumber(r.RotInv), 'badge-info'],
    ['Edad del Inventario (días)', formatNumber(r.EdadInv, 0), 'badge-info'],
    ['Rotación de Cuentas por Cobrar', formatNumber(r.RotCxC), 'badge-info'],
    ['Período Promedio de Cobro (días)', formatNumber(r.PPC, 0), 'badge-info'],
    ['Rotación de Cuentas por Pagar', formatNumber(r.RotCxP), 'badge-info'],
    ['Período Promedio de Pago (días)', formatNumber(r.PPP, 0), 'badge-info'],
    ['Rotación de Activos Fijos', formatNumber(r.RotAF), 'badge-info'],
    ['Rotación de Activos Totales', formatNumber(r.RotAT), 'badge-info'],
    ['Ciclo de Conversión de Efectivo (días)', formatNumber(r.CCE, 0), r.CCE <= 30 ? 'badge-success' : r.CCE <= 60 ? 'badge-warning' : 'badge-danger'],
    ['Razones de Endeudamiento', ''],
    ['Razón de Deuda Total', formatPercent(r.endeudamiento), r.endeudamiento <= 0.6 ? 'badge-success' : 'badge-warning'],
    ['Razón Deuda-Patrimonio', formatNumber(r.deudaPatrimonio), r.deudaPatrimonio <= 1 ? 'badge-success' : 'badge-warning'],
    ['Cobertura de Intereses', formatNumber(r.coberturaInt), r.coberturaInt >= 2 ? 'badge-success' : 'badge-warning'],
    ['Razones de Rentabilidad', ''],
    ['Margen Bruto', formatPercent(r.margenBruto), r.margenBruto >= 0.3 ? 'badge-success' : 'badge-warning'],
    ['Margen Operativo', formatPercent(r.margenOperativo), r.margenOperativo >= 0.1 ? 'badge-success' : 'badge-warning'],
    ['Margen Neto', formatPercent(r.margenNeto), r.margenNeto >= 0.05 ? 'badge-success' : 'badge-warning'],
    ['ROE', formatPercent(r.ROE), r.ROE >= 0.1 ? 'badge-success' : 'badge-warning'],
    ['ROA', formatPercent(r.ROA), r.ROA >= 0.05 ? 'badge-success' : 'badge-warning']
  ];
  return `<div class="kpi-grid">${items.map(([label, value, badge]) => {
    if (!value) return `<div class="kpi-card" style="grid-column:1/-1"><div class="kpi-label font-bold">${label}</div></div>`;
    return `<div class="kpi-card"><div class="kpi-value">${value}</div><div class="kpi-label">${label}</div>${badge ? `<span class="badge ${badge}" style="margin-top:var(--space-2)">${badge === 'badge-success' ? 'OK' : badge === 'badge-danger' ? 'Alerta' : 'Revisión'}</span>` : ''}</div>`;
  }).join('')}</div>`;
}

function renderCNTCNOSection(period) {
  const { CNT, CNO } = computeCNTCNO(period);
  return `<div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-value ${CNT >= 0 ? '' : 'text-danger'}">${formatCurrency(CNT)}</div><div class="kpi-label">Capital Neto de Trabajo</div></div>
    <div class="kpi-card"><div class="kpi-value ${CNO >= 0 ? '' : 'text-danger'}">${formatCurrency(CNO)}</div><div class="kpi-label">Capital Neto Operativo</div></div>
  </div>`;
}

function renderEOAFSection(periods) {
  const items = computeEOAF(periods);
  if (items.length === 0) return '<p class="text-muted">Se necesitan al menos 2 periodos.</p>';
  return `<div class="table-wrapper"><table>
    <thead><tr><th>Cuenta</th><th class="text-right">Cambio</th><th>Clasificación</th><th class="text-right">Monto</th></tr></thead>
    <tbody>${items.map(r => `<tr>
      <td>${r.cuenta}</td>
      <td class="text-right font-mono ${r.cambio < 0 ? 'text-danger' : 'text-success'}">${formatCurrency(r.cambio)}</td>
      <td><span class="badge ${r.clasificacion === 'Origen' ? 'badge-success' : 'badge-primary'}">${r.clasificacion}</span></td>
      <td class="text-right font-mono">${formatCurrency(r.monto)}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function renderEFESection(period) {
  const efe = computeEFE(period);
  return `<div class="kpi-grid mb-4">
    <div class="kpi-card"><div class="kpi-value">${formatCurrency(efe.CFO)}</div><div class="kpi-label">Flujo de Efectivo Operativo</div></div>
    <div class="kpi-card"><div class="kpi-value">${formatCurrency(efe.utilidadNeta)}</div><div class="kpi-label">Utilidad Neta</div></div>
  </div>
  <p class="text-muted" style="font-size:var(--font-size-sm)">Método indirecto: UN + ajustes por cambios en cuentas de balance</p>`;
}

function renderDuPontSection(period) {
  const dp = computeDuPont(period);
  return `<div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-value">${formatPercent(dp.PM)}</div><div class="kpi-label">Margen Neto (PM)</div></div>
    <div class="kpi-card"><div class="kpi-value">${formatNumber(dp.AT)}</div><div class="kpi-label">Rotación Activos (AT)</div></div>
    <div class="kpi-card"><div class="kpi-value">${formatNumber(dp.EM)}</div><div class="kpi-label">Multiplicador (EM)</div></div>
    <div class="kpi-card" style="border-color:var(--color-primary)"><div class="kpi-value" style="color:var(--color-primary)">${formatPercent(dp.ROE)}</div><div class="kpi-label font-bold">ROE = PM × AT × EM</div></div>
  </div>`;
}

function renderInterpretacionSection(period) {
  const razones = computeRazones(period);
  const hallazgos = interpretacion(razones);
  return hallazgos.map(h => `
    <div class="card mb-4" style="border-left:4px solid var(--color-warning)">
      <div class="flex-gap mb-2"><span class="badge badge-warning">Hallazgo</span><strong>${h.hallazgo}</strong></div>
      <p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin:var(--space-2) 0"><strong>Causa:</strong> ${h.causa}</p>
      <p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin:var(--space-2) 0"><strong>Riesgo:</strong> ${h.riesgo}</p>
      <p style="font-size:var(--font-size-sm);color:var(--color-primary);margin:var(--space-2) 0"><strong>Acción:</strong> ${h.accion}</p>
    </div>`).join('');
}

export function initAnalisis() {
  const page = document.getElementById('page-analisis');
  if (!page) return;

  const periods = store.get('estados.periods') || [];

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Análisis Financiero</h1>
      <p class="page-subtitle">AH, AV, Razones, CNT/CNO, EOAF, EFE, DuPont, Interpretación</p>
    </div>
    <div class="tabs">
      <button class="tab-btn active" data-tab="ah">AH</button>
      <button class="tab-btn" data-tab="av">AV</button>
      <button class="tab-btn" data-tab="razones">Razones</button>
      <button class="tab-btn" data-tab="cnt-cno">CNT/CNO</button>
      <button class="tab-btn" data-tab="eoaf">EOAF</button>
      <button class="tab-btn" data-tab="efe">EFE</button>
      <button class="tab-btn" data-tab="dupont">DuPont</button>
      <button class="tab-btn" data-tab="interpretacion">Interpretación</button>
    </div>
    <div class="tab-content active" id="tab-ah">
      <h3 class="mb-4">Análisis Horizontal</h3>
      ${renderAHSection(periods)}
    </div>
    <div class="tab-content" id="tab-av">
      <h3 class="mb-4">Análisis Vertical (último periodo)</h3>
      ${periods.length > 0 ? renderAVSection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-razones">
      <h3 class="mb-4">Razones Financieras (último periodo)</h3>
      ${periods.length > 0 ? renderRazonesSection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-cnt-cno">
      <h3 class="mb-4">Capital Neto de Trabajo y Operativo</h3>
      ${periods.length > 0 ? renderCNTCNOSection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-eoaf">
      <h3 class="mb-4">Estado de Origen y Aplicación de Fondos</h3>
      ${renderEOAFSection(periods)}
    </div>
    <div class="tab-content" id="tab-efe">
      <h3 class="mb-4">Estado de Flujo de Efectivo (Método Indirecto)</h3>
      ${periods.length > 0 ? renderEFESection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-dupont">
      <h3 class="mb-4">Modelo DuPont (3 pasos)</h3>
      ${periods.length > 0 ? renderDuPontSection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>
    <div class="tab-content" id="tab-interpretacion">
      <h3 class="mb-4">Interpretación Heurística</h3>
      ${periods.length > 0 ? renderInterpretacionSection(periods[periods.length - 1]) : '<p class="text-muted">Sin datos.</p>'}
    </div>`;

  page.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      page.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      page.querySelector(`#tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });
}
