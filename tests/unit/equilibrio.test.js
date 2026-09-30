import { describe, expect, it, vi } from 'vitest';
import {
  margenContribucionUnitario, margenSeguridad, puntoEquilibrioUnidades, puntoEquilibrioVentas,
  razonMargenContribucion, unidadesUtilidadObjetivo
} from '../../js/utils/calculate.js';
import {
  baseDesdeEstados, calcularCVU, calcularEscenarios, ejemploEquilibrio, normalizarEquilibrio,
  puntosGrafica, validarEquilibrio
} from '../../js/modules/equilibrio/equilibrio-calculations.js';
import { equilibrioUI } from '../../js/modules/equilibrio/equilibrio-ui.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { clic, element, enviar, llenar, mensaje } from './helpers/dom-falso.js';

// Caso del paso 01: P 800, CVu 520, CF 42,000, Q 250, utilidad objetivo 42,000.
const ejemplo = normalizarEquilibrio(ejemploEquilibrio());

describe('fórmulas C-V-U', () => {
  it('margen de contribución unitario y razón de margen', () => {
    expect(margenContribucionUnitario(800, 520)).toBe(280);
    expect(razonMargenContribucion(280, 800)).toBeCloseTo(0.35, 10);
    expect(razonMargenContribucion(280, 0)).toBeNull();
    expect(margenContribucionUnitario(null, 520)).toBeNull();
  });

  it('punto de equilibrio en unidades y en C$', () => {
    expect(puntoEquilibrioUnidades(42000, 280)).toBe(150);
    expect(puntoEquilibrioVentas(42000, 0.35)).toBeCloseTo(120000, 6);
    expect(puntoEquilibrioUnidades(0, 280)).toBe(0);
    // Sin margen positivo no existe punto de equilibrio.
    expect(puntoEquilibrioUnidades(42000, 0)).toBeNull();
    expect(puntoEquilibrioUnidades(42000, -20)).toBeNull();
    expect(puntoEquilibrioVentas(42000, -0.1)).toBeNull();
  });

  it('unidades para una utilidad objetivo y margen de seguridad', () => {
    expect(unidadesUtilidadObjetivo(42000, 42000, 280)).toBe(300); // (42,000 + 42,000) / 280
    expect(unidadesUtilidadObjetivo(42000, -50000, 280)).toBeNull();
    expect(margenSeguridad(250, 150)).toBeCloseTo(0.4, 10); // (250 − 150) / 250
    expect(margenSeguridad(100, 150)).toBeCloseTo(-0.5, 10);
    expect(margenSeguridad(0, 150)).toBeNull();
  });
});

describe('caso base', () => {
  it('resultados resueltos a mano', () => {
    const r = calcularCVU(ejemplo);
    expect(r).toMatchObject({
      mcu: 280, peUnidades: 150, unidadesMinimas: 150, ventas: 200000, costoVariableTotal: 130000,
      mcTotal: 70000, costoTotal: 172000, uaii: 28000, msUnidades: 100, unidadesObjetivo: 300, ventasObjetivo: 240000
    });
    expect(r.rmc).toBeCloseTo(0.35, 10);
    expect(r.peVentas).toBeCloseTo(120000, 6);
    expect(r.msVentas).toBeCloseTo(80000, 6);
    expect(r.msPorcentaje).toBeCloseTo(0.4, 10);
    expect(r.gao).toBeCloseTo(2.5, 10); // 70,000 / 28,000
  });

  it('redondea hacia arriba las unidades mínimas y marca N/D sin margen positivo', () => {
    // 42,000 / (800 − 572) = 184.21 → hay que vender 185
    expect(calcularCVU({ ...ejemplo, costoVariableUnitario: 572 }).unidadesMinimas).toBe(185);
    const sinMargen = calcularCVU({ ...ejemplo, precio: 500 });
    expect(sinMargen).toMatchObject({ mcu: -20, peUnidades: null, peVentas: null, msPorcentaje: null, uaii: -47000 });
  });

  it('valida los datos base', () => {
    expect(validarEquilibrio(ejemplo)).toEqual([]);
    expect(validarEquilibrio({ ...ejemplo, precio: 0 }).join(' ')).toContain('precio de venta');
    expect(validarEquilibrio({ ...ejemplo, costosFijos: null }).join(' ')).toContain('costos fijos');
    expect(validarEquilibrio(normalizarEquilibrio(undefined))).toHaveLength(4);
  });
});

