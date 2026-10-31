import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  esResultadoAcumulado, construirEFE, interpretarEFE
} from '../../js/modules/analisis/efe-calculations.js';
import { rolEFE } from '../../js/modules/analisis/efe-roles.js';
import { TOLERANCIA_COMPROBACION } from '../../js/modules/analisis/comprobacion-calculations.js';
import { normalizeFinancialData, parseFinancialJSON } from '../../js/modules/estados/estados-normalize.js';
import { listarCuentas } from '../../js/modules/estados/cuentas-identificador.js';

// Referencia independiente del EFE para el bloque A (calculada fuera de la app).
const REFERENCIA_BLOQUE_A = JSON.parse(
  readFileSync(new URL('./fixtures/efe_ronda1_referencia_bloque_A.json', import.meta.url), 'utf8')
);
const ENTRADA_BLOQUE_A = JSON.parse(
  readFileSync(new URL('./fixtures/estados_ronda2_bloque_A.json', import.meta.url), 'utf8')
);

describe('roles del EFE por id de cuenta (D-066)', () => {
  it('cada activo y pasivo del catálogo tiene rol', () => {
    for (const cuenta of listarCuentas()) {
      if (cuenta.grupo === 'activos' || cuenta.grupo === 'pasivos') {
        expect(rolEFE(cuenta.id), cuenta.id).not.toBeNull();
      }
    }
  });

  it('separa lo que el tipo general mezclaba', () => {
    // Pasivos corrientes no financieros: operación. Préstamos de corto plazo:
    // financiamiento. Inversiones de corto plazo: inversión. Provisiones de
    // largo plazo: operación. El patrimonio no tiene rol (van por nombre).
    expect(rolEFE('bs.accrued_expenses_payable')).toBe('operacion');
    expect(rolEFE('bs.taxes_payable')).toBe('operacion');
    expect(rolEFE('bs.other_current_liabilities')).toBe('operacion');
    expect(rolEFE('bs.long_term_provisions')).toBe('operacion');
    expect(rolEFE('bs.short_term_borrowings')).toBe('financiamiento');
    expect(rolEFE('bs.current_portion_long_term_debt')).toBe('financiamiento');
    expect(rolEFE('bs.short_term_investments')).toBe('inversion');
    expect(rolEFE('bs.cash_and_equivalents')).toBe('efectivo');
    expect(rolEFE('bs.current_year_result_equity')).toBeNull();
    expect(rolEFE('id-inexistente')).toBeNull();
  });
});

describe('totales reportados fuera del EFE (D-067)', () => {
  it('el par A3 2024 → 2025 usa los componentes y cuadra con la referencia', () => {
    const a3 = ENTRADA_BLOQUE_A.conjuntos.find(conjunto => conjunto.id === 'A3');
    const datos = parseFinancialJSON(JSON.stringify(a3.entrada));
    const r = construirEFE(datos, '2024', '2025');
    const referencia = REFERENCIA_BLOQUE_A.pares.find(par => par.id === 'A3');
    expect(r.estado).toBe('cuadra');
    expect(r.motivos).toEqual([]);
    expect(Math.abs(r.operacion.total - referencia.operacion)).toBeLessThanOrEqual(0.01);
    expect(Math.abs(r.inversion.total - referencia.inversion)).toBeLessThanOrEqual(0.01);
    expect(Math.abs(r.financiamiento.total - referencia.financiamiento)).toBeLessThanOrEqual(0.01);
  });

  it('un total sin componentes en los datos sigue entrando (no se pierde la variación)', () => {
    // Solo «Inventario» (total reportado) sin desglose: su variación es el único
    // dato del concepto y debe seguir contando en la operación.
    const conTotal = {
      '2024': { activos: { Efectivo: 100, 'Inventario': 50 }, pasivos: { 'Cuentas por Pagar': 50 }, patrimonio: { 'Capital social': 100 } },
      '2025': { activos: { Efectivo: 100, 'Inventario': 80 }, pasivos: { 'Cuentas por Pagar': 50 }, patrimonio: { 'Capital social': 130 } }
    };
    const r = construirEFE(estados(conTotal, {
      '2024': {}, '2025': { Ventas: 100, 'Devoluciones sobre ventas': 0, 'Descuentos sobre ventas': 0, 'Rebajas sobre ventas': 0, 'Costo de Ventas': 70 }
    }), '2024', '2025');
    expect(itemDe(r.operacion, 'activos de operación').monto).toBe(-30);
    expect(r.estado).toBe('cuadra');
  });
});

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

