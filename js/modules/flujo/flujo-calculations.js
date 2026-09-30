// Estado de flujo de efectivo por actividades (método directo: entradas y salidas de efectivo).
// Lógica pura: sin DOM, window ni store. Plan: docs/planificacion/modulos-guia/01-modulos-obligatorios.md.
import { flujoNeto, saldoFinalEfectivo, variacionNetaEfectivo } from '../../utils/calculate.js';
import { computeFinancialTotals } from '../estados/estados-calculations.js';

export const ACTIVIDADES = ['operacion', 'inversion', 'financiamiento'];
export const ETIQUETA_ACTIVIDAD = { operacion: 'Operación', inversion: 'Inversión', financiamiento: 'Financiamiento' };
export const TIPOS_FLUJO = ['entrada', 'salida'];
export const MAX_TEXTO = 80;
const TOLERANCIA = 0.005;

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function suma(lista) {
  return lista.reduce((total, m) => total + m.monto, 0);
}

// Datos guardados → forma válida; lo que no cumple la forma se descarta.
export function normalizarFlujo(datos) {
  const movimientos = [];
  const ids = new Set();
  for (const m of Array.isArray(datos?.movimientos) ? datos.movimientos : []) {
    if (!m || typeof m.id !== 'string' || ids.has(m.id) || !texto(m.concepto)) continue;
    if (!ACTIVIDADES.includes(m.actividad) || !TIPOS_FLUJO.includes(m.tipo)) continue;
    if (!esNumero(m.monto) || m.monto <= 0) continue;
    ids.add(m.id);
    movimientos.push({ id: m.id, concepto: texto(m.concepto), actividad: m.actividad, tipo: m.tipo, monto: m.monto });
  }
  return {
    saldoInicial: esNumero(datos?.saldoInicial) ? datos.saldoInicial : null,
    periodoBase: texto(datos?.periodoBase),
    movimientos
  };
}

// Errores de un movimiento nuevo (lista vacía si es válido).
export function validarMovimientoFlujo(movimiento) {
  const errores = [];
  const concepto = texto(movimiento.concepto);
  if (!concepto) errores.push('Escriba el concepto del movimiento.');
  else if (concepto.length > MAX_TEXTO) errores.push(`El concepto admite hasta ${MAX_TEXTO} caracteres.`);
  if (!ACTIVIDADES.includes(movimiento.actividad)) errores.push('Elija la actividad: operación, inversión o financiamiento.');
  if (!TIPOS_FLUJO.includes(movimiento.tipo)) errores.push('Elija si es una entrada o una salida de efectivo.');
  if (!esNumero(movimiento.monto) || movimiento.monto <= 0) errores.push('El monto debe ser un número mayor que 0.');
  return errores;
}

// Flujos por actividad, variación neta y saldo final. El saldo final es N/D sin saldo inicial.
export function calcularFlujo(datos) {
  const normal = normalizarFlujo(datos);
  const actividades = ACTIVIDADES.map(actividad => {
    const movimientos = normal.movimientos.filter(m => m.actividad === actividad);
    const entradas = suma(movimientos.filter(m => m.tipo === 'entrada'));
    const salidas = suma(movimientos.filter(m => m.tipo === 'salida'));
    return { actividad, nombre: ETIQUETA_ACTIVIDAD[actividad], movimientos, entradas, salidas, neto: flujoNeto(entradas, salidas) };
  });
  const neto = Object.fromEntries(actividades.map(a => [a.actividad, a.neto]));
  const variacionNeta = variacionNetaEfectivo(neto.operacion, neto.inversion, neto.financiamiento);
  return {
    saldoInicial: normal.saldoInicial,
    periodoBase: normal.periodoBase,
    actividades,
    neto,
    totalEntradas: actividades.reduce((total, a) => total + a.entradas, 0),
    totalSalidas: actividades.reduce((total, a) => total + a.salidas, 0),
    variacionNeta,
    saldoFinal: saldoFinalEfectivo(normal.saldoInicial, variacionNeta),
    cantidadMovimientos: normal.movimientos.length
  };
}

// Si el saldo inicial se tomó del efectivo de un periodo y los estados tienen el periodo
// siguiente, compara el saldo final con el efectivo de ese periodo (null si no aplica).
export function conciliarConBalance(resultado, estados, periodoBase) {
  if (!estados || !periodoBase || !esNumero(resultado.saldoFinal)) return null;
  const k = estados.periods.indexOf(periodoBase);
  if (k < 0 || k === estados.periods.length - 1) return null;
  const periodo = estados.periods[k + 1];
  let efectivo;
  try {
    efectivo = computeFinancialTotals(estados, periodo).efectivo;
  } catch {
    return null;
  }
  const diferencia = resultado.saldoFinal - efectivo;
  return { periodo, efectivo, diferencia, cuadra: Math.abs(diferencia) < TOLERANCIA };
}

// Ejemplo ficticio de MUNO MODA para un año (caso del paso 01): saldo inicial igual al
// efectivo del balance 2024 de la demo.
export function ejemploFlujo() {
  const m = (id, concepto, actividad, tipo, monto) => ({ id, concepto, actividad, tipo, monto });
  return {
    saldoInicial: 52000,
    periodoBase: '',
    movimientos: [
      m('demo-f1', 'Cobros a clientes', 'operacion', 'entrada', 905000),
      m('demo-f2', 'Pagos a proveedores', 'operacion', 'salida', 560000),
      m('demo-f3', 'Sueldos y gastos de operación', 'operacion', 'salida', 205000),
      m('demo-f4', 'Intereses pagados', 'operacion', 'salida', 12000),
      m('demo-f5', 'Impuesto sobre la renta pagado', 'operacion', 'salida', 30000),
      m('demo-f6', 'Compra de equipo', 'inversion', 'salida', 45000),
      m('demo-f7', 'Venta de vehículo usado', 'inversion', 'entrada', 15000),
      m('demo-f8', 'Préstamo bancario recibido', 'financiamiento', 'entrada', 40000),
      m('demo-f9', 'Abono a préstamos', 'financiamiento', 'salida', 25000),
      m('demo-f10', 'Dividendos pagados', 'financiamiento', 'salida', 60000)
    ]
  };
}
