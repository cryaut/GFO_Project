// D-113: balance general proforma al cierre del presupuesto maestro, con el balance real del
// periodo siguiente como contraste. Lógica pura: sin DOM ni store.
//
// Apertura: el balance de Estados del periodo base declarado en los supuestos. Cierre:
//   - efectivo, clientes, inventario y proveedores salen del presupuesto;
//   - activo no corriente = apertura + inversión − depreciación del horizonte;
//   - IR por pagar = apertura − IR pagado + IR devengado del horizonte;
//   - utilidades retenidas = apertura + utilidad neta − dividendos;
//   - el resto queda sin cambio.
// Si los activos no igualan pasivos más patrimonio, la diferencia se informa como financiamiento
// externo requerido (o excedente): no se convierte en un préstamo.
import { computeFinancialTotals } from '../estados/estados-calculations.js';
import { consultarMontoCuenta } from '../estados/cuentas-identificador.js';
import { ordenarPeriodos } from '../estados/estados-normalize.js';
import { CAMPOS_DESGLOSE } from '../planeacion/planeacion-calculations.js';

const esNumero = v => typeof v === 'number' && Number.isFinite(v);
const suma = lista => lista.reduce((t, v) => t + v, 0);
// Un centavo por cada mil millones, como mínimo un centavo: absorbe el redondeo binario.
const tolerancia = (...valores) => Math.max(0.01, Math.max(...valores.map(v => Math.abs(v || 0))) * 1e-11);

// Saldos agrupados de un periodo real. Las cuentas que el periodo no presenta valen 0.
export function saldosAgrupados(estados, periodo) {
  const t = computeFinancialTotals(estados, periodo);
  const cuenta = id => consultarMontoCuenta(estados, periodo, id).valor ?? 0;
  const efectivo = cuenta('bs.cash_and_equivalents');
  const clientes = cuenta('bs.trade_receivables');
  const proveedores = cuenta('bs.trade_payables');
  const ir = cuenta('bs.taxes_payable');
  const retenidas = cuenta('bs.retained_earnings');
  return {
    efectivo, clientes, inventario: t.inventario,
    otrosActivosCorrientes: t.activosCorrientes - efectivo - clientes - t.inventario,
    activoNoCorriente: t.totalActivos - t.activosCorrientes,
    proveedores, irPorPagar: ir,
    otrosPasivosCorrientes: t.pasivosCorrientes - proveedores - ir,
    pasivoNoCorriente: t.totalPasivos - t.pasivosCorrientes,
    retenidas, otroPatrimonio: t.totalPatrimonio - retenidas,
    totalActivos: t.totalActivos, totalPasivos: t.totalPasivos, totalPatrimonio: t.totalPatrimonio
  };
}

export const FILAS_BALANCE = [
  ['activos', 'efectivo', 'Efectivo', 'Saldo final de caja del presupuesto'],
  ['activos', 'clientes', 'Cuentas por cobrar a clientes', 'Ventas a crédito del último periodo'],
  ['activos', 'inventario', 'Inventarios', 'Inventario final valorado del presupuesto'],
  ['activos', 'otrosActivosCorrientes', 'Otros activos corrientes', 'Sin cambio'],
  ['activos', 'activoNoCorriente', 'Activo no corriente', 'Apertura + inversión − depreciación'],
  ['pasivos', 'proveedores', 'Proveedores', 'Compras a crédito del último periodo'],
  ['pasivos', 'irPorPagar', 'Impuesto sobre la renta por pagar', 'Apertura − IR pagado + IR devengado'],
  ['pasivos', 'otrosPasivosCorrientes', 'Otros pasivos corrientes (deuda, partes relacionadas y otros)', 'Sin cambio'],
  ['pasivos', 'pasivoNoCorriente', 'Pasivo no corriente', 'Sin cambio'],
  ['patrimonio', 'retenidas', 'Utilidades retenidas', 'Apertura + utilidad neta − dividendos'],
  ['patrimonio', 'otroPatrimonio', 'Capital y otras partidas de patrimonio', 'Sin cambio']
];

// Periodo base y periodo de contraste (el siguiente en Estados, si existe).
export function periodosProforma(estados, supuestos) {
  const periodos = ordenarPeriodos(estados?.periods || []);
  const base = supuestos?.periodoBase && periodos.includes(supuestos.periodoBase) ? supuestos.periodoBase : periodos.at(-1) ?? null;
  const k = periodos.indexOf(base);
  return { base, contraste: k >= 0 && k < periodos.length - 1 ? periodos[k + 1] : null, declarado: base === supuestos?.periodoBase };
}

