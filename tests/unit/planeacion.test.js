import { describe, expect, it, vi } from 'vitest';
import { comprasPresupuestadas, costoBienesVendidos, financiamientoRequerido } from '../../js/utils/calculate.js';
import {
  ajustarLista, calcularPresupuestoMaestro, ejemploPlaneacion, normalizarSupuestos, validarSupuestos
} from '../../js/modules/planeacion/planeacion-calculations.js';
import { calcularCVU } from '../../js/modules/equilibrio/equilibrio-calculations.js';
import { calcularInventario, ejemploInventario } from '../../js/modules/inventario/inventario-calculations.js';
import { planeacionUI } from '../../js/modules/planeacion/planeacion-ui.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { cambiar, clic, element, enviar, llenar, mensaje } from './helpers/dom-falso.js';

const ejemplo = normalizarSupuestos(ejemploPlaneacion());
const p = calcularPresupuestoMaestro(ejemplo);

describe('fórmulas del presupuesto maestro', () => {
  it('compras, costo de bienes vendidos y financiamiento requerido', () => {
    expect(comprasPresupuestadas(250, 60, 50)).toBe(260); // 250 + 60 − 50
    expect(comprasPresupuestadas(100, 0, 150)).toBe(-50);
    expect(costoBienesVendidos(24000, 124800, 28800)).toBe(120000); // 24,000 + 124,800 − 28,800
    expect(financiamientoRequerido(19200, 40000)).toBe(20800);
    expect(financiamientoRequerido(102100, 40000)).toBe(0);
    expect(financiamientoRequerido(null, 40000)).toBeNull();
  });
});

describe('caso MUNO MODA 2025 por trimestres', () => {
  it('ventas y cobros (60 % contado, 40 % el trimestre siguiente)', () => {
    expect(p.ventas.importe).toEqual([200000, 240000, 240000, 320000]);
    // T1 = 120,000 + CxC inicial 135,000; T2 = 144,000 + 40 % × 200,000
    expect(p.ventas.cobros).toEqual([255000, 224000, 240000, 288000]);
  });

  it('compras: ventas + inventario final deseado − inventario inicial', () => {
    expect(p.compras.inventarioFinal).toEqual([60, 60, 80, 56]); // 20 % de 300, 300 y 400; 56 al cierre
    expect(p.compras.unidades).toEqual([260, 300, 320, 376]);
    expect(p.compras.importe).toEqual([124800, 144000, 153600, 180480]);
    // T1 = 50 % × 124,800 + CxP inicial 92,000
    expect(p.compras.pagos).toEqual([154400, 134400, 148800, 167040]);
  });

  it('costo de bienes vendidos y gastos de operación', () => {
    expect(p.cbv.costo).toEqual([120000, 144000, 144000, 192000]);
    expect(p.gastos.total).toEqual([52000, 54000, 54000, 58000]); // 5 % de ventas + 37,500 + 4,500
    expect(p.gastos.pagados).toEqual([47500, 49500, 49500, 53500]);
  });

  it('estado de resultados presupuestado', () => {
    expect(p.resultados.uaii).toEqual([28000, 42000, 42000, 70000]);
    expect(p.resultados.ir).toEqual([7500, 11700, 11700, 20100]); // 30 % de la UAI
    expect(p.resultados.utilidadNeta).toEqual([17500, 27300, 27300, 46900]);
    expect(p.totales).toMatchObject({ ventas: 1000000, cbv: 600000, gastosOperacion: 218000, uaii: 182000, ir: 51000, utilidadNeta: 119000 });
  });

  it('presupuesto de caja con financiamiento requerido en el trimestre 2', () => {
    // T2: 102,100 + 224,000 − (134,400 + 49,500 + 3,000 + 120,000) = 19,200 < 40,000
    expect(p.caja.saldoFinal).toEqual([102100, 19200, 57900, 122360]);
    expect(p.caja.financiamiento).toEqual([0, 20800, 0, 0]);
    expect(p.caja.excedente).toEqual([62100, 0, 17900, 82360]);
    expect(p.financiamientoMaximo).toBe(20800);
    expect(p.periodoFinanciamiento).toBe('Trimestre 2');
    expect(p.avisos).toContainEqual(expect.objectContaining({ codigo: 'financiamiento', periodo: 'Trimestre 2', monto: 20800 }));
  });

  it('cuadran las identidades de CxC, CxP, inventario y caja', () => {
    const s = ejemplo;
    const t = p.totales;
    expect(p.cierre.cxc).toBe(s.cxcInicial + t.ventas - t.cobros); // 128,000
    expect(p.cierre.cxp).toBe(s.cxpInicial + t.compras - t.pagosProveedores); // 90,240
    expect(p.cierre.inventarioUnidades).toBe(s.inventarioInicial + t.comprasUnidades - t.unidades); // 56
    expect(p.cierre.efectivo).toBe(s.saldoInicialCaja + t.cobros - t.desembolsos); // 122,360
    expect(p.cierre).toMatchObject({ cxc: 128000, cxp: 90240, inventarioValor: 26880, irPorPagar: 51000 });
  });

  it('punto de equilibrio por trimestre, igual al del módulo C-V-U', () => {
    expect(p.equilibrio).toMatchObject({ cvu: 520, mcu: 280, costosFijos: 42000, peUnidades: 150 });
    expect(p.equilibrio.margenSeguridad).toEqual([0.4, 0.5, 0.5, 0.625]);
    expect(p.totales.margenSeguridad).toBeCloseTo(0.52, 10); // (1,250 − 600) / 1,250
    const cvu = calcularCVU({ precio: 800, costoVariableUnitario: 520, costosFijos: 42000, unidades: 250 });
    expect(cvu.uaii).toBe(p.resultados.uaii[0]);
  });
});

