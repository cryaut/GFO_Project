import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  TOLERANCIA_EOAF, seleccionarPeriodoPar, clasificarMovimientoEOAF,
  construirEOAF, interpretarEOAF
} from '../../js/modules/analisis/eoaf-calculations.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';

// Estados con cuentas de nombre propio y clasificación explícita, como los deja
// el importador. `bg` recibe { [periodo]: { activos, pasivos, patrimonio } }.
function estados(bg, tipos = {}) {
  const periodos = Object.keys(bg);
  return {
    name: 'Prueba EOAF',
    periods: periodos,
    balanceGeneral: bg,
    estadoResultados: {},
    accountTypes: {
      activos: tipos.activos || {},
      pasivos: tipos.pasivos || {},
      patrimonio: tipos.patrimonio || {},
      estadoResultados: {}
    }
  };
}

function seccionDe(resultado, id) {
  return resultado.secciones.find(seccion => seccion.id === id);
}

function filaDe(resultado, id, cuenta) {
  return seccionDe(resultado, id).filas.find(fila => fila.cuenta === cuenta);
}

function construir(bg, tipos) {
  const periodos = Object.keys(bg);
  return construirEOAF(estados(bg, tipos), periodos[0], periodos[1]);
}

describe('reglas de clasificación de movimientos', () => {
  it('activos: aumento es aplicación y disminución es origen', () => {
    // 130 − 100 = +30 → la empresa pone activos en marcha: aplicación.
    expect(clasificarMovimientoEOAF('activos', 'efectivo', 100, 130))
      .toEqual({ clasificacion: 'Aplicacion', monto: 30, motivo: null });
    // 100 − 130 = −30 → libera activos: origen.
    expect(clasificarMovimientoEOAF('activos', 'efectivo', 130, 100))
      .toEqual({ clasificacion: 'Origen', monto: 30, motivo: null });
  });

  it('pasivos: aumento es origen y disminución es aplicación', () => {
    // 75 − 60 = +15 → la empresa recibe financiamiento: origen.
    expect(clasificarMovimientoEOAF('pasivos', 'cuentasPorPagar', 60, 75))
      .toEqual({ clasificacion: 'Origen', monto: 15, motivo: null });
    // 60 − 75 = −15 → paga deuda: aplicación.
    expect(clasificarMovimientoEOAF('pasivos', 'cuentasPorPagar', 75, 60))
      .toEqual({ clasificacion: 'Aplicacion', monto: 15, motivo: null });
  });

  it('patrimonio: aumento es origen y disminución es aplicación', () => {
    // 250 − 200 = +50 → capitaliza: origen. 200 − 250 = −50 → distribuye: aplicación.
    expect(clasificarMovimientoEOAF('patrimonio', 'patrimonio', 200, 250))
      .toEqual({ clasificacion: 'Origen', monto: 50, motivo: null });
    expect(clasificarMovimientoEOAF('patrimonio', 'patrimonio', 250, 200))
      .toEqual({ clasificacion: 'Aplicacion', monto: 50, motivo: null });
  });

  it('sin variación no genera movimiento', () => {
    expect(clasificarMovimientoEOAF('activos', 'inventario', 40, 40))
      .toEqual({ clasificacion: 'Sin movimiento', monto: null, motivo: null });
  });

  it('depreciación acumulada: el crecimiento de la magnitud es origen', () => {
    // −116 − (−100) = −16: la depreciación crece → origen de fondos (gasto no
    // efectivo), aunque la cuenta contra-activo se guarde en negativo.
    expect(clasificarMovimientoEOAF('activos', 'depreciacionAcumulada', -100, -116))
      .toEqual({ clasificacion: 'Origen', monto: 16, motivo: null });
    // Magnitud que baja (retiro o venta del activo) → aplicación.
    expect(clasificarMovimientoEOAF('activos', 'depreciacionAcumulada', -116, -100))
      .toEqual({ clasificacion: 'Aplicacion', monto: 16, motivo: null });
    // Signo positivo (convención no documentada): manda la magnitud, no el signo.
    expect(clasificarMovimientoEOAF('activos', 'depreciacionAcumulada', 100, 116))
      .toEqual({ clasificacion: 'Origen', monto: 16, motivo: null });
    // Cambio de signo con la misma magnitud: dato a revisar, no un movimiento.
    expect(clasificarMovimientoEOAF('activos', 'depreciacionAcumulada', -100, 100))
      .toEqual({ clasificacion: null, monto: null, motivo: 'signo-cambiado' });
  });

  it('saldo faltante y cuenta sin clasificación se reportan, no se inventan', () => {
    expect(clasificarMovimientoEOAF('activos', 'efectivo', null, 100))
      .toEqual({ clasificacion: null, monto: null, motivo: 'falta-saldo' });
    expect(clasificarMovimientoEOAF('activos', '', 100, 130))
      .toEqual({ clasificacion: null, monto: null, motivo: 'sin-clasificar' });
  });
});

