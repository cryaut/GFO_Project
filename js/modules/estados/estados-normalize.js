import { ACCOUNT_TYPES, inferAccountType } from './estados-calculations.js';
import { identificarCuenta, obtenerCuenta } from './cuentas-identificador.js';

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
  if (explicit && type !== '' && !ACCOUNT_TYPES[group].includes(type)) {
    throw new Error(`Cuenta sin clasificación válida en ${group}: ${name}`);
  }
  return type || '';
}

function identidadCuenta(source, group, name) {
  const guardada = source.accountIdentities?.[group]?.[name];
  if (source.accountIdentities?.[group] && Object.hasOwn(source.accountIdentities[group], name)) {
    assertPlainObject(guardada, 'identidad de cuenta');
    if (!['reconocida', 'sugerida', 'no_reconocida'].includes(guardada.estado)
      || !['legado', 'importacion', 'manual'].includes(guardada.origen)
      || !Array.isArray(guardada.candidatos) || guardada.candidatos.length > 5) throw new Error('Identidad de cuenta inválida');
    const candidatos = guardada.candidatos.map(candidato => {
      const cuenta = obtenerCuenta(candidato.id);
      if (!cuenta) throw new Error('Candidato de cuenta inválido');
      return { id: cuenta.id, nombreCanonico: cuenta.nombreCanonico, grupo: cuenta.grupo,
        tipoApp: cuenta.tipoApp, puntuacion: typeof candidato.puntuacion === 'number' && candidato.puntuacion >= 0 && candidato.puntuacion <= 1 ? candidato.puntuacion : 1 };
    });
    const cuenta = obtenerCuenta(guardada.idCuenta);
    if (guardada.estado === 'reconocida' && (!cuenta || cuenta.grupo !== group)) throw new Error('Identificador de cuenta inválido');
    const tipo = source.accountTypes?.[group]?.[name];
    if (guardada.estado === 'reconocida' && tipo && cuenta.tipoApp && tipo !== cuenta.tipoApp) throw new Error('Clasificación incompatible con identificador');
    if (guardada.estado !== 'reconocida' && guardada.idCuenta !== null) throw new Error('Identificador pendiente sin confirmar');
    if ((typeof guardada.metodo !== 'string' && guardada.metodo !== null) || guardada.metodo?.length > 80) throw new Error('Método de identificación inválido');
    if (guardada.estado === 'reconocida' && !['id', 'nombre_canonico', 'sinonimo', 'contexto', 'confirmacion_manual'].includes(guardada.metodo)) throw new Error('Una cuenta reconocida requiere un método de asignación válido');
    return { idCuenta: cuenta?.id || null, estado: guardada.estado, metodo: guardada.metodo,
      candidatos, origen: guardada.origen };
  }
  const resultado = identificarCuenta(name, { grupo: group, clasificacion: source.accountTypes?.[group]?.[name] || '' });
  return { idCuenta: resultado.id, estado: resultado.estado, metodo: resultado.metodo,
    candidatos: resultado.candidatos, origen: 'legado' };
}

function toAmount(value, label) {
  const number = typeof value === 'string' && DECIMAL_PATTERN.test(value.trim())
    ? Number(value.trim()) : value;
  if (typeof number !== 'number' || !Number.isFinite(number)) {
    throw new Error(`Importe inválido en ${label}: ${JSON.stringify(value)}`);
  }
  return number;
}

// La convención del catálogo se aplica a las cuentas reconocidas. El número de
// fila solo existe en la importación tabular; en JSON o datos guardados es 0.
function validarSigno(group, name, value, period, identidad, filas) {
  if (identidad.estado !== 'reconocida' || !identidad.idCuenta) return;
  const convencion = obtenerCuenta(identidad.idCuenta)?.convencionSigno;
  if (!convencion || convencion === 'conservar') return;
  const fila = filas[`${group}:${name}:${period}`] ?? 0;
  if (convencion === 'positivo' && value < 0) {
    throw new Error(`Fila ${fila}, cuenta «${name}», periodo ${period}: esta cuenta se captura en positivo. Quite el signo negativo o los paréntesis. Si es una devolución o un descuento, use su cuenta de deducción.`);
  }
  if (convencion === 'negativo' && value > 0) {
    throw new Error(`Fila ${fila}, cuenta «${name}», periodo ${period}: la depreciación acumulada se captura en negativo.`);
  }
}

// Orden cronológico único para todas las vías de entrada (importación, JSON,
// alta manual y datos existentes): sin él, getPrevPeriod y el "último periodo"
// dependen del orden de llegada. No muta la entrada.
export function sortPeriods(periods) {
  return [...periods].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
}

// Orden de los periodos guardados: si todos empiezan con un año (2023, 2024-T1…) se ordenan
// solos, para que el "último periodo" y el anterior no dependan del orden de llegada. Con
// nombres como "Marzo" o "Proyección" se respeta el orden que dejó el usuario en Estados:
// ordenarlos alfabéticamente pondría "Abril" antes que "Marzo".
const EMPIEZA_CON_ANIO = /^\d{4}(?!\d)/;
export function ordenarPeriodos(periods) {
  const lista = [...periods];
  return lista.every(periodo => EMPIEZA_CON_ANIO.test(periodo)) ? sortPeriods(lista) : lista;
}

