import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  dividendoPorAccion, precioUtilidad, precioValorLibros, razonPagoDividendos,
  rendimientoDividendo, utilidadPorAccion, valorLibrosPorAccion
} from '../../js/utils/calculate.js';
import { calcularRazonesMercado, ejemploMercado, normalizarDatosMercado } from '../../js/modules/analisis/mercado-calculations.js';
import { mercadoUI } from '../../js/modules/analisis/mercado-ui.js';
import { DEMO_MUNOMODA } from '../../js/modules/estados/index.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { computeFinancialTotals, validateFinancialData } from '../../js/modules/estados/estados-calculations.js';
import { construirReporte } from '../../js/modules/proforma/proforma-calculations.js';
import { clic, element, llenar, mensaje } from './helpers/dom-falso.js';

const demo = () => normalizeFinancialData(DEMO_MUNOMODA);

describe('demo MUNO MODA coherente', () => {
  it('cuadra A = P + O en los dos periodos', () => {
    expect(validateFinancialData(demo()).map(v => [v.period, v.balanced])).toEqual([['2023', true], ['2024', true]]);
  });

  it('trae intereses e IR del 30 % de la UAI, y el patrimonio cambia por la utilidad menos los dividendos', () => {
    const d = demo();
    expect(d.accountTypes.estadoResultados).toMatchObject({ 'Gastos por Intereses': 'intereses', 'Impuesto sobre la Renta': 'impuestos' });
    const t23 = computeFinancialTotals(d, '2023');
    const t24 = computeFinancialTotals(d, '2024');
    // UAI 2024 = 920,000 − 545,000 − 130,000 − 90,000 + 18,000 − 12,000 − 11,250 = 149,750
    expect(t24.impuestos / 149750).toBeCloseTo(0.3, 10);
    expect(t23.utilidadNeta).toBe(89180);
    expect(t24.utilidadNeta).toBe(104825);
    // ΔPatrimonio = 582,440 − 517,615 = 64,825 = UN − dividendos de 40,000
    expect(t24.utilidadNeta - (t24.totalPatrimonio - t23.totalPatrimonio)).toBe(40000);
  });
});

describe('fórmulas de mercado', () => {
  it('UPA y precio/utilidad', () => {
    expect(utilidadPorAccion(104825, 30000)).toBeCloseTo(3.494167, 6);
    expect(precioUtilidad(52, 104825 / 30000)).toBeCloseTo(14.881946, 6); // 52 / 3.494167
    expect(utilidadPorAccion(104825, 0)).toBeNull();
    expect(utilidadPorAccion(null, 30000)).toBeNull();
    // Con pérdida, P/U no se interpreta.
    expect(precioUtilidad(52, -1.5)).toBeNull();
  });

  it('valor en libros por acción y precio/valor en libros', () => {
    expect(valorLibrosPorAccion(582440, 30000)).toBeCloseTo(19.414667, 6);
    expect(precioValorLibros(52, 582440 / 30000)).toBeCloseTo(2.678387, 6); // 52 / 19.414667
    expect(precioValorLibros(52, 0)).toBeNull();
  });

  it('dividendo por acción, pago y rendimiento del dividendo', () => {
    const dpa = dividendoPorAccion(40000, 30000);
    expect(dpa).toBeCloseTo(1.333333, 6);
    expect(razonPagoDividendos(dpa, 104825 / 30000)).toBeCloseTo(40000 / 104825, 10); // 38.16 %
    expect(rendimientoDividendo(dpa, 52)).toBeCloseTo(0.025641, 6);
    expect(dividendoPorAccion(-1, 30000)).toBeNull();
    expect(rendimientoDividendo(dpa, 0)).toBeNull();
  });
});