describe('selección de periodos', () => {
  it('compara el periodo final con el inmediatamente anterior, en orden cronológico', () => {
    // Lista desordenada: se ordena por año antes de elegir el par.
    expect(seleccionarPeriodoPar(['2025', '2023', '2024'])).toMatchObject({
      periodoInicial: '2024', periodoFinal: '2025'
    });
    expect(seleccionarPeriodoPar(['2024', '2025'])).toMatchObject({
      periodoInicial: '2024', periodoFinal: '2025'
    });
  });

  it('con nombres sin año respeta el orden que dejó el usuario', () => {
    expect(seleccionarPeriodoPar(['Marzo', 'Enero'])).toMatchObject({
      periodoInicial: 'Marzo', periodoFinal: 'Enero'
    });
  });

  it('sin dos periodos distintos informa qué falta', () => {
    expect(seleccionarPeriodoPar([]).incompleto).toContain('al menos 2 periodos');
    expect(seleccionarPeriodoPar(['2025']).incompleto).toContain('al menos 2 periodos');
    expect(seleccionarPeriodoPar(['2024', '2024']).incompleto).toContain('no son distintos');
    expect(seleccionarPeriodoPar(undefined).incompleto).toContain('al menos 2 periodos');
  });
});

describe('estado de origen y aplicación', () => {
  // Caso resuelto a mano (2024 → 2025):
  //   Activos:  Efectivo 100 → 125 (+25 aplicación), Inventario 50 → 40 (−10 origen),
  //             Clientes 40 → 30 (−10 origen), Terreno 60 → 60 (sin movimiento)
  //                                                              total 250 → 255
  //   Pasivos:  CxP 60 → 75 (+15 origen), Préstamo 100 → 85 (−15 aplicación)
  //                                                             total 160 → 160
  //   Patrimonio: Capital 80 → 90 (+10 origen), Utilidades 10 → 5 (−5 aplicación)
  //                                                             total  90 →  95
  //   A = P + O en ambos periodos: 250 = 160 + 90 y 255 = 160 + 95.
  //   Orígenes = 10 + 10 + 15 + 10 = 45 = Aplicaciones = 25 + 15 + 5.
  const bg = {
    '2024': {
      activos: { Efectivo: 100, Inventario: 50, Clientes: 40, Terreno: 60 },
      pasivos: { 'Cuentas por Pagar': 60, Prestamo: 100 },
      patrimonio: { Capital: 80, Utilidades: 10 }
    },
    '2025': {
      activos: { Efectivo: 125, Inventario: 40, Clientes: 30, Terreno: 60 },
      pasivos: { 'Cuentas por Pagar': 75, Prestamo: 85 },
      patrimonio: { Capital: 90, Utilidades: 5 }
    }
  };
  const tipos = {
    activos: { Efectivo: 'efectivo', Inventario: 'inventario', Clientes: 'cxC', Terreno: 'activosFijos' },
    pasivos: { 'Cuentas por Pagar': 'cuentasPorPagar', Prestamo: 'pasivoLargoPlazo' },
    patrimonio: { Capital: 'patrimonio', Utilidades: 'patrimonio' }
  };

  it('clasifica activos, pasivos y patrimonio y cuadra', () => {
    const r = construir(bg, tipos);
    expect(filaDe(r, 'activos', 'Efectivo')).toMatchObject({ variacion: 25, clasificacion: 'Aplicacion', aplicacion: 25, origen: null });
    expect(filaDe(r, 'activos', 'Inventario')).toMatchObject({ variacion: -10, clasificacion: 'Origen', origen: 10, aplicacion: null });
    expect(filaDe(r, 'activos', 'Clientes')).toMatchObject({ variacion: -10, clasificacion: 'Origen', origen: 10 });
    expect(filaDe(r, 'pasivos', 'Cuentas por Pagar')).toMatchObject({ variacion: 15, clasificacion: 'Origen', origen: 15 });
    expect(filaDe(r, 'pasivos', 'Prestamo')).toMatchObject({ variacion: -15, clasificacion: 'Aplicacion', aplicacion: 15 });
    expect(filaDe(r, 'patrimonio', 'Capital')).toMatchObject({ variacion: 10, clasificacion: 'Origen', origen: 10 });
    expect(filaDe(r, 'patrimonio', 'Utilidades')).toMatchObject({ variacion: -5, clasificacion: 'Aplicacion', aplicacion: 5 });
    // Cuenta sin variación: no genera movimiento.
    expect(filaDe(r, 'activos', 'Terreno')).toMatchObject({
      variacion: 0, clasificacion: 'Sin movimiento', origen: null, aplicacion: null
    });
    expect(filaDe(r, 'activos', 'Efectivo').etiqueta).toBeNull();

    expect(r.resumen.totalOrigenes).toBe(45);
    expect(r.resumen.totalAplicaciones).toBe(45);
    expect(r.resumen.diferencia).toBe(0);
    expect(r.resumen.estado).toBe('cuadra');
    expect(r.resumen.motivos).toEqual([]);
    expect(r.interpretacion).toContain('el estado cuadra');
  });

  it('los subtotales solo suman saldos y no agregan movimientos', () => {
    const r = construir(bg, tipos);
    expect(seccionDe(r, 'activos').subtotal).toMatchObject({
      saldoInicial: 250, saldoFinal: 255, variacion: 5, completo: true
    });
    expect(seccionDe(r, 'pasivos').subtotal).toMatchObject({
      saldoInicial: 160, saldoFinal: 160, variacion: 0, completo: true
    });
    expect(seccionDe(r, 'patrimonio').subtotal).toMatchObject({
      saldoInicial: 90, saldoFinal: 95, variacion: 5, completo: true
    });
    // Los subtotales no aportan importes: los totales salen de las cuentas.
    expect(r.resumen.totalOrigenes).toBe(45);
    expect(r.resumen.totalAplicaciones).toBe(45);
  });

  it('la tolerancia de la comprobación es de un centavo', () => {
    expect(TOLERANCIA_EOAF).toBe(0.01);
    // Efectivo 10.001 → 10.003 (+0.002 aplicación); el resto sin cambios.
    // Diferencia de 0.002 ≤ 0.01 → cuadra, sin ajustar cifras.
    const r = construir({
      '2024': { activos: { Efectivo: 10.001 }, pasivos: { CxP: 5 }, patrimonio: { Capital: 5.001 } },
      '2025': { activos: { Efectivo: 10.003 }, pasivos: { CxP: 5 }, patrimonio: { Capital: 5.001 } }
    }, {
      activos: { Efectivo: 'efectivo' },
      pasivos: { CxP: 'cuentasPorPagar' },
      patrimonio: { Capital: 'patrimonio' }
    });
    expect(Math.abs(r.resumen.diferencia)).toBeGreaterThan(0);
    expect(Math.abs(r.resumen.diferencia)).toBeLessThanOrEqual(TOLERANCIA_EOAF);
    expect(r.resumen.estado).toBe('cuadra');
  });

  it('no cuadra y muestra la diferencia exacta cuando los balances no cierran', () => {
    // 2024: 100 = 40 + 60. 2025: activos 120 pero pasivos + patrimonio = 100:
    // el balance del 2025 queda descuadrado en 20.
    // Movimientos: Efectivo +20 → aplicación 20; CxP y Capital sin variación.
    // Orígenes 0 − Aplicaciones 20 = diferencia −20.
    const r = construir({
      '2024': { activos: { Efectivo: 100 }, pasivos: { CxP: 40 }, patrimonio: { Capital: 60 } },
      '2025': { activos: { Efectivo: 120 }, pasivos: { CxP: 40 }, patrimonio: { Capital: 60 } }
    }, {
      activos: { Efectivo: 'efectivo' },
      pasivos: { CxP: 'cuentasPorPagar' },
      patrimonio: { Capital: 'patrimonio' }
    });
    expect(r.resumen.estado).toBe('no-cuadra');
    expect(r.resumen.totalOrigenes).toBe(0);
    expect(r.resumen.totalAplicaciones).toBe(20);
    expect(r.resumen.diferencia).toBe(-20);
    expect(r.advertencias.join(' ')).toContain('no cumple A = P + O');
    expect(r.interpretacion).toContain('no ajusta cifras');
    expect(r.interpretacion).not.toContain('cuadra dentro de la tolerancia');
  });

  it('depreciación acumulada: se clasifica como origen y se informa la limitación', () => {
    // 2024: activos 100 + 500 − 200 = 400 = 100 + 300.
    // 2025: activos 130 + 500 − 230 = 400 = 100 + 300.
    // Efectivo +30 → aplicación 30; Depreciación acumulada −30 → origen 30.
    const r = construir({
      '2024': {
        activos: { Efectivo: 100, Equipo: 500, 'Depreciacion Acumulada': -200 },
        pasivos: { CxP: 100 }, patrimonio: { Capital: 300 }
      },
      '2025': {
        activos: { Efectivo: 130, Equipo: 500, 'Depreciacion Acumulada': -230 },
        pasivos: { CxP: 100 }, patrimonio: { Capital: 300 }
      }
    }, {
      activos: { Efectivo: 'efectivo', Equipo: 'activosFijos', 'Depreciacion Acumulada': 'depreciacionAcumulada' },
      pasivos: { CxP: 'cuentasPorPagar' }, patrimonio: { Capital: 'patrimonio' }
    });

    const depreciacion = filaDe(r, 'activos', 'Depreciacion Acumulada');
    expect(depreciacion).toMatchObject({
      variacion: -30, clasificacion: 'Origen', origen: 30, aplicacion: null
    });
    // No se agrega una fila de gasto: el modelo no lo trae y duplicaría el movimiento.
    expect(seccionDe(r, 'activos').filas.map(f => f.cuenta)).toEqual([
      'Efectivo', 'Equipo', 'Depreciacion Acumulada'
    ]);
    expect(r.advertencias.join(' ')).toContain('no registra el gasto del periodo');
    expect(r.resumen.estado).toBe('cuadra');
    expect(r.resumen.totalOrigenes).toBe(30);
    expect(r.resumen.totalAplicaciones).toBe(30);
  });

  it('retiro de activos: equipo vendido en libros sin duplicar el movimiento', () => {
    // Equipo 100 → 0 y su depreciación −40 → 0; el efectivo recibe 60 (valor en
    // libros 100 − 40). 2024: 50 + 100 − 40 = 110 = 30 + 80.
    //            2025: 110 + 0 − 0 = 110 = 30 + 80.
    // Orígenes: equipo 100. Aplicaciones: efectivo 60 + depreciación 40 = 100.
    const r = construir({
      '2024': {
        activos: { Efectivo: 50, Equipo: 100, 'Depreciacion Acumulada': -40 },
        pasivos: { CxP: 30 }, patrimonio: { Capital: 80 }
      },
      '2025': {
        activos: { Efectivo: 110, Equipo: 0, 'Depreciacion Acumulada': 0 },
        pasivos: { CxP: 30 }, patrimonio: { Capital: 80 }
      }
    }, {
      activos: { Efectivo: 'efectivo', Equipo: 'activosFijos', 'Depreciacion Acumulada': 'depreciacionAcumulada' },
      pasivos: { CxP: 'cuentasPorPagar' }, patrimonio: { Capital: 'patrimonio' }
    });
    expect(filaDe(r, 'activos', 'Equipo')).toMatchObject({ clasificacion: 'Origen', origen: 100 });
    expect(filaDe(r, 'activos', 'Efectivo')).toMatchObject({ clasificacion: 'Aplicacion', aplicacion: 60 });
    expect(filaDe(r, 'activos', 'Depreciacion Acumulada')).toMatchObject({ clasificacion: 'Aplicacion', aplicacion: 40 });
    expect(r.resumen.estado).toBe('cuadra');
    expect(r.resumen.diferencia).toBe(0);
    expect(r.advertencias.join(' ')).toContain('no se distingue la depreciación del periodo');
  });

  it('saldos en cero y variaciones negativas', () => {
    // (a) Periodos idénticos: nada varía y no hay movimientos.
    const sinMovimientos = construir({
      '2024': { activos: { Efectivo: 0 }, pasivos: { CxP: 0 }, patrimonio: { Capital: 0 } },
      '2025': { activos: { Efectivo: 0 }, pasivos: { CxP: 0 }, patrimonio: { Capital: 0 } }
    }, {
      activos: { Efectivo: 'efectivo' }, pasivos: { CxP: 'cuentasPorPagar' }, patrimonio: { Capital: 'patrimonio' }
    });
    expect(filaDe(sinMovimientos, 'activos', 'Efectivo').clasificacion).toBe('Sin movimiento');
    expect(sinMovimientos.resumen.estado).toBe('cuadra');
    expect(sinMovimientos.resumen.totalOrigenes).toBe(0);
    expect(sinMovimientos.interpretacion).toContain('Ninguna cuenta varió');

    // (b) De 0 a 50: el activo que aparece es una aplicación y el capital que
    // crece un origen. 0 = 0 + 0 y 50 = 0 + 50.
    const deCero = construir({
      '2024': { activos: { Efectivo: 0 }, pasivos: {}, patrimonio: { Capital: 0 } },
      '2025': { activos: { Efectivo: 50 }, pasivos: {}, patrimonio: { Capital: 50 } }
    }, {
      activos: { Efectivo: 'efectivo' }, pasivos: {}, patrimonio: { Capital: 'patrimonio' }
    });
    expect(filaDe(deCero, 'activos', 'Efectivo')).toMatchObject({ clasificacion: 'Aplicacion', aplicacion: 50 });
    expect(filaDe(deCero, 'patrimonio', 'Capital')).toMatchObject({ clasificacion: 'Origen', origen: 50 });
    expect(deCero.resumen.estado).toBe('cuadra');

    // (c) Patrimonio negativo que mejora: 20 = 40 − 20 y 15 = 30 − 15.
    // Efectivo −5 → origen 5; CxP −10 → aplicación 10; Capital −20 → −15 (+5) → origen 5.
    const patrimonioNegativo = construir({
      '2024': { activos: { Efectivo: 20 }, pasivos: { CxP: 40 }, patrimonio: { Capital: -20 } },
      '2025': { activos: { Efectivo: 15 }, pasivos: { CxP: 30 }, patrimonio: { Capital: -15 } }
    }, {
      activos: { Efectivo: 'efectivo' }, pasivos: { CxP: 'cuentasPorPagar' }, patrimonio: { Capital: 'patrimonio' }
    });
    expect(filaDe(patrimonioNegativo, 'patrimonio', 'Capital')).toMatchObject({
      variacion: 5, clasificacion: 'Origen', origen: 5
    });
    expect(patrimonioNegativo.resumen.estado).toBe('cuadra');
    expect(patrimonioNegativo.resumen.diferencia).toBe(0);
  });

  it('falta de datos y clasificación desconocida dejan la comprobación incompleta', () => {
    // 'Cuenta nueva' solo existe en 2025 y 'Obligacion rara' no tiene tipo.
    // 2024: 100 = 60 + 40. 2025: 140 = 60 + 80.
    const r = construir({
      '2024': {
        activos: { Efectivo: 100 },
        pasivos: { CxP: 50, 'Obligacion rara': 10 },
        patrimonio: { Capital: 40 }
      },
      '2025': {
        activos: { Efectivo: 100, 'Cuenta nueva': 40 },
        pasivos: { CxP: 50, 'Obligacion rara': 10 },
        patrimonio: { Capital: 80 }
      }
    }, {
      activos: { Efectivo: 'efectivo' },
      pasivos: { CxP: 'cuentasPorPagar' },
      patrimonio: { Capital: 'patrimonio' }
    });

    expect(r.resumen.estado).toBe('incompleta');
    expect(r.resumen.motivos.join(' ')).toContain('Cuenta nueva');
    expect(r.resumen.motivos.join(' ')).toContain('2024');
    expect(r.resumen.motivos.join(' ')).toContain('Obligacion rara');
    expect(filaDe(r, 'activos', 'Cuenta nueva')).toMatchObject({
      saldoInicial: null, clasificacion: null, falta: 'falta-saldo', etiqueta: 'Dato faltante'
    });
    expect(filaDe(r, 'pasivos', 'Obligacion rara')).toMatchObject({
      clasificacion: null, falta: 'sin-clasificar', etiqueta: 'Sin clasificar'
    });
    expect(r.interpretacion).toContain('La comprobación está incompleta');
    expect(r.interpretacion).toContain('Complete los datos en Estados Financieros');
    // Sin comprobación no se afirma que cuadre: solo Capital varió (+40 origen)
    // y 'Cuenta nueva' no es clasificable sin su saldo inicial.
    expect(r.resumen.totalOrigenes).toBe(40);
    expect(r.resumen.totalAplicaciones).toBe(0);
  });

  it('amortización acumulada sin tipo se reporta como clasificación desconocida', () => {
    // El catálogo ACCOUNT_TYPES no tiene amortización: el dato se informa en
    // lugar de clasificarlo adivinando su naturaleza contable.
    const r = construir({
      '2024': { activos: { 'Amortizacion Acumulada': -30, Efectivo: 70 }, pasivos: {}, patrimonio: { Capital: 40 } },
      '2025': { activos: { 'Amortizacion Acumulada': -45, Efectivo: 85 }, pasivos: {}, patrimonio: { Capital: 40 } }
    }, {
      activos: { Efectivo: 'efectivo' }, pasivos: {}, patrimonio: { Capital: 'patrimonio' }
    });
    expect(filaDe(r, 'activos', 'Amortizacion Acumulada').clasificacion).toBeNull();
    expect(r.resumen.estado).toBe('incompleta');
    expect(r.resumen.motivos.join(' ')).toContain('Amortizacion Acumulada');
    expect(r.resumen.motivos.join(' ')).toContain('clasificación');
  });

  it('sin balance general de un periodo no se presenta ningún estado', () => {
    const r = construirEOAF(estados({ '2024': { activos: {}, pasivos: {}, patrimonio: {} } }), '2024', '2025');
    expect(r.incompleto).toContain('No hay balance general del periodo 2025');
    expect(r.secciones).toEqual([]);
    expect(r.resumen).toBeNull();
    expect(r.interpretacion).toBe('');
  });

  it('interpretación con la fuente y la aplicación principales', () => {
    const r = construir(bg, tipos);
    expect(interpretarEOAF(r)).toBe(r.interpretacion);
    // Mayor origen: Cuentas por Pagar (+15). Mayor aplicación: Efectivo (+25).
    expect(r.interpretacion).toContain('Cuentas por Pagar');
    expect(r.interpretacion).toContain('Efectivo');
  });
});