describe('escenarios', () => {
  const porId = Object.fromEntries(calcularEscenarios(ejemplo).map(e => [e.id, e]));

  it('cambios de ±10 % en precio, costo variable, costos fijos y volumen', () => {
    expect(porId['precio-sube'].resultado.uaii).toBeCloseTo(48000, 6); // 250 × 360 − 42,000
    expect(porId['precio-sube'].resultado.peUnidades).toBeCloseTo(116.6667, 3);
    expect(porId['precio-baja'].resultado.uaii).toBeCloseTo(8000, 6); // 250 × 200 − 42,000
    expect(porId['cv-sube'].resultado.uaii).toBeCloseTo(15000, 6); // 250 × 228 − 42,000
    expect(porId['cv-baja'].resultado.uaii).toBeCloseTo(41000, 6);
    expect(porId['cf-sube'].resultado.peUnidades).toBeCloseTo(165, 6); // 46,200 / 280
    expect(porId['cf-baja'].resultado.uaii).toBeCloseTo(32200, 6);
    expect(porId['volumen-baja'].resultado.uaii).toBeCloseTo(21000, 6);
    expect(porId['precio-sube'].deltaUAII).toBeCloseTo(20000, 6);
  });

  it('un 10 % más de volumen sube la UAII en GAO × 10 %', () => {
    expect(porId['volumen-sube'].resultado.uaii).toBeCloseTo(35000, 6); // 275 × 280 − 42,000
    expect(porId['volumen-sube'].pctUAII).toBeCloseTo(0.25, 10); // 2.5 × 10 %
    expect(porId['volumen-sube'].resultado.peUnidades).toBe(150);
  });

  it('escenario personalizado: precio +5 %, CVu +5 % y volumen −10 %', () => {
    const r = porId.personalizado.resultado;
    expect(porId.personalizado.nombre).toContain('precio +5 %');
    expect(r.mcu).toBeCloseTo(294, 6); // 840 − 546
    expect(r.uaii).toBeCloseTo(24150, 6); // 225 × 294 − 42,000
  });

  it('puntos de la gráfica hasta el mayor entre 2 × PE y 1.2 × Q', () => {
    const puntos = puntosGrafica(calcularCVU(ejemplo));
    expect(puntos.ingresos).toHaveLength(21);
    expect(puntos.ingresos.at(-1)).toEqual({ x: 300, y: 240000 });
    expect(puntos.costosTotales[0]).toEqual({ x: 0, y: 42000 });
    expect(puntos.equilibrio.x).toBe(150);
    expect(puntos.equilibrio.y).toBeCloseTo(120000, 6);
  });
});

// Estado de resultados de la demo MUNO MODA 2024 (el balance no interviene).
function muno() {
  return normalizeFinancialData({
    name: 'MUNO MODA S.A.', periods: ['2024'],
    balanceGeneral: { 2024: { activos: {}, pasivos: {}, patrimonio: {} } },
    estadoResultados: { 2024: {
      'Ventas': 920000, 'Costo de Ventas': 545000, 'Gastos de Administracion': 130000,
      'Gastos de Ventas': 90000, 'Otros Ingresos': 18000, 'Otros Gastos': 12000
    } }
  });
}

