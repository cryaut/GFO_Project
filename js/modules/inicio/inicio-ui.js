// Pantalla #/home: panorama general de la empresa y accesos a los módulos.
// Los datos llegan ya calculados por inicio-calculations.js (panoramaGeneral).
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND as monto, formatNumberND, formatPercentND as pct } from '../../utils/format.js';

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);
const FORMATO = {
  monto, pct,
  unidades: valor => formatNumberND(valor, esNumero(valor) && Number.isInteger(valor) ? 0 : 2),
  veces: valor => (esNumero(valor) ? `${formatNumberND(valor)}×` : 'N/D')
};

// Trazos de los iconos (mismos que la barra lateral de index.html), 24×24 con stroke.
const ICONO = {
  presupuesto: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  estados: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  analisis: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  apalancamiento: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  equilibrio: '<line x1="3" y1="21" x2="21" y2="3"/><polyline points="3 12 21 12"/><circle cx="12" cy="12" r="2"/>',
  flujo: '<polyline points="7 17 7 3"/><polyline points="3 7 7 3 11 7"/><polyline points="17 7 17 21"/><polyline points="13 17 17 21 21 17"/>',
  planeacion: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  proforma: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>',
  inventario: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  activos: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  mercados: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  reportes: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  glosario: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  liquidez: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  rentabilidad: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  endeudamiento: '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  alerta: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  check: '<polyline points="20 6 9 17 4 12"/>'
};
const icono = (nombre, tam = 20) => `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONO[nombre] || ''}</svg>`;

// Tono de color de cada área y módulo (clases .tone-* de pages.css).
const TONO_AREA = {
  liquidez: 'cyan', rentabilidad: 'green', endeudamiento: 'amber', apalancamiento: 'violet', equilibrio: 'blue',
  flujo: 'cyan', presupuesto: 'blue', inventario: 'pink', presupuestoPersonal: 'teal', activos: 'teal'
};
const ICONO_AREA = { presupuesto: 'planeacion', presupuestoPersonal: 'presupuesto' };

// Mismos grupos y orden que la barra lateral de index.html.
const GRUPOS = [
  ['Empresa', [
    ['estados', 'Estados Financieros', 'Balance General y Estado de Resultados multiperiodo.', 'green'],
    ['analisis', 'Análisis Financiero', 'AH, AV, razones, CNT/CNO, EOAF, EFE y DuPont.', 'amber'],
    ['apalancamiento', 'Apalancamiento', 'GAO, GAF y GAT por periodo con la traza del cálculo.', 'violet'],
    ['equilibrio', 'Punto de Equilibrio', 'Margen de contribución, equilibrio y escenarios C-V-U.', 'blue'],
    ['flujo', 'Flujo de Efectivo', 'Operación, inversión y financiamiento; saldo final.', 'cyan'],
    ['planeacion', 'Presupuesto Maestro', 'Ventas, compras, CBV, gastos y caja proyectada.', 'blue'],
    ['inventario', 'Inventario', 'Existencias, kardex y alertas de reposición.', 'pink'],
    ['proforma', 'Proforma y Reporte', 'Resultados proforma, indicadores integrados y alertas.', 'pink']
  ]],
  ['Finanzas personales', [
    ['presupuesto', 'Presupuesto Personal', 'Ingresos, gastos por categoría y capacidad de ahorro.', 'teal'],
    ['activos', 'Activos del Hogar', 'Depreciación de los bienes del hogar, condición y reposición.', 'teal']
  ]],
  ['Aprender', [
    ['mercados', 'Mercados Financieros', 'Comparador bonos vs acciones, sistema financiero y quiz.', 'violet'],
    ['glosario', 'Glosario', 'Términos financieros con su definición.', 'amber']
  ]],
  ['Datos', [
    ['reportes', 'Reportes e Integración', 'Exportar e importar JSON/CSV/HTML y resumen de módulos.', 'cyan']
  ]]
];

const ETIQUETA_SALUD = { solida: 'Sólida', estable: 'Estable', atencion: 'Requiere atención', 'sin-datos': 'Sin datos' };
const INSIGNIA_ESTADO = {
  ok: '<span class="badge badge-success">En orden</span>',
  alerta: '<span class="badge badge-warning">Revisar</span>',
  info: '<span class="badge badge-info">Referencia</span>'
};
const INSIGNIA_NIVEL = {
  alta: '<span class="badge badge-danger">Alta</span>',
  media: '<span class="badge badge-warning">Media</span>',
  baja: '<span class="badge badge-info">Baja</span>'
};

