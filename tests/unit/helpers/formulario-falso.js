// Doble de frontera: reconoce controles planos por id, clase y atributo.
// No reproduce jerarquía, estilos ni validación nativa; eso se comprueba en navegador.
export function nodo(attrs = {}, tag = 'div') {
  const listeners = new Map();
  const classes = new Set((attrs.class || '').split(/\s+/));
  let children = [];
  let html = '';
  const matches = (node, selector) => {
    if (selector.startsWith('#')) return node.id === selector.slice(1);
    if (selector.startsWith('.')) return node.classList.contains(selector.slice(1));
    if (selector.startsWith('[')) return Object.hasOwn(node.attrs, selector.slice(1, -1));
    return node.tag === selector.replace(/:not\(\[disabled\]\)/, '');
  };
  return {
    attrs, tag, id: attrs.id, value: attrs.value || '', textContent: '',
    dataset: Object.fromEntries(Object.entries(attrs).filter(([k]) => k.startsWith('data-')).map(([k, v]) => [k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v])),
    classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c) },
    get innerHTML() { return html; },
    set innerHTML(value) {
      html = value;
      children = [...value.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi)].map(([, type, attributes]) => {
        const parsed = Object.fromEntries([...attributes.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(([, key, val]) => [key, val ?? '']));
        return nodo(parsed, type);
      });
    },
    querySelectorAll(selector) { return children.filter(child => selector.split(',').some(s => matches(child, s.trim()))); },
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
    },
    removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
    async dispatchEvent(event) {
      const dispatched = { target: this, preventDefault() {}, ...event };
      for (const handler of [this[`on${event.type}`], ...(listeners.get(event.type) ?? [])]) {
        if (handler) await handler(dispatched);
      }
    },
    focus() { document.activeElement = this; }
  };
}
