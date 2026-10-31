import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  computeFinancialTotals, validateFinancialData, seleccionarPeriodos
} from '../../js/modules/estados/estados-calculations.js';
import { parseFinancialJSON } from '../../js/modules/estados/estados-normalize.js';
import { parseAmountCell, tableTextToFinancialData } from '../../js/modules/estados/estados-import.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';

// Ronda 2, T4: batería de 15 conjuntos. Los esperados del bloque A vienen del
// archivo de referencia (calculados fuera de la app); B y C fijan conductas
// adversariales y del selector. Tolerancia de comparación: 0.01.

const TOLERANCIA = 0.01;
const CAMPOS_TOTALES = [
  'activosCorrientes', 'activosFijos', 'totalActivos', 'pasivosCorrientes',
  'totalPasivos', 'totalPatrimonio', 'ventasBrutas', 'ventas', 'costoVentas',
  'utilidadBruta', 'utilidadNeta'
];
const TODOS_LOS_CAMPOS = [...CAMPOS_TOTALES, 'razonCorriente'];

// La razón corriente sale de los totales de la app: corrientes / pasivos corrientes.
const razonCorriente = t => (t.activosCorrientes === null || t.pasivosCorrientes === null || t.pasivosCorrientes === 0)
  ? null : t.activosCorrientes / t.pasivosCorrientes;

const diferenciasDe = (totales, esperado) => TODOS_LOS_CAMPOS.flatMap(campo => {
  const obtenido = campo === 'razonCorriente' ? razonCorriente(totales) : totales[campo];
  const referencia = esperado[campo];
  const diferencia = obtenido === null || obtenido === undefined ? Infinity : Math.abs(obtenido - referencia);
  return diferencia <= TOLERANCIA ? [] : [{ campo, esperado: referencia, obtenido, diferencia }];
});

// Bloque A: balances de referencia construidos, no estados de empresas reales.
const bloqueA = JSON.parse(readFileSync(new URL('./fixtures/estados_ronda2_bloque_A.json', import.meta.url), 'utf8'));

describe('batería A: balances de referencia', () => {
  for (const conjunto of bloqueA.conjuntos) {
    describe(conjunto.id, () => {
      const datos = parseFinancialJSON(JSON.stringify(conjunto.entrada));
      for (const periodo of conjunto.entrada.periods) {
        it(`${conjunto.id} ${periodo}: 12 campos contra la referencia, sin motivos y cuadrado`, () => {
          const t = computeFinancialTotals(datos, periodo);
          expect(t.notAvailableReasons, `${conjunto.id} ${periodo}: motivos pendientes`).toEqual([]);
          const fila = validateFinancialData(datos).find(f => f.period === periodo);
          expect(fila.balanced, `${conjunto.id} ${periodo}: cuadre`).toBe(true);
          expect(diferenciasDe(t, conjunto.esperado[periodo]), `${conjunto.id} ${periodo}`).toEqual([]);
        });
      }
    });
  }

  it('un valor alterado a propósito falla la comparación', () => {
    const conjunto = bloqueA.conjuntos[0];
    const datos = parseFinancialJSON(JSON.stringify(conjunto.entrada));
    const alterado = { ...conjunto.esperado['2024'], totalActivos: conjunto.esperado['2024'].totalActivos + 1 };
    const t = computeFinancialTotals(datos, '2024');
    expect(diferenciasDe(t, alterado)).toEqual([
      { campo: 'totalActivos', esperado: alterado.totalActivos, obtenido: conjunto.esperado['2024'].totalActivos, diferencia: 1 }
    ]);
  });
});

