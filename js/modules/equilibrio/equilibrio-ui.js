import { monedaDe } from '../../utils/moneda.js';
import { panelEjemplos, vincularEjemplos, ejemploSeleccionado } from '../../components/ejemplos.js';
// Pantalla #/equilibrio: punto de equilibrio, margen de seguridad, escenarios C-V-U y gráfica.
// El cálculo está en equilibrio-calculations.js; aquí solo se arma el HTML y se atienden los eventos.
// D-074: fuente única de costos — origen «estados» deriva la base en cada consulta y
// origen «manual» es la captura de hoy con un aviso si el CF difiere del de los estados.
import { escapeHTML as esc } from '../../utils/html.js';
import { etiquetaSupuesto } from '../../utils/casos.js';
import { formatCurrencyND as montoBase, formatNumberND, formatPercentND as pct } from '../../utils/format.js';
import { leerNumero } from '../../utils/form.js';
import { mostrarProcedencia, panelTransferencia, vincularTransferencia } from '../../components/transferencia.js';
import { procedenciaVigente, transferenciaCvuInventario, transferenciaCvuPlaneacion } from '../../utils/transferencias.js';
import {
  calcularCVU, calcularEscenarios, ejemploEquilibrio, normalizarEquilibrio,
  puntosGrafica, resolverBase, validarEquilibrio
} from './equilibrio-calculations.js';

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);
// Cantidades y factores: sin decimales si son enteros.
const num = valor => formatNumberND(valor, esNumero(valor) && Number.isInteger(valor) ? 0 : 2);
const valorCampo = valor => (esNumero(valor) ? String(valor) : '');
const valorPorcentaje = fraccion => (fraccion ? String(Number((fraccion * 100).toFixed(4))) : '0');
const CAMPOS_CVU = [
  ['precio', 'eqPrecio'], ['costoVariableUnitario', 'eqCVu'], ['costosFijos', 'eqCF'], ['unidades', 'eqUnidades']
];

const ETIQUETA_MOTIVO_GAO = {
  'sin-ventas': 'sin unidades vendidas',
  'margen-no-positivo': 'margen de contribución no positivo',
  'uaii-no-positiva': 'UAII no positiva',
  'dato-faltante': 'dato faltante'
};

function kpi(valor, etiqueta, clase = '') {
  return `<div class="kpi-card"><div class="kpi-value ${clase}">${valor}</div><div class="kpi-label">${etiqueta}</div></div>`;
}

function seccionResultados(r) {
  const monto = v => montoBase(v, monedaDe(r));
  const claseUAII = esNumero(r.uaii) && r.uaii < 0 ? 'text-danger' : '';
  const claseMS = esNumero(r.msPorcentaje) && r.msPorcentaje < 0 ? 'text-danger' : '';
  const etiquetaGao = `Grado de apalancamiento operativo (GAO)${r.motivoGao ? ` — ${ETIQUETA_MOTIVO_GAO[r.motivoGao] ?? r.motivoGao}` : ''}`;
  return `<div class="kpi-grid mb-6">
    ${kpi(monto(r.mcu), 'Margen de contribución unitario (C$ por unidad)')}
    ${kpi(pct(r.rmc), 'Razón de margen de contribución')}
    ${kpi(`${num(r.peUnidades)} u`, `Punto de equilibrio en unidades${esNumero(r.unidadesMinimas) ? ` (mínimo ${num(r.unidadesMinimas)} enteras)` : ''}`)}
    ${kpi(monto(r.peVentas), 'Punto de equilibrio en ventas (moneda del caso)')}
    ${kpi(monto(r.uaii), `UAII con ${num(r.q)} unidades`, claseUAII)}
    ${kpi(pct(r.msPorcentaje), `Margen de seguridad (${num(r.msUnidades)} u · ${monto(r.msVentas)})`, claseMS)}
    ${kpi(`${num(r.gao)} veces`, etiquetaGao)}
    ${esNumero(r.utilidadObjetivo) ? kpi(`${num(r.unidadesObjetivo)} u`, `Unidades para ganar ${monto(r.utilidadObjetivo)}`) : ''}
  </div>`;
}

