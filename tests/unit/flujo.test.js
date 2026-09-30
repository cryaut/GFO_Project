import { describe, expect, it, vi } from 'vitest';
import { flujoNeto, saldoFinalEfectivo, variacionNetaEfectivo } from '../../js/utils/calculate.js';
import {
  calcularFlujo, conciliarConBalance, ejemploFlujo, normalizarFlujo, validarMovimientoFlujo
} from '../../js/modules/flujo/flujo-calculations.js';
import { flujoUI } from '../../js/modules/flujo/flujo-ui.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { clic, element, enviar, llenar, mensaje } from './helpers/dom-falso.js';

describe('fórmulas de flujo de efectivo', () => {
  it('flujo neto, variación neta y saldo final', () => {
    expect(flujoNeto(905000, 807000)).toBe(98000);
    expect(variacionNetaEfectivo(98000, -30000, -45000)).toBe(23000);
    expect(saldoFinalEfectivo(52000, 23000)).toBe(75000);
  });

  it('N/D si falta un dato', () => {
    expect(flujoNeto(null, 10)).toBeNull();
    expect(variacionNetaEfectivo(1, undefined, 2)).toBeNull();
    expect(saldoFinalEfectivo(null, 23000)).toBeNull();
  });
});

describe('caso de ejemplo', () => {
  const r = calcularFlujo(ejemploFlujo());

  it('flujos por actividad resueltos a mano', () => {
    // Operación: 905,000 − (560,000 + 205,000 + 12,000 + 30,000) = 98,000
    expect(r.neto).toEqual({ operacion: 98000, inversion: -30000, financiamiento: -45000 });
    expect(r.actividades[0]).toMatchObject({ entradas: 905000, salidas: 807000 });
    expect(r.totalEntradas).toBe(960000);
    expect(r.totalSalidas).toBe(937000);
  });

  it('variación neta y saldo final', () => {
    expect(r.variacionNeta).toBe(23000);
    expect(r.saldoFinal).toBe(75000); // 52,000 + 23,000
  });

  it('sin saldo inicial calcula la variación pero no el saldo final', () => {
    const sinSaldo = calcularFlujo({ ...ejemploFlujo(), saldoInicial: null });
    expect(sinSaldo.variacionNeta).toBe(23000);
    expect(sinSaldo.saldoFinal).toBeNull();
    expect(calcularFlujo(undefined)).toMatchObject({ variacionNeta: 0, saldoFinal: null, cantidadMovimientos: 0 });
  });
});

describe('validaciones y conciliación', () => {
  it('valida el movimiento', () => {
    expect(validarMovimientoFlujo({ concepto: 'Cobro', actividad: 'operacion', tipo: 'entrada', monto: 5 })).toEqual([]);
    const errores = validarMovimientoFlujo({ concepto: '', actividad: 'otra', tipo: 'x', monto: 0 }).join(' ');
    expect(errores).toContain('concepto');
    expect(errores).toContain('actividad');
    expect(errores).toContain('entrada o una salida');
    expect(errores).toContain('mayor que 0');
  });

  it('descarta movimientos guardados inválidos', () => {
    const limpio = normalizarFlujo({ saldoInicial: 'abc', movimientos: [
      { id: 'a', concepto: 'Cobro', actividad: 'operacion', tipo: 'entrada', monto: 10 },
      { id: 'b', concepto: 'Mal', actividad: 'operacion', tipo: 'entrada', monto: -1 },
      { id: 'c', concepto: 'Mal', actividad: 'venta', tipo: 'entrada', monto: 1 }
    ] });
    expect(limpio.saldoInicial).toBeNull();
    expect(limpio.movimientos.map(m => m.id)).toEqual(['a']);
  });

  const estados = normalizeFinancialData({
    periods: ['2023', '2024'],
    balanceGeneral: {
      2023: { activos: { Efectivo: 45000 }, pasivos: {}, patrimonio: { Capital: 45000 } },
      2024: { activos: { Efectivo: 52000 }, pasivos: {}, patrimonio: { Capital: 52000 } }
    },
    estadoResultados: { 2023: {}, 2024: {} }
  });

  it('compara el saldo final con el efectivo del periodo siguiente', () => {
    const cuadra = calcularFlujo({ saldoInicial: 45000, periodoBase: '2023', movimientos: [
      { id: 'a', concepto: 'Cobros', actividad: 'operacion', tipo: 'entrada', monto: 7000 }
    ] });
    expect(conciliarConBalance(cuadra, estados, '2023')).toMatchObject({ periodo: '2024', efectivo: 52000, cuadra: true });
    const falta = calcularFlujo({ saldoInicial: 45000, periodoBase: '2023', movimientos: [] });
    expect(conciliarConBalance(falta, estados, '2023')).toMatchObject({ diferencia: -7000, cuadra: false });
    // Sin periodo siguiente no hay con qué comparar.
    expect(conciliarConBalance(cuadra, estados, '2024')).toBeNull();
  });
});

