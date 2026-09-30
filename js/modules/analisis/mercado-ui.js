// Pestaña "Mercado" de Análisis: datos de acciones por periodo y razones de mercado.
// El cálculo está en mercado-calculations.js; aquí solo se arma el HTML y se atienden los eventos.
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND as monto, formatNumberND, formatPercentND as pct } from '../../utils/format.js';
import { leerNumero } from '../../utils/form.js';
import {
  CAMPOS_MERCADO, calcularRazonesMercado, ejemploMercado, normalizarDatosMercado, validarDatosMercado
} from './mercado-calculations.js';

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);
const veces = valor => (esNumero(valor) ? `${formatNumberND(valor)} veces` : 'N/D');
const porAccion = valor => (esNumero(valor) ? `${monto(valor)} por acción` : 'N/D');

function interpretacion(r) {
  const frases = [];
  if (esNumero(r.upa)) {
    frases.push(`<li>Cada acción común generó ${monto(r.upa)} de utilidad en ${esc(r.periodo)} (UPA).</li>`);
  }
  if (esNumero(r.pu)) {
    frases.push(`<li>El mercado paga ${formatNumberND(r.pu)} veces la utilidad por acción (P/U): un inversionista recuperaría su inversión en unos ${formatNumberND(r.pu, 1)} años de utilidades iguales.</li>`);
  } else if (esNumero(r.upa) && r.upa <= 0) {
    frases.push('<li class="text-warning">Con utilidad por acción negativa o nula, la relación precio/utilidad no se interpreta (N/D).</li>');
  }
  if (esNumero(r.pvl)) {
    frases.push(`<li>La acción vale en el mercado ${formatNumberND(r.pvl)} veces su valor en libros (${monto(r.vlpa)}): ${r.pvl >= 1 ? 'los inversionistas esperan que la empresa genere más valor que el registrado en su patrimonio' : 'el mercado la valora por debajo de su patrimonio contable'}.</li>`);
  }
  if (esNumero(r.pago)) {
    frases.push(`<li>Se repartió ${pct(r.pago)} de la utilidad como dividendos; el resto se reinvierte. El rendimiento del dividendo es ${pct(r.rendimiento)} del precio.</li>`);
  }
  return frases.length
    ? `<ul>${frases.join('')}</ul>`
    : '<p class="text-muted">Ingrese las acciones en circulación y el precio de la acción para interpretar las razones.</p>';
}