function seccionTraza(r) {
  const monto = v => montoBase(v, monedaDe(r));
  const fila = (concepto, formula, calculo, resultado) =>
    `<tr><td>${concepto}</td><td>${formula}</td><td class="font-mono">${calculo}</td><td class="text-right font-mono">${resultado}</td></tr>`;
  const filas = [
    fila('MCu', 'P − CVu', `${num(r.precio)} − ${num(r.cvu)}`, monto(r.mcu)),
    fila('RMC', 'MCu / P', `${num(r.mcu)} / ${num(r.precio)}`, pct(r.rmc)),
    fila('PE en unidades', 'CF / MCu', `${num(r.cf)} / ${num(r.mcu)}`, `${num(r.peUnidades)} u`),
    fila('PE en C$', 'CF / RMC', `${num(r.cf)} / ${formatNumberND(r.rmc, 4)}`, monto(r.peVentas)),
    fila('Ventas', 'P × Q', `${num(r.precio)} × ${num(r.q)}`, monto(r.ventas)),
    fila('Costos variables', 'CVu × Q', `${num(r.cvu)} × ${num(r.q)}`, monto(r.costoVariableTotal)),
    fila('Margen de contribución', 'MCu × Q', `${num(r.mcu)} × ${num(r.q)}`, monto(r.mcTotal)),
    fila('UAII', 'MC − CF', `${num(r.mcTotal)} − ${num(r.cf)}`, monto(r.uaii)),
    fila('Margen de seguridad', '(Q − PE) / Q', `(${num(r.q)} − ${num(r.peUnidades)}) / ${num(r.q)}`, pct(r.msPorcentaje)),
    fila('GAO', 'MC / UAII', `${num(r.mcTotal)} / ${num(r.uaii)}`, `${num(r.gao)} veces`)
  ];
  if (esNumero(r.utilidadObjetivo)) {
    filas.push(fila('Unidades para la utilidad objetivo', '(CF + UO) / MCu',
      `(${num(r.cf)} + ${num(r.utilidadObjetivo)}) / ${num(r.mcu)}`, `${num(r.unidadesObjetivo)} u`));
  }
  return `<div class="card mb-4"><h2 class="card-title">Cálculo paso a paso</h2>
    <div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Concepto</th><th scope="col">Fórmula</th><th scope="col">Cálculo</th><th scope="col" class="text-right">Resultado</th></tr></thead>
      <tbody>${filas.join('')}</tbody></table></div></div>`;
}

function seccionInterpretacion(r) {
  const monto = v => montoBase(v, monedaDe(r));
  const frases = [];
  if (!esNumero(r.mcu) || r.mcu <= 0) {
    frases.push(`<li class="text-danger">El precio (${monto(r.precio)}) no cubre el costo variable unitario (${monto(r.cvu)}): cada unidad vendida aumenta la pérdida y no existe punto de equilibrio. Suba el precio o reduzca el costo variable.</li>`);
  } else {
    frases.push(`<li>Cada unidad vendida aporta ${monto(r.mcu)} (${pct(r.rmc)} de su precio) para cubrir los costos fijos y después generar utilidad.</li>`);
    frases.push(`<li>Para no perder hay que vender al menos <strong>${num(r.unidadesMinimas)} unidades</strong> (${monto(r.peVentas)}) en el periodo.</li>`);
    if (esNumero(r.msPorcentaje) && r.msPorcentaje >= 0) {
      frases.push(`<li>Con ${num(r.q)} unidades, las ventas pueden caer ${pct(r.msPorcentaje)} (${num(r.msUnidades)} unidades) antes de entrar en pérdida.</li>`);
    } else if (esNumero(r.msUnidades)) {
      frases.push(`<li class="text-danger">Con ${num(r.q)} unidades la empresa está bajo su punto de equilibrio: faltan ${num(-r.msUnidades)} unidades para cubrir los costos fijos.</li>`);
    }
    if (esNumero(r.gao) && r.gao > 0 && r.uaii > 0) {
      frases.push(`<li>GAO de ${num(r.gao)}: si el volumen cambia 10 %, la UAII cambia ${formatNumberND(r.gao * 10, 2)} % en el mismo sentido (compare con los escenarios de volumen).</li>`);
    }
    if (esNumero(r.unidadesObjetivo)) {
      frases.push(`<li>Para ganar ${monto(r.utilidadObjetivo)} hay que vender ${num(r.unidadesObjetivo)} unidades (${monto(r.ventasObjetivo)}).</li>`);
    }
  }
  return `<div class="card mb-4"><h2 class="card-title">Interpretación</h2><ul>${frases.join('')}</ul></div>`;
}

