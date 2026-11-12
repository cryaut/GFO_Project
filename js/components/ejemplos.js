import { escapeHTML } from '../utils/html.js';
import { listarEjemplos, crearEjemplo, casoDeEjemplo } from '../examples/catalogo.js';
import { esEjemploPersonalDefensa, cargarDocumentosDefensa } from '../examples/ejemplos-personales-defensa.js';
import store from '../store.js';
import { registrarCasos } from '../utils/casos.js';
const seleccionadas = new WeakMap();
// Selector de cada pantalla → módulo del store que escribe (para el registro de casos, D-113).
const CLAVE_STORE = { estados: 'estados', flujo: 'flujo', equilibrio: 'equilibrio', planeacion: 'planeacion', inventario: 'inventario', mercado: 'razonesMercado' };

const opcion = e => `<option value="${escapeHTML(e.id)}">${escapeHTML(e.nombre)}</option>`;

// D-113: si la lista tiene un grupo (AGRI-CORP), sus opciones van en ese grupo y las demás en «Otros ejemplos».
function opciones(lista) {
  if (!lista.some(e => e.grupo)) return lista.map(opcion).join('');
  const grupos = [...new Set(lista.map(e => e.grupo || 'Otros ejemplos'))];
  return grupos.map(g => `<optgroup label="${escapeHTML(g)}">${lista.filter(e => (e.grupo || 'Otros ejemplos') === g).map(opcion).join('')}</optgroup>`).join('');
}

export function panelEjemplos(modulo, boton, { titulo = 'Elegir ejemplo' } = {}) {
  const lista = listarEjemplos(modulo), primero = lista[0];
  if (!primero) return '';
  return `<section class="example-picker" aria-label="${escapeHTML(titulo)}"><h3>${escapeHTML(titulo)}</h3>
    <div class="example-picker-controls"><label for="example-${modulo}">Ejemplo disponible
      <select class="form-select" id="example-${modulo}">${opciones(lista)}</select></label>
      <button type="button" class="btn btn-secondary" id="${escapeHTML(boton)}">Cargar ejemplo seleccionado</button></div>
    <p class="example-picker-source" id="example-info-${modulo}">${escapeHTML(primero.fuente)} · ${escapeHTML(primero.detalle)}</p></section>`;
}

export function vincularEjemplos(page, modulo) {
  const select = page.querySelector(`#example-${modulo}`), info = page.querySelector(`#example-info-${modulo}`);
  if (!select || !info) return;
  const memoria = seleccionadas.get(page) || {};
  seleccionadas.set(page, memoria);
  // El primero de la lista (AGRI-CORP en las pantallas de empresa) queda preseleccionado.
  select.value = memoria[modulo] || listarEjemplos(modulo)[0]?.id || 'actual';
  select.onchange = () => {
    memoria[modulo] = select.value;
    const ejemplo = listarEjemplos(modulo).find(e => e.id === select.value);
    info.textContent = ejemplo ? `${ejemplo.fuente} · ${ejemplo.detalle}` : 'Seleccione un ejemplo disponible.';
  };
  select.onchange();
}

// Los archivos de los integrantes se descargan al elegirlos; los demás ejemplos no esperan nada.
export async function prepararEjemplo(page, modulo) {
  const id = page.querySelector(`#example-${modulo}`)?.value;
  if (esEjemploPersonalDefensa(modulo, id)) await cargarDocumentosDefensa();
}

export function ejemploSeleccionado(page, modulo, actual) {
  const id = page.querySelector(`#example-${modulo}`)?.value || listarEjemplos(modulo)[0]?.id || 'actual';
  const datos = crearEjemplo(modulo, id, actual);
  // La pantalla guarda el ejemplo justo después; el caso se registra solo si el módulo cambió.
  const clave = CLAVE_STORE[modulo], caso = casoDeEjemplo(modulo, id);
  if (clave && caso) {
    const antes = JSON.stringify(store.get(clave));
    queueMicrotask(() => { if (JSON.stringify(store.get(clave)) !== antes) registrarCasos({ [clave]: caso }); });
  }
  return datos;
}