describe('cuentas de resultados acumulados', () => {
  it('reconoce las utilidades acumuladas y no el capital', () => {
    expect(esResultadoAcumulado('Utilidades Acumuladas')).toBe(true);
    expect(esResultadoAcumulado('Resultados Acumulados')).toBe(true);
    expect(esResultadoAcumulado('Utilidades Retenidas')).toBe(true);
    expect(esResultadoAcumulado('Capital Social')).toBe(false);
    expect(esResultadoAcumulado('Reservas')).toBe(false);
    expect(esResultadoAcumulado('Préstamo a Largo Plazo')).toBe(false);
  });

  it('reconoce el singular y las cuentas del resultado del ejercicio', () => {
    expect(esResultadoAcumulado('Utilidad acumulada')).toBe(true);
    expect(esResultadoAcumulado('Resultado acumulado')).toBe(true);
    expect(esResultadoAcumulado('Utilidad retenida')).toBe(true);
    expect(esResultadoAcumulado('Ganancias acumuladas')).toBe(true);
    expect(esResultadoAcumulado('Pérdidas acumuladas')).toBe(true);
    expect(esResultadoAcumulado('Utilidad del ejercicio')).toBe(true);
    expect(esResultadoAcumulado('Utilidades del periodo')).toBe(true);
    expect(esResultadoAcumulado('Resultado del ejercicio')).toBe(true);
    // Una reserva sale de las utilidades pero no es el resultado acumulado.
    expect(esResultadoAcumulado('Reserva legal')).toBe(false);
  });
});