function seccionEscenarios(datos) {
  const monto = v => montoBase(v, monedaDe(datos));
  // D-075: los errores de escenario se muestran en la tarjeta, junto al
  // formulario con el que se corrigen; los predefinidos se calculan siempre.
  const erroresEscenario = validarEquilibrio(datos).filter(texto => texto.includes('escenario'));
  const filas = calcularEscenarios(datos).map(e => {
    const r = e.resultado;
    const delta = esNumero(e.deltaUAII)
      ? `<span class="${e.deltaUAII < 0 ? 'text-danger' : e.deltaUAII > 0 ? 'text-success' : ''}">${monto(e.deltaUAII)}${esNumero(e.pctUAII) ? ` (${e.pctUAII > 0 ? '+' : ''}${pct(e.pctUAII)})` : ''}</span>`
      : 'N/D';
    const negrita = e.id === 'base' ? ' style="font-weight:600"' : '';
    const c = contenido => `<td class="text-right font-mono" style="white-space:nowrap">${contenido}</td>`;
    return `<tr${negrita}><td style="min-width:11rem">${esc(e.nombre)}</td>${c(monto(r.precio))}${c(monto(r.cvu))}${c(monto(r.cf))}
      ${c(num(r.q))}${c(monto(r.mcu))}${c(num(r.peUnidades))}${c(monto(r.peVentas))}${c(monto(r.uaii))}
      ${c(e.id === 'base' ? '—' : delta)}${c(pct(r.msPorcentaje))}</tr>`;
  }).join('');
  const e = datos.escenario;
  const campoPct = (id, etiqueta, valor) => `<div class="form-group"><label class="form-label" for="${id}">${etiqueta} (%)</label>
    <input class="form-input" id="${id}" type="number" step="any" value="${valorPorcentaje(valor)}"></div>`;
  return `<div class="card mb-4"><h2 class="card-title">Análisis de escenarios</h2>
    ${erroresEscenario.length ? `<ul style="margin:0 0 .5rem;padding-left:1.2em;font-size:var(--font-size-sm);color:var(--color-danger)">${erroresEscenario.map(texto => `<li>${esc(texto)}</li>`).join('')}</ul>` : ''}
    <p class="form-hint">Cada fila cambia una sola variable respecto de la base. El escenario personalizado combina los cambios que indique (por ejemplo, −10 en volumen).</p>
    <form id="formEscenario" class="mb-4" novalidate><div class="form-row">
      ${campoPct('escPrecio', 'Precio', e.precio)}${campoPct('escCV', 'Costo variable unitario', e.costoVariable)}
      ${campoPct('escCF', 'Costos fijos', e.costosFijos)}${campoPct('escVolumen', 'Volumen', e.volumen)}
    </div><button type="submit" class="btn btn-secondary">Aplicar escenario personalizado</button></form>
    <div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Escenario</th><th scope="col" class="text-right">Precio</th><th scope="col" class="text-right">CVu</th>
        <th scope="col" class="text-right">CF</th><th scope="col" class="text-right">Unidades</th><th scope="col" class="text-right">MCu</th>
        <th scope="col" class="text-right">PE (u)</th><th scope="col" class="text-right">PE (moneda del caso)</th><th scope="col" class="text-right">UAII</th>
        <th scope="col" class="text-right">Cambio en la UAII</th><th scope="col" class="text-right">Margen de seguridad</th></tr></thead>
      <tbody>${filas}</tbody></table></div></div>`;
}

