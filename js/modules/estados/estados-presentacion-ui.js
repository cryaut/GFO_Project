import { escapeHTML } from '../../utils/html.js';
import { formatCurrencyND } from '../../utils/format.js';
import { estadosResueltos } from './estados-presentacion-calculations.js';

export function origenFilaEstado(fila, cuentaVisible = fila?.cuenta) {
  if (!fila) return '';
  const origen = { calculado: 'Calculado', reportado: 'Reportado', pendiente: 'Faltan datos' }[fila.origen];
  const aviso = fila.motivos?.length && fila.origen === 'reportado' ? ' · Revisar' : '';
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
    return `<section class="statement-solved"><h3>${titulo}</h3><div class="table-wrapper mb-4"><table>
      <thead><tr><th scope="col">Cuenta</th>${periodos.map(p => `<th scope="col" class="text-right">${escapeHTML(p)}</th>`).join('')}</tr></thead>
      <tbody>${ordenadas.map(fila => `<tr class="${fila.subtotal ? 'statement-subtotal' : ''}" data-statement-row="${escapeHTML(fila.clave)}">
        <th scope="row"><span class="statement-label">${etiquetaFilaEstado(fila, { mostrarOrigen: false })}</span></th>${periodos.map(p => {
          const propia = porPeriodo.get(p).get(fila.clave);
          return `<td class="text-right font-mono">${formatCurrencyND(propia?.valor ?? null)}${origenFilaEstado(propia, fila.cuenta)}</td>`;
        }).join('')}</tr>`).join('')}</tbody>
      </table></div></section>`;
  };
  return '<p class="form-hint">Lectura resuelta: los subtotales aparecen junto a sus cuentas. Calculado y reportado distinguen el origen; N/D indica datos faltantes. Los cálculos no añaden cuentas al archivo.</p>' +
    tabla('balanceGeneral', 'Balance general resuelto') + tabla('estadoResultados', 'Estado de resultados resuelto');
}
