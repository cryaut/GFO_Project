import { afterEach, describe, expect, it, vi } from 'vitest';
import { animarEstadisticas, iniciarMovimientoFondo } from '../../js/components/movimiento.js';

const limpiezas = [];
function eventos() {
  const listeners = new Map();
  return {
    addEventListener(tipo, fn) {
      if (!listeners.has(tipo)) listeners.set(tipo, new Set());
      listeners.get(tipo).add(fn);
    },
    removeEventListener(tipo, fn) { listeners.get(tipo)?.delete(fn); },
    emitir(tipo, datos = {}) { [...(listeners.get(tipo) || [])].forEach(fn => fn(datos)); }
  };
}

function navegador({ reducido = false, fino = true, observador = true } = {}) {
  let reloj = 0;
  let siguiente = 0;
  const frames = new Map();
  const reducir = { ...eventos(), matches: reducido };
  const puntero = { ...eventos(), matches: fino };
  const clases = new Set();
  const propiedades = new Map();
  const capas = new Set();
  const body = {
    classList: {
      add: nombre => clases.add(nombre),
      remove: nombre => clases.delete(nombre),
      toggle(nombre, activo) { if (activo) clases.add(nombre); else clases.delete(nombre); }
    },
    style: { setProperty: (k, v) => propiedades.set(k, v), removeProperty: k => propiedades.delete(k) },
    prepend: capa => capas.add(capa)
  };
  const observadores = [];
  class Observador {
    constructor(callback) { this.callback = callback; this.observados = new Set(); observadores.push(this); }
    observe(el) { this.observados.add(el); }
    unobserve(el) { this.observados.delete(el); }
    disconnect() { this.observados.clear(); this.desconectado = true; }
    mostrar(...elementos) { this.callback(elementos.map(target => ({ target, isIntersecting: true }))); }
  }
  const doc = { ...eventos(), body, documentElement: eventos(), hidden: false,
    createElement() { const capa = { setAttribute() {}, remove() { capas.delete(capa); } }; return capa; } };
  const win = { ...eventos(), innerWidth: 1200, innerHeight: 800,
    matchMedia: consulta => consulta.includes('reduced-motion') ? reducir : puntero,
    requestAnimationFrame: callback => { const id = ++siguiente; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id), performance: { now: () => reloj },
    IntersectionObserver: observador ? Observador : undefined };
  vi.stubGlobal('window', win);
  vi.stubGlobal('document', doc);
  return { win, doc, reducir, puntero, clases, propiedades, capas, frames, observadores,
    avanzar(tiempo) { reloj = tiempo; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(tiempo)); } };
}

function tarjeta(valor = 125.5, formato = 'monto', texto = 'C$ 125.50') {
  const elemento = { dataset: { valor: String(valor), formato }, textContent: texto };
  const animacion = { cancel: vi.fn() };
  const card = { animate: vi.fn(() => animacion), querySelector: () => elemento };
  return { card, elemento, animacion };
}
const formatos = { monto: valor => `C$ ${valor.toFixed(2)}`, pct: valor => `${(valor * 100).toFixed(1)}%` };
const pagina = (...cards) => ({ isConnected: true, querySelectorAll: () => cards });
const guardar = limpiar => { if (limpiar) limpiezas.push(limpiar); };

afterEach(() => {
  limpiezas.splice(0).reverse().forEach(fn => fn());
  vi.unstubAllGlobals();
});

describe('fondo reactivo', () => {
  it('agrupa movimientos en un cuadro y detiene el trabajo al alcanzar el cursor', () => {
    const n = navegador();
    guardar(iniciarMovimientoFondo());
    expect(n.clases.has('ambient-motion')).toBe(true);
    expect(n.capas.size).toBe(1);
    n.win.emitir('pointermove', { pointerType: 'mouse', clientX: 100, clientY: 200 });
    n.win.emitir('pointermove', { pointerType: 'mouse', clientX: 400, clientY: 300 });
    expect(n.frames.size).toBe(1);
    for (let t = 0; t < 2000 && n.frames.size; t += 16) n.avanzar(t);
    expect(n.frames.size).toBe(0);
    expect(parseFloat(n.propiedades.get('--ambient-x'))).toBeCloseTo(400, 0);
    expect(n.clases.has('ambient-pointer')).toBe(true);
  });

  it('desactiva el fondo y cancela cuadros al reducir movimiento o esconder la pestaña', () => {
    const n = navegador();
    guardar(iniciarMovimientoFondo());
    n.win.emitir('pointermove', { pointerType: 'mouse', clientX: 100, clientY: 200 });
    n.reducir.matches = true;
    n.reducir.emitir('change');
    expect(n.clases.size).toBe(0);
    expect(n.frames.size).toBe(0);
    n.reducir.matches = false;
    n.reducir.emitir('change');
    expect(n.clases.has('ambient-motion')).toBe(true);
    n.doc.hidden = true;
    n.doc.emitir('visibilitychange');
    expect(n.clases.has('ambient-motion')).toBe(false);
  });

  it('ignora el tacto y permite limpiar o reiniciar sin duplicar la capa', () => {
    const n = navegador({ fino: false });
    iniciarMovimientoFondo();
    const limpiar = iniciarMovimientoFondo();
    n.win.emitir('pointermove', { pointerType: 'touch', clientX: 20, clientY: 40 });
    expect(n.capas.size).toBe(1);
    expect(n.frames.size).toBe(0);
    expect(n.clases.size).toBe(0);
    limpiar();
    expect(n.capas.size).toBe(0);
  });
});

