import { describe, it, expect } from 'vitest';
import {
  ACCOUNT_TYPES, inferAccountType, computeFinancialTotals,
  validateFinancialData, estadosCalculations
} from '../../js/modules/estados/estados-calculations.js';
import { normalizeFinancialData, parseFinancialJSON } from '../../js/modules/estados/estados-normalize.js';

// Cuentas con los nombres exactos del demo MUNO MODA S.A.
const DATA = {
  name: 'MUNO MODA S.A.',
  periods: ['2023', '2024'],
  balanceGeneral: {
    '2023': {
      activos: {
        'Efectivo': 45000, 'Cuentas por Cobrar': 120000, 'Inventario': 180000,
        'Activos Corrientes Otros': 25000, 'Terrenos': 150000, 'Edificios': 200000,
        'Equipos': 120000, 'Vehiculos': 60000, 'Depreciacion Acumulada': -98525
      },
      pasivos: {
        'Cuentas por Pagar': 85000, 'Pasivo Corto Plazo': 60000, 'Provisiones': 15000,
        'Pasivo Largo Plazo': 80000, 'Otros Pasivos': 43860
      },
      patrimonio: { 'Capital Social': 300000, 'Reservas': 80000, 'Utilidades Acumuladas': 207815 }
    },
    '2024': {
      activos: {
        'Efectivo': 52000, 'Cuentas por Cobrar': 135000, 'Inventario': 195000,
        'Activos Corrientes Otros': 30000, 'Terrenos': 150000, 'Edificios': 200000,
        'Equipos': 120000, 'Vehiculos': 60000, 'Depreciacion Acumulada': -116475
      },
      pasivos: {
        'Cuentas por Pagar': 92000, 'Pasivo Corto Plazo': 65000, 'Provisiones': 18000,
        'Pasivo Largo Plazo': 75000, 'Otros Pasivos': 33860
      },
      patrimonio: { 'Capital Social': 300000, 'Reservas': 80000, 'Utilidades Acumuladas': 207815 }
    }
  },
  estadoResultados: {
    '2023': {
      'Ventas': 850000, 'Costo de Ventas': 510000, 'Gastos de Administracion': 120000,
      'Gastos de Ventas': 85000, 'Otros Ingresos': 15000, 'Otros Gastos': 10000
    },
    '2024': {
      'Ventas': 920000, 'Costo de Ventas': 545000, 'Gastos de Administracion': 130000,
      'Gastos de Ventas': 90000, 'Otros Ingresos': 18000, 'Otros Gastos': 12000
    }
  }
};

describe('inferAccountType', () => {
  it('clasifica todas las cuentas del demo', () => {
    const er = ['Ventas', 'Costo de Ventas', 'Gastos de Administracion', 'Gastos de Ventas', 'Otros Ingresos', 'Otros Gastos'];
    const pasivos = ['Cuentas por Pagar', 'Pasivo Corto Plazo', 'Provisiones', 'Pasivo Largo Plazo', 'Otros Pasivos'];
    const esperados = {
      'Efectivo': 'efectivo', 'Cuentas por Cobrar': 'cxC', 'Inventario': 'inventario',
      'Activos Corrientes Otros': 'activosCorrientesOtros', 'Terrenos': 'activosFijos',
      'Edificios': 'activosFijos', 'Equipos': 'activosFijos', 'Vehiculos': 'activosFijos',
      'Depreciacion Acumulada': 'depreciacionAcumulada',
      'Cuentas por Pagar': 'cuentasPorPagar', 'Pasivo Corto Plazo': 'pasivoCortoPlazo',
      'Provisiones': 'provisiones', 'Pasivo Largo Plazo': 'pasivoLargoPlazo',
      'Otros Pasivos': 'pasivoLargoPlazo',
      'Ventas': 'ventas', 'Costo de Ventas': 'costoVentas',
      'Gastos de Administracion': 'gastosAdmin', 'Gastos de Ventas': 'gastosVentas',
      'Otros Ingresos': 'otrosIngresos', 'Otros Gastos': 'otrosGastos'
    };
    for (const [cuenta, tipo] of Object.entries(esperados)) {
      const grupo = er.includes(cuenta) ? 'estadoResultados' : (pasivos.includes(cuenta) ? 'pasivos' : 'activos');
      expect(inferAccountType(grupo, cuenta)).toBe(tipo);
    }
  });

  it('normaliza tildes, mayúsculas y aliases comunes', () => {
    expect(inferAccountType('activos', 'Bancos')).toBe('efectivo');
    expect(inferAccountType('activos', 'Clientes')).toBe('cxC');
    expect(inferAccountType('estadoResultados', 'Costo de lo Vendido')).toBe('costoVentas');
    expect(inferAccountType('estadoResultados', 'Gastos de Administración')).toBe('gastosAdmin');
    expect(inferAccountType('pasivos', 'Proveedores')).toBe('cuentasPorPagar');
  });

  it('no confunde pasivo no corriente con corriente', () => {
    expect(inferAccountType('pasivos', 'Pasivo No Corriente')).toBe('pasivoLargoPlazo');
    expect(inferAccountType('pasivos', 'Documentos por Pagar a Corto Plazo')).toBe('pasivoCortoPlazo');
  });

  it('devuelve cadena vacía para cuentas desconocidas', () => {
    expect(inferAccountType('activos', 'Marca Registrada')).toBe('');
    expect(inferAccountType('estadoResultados', 'Gastos Raros')).toBe('');
  });

  it('todo el patrimonio se clasifica como patrimonio', () => {
    expect(inferAccountType('patrimonio', 'Capital Social')).toBe('patrimonio');
  });
});