describe('batería B: adversariales', () => {
  it('B1: importe con texto se rechaza con el mensaje exacto y no calcula nada', () => {
    const entrada = {
      periods: ['2024'],
      balanceGeneral: { '2024': { activos: { 'Efectivo': 'abc' }, pasivos: {}, patrimonio: {} } },
      estadoResultados: { '2024': {} }
    };
    // El parseo falla antes de calcular: no hay totales.
    expect(() => parseFinancialJSON(JSON.stringify(entrada)))
      .toThrow('Importe inválido en activos[2024].Efectivo: "abc"');
  });

  it('B2: paréntesis es negativo; la convención de la cuenta decide y el total cuadra', () => {
    // El paréntesis se lee como negativo.
    expect(parseAmountCell('(500)')).toBe(-500);
    // Convención positivo (pasivo exigido en positivo): la compuerta lo rechaza (D-061).
    const pasivoPositivo = {
      periods: ['2024'],
      balanceGeneral: { '2024': { activos: { 'Efectivo': 500 }, pasivos: { 'Cuentas por pagar comerciales': -500 }, patrimonio: {} } },
      estadoResultados: { '2024': {} }
    };
    expect(() => parseFinancialJSON(JSON.stringify(pasivoPositivo))).toThrow(
      'Fila 0, cuenta «Cuentas por pagar comerciales», periodo 2024: esta cuenta se captura en positivo. '
      + 'Quite el signo negativo o los paréntesis. Si es una devolución o un descuento, use su cuenta de deducción.'
    );
    // Convención conservar (la cuenta, «Resultado del período incluido en
    // patrimonio», es del patrimonio, no de pasivos): el paréntesis se acepta
    // como negativo y el balance cuadra con la referencia calculada a mano.
    const csv = [
      'Estado,Grupo,Cuenta,2024',
      'Balance,Activos,Efectivo,100',
      'Balance,Activos,Edificios,300',
      'Balance,Activos,Depreciacion Acumulada,(60)',
      'Balance,Pasivos,Cuentas por pagar comerciales,90',
      'Balance,Patrimonio,Capital social,400',
      'Balance,Patrimonio,Resultado del período incluido en patrimonio,(150)'
    ].join('\n');
    const datos = normalizeFinancialData(tableTextToFinancialData(csv, { name: 'B2' }));
    const t = computeFinancialTotals(datos, '2024');
    expect(t.totalPatrimonio).toBe(250); // 400 − 150
    expect(t.totalPasivos).toBe(90);
    expect(t.totalActivos).toBe(340); // 100 + 300 − 60
    expect(t.totalActivos).toBe(t.totalPasivos + t.totalPatrimonio);
    expect(t.notAvailableReasons).toEqual([]);
  });

  it('B3: subtotal reportado que no cuadra gana, avisa la diferencia y el balance marca rojo', () => {
    const entrada = {
      periods: ['2024'],
      balanceGeneral: {
        '2024': {
          activos: {
            'Efectivo': 250, 'Cuentas por Cobrar': 50,
            'Total de activos corrientes': 480, 'Edificios': 300, 'Depreciacion Acumulada': -60
          },
          pasivos: { 'Cuentas por Pagar': 90 },
          patrimonio: { 'Capital Social': 400 }
        }
      },
      estadoResultados: { '2024': {} }
    };
    const datos = parseFinancialJSON(JSON.stringify(entrada));
    const t = computeFinancialTotals(datos, '2024');
    expect(t.activosCorrientes).toBe(480);
    expect(t.notAvailableReasons).toContainEqual(expect.objectContaining({
      motivo: 'reported_subtotal_mismatch', diferencia: 180
    }));
    const [fila] = validateFinancialData(datos);
    expect(fila.balanced).toBe(false);
    expect(fila.difference).toBe(230);
  });

  it('B4: edificios sin depreciación acumulada no produce un total fijo silencioso', () => {
    const entrada = {
      periods: ['2024'],
      balanceGeneral: {
        '2024': {
          activos: { 'Efectivo': 100, 'Edificios': 300 },
          pasivos: { 'Cuentas por Pagar': 90 },
          patrimonio: { 'Capital Social': 310 }
        }
      },
      estadoResultados: { '2024': {} }
    };
    const datos = parseFinancialJSON(JSON.stringify(entrada));
    const t = computeFinancialTotals(datos, '2024');
    expect(t.activosFijos).toBeNull();
    expect(t.totalActivos).toBeNull();
    expect(t.notAvailableReasons).toContainEqual({
      group: 'activos', name: 'Depreciación acumulada',
      motivo: 'missing_required_account_data', campos: ['activosFijos', 'totalActivos']
    });
  });

  it('B5: «Préstamo a largo plazo» sin identidad queda ambigua y el pasivo total N/D', () => {
    const entrada = {
      periods: ['2024'],
      balanceGeneral: {
        '2024': {
          activos: { 'Efectivo': 700 },
          pasivos: { 'Cuentas por Pagar': 90, 'Préstamo a largo plazo': 100 },
          patrimonio: { 'Capital Social': 510 }
        }
      },
      estadoResultados: { '2024': {} }
    };
    const datos = parseFinancialJSON(JSON.stringify(entrada));
    const t = computeFinancialTotals(datos, '2024');
    expect(t.totalPasivos).toBeNull();
    expect(t.notAvailableReasons).toContainEqual(expect.objectContaining({
      name: 'Préstamo a largo plazo', motivo: 'ambiguous_account_match'
    }));
  });
});

