import { ACCOUNT_TYPES } from './estados-calculations.js';
import { matchCatalogAccount, normalizeAccountName, isStatementSubtotal } from './estados-catalogo.js';
import { normalizeFinancialData } from './estados-normalize.js';
import {
  parseAmountCell, inferDecimalStyle, normalizeHeader, resolveGroup, resolveClassification,
  readStatementSource, baseName, parseDelimited, detectDelimiter, FORMATOS_IMPORTE
} from './estados-import.js';

const META = new Set(['estado', 'grupo', 'cuenta', 'clasificacion', 'tipo', 'periodo', 'importe', 'moneda', 'nota']);
const UNSAFE = new Set(['__proto__', 'constructor', 'prototype']);
const validPeriod = period => !!period && period.length <= 40 && !UNSAFE.has(period);

function sheetDefaults(name) {
  const key = normalizeHeader(name);
  if (/resultado|perdida|ganancia/.test(key)) return { estado: 'Resultados', grupo: '' };
  if (/^activos?$/.test(key)) return { estado: 'Balance', grupo: 'Activos' };
  if (/^pasivos?$/.test(key)) return { estado: 'Balance', grupo: 'Pasivos' };
  if (/^(patrimonio|capital)$/.test(key)) return { estado: 'Balance', grupo: 'Patrimonio' };
  return { estado: '', grupo: '' };
}

function classify(row) {
  row.group = ''; row.type = ''; row.match = 'Pendiente';
  if (row.ignored) return;
  const catalog = matchCatalogAccount(row.account);
  try {
    row.group = resolveGroup({ estado: row.estado, grupo: row.grupo, clasif: row.clasif,
      name: row.account, rowNumber: row.line });
  } catch {
    // Inferir el grupo solo cuando el archivo no aporta un grupo o estado incompatible.
    const estado = normalizeHeader(row.estado);
    if (catalog && !row.grupo && (!estado || /balance|situacion/.test(estado) && catalog.grupo !== 'estadoResultados')) {
      row.group = catalog.grupo;
    }
  }
  if (!row.group && catalog && !row.estado && !row.grupo && !row.clasif) row.group = catalog.grupo;
  if (!row.group) return;
  const estado = normalizeHeader(row.estado);
  if ((/resultado|perdida|ganancia/.test(estado) && row.group !== 'estadoResultados')
    || (/balance|situacion/.test(estado) && row.group === 'estadoResultados')) {
    row.group = ''; row.match = 'Estado y grupo contradictorios'; return;
  }
  // Un préstamo sin plazo y un gasto sin función requieren intervención humana.
  if (!row.clasif && /^(prestamo(s)?( bancario(s)?)?|deuda(s)?|obligaciones financieras|gastos|sueldos|salarios|alquiler(es)?|provisiones)$/i.test(normalizeAccountName(row.account))) return;
  try {
    row.type = resolveClassification(row.group, row.clasif, row.account, row.line);
    row.match = row.clasif ? 'Clasificación del archivo' : matchCatalogAccount(row.account, row.group) ? 'Catálogo' : 'Regla existente';
  } catch { /* La persona puede resolver la clasificación en la revisión. */ }
}

function refreshWarnings(session) {
  session.warnings = [...session.notes, ...session.rows.flatMap(row => row.amounts.map(amount => amount.warning).filter(Boolean))].slice(0, 100);
}

function readAmount(row, amount) {
  amount.error = ''; amount.value = null;
  amount.warning = '';
  try {
    amount.value = parseAmountCell(amount.raw, { decimal: row.decimal,
      onAmbiguous: ({ texto, valor }) => {
        amount.warning = `${row.sheet}, fila ${row.line}: "${texto}" se leyó como ${valor}. Verifique el formato de importes.`;
      } });
  } catch (error) { amount.error = error.message; }
}

