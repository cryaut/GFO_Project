import { identificarCuenta, listarCuentas, resumenIdentificacion } from './cuentas-identificador.js';
import { normalizarCuenta } from './cuentas-similitud.js';
import { registrarCuenta } from './cuentas-registro.js';
import { escapeHTML as esc } from '../../utils/html.js';

const ESTADOS = { reconocida: 'Reconocida', sugerida: 'Sugerida: requiere confirmación', no_reconocida: 'No reconocida: seleccione una cuenta' };

export function selectorCuenta(contenedor, nombre, grupo, clasificacion = '') {
  const resultado = identificarCuenta(nombre, { grupo, clasificacion });
  const todas = listarCuentas({ grupo });
  const sugeridas = resultado.candidatos.map(candidato => todas.find(cuenta => cuenta.id === candidato.id)).filter(Boolean);
  const cuentas = resultado.estado === 'sugerida' && sugeridas.length ? sugeridas : todas;
  contenedor.innerHTML = `<p role="status">${ESTADOS[resultado.estado]}${resultado.id ? ` — ${esc(resultado.id)}` : ''}</p>
    ${resultado.estado === 'reconocida' ? `<input type="hidden" name="idCuenta" value="${esc(resultado.id)}">` : `
    <label>Filtrar catálogo <input class="form-input" data-filter aria-label="Filtrar cuentas del catálogo"></label>
    <label>Cuenta del catálogo <select class="form-select" name="idCuenta" required aria-label="Cuenta del catálogo">
      <option value="">Seleccionar…</option>${cuentas.map(cuenta => `<option value="${esc(cuenta.id)}" ${resultado.preseleccion === cuenta.id ? 'selected' : ''}>${esc(cuenta.nombreCanonico)} — ${esc(cuenta.id)}</option>`).join('')}
    </select></label><p>Confirme la selección para asignar el identificador.</p>`}`;
  const filtro = contenedor.querySelector('[data-filter]');
  const seleccion = contenedor.querySelector('select');
  if (filtro && seleccion) filtro.oninput = () => {
    const texto = normalizarCuenta(filtro.value);
    seleccion.innerHTML = '<option value="">Seleccionar…</option>' + todas.filter(cuenta =>
      normalizarCuenta(`${cuenta.nombreCanonico} ${cuenta.id} ${cuenta.sinonimos.join(' ')}`).includes(texto))
      .map(cuenta => `<option value="${esc(cuenta.id)}">${esc(cuenta.nombreCanonico)} — ${esc(cuenta.id)}</option>`).join('');
  };
  return resultado;
}

export function renderRevisionCuentas(contenedor, datos, cambiar, fallo) {
  const resumen = resumenIdentificacion(datos);
  const filas = Object.entries(datos.accountIdentities || {}).flatMap(([grupo, identidades]) =>
    Object.entries(identidades).filter(([, identidad]) => identidad.estado !== 'reconocida')
      .map(([nombre, identidad]) => ({ nombre, grupo, identidad })));
  (datos.pendingAccounts || []).forEach((fila, indice) => filas.push({ nombre: fila.nombre, grupo: '', identidad: fila.identificacion, indice }));
  contenedor.innerHTML = `<section class="card mb-4"><h2>Identificación de cuentas</h2>
    <p>${resumen.reconocida} reconocidas · ${resumen.sugerida} sugeridas · ${resumen.no_reconocida} no reconocidas.</p>
    ${filas.length ? '<p>Las cuentas pendientes se conservan. Sus montos siguen visibles; los cálculos afectados quedan en N/D hasta confirmar. Los datos anteriores conservan su clasificación.</p>' : '<p>Todas las cuentas tienen identificador.</p>'}
    ${filas.map((fila, i) => `<form data-review="${i}" class="mb-4"><h3>${esc(fila.nombre)}</h3><div data-selector></div>
      <button class="btn btn-secondary" type="submit">Confirmar cuenta</button></form>`).join('')}
    ${datos.reportedTotals ? '<p>Los totales reportados sin tipo equivalente se conservan para la API por identificador; no se suman a los componentes.</p>' : ''}
    </section>`;
  contenedor.querySelectorAll('[data-review]').forEach(formulario => {
    const fila = filas[Number(formulario.dataset.review)];
    selectorCuenta(formulario.querySelector('[data-selector]'), fila.nombre, fila.grupo);
    formulario.onsubmit = evento => {
      evento.preventDefault();
      try {
        const id = new FormData(formulario).get('idCuenta');
        if (!id) throw new Error('Seleccione una cuenta del catálogo antes de confirmar.');
        const base = structuredClone(datos);
        const importes = fila.indice !== undefined ? base.pendingAccounts.splice(fila.indice, 1)[0].importes
          : Object.fromEntries(base.periods.flatMap(periodo => {
            const cuentas = fila.grupo === 'estadoResultados' ? base.estadoResultados[periodo]
              : fila.grupo === 'suplementario' ? base.supplementaryAccounts?.[periodo] : base.balanceGeneral[periodo][fila.grupo];
            return Object.hasOwn(cuentas || {}, fila.nombre) ? [[periodo, cuentas[fila.nombre]]] : [];
          }));
        cambiar(registrarCuenta(base, Object.entries(importes).map(([periodo, importe]) => ({
          nombre: fila.nombre, grupo: fila.grupo, periodo, importe, id, confirmado: true, reemplazar: true, origen: 'manual' }))));
      } catch (error) { fallo(error.message); }
    };
  });
}