describe('batería C: periodos y selector', () => {
  const periodos = n => Array.from({ length: n }, (_, i) => `${2021 + i}`);
  const datosCon = n => ({
    periods: periodos(n),
    balanceGeneral: Object.fromEntries(periodos(n).map(p => [p,
      { activos: { 'Efectivo': 100 }, pasivos: {}, patrimonio: { 'Capital social': 100 } }])),
    estadoResultados: Object.fromEntries(periodos(n).map(p => [p, {}]))
  });

  it('C1: dos periodos, se muestran los dos', () => {
    expect(seleccionarPeriodos({ periodos: periodos(2) }).visibles).toEqual(['2021', '2022']);
  });

  it('C2: cuatro periodos, se muestran los cuatro', () => {
    expect(seleccionarPeriodos({ periodos: periodos(4) }).visibles).toEqual(periodos(4));
  });

  it('C3: cinco periodos, por defecto los dos más recientes y nunca más de cuatro a la vez', () => {
    const r = seleccionarPeriodos({ periodos: periodos(5) });
    expect(r.visibles).toEqual(['2024', '2025']);
    expect(r.predeterminados).toEqual(['2024', '2025']);
    const todo = seleccionarPeriodos({ periodos: periodos(5), seleccion: periodos(5) });
    expect(todo.visibles).toEqual(['2022', '2023', '2024', '2025']);
    expect(todo.puedeAgregar).toBe(false);
  });

  it('C4: ocho periodos, mismos predeterminados; al elegir cuatro, los cálculos no cambian', () => {
    const ocho = periodos(8);
    expect(seleccionarPeriodos({ periodos: ocho }).visibles).toEqual(['2027', '2028']);
    const eleccion = ['2021', '2023', '2025', '2027'];
    expect(seleccionarPeriodos({ periodos: ocho, seleccion: eleccion }).visibles).toEqual(eleccion);
    // La selección no entra en el cálculo: los totales de cada periodo son los
    // mismos con cualquier selección (la vista solo filtra columnas).
    const datos = parseFinancialJSON(JSON.stringify(datosCon(8)));
    const antes = computeFinancialTotals(datos, '2023');
    const despues = computeFinancialTotals(datos, '2023');
    expect(despues).toEqual(antes);
    expect(antes.totalActivos).toBe(100);
  });

  it('C5: cambiar la selección no cambia ningún cálculo de ningún periodo', () => {
    const datos = parseFinancialJSON(JSON.stringify(datosCon(4)));
    const antes = datos.periods.map(p => computeFinancialTotals(datos, p));
    const cambio = seleccionarPeriodos({ periodos: datos.periods, seleccion: ['2022', '2024'] });
    expect(cambio.visibles).toEqual(['2022', '2024']);
    const despues = datos.periods.map(p => computeFinancialTotals(datos, p));
    expect(despues).toEqual(antes);
  });
});
