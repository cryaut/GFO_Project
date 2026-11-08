const MONEDAS = ['C$', 'USD', 'UM'];
export function monedaDe(datos) { return MONEDAS.includes(datos?.moneda) ? datos.moneda : 'C$'; }
export function normalizarMoneda(datos) {
  if (datos?.moneda === undefined) return {};
  if (!MONEDAS.includes(datos.moneda)) throw new Error('Unidad monetaria inválida');
  return { moneda:datos.moneda };
}
