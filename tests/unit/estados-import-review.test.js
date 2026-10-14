import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACCOUNT_CATALOG, matchCatalogAccount } from '../../js/modules/estados/estados-catalogo.js';
import { ACCOUNT_TYPES, computeFinancialTotals, validateFinancialData } from '../../js/modules/estados/estados-calculations.js';
import { sheetsToImportReview, textToImportReview, evaluateImportReview, finalizeImportReview,
  updateImportClassification, updateImportAmount, updateImportName, prepareStatementImport } from '../../js/modules/estados/estados-import-review.js';
import { MAX_STATEMENT_BYTES, parseAmountCell, readStatementSource } from '../../js/modules/estados/estados-import.js';
import { buildImportAIRequest, suggestImportAccounts } from '../../js/modules/estados/estados-import-ia.js';
import { estadosUI } from '../../js/modules/estados/estados-ui.js';
import { element, clic, cambiar } from './helpers/dom-falso.js';

afterEach(() => vi.unstubAllGlobals());
const EMPTY = { name: 'Empresa', periods: [], balanceGeneral: {}, estadoResultados: {} };
const csv = (...rows) => ['Estado,Grupo,Cuenta,Clasificacion,2024', ...rows].join('\n');

describe('catálogo y revisión de cuentas', () => {
  it('clasifica alias exactos sin acentos y todos los tipos pertenecen al motor compartido', () => {
    expect(matchCatalogAccount('  PRODUCCIÓN   EN PROCESO ').tipo).toBe('inventario');
    expect(matchCatalogAccount('Caja de préstamos')).toBeNull();
    for (const account of ACCOUNT_CATALOG) expect(ACCOUNT_TYPES[account.grupo]).toContain(account.tipo);
  });

  it('importa nombres del catálogo sin columnas de clasificación, y conserva originales', () => {
    const session = textToImportReview('Cuenta,2024\nCAJA CHICA,100\nProveedores,40\nAportes de socios,60\nIngresos por servicios,300');
    expect(evaluateImportReview(session)).toMatchObject({ ready: true, pending: 0, recognized: 4 });
    const data = finalizeImportReview(session);
    expect(data.balanceGeneral['2024'].activos).toEqual({ 'CAJA CHICA': 100 });
    expect(validateFinancialData(data)[0].balanced).toBe(true);
    expect(computeFinancialTotals(data, '2024').utilidadNeta).toBe(300);
  });

  it('reúne cuentas desconocidas, deuda ambigua y errores de importes en una sola revisión', () => {
    const session = textToImportReview(csv('Balance,Activos,Fondo especial,,20', 'Balance,Pasivos,Préstamo bancario,,abc123', 'Resultados,,Alquiler,,30'));
    expect(evaluateImportReview(session)).toMatchObject({ ready: false, pending: 3, errors: 1 });
    expect(() => finalizeImportReview(session)).toThrow(/pendientes/);
    updateImportClassification(session, session.rows[0].id, 'activos', 'activosCorrientesOtros');
    updateImportClassification(session, session.rows[1].id, 'pasivos', 'pasivoCortoPlazo');
    updateImportClassification(session, session.rows[2].id, 'estadoResultados', 'gastosAdmin');
    updateImportAmount(session, session.rows[1].id, 0, '10');
    expect(evaluateImportReview(session).ready).toBe(true);
    expect(finalizeImportReview(session).accountTypes.pasivos['Préstamo bancario']).toBe('pasivoCortoPlazo');
  });

  it('excluye subtotales y avisa de hojas sin tabla; mantiene filas reales de Excel', () => {
    const session = sheetsToImportReview([
      { name: 'Activos', rows: [['Empresa ejemplo'], [], ['Cuenta', '2024'], ['Caja', 100], ['Total activos', 100]] },
      { name: 'Patrimonio', rows: [['Cuenta', '2024'], ['Capital social', 100]] },
      { name: 'Notas', rows: [['Explicación'], ['Datos de ejemplo']] }
    ]);
    expect(session.rows[0].line).toBe(4);
    expect(session.ignoredSheets[0].name).toBe('Notas');
    expect(evaluateImportReview(session).ignored).toBe(1);
    expect(computeFinancialTotals(finalizeImportReview(session), '2024').totalActivos).toBe(100);
  });

  it('detecta duplicados con espacios y acentos; se pueden excluir explícitamente', () => {
    const session = textToImportReview(csv('Balance,Activos,Inventário,,50', 'Balance,Activos,INVENTARIO,,60'));
    expect(evaluateImportReview(session)).toMatchObject({ ready: false, errors: 2 });
    session.rows[1].ignored = true;
    expect(computeFinancialTotals(finalizeImportReview(session), '2024').inventario).toBe(50);
  });

  it('no confunde registros por periodo con duplicados y rechaza clasificaciones inconsistentes', () => {
    const session = textToImportReview('Periodo,Grupo,Cuenta,Clasificacion,Importe\n2023,Activos,Caja,efectivo,100\n2024,Activos,Caja,efectivo,120');
    expect(evaluateImportReview(session).ready).toBe(true);
    updateImportClassification(session, session.rows[1].id, 'activos', 'inventario');
    expect(evaluateImportReview(session).ready).toBe(false);
    expect(evaluateImportReview(session).rows[0].issues.join()).toContain('clasificaciones distintas');
  });

  it('permite corregir el nombre, conserva ceros y omite celdas ausentes', () => {
    const session = textToImportReview('Cuenta,2023,2024\nDesconocida,0,');
    updateImportName(session, session.rows[0].id, 'Caja');
    const data = finalizeImportReview(session);
    expect(data.periods).toEqual(['2023']);
    expect(data.balanceGeneral['2023'].activos.Caja).toBe(0);
  });

  it('conserva la clasificación manual al corregir el nombre de una cuenta', () => {
    const session = textToImportReview('Cuenta,2024\nCuenta pendiente,100');
    updateImportClassification(session, session.rows[0].id, 'activos', 'efectivo');
    updateImportName(session, session.rows[0].id, 'Fondo de caja principal');
    expect(evaluateImportReview(session).ready).toBe(true);
    expect(finalizeImportReview(session).accountTypes.activos['Fondo de caja principal']).toBe('efectivo');
  });

  it('requiere depreciación negativa y nunca aplica una tabla vacía de importes', () => {
    const session = textToImportReview(csv('Balance,Activos,Depreciación acumulada,,100'));
    expect(evaluateImportReview(session).errors).toBe(1);
    updateImportAmount(session, session.rows[0].id, 0, '(100)');
    expect(finalizeImportReview(session).balanceGeneral['2024'].activos['Depreciación acumulada']).toBe(-100);
    expect(evaluateImportReview(textToImportReview('Cuenta,2024\nCaja,')).ready).toBe(false);
  });

  it('el resultado del ejercicio es subtotal en resultados y cuenta real en patrimonio', () => {
    const session = textToImportReview(csv('Balance,Activos,Caja,,100', 'Balance,Patrimonio,Utilidad neta,,100', 'Resultados,,Resultado del ejercicio,,300'));
    expect(evaluateImportReview(session).ignored).toBe(1);
    expect(validateFinancialData(finalizeImportReview(session))[0].balanced).toBe(true);
  });

  it('la advertencia de un importe ambiguo desaparece al corregirlo', () => {
    const session = textToImportReview('Cuenta,2024\nCaja,45.000');
    expect(session.warnings).toHaveLength(1);
    updateImportAmount(session, session.rows[0].id, 0, '45000');
    expect(session.warnings).toHaveLength(0);
  });

  it('exige revisión si el estado y el grupo se contradicen', () => {
    const session = textToImportReview(csv('Resultados,Activos,Caja,efectivo,100'));
    expect(evaluateImportReview(session).pending).toBe(1);
    updateImportClassification(session, session.rows[0].id, 'activos', 'efectivo');
    expect(evaluateImportReview(session).ready).toBe(true);
  });

  it('lee CSV de Excel en Windows-1252 sin perder los nombres acentuados', async () => {
    const text = 'Cuenta,2024\nDepreciación acumulada,-100';
    const bytes = new Uint8Array([...text].map(char => char.charCodeAt(0)));
    const session = await prepareStatementImport({ name: 'excel.csv', size: bytes.length, arrayBuffer: async () => bytes.buffer });
    expect(session.warnings.join()).toContain('Windows-1252');
    expect(finalizeImportReview(session).balanceGeneral['2024'].activos['Depreciación acumulada']).toBe(-100);
  });

  it('rechaza claves peligrosas antes de construir objetos', () => {
    const session = textToImportReview(csv('Balance,Activos,__proto__,efectivo,10'));
    expect(evaluateImportReview(session).errors).toBe(1);
    expect(() => finalizeImportReview(session)).toThrow();
    expect(() => textToImportReview('Cuenta,__proto__\nCaja,10')).toThrow(/periodo/);
  });

  it('rechaza encabezados inválidos, columnas de texto y límites de Excel', () => {
    expect(() => textToImportReview('Cuenta,2024,2024\nCaja,1,2')).toThrow(/duplicados/);
    expect(() => textToImportReview('Cuenta,Comentario\nCaja,hola')).toThrow(/periodo/);
    expect(() => textToImportReview('Cuenta,Periodo\nCaja,2024')).toThrow(/Periodo e Importe/);
    expect(() => textToImportReview('Cuenta,2024\n"Caja,10')).toThrow(/comillas/);
    expect(() => sheetsToImportReview([{ name: 'Activos', rows: Array.from({ length: 5001 }, () => ['Cuenta', '2024']) }])).toThrow(/5000/);
    expect(() => sheetsToImportReview([{ name: 'Activos', rows: [Array(121).fill('Cuenta')] }])).toThrow(/120/);
  });

  it('no convierte texto con dígitos ni fórmulas en dinero', () => {
    for (const value of ['abc123', '100%', '=1+2', '1-2', '12+50', '(5)00', '5(0)0', true, '#DIV/0!']) expect(() => parseAmountCell(value)).toThrow(/Importe inválido/);
    expect(parseAmountCell('C$ 12.500,50')).toBe(12500.5);
    expect(parseAmountCell('(C$ 500)')).toBe(-500);
  });

  it('rechaza archivos grandes antes de leer y prepara IA sin enviar peticiones', async () => {
    await expect(readStatementSource({ name: 'grande.xlsx', size: MAX_STATEMENT_BYTES + 1 })).rejects.toThrow(/10 MB/);
    const session = textToImportReview(csv('Balance,Activos,Fondo especial,,20'));
    const request = buildImportAIRequest(session);
    expect(request.accounts).toEqual([{ id: session.rows[0].id, name: 'Fondo especial', group: 'activos', sheet: 'Tabla pegada', row: 2 }]);
    expect(request.requiresHumanReview).toBe(true);
    await expect(suggestImportAccounts(request)).rejects.toThrow(/deshabilitada/);
  });
});

