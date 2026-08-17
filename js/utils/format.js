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
  const cleaned = String(str).replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
