import { describe, expect, it } from 'vitest';
import {
  TOLERANCIA_COMPROBACION, toleranciaComprobacion, seleccionarPeriodoPar,
  variacionesDeCuentas, advertenciasDeBalance
} from '../../js/modules/analisis/comprobacion-calculations.js';

describe('tolerancia de la comprobación', () => {
  it('es un centavo más el epsilon escalado a los totales', () => {
    expect(TOLERANCIA_COMPROBACION).toBe(0.01);
    // Totales pequeños: el epsilon se escala por el mayor total (5) → 0.01 + EPSILON × 5.
    expect(toleranciaComprobacion(5, 3)).toBe(0.01 + Number.EPSILON * 5);
    expect(toleranciaComprobacion(5, 3)).toBeCloseTo(0.01, 12);
    // Totales grandes: 0.01 + EPSILON × 2e9 sigue siendo ≈ 0.01 (EPSILON ≈ 2.2e-16).
    const grande = toleranciaComprobacion(1e9, -2e9);
    expect(grande).toBe(0.01 + Number.EPSILON * 2e9);
    expect(grande).toBeGreaterThan(0.01);
    expect(grande).toBeLessThan(0.01001);
  });

  it('ignora los totales N/D (null o no finitos)', () => {
    expect(toleranciaComprobacion(null, undefined, NaN)).toBe(0.01 + Number.EPSILON);
    expect(toleranciaComprobacion()).toBe(0.01 + Number.EPSILON);
  });
});

describe('selección del par de periodos', () => {
  it('compara el periodo final con el inmediatamente anterior, en orden cronológico', () => {
    // Lista desordenada: se ordena por año antes de elegir el par.
    expect(seleccionarPeriodoPar(['2025', '2023', '2024'])).toMatchObject({
      periodoInicial: '2024', periodoFinal: '2025', periodos: ['2023', '2024', '2025']
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
    expect(seleccionarPeriodoPar(['2024', ' ', '']).incompleto).toContain('hay 1');
  });

  it('un periodo repetido no se cuenta dos veces', () => {
    expect(seleccionarPeriodoPar(['2023', '2024', '2024', '2025'])).toMatchObject({
      periodoInicial: '2024', periodoFinal: '2025', periodos: ['2023', '2024', '2025']
    });
  });

  it('con un cierre dado lo compara contra el periodo inmediatamente anterior', () => {
    const periodos = ['2022', '2023', '2024', '2025'];
    expect(seleccionarPeriodoPar(periodos, '2024')).toMatchObject({
      periodoInicial: '2023', periodoFinal: '2024'
    });
    // Un cierre que no está en la lista usa los dos periodos más recientes.
    expect(seleccionarPeriodoPar(periodos, '1999')).toMatchObject({
      periodoInicial: '2024', periodoFinal: '2025'
    });
    // El primer periodo no tiene anterior: se explica qué falta.
    expect(seleccionarPeriodoPar(periodos, '2022').incompleto).toContain('No hay un periodo anterior a 2022');
  });
});

describe('variaciones por cuenta', () => {
  const datos = {
    balanceGeneral: {
      '2024': { activos: { Efectivo: 100, Equipo: 50 }, pasivos: {}, patrimonio: { Capital: 150 } },
      '2025': { activos: { Efectivo: 130, 'Cuenta Rara': 40 }, pasivos: {}, patrimonio: { Capital: 170 } }
    },
    accountTypes: { activos: { Efectivo: 'efectivo' }, pasivos: {}, patrimonio: {} }
  };

  it('une las cuentas de los dos periodos y calcula la variación', () => {
    const filas = variacionesDeCuentas(datos, 'activos', '2024', '2025');
    // Primero las del periodo inicial; después las que solo aparecen en el final.
    expect(filas.map(fila => fila.cuenta)).toEqual(['Efectivo', 'Equipo', 'Cuenta Rara']);
    // Efectivo: 130 − 100 = 30. Equipo y Cuenta Rara solo existen en un periodo: sin variación.
    expect(filas[0]).toMatchObject({ saldoInicial: 100, saldoFinal: 130, variacion: 30, tipo: 'efectivo' });
    expect(filas[1]).toMatchObject({ saldoInicial: 50, saldoFinal: null, variacion: null });
    expect(filas[2]).toMatchObject({ saldoInicial: null, saldoFinal: 40, variacion: null });
  });

  it('una cuenta sin tipo conocido queda con tipo vacío', () => {
    const filas = variacionesDeCuentas(datos, 'activos', '2024', '2025');
    expect(filas[2].tipo).toBe('');
  });

  it('un saldo que no es un número finito es un dato faltante, no un texto que se suma', () => {
    const sucios = {
      balanceGeneral: {
        '2024': { activos: { Efectivo: 100, Caja: '50', Banco: NaN }, pasivos: {}, patrimonio: {} },
        '2025': { activos: { Efectivo: 130, Caja: 60, Banco: Infinity }, pasivos: {}, patrimonio: {} }
      }
    };
    const filas = variacionesDeCuentas(sucios, 'activos', '2024', '2025');
    expect(filas[0].variacion).toBe(30);
    expect(filas[1]).toMatchObject({ cuenta: 'Caja', saldoInicial: null, saldoFinal: 60, variacion: null });
    expect(filas[2]).toMatchObject({ cuenta: 'Banco', saldoInicial: null, saldoFinal: null, variacion: null });
  });

  it('sin el grupo en los datos devuelve una lista vacía', () => {
    expect(variacionesDeCuentas(datos, 'pasivos', '2024', '2025')).toEqual([]);
    expect(variacionesDeCuentas({}, 'activos', '2024', '2025')).toEqual([]);
    expect(variacionesDeCuentas(undefined, 'activos', '2024', '2025')).toEqual([]);
  });
});

describe('advertencias de balance', () => {
  const periodos = { inicial: '2024', final: '2025' };

  it('no avisa cuando A = P + O en los dos periodos', () => {
    const bg = { activos: { Efectivo: 100 }, pasivos: { CxP: 40 }, patrimonio: { Capital: 60 } };
    expect(advertenciasDeBalance({}, periodos, bg, bg)).toEqual([]);
  });

  it('avisa del periodo descuadrado con la diferencia exacta', () => {
    // 2024: 100 = 40 + 60. 2025: activos 120 contra 40 + 60 = 100 → descuadre de 20.
    const bgInicial = { activos: { Efectivo: 100 }, pasivos: { CxP: 40 }, patrimonio: { Capital: 60 } };
    const bgFinal = { activos: { Efectivo: 120 }, pasivos: { CxP: 40 }, patrimonio: { Capital: 60 } };
    const avisos = advertenciasDeBalance({}, periodos, bgInicial, bgFinal);
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toContain('periodo 2025');
    expect(avisos[0]).toContain('no cumple A = P + O');
    expect(avisos[0]).toContain('20');
  });

  it('un descuadre de medio centavo se tolera', () => {
    const bg = { activos: { Efectivo: 100.005 }, pasivos: { CxP: 40 }, patrimonio: { Capital: 60 } };
    expect(advertenciasDeBalance({}, periodos, bg, bg)).toEqual([]);
  });
});
