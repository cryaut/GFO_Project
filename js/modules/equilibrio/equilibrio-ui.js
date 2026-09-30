// Pantalla #/equilibrio: punto de equilibrio, margen de seguridad, escenarios C-V-U y gráfica.
// El cálculo está en equilibrio-calculations.js; aquí solo se arma el HTML y se atienden los eventos.
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND as monto, formatNumberND, formatPercentND as pct } from '../../utils/format.js';
import { leerNumero } from '../../utils/form.js';
import {
  baseDesdeEstados, calcularCVU, calcularEscenarios, ejemploEquilibrio, normalizarEquilibrio,
  puntosGrafica, validarEquilibrio
} from './equilibrio-calculations.js';

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);
// Cantidades y factores: sin decimales si son enteros.
const num = valor => formatNumberND(valor, esNumero(valor) && Number.isInteger(valor) ? 0 : 2);
const valorCampo = valor => (esNumero(valor) ? String(valor) : '');
const valorPorcentaje = fraccion => (fraccion ? String(Number((fraccion * 100).toFixed(4))) : '0');

function kpi(valor, etiqueta, clase = '') {
  return `<div class="kpi-card"><div class="kpi-value ${clase}">${valor}</div><div class="kpi-label">${etiqueta}</div></div>`;
}

function seccionResultados(r) {
  const claseUAII = esNumero(r.uaii) && r.uaii < 0 ? 'text-danger' : '';
  const claseMS = esNumero(r.msPorcentaje) && r.msPorcentaje < 0 ? 'text-danger' : '';
  return `<div class="kpi-grid mb-6">
    ${kpi(monto(r.mcu), 'Margen de contribución unitario (C$ por unidad)')}
    ${kpi(pct(r.rmc), 'Razón de margen de contribución')}
    ${kpi(`${num(r.peUnidades)} u`, `Punto de equilibrio en unidades${esNumero(r.unidadesMinimas) ? ` (mínimo ${num(r.unidadesMinimas)} enteras)` : ''}`)}
    ${kpi(monto(r.peVentas), 'Punto de equilibrio en ventas (C$)')}
    ${kpi(monto(r.uaii), `UAII con ${num(r.q)} unidades`, claseUAII)}
    ${kpi(pct(r.msPorcentaje), `Margen de seguridad (${num(r.msUnidades)} u · ${monto(r.msVentas)})`, claseMS)}
    ${kpi(`${num(r.gao)} veces`, 'Grado de apalancamiento operativo (GAO)')}
    ${esNumero(r.utilidadObjetivo) ? kpi(`${num(r.unidadesObjetivo)} u`, `Unidades para ganar ${monto(r.utilidadObjetivo)}`) : ''}
  </div>`;
}