export function balanceProforma(estados, presupuesto) {
  const no = motivo => ({ disponible: false, motivo });
  if (!estados || !presupuesto) return no('Hacen falta los estados financieros y el presupuesto maestro.');
  const s = presupuesto.supuestos;
  const { base, contraste, declarado } = periodosProforma(estados, s);
  if (!declarado) return no('El presupuesto no declara el periodo de Estados que le sirve de apertura.');
  const desglose = s.desgloseOtrosDesembolsos;
  const otros = suma(s.otrosDesembolsos);
  if (!desglose) return no('Falta repartir los otros desembolsos del presupuesto entre inversión, dividendos e impuestos pagados.');
  const repartido = suma(CAMPOS_DESGLOSE.map(c => desglose[c]));
  if (Math.abs(repartido - otros) > tolerancia(repartido, otros)) {
    return no(`El reparto de los otros desembolsos (${repartido}) no suma su total (${otros}).`);
  }
  const apertura = saldosAgrupados(estados, base);
  // La apertura del presupuesto debe ser la del balance: si no, sus movimientos no parten de esos saldos.
  const cotejo = [
    ['efectivo', s.saldoInicialCaja, 'el saldo inicial de caja'], ['clientes', s.cxcInicial, 'las cuentas por cobrar iniciales'],
    ['proveedores', s.cxpInicial, 'las cuentas por pagar iniciales'], ['inventario', s.inventarioInicial * s.costoUnitario, 'el inventario inicial valorado']
  ].filter(([clave, valor]) => !esNumero(valor) || Math.abs(apertura[clave] - valor) > tolerancia(apertura[clave], valor));
  if (cotejo.length) {
    return no(`La apertura del presupuesto no coincide con el balance de ${base}: revise ${cotejo.map(c => c[2]).join(', ')}.`);
  }
  const t = presupuesto.totales, c = presupuesto.cierre;
  const cierre = {
    efectivo: c.efectivo, clientes: c.cxc, inventario: c.inventarioValor,
    otrosActivosCorrientes: apertura.otrosActivosCorrientes,
    activoNoCorriente: apertura.activoNoCorriente + desglose.inversion - t.depreciacion,
    proveedores: c.cxp,
    irPorPagar: apertura.irPorPagar - desglose.impuestos + t.ir,
    otrosPasivosCorrientes: apertura.otrosPasivosCorrientes,
    pasivoNoCorriente: apertura.pasivoNoCorriente,
    retenidas: apertura.retenidas + t.utilidadNeta - desglose.dividendos,
    otroPatrimonio: apertura.otroPatrimonio
  };
  const total = (saldos, grupo) => suma(FILAS_BALANCE.filter(f => f[0] === grupo).map(f => saldos[f[1]]));
  cierre.totalActivos = total(cierre, 'activos');
  cierre.totalPasivos = total(cierre, 'pasivos');
  cierre.totalPatrimonio = total(cierre, 'patrimonio');
  const real = contraste ? saldosAgrupados(estados, contraste) : null;
  const brecha = cierre.totalActivos - cierre.totalPasivos - cierre.totalPatrimonio;
  const cuadra = Math.abs(brecha) <= tolerancia(cierre.totalActivos);
  return {
    disponible: true, base, contraste,
    filas: FILAS_BALANCE.map(([grupo, clave, concepto, regla]) => ({
      grupo, clave, concepto, regla, apertura: apertura[clave], proforma: cierre[clave], real: real ? real[clave] : null
    })),
    totales: {
      apertura: { activos: apertura.totalActivos, pasivos: apertura.totalPasivos, patrimonio: apertura.totalPatrimonio },
      proforma: { activos: cierre.totalActivos, pasivos: cierre.totalPasivos, patrimonio: cierre.totalPatrimonio },
      real: real ? { activos: real.totalActivos, pasivos: real.totalPasivos, patrimonio: real.totalPatrimonio } : null
    },
    cuadra,
    // Positivo: los activos proyectados necesitan más fondos de los que aportan pasivos y patrimonio.
    financiamientoRequerido: cuadra ? 0 : brecha,
    aplicaciones: { ...desglose, depreciacion: t.depreciacion, utilidadNeta: t.utilidadNeta, irDevengado: t.ir }
  };
}
