import { panelEjemplos, vincularEjemplos, ejemploSeleccionado } from '../../components/ejemplos.js';
import { monedaDe } from '../../utils/moneda.js';
// Pantalla #/planeacion: supuestos, presupuestos de ventas, compras, CBV, gastos de operación y caja,
// y estado de resultados presupuestado. El cálculo está en planeacion-calculations.js.
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND as monto, formatNumberND, formatPercentND as pct } from '../../utils/format.js';
import { leerNumero, nuevoId } from '../../utils/form.js';
import { consultarMontoCuenta } from '../estados/cuentas-identificador.js';
import {
  CALENDARIOS_CAPITAL_TRABAJO, MAX_PERIODOS, SUPUESTOS, TIPOS_PERIODO,
  calcularCapitalTrabajo, calcularPresupuestoMaestro, ejemploPlaneacion, normalizarSupuestos, validarSupuestos
} from './planeacion-calculations.js';
import {
  CAMPOS_BASE, MAX_NOMBRE_ESCENARIO, crearCasoComercial, duplicarEscenario, editarEscenario,
  leerPlaneacion, seleccionarEscenario
} from './planeacion-escenarios.js';
import { detalleVencimientos, resumenPlaneacionUI } from './planeacion-resumen-ui.js';

const esNumero = valor => typeof valor === 'number' && Number.isFinite(valor);
const num = valor => formatNumberND(valor, esNumero(valor) && Number.isInteger(valor) ? 0 : 2);
const EN_PORCENTAJE = ['fraccion', 'tasa', 'multiplo'];
const textoPct = fraccion => String(Number((fraccion * 100).toFixed(6)));
const decimalEditable = new Intl.NumberFormat('en-US', { useGrouping: false, maximumSignificantDigits: 15 });
const CAMPOS_CAPITAL_TRABAJO = new Set([
  'precio', 'pctContado', 'cxcInicial', 'pctComprasContado', 'cxpInicial',
  'inventarioInicial', 'pctInventarioFinal', 'inventarioFinalUltimo'
]);
const VISTAS = [['resumen', 'Resumen'], ['supuestos', 'Supuestos'], ['tablas', 'Tablas completas']];

// Supuestos → textos del formulario (porcentajes en %, no en fracción).
function aBorrador(s, capital) {
  const textoNumero = capital ? valor => decimalEditable.format(valor) : String;
  const textoFraccion = capital ? valor => decimalEditable.format(valor * 100) : textoPct;
  const aTexto = valor => esNumero(valor) ? textoNumero(valor) : '';
  const campos = {};
  for (const [clave, , clase] of SUPUESTOS) {
    const v = s?.[clave];
    campos[clave] = esNumero(v) && EN_PORCENTAJE.includes(clase) ? textoFraccion(v) : aTexto(v);
  }
  const n = s?.periodos ?? 4;
  return {
    tipoPeriodo: s?.tipoPeriodo ?? 'Trimestre',
    periodos: String(n),
    campos,
    ventas: s ? s.ventasUnidades.map(aTexto) : Array(n).fill(''),
    otros: s ? s.otrosDesembolsos.map(aTexto) : Array(n).fill('0'),
    productoInventario: s?.productoInventario ?? '',
    productoId: s?.productoId ?? '',
    capital: capital ? {
      costosCompra: capital.costosCompra.map(aTexto),
      ...Object.fromEntries(CALENDARIOS_CAPITAL_TRABAJO.map(([clave]) =>
        [clave, capital[clave]?.map(textoFraccion).join(' ') ?? '']))
    } : null
  };
}

function leerCampo(texto, etiqueta, estricto) {
  const dato = leerNumero(texto);
  if (estricto && !dato.vacio && dato.valor === null) throw new Error(`${etiqueta} requiere un número válido.`);
  return dato;
}

