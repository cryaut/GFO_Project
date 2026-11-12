import { tablaDesarrollo } from '../planeacion/planeacion-desarrollo-ui.js';
import { montarProformaDocente } from './proforma-docente-ui.js';
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
    return `<div class="card mb-4"><h2 class="card-title">1. Estado de resultados proforma</h2><p class="text-muted">${esc(r.motivoPresupuesto || 'Sin estados ni presupuesto todavía.')} <a href="#/planeacion">Revisar Planeación</a></p></div>`;
  }
  const tituloReal = r.real ? `Real ${esc(r.real.periodo)}${r.contraste ? ' (base)' : ''}` : 'Real';
  const tituloProforma = r.proforma ? `Proforma (${esc(r.proforma.horizonte)})` : 'Proforma';
  const cambioDe = (formato, relativo, puntos) => formato === 'monto'
    ? (esNumero(relativo) ? `${relativo > 0 ? '+' : ''}${pct(relativo)}` : 'N/D')
    : (esNumero(puntos) ? `${puntos > 0 ? '+' : ''}${formatNumberND(puntos * 100)} pts` : 'N/D');
  const filas = r.comparacion.map(f => {
    const fmt = (v, moneda) => (v === null && ['otrosNeto', 'otrosOperativos'].includes(f.clave) ? '—' : f.formato === 'monto' ? monto(v, moneda) : FORMATO[f.formato](v));
    const destacar = ['utilidadBruta', 'uaii', 'uai', 'utilidadNeta'].includes(f.clave) ? ' style="font-weight:600"' : '';
    const contraste = r.contraste
      ? `<td class="text-right font-mono">${fmt(f.contraste, r.contraste.moneda)}</td><td class="text-right font-mono">${cambioDe(f.formato, f.desvio, f.desvioPuntos)}</td>` : '';
    return `<tr${destacar}><td>${f.concepto}</td><td class="text-right font-mono">${r.real ? fmt(f.real, r.real?.moneda) : '—'}</td>
      <td class="text-right font-mono">${r.proforma ? fmt(f.proforma, r.proforma?.moneda) : '—'}</td><td class="text-right font-mono">${cambioDe(f.formato, f.variacion, f.puntos)}</td>${contraste}</tr>`;
  }).join('');
  const encabezadoContraste = r.contraste
    ? `<th scope="col" class="text-right">Real ${esc(r.contraste.periodo)} (contraste)</th><th scope="col" class="text-right">Real vs proforma</th>` : '';
  const notas = [];
  if (!r.proforma && r.motivoPresupuesto) notas.push(esc(r.motivoPresupuesto));
  else if (!r.proforma) notas.push('Configure el <a href="#/planeacion">Presupuesto Maestro</a> para obtener la proforma.');
  if (r.real && [r.real.uaii, r.real.utilidadNeta].some(v => v === null)) notas.push('Los resultados reales N/D requieren completar los datos acreditados en Estados; se conserva la misma lectura que en Estados y Razones.');
  if (r.motivoComparacion) notas.push(esc(r.motivoComparacion));
  if (r.proforma) notas.push('La proforma sale del presupuesto maestro: no incluye otros ingresos operativos ni otros ingresos o gastos no operativos, y el IR se calcula sobre la UAI positiva de cada periodo.');
  if (r.contraste) notas.push(`El real de ${esc(r.contraste.periodo)} es el año que la proforma proyecta: «Real vs proforma» mide cuánto se desvió lo ocurrido de lo supuesto ((real − proforma) / |proforma|).`);
  return `<div class="card mb-4"><h2 class="card-title">1. Estado de resultados proforma</h2>
    ${r.real ? `<p class="proforma-origen">Histórico de Estados Financieros · ${esc(r.real.empresa || 'Estados guardados')} · ${esc(r.real.periodo)} · ${esc(r.real.moneda)}. <a href="#/estados">Consultar origen</a></p>` : ''}
    ${r.proforma ? `<p class="proforma-resultado"><strong>Utilidad neta proyectada: ${monto(r.proforma.utilidadNeta, r.proforma.moneda)}</strong><span>Utilidad antes de impuestos (UAI): ${monto(r.proforma.uai, r.proforma.moneda)}</span></p>` : ''}
    ${r.proforma ? `<p class="proforma-origen">Presupuesto maestro guardado · ${esc(r.proforma.horizonte)} · ${esc(r.proforma.moneda)}. Las ventas se proyectan desde unidades y precio. <a href="#/planeacion">Consultar origen</a></p>` : ''}
    <div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Concepto</th><th scope="col" class="text-right">${tituloReal}</th><th scope="col" class="text-right">${tituloProforma}</th><th scope="col" class="text-right">${r.contraste ? 'Proforma vs base' : 'Variación'}</th>${encabezadoContraste}</tr></thead>
      <tbody>${filas}</tbody></table></div>
    ${r.desarrollo ? `<details class="proforma-desarrollo" open><summary>Desarrollo del estado de resultados proyectado</summary><p>${esc(r.desarrollo.etiqueta)}</p>${tablaDesarrollo(r.desarrollo.resultados)}</details>` : ''}
    ${notas.map(n => `<p class="form-hint">${n}</p>`).join('')}</div>`;
}

