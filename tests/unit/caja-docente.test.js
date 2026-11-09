import { describe, expect, it } from 'vitest';
import { proyectarCajaDocente, validarCajaDocente } from '../../js/modules/planeacion/caja-docente-calculations.js';
import { ejemploCajaDocente } from '../../js/modules/planeacion/caja-docente-ejemplos.js';
import { validarRespaldo } from '../../js/modules/integracion/integracion-respaldo.js';

// Cálculo independiente de la revisión AFOD. Orden: saldo inicial, entradas, salidas,
// efectivo antes de financiar, necesidad, efectivo después de financiar, CxC, CxP.
const esperados = {
  pinolero1: [
    [15000, 307500, 284350, 38150, 0, 38150, 411700, 102000],
    [38150, 416450, 417000, 37600, 0, 37600, 495250, 120000],
    [37600, 502250, 539000, 850, 14150, 850, 593000, 144000],
    [850, 590000, 542750, 48100, 0, 48100, 628000, 150000],
    [48100, 624750, 568500, 104350, 0, 104350, 653250, 156000],
    [104350, 652750, 678000, 79100, 0, 79100, 700500, 168000]
  ],
  pinolero2: [
    [15000, 304500, 268150, 51350, 0, 51350, 411500, 153000],
    [51350, 419000, 353000, 117350, 0, 117350, 492500, 180000],
    [117350, 502500, 451000, 168850, 0, 168850, 590000, 216000],
    [168850, 592500, 471000, 290350, 0, 290350, 622500, 225000],
    [290350, 625000, 494000, 421350, 0, 421350, 647500, 234000],
    [421350, 652500, 585000, 488850, 0, 488850, 695000, 252000]
  ],
  halley: [
    [50000, 210000, 213000, 47000, 0, 47000, 380000, 280000],
    [47000, 320000, 418000, -51000, 76000, -51000, 360000, 245000],
    [-51000, 340000, 305000, -16000, 41000, -16000, 250000, 168000]
  ],
  halleyPrestamo: [
    [50000, 210000, 213000, 47000, 0, 47000, 380000, 280000],
    [47000, 320000, 418000, -51000, 76000, 25000, 360000, 245000],
    [25000, 340000, 305000, 60000, 0, 60000, 250000, 168000]
  ],
  halleyRepago: [
    [50000, 210000, 213000, 47000, 0, 47000, 380000, 280000],
    [47000, 320000, 418000, -51000, 76000, 25000, 360000, 245000],
    [25000, 340000, 305000, 60000, 0, 25000, 250000, 168000]
  ]
};

describe('Presupuesto de caja por calendario AFOD', () => {
  it.each(Object.entries(esperados))('concilia cada mes de %s con la referencia independiente', (id, esperado) => {
    const { meses } = proyectarCajaDocente(ejemploCajaDocente(id));
    expect(meses).toHaveLength(esperado.length);
    meses.forEach((m, i) => {
      const real = [m.inicial, m.entradas, m.salidas, m.antes, m.necesidad, m.final, m.cxcFinal, m.cxpFinal];
      esperado[i].forEach((valor, j) => expect(real[j]).toBeCloseTo(valor, 6));
      expect(m.inicial + m.entradas - m.salidas).toBeCloseTo(m.antes, 6);
      expect(m.antes + m.movimientos.prestamo - m.movimientos.repago).toBeCloseTo(m.final, 6);
      expect(m.cxcInicial + m.ventas - m.cobros.importe).toBeCloseTo(m.cxcFinal, 6);
      expect(m.cxpInicial + m.compras - m.proveedores.importe).toBeCloseTo(m.cxpFinal, 6);
    });
  });

  it('muestra las cuotas de mayo y junio y aplica los impuestos en sus fechas', () => {
    const { meses, financiamientoMaximo } = proyectarCajaDocente(ejemploCajaDocente('pinolero1'));
    expect(meses[0].cobros.cuotas.map(c => c.origen)).toEqual(['Julio', 'Junio', 'Mayo']);
    // 425000 × 12 % + 290000 × 75 % + 300000 × 13 %.
    expect(meses[0].cobros.cuotas.map(c => c.importe)).toEqual([51000, 217500, 39000]);
    expect(meses.map(m => m.movimientos.irPagado)).toEqual([0, 0, 40000, 0, 0, 45000]);
    expect(financiamientoMaximo).toBe(14150);
    expect(meses[2].final).toBe(850);
    expect(meses[3].inicial).toBe(850);
  });

  it('separa la amortización programada de la deuda adicional', () => {
    const { meses } = proyectarCajaDocente(ejemploCajaDocente('halleyRepago'));
    expect(meses[2].movimientos).toMatchObject({ irPagado: 25000, amortizacion: 20000, repago: 35000 });
    expect(meses[2].deudaAdicional).toBe(41000);
    expect(meses[2].final).toBe(25000);
  });

  it('mantiene N/D cuando falta una venta histórica y conserva los cálculos independientes', () => {
    const plan = ejemploCajaDocente('pinolero1');
    plan.ventas[0] = null;
    const { meses, financiamientoMaximo } = proyectarCajaDocente(plan);
    expect(meses[0].cobros.importe).toBeNull();
    expect(meses[0].proveedores.importe).toBeCloseTo(222600, 6);
    expect(meses[0].final).toBeNull();
    expect(meses[1].cobros.importe).toBeCloseTo(416450, 6);
    expect(meses[1].final).toBeNull();
    expect(financiamientoMaximo).toBeNull();
  });

  it('rechaza calendarios que no suman 100 % y repagos sin préstamo adicional', () => {
    const plan = ejemploCajaDocente('halley');
    expect(() => validarCajaDocente({ ...plan, cobros: [0.7] })).toThrow(/100 %/);
    plan.movimientos.repago[0] = 1;
    expect(() => validarCajaDocente(plan)).toThrow(/repago supera/);
  });

  it('restaura el calendario como parte del módulo y rechaza un respaldo inválido', () => {
    const actual = { planeacion: { supuestos: { precio: 42 } } };
    const cajaDocente = ejemploCajaDocente('pinolero1');
    const restaurado = validarRespaldo({ planeacion: { cajaDocente } }, actual);
    expect(restaurado.modulos.planeacion).toEqual({ supuestos: { precio: 42 }, cajaDocente });
    expect(restaurado.omitidos).toEqual([]);
    cajaDocente.movimientos.prestamo = [];
    expect(() => validarRespaldo({ planeacion: { cajaDocente } }, actual)).toThrow(/Préstamo recibido/);
    expect(actual.planeacion).toEqual({ supuestos: { precio: 42 } });
  });
});
