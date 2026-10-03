import { describe, expect, it } from 'vitest';
import {
  inferDecimalStyle, parseAmountCell, sheetsToFinancialData, tableTextToFinancialData
} from '../../js/modules/estados/estados-import.js';

// Lectura de importes con separadores ambiguos ("45.000" puede ser 45 o 45 mil).

function leerAuto(texto) {
  const ambiguos = [];
  const valor = parseAmountCell(texto, { onAmbiguous: item => ambiguos.push(item) });
  return { valor, ambiguos };
}

describe('parseAmountCell en modo automático', () => {
  it('no confunde un decimal con miles cuando el entero empieza en 0 o no agrupa de a tres', () => {
    expect(parseAmountCell('0,500')).toBe(0.5);     // antes: 500
    expect(parseAmountCell('0.500')).toBe(0.5);
    expect(parseAmountCell('1234,5')).toBe(1234.5); // 4 dígitos antes de la coma: no son miles
    expect(parseAmountCell('12,50')).toBe(12.5);
    expect(parseAmountCell('45,000')).toBe(45000);  // convención del proyecto: coma = miles
  });

  it('rechaza agrupaciones imposibles en vez de inventar un importe', () => {
    expect(() => parseAmountCell('1.2.3')).toThrow(/Importe inválido/); // antes: 123
    expect(() => parseAmountCell('1,2,3')).toThrow(/Importe inválido/);
    expect(parseAmountCell('1.234.567')).toBe(1234567);
  });

  it('avisa cuando un punto con tres decimales podría ser separador de miles', () => {
    expect(leerAuto('45.000')).toEqual({ valor: 45, ambiguos: [{ texto: '45.000', valor: 45 }] });
    expect(leerAuto('1.234').ambiguos).toHaveLength(1);
    // Sin ambigüedad: no avisa.
    expect(leerAuto('0.500').ambiguos).toEqual([]);
    expect(leerAuto('45,000').ambiguos).toEqual([]);
    expect(leerAuto('12.5').ambiguos).toEqual([]);
    expect(leerAuto('1.234.567').ambiguos).toEqual([]);
  });
});

describe('parseAmountCell con formato explícito', () => {
  it('coma decimal: el punto agrupa miles', () => {
    expect(parseAmountCell('45.000', { decimal: ',' })).toBe(45000);
    expect(parseAmountCell('12.500,50', { decimal: ',' })).toBe(12500.5);
    expect(parseAmountCell('1234,5', { decimal: ',' })).toBe(1234.5);
    expect(parseAmountCell('C$ 1.234.567,89', { decimal: ',' })).toBe(1234567.89);
    expect(parseAmountCell('(2.500,00)', { decimal: ',' })).toBe(-2500);
  });

  it('punto decimal: la coma agrupa miles', () => {
    expect(parseAmountCell('45.000', { decimal: '.' })).toBe(45);
    expect(parseAmountCell('1,234.50', { decimal: '.' })).toBe(1234.5);
    expect(parseAmountCell('45,000', { decimal: '.' })).toBe(45000);
  });

  it('falla si el texto contradice el formato elegido', () => {
    expect(() => parseAmountCell('1,234.50', { decimal: ',' })).toThrow(/Importe inválido/);
    expect(() => parseAmountCell('1.234,5', { decimal: '.' })).toThrow(/Importe inválido/);
    expect(() => parseAmountCell('1,5', { decimal: '.' })).toThrow(/Importe inválido/);
    expect(() => parseAmountCell('1.2.3', { decimal: ',' })).toThrow(/Importe inválido/);
  });

  it('las celdas vacías y los números reales no dependen del formato', () => {
    expect(parseAmountCell('', { decimal: ',' })).toBeNull();
    expect(parseAmountCell('n/a', { decimal: '.' })).toBeNull();
    expect(parseAmountCell(45000.5, { decimal: ',' })).toBe(45000.5);
  });
});

