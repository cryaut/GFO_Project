import { desarrolloPresupuesto } from './planeacion-desarrollo-calculations.js';
import { tablaDesarrollo } from './planeacion-desarrollo-ui.js';
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrencyND as monto } from '../../utils/format.js';

export function detalleVencimientos(pendientes) {
  if (pendientes === null) return '<p>N/D. Revise los supuestos y calendarios pendientes.</p>';
  if (!pendientes.length) return '<p>Sin vencimientos posteriores.</p>';
  return `<div class="table-wrapper"><table class="statement-table">
    <thead><tr><th scope="col">Mes de origen</th><th scope="col">Vence</th><th scope="col" class="text-right">Importe</th></tr></thead>
    <tbody>${pendientes.map(({ origen, vence, importe }) =>
    `<tr><td>${esc(origen)}</td><td>${esc(vence)}</td><td class="text-right font-mono">${monto(importe)}</td></tr>`).join('')}</tbody>
  </table></div>`;
}

function tarjetasResumen(p, capital) {
  const cobros = capital
    ? p.ventas.meses.map(mes => [mes.contado, mes.liquidado, mes.total])
    : p.etiquetas.map((_, i) => [p.ventas.contado[i], p.ventas.cobroAnterior[i], p.ventas.cobros[i]]);
  const pagos = capital
    ? p.compras.meses.map(mes => [mes.contado, mes.liquidado, mes.total])
    : p.etiquetas.map((_, i) => [p.compras.pagoContado[i], p.compras.pagoAnterior[i], p.compras.pagos[i]]);
  const basicas = [
    {
      id: 'Cobros', etiqueta: 'Cobros', titulo: 'Cobros del periodo', periodos: cobros,
      conceptos: ['Ventas al contado', 'Cobros de cuentas por cobrar', 'Total cobrado'],
      valor: capital ? p.ventas.totales.total : p.totales.cobros
    },
    {
      id: 'Pagos', etiqueta: 'Pagos a proveedores', titulo: 'Pagos del periodo', periodos: pagos,
      conceptos: ['Compras al contado', 'Pagos de cuentas por pagar', 'Total pagado'],
      valor: capital ? p.compras.totales.total : p.totales.pagosProveedores
    },
    {
      id: 'CxC', etiqueta: 'Cuentas por cobrar', titulo: 'Cobros pendientes',
      valor: capital ? p.ventas.meses.at(-1).cierre : p.cierre.cxc,
      pendientes: capital ? p.ventas.pendientes : undefined
    },
    {
      id: 'CxP', etiqueta: 'Cuentas por pagar', titulo: 'Pagos pendientes',
      valor: capital ? p.compras.meses.at(-1).cierre : p.cierre.cxp,
      pendientes: capital ? p.compras.pendientes : undefined
    }
  ];
  if (capital) {
    const { meses, costoVentasTotal } = p.valoracion;
    return [
      ...basicas,
      {
        id: 'CostoVentas', etiqueta: 'Costo de ventas', titulo: 'Costo de ventas del mes',
        periodos: meses.map(mes => [mes.costoVentas]), conceptos: ['Costo de ventas'], valor: costoVentasTotal
      },
      {
        id: 'Inventario', etiqueta: 'Inventario valorizado', titulo: 'Inventario valorizado al cierre del mes',
        periodos: meses.map(mes => [mes.final]), conceptos: ['Inventario final valorizado'], valor: meses.at(-1).final,
        alcance: 'Al cierre del horizonte'
      }
    ];
  }
  return [
    { id: 'Resultado', etiqueta: 'Utilidad neta presupuestada', titulo: 'Estado de resultados presupuestado', valor: p.totales.utilidadNeta, desarrollo: 'resultados' },
    { id: 'Caja', etiqueta: 'Efectivo final antes de financiamiento', titulo: 'Presupuesto de caja', valor: p.cierre.efectivo, desarrollo: 'caja' },
    ...basicas
  ];
}

function filasMonetarias(conceptos, valores) {
  return `<div class="table-wrapper"><table class="statement-table">
    <tbody>${conceptos.map((concepto, i) => `<tr><th scope="row">${concepto}</th>
      <td class="text-right font-mono">${monto(valores[i])}</td></tr>${i === conceptos.length - 1 && valores.length > 1 ? `<tr><td colspan="2" class="desarrollo-operacion">${valores.slice(0, -1).map(monto).join(' + ')} = ${monto(valores[i])}</td></tr>` : ''}`).join('')}</tbody>
  </table></div>`;
}

function faltanDatos(p) {
  return [p.ventas.pendientes, p.compras.pendientes, ...Object.values(p.ventas.totales), ...Object.values(p.compras.totales),
    ...p.costosCompra, ...p.unidadesVendidas, ...p.existencias.flatMap(existencia => Object.values(existencia)),
    p.valoracion.costoVentasTotal, ...p.valoracion.meses.flatMap(mes => Object.values(mes))
  ].includes(null);
}