// opciones: { estados, datos, dap, guardar }. guardar lanza un error si no se pudo guardar.
export function mercadoUI(contenedor, { estados, datos, dap = {}, guardar }) {
  if (!estados) {
    contenedor.innerHTML = '<p class="text-muted">Sin estados guardados. <a href="#/estados">Cárguelos en Estados</a> para calcular las razones de mercado.</p>';
    return;
  }
  let guardado = normalizarDatosMercado(datos);
  const valorCampo = (periodo, campo) => {
    const v = guardado.periodos[periodo]?.[campo];
    return esNumero(v) ? String(v) : '';
  };

  function mensaje(texto, error = false) {
    const el = contenedor.querySelector('#mercadoMensaje');
    if (!el) return;
    el.textContent = texto;
    el.className = error ? 'text-danger' : 'text-muted';
  }

  function persistir(nuevos, texto) {
    const errores = Object.entries(nuevos.periodos).flatMap(([p, v]) => validarDatosMercado(p, v));
    if (errores.length) { mensaje(errores.join(' '), true); return; }
    try {
      guardar(nuevos);
    } catch (error) {
      mensaje(`No se pudo guardar: ${error.message}. Los datos anteriores no cambiaron.`, true);
      return;
    }
    guardado = nuevos;
    render();
    mensaje(texto);
  }

  function render() {
    const resultados = calcularRazonesMercado(estados, guardado, dap);
    const entradas = estados.periods.map((periodo, k) => `<tr><th scope="row">${esc(periodo)}</th>${CAMPOS_MERCADO.map(([campo, etiqueta]) => `<td>
        <label class="sr-only" for="mer-${campo}-${k}">${etiqueta}, ${esc(periodo)}</label>
        <input class="form-input" id="mer-${campo}-${k}" type="number" min="0" step="any" value="${valorCampo(periodo, campo)}"></td>`).join('')}</tr>`).join('');
    const filas = resultados.map(r => `<tr><td>${esc(r.periodo)}</td>
        <td class="text-right font-mono" style="white-space:nowrap">${monto(r.udac)}</td>
        <td class="text-right font-mono" style="white-space:nowrap">${monto(r.upa)}</td>
        <td class="text-right font-mono" style="white-space:nowrap">${veces(r.pu)}</td>
        <td class="text-right font-mono" style="white-space:nowrap">${monto(r.vlpa)}</td>
        <td class="text-right font-mono" style="white-space:nowrap">${veces(r.pvl)}</td>
        <td class="text-right font-mono" style="white-space:nowrap">${monto(r.dpa)}</td>
        <td class="text-right font-mono">${pct(r.pago)}</td>
        <td class="text-right font-mono">${pct(r.rendimiento)}</td></tr>`).join('');
    const implicitos = resultados.filter(r => esNumero(r.dividendosImplicitos))
      .map(r => `${esc(r.periodo)}: ${monto(r.dividendosImplicitos)}`).join(' · ');
    const ultimo = resultados[resultados.length - 1];
    contenedor.innerHTML = `<p id="mercadoMensaje" role="status" aria-live="polite" class="text-muted">Ingrese los datos de las acciones por periodo y pulse Guardar.</p>
      <div class="card mb-4"><h4 class="mb-2">Datos de las acciones</h4>
        <div class="table-wrapper"><table class="statement-table">
          <thead><tr><th scope="col">Periodo</th>${CAMPOS_MERCADO.map(([, etiqueta]) => `<th scope="col">${etiqueta}</th>`).join('')}</tr></thead>
          <tbody>${entradas}</tbody></table></div>
        <div class="flex-gap flex-wrap mt-4">
          <button type="button" class="btn btn-primary" id="mercadoGuardar">Guardar y calcular</button>
          <button type="button" class="btn btn-secondary" id="mercadoEjemplo">Cargar ejemplo de la demo</button></div>
        <p class="form-hint">La utilidad neta y el patrimonio salen de los estados guardados; los dividendos de acciones preferentes (DAP), de Apalancamiento.${implicitos ? ` Dividendos que explican el cambio del patrimonio (UN − ΔPatrimonio, sin aportes de capital): ${implicitos}.` : ''}</p></div>
      <div class="table-wrapper mb-4"><table class="statement-table">
        <thead><tr><th scope="col">Periodo</th><th scope="col" class="text-right">UDAC</th><th scope="col" class="text-right">UPA</th>
          <th scope="col" class="text-right">P/U</th><th scope="col" class="text-right">VL por acción</th><th scope="col" class="text-right">P/VL</th>
          <th scope="col" class="text-right">DPA</th><th scope="col" class="text-right">Pago</th><th scope="col" class="text-right">Rendimiento</th></tr></thead>
        <tbody>${filas}</tbody></table></div>
      <div class="card mb-4"><h4 class="mb-2">Interpretación (${esc(ultimo.periodo)}): ${porAccion(ultimo.upa)}</h4>${interpretacion(ultimo)}</div>
      <ul class="form-hint">
        <li>UDAC = utilidad disponible para accionistas comunes = UN − DAP</li>
        <li>UPA = UDAC / acciones comunes · P/U = precio / UPA</li>
        <li>VL por acción (valor en libros) = patrimonio / acciones comunes · P/VL = precio / VL por acción</li>
        <li>DPA = dividendos / acciones · Pago de dividendos = DPA / UPA · Rendimiento del dividendo = DPA / precio</li>
        <li>Se asume que todo el patrimonio es común; con acciones preferentes, reste su capital antes de leer el valor en libros.</li></ul>`;
    bind();
  }

  function leerFormulario() {
    const periodos = { ...guardado.periodos };
    const errores = [];
    estados.periods.forEach((periodo, k) => {
      const valores = {};
      for (const [campo, etiqueta] of CAMPOS_MERCADO) {
        const { vacio, valor } = leerNumero(contenedor.querySelector(`#mer-${campo}-${k}`)?.value);
        if (!vacio && valor === null) errores.push(`${periodo}: ${etiqueta.toLowerCase()} debe ser un número.`);
        valores[campo] = vacio ? null : valor;
      }
      periodos[periodo] = valores;
    });
    return { errores, datos: { periodos } };
  }

  function bind() {
    contenedor.querySelector('#mercadoGuardar')?.addEventListener('click', () => {
      const { errores, datos: nuevos } = leerFormulario();
      if (errores.length) { mensaje(errores.join(' '), true); return; }
      persistir(nuevos, 'Datos guardados. Razones de mercado recalculadas.');
    });
    contenedor.querySelector('#mercadoEjemplo')?.addEventListener('click', () => {
      const ejemplo = ejemploMercado(estados.periods);
      persistir({ periodos: { ...guardado.periodos, ...ejemplo.periodos } },
        'Ejemplo cargado: 30,000 acciones de C$ 10 nominal y los dividendos que explican el cambio del patrimonio (datos ficticios).');
    });
  }

  render();
}
