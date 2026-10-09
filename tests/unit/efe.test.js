import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  TOLERANCIA_EFE, seleccionarPeriodoEFE, esResultadoAcumulado,
  construirEFE, interpretarEFE
} from '../../js/modules/analisis/efe-calculations.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';

// Estados con cuentas de nombre propio, como los deja el importador. Las
// clasificaciones se infieren por nombre; los casos que lo necesitan traen
// accountTypes explícito.
function estados(bg, er = {}) {
  const periodos = Object.keys(bg);
  return {
    name: 'Prueba EFE',
    periods: periodos,
    balanceGeneral: bg,
    estadoResultados: er,
    accountTypes: undefined
  };
}

function itemDe(seccion, concepto) {
  return seccion.items.find(fila => fila.concepto.includes(concepto));
}

describe('selección de periodos', () => {
  it('compara el periodo final con el inmediatamente anterior', () => {
    expect(seleccionarPeriodoEFE(['2025', '2023', '2024'])).toMatchObject({
      periodoInicial: '2024', periodoFinal: '2025'
    });
    expect(seleccionarPeriodoEFE(['Marzo', 'Enero'])).toMatchObject({
      periodoInicial: 'Marzo', periodoFinal: 'Enero'
    });
  });

  it('sin dos periodos distintos informa qué falta', () => {
    expect(seleccionarPeriodoEFE([]).incompleto).toContain('al menos 2 periodos');
    expect(seleccionarPeriodoEFE(['2025']).incompleto).toContain('al menos 2 periodos');
    expect(seleccionarPeriodoEFE(['2024', '2024']).incompleto).toContain('no son distintos');
    expect(seleccionarPeriodoEFE(undefined).incompleto).toContain('al menos 2 periodos');
  });
});

describe('cuentas de resultados acumulados', () => {
  it('reconoce las utilidades acumuladas y no el capital', () => {
    expect(esResultadoAcumulado('Utilidades Acumuladas')).toBe(true);
    expect(esResultadoAcumulado('Resultados Acumulados')).toBe(true);
    expect(esResultadoAcumulado('Utilidades Retenidas')).toBe(true);
    expect(esResultadoAcumulado('Capital Social')).toBe(false);
    expect(esResultadoAcumulado('Reservas')).toBe(false);
    expect(esResultadoAcumulado('Préstamo a Largo Plazo')).toBe(false);
  });
});