describe('estado de flujo de efectivo (método indirecto)', () => {
  // Caso resuelto a mano (2024 → 2025):
  //   Efectivo 100 → 130 (+30)      CxC 40 → 30 (−10)      Inventario de mercaderías 50 → 65 (+15)
  //   Maquinaria 200 → 260 (+60)        Dep. acum. −80 → −104 (magnitud +24)
  //   CxP 60 → 70 (+10)             Préstamo LP 100 → 120 (+20)
  //   Capital 100 → 100             Utilidades acum. 50 → 91 (+41)
  //   UN 2025 = 500 − 300 − 80 − 40 + 10 − 5 − 9 − 10 = 66
  //   CFO = 66 + 24 − 15 + 10 + 10 = 95
  //   CFI = −60 (compra de activos fijos)
  //   CFF = +20 (préstamo) + 0 (aportaciones) − 25 (dividendos = 66 − 41)
  //   Total = 95 − 60 − 5 = 30 = Δ efectivo (100 → 130).
  const bg = {
    '2024': {
      activos: { Efectivo: 100, 'Cuentas por Cobrar': 40, 'Inventario de mercaderías': 50, 'Maquinaria y equipo': 200, 'Depreciacion Acumulada': -80 },
      pasivos: { 'Cuentas por Pagar': 60, 'Deudas de largo plazo': 100 },
      patrimonio: { Capital: 100, 'Utilidades Acumuladas': 50 }
    },
    '2025': {
      activos: { Efectivo: 130, 'Cuentas por Cobrar': 30, 'Inventario de mercaderías': 65, 'Maquinaria y equipo': 260, 'Depreciacion Acumulada': -104 },
      pasivos: { 'Cuentas por Pagar': 70, 'Deudas de largo plazo': 120 },
      patrimonio: { Capital: 100, 'Utilidades Acumuladas': 91 }
    }
  };
  const er = {
    '2024': {
      Ventas: 400,
      'Devoluciones sobre ventas': 0, 'Descuentos sobre ventas': 0, 'Rebajas sobre ventas': 0,
      'Costo de Ventas': 240
    },
    '2025': {
      Ventas: 500,
      'Devoluciones sobre ventas': 0, 'Descuentos sobre ventas': 0, 'Rebajas sobre ventas': 0,
      'Costo de Ventas': 300, 'Gastos de Administracion': 80,
      'Gastos de Ventas': 40, 'Otros Ingresos': 10, 'Otros Gastos': 5,
      'Gastos por Intereses': 9, 'Impuesto sobre la Renta': 10
    }
  };

  it('arma las tres actividades y cuadra con la variación de efectivo', () => {
    const r = construirEFE(estados(bg, er), '2024', '2025');

    expect(r.utilidadNeta).toBe(66);
    expect(itemDe(r.operacion, 'Utilidad Neta').monto).toBe(66);
    expect(itemDe(r.operacion, 'Depreciación').monto).toBe(24);
    // D-066: los activos y pasivos de operación van consolidados por rol
    // (inventario +15 y CxC −10 → −5; CxP +10).
    expect(itemDe(r.operacion, 'activos de operación').monto).toBe(-5);
    expect(itemDe(r.operacion, 'pasivos de operación').monto).toBe(10);
    expect(r.operacion.total).toBe(95);

    expect(itemDe(r.inversion, 'activos de inversión').monto).toBe(-60);
    expect(r.inversion.total).toBe(-60);

    expect(itemDe(r.financiamiento, 'Aumento de deuda').monto).toBe(20);
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
    expect(TOLERANCIA_COMPROBACION).toBe(0.01);
  });

  it('la interpretación dice si la operación alcanza para la inversión y qué hizo el financiamiento', () => {
    // CFO 95, CFI −60, CFF −5: la operación cubre la inversión (95 − 60 = 35 ≥ 0)
    // y el financiamiento devolvió o distribuyó 5 (préstamo +20, dividendos −25).
    const r = construirEFE(estados(bg, er), '2024', '2025');
    expect(r.interpretacion).toContain('La operación generó C$ 95.00 de efectivo');
    expect(r.interpretacion).toContain('alcanzó para cubrir la inversión');
    expect(r.interpretacion).toContain('el financiamiento devolvió o distribuyó C$ 5.00');

    // Operación negativa (−30) con inversión (−20) y financiamiento (+50): consume
    // efectivo, no cubre la inversión por 50 y el financiamiento aporta 50.
    const consume = {
      '2024': { activos: { Efectivo: 100, 'Inventario de mercaderías': 0, 'Maquinaria y equipo': 100 }, pasivos: { 'Deudas de largo plazo': 0 }, patrimonio: { Capital: 200 } },
      '2025': { activos: { Efectivo: 100, 'Inventario de mercaderías': 30, 'Maquinaria y equipo': 120 }, pasivos: { 'Deudas de largo plazo': 50 }, patrimonio: { Capital: 200 } }
    };
    const c = construirEFE(estados(consume, { '2024': {}, '2025': {} }), '2024', '2025');
    // UN 0; CFO = 0 − 30 (inventario) = −30; CFI = −20; CFF = +50 (préstamo); total 0 = Δ efectivo.
    expect(c.operacion.total).toBe(-30);
    expect(c.inversion.total).toBe(-20);
    expect(c.financiamiento.total).toBe(50);
    expect(c.estado).toBe('cuadra');
    expect(c.interpretacion).toContain('La operación consumió C$ 30.00 de efectivo');
    expect(c.interpretacion).toContain('no alcanzó a cubrir la inversión (faltaron C$ 50.00)');
    expect(c.interpretacion).toContain('el financiamiento aportó C$ 50.00');
  });

  it('un cambio de cero no se presenta como menos cero', () => {
    // Inventario, CxC y activos fijos sin variación: el opuesto de 0 no debe ser -0
    // (formatCurrency(-0) mostraría "C$ -0.00").
    const sinCambios = {
      '2024': { activos: { Efectivo: 100, 'Inventario de mercaderías': 50, 'Cuentas por Cobrar': 20, 'Maquinaria y equipo': 100 }, pasivos: { 'Cuentas por Pagar': 70 }, patrimonio: { Capital: 200 } },
      '2025': { activos: { Efectivo: 100, 'Inventario de mercaderías': 50, 'Cuentas por Cobrar': 20, 'Maquinaria y equipo': 100 }, pasivos: { 'Cuentas por Pagar': 70 }, patrimonio: { Capital: 200 } }
    };
    const r = construirEFE(estados(sinCambios, { '2024': {}, '2025': {} }), '2024', '2025');
    const todos = [...r.operacion.items, ...r.inversion.items, ...r.financiamiento.items];
    expect(todos.length).toBeGreaterThan(0);
    for (const fila of todos) {
      expect(Object.is(fila.monto, -0)).toBe(false);
    }
    expect(r.inversion.items[0].monto).toBe(0);
    expect(r.operacion.total).toBe(0);
    expect(Object.is(r.totalFlujos, -0)).toBe(false);
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
      '2024': {}, '2025': {
        Ventas: 100,
        'Devoluciones sobre ventas': 0, 'Descuentos sobre ventas': 0, 'Rebajas sobre ventas': 0,
        'Costo de Ventas': 70
      }
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
      '2024': { activos: { Efectivo: 100, 'Maquinaria y equipo': 200, 'Depreciacion Acumulada': 80 }, pasivos: { 'Cuentas por Pagar': 80 }, patrimonio: { Capital: 300 } },
      '2025': { activos: { Efectivo: 124, 'Maquinaria y equipo': 200, 'Depreciacion Acumulada': 104 }, pasivos: { 'Cuentas por Pagar': 80 }, patrimonio: { Capital: 348 } }
    };
    const r = construirEFE(estados(signoPositivo, {
      '2024': {}, '2025': {
        Ventas: 200,
        'Devoluciones sobre ventas': 0, 'Descuentos sobre ventas': 0, 'Rebajas sobre ventas': 0,
        'Costo de Ventas': 100, 'Gastos de Administracion': 52
      }
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
        activos: { Efectivo: 100, 'Cuentas por Cobrar': 40, 'Inventario de mercaderías': 50, 'Maquinaria y equipo': 200, 'Depreciacion Acumulada': -80 },
        pasivos: { 'Cuentas por Pagar': 60, 'Deudas de largo plazo': 100 },
        patrimonio: { Capital: 100, 'Utilidades Acumuladas': 50 }
      },
      '2025': {
        activos: { Efectivo: 120, 'Cuentas por Cobrar': 40, 'Inventario de mercaderías': 50, 'Maquinaria y equipo': 100, 'Depreciacion Acumulada': 0 },
        pasivos: { 'Cuentas por Pagar': 60, 'Deudas de largo plazo': 100 },
        patrimonio: { Capital: 100, 'Utilidades Acumuladas': 50 }
      }
    };
    const r = construirEFE(estados(baja, { '2024': {}, '2025': {} }), '2024', '2025');
    expect(itemDe(r.operacion, 'Depreciación').monto).toBe(-80);
    expect(itemDe(r.inversion, 'activos de inversión').monto).toBe(100);
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

  it('un importe que no es un número deja el estado incompleto en lugar de lanzar', () => {
    // El efectivo de 2025 llegó como texto: antes computeFinancialTotals lanzaba
    // "Importe inválido" y la pantalla de Análisis quedaba vacía.
    const textoEnSaldo = {
      '2024': { activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } },
      '2025': { activos: { Efectivo: 'cien' }, pasivos: {}, patrimonio: { Capital: 100 } }
    };
    const r = construirEFE(estados(textoEnSaldo, { '2024': {}, '2025': { Ventas: 1 } }), '2024', '2025');
    expect(r.estado).toBe('incompleta');
    expect(r.efectivoFinal).toBeNull();
    expect(r.variacionEfectivo).toBeNull();
    expect(r.diferencia).toBeNull();
    expect(r.motivos.join(' ')).toContain('«Efectivo» no tiene saldo en el periodo 2025');
    expect(r.motivos.join(' ')).toContain('No se pudo calcular la utilidad neta');

    // Un importe inválido en el estado de resultados tampoco lanza.
    const balanceado = {
      '2024': { activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } },
      '2025': { activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } }
    };
    const erInvalido = construirEFE(estados(balanceado, { '2024': {}, '2025': { Ventas: 'abc' } }), '2024', '2025');
    expect(erInvalido.estado).toBe('incompleta');
    expect(erInvalido.utilidadNeta).toBeNull();
    expect(erInvalido.motivos.join(' ')).toContain('Ventas');
  });

  it('sin estado de resultados lo dice una vez; con estado de resultados vacío avisa', () => {
    const balanceado = {
      '2024': { activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } },
      '2025': { activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } }
    };
    const sinER = construirEFE(estados(balanceado, { '2024': {} }), '2024', '2025');
    expect(sinER.estado).toBe('incompleta');
    expect(sinER.motivos).toHaveLength(1);
    expect(sinER.motivos[0]).toContain('No hay estado de resultados del periodo 2025');
    // No se culpa a "cuentas sin clasificar" cuando lo que falta es el estado.
    expect(sinER.motivos.join(' ')).not.toContain('sin clasificar');

    const erVacio = construirEFE(estados(balanceado, { '2024': {}, '2025': {} }), '2024', '2025');
    expect(erVacio.utilidadNeta).toBe(0);
    expect(erVacio.estado).toBe('cuadra');
    expect(erVacio.advertencias.join(' ')).toContain('no tiene cuentas');
  });

  it('un balance descuadrado se avisa por periodo, igual que en el EOAF', () => {
    const descuadrado = {
      '2024': { activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } },
      '2025': { activos: { Efectivo: 130 }, pasivos: {}, patrimonio: { Capital: 100 } }
    };
    const r = construirEFE(estados(descuadrado, { '2024': {}, '2025': {} }), '2024', '2025');
    // 2025: activos 130 contra 100 de patrimonio → descuadre de 30.
    expect(r.advertencias.join(' ')).toContain('El balance del periodo 2025 no cumple A = P + O');
    expect(r.advertencias.join(' ')).not.toContain('El balance del periodo 2024');
    expect(r.estado).toBe('no-cuadra');
  });

  it('las cuentas del resultado del ejercicio no se confunden con aportaciones ni con dividendos', () => {
    // Caso resuelto a mano (2024 → 2025), sin deuda:
    //   Efectivo 180 → 210 (+30)    Capital 100 → 100
    //   Utilidades acumuladas 50 → 70 (+20)  Utilidad del ejercicio 30 → 40 (+10)
    //   UN 2025 = 100 − 60 = 40. ΔRE = 20 + 10 = 30 → dividendos = 40 − 30 = 10.
    //   Aportaciones = Δpatrimonio (30) − ΔRE (30) = 0. CFO 40 + CFF (−10) = 30 = Δ efectivo.
    // Si «Utilidad del ejercicio» no se reconociera, ΔRE sería 20: los dividendos
    // saldrían en 20 y el ejercicio (+10) figuraría como aportación de capital.
    const conEjercicio = {
      '2024': { activos: { Efectivo: 180 }, pasivos: {}, patrimonio: { Capital: 100, 'Utilidad acumulada': 50, 'Utilidad del ejercicio': 30 } },
      '2025': { activos: { Efectivo: 210 }, pasivos: {}, patrimonio: { Capital: 100, 'Utilidad acumulada': 70, 'Utilidad del ejercicio': 40 } }
    };
    const r = construirEFE(estados(conEjercicio, {
      '2024': {}, '2025': {
        Ventas: 100,
        'Devoluciones sobre ventas': 0, 'Descuentos sobre ventas': 0, 'Rebajas sobre ventas': 0,
        'Costo de Ventas': 60
      }
    }), '2024', '2025');
    expect(r.utilidadNeta).toBe(40);
    expect(itemDe(r.financiamiento, 'Dividendos').monto).toBe(-10);
    expect(itemDe(r.financiamiento, 'Aportaciones').monto).toBe(0);
    expect(r.operacion.total).toBe(40);
    expect(r.financiamiento.total).toBe(-10);
    expect(r.totalFlujos).toBe(30);
    expect(r.variacionEfectivo).toBe(30);
    expect(r.estado).toBe('cuadra');
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
    // D-066: la deuda corriente no financiera y las provisiones son operación;
    // solo la deuda (largo plazo + otros pasivos no corrientes) es financiamiento.
    // Total = 102,775 + 0 − 95,775 = 7,000 = 52,000 − 45,000.
    expect(r.utilidadNeta).toBe(104825);
    expect(r.operacion.total).toBe(102775);
    expect(r.inversion.total).toBe(0);
    expect(r.financiamiento.total).toBe(-95775);
    expect(itemDe(r.financiamiento, 'Dividendos').monto).toBe(-40000);
    expect(itemDe(r.financiamiento, 'Aumento de deuda').monto).toBe(-55775);
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
          activos: { Efectivo: 100, 'Inventario de mercaderías': 50 },
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
    // La pestaña EOAF también imprime «Tolerancia de la comprobación» y va antes
    // que el EFE: el final del bloque se busca desde el inicio del bloque del EFE.
    const inicio = html.indexOf('Método indirecto desde dos balances');
    const bloque = html.slice(inicio, html.indexOf('Tolerancia de la comprobación', inicio));
    expect(bloque).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(bloque).not.toContain('<img src=x');
  });

  it('un importe no numérico guardado no deja vacía la pantalla de Análisis', async () => {
    // Regresión: computeEFE lanzaba "Importe inválido" y toda la pantalla quedaba
    // en blanco; en main, con los mismos datos, se renderizaba completa.
    const { html } = await cargarAnalisis({
      name: 'Importe de texto',
      periods: ['2024', '2025'],
      balanceGeneral: {
        '2024': { activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } },
        '2025': { activos: { Efectivo: 'cien' }, pasivos: {}, patrimonio: { Capital: 100 } }
      },
      estadoResultados: { '2024': { Ventas: 1 }, '2025': { Ventas: 2 } },
      accountTypes: {
        activos: { Efectivo: 'efectivo' }, pasivos: {}, patrimonio: { Capital: 'patrimonio' },
        estadoResultados: { Ventas: 'ventas' }
      }
    });
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain('Método indirecto desde dos balances');
    expect(html).toContain('No se pudo calcular la utilidad neta');
    expect(html).toContain('Comprobación incompleta');
  });

  it('computeEFE compara el cierre indicado con el periodo inmediatamente anterior', async () => {
    const periodo = () => ({ activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } });
    const { analisis } = await cargarAnalisis(normalizeFinancialData({
      name: 'Tres periodos',
      periods: ['2023', '2024', '2025'],
      balanceGeneral: { '2023': periodo(), '2024': periodo(), '2025': periodo() },
      estadoResultados: { '2023': { Ventas: 1 }, '2024': { Ventas: 2 }, '2025': { Ventas: 3 } },
      accountTypes: {
        activos: { Efectivo: 'efectivo' }, pasivos: {}, patrimonio: { Capital: 'patrimonio' },
        estadoResultados: { Ventas: 'ventas' }
      }
    }));
    expect(analisis.computeEFE('2025').periodos).toEqual({ inicial: '2024', final: '2025' });
    expect(analisis.computeEFE('2024').periodos).toEqual({ inicial: '2023', final: '2024' });
    // El primer periodo no tiene anterior: se explica qué falta.
    expect(analisis.computeEFE('2023').incompleto).toContain('No hay un periodo anterior a 2023');
  });

  it('la demo no muestra "C$ -0.00" en ninguna fila del EFE', async () => {
    vi.resetModules();
    stubNavegador();
    const { DEMO_MUNOMODA } = await import('../../js/modules/estados/index.js');
    const { html } = await cargarAnalisis(normalizeFinancialData(DEMO_MUNOMODA));
    const inicio = html.indexOf('Método indirecto desde dos balances');
    const bloque = html.slice(inicio, html.indexOf('Tolerancia de la comprobación', inicio));
    expect(inicio).toBeGreaterThan(-1);
    // La fila de activos de inversión de la demo no varía: es C$ 0.00, no C$ -0.00.
    expect(bloque).toContain('Venta o baja de activos de inversión');
    expect(bloque).not.toContain('-0.00');
  });
});

