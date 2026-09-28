// Pantalla #/apalancamiento: clasificación de costos, DAP, tasa por defecto, grados y traza.
// Plan: docs/planificacion/apalancamiento/04-pantalla.md. El cálculo está en apalancamiento-calculations.js.
import { normalizeFinancialData } from '../estados/estados-normalize.js';
import { TASA_IR_DEFECTO } from '../../utils/calculate.js';
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format.js';
import {
  COMPORTAMIENTOS, calcularApalancamiento, cuentasOperativas, resolverComportamiento
} from './apalancamiento-calculations.js';

const TIPO_CUENTA = {
  costoVentas: 'Costo de ventas', gastosAdmin: 'Gastos de administración', gastosVentas: 'Gastos de ventas'
};
const ETIQUETA_COMPORTAMIENTO = { variable: 'Variable', fijo: 'Fijo', mixto: 'Mixto' };
const CONCEPTOS_SIN_MONTO = { T: 'tasa', GAO: 'grado', GAF: 'grado', GAT: 'grado' };

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function objeto(valor) {
  return valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {};
}

// Número escrito por el usuario: '.' decimal y ',' de miles, como en el resto del toolkit.
// Devuelve { vacio } o { valor }, con valor null si el texto no es un número.
function leerNumero(texto) {
  const limpio = String(texto ?? '').replace(/C\$/gi, '').replace(/\s+/g, '');
  if (!limpio) return { vacio: true, valor: null };
  if (!/^-?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/.test(limpio)) return { vacio: false, valor: null };
  return { vacio: false, valor: Number(limpio.replace(/,/g, '')) };
}

// Porcentaje para un campo de texto, sin arrastrar errores de coma flotante (0.07 × 100).
function aTextoPorcentaje(fraccion) {
  return String(Number((fraccion * 100).toFixed(6)));
}

const fmtMonto = valor => (esNumero(valor) ? formatCurrency(valor) : 'N/D');
const fmtTasa = valor => (esNumero(valor) ? formatPercent(valor, 2) : 'N/D');
function fmtGrado(valor) {
  if (!esNumero(valor)) return 'N/D';
  const texto = formatNumber(valor, 2);
  return valor < 0 ? `<span class="text-danger" title="Bajo el punto de equilibrio">${texto}</span>` : texto;
}

function fmtConcepto(fila) {
  const clase = CONCEPTOS_SIN_MONTO[fila.concepto];
  if (clase === 'tasa') return fmtTasa(fila.valor);
  if (clase === 'grado') return fmtGrado(fila.valor);
  return fmtMonto(fila.valor);
}

function textoAdvertencia(aviso, tasaMostrada) {
  const lista = cuentas => cuentas.map(esc).join(', ');
  switch (aviso.codigo) {
    case 'clasificacion-sugerida':
      return `Clasificación propuesta sin confirmar: ${lista(aviso.cuentas)}. Revísela y pulse Guardar.`;
    case 'sin-comportamiento':
      return `Falta clasificar como variable, fija o mixta: ${lista(aviso.cuentas)}. Sin eso, el GAO y el GAT salen N/D.`;
    case 'bajo-equilibrio-operativo':
      return `${esc(aviso.periodo)}: la UAII es negativa. La empresa está bajo su punto de equilibrio operativo; un grado negativo no se lee como sensibilidad.`;
    case 'bajo-equilibrio-financiero':
      return `${esc(aviso.periodo)}: UAI − DAP / (1 − T) es negativo. La empresa está bajo su punto de equilibrio financiero.`;
    case 'tasa-por-defecto':
      return `${esc(aviso.periodo)}: no hay una tasa efectiva válida (IR / UAI); se usa la tasa por defecto de ${tasaMostrada}.`;
    case 'estructura-cambio':
      return `${esc(aviso.desde)} → ${esc(aviso.hasta)}: el GAO por variación (${fmtGrado(aviso.gaoVariacion)}) difiere del estructural de ${esc(aviso.desde)} (${fmtGrado(aviso.gaoEstructural)}). Cambió la estructura de costos o hay cuentas mal clasificadas.`;
    default:
      return esc(aviso.codigo);
  }
}

