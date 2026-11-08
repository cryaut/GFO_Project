import { escapeHTML } from '../../utils/html.js';
import { formatCurrencyND } from '../../utils/format.js';
import { estadosResueltos } from './estados-presentacion-calculations.js';
import { monedaDe } from '../../utils/moneda.js';

// Accesorias en la presentación, NO una política de ausencia financiera.
// Una cuenta desconocida, un importe vacío o un subtotal nunca se compactan.
const OPCIONALES = new Set([
  'is.sales_returns', 'is.sales_discounts', 'is.sales_allowances',
  'is.other_sales_revenue', 'is.other_operating_income', 'is.other_operating_expenses',
  'is.operating_depreciation', 'is.operating_amortization', 'is.interest_income',
  'is.nonoperating_income', 'is.noninterest_nonoperating_expenses',
  'bs.intangible_assets', 'bs.short_term_investments', 'bs.long_term_investments',
  'bs.other_current_receivables', 'bs.prepaid_expenses', 'bs.other_current_assets',
  'bs.other_noncurrent_assets', 'bs.ppe_other', 'bs.current_provisions',
  'bs.long_term_provisions', 'bs.other_current_liabilities', 'bs.other_noncurrent_liabilities',
  'bs.additional_paid_in_capital', 'bs.other_reserves', 'bs.other_equity_components'
]);

export function separarCuentasOpcionales(filas, fuentes = fila => [fila]) {
  const visibles = [], opcionales = [];
  for (const fila of filas) {
    const comparadas = fuentes(fila);
    const compactar = !fila.subtotal && OPCIONALES.has(fila.id) && comparadas.length > 0
      && comparadas.every(f => f && !f.subtotal && f.origen === 'importado' && f.valor === 0);
    (compactar ? opcionales : visibles).push(fila);
  }
  return { visibles, opcionales };
}

export function desplegableCuentasOpcionales(filas, contenido) {
  return filas.length ? `<details class="statement-optional"><summary>Ver cuentas opcionales en cero (${filas.length})</summary>
    <p class="form-hint">Se conservan en los datos. Este grupo solo simplifica la lectura; cero no acredita que una cuenta esté ausente.</p>${contenido}</details>` : '';
}

export function origenFilaEstado(fila, cuentaVisible = fila?.cuenta) {
  if (!fila) return '';
  const origen = { calculado: 'Calculado', reportado: 'Reportado', pendiente: 'Faltan datos' }[fila.origen];
  let aviso = '';
  if (fila.origen === 'reportado' && fila.motivos?.length) {
    const incompleto = fila.motivos.some(motivo => motivo.codigo === 'reported_subtotal_unverifiable');
    aviso = incompleto ? ' · Desglose no comprobable' : ' · Revisar';
  }
  const nombre = fila.cuenta !== cuentaVisible ? ` · ${escapeHTML(fila.cuenta)}` : '';
  return origen ? `<small class="statement-source">${origen}${aviso}${nombre}</small>` : '';
}

export function etiquetaFilaEstado(fila, { mostrarOrigen = true } = {}) {
  const operador = fila.operador ? `<span class="statement-operator">${escapeHTML(fila.operador)}</span>` : '';
  const concepto = fila.concepto && fila.concepto !== fila.cuenta
    ? `<small class="statement-concept">${escapeHTML(fila.concepto)}</small>` : '';
  return `${operador}<span>${escapeHTML(fila.cuenta)}${concepto}</span>${mostrarOrigen ? origenFilaEstado(fila) : ''}`;
}

export function tablasEstadosResueltos(datos, periodos) {
  const resueltos = new Map(periodos.map(p => [p, estadosResueltos(datos, p)]));
  const tabla = (seccion, titulo) => {
    const filas = new Map();
    for (const estado of resueltos.values()) for (const fila of estado[seccion]) filas.set(fila.clave, fila);
    const ordenadas = [...filas.values()].sort((a, b) => a.orden - b.orden);
    if (!ordenadas.length) return '';
    const porPeriodo = new Map([...resueltos].map(([p, estado]) => [p, new Map(estado[seccion].map(f => [f.clave, f]))]));
    const { visibles, opcionales } = separarCuentasOpcionales(ordenadas, fila => periodos.map(p => porPeriodo.get(p).get(fila.clave)));
    const renderTabla = lista => `<div class="table-wrapper mb-4"><table>
      <thead><tr><th scope="col">Cuenta</th>${periodos.map(p => `<th scope="col" class="text-right">${escapeHTML(p)}</th>`).join('')}</tr></thead>
      <tbody>${lista.map(fila => `<tr class="${fila.subtotal ? 'statement-subtotal' : ''}" data-statement-row="${escapeHTML(fila.clave)}">
        <th scope="row"><span class="statement-label">${etiquetaFilaEstado(fila, { mostrarOrigen: false })}</span></th>${periodos.map(p => {
          const propia = porPeriodo.get(p).get(fila.clave);
          return `<td class="text-right font-mono">${formatCurrencyND(propia?.valor ?? null, monedaDe(datos))}${origenFilaEstado(propia, fila.cuenta)}</td>`;
        }).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    return `<section class="statement-solved"><h3>${titulo}</h3>${renderTabla(visibles)}${desplegableCuentasOpcionales(opcionales, opcionales.length ? renderTabla(opcionales) : '')}</section>`;
  };
  return '<p class="form-hint">Lectura resuelta: los subtotales aparecen junto a sus cuentas. Calculado y reportado distinguen el origen; N/D indica datos faltantes. Los cálculos no añaden cuentas al archivo.</p>' +
    tabla('balanceGeneral', 'Balance general resuelto') + tabla('estadoResultados', 'Estado de resultados resuelto');
}
