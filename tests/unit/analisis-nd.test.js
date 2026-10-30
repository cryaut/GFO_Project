import { afterEach, expect, it, vi } from 'vitest';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';

afterEach(() => vi.unstubAllGlobals());

function datosBase(dosPeriodos = true) {
  const periods = dosPeriodos ? ['2024', '2025'] : ['2025'];
  return normalizeFinancialData({ name: 'Prueba N/D', periods,
    balanceGeneral: Object.fromEntries(periods.map(p => [p, {
      activos: { Efectivo: 300, 'Cuentas por Cobrar': 100, Inventario: p === '2024' ? 60 : 100, Terrenos: 500 },
      pasivos: { 'Cuentas por Pagar': p === '2024' ? 40 : 50, 'Prestamo Largo Plazo': 150 },
      patrimonio: { 'Capital Social': 800 }
    }])),
    estadoResultados: Object.fromEntries(periods.map(p => [p, {
      Ventas: 1000, 'Costo de Ventas': 400, 'Gastos de Administracion': 200,
      'Gastos de Ventas': 100, 'Gastos por Intereses': 20, 'Impuesto sobre la Renta': 50
    }])),
    // El nombre es propio del ejercicio; la identidad confirma el candidato
    // compatible con el tipo que usaba el adaptador legado.
    accountIdentities: {
      pasivos: {
        'Prestamo Largo Plazo': { idCuenta: 'bs.long_term_borrowings', estado: 'reconocida', metodo: 'contexto', candidatos: [], origen: 'legado' }
      }
    }
  });
}

async function cargar(datos) {
  vi.resetModules();
  vi.stubGlobal('document', { getElementById: () => null });
  vi.stubGlobal('localStorage', { getItem: () => null, setItem() {} });
  const { default: store } = await import('../../js/store.js');
  store.setPersisted('estados', datos);
  const analisis = await import('../../js/modules/analisis/index.js');
  analisis.refreshSavedStates();
  return analisis;
}

it('costo N/D conserva N/D antes de restar márgenes, cobertura y compras', async () => {
  const datos = registrarCuenta(datosBase(), { nombre: 'Rubro X', grupo: 'estadoResultados',
    clasificacion: 'costoVentas', periodo: '2025', importe: 10 });
  expect(datos.accountIdentities.estadoResultados['Rubro X'].estado).not.toBe('reconocida');
  const analisis = await cargar(datos);
  const r = analisis.computeRazones('2025');
  for (const campo of ['margenBruto', 'margenOperativo', 'coberturaIntereses', 'RotInv', 'rotacionCxP', 'plazoPago']) {
    expect(r[campo], campo).toBeNull();
  }
  expect(r.usaComprasReales).toBe(false);
  expect(r.notAvailableReasons).toContainEqual(expect.objectContaining({ campo: 'compras', periodo: '2025',
    motivo: 'missing_required_account_data', operandos: expect.arrayContaining(['costoVentas']) }));
  expect(r.RC).toBe(10); // 500 de AC / 50 de PC, independientes del costo.
});

it('gasto administrativo N/D no se convierte en utilidad operativa para cobertura', async () => {
  const datos = registrarCuenta(datosBase(), { nombre: 'Gastos de Adminstración', grupo: 'estadoResultados',
    periodo: '2025', importe: 20 });
  expect(datos.accountIdentities.estadoResultados['Gastos de Adminstración'].estado).toBe('sugerida');
  const analisis = await cargar(datos);
  const r = analisis.computeRazones('2025');
  expect(r.coberturaIntereses).toBeNull();
  expect(r.margenOperativo).toBeNull();
  expect(r.margenBruto).toBe(0.6); // (1000 − 400) / 1000.
  expect(r.notAvailableReasons).toContainEqual(expect.objectContaining({ campo: 'utilidadOperativa',
    operandos: expect.arrayContaining(['gastosAdmin']) }));
});

it('activo corriente pendiente anula RC y la resta del capital de trabajo, sin falsos negativos', async () => {
  const datos = registrarCuenta(datosBase(), { nombre: 'Activo corriente extra', grupo: 'activos',
    clasificacion: 'activosCorrientesOtros', periodo: '2025', importe: 5000 });
  expect(datos.accountIdentities.activos['Activo corriente extra'].estado).not.toBe('reconocida');
  const analisis = await cargar(datos);
  const r = analisis.computeRazones('2025');
  expect(r.RC).toBeNull();
  expect(r.rotacionCapitalTrabajo).toBeNull();
  expect(r.denominadores.rotacionCapitalTrabajo).toBeNull();
  expect(r.rotacionActivosFijos).toBe(2); // 1000 / Terrenos 500.
  expect(r.margenBruto).toBe(0.6);
  expect(r.notAvailableReasons).toContainEqual(expect.objectContaining({ campo: 'capitalNetoTrabajo',
    operandos: expect.arrayContaining(['activosCorrientes']) }));
});

