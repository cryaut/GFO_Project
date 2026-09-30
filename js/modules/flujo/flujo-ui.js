// Pantalla #/flujo: estado de flujo de efectivo por actividades, variación neta y saldo final.
// El cálculo está en flujo-calculations.js; aquí solo se arma el HTML y se atienden los eventos.
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND as monto } from '../../utils/format.js';
import { leerNumero, nuevoId } from '../../utils/form.js';
import { totalesPeriodo } from '../../utils/estados-guardados.js';
import {
  ACTIVIDADES, ETIQUETA_ACTIVIDAD, MAX_TEXTO, calcularFlujo, conciliarConBalance, ejemploFlujo,
  normalizarFlujo, validarMovimientoFlujo
} from './flujo-calculations.js';

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);
const EJEMPLOS_ACTIVIDAD = {
  operacion: 'cobros a clientes, pagos a proveedores, sueldos, servicios, intereses e impuestos',
  inversion: 'compra o venta de terrenos, edificios, equipos, vehículos o inversiones',
  financiamiento: 'préstamos recibidos y sus abonos, aportes de socios y dividendos pagados'
};

function claseSigno(valor) {
  if (!esNumero(valor) || valor === 0) return '';
  return valor > 0 ? 'text-success' : 'text-danger';
}

function interpretacion(r) {
  const frases = [];
  const { operacion, inversion, financiamiento } = r.neto;
  if (operacion > 0) frases.push(`<li>La operación <strong>genera</strong> ${monto(operacion)}: el negocio produce efectivo con sus actividades principales.</li>`);
  else if (operacion < 0) frases.push(`<li class="text-danger">La operación <strong>consume</strong> ${monto(-operacion)}: el negocio depende de la inversión o del financiamiento para cubrir su operación. Si se repite, es una señal de alerta.</li>`);
  if (inversion < 0) frases.push(`<li>Se invirtieron ${monto(-inversion)} netos en activos, que deberían generar ingresos futuros.</li>`);
  else if (inversion > 0) frases.push(`<li>Se obtuvieron ${monto(inversion)} netos por venta de activos.</li>`);
  if (financiamiento > 0) frases.push(`<li>Se recibieron ${monto(financiamiento)} netos de préstamos o aportes.</li>`);
  else if (financiamiento < 0) frases.push(`<li>Se pagaron ${monto(-financiamiento)} netos a acreedores o accionistas (abonos a deuda y dividendos).</li>`);
  if (esNumero(r.variacionNeta)) {
    const verbo = r.variacionNeta >= 0 ? 'aumenta' : 'disminuye';
    frases.push(`<li>El efectivo ${verbo} ${monto(Math.abs(r.variacionNeta))} en el periodo${esNumero(r.saldoFinal) ? ` y cierra en ${monto(r.saldoFinal)}` : ''}.</li>`);
  }
  if (esNumero(r.saldoFinal) && r.saldoFinal < 0) {
    frases.push('<li class="text-danger">El saldo final es negativo: el efectivo no alcanza para los pagos registrados; hace falta financiamiento o reducir salidas.</li>');
  }
  return frases.length ? `<ul>${frases.join('')}</ul>` : '<p class="text-muted">Registre movimientos para interpretar el flujo.</p>';
}