describe('casos especiales y validación', () => {
  it('si el inventario inicial sobra, no compra y avisa', () => {
    const r = calcularPresupuestoMaestro({ ...ejemplo, inventarioInicial: 1000 });
    expect(r.compras.unidades[0]).toBe(0);
    expect(r.compras.inventarioFinalReal[0]).toBe(750);
    expect(r.cbv.costo[0]).toBe(120000); // sigue siendo 250 × 480
    expect(r.avisos).toContainEqual(expect.objectContaining({ codigo: 'sin-compras', periodo: 'Trimestre 1', sobrante: 690 }));
  });

  it('avisa cuando el inventario final queda bajo el stock mínimo del producto', () => {
    const r = calcularPresupuestoMaestro({ ...ejemplo, stockMinimo: 70 });
    expect(r.avisos.filter(a => a.codigo === 'bajo-stock-minimo').map(a => a.periodo))
      .toEqual(['Trimestre 1', 'Trimestre 2', 'Trimestre 4']);
  });

  it('valida los supuestos', () => {
    expect(validarSupuestos(ejemplo)).toEqual([]);
    expect(validarSupuestos(null)).toHaveLength(1);
    expect(validarSupuestos({ ...ejemplo, precio: 0 }).join(' ')).toContain('Precio de venta');
    expect(validarSupuestos({ ...ejemplo, pctContado: 1.2 }).join(' ')).toContain('entre 0 y 100 %');
    expect(validarSupuestos({ ...ejemplo, tasaIR: 1 }).join(' ')).toContain('99.99 %');
    expect(validarSupuestos({ ...ejemplo, ventasUnidades: [1, 2] }).join(' ')).toContain('Unidades a vender');
    expect(validarSupuestos({ ...ejemplo, periodos: 13 }).join(' ')).toContain('entre 1 y 12');
  });

  it('ajusta las listas por periodo al número de periodos', () => {
    expect(ajustarLista([1, 2], 4)).toEqual([1, 2, 2, 2]);
    expect(ajustarLista([1, 2, 3], 2)).toEqual([1, 2]);
    expect(ajustarLista(undefined, 2)).toEqual([0, 0]);
    expect(normalizarSupuestos(undefined)).toBeNull();
  });
});

