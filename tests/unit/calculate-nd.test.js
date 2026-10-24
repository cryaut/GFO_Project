import { describe, expect, it } from 'vitest';
import * as calculos from '../../js/utils/calculate.js';

// Resultados independientes, con los mismos argumentos numéricos completos en cada caso.
// Las posiciones opcionales se prueban aparte: una opción inactiva no es un saldo ausente.
const casos = [
  ['saldoPromedio', [100, 200], 150],
  ['variacion', [200, 100], 100],
  ['ah', [20, 100], 0.2],
  ['ahDelta', [120, 100], 20],
  ['ahPctDelta', [120, 100], 0.2],
  ['av', [20, 100], 0.2],
  ['ratioCorriente', [200, 100], 2],
  ['ratioRapido', [200, 50, 100], 1.5],
  ['rotacionInventario', [200, 100], 2],
  ['rotacionCxC', [200, 100], 2],
  ['plazoCobro', [5], 73],
  ['endeudamiento', [20, 100], 0.2],
  ['margenNeto', [20, 100], 0.2],
  ['roa', [20, 100], 0.2],
  ['capitalNetoTrabajo', [200, 100], 100],
  ['capitalNetoOperativo', [200, 100], 100],
  ['pruebaDefensiva', [20, 100], 0.2],
  ['rotacionActivos', [200, 100], 2],
  ['rotacionCxP', [200, 100], 2],
  ['plazoPago', [5], 73],
  ['edadInventario', [5], 73],
  ['cicloConversion', [30, 5, 10], 66.5],
  ['coberturaIntereses', [200, 100], 2],
  ['deudaPatrimonio', [200, 100], 2],
  ['apalancamiento', [200, 100], 2],
  ['margenBruto', [20, 100], 0.2],
  ['margenOperativo', [200, 50, 50, 500], 0.2],
  ['roe', [20, 100], 0.2],
  ['rotacionActivosFijos', [200, 100], 2],
  ['rotacionCapitalTrabajo', [200, 100], 2],
  ['solvencia', [200, 100], 2],
  ['depAnualLineaRecta', [1100, 100, 5], 200],
  ['depAcumulada', [200, 3, 5], 600],
  ['valorEnLibros', [1000, 200], 800],
  ['ahorroMensual', [1200, 12], 100],
  ['saldoSemanal', [1000, 500, 200], 300],
  ['tasaEfectiva', [30, 100], 0.3],
  ['denominadorGaf', [100], 100],
  ['gao', [200, 100], 2],
  ['gaf', [200, 100], 2],
  ['gat', [200, 100], 2],
  ['gaoVariacion', [100, 120, 20, 30], 2.5],
  ['gafVariacion', [100, 120, 20, 30], 2.5],
  ['gatVariacion', [100, 120, 20, 30], 2.5],
  ['margenContribucionUnitario', [100, 20], 80],
  ['razonMargenContribucion', [20, 100], 0.2],
  ['puntoEquilibrioUnidades', [200, 100], 2],
  ['puntoEquilibrioVentas', [200, 0.5], 400],
  ['unidadesUtilidadObjetivo', [100, 100, 20], 10],
  ['margenSeguridad', [100, 80], 0.2],
  ['existenciaFinal', [100, 30, 20], 110],
  ['valorInventario', [20, 100], 2000],
  ['necesitaReposicion', [20, 100], true],
  ['flujoNeto', [200, 100], 100],
  ['variacionNetaEfectivo', [100, -50, -20], 30],
  ['saldoFinalEfectivo', [100, 20], 120],
  ['comprasPresupuestadas', [100, 20, 10], 110],
  ['costoBienesVendidos', [100, 20, 10], 110],
  ['financiamientoRequerido', [20, 100], 80],
  ['capacidadAhorro', [200, 100], 100],
  ['tasaAhorro', [20, 100], 0.2],
  ['utilidadPorAccion', [200, 100], 2],
  ['precioUtilidad', [200, 100], 2],
  ['valorLibrosPorAccion', [200, 100], 2],
  ['precioValorLibros', [200, 100], 2],
  ['dividendoPorAccion', [200, 100], 2],
  ['razonPagoDividendos', [20, 100], 0.2],
  ['rendimientoDividendo', [20, 100], 0.2]
];

describe.each(casos)('%s: propagación de N/D', (nombre, argumentos, esperado) => {
  it('conserva el resultado con datos completos', () => {
    const resultado = calculos[nombre](...argumentos);
    if (typeof esperado === 'boolean') expect(resultado).toBe(esperado);
    else expect(resultado).toBeCloseTo(esperado, 10);
  });

  it.each([null, undefined])('cada operando obligatorio %s produce N/D', ausente => {
    argumentos.forEach((_, posicion) => {
      const incompletos = [...argumentos];
      incompletos[posicion] = ausente;
      expect(calculos[nombre](...incompletos), `operando ${posicion + 1}`).toBeNull();
    });
  });
});

