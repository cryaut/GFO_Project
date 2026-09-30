import { afterEach, describe, expect, it, vi } from 'vitest';

// Pruebas con dobles de navegador: cargarEjemploCompleto (store + localStorage) y el
// recoloreado de gráficas al cambiar de tema (Chart.js falso).
function stubNavegador({ tema = 'light', guardado = null } = {}) {
  const almacen = { 'gfo-toolkit-data': guardado ? JSON.stringify(guardado) : null };
  const variables = {
    light: { '--text-secondary': '#475569', '--border-color': '#e2e8f0' },
    dark: { '--text-secondary': '#94a3b8', '--border-color': '#334155' }
  };
  const html = { tema, setAttribute(_, v) { this.tema = v; }, getAttribute() { return this.tema; } };
  vi.stubGlobal('document', {
    documentElement: html,
    body: {},
    getElementById: () => ({ appendChild() {} }),
    createElement: () => ({ style: {}, remove() {} })
  });
  vi.stubGlobal('getComputedStyle', el => ({
    fontFamily: 'Inter, sans-serif',
    getPropertyValue: name => (el === html ? variables[html.tema][name] ?? '' : '')
  }));
  vi.stubGlobal('localStorage', {
    getItem: k => almacen[k] ?? null,
    setItem: (k, v) => { almacen[k] = v; }
  });
  vi.stubGlobal('window', { location: { hash: '' }, addEventListener() {} });
  return { html, almacen };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('cargar ejemplos', () => {
  it('llena los módulos vacíos de la empresa con el caso de MUNO MODA, sin tocar lo personal', async () => {
    const { almacen } = stubNavegador();
    const { cargarEjemploEmpresa } = await import('../../js/modules/inicio/index.js');
    const cargados = cargarEjemploEmpresa();
    expect(cargados).toEqual(['Estados financieros', 'Razones de mercado', 'Presupuesto maestro', 'Punto de equilibrio',
      'Flujo de efectivo', 'Inventario']);
    const datos = JSON.parse(almacen['gfo-toolkit-data']);
    expect(datos.estados.name).toBe('MUNO MODA S.A.');
    expect(datos.estados.periods.length).toBeGreaterThan(0);
    expect(datos.flujo.movimientos.length).toBeGreaterThan(0);
    expect(datos.presupuesto.gastos).toEqual([]);
    // Una segunda carga no tiene nada que llenar.
    expect(cargarEjemploEmpresa()).toEqual([]);
  });

  it('el ejemplo personal carga presupuesto personal y activos del hogar', async () => {
    const { almacen } = stubNavegador();
    const { cargarEjemploPersonal } = await import('../../js/modules/inicio/index.js');
    expect(cargarEjemploPersonal()).toEqual(['Presupuesto personal', 'Activos del hogar']);
    const datos = JSON.parse(almacen['gfo-toolkit-data']);
    expect(datos.presupuesto.ingresoMensual).toBe(22500);
    expect(datos.activos.inventario).toHaveLength(4);
    expect(datos.estados.periods).toEqual([]);
    expect(cargarEjemploPersonal()).toEqual([]);
  });

  it('no reemplaza datos del usuario', async () => {
    const productos = [{ id: 'p1', nombre: 'Mío', existenciaInicial: 1, costoUnitario: 1, stockMinimo: 0 }];
    const bienes = [{ nombre: 'Mi TV', costoOriginal: 100 }];
    const { almacen } = stubNavegador({ guardado: { inventario: { productos, movimientos: [] }, activos: { inventario: bienes } } });
    const { cargarEjemploEmpresa, cargarEjemploPersonal } = await import('../../js/modules/inicio/index.js');
    expect(cargarEjemploEmpresa()).not.toContain('Inventario');
    expect(cargarEjemploPersonal()).toEqual(['Presupuesto personal']);
    const datos = JSON.parse(almacen['gfo-toolkit-data']);
    expect(datos.inventario.productos).toEqual(productos);
    expect(datos.activos.inventario).toEqual(bienes);
  });
});

describe('gráficas y cambio de tema', () => {
  it('recolorea ejes y leyenda puestos por renderChart y respeta los del módulo', async () => {
    const { html } = stubNavegador({ tema: 'light' });
    class ChartFalso {
      static defaults = { font: {}, color: null };
      constructor(canvas, config) { this.options = config.options; this.actualizaciones = 0; }
      update() { this.actualizaciones += 1; }
      destroy() {}
    }
    window.Chart = ChartFalso;
    const { renderChart, refreshChartsTheme } = await import('../../js/components/chart.js');
    const chart = renderChart('c1', {
      type: 'bar', data: {},
      options: { plugins: { legend: {} }, scales: { x: { grid: { display: false } }, y: { ticks: { color: '#ff0000' } } } }
    });
    expect(chart.options.scales.x.ticks.color).toBe('#475569');
    expect(ChartFalso.defaults.color).toBe('#475569');

    html.setAttribute('data-theme', 'dark');
    refreshChartsTheme();
    expect(chart.options.scales.x.ticks.color).toBe('#94a3b8');
    expect(chart.options.scales.y.grid.color).toBe('#334155');
    expect(chart.options.plugins.legend.labels.color).toBe('#94a3b8');
    expect(chart.options.scales.y.ticks.color).toBe('#ff0000');
    expect(ChartFalso.defaults.color).toBe('#94a3b8');
    expect(chart.actualizaciones).toBe(1);
  });
});