describe('pantalla de EOAF en Análisis', () => {
  function stubNavegador() {
    vi.stubGlobal('window', { location: { hash: '' }, addEventListener() {} });
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem() {}
    });
    vi.stubGlobal('document', {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener() {},
      documentElement: { setAttribute() {}, getAttribute: () => 'light' }
    });
  }

  // Igual que analisis-razones.test.js: módulos nuevos en cada caso porque el
  // análisis guarda en caché los estados que leyó.
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

  const dosPeriodos = normalizeFinancialData({
    name: 'Prueba pantalla EOAF',
    periods: ['2024', '2025'],
    balanceGeneral: {
      '2024': {
        activos: { Efectivo: 100, Inventario: 50, Terreno: 100 },
        pasivos: { 'Cuentas por Pagar': 60 },
        patrimonio: { Capital: 190 }
      },
      '2025': {
        activos: { Efectivo: 80, Inventario: 70, Terreno: 100 },
        pasivos: { 'Cuentas por Pagar': 75 },
        patrimonio: { Capital: 175 }
      }
    },
    estadoResultados: { '2024': { Ventas: 10 }, '2025': { Ventas: 12 } },
    accountTypes: {
      activos: { Efectivo: 'efectivo', Inventario: 'inventario', Terreno: 'activosFijos' },
      pasivos: { 'Cuentas por Pagar': 'cuentasPorPagar' },
      patrimonio: { Capital: 'patrimonio' },
      estadoResultados: { Ventas: 'ventas' }
    }
  });

  it('presenta el balance comparado, los subtotales y la comprobación', async () => {
    const { html } = await cargarAnalisis(dosPeriodos);
    // Periodos seleccionados: 2024 → 2025.
    expect(html).toContain('periodo inicial');
    expect(html).toContain('Total de orígenes');
    expect(html).toContain('Total de aplicaciones');
    expect(html).toContain('Diferencia (orígenes − aplicaciones)');
    expect(html).toContain('Estado de la comprobación');
    expect(html).toContain('Subtotal Activos');
    expect(html).toContain('Subtotal Pasivos');
    expect(html).toContain('Subtotal Patrimonio');
    expect(html).toContain('Total Pasivos y Patrimonio');
    expect(html).toContain('Sin movimiento');
    expect(html).toContain('Interpretación');
    // 2024 = 100 + 50 + 100 = 60 + 190 = 250. 2025 = 80 + 70 + 100 = 75 + 175 = 250.
    // Efectivo −20 → origen 20; Inventario +20 → aplicación 20; Terreno sin movimiento;
    // CxP +15 → origen 15; Capital −15 → aplicación 15. Totales 35 = 35.
    expect(html).toContain('Cuadra');
    expect(html).not.toContain('No cuadra');
    expect(html).not.toContain('NaN');
  });

  it('con un solo periodo explica qué falta', async () => {
    const unaSola = normalizeFinancialData({
      name: 'Un periodo',
      periods: ['2025'],
      balanceGeneral: { '2025': { activos: { Efectivo: 10 }, pasivos: {}, patrimonio: { Capital: 10 } } },
      estadoResultados: { '2025': { Ventas: 5 } },
      accountTypes: {
        activos: { Efectivo: 'efectivo' }, pasivos: {}, patrimonio: { Capital: 'patrimonio' },
        estadoResultados: { Ventas: 'ventas' }
      }
    });
    const { html } = await cargarAnalisis(unaSola);
    expect(html).toContain('Se necesitan al menos 2 periodos');
    expect(html).not.toContain('Total de orígenes');
  });

  it('escapa los nombres de cuenta que vienen de un archivo', async () => {
    const conInyeccion = normalizeFinancialData({
      name: 'Inyección',
      periods: ['2024', '2025'],
      balanceGeneral: {
        '2024': { activos: { '<img src=x onerror=alert(1)>': 10 }, pasivos: {}, patrimonio: { Capital: 10 } },
        '2025': { activos: { '<img src=x onerror=alert(1)>': 20 }, pasivos: {}, patrimonio: { Capital: 20 } }
      },
      estadoResultados: { '2024': { Ventas: 5 }, '2025': { Ventas: 6 } },
      accountTypes: {
        activos: { '<img src=x onerror=alert(1)>': 'efectivo' },
        pasivos: {}, patrimonio: { Capital: 'patrimonio' },
        estadoResultados: { Ventas: 'ventas' }
      }
    });
    const { html } = await cargarAnalisis(conInyeccion);
    // El bloque del EOAF va de "Comparación de saldos" a la tolerancia final.
    const bloque = html.slice(
      html.indexOf('Comparación de saldos'),
      html.indexOf('Tolerancia de la comprobación')
    );
    expect(bloque).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(bloque).not.toContain('<img src=x');
  });

  it('la demo MUNO MODA cuadra con C$ 97,775 de cada lado', async () => {
    vi.resetModules();
    stubNavegador();
    const { DEMO_MUNOMODA } = await import('../../js/modules/estados/index.js');
    const r = construirEOAF(normalizeFinancialData(DEMO_MUNOMODA), '2023', '2024');
    // Orígenes: depreciación 17,950 + CxP 7,000 + pasivo CP 5,000 +
    //            provisiones 3,000 + utilidades acumuladas 64,825 = 97,775.
    // Aplicaciones: efectivo 7,000 + CxC 15,000 + inventario 15,000 +
    //            activos corrientes otros 5,000 + pasivo LP 35,000 +
    //            otros pasivos 20,775 = 97,775.
    expect(r.resumen.totalOrigenes).toBe(97775);
    expect(r.resumen.totalAplicaciones).toBe(97775);
    expect(r.resumen.diferencia).toBe(0);
    expect(r.resumen.estado).toBe('cuadra');
    expect(filaDe(r, 'activos', 'Depreciacion Acumulada')).toMatchObject({
      variacion: -17950, clasificacion: 'Origen', origen: 17950
    });
    expect(r.interpretacion).toContain('Utilidades Acumuladas');
    expect(r.interpretacion).toContain('Pasivo Largo Plazo');
  });
});
