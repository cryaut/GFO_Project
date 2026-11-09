import { GASTOS_CAJA, MOVIMIENTOS_CAJA } from './caja-docente-calculations.js';

export const CASOS_CAJA = [
  ['pinolero1', 'La Pinolera · Caso 1'], ['pinolero2', 'La Pinolera · Caso 2'],
  ['halley', 'Halley · Sin préstamo adicional'],
  ['halleyPrestamo', 'Halley · Con préstamo adicional'],
  ['halleyRepago', 'Halley · Con préstamo y repago']
];

function planBase(id, moneda, periodos, ventas, apertura, minimo, pctCompras, cobros, pagos) {
  const inicio = 2;
  return {
    id, moneda, periodos, ventas, inicio, apertura, minimo, pctCompras, cobros, pagos,
    gastos: Object.fromEntries(GASTOS_CAJA.map(([id]) => [id, { fijo: 0, tasa: 0, desde: 0 }])),
    movimientos: Object.fromEntries(MOVIMIENTOS_CAJA.map(([id]) => [id, Array(periodos.length - inicio).fill(0)]))
  };
}

function pinolero(id) {
  const primero = id === 'pinolero1';
  const plan = planBase(id, 'C$', ['Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    [300000, 290000, 425000, 500000, 600000, 625000, 650000, 700000], 15000, 15000, 0.60,
    primero ? [0.12, 0.75, 0.13] : [0.10, 0.80, 0.10], primero ? [0.60, 0.40] : [0.40, 0.60]);
  plan.gastos.sueldos.tasa = primero ? 0.06 : 0.05;
  plan.gastos.renta.tasa = primero ? 0.02 : 0.04;
  plan.gastos.publicidad.tasa = primero ? 0.03 : 0.02;
  plan.gastos.investigacion = { fijo: 0, tasa: primero ? 0.12 : 0.01, desde: 1 };
  plan.movimientos.varios = [15000, 20000, 25000, 30000, 35000, 40000];
  plan.movimientos.seguro[5] = 24000;
  plan.movimientos.irPagado = [0, 0, primero ? 40000 : 30000, 0, 0, primero ? 45000 : 35000];
  return plan;
}

function halley(id) {
  const plan = planBase(id, 'USD', ['Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    [100000, 200000, 400000, 300000, 200000], 50000, 25000, 0.70, [0.20, 0.50, 0.30], [0.10, 0.70, 0.20]);
  plan.gastos.sueldos = { fijo: 8000, tasa: 0.10, desde: 0 };
  plan.gastos.renta.fijo = 5000;
  plan.movimientos.otrosCobros[2] = 30000;
  plan.movimientos.dividendos[0] = 20000;
  plan.movimientos.inversion[1] = 130000;
  plan.movimientos.irPagado[2] = 25000;
  plan.movimientos.intereses[2] = 10000;
  plan.movimientos.amortizacion[2] = 20000;
  if (id !== 'halley') plan.movimientos.prestamo[1] = 76000;
  if (id === 'halleyRepago') plan.movimientos.repago[2] = 35000;
  return plan;
}

export function ejemploCajaDocente(id) {
  if (id === 'pinolero1' || id === 'pinolero2') return pinolero(id);
  if (id === 'halley' || id === 'halleyPrestamo' || id === 'halleyRepago') return halley(id);
  return null;
}