function hero(p) {
  const { salud } = p;
  const porcentaje = esNumero(salud.puntaje) ? Math.round(salud.puntaje * 100) : 0;
  const detalle = salud.nivel === 'sin-datos' ? 'Sin áreas evaluadas' : `${salud.ok} de ${salud.ok + salud.alerta} áreas en orden`;
  const titulo = p.empresa ? esc(p.empresa) : 'Bienvenido a GFO Toolkit';
  const eyebrow = p.periodo ? `Panorama general · Periodo ${esc(p.periodo)}` : 'Panorama general';
  return `<section class="dash-hero" aria-labelledby="dashTitulo">
    <div class="dash-hero-text">
      <p class="dash-eyebrow">${eyebrow}</p>
      <h1 id="dashTitulo">${titulo}</h1>
      <p>${esc(salud.texto)}</p>
    </div>
    <div class="dash-health dash-health--${salud.nivel}" role="img" aria-label="Salud general: ${ETIQUETA_SALUD[salud.nivel]}. ${detalle}.">
      <div class="dash-ring" style="--p:${porcentaje}"><span>${salud.nivel === 'sin-datos' ? '—' : `${porcentaje}%`}</span></div>
      <div><p class="dash-health-label">Salud general</p><p class="dash-health-value">${ETIQUETA_SALUD[salud.nivel]}</p><p class="dash-health-detail">${detalle}</p></div>
    </div>
  </section>`;
}

function kpis(lista, periodoAnterior) {
  if (!lista.length) return '';
  return `<section class="dash-kpis" aria-label="Indicadores principales">${lista.map(k => {
    const chip = esNumero(k.cambio)
      ? `<span class="dash-change ${k.cambio >= 0 ? 'up' : 'down'}">${k.cambio >= 0 ? '▲' : '▼'} ${pct(Math.abs(k.cambio), 1)}${periodoAnterior ? ` vs ${esc(periodoAnterior)}` : ''}</span>`
      : '';
    return `<div class="dash-kpi"><p class="dash-kpi-label">${esc(k.etiqueta)}</p>
      <p class="dash-kpi-value ${k.tono}">${FORMATO[k.formato](k.valor)}</p>${chip}</div>`;
  }).join('')}</section>`;
}

function tendencia(t) {
  if (!t) return '';
  return `<div class="card dash-chart"><div class="card-header"><h2 class="card-title">Evolución de ventas y utilidad</h2></div>
    <div class="dash-chart-canvas"><canvas id="inicioTendencia" role="img" aria-label="Ventas y utilidad neta por periodo"></canvas></div></div>`;
}

function alertas(p) {
  const cuerpo = p.alertas.length
    ? `<ul class="dash-alert-list">${p.alertas.map(a => `<li class="dash-alert dash-alert--${a.nivel}">
        <span class="dash-alert-icon">${icono('alerta', 16)}</span>
        <div>${INSIGNIA_NIVEL[a.nivel]} <span>${esc(a.texto)}</span> <a href="${a.ruta}">Ver módulo</a></div></li>`).join('')}</ul>
      ${p.totalAlertas > p.alertas.length ? `<p class="form-hint">${p.totalAlertas - p.alertas.length} alerta(s) más en <a href="#/proforma">Proforma y Reporte</a>.</p>` : ''}`
    : `<div class="dash-empty-ok">${icono('check', 22)}<p>No hay alertas con los datos cargados.</p></div>`;
  return `<div class="card dash-alerts"><div class="card-header"><h2 class="card-title">Alertas prioritarias</h2></div>${cuerpo}</div>`;
}

function tarjetaArea(a) {
  return `<article class="dash-area dash-area--${a.estado}">
      <header class="dash-area-header">
        <span class="dash-icon tone-${TONO_AREA[a.id] || 'blue'}">${icono(ICONO_AREA[a.id] || a.id)}</span>
        <h3>${esc(a.titulo)}</h3>${INSIGNIA_ESTADO[a.estado]}
      </header>
      <dl class="dash-points">${a.puntos.map(pt => `<div><dt>${esc(pt.etiqueta)}</dt><dd class="font-mono">${FORMATO[pt.formato](pt.valor)}</dd></div>`).join('')}</dl>
      <p class="dash-reading">${esc(a.interpretacion)}</p>
      <a class="dash-link" href="${a.ruta}">Ver detalle →</a>
    </article>`;
}

function areas(lista) {
  if (!lista.length) return '';
  return `<h2 class="dash-section-title">Puntos clave de la empresa</h2>
    <section class="dash-areas">${lista.map(tarjetaArea).join('')}</section>`;
}