describe('flujo de revisión, borrador y publicación', () => {
  function screen() {
    const page = element(); const save = vi.fn();
    vi.stubGlobal('window', { confirm: () => true });
    vi.stubGlobal('FileReader', class { readAsText(file) { this.result = file.contents; this.onload(); } });
    const editor = estadosUI(page, { initial: EMPTY, demo: EMPTY, save });
    return { page, save, editor };
  }

  it('corrige una cuenta y un importe, aplica y publica una sola vez', async () => {
    const { page, save, editor } = screen();
    const input = page.querySelector('#statesFile');
    input.files = [{ name: 'empresa.csv', contents: csv('Balance,Activos,Caja,,100', 'Balance,Pasivos,Proveedor regional,,error', 'Balance,Patrimonio,Aportes de socios,,60', 'Resultados,,Ingresos por servicios,,300') }];
    await input.dispatchEvent({ type: 'change' });
    expect(editor.hasUnsavedChanges()).toBe(true);
    await clic(page, 'saveStates');
    expect(save).not.toHaveBeenCalled();
    const review = page.querySelector('#importReview');
    await cambiar(review, 'reviewType-1', 'pasivos:cuentasPorPagar');
    await cambiar(review, 'reviewAmount-1-0', '40');
    await clic(review, 'applyImport');
    expect(page.querySelector('#balanceCheck').innerHTML).toContain('Balance equilibrado');
    expect(page.querySelector('#statementPreview').innerHTML).toContain('Ingresos por servicios');
    expect(save).not.toHaveBeenCalled();
    await clic(page, 'saveStates');
    expect(save).toHaveBeenCalledOnce();
    expect(save.mock.calls[0][0].accountTypes.pasivos['Proveedor regional']).toBe('cuentasPorPagar');
    expect(editor.hasUnsavedChanges()).toBe(false);
  });

  it('cancelar una importación conserva el borrador y vuelve a habilitar Guardar', async () => {
    const { page, editor } = screen();
    page.querySelector('#pasteStates').value = 'Cuenta,2024\nCaja,10';
    await clic(page, 'importPaste');
    await clic(page.querySelector('#importReview'), 'cancelImport');
    expect(page.querySelector('#saveStates').disabled).toBe(false);
    expect(editor.hasUnsavedChanges()).toBe(false);
  });

  it('ignora la lectura antigua cuando otro archivo termina primero', async () => {
    const { page } = screen(); const readers = [];
    vi.stubGlobal('FileReader', class { readAsText(file) { this.result = file.contents; readers.push(this); } });
    const input = page.querySelector('#statesFile');
    input.files = [{ name: 'viejo.csv', contents: 'Cuenta,2024\nCaja,1' }];
    const first = input.dispatchEvent({ type: 'change' });
    input.files = [{ name: 'nuevo.csv', contents: 'Cuenta,2024\nCaja,2' }];
    const second = input.dispatchEvent({ type: 'change' });
    readers[1].onload(); await second;
    readers[0].onload(); await first;
    await clic(page.querySelector('#importReview'), 'applyImport');
    expect(page.querySelector('#accountEditor').innerHTML).toContain('value="2"');
    expect(page.querySelector('#accountEditor').innerHTML).not.toContain('value="1"');
  });

  it('escapa nombres procedentes del archivo en la revisión', async () => {
    const { page } = screen();
    page.querySelector('#pasteStates').value = csv('Balance,Activos,<img src=x onerror=alert(1)>,efectivo,10');
    await clic(page, 'importPaste');
    const html = page.querySelector('#importReview').innerHTML;
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('<img');
  });

  it('JSON validado exige aplicar antes de cambiar el borrador', async () => {
    screen();
    const session = await prepareStatementImport({ name: 'datos.json', contents: JSON.stringify(EMPTY) });
    expect(finalizeImportReview(session)).toMatchObject(EMPTY);
  });

  it('conserva el nombre de la empresa al importar estados dentro de un respaldo completo', async () => {
    screen();
    const session = await prepareStatementImport({ name: 'respaldo.json', contents: JSON.stringify({ estados: { ...EMPTY, name: 'Empresa del respaldo' } }) });
    expect(session.name).toBe('Empresa del respaldo');
    expect(finalizeImportReview(session).name).toBe('Empresa del respaldo');
  });
});