describe('ACCOUNT_TYPES', () => {
  it('define los tipos esperados por grupo', () => {
    expect(ACCOUNT_TYPES.activos).toContain('efectivo');
    expect(ACCOUNT_TYPES.pasivos).toContain('pasivoLargoPlazo');
    expect(ACCOUNT_TYPES.patrimonio).toEqual(['patrimonio']);
    expect(ACCOUNT_TYPES.estadoResultados).toContain('impuestos');
  });
});

describe('computeFinancialTotals', () => {
  const custom = {
    periods: ['2024'],
    balanceGeneral: {
      '2024': {
        activos: {
          'Efectivo': 100, 'Cuentas por Cobrar': 50, 'Inventario': 30,
          'Activos Corrientes Otros': 20, 'Terrenos': 200, 'Depreciación Acumulada': -40
        },
        pasivos: {
          'Cuentas por Pagar': 100, 'Pasivo Corto Plazo': 50,
          'Provisiones': 10, 'Pasivo Largo Plazo': 90
        },
        patrimonio: { 'Capital Social': 110 }
      }
    },
    estadoResultados: {
      '2024': {
        'Ventas': 500, 'Costo de Ventas': 300, 'Gastos de Administración': 40,
        'Gastos de Ventas': 30, 'Otros Ingresos': 5, 'Otros Gastos': 3,
        'Intereses': 2, 'Impuestos': 10
      }
    }
  };

  it('suma totales, corrientes y utilidad neta con intereses e impuestos', () => {
    const t = computeFinancialTotals(custom, '2024');
    expect(t.totalActivos).toBe(360);
    expect(t.totalPasivos).toBe(250);
    expect(t.totalPatrimonio).toBe(110);
    expect(t.activosCorrientes).toBe(200);
    expect(t.pasivosCorrientes).toBe(160);
    expect(t.activosFijos).toBe(160);
    expect(t.utilidadBruta).toBe(200);
    expect(t.utilidadNeta).toBe(120);
    expect(t.classificationComplete).toBe(true);
    expect(t.unclassified).toEqual([]);
  });

  it('calcula el demo MUNO MODA en 2024', () => {
    const t = computeFinancialTotals(DATA, '2024');
    expect(t.totalActivos).toBe(825525);
    expect(t.totalPasivos).toBe(283860);
    expect(t.totalPatrimonio).toBe(587815);
    expect(t.utilidadNeta).toBe(920000 - 545000 - 130000 - 90000 + 18000 - 12000);
    expect(t.activosCorrientes).toBe(412000);
  });

  it('deja utilidad neta indeterminada si hay cuentas de ER sin clasificar', () => {
    const conDesconocida = {
      periods: ['2024'],
      balanceGeneral: { '2024': { activos: {}, pasivos: {}, patrimonio: {} } },
      estadoResultados: { '2024': { 'Ventas': 500, 'Venta de activo fijo': 10 } }
    };
    const t = computeFinancialTotals(conDesconocida, '2024');
    expect(t.utilidadNeta).toBeNull();
    expect(t.utilidadBruta).toBeNull();
    expect(t.classificationComplete).toBe(false);
    expect(t.unclassified).toEqual([
      { group: 'estadoResultados', name: 'Venta de activo fijo' }
    ]);
  });

  it('respeta la clasificación explícita para cuentas personalizadas', () => {
    const conMarca = {
      periods: ['2024'],
      balanceGeneral: {
        '2024': { activos: { 'Marca': 100 }, pasivos: {}, patrimonio: { 'Capital Social': 100 } }
      },
      estadoResultados: { '2024': {} },
      accountTypes: { activos: { 'Marca': 'activosFijos' } }
    };
    const t = computeFinancialTotals(conMarca, '2024');
    expect(t.activosFijos).toBe(100);
    expect(t.totalActivos).toBe(100);
    expect(t.classificationComplete).toBe(true);
  });

  it('rechaza importes no numéricos y tipos inválidos', () => {
    const base = { periods: ['2024'], estadoResultados: { '2024': {} } };
    expect(() => computeFinancialTotals({
      ...base,
      balanceGeneral: { '2024': { activos: { 'Efectivo': 'abc' }, pasivos: {}, patrimonio: {} } }
    }, '2024')).toThrow(/Importe inválido/);
    expect(() => computeFinancialTotals({
      ...base,
      balanceGeneral: { '2024': { activos: { 'Efectivo': NaN }, pasivos: {}, patrimonio: {} } }
    }, '2024')).toThrow(/Importe inválido/);
    expect(() => computeFinancialTotals({
      ...base,
      balanceGeneral: { '2024': { activos: { 'Marca': 1 }, pasivos: {}, patrimonio: {} } },
      accountTypes: { activos: { 'Marca': 'intangible' } }
    }, '2024')).toThrow(/Clasificación inválida/);
  });

  it('alias estadosCalculations mantiene compatibilidad', () => {
    expect(estadosCalculations(DATA, '2023').totalActivos).toBe(801475);
  });
});