describe('estado de flujo de efectivo (método indirecto)', () => {
  // Caso resuelto a mano (2024 → 2025):
  //   Efectivo 100 → 130 (+30)      CxC 40 → 30 (−10)      Inventario 50 → 65 (+15)
  //   Equipo 200 → 260 (+60)        Dep. acum. −80 → −104 (magnitud +24)
  //   CxP 60 → 70 (+10)             Préstamo LP 100 → 120 (+20)
  //   Capital 100 → 100             Utilidades acum. 50 → 91 (+41)
  //   UN 2025 = 500 − 300 − 80 − 40 + 10 − 5 − 9 − 10 = 66
  //   CFO = 66 + 24 − 15 + 10 + 10 = 95
  //   CFI = −60 (compra de activos fijos)
  //   CFF = +20 (préstamo) + 0 (aportaciones) − 25 (dividendos = 66 − 41)
  //   Total = 95 − 60 − 5 = 30 = Δ efectivo (100 → 130).
  const bg = {
    '2024': {
      activos: { Efectivo: 100, 'Cuentas por Cobrar': 40, Inventario: 50, Equipos: 200, 'Depreciacion Acumulada': -80 },
      pasivos: { 'Cuentas por Pagar': 60, 'Prestamo Largo Plazo': 100 },
      patrimonio: { Capital: 100, 'Utilidades Acumuladas': 50 }
    },
    '2025': {
      activos: { Efectivo: 130, 'Cuentas por Cobrar': 30, Inventario: 65, Equipos: 260, 'Depreciacion Acumulada': -104 },
      pasivos: { 'Cuentas por Pagar': 70, 'Prestamo Largo Plazo': 120 },
      patrimonio: { Capital: 100, 'Utilidades Acumuladas': 91 }
    }
  };
  const er = {
    '2024': { Ventas: 400, 'Costo de Ventas': 240 },
    '2025': {
      Ventas: 500, 'Costo de Ventas': 300, 'Gastos de Administracion': 80,
      'Gastos de Ventas': 40, 'Otros Ingresos': 10, 'Otros Gastos': 5,
      'Gastos por Intereses': 9, 'Impuesto sobre la Renta': 10
    }
  };

  it('arma las tres actividades y cuadra con la variación de efectivo', () => {
    const r = construirEFE(estados(bg, er), '2024', '2025');

    expect(r.utilidadNeta).toBe(66);
    expect(itemDe(r.operacion, 'Utilidad Neta').monto).toBe(66);
    expect(itemDe(r.operacion, 'Depreciación').monto).toBe(24);
    expect(itemDe(r.operacion, 'Inventario').monto).toBe(-15);
    expect(itemDe(r.operacion, 'Cuentas por Cobrar').monto).toBe(10);
    expect(itemDe(r.operacion, 'Cuentas por Pagar').monto).toBe(10);
    expect(itemDe(r.operacion, 'Provisiones').monto).toBe(0);
    expect(r.operacion.total).toBe(95);

    expect(itemDe(r.inversion, 'activos fijos').monto).toBe(-60);
    expect(r.inversion.total).toBe(-60);

    expect(itemDe(r.financiamiento, 'largo plazo').monto).toBe(20);
    expect(itemDe(r.financiamiento, 'corto plazo').monto).toBe(0);
    expect(itemDe(r.financiamiento, 'Aportaciones').monto).toBe(0);
    expect(itemDe(r.financiamiento, 'Dividendos').monto).toBe(-25);
    expect(r.financiamiento.total).toBe(-5);

    expect(r.efectivoInicial).toBe(100);
    expect(r.efectivoFinal).toBe(130);
    expect(r.variacionEfectivo).toBe(30);
    expect(r.totalFlujos).toBe(30);
    expect(r.diferencia).toBe(0);
    expect(r.estado).toBe('cuadra');
    expect(r.motivos).toEqual([]);
    expect(r.interpretacion).toContain('el estado cuadra');
    expect(TOLERANCIA_EFE).toBe(0.01);
  });

  it('no cuadra y muestra la diferencia exacta cuando el balance no cierra', () => {
    // Mismos flujos, pero el efectivo de 2025 queda en 140: los activos de 2025
    // suman 391 contra 381 de pasivos + patrimonio (descuadre de 10).
    const desbalanceado = {
      ...bg,
      '2025': { ...bg['2025'], activos: { ...bg['2025'].activos, Efectivo: 140 } }
    };
    const r = construirEFE(estados(desbalanceado, er), '2024', '2025');
    expect(r.variacionEfectivo).toBe(40);
    expect(r.totalFlujos).toBe(30);
    expect(r.diferencia).toBe(-10);
    expect(r.estado).toBe('no-cuadra');
    expect(r.interpretacion).toContain('no ajusta cifras');
    expect(interpretarEFE(r)).toBe(r.interpretacion);
  });

  it('sin cuentas de utilidades acumuladas descuenta la utilidad del patrimonio', () => {
    // 2024: 50 = 50. 2025: 100 = 100; UN = 30 y Δpatrimonio = 50.
    // CFF = +50 (patrimonio) − 30 (UN ya en Operación) = 20; total 50 = Δ efectivo.
    const sinResultados = {
      '2024': { activos: { Efectivo: 50 }, pasivos: {}, patrimonio: { Capital: 50 } },
      '2025': { activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } }
    };
    const r = construirEFE(estados(sinResultados, {
      '2024': {}, '2025': { Ventas: 100, 'Costo de Ventas': 70 }
    }), '2024', '2025');
    expect(itemDe(r.financiamiento, 'Variación total del patrimonio').monto).toBe(50);
    expect(itemDe(r.financiamiento, 'Utilidad neta del periodo').monto).toBe(-30);
    expect(itemDe(r.financiamiento, 'Dividendos')).toBeUndefined();
    expect(r.advertencias.join(' ')).toContain('No se identificaron cuentas de utilidades acumuladas');
    expect(r.estado).toBe('cuadra');
    expect(r.totalFlujos).toBe(50);
    expect(r.diferencia).toBe(0);
  });

  it('depreciación con signo positivo se advierte y la comprobación no cuadra', () => {
    // Cuenta guardada en positivo: 80 → 104. El balance la suma como activo, de
    // modo que la identidad contable no cierra: flujos 72, efectivo +24.
    const signoPositivo = {
      '2024': { activos: { Efectivo: 100, Equipos: 200, 'Depreciacion Acumulada': 80 }, pasivos: { 'Cuentas por Pagar': 80 }, patrimonio: { Capital: 300 } },
      '2025': { activos: { Efectivo: 124, Equipos: 200, 'Depreciacion Acumulada': 104 }, pasivos: { 'Cuentas por Pagar': 80 }, patrimonio: { Capital: 348 } }
    };
    const r = construirEFE(estados(signoPositivo, {
      '2024': {}, '2025': { Ventas: 200, 'Costo de Ventas': 100, 'Gastos de Administracion': 52 }
    }), '2024', '2025');
    expect(itemDe(r.operacion, 'Depreciación').monto).toBe(24);
    expect(r.advertencias.join(' ')).toContain('signo positivo');
    expect(r.estado).toBe('no-cuadra');
    expect(r.diferencia).toBe(48);
  });

  it('baja de activos fijos: el reembolso entra en inversión y la depreciación en operación', () => {
    // Equipo de costo 100 con depreciación 80 (valor en libros 20) vendido en 20.
    // Efectivo 100 → 120 (+20); Equipo 200 → 100; Dep. acum. −80 → 0 (magnitud −80).
    // CFO = 0 − 80 = −80; CFI = +100; total 20 = Δ efectivo.
    const baja = {
      '2024': {
        activos: { Efectivo: 100, 'Cuentas por Cobrar': 40, Inventario: 50, Equipos: 200, 'Depreciacion Acumulada': -80 },
        pasivos: { 'Cuentas por Pagar': 60, 'Prestamo Largo Plazo': 100 },
        patrimonio: { Capital: 100, 'Utilidades Acumuladas': 50 }
      },
      '2025': {
        activos: { Efectivo: 120, 'Cuentas por Cobrar': 40, Inventario: 50, Equipos: 100, 'Depreciacion Acumulada': 0 },
        pasivos: { 'Cuentas por Pagar': 60, 'Prestamo Largo Plazo': 100 },
        patrimonio: { Capital: 100, 'Utilidades Acumuladas': 50 }
      }
    };
    const r = construirEFE(estados(baja, { '2024': {}, '2025': {} }), '2024', '2025');
    expect(itemDe(r.operacion, 'Depreciación').monto).toBe(-80);
    expect(itemDe(r.inversion, 'activos fijos').monto).toBe(100);
    expect(r.advertencias.join(' ')).toContain('disminuyó');
    expect(r.operacion.total).toBe(-80);
    expect(r.inversion.total).toBe(100);
    expect(r.estado).toBe('cuadra');
    expect(r.diferencia).toBe(0);
  });

  it('datos faltantes dejan la comprobación incompleta', () => {
    // 'Otra Cuenta Rara' no tiene tipo; 'Equipo Nuevo' solo existe en 2025;
    // no hay estado de resultados de 2025.
    const conFaltantes = {
      '2024': {
        activos: { Efectivo: 100, Equipo: 100 },
        pasivos: { CxP: 30, 'Otra Cuenta Rara': 70 },
        patrimonio: { Capital: 100 }
      },
      '2025': {
        activos: { Efectivo: 110, Equipo: 100, 'Equipo Nuevo': 40 },
        pasivos: { CxP: 30, 'Otra Cuenta Rara': 70 },
        patrimonio: { Capital: 150 }
      }
    };
    const r = construirEFE(estados(conFaltantes, { '2024': {} }), '2024', '2025');
    expect(r.estado).toBe('incompleta');
    expect(r.motivos.join(' ')).toContain('Otra Cuenta Rara');
    expect(r.motivos.join(' ')).toContain('no tiene clasificación');
    expect(r.motivos.join(' ')).toContain('Equipo Nuevo');
    expect(r.motivos.join(' ')).toContain('No hay estado de resultados del periodo 2025');
    expect(r.interpretacion).toContain('El EFE está incompleto');
    expect(r.interpretacion).toContain('Complete los datos en Estados Financieros');
  });

  it('sin cuentas de efectivo en un periodo no se presenta la comprobación', () => {
    const sinEfectivo = {
      '2024': { activos: { Equipo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } },
      '2025': { activos: { Equipo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } }
    };
    const r = construirEFE(estados(sinEfectivo, { '2024': {}, '2025': {} }), '2024', '2025');
    expect(r.estado).toBe('incompleta');
    expect(r.motivos.join(' ')).toContain('no tiene cuentas de efectivo');
    expect(r.efectivoInicial).toBeNull();
    expect(r.diferencia).toBeNull();
  });

  it('sin balance general de un periodo no se presenta ningún estado', () => {
    const r = construirEFE(estados({ '2024': { activos: {}, pasivos: {}, patrimonio: {} } }), '2024', '2025');
    expect(r.incompleto).toContain('No hay balance general del periodo 2025');
    expect(r.operacion).toBeNull();
    expect(r.estado).toBe('incompleta');
    expect(r.interpretacion).toBe('');
  });
});

