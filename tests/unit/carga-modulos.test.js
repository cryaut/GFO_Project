import { afterEach, describe, expect, it, vi } from 'vitest';

// Detecta fallas que rompen la carga de la app en el navegador: una función declarada
// dos veces en el mismo archivo (SyntaxError, como pasó al unir las ramas en
// calculate.js), un import de un nombre que otro módulo no exporta o código de nivel
// superior que lanza un error. Carga también los módulos de interfaz y los
// reexportadores que ningún otro test importa.
function stubNavegador() {
  const listeners = {};
  vi.stubGlobal('document', {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: (type, handler) => { listeners[type] = handler; },
    documentElement: { setAttribute() {}, getAttribute: () => 'light' }
  });
  vi.stubGlobal('window', { location: { hash: '' }, addEventListener() {} });
  vi.stubGlobal('localStorage', { getItem: () => null, setItem() {} });
  return listeners;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('carga de módulos', () => {
  it('js/app.js carga todo el grafo de módulos y registra el arranque', async () => {
    const listeners = stubNavegador();
    await import('../../js/app.js');
    expect(listeners.DOMContentLoaded).toBeTypeOf('function');
  });

  it('cada archivo de js/ se puede importar sin errores', async () => {
    stubNavegador();
    const modulos = import.meta.glob('../../js/**/*.js');
    const rutas = Object.keys(modulos);
    expect(rutas).not.toHaveLength(0);
    for (const ruta of rutas) {
      await expect(modulos[ruta](), ruta).resolves.toBeTypeOf('object');
    }
  });
});
