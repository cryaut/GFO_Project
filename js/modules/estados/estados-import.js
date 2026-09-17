import { ACCOUNT_TYPES, inferAccountType } from './estados-calculations.js';
import { normalizeFinancialData } from './estados-normalize.js';

// Tabular import for external financial statements.
//
// Two layouts are accepted, both keyed by a mandatory "Cuenta" header:
//  1. Wide (recommended): one row per account, one column per period.
//       Estado | Grupo | Cuenta | Clasificacion | 2023 | 2024
//  2. Long (one row per account and period):
//       Periodo | Estado | Grupo | Cuenta | Clasificacion | Importe
//
// Numbers follow the Nicaraguan convention used across the toolkit: '.' is the
// decimal separator and ','/spaces group thousands. Parentheses and a trailing
// '-' mark negatives, matching accounting printouts.

const MAX_ROWS = 5000;
const MAX_COLUMNS = 120;
const MAX_VALUES = 20000;

const META_HEADERS = new Set(['estado', 'grupo', 'cuenta', 'clasificacion', 'tipo', 'periodo', 'importe', 'moneda', 'nota']);

const GROUP_ALIASES = {
  activos: ['activo', 'activos', 'balance activos'],
  pasivos: ['pasivo', 'pasivos'],
  patrimonio: ['patrimonio', 'capital contable', 'patrimonio neto'],
  estadoResultados: ['resultado', 'resultados', 'estado resultados', 'estado de resultados', 'er', 'perdidas y ganancias']
};

const TYPE_ALIASES = {
  efectivo: ['efectivo', 'caja', 'bancos', 'banco', 'equivalentes de efectivo'],
  cxC: ['cxc', 'cuentas por cobrar', 'clientes', 'deudores comerciales'],
  inventario: ['inventario', 'inventarios', 'existencias', 'mercaderia', 'mercaderias'],
  activosCorrientesOtros: ['activos corrientes otros', 'otros activos corrientes'],
  activosFijos: ['activos fijos', 'no corriente', 'propiedad planta y equipo', 'ppe', 'inmuebles'],
  depreciacionAcumulada: ['depreciacion acumulada', 'depreciacion'],
  cuentasPorPagar: ['cuentas por pagar', 'proveedores', 'acreedores comerciales'],
  pasivoCortoPlazo: ['pasivo corto plazo', 'pasivos corrientes', 'deuda financiera corriente'],
  provisiones: ['provisiones'],
  pasivoLargoPlazo: ['pasivo largo plazo', 'pasivos no corrientes'],
  patrimonio: ['patrimonio', 'capital', 'capital social'],
  ventas: ['ventas', 'ingresos', 'ingresos operacionales', 'ingresos por servicios'],
  costoVentas: ['costo de ventas', 'costos de ventas', 'costo de lo vendido'],
  gastosAdmin: ['gastos administrativos', 'gastos de administracion', 'administracion'],
  gastosVentas: ['gastos de ventas', 'gastos comerciales', 'ventas y mercadeo'],
  otrosIngresos: ['otros ingresos'],
  otrosGastos: ['otros gastos'],
  intereses: ['gastos financieros', 'intereses', 'gastos de intereses'],
  impuestos: ['impuestos', 'impuesto sobre la renta', 'ir']
};

export const TABULAR_TEMPLATE_ROWS = [
  ['Estado', 'Grupo', 'Cuenta', 'Clasificacion', '2023', '2024'],
  ['Balance', 'Activos', 'Efectivo', 'efectivo', '45000', '52000'],
  ['Balance', 'Activos', 'Cuentas por Cobrar', 'cxC', '120000', '135000'],
  ['Balance', 'Activos', 'Inventario', 'inventario', '180000', '195000'],
  ['Balance', 'Pasivos', 'Cuentas por Pagar', 'cuentasPorPagar', '85000', '92000'],
  ['Balance', 'Patrimonio', 'Capital Social', 'patrimonio', '300000', '300000'],
  ['Resultados', '', 'Ventas', 'ventas', '850000', '920000'],
  ['Resultados', '', 'Costo de Ventas', 'costoVentas', '510000', '545000']
];

export function tabularTemplateCSV() {
  return TABULAR_TEMPLATE_ROWS.map(row => row.join(',')).join('\n');
}