function configGrafica(r) {
  const puntos = puntosGrafica(r);
  if (!puntos) return null;
  const linea = (label, data, color, extra = {}) => ({ label, data, borderColor: color, backgroundColor: color, pointRadius: 0, borderWidth: 2, ...extra });
  const marca = (label, punto, color) => ({ label, data: [punto], borderColor: color, backgroundColor: color, pointRadius: 6, showLine: false });
  const datasets = [
    linea('Ingresos totales', puntos.ingresos, '#16a34a'),
    linea('Costos totales', puntos.costosTotales, '#dc2626'),
    linea('Costos fijos', puntos.costosFijos, '#d97706', { borderDash: [6, 4] })
  ];
  if (puntos.equilibrio) datasets.push(marca('Punto de equilibrio', puntos.equilibrio, '#2563eb'));
  if (puntos.actual) datasets.push(marca('Volumen actual', puntos.actual, '#7c3aed'));
  return {
    type: 'line',
    data: { datasets },
    options: {
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { type: 'linear', beginAtZero: true, title: { display: true, text: 'Unidades' } },
        y: { beginAtZero: true, title: { display: true, text: 'C$' } }
      }
    }
  };
}

// opciones: { datos, guardar, graficar?, estados?, configApalancamiento? }
export function equilibrioUI(page, opciones) {
  const { guardar, graficar = null, estados = null, configApalancamiento = null,
    leerFuentes = () => ({}), confirmar = texto => window.confirm(texto) } = opciones;
  let datos = normalizarEquilibrio(opciones.datos);
  let procedenciaBorrador = {};
  const monto = v => montoBase(v, monedaDe(datos));

  const campo = id => page.querySelector(`#${id}`)?.value ?? '';
  const numero = id => {
    const { vacio, valor } = leerNumero(campo(id));
    return { vacio, valor };
  };

  function mensaje(texto, error = false) {
    const el = page.querySelector('#equilibrioMensaje');
    if (!el) return;
    el.textContent = texto;
    el.className = error ? 'text-danger' : 'text-muted';
  }

  // D-074: se guardan los datos de captura (origen, periodo y unidades en modo
  // estados; sin copias derivadas). La validación corre sobre los datos
  // efectivos, con la base derivada cuando el origen son los estados.
  function persistir(nuevos, texto) {
    const resolucion = resolverBase(nuevos, estados, configApalancamiento);
    if (resolucion.error) { mensaje(resolucion.error, true); return; }
    const efectivos = resolucion.base ? { ...nuevos, ...resolucion.base } : nuevos;
    const errores = validarEquilibrio(efectivos);
    if (errores.length) { mensaje(errores.join(' '), true); return; }
    try {
      guardar(nuevos);
    } catch (error) {
      mensaje(`No se pudo guardar: ${error.message}. Los datos anteriores no cambiaron.`, true);
      return;
    }
    datos = nuevos;
    render();
    mensaje(texto);
  }

  function avisoCF(a) {
    return `<p class="form-hint" style="color:var(--color-warning)">El CF manual (${monto(a.cfManual)}) difiere del CF de los estados (${monto(a.cfEstados)}) en ${pct(a.diferenciaPct)}. Verifique la captura o la clasificación de <a href="#/apalancamiento">Apalancamiento</a>; el aviso no impide guardar.</p>`;
  }

  function seccionDatos(resolucion) {
    const selector = estados
      ? `<div class="form-group"><label class="form-label" for="eqOrigen">Fuente de los costos</label>
          <select class="form-select" id="eqOrigen">
            <option value="manual"${datos.origen !== 'estados' ? ' selected' : ''}>Captura manual</option>
            <option value="estados"${datos.origen === 'estados' ? ' selected' : ''}>Derivar de los estados</option>
          </select></div>`
      : '';
    if (datos.origen === 'estados' && estados) {
      const opcionesPeriodo = estados.periods.map(p =>
        `<option value="${esc(p)}"${p === datos.periodo ? ' selected' : ''}>${esc(p)}</option>`).join('');
      const b = resolucion.base;
      const derivado = (id, etiqueta, valor) => `<div class="form-group"><label class="form-label" for="${id}">${etiqueta}</label>
        <input class="form-input" id="${id}" type="text" readonly value="${valorCampo(valor)}"></div>`;
      return `<div class="card mb-4"><h2 class="card-title">1. Datos</h2>
        <form id="formEquilibrio" novalidate><div class="form-row">
          ${selector}
          <div class="form-group"><label class="form-label" for="eqPeriodo">Periodo de los estados</label>
            <select class="form-select" id="eqPeriodo">${opcionesPeriodo}</select></div>
          <div class="form-group"><label class="form-label" for="eqUnidadVentas">
            <input type="checkbox" id="eqUnidadVentas"${datos.unidadVentas ? ' checked' : ''}> Medir en C$1 de ventas (sin unidades físicas)</label></div>
          ${datos.unidadVentas
            ? derivado('eqUnidades', 'Unidades: ventas del periodo en C$ (derivadas)', b?.unidades)
            : `<div class="form-group"><label class="form-label" for="eqUnidades">Unidades vendidas en el periodo</label>
            <input class="form-input" id="eqUnidades" type="number" min="0" step="any" value="${valorCampo(datos.unidades)}"></div>`}
          <div class="form-group"><label class="form-label" for="eqUtilidad">Utilidad objetivo (moneda del caso, opcional)</label>
            <input class="form-input" id="eqUtilidad" type="number" step="any" value="${valorCampo(datos.utilidadObjetivo)}"></div>
        </div>
        <div class="form-row">
          ${derivado('eqPrecio', 'Precio de venta unitario (C$, derivado)', b?.precio)}
          ${derivado('eqCVu', 'Costo variable unitario (C$, derivado)', b?.costoVariableUnitario)}
          ${derivado('eqCF', 'Costos fijos del periodo (C$, derivados)', b?.costosFijos)}
        </div>
        <p class="form-hint">Derivados en cada consulta con la clasificación de <a href="#/apalancamiento">Apalancamiento</a>: P = Ventas / unidades, CVu = CV / unidades y CF = costos fijos − otros ingresos operativos (si los hay). P = ventas / unidades supone un precio promedio; con varios productos, use una mezcla representativa.</p>
        ${datos.unidadVentas ? '<p class="form-hint"><span class="badge badge-warning">SUPUESTO</span> Unidad de medida: C$1 de ventas. La empresa no publica unidades físicas, así que el precio es 1 y el punto de equilibrio «en unidades» es el punto de equilibrio en C$. El costo variable unitario es la proporción de costo variable por cada córdoba vendido.</p>' : ''}
        <button type="submit" class="btn btn-primary">Calcular y guardar</button></form>
        ${resolucion.error ? `<p class="form-hint" style="color:var(--color-danger)">${esc(resolucion.error)}</p>` : ''}</div>`;
    }
    return `<div class="card mb-4"><h2 class="card-title">1. Datos</h2>
      <form id="formEquilibrio" novalidate><div class="form-row">
        ${selector}
        <div class="form-group"><label class="form-label" for="eqPrecio">Precio de venta unitario (moneda del caso)</label>
          <input class="form-input" id="eqPrecio" type="number" min="0" step="any" value="${valorCampo(datos.precio)}"></div>
        <div class="form-group"><label class="form-label" for="eqCVu">Costo variable unitario (moneda del caso)</label>
          <input class="form-input" id="eqCVu" type="number" min="0" step="any" value="${valorCampo(datos.costoVariableUnitario)}"></div>
        <div class="form-group"><label class="form-label" for="eqCF">Costos fijos del periodo (moneda del caso)</label>
          <input class="form-input" id="eqCF" type="number" min="0" step="any" value="${valorCampo(datos.costosFijos)}"></div>
        <div class="form-group"><label class="form-label" for="eqUnidades">Unidades vendidas o previstas</label>
          <input class="form-input" id="eqUnidades" type="number" min="0" step="any" value="${valorCampo(datos.unidades)}"></div>
        <div class="form-group"><label class="form-label" for="eqUtilidad">Utilidad objetivo (moneda del caso, opcional)</label>
          <input class="form-input" id="eqUtilidad" type="number" step="any" value="${valorCampo(datos.utilidadObjetivo)}"></div>
      </div>
      ${estados
        ? '<p class="form-hint">Si prefiere tomar el precio y los costos de un periodo de los estados, cambie la fuente de los costos a «Derivar de los estados». Con los estados guardados, se avisa cuando el CF manual difiere del CF de estados.</p>'
        : '<p class="form-hint">Si guarda estados financieros y clasifica sus costos en <a href="#/apalancamiento">Apalancamiento</a>, puede derivar el precio y los costos de un periodo.</p>'}
      ${resolucion.avisoCF ? avisoCF(resolucion.avisoCF) : ''}
      <button type="submit" class="btn btn-primary">Calcular y guardar</button></form></div>`;
  }

  function seccionTransferencias() {
    if (datos.origen === 'estados' && estados) {
      return `<p class="form-hint">Fuente en vivo · ${esc(estados.name || 'Estados guardados')} · ${esc(monedaDe(estados))}. El periodo se elige en Datos.</p>`;
    }
    const { inventario, planeacion } = leerFuentes();
    const controles = [];
    if (planeacion?.periodos.length) controles.push(`<div class="form-group">
      <label for="eqTraerPeriodo">Periodo de Planeación</label>
      <select class="form-select" id="eqTraerPeriodo">${planeacion.periodos.map(p =>
        `<option value="${esc(p)}">${esc(p)}</option>`).join('')}</select>
      <button type="button" class="btn btn-secondary" id="eqTraerPlaneacion">Ver presupuesto guardado</button></div>`);
    if (inventario?.productos.length) controles.push(`<div class="form-group">
      <label for="eqTraerProducto">Producto de Inventario</label>
      <select class="form-select" id="eqTraerProducto">${inventario.productos.map(p =>
        `<option value="${esc(p.id)}">${esc(p.nombre)}</option>`).join('')}</select>
      <label><input type="checkbox" id="eqTraerCostoConfirmado"> El costo promedio cubre todo el costo variable unitario de esta línea</label>
      <button type="button" class="btn btn-secondary" id="eqTraerInventario">Ver costo del producto</button></div>`);
    return (controles.length ? panelTransferencia('eqTraer', controles.join(''),
      'Aplique los datos compatibles al formulario. Las unidades de Inventario corresponden a existencias y las de Planeación a ventas previstas.')
      : '') + mostrarProcedencia(datos.procedencia ?? {}, dato => procedenciaVigente(dato, dato.origen === 'inventario'
      ? transferenciaCvuInventario(inventario, dato.producto, monedaDe(datos), {}, true)
      : transferenciaCvuPlaneacion(planeacion, dato.periodo, monedaDe(datos), {})));
  }

  function render() {
    procedenciaBorrador = { ...datos.procedencia };
    const resolucion = resolverBase(datos, estados, configApalancamiento);
    const datosEfectivos = resolucion.base ? { ...datos, ...resolucion.base } : datos;
    const errores = validarEquilibrio(datosEfectivos);
    // D-075: la base se calcula aunque el escenario esté dañado — los errores de
    // escenario se muestran en su tarjeta, no tumban los resultados. La copia de
    // validación lleva un escenario en ceros para no mezclar esas notas con las
    // de la base.
    const erroresBase = validarEquilibrio(normalizarEquilibrio({ ...datosEfectivos, escenario: {} }));
    const r = !resolucion.error && !erroresBase.length ? calcularCVU(datosEfectivos) : null;
    // D-113: con AGRI-CORP consolidado, CVu y CF salen de la clasificación supuesta (S4–S6).
    const notaSupuesto = r && datos.origen === 'estados' && opciones.supuestos?.costos
      ? `<p class="form-hint mb-4">${etiquetaSupuesto('S4–S6')} El costo variable unitario, los costos fijos y todo lo que sale de ellos (punto de equilibrio, margen de seguridad, GAO) usan la clasificación fija/variable de Apalancamiento, que AGRI-CORP no publica. Las ventas del periodo son reales.</p>`
      : '';
    const resultados = r
      ? `${notaSupuesto}${seccionResultados(r)}${seccionInterpretacion(r)}${seccionTraza(r)}
        <div class="card mb-4"><h2 class="card-title">Gráfica costo-volumen-utilidad</h2>
          <p class="form-hint">El punto de equilibrio está donde los ingresos totales cortan a los costos totales. A la derecha hay utilidad; a la izquierda, pérdida.</p>
          <div style="height:320px"><canvas id="equilibrioChart" role="img" aria-label="Ingresos y costos totales según las unidades vendidas"></canvas></div></div>
        ${seccionEscenarios(datosEfectivos)}`
      : `<div class="card empty-state"><p>${esc(resolucion.error || 'Complete el precio, el costo variable unitario, los costos fijos y las unidades, o pulse "Cargar ejemplo".')}</p>
        ${errores.length ? `<ul>${errores.map(texto => `<li>${esc(texto)}</li>`).join('')}</ul>` : ''}</div>`;
    page.innerHTML = `<div class="page-header"><h1 class="page-title">Punto de Equilibrio y C-V-U</h1>
        <p class="page-subtitle">Margen de contribución, punto de equilibrio en unidades y en C$, margen de seguridad y escenarios.</p></div>
      <p id="equilibrioMensaje" role="status" aria-live="polite" class="text-muted">Ingrese los datos del producto o de la línea y pulse Calcular.</p>
      ${panelEjemplos('equilibrio', 'eqEjemplo')}
      ${seccionTransferencias()}
      ${seccionDatos(resolucion)}
      ${resultados}`;
    bind();
    const config = r && graficar ? configGrafica(r) : null;
    if (config) graficar('equilibrioChart', config);
  }

  function bind() {
    vincularEjemplos(page, 'equilibrio');
    const actuales = () => Object.fromEntries(CAMPOS_CVU.map(([clave, id]) => [clave, numero(id).valor]));
    vincularTransferencia(page, {
      id: 'eqTraer', confirmar, mensaje, textoAplicar: 'Aplicar al borrador',
      fuentes: {
        eqTraerPlaneacion: () => transferenciaCvuPlaneacion(leerFuentes().planeacion, campo('eqTraerPeriodo'), monedaDe(datos), actuales()),
        eqTraerInventario: () => transferenciaCvuInventario(leerFuentes().inventario, campo('eqTraerProducto'), monedaDe(datos), actuales(),
          page.querySelector('#eqTraerCostoConfirmado')?.checked)
      },
      aplicar(filas, fichas, origen) {
        const otros = Object.entries(procedenciaBorrador).filter(([clave, dato]) =>
          !Object.hasOwn(fichas, clave) && numero(CAMPOS_CVU.find(([campo]) => campo === clave)[1]).valor === dato.valor);
        const incompatibles = otros.some(([, dato]) => dato.origen === origen.origen
          ? dato.producto !== origen.producto || dato.periodo !== origen.periodo || dato.escenario !== origen.escenario || dato.caso !== origen.caso
          : !dato.producto || dato.producto !== origen.producto);
        if (incompatibles) { mensaje('Elija los campos vinculados del mismo producto y periodo, o revise primero el borrador.', true); return; }
        for (const fila of filas) {
          const input = CAMPOS_CVU.find(([clave]) => clave === fila.campo)[1];
          page.querySelector(`#${input}`).value = String(fila.valor);
        }
        procedenciaBorrador = { ...Object.fromEntries(otros), ...fichas };
        page.querySelector('#eqTraerVistaPrevia').innerHTML = '';
        mensaje('Datos aplicados al formulario. Pulse Calcular y guardar.');
      }
    });
    page.querySelector('#eqEjemplo')?.addEventListener('click', () => {
      persistir(normalizarEquilibrio(ejemploSeleccionado(page, 'equilibrio', ejemploEquilibrio)),
        'Ejemplo seleccionado cargado. Revise su alcance en el panel.');
    });
    page.querySelector('#eqUnidadVentas')?.addEventListener('change', event => {
      // Cambio de captura: se guarda al pulsar Calcular y guardar.
      const resto = { ...datos };
      delete resto.unidadVentas;
      datos = normalizarEquilibrio(event.target.checked ? { ...resto, unidadVentas: true } : resto);
      render();
    });
    page.querySelector('#eqOrigen')?.addEventListener('change', event => {
      // El cambio de origen es de captura: se guarda al pulsar Calcular y guardar.
      datos = normalizarEquilibrio({ ...datos, origen: event.target.value });
      render();
    });
    page.querySelector('#formEquilibrio')?.addEventListener('submit', event => {
      event.preventDefault();
      if (datos.origen === 'estados' && estados) {
        const unidades = datos.unidadVentas ? { vacio: true } : numero('eqUnidades');
        const nuevos = {
          origen: 'estados', periodo: campo('eqPeriodo'),
          ...(datos.unidadVentas ? { unidadVentas: true } : {}),
          unidades: unidades.vacio ? null : unidades.valor,
          utilidadObjetivo: numero('eqUtilidad').vacio ? null : numero('eqUtilidad').valor,
          escenario: datos.escenario
        };
        persistir(nuevos, `Datos guardados: el precio y los costos se derivan de los estados de ${nuevos.periodo} en cada consulta.`);
        return;
      }
      const leidos = Object.fromEntries(CAMPOS_CVU.map(([clave, id]) => [clave, numero(id)]));
      const objetivo = numero('eqUtilidad');
      const nuevos = { ...datos, origen: 'manual', utilidadObjetivo: objetivo.vacio ? null : objetivo.valor };
      for (const [clave, { valor }] of Object.entries(leidos)) nuevos[clave] = valor;
      const fichas = Object.entries(procedenciaBorrador).filter(([clave, dato]) => nuevos[clave] === dato.valor);
      if (fichas.length) nuevos.procedencia = Object.fromEntries(fichas);
      else delete nuevos.procedencia;
      // Un texto no numérico en la utilidad objetivo es un error, no un campo vacío.
      if (!objetivo.vacio && objetivo.valor === null) { mensaje('La utilidad objetivo debe ser un número.', true); return; }
      persistir(nuevos, 'Datos guardados. Resultados recalculados.');
    });
    page.querySelector('#formEscenario')?.addEventListener('submit', event => {
      event.preventDefault();
      const escenario = {};
      for (const [clave, id] of [['precio', 'escPrecio'], ['costoVariable', 'escCV'], ['costosFijos', 'escCF'], ['volumen', 'escVolumen']]) {
        const { vacio, valor } = numero(id);
        if (!vacio && valor === null) { mensaje('Cada cambio del escenario debe ser un número (por ejemplo, 5 o −10).', true); return; }
        escenario[clave] = vacio ? 0 : valor / 100;
      }
      persistir({ ...datos, escenario }, 'Escenario personalizado aplicado.');
    });
  }

  render();
}
