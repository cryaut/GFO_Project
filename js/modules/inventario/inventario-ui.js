// Pantalla #/inventario: productos, movimientos de entrada y salida, kardex y alertas de reposición.
// El cálculo está en inventario-calculations.js; aquí solo se arma el HTML y se atienden los eventos.
import { escapeHTML as esc } from '../../utils/html.js';
import { formatCurrency, formatNumber } from '../../utils/format.js';
import { fechaHoy, leerNumero, nuevoId } from '../../utils/form.js';
import {
  MAX_TEXTO, calcularInventario, ejemploInventario, kardex, movimientosDeProducto,
  normalizarInventario, validarBorradoMovimiento, validarMovimiento, validarProducto
} from './inventario-calculations.js';

const ETIQUETA_TIPO = { entrada: 'Entrada', salida: 'Salida' };

function cantidad(valor) {
  return formatNumber(valor, Number.isInteger(valor) ? 0 : 2);
}

function textoAlerta(p) {
  const base = `<strong>${esc(p.nombre)}</strong>: existencia ${cantidad(p.existenciaFinal)} ${esc(p.unidad)}, stock mínimo ${cantidad(p.stockMinimo)}.`;
  return p.faltante > 0
    ? `${base} Comprar al menos ${cantidad(p.faltante)} ${esc(p.unidad)} (costo estimado ${formatCurrency(p.costoReposicion)}) para volver al mínimo.`
    : `${base} Llegó al mínimo: programe una compra.`;
}