function desdeBorrador(b, escenario) {
  const leer = (texto, etiqueta) => leerCampo(texto, etiqueta, escenario);
  const periodos = Number(b.periodos);
  const s = {
    tipoPeriodo: b.tipoPeriodo, periodos,
    ventasUnidades: b.ventas.map((t, i) => leer(t, `Unidades a vender del periodo ${i + 1}`).valor),
    otrosDesembolsos: b.otros.map((t, i) => {
      const { vacio, valor } = leer(t, `Otros desembolsos del periodo ${i + 1}`);
      return vacio && !escenario ? 0 : valor;
    }),
    productoInventario: b.productoInventario, productoId: b.productoId
  };
  for (const [clave, etiqueta, clase] of SUPUESTOS) {
    const { valor } = leer(b.campos[clave], etiqueta);
    s[clave] = valor !== null && EN_PORCENTAJE.includes(clase) ? valor / 100 : valor;
  }
  return s;
}

function capitalDesdeBorrador(b) {
  if (!b) return undefined;
  const capital = {
    costosCompra: b.costosCompra.map((texto, i) => leerCampo(texto, `Costo de compra del mes ${i + 1}`, true).valor)
  };
  for (const [clave, etiqueta] of CALENDARIOS_CAPITAL_TRABAJO) {
    const texto = b[clave].trim();
    capital[clave] = texto ? texto.split(/\s+/).map(parte => {
      const { valor } = leerCampo(parte, etiqueta, true);
      return valor === null ? null : valor / 100;
    }) : null;
  }
  return capital;
}