// Presenta los resultados que ya calculó Planeación. El periodo y la tarjeta son
// selecciones de consulta y viven en este panel mientras se conserva el escenario.
export function resumenPlaneacionUI(panel, presupuesto, capital) {
  const tarjetas = tarjetasResumen(presupuesto, capital);
  const etiquetas = presupuesto.etiquetas;
  let tarjeta = tarjetas[0];
  let periodo = capital ? etiquetas.length - 1 : -1;
  panel.innerHTML = `<p class="plan-contexto mb-2">Resultados del presupuesto guardado</p>
    ${capital ? '<section class="plan-alcance"><h2>Capital de trabajo · cálculo parcial</h2><p>Consulta las ventas, el inventario físico y valorizado, el costo de ventas, las compras, los cobros y los pagos a proveedores.</p><p><strong>El estado de resultados y el presupuesto de caja completos siguen pendientes.</strong> La caja completa también requiere gastos, inversión, deuda, impuestos y dividendos.</p></section>' : '<p class="plan-alcance">Seleccione <strong>Utilidad neta</strong> o <strong>Efectivo final</strong> para ver cada operación y su resultado. El IR se devenga por periodo y queda por pagar; el financiamiento requerido se informa antes de contratarlo.</p>'}
    ${capital && faltanDatos(presupuesto) ? '<p class="plan-aviso text-warning mb-2">Hay resultados pendientes. N/D indica qué cifras requieren revisar los supuestos.</p>' : ''}
    <div class="plan-resumen">
      <div class="plan-cuadricula" role="group" aria-label="Consultar una cifra">
        ${tarjetas.map(t => `<button id="planTarjeta${t.id}" type="button" class="kpi-card plan-metrica"
          aria-pressed="${t === tarjeta}" aria-controls="planDetalle">
          <span class="kpi-label">${t.etiqueta}</span><strong class="kpi-value">${monto(t.valor)}</strong>
          <span class="plan-contexto">${t.alcance ?? (t.periodos || t.desarrollo === 'resultados' ? 'Durante el horizonte' : 'Al cierre del horizonte')}</span>
        </button>`).join('')}
      </div>
      <section class="card plan-detalle" id="planDetalle" aria-labelledby="planDetalleTitulo">
        <div class="plan-detalle-cabecera">
          <h2 class="card-title" id="planDetalleTitulo"></h2>
          <label class="plan-detalle-periodo" id="planDetallePeriodo" for="planPeriodoConsulta">Periodo
            <select id="planPeriodoConsulta" class="form-select">
              ${capital ? '' : '<option value="-1" selected>Horizonte completo</option>'}
              ${etiquetas.map((etiqueta, i) => `<option value="${i}"${i === periodo ? ' selected' : ''}>${esc(etiqueta)}</option>`).join('')}
            </select>
          </label>
        </div>
        <p id="planDetalleAnuncio" class="sr-only" role="status"></p>
        <div id="planDetalleContenido"></div>
      </section>
    </div>`;

  const titulo = panel.querySelector('#planDetalleTitulo');
  const controlPeriodo = panel.querySelector('#planDetallePeriodo');
  const selector = panel.querySelector('#planPeriodoConsulta');
  const anuncio = panel.querySelector('#planDetalleAnuncio');
  const contenido = panel.querySelector('#planDetalleContenido');
  const botones = tarjetas.map(t => panel.querySelector(`#planTarjeta${t.id}`));

  function mostrarDetalle() {
    titulo.textContent = tarjeta.titulo;
    controlPeriodo.hidden = !tarjeta.periodos && !tarjeta.desarrollo;
    anuncio.textContent = tarjeta.periodos || tarjeta.desarrollo ? `${tarjeta.titulo} · ${periodo < 0 ? 'Horizonte completo' : etiquetas[periodo]}` : tarjeta.titulo;
    if (tarjeta.desarrollo) {
      const traza = desarrolloPresupuesto(presupuesto, periodo < 0 ? null : periodo);
      contenido.innerHTML = `<p class="plan-contexto">${esc(traza.etiqueta)}</p>` + tablaDesarrollo(traza[tarjeta.desarrollo]);
    } else if (tarjeta.periodos) {
      const valores = periodo < 0 ? tarjeta.periodos[0].map((_, i) => tarjeta.periodos.every(f => typeof f[i] === 'number' && Number.isFinite(f[i]))
        ? tarjeta.periodos.reduce((total, f) => total + f[i], 0) : null) : tarjeta.periodos[periodo];
      contenido.innerHTML = filasMonetarias(tarjeta.conceptos, valores);
    } else if (capital) {
      contenido.innerHTML = detalleVencimientos(tarjeta.pendientes);
    } else {
      contenido.innerHTML = filasMonetarias(['Saldo previsto para el periodo siguiente'], [tarjeta.valor]);
    }
  }
  botones.forEach((boton, i) => boton.addEventListener('click', () => {
    tarjeta = tarjetas[i];
    botones.forEach((elemento, j) => elemento.setAttribute('aria-pressed', String(i === j)));
    mostrarDetalle();
  }));
  selector.addEventListener('change', event => {
    const elegido = Number(event.target.value);
    if (!Number.isInteger(elegido) || (elegido < 0 && (capital || elegido !== -1)) || elegido >= etiquetas.length) return;
    periodo = elegido;
    mostrarDetalle();
  });
  mostrarDetalle();
}
