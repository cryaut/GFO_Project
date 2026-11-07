import { afterEach, expect, it, vi } from 'vitest';
import { documentoAceptacion, cambiarImporte, renombrarFila, filaConId } from '../fixtures/razones-app.js';
import { construirEFE } from '../../js/modules/analisis/efe-calculations.js';
import { conciliarConBalance } from '../../js/modules/flujo/flujo-calculations.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { resultadosReales } from '../../js/modules/proforma/proforma-calculations.js';

afterEach(() => vi.unstubAllGlobals());

async function analisisCon(datos) {
  vi.resetModules();
  vi.stubGlobal('localStorage', { getItem: () => null, setItem() {} });
  vi.stubGlobal('document', { getElementById: () => null });
  const { default: store } = await import('../../js/store.js');
  store.setPersisted('estados', datos);
  const analisis = await import('../../js/modules/analisis/index.js');
  analisis.refreshSavedStates();
  return analisis;
}

it('DuPont conserva los componentes y ROE cuando están acreditadas todas las entradas', async () => {
  const analisis = await analisisCon(documentoAceptacion(true));
  const razones = analisis.computeRazones('2032');
  const dp = analisis.computeDuPont('2032');
  // Caso ficticio: UN 350 / ventas 1000; ventas 1000 / activos 1000;
  // activos 1000 / patrimonio 600. Producto = 350 / 600.
  expect(dp.PM).toBeCloseTo(0.35, 10);
  expect(dp.AT).toBeCloseTo(1, 10);
  expect(dp.ROE).toBeCloseTo(350 / 600, 10);
  expect(dp.ROE).toBeCloseTo(razones.roe, 10);
});

it.each(['is.income_tax_expense', 'is.other_operating_expenses'])(
  'DuPont no fabrica utilidad ni ROE si falta %s', async id => {
    const datos = cambiarImporte(documentoAceptacion(true), id, undefined);
    const analisis = await analisisCon(datos);
    const razones = analisis.computeRazones('2032');
    const dp = analisis.computeDuPont('2032');
    expect(razones.MN).toBeNull();
    expect(razones.roe).toBeNull();
    expect(dp.PM).toBeNull();
    expect(dp.ROE).toBeNull();
    expect(razones.notAvailableReasons).toContainEqual(expect.objectContaining({
      campo: 'MN', motivo: 'missing_required_account_data', operandos: [id]
    }));
  }
);

it.each(['bs.retained_earnings', 'bs.current_year_result_equity', 'bs.legal_reserve', 'bs.other_reserves'])(
  'el EFE conserva la separación al renombrar la cuenta acreditada %s', id => {
  const datos = documentoAceptacion(true);
  const { nombre } = filaConId(datos, id);
  datos.balanceGeneral['2031'].patrimonio[nombre] = 10;
  datos.balanceGeneral['2032'].patrimonio[nombre] = 20;
  const previo = construirEFE(datos, '2031', '2032');
  renombrarFila(datos, id);
  const renombrado = construirEFE(datos, '2031', '2032');
  expect(renombrado.financiamiento.items).toEqual(previo.financiamiento.items);
  expect(renombrado.financiamiento.items.some(fila => fila.concepto.includes('Dividendos'))).toBe(true);
  expect(renombrado.financiamiento.items.find(fila => fila.concepto.includes('Dividendos')).monto)
    .toBeCloseTo(-340, 10); // Utilidad 350 − variación del destino 10.
  }
);

it('una variación de patrimonio sin identidad confirmada no se presenta como dividendo ni aportación', () => {
  const datos = documentoAceptacion(true);
  datos.balanceGeneral['2031'].patrimonio['Rubro no identificado'] = 10;
  datos.balanceGeneral['2032'].patrimonio['Rubro no identificado'] = 30;
  datos.accountTypes.patrimonio['Rubro no identificado'] = 'patrimonio';
  datos.accountIdentities.patrimonio['Rubro no identificado'] = {
    idCuenta: null, estado: 'no_reconocida', metodo: null, candidatos: [], origen: 'manual'
  };
  const resultado = construirEFE(datos, '2031', '2032');
  expect(resultado.financiamiento.items.some(f => f.concepto.includes('Dividendos'))).toBe(false);
  expect(resultado.financiamiento.items.some(f => f.concepto.includes('Aportaciones'))).toBe(false);
  expect(resultado.advertencias.join(' ')).toContain('sin identidad confirmada');
});

it('el EFE por variaciones aclara que cuadrar no acredita movimientos de efectivo', () => {
  const resultado = construirEFE(documentoAceptacion(true), '2031', '2032');
  expect(resultado.naturaleza).toBe('estimacion_por_variaciones');
  expect(resultado.advertencias.join(' ')).toContain('movimientos reales de efectivo');
  expect(resultado.advertencias.join(' ')).toContain('no confirma');
});

it('una compra de maquinaria financiada con deuda requiere confirmar la naturaleza de las variaciones', () => {
  const datos = documentoAceptacion(true);
  const maquinaria = filaConId(datos, 'bs.ppe_machinery').nombre;
  const deuda = filaConId(datos, 'bs.long_term_borrowings').nombre;
  // Activo y deuda aumentan 100 sin variar efectivo: podría ser una compra a crédito.
  datos.balanceGeneral['2032'].activos[maquinaria] = 100;
  datos.balanceGeneral['2032'].pasivos[deuda] += 100;
  const resultado = construirEFE(datos, '2031', '2032');
  expect(resultado.inversion.total).toBe(-100);
  expect(resultado.naturaleza).toBe('estimacion_por_variaciones');
  expect(resultado.advertencias.join(' ')).toContain('ajustes no monetarios');
  expect(resultado.advertencias.join(' ')).toContain('no confirma');
});

it('una baja de depreciación acumulada advierte que no identifica el gasto del periodo', () => {
  const datos = documentoAceptacion(true);
  const depreciacion = filaConId(datos, 'bs.accumulated_depreciation').nombre;
  datos.balanceGeneral['2032'].activos[depreciacion] = -20; // inicial −50; puede haber baja.
  const r = construirEFE(datos, '2031', '2032');
  expect(r.advertencias.join(' ')).toContain('disminuyó');
  expect(r.advertencias.join(' ')).toContain('no distingue el gasto del periodo');
  expect(r.naturaleza).toBe('estimacion_por_variaciones');
});

it('la conciliación del flujo no convierte efectivo desconocido en cero', () => {
  const datos = normalizeFinancialData({ periods: ['2024', '2025'],
    balanceGeneral: {
      '2024': { activos: { Banco: 100 }, pasivos: {}, patrimonio: {} },
      '2025': { activos: { 'Cuenta pendiente': 50 }, pasivos: {}, patrimonio: {} }
    }, estadoResultados: { '2024': {}, '2025': {} } });
  const r = conciliarConBalance({ saldoFinal: 0 }, datos, '2024');
  expect(r).toEqual({ periodo: '2025', efectivo: null, diferencia: null,
    cuadra: null, motivo: 'efectivo_no_disponible' });
});

it('Proforma no calcula gastos ni UAII reales con un gasto administrativo pendiente', () => {
  const datos = registrarCuenta(documentoAceptacion(true), {
    nombre: 'Gastos de Adminstración', grupo: 'estadoResultados', periodo: '2032', importe: 20
  });
  expect(datos.accountIdentities.estadoResultados['Gastos de Adminstración'].estado).toBe('sugerida');
  const r = resultadosReales(datos);
  expect(r.utilidadBruta).toBe(600);
  expect(r.gastosOperacion).toBeNull();
  expect(r.uaii).toBeNull();
  expect(r.margenOperativo).toBeNull();
});