describe('pantalla del presupuesto maestro', () => {
  function montar(datos = undefined, extra = {}) {
    const page = element();
    const guardar = vi.fn();
    const graficar = vi.fn();
    planeacionUI(page, { datos, guardar, graficar, ...extra });
    return { page, guardar, graficar };
  }

  it('sin supuestos invita a cargar el ejemplo', () => {
    const { page, graficar } = montar();
    expect(page.innerHTML).toContain('Todavía no hay un presupuesto calculado');
    expect(graficar).not.toHaveBeenCalled();
  });

  it('con el ejemplo muestra los presupuestos, las alertas y la gráfica de caja', async () => {
    const { page, guardar, graficar } = montar();
    await clic(page, 'planEjemplo');
    expect(guardar.mock.lastCall[0].supuestos).toMatchObject({ precio: 800, periodos: 4 });
    const html = page.innerHTML;
    for (const titulo of ['Presupuesto de ventas y cobros', 'Presupuesto de compras', 'Presupuesto del costo de bienes vendidos',
      'Presupuesto de gastos de operación', 'Presupuesto de caja', 'Estado de resultados presupuestado']) {
      expect(html).toContain(titulo);
    }
    expect(html).toContain('C$ 1,000,000.00');
    expect(html).toContain('C$ 119,000.00');
    expect(html).toContain('C$ 122,360.00');
    expect(html).toContain('Se requieren C$ 20,800.00 de financiamiento');
    expect(graficar).toHaveBeenLastCalledWith('planChart', expect.objectContaining({ type: 'bar' }));
  });

  it('recalcula al cambiar un supuesto y rechaza valores inválidos', async () => {
    const { page, guardar } = montar({ supuestos: ejemploPlaneacion() });
    await cambiar(page, 'plan-precio', '0', 'input');
    await enviar(page, 'formPlaneacion');
    expect(guardar).not.toHaveBeenCalled();
    expect(mensaje(page, 'planMensaje')).toContain('Precio de venta unitario (C$): debe ser mayor que 0');
    await cambiar(page, 'plan-precio', '900', 'input');
    await cambiar(page, 'planOtros-1', '0', 'input');
    await enviar(page, 'formPlaneacion');
    expect(guardar.mock.lastCall[0].supuestos).toMatchObject({ precio: 900, otrosDesembolsos: [0, 0, 0, 0] });
    expect(page.innerHTML).toContain('No se requiere');
  });

  it('cambia el número de periodos', async () => {
    const { page } = montar({ supuestos: ejemploPlaneacion() });
    await cambiar(page, 'planPeriodos', '2');
    expect(page.querySelector('#planVentas-1')).not.toBeNull();
    expect(page.querySelector('#planVentas-2')).toBeNull();
    expect(mensaje(page, 'planMensaje')).toContain('sin guardar');
  });

  it('toma los saldos del balance y el inventario de un producto', async () => {
    const estados = normalizeFinancialData({
      periods: ['2024'],
      balanceGeneral: { 2024: {
        activos: { Efectivo: 52000, 'Cuentas por Cobrar': 135000 },
        pasivos: { 'Cuentas por Pagar': 92000 },
        patrimonio: { Capital: 95000 }
      } },
      estadoResultados: { 2024: {} }
    });
    const inventario = calcularInventario(ejemploInventario());
    const { page, guardar } = montar({ supuestos: { ...ejemploPlaneacion(), cxcInicial: 0, saldoInicialCaja: 0 } }, { estados, inventario });
    await clic(page, 'planTomarBalance');
    expect(mensaje(page, 'planMensaje')).toContain('efectivo C$ 52,000.00');
    llenar(page, { planProducto: 'demo-camisa' });
    await clic(page, 'planTomarInventario');
    expect(mensaje(page, 'planMensaje')).toContain('Camisa casual');
    await enviar(page, 'formPlaneacion');
    expect(guardar.mock.lastCall[0].supuestos).toMatchObject({
      saldoInicialCaja: 52000, cxcInicial: 135000, cxpInicial: 92000,
      inventarioInicial: 35, costoUnitario: 350, stockMinimo: 40, productoInventario: 'Camisa casual'
    });
  });
});
