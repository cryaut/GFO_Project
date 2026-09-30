// Pantalla #/planeacion: supuestos, presupuestos de ventas, compras, CBV, gastos de operación y caja,
// y estado de resultados presupuestado. El cálculo está en planeacion-calculations.js.
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND as monto, formatNumberND, formatPercentND as pct } from '../../utils/format.js';
import { leerNumero } from '../../utils/form.js';
import { totalesPeriodo } from '../../utils/estados-guardados.js';
import {
  MAX_PERIODOS, SUPUESTOS, TIPOS_PERIODO, calcularPresupuestoMaestro, ejemploPlaneacion,
  normalizarSupuestos, validarSupuestos
} from './planeacion-calculations.js';

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);
const num = valor => formatNumberND(valor, esNumero(valor) && Number.isInteger(valor) ? 0 : 2);
const EN_PORCENTAJE = ['fraccion', 'tasa', 'multiplo'];
const textoPct = fraccion => String(Number((fraccion * 100).toFixed(6)));

// Supuestos → textos del formulario (porcentajes en %, no en fracción).
function aBorrador(s) {
  const campos = {};
  for (const [clave, , clase] of SUPUESTOS) {
    const v = s?.[clave];
    campos[clave] = esNumero(v) ? (EN_PORCENTAJE.includes(clase) ? textoPct(v) : String(v)) : '';
  }
  const n = s?.periodos ?? 4;
  return {
    tipoPeriodo: s?.tipoPeriodo ?? 'Trimestre',
    periodos: String(n),
    campos,
    ventas: s ? s.ventasUnidades.map(v => (esNumero(v) ? String(v) : '')) : Array(n).fill(''),
    otros: s ? s.otrosDesembolsos.map(v => (esNumero(v) ? String(v) : '0')) : Array(n).fill('0'),
    productoInventario: s?.productoInventario ?? '',
    stockMinimo: s?.stockMinimo ?? null
  };
}

// Textos del formulario → supuestos numéricos (null donde el texto no es un número).
function desdeBorrador(b) {
  const periodos = Number(b.periodos);
  const s = {
    tipoPeriodo: b.tipoPeriodo, periodos,
    ventasUnidades: b.ventas.map(t => leerNumero(t).valor),
    otrosDesembolsos: b.otros.map(t => {
      const { vacio, valor } = leerNumero(t);
      return vacio ? 0 : valor;
    }),
    productoInventario: b.productoInventario, stockMinimo: b.stockMinimo
  };
  for (const [clave, , clase] of SUPUESTOS) {
    const { valor } = leerNumero(b.campos[clave]);
    s[clave] = valor !== null && EN_PORCENTAJE.includes(clase) ? valor / 100 : valor;
  }
  return s;
}

function redimensionar(lista, n, relleno) {
  return Array.from({ length: n }, (_, i) => (i < lista.length ? lista[i] : (lista[lista.length - 1] ?? relleno)));
}

const FORMATOS = { monto, unidades: num, pct };

function tabla(titulo, etiquetas, filas, nota = '') {
  const celda = (valor, formato, conSigno) => {
    if (valor === undefined) return '<td></td>';
    const clase = conSigno && esNumero(valor) && valor < 0 ? ' text-danger' : '';
    return `<td class="text-right font-mono${clase}" style="white-space:nowrap">${FORMATOS[formato](valor)}</td>`;
  };
  const cuerpo = filas.map(f => `<tr${f.destacar ? ' style="font-weight:600"' : ''}><td>${f.concepto}</td>
    ${f.valores.map(v => celda(v, f.formato, f.signo)).join('')}${celda(f.total, f.formato, f.signo)}</tr>`).join('');
  return `<div class="card mb-4"><h2 class="card-title">${titulo}</h2>${nota ? `<p class="form-hint">${nota}</p>` : ''}
    <div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Concepto</th>${etiquetas.map(e => `<th scope="col" class="text-right">${esc(e)}</th>`).join('')}<th scope="col" class="text-right">Total</th></tr></thead>
      <tbody>${cuerpo}</tbody></table></div></div>`;
}