// D-113: balance general proforma con apertura real, cierre proyectado y real de contraste.
function seccionBalance(b, moneda) {
  if (!b) return '';
  if (!b.disponible) {
    return `<div class="card mb-4"><h2 class="card-title">Balance general proforma</h2><p class="text-muted">${esc(b.motivo)}</p></div>`;
  }
  const m = v => monto(v, moneda);
  const contraste = Boolean(b.contraste);
  const fila = (concepto, regla, apertura, proforma, real, negrita = false) => `<tr${negrita ? ' style="font-weight:600"' : ''}>
    <td>${esc(concepto)}${regla ? `<br><span class="text-muted">${esc(regla)}</span>` : ''}</td>
    <td class="text-right font-mono">${m(apertura)}</td><td class="text-right font-mono">${m(proforma)}</td>
    ${contraste ? `<td class="text-right font-mono">${m(real)}</td>` : ''}</tr>`;
  const grupo = (clave, titulo, totalClave) => `<tr><th scope="rowgroup" colspan="${contraste ? 4 : 3}">${titulo}</th></tr>
    ${b.filas.filter(f => f.grupo === clave).map(f => fila(f.concepto, f.regla, f.apertura, f.proforma, f.real)).join('')}
    ${fila(`Total ${titulo.toLowerCase()}`, '', b.totales.apertura[totalClave], b.totales.proforma[totalClave], b.totales.real?.[totalClave], true)}`;
  const resultado = b.cuadra
    ? '<span class="badge badge-success">Cuadra</span> Activos = pasivos + patrimonio: el presupuesto financia sus propios movimientos.'
    : `<span class="badge badge-warning">${b.financiamientoRequerido > 0 ? 'Financiamiento externo requerido' : 'Excedente de fondos'}</span> ${m(Math.abs(b.financiamientoRequerido))}. No se convierte en un préstamo: decida cómo cubrirlo o aplicarlo.`;
  const a = b.aplicaciones;
  return `<div class="card mb-4"><h2 class="card-title">Balance general proforma</h2>
    <p class="proforma-origen">Apertura: balance real de ${esc(b.base)}. Cierre: presupuesto maestro.${contraste ? ` Contraste: balance real de ${esc(b.contraste)}.` : ''}</p>
    <div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Concepto y regla</th><th scope="col" class="text-right">Real ${esc(b.base)} (apertura)</th><th scope="col" class="text-right">Proforma</th>${contraste ? `<th scope="col" class="text-right">Real ${esc(b.contraste)} (contraste)</th>` : ''}</tr></thead>
      <tbody>${grupo('activos', 'Activos', 'activos')}${grupo('pasivos', 'Pasivos', 'pasivos')}${grupo('patrimonio', 'Patrimonio', 'patrimonio')}</tbody></table></div>
    <p class="mt-4">${resultado}</p>
    <p class="form-hint">Aplicaciones del horizonte: inversión ${m(a.inversion)}, depreciación ${m(a.depreciacion)}, dividendos ${m(a.dividendos)}, IR pagado de la apertura ${m(a.impuestos)}, IR devengado ${m(a.irDevengado)} y utilidad neta ${m(a.utilidadNeta)}.</p></div>`;
}

