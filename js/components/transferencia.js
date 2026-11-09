import { escapeHTML as esc } from '../utils/html.js';
import { formatCurrencyND, formatNumberND } from '../utils/format.js';
import { fichaTransferencia, filaTransferible, firmaTransferencia } from '../utils/transferencias.js';

const ORIGENES = { estados: 'Estados Financieros', inventario: 'Inventario', planeacion: 'Planeación' };
const CAMPOS = {
  saldoInicial: 'Saldo inicial', saldoInicialCaja: 'Efectivo inicial',
  cxcInicial: 'Cuentas por cobrar iniciales', cxpInicial: 'Cuentas por pagar iniciales',
  inventarioInicial: 'Inventario inicial', costoUnitario: 'Costo unitario de compra',
  precio: 'Precio de venta unitario', costoVariableUnitario: 'Costo variable unitario',
  costosFijos: 'Costos fijos del periodo', unidades: 'Unidades previstas'
};

export function panelTransferencia(id, controles, nota = '') {
  return `<details class="card mb-4">
    <summary>Traer datos de otra sección</summary>
    ${nota ? `<p class="form-hint">${esc(nota)}</p>` : ''}
    <div class="flex-gap flex-wrap mb-2">${controles}</div>
    <div id="${id}VistaPrevia" aria-live="polite"></div>
  </details>`;
}

export function rotuloOrigen(dato) {
  return [ORIGENES[dato.origen], dato.caso, dato.periodo, dato.escenario].filter(Boolean).join(' · ');
}

function tablaPrevia(id, prevista, textoAplicar) {
  const { origen, filas, error } = prevista;
  const filasHTML = filas.map(fila => {
    const habilitada = !error && filaTransferible(fila);
    const moneda = fila.unidad.split('/')[0];
    const formato = fila.monetario ? valor => formatCurrencyND(valor, moneda) : formatNumberND;
    return `<tr><td><label><input type="checkbox" id="${id}Campo-${fila.campo}"${habilitada ? ' checked' : ' disabled'}> ${esc(fila.etiqueta)}</label></td>
      <td>${esc(fila.etiquetaOrigen)}</td><td>${esc(formato(fila.actual))}</td><td>${esc(formato(fila.valor))}</td>
      <td>${esc(fila.unidad)}</td><td>${esc(fila.naturaleza)} · ${esc(fila.modo)}${fila.motivo ? ` · ${esc(fila.motivo)}` : ''}</td></tr>`;
  }).join('');
  return `<p class="form-hint">${esc(rotuloOrigen(origen))}</p>
    ${error ? `<p class="text-danger">${esc(error)}</p>` : ''}
    ${filasHTML ? `<div class="table-wrapper"><table class="statement-table">
      <thead><tr><th scope="col">Campo destino</th><th scope="col">Dato de origen</th><th scope="col">Actual</th>
        <th scope="col">Propuesto</th><th scope="col">Unidad</th><th scope="col">Procedencia</th></tr></thead>
      <tbody>${filasHTML}</tbody></table></div>` : ''}
    <div class="flex-gap flex-wrap">
      <button type="button" class="btn btn-primary" id="${id}Aplicar"${error || !filas.some(filaTransferible) ? ' disabled' : ''}>${esc(textoAplicar)}</button>
      <button type="button" class="btn btn-secondary" id="${id}Cancelar">Cancelar</button>
    </div>`;
}

export function vincularTransferencia(page, { id, fuentes, aplicar, confirmar, mensaje, textoAplicar }) {
  const panel = page.querySelector(`#${id}VistaPrevia`);
  if (!panel) return;
  for (const [botonId, leer] of Object.entries(fuentes)) {
    const boton = page.querySelector(`#${botonId}`);
    boton?.addEventListener('click', () => {
      const prevista = leer();
      const firma = firmaTransferencia(prevista);
      panel.innerHTML = tablaPrevia(id, prevista, textoAplicar);
      panel.querySelector(`#${id}Cancelar`)?.addEventListener('click', () => {
        panel.innerHTML = '';
        boton.focus();
      });
      panel.querySelector(`#${id}Aplicar`)?.addEventListener('click', () => {
        if (prevista.error) return;
        const elegidas = prevista.filas.filter(fila => filaTransferible(fila)
          && panel.querySelector(`#${id}Campo-${fila.campo}`)?.checked);
        if (!elegidas.length) { mensaje('Seleccione al menos un importe disponible.', true); return; }
        if (firmaTransferencia(leer()) !== firma) {
          mensaje('Cambió la fuente o el destino. Abra una nueva vista previa para revisar los importes.', true);
          return;
        }
        const reemplazos = elegidas.filter(fila => fila.actual !== null && fila.actual !== undefined && fila.actual !== fila.valor);
        if (reemplazos.length && !confirmar(`¿Reemplazar ${reemplazos.map(fila => fila.etiqueta).join(', ')} con los datos de ${rotuloOrigen(prevista.origen)}?`)) return;
        if (firmaTransferencia(leer()) !== firma) {
          mensaje('Cambió la fuente o el destino. Abra una nueva vista previa para revisar los importes.', true);
          return;
        }
        const procedencia = Object.fromEntries(elegidas.map(fila =>
          [fila.campo, fichaTransferencia(prevista.origen, fila)]));
        aplicar(elegidas, procedencia, prevista.origen);
      });
      if (prevista.error) mensaje(prevista.error, true);
      else if (!prevista.filas.some(filaTransferible)) mensaje('No hay importes disponibles en la fuente (N/D).', true);
      panel.querySelector(`#${id}Cancelar`)?.focus();
    });
  }
}

export function mostrarProcedencia(procedencia, vigente) {
  const datos = Object.entries(procedencia);
  if (!datos.length) return '';
  return `<details class="mb-2"><summary>Procedencia de los datos traídos</summary><ul>${datos.map(([campo, dato]) =>
    `<li>${esc(CAMPOS[campo] ?? campo)} · ${esc(rotuloOrigen(dato))} · ${esc(dato.naturaleza)} · ${esc(dato.modo)} · ${esc(dato.unidad)}
      ${vigente(dato) ? '' : '<strong class="text-warning">La fuente cambió o ya no está disponible. Revise una vista previa para actualizar la copia.</strong>'}</li>`
  ).join('')}</ul></details>`;
}