describe('validateFinancialData', () => {
  const equilibrado = {
    periods: ['2024'],
    balanceGeneral: {
      '2024': { activos: { 'Efectivo': 300 }, pasivos: { 'Cuentas por Pagar': 100 }, patrimonio: { 'Capital Social': 200 } }
    },
    estadoResultados: { '2024': {} }
  };

  it('marca como equilibrado un balance cuadrado', () => {
    const [r] = validateFinancialData(equilibrado);
    expect(r.balanced).toBe(true);
    expect(r.difference).toBe(0);
    expect(r.totalActivos).toBe(300);
  });

  it('detecta descuadres con su diferencia', () => {
    const descuadrado = JSON.parse(JSON.stringify(equilibrado));
    descuadrado.balanceGeneral['2024'].activos['Efectivo'] = 301;
    const [r] = validateFinancialData(descuadrado);
    expect(r.balanced).toBe(false);
    expect(r.difference).toBe(1);
  });

  it('detecta que el demo MUNO MODA viene descuadrado de fábrica', () => {
    // Hallazgo real: los datos del demo no cuadran (diferencia constante de -70200
    // en 2023 y -46150 en 2024 entre Activos y Pasivos + Patrimonio).
    const resultados = validateFinancialData(DATA);
    expect(resultados.map(r => r.balanced)).toEqual([false, false]);
    expect(resultados.map(r => r.difference)).toEqual([-70200, -46150]);
  });

  it('un conjunto vacío no produce filas de validación', () => {
    expect(validateFinancialData({ periods: [], balanceGeneral: {}, estadoResultados: {} })).toEqual([]);
  });
});

