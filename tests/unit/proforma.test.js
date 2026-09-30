import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  alertasIntegradas, construirReporte, resultadosProforma, resultadosReales
} from '../../js/modules/proforma/proforma-calculations.js';
import { proformaUI } from '../../js/modules/proforma/proforma-ui.js';
import { calcularPresupuestoMaestro, ejemploPlaneacion, normalizarSupuestos } from '../../js/modules/planeacion/planeacion-calculations.js';
import { calcularCVU, ejemploEquilibrio, normalizarEquilibrio } from '../../js/modules/equilibrio/equilibrio-calculations.js';
import { calcularFlujo, ejemploFlujo } from '../../js/modules/flujo/flujo-calculations.js';
import { calcularInventario, ejemploInventario } from '../../js/modules/inventario/inventario-calculations.js';
import { calcularApalancamiento } from '../../js/modules/apalancamiento/apalancamiento-calculations.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { clic, element } from './helpers/dom-falso.js';

// Estados balanceados de scripts/sample-estados.csv (MUNO MODA 2023 y 2024).
function estadosMuno() {
  const balance = (ef, cxc, inv, otros, dep, cxp, pcp, prov, plp, util) => ({
    activos: { 'Efectivo': ef, 'Cuentas por Cobrar': cxc, 'Inventario': inv, 'Otros Activos Corrientes': otros, 'Edificios': 200000, 'Depreciacion Acumulada': dep },
    pasivos: { 'Cuentas por Pagar': cxp, 'Pasivo Corto Plazo': pcp, 'Provisiones': prov, 'Pasivo Largo Plazo': plp },
    patrimonio: { 'Capital Social': 200000, 'Utilidades Acumuladas': util }
  });
  const resultados = (v, cv, ga, gv, oi, og) => ({
    'Ventas': v, 'Costo de Ventas': cv, 'Gastos de Administracion': ga, 'Gastos de Ventas': gv, 'Otros Ingresos': oi, 'Otros Gastos': og
  });
  return normalizeFinancialData({
    name: 'MUNO MODA S.A.', periods: ['2023', '2024'],
    balanceGeneral: {
      2023: balance(45000, 120000, 180000, 25000, -98525, 85000, 60000, 15000, 80000, 31475),
      2024: balance(52000, 135000, 195000, 30000, -116475, 92000, 65000, 18000, 75000, 45525)
    },
    estadoResultados: {
      2023: resultados(850000, 510000, 120000, 85000, 15000, 10000),
      2024: resultados(920000, 545000, 130000, 90000, 18000, 12000)
    }
  });
}

const CONFIG_APALANCAMIENTO = { comportamiento: { 'Gastos de Ventas': { tipo: 'fijo' } }, dap: {}, tasaDefecto: null };
const UMBRALES = { ratioCorrienteMin: 1, ratioRapidoMin: 0.5, endeudamientoMax: 0.6, roeMin: 0.1 };

function entradasCompletas(extra = {}) {
  const estados = estadosMuno();
  return {
    estados,
    razones: { RC: 2.35, RR: 1.24, endeudamiento: 0.5, MN: 0.175, ROA: 0.33, denominadores: { RC: 1, RR: 1, End: 1, MN: 1, ROA: 1 } },
    dupont: { PM: 0.175, AT: 1.9, EM: 2.0, ROE: 0.665 },
    apalancamiento: calcularApalancamiento(estados, CONFIG_APALANCAMIENTO),
    presupuesto: calcularPresupuestoMaestro(normalizarSupuestos(ejemploPlaneacion())),
    equilibrio: calcularCVU(normalizarEquilibrio(ejemploEquilibrio())),
    flujo: calcularFlujo(ejemploFlujo()),
    inventario: calcularInventario(ejemploInventario()),
    umbrales: UMBRALES,
    ...extra
  };
}

describe('estado de resultados proforma frente al real', () => {
  it('real 2024 y proforma de cuatro trimestres', () => {
    const real = resultadosReales(estadosMuno());
    expect(real).toMatchObject({ periodo: '2024', ventas: 920000, cbv: 545000, utilidadBruta: 375000, gastosOperacion: 220000, uaii: 155000, otrosNeto: 6000, utilidadNeta: 161000 });
    const proforma = resultadosProforma(calcularPresupuestoMaestro(normalizarSupuestos(ejemploPlaneacion())));
    expect(proforma).toMatchObject({ horizonte: '4 trimestres', anual: true, ventas: 1000000, uaii: 182000, ir: 51000, utilidadNeta: 119000 });
    expect(proforma.margenOperativo).toBeCloseTo(0.182, 10);
  });

  it('variaciones relativas en montos y en puntos en los márgenes', () => {
    const r = construirReporte(entradasCompletas());
    const fila = clave => r.comparacion.find(f => f.clave === clave);
    expect(fila('ventas').variacion).toBeCloseTo(80000 / 920000, 10);
    expect(fila('uaii').variacion).toBeCloseTo(27000 / 155000, 10);
    expect(fila('utilidadNeta').variacion).toBeCloseTo(-42000 / 161000, 10);
    expect(fila('margenBruto').puntos).toBeCloseTo(0.4 - 375000 / 920000, 10);
    expect(fila('otrosNeto').proforma).toBeNull();
  });
});