describe('razones de mercado por periodo', () => {
  it('con la demo y el ejemplo', () => {
    const [r23, r24] = calcularRazonesMercado(demo(), ejemploMercado(['2023', '2024']));
    expect(r24).toMatchObject({ un: 104825, dap: 0, udac: 104825, patrimonio: 582440, acciones: 30000, precio: 52, dividendos: 40000, dividendosImplicitos: 40000 });
    expect(r24.pu).toBeCloseTo(14.881946, 6);
    expect(r24.pvl).toBeCloseTo(2.678387, 6);
    expect(r24.pago).toBeCloseTo(40000 / 104825, 10); // dividendos / UDAC = 38.16 %
    expect(r23.upa).toBeCloseTo(89180 / 30000, 10);
    expect(r23.dividendosImplicitos).toBeNull(); // no hay periodo anterior
  });

  it('resta el DAP de Apalancamiento y deja N/D lo que no tiene datos', () => {
    const [, r24] = calcularRazonesMercado(demo(), { periodos: { 2024: { acciones: 30000 } } }, { 2024: 4825 });
    expect(r24.udac).toBe(100000);
    expect(r24.upa).toBeCloseTo(3.333333, 6);
    expect(r24).toMatchObject({ precio: null, pu: null, pvl: null, dpa: null, pago: null });
    expect(normalizarDatosMercado({ periodos: { 2024: { acciones: 'x', precio: 5 } } }).periodos['2024'])
      .toEqual({ acciones: null, precio: 5, dividendos: null });
  });

  it('el reporte integrado muestra la UPA y el P/U', () => {
    const d = demo();
    const mercado = calcularRazonesMercado(d, ejemploMercado(d.periods)).at(-1);
    const { indicadores } = construirReporte({ estados: d, mercado });
    expect(indicadores.find(i => i.nombre === 'Utilidad por acción (UPA)').valor).toBeCloseTo(3.494167, 6);
    expect(indicadores.find(i => i.nombre === 'Precio / utilidad (P/U)').grupo).toBe('Razones de mercado (2024)');
  });
});

describe('pestaña Mercado', () => {
  function montar(datos = undefined) {
    const contenedor = element();
    const guardar = vi.fn();
    mercadoUI(contenedor, { estados: demo(), datos, dap: {}, guardar });
    return { contenedor, guardar };
  }

  it('carga el ejemplo, lo guarda e interpreta', async () => {
    const { contenedor, guardar } = montar();
    expect(contenedor.innerHTML).toContain('N/D');
    await clic(contenedor, 'mercadoEjemplo');
    expect(guardar.mock.lastCall[0].periodos['2024']).toEqual({ acciones: 30000, precio: 52, dividendos: 40000 });
    const html = contenedor.innerHTML;
    expect(html).toContain('C$ 3.49');
    expect(html).toContain('14.88 veces');
    expect(html).toContain('2.68 veces');
    expect(html).toContain('38.16%');
    expect(html).toContain('2024: C$ 40,000.00'); // dividendos implícitos
    expect(html).toContain('El mercado paga 14.88 veces');
  });

  it('rechaza datos inválidos sin guardar', async () => {
    const { contenedor, guardar } = montar();
    llenar(contenedor, { 'mer-acciones-1': '-5', 'mer-precio-1': '52', 'mer-dividendos-1': '' });
    await clic(contenedor, 'mercadoGuardar');
    expect(guardar).not.toHaveBeenCalled();
    expect(mensaje(contenedor, 'mercadoMensaje')).toContain('mayor que 0');
  });

  it('sin estados pide cargarlos', () => {
    const contenedor = element();
    mercadoUI(contenedor, { estados: null, datos: undefined, guardar: vi.fn() });
    expect(contenedor.innerHTML).toContain('href="#/estados"');
  });
});

describe('Análisis con la pestaña Mercado', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('dibuja la pestaña con los datos guardados', async () => {
    vi.resetModules();
    const storage = new Map();
    vi.stubGlobal('localStorage', { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) });
    const page = element();
    vi.stubGlobal('document', { getElementById: id => (id === 'page-analisis' ? page : null) });
    const { default: store } = await import('../../js/store.js');
    store.setPersisted('estados', demo());
    store.setPersisted('razonesMercado', ejemploMercado(['2023', '2024']));
    const { initAnalisis } = await import('../../js/modules/analisis/index.js');
    initAnalisis();
    expect(page.innerHTML).toContain('data-tab="mercado"');
    expect(page.querySelector('#mercadoContenido').innerHTML).toContain('14.88 veces');
  });
});