function redimensionar(lista, n, relleno) {
  return Array.from({ length: n }, (_, i) => (i < lista.length ? lista[i] : relleno));
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

function seccionCapitalTrabajo(p) {
  const flujo = (titulo, datos, conceptos) => tabla(titulo, p.etiquetas, conceptos.map(([clave, concepto]) => ({
    concepto, formato: 'monto', valores: datos.meses.map(mes => mes[clave]), total: datos.totales[clave],
    destacar: clave === 'total' || clave === 'cierre'
  })));
  const ventas = flujo('Ventas y cobros', p.ventas, [
    ['importe', 'Ventas'], ['contado', 'Ventas al contado'], ['credito', 'Ventas a crédito'],
    ['apertura', 'Cuentas por cobrar al inicio'], ['liquidado', 'Cobros de cuentas por cobrar'],
    ['total', 'Cobros del mes'], ['cierre', 'Cuentas por cobrar al cierre']
  ]);
  const compras = flujo('Compras y pagos a proveedores', p.compras, [
    ['importe', 'Importe de compras'], ['contado', 'Compras al contado'], ['credito', 'Compras a crédito'],
    ['apertura', 'Cuentas por pagar al inicio'], ['liquidado', 'Pagos de cuentas por pagar'],
    ['total', 'Pagos a proveedores del mes'], ['cierre', 'Cuentas por pagar al cierre']
  ]);
  const existencias = tabla('Inventario en unidades', p.etiquetas, [
    { concepto: 'Unidades a vender', formato: 'unidades', valores: p.unidadesVendidas },
    { concepto: 'Existencia inicial', formato: 'unidades', valores: p.existencias.map(f => f.inicial) },
    { concepto: 'Existencia final deseada', formato: 'unidades', valores: p.existencias.map(f => f.objetivo) },
    { concepto: 'Unidades a comprar', formato: 'unidades', valores: p.existencias.map(f => f.compras) },
    { concepto: 'Existencia final proyectada', formato: 'unidades', valores: p.existencias.map(f => f.final), destacar: true },
    { concepto: 'Costo unitario de compra', formato: 'monto', valores: p.costosCompra }
  ], 'Si la existencia inicial cubre las ventas y el objetivo, se conserva el sobrante.');
  const { meses, costoVentasTotal } = p.valoracion;
  const valoracion = tabla('Inventario valorizado y costo de ventas', p.etiquetas, [
    ['inicial', 'Inventario inicial valorizado', meses[0].inicial],
    ['compras', '(+) Compras del periodo', p.compras.totales.importe],
    ['costoVentas', '(−) Costo de ventas', costoVentasTotal],
    ['final', '(=) Inventario final valorizado', meses.at(-1).final]
  ].map(([clave, concepto, total]) => ({
    concepto, formato: 'monto', valores: meses.map(mes => mes[clave]), total, destacar: clave === 'final'
  })), 'El promedio ponderado mensual divide el valor del inventario inicial más las compras entre las unidades disponibles. En Total, las filas de inventario muestran la apertura y el cierre del horizonte.');
  return `<section aria-label="Presupuesto parcial de capital de trabajo">
    <p class="form-hint">Resultados del escenario guardado. N/D indica un cálculo pendiente. Los saldos se muestran por mes.</p>
    ${ventas}${existencias}${valoracion}${compras}
    <div class="card mb-4"><h2 class="card-title">Vencimientos después del horizonte</h2>
      <h3>Cobros pendientes</h3>${detalleVencimientos(p.ventas.pendientes)}
      <h3>Pagos pendientes</h3>${detalleVencimientos(p.compras.pendientes)}</div>
  </section>`;
}

function textoAviso(a) {
  switch (a.codigo) {
    case 'financiamiento':
      return `${esc(a.periodo)}: el saldo final (${monto(a.saldoFinal)}) queda bajo el mínimo. Se requieren ${monto(a.monto)} de financiamiento (por ejemplo, una línea de crédito) o aplazar desembolsos.`;
    case 'sin-compras':
      return `${esc(a.periodo)}: el inventario inicial cubre las ventas y el inventario deseado; no se compra y sobran ${num(a.sobrante)} unidades.`;
    case 'bajo-stock-minimo':
      return `${esc(a.periodo)}: el inventario final (${num(a.inventario)} u) llegó al stock mínimo del producto (${num(a.stockMinimo)} u) registrado en Inventario: programe una compra.`;
    case 'sin-producto-vinculado':
      return 'Este presupuesto se guardó con una versión anterior. Vuelva a tomar el producto de Inventario para que el stock mínimo se lea del producto.';
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

// inventario es el resultado de calcularInventario.
export function planeacionUI(page, opciones) {
  const { guardar, graficar = null, destruirGrafica, estados = null, inventario = null, cargarReferencia } = opciones;
  let datos = opciones.datos;
  let lectura = leerPlaneacion(datos);
  let borrador = aBorrador(lectura.supuestos, lectura.escenario?.capitalTrabajo);
  let nombre = lectura.escenario?.nombre ?? '';
  let cambios = false;
  let vista = 'resumen';

  function mensaje(texto, error = false) {
    const el = page.querySelector('#planMensaje');
    if (!el) return;
    el.textContent = texto;
    el.className = error ? 'text-danger' : 'text-muted';
    if (error) el.focus();
  }

  function marcarCambios() {
    cambios = true;
    page.querySelector('#planBorradorPendiente').hidden = false;
  }

  function guardarDatos(nuevos, texto, destino = 'resumen') {
    try {
      guardar(nuevos);
    } catch (error) {
      mensaje(`No se pudo guardar. ${error.message}. Se conservó el último estado válido.`, true);
      return false;
    }
    datos = nuevos;
    lectura = leerPlaneacion(datos);
    borrador = aBorrador(lectura.supuestos, lectura.escenario?.capitalTrabajo);
    nombre = lectura.escenario?.nombre ?? '';
    cambios = false;
    vista = destino;
    render();
    mensaje(texto);
    page.querySelector(`#planVer-${vista}`)?.focus();
    return true;
  }

  function guardarSupuestos(s, texto, parcial = false, capital = undefined) {
    const errores = validarSupuestos(s, { parcial });
    if (errores.length) { mensaje(errores.join(' '), true); return; }
    guardarDatos(lectura.escenario ? editarEscenario(datos, nombre, s, capital) : { supuestos: s },
      texto, parcial && !capital ? 'supuestos' : 'resumen');
  }

  function guardarFormulario(parcial) {
    try {
      if (borrador.capital) {
        guardarSupuestos(desdeBorrador(borrador, true), 'Presupuesto parcial guardado. Los datos pendientes aparecen como N/D.',
          true, capitalDesdeBorrador(borrador.capital));
        return;
      }
      guardarSupuestos(desdeBorrador(borrador, Boolean(lectura.escenario)), parcial
        ? 'Borrador guardado. Los campos vacíos quedan pendientes.' : 'Presupuesto calculado y guardado.', parcial);
    } catch (error) {
      mensaje(error.message, true);
    }
  }

  function confirmarCambio() {
    return !cambios || window.confirm('Hay cambios sin guardar. ¿Descartarlos y continuar?');
  }

  function selectorEscenario() {
    const { escenario } = lectura;
    if (!escenario) return '';
    return `<div class="plan-selector">
      <label class="form-label" for="planEscenario">Escenario activo</label>
      <select id="planEscenario" class="form-select">${datos.escenarios.map(e =>
    `<option value="${esc(e.id)}"${e.id === escenario.id ? ' selected' : ''}>${esc(e.nombre)}</option>`).join('')}</select>
    </div>`;
  }

  function editarEscenarioActual() {
    const { escenario, base } = lectura;
    if (!escenario) return '';
    return `<div class="card mb-4">
      <h2 class="card-title">Escenario</h2>
      <div class="plan-encabezado">
        <div class="plan-selector"><label class="form-label" for="planNombreEscenario">Nombre del escenario</label>
        <input id="planNombreEscenario" class="form-input" maxlength="${MAX_NOMBRE_ESCENARIO}" value="${esc(nombre)}"></div>
        <button id="planDuplicarEscenario" type="button" class="btn btn-secondary">Duplicar escenario</button>
      </div>
      <p class="form-hint">${base
    ? `${esc(base.revision)} · Inventario de apertura ${monto(base.apertura.inventarioValor)}.`
    : 'Presupuesto anterior con apertura editable.'}</p></div>`;
  }

  function seccionIntegracion() {
    if (lectura.base) return '';
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
         ${borrador.productoInventario ? `<p class="form-hint">${borrador.productoId
           ? `Inventario inicial y costo tomados de ${esc(borrador.productoInventario)}: el stock mínimo y el costo se leen del producto vigente en Inventario al calcular.`
           : 'Este presupuesto se guardó con una versión anterior. Vuelva a tomar el producto de Inventario para que el stock mínimo se lea del producto.'}</p>` : ''}`
      : '<p class="form-hint">Con estados guardados o productos en Inventario, puede tomar de ahí los saldos iniciales.</p>';
  }

  function enlazarNumero(input, asignar) {
    input?.addEventListener('input', event => {
      asignar(event.target.validity?.badInput ? 'Inválido' : event.target.value);
      marcarCambios();
    });
  }

  function renderizarSupuestosPorPeriodo() {
    const tablaSupuestos = page.querySelector('#planTablaSupuestos');
    const n = Number(borrador.periodos);
    if (!Number.isInteger(n) || n < 1 || n > MAX_PERIODOS) {
      tablaSupuestos.innerHTML = `<p class="text-danger">El número de periodos debe ser un entero entre 1 y ${MAX_PERIODOS}.</p>`;
      return;
    }
    const columnas = Array.from({ length: n }, (_, i) => i);
    const encabezado = columnas.map(i => `<th scope="col">${esc(borrador.tipoPeriodo)} ${i + 1}</th>`).join('');
    const fila = (prefijo, lista, etiqueta) => `<tr><th scope="row">${etiqueta}</th>${columnas.map(i => `<td>
      <input class="form-input" id="${prefijo}-${i}" aria-label="${etiqueta}, ${esc(borrador.tipoPeriodo)} ${i + 1}"
        type="number" min="0" step="any" value="${esc(lista[i] ?? '')}"></td>`).join('')}</tr>`;
    const capital = borrador.capital;
    tablaSupuestos.innerHTML = `<div class="table-wrapper"><table class="statement-table"><thead><tr><th scope="col">Concepto</th>${encabezado}</tr></thead>
      <tbody>${fila('planVentas', borrador.ventas, 'Unidades a vender')}${capital
    ? fila('planCostoCompra', capital.costosCompra, 'Costo unitario de compra (C$)')
    : fila('planOtros', borrador.otros, 'Otros desembolsos (C$): compra de activos, dividendos…')}</tbody></table></div>`;
    for (const i of columnas) {
      enlazarNumero(tablaSupuestos.querySelector(`#planVentas-${i}`), valor => { borrador.ventas[i] = valor; });
      if (capital) enlazarNumero(tablaSupuestos.querySelector(`#planCostoCompra-${i}`), valor => { capital.costosCompra[i] = valor; });
      else enlazarNumero(tablaSupuestos.querySelector(`#planOtros-${i}`), valor => { borrador.otros[i] = valor; });
    }
  }

  function formulario() {
    const capital = borrador.capital;
    const supuestosVisibles = capital ? SUPUESTOS.filter(([clave]) => CAMPOS_CAPITAL_TRABAJO.has(clave)) : SUPUESTOS;
    const campos = supuestosVisibles.map(([clave, etiqueta, clase]) => `<div class="form-group">
        <label class="form-label" for="plan-${clave}">${etiqueta}</label>
        <input class="form-input" id="plan-${clave}" type="number" step="any"${clase === 'libre' ? '' : ' min="0"'}${lectura.base && CAMPOS_BASE.includes(clave) ? ' readonly' : ''} value="${esc(borrador.campos[clave])}"></div>`).join('');
    const calendarios = capital ? `<div class="card mb-4"><h2 class="card-title">3. Calendarios de cobro y pago</h2>
        <p id="planAyudaCalendario" class="form-hint">Separe los porcentajes con espacios. Use punto decimal y escriba 0 para saltar un mes.
          El total de cada calendario debe ser 100 %. Por ejemplo, «60 40» reparte el importe entre los dos primeros meses.
          Para los saldos iniciales el primer porcentaje corresponde al primer mes del presupuesto.
          Para el crédito nuevo corresponde al mes siguiente a la venta o compra. Un calendario vacío queda pendiente.</p>
        <div class="form-row">${CALENDARIOS_CAPITAL_TRABAJO.map(([clave, etiqueta]) => `<div class="form-group">
          <label class="form-label" for="plan-${clave}">${etiqueta} (%)</label>
          <input class="form-input" id="plan-${clave}" aria-describedby="planAyudaCalendario" type="text" value="${esc(capital[clave])}">
        </div>`).join('')}</div>
      </div>` : '';
    return `<form id="formPlaneacion" novalidate>
      <div class="card mb-4"><h2 class="card-title">1. Supuestos generales</h2>
        <div class="form-row">
          <div class="form-group"><label class="form-label" for="planTipoPeriodo">Tipo de periodo</label>
            <select class="form-select" id="planTipoPeriodo"${capital ? ' disabled' : ''}>${TIPOS_PERIODO.map(t => `<option value="${t}"${t === borrador.tipoPeriodo ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label" for="planPeriodos">Número de periodos (1 a ${MAX_PERIODOS})</label>
            <input class="form-input" id="planPeriodos" type="number" min="1" max="${MAX_PERIODOS}" step="1" value="${esc(borrador.periodos)}"></div>
        </div>
        <div class="form-row">${campos}</div></div>
      <div class="card mb-4"><h2 class="card-title">2. Supuestos por periodo</h2>
        <div id="planTablaSupuestos"></div>
      </div>
      ${calendarios}
      <div class="flex-gap flex-wrap mb-4">
        <button type="submit" class="btn btn-primary">Calcular y guardar</button>
        ${lectura.escenario && !capital ? '<button id="planGuardarBorrador" type="button" class="btn btn-secondary">Guardar borrador</button>' : ''}
      </div>
    </form>`;
  }

  function render() {
    destruirGrafica?.('planChart');
    if (lectura.error) {
      page.innerHTML = `<div class="card"><h1 class="card-title">Presupuesto Maestro</h1>
        <p role="alert" class="text-danger">${esc(lectura.error)} Restaure un respaldo válido en Reportes.</p></div>`;
      return;
    }
    const capital = lectura.escenario?.capitalTrabajo;
    const resultadoCapital = capital
      ? calcularCapitalTrabajo(lectura.supuestos, capital, lectura.base.fechaCorte, lectura.base.apertura.inventarioValor)
      : null;
    const resultado = capital || validarSupuestos(lectura.supuestos).length
      ? null : calcularPresupuestoMaestro(lectura.supuestos, lectura.base ? null : inventario);
    const resumen = resultadoCapital ?? resultado;
    const { base } = lectura;
    const horizonte = resumen
      ? `Horizonte ${resumen.etiquetas[0]}${resumen.etiquetas.length > 1 ? ` a ${resumen.etiquetas.at(-1)}` : ''}`
      : '';
    const contexto = [base?.empresa, horizonte, base ? `Corte ${base.fechaCorte}` : ''].filter(Boolean).join(' · ');
    const aviso = resultado?.avisos.find(a => a.codigo === 'financiamiento') ?? resultado?.avisos[0];
    const carga = `<div class="plan-carga">
      ${cargarReferencia ? '<section class="example-picker"><h3>Caso integrado de referencia</h3><label for="planReferenciaEjemplo">Referencia disponible</label><select id="planReferenciaEjemplo" class="form-select"><option>Comercial Ejemplo · capital de trabajo parcial</option></select><p class="example-picker-source">Referencia propia del repositorio con ventas, cobros, pagos, inventario y costo de ventas de un presupuesto parcial.</p><button id="planCargarCaso" type="button" class="btn btn-secondary">Cargar referencia seleccionada</button></section>' : ''}
      ${panelEjemplos('planeacion', 'planEjemplo')}
    </div>`;
    page.innerHTML = `<header class="page-header plan-cabecera">
      <div class="plan-encabezado">
        <div><h1 class="page-title">Presupuesto Maestro</h1>
          <p class="page-subtitle">${capital ? 'Capital de trabajo mensual · Presupuesto parcial' : 'Planeación de una empresa comercial'}</p></div>
        ${selectorEscenario()}
      </div>
      ${contexto ? `<p class="plan-contexto">${esc(contexto)}</p>` : ''}
    </header>
    <div class="plan-vistas" role="group" aria-label="Vistas de Planeación">${VISTAS.map(([clave, etiqueta]) =>
    `<button id="planVer-${clave}" class="btn btn-secondary" type="button" aria-controls="planVista-${clave}"
        aria-pressed="${vista === clave}"${clave === 'tablas' && !resumen ? ' disabled' : ''}>${etiqueta}</button>`).join('')}
    </div>
    <p id="planMensaje" role="status" class="text-muted" tabindex="-1"></p>
    <p id="planBorradorPendiente" class="plan-aviso text-warning mb-2"${cambios ? '' : ' hidden'}>Hay cambios sin guardar.</p>
    <section id="planVista-resumen" class="plan-vista" aria-labelledby="planVer-resumen" hidden>
      ${aviso ? `<p class="plan-aviso text-warning mb-2">${textoAviso(aviso)} Consulte los avisos en Tablas completas.</p>` : ''}
      ${resumen ? '<div id="planResumen"></div>' : `<div class="card"><h2 class="card-title">Prepare el presupuesto</h2>
        <p class="plan-contexto mb-2">Complete los supuestos o cargue un ejemplo para consultar los resultados.</p>
        ${carga}</div>`}
    </section>
    <section id="planVista-supuestos" class="plan-vista" aria-labelledby="planVer-supuestos" hidden>
      ${resumen ? carga : ''}
      ${editarEscenarioActual()}
      ${seccionIntegracion()}
      ${formulario()}
    </section>
    <section id="planVista-tablas" class="plan-vista" aria-labelledby="planVer-tablas" hidden>
      ${resultadoCapital ? seccionCapitalTrabajo(resultadoCapital) : resultado ? seccionResultados(resultado) : ''}
    </section>`;
    if (resumen) resumenPlaneacionUI(page.querySelector('#planResumen'), resumen, Boolean(resultadoCapital));
    renderizarSupuestosPorPeriodo();
    bind();

    let graficaMostrada = false;
    function mostrarVista(destino) {
      vista = destino;
      for (const [clave] of VISTAS) {
        page.querySelector(`#planVista-${clave}`).hidden = clave !== vista;
        page.querySelector(`#planVer-${clave}`).setAttribute('aria-pressed', String(clave === vista));
      }
      if (vista !== 'tablas' || !resultado || !graficar || graficaMostrada) return;
      graficaMostrada = true;
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
    for (const [clave] of VISTAS) {
      page.querySelector(`#planVer-${clave}`).addEventListener('click', () => {
        if (clave !== 'tablas' || resumen) mostrarVista(clave);
      });
    }
    mostrarVista(vista);
  }

  function bind() {
    vincularEjemplos(page, 'planeacion');
    const botonCaso = page.querySelector('#planCargarCaso');
    botonCaso?.addEventListener('click', async () => {
      if (botonCaso.disabled) return;
      botonCaso.disabled = true;
      try {
        const { referencia, entradas } = await cargarReferencia();
        if (page.querySelector('#planCargarCaso') !== botonCaso || !confirmarCambio()) return;
        guardarDatos(crearCasoComercial(datos, referencia, entradas), 'Comercial Ejemplo cargado desde la referencia.');
      } catch (error) {
        if (page.querySelector('#planCargarCaso') === botonCaso) mensaje(`No se pudo cargar Comercial Ejemplo. ${error.message}`, true);
      } finally {
        botonCaso.disabled = false;
      }
    });
    page.querySelector('#planEscenario')?.addEventListener('change', event => {
      try {
        if (confirmarCambio() && guardarDatos(seleccionarEscenario(datos, event.target.value), 'Escenario seleccionado.')) return;
      } catch (error) {
        mensaje(error.message, true);
      }
      event.target.value = lectura.escenario.id;
    });
    page.querySelector('#planDuplicarEscenario')?.addEventListener('click', () => {
      if (!confirmarCambio()) return;
      try {
        guardarDatos(duplicarEscenario(datos, nuevoId('escenario')), 'Escenario duplicado.', 'supuestos');
      } catch (error) {
        mensaje(error.message, true);
      }
    });
    page.querySelector('#planNombreEscenario')?.addEventListener('input', event => {
      nombre = event.target.value;
      marcarCambios();
    });
    page.querySelector('#planGuardarBorrador')?.addEventListener('click', () => guardarFormulario(true));
    page.querySelector('#planEjemplo')?.addEventListener('click', () => {
      if (!confirmarCambio()) return;
      if (lectura.escenario && !window.confirm('¿Reemplazar el presupuesto actual y sus escenarios por el ejemplo seleccionado?')) return;
      guardarDatos({ supuestos:normalizarSupuestos(ejemploSeleccionado(page, 'planeacion', ejemploPlaneacion)) },
        'Ejemplo seleccionado cargado. Revise los supuestos y el horizonte.', 'resumen');
    });
    page.querySelector('#planTipoPeriodo')?.addEventListener('change', event => {
      borrador.tipoPeriodo = event.target.value;
      marcarCambios();
      renderizarSupuestosPorPeriodo();
      mensaje('Cambios sin guardar: pulse Calcular y guardar.');
    });
    page.querySelector('#planPeriodos')?.addEventListener('change', event => {
      borrador.periodos = event.target.value;
      marcarCambios();
      const n = Number(event.target.value);
      if (Number.isInteger(n) && n >= 1 && n <= MAX_PERIODOS) {
        borrador.ventas = redimensionar(borrador.ventas, n, lectura.escenario ? '' : (borrador.ventas.at(-1) ?? ''));
        borrador.otros = redimensionar(borrador.otros, n, lectura.escenario ? '' : (borrador.otros.at(-1) ?? '0'));
        if (borrador.capital) borrador.capital.costosCompra = redimensionar(borrador.capital.costosCompra, n, '');
      }
      renderizarSupuestosPorPeriodo();
      mensaje('Cambios sin guardar: pulse Calcular y guardar.');
    });
    for (const [clave] of SUPUESTOS) enlazarNumero(page.querySelector(`#plan-${clave}`), valor => { borrador.campos[clave] = valor; });
    if (borrador.capital) {
      for (const [clave] of CALENDARIOS_CAPITAL_TRABAJO) {
        enlazarNumero(page.querySelector(`#plan-${clave}`), valor => { borrador.capital[clave] = valor; });
      }
    }
    page.querySelector('#formPlaneacion')?.addEventListener('submit', event => {
      event.preventDefault();
      guardarFormulario(false);
    });
    page.querySelector('#planTomarBalance')?.addEventListener('click', () => {
      const periodo = estados?.periods?.at(-1);
      if (!periodo) { mensaje('No se pudieron leer los estados guardados.', true); return; }
      if (monedaDe(estados) !== monedaDe(lectura.base || lectura.supuestos)) {
        mensaje(`Moneda incompatible: Estados usa ${monedaDe(estados)} y Planeación usa ${monedaDe(lectura.base || lectura.supuestos)}. Se conserva el borrador; no se realiza conversión automática.`, true);
        return;
      }
      const campos = [
        ['saldoInicialCaja', 'bs.cash_and_equivalents', 'efectivo'],
        ['cxcInicial', 'bs.trade_receivables', 'CxC'],
        ['cxpInicial', 'bs.trade_payables', 'CxP']
      ];
      const saldos = campos.map(([destino, id, etiqueta]) => ({
        destino, etiqueta, valor: consultarMontoCuenta(estados, periodo, id).valor
      }));
      const disponibles = saldos.filter(({ valor }) => esNumero(valor));
      if (!disponibles.length) { mensaje(`Los saldos de apertura del balance ${periodo} están N/D.`, true); return; }
      for (const { destino, valor } of disponibles) borrador.campos[destino] = String(valor);
      marcarCambios();
      render();
      const aplicados = disponibles.map(({ etiqueta, valor }) => `${etiqueta} ${monto(valor)}`);
      const pendientes = saldos.filter(({ valor }) => !esNumero(valor)).map(({ etiqueta }) => etiqueta);
      const aviso = pendientes.length ? ` Se conservaron los campos ${pendientes.join(', ')} porque el balance los tiene N/D.` : '';
      mensaje(`Del balance ${periodo} se tomaron ${aplicados.join(', ')}.${aviso} Pulse Calcular y guardar.`);
    });
    page.querySelector('#planTomarInventario')?.addEventListener('click', () => {
      const id = page.querySelector('#planProducto')?.value;
      const producto = inventario?.productos?.find(p => p.id === id);
      if (!producto) { mensaje('Elija un producto de Inventario.', true); return; }
      // D-082: se guarda el productoId (el mínimo y el costo se leen del producto
      // vigente al calcular) y el costo es el promedio vigente, no el inicial.
      borrador.campos.inventarioInicial = String(producto.existenciaFinal);
      borrador.campos.costoUnitario = String(producto.costoPromedio);
      borrador.productoInventario = producto.nombre;
      borrador.productoId = producto.id;
      marcarCambios();
      render();
      mensaje(`Tomados de ${producto.nombre}: inventario inicial ${num(producto.existenciaFinal)} ${producto.unidad} y costo promedio ${monto(producto.costoPromedio)}. Pulse Calcular y guardar.`);
    });
  }

  render();
}
