// Doble de frontera para probar pantallas sin navegador (mismo enfoque que
// apalancamiento-ui.test.js): cada id="…" del HTML asignado se vuelve un elemento
// consultable con '#id'. Los atributos value="…" no se leen: el test asigna .value.
export function element() {
  const listeners = new Map();
  const children = new Map();
  let html = '';
  return {
    value: '', textContent: '', className: '', checked: false,
    get innerHTML() { return html; },
    set innerHTML(value) {
      html = value;
      children.clear();
      for (const [, id] of value.matchAll(/\bid="([^"]+)"/g)) children.set(`#${id}`, element());
    },
    querySelector(selector) { return children.get(selector) ?? null; },
    // Sin selectores de clase ni de atributo: las pantallas que los usan reciben una lista vacía.
    querySelectorAll() { return []; },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    async dispatchEvent(event) {
      const dispatched = { ...event, target: this, preventDefault() {} };
      for (const handler of listeners.get(event.type) ?? []) await handler.call(this, dispatched);
    }
  };
}

// Asigna los valores de varios campos (por id) de la página.
export function llenar(page, valores) {
  for (const [id, value] of Object.entries(valores)) {
    const el = page.querySelector(`#${id}`);
    if (!el) throw new Error(`No existe #${id}`);
    el.value = String(value);
  }
}

export async function clic(page, id) {
  const el = page.querySelector(`#${id}`);
  if (!el) throw new Error(`No existe #${id}`);
  await el.dispatchEvent({ type: 'click' });
}

export async function enviar(page, id) {
  const el = page.querySelector(`#${id}`);
  if (!el) throw new Error(`No existe #${id}`);
  await el.dispatchEvent({ type: 'submit' });
}

export async function cambiar(page, id, value, type = 'change') {
  const el = page.querySelector(`#${id}`);
  if (!el) throw new Error(`No existe #${id}`);
  el.value = String(value);
  await el.dispatchEvent({ type });
}

export function mensaje(page, id) {
  return page.querySelector(`#${id}`)?.textContent ?? '';
}
