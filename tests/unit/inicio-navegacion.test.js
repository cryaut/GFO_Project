import { afterEach, describe, expect, it, vi } from 'vitest';
import { element } from './helpers/dom-falso.js';

// El router y los módulos son reales. Solo se simula la frontera del navegador;
// los errores inducidos comprueban que una pantalla no desactive las demás.
function navegador() {
  const paginas = new Map();
  for (const ruta of ['home', 'inventario', 'mercados']) {
    const pagina = element();
    const clases = new Set();
    pagina.classList = {
      add: clase => clases.add(clase),
      remove: clase => clases.delete(clase),
      contains: clase => clases.has(clase)
    };
    paginas.set(`page-${ruta}`, pagina);
  }
  const eventosDocumento = new Map();
  const eventosVentana = new Map();
  const almacen = new Map();
  vi.stubGlobal('localStorage', {
    getItem: clave => almacen.get(clave) ?? null,
    setItem: (clave, valor) => almacen.set(clave, valor)
  });
  vi.stubGlobal('document', {
    documentElement: { setAttribute() {} },
    getElementById: id => paginas.get(id) ?? null,
    querySelector: () => null,
    querySelectorAll: selector => selector === '.page' ? [...paginas.values()] : [],
    addEventListener: (evento, fn) => eventosDocumento.set(evento, fn)
  });
  const ventana = {
    location: { hash: '' },
    addEventListener: (evento, fn) => eventosVentana.set(evento, fn),
    confirm: () => false
  };
  vi.stubGlobal('window', ventana);
  return {
    pagina: ruta => paginas.get(`page-${ruta}`),
    iniciar: () => eventosDocumento.get('DOMContentLoaded')(),
    navegar: ruta => {
      ventana.location.hash = `#/${ruta}`;
      const navegar = eventosVentana.get('hashchange');
      if (!navegar) throw new Error('El cambio de ruta no quedó registrado');
      navegar();
    }
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('Inicio y navegación de la aplicación', () => {
  it('abre Inicio sin estados ni EFE y cambia de secciones sin refrescar', async () => {
    const browser = navegador();
    await import('../../js/app.js');

    expect(() => browser.iniciar()).not.toThrow();
    expect(browser.pagina('home').innerHTML).toContain('Bienvenido a GFO Toolkit');
    expect(browser.pagina('home').innerHTML).toContain('Cómo empezar');
    expect(browser.pagina('home').innerHTML).not.toContain('La operación genera');
    browser.navegar('inventario');
    expect(browser.pagina('inventario').innerHTML).toContain('Inventario');
    expect(browser.pagina('inventario').classList.contains('active')).toBe(true);
    expect(browser.pagina('home').classList.contains('active')).toBe(false);
    browser.navegar('mercados');
    expect(browser.pagina('mercados').innerHTML).toContain('Mercados e Instituciones Financieras');
    browser.navegar('home');
    expect(browser.pagina('home').innerHTML).toContain('Bienvenido a GFO Toolkit');
  });

  it('muestra un aviso si Inicio falla y permite salir y reintentar', async () => {
    const browser = navegador();
    const inicio = await import('../../js/modules/inicio/index.js');
    vi.spyOn(inicio, 'initInicio').mockImplementationOnce(() => { throw new Error('Fallo de prueba'); });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await import('../../js/app.js');

    expect(() => browser.iniciar()).not.toThrow();
    expect(browser.pagina('home').innerHTML).toContain('No se pudo cargar Inicio');
    expect(log).toHaveBeenCalled();
    browser.navegar('mercados');
    expect(browser.pagina('mercados').innerHTML).toContain('Mercados e Instituciones Financieras');
    browser.navegar('home');
    expect(browser.pagina('home').innerHTML).toContain('Bienvenido a GFO Toolkit');
  });

  it('un fallo al cambiar de sección permite reintentar sin recargar ni insertar el error como HTML', async () => {
    const browser = navegador();
    const inventario = await import('../../js/modules/inventario/index.js');
    vi.spyOn(inventario, 'initInventario').mockImplementationOnce(() => { throw new Error('<b>detalle privado</b>'); });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await import('../../js/app.js');
    browser.iniciar();

    expect(() => browser.navegar('inventario')).not.toThrow();
    expect(browser.pagina('inventario').innerHTML).toContain('No se pudo cargar Inventario');
    expect(browser.pagina('inventario').innerHTML).not.toContain('detalle privado');
    const reintentar = browser.pagina('inventario').querySelector('#reintentarRuta');
    expect(reintentar).not.toBeNull();
    await reintentar.dispatchEvent({ type: 'click' });
    expect(browser.pagina('inventario').innerHTML).toContain('Inventario');
    expect(browser.pagina('inventario').innerHTML).not.toContain('No se pudo cargar');
    browser.navegar('mercados');
    expect(browser.pagina('mercados').innerHTML).toContain('Mercados e Instituciones Financieras');
  });
});
