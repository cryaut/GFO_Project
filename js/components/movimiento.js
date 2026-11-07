// Solo presentación: las cifras finales y sus formatos llegan de cada pantalla.
const fondos = new WeakMap();
const estadisticas = new WeakMap();
const consultas = new WeakMap();
const consultaReducir = '(prefers-reduced-motion: reduce)';

function consultarMovimiento(consulta) {
  // Las consultas siguen vivas aunque termine la animación que las creó.
  if (!consultas.has(window)) consultas.set(window, new Map());
  const porVentana = consultas.get(window);
  if (!porVentana.has(consulta)) porVentana.set(consulta, window.matchMedia(consulta));
  return porVentana.get(consulta);
}

export function iniciarMovimientoFondo() {
  const body = document.body;
  if (!body || typeof window.matchMedia !== 'function' || !window.requestAnimationFrame) return;
  fondos.get(body)?.();
  const capa = document.createElement('div');
  capa.className = 'ambient-canvas';
  capa.setAttribute('aria-hidden', 'true');
  body.prepend(capa);
  const reducir = consultarMovimiento(consultaReducir);
  const puntero = consultarMovimiento('(hover: hover) and (pointer: fine)');
  let frame = null;
  let objetivo = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.2 };
  let posicion = { ...objetivo };
  const habilitado = () => !reducir.matches && puntero.matches && !document.hidden;

  function soltarPuntero() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    body.classList.remove('ambient-pointer');
  }

  function dibujar() {
    frame = null;
    if (!habilitado()) return;
    posicion.x += (objetivo.x - posicion.x) * 0.14;
    posicion.y += (objetivo.y - posicion.y) * 0.14;
    body.style.setProperty('--ambient-x', `${posicion.x.toFixed(1)}px`);
    body.style.setProperty('--ambient-y', `${posicion.y.toFixed(1)}px`);
    // No queda un bucle de JavaScript activo cuando el puntero se detiene.
    if (Math.abs(objetivo.x - posicion.x) + Math.abs(objetivo.y - posicion.y) > 0.5) {
      frame = window.requestAnimationFrame(dibujar);
    }
  }

  function mover(event) {
    if (!habilitado() || event.pointerType !== 'mouse') return;
    objetivo = {
      x: Math.max(0, Math.min(window.innerWidth, event.clientX)),
      y: Math.max(0, Math.min(window.innerHeight, event.clientY))
    };
    body.classList.add('ambient-pointer');
    if (frame === null) frame = window.requestAnimationFrame(dibujar);
  }

  function actualizarEstado() {
    body.classList.toggle('ambient-motion', habilitado());
    if (!habilitado()) soltarPuntero();
  }

  function limpiar() {
    soltarPuntero();
    body.classList.remove('ambient-motion');
    body.style.removeProperty('--ambient-x');
    body.style.removeProperty('--ambient-y');
    window.removeEventListener('pointermove', mover);
    window.removeEventListener('blur', soltarPuntero);
    document.documentElement.removeEventListener('pointerleave', soltarPuntero);
    document.removeEventListener('visibilitychange', actualizarEstado);
    reducir.removeEventListener?.('change', actualizarEstado);
    puntero.removeEventListener?.('change', actualizarEstado);
    capa.remove();
    fondos.delete(body);
  }

  window.addEventListener('pointermove', mover, { passive: true });
  window.addEventListener('blur', soltarPuntero);
  document.documentElement.addEventListener('pointerleave', soltarPuntero);
  document.addEventListener('visibilitychange', actualizarEstado);
  reducir.addEventListener?.('change', actualizarEstado);
  puntero.addEventListener?.('change', actualizarEstado);
  actualizarEstado();
  fondos.set(body, limpiar);
  return limpiar;
}

export function animarEstadisticas(page, formatos) {
  estadisticas.get(page)?.();
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function' || !window.requestAnimationFrame) return;
  const reducir = consultarMovimiento(consultaReducir);
  if (reducir.matches) return;
  const tarjetas = [...page.querySelectorAll('.dash-kpi, .dash-area, .dash-chart, .dash-health')];
  if (!tarjetas.length) return;
  const contadores = new Map();
  const animaciones = new Set();
  let frame = null;
  let observador = null;

  function finalizarContadores() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    for (const [elemento, contador] of contadores) elemento.textContent = contador.final;
    contadores.clear();
  }

  function limpiar() {
    finalizarContadores();
    observador?.disconnect();
    for (const animacion of animaciones) animacion.cancel();
    animaciones.clear();
    reducir.removeEventListener?.('change', cambioMovimiento);
    estadisticas.delete(page);
  }

  function cambioMovimiento() {
    if (reducir.matches) limpiar();
  }

  function dibujar(tiempo) {
    frame = null;
    if (page.isConnected === false || reducir.matches) {
      limpiar();
      return;
    }
    for (const [elemento, contador] of contadores) {
      const progreso = Math.max(0, Math.min(1, (tiempo - contador.inicio) / 650));
      const avance = 1 - (1 - progreso) ** 3;
      elemento.textContent = progreso === 1 ? contador.final : contador.formato(contador.valor * avance);
      if (progreso === 1) contadores.delete(elemento);
    }
    if (contadores.size) frame = window.requestAnimationFrame(dibujar);
  }

  function mostrar(tarjeta, orden) {
    const retraso = Math.min(orden, 6) * 45;
    if (typeof tarjeta.animate === 'function') {
      const animacion = tarjeta.animate([
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 480, delay: retraso, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' });
      animaciones.add(animacion);
      animacion.onfinish = () => animaciones.delete(animacion);
    }
    const elemento = tarjeta.querySelector('[data-estadistica]');
    const valor = Number(elemento?.dataset.valor);
    const formato = formatos[elemento?.dataset.formato];
    if (!elemento || !Number.isFinite(valor) || typeof formato !== 'function') return;
    contadores.set(elemento, { valor, formato, final: elemento.textContent, inicio: window.performance.now() + retraso });
    if (frame === null) frame = window.requestAnimationFrame(dibujar);
  }

  if (typeof window.IntersectionObserver === 'function') {
    observador = new window.IntersectionObserver(entries => {
      if (page.isConnected === false || (page.matches?.('.page') && !page.classList.contains('active'))) {
        limpiar();
        return;
      }
      entries.filter(entry => entry.isIntersecting).forEach((entry, orden) => {
        observador.unobserve(entry.target);
        mostrar(entry.target, orden);
      });
    }, { threshold: 0.15 });
    tarjetas.forEach(tarjeta => observador.observe(tarjeta));
  } else {
    tarjetas.forEach(mostrar);
  }
  reducir.addEventListener?.('change', cambioMovimiento);
  estadisticas.set(page, limpiar);
  return limpiar;
}
