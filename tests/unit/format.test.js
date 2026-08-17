import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatPercent, formatPercentRaw, parseNumber } from '../../js/utils/format.js';

describe('formatCurrency', () => {
  it('Formatea número con C$', () => {
    expect(formatCurrency(1500)).toBe('C$ 1,500.00');
  });

  it('Formatea 0', () => {
    expect(formatCurrency(0)).toBe('C$ 0.00');
  });

  it('Formatea negativos', () => {
    expect(formatCurrency(-2500)).toBe('C$ -2,500.00');
  });

  it('Maneja null/undefined', () => {
    expect(formatCurrency(null)).toBe('C$ 0.00');
    expect(formatCurrency(undefined)).toBe('C$ 0.00');
  });

  it('Moneda personalizada', () => {
    expect(formatCurrency(100, '$')).toBe('$ 100.00');
  });
});

describe('formatNumber', () => {
  it('Formatea con decimales', () => {
    expect(formatNumber(1234.5678)).toBe('1,234.57');
  });

  it('Formatea entero', () => {
    expect(formatNumber(5000, 0)).toBe('5,000');
  });

  it('Maneja NaN', () => {
    expect(formatNumber(NaN)).toBe('0');
  });
});

describe('formatPercent', () => {
  it('Convierte decimal a porcentaje', () => {
    expect(formatPercent(0.15)).toBe('15.00%');
  });

  it('Porcentaje de 0', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });

  it('Porcentaje mayor a 100%', () => {
    expect(formatPercent(1.5)).toBe('150.00%');
  });
});

describe('formatPercentRaw', () => {
  it('Ya es porcentaje, solo formatea', () => {
    expect(formatPercentRaw(15.5)).toBe('15.50%');
  });

  it('Con 1 decimal', () => {
    expect(formatPercentRaw(33.333, 1)).toBe('33.3%');
  });
});

describe('parseNumber', () => {
  it('Parsea string numérico', () => {
    expect(parseNumber('1500')).toBe(1500);
  });

  it('Parsea string con formato', () => {
    expect(parseNumber('C$ 1,500.00')).toBe(1500);
  });

  it('Número ya es número', () => {
    expect(parseNumber(42)).toBe(42);
  });

  it('String inválido retorna 0', () => {
    expect(parseNumber('abc')).toBe(0);
  });

  it('Vacío retorna 0', () => {
    expect(parseNumber('')).toBe(0);
    expect(parseNumber(null)).toBe(0);
  });
});
