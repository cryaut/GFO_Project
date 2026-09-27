import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  detectDelimiter, extensionOf, baseName, importStatementFile, loadSheetJS,
  parseAmountCell, parseDelimited, rowsToFinancialData,
  sheetsToFinancialData, tableTextToFinancialData, tabularTemplateCSV
} from '../../js/modules/estados/estados-import.js';

afterEach(() => vi.unstubAllGlobals());

describe('parseAmountCell', () => {
  it('acepta números, signos contables y separadores de miles', () => {
    expect(parseAmountCell(45000)).toBe(45000);
    expect(parseAmountCell('45000')).toBe(45000);
    expect(parseAmountCell('45,000')).toBe(45000);
    expect(parseAmountCell('1,234,567.89')).toBe(1234567.89);
    expect(parseAmountCell('1.234.567,89')).toBe(1234567.89);
    expect(parseAmountCell('(500)')).toBe(-500);
    expect(parseAmountCell('500-')).toBe(-500);
    expect(parseAmountCell('-98525')).toBe(-98525);
    expect(parseAmountCell('C$ 12,500.50')).toBe(12500.5);
  });

  it('devuelve null para celdas vacías y falla con texto no numérico', () => {
    expect(parseAmountCell('')).toBeNull();
    expect(parseAmountCell(null)).toBeNull();
    expect(parseAmountCell(undefined)).toBeNull();
    expect(() => parseAmountCell('no es un número')).toThrow(/Importe inválido/);
  });
});

describe('parseDelimited', () => {
  it('detecta el delimitador y respeta comillas', () => {
    expect(detectDelimiter('a\tb\tc')).toBe('\t');
    expect(detectDelimiter('a;b;c')).toBe(';');
    expect(detectDelimiter('a,b,c')).toBe(',');
    expect(detectDelimiter('Cuenta,2024\nEfectivo,100')).toBe(',');
    expect(parseDelimited('Cuenta,Valor\n"Efectivo, caja",100\n', ','))
      .toEqual([['Cuenta', 'Valor'], ['Efectivo, caja', '100']]);
    expect(parseDelimited('a\t"con ""comillas"""\n', '\t')).toEqual([['a', 'con "comillas"']]);
  });
});

describe('tableTextToFinancialData', () => {
  it('importa el formato ancho y ordena los periodos del más antiguo al más reciente', () => {
    const csv = [
      'Estado,Grupo,Cuenta,Clasificacion,2024,2023',
      'Balance,Activos,Efectivo,efectivo,52000,45000',
      'Balance,Activos,Cuentas por Cobrar,cxC,135000,120000',
      'Balance,Pasivos,Cuentas por Pagar,cuentasPorPagar,92000,85000',
      'Balance,Patrimonio,Capital Social,,300000,300000',
      'Resultados,,Ventas,ventas,920000,850000',
      'Resultados,,Costo de Ventas,costoVentas,545000,510000'
    ].join('\n');
    const data = tableTextToFinancialData(csv, { name: 'Externa' });
    expect(data.name).toBe('Externa');
    expect(data.periods).toEqual(['2023', '2024']);
    expect(data.balanceGeneral['2024'].activos).toEqual({ Efectivo: 52000, 'Cuentas por Cobrar': 135000 });
    expect(data.estadoResultados['2024']).toEqual({ Ventas: 920000, 'Costo de Ventas': 545000 });
    expect(data.accountTypes.patrimonio['Capital Social']).toBe('patrimonio');
    expect(data.accountTypes.estadoResultados['Costo de Ventas']).toBe('costoVentas');
  });

  it('importa el formato largo con una fila por periodo', () => {
    const csv = [
      'Periodo,Estado,Grupo,Cuenta,Importe',
      '2024,Balance,Activos,Efectivo,52000',
      '2023,Balance,Activos,Efectivo,45000',
      '2024,Resultados,,Ventas,920000',
      '2023,Resultados,,Ventas,850000'
    ].join('\n');
    const data = tableTextToFinancialData(csv);
    expect(data.periods).toEqual(['2023', '2024']);
    expect(data.balanceGeneral['2023'].activos).toEqual({ Efectivo: 45000 });
    expect(data.estadoResultados['2024']).toEqual({ Ventas: 920000 });
  });

  it('acepta tabuladores pegados desde Excel y clasificaciones con nombre', () => {
    const tsv = [
      'Cuenta\tClasificacion\t2024',
      'Banco regional\tBanco\t100',
      'Fábrica textil\tProveedores\t40',
      'Socios fundadores\tPatrimonio\t60'
    ].join('\n');
    const data = tableTextToFinancialData(tsv);
    expect(data.balanceGeneral['2024'].activos).toEqual({ 'Banco regional': 100 });
    expect(data.balanceGeneral['2024'].pasivos).toEqual({ 'Fábrica textil': 40 });
    expect(data.balanceGeneral['2024'].patrimonio).toEqual({ 'Socios fundadores': 60 });
  });

  it('omite importes en blanco en lugar de tratarlos como cero', () => {
    const csv = ['Cuenta,Grupo,Clasificacion,2023,2024', 'Efectivo,Activos,efectivo,100,150', 'Inventario,Activos,inventario,,80'].join('\n');
    const data = tableTextToFinancialData(csv);
    expect(data.balanceGeneral['2023'].activos).toEqual({ Efectivo: 100 });
    expect(data.balanceGeneral['2024'].activos).toEqual({ Efectivo: 150, Inventario: 80 });
  });

  it('explica los errores con el número de fila', () => {
    const sinGrupo = ['Cuenta,2024', 'Cuenta rara,100'].join('\n');
    expect(() => tableTextToFinancialData(sinGrupo)).toThrow(/Fila 2:.*Cuenta rara/);
    const malaClasificacion = ['Cuenta,Grupo,Clasificacion,2024', 'Efectivo,Activos,ventas,100'].join('\n');
    expect(() => tableTextToFinancialData(malaClasificacion)).toThrow(/no es válida para activos/);
    const duplicada = ['Cuenta,Grupo,Clasificacion,2024', 'Efectivo,Activos,efectivo,100', 'Efectivo,Activos,efectivo,200'].join('\n');
    expect(() => tableTextToFinancialData(duplicada)).toThrow(/duplicada/);
    expect(() => tableTextToFinancialData('')).toThrow(/vacío/);
    expect(() => tableTextToFinancialData('Cuenta,2024')).toThrow(/no contiene importes/);
  });

  it('la plantilla descargable es importable de vuelta', () => {
    const data = tableTextToFinancialData(tabularTemplateCSV());
    expect(data.periods).toEqual(['2023', '2024']);
    expect(data.balanceGeneral['2024'].activos.Efectivo).toBe(52000);
  });
});