describe('Operandos en objetos y colecciones', () => {
  it.each([null, undefined])('DuPont conserva solo componentes independientes de %s', ausente => {
    expect(calculos.dupont(ausente, 100, 50, 25))
      .toEqual({ PM: null, AT: 2, EM: 2, ROE: null });
    expect(calculos.dupont(20, ausente, 50, 25))
      .toEqual({ PM: null, AT: null, EM: 2, ROE: null });
    expect(calculos.dupont(20, 100, ausente, 25))
      .toEqual({ PM: 0.2, AT: null, EM: null, ROE: null });
    expect(calculos.dupont(20, 100, 50, ausente))
      .toEqual({ PM: 0.2, AT: 2, EM: null, ROE: null });
    expect(calculos.eoaf('Inventario', ausente, 'activo')).toBeNull();
  });

  it.each([null, undefined])('EFE devuelve N/D sin lanzar con utilidad, lista o ajuste %s', ausente => {
    expect(calculos.efeIndirecto(ausente, [20, -5])).toBeNull();
    expect(calculos.efeIndirecto(100, ausente)).toBeNull();
    for (const ajustes of [[ausente, 20], [20, ausente]]) {
      expect(calculos.efeIndirecto(100, ajustes)).toBeNull();
    }
  });

  it('EFE conserva ceros explícitos y ajustes vacíos', () => {
    expect(calculos.efeIndirecto(0, [0])).toBe(0);
    expect(calculos.efeIndirecto(100, [])).toBe(100);
  });

  it('EFE no omite huecos de una lista de ajustes como si fueran cero', () => {
    expect(calculos.efeIndirecto(100, Array(1))).toBeNull();
    const ajustes = Array(3);
    ajustes[0] = 20;
    ajustes[2] = -5;
    expect(calculos.efeIndirecto(100, ajustes)).toBeNull();
  });
});

describe('Parámetros opcionales y ceros explícitos', () => {
  it('una reserva omitida usa cero; una reserva explícitamente desconocida es N/D', () => {
    expect(calculos.saldoSemanal(1000, 500, 200)).toBe(300);
    expect(calculos.saldoSemanal(1000, 500, 200, undefined)).toBe(300);
    expect(calculos.saldoSemanal(1000, 500, 200, 0)).toBe(300);
    expect(calculos.saldoSemanal(1000, 500, 200, null)).toBeNull();
  });

  it('DAP omitido es cero y no exige una tasa inactiva; DAP desconocido es N/D', () => {
    expect(calculos.denominadorGaf(100)).toBe(100);
    expect(calculos.gaf(200, 100, undefined, null)).toBe(2);
    expect(calculos.gat(200, 100, 0, undefined)).toBe(2);
    for (const nombre of ['denominadorGaf', 'gaf', 'gat']) {
      const argumentos = nombre === 'denominadorGaf' ? [100] : [200, 100];
      expect(calculos[nombre](...argumentos, null, 0.3)).toBeNull();
      expect(calculos[nombre](...argumentos, 10, null)).toBeNull();
      expect(calculos[nombre](...argumentos, 10, undefined)).toBeNull();
    }
  });

  it('D-005 usa la tasa alternativa válida si la efectiva no está disponible', () => {
    expect(calculos.tasaImpuesto(5, 0)).toBe(0.3);
    expect(calculos.tasaImpuesto(5, 0, 0.15)).toBe(0.15);
    expect(calculos.tasaImpuesto(5, 0, null)).toBeNull();
    expect(calculos.tasaImpuesto(30, 100, null)).toBe(0.3);
    expect(calculos.tasaImpuesto(null, 100, 0.15)).toBe(0.15);
  });

  it.each([null, undefined])('D-005 conserva la tasa configurada con IR o UAI %s', ausente => {
    expect(calculos.tasaImpuesto(ausente, 100)).toBe(0.3);
    expect(calculos.tasaImpuesto(30, ausente, 0.15)).toBe(0.15);
    expect(calculos.tasaImpuesto(ausente, ausente, 0)).toBe(0);
    expect(calculos.tasaImpuesto(ausente, 100, null)).toBeNull();
  });

  it('un cero válido no se confunde con un dato ausente', () => {
    expect(calculos.saldoPromedio(0, 0)).toBe(0);
    expect(calculos.variacion(0, 0)).toBe(0);
    expect(calculos.ah(0, 100)).toBe(0);
    expect(calculos.av(0, 100)).toBe(0);
    expect(calculos.av(100, 0)).toBe(0); // Convención legada de AV, sin cambio de fórmula.
    expect(calculos.ratioCorriente(0, 100)).toBe(0);
    expect(calculos.ratioRapido(0, 0, 100)).toBe(0);
    expect(calculos.margenOperativo(0, 0, 0, 100)).toBe(0);
    expect(calculos.depAnualLineaRecta(100, 0, 0)).toBe(0);
    expect(calculos.depAcumulada(100, 0, 10)).toBe(0);
    expect(calculos.valorEnLibros(0, 0)).toBe(0);
    expect(calculos.ahorroMensual(100, 0)).toBe(100);
    expect(calculos.saldoSemanal(0, 0, 0, 0)).toBe(0);
    expect(calculos.tasaImpuesto(0, 100)).toBe(0);
  });

  it('comprueba los operandos ausentes antes de aplicar casos especiales con cero', () => {
    expect(calculos.av(null, 0)).toBeNull();
    expect(calculos.depAnualLineaRecta(null, 0, 0)).toBeNull();
    expect(calculos.ahorroMensual(null, 0)).toBeNull();
  });
});