describe('normalizeFinancialData', () => {
  it('normaliza el demo con tipos de cuenta inferidos', () => {
    const n = normalizeFinancialData(DATA);
    expect(n.name).toBe('MUNO MODA S.A.');
    expect(n.periods).toEqual(['2023', '2024']);
    expect(n.accountTypes.activos['Efectivo']).toBe('efectivo');
    expect(n.accountTypes.pasivos['Otros Pasivos']).toBe('pasivoLargoPlazo');
    expect(n.accountTypes.estadoResultados['Ventas']).toBe('ventas');
    expect(n.balanceGeneral['2024'].activos['Efectivo']).toBe(52000);
  });

  it('acepta el formato exportado con envoltorio { estados }', () => {
    const n = normalizeFinancialData({ name: 'Empresa', estados: DATA });
    expect(n.name).toBe('Empresa');
    expect(n.periods).toEqual(['2023', '2024']);
  });

  it('deriva periodos de balanceGeneral si no vienen explícitos', () => {
    const n = normalizeFinancialData({
      balanceGeneral: { '2030': { activos: {}, pasivos: {}, patrimonio: {} } },
      estadoResultados: { '2030': {} }
    });
    expect(n.periods).toEqual(['2030']);
  });

  it('acepta un borrador vacío sin periodos', () => {
    const n = normalizeFinancialData({ balanceGeneral: {}, estadoResultados: {}, periods: [] });
    expect(n.periods).toEqual([]);
    expect(n.balanceGeneral).toEqual({});
  });

  it('convierte importes decimales en texto y rechaza vacíos, booleanos y formato regional', () => {
    const n = normalizeFinancialData({
      periods: ['2024'],
      balanceGeneral: { '2024': { activos: { 'Efectivo': '150.75' }, pasivos: {}, patrimonio: {} } },
      estadoResultados: { '2024': {} }
    });
    expect(n.balanceGeneral['2024'].activos['Efectivo']).toBe(150.75);
    const casosMalos = ['', true, '1,234.50', 'abc', null];
    for (const valor of casosMalos) {
      expect(() => normalizeFinancialData({
        periods: ['2024'],
        balanceGeneral: { '2024': { activos: { 'Efectivo': valor }, pasivos: {}, patrimonio: {} } },
        estadoResultados: { '2024': {} }
      })).toThrow(/Importe inválido/);
    }
  });

  it('rechaza cuentas personalizadas sin clasificación', () => {
    expect(() => normalizeFinancialData({
      periods: ['2024'],
      balanceGeneral: { '2024': { activos: { 'Goodwill': 50 }, pasivos: {}, patrimonio: {} } },
      estadoResultados: { '2024': {} }
    })).toThrow(/sin clasificación/);
  });

  it('acepta cuentas personalizadas con tipo explícito', () => {
    const n = normalizeFinancialData({
      periods: ['2024'],
      balanceGeneral: { '2024': { activos: { 'Goodwill': 50 }, pasivos: {}, patrimonio: {} } },
      estadoResultados: { '2024': {} },
      accountTypes: { activos: { 'Goodwill': 'activosFijos' } }
    });
    expect(n.accountTypes.activos['Goodwill']).toBe('activosFijos');
  });

  it('rechaza periodos duplicados', () => {
    expect(() => normalizeFinancialData({
      periods: ['2024', '2024'],
      balanceGeneral: { '2024': { activos: {}, pasivos: {}, patrimonio: {} } },
      estadoResultados: { '2024': {} }
    })).toThrow(/duplicados/);
  });

  it('rechaza claves peligrosas y estructuras inválidas', () => {
    const malicioso = JSON.parse('{"balanceGeneral":{"2024":{"activos":{"__proto__":1},"pasivos":{},"patrimonio":{}}},"estadoResultados":{"2024":{}}}');
    expect(() => normalizeFinancialData(malicioso)).toThrow(/Clave no permitida/);
    expect(() => normalizeFinancialData([1, 2])).toThrow(/Estructura inválida/);
    expect(() => normalizeFinancialData(null)).toThrow();
    expect(() => normalizeFinancialData({})).toThrow(/Faltan estados financieros/);
  });

  it('no muta la entrada', () => {
    const entrada = JSON.parse(JSON.stringify(DATA));
    normalizeFinancialData(entrada);
    expect(entrada).toEqual(DATA);
  });
});

describe('parseFinancialJSON', () => {
  it('analiza texto JSON válido', () => {
    expect(parseFinancialJSON(JSON.stringify(DATA)).periods).toEqual(['2023', '2024']);
  });

  it('rechaza texto JSON inválido', () => {
    expect(() => parseFinancialJSON('{ no es json')).toThrow(/JSON inválido/);
  });
});
