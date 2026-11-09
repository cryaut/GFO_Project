import { financiamientoRequerido, flujoNeto, saldoFinalEfectivo } from '../../utils/calculate.js';
import { normalizarMoneda } from '../../utils/moneda.js';

export const GASTOS_CAJA = [
  ['sueldos', 'Sueldos'], ['renta', 'Arrendamiento'], ['publicidad', 'Publicidad'],
  ['investigacion', 'Investigación y desarrollo']
];
export const PAGOS_CAJA = [
  ['varios', 'Gastos varios'], ['seguro', 'Seguro'], ['irPagado', 'Impuesto pagado'],
  ['inversion', 'Inversión pagada'], ['intereses', 'Intereses pagados'],
  ['dividendos', 'Dividendos pagados'], ['amortizacion', 'Amortización programada']
];
export const MOVIMIENTOS_CAJA = [
  ['otrosCobros', 'Otros cobros'], ...PAGOS_CAJA,
  ['prestamo', 'Préstamo recibido'], ['repago', 'Repago del préstamo adicional']
];

const numero = Number.isFinite;
const noNegativo = valor => valor === null || (numero(valor) && valor >= 0);
const fraccion = valor => valor === null || (noNegativo(valor) && valor <= 1);
const suma = valores => valores.reduce((total, valor) => total + valor, 0);
const finito = valor => numero(valor) ? valor : null;
const total = valores => valores.every(numero) ? finito(suma(valores)) : null;
const producto = (valor, factor) => valor === 0 || factor === 0 ? 0
  : numero(valor) && numero(factor) ? finito(valor * factor) : null;
const listado = (valores, n, valida) => Array.isArray(valores) && valores.length === n
  && Array.from(valores).every(valida);
const calendarioValido = lista => Array.isArray(lista) && lista.length > 0 && lista.length <= 12
  && Array.from(lista).every(valor => numero(valor) && fraccion(valor))
  && Math.abs(suma(lista) - 1) <= 1e-7;

export function validarCajaDocente(plan) {
  if (!plan || typeof plan !== 'object' || typeof plan.moneda !== 'string'
      || !Array.isArray(plan.periodos) || !Number.isInteger(plan.inicio)
      || plan.inicio < 0 || plan.inicio > 11 || plan.periodos.length <= plan.inicio
      || plan.periodos.length - plan.inicio > 12
      || !Array.from(plan.periodos).every(p => typeof p === 'string' && p.trim() && p.length <= 30)
      || new Set(plan.periodos).size !== plan.periodos.length) {
    throw new Error('El calendario de caja requiere una moneda y hasta doce meses de proyección identificados.');
  }
  normalizarMoneda(plan);
  const meses = plan.periodos.length - plan.inicio;
  if (!listado(plan.ventas, plan.periodos.length, noNegativo)
      || !(plan.apertura === null || numero(plan.apertura)) || !noNegativo(plan.minimo)
      || !fraccion(plan.pctCompras) || !calendarioValido(plan.cobros) || !calendarioValido(plan.pagos)) {
    throw new Error('Revise ventas, saldos y calendarios. Los porcentajes de cada calendario deben sumar 100 %. Use cero para una ausencia confirmada.');
  }
  for (const [id, nombre] of GASTOS_CAJA) {
    const regla = plan.gastos?.[id];
    if (!regla || !noNegativo(regla.fijo) || !fraccion(regla.tasa)
        || !Number.isInteger(regla.desde) || regla.desde < 0 || regla.desde >= meses) {
      throw new Error(`Revise los supuestos de ${nombre}.`);
    }
  }
  for (const [id, nombre] of MOVIMIENTOS_CAJA) {
    if (!listado(plan.movimientos?.[id], meses, noNegativo)) {
      throw new Error(`Revise los movimientos de ${nombre}.`);
    }
  }
  let deuda = 0;
  for (let i = 0; i < meses; i++) {
    deuda = finito(saldoFinalEfectivo(deuda, flujoNeto(plan.movimientos.prestamo[i], plan.movimientos.repago[i])));
    if (deuda !== null && deuda < -1e-7) {
      throw new Error(`El repago supera el préstamo adicional acumulado en ${plan.periodos[plan.inicio + i]}.`);
    }
  }
  return plan;
}

function programar(serie, pesos, periodos, i) {
  const cuotas = pesos.flatMap((peso, desfase) => peso === 0 ? [] : [{
    origen: periodos[i - desfase] ?? null, base: serie[i - desfase] ?? null,
    proporcion: peso, importe: producto(serie[i - desfase], peso)
  }]);
  return { cuotas, importe: total(cuotas.map(cuota => cuota.importe)) };
}

function saldoDiferido(serie, pesos, i) {
  return total(pesos.slice(1).map((_, d) => producto(serie[i - d], suma(pesos.slice(d + 1)))));
}

// Los periodos previos generan cuotas, pero el efectivo comienza en la apertura declarada.
export function proyectarCajaDocente(plan) {
  validarCajaDocente(plan);
  const compras = plan.ventas.map(ventas => producto(ventas, plan.pctCompras));
  const cobrosPct = plan.cobros.map(peso => peso / suma(plan.cobros));
  const pagosPct = plan.pagos.map(peso => peso / suma(plan.pagos));
  let saldo = plan.apertura;
  let deudaAdicional = 0;
  const meses = plan.periodos.slice(plan.inicio).map((periodo, m) => {
    const i = m + plan.inicio;
    const cobros = programar(plan.ventas, cobrosPct, plan.periodos, i);
    const proveedores = programar(compras, pagosPct, plan.periodos, i);
    const movimientos = Object.fromEntries(MOVIMIENTOS_CAJA.map(([id]) => [id, plan.movimientos[id][m]]));
    const gastos = Object.fromEntries(GASTOS_CAJA.map(([id]) => {
      const { fijo, tasa, desde } = plan.gastos[id];
      return [id, m < desde ? 0 : total([fijo, producto(plan.ventas[i], tasa)])];
    }));
    const entradas = total([cobros.importe, movimientos.otrosCobros]);
    const salidas = total([proveedores.importe, ...Object.values(gastos), ...PAGOS_CAJA.map(([id]) => movimientos[id])]);
    const neto = finito(flujoNeto(entradas, salidas));
    const inicial = saldo;
    const antes = finito(saldoFinalEfectivo(inicial, neto));
    const necesidad = finito(financiamientoRequerido(antes, plan.minimo));
    const exceso = numero(antes) && numero(plan.minimo) ? finito(Math.max(0, antes - plan.minimo)) : null;
    const financiamiento = finito(flujoNeto(movimientos.prestamo, movimientos.repago));
    saldo = finito(saldoFinalEfectivo(antes, financiamiento));
    deudaAdicional = finito(saldoFinalEfectivo(deudaAdicional, financiamiento));
    return {
      periodo, ventas: plan.ventas[i], compras: compras[i], cobros, proveedores, gastos, movimientos,
      entradas, salidas, neto, inicial, antes, minimo: plan.minimo, necesidad, exceso, final: saldo, deudaAdicional,
      cxcInicial: saldoDiferido(plan.ventas, cobrosPct, i - 1), cxcFinal: saldoDiferido(plan.ventas, cobrosPct, i),
      cxpInicial: saldoDiferido(compras, pagosPct, i - 1), cxpFinal: saldoDiferido(compras, pagosPct, i)
    };
  });
  return { meses, moneda: plan.moneda, financiamientoMaximo: meses.every(m => numero(m.necesidad))
    ? Math.max(...meses.map(m => m.necesidad)) : null };
}