export function stripAccents(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeHeader(value) {
  return stripAccents(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function detectDelimiter(text) {
  const line = String(text).split(/\r?\n/).find(row => row.trim()) || '';
  const candidates = ['\t', ';', ',', '|'];
  let best = ',';
  let bestCount = 0;
  for (const candidate of candidates) {
    const count = countOutsideQuotes(line, candidate);
    if (count > bestCount) { bestCount = count; best = candidate; }
  }
  return best;
}

function countOutsideQuotes(line, token) {
  let count = 0;
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') quoted = !quoted;
    else if (char === token && !quoted) count++;
  }
  return count;
}

// RFC-4180 style parser: handles quoted fields, escaped quotes and CRLF.
export function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const source = String(text).replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') { quoted = true; continue; }
    if (char === delimiter) { row.push(field); field = ''; continue; }
    if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    if (char === '\r') continue;
    field += char;
  }
  row.push(field);
  rows.push(row);
  return rows.filter(cells => cells.some(cell => String(cell).trim() !== ''));
}
// Currency printouts often mix signs, parentheses and thousands separators.
// Returns null for blank cells so missing periods are omitted, not zeroed.
export function parseAmountCell(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`Importe inválido: ${value}`);
    return value;
  }
  if (typeof value === 'boolean') return null;
  let text = stripAccents(value).trim();
  if (!text) return null;
  let negative = false;
  if (/^\(.*\)$/.test(text)) { negative = true; text = text.slice(1, -1); }
  text = text.replace(/[^0-9.,-]/g, '');
  if (text.endsWith('-')) { negative = true; text = text.slice(0, -1); }
  if (text.startsWith('-')) { negative = true; text = text.slice(1); }
  text = text.replace(/-/g, '');
  if (!/\d/.test(text)) {
    // Blank marks and "not available" placeholders are legitimately empty;
    // any other non-numeric text is a data error the user must fix.
    const original = stripAccents(value).trim();
    if (/^[-—–_\s]*$/.test(original) || /^(n\/?a|na|nc|s\/?d|sin dato|no aplica|no aplicable)$/i.test(original)) return null;
    throw new Error(`Importe inválido: ${value}`);
  }

  const dots = (text.match(/\./g) || []).length;
  const commas = (text.match(/,/g) || []).length;
  let normalized = text;
  if (dots && commas) {
    normalized = text.lastIndexOf('.') > text.lastIndexOf(',')
      ? text.replace(/,/g, '')
      : text.replace(/\./g, '').replace(/,/g, '.');
  } else if (commas) {
    const groups = text.split(',');
    normalized = groups.slice(1).every(group => group.length === 3)
      ? text.replace(/,/g, '') : text.replace(',', '.');
  } else if (dots > 1) {
    normalized = text.replace(/\./g, '');
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) throw new Error(`Importe inválido: ${value}`);
  const number = Number(normalized);
  if (!Number.isFinite(number)) throw new Error(`Importe inválido: ${value}`);
  return negative ? -number : number;
}

function matchGroup(raw) {
  const key = normalizeHeader(raw);
  if (!key) return '';
  if (/resultado|perdida|ganancia/.test(key)) return 'estadoResultados';
  if (/balance|situacion/.test(key) && !/activ|pasiv|patrim/.test(key)) return 'balance';
  for (const [group, aliases] of Object.entries(GROUP_ALIASES)) {
    if (aliases.includes(key)) return group;
  }
  return '';
}

function findGroupByType(raw) {
  const key = normalizeHeader(raw);
  if (!key) return '';
  for (const group of ['activos', 'pasivos', 'patrimonio']) {
    if (resolveType(group, key)) return group;
  }
  return '';
}

function resolveType(group, raw) {
  const key = normalizeHeader(raw);
  if (!key) return '';
  const direct = ACCOUNT_TYPES[group].find(type => normalizeHeader(type) === key);
  if (direct) return direct;
  for (const [type, aliases] of Object.entries(TYPE_ALIASES)) {
    if (ACCOUNT_TYPES[group].includes(type) && aliases.includes(key)) return type;
  }
  return '';
}

function resolveGroup({ estado, grupo, clasif, name, rowNumber }) {
  const explicit = matchGroup(grupo);
  if (explicit && explicit !== 'balance') return explicit;
  if (matchGroup(estado) === 'estadoResultados') return 'estadoResultados';
  const byType = findGroupByType(clasif);
  if (byType) return byType;
  if (!normalizeHeader(grupo) && !normalizeHeader(estado)) {
    throw new Error(`Fila ${rowNumber}: indique Grupo (activos/pasivos/patrimonio) o Estado (Balance/Resultados) para "${name}".`);
  }
  throw new Error(`Fila ${rowNumber}: no se pudo ubicar "${name}". Indique Grupo = activos, pasivos o patrimonio.`);
}

