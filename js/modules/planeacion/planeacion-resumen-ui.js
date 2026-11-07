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
  return [
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
}

function filasMonetarias(conceptos, valores) {
  return `<div class="table-wrapper"><table class="statement-table">
    <tbody>${conceptos.map((concepto, i) => `<tr><th scope="row">${concepto}</th>
      <td class="text-right font-mono">${monto(valores[i])}</td></tr>`).join('')}</tbody>
  </table></div>`;
}

function faltanDatos(p) {
  return [p.ventas.pendientes, p.compras.pendientes, ...Object.values(p.ventas.totales), ...Object.values(p.compras.totales),
    ...p.costosCompra, ...p.unidadesVendidas, ...p.existencias.flatMap(existencia => Object.values(existencia))
  ].includes(null);
}

// Presenta los resultados que ya calculó Planeación. El periodo y la tarjeta son
// selecciones de consulta y viven en este panel mientras se conserva el escenario.
export function resumenPlaneacionUI(panel, presupuesto, capital) {
  const tarjetas = tarjetasResumen(presupuesto, capital);
  const etiquetas = presupuesto.etiquetas;
  let tarjeta = tarjetas[0];
  let periodo = etiquetas.length - 1;
  panel.innerHTML = `<p class="plan-contexto mb-2">Resultados del presupuesto guardado</p>
    ${capital && faltanDatos(presupuesto) ? '<p class="plan-aviso text-warning mb-2">Hay resultados pendientes. N/D indica qué cifras requieren revisar los supuestos.</p>' : ''}
    <div class="plan-resumen">
      <div class="plan-cuadricula" role="group" aria-label="Consultar una cifra">
        ${tarjetas.map(t => `<button id="planTarjeta${t.id}" type="button" class="kpi-card plan-metrica"
          aria-pressed="${t === tarjeta}" aria-controls="planDetalle">
          <span class="kpi-label">${t.etiqueta}</span><strong class="kpi-value">${monto(t.valor)}</strong>
          <span class="plan-contexto">${t.periodos ? 'Durante el horizonte' : 'Al cierre del horizonte'}</span>
        </button>`).join('')}
      </div>
      <section class="card plan-detalle" id="planDetalle" aria-labelledby="planDetalleTitulo">
        <div class="plan-detalle-cabecera">
          <h2 class="card-title" id="planDetalleTitulo"></h2>
          <label class="plan-detalle-periodo" id="planDetallePeriodo" for="planPeriodoConsulta">Periodo
            <select id="planPeriodoConsulta" class="form-select">
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
    controlPeriodo.hidden = !tarjeta.periodos;
    anuncio.textContent = tarjeta.periodos ? `${tarjeta.titulo} · ${etiquetas[periodo]}` : tarjeta.titulo;
    if (tarjeta.periodos) {
      contenido.innerHTML = filasMonetarias(tarjeta.conceptos, tarjeta.periodos[periodo]);
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
    if (!Number.isInteger(elegido) || elegido < 0 || elegido >= etiquetas.length) return;
    periodo = elegido;
    mostrarDetalle();
  });
  mostrarDetalle();
}
