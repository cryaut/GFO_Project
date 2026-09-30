// Pantalla #/proforma: estado de resultados proforma, efectivo proyectado, indicadores integrados
// y alertas. Los datos llegan ya calculados por proforma-calculations.js.
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND as monto, formatNumberND, formatPercentND as pct } from '../../utils/format.js';

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);
const num = valor => formatNumberND(valor, esNumero(valor) && Number.isInteger(valor) ? 0 : 2);
const FORMATO = {
  monto, pct, unidades: num,
  veces: valor => (esNumero(valor) ? `${formatNumberND(valor)} veces` : 'N/D')
};
const INSIGNIA = {
  alta: '<span class="badge badge-danger">Alta</span>',
  media: '<span class="badge badge-warning">Media</span>',
  baja: '<span class="badge badge-info">Baja</span>'
};
const ESTADO = {
  ok: '<span class="badge badge-success">OK</span>',
  alerta: '<span class="badge badge-warning">Revisar</span>',
  info: ''
};

function seccionFaltantes(faltantes) {
  if (!faltantes.length) return '';
  return `<div class="card mb-4" style="border-left:4px solid var(--color-info, var(--color-primary))">
    <h2 class="card-title">Para completar el reporte</h2>
    <ul>${faltantes.map(f => `<li><a href="${f.ruta}">${esc(f.modulo)}</a>: ${esc(f.texto)}</li>`).join('')}</ul></div>`;
}

function seccionProforma(r) {
  if (!r.proforma && !r.real) {
    return '<div class="card mb-4"><h2 class="card-title">1. Estado de resultados proforma</h2><p class="text-muted">Sin estados ni presupuesto todavía.</p></div>';
  }
  const tituloReal = r.real ? `Real ${esc(r.real.periodo)}` : 'Real';
  const tituloProforma = r.proforma ? `Proforma (${esc(r.proforma.horizonte)})` : 'Proforma';
  const filas = r.comparacion.map(f => {
    const cambio = f.formato === 'monto'
      ? (esNumero(f.variacion) ? `${f.variacion > 0 ? '+' : ''}${pct(f.variacion)}` : '—')
      : (esNumero(f.puntos) ? `${f.puntos > 0 ? '+' : ''}${formatNumberND(f.puntos * 100)} pts` : '—');
    const fmt = v => (v === null && f.clave === 'otrosNeto' ? '—' : FORMATO[f.formato](v));
    const destacar = ['utilidadBruta', 'uaii', 'utilidadNeta'].includes(f.clave) ? ' style="font-weight:600"' : '';
    return `<tr${destacar}><td>${f.concepto}</td><td class="text-right font-mono">${r.real ? fmt(f.real) : '—'}</td>
      <td class="text-right font-mono">${r.proforma ? fmt(f.proforma) : '—'}</td><td class="text-right font-mono">${cambio}</td></tr>`;
  }).join('');
  const notas = [];
  if (!r.proforma) notas.push('Configure el <a href="#/planeacion">Presupuesto Maestro</a> para obtener la proforma.');
  if (r.proforma && !r.proforma.anual) notas.push(`El presupuesto cubre ${esc(r.proforma.horizonte)}: compárelo con un periodo real de la misma duración.`);
  if (r.proforma) notas.push('La proforma sale del presupuesto maestro: no incluye otros ingresos ni otros gastos, y el IR se calcula sobre la UAI positiva de cada periodo.');
  return `<div class="card mb-4"><h2 class="card-title">1. Estado de resultados proforma</h2>
    <div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Concepto</th><th scope="col" class="text-right">${tituloReal}</th><th scope="col" class="text-right">${tituloProforma}</th><th scope="col" class="text-right">Variación</th></tr></thead>
      <tbody>${filas}</tbody></table></div>
    ${notas.map(n => `<p class="form-hint">${n}</p>`).join('')}</div>`;
}