// Bloque separado: no cuenta para la salud de la empresa.
function personal(lista, conEjemplo) {
  const cuerpo = lista.length
    ? `<div class="dash-areas dash-areas--personal">${lista.map(tarjetaArea).join('')}</div>`
    : `<div class="dash-demo"><p>Registre su presupuesto personal y los bienes del hogar para ver aquí su capacidad de ahorro y el estado de sus activos.</p>
        <div class="flex-gap flex-wrap"><a class="btn btn-secondary" href="#/presupuesto">Ir a Presupuesto personal</a>${conEjemplo
    ? '<button type="button" class="btn btn-personal" id="inicioEjemploPersonal">Cargar ejemplo personal</button>' : ''}</div></div>`;
  return `<section class="dash-personal" aria-labelledby="dashPersonal">
    <div class="dash-personal-header"><p class="page-eyebrow">Finanzas personales</p>
      <h2 id="dashPersonal" class="dash-section-title">Mis finanzas personales</h2>
      <p class="form-hint">Independiente de la empresa: no afecta la salud general ni el reporte integrado.</p></div>
    ${cuerpo}</section>`;
}

function faltantes(lista, hayDatos, conEjemplo) {
  if (!lista.length) return '';
  const titulo = hayDatos ? 'Para completar el panorama' : 'Cómo empezar';
  const ejemplo = !hayDatos && conEjemplo
    ? `<div class="dash-demo"><p>¿Solo quiere ver cómo funciona? Cargue el caso ficticio de MUNO MODA en los módulos de la empresa que estén vacíos. No reemplaza datos existentes.</p>
        <button type="button" class="btn btn-primary" id="inicioEjemplo">Cargar ejemplo de empresa</button></div>`
    : '';
  return `<div class="card dash-todo"><h2 class="card-title mb-4">${titulo}</h2>
    <ol>${lista.map(f => `<li><a href="${f.ruta}">${esc(f.modulo)}</a>: ${esc(f.texto)}</li>`).join('')}</ol>${ejemplo}</div>`;
}

function modulos() {
  return `<h2 class="dash-section-title">Módulos</h2>
    ${GRUPOS.map(([grupo, lista]) => `<h3 class="dash-group-title">${grupo}</h3>
    <nav class="module-grid mb-6" aria-label="Módulos: ${grupo}">${lista.map(([ruta, titulo, texto, tono]) => `<a href="#/${ruta}" class="module-card">
      <span class="module-card-icon tone-${tono}">${icono(ruta, 22)}</span>
      <h3>${titulo}</h3><p>${texto}</p></a>`).join('')}</nav>`).join('')}`;
}

// opciones: { panorama, graficar?, cargarEjemploEmpresa?, cargarEjemploPersonal? } —
// graficar(canvasId, config) dibuja con Chart.js; los cargadores llenan los módulos vacíos.
export function inicioUI(page, { panorama: p, graficar = null, cargarEjemploEmpresa = null, cargarEjemploPersonal = null }) {
  const periodoAnterior = p.tendencia && p.tendencia.periodos.length > 1 ? p.tendencia.periodos.at(-2) : null;
  const hayDatos = p.areas.length > 0 || p.kpis.length > 0;
  page.innerHTML = `${hero(p)}
    ${kpis(p.kpis, periodoAnterior)}
    ${hayDatos ? `<div class="dash-row">${tendencia(p.tendencia)}${alertas(p)}</div>` : ''}
    ${areas(p.areas)}
    ${faltantes(p.faltantes, hayDatos, Boolean(cargarEjemploEmpresa))}
    ${personal(p.personal || [], Boolean(cargarEjemploPersonal))}
    ${modulos()}`;
  page.querySelector('#inicioEjemplo')?.addEventListener('click', () => cargarEjemploEmpresa());
  page.querySelector('#inicioEjemploPersonal')?.addEventListener('click', () => cargarEjemploPersonal());
  if (graficar && p.tendencia) {
    graficar('inicioTendencia', {
      type: 'bar',
      data: {
        labels: p.tendencia.periodos,
        datasets: [
          { type: 'bar', label: 'Ventas', data: p.tendencia.ventas, backgroundColor: 'rgba(37, 99, 235, 0.75)', borderRadius: 6, order: 2 },
          { type: 'line', label: 'Utilidad neta', data: p.tendencia.utilidadNeta, borderColor: '#16a34a', backgroundColor: '#16a34a', tension: 0.3, pointRadius: 4, order: 1 }
        ]
      },
      options: { plugins: { legend: { position: 'bottom' } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }
    });
  }
}