function seccionEfectivo(e, desarrollo) {
  if (!e) return '';
  const kpi = (valor, etiqueta, clase = '') => `<div class="kpi-card"><div class="kpi-value ${clase}">${valor}</div><div class="kpi-label">${etiqueta}</div></div>`;
  return `<div class="card mb-4"><h2 class="card-title">2. Efectivo proyectado</h2>
    <div class="kpi-grid mb-4">
      ${kpi(monto(e.saldoInicial), 'Saldo inicial de caja')}
      ${kpi(monto(e.flujoNeto), 'Flujo neto del horizonte', e.flujoNeto < 0 ? 'text-danger' : 'text-success')}
      ${kpi(monto(e.saldoFinal), 'Efectivo final antes de financiamiento', e.saldoFinal < e.saldoMinimo ? 'text-danger' : '')}
      ${kpi(e.financiamientoMaximo > 0 ? monto(e.financiamientoMaximo) : 'No se requiere', e.periodoFinanciamiento ? `Financiamiento máximo (${esc(e.periodoFinanciamiento)})` : 'Financiamiento requerido', e.financiamientoMaximo > 0 ? 'text-danger' : 'text-success')}
    </div>
    ${desarrollo ? `<details class="proforma-desarrollo"><summary>Ver cálculo del presupuesto de caja</summary>${tablaDesarrollo(desarrollo.caja)}</details>` : ''}
    <p class="form-hint">El financiamiento requerido todavía no se suma al efectivo. El IR devengado permanece por pagar según los supuestos del modelo.</p>
    <p class="form-hint">Saldos al cierre: cuentas por cobrar ${monto(e.cierre.cxc)}, inventario ${monto(e.cierre.inventarioValor)}, cuentas por pagar ${monto(e.cierre.cxp)} e IR por pagar ${monto(e.cierre.irPorPagar)}.</p></div>`;
}

function seccionIndicadores(indicadores) {
  if (!indicadores.length) return '';
  const grupos = [...new Set(indicadores.map(i => i.grupo))];
  const filas = grupos.map(grupo => `<tr><th scope="rowgroup" colspan="4">${esc(grupo)}</th></tr>${indicadores
    .filter(i => i.grupo === grupo)
    .map(i => `<tr><td>${esc(i.nombre)} ${ESTADO[i.estado]}</td><td class="text-right font-mono" style="white-space:nowrap">${i.formato === 'monto' ? monto(i.valor, i.moneda) : FORMATO[i.formato](i.valor)}</td>
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
    ${seccionProforma(reporte)}
    ${seccionBalance(reporte.balance, reporte.proforma?.moneda)}
    <details class="card mb-4"><summary>Métodos docentes AFOD</summary><div id="proformaAFOD"></div></details>
    ${seccionEfectivo(reporte.efectivo, reporte.desarrollo)}
    ${seccionFaltantes(reporte.faltantes)}
    ${seccionIndicadores(reporte.indicadores)}
    ${seccionAlertas(reporte.alertas)}
    <div class="card mb-4"><h2 class="card-title">Cómo se integra</h2>
      <p>Estados financieros → Análisis y Apalancamiento → Presupuesto maestro → esta proforma. El inventario aporta las existencias y alertas de compra; el punto de equilibrio usa las mismas fórmulas que el presupuesto. El presupuesto personal es independiente.</p></div>`;
  page.querySelector('#proformaImprimir')?.addEventListener('click', () => imprimir());
  montarProformaDocente(page.querySelector('#proformaAFOD'));
}