describe('indicadores, alertas y faltantes', () => {
  it('reúne los indicadores de cada módulo', () => {
    const { indicadores } = construirReporte(entradasCompletas());
    const valor = nombre => indicadores.find(i => i.nombre === nombre)?.valor;
    expect(valor('Liquidez corriente')).toBe(2.35);
    expect(valor('GAO')).toBeCloseTo(375000 / 155000, 10); // MC / UAII de 2024
    expect(valor('Punto de equilibrio')).toBe(150);
    expect(valor('Flujo de operación')).toBe(98000);
    expect(valor('Financiamiento máximo requerido')).toBe(20800);
    expect(valor('Valor del inventario')).toBe(78790);
    expect(valor('Productos por reponer')).toBe(2);
  });

  it('ordena las alertas por urgencia', () => {
    const { alertas } = construirReporte(entradasCompletas());
    expect(alertas[0]).toMatchObject({ nivel: 'alta', ruta: '#/planeacion' });
    expect(alertas[0].texto).toContain('C$ 20,800.00');
    expect(alertas[0].texto).toContain('Trimestre 2');
    expect(alertas.find(a => a.ruta === '#/inventario').texto).toContain('Camisa casual, Vestido de verano');
    expect(alertas.every(a => ['alta', 'media', 'baja'].includes(a.nivel))).toBe(true);
  });

  it('alertas de liquidez, margen de seguridad y operación que consume efectivo', () => {
    const base = entradasCompletas();
    const alertas = alertasIntegradas({
      ...base,
      razones: { RC: 0.8, endeudamiento: 0.7, denominadores: { RC: 1, End: 1 } },
      equilibrio: { ...base.equilibrio, msPorcentaje: 0.1 },
      flujo: { ...base.flujo, neto: { ...base.flujo.neto, operacion: -5000 } }
    }).map(a => a.texto).join(' | ');
    expect(alertas).toContain('Liquidez corriente de 0.80');
    expect(alertas).toContain('Endeudamiento de 70.00%');
    expect(alertas).toContain('Margen de seguridad de 10.00%');
    expect(alertas).toContain('La operación consume C$ 5,000.00');
  });

  it('una razón con denominador 0 es N/D, no 0', () => {
    const { indicadores, alertas } = construirReporte(entradasCompletas({ razones: { RC: 0, denominadores: { RC: 0 } } }));
    expect(indicadores.find(i => i.nombre === 'Liquidez corriente').valor).toBeNull();
    expect(alertas.some(a => a.texto.includes('Liquidez corriente'))).toBe(false);
  });

  it('indica qué módulos faltan', () => {
    const estados = estadosMuno();
    const r = construirReporte({ estados, apalancamiento: calcularApalancamiento(estados, {}) });
    expect(r.faltantes.map(f => f.modulo)).toEqual(['Apalancamiento', 'Presupuesto maestro', 'Punto de equilibrio', 'Flujo de efectivo', 'Inventario']);
    expect(r.proforma).toBeNull();
    expect(r.efectivo).toBeNull();
    expect(construirReporte({}).faltantes[0].modulo).toBe('Estados financieros');
  });
});

describe('pantalla del reporte integrado', () => {
  it('muestra proforma, efectivo, indicadores y alertas escapadas', async () => {
    const entradas = entradasCompletas();
    entradas.inventario.porReponer[0] = { ...entradas.inventario.porReponer[0], nombre: '<b>Camisa</b>' };
    const page = element();
    const imprimir = vi.fn();
    proformaUI(page, { reporte: construirReporte(entradas), imprimir });
    const html = page.innerHTML;
    expect(html).toContain('Real 2024');
    expect(html).toContain('Proforma (4 trimestres)');
    expect(html).toContain('+8.70%');
    expect(html).toContain('C$ 122,360.00');
    expect(html).toContain('badge-danger">Alta');
    expect(html).toContain('&lt;b&gt;Camisa&lt;/b&gt;');
    expect(html).not.toContain('<b>Camisa</b>');
    await clic(page, 'proformaImprimir');
    expect(imprimir).toHaveBeenCalledTimes(1);
  });
});

describe('ruta #/proforma con datos guardados', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('reúne los módulos guardados, incluidas las razones de Análisis', async () => {
    vi.resetModules();
    const storage = new Map();
    vi.stubGlobal('localStorage', { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) });
    const page = element();
    vi.stubGlobal('document', { getElementById: id => (id === 'page-proforma' ? page : null) });
    const { default: store } = await import('../../js/store.js');
    store.setPersisted('estados', estadosMuno());
    store.setPersisted('apalancamiento', CONFIG_APALANCAMIENTO);
    store.setPersisted('planeacion', { supuestos: ejemploPlaneacion() });
    store.setPersisted('equilibrio', ejemploEquilibrio());
    store.setPersisted('flujo', ejemploFlujo());
    store.setPersisted('inventario', ejemploInventario());
    const { initProforma } = await import('../../js/modules/proforma/index.js');
    initProforma();
    const html = page.innerHTML;
    expect(html).not.toContain('Para completar el reporte');
    expect(html).toContain('Real 2024');
    expect(html).toContain('C$ 1,000,000.00');
    // Liquidez corriente 2024 = (52,000 + 135,000 + 195,000 + 30,000) / (92,000 + 65,000 + 18,000)
    expect(html).toContain(`${(412000 / 175000).toFixed(2)} veces`);
    expect(html).toContain('Productos por reponer');
  });
});