function resolveClassification(group, typeRaw, name, rowNumber) {
  const explicit = resolveType(group, typeRaw);
  if (explicit) return explicit;
  if (String(typeRaw || '').trim()) {
    throw new Error(`Fila ${rowNumber}: la clasificación "${typeRaw}" no es válida para ${group}. Valores: ${ACCOUNT_TYPES[group].join(', ')}.`);
  }
  const inferred = inferAccountType(group, name);
  if (inferred) return inferred;
  throw new Error(`Fila ${rowNumber}: la cuenta "${name}" no se reconoce. Añada una Clasificación (ej.: ${ACCOUNT_TYPES[group][0]}).`);
}


function createBuilder() {
  return {
    periods: [], seen: new Set(), values: 0,
    balanceGeneral: {},
    estadoResultados: {},
    accountTypes: { activos: {}, pasivos: {}, patrimonio: {}, estadoResultados: {} }
  };
}

function ensurePeriod(builder, period) {
  if (!builder.seen.has(period)) { builder.seen.add(period); builder.periods.push(period); }
  if (!builder.balanceGeneral[period]) builder.balanceGeneral[period] = { activos: {}, pasivos: {}, patrimonio: {} };
  if (!builder.estadoResultados[period]) builder.estadoResultados[period] = {};
}

function sortPeriods(periods) {
  return [...periods].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
}

function ingestTable(builder, rows, defaults = {}) {
  const columns = rows[0];
  const header = columns.map(normalizeHeader);
  if (!header.includes('cuenta')) {
    throw new Error("La tabla debe tener una columna 'Cuenta' en la cabecera.");
  }
  const at = key => header.indexOf(key);
  const has = key => at(key) !== -1;
  const hasClasif = has('clasificacion') || has('tipo');
  const clasifAt = has('clasificacion') ? at('clasificacion') : at('tipo');
  const long = has('periodo') && has('importe');
  const periodColumns = long ? [] : columns
    .map((cell, index) => ({ label: String(cell).trim(), index }))
    .filter(({ label }) => !META_HEADERS.has(normalizeHeader(label)));
  if (!long && periodColumns.length === 0) {
    throw new Error("No se encontraron columnas de periodo. Añada una columna por periodo (2019, 2020, …) o use el formato largo con 'Periodo' e 'Importe'.");
  }

  const cell = (row, index) => (index === -1 || index >= row.length ? '' : row[index]);
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const rowNumber = r + 1;
    if (!row.some(value => String(value).trim() !== '')) continue;
    const name = String(cell(row, at('cuenta'))).trim();
    if (!name) throw new Error(`Fila ${rowNumber}: falta el nombre de la cuenta.`);
    const estado = has('estado') ? cell(row, at('estado')) : (defaults.estado || '');
    const grupo = has('grupo') ? cell(row, at('grupo')) : (defaults.grupo || '');
    const clasif = hasClasif ? cell(row, clasifAt) : (defaults.clasificacion || '');
    const group = resolveGroup({ estado, grupo, clasif, name, rowNumber });
    const type = resolveClassification(group, clasif, name, rowNumber);

    const assign = (period, raw) => {
      if (!period) throw new Error(`Fila ${rowNumber}: falta el periodo.`);
      const amount = parseAmountCell(raw);
      if (amount === null) return;
      ensurePeriod(builder, period);
      const target = group === 'estadoResultados'
        ? builder.estadoResultados[period] : builder.balanceGeneral[period][group];
      if (Object.hasOwn(target, name)) {
        throw new Error(`Fila ${rowNumber}: la cuenta "${name}" está duplicada en ${period}.`);
      }
      target[name] = amount;
      builder.accountTypes[group][name] = type;
      builder.values += 1;
      if (builder.values > MAX_VALUES) throw new Error('La tabla contiene demasiados importes.');
    };

    if (long) assign(String(cell(row, at('periodo'))).trim(), cell(row, at('importe')));
    else for (const { label, index } of periodColumns) assign(label, cell(row, index));
  }
}