describe('pantalla de flujo de efectivo', () => {
  function montar(datos = undefined, extra = {}) {
    const page = element();
    const guardar = vi.fn();
    const graficar = vi.fn();
    flujoUI(page, { datos, guardar, graficar, confirmar: () => true, ...extra });
    return { page, guardar, graficar };
  }

  it('con el ejemplo muestra el estado por actividades y lo interpreta', async () => {
    const { page, guardar, graficar } = montar();
    await clic(page, 'flujoEjemplo');
    expect(guardar.mock.lastCall[0].movimientos).toHaveLength(10);
    const html = page.innerHTML;
    expect(html).toContain('Actividades de operación');
    expect(html).toContain('C$ 98,000.00');
    expect(html).toContain('(C$ 560,000.00)');
    expect(html).toContain('C$ 23,000.00');
    expect(html).toContain('C$ 75,000.00');
    expect(html).toContain('La operación <strong>genera</strong>');
    expect(graficar).toHaveBeenLastCalledWith('flujoChart', expect.objectContaining({ type: 'bar' }));
  });

  it('agrega un movimiento válido y rechaza uno sin monto', async () => {
    const { page, guardar } = montar({ saldoInicial: 1000, movimientos: [] });
    llenar(page, { flujoConcepto: 'Préstamo', flujoActividad: 'financiamiento', flujoTipo: 'entrada', flujoMonto: '' });
    await enviar(page, 'formFlujo');
    expect(guardar).not.toHaveBeenCalled();
    expect(mensaje(page, 'flujoMensaje')).toContain('mayor que 0');
    llenar(page, { flujoConcepto: 'Préstamo <b>', flujoActividad: 'financiamiento', flujoTipo: 'entrada', flujoMonto: '5000' });
    await enviar(page, 'formFlujo');
    expect(guardar.mock.lastCall[0].movimientos[0]).toMatchObject({ actividad: 'financiamiento', monto: 5000 });
    expect(page.innerHTML).toContain('Préstamo &lt;b&gt;');
    expect(page.innerHTML).toContain('C$ 6,000.00'); // 1,000 + 5,000
  });

  it('toma el saldo inicial del efectivo del balance', async () => {
    const estados = normalizeFinancialData({
      periods: ['2024'],
      balanceGeneral: { 2024: { activos: { Efectivo: 52000 }, pasivos: {}, patrimonio: { Capital: 52000 } } },
      estadoResultados: { 2024: {} }
    });
    const { page, guardar } = montar(undefined, { estados });
    llenar(page, { flujoPeriodo: '2024' });
    await clic(page, 'flujoTomarSaldo');
    expect(guardar.mock.lastCall[0]).toMatchObject({ saldoInicial: 52000, periodoBase: '2024' });
    expect(page.innerHTML).toContain('tomado del efectivo del balance de 2024');
  });

  it('borra un movimiento', async () => {
    const { page, guardar } = montar(ejemploFlujo());
    await clic(page, 'borrarFlujo-0');
    expect(guardar.mock.lastCall[0].movimientos).toHaveLength(9);
    expect(page.innerHTML).not.toContain('aria-label="Borrar Cobros a clientes"');
    expect(page.innerHTML).toContain('aria-label="Borrar Pagos a proveedores"');
  });
});