describe('inferDecimalStyle', () => {
  it('deduce la coma decimal cuando algún importe lo demuestra', () => {
    expect(inferDecimalStyle(['45.000', '1.234.567', '20.000'])).toBe(',');
    expect(inferDecimalStyle(['45.000', '12,50'])).toBe(',');
    expect(inferDecimalStyle(['1.234,50'])).toBe(',');
  });

  it('deduce el punto decimal cuando algún importe lo demuestra', () => {
    expect(inferDecimalStyle(['45,000', '1,234.50'])).toBe('.');
    expect(inferDecimalStyle(['1,234,567', '12.5'])).toBe('.');
  });

  it('devuelve null sin evidencia o con evidencia contradictoria', () => {
    expect(inferDecimalStyle(['45.000', '1,234'])).toBeNull();
    expect(inferDecimalStyle(['12,50', '1.5'])).toBeNull();
    expect(inferDecimalStyle([])).toBeNull();
    expect(inferDecimalStyle([45000, null, '', 'n/a', 'texto'])).toBeNull();
  });
});

const CABECERA = 'Estado,Grupo,Cuenta,Clasificacion,2023';

describe('importación de tablas con formato de importes', () => {
  it('lee un archivo con puntos de miles sin avisos porque otro importe aclara el formato', () => {
    const csv = [
      CABECERA,
      'Balance,Activos,Efectivo,efectivo,"45.000"',
      'Balance,Activos,Inventario,inventario,"1.234.567,89"',
      'Balance,Pasivos,Cuentas por Pagar,cuentasPorPagar,"20.000"',
      'Balance,Patrimonio,Capital,,"1.259.567,89"',
      'Resultados,,Ventas,ventas,"500.000"'
    ].join('\n');
    const avisos = [];
    const datos = tableTextToFinancialData(csv, { avisos });
    expect(datos.balanceGeneral['2023'].activos).toEqual({ Efectivo: 45000, Inventario: 1234567.89 });
    expect(datos.balanceGeneral['2023'].pasivos['Cuentas por Pagar']).toBe(20000);
    expect(datos.estadoResultados['2023'].Ventas).toBe(500000);
    expect(avisos).toEqual([]);
  });

  it('sin evidencia, conserva la convención (punto decimal) y avisa con el número de fila', () => {
    const avisos = [];
    const datos = tableTextToFinancialData(`${CABECERA}\nBalance,Activos,Efectivo,efectivo,45.000`, { avisos });
    expect(datos.balanceGeneral['2023'].activos.Efectivo).toBe(45);
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toContain('Fila 2');
    expect(avisos[0]).toContain('"45.000"');
    expect(avisos[0]).toContain('Coma decimal');
  });

  it('con coma decimal elegida por la persona, 45.000 es cuarenta y cinco mil y no avisa', () => {
    const avisos = [];
    const datos = tableTextToFinancialData(`${CABECERA}\nBalance,Activos,Efectivo,efectivo,45.000`, { decimal: ',', avisos });
    expect(datos.balanceGeneral['2023'].activos.Efectivo).toBe(45000);
    expect(avisos).toEqual([]);
  });

  it('un formato elegido prevalece sobre la deducción automática', () => {
    const csv = `${CABECERA}\nBalance,Activos,Efectivo,efectivo,"1.234.567"`;
    expect(() => tableTextToFinancialData(csv, { decimal: '.' })).toThrow(/Fila 2/);
  });

  it('el error de un importe indica fila, cuenta y periodo', () => {
    const csv = `${CABECERA}\nBalance,Activos,Efectivo,efectivo,abc`;
    expect(() => tableTextToFinancialData(csv)).toThrow(/Fila 2, cuenta "Efectivo", periodo 2023: Importe inválido: abc/);
  });

  it('rechaza un formato de importes desconocido', () => {
    expect(() => tableTextToFinancialData(`${CABECERA}\nBalance,Activos,Efectivo,efectivo,1`, { decimal: ';' }))
      .toThrow(/Formato de importes no válido/);
  });

  it('las hojas de Excel con texto reciben el mismo tratamiento', () => {
    const hojas = [{ name: 'Datos', rows: [
      ['Estado', 'Grupo', 'Cuenta', 'Clasificacion', '2023'],
      ['Balance', 'Activos', 'Efectivo', 'efectivo', '45.000']
    ] }];
    const avisos = [];
    expect(sheetsToFinancialData(hojas, { decimal: ',' }).balanceGeneral['2023'].activos.Efectivo).toBe(45000);
    expect(sheetsToFinancialData(hojas, { avisos }).balanceGeneral['2023'].activos.Efectivo).toBe(45);
    expect(avisos).toHaveLength(1);
  });
});