export function rowsToFinancialData(rows, { name = 'Datos importados' } = {}) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('La tabla está vacía.');
  if (rows.length > MAX_ROWS) throw new Error('La tabla excede el límite de filas.');
  if (!Array.isArray(rows[0])) throw new Error('Formato de tabla inválido.');
  if (rows[0].length > MAX_COLUMNS) throw new Error('La tabla tiene demasiadas columnas.');
  const builder = createBuilder();
  ingestTable(builder, rows);
  if (!builder.periods.length) throw new Error('La tabla no contiene importes numéricos.');
  return {
    name,
    periods: sortPeriods(builder.periods),
    balanceGeneral: builder.balanceGeneral,
    estadoResultados: builder.estadoResultados,
    accountTypes: builder.accountTypes
  };
}

export function tableTextToFinancialData(text, { name = 'Datos importados' } = {}) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('El archivo está vacío.');
  const rows = parseDelimited(text, detectDelimiter(text));
  return normalizeFinancialData(rowsToFinancialData(rows, { name }));
}

function defaultsFromSheetName(sheetName) {
  const key = normalizeHeader(sheetName);
  if (/resultado|perdida|ganancia|ingreso/.test(key)) return { estado: 'Resultados' };
  if (/activ/.test(key)) return { estado: 'Balance', grupo: 'Activos' };
  if (/pasiv/.test(key)) return { estado: 'Balance', grupo: 'Pasivos' };
  if (/patrimonio|capital/.test(key)) return { estado: 'Balance', grupo: 'Patrimonio' };
  return {};
}

export function sheetsToFinancialData(sheets, { name = 'Datos importados' } = {}) {
  const builder = createBuilder();
  let used = 0;
  for (const sheet of sheets) {
    const rows = (sheet.rows || []).filter(row => row.some(value => String(value).trim() !== ''));
    if (rows.length < 2 || !rows[0].map(normalizeHeader).includes('cuenta')) continue;
    ingestTable(builder, rows, defaultsFromSheetName(sheet.name));
    used += 1;
  }
  if (!used) throw new Error("Ninguna hoja contiene una tabla con una columna 'Cuenta'.");
  if (!builder.periods.length) throw new Error('Las hojas no contienen importes numéricos.');
  return normalizeFinancialData({
    name,
    periods: sortPeriods(builder.periods),
    balanceGeneral: builder.balanceGeneral,
    estadoResultados: builder.estadoResultados,
    accountTypes: builder.accountTypes
  });
}

function readFile(file, as) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    if (as === 'buffer') reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  });
}

const SHEETJS_URL = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
let sheetjsPromise = null;

// SheetJS is loaded on demand from the same CDN pattern already used for Chart.js.
export function loadSheetJS() {
  if (typeof window === 'undefined') return Promise.reject(new Error('La lectura de Excel solo está disponible en el navegador.'));
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (!sheetjsPromise) {
    sheetjsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SHEETJS_URL;
      script.onload = () => (window.XLSX
        ? resolve(window.XLSX) : reject(new Error('No se pudo inicializar el lector de Excel.')));
      script.onerror = () => {
        sheetjsPromise = null;
        reject(new Error('No se pudo cargar el lector de Excel. Verifique su conexión o exporte a CSV.'));
      };
      document.head.appendChild(script);
    });
  }
  return sheetjsPromise;
}

export async function workbookToFinancialData(buffer, { name = 'Datos importados' } = {}) {
  const XLSX = await loadSheetJS();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheets = workbook.SheetNames.map(sheetName => ({
    name: sheetName,
    rows: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: true, defval: '' })
  }));
  return sheetsToFinancialData(sheets, { name });
}

export function baseName(filename) {
  return String(filename || '').replace(/\.[^.]*$/, '') || 'Datos importados';
}

export function extensionOf(filename) {
  return String(filename || '').toLowerCase().split('.').pop() || '';
}

// Single entry point used by the Estados UI for any supported file.
export async function importStatementFile(file) {
  if (!file) throw new Error('No se seleccionó ningún archivo.');
  const extension = extensionOf(file.name);
  if (extension === 'json') {
    const text = await readFile(file, 'text');
    let parsed;
    try { parsed = JSON.parse(text); } catch { throw new Error('Archivo JSON inválido.'); }
    return normalizeFinancialData(parsed);
  }
  if (['csv', 'tsv', 'txt'].includes(extension)) {
    return tableTextToFinancialData(await readFile(file, 'text'), { name: baseName(file.name) });
  }
  if (['xlsx', 'xls'].includes(extension)) {
    return workbookToFinancialData(await readFile(file, 'buffer'), { name: baseName(file.name) });
  }
  throw new Error(`Formato no soportado (.${extension || '?'}). Use .json, .csv, .tsv, .xlsx o .xls.`);
}