function textoAviso(a) {
  switch (a.codigo) {
    case 'financiamiento':
      return `${esc(a.periodo)}: el saldo final (${monto(a.saldoFinal)}) queda bajo el mínimo. Se requieren ${monto(a.monto)} de financiamiento (por ejemplo, una línea de crédito) o aplazar desembolsos.`;
    case 'sin-compras':
      return `${esc(a.periodo)}: el inventario inicial cubre las ventas y el inventario deseado; no se compra y sobran ${num(a.sobrante)} unidades.`;
    case 'bajo-stock-minimo':
      return `${esc(a.periodo)}: el inventario final (${num(a.inventario)} u) queda bajo el stock mínimo del producto (${num(a.stockMinimo)} u) registrado en Inventario.`;
    case 'perdida':
      return `${esc(a.periodo)}: pérdida presupuestada de ${monto(-a.monto)}.`;
    case 'bajo-equilibrio':
      return `${esc(a.periodo)}: se venden ${num(a.unidades)} unidades, menos que el punto de equilibrio (${num(a.peUnidades)} u).`;
    case 'sin-margen':
      return 'El precio no cubre el costo variable unitario (compra + gastos variables): no existe punto de equilibrio.';
    default:
      return esc(a.codigo);
  }
}

function seccionResultados(p) {
  const s = p.supuestos;
  const e = p.etiquetas;
  const t = p.totales;
  const ultimo = lista => lista[lista.length - 1];
  const kpi = (valor, etiqueta, clase = '') => `<div class="kpi-card"><div class="kpi-value ${clase}">${valor}</div><div class="kpi-label">${etiqueta}</div></div>`;
  const avisos = p.avisos.length
    ? `<div class="card mb-4" style="border-left:4px solid var(--color-warning)"><h2 class="card-title">Alertas</h2>
        <ul>${p.avisos.map(a => `<li>${textoAviso(a)}</li>`).join('')}</ul></div>`
    : '';
  const margenNeto = p.resultados.utilidadNeta.map((un, i) => (p.ventas.importe[i] ? un / p.ventas.importe[i] : null));
  return `<div class="kpi-grid mb-6">
      ${kpi(monto(t.ventas), `Ventas presupuestadas (${num(t.unidades)} u)`)}
      ${kpi(monto(t.utilidadNeta), 'Utilidad neta presupuestada', t.utilidadNeta < 0 ? 'text-danger' : '')}
      ${kpi(monto(p.cierre.efectivo), 'Saldo de caja al cierre', p.cierre.efectivo < s.saldoMinimoCaja ? 'text-danger' : '')}
      ${kpi(p.financiamientoMaximo > 0 ? monto(p.financiamientoMaximo) : 'No se requiere', p.periodoFinanciamiento ? `Financiamiento máximo (${esc(p.periodoFinanciamiento)})` : 'Financiamiento requerido', p.financiamientoMaximo > 0 ? 'text-danger' : 'text-success')}
      ${kpi(monto(t.compras), `Compras (${num(t.comprasUnidades)} u)`)}
      ${kpi(`${num(p.equilibrio.peUnidades)} u`, `Punto de equilibrio por ${s.tipoPeriodo.toLowerCase()}`)}
    </div>
    ${avisos}
    ${tabla('Presupuesto de ventas y cobros', e, [
    { concepto: 'Unidades a vender', valores: p.ventas.unidades, total: t.unidades, formato: 'unidades' },
    { concepto: 'Precio de venta', valores: e.map(() => s.precio), formato: 'monto' },
    { concepto: 'Ventas', valores: p.ventas.importe, total: t.ventas, formato: 'monto', destacar: true },
    { concepto: `Cobro al contado (${pct(s.pctContado)})`, valores: p.ventas.contado, total: t.contado, formato: 'monto' },
    { concepto: 'Cobro de ventas a crédito del periodo anterior', valores: p.ventas.cobroAnterior, total: t.cobros - t.contado, formato: 'monto' },
    { concepto: 'Total de cobros', valores: p.ventas.cobros, total: t.cobros, formato: 'monto', destacar: true }
  ], `Lo vendido a crédito (${pct(1 - s.pctContado)}) se cobra el periodo siguiente; el primer periodo cobra las CxC iniciales.`)}
    ${tabla('Presupuesto de compras', e, [
    { concepto: 'Unidades a vender', valores: p.compras.unidadesVenta, total: t.unidades, formato: 'unidades' },
    { concepto: '(+) Inventario final deseado', valores: p.compras.inventarioFinal, total: ultimo(p.compras.inventarioFinal), formato: 'unidades' },
    { concepto: '(=) Unidades necesarias', valores: p.compras.necesidad, total: t.unidades + ultimo(p.compras.inventarioFinal), formato: 'unidades' },
    { concepto: '(−) Inventario inicial', valores: p.compras.inventarioInicial, total: p.compras.inventarioInicial[0], formato: 'unidades' },
    { concepto: '(=) Unidades a comprar', valores: p.compras.unidades, total: t.comprasUnidades, formato: 'unidades', destacar: true },
    { concepto: 'Costo unitario', valores: e.map(() => s.costoUnitario), formato: 'monto' },
    { concepto: 'Compras', valores: p.compras.importe, total: t.compras, formato: 'monto', destacar: true },
    { concepto: `Pago al contado (${pct(s.pctComprasContado)})`, valores: p.compras.pagoContado, total: t.compras * s.pctComprasContado, formato: 'monto' },
    { concepto: 'Pago de compras del periodo anterior', valores: p.compras.pagoAnterior, total: t.pagosProveedores - t.compras * s.pctComprasContado, formato: 'monto' },
    { concepto: 'Total de pagos a proveedores', valores: p.compras.pagos, total: t.pagosProveedores, formato: 'monto', destacar: true }
  ], `Inventario final deseado = ${pct(s.pctInventarioFinal)} de las ventas del periodo siguiente; en el último periodo, ${num(s.inventarioFinalUltimo)} unidades.`)}
    ${tabla('Presupuesto del costo de bienes vendidos', e, [
    { concepto: 'Inventario inicial', valores: p.cbv.inventarioInicial, total: p.cbv.inventarioInicial[0], formato: 'monto' },
    { concepto: '(+) Compras', valores: p.cbv.compras, total: t.compras, formato: 'monto' },
    { concepto: '(=) Mercancía disponible', valores: p.cbv.disponible, total: p.cbv.inventarioInicial[0] + t.compras, formato: 'monto' },
    { concepto: '(−) Inventario final', valores: p.cbv.inventarioFinal, total: ultimo(p.cbv.inventarioFinal), formato: 'monto' },
    { concepto: '(=) Costo de bienes vendidos', valores: p.cbv.costo, total: t.cbv, formato: 'monto', destacar: true }
  ])}
    ${tabla('Presupuesto de gastos de operación', e, [
    { concepto: `Gastos variables (${pct(s.pctGastosVariables)} de las ventas)`, valores: p.gastos.variables, total: t.gastosVariables, formato: 'monto' },
    { concepto: 'Gastos fijos pagados', valores: e.map(() => s.gastosFijos), total: t.gastosFijos, formato: 'monto' },
    { concepto: 'Depreciación (no es salida de efectivo)', valores: e.map(() => s.depreciacion), total: t.depreciacion, formato: 'monto' },
    { concepto: 'Total de gastos de operación', valores: p.gastos.total, total: t.gastosOperacion, formato: 'monto', destacar: true },
    { concepto: 'Gastos pagados en efectivo', valores: p.gastos.pagados, total: t.gastosPagados, formato: 'monto' }
  ])}
    ${tabla('Presupuesto de caja', e, [
    { concepto: 'Saldo inicial', valores: p.caja.saldoInicial, total: p.caja.saldoInicial[0], formato: 'monto', signo: true },
    { concepto: '(+) Cobros', valores: p.caja.cobros, total: t.cobros, formato: 'monto' },
    { concepto: '(−) Pagos a proveedores', valores: p.caja.pagosProveedores, total: t.pagosProveedores, formato: 'monto' },
    { concepto: '(−) Gastos de operación pagados', valores: p.caja.gastosPagados, total: t.gastosPagados, formato: 'monto' },
    { concepto: '(−) Intereses', valores: e.map(() => s.intereses), total: t.intereses, formato: 'monto' },
    { concepto: '(−) Otros desembolsos', valores: p.caja.otros, total: t.otrosDesembolsos, formato: 'monto' },
    { concepto: '(=) Flujo neto del periodo', valores: p.caja.flujoNeto, total: t.flujoNeto, formato: 'monto', destacar: true, signo: true },
    { concepto: 'Saldo final de caja', valores: p.caja.saldoFinal, total: p.cierre.efectivo, formato: 'monto', destacar: true, signo: true },
    { concepto: 'Saldo mínimo', valores: e.map(() => s.saldoMinimoCaja), formato: 'monto' },
    { concepto: 'Financiamiento requerido', valores: p.caja.financiamiento, total: p.financiamientoMaximo, formato: 'monto' },
    { concepto: 'Excedente sobre el mínimo', valores: p.caja.excedente, total: ultimo(p.caja.excedente), formato: 'monto' }
  ], 'Financiamiento requerido = saldo mínimo − saldo final, cuando el saldo final queda bajo el mínimo. No se suma a la caja; su total es el máximo del horizonte.')}
    ${tabla('Estado de resultados presupuestado', e, [
    { concepto: 'Ventas', valores: p.resultados.ventas, total: t.ventas, formato: 'monto' },
    { concepto: '(−) Costo de bienes vendidos', valores: p.resultados.cbv, total: t.cbv, formato: 'monto' },
    { concepto: '(=) Utilidad bruta', valores: p.resultados.utilidadBruta, total: t.utilidadBruta, formato: 'monto', destacar: true },
    { concepto: '(−) Gastos de operación', valores: p.resultados.gastosOperacion, total: t.gastosOperacion, formato: 'monto' },
    { concepto: '(=) UAII', valores: p.resultados.uaii, total: t.uaii, formato: 'monto', destacar: true, signo: true },
    { concepto: '(−) Intereses', valores: e.map(() => s.intereses), total: t.intereses, formato: 'monto' },
    { concepto: '(=) UAI', valores: p.resultados.uai, total: t.uai, formato: 'monto', signo: true },
    { concepto: `(−) IR (${pct(s.tasaIR)} de la UAI positiva)`, valores: p.resultados.ir, total: t.ir, formato: 'monto' },
    { concepto: '(=) Utilidad neta', valores: p.resultados.utilidadNeta, total: t.utilidadNeta, formato: 'monto', destacar: true, signo: true },
    { concepto: 'Margen neto', valores: margenNeto, total: t.ventas ? t.utilidadNeta / t.ventas : null, formato: 'pct' }
  ])}
    ${tabla('Punto de equilibrio por periodo', e, [
    { concepto: 'Punto de equilibrio (unidades)', valores: e.map(() => p.equilibrio.peUnidades), total: t.peUnidades, formato: 'unidades' },
    { concepto: 'Margen de seguridad', valores: p.equilibrio.margenSeguridad, total: t.margenSeguridad, formato: 'pct' }
  ], `CVu = costo de compra + gastos variables = ${monto(p.equilibrio.cvu)}; CF = gastos fijos + depreciación = ${monto(p.equilibrio.costosFijos)}; MCu = ${monto(p.equilibrio.mcu)}. Mismas fórmulas que el módulo <a href="#/equilibrio">Punto de Equilibrio</a>.`)}
    <div class="card mb-4"><h2 class="card-title">Saldo de caja proyectado</h2>
      <div style="height:280px"><canvas id="planChart" role="img" aria-label="Saldo final de caja por periodo y saldo mínimo"></canvas></div></div>
    <div class="card mb-4"><h2 class="card-title">Saldos al cierre del horizonte</h2>
      <p>Efectivo ${monto(p.cierre.efectivo)} · Cuentas por cobrar ${monto(p.cierre.cxc)} · Inventario ${num(p.cierre.inventarioUnidades)} u (${monto(p.cierre.inventarioValor)}) · Cuentas por pagar ${monto(p.cierre.cxp)} · IR por pagar ${monto(p.cierre.irPorPagar)}.</p>
      <p class="form-hint">Estos saldos alimentan la <a href="#/proforma">Proforma y el reporte integrado</a>.</p></div>
    <div class="card mb-4"><h2 class="card-title">Interpretación</h2><ul>
      <li>Se presupuestan ventas por ${monto(t.ventas)} (${num(t.unidades)} unidades) y una utilidad neta de ${monto(t.utilidadNeta)} (margen neto ${pct(t.ventas ? t.utilidadNeta / t.ventas : null)}).</li>
      <li>${p.financiamientoMaximo > 0
    ? `La caja baja del mínimo: se necesita financiamiento de hasta ${monto(p.financiamientoMaximo)} en ${esc(p.periodoFinanciamiento)}. Conviene gestionarlo antes o aplazar desembolsos.`
    : 'La caja no baja del saldo mínimo en ningún periodo: el excedente puede invertirse o usarse para reducir deuda.'}</li>
      <li>El saldo de caja cierra en ${monto(p.cierre.efectivo)}${p.cierre.efectivo >= p.caja.saldoInicial[0] ? ', por encima' : ', por debajo'} del saldo inicial (${monto(p.caja.saldoInicial[0])}).</li>
      ${esNumero(p.equilibrio.peUnidades) ? `<li>El punto de equilibrio es de ${num(p.equilibrio.peUnidades)} unidades por ${s.tipoPeriodo.toLowerCase()}; con las ventas presupuestadas, el margen de seguridad del horizonte es ${pct(t.margenSeguridad)}.</li>` : ''}
    </ul></div>`;
}

