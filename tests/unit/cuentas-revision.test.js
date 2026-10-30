import { afterEach, expect, it, vi } from 'vitest';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { consultarMontoCuenta } from '../../js/modules/estados/cuentas-identificador.js';
import { construirEFE, esResultadoAcumulado } from '../../js/modules/analisis/efe-calculations.js';
import { construirEOAF } from '../../js/modules/analisis/eoaf-calculations.js';

afterEach(() => vi.unstubAllGlobals());

async function demo() {
  vi.stubGlobal('document', { getElementById: () => null });
  const { DEMO_MUNOMODA } = await import('../../js/modules/estados/index.js');
  return normalizeFinancialData(structuredClone(DEMO_MUNOMODA));
}

it('la cuenta pendiente con cero en ambos años no cambia los totales ni EFE/EOAF de MUNO MODA', async () => {
  const original = await demo();
  const conCeros = registrarCuenta(original, ['2023', '2024'].map(periodo => ({
    nombre: 'Activo corriente extra', grupo: 'activos', periodo, importe: 0
  })));
  for (const periodo of original.periods) {
    expect(computeFinancialTotals(conCeros, periodo)).toEqual(computeFinancialTotals(original, periodo));
  }
  expect(conCeros.accountIdentities.activos['Activo corriente extra'].estado).not.toBe('reconocida');
  expect(construirEFE(conCeros, '2023', '2024')).toEqual(construirEFE(original, '2023', '2024'));
  expect(construirEOAF(conCeros, '2023', '2024').resumen).toEqual(construirEOAF(original, '2023', '2024').resumen);
});

it('los 5000 pendientes corrientes solo anulan sus totales posibles y conservan Terrenos 150000', async () => {
  const base = normalizeFinancialData({ name: 'Terrenos', periods: ['2023', '2024'],
    balanceGeneral: Object.fromEntries(['2023', '2024'].map(p => [p, {
      activos: { Efectivo: 100, Terrenos: 150000 }, pasivos: { 'Cuentas por Pagar': 50 }, patrimonio: { 'Capital Social': 150050 }
    }])), estadoResultados: { '2023': { Ventas: 300, 'Costo de Ventas': 0 }, '2024': { Ventas: 300, 'Costo de Ventas': 0 } } });
  const datos = registrarCuenta(base, { nombre: 'Activo corriente extra', grupo: 'activos', periodo: '2024', importe: 5000,
    clasificacion: 'activosCorrientesOtros' });
  const total = computeFinancialTotals(datos, '2024');
  expect(total).toMatchObject({ activosCorrientes: null, totalActivos: null, activosFijos: 150000,
    efectivo: 100, totalPasivos: 50, totalPatrimonio: 150050, utilidadNeta: 300 });
  expect(total.notAvailableReasons).toEqual([expect.objectContaining({ name: 'Activo corriente extra',
    campos: expect.arrayContaining(['activosCorrientes', 'totalActivos']) })]);
  expect(computeFinancialTotals(datos, '2023')).toEqual(computeFinancialTotals(base, '2023'));
});

it('una cuenta legada desconocida no aumenta silenciosamente el total de activos', async () => {
  const datos = await demo();
  delete datos.accountIdentities;
  datos.balanceGeneral['2024'].activos['Activo corriente extra'] = 5000;
  const normalizados = normalizeFinancialData(datos);
  expect(normalizados.accountIdentities.activos['Activo corriente extra'].origen).toBe('legado');
  const total = computeFinancialTotals(normalizados, '2024');
  expect(total.totalActivos).toBeNull();
  expect(total.notAvailableReasons).toContainEqual(expect.objectContaining({ name: 'Activo corriente extra' }));
});

it('sin tipo explícito, los candidatos corrientes tampoco anulan activos fijos', async () => {
  const datos = registrarCuenta(await demo(), { nombre: 'Activo corriente extra', grupo: 'activos', periodo: '2024', importe: 5000 });
  const total = computeFinancialTotals(datos, '2024');
  expect(total).toMatchObject({ activosCorrientes: null, totalActivos: null, activosFijos: 413525 });
  expect(total.notAvailableReasons[0].campos).not.toContain('activosFijos');
});

it('sin candidatos ni clasificación se anulan las posibilidades del grupo, conservando los demás', async () => {
  const datos = registrarCuenta(await demo(), { nombre: 'Cuenta X', grupo: 'activos', periodo: '2024', importe: 5000 });
  expect(computeFinancialTotals(datos, '2024')).toMatchObject({ totalActivos: null, activosFijos: null,
    activosCorrientes: null, totalPasivos: 243085, totalPatrimonio: 582440, utilidadNeta: 104825 });
});

