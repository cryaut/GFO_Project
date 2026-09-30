// Razones de mercado por periodo: UPA, P/U, valor en libros por acción, P/VL, DPA, pago y
// rendimiento del dividendo. Lógica pura: sin DOM ni store. Las fórmulas están en calculate.js.
import { computeFinancialTotals } from '../estados/estados-calculations.js';
import {
  dividendoPorAccion, precioUtilidad, precioValorLibros, razonPagoDividendos,
  rendimientoDividendo, utilidadPorAccion, valorLibrosPorAccion
} from '../../utils/calculate.js';

export const CAMPOS_MERCADO = [
  ['acciones', 'Acciones comunes en circulación'],
  ['precio', 'Precio de mercado por acción (C$)'],
  ['dividendos', 'Dividendos comunes pagados (C$)']
];

function esNumero(valor) {
  return typeof valor === 'number' && Number.isFinite(valor);
}

// Datos guardados → { periodos: { [periodo]: { acciones, precio, dividendos } } } con números o null.
export function normalizarDatosMercado(datos) {
  const periodos = {};
  const origen = datos?.periodos && typeof datos.periodos === 'object' ? datos.periodos : {};
  for (const [periodo, valores] of Object.entries(origen)) {
    if (!valores || typeof valores !== 'object') continue;
    periodos[periodo] = Object.fromEntries(CAMPOS_MERCADO.map(([campo]) =>
      [campo, esNumero(valores[campo]) ? valores[campo] : null]));
  }
  return { periodos };
}

// Errores de los datos de un periodo; los campos vacíos (null) se permiten y dan N/D.
export function validarDatosMercado(periodo, valores) {
  const errores = [];
  if (valores.acciones !== null && (!esNumero(valores.acciones) || valores.acciones <= 0)) {
    errores.push(`${periodo}: las acciones en circulación deben ser un número mayor que 0.`);
  }
  if (valores.precio !== null && (!esNumero(valores.precio) || valores.precio <= 0)) {
    errores.push(`${periodo}: el precio por acción debe ser un número mayor que 0.`);
  }
  if (valores.dividendos !== null && (!esNumero(valores.dividendos) || valores.dividendos < 0)) {
    errores.push(`${periodo}: los dividendos deben ser un número mayor o igual a 0.`);
  }
  return errores;
}

function totales(estados, periodo) {
  try {
    return computeFinancialTotals(estados, periodo);
  } catch {
    return null;
  }
}

// Razones de cada periodo. dap: DAP por periodo, como lo guarda Apalancamiento (0 si no hay).
export function calcularRazonesMercado(estados, datos, dap = {}) {
  const normal = normalizarDatosMercado(datos);
  return (estados?.periods || []).map((periodo, k) => {
    const t = totales(estados, periodo);
    const v = normal.periodos[periodo] || { acciones: null, precio: null, dividendos: null };
    const dapPeriodo = esNumero(dap?.[periodo]) && dap[periodo] >= 0 ? dap[periodo] : 0;
    const un = t && esNumero(t.utilidadNeta) ? t.utilidadNeta : null;
    const udac = un === null ? null : un - dapPeriodo;
    const patrimonio = t ? t.totalPatrimonio : null;
    const upa = utilidadPorAccion(udac, v.acciones);
    const vlpa = valorLibrosPorAccion(patrimonio, v.acciones);
    const dpa = dividendoPorAccion(v.dividendos, v.acciones);
    // Dividendos que explican el cambio del patrimonio si no hubo aportes ni retiros de capital.
    const anterior = k > 0 ? totales(estados, estados.periods[k - 1]) : null;
    const dividendosImplicitos = un !== null && anterior && esNumero(patrimonio)
      ? un - (patrimonio - anterior.totalPatrimonio) : null;
    return {
      periodo, un, dap: dapPeriodo, udac, patrimonio, ...v,
      upa, pu: precioUtilidad(v.precio, upa), vlpa, pvl: precioValorLibros(v.precio, vlpa),
      dpa, pago: razonPagoDividendos(dpa, upa), rendimiento: rendimientoDividendo(dpa, v.precio),
      dividendosImplicitos
    };
  });
}

// Ejemplo para la demo MUNO MODA: capital social de C$ 300,000 en acciones de C$ 10 y los
// dividendos que explican el cambio del patrimonio. Se aplica a los dos últimos periodos.
export function ejemploMercado(periodos) {
  const valores = [
    { acciones: 30000, precio: 45, dividendos: 35000 },
    { acciones: 30000, precio: 52, dividendos: 40000 }
  ];
  const ultimos = (periodos || []).slice(-2);
  const desde = valores.length - ultimos.length;
  return { periodos: Object.fromEntries(ultimos.map((p, i) => [p, { ...valores[desde + i] }])) };
}