function motivosND(periodo) {
  const notas = new Set();
  for (const falta of periodo.faltantes) {
    if (falta.tipo === 'sinClasificacion') notas.add(`Cuenta sin tipo en Estados: ${esc(falta.cuenta)}`);
    if (falta.tipo === 'sinComportamiento') notas.add(`Falta clasificar: ${esc(falta.cuenta)}`);
    if (falta.tipo === 'dapInvalido') notas.add('DAP guardado inválido');
  }
  const { gao, gaf, gat } = periodo.grados;
  if (!notas.size && [gao, gaf, gat].some(valor => valor === null)) notas.add('Denominador 0');
  return [...notas].join('; ');
}

function interpretacion(periodo) {
  const { grados, variables: v } = periodo;
  const frases = [];
  if (esNumero(grados.gao) && grados.gao > 0 && v.uaii > 0) {
    const x = formatNumber(grados.gao, 2);
    frases.push(`<li><strong>GAO ${x}.</strong> Si las ventas cambian 1 %, la UAII cambia ${x} % en el mismo sentido.</li>`);
  }
  const financieroPositivo = esNumero(v.denominadorGaf) && v.denominadorGaf > 0;
  if (esNumero(grados.gaf) && grados.gaf > 0 && financieroPositivo) {
    const x = formatNumber(grados.gaf, 2);
    frases.push(`<li><strong>GAF ${x}.</strong> Si la UAII cambia 1 %, la utilidad para accionistas comunes (UN − DAP) cambia ${x} %.</li>`);
  }
  if (esNumero(grados.gat) && grados.gat > 0 && financieroPositivo && v.uaii > 0) {
    const x = formatNumber(grados.gat, 2);
    frases.push(`<li><strong>GAT ${x}.</strong> Si las ventas cambian 1 %, la utilidad para accionistas comunes cambia ${x} %.</li>`);
  }
  return frases.length
    ? `<ul>${frases.join('')}</ul>`
    : `<p class="text-muted">No hay grados positivos para interpretar en ${esc(periodo.periodo)}.</p>`;
}

function trazaPeriodo(periodo) {
  const filas = periodo.traza.map(fila => {
    const cuentas = fila.cuentas.map(cuenta => {
      const detalle = cuenta.comportamiento ? ` (${esc(cuenta.comportamiento)}, ${esc(cuenta.origen)})` : '';
      return `${esc(cuenta.nombre)}${detalle}: ${fmtMonto(cuenta.importe)}`;
    }).join('<br>');
    return `<tr><td>${esc(fila.concepto)}</td><td>${esc(fila.formula)}</td><td>${cuentas || '—'}</td>
      <td class="text-right font-mono" style="white-space:nowrap">${fmtConcepto(fila)}</td></tr>`;
  }).join('');
  return `<details class="mt-4"><summary>Traza de ${esc(periodo.periodo)}: cuenta → concepto → fórmula → resultado</summary>
    <div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Concepto</th><th scope="col">Fórmula</th><th scope="col">Cuentas</th><th scope="col" class="text-right">Resultado</th></tr></thead>
      <tbody>${filas || '<tr><td colspan="4">Periodo sin datos suficientes.</td></tr>'}</tbody></table></div></details>`;
}

function paginaSinDatos(detalle = '') {
  return `<div class="page-header"><h1 class="page-title">Apalancamiento</h1></div>
    <div class="card empty-state">${detalle ? `<p class="text-danger">${detalle}</p>` : ''}
      <p>No hay estados financieros guardados para calcular el GAO, el GAF y el GAT.</p>
      <p><a href="#/estados">Cargue o importe sus estados</a> y vuelva aquí.</p></div>`;
}