export function sheetsToImportReview(sheets, { name = 'Datos importados', decimal = 'auto' } = {}) {
  if (!FORMATOS_IMPORTE.includes(decimal)) throw new Error('Formato de importes no válido.');
  if (!Array.isArray(sheets) || sheets.length > 50) throw new Error('Libro inválido o con demasiadas hojas.');
  const session = { name, decimal, rows: [], warnings: [], notes: [], ignoredSheets: [] };
  let rowsRead = 0; let valueCount = 0;
  sheets.forEach((sheet, sheetIndex) => {
    const rows = sheet.rows || [];
    rowsRead += rows.length;
    if (rowsRead > 5000) throw new Error('El archivo excede el límite de 5000 filas.');
    if (rows.some(row => !Array.isArray(row) || row.length > 120)) throw new Error('Tabla inválida o con más de 120 columnas.');
    const headerIndex = rows.slice(0, 25).findIndex(row => row.map(normalizeHeader).includes('cuenta'));
    if (headerIndex < 0 || rows.length <= headerIndex + 1) {
      session.ignoredSheets.push({ name: sheet.name, reason: 'Sin tabla con encabezado Cuenta y filas de datos.' });
      return;
    }
    if (headerIndex) session.notes.push(`${sheet.name}: se omitieron ${headerIndex} filas anteriores al encabezado.`);
    const columns = rows[headerIndex].map(value => String(value).trim());
    const header = columns.map(normalizeHeader);
    const labels = header.filter(Boolean);
    if (new Set(labels).size !== labels.length) throw new Error(`${sheet.name}: encabezados duplicados.`);
    const at = key => header.indexOf(key);
    const cell = (row, key) => at(key) < 0 ? '' : String(row[at(key)] ?? '').trim();
    const long = at('periodo') >= 0 && at('importe') >= 0;
    if ((at('periodo') >= 0) !== (at('importe') >= 0)) throw new Error(`${sheet.name}: el formato largo requiere Periodo e Importe.`);
    const periods = columns.map((label, index) => ({ label, index })).filter(({ label }) => label && !META.has(normalizeHeader(label)));
    if (!long && !periods.length) throw new Error(`${sheet.name}: añada una columna por periodo o Periodo e Importe.`);
    if (!long && periods.some(({ label }) => !validPeriod(label) || !/^\d{4}(?:[- /].+)?$/.test(label))) {
      throw new Error(`${sheet.name}: las columnas de periodo deben empezar con un año, por ejemplo 2024 o 2024-T1. Use el formato largo para otros nombres.`);
    }
    const numericColumns = long ? [at('importe')] : periods.map(period => period.index);
    const inferredDecimal = decimal === 'auto'
      ? inferDecimalStyle(rows.slice(headerIndex + 1).flatMap(row => numericColumns.map(index => row[index]))) : null;
    const defaults = sheetDefaults(sheet.name);
    rows.slice(headerIndex + 1).forEach((cells, index) => {
      if (!cells.some(value => String(value ?? '').trim())) return;
      const row = { id: `${sheetIndex}:${headerIndex + index + 1}`, sheet: sheet.name,
        line: headerIndex + index + 2, account: cell(cells, 'cuenta'),
        estado: cell(cells, 'estado') || defaults.estado, grupo: cell(cells, 'grupo') || defaults.grupo,
        clasif: cell(cells, 'clasificacion') || cell(cells, 'tipo'),
        decimal: inferredDecimal || decimal, ignored: false, sourceErrors: [], amounts: [] };
      if (cells.length > columns.length && cells.slice(columns.length).some(value => String(value ?? '').trim())) row.sourceErrors.push('Hay valores fuera de las columnas del encabezado.');
      if (columns.some((label, index) => !label && String(cells[index] ?? '').trim())) row.sourceErrors.push('Hay valores en una columna sin encabezado.');
      if (long) row.amounts.push({ period: cell(cells, 'periodo'), raw: cells[at('importe')] ?? '' });
      else for (const { label, index: column } of periods) row.amounts.push({ period: label, raw: cells[column] ?? '' });
      valueCount += row.amounts.length;
      if (valueCount > 20000) throw new Error('El archivo contiene demasiados importes (máximo 20000).');
      classify(row);
      row.subtotal = isStatementSubtotal(row.account, row.group);
      row.ignored = row.subtotal;
      session.rows.push(row);
      row.amounts.forEach(amount => readAmount(row, amount));
    });
  });
  if (!session.rows.length) throw new Error("Ninguna hoja contiene datos con una columna 'Cuenta'.");
  refreshWarnings(session);
  return session;
}

export function textToImportReview(text, options = {}) {
  if (!String(text).trim()) throw new Error('La tabla está vacía.');
  return sheetsToImportReview([{ name: 'Tabla pegada', rows: parseDelimited(text, detectDelimiter(text)) }], options);
}

export async function prepareStatementImport(file, options = {}) {
  const source = await readStatementSource(file);
  if (source.kind === 'json') return { name: source.data.name, data: source.data, rows: [], warnings: [], ignoredSheets: [] };
  const session = sheetsToImportReview(source.sheets, { name: baseName(file.name), ...options });
  session.notes.push(...(source.warnings || []));
  refreshWarnings(session);
  return session;
}

export function updateImportClassification(session, id, group, type) {
  const row = session.rows.find(row => row.id === id);
  if (!row || !ACCOUNT_TYPES[group]?.includes(type)) throw new Error('Clasificación de revisión inválida.');
  row.group = group; row.type = type; row.match = 'Revisión manual';
}

export function updateImportAmount(session, id, index, raw) {
  const row = session.rows.find(row => row.id === id);
  if (!row?.amounts[index]) throw new Error('Celda de revisión inválida.');
  row.amounts[index].raw = raw;
  readAmount(row, row.amounts[index]);
  refreshWarnings(session);
}

