// Estados financieros guardados, listos para los módulos que los reutilizan
// (inventario, equilibrio, flujo, planeación y proforma). Recibe store.get('estados').
import { normalizeFinancialData } from '../modules/estados/estados-normalize.js';
import { computeFinancialTotals } from '../modules/estados/estados-calculations.js';

// Estados normalizados, o null si no hay periodos o no se pueden leer.
export function estadosGuardados(estados) {
  if (!Array.isArray(estados?.periods) || estados.periods.length === 0) return null;
  try {
    return normalizeFinancialData(estados);
  } catch {
    return null;
  }
}

// Totales de un periodo (el último si no se indica), o null si no hay datos válidos.
export function totalesPeriodo(estados, periodo = null) {
  if (!estados) return null;
  const elegido = periodo ?? estados.periods[estados.periods.length - 1];
  if (!estados.periods.includes(elegido)) return null;
  try {
    return { periodo: elegido, ...computeFinancialTotals(estados, elegido) };
  } catch {
    return null;
  }
}