// opciones: { datos, guardar, graficar?, confirmar?, inventarioContable? }
// guardar lanza un error si no se pudo guardar; la pantalla lo muestra y no cambia nada.
export function inventarioUI(page, opciones) {
  const { guardar, graficar = null, confirmar = () => true, inventarioContable = null } = opciones;
  let datos = normalizarInventario(opciones.datos);
  let seleccionado = datos.productos[0]?.id ?? null;
  let editando = null;

  const campo = id => page.querySelector(`#${id}`)?.value ?? '';
  const numero = (id, vacioComo = null) => {
    const { vacio, valor } = leerNumero(campo(id));
    return vacio ? vacioComo : valor;
  };

  function mensaje(texto, error = false) {
    const el = page.querySelector('#inventarioMensaje');
    if (!el) return;
    el.textContent = texto;
    el.className = error ? 'text-danger' : 'text-muted';
  }

  function persistir(nuevos, texto) {
    try {
      guardar(nuevos);
    } catch (error) {
      mensaje(`No se pudo guardar: ${error.message}. Los datos anteriores no cambiaron.`, true);
      return false;
    }
    datos = nuevos;
    if (!datos.productos.some(p => p.id === seleccionado)) seleccionado = datos.productos[0]?.id ?? null;
    render();
    mensaje(texto);
    return true;
  }

  function seccionKPIs(r) {
    const unidades = new Set(r.productos.map(p => p.unidad));
    const existencia = unidades.size <= 1
      ? `<div class="kpi-value">${cantidad(r.unidadesTotales)}</div><div class="kpi-label">Existencia total${unidades.size ? ` (${esc([...unidades][0])})` : ''}</div>`
      : '<div class="kpi-value">—</div><div class="kpi-label">Existencia en varias unidades</div>';
    return `<div class="kpi-grid mb-6">
      <div class="kpi-card"><div class="kpi-value">${r.productos.length}</div><div class="kpi-label">Productos</div></div>
      <div class="kpi-card"><div class="kpi-value">${formatCurrency(r.valorTotal)}</div><div class="kpi-label">Valor del inventario</div></div>
      <div class="kpi-card">${existencia}</div>
      <div class="kpi-card"><div class="kpi-value ${r.porReponer.length ? 'text-danger' : 'text-success'}">${r.porReponer.length}</div><div class="kpi-label">Productos por reponer</div></div>
    </div>`;
  }

  function seccionAlertas(r) {
    if (!r.porReponer.length) return '';
    return `<div class="card mb-4" style="border-left:4px solid var(--color-danger)">
      <h2 class="card-title">Alertas de reposición</h2>
      <ul>${r.porReponer.map(p => `<li>${textoAlerta(p)}</li>`).join('')}</ul>
      <p class="form-hint">Costo estimado para volver al stock mínimo: ${formatCurrency(r.costoReposicionTotal)}. El presupuesto maestro puede usar estas cantidades para planificar las compras.</p></div>`;
  }

  function formularioProducto() {
    const p = editando ? datos.productos.find(x => x.id === editando) : null;
    const valor = (clave, defecto = '') => esc(p ? p[clave] : defecto);
    return `<form id="formProducto" class="mb-4" novalidate>
      <div class="form-row">
        <div class="form-group"><label class="form-label" for="invNombre">Producto</label>
          <input class="form-input" id="invNombre" maxlength="${MAX_TEXTO}" placeholder="Ej.: Camisa casual" value="${valor('nombre')}"></div>
        <div class="form-group"><label class="form-label" for="invUnidad">Unidad</label>
          <input class="form-input" id="invUnidad" maxlength="${MAX_TEXTO}" value="${valor('unidad', 'unidades')}"></div>
        <div class="form-group"><label class="form-label" for="invInicial">Existencia inicial</label>
          <input class="form-input" id="invInicial" type="number" min="0" step="any" value="${valor('existenciaInicial', '0')}"></div>
        <div class="form-group"><label class="form-label" for="invCosto">Costo unitario (C$)</label>
          <input class="form-input" id="invCosto" type="number" min="0" step="any" value="${valor('costoUnitario')}"></div>
        <div class="form-group"><label class="form-label" for="invMinimo">Stock mínimo</label>
          <input class="form-input" id="invMinimo" type="number" min="0" step="any" value="${valor('stockMinimo', '0')}"></div>
      </div>
      <div class="flex-gap"><button type="submit" class="btn btn-primary">${p ? 'Guardar cambios' : 'Agregar producto'}</button>
        ${p ? '<button type="button" class="btn btn-secondary" id="cancelarEdicion">Cancelar edición</button>' : ''}</div>
    </form>`;
  }

  function tablaProductos(r) {
    if (!r.productos.length) return '<div class="empty-state"><p>Sin productos. Agregue uno o pulse "Cargar ejemplo".</p></div>';
    const filas = r.productos.map((p, k) => `<tr>
      <td style="min-width:9rem">${esc(p.nombre)}<div class="text-muted" style="font-size:var(--font-size-sm)">${esc(p.unidad)}</div></td>
      <td class="text-right font-mono">${cantidad(p.existenciaInicial)}</td>
      <td class="text-right font-mono text-success">${cantidad(p.entradas)}</td>
      <td class="text-right font-mono text-danger">${cantidad(p.salidas)}</td>
      <td class="text-right font-mono font-bold">${cantidad(p.existenciaFinal)}</td>
      <td class="text-right font-mono" style="white-space:nowrap">${formatCurrency(p.costoUnitario)}</td>
      <td class="text-right font-mono" style="white-space:nowrap">${formatCurrency(p.valor)}</td>
      <td class="text-right font-mono">${cantidad(p.stockMinimo)}</td>
      <td>${p.reponer ? '<span class="badge badge-danger">Reponer</span>' : '<span class="badge badge-success">OK</span>'}</td>
      <td><button type="button" class="btn btn-sm btn-secondary" id="verKardex-${k}" aria-label="Ver kardex de ${esc(p.nombre)}">Kardex</button></td>
    </tr>`).join('');
    return `<div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Producto</th><th scope="col" class="text-right">Existencia inicial</th><th scope="col" class="text-right">Entradas</th>
        <th scope="col" class="text-right">Salidas</th><th scope="col" class="text-right">Existencia final</th><th scope="col" class="text-right">Costo unitario</th>
        <th scope="col" class="text-right">Valor</th><th scope="col" class="text-right">Stock mínimo</th><th scope="col">Estado</th><th scope="col"><span class="sr-only">Acciones</span></th></tr></thead>
      <tbody>${filas}
        <tr><td colspan="6"><strong>Total</strong></td><td class="text-right font-mono"><strong>${formatCurrency(r.valorTotal)}</strong></td><td colspan="3"></td></tr></tbody>
    </table></div>`;
  }

  function formularioMovimiento() {
    if (!datos.productos.length) return '<p class="text-muted">Agregue un producto para registrar entradas y salidas.</p>';
    const opcionesProducto = datos.productos.map(p =>
      `<option value="${esc(p.id)}"${p.id === seleccionado ? ' selected' : ''}>${esc(p.nombre)}</option>`).join('');
    return `<form id="formMovimiento" novalidate>
      <div class="form-row">
        <div class="form-group"><label class="form-label" for="movProducto">Producto</label>
          <select class="form-select" id="movProducto">${opcionesProducto}</select></div>
        <div class="form-group"><label class="form-label" for="movTipo">Tipo</label>
          <select class="form-select" id="movTipo"><option value="entrada">Entrada (compra, devolución)</option><option value="salida">Salida (venta, consumo)</option></select></div>
        <div class="form-group"><label class="form-label" for="movCantidad">Cantidad</label>
          <input class="form-input" id="movCantidad" type="number" min="0" step="any"></div>
        <div class="form-group"><label class="form-label" for="movFecha">Fecha</label>
          <input class="form-input" id="movFecha" type="date" value="${fechaHoy()}"></div>
        <div class="form-group"><label class="form-label" for="movConcepto">Concepto</label>
          <input class="form-input" id="movConcepto" maxlength="${MAX_TEXTO}" placeholder="Ej.: Compra a proveedor"></div>
      </div>
      <button type="submit" class="btn btn-primary">Registrar movimiento</button>
    </form>`;
  }

  function seccionKardex() {
    const p = datos.productos.find(x => x.id === seleccionado);
    if (!p) return '';
    const k = kardex(p, movimientosDeProducto(datos, p.id));
    const filas = k.filas.map((m, i) => `<tr>
      <td>${esc(m.fecha)}</td><td>${esc(m.concepto || ETIQUETA_TIPO[m.tipo])}</td>
      <td class="text-right font-mono text-success">${m.tipo === 'entrada' ? cantidad(m.cantidad) : ''}</td>
      <td class="text-right font-mono text-danger">${m.tipo === 'salida' ? cantidad(m.cantidad) : ''}</td>
      <td class="text-right font-mono">${cantidad(m.saldo)}</td>
      <td><button type="button" class="btn btn-sm btn-danger" id="borrarMovimiento-${i}" aria-label="Borrar movimiento del ${esc(m.fecha)}">&times;</button></td>
    </tr>`).join('');
    return `<div class="card mb-4"><h2 class="card-title">3. Kardex de ${esc(p.nombre)} (${esc(p.unidad)})</h2>
      <div class="flex-gap flex-wrap mb-4">
        <button type="button" class="btn btn-sm btn-secondary" id="editarProducto">Editar producto</button>
        <button type="button" class="btn btn-sm btn-danger" id="borrarProducto">Eliminar producto</button></div>
      <div class="table-wrapper"><table class="statement-table">
        <thead><tr><th scope="col">Fecha</th><th scope="col">Concepto</th><th scope="col" class="text-right">Entrada</th>
          <th scope="col" class="text-right">Salida</th><th scope="col" class="text-right">Saldo</th><th scope="col"><span class="sr-only">Acciones</span></th></tr></thead>
        <tbody><tr><td>—</td><td>Existencia inicial</td><td></td><td></td><td class="text-right font-mono">${cantidad(p.existenciaInicial)}</td><td></td></tr>
          ${filas}
          <tr><td colspan="2"><strong>Totales y existencia final</strong></td><td class="text-right font-mono">${cantidad(k.entradas)}</td>
            <td class="text-right font-mono">${cantidad(k.salidas)}</td><td class="text-right font-mono"><strong>${cantidad(k.saldoFinal)}</strong></td><td></td></tr></tbody>
      </table></div>
      <p class="form-hint">Existencia final = ${cantidad(p.existenciaInicial)} + ${cantidad(k.entradas)} − ${cantidad(k.salidas)} = ${cantidad(k.saldoFinal)} ${esc(p.unidad)}.
        Valor = ${cantidad(k.saldoFinal)} × ${formatCurrency(p.costoUnitario)} = ${formatCurrency(k.saldoFinal * p.costoUnitario)}.</p></div>`;
  }

  function render() {
    const r = calcularInventario(datos);
    const contable = inventarioContable
      ? `<p class="form-hint">Inventario en el Balance General ${esc(inventarioContable.periodo)}: ${formatCurrency(inventarioContable.valor)}. Este módulo controla existencias por producto; su valor puede diferir del saldo contable.</p>`
      : '';
    page.innerHTML = `<div class="page-header"><h1 class="page-title">Control de Inventario</h1>
        <p class="page-subtitle">Existencias, valor del inventario y alertas de reposición por producto.</p></div>
      <p id="inventarioMensaje" role="status" aria-live="polite" class="text-muted">Registre productos y sus movimientos de entrada y salida.</p>
      <div class="flex-gap flex-wrap mb-4">
        <button type="button" class="btn btn-secondary" id="invEjemplo">Cargar ejemplo</button>
        ${datos.productos.length ? '<button type="button" class="btn btn-danger" id="invVaciar">Borrar inventario</button>' : ''}
      </div>
      ${seccionKPIs(r)}
      ${seccionAlertas(r)}
      <div class="card mb-4"><h2 class="card-title">1. Productos</h2>${formularioProducto()}${tablaProductos(r)}${contable}</div>
      <div class="card mb-4"><h2 class="card-title">2. Registrar movimiento</h2>${formularioMovimiento()}</div>
      ${seccionKardex()}
      ${r.productos.length ? `<div class="card mb-4"><h2 class="card-title">Existencia final y stock mínimo</h2>
        <div style="height:280px"><canvas id="inventarioChart" role="img" aria-label="Barras de existencia final y stock mínimo por producto"></canvas></div></div>` : ''}
      <div class="card mb-4"><h2 class="card-title">Fórmulas y lectura</h2><ul>
        <li><strong>Existencia final</strong> = existencia inicial + entradas − salidas (unidades).</li>
        <li><strong>Valor del inventario</strong> = existencia final × costo unitario (C$).</li>
        <li><strong>Alerta de reposición</strong>: la existencia final es menor o igual al stock mínimo; se sugiere comprar lo que falta para volver al mínimo.</li></ul>
        <p class="text-muted">Una alerta indica que conviene comprar antes de quedarse sin existencias. El valor muestra cuánto dinero está invertido en mercadería.</p></div>`;
    bind(r);
    if (graficar && r.productos.length) {
      graficar('inventarioChart', {
        type: 'bar',
        data: {
          labels: r.productos.map(p => p.nombre),
          datasets: [
            { label: 'Existencia final', data: r.productos.map(p => p.existenciaFinal), backgroundColor: '#2563eb' },
            { label: 'Stock mínimo', data: r.productos.map(p => p.stockMinimo), backgroundColor: '#d97706' }
          ]
        },
        options: { plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
      });
    }
  }

  function bind(r) {
    page.querySelector('#invEjemplo')?.addEventListener('click', () => {
      if (datos.productos.length && !confirmar('¿Reemplazar el inventario actual por el ejemplo?')) return;
      const ejemplo = normalizarInventario(ejemploInventario());
      seleccionado = ejemplo.productos[0].id;
      editando = null;
      persistir(ejemplo, 'Ejemplo cargado: 4 productos y 8 movimientos de enero de 2025 (datos ficticios).');
    });
    page.querySelector('#invVaciar')?.addEventListener('click', () => {
      if (!confirmar('¿Borrar todos los productos y movimientos?')) return;
      editando = null;
      persistir({ productos: [], movimientos: [] }, 'Inventario borrado.');
    });
    page.querySelector('#formProducto')?.addEventListener('submit', event => {
      event.preventDefault();
      const producto = {
        id: editando || nuevoId('prod'),
        nombre: campo('invNombre').trim(),
        unidad: campo('invUnidad').trim() || 'unidades',
        existenciaInicial: numero('invInicial', 0),
        costoUnitario: numero('invCosto'),
        stockMinimo: numero('invMinimo', 0)
      };
      const errores = validarProducto(datos, producto, editando);
      if (errores.length) { mensaje(errores.join(' '), true); return; }
      const productos = editando
        ? datos.productos.map(p => (p.id === editando ? producto : p))
        : [...datos.productos, producto];
      const texto = editando ? `Producto ${producto.nombre} actualizado.` : `Producto ${producto.nombre} agregado.`;
      editando = null;
      seleccionado = producto.id;
      persistir({ ...datos, productos }, texto);
    });
    page.querySelector('#cancelarEdicion')?.addEventListener('click', () => {
      editando = null;
      render();
    });
    r.productos.forEach((p, k) => {
      page.querySelector(`#verKardex-${k}`)?.addEventListener('click', () => {
        seleccionado = p.id;
        render();
      });
    });
    const elegido = r.productos.find(p => p.id === seleccionado);
    page.querySelector('#editarProducto')?.addEventListener('click', () => {
      editando = elegido.id;
      render();
      mensaje(`Editando ${elegido.nombre}. Cambie los datos y pulse Guardar cambios.`);
    });
    page.querySelector('#borrarProducto')?.addEventListener('click', () => {
      if (!confirmar(`¿Eliminar ${elegido.nombre} y sus ${elegido.cantidadMovimientos} movimientos?`)) return;
      if (editando === elegido.id) editando = null;
      persistir({
        productos: datos.productos.filter(x => x.id !== elegido.id),
        movimientos: datos.movimientos.filter(m => m.productoId !== elegido.id)
      }, `Producto ${elegido.nombre} eliminado.`);
    });
    page.querySelector('#formMovimiento')?.addEventListener('submit', event => {
      event.preventDefault();
      const movimiento = {
        id: nuevoId('mov'),
        productoId: campo('movProducto'),
        tipo: campo('movTipo'),
        cantidad: numero('movCantidad'),
        fecha: campo('movFecha'),
        concepto: campo('movConcepto').trim()
      };
      const errores = validarMovimiento(datos, movimiento);
      if (errores.length) { mensaje(errores.join(' '), true); return; }
      seleccionado = movimiento.productoId;
      const producto = datos.productos.find(p => p.id === movimiento.productoId);
      persistir({ ...datos, movimientos: [...datos.movimientos, movimiento] },
        `${ETIQUETA_TIPO[movimiento.tipo]} de ${cantidad(movimiento.cantidad)} ${producto.unidad} registrada para ${producto.nombre}.`);
    });
    const actual = datos.productos.find(p => p.id === seleccionado);
    if (actual) {
      kardex(actual, movimientosDeProducto(datos, actual.id)).filas.forEach((m, i) => {
        page.querySelector(`#borrarMovimiento-${i}`)?.addEventListener('click', () => {
          const errores = validarBorradoMovimiento(datos, m.id);
          if (errores.length) { mensaje(errores.join(' '), true); return; }
          if (!confirmar(`¿Borrar la ${ETIQUETA_TIPO[m.tipo].toLowerCase()} de ${cantidad(m.cantidad)} del ${m.fecha}?`)) return;
          persistir({ ...datos, movimientos: datos.movimientos.filter(x => x.id !== m.id) }, 'Movimiento borrado.');
        });
      });
    }
  }

  render();
}