function seccionEfectivo(e) {
  if (!e) return '';
  const kpi = (valor, etiqueta, clase = '') => `<div class="kpi-card"><div class="kpi-value ${clase}">${valor}</div><div class="kpi-label">${etiqueta}</div></div>`;
  return `<div class="card mb-4"><h2 class="card-title">2. Efectivo proyectado</h2>
    <div class="kpi-grid mb-4">
      ${kpi(monto(e.saldoInicial), 'Saldo inicial de caja')}
      ${kpi(monto(e.flujoNeto), 'Flujo neto del horizonte', e.flujoNeto < 0 ? 'text-danger' : 'text-success')}
      ${kpi(monto(e.saldoFinal), 'Saldo final proyectado', e.saldoFinal < e.saldoMinimo ? 'text-danger' : '')}
      ${kpi(e.financiamientoMaximo > 0 ? monto(e.financiamientoMaximo) : 'No se requiere', e.periodoFinanciamiento ? `Financiamiento máximo (${esc(e.periodoFinanciamiento)})` : 'Financiamiento requerido', e.financiamientoMaximo > 0 ? 'text-danger' : 'text-success')}
    </div>
    <p class="form-hint">Saldos al cierre: cuentas por cobrar ${monto(e.cierre.cxc)}, inventario ${monto(e.cierre.inventarioValor)}, cuentas por pagar ${monto(e.cierre.cxp)} e IR por pagar ${monto(e.cierre.irPorPagar)}.</p></div>`;
}

function seccionIndicadores(indicadores) {
  if (!indicadores.length) return '';
  const grupos = [...new Set(indicadores.map(i => i.grupo))];
  const filas = grupos.map(grupo => `<tr><th scope="rowgroup" colspan="4">${esc(grupo)}</th></tr>${indicadores
    .filter(i => i.grupo === grupo)
    .map(i => `<tr><td>${esc(i.nombre)} ${ESTADO[i.estado]}</td><td class="text-right font-mono" style="white-space:nowrap">${FORMATO[i.formato](i.valor)}</td>
      <td>${esc(i.lectura)}</td><td><a href="${i.ruta}">${esc(i.fuente)}</a></td></tr>`).join('')}`).join('');
  return `<div class="card mb-4"><h2 class="card-title">3. Indicadores integrados</h2>
    <div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Indicador</th><th scope="col" class="text-right">Valor</th><th scope="col">Lectura</th><th scope="col">Fuente</th></tr></thead>
      <tbody>${filas}</tbody></table></div></div>`;
}

function seccionAlertas(alertas) {
  const cuerpo = alertas.length
    ? `<ul>${alertas.map(a => `<li class="mb-2">${INSIGNIA[a.nivel]} ${esc(a.texto)} <a href="${a.ruta}">Ver módulo</a></li>`).join('')}</ul>`
    : '<p class="text-success">No hay alertas con los datos cargados.</p>';
  return `<div class="card mb-4"><h2 class="card-title">4. Alertas y decisiones sugeridas</h2>${cuerpo}
    <p class="form-hint">Las reglas usan los umbrales educativos de Análisis y los resultados de cada módulo; confirme cada decisión con el contexto de la empresa.</p></div>`;
}

// opciones: { reporte, imprimir? }
export function proformaUI(page, { reporte, imprimir = null }) {
  page.innerHTML = `<div class="page-header"><h1 class="page-title">Proforma y Reporte Integrado</h1>
      <p class="page-subtitle">Resumen de todos los módulos para apoyar decisiones: resultados proyectados, efectivo, indicadores y alertas.</p></div>
    <div class="flex-gap flex-wrap mb-4">${imprimir ? '<button type="button" class="btn btn-secondary" id="proformaImprimir">Imprimir o guardar como PDF</button>' : ''}</div>
    ${seccionFaltantes(reporte.faltantes)}
    ${seccionProforma(reporte)}
    ${seccionEfectivo(reporte.efectivo)}
    ${seccionIndicadores(reporte.indicadores)}
    ${seccionAlertas(reporte.alertas)}
    <div class="card mb-4"><h2 class="card-title">Cómo se integra</h2>
      <p>Estados financieros → Análisis y Apalancamiento → Presupuesto maestro → esta proforma. El inventario aporta las existencias y alertas de compra; el punto de equilibrio usa las mismas fórmulas que el presupuesto. El presupuesto personal es independiente.</p></div>`;
  page.querySelector('#proformaImprimir')?.addEventListener('click', () => imprimir());
}
