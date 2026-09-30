export function formatCurrency(value, currency = 'C$') {
  if (value === null || value === undefined || isNaN(value)) return `${currency} 0.00`;
  const num = Number(value);
  const formatted = num.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency} ${formatted}`;
}

export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Number(value).toLocaleString('es-NI', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return (Number(value) * 100).toFixed(decimals) + '%';
}

export function formatPercentRaw(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return Number(value).toFixed(decimals) + '%';
}

export function parseNumber(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const cleaned = String(str).replace(/[^-0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Variantes que muestran "N/D" si el valor no es un número finito (convención null = N/D).
// Las funciones de arriba convierten null en 0; estas no.
function esFinito(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function formatCurrencyND(value, currency = 'C$') {
  return esFinito(value) ? formatCurrency(value, currency) : 'N/D';
}

export function formatNumberND(value, decimals = 2) {
  return esFinito(value) ? formatNumber(value, decimals) : 'N/D';
}

export function formatPercentND(value, decimals = 2) {
  return esFinito(value) ? formatPercent(value, decimals) : 'N/D';
}