describe('pantalla de EFE en Análisis', () => {
  function stubNavegador() {
    vi.stubGlobal('window', { location: { hash: '' }, addEventListener() {} });
    vi.stubGlobal('document', {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener() {},
      documentElement: { setAttribute() {}, getAttribute: () => 'light' }
    });
  }

  async function cargarAnalisis(data) {
    vi.resetModules();
    stubNavegador();
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
    return { analisis, html: page.innerHTML };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('la demo MUNO MODA cuadra con CFO 97,775 y Δ efectivo 7,000', async () => {
    vi.resetModules();
    stubNavegador();
    const { DEMO_MUNOMODA } = await import('../../js/modules/estados/index.js');
    const r = construirEFE(normalizeFinancialData(DEMO_MUNOMODA), '2023', '2024');
    // CFO = 104,825 + 17,950 − 15,000 − 15,000 − 5,000 + 7,000 + 3,000 = 97,775.
    // CFI = 0 (activos fijos brutos sin cambio). CFF = −55,775 (deuda LP) +
    //       5,000 (deuda CP) − 40,000 (dividendos) = −90,775.
    // Total = 97,775 + 0 − 90,775 = 7,000 = 52,000 − 45,000.
    expect(r.utilidadNeta).toBe(104825);
    expect(r.operacion.total).toBe(97775);
    expect(r.inversion.total).toBe(0);
    expect(r.financiamiento.total).toBe(-90775);
    expect(itemDe(r.financiamiento, 'Dividendos').monto).toBe(-40000);
    expect(itemDe(r.financiamiento, 'largo plazo').monto).toBe(-55775);
    expect(r.variacionEfectivo).toBe(7000);
    expect(r.totalFlujos).toBe(7000);
    expect(r.diferencia).toBe(0);
    expect(r.estado).toBe('cuadra');
  });

  it('presenta las tres actividades, la comprobación y la interpretación', async () => {
    const { html } = await cargarAnalisis(normalizeFinancialData({
      name: 'Prueba pantalla EFE',
      periods: ['2024', '2025'],
      balanceGeneral: {
        '2024': {
          activos: { Efectivo: 100, Inventario: 50 },
          pasivos: { 'Cuentas por Pagar': 30 },
          patrimonio: { Capital: 120 }
        },
        '2025': {
          activos: { Efectivo: 90, Inventario: 70 },
          pasivos: { 'Cuentas por Pagar': 40 },
          patrimonio: { Capital: 120 }
        }
      },
      estadoResultados: {
        '2024': { Ventas: 200, 'Costo de Ventas': 120 },
        '2025': { Ventas: 220, 'Costo de Ventas': 130 }
      },
      accountTypes: {
        activos: { Efectivo: 'efectivo', Inventario: 'inventario' },
        pasivos: { 'Cuentas por Pagar': 'cuentasPorPagar' },
        patrimonio: { Capital: 'patrimonio' },
        estadoResultados: { Ventas: 'ventas', 'Costo de Ventas': 'costoVentas' }
      }
    }), '2025');
    // UN 2025 = 90; CFO = 90 − 20 (inventario) + 10 (CxP) = 80; CFI = 0;
    // CFF = −60 (patrimonio 0 − UN) → total 20 = 100 − 90.
    expect(html).toContain('Método indirecto desde dos balances');
    expect(html).toContain('Operación');
    expect(html).toContain('Inversión');
    expect(html).toContain('Financiamiento');
    expect(html).toContain('Total de flujos (CFO + CFI + CFF)');
    expect(html).toContain('Diferencia (flujos − variación de efectivo)');
    expect(html).toContain('Flujo de Efectivo Operativo (CFO)');
    expect(html).toContain('Flujo de Efectivo de Inversión (CFI)');
    expect(html).toContain('Flujo de Efectivo de Financiamiento (CFF)');
    expect(html).toContain('Estado de la comprobación');
    expect(html).toContain('Cuadra');
    expect(html).toContain('No se identificaron cuentas de utilidades acumuladas');
    expect(html).toContain('Interpretación');
    expect(html).toContain('Tolerancia de la comprobación');
    expect(html).not.toContain('No cuadra');
    expect(html).not.toContain('NaN');
  });

  it('con un solo periodo explica qué falta', async () => {
    const { html } = await cargarAnalisis(normalizeFinancialData({
      name: 'Un periodo',
      periods: ['2025'],
      balanceGeneral: { '2025': { activos: { Efectivo: 10 }, pasivos: {}, patrimonio: { Capital: 10 } } },
      estadoResultados: { '2025': { Ventas: 5 } },
      accountTypes: {
        activos: { Efectivo: 'efectivo' }, pasivos: {}, patrimonio: { Capital: 'patrimonio' },
        estadoResultados: { Ventas: 'ventas' }
      }
    }), '2025');
    expect(html).toContain('Se necesitan al menos 2 periodos');
    expect(html).not.toContain('Total de flujos');
  });

  it('escapa los motivos que traen nombres de cuenta de un archivo', async () => {
    const { html } = await cargarAnalisis(normalizeFinancialData({
      name: 'Inyección',
      periods: ['2024', '2025'],
      balanceGeneral: {
        '2024': {
          activos: { Efectivo: 100 },
          pasivos: { '<img src=x onerror=alert(1)>': 50, 'Cuentas por Pagar': 10 },
          patrimonio: { Capital: 40 }
        },
        '2025': {
          activos: { Efectivo: 100 },
          pasivos: { 'Cuentas por Pagar': 10 },
          patrimonio: { Capital: 90 }
        }
      },
      estadoResultados: { '2024': { Ventas: 10 }, '2025': { Ventas: 12 } },
      accountTypes: {
        activos: { Efectivo: 'efectivo' },
        pasivos: { '<img src=x onerror=alert(1)>': 'cuentasPorPagar', 'Cuentas por Pagar': 'cuentasPorPagar' },
        patrimonio: { Capital: 'patrimonio' },
        estadoResultados: { Ventas: 'ventas' }
      }
    }), '2025');
    const bloque = html.slice(
      html.indexOf('Método indirecto desde dos balances'),
      html.indexOf('Tolerancia de la comprobación')
    );
    expect(bloque).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(bloque).not.toContain('<img src=x');
  });
});
