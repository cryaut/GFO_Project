import { afterEach, describe, expect, it, vi } from 'vitest';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { obtenerCuenta } from '../../js/modules/estados/cuentas-identificador.js';

const identidad = idCuenta => ({ idCuenta, estado: 'reconocida', metodo: 'id',
  candidatos: [], origen: 'manual' });

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
  const datos = {
    name: 'Prueba razones', periods: ['2025'],
    balanceGeneral: { '2025': {
      activos: { 'Banco': 300, 'Clientes': 100, 'Mercadería': 100 },
      pasivos: { 'Proveedores': 50, 'Préstamo bancario': 150 },
      patrimonio: { 'Capital': 300 }
    } },
    estadoResultados: { '2025': estadoResultados },
    accountIdentities: {
      activos: { Banco: identidad('bs.cash_and_equivalents'), Clientes: identidad('bs.trade_receivables'),
        Mercadería: identidad('bs.inventory_merchandise') },
      pasivos: { Proveedores: identidad('bs.trade_payables'), 'Préstamo bancario': identidad('bs.long_term_borrowings') },
      patrimonio: { Capital: identidad('bs.share_capital') },
      estadoResultados: {
        'Ingresos por ventas': identidad('is.sales_total'), 'Costo de lo vendido': identidad('is.cost_of_sales_reported'),
        'Sueldos administrativos': identidad('is.administrative_expenses'), Publicidad: identidad('is.selling_expenses'),
        'Impuesto sobre la renta': identidad('is.income_tax_expense'),
        ...(interesesBancarios === undefined ? {} : { 'Intereses bancarios': identidad('is.interest_expense') })
      }, suplementario: {}
    },
    composicionIngresos: { '2025': 'excluye_intereses' },
    accountTypes: {
      activos: { 'Banco': 'efectivo', 'Clientes': 'cxC', 'Mercadería': 'inventario' },
      pasivos: { 'Proveedores': 'cuentasPorPagar', 'Préstamo bancario': 'pasivoLargoPlazo' },
      patrimonio: { 'Capital': 'patrimonio' },
      estadoResultados: tiposER
    }
  };
  // D-055/D-060: componentes explícitamente sin movimiento de este fixture ficticio.
  const ceros = ['is.sales_returns', 'is.sales_discounts', 'is.sales_allowances',
    'is.operating_depreciation', 'is.operating_amortization', 'is.other_operating_expenses',
    'is.other_operating_income', 'is.nonoperating_income', 'is.noninterest_nonoperating_expenses',
    'bs.inventory_raw_materials', 'bs.inventory_work_in_process', 'bs.inventory_finished_goods'];
  return registrarCuenta(datos, ceros.map(id => ({ id,
    nombre: `Componente sin movimiento ${id}`, grupo: obtenerCuenta(id).grupo,
    periodo: '2025', importe: 0, confirmado: true })));
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
  it('edad del inventario, plazos y ciclo de conversión (CxC con ventas a crédito declaradas)', async () => {
    const datos = registrarCuenta(estados(60), { id: 'supp.credit_sales',
      nombre: 'Ventas a crédito declaradas', grupo: 'suplementario', periodo: '2025',
      importe: 1000, confirmado: true });
    const { razones, html } = await cargarAnalisis(datos);
    expect(razones.RotInv).toBe(4); // 400 / 100
    expect(razones.edadInventario).toBeCloseTo(91.25, 6);
    // D-059: el fixture declara ventas a crédito iguales a sus ventas totales.
    expect(razones.RotCxC).toBe(10); // 1000 / 100
    expect(razones.PPC).toBeCloseTo(36.5, 6); // 365 / 10
    // Compras = 400 + inventario (no hay periodo previo): se aproxima con costo de ventas.
    expect(razones.rotacionCxP).toBe(8); // 400 / 50
    expect(razones.plazoPago).toBeCloseTo(45.625, 6);
    expect(razones.cicloConversion).toBeCloseTo(82.125, 6); // 36.5 + 91.25 − 45.625
    expect(html).toContain('Rotación CxC (ventas totales)');
    expect(html).toContain('con ventas totales');
    expect(html).toContain('Ciclo de conversión de efectivo mayor a 60 días');
    expect(html).not.toContain('NaN');
  });

  it('con dos periodos la rotación de CxP usa compras reales', async () => {
    const base = estados(60);
    const dosPeriodos = structuredClone(base);
    dosPeriodos.periods = ['2024', '2025'];
    dosPeriodos.balanceGeneral['2024'] = structuredClone(base.balanceGeneral['2025']);
    dosPeriodos.balanceGeneral['2024'].activos['Mercadería'] = 60; // inventario inicial
    dosPeriodos.balanceGeneral['2024'].pasivos['Proveedores'] = 40;
    dosPeriodos.estadoResultados['2024'] = structuredClone(base.estadoResultados['2025']);
    dosPeriodos.composicionIngresos['2024'] = 'excluye_intereses';
    // D-060: 430 es construido para reproducir el esperado anterior, no un dato real.
    const completos = registrarCuenta(dosPeriodos, { id: 'supp.supplier_payments',
      nombre: 'Pagos declarados del periodo', grupo: 'suplementario', periodo: '2025',
      importe: 430, confirmado: true });
    const { razones } = await cargarAnalisis(completos);
    // Compras a crédito = pagos 430 + (CxP final 50 − inicial 40) = 440; CxP prom = 45.
    expect(razones.rotacionCxP).toBeCloseTo(440 / 45, 6);
    expect(razones.usaComprasReales).toBe(true);
    // Promedio de inventario con ambos periodos presentes: (60 + 100) / 2 = 80
    expect(razones.RotInv).toBeCloseTo(400 / 80, 6);
  });
});
