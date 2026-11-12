// F5 (D-113): balance proforma 2025 de AGRI-CORP y contraste con el 2025 auditado.
import { describe, expect, it } from 'vitest';
import { casoHistoricoReal } from '../../js/examples/ejemplos-agricorp.js';
import { calcularPresupuestoMaestro, normalizarSupuestos } from '../../js/modules/planeacion/planeacion-calculations.js';
import { balanceProforma, periodosProforma, saldosAgrupados } from '../../js/modules/proforma/proforma-balance-calculations.js';
import { construirReporte } from '../../js/modules/proforma/proforma-calculations.js';
import { proformaUI } from '../../js/modules/proforma/proforma-ui.js';
import { element } from './helpers/dom-falso.js';

const caso = casoHistoricoReal();
const d = caso.estados;
const presupuesto = calcularPresupuestoMaestro(normalizarSupuestos(caso.planeacion.supuestos));
const b = balanceProforma(d, presupuesto);
const fila = clave => b.filas.find(f => f.clave === clave);
const g = 1.0135;
const sinBase = () => { const s = { ...presupuesto.supuestos }; delete s.periodoBase; return s; };

describe('balance proforma al cierre de 2025', () => {
  it('abre con el balance real de 2024 y contrasta con el de 2025', () => {
    expect(periodosProforma(d, presupuesto.supuestos)).toEqual({ base: '2024', contraste: '2025', declarado: true });
    expect(b).toMatchObject({ disponible: true, base: '2024', contraste: '2025' });
    expect(b.totales.apertura).toEqual({ activos: 6328132696, pasivos: 5327911005, patrimonio: 1000221691 });
    expect(b.totales.real).toEqual({ activos: 5279969842, pasivos: 4434585277, patrimonio: 845384565 });
  });

  it('los grupos de la apertura suman los totales del balance', () => {
    const a = saldosAgrupados(d, '2024');
    expect(a.efectivo + a.clientes + a.inventario + a.otrosActivosCorrientes + a.activoNoCorriente).toBe(6328132696);
    expect(a.otrosActivosCorrientes).toBe(4196014499 - 284636118 - 1160810469 - 1621305239);
    expect(a.proveedores + a.irPorPagar + a.otrosPasivosCorrientes).toBe(4366612852);
  });

  it('activo no corriente = 2,132,118,197 + 45,408,357 − 149,241,420', () => {
    expect(fila('activoNoCorriente').proforma).toBe(2132118197 + 45408357 - 149241420);
  });

  it('IR por pagar = 148,959,541 − 148,959,541 pagado + IR devengado de 2025', () => {
    expect(fila('irPorPagar').proforma).toBeCloseTo((357667403 + 0.0135 * 1042059782.5 - 275824274) * 0.3, 2);
  });

  it('utilidades retenidas = 29,796,514 + utilidad neta − 7,520,629', () => {
    expect(fila('retenidas').proforma).toBeCloseTo(29796514 + (357667403 + 0.0135 * 1042059782.5 - 275824274) * 0.7 - 7520629, 2);
  });

  it('inventario = promedio de 2024 × 1.0135; clientes = 50 % de las ventas del T4', () => {
    expect(fila('inventario').proforma).toBeCloseTo((1180606300 + 1621305239) / 2 * g, 2);
    expect(fila('clientes').proforma).toBeCloseTo(9010443238 * g / 8, 2);
  });

  it('cuadra: activos = pasivos + patrimonio, sin financiamiento externo', () => {
    const t = b.totales.proforma;
    expect(t.activos).toBeCloseTo(t.pasivos + t.patrimonio, 2);
    expect(b.cuadra).toBe(true);
    expect(b.financiamientoRequerido).toBe(0);
  });

  it('un desembolso adicional repartido sigue cuadrando; uno sin repartir no se calcula', () => {
    const s = { ...presupuesto.supuestos, otrosDesembolsos: presupuesto.supuestos.otrosDesembolsos.map((v, k) => v + (k === 3 ? 1000 : 0)),
      desgloseOtrosDesembolsos: { ...presupuesto.supuestos.desgloseOtrosDesembolsos, inversion: 45408357 + 1000 } };
    const conMas = balanceProforma(d, calcularPresupuestoMaestro(s));
    expect(conMas.cuadra).toBe(true);
    const sinRepartir = { ...s, desgloseOtrosDesembolsos: presupuesto.supuestos.desgloseOtrosDesembolsos };
    expect(balanceProforma(d, calcularPresupuestoMaestro(sinRepartir)).motivo).toContain('no suma');
  });
});

describe('condiciones para calcular el balance', () => {
  it('sin periodo base declarado no se calcula', () => {
    const s = sinBase();
    expect(balanceProforma(d, calcularPresupuestoMaestro(s)).motivo).toContain('periodo de Estados');
  });

  it('una apertura distinta del balance se rechaza con lo que no coincide', () => {
    const s = { ...presupuesto.supuestos, saldoInicialCaja: 1 };
    expect(balanceProforma(d, calcularPresupuestoMaestro(s)).motivo).toContain('saldo inicial de caja');
  });
});

describe('estado de resultados: base, proforma y contraste', () => {
  const reporte = construirReporte({ estados: d, presupuesto });
  const fila = clave => reporte.comparacion.find(f => f.clave === clave);

  it('compara contra la base 2024 y muestra el real 2025 como contraste', () => {
    expect(reporte.real.periodo).toBe('2024');
    expect(reporte.contraste.periodo).toBe('2025');
    expect(fila('ventas')).toMatchObject({ real: 9010443238, contraste: 7895371400 });
    expect(fila('ventas').variacion).toBeCloseTo(0.0135, 10);
  });

  it('real vs proforma = (real − proforma) / |proforma|', () => {
    expect(fila('ventas').desvio).toBeCloseTo(7895371400 / (9010443238 * g) - 1, 10);
    expect(fila('utilidadNeta').contraste).toBe(-157990498);
    expect(fila('utilidadNeta').desvio).toBeLessThan(-1);
  });

  it('la pantalla muestra las cinco columnas y el balance que cuadra', () => {
    const page = element();
    proformaUI(page, { reporte });
    expect(page.innerHTML).toContain('Real 2024 (base)');
    expect(page.innerHTML).toContain('Real 2025 (contraste)');
    expect(page.innerHTML).toContain('Balance general proforma');
    expect(page.innerHTML).toContain('Cuadra');
  });

  it('sin periodo base, Proforma compara como antes contra el último periodo', () => {
    const s = sinBase();
    const r = construirReporte({ estados: d, presupuesto: calcularPresupuestoMaestro(s) });
    expect(r.real.periodo).toBe('2025');
    expect(r.contraste).toBeNull();
    expect(Object.hasOwn(r.comparacion[0], 'contraste')).toBe(false);
  });
});
