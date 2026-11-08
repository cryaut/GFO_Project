// Estados financieros guardados, listos para los módulos que los reutilizan
// (inventario, equilibrio, flujo, planeación y proforma). Recibe store.get('estados').
import { normalizeFinancialData } from '../modules/estados/estados-normalize.js';
import { computeFinancialTotals } from '../modules/estados/estados-calculations.js';
import { estadosResueltos } from '../modules/estados/estados-presentacion-calculations.js';

// D-077: una sola lectura de estados. Devuelve { estados, error }:
// - sin periodos: { estados: null, error: null } (no hay datos);
// - si normalizeFinancialData lanza: { estados: null, error: <mensaje> } (hay
//   datos, pero no se pueden leer);
// - si todo va bien: { estados: <normalizados>, error: null }.
// Solo lee; nunca escribe en el store.
export function leerEstados(estados) {
  if (!Array.isArray(estados?.periods) || estados.periods.length === 0) {
    return { estados: null, error: null };
  }
  try {
    return { estados: normalizeFinancialData(estados), error: null };
  } catch (error) {
    return { estados: null, error: error.message };
  }
}

// Envoltorio para los módulos que solo necesitan los datos (Flujo, Equilibrio,
// Inventario, Planeación): null cuando no hay datos o no se pueden leer.
export function estadosGuardados(estados) {
  return leerEstados(estados).estados;
}

// Totales de un periodo (el último si no se indica), o null si no hay datos válidos.
export function totalesPeriodo(estados, periodo = null) {
  if (!estados) return null;
  const elegido = periodo ?? estados.periods[estados.periods.length - 1];
  if (!estados.periods.includes(elegido)) return null;
  try {
    const totales = computeFinancialTotals(estados, elegido);
    const filas = estadosResueltos(estados, elegido).estadoResultados;
    const subtotal = id => filas.find(f => f.id === id)?.valorCalculo ?? null;
    // Una sola lectura acreditada del ER para Inicio, Mercado y sus consumidores.
    // Un ER vacío no acredita ventas ni utilidad cero. El balance sigue disponible.
    return { periodo: elegido, ...totales,
      ventasBrutas: subtotal('is.sales_total'), ventas: subtotal('is.net_sales_reported'),
      utilidadBruta: subtotal('is.gross_profit_reported'), utilidadNeta: subtotal('is.net_income_reported') };
  } catch {
    return null;
  }
}
