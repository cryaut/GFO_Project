import { escapeHTML as esc } from '../../utils/html.js';
import { leerNumero } from '../../utils/form.js';
import { formatCurrencyND } from '../../utils/format.js';
import { GASTOS_CAJA, MOVIMIENTOS_CAJA, PAGOS_CAJA, proyectarCajaDocente, validarCajaDocente } from './caja-docente-calculations.js';
import { CASOS_CAJA, ejemploCajaDocente } from './caja-docente-ejemplos.js';

const aPct = valor => valor === null ? '' : String(Number((valor * 100).toPrecision(12)));
const valor = numero => numero ?? '';

function importe(id, etiqueta, numero) {
  return `<input id="${id}" class="form-input" inputmode="decimal" aria-label="${esc(etiqueta)}" value="${esc(valor(numero))}">`;
}

function campo(id, etiqueta, contenido) {
  return `<div><label for="${id}">${etiqueta}</label>${contenido}</div>`;
}

function tabla(titulo, etiquetas, filas, formatear = esc) {
  return `<div class="card mb-3"><h3 class="card-title">${titulo}</h3><div class="table-wrapper"><table class="statement-table">
    <thead><tr><th scope="col">Concepto</th>${etiquetas.map(p => `<th scope="col" class="text-right">${esc(p)}</th>`).join('')}</tr></thead>
    <tbody>${filas.map(([etiqueta, datos]) => `<tr><th scope="row">${esc(etiqueta)}</th>${datos.map(dato =>
      `<td class="text-right font-mono">${formatear(dato)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div></div>`;
}

function supuestos(plan) {
  const meses = plan.periodos.slice(plan.inicio);
  const ventas = tabla('Ventas y meses de origen', plan.periodos, [
    ['Ventas', plan.ventas.map((v, i) => importe(`cajaDoc-venta-${i}`, `Ventas de ${plan.periodos[i]}`, v))]
  ], String);
  const gastos = tabla('Gastos que dependen de las ventas', ['Fijo por mes', '% de ventas', 'Desde el mes'], GASTOS_CAJA.map(([id, nombre]) => {
    const regla = plan.gastos[id];
    return [nombre, [importe(`cajaDoc-fijo-${id}`, `${nombre} fijo`, regla.fijo),
      importe(`cajaDoc-tasa-${id}`, `Porcentaje de ${nombre}`, aPct(regla.tasa)),
      `<select id="cajaDoc-desde-${id}" class="form-select" aria-label="Mes inicial de ${nombre}">${meses.map((mes, i) =>
        `<option value="${i}"${regla.desde === i ? ' selected' : ''}>${esc(mes)}</option>`).join('')}</select>`]];
  }), String);
  const movimientos = tabla('Cobros y pagos declarados por fecha', meses, MOVIMIENTOS_CAJA.map(([id, nombre]) =>
    [nombre, plan.movimientos[id].map((v, i) => importe(`cajaDoc-${id}-${i}`, `${nombre} de ${meses[i]}`, v))]), String);
  return `<form id="formCajaDocente">
    <div class="form-grid mb-3">
      ${campo('cajaDoc-apertura', 'Saldo inicial', importe('cajaDoc-apertura', 'Saldo inicial', plan.apertura))}
      ${campo('cajaDoc-minimo', 'Saldo mínimo', importe('cajaDoc-minimo', 'Saldo mínimo', plan.minimo))}
      ${campo('cajaDoc-pctCompras', 'Compras como % de ventas', importe('cajaDoc-pctCompras', 'Compras como % de ventas', aPct(plan.pctCompras)))}
      ${[['cobros', 'Cobros'], ['pagos', 'Pagos a proveedores']].map(([id, nombre]) => campo(`cajaDoc-${id}`, `${nombre} por desfase (%)`,
        `<input id="cajaDoc-${id}" class="form-input" value="${esc(plan[id].map(aPct).join(' '))}">`)).join('')}
    </div>
    <p class="form-hint">Escriba los porcentajes separados por espacios. El primero corresponde al mismo mes y los siguientes a los meses posteriores. Use cero para una ausencia confirmada y deje vacío un importe pendiente.</p>
    <details><summary>Editar ventas, gastos y movimientos</summary>${ventas}${gastos}${movimientos}</details>
    <div class="d-flex flex-wrap gap-2 mt-3">
      <button type="submit" value="calcular" class="btn btn-secondary">Calcular calendario</button>
      <button type="submit" value="guardar" class="btn btn-primary">Calcular y guardar</button>
    </div>
  </form>`;
}

function resultados({ meses, moneda, financiamientoMaximo }) {
  const periodos = meses.map(mes => mes.periodo);
  const monto = valor => formatCurrencyND(valor, moneda);
  const filas = (campos, bloque = null) => campos.map(([id, titulo]) => [titulo, meses.map(m => (bloque ? m[bloque] : m)[id])]);
  const caja = tabla('Conciliación de caja', periodos, [
    ...filas([['inicial', 'Saldo inicial'], ['entradas', '(+) Entradas'], ['salidas', '(−) Salidas'],
      ['neto', 'Flujo neto antes del financiamiento'], ['antes', 'Saldo final antes de financiar'],
      ['minimo', 'Saldo mínimo'], ['necesidad', 'Financiamiento requerido'], ['exceso', 'Excedente sobre el mínimo']]),
    ...filas(MOVIMIENTOS_CAJA.slice(-2), 'movimientos'),
    ...filas([['final', 'Saldo final con operaciones declaradas'], ['deudaAdicional', 'Saldo del préstamo adicional']])
  ], monto);
  const origenes = (titulo, campo) => tabla(titulo, periodos, [
    ['Origen × porcentaje = cuota', meses.map(m => m[campo].cuotas.map(c =>
      `${esc(c.origen ?? 'Mes previo sin identificar')}: ${monto(c.base)} × ${aPct(c.proporcion)} % = ${monto(c.importe)}`).join('<br>') || 'Cero')],
    ['Total del mes', meses.map(m => monto(m[campo].importe))]
  ], String);
  return `<p class="mb-2">Necesidad máxima antes de financiar ${monto(financiamientoMaximo)}. Los préstamos y repagos solo afectan el saldo final cuando se registran en el escenario.</p>
    ${caja}
    ${tabla('Ventas, compras y saldos diferidos', periodos, filas([
      ['ventas', 'Ventas'], ['compras', 'Compras presupuestadas'], ['cxcInicial', 'CxC inicial'], ['cxcFinal', 'CxC final'],
      ['cxpInicial', 'CxP inicial'], ['cxpFinal', 'CxP final']
    ]), monto)}
    ${origenes('Programación de cobros por origen', 'cobros')}
    ${origenes('Programación de pagos por origen', 'proveedores')}
    ${tabla('Otros cobros y desembolsos', periodos, [
      ...filas([MOVIMIENTOS_CAJA[0]], 'movimientos'), ...filas(GASTOS_CAJA, 'gastos'), ...filas(PAGOS_CAJA, 'movimientos')
    ], monto)}`;
}

function leerFormulario(form, plan) {
  const datos = structuredClone(plan);
  const texto = id => form.querySelector(`#cajaDoc-${id}`).value;
  const numero = entrada => {
    const { valor, vacio } = leerNumero(entrada);
    if (!vacio && valor === null) throw new Error('Hay un importe o porcentaje con formato inválido.');
    return valor;
  };
  const pct = entrada => {
    const v = numero(entrada);
    return v === null ? null : v / 100;
  };
  for (const id of ['apertura', 'minimo']) datos[id] = numero(texto(id));
  datos.pctCompras = pct(texto('pctCompras'));
  for (const id of ['cobros', 'pagos']) datos[id] = texto(id).trim().split(/\s+/).map(pct);
  datos.ventas = datos.ventas.map((_, i) => numero(texto(`venta-${i}`)));
  for (const [id] of GASTOS_CAJA) datos.gastos[id] = {
    fijo: numero(texto(`fijo-${id}`)), tasa: pct(texto(`tasa-${id}`)), desde: Number(texto(`desde-${id}`))
  };
  for (const [id] of MOVIMIENTOS_CAJA) datos.movimientos[id] = datos.movimientos[id].map((_, i) => numero(texto(`${id}-${i}`)));
  return validarCajaDocente(datos);
}

export function crearCajaDocenteUI(guardado, guardar) {
  let plan = null;
  let errorInicial = '';
  if (guardado) {
    try { plan = validarCajaDocente(guardado); }
    catch (error) { errorInicial = error.message; }
  }
  let cambios = false;
  let borrador = new Map();
  return function montar(panel) {
    if (!panel) return;
    const render = () => {
      const caso = CASOS_CAJA.find(([id]) => id === plan?.id);
      const halley = caso?.[0].startsWith('halley');
      panel.innerHTML = `<div class="card mb-3"><h2 class="card-title">Presupuesto de caja por calendario</h2>
        <p class="form-hint">Escenarios de caja AFOD independientes del presupuesto maestro. El impuesto pagado se captura por fecha y los meses previos solo originan cobros y pagos.</p>
        <label for="cajaDocCaso">Referencia</label>
        <select id="cajaDocCaso" class="form-select">${CASOS_CAJA.map(([id, nombre]) =>
          `<option value="${id}"${id === plan?.id ? ' selected' : ''}>${nombre}</option>`).join('')}</select>
        <button id="cajaDocCargar" type="button" class="btn btn-secondary mt-2">Cargar referencia</button>
        ${plan ? `<p class="form-hint mt-2">${esc(caso?.[1] ?? 'Escenario guardado')} · ${esc(plan.moneda)}. ${halley
          ? 'Reconstrucción AFOD. Falta la página 163 y la escala de 50 y 25 se interpreta como miles de USD.'
          : 'Fuente de referencia La_Pinolera_1_y_2_Enunciados. Los resultados se calculan con las premisas editables.'}</p>` : ''}
        <p id="cajaDocMensaje" role="status" tabindex="-1">${esc(errorInicial)}</p>
      </div>${plan ? supuestos(plan) : ''}<div id="cajaDocResultados">${plan ? resultados(proyectarCajaDocente(plan)) : ''}</div>`;
      const mensaje = (texto, error = false) => {
        const el = panel.querySelector('#cajaDocMensaje');
        el.textContent = texto;
        el.className = error ? 'text-danger' : 'text-muted';
        if (error) el.focus();
      };
      panel.querySelector('#cajaDocCargar')?.addEventListener('click', () => {
        if (cambios && !window.confirm('¿Reemplazar los supuestos de caja aún sin guardar?')) return;
        const siguiente = ejemploCajaDocente(panel.querySelector('#cajaDocCaso').value);
        if (!siguiente) return;
        plan = siguiente;
        cambios = true;
        borrador = new Map();
        errorInicial = '';
        render();
        panel.querySelector('#cajaDocCargar')?.focus();
      });
      const form = panel.querySelector('#formCajaDocente');
      for (const [id, valor] of borrador) {
        const control = form?.querySelector(`#${id}`);
        if (control) control.value = valor;
      }
      form?.addEventListener('input', ({ target }) => {
        if (target.id) borrador.set(target.id, target.value);
        cambios = true;
        mensaje('Hay cambios de caja sin guardar. Calcule de nuevo para actualizar los resultados.');
      });
      form?.addEventListener('submit', event => {
        event.preventDefault();
        try {
          const nuevos = leerFormulario(form, plan);
          const calculado = proyectarCajaDocente(nuevos);
          const guardarAhora = event.submitter?.value === 'guardar';
          if (guardarAhora) guardar(nuevos);
          plan = nuevos;
          borrador = new Map();
          cambios = !guardarAhora;
          panel.querySelector('#cajaDocResultados').innerHTML = resultados(calculado);
          mensaje(guardarAhora ? 'Calendario de caja guardado.' : 'Calendario calculado. Los cambios aún no se han guardado.');
        } catch (error) {
          mensaje(error.message, true);
        }
      });
    };
    render();
  };
}