describe('desde los estados financieros', () => {
  const config = { comportamiento: { 'Gastos de Ventas': { tipo: 'fijo' } }, dap: {}, tasaDefecto: null };

  it('P = Ventas / Q, CVu = CV / Q y CF de la clasificación; la UAII coincide con los estados', () => {
    const { base, error } = baseDesdeEstados(muno(), config, '2024', 1150);
    expect(error).toBeUndefined();
    expect(base.precio).toBeCloseTo(800, 6); // 920,000 / 1,150
    expect(base.costoVariableUnitario).toBeCloseTo(545000 / 1150, 6);
    expect(base.costosFijos).toBe(220000); // administración (sugerida fija) + ventas
    // UAII = 920,000 − 545,000 − 130,000 − 90,000
    expect(calcularCVU({ ...base, utilidadObjetivo: null }).uaii).toBeCloseTo(155000, 4);
  });

  it('pide clasificar las cuentas sin comportamiento y unidades positivas', () => {
    expect(baseDesdeEstados(muno(), {}, '2024', 1150).error).toContain('Gastos de Ventas');
    expect(baseDesdeEstados(muno(), config, '2024', 0).error).toContain('unidades');
    expect(baseDesdeEstados(muno(), config, '2030', 10).error).toContain('periodo');
  });
});

describe('pantalla de punto de equilibrio', () => {
  function montar(datos = undefined, extra = {}) {
    const page = element();
    const guardar = vi.fn();
    const graficar = vi.fn();
    equilibrioUI(page, { datos, guardar, graficar, ...extra });
    return { page, guardar, graficar };
  }

  it('sin datos pide completarlos o cargar el ejemplo', () => {
    const { page, graficar } = montar();
    expect(page.innerHTML).toContain('Complete el precio');
    expect(graficar).not.toHaveBeenCalled();
  });

  it('con el ejemplo muestra resultados, cálculo, escenarios y gráfica', async () => {
    const { page, guardar, graficar } = montar();
    await clic(page, 'eqEjemplo');
    expect(guardar).toHaveBeenCalledWith(expect.objectContaining({ precio: 800, costosFijos: 42000 }));
    const html = page.innerHTML;
    expect(html).toContain('150 u');
    expect(html).toContain('C$ 120,000.00');
    expect(html).toContain('C$ 28,000.00');
    expect(html).toContain('40.00%');
    expect(html).toContain('2.50 veces');
    expect(html).toContain('42,000 / 280');
    expect(html).toContain('+25.00%');
    expect(html).toContain('al menos <strong>150 unidades</strong>');
    expect(graficar).toHaveBeenLastCalledWith('equilibrioChart', expect.objectContaining({ type: 'line' }));
  });

  it('no guarda datos inválidos', async () => {
    const { page, guardar } = montar();
    llenar(page, { eqPrecio: '0', eqCVu: '520', eqCF: '42000', eqUnidades: '250', eqUtilidad: '' });
    await enviar(page, 'formEquilibrio');
    expect(guardar).not.toHaveBeenCalled();
    expect(mensaje(page, 'equilibrioMensaje')).toContain('precio de venta');
  });

  it('guarda los datos del formulario y el escenario personalizado', async () => {
    const { page, guardar } = montar();
    llenar(page, { eqPrecio: '800', eqCVu: '520', eqCF: '42000', eqUnidades: '250', eqUtilidad: '' });
    await enviar(page, 'formEquilibrio');
    expect(guardar).toHaveBeenLastCalledWith(expect.objectContaining({ precio: 800, unidades: 250, utilidadObjetivo: null }));
    llenar(page, { escPrecio: '0', escCV: '0', escCF: '10', escVolumen: '-10' });
    await enviar(page, 'formEscenario');
    expect(guardar.mock.lastCall[0].escenario).toEqual({ precio: 0, costoVariable: 0, costosFijos: 0.1, volumen: -0.1 });
    expect(page.innerHTML).toContain('Personalizado: CF +10 %, volumen −10 %');
  });

  it('toma precio y costos de los estados guardados', async () => {
    const config = { comportamiento: { 'Gastos de Ventas': { tipo: 'fijo' } } };
    const { page, guardar } = montar(undefined, { estados: muno(), configApalancamiento: config });
    llenar(page, { eqPeriodo: '2024', eqUnidadesVendidas: '1150' });
    await clic(page, 'eqDesdeEstados');
    expect(guardar.mock.lastCall[0].precio).toBeCloseTo(800, 6);
    expect(mensaje(page, 'equilibrioMensaje')).toContain('Datos tomados de los estados de 2024');
  });
});