function seccionTraza(r) {
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
    <p class="form-hint">Cada fila cambia una sola variable respecto de la base. El escenario personalizado combina los cambios que indique (por ejemplo, −10 en volumen).</p>
    <form id="formEscenario" class="mb-4" novalidate><div class="form-row">
      ${campoPct('escPrecio', 'Precio', e.precio)}${campoPct('escCV', 'Costo variable unitario', e.costoVariable)}
      ${campoPct('escCF', 'Costos fijos', e.costosFijos)}${campoPct('escVolumen', 'Volumen', e.volumen)}
    </div><button type="submit" class="btn btn-secondary">Aplicar escenario personalizado</button></form>
    <div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Escenario</th><th scope="col" class="text-right">Precio</th><th scope="col" class="text-right">CVu</th>
        <th scope="col" class="text-right">CF</th><th scope="col" class="text-right">Unidades</th><th scope="col" class="text-right">MCu</th>
        <th scope="col" class="text-right">PE (u)</th><th scope="col" class="text-right">PE (C$)</th><th scope="col" class="text-right">UAII</th>
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
  const { guardar, graficar = null, estados = null, configApalancamiento = null } = opciones;
  let datos = normalizarEquilibrio(opciones.datos);

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

  function persistir(nuevos, texto) {
    const errores = validarEquilibrio(nuevos);
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

  function seccionEstados() {
    if (!estados) {
      return '<p class="form-hint">Si guarda estados financieros y clasifica sus costos en <a href="#/apalancamiento">Apalancamiento</a>, puede tomar el precio y los costos de un periodo.</p>';
    }
    const opcionesPeriodo = estados.periods.map((p, k) =>
      `<option value="${esc(p)}"${k === estados.periods.length - 1 ? ' selected' : ''}>${esc(p)}</option>`).join('');
    return `<div class="card mb-4"><h2 class="card-title">Tomar de los estados financieros</h2>
      <p class="form-hint">Usa las ventas y los costos del periodo, separados en fijos y variables según <a href="#/apalancamiento">Apalancamiento</a>: P = Ventas / unidades, CVu = CV / unidades y CF = costos fijos.</p>
      <div class="form-row">
        <div class="form-group"><label class="form-label" for="eqPeriodo">Periodo</label><select class="form-select" id="eqPeriodo">${opcionesPeriodo}</select></div>
        <div class="form-group"><label class="form-label" for="eqUnidadesVendidas">Unidades vendidas en el periodo</label>
          <input class="form-input" id="eqUnidadesVendidas" type="number" min="0" step="any"></div>
        <div class="form-group" style="display:flex;align-items:flex-end"><button type="button" class="btn btn-secondary" id="eqDesdeEstados">Tomar datos</button></div>
      </div></div>`;
  }

  function render() {
    const errores = validarEquilibrio(datos);
    const r = errores.length ? null : calcularCVU(datos);
    const resultados = r
      ? `${seccionResultados(r)}${seccionInterpretacion(r)}${seccionTraza(r)}
        <div class="card mb-4"><h2 class="card-title">Gráfica costo-volumen-utilidad</h2>
          <p class="form-hint">El punto de equilibrio está donde los ingresos totales cortan a los costos totales. A la derecha hay utilidad; a la izquierda, pérdida.</p>
          <div style="height:320px"><canvas id="equilibrioChart" role="img" aria-label="Ingresos y costos totales según las unidades vendidas"></canvas></div></div>
        ${seccionEscenarios(datos)}`
      : '<div class="card empty-state"><p>Complete el precio, el costo variable unitario, los costos fijos y las unidades, o pulse "Cargar ejemplo".</p></div>';
    page.innerHTML = `<div class="page-header"><h1 class="page-title">Punto de Equilibrio y C-V-U</h1>
        <p class="page-subtitle">Margen de contribución, punto de equilibrio en unidades y en C$, margen de seguridad y escenarios.</p></div>
      <p id="equilibrioMensaje" role="status" aria-live="polite" class="text-muted">Ingrese los datos del producto o de la línea y pulse Calcular.</p>
      <div class="flex-gap flex-wrap mb-4"><button type="button" class="btn btn-secondary" id="eqEjemplo">Cargar ejemplo</button></div>
      <div class="card mb-4"><h2 class="card-title">1. Datos</h2>
        <form id="formEquilibrio" novalidate><div class="form-row">
          <div class="form-group"><label class="form-label" for="eqPrecio">Precio de venta unitario (C$)</label>
            <input class="form-input" id="eqPrecio" type="number" min="0" step="any" value="${valorCampo(datos.precio)}"></div>
          <div class="form-group"><label class="form-label" for="eqCVu">Costo variable unitario (C$)</label>
            <input class="form-input" id="eqCVu" type="number" min="0" step="any" value="${valorCampo(datos.costoVariableUnitario)}"></div>
          <div class="form-group"><label class="form-label" for="eqCF">Costos fijos del periodo (C$)</label>
            <input class="form-input" id="eqCF" type="number" min="0" step="any" value="${valorCampo(datos.costosFijos)}"></div>
          <div class="form-group"><label class="form-label" for="eqUnidades">Unidades vendidas o previstas</label>
            <input class="form-input" id="eqUnidades" type="number" min="0" step="any" value="${valorCampo(datos.unidades)}"></div>
          <div class="form-group"><label class="form-label" for="eqUtilidad">Utilidad objetivo (C$, opcional)</label>
            <input class="form-input" id="eqUtilidad" type="number" step="any" value="${valorCampo(datos.utilidadObjetivo)}"></div>
        </div><button type="submit" class="btn btn-primary">Calcular y guardar</button></form></div>
      ${seccionEstados()}
      ${resultados}`;
    bind();
    const config = r && graficar ? configGrafica(r) : null;
    if (config) graficar('equilibrioChart', config);
  }

  function bind() {
    page.querySelector('#eqEjemplo')?.addEventListener('click', () => {
      persistir(normalizarEquilibrio(ejemploEquilibrio()),
        'Ejemplo cargado: una prenda de MUNO MODA en un trimestre (datos ficticios).');
    });
    page.querySelector('#formEquilibrio')?.addEventListener('submit', event => {
      event.preventDefault();
      const leidos = {
        precio: numero('eqPrecio'), costoVariableUnitario: numero('eqCVu'),
        costosFijos: numero('eqCF'), unidades: numero('eqUnidades')
      };
      const objetivo = numero('eqUtilidad');
      const nuevos = { ...datos, utilidadObjetivo: objetivo.vacio ? null : objetivo.valor };
      for (const [clave, { valor }] of Object.entries(leidos)) nuevos[clave] = valor;
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
    page.querySelector('#eqDesdeEstados')?.addEventListener('click', () => {
      const unidades = numero('eqUnidadesVendidas').valor;
      const periodo = campo('eqPeriodo');
      const resultado = baseDesdeEstados(estados, configApalancamiento, periodo, unidades);
      if (resultado.error) { mensaje(resultado.error, true); return; }
      persistir({ ...datos, ...resultado.base },
        `Datos tomados de los estados de ${periodo}: precio ${monto(resultado.base.precio)}, CVu ${monto(resultado.base.costoVariableUnitario)} y CF ${monto(resultado.base.costosFijos)}.`);
    });
  }

  render();
}