describe('sheetsToFinancialData', () => {
  it('combina varias hojas usando el nombre como estado/grupo', () => {
    const sheets = [
      { name: 'Activos', rows: [['Cuenta', '2024'], ['Efectivo', 100]] },
      { name: 'Pasivos', rows: [['Cuenta', '2024'], ['Proveedores', 40]] },
      { name: 'Patrimonio', rows: [['Cuenta', '2024'], ['Capital Social', 60]] },
      { name: 'Resultados', rows: [['Cuenta', '2024'], ['Ventas', 300]] }
    ];
    const data = sheetsToFinancialData(sheets, { name: 'Libro' });
    expect(data.balanceGeneral['2024'].activos).toEqual({ Efectivo: 100 });
    expect(data.balanceGeneral['2024'].pasivos).toEqual({ Proveedores: 40 });
    expect(data.balanceGeneral['2024'].patrimonio).toEqual({ 'Capital Social': 60 });
    expect(data.estadoResultados['2024']).toEqual({ Ventas: 300 });
  });

  it('falla si ninguna hoja tiene columna Cuenta', () => {
    expect(() => sheetsToFinancialData([{ name: 'Hoja1', rows: [['A', 'B'], [1, 2]] }]))
      .toThrow(/Ninguna hoja/);
  });
});

describe('rowsToFinancialData', () => {
  it('rechaza tablas vacías o encabezados sin Cuenta', () => {
    expect(() => rowsToFinancialData([])).toThrow(/vacía/);
    expect(() => rowsToFinancialData([['Periodo', 'Importe'], ['2024', 1]])).toThrow(/Cuenta/);
  });
});

describe('importStatementFile', () => {
  function stubReader() {
    vi.stubGlobal('FileReader', class {
      readAsText(file) { this.result = file.contents; this.onload(); }
      readAsArrayBuffer(file) { this.result = file.contents; this.onload(); }
    });
  }

  it('enruta JSON, CSV y formatos no soportados', async () => {
    stubReader();
    const json = { periods: ['2024'], balanceGeneral: { '2024': { activos: { Efectivo: 10 } } },
      estadoResultados: { '2024': { Ventas: 10 } } };
    const fromJSON = await importStatementFile({ name: 'x.json', contents: JSON.stringify(json) });
    expect(fromJSON.balanceGeneral['2024'].activos).toEqual({ Efectivo: 10 });

    const fromCSV = await importStatementFile({ name: 'x.csv', contents: 'Cuenta,Grupo,Clasificacion,2024\nEfectivo,Activos,efectivo,5' });
    expect(fromCSV.name).toBe('x');
    expect(fromCSV.balanceGeneral['2024'].activos).toEqual({ Efectivo: 5 });

    await expect(importStatementFile({ name: 'x.pdf', contents: '' })).rejects.toThrow(/Formato no soportado/);
    await expect(importStatementFile(null)).rejects.toThrow(/No se seleccionó/);
  });

  it('expone utilidades de nombre de archivo', () => {
    expect(extensionOf('Balance 2024.CSV')).toBe('csv');
    expect(baseName('Balance 2024.xlsx')).toBe('Balance 2024');
    expect(baseName(null)).toBe('Datos importados');
  });

  it('explica que Excel requiere navegador cuando no hay window', async () => {
    vi.stubGlobal('window', undefined);
    await expect(loadSheetJS()).rejects.toThrow(/navegador/);
  });
});