export function apalancamientoUI(page, { estados: guardados, config, guardar }) {
  if (!Array.isArray(guardados?.periods) || guardados.periods.length === 0) {
    page.innerHTML = paginaSinDatos();
    return;
  }
  let estados;
  try {
    estados = normalizeFinancialData(guardados);
  } catch (error) {
    page.innerHTML = paginaSinDatos(`No se pudieron leer los estados guardados: ${esc(error.message)}`);
    return;
  }

  let guardado = {
    comportamiento: objeto(config?.comportamiento),
    dap: objeto(config?.dap),
    tasaDefecto: config?.tasaDefecto ?? null
  };
  let cuentas = [];
  let borrador = null;

  const mensaje = (texto, error = false) => {
    const el = page.querySelector('#apalancamientoMensaje');
    if (!el) return;
    el.textContent = texto;
    el.className = error ? 'text-danger' : 'text-muted';
  };

  function crearBorrador() {
    const tipo = {};
    const pct = {};
    for (const cuenta of cuentas) {
      if (!cuenta.comportamiento) continue;
      tipo[cuenta.nombre] = cuenta.comportamiento.tipo;
      if (cuenta.comportamiento.tipo === 'mixto') pct[cuenta.nombre] = aTextoPorcentaje(cuenta.comportamiento.pctVariable);
    }
    const dap = {};
    for (const periodo of estados.periods) {
      const valor = Object.hasOwn(guardado.dap, periodo) ? guardado.dap[periodo] : null;
      dap[periodo] = esNumero(valor) && valor > 0 ? String(valor) : '';
    }
    const tasa = esNumero(guardado.tasaDefecto) ? aTextoPorcentaje(guardado.tasaDefecto) : '';
    return { tipo, pct, dap, tasa };
  }

  // Configuración a guardar desde el borrador. Conserva lo de cuentas y periodos que hoy no están.
  function construirConfig() {
    const errores = [];
    const comportamiento = { ...guardado.comportamiento };
    for (const { nombre } of cuentas) {
      const tipo = Object.hasOwn(borrador.tipo, nombre) ? borrador.tipo[nombre] : '';
      if (!COMPORTAMIENTOS.includes(tipo)) { delete comportamiento[nombre]; continue; }
      if (tipo !== 'mixto') { comportamiento[nombre] = { tipo }; continue; }
      const { valor } = leerNumero(borrador.pct[nombre]);
      if (valor === null || valor < 0 || valor > 100) {
        errores.push(`El % variable de ${nombre} debe ser un número entre 0 y 100.`);
      } else {
        comportamiento[nombre] = { tipo: 'mixto', pctVariable: valor / 100 };
      }
    }
    const dap = Object.fromEntries(Object.entries(guardado.dap)
      .filter(([periodo]) => !estados.periods.includes(periodo)));
    for (const periodo of estados.periods) {
      const { vacio, valor } = leerNumero(borrador.dap[periodo]);
      if (vacio) continue;
      if (valor === null || valor < 0) errores.push(`El DAP de ${periodo} debe ser un número mayor o igual a 0.`);
      else if (valor > 0) dap[periodo] = valor;
    }
    let tasaDefecto = null;
    const tasa = leerNumero(borrador.tasa);
    if (!tasa.vacio) {
      if (tasa.valor === null || tasa.valor < 0 || tasa.valor >= 100) {
        errores.push('La tasa de impuesto por defecto debe ser un número entre 0 y 99.99 %.');
      } else {
        tasaDefecto = tasa.valor / 100;
      }
    }
    return { errores, config: { comportamiento, dap, tasaDefecto } };
  }

  function filasClasificacion() {
    const ultimo = estados.periods[estados.periods.length - 1];
    return cuentas.map((cuenta, k) => {
      const tipo = Object.hasOwn(borrador.tipo, cuenta.nombre) ? borrador.tipo[cuenta.nombre] : '';
      const propuesto = cuenta.origen === 'sugerido' && tipo === cuenta.comportamiento?.tipo;
      const importe = estados.estadoResultados[ultimo]?.[cuenta.nombre];
      const opciones = [`<option value=""${tipo ? '' : ' selected'}>Elegir…</option>`]
        .concat(COMPORTAMIENTOS.map(c => `<option value="${c}"${c === tipo ? ' selected' : ''}>${ETIQUETA_COMPORTAMIENTO[c]}</option>`))
        .join('');
      const pct = tipo === 'mixto'
        ? `<label class="sr-only" for="pct-${k}">% variable de ${esc(cuenta.nombre)}</label>
           <input class="form-input" id="pct-${k}" inputmode="decimal" maxlength="10" placeholder="% variable" value="${esc(borrador.pct[cuenta.nombre] ?? '')}">`
        : '';
      return `<tr><td>${esc(cuenta.nombre)}${propuesto ? ' <span class="badge badge-warning">sugerido</span>' : ''}</td>
        <td>${TIPO_CUENTA[cuenta.tipo]}</td><td class="text-right font-mono">${esNumero(importe) ? formatCurrency(importe) : '—'}</td>
        <td><label class="sr-only" for="comp-${k}">Comportamiento de ${esc(cuenta.nombre)}</label>
          <select class="form-select" id="comp-${k}">${opciones}</select>${pct}</td></tr>`;
    }).join('');
  }

  function seccionResultados(resultado) {
    const tasaMostrada = formatPercent(guardado.tasaDefecto ?? TASA_IR_DEFECTO, 2);
    const avisos = resultado.advertencias.length
      ? `<div class="card mb-4"><h2 class="card-title">Advertencias</h2><ul>${resultado.advertencias
        .map(aviso => `<li class="text-warning">${textoAdvertencia(aviso, tasaMostrada)}</li>`).join('')}</ul></div>`
      : '';
    const filasPeriodo = resultado.periodos.map(periodo => {
      const v = periodo.variables;
      const origen = { efectiva: 'efectiva', defecto: 'por defecto' }[v.origenT];
      // Con DAP = 0 la tasa no entra en el GAF ni en el GAT.
      const tasa = v.dap === 0 ? 'No interviene (DAP = 0)' : `${fmtTasa(v.t)}${origen ? ` (${origen})` : ''}`;
      return `<tr><td>${esc(periodo.periodo)}</td>
        <td class="text-right font-mono">${fmtGrado(periodo.grados.gao)}</td>
        <td class="text-right font-mono">${fmtGrado(periodo.grados.gaf)}</td>
        <td class="text-right font-mono">${fmtGrado(periodo.grados.gat)}</td>
        <td class="text-right">${tasa}</td>
        <td class="text-muted">${motivosND(periodo) || '—'}</td></tr>`;
    }).join('');
    const filasVariacion = resultado.variaciones.map(variacion => `<tr>
        <td>${esc(variacion.desde)} → ${esc(variacion.hasta)}</td>
        <td class="text-right font-mono">${fmtGrado(variacion.gao)}</td>
        <td class="text-right font-mono">${fmtGrado(variacion.gaf)}</td>
        <td class="text-right font-mono">${fmtGrado(variacion.gat)}</td>
        <td class="text-right font-mono">${fmtGrado(variacion.estructuralBase.gao)}</td></tr>`).join('');
    const ultimo = resultado.periodos[resultado.periodos.length - 1];
    return `${avisos}
      <div class="card mb-4"><h2 class="card-title">Grados por periodo (estructurales)</h2>
        <p class="form-hint">GAO = MC / UAII · GAF = UAII / (UAI − DAP / (1 − T)) · GAT = GAO × GAF</p>
        <div class="table-wrapper"><table class="statement-table">
          <thead><tr><th scope="col">Periodo</th><th scope="col" class="text-right">GAO</th><th scope="col" class="text-right">GAF</th>
            <th scope="col" class="text-right">GAT</th><th scope="col" class="text-right">T usada</th><th scope="col">Notas</th></tr></thead>
          <tbody>${filasPeriodo}</tbody></table></div></div>
      <div class="card mb-4"><h2 class="card-title">Grados por variación entre periodos</h2>
        ${filasVariacion ? `<p class="form-hint">GAO = %ΔUAII / %ΔVentas · GAF = %ΔUDAC / %ΔUAII · GAT = %ΔUDAC / %ΔVentas. Si la estructura de costos no cambia, el GAO por variación coincide con el estructural del periodo base.</p>
        <div class="table-wrapper"><table class="statement-table">
          <thead><tr><th scope="col">Periodos</th><th scope="col" class="text-right">GAO</th><th scope="col" class="text-right">GAF</th>
            <th scope="col" class="text-right">GAT</th><th scope="col" class="text-right">GAO estructural del periodo base</th></tr></thead>
          <tbody>${filasVariacion}</tbody></table></div>` : '<p class="text-muted">Hace falta más de un periodo.</p>'}</div>
      <div class="card mb-4"><h2 class="card-title">Cómo leer ${esc(ultimo.periodo)}</h2>${interpretacion(ultimo)}</div>
      <div class="card mb-4"><h2 class="card-title">Traza</h2>${resultado.periodos.map(trazaPeriodo).join('')}</div>`;
  }

  function render() {
    let resultadosHTML;
    try {
      resultadosHTML = seccionResultados(calcularApalancamiento(estados, guardado));
    } catch (error) {
      resultadosHTML = `<div class="card mb-4"><p class="text-danger">No se pudo calcular: ${esc(error.message)}</p></div>`;
    }
    const filasDap = estados.periods.map((periodo, k) => `<tr><td>${esc(periodo)}</td>
      <td><label class="sr-only" for="dap-${k}">DAP de ${esc(periodo)}</label>
        <input class="form-input" id="dap-${k}" inputmode="decimal" maxlength="20" placeholder="0" value="${esc(borrador.dap[periodo])}"></td></tr>`).join('');

    page.innerHTML = `<div class="page-header"><h1 class="page-title">Apalancamiento</h1>
        <p class="page-subtitle">Empresa: ${esc(estados.name)}. GAO, GAF y GAT calculados con los estados guardados. <a href="#/estados">Editar estados</a></p></div>
      <p id="apalancamientoMensaje" role="status" aria-live="polite" class="text-muted">Clasifique los costos, revise los parámetros y pulse Guardar.</p>
      <div class="card mb-4"><h2 class="card-title">1. Clasificación de costos</h2>
        <p class="form-hint">Variable: cambia con las ventas. Fijo: no cambia. Mixto: indique qué % es variable. Las propuestas iniciales (costo de ventas variable, administración fija) se pueden cambiar.</p>
        ${cuentas.length ? `<div class="table-wrapper"><table class="statement-table">
          <thead><tr><th scope="col">Cuenta</th><th scope="col">Tipo</th><th scope="col" class="text-right">Importe ${esc(estados.periods[estados.periods.length - 1])}</th><th scope="col">Comportamiento</th></tr></thead>
          <tbody>${filasClasificacion()}</tbody></table></div>` : '<p class="text-muted">Los estados no tienen costo de ventas ni gastos operativos.</p>'}</div>
      <div class="card mb-4"><h2 class="card-title">2. Parámetros</h2>
        <label class="form-label" for="tasaDefecto">Tasa de impuesto por defecto (%)</label>
        <input class="form-input" id="tasaDefecto" inputmode="decimal" maxlength="10" placeholder="${aTextoPorcentaje(TASA_IR_DEFECTO)}" value="${esc(borrador.tasa)}">
        <p class="form-hint">Se usa solo si la tasa efectiva (IR / UAI) no tiene sentido. Vacío = ${aTextoPorcentaje(TASA_IR_DEFECTO)} %.</p>
        <p class="form-label mt-4">Dividendos de acciones preferentes (DAP) por periodo</p>
        <div class="table-wrapper"><table class="statement-table"><thead><tr><th scope="col">Periodo</th><th scope="col">DAP (C$, vacío = 0)</th></tr></thead>
          <tbody>${filasDap}</tbody></table></div>
        <button type="button" class="btn btn-primary mt-4" id="guardarApalancamiento">Guardar y recalcular</button></div>
      ${resultadosHTML}`;

    cuentas.forEach(({ nombre }, k) => {
      page.querySelector(`#comp-${k}`)?.addEventListener('change', event => {
        borrador.tipo[nombre] = event.target.value;
        render();
        mensaje('Cambios sin guardar: pulse Guardar para recalcular.');
      });
      page.querySelector(`#pct-${k}`)?.addEventListener('input', event => {
        borrador.pct[nombre] = event.target.value;
        mensaje('Cambios sin guardar: pulse Guardar para recalcular.');
      });
    });
    estados.periods.forEach((periodo, k) => {
      page.querySelector(`#dap-${k}`)?.addEventListener('input', event => {
        borrador.dap[periodo] = event.target.value;
        mensaje('Cambios sin guardar: pulse Guardar para recalcular.');
      });
    });
    page.querySelector('#tasaDefecto')?.addEventListener('input', event => {
      borrador.tasa = event.target.value;
      mensaje('Cambios sin guardar: pulse Guardar para recalcular.');
    });
    page.querySelector('#guardarApalancamiento')?.addEventListener('click', alGuardar);
  }

  function alGuardar() {
    const { errores, config: nuevo } = construirConfig();
    if (errores.length) {
      mensaje(errores.join(' '), true);
      return;
    }
    try {
      guardar(nuevo);
    } catch (error) {
      mensaje(`No se pudo guardar: ${error.message}. Los datos anteriores no cambiaron.`, true);
      return;
    }
    guardado = nuevo;
    cuentas = resolverComportamiento(cuentasOperativas(estados), guardado.comportamiento);
    borrador = crearBorrador();
    render();
    mensaje('Guardado. Resultados recalculados.');
  }

  cuentas = resolverComportamiento(cuentasOperativas(estados), guardado.comportamiento);
  borrador = crearBorrador();
  render();
}