export function updateImportName(session, id, name) {
  const row = session.rows.find(row => row.id === id);
  if (!row) throw new Error('Fila de revisión inválida.');
  row.account = String(name).trim();
  // El nombre se puede corregir después de elegir el tipo; la decisión manual
  // debe conservarse y volver a pasar por la validación de consistencia.
  if (row.match !== 'Revisión manual') classify(row);
}

export function evaluateImportReview(session) {
  if (session.data) return { ready: true, recognized: Object.values(session.data.accountTypes).reduce((sum, group) => sum + Object.keys(group).length, 0), pending: 0, errors: 0, ignored: 0, rows: [] };
  const seen = new Map(); const classifications = new Map(); const issues = new Map();
  const periods = new Set(); const accountsPerPeriod = new Map();
  const add = (row, message) => issues.get(row.id).push(message);
  for (const row of session.rows) issues.set(row.id, []);
  for (const row of session.rows.filter(row => !row.ignored)) {
    row.sourceErrors.forEach(message => add(row, message));
    if (!row.account || row.account.length > 120 || UNSAFE.has(row.account)) add(row, 'Nombre de cuenta inválido (máximo 120 caracteres).');
    if (!ACCOUNT_TYPES[row.group]?.includes(row.type)) add(row, 'Seleccione una clasificación para esta cuenta.');
    const canonical = `${row.group}:${normalizeAccountName(row.account)}`;
    if (row.group && row.type) {
      const previous = classifications.get(canonical);
      if (previous && previous.type !== row.type) {
        add(row, 'La misma cuenta tiene clasificaciones distintas entre periodos.');
        add(previous, 'La misma cuenta tiene clasificaciones distintas entre periodos.');
      } else classifications.set(canonical, row);
    }
    for (const amount of row.amounts) {
      if (amount.error) add(row, `${amount.period}: ${amount.error}`);
      if (row.type === 'depreciacionAcumulada' && amount.value > 0) add(row, `${amount.period}: la depreciación acumulada debe tener importe negativo o cero.`);
      if (!validPeriod(amount.period)) add(row, 'Periodo inválido o vacío.');
      if (amount.value === null || amount.error || !row.group) continue;
      periods.add(amount.period);
      if (periods.size > 100) add(row, 'Máximo 100 periodos por conjunto.');
      const groupKey = `${row.group}:${amount.period}`;
      if (!accountsPerPeriod.has(groupKey)) accountsPerPeriod.set(groupKey, new Set());
      accountsPerPeriod.get(groupKey).add(canonical);
      if (accountsPerPeriod.get(groupKey).size > 200) add(row, 'Máximo 200 cuentas por grupo y periodo.');
      const key = `${canonical}:${amount.period}`;
      const previous = seen.get(key);
      if (previous) {
        add(row, `Cuenta duplicada en ${amount.period}; también aparece en ${previous.sheet}, fila ${previous.line}.`);
        add(previous, `Cuenta duplicada en ${amount.period}.`);
      } else seen.set(key, row);
    }
  }
  const rows = session.rows.map(row => ({ ...row, issues: [...new Set(issues.get(row.id))] }));
  const active = rows.filter(row => !row.ignored);
  const pending = active.filter(row => !row.group || !row.type).length;
  const errors = active.filter(row => row.issues.some(issue => !issue.startsWith('Seleccione una clasificación'))).length;
  const recognized = active.filter(row => row.group && row.type).length;
  return { ready: active.length > 0 && active.every(row => !row.issues.length) && seen.size > 0,
    recognized, pending, errors, ignored: rows.length - active.length, rows };
}

export function finalizeImportReview(session) {
  if (session.data) return normalizeFinancialData(session.data);
  const review = evaluateImportReview(session);
  if (!review.ready) throw new Error('La importación tiene cuentas pendientes, errores o no contiene importes. Revise las filas antes de aplicarla.');
  const data = { name: session.name, periods: [], balanceGeneral: {}, estadoResultados: {},
    accountTypes: { activos: {}, pasivos: {}, patrimonio: {}, estadoResultados: {} } };
  for (const row of session.rows.filter(row => !row.ignored)) {
    for (const { period, value } of row.amounts) {
      if (value === null) continue;
      if (!Object.hasOwn(data.balanceGeneral, period)) {
        data.periods.push(period);
        data.balanceGeneral[period] = { activos: {}, pasivos: {}, patrimonio: {} };
        data.estadoResultados[period] = {};
      }
      const target = row.group === 'estadoResultados' ? data.estadoResultados[period] : data.balanceGeneral[period][row.group];
      target[row.account] = value;
      data.accountTypes[row.group][row.account] = row.type;
    }
  }
  return normalizeFinancialData(data);
}
