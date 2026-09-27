import { afterEach, describe, expect, it, vi } from 'vitest';

// Un periodo con cuentas de nombre propio y clasificación explícita, como las deja
// el importador. Utilidad operativa = 1000 − 400 − 200 − 100 = 300.
function estados(interesesBancarios) {
  const estadoResultados = {
    'Ingresos por ventas': 1000,
    'Costo de lo vendido': 400,
    'Sueldos administrativos': 200,
    'Publicidad': 100,
    'Impuesto sobre la renta': 30
  };
  const tiposER = {
    'Ingresos por ventas': 'ventas',
    'Costo de lo vendido': 'costoVentas',
    'Sueldos administrativos': 'gastosAdmin',
    'Publicidad': 'gastosVentas',
    'Impuesto sobre la renta': 'impuestos'
  };
  if (interesesBancarios !== undefined) {
    estadoResultados['Intereses bancarios'] = interesesBancarios;
    tiposER['Intereses bancarios'] = 'intereses';
  }
  return {
    name: 'Prueba razones', periods: ['2025'],
    balanceGeneral: { '2025': {
      activos: { 'Banco': 300, 'Clientes': 100, 'Mercadería': 100 },
      pasivos: { 'Proveedores': 50, 'Préstamo bancario': 150 },
      patrimonio: { 'Capital': 300 }
    } },
    estadoResultados: { '2025': estadoResultados },
    accountTypes: {
      activos: { 'Banco': 'efectivo', 'Clientes': 'cxC', 'Mercadería': 'inventario' },
      pasivos: { 'Proveedores': 'cuentasPorPagar', 'Préstamo bancario': 'pasivoLargoPlazo' },
      patrimonio: { 'Capital': 'patrimonio' },
      estadoResultados: tiposER
    }
  };
}

// Módulos nuevos en cada caso: el análisis guarda en caché los estados leídos.
async function cargarAnalisis(data) {
  vi.resetModules();
  const storage = new Map();
  vi.stubGlobal('localStorage', {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  });
  const { default: store } = await import('../../js/store.js');
  store.setPersisted('estados', data);
  const analisis = await import('../../js/modules/analisis/index.js');
  const page = { innerHTML: '', querySelectorAll: () => [] };
  vi.stubGlobal('document', { getElementById: id => (id === 'page-analisis' ? page : null) });
  analisis.initAnalisis();
  return { razones: analisis.computeRazones('2025'), html: page.innerHTML };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cobertura de intereses', () => {
  it('se calcula con los intereses del estado de resultados', async () => {
    const { razones, html } = await cargarAnalisis(estados(60));
    expect(razones.coberturaIntereses).toBe(5);
    expect(html).not.toContain('Cobertura de intereses por debajo');
    expect(html).not.toContain('NaN');
  });

  it('genera un hallazgo cuando está bajo el umbral', async () => {
    const { razones, html } = await cargarAnalisis(estados(200));
    expect(razones.coberturaIntereses).toBe(1.5);
    expect(html).toContain('Cobertura de intereses por debajo del umbral configurado');
  });

  it('sin cuenta de intereses es N/D y no genera hallazgo', async () => {
    const { razones, html } = await cargarAnalisis(estados());
    expect(razones.coberturaIntereses).toBeNull();
    expect(html).toContain('Cobertura de Intereses');
    expect(html).not.toContain('Cobertura de intereses por debajo');
  });
});

describe('plazos en días (año de 365)', () => {
  it('edad del inventario, plazos y ciclo de conversión', async () => {
    const { razones, html } = await cargarAnalisis(estados(60));
    expect(razones.RotInv).toBe(4); // 400 / 100
    expect(razones.edadInventario).toBeCloseTo(91.25, 6);
    expect(razones.PPC).toBeCloseTo(36.5, 6); // 365 / (1000 / 100)
    expect(razones.rotacionCxP).toBe(8); // 400 / 50
    expect(razones.plazoPago).toBeCloseTo(45.625, 6);
    expect(razones.cicloConversion).toBeCloseTo(82.125, 6);
    expect(html).toContain('Ciclo de conversión de efectivo mayor a 60 días');
  });
});
