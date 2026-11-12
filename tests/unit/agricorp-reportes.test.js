// F6 (D-113): Reportes y el HTML exportado integran todos los módulos de AGRI-CORP.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../js/components/toast.js', () => ({ showToast: vi.fn() }));
import store from '../../js/store.js';
import { cargarEjemploEmpresa } from '../../js/modules/inicio/index.js';
import { reunirEntradas } from '../../js/modules/proforma/index.js';
import { construirReporte } from '../../js/modules/proforma/proforma-calculations.js';
import { construirReporteHTML, resumenModulosEmpresa } from '../../js/modules/integracion/integracion-reporte.js';

let memoria;
beforeEach(() => {
  memoria = new Map();
  vi.stubGlobal('localStorage', { getItem: k => memoria.get(k) ?? null, setItem: vi.fn((k, v) => memoria.set(k, v)) });
  vi.stubGlobal('window', { confirm: vi.fn(() => true) });
  store.load();
  cargarEjemploEmpresa('agricorp-historico');
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const armar = () => {
  const entradas = reunirEntradas();
  const reporte = construirReporte(entradas);
  return { entradas, reporte };
};

describe('estado de los módulos de empresa', () => {
  it('con AGRI-CORP cargado los siete módulos tienen datos', () => {
    const { entradas, reporte } = armar();
    const filas = resumenModulosEmpresa(entradas, reporte);
    expect(filas.map(f => f.modulo)).toEqual(['Apalancamiento', 'Razones de mercado', 'Punto de equilibrio',
      'Flujo de efectivo', 'Presupuesto maestro', 'Inventario', 'Balance proforma']);
    expect(filas.every(f => f.estado === 'ok')).toBe(true);
    expect(filas.find(f => f.modulo === 'Balance proforma').detalle).toContain('2024 → proforma (contraste 2025): cuadra');
    expect(filas.find(f => f.modulo === 'Razones de mercado').detalle).toContain('SUPUESTO');
  });

  it('un módulo vacío aparece como pendiente con su motivo', () => {
    store.setPersisted('inventario', { productos: [], movimientos: [] });
    const { entradas, reporte } = armar();
    expect(resumenModulosEmpresa(entradas, reporte).find(f => f.modulo === 'Inventario')).toEqual(
      { modulo: 'Inventario', estado: 'pendiente', detalle: 'Sin productos.' });
  });

  it('sin estados no hay filas de empresa', () => {
    expect(resumenModulosEmpresa({ estados: null }, null)).toEqual([]);
  });
});

describe('reporte HTML', () => {
  it('incluye el ER con base y contraste, el balance proforma, los indicadores y los módulos', () => {
    const { entradas, reporte } = armar();
    const html = construirReporteHTML({ estados: entradas.estados, reporte, entradas });
    expect(html).toContain('Estado de resultados proforma');
    expect(html).toContain('Real 2024 (base)');
    expect(html).toContain('Real 2025 (contraste)');
    expect(html).toContain('Balance general proforma');
    expect(html).toContain('Cuadra: activos = pasivos + patrimonio');
    expect(html).toContain('Indicadores integrados');
    expect(html).toContain('Estado de los módulos de empresa');
    // Ventas reales 2025 frente a la proforma: −13.54 %.
    expect(html).toContain('-13.54 %');
    expect(html).toContain('6,373,941,204.72');
  });

  it('marca P/U y P/VL como supuestos cuando el precio es ilustrativo', () => {
    const { reporte } = armar();
    const pvl = reporte.indicadores.find(i => i.nombre === 'Precio / valor en libros (P/VL)');
    expect(pvl.lectura).toContain('SUPUESTO: precio ilustrativo');
  });

  it('escapa los textos que vienen de los datos', () => {
    const { entradas, reporte } = armar();
    entradas.estados = { ...entradas.estados, name: '<b>x</b>' };
    reporte.balance = { disponible: false, motivo: '<script>alert(1)</script>' };
    const html = construirReporteHTML({ estados: entradas.estados, reporte, entradas });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
