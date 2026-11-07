import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND, formatNumberND, formatPercentND } from '../../utils/format.js';

export function tablaDesarrollo(pasos) {
  const formatos = { monto: formatCurrencyND, numero: formatNumberND, pct: formatPercentND };
  const expresion = pasos => pasos.map(t => typeof t === 'string' ? esc(t) : formatos[t.formato](t.valor)).join('');
  return `<div class="table-wrapper desarrollo-table"><table class="statement-table">
    <thead><tr><th scope="col">Concepto<span class="desarrollo-mobile"> y cálculo</span></th><th scope="col" class="desarrollo-col-calculo">Cálculo con los datos guardados</th><th scope="col" class="text-right">Resultado</th></tr></thead>
    <tbody>${pasos.map(p => {
      const calculo = `<span class="desarrollo-formula">${esc(p.formula)}</span><span class="desarrollo-operacion">${expresion(p.expresion)}</span>`;
      return `<tr class="${['utilidadBruta', 'uaii', 'uai', 'utilidadNeta', 'saldoFinal', 'flujoNeto'].includes(p.clave) ? 'desarrollo-total' : ''}">
      <th scope="row">${esc(p.concepto)}<span class="desarrollo-mobile">${calculo}</span></th><td class="desarrollo-col-calculo">${calculo}</td>
      <td class="text-right font-mono">${formatCurrencyND(p.valor)}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}