// La prueba de D-068 va antes de las variantes de la ronda 1 (T5).
describe('reservas como destino de utilidades (D-068)', () => {
  it('un traspaso a reservas no figura como aportación ni distorsiona los dividendos', () => {
    // Caso resuelto a mano: UN 80; ΔUA 0; ΔReservas +20; ΔResultado +30.
    // D-068: dividendos = 80 − (0 + 20 + 30) = 30; aportaciones = 50 − 50 = 0.
    // Con la regla anterior la reserva parecía capital: dividendos 50, aportaciones 20.
    const traspaso = {
      '2024': {
        activos: { Efectivo: 100, 'Inventario de mercaderías': 50, 'Maquinaria y equipo': 130, 'Depreciacion Acumulada': -20 },
        pasivos: { 'Cuentas por pagar comerciales': 40, 'Deudas de largo plazo': 40 },
        patrimonio: { 'Capital social': 100, 'Utilidades acumuladas': 30, 'Reservas': 0, 'Resultado del ejercicio': 50 }
      },
      '2025': {
        activos: { Efectivo: 150, 'Inventario de mercaderías': 60, 'Maquinaria y equipo': 150, 'Depreciacion Acumulada': -40 },
        pasivos: { 'Cuentas por pagar comerciales': 50, 'Deudas de largo plazo': 40 },
        patrimonio: { 'Capital social': 100, 'Utilidades acumuladas': 30, 'Reservas': 20, 'Resultado del ejercicio': 80 }
      }
    };
    const r = construirEFE(estados(traspaso, {
      '2024': {},
      '2025': {
        Ventas: 500,
        'Devoluciones sobre ventas': 0, 'Descuentos sobre ventas': 0, 'Rebajas sobre ventas': 0,
        'Costo de Ventas': 300, 'Gastos de Administracion': 80,
        'Gastos por Intereses': 20, 'Impuesto sobre la Renta': 20
      }
    }), '2024', '2025');
    expect(r.utilidadNeta).toBe(80);
    expect(itemDe(r.financiamiento, 'Dividendos').monto).toBe(-30);
    expect(itemDe(r.financiamiento, 'Aportaciones').monto).toBe(0);
    expect(r.financiamiento.total).toBe(-30);
    expect(r.operacion.total).toBe(100);
    expect(r.inversion.total).toBe(-20);
    expect(r.estado).toBe('cuadra');
  });
});
