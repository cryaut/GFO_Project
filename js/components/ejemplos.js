import { escapeHTML } from '../utils/html.js';
import { listarEjemplos, crearEjemplo } from '../examples/catalogo.js';
const seleccionadas = new WeakMap();

export function panelEjemplos(modulo, boton, { titulo = 'Elegir ejemplo' } = {}) {
  const lista = listarEjemplos(modulo), primero = lista[0];
  if (!primero) return '';
  return `<section class="example-picker" aria-label="${escapeHTML(titulo)}"><h3>${escapeHTML(titulo)}</h3>
    <div class="example-picker-controls"><label for="example-${modulo}">Ejemplo disponible
      <select class="form-select" id="example-${modulo}">${lista.map(e => `<option value="${escapeHTML(e.id)}">${escapeHTML(e.nombre)}</option>`).join('')}</select></label>
      <button type="button" class="btn btn-secondary" id="${escapeHTML(boton)}">Cargar ejemplo seleccionado</button></div>
    <p class="example-picker-source" id="example-info-${modulo}">${escapeHTML(primero.fuente)} · ${escapeHTML(primero.detalle)}</p></section>`;
}

export function vincularEjemplos(page, modulo) {
  const select = page.querySelector(`#example-${modulo}`), info = page.querySelector(`#example-info-${modulo}`);
  if (!select || !info) return;
  const memoria = seleccionadas.get(page) || {};
  seleccionadas.set(page, memoria);
  select.value = memoria[modulo] || 'actual';
  select.onchange = () => {
    memoria[modulo] = select.value;
    const ejemplo = listarEjemplos(modulo).find(e => e.id === select.value);
    info.textContent = ejemplo ? `${ejemplo.fuente} · ${ejemplo.detalle}` : 'Seleccione un ejemplo disponible.';
  };
  select.onchange();
}

export function ejemploSeleccionado(page, modulo, actual) {
  return crearEjemplo(modulo, page.querySelector(`#example-${modulo}`)?.value || 'actual', actual);
}