it('un solo periodo sigue usando saldos finales y la aproximación de compras existente', async () => {
  const analisis = await cargar(datosBase(false));
  const r = analisis.computeRazones('2025');
  expect(r).toMatchObject({ usaPromedios: false, usaComprasReales: false,
    invProm: 100, cxcProm: 100, activoProm: 1000, patrimonioProm: 800, RotInv: 4, rotacionCxP: 8 });
  expect(r.ROA).toBe(230 / 1000); // UN = 1000−400−200−100−20−50.
  expect(r.notAvailableReasons).toEqual([]);
});

it('dos periodos completos conservan compras e inventario promedio', async () => {
  const analisis = await cargar(datosBase());
  const r = analisis.computeRazones('2025');
  expect(r.invProm).toBe(80); // (60 + 100) / 2.
  expect(r.rotacionCxP).toBeCloseTo((400 + 100 - 60) / ((40 + 50) / 2), 8);
  expect(r.usaComprasReales).toBe(true);
});

it('cero explícito produce margen y cobertura cero, y no N/D', async () => {
  const datos = datosBase(false);
  Object.assign(datos.estadoResultados['2025'], { 'Costo de Ventas': 1000,
    'Gastos de Administracion': 0, 'Gastos de Ventas': 0 });
  const analisis = await cargar(datos);
  expect(analisis.computeRazones('2025')).toMatchObject({ margenBruto: 0, margenOperativo: 0,
    coberturaIntereses: 0, notAvailableReasons: [] });
});

it('un pendiente cero no cambia las razones ni sus motivos', async () => {
  const base = datosBase();
  const analisisBase = await cargar(base);
  const esperado = analisisBase.computeRazones('2025');
  const datos = registrarCuenta(base, { nombre: 'Activo corriente extra', grupo: 'activos', periodo: '2025', importe: 0 });
  const analisis = await cargar(datos);
  expect(analisis.computeRazones('2025')).toEqual(esperado);
});

it('MUNO MODA conserva las razones de 2023 y 2024, incluido el primer periodo', async () => {
  vi.stubGlobal('document', { getElementById: () => null });
  const { DEMO_MUNOMODA } = await import('../../js/modules/estados/index.js');
  const analisis = await cargar(structuredClone(DEMO_MUNOMODA));
  // Saldos de la regresión del caso; fórmulas y metodología anteriores a D-047/D-048.
  const esperados = {
    '2023': { RC: 370000 / 160000, RR: (370000 - 180000) / 160000,
      RotInv: 510000 / 180000, RotCxC: 850000 / 120000, PPC: 51.529411764705884,
      endeudamiento: 283860 / 801475, MN: 89180 / 850000, ROA: 89180 / 801475,
      pruebaDefensiva: 45000 / 160000, rotacionActivos: 850000 / 801475,
      rotacionCxP: 510000 / 85000, plazoPago: 60.833333333333336, edadInventario: 128.8235294117647,
      cicloConversion: 119.51960784313724, coberturaIntereses: 135000 / 12600,
      deudaPatrimonio: 283860 / 517615, apalancamiento: 801475 / 517615,
      margenBruto: 340000 / 850000, margenOperativo: 135000 / 850000, roe: 89180 / 517615,
      rotacionActivosFijos: 850000 / 431475, rotacionCapitalTrabajo: 850000 / 210000, solvencia: 801475 / 283860 },
    '2024': { RC: 412000 / 175000, RR: (412000 - 195000) / 175000,
      RotInv: 545000 / 187500, RotCxC: 920000 / 127500, PPC: 50.58423913043478,
      endeudamiento: 243085 / 825525, MN: 104825 / 920000, ROA: 104825 / 813500,
      pruebaDefensiva: 52000 / 175000, rotacionActivos: 920000 / 813500,
      rotacionCxP: 560000 / 88500, plazoPago: 57.68303571428571, edadInventario: 125.57339449541284,
      cicloConversion: 118.4745979115619, coberturaIntereses: 155000 / 11250,
      deudaPatrimonio: 243085 / 582440, apalancamiento: 813500 / 550027.5,
      margenBruto: 375000 / 920000, margenOperativo: 155000 / 920000, roe: 104825 / 550027.5,
      rotacionActivosFijos: 920000 / 413525, rotacionCapitalTrabajo: 920000 / 237000, solvencia: 825525 / 243085 }
  };
  for (const [periodo, campos] of Object.entries(esperados)) {
    const r = analisis.computeRazones(periodo);
    for (const [campo, esperado] of Object.entries(campos)) expect(r[campo], `${periodo}/${campo}`).toBeCloseTo(esperado, 10);
    expect(r.notAvailableReasons).toEqual([]);
  }
});