// Accepts the store shape { balanceGeneral, estadoResultados, periods, ... }
// or a wrapper { estados: { ... } } such as a full-toolkit export.
export function normalizeFinancialData(input, { filas = {} } = {}) {
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
  const accountIdentities = { activos: {}, pasivos: {}, patrimonio: {}, estadoResultados: {}, suplementario: {} };
  if (source.accountIdentities !== undefined) {
    assertPlainObject(source.accountIdentities, 'accountIdentities');
    for (const [group, accounts] of Object.entries(source.accountIdentities)) {
      if (!Object.hasOwn(accountIdentities, group)) throw new Error('Grupo de identidad inválido');
      assertPlainObject(accounts, `accountIdentities.${group}`);
      if (Object.keys(accounts).length > MAX_ACCOUNTS_PER_GROUP * MAX_PERIODS) throw new Error('Demasiadas identidades de cuenta');
    }
  }

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
        const identidad = identidadCuenta(source, group, name);
        accountIdentities[group][name] = identidad;
        validarSigno(group, name, clean[name], period, identidad, filas);
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
      const identidad = identidadCuenta(source, 'estadoResultados', name);
      accountIdentities.estadoResultados[name] = identidad;
      validarSigno('estadoResultados', name, cleanEr[name], period, identidad, filas);
    }
    estadoResultados[period] = cleanEr;
  }

  const supplementaryAccounts = {};
  const reportedTotals = {};
  for (const [key, target] of [['supplementaryAccounts', supplementaryAccounts], ['reportedTotals', reportedTotals]]) {
    if (source[key] === undefined) continue;
    assertPlainObject(source[key], key);
    for (const [period, entries] of Object.entries(source[key])) {
      if (!periods.includes(period)) throw new Error('Periodo adicional inconsistente');
      assertPlainObject(entries, key);
      if (Object.keys(entries).length > MAX_ACCOUNTS_PER_GROUP) throw new Error('Demasiadas cuentas adicionales');
      target[period] = {};
      for (const [name, value] of Object.entries(entries)) {
        if (key === 'reportedTotals') {
          assertPlainObject(value, 'total reportado');
          const cuenta = obtenerCuenta(name);
          if (cuenta?.rol !== 'reported_total') throw new Error('Total reportado inválido');
          if (typeof value.nombre !== 'string' || !value.nombre.trim() || value.nombre.length > 120) throw new Error('Nombre de cuenta inválido');
          const importe = toAmount(value.importe, name);
          const identidad = source.accountIdentities?.[cuenta.grupo]?.[value.nombre]
            ? identidadCuenta(source, cuenta.grupo, value.nombre)
            : { idCuenta: cuenta.id, estado: 'reconocida', metodo: 'id', candidatos: [], origen: 'legado' };
          target[period][name] = { nombre: value.nombre, grupo: cuenta.grupo, importe };
          accountIdentities[cuenta.grupo][value.nombre] = identidad;
          validarSigno(cuenta.grupo, value.nombre, importe, period, identidad, filas);
        } else {
          if (!name.trim() || name.length > 120) throw new Error('Nombre de cuenta inválido');
          target[period][name] = toAmount(value, name);
          accountIdentities.suplementario[name] = identidadCuenta(source, 'suplementario', name);
        }
      }
    }
  }
  const pendingAccounts = source.pendingAccounts ?? [];
  if (!Array.isArray(pendingAccounts) || pendingAccounts.length > 5000) throw new Error('Filas pendientes inválidas');
  const pendientes = pendingAccounts.map(fila => {
    assertPlainObject(fila, 'fila pendiente');
    if (typeof fila.nombre !== 'string' || !fila.nombre.trim() || fila.nombre.length > 120 || DANGEROUS_KEYS.has(fila.nombre)) throw new Error('Nombre de cuenta inválido');
    assertPlainObject(fila.importes, 'importes pendientes');
    const importes = Object.fromEntries(Object.entries(fila.importes).map(([periodo, valor]) => {
      if (!periods.includes(periodo)) throw new Error('Periodo pendiente inconsistente');
      return [periodo, toAmount(valor, fila.nombre)];
    }));
    const identificacion = identidadCuenta({ accountIdentities: { pendiente: { [fila.nombre]: fila.identificacion } } }, 'pendiente', fila.nombre);
    if (identificacion.estado === 'reconocida') throw new Error('Una fila reconocida requiere grupo');
    return { nombre: fila.nombre, importes, identificacion };
  });
  return {
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : typeof source.name === 'string' && source.name.trim() ? source.name.trim() : 'Datos importados',
    periods: ordenarPeriodos(periods),
    balanceGeneral,
    estadoResultados,
    accountTypes, accountIdentities,
    ...(Object.keys(supplementaryAccounts).length ? { supplementaryAccounts } : {}),
    ...(Object.keys(reportedTotals).length ? { reportedTotals } : {}),
    ...(pendientes.length ? { pendingAccounts: pendientes } : {})
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
