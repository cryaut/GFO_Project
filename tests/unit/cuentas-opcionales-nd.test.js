import { expect, it } from 'vitest';
import { separarCuentasOpcionales, tablasEstadosResueltos } from '../../js/modules/estados/estados-presentacion-ui.js';
import { disponibilidadRazones } from '../../js/modules/analisis/analisis-disponibilidad-ui.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { DEMO_MUNOMODA } from '../../js/modules/estados/index.js';
import { computarRazonesDesdeDatos, MAPA_RAZONES_APP } from '../../js/modules/razones/razones-app-adapter.js';
import { estadosResueltos } from '../../js/modules/estados/estados-presentacion-calculations.js';

const detalle = (valor = 0, extra = {}) => ({ id: 'is.sales_returns', clave: 'devoluciones', origen: 'importado', valor, ...extra });
const demoHistorica = () => {
  const datos = structuredClone(DEMO_MUNOMODA);
  delete datos.coberturaEstados; delete datos.composicionIngresos;
  return normalizeFinancialData(datos);
};

it('compacta una devolución en cero; conserva cero en cuentas principales, subtotales y pendientes', () => {
  const filas = [detalle(), detalle(0, { id: 'bs.cash_and_equivalents' }), detalle(0, { subtotal: true }),
    detalle(0, { origen: 'calculado' }), detalle(0, { origen: 'reportado' }), detalle(null), detalle(-5),
    detalle(0, { id: null }), detalle(0, { origen: 'pendiente' })];
  const copia = structuredClone(filas);
  expect(separarCuentasOpcionales(filas)).toEqual({ opcionales: [filas[0]], visibles: filas.slice(1) });
  expect(filas).toEqual(copia);
});

it('Franquicias con movimiento en un periodo conserva ambos saldos, incluido el cero', () => {
  const fila = detalle(0, { id: 'bs.intangible_assets' });
  expect(separarCuentasOpcionales([fila], () => [detalle(60000), fila]).visibles).toEqual([fila]);
  expect(separarCuentasOpcionales([fila], () => [fila, undefined]).visibles).toEqual([fila]);
  expect(separarCuentasOpcionales([fila], () => [fila, detalle(null)]).visibles).toEqual([fila]);
  expect(separarCuentasOpcionales([fila], () => [fila, fila]).opcionales).toEqual([fila]);
});

it('conserva un importe pequeño distinto de cero y no deduce ausencia de un cero', () => {
  const fila = detalle(1e-10);
  expect(separarCuentasOpcionales([fila]).visibles).toEqual([fila]);
  const datos = normalizeFinancialData(DEMO_MUNOMODA), copia = structuredClone(datos);
  const html = tablasEstadosResueltos(datos, datos.periods);
  expect(html).toContain('Ver cuentas opcionales en cero (3)');
  expect(html).toContain('cero no acredita que una cuenta esté ausente');
  expect(html).toContain('Devoluciones sobre ventas');
  expect(datos).toEqual(copia);
});

it('el diagnóstico no oculta razones cero ni agrega faltantes a una razón calculable', () => {
  const r = { RC: 0, MN: null, notAvailableReasons: [
    { campo: 'RC', motivo: 'missing_required_account_data', operandos: ['bs.cash_and_equivalents'], periodo: '2024' },
    { campo: 'MN', motivo: 'composicion_no_declarada', operandos: ['is.nonoperating_income'], periodo: '2024' }
  ] };
  const html = disponibilidadRazones(r);
  expect(html).toContain('N/D (1)');
  expect(html).toContain('Margen neto');
  expect(html).not.toContain('Ratio corriente');
  expect(disponibilidadRazones({ RC: 0, notAvailableReasons: [] })).toBe('');
});

it('agrupa causas repetidas por periodo y escapa textos de los datos', () => {
  const motivos = ['RC', 'RR', 'RC'].map(campo => ({ campo, motivo: 'missing_required_account_data',
    operandos: ['bs.short_term_borrowings'], periodo: '<img src=x>' }));
  const html = disponibilidadRazones({ RC: null, RR: null, notAvailableReasons: motivos });
  expect(html.match(/Falta un importe/g)).toHaveLength(1);
  expect(html).toContain('Ratio corriente, Ratio rápido');
  expect(html).toContain('&lt;img src=x&gt;');
  expect(html).not.toContain('<img');
});

it('conserva el diagnóstico histórico del archivo sin cobertura: 1/20 y 3/20 disponibles', () => {
  const datos = demoHistorica(), copia = structuredClone(datos);
  const primero = computarRazonesDesdeDatos(datos, '2023'), segundo = computarRazonesDesdeDatos(datos, '2024');
  const contar = r => Object.keys(MAPA_RAZONES_APP).filter(c => r[c] !== null).length;
  expect(contar(primero)).toBe(1);
  expect(contar(segundo)).toBe(3);
  expect(primero.margenBruto).toBeCloseTo((850000 - 510000) / 850000, 12);
  // Inventario promedio = (180000+195000)/2 = 187500; 545000/187500.
  expect(segundo.RotInv).toBeCloseTo(545000 / 187500, 12);
  expect(segundo.RC).toBeNull();
  expect(segundo.notAvailableReasons).toEqual(expect.arrayContaining([
    expect.objectContaining({ campo: 'RC', operandos: ['bs.short_term_borrowings'] }),
    expect.objectContaining({ campo: 'MN', motivo: 'composicion_no_declarada' }),
    expect.objectContaining({ campo: 'RotCxC', operandos: ['supp.credit_sales'] })
  ]));
  expect(datos).toEqual(copia);
});

it('aisla el bloqueo del ER con cuatro ceros expresamente sintéticos y composición explícita', () => {
  let datos = demoHistorica();
  datos.composicionIngresos = { '2023': 'excluye_intereses', '2024': 'excluye_intereses' };
  const sinCompletar = estadosResueltos(datos, '2024').estadoResultados;
  expect(sinCompletar.find(f => f.id === 'is.net_income_reported').valor).toBeNull();
  datos = registrarCuenta(datos, datos.periods.flatMap(periodo => ['is.other_operating_income', 'is.operating_depreciation',
    'is.operating_amortization', 'is.other_operating_expenses'].map(id => ({ id, nombre: id, periodo, importe: 0, confirmado: true }))));
  const er = estadosResueltos(datos, '2024').estadoResultados;
  // UB=920000−545000=375000; UAII=375000−130000−90000=155000;
  // UAI=155000+18000−12000−11250=149750; UN=149750−44925=104825.
  expect(er.find(f => f.id === 'is.operating_profit_reported').valor).toBe(155000);
  expect(er.find(f => f.id === 'is.net_income_reported').valor).toBe(104825);
  // Recuperar UN no completa por sí solo los activos del motor para calcular ROA.
  expect(computarRazonesDesdeDatos(datos, '2024').ROA).toBeNull();
});