describe('entrada y contadores de estadísticas', () => {
  it('empieza al entrar en vista y termina con la cifra original exacta', () => {
    const n = navegador();
    const { card, elemento } = tarjeta();
    guardar(animarEstadisticas(pagina(card), formatos));
    expect(n.frames.size).toBe(0);
    expect(card.animate).not.toHaveBeenCalled();
    n.observadores[0].mostrar(card);
    n.avanzar(0);
    expect(elemento.textContent).toBe('C$ 0.00');
    n.avanzar(325);
    expect(elemento.textContent).not.toBe('C$ 125.50');
    n.avanzar(700);
    expect(elemento.textContent).toBe('C$ 125.50');
    expect(elemento.dataset.valor).toBe('125.5');
    expect(n.frames.size).toBe(0);
    expect(n.observadores[0].observados.size).toBe(0);
  });

  it('conserva negativos y porcentajes y deja N/D fuera del contador', () => {
    const n = navegador({ observador: false });
    const negativo = tarjeta(-50, 'monto', 'C$ -50.00');
    const porcentaje = tarjeta(0.128, 'pct', '12.8%');
    const nd = { animate: vi.fn(() => ({ cancel() {} })), querySelector: () => null };
    guardar(animarEstadisticas(pagina(negativo.card, porcentaje.card, nd), formatos));
    n.avanzar(1000);
    expect(negativo.elemento.textContent).toBe('C$ -50.00');
    expect(porcentaje.elemento.textContent).toBe('12.8%');
    expect(n.frames.size).toBe(0);
  });

  it('al reducir movimiento durante la entrada restaura cifras y cancela efectos', () => {
    const n = navegador({ observador: false });
    const { card, elemento, animacion } = tarjeta();
    guardar(animarEstadisticas(pagina(card), formatos));
    n.avanzar(100);
    n.reducir.matches = true;
    n.reducir.emitir('change');
    expect(elemento.textContent).toBe('C$ 125.50');
    expect(animacion.cancel).toHaveBeenCalled();
    expect(n.frames.size).toBe(0);
  });

  it('reducir movimiento desde el inicio mantiene el contenido estático', () => {
    const n = navegador({ reducido: true });
    const { card, elemento } = tarjeta();
    animarEstadisticas(pagina(card), formatos);
    expect(elemento.textContent).toBe('C$ 125.50');
    expect(card.animate).not.toHaveBeenCalled();
    expect(n.observadores).toHaveLength(0);
  });

  it('un nuevo render cancela el anterior y un elemento retirado no sigue animándose', () => {
    const n = navegador({ observador: false });
    const { card, elemento, animacion } = tarjeta();
    const page = pagina(card);
    animarEstadisticas(page, formatos);
    n.avanzar(100);
    guardar(animarEstadisticas(page, formatos));
    expect(animacion.cancel).toHaveBeenCalled();
    expect(n.frames.size).toBe(1);
    page.isConnected = false;
    n.avanzar(200);
    expect(elemento.textContent).toBe('C$ 125.50');
    expect(n.frames.size).toBe(0);
  });

  it('sin las APIs de movimiento mantiene la cifra visible y utilizable', () => {
    navegador();
    delete window.matchMedia;
    const { card, elemento } = tarjeta();
    expect(animarEstadisticas(pagina(card), formatos)).toBeUndefined();
    expect(elemento.textContent).toBe('C$ 125.50');
    expect(card.animate).not.toHaveBeenCalled();
  });
});