// opciones: { datos, guardar, graficar?, confirmar?, estados? }
export function flujoUI(page, opciones) {
  const { guardar, graficar = null, confirmar = () => true, estados = null } = opciones;
  let datos = normalizarFlujo(opciones.datos);

  const campo = id => page.querySelector(`#${id}`)?.value ?? '';

  function mensaje(texto, error = false) {
    const el = page.querySelector('#flujoMensaje');
    if (!el) return;
    el.textContent = texto;
    el.className = error ? 'text-danger' : 'text-muted';
  }

  function persistir(nuevos, texto) {
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

  function seccionSaldo() {
    const tomar = estados
      ? `<div class="form-group"><label class="form-label" for="flujoPeriodo">Tomar el efectivo del balance de</label>
          <select class="form-select" id="flujoPeriodo">${estados.periods.map((p, k) =>
            `<option value="${esc(p)}"${(datos.periodoBase ? p === datos.periodoBase : k === estados.periods.length - 1) ? ' selected' : ''}>${esc(p)}</option>`).join('')}</select></div>
        <div class="form-group" style="display:flex;align-items:flex-end"><button type="button" class="btn btn-secondary" id="flujoTomarSaldo">Usar ese efectivo</button></div>`
      : '';
    return `<div class="card mb-4"><h2 class="card-title">1. Saldo inicial de efectivo</h2>
      <form id="formSaldo" novalidate><div class="form-row">
        <div class="form-group"><label class="form-label" for="flujoSaldoInicial">Saldo inicial (C$)</label>
          <input class="form-input" id="flujoSaldoInicial" type="number" step="any" value="${esNumero(datos.saldoInicial) ? datos.saldoInicial : ''}"></div>
        <div class="form-group" style="display:flex;align-items:flex-end"><button type="submit" class="btn btn-primary">Guardar saldo</button></div>
        ${tomar}
      </div></form>
      ${datos.periodoBase ? `<p class="form-hint">Saldo inicial tomado del efectivo del balance de ${esc(datos.periodoBase)}.</p>` : ''}</div>`;
  }

  function seccionMovimiento() {
    const opciones = ACTIVIDADES.map(a => `<option value="${a}">${ETIQUETA_ACTIVIDAD[a]}</option>`).join('');
    return `<div class="card mb-4"><h2 class="card-title">2. Registrar entrada o salida de efectivo</h2>
      <form id="formFlujo" novalidate><div class="form-row">
        <div class="form-group"><label class="form-label" for="flujoConcepto">Concepto</label>
          <input class="form-input" id="flujoConcepto" maxlength="${MAX_TEXTO}" placeholder="Ej.: Cobros a clientes"></div>
        <div class="form-group"><label class="form-label" for="flujoActividad">Actividad</label>
          <select class="form-select" id="flujoActividad">${opciones}</select></div>
        <div class="form-group"><label class="form-label" for="flujoTipo">Tipo</label>
          <select class="form-select" id="flujoTipo"><option value="entrada">Entrada (+)</option><option value="salida">Salida (−)</option></select></div>
        <div class="form-group"><label class="form-label" for="flujoMonto">Monto (C$)</label>
          <input class="form-input" id="flujoMonto" type="number" min="0" step="any"></div>
      </div><button type="submit" class="btn btn-primary">Agregar movimiento</button></form>
      <ul class="form-hint mt-4">${ACTIVIDADES.map(a => `<li><strong>${ETIQUETA_ACTIVIDAD[a]}</strong>: ${EJEMPLOS_ACTIVIDAD[a]}.</li>`).join('')}</ul></div>`;
  }

  function seccionEstado(r, indice) {
    const filasActividad = r.actividades.map(a => {
      const filas = a.movimientos.map(m => `<tr><td style="padding-left:var(--space-6)">${esc(m.concepto)}</td>
          <td class="text-right font-mono ${m.tipo === 'entrada' ? 'text-success' : 'text-danger'}">${m.tipo === 'entrada' ? '' : '('}${monto(m.monto)}${m.tipo === 'entrada' ? '' : ')'}</td>
          <td><button type="button" class="btn btn-sm btn-danger" id="borrarFlujo-${indice.get(m.id)}" aria-label="Borrar ${esc(m.concepto)}">&times;</button></td></tr>`).join('');
      return `<tr><th scope="rowgroup" colspan="3">Actividades de ${a.nombre.toLowerCase()}</th></tr>
        ${filas || '<tr><td colspan="3" class="text-muted" style="padding-left:var(--space-6)">Sin movimientos</td></tr>'}
        <tr><td><strong>Flujo neto de ${a.nombre.toLowerCase()}</strong> <span class="text-muted">(${monto(a.entradas)} − ${monto(a.salidas)})</span></td>
          <td class="text-right font-mono ${claseSigno(a.neto)}"><strong>${monto(a.neto)}</strong></td><td></td></tr>`;
    }).join('');
    return `<div class="card mb-4"><h2 class="card-title">Estado de flujo de efectivo</h2>
      <div class="table-wrapper"><table class="statement-table">
        <thead><tr><th scope="col">Concepto</th><th scope="col" class="text-right">C$</th><th scope="col"><span class="sr-only">Acciones</span></th></tr></thead>
        <tbody>${filasActividad}
          <tr><td><strong>Variación neta del efectivo</strong> <span class="text-muted">(operación + inversión + financiamiento)</span></td>
            <td class="text-right font-mono ${claseSigno(r.variacionNeta)}"><strong>${monto(r.variacionNeta)}</strong></td><td></td></tr>
          <tr><td>(+) Saldo inicial de efectivo</td><td class="text-right font-mono">${monto(r.saldoInicial)}</td><td></td></tr>
          <tr><td><strong>Saldo final de efectivo</strong></td><td class="text-right font-mono ${esNumero(r.saldoFinal) && r.saldoFinal < 0 ? 'text-danger' : ''}"><strong>${monto(r.saldoFinal)}</strong></td><td></td></tr>
        </tbody></table></div>
      ${esNumero(r.saldoInicial) ? '' : '<p class="form-hint">Indique el saldo inicial para calcular el saldo final.</p>'}</div>`;
  }

  function seccionConciliacion(r) {
    const c = conciliarConBalance(r, estados, datos.periodoBase);
    if (!c) return '';
    return c.cuadra
      ? `<p class="text-success">El saldo final coincide con el efectivo del balance de ${esc(c.periodo)} (${monto(c.efectivo)}).</p>`
      : `<p class="text-warning">El saldo final difiere en ${monto(c.diferencia)} del efectivo del balance de ${esc(c.periodo)} (${monto(c.efectivo)}): falta registrar movimientos o hay alguno de más.</p>`;
  }

  function render() {
    const r = calcularFlujo(datos);
    const indice = new Map(datos.movimientos.map((m, i) => [m.id, i]));
    const kpi = (valor, etiqueta) => `<div class="kpi-card"><div class="kpi-value ${claseSigno(valor)}">${monto(valor)}</div><div class="kpi-label">${etiqueta}</div></div>`;
    page.innerHTML = `<div class="page-header"><h1 class="page-title">Flujo de Efectivo</h1>
        <p class="page-subtitle">Entradas y salidas de efectivo clasificadas en operación, inversión y financiamiento.</p></div>
      <p id="flujoMensaje" role="status" aria-live="polite" class="text-muted">Indique el saldo inicial y registre las entradas y salidas de efectivo.</p>
      <div class="flex-gap flex-wrap mb-4"><button type="button" class="btn btn-secondary" id="flujoEjemplo">Cargar ejemplo</button>
        ${r.cantidadMovimientos ? '<button type="button" class="btn btn-danger" id="flujoVaciar">Borrar movimientos</button>' : ''}</div>
      <div class="kpi-grid mb-6">
        ${kpi(r.neto.operacion, 'Flujo de operación')}${kpi(r.neto.inversion, 'Flujo de inversión')}
        ${kpi(r.neto.financiamiento, 'Flujo de financiamiento')}${kpi(r.variacionNeta, 'Variación neta')}
        <div class="kpi-card"><div class="kpi-value">${monto(r.saldoFinal)}</div><div class="kpi-label">Saldo final</div></div>
      </div>
      ${seccionSaldo()}
      ${seccionMovimiento()}
      ${seccionEstado(r, indice)}
      ${seccionConciliacion(r)}
      ${r.cantidadMovimientos ? `<div class="card mb-4"><h2 class="card-title">Flujo por actividad</h2>
        <div style="height:280px"><canvas id="flujoChart" role="img" aria-label="Barras del flujo neto por actividad y la variación neta"></canvas></div></div>` : ''}
      <div class="card mb-4"><h2 class="card-title">Interpretación</h2>${interpretacion(r)}
        <p class="form-hint">Flujo de una actividad = entradas − salidas. Variación neta = operación + inversión + financiamiento. Saldo final = saldo inicial + variación neta.</p></div>`;
    bind();
    if (graficar && r.cantidadMovimientos) {
      const valores = [r.neto.operacion, r.neto.inversion, r.neto.financiamiento, r.variacionNeta];
      graficar('flujoChart', {
        type: 'bar',
        data: {
          labels: ['Operación', 'Inversión', 'Financiamiento', 'Variación neta'],
          datasets: [{ label: 'C$', data: valores, backgroundColor: valores.map(v => (v >= 0 ? '#16a34a' : '#dc2626')) }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }
  }

  function bind() {
    page.querySelector('#flujoEjemplo')?.addEventListener('click', () => {
      if (datos.movimientos.length && !confirmar('¿Reemplazar los movimientos actuales por el ejemplo?')) return;
      persistir(normalizarFlujo(ejemploFlujo()), 'Ejemplo cargado: flujo de efectivo de un año de MUNO MODA (datos ficticios).');
    });
    page.querySelector('#flujoVaciar')?.addEventListener('click', () => {
      if (!confirmar('¿Borrar todos los movimientos de efectivo?')) return;
      persistir({ ...datos, movimientos: [] }, 'Movimientos borrados.');
    });
    page.querySelector('#formSaldo')?.addEventListener('submit', event => {
      event.preventDefault();
      const { vacio, valor } = leerNumero(campo('flujoSaldoInicial'));
      if (!vacio && valor === null) { mensaje('El saldo inicial debe ser un número.', true); return; }
      persistir({ ...datos, saldoInicial: vacio ? null : valor, periodoBase: '' }, 'Saldo inicial guardado.');
    });
    page.querySelector('#flujoTomarSaldo')?.addEventListener('click', () => {
      const periodo = campo('flujoPeriodo');
      const totales = totalesPeriodo(estados, periodo);
      if (!totales) { mensaje('Elija un periodo de los estados guardados.', true); return; }
      persistir({ ...datos, saldoInicial: totales.efectivo, periodoBase: periodo },
        `Saldo inicial tomado del efectivo del balance de ${periodo}: ${monto(totales.efectivo)}.`);
    });
    page.querySelector('#formFlujo')?.addEventListener('submit', event => {
      event.preventDefault();
      const movimiento = {
        id: nuevoId('flujo'),
        concepto: campo('flujoConcepto').trim(),
        actividad: campo('flujoActividad'),
        tipo: campo('flujoTipo'),
        monto: leerNumero(campo('flujoMonto')).valor
      };
      const errores = validarMovimientoFlujo(movimiento);
      if (errores.length) { mensaje(errores.join(' '), true); return; }
      persistir({ ...datos, movimientos: [...datos.movimientos, movimiento] },
        `${movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'} de ${monto(movimiento.monto)} agregada a ${ETIQUETA_ACTIVIDAD[movimiento.actividad].toLowerCase()}.`);
    });
    datos.movimientos.forEach((m, i) => {
      page.querySelector(`#borrarFlujo-${i}`)?.addEventListener('click', () => {
        if (!confirmar(`¿Borrar "${m.concepto}"?`)) return;
        persistir({ ...datos, movimientos: datos.movimientos.filter(x => x.id !== m.id) }, 'Movimiento borrado.');
      });
    });
  }

  render();
}