it('un gasto pendiente con tipo conocido conserva ventas y utilidad bruta', async () => {
  const datos = registrarCuenta(await demo(), { nombre: 'Otros Gastos', grupo: 'estadoResultados', periodo: '2024', importe: 100,
    clasificacion: 'otrosGastos', reemplazar: true });
  expect(computeFinancialTotals(datos, '2024')).toMatchObject({ utilidadBruta: 375000, utilidadNeta: null,
    ventas: 920000, costoVentas: 545000, otrosGastos: null });
});

it('Ingresos por Intereses 20 se suman a MUNO MODA: utilidad neta 104845', async () => {
  const datos = registrarCuenta(await demo(), { nombre: 'Ingresos por Intereses', grupo: 'estadoResultados',
    periodo: '2024', importe: 20 });
  expect(computeFinancialTotals(datos, '2024').utilidadNeta).toBe(104845);
});

it('las cuentas cero sin grupo no bloquean el cálculo ni las políticas de ausencia', async () => {
  const base = await demo();
  const datos = registrarCuenta(base, { nombre: 'Cuenta X', grupo: '', periodo: '2024', importe: 0 });
  expect(computeFinancialTotals(datos, '2024')).toEqual(computeFinancialTotals(base, '2024'));
  expect(consultarMontoCuenta(datos, '2024', 'bs.current_provisions')).toEqual(
    consultarMontoCuenta(base, '2024', 'bs.current_provisions'));
});

it('el saldo desconocido cero no altera la política de ausencia de una cuenta del grupo', async () => {
  const base = await demo();
  const datos = registrarCuenta(base, { nombre: 'Cuenta X', grupo: 'activos', periodo: '2024', importe: 0 });
  expect(consultarMontoCuenta(datos, '2024', 'bs.short_term_investments')).toEqual(
    consultarMontoCuenta(base, '2024', 'bs.short_term_investments'));
});

it('un saldo ausente sigue siendo faltante aunque el otro sea cero', async () => {
  const datos = registrarCuenta(await demo(), { nombre: 'Cuenta X', grupo: 'activos', periodo: '2024', importe: 0 });
  expect(construirEFE(datos, '2023', '2024').motivos).toContainEqual(expect.stringContaining('no tiene saldo'));
});

it('dos saldos desconocidos iguales pero distintos de cero aún requieren clasificación', async () => {
  const datos = registrarCuenta(await demo(), ['2023', '2024'].map(periodo => ({
    nombre: 'Cuenta X', grupo: 'activos', periodo, importe: 100
  })));
  expect(construirEFE(datos, '2023', '2024').motivos).toContainEqual(expect.stringContaining('no tiene clasificación'));
  expect(construirEOAF(datos, '2023', '2024').resumen.estado).toBe('incompleta');
});

it('el EFE reconoce pérdida del ejercicio y pérdida del periodo como resultados', () => {
  expect(esResultadoAcumulado('Pérdida del ejercicio')).toBe(true);
  expect(esResultadoAcumulado('Pérdidas del periodo')).toBe(true);
});

it('el EFE advierte transferencias entre reservas y resultados aun con dividendos positivos', async () => {
  const datos = await demo();
  // Trasladar el crecimiento de resultados (64825) y otros 1000 a reservas.
  datos.balanceGeneral['2024'].patrimonio.Reservas += 65825;
  datos.balanceGeneral['2024'].patrimonio['Utilidades Acumuladas'] =
    datos.balanceGeneral['2023'].patrimonio['Utilidades Acumuladas'] - 1000;
  const efe = construirEFE(datos, '2023', '2024');
  expect(efe.advertencias).toContainEqual(expect.stringContaining('sentidos opuestos'));
  expect(efe.financiamiento.items.find(f => f.concepto.includes('Dividendos')).monto).toBeLessThan(0);
});

it('cuadrar el EFE con dividendos derivados no se presenta como validación de utilidad', async () => {
  const datos = await demo();
  const efe = construirEFE(datos, '2023', '2024');
  expect(efe.estado).toBe('cuadra');
  expect(efe.financiamiento.items.find(f => f.concepto.includes('Dividendos')).concepto).toContain('derivados');
  expect(efe.interpretacion).toContain('no valida de forma independiente la utilidad neta');
});

it('un cambio en utilidad puede compensarse en dividendos derivados: no sirve de comprobación independiente', async () => {
  const base = await demo();
  const conIntereses = registrarCuenta(base, { nombre: 'Ingresos por Intereses', grupo: 'estadoResultados', periodo: '2024', importe: 20 });
  const anterior = construirEFE(base, '2023', '2024');
  const actual = construirEFE(conIntereses, '2023', '2024');
  expect(actual.utilidadNeta - anterior.utilidadNeta).toBe(20);
  expect(actual.operacion.total - anterior.operacion.total).toBe(20);
  expect(actual.financiamiento.total - anterior.financiamiento.total).toBe(-20);
  expect(actual.totalFlujos).toBe(anterior.totalFlujos);
  expect(actual.estado).toBe('cuadra');
});
