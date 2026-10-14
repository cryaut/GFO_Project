import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { afterEach, expect, it, vi } from 'vitest';
import { workbookToSheets, workbookToFinancialData } from '../../js/modules/estados/estados-import.js';
import { sheetsToImportReview, finalizeImportReview } from '../../js/modules/estados/estados-import-review.js';
import { computeFinancialTotals, validateFinancialData } from '../../js/modules/estados/estados-calculations.js';

const browser = {};
runInNewContext(readFileSync(new URL('../../assets/vendor/xlsx-0.20.3.full.min.js', import.meta.url), 'utf8'), browser);
afterEach(() => vi.unstubAllGlobals());

it('la plantilla XLSX real conserva filas físicas, tipos e importes en ambos estados', async () => {
  vi.stubGlobal('window', { XLSX: browser.XLSX });
  const bytes = readFileSync(new URL('../../scripts/gfo-plantilla-estados.xlsx', import.meta.url));
  const sheets = await workbookToSheets(bytes);
  const session = sheetsToImportReview(sheets);
  expect(session.rows[0].line).toBe(6);
  expect(session.rows).toHaveLength(15);
  const data = finalizeImportReview(session);
  expect(validateFinancialData(data).every(row => row.balanced)).toBe(true);
  expect(computeFinancialTotals(data, '2023')).toMatchObject({ totalActivos: 425000, totalPasivos: 225000, totalPatrimonio: 200000, utilidadNeta: 112000 });
  expect(computeFinancialTotals(data, '2024')).toMatchObject({ totalActivos: 477000, totalPasivos: 217000, totalPatrimonio: 260000, utilidadNeta: 132300 });
  const strict = await workbookToFinancialData(bytes);
  expect(strict).toEqual(data);
});

it('Excel impone límites físicos antes de convertir una hoja, incluso si el lector truncó las filas', async () => {
  const convert = vi.fn();
  vi.stubGlobal('window', { XLSX: { read: () => ({ SheetNames: ['Grande'], Sheets: { Grande: { '!ref': 'A1:B5', '!fullref': 'A1:B5001' } } }),
    utils: { decode_range: browser.XLSX.utils.decode_range, sheet_to_json: convert } } });
  await expect(workbookToSheets(new Uint8Array())).rejects.toThrow(/5000/);
  expect(convert).not.toHaveBeenCalled();
});

it('Excel rechaza columnas fuera del límite antes de convertirlas', async () => {
  const convert = vi.fn();
  vi.stubGlobal('window', { XLSX: { read: () => ({ SheetNames: ['Ancha'], Sheets: { Ancha: { '!ref': 'A1:DQ2' } } }),
    utils: { decode_range: browser.XLSX.utils.decode_range, sheet_to_json: convert } } });
  await expect(workbookToSheets(new Uint8Array())).rejects.toThrow(/120/);
  expect(convert).not.toHaveBeenCalled();
});