// opciones: { datos, guardar, graficar?, estados?, inventario? } — inventario es el resultado de calcularInventario.
export function planeacionUI(page, opciones) {
  const { guardar, graficar = null, estados = null, inventario = null } = opciones;
  let guardado = normalizarSupuestos(opciones.datos?.supuestos);
  let borrador = aBorrador(guardado);

  function mensaje(texto, error = false) {
    const el = page.querySelector('#planMensaje');
    if (!el) return;
    el.textContent = texto;
    el.className = error ? 'text-danger' : 'text-muted';
  }

  function guardarSupuestos(s, texto) {
    const errores = validarSupuestos(s);
    if (errores.length) { mensaje(errores.join(' '), true); return; }
    try {
      guardar({ supuestos: s });
    } catch (error) {
      mensaje(`No se pudo guardar: ${error.message}. Los datos anteriores no cambiaron.`, true);
      return;
    }
    guardado = s;
    borrador = aBorrador(s);
    render();
    mensaje(texto);
  }

  function seccionIntegracion() {
    const partes = [];
    if (estados) {
      const ultimo = estados.periods[estados.periods.length - 1];
      partes.push(`<button type="button" class="btn btn-secondary" id="planTomarBalance">Tomar efectivo, CxC y CxP del balance ${esc(ultimo)}</button>`);
    }
    if (inventario?.productos?.length) {
      partes.push(`<label class="sr-only" for="planProducto">Producto de Inventario</label>
        <select class="form-select" id="planProducto" style="max-width:16rem">${inventario.productos.map(p =>
          `<option value="${esc(p.id)}">${esc(p.nombre)} (${num(p.existenciaFinal)} ${esc(p.unidad)})</option>`).join('')}</select>
        <button type="button" class="btn btn-secondary" id="planTomarInventario">Tomar inventario inicial y costo del producto</button>`);
    }
    return partes.length
      ? `<div class="flex-gap flex-wrap mb-4" style="align-items:center">${partes.join('')}</div>
         ${borrador.productoInventario ? `<p class="form-hint">Inventario inicial y costo tomados de ${esc(borrador.productoInventario)}${esNumero(borrador.stockMinimo) ? `, con stock mínimo de ${num(borrador.stockMinimo)} u` : ''}.</p>` : ''}`
      : '<p class="form-hint">Con estados guardados o productos en Inventario, puede tomar de ahí los saldos iniciales.</p>';
  }

  function formulario() {
    const n = Number(borrador.periodos);
    const nValido = Number.isInteger(n) && n >= 1 && n <= MAX_PERIODOS;
    const campos = SUPUESTOS.map(([clave, etiqueta, clase]) => `<div class="form-group">
        <label class="form-label" for="plan-${clave}">${etiqueta}</label>
        <input class="form-input" id="plan-${clave}" type="number" step="any"${clase === 'libre' ? '' : ' min="0"'} value="${esc(borrador.campos[clave])}"></div>`).join('');
    const columnas = nValido ? Array.from({ length: n }, (_, i) => i) : [];
    const encabezado = columnas.map(i => `<th scope="col">${esc(borrador.tipoPeriodo)} ${i + 1}</th>`).join('');
    const fila = (prefijo, lista, etiqueta) => `<tr><th scope="row">${etiqueta}</th>${columnas.map(i => `<td>
      <label class="sr-only" for="${prefijo}-${i}">${etiqueta}, ${esc(borrador.tipoPeriodo)} ${i + 1}</label>
      <input class="form-input" id="${prefijo}-${i}" type="number" min="0" step="any" value="${esc(lista[i] ?? '')}"></td>`).join('')}</tr>`;
    return `<form id="formPlaneacion" novalidate>
      <div class="card mb-4"><h2 class="card-title">1. Supuestos generales</h2>
        <div class="form-row">
          <div class="form-group"><label class="form-label" for="planTipoPeriodo">Tipo de periodo</label>
            <select class="form-select" id="planTipoPeriodo">${TIPOS_PERIODO.map(t => `<option value="${t}"${t === borrador.tipoPeriodo ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label" for="planPeriodos">Número de periodos (1 a ${MAX_PERIODOS})</label>
            <input class="form-input" id="planPeriodos" type="number" min="1" max="${MAX_PERIODOS}" step="1" value="${esc(borrador.periodos)}"></div>
        </div>
        <div class="form-row">${campos}</div></div>
      <div class="card mb-4"><h2 class="card-title">2. Supuestos por periodo</h2>
        ${nValido ? `<div class="table-wrapper"><table class="statement-table"><thead><tr><th scope="col">Concepto</th>${encabezado}</tr></thead>
          <tbody>${fila('planVentas', borrador.ventas, 'Unidades a vender')}${fila('planOtros', borrador.otros, 'Otros desembolsos (C$): compra de activos, dividendos…')}</tbody></table></div>`
    : `<p class="text-danger">El número de periodos debe ser un entero entre 1 y ${MAX_PERIODOS}.</p>`}
        <button type="submit" class="btn btn-primary mt-4">Calcular y guardar</button></div>
    </form>`;
  }

  function render() {
    const errores = validarSupuestos(guardado);
    const resultado = errores.length ? null : calcularPresupuestoMaestro(guardado);
    page.innerHTML = `<div class="page-header"><h1 class="page-title">Presupuesto Maestro</h1>
        <p class="page-subtitle">Presupuestos de ventas, compras, costo de bienes vendidos, gastos de operación y caja de una empresa comercial.</p></div>
      <p id="planMensaje" role="status" aria-live="polite" class="text-muted">Complete los supuestos y pulse Calcular y guardar.</p>
      <div class="flex-gap flex-wrap mb-4"><button type="button" class="btn btn-secondary" id="planEjemplo">Cargar ejemplo</button></div>
      ${seccionIntegracion()}
      ${formulario()}
      ${resultado ? seccionResultados(resultado) : '<div class="card empty-state"><p>Todavía no hay un presupuesto calculado. Complete los supuestos o pulse "Cargar ejemplo".</p></div>'}`;
    bind();
    if (resultado && graficar) {
      graficar('planChart', {
        type: 'bar',
        data: {
          labels: resultado.etiquetas,
          datasets: [
            { type: 'bar', label: 'Saldo final de caja', data: resultado.caja.saldoFinal, backgroundColor: resultado.caja.saldoFinal.map(v => (v < resultado.caja.saldoMinimo ? '#dc2626' : '#2563eb')) },
            { type: 'line', label: 'Saldo mínimo', data: resultado.etiquetas.map(() => resultado.caja.saldoMinimo), borderColor: '#d97706', backgroundColor: '#d97706', pointRadius: 0 }
          ]
        },
        options: { plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
      });
    }
  }

  function bind() {
    page.querySelector('#planEjemplo')?.addEventListener('click', () => {
      guardarSupuestos(normalizarSupuestos(ejemploPlaneacion()),
        'Ejemplo cargado: MUNO MODA 2025 por trimestres (datos ficticios, saldos iniciales del balance 2024 de la demo).');
    });
    page.querySelector('#planTipoPeriodo')?.addEventListener('change', event => {
      borrador.tipoPeriodo = event.target.value;
      render();
      mensaje('Cambios sin guardar: pulse Calcular y guardar.');
    });
    page.querySelector('#planPeriodos')?.addEventListener('change', event => {
      borrador.periodos = event.target.value;
      const n = Number(event.target.value);
      if (Number.isInteger(n) && n >= 1 && n <= MAX_PERIODOS) {
        borrador.ventas = redimensionar(borrador.ventas, n, '');
        borrador.otros = redimensionar(borrador.otros, n, '0');
      }
      render();
      mensaje('Cambios sin guardar: pulse Calcular y guardar.');
    });
    for (const [clave] of SUPUESTOS) {
      page.querySelector(`#plan-${clave}`)?.addEventListener('input', event => { borrador.campos[clave] = event.target.value; });
    }
    borrador.ventas.forEach((_, i) => {
      page.querySelector(`#planVentas-${i}`)?.addEventListener('input', event => { borrador.ventas[i] = event.target.value; });
      page.querySelector(`#planOtros-${i}`)?.addEventListener('input', event => { borrador.otros[i] = event.target.value; });
    });
    page.querySelector('#formPlaneacion')?.addEventListener('submit', event => {
      event.preventDefault();
      guardarSupuestos(desdeBorrador(borrador), 'Presupuesto calculado y guardado.');
    });
    page.querySelector('#planTomarBalance')?.addEventListener('click', () => {
      const totales = totalesPeriodo(estados);
      if (!totales) { mensaje('No se pudieron leer los estados guardados.', true); return; }
      borrador.campos.saldoInicialCaja = String(totales.efectivo);
      borrador.campos.cxcInicial = String(totales.cxC);
      borrador.campos.cxpInicial = String(totales.cuentasPorPagar);
      render();
      mensaje(`Tomados del balance ${totales.periodo}: efectivo ${monto(totales.efectivo)}, CxC ${monto(totales.cxC)} y CxP ${monto(totales.cuentasPorPagar)}. Pulse Calcular y guardar.`);
    });
    page.querySelector('#planTomarInventario')?.addEventListener('click', () => {
      const id = page.querySelector('#planProducto')?.value;
      const producto = inventario?.productos?.find(p => p.id === id);
      if (!producto) { mensaje('Elija un producto de Inventario.', true); return; }
      borrador.campos.inventarioInicial = String(producto.existenciaFinal);
      borrador.campos.costoUnitario = String(producto.costoUnitario);
      borrador.productoInventario = producto.nombre;
      borrador.stockMinimo = producto.stockMinimo;
      render();
      mensaje(`Tomados de ${producto.nombre}: inventario inicial ${num(producto.existenciaFinal)} ${producto.unidad} y costo ${monto(producto.costoUnitario)}. Pulse Calcular y guardar.`);
    });
  }

  render();
}
