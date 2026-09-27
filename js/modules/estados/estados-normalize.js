import { ACCOUNT_TYPES, inferAccountType } from './estados-calculations.js';

const MAX_PERIODS = 100;
const MAX_ACCOUNTS_PER_GROUP = 200;
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

function assertPlainObject(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Estructura inválida: se esperaba un objeto en ${label}`);
  }
  for (const key of Object.keys(value)) {
    if (DANGEROUS_KEYS.has(key)) throw new Error(`Clave no permitida en ${label}: ${key}`);
  }
  return value;
}

function accountType(source, group, name) {
  if (!name.trim() || name.length > 120) throw new Error('Nombre de cuenta inválido');
  const types = source.accountTypes?.[group] || {};
  const explicit = Object.hasOwn(types, name);
  const type = explicit ? types[name] : inferAccountType(group, name);
  if (!ACCOUNT_TYPES[group].includes(type)) {
    throw new Error(`Cuenta sin clasificación válida en ${group}: ${name}`);
  }
  return type;
}

function toAmount(value, label) {
  const number = typeof value === 'string' && DECIMAL_PATTERN.test(value.trim())
    ? Number(value.trim()) : value;
  if (typeof number !== 'number' || !Number.isFinite(number)) {
    throw new Error(`Importe inválido en ${label}: ${JSON.stringify(value)}`);
  }
  return number;
}

// Accepts the store shape { balanceGeneral, estadoResultados, periods, ... }
// or a wrapper { estados: { ... } } such as a full-toolkit export.
export function normalizeFinancialData(input) {
  const raw = assertPlainObject(input ?? {}, 'datos');
  const source = (raw.balanceGeneral && raw.estadoResultados) ? raw : raw.estados;
  if (!source || typeof source !== 'object') {
    throw new Error('Faltan estados financieros: balanceGeneral y estadoResultados');
  }
  assertPlainObject(source.balanceGeneral, 'balanceGeneral');
  assertPlainObject(source.estadoResultados, 'estadoResultados');

  const periods = source.periods ?? Object.keys(source.balanceGeneral);
  if (!Array.isArray(periods) || periods.length > MAX_PERIODS) {
    throw new Error('Periodos inválidos o exceden el límite');
  }
  if (new Set(periods).size !== periods.length) {
    throw new Error('Periodos duplicados');
  }

  assertPlainObject(source, 'estados');
  if (source.accountTypes !== undefined) {
    assertPlainObject(source.accountTypes, 'accountTypes');
    for (const [group, types] of Object.entries(source.accountTypes)) {
      if (!Object.hasOwn(ACCOUNT_TYPES, group)) throw new Error('Grupo de clasificación inválido');
      assertPlainObject(types, `accountTypes.${group}`);
    }
  }
  for (const period of periods) {
    if (typeof period !== 'string' || !period.trim() || period !== period.trim()
      || period.length > 40 || DANGEROUS_KEYS.has(period)) throw new Error('Periodo inválido');
  }
  for (const statement of [source.balanceGeneral, source.estadoResultados]) {
    if (Object.keys(statement).length !== periods.length
      || periods.some(period => !Object.hasOwn(statement, period))) {
      throw new Error('Periodos inconsistentes entre estados financieros');
    }
  }
  const balanceGeneral = {};
  const estadoResultados = {};
  const accountTypes = { activos: {}, pasivos: {}, patrimonio: {}, estadoResultados: {} };

  for (const period of periods) {
    const periodBg = assertPlainObject(source.balanceGeneral[period] ?? {}, `balanceGeneral[${period}]`);
    const periodEr = assertPlainObject(source.estadoResultados[period] ?? {}, `estadoResultados[${period}]`);
    const cleanBg = {};
    for (const group of ['activos', 'pasivos', 'patrimonio']) {
      const accounts = assertPlainObject(periodBg[group] ?? {}, `balanceGeneral[${period}].${group}`);
      const count = Object.keys(accounts).length;
      if (count > MAX_ACCOUNTS_PER_GROUP) throw new Error(`Demasiadas cuentas en ${group} del periodo ${period}`);
      const clean = {};
      for (const [name, value] of Object.entries(accounts)) {
        clean[name] = toAmount(value, `${group}[${period}].${name}`);
        accountTypes[group][name] = accountType(source, group, name);
      }
      cleanBg[group] = clean;
    }
    balanceGeneral[period] = cleanBg;

    const cleanEr = {};
    const erCount = Object.keys(periodEr).length;
    if (erCount > MAX_ACCOUNTS_PER_GROUP) throw new Error(`Demasiadas cuentas en el ER del periodo ${period}`);
    for (const [name, value] of Object.entries(periodEr)) {
      cleanEr[name] = toAmount(value, `estadoResultados[${period}].${name}`);
      accountTypes.estadoResultados[name] = accountType(source, 'estadoResultados', name);
    }
    estadoResultados[period] = cleanEr;
  }

  return {
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Datos importados',
    periods: [...periods],
    balanceGeneral,
    estadoResultados,
    accountTypes
  };
}

export function parseFinancialJSON(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Archivo JSON inválido');
  }
  return normalizeFinancialData(parsed);
}
