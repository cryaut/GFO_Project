import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { identificarCuenta, listarCuentas, obtenerCuenta, montoCuenta, consultarMontoCuenta } from '../../js/modules/estados/cuentas-identificador.js';
import { normalizarCuenta, similitudCuentas } from '../../js/modules/estados/cuentas-similitud.js';

it('normaliza acentos, signos y palabras vacías en el orden especificado y conserva dígitos', () => {
  expect(normalizarCuenta('  CUÉNTAS,  por COBRAR del año 2024! ')).toBe('cuentas cobrar ano 2024');
  expect(normalizarCuenta('de del la las el los y e en por a')).toBe('');
  expect(normalizarCuenta('Cuentas 2023')).not.toBe(normalizarCuenta('Cuentas 2024'));
});

it('calibra omisión y transposición sin confundir plazo ni año', () => {
  expect(similitudCuentas('Efectivo', 'efectivo')).toBe(1);
  expect(similitudCuentas('Efetivo', 'Efectivo')).toBeCloseTo(14 / 15, 8);
  expect(similitudCuentas('Cuentsa por cobrar', 'Cuentas por cobrar')).toBeGreaterThanOrEqual(0.92);
  expect(similitudCuentas('Pasivo Corto Plazo', 'Pasivo Largo Plazo')).toBeLessThan(0.92);
  expect(similitudCuentas('Ingresos 2023', 'Ingresos 2024')).toBeLessThan(0.92);
});

const CASOS = [
  ['Efectivo', 'activos', 'bs.cash_and_equivalents'], ['Cuentas por Cobrar', 'activos', 'bs.trade_receivables'],
  ['Inventario', 'activos', 'bs.inventory_total'], ['Activos Corrientes Otros', 'activos', 'bs.other_current_assets'],
  ['Terrenos', 'activos', 'bs.ppe_land'], ['Edificios', 'activos', 'bs.ppe_buildings'],
  ['Vehiculos', 'activos', 'bs.ppe_vehicles'], ['Depreciacion Acumulada', 'activos', 'bs.accumulated_depreciation'],
  ['Cuentas por Pagar', 'pasivos', 'bs.trade_payables'], ['Otros Pasivos', 'pasivos', 'bs.other_noncurrent_liabilities'],
  ['Capital Social', 'patrimonio', 'bs.share_capital'], ['Utilidades Acumuladas', 'patrimonio', 'bs.retained_earnings'],
  ['Ventas', 'estadoResultados', 'is.sales_total'], ['Ventas de Productos', 'estadoResultados', 'is.product_sales'],
  ['Costo de Ventas', 'estadoResultados', 'is.cost_of_sales_reported'], ['Gastos de Administracion', 'estadoResultados', 'is.administrative_expenses'],
  ['Gastos de Ventas', 'estadoResultados', 'is.selling_expenses'], ['Gastos por Intereses', 'estadoResultados', 'is.interest_expense'],
  ['Impuesto sobre la Renta', 'estadoResultados', 'is.income_tax_expense'],
  // Excepción aprobada en la decisión 4 del encargo: ahora se reconoce como ingreso.
  ['Ingresos por Intereses', 'estadoResultados', 'is.interest_income']
];
it.each(CASOS)('reconoce %s en %s como %s, sin falsos positivos del corpus', (nombre, grupo, id) => {
  expect(identificarCuenta(nombre, { grupo })).toMatchObject({ estado: 'reconocida', id });
});

const AMBIGUAS = [
  ['Equipos', 'activos', ['bs.ppe_machinery', 'bs.ppe_furniture']],
  ['Pasivo Corto Plazo', 'pasivos', ['bs.short_term_borrowings', 'bs.other_current_liabilities']],
  ['Provisiones', 'pasivos', ['bs.current_provisions', 'bs.long_term_provisions']],
  ['Pasivo Largo Plazo', 'pasivos', ['bs.long_term_borrowings']],
  ['Reservas', 'patrimonio', ['bs.other_reserves', 'bs.legal_reserve']],
  ['Otros Ingresos', 'estadoResultados', ['is.nonoperating_income', 'is.other_operating_income']],
  ['Otros Gastos', 'estadoResultados', ['is.noninterest_nonoperating_expenses', 'is.other_operating_expenses']]
];
it.each(AMBIGUAS)('mantiene %s sugerida y pide confirmación', (nombre, grupo, ids) => {
  const resultado = identificarCuenta(nombre, { grupo });
  expect(resultado.estado).toBe('sugerida');
  expect(resultado.id).toBeNull();
  expect(resultado.candidatos.map(candidato => candidato.id)).toEqual(expect.arrayContaining(ids));
});

it.each([
  ['Efetivo', 'bs.cash_and_equivalents'], ['Efffectivo', 'bs.cash_and_equivalents'],
  ['Cuentsa por cobrar', 'bs.trade_receivables'], ['Vehiculoss', 'bs.ppe_vehicles'],
  ['cobrar cuentas', 'bs.trade_receivables'], ['Efectivoo', 'bs.cash_and_equivalents']
])('sugiere %s sin asignar el id y sitúa %s entre los tres primeros', (nombre, id) => {
  const resultado = identificarCuenta(nombre, { grupo: 'activos' });
  expect(resultado.estado).toBe('sugerida');
  expect(resultado.id).toBeNull();
  expect(resultado.candidatos.slice(0, 3).map(candidato => candidato.id)).toContain(id);
});

it.each(['éFÉCTIVO', '  Efectivo  ', 'Efectivo!!!', 'EfEcTiVo'])('la variante exacta normalizada %s se reconoce', nombre => {
  expect(identificarCuenta(nombre).id).toBe('bs.cash_and_equivalents');
});

it.each(['Cuenta X', '123', '', 'Ingresos 2023'])('el corpus negativo %s nunca se reconoce', nombre => {
  expect(identificarCuenta(nombre).estado).not.toBe('reconocida');
});

it('prioriza el id, valida contexto y respeta una clasificación incompatible sin asignar', () => {
  expect(identificarCuenta('Mi caja', { id: 'bs.cash_and_equivalents' })).toMatchObject({ estado: 'reconocida', metodo: 'id' });
  expect(identificarCuenta('Efectivo', { grupo: 'activos', clasificacion: 'activosFijos' }).estado).toBe('sugerida');
  expect(identificarCuenta('Ventas', { id: 'invalid' }).estado).toBe('no_reconocida');
  expect(identificarCuenta('Deudas de largo plazo', { grupo: 'pasivos' }).estado).toBe('reconocida');
  expect(identificarCuenta('Préstamos a largo plazo', { grupo: 'pasivos' }).estado).toBe('sugerida');
  expect(identificarCuenta('Caja propia', { grupo: 'activos', clasificacion: 'efectivo' })).toMatchObject({ estado: 'reconocida', metodo: 'contexto', id: 'bs.cash_and_equivalents' });
});

it('solo preselecciona una sugerencia con ventaja y conserva el empate sin elección', () => {
  expect(identificarCuenta('Efetivo', { grupo: 'activos' })).toMatchObject({ estado: 'sugerida', id: null, preseleccion: 'bs.cash_and_equivalents' });
  const empate = identificarCuenta('Eqipos', { grupo: 'activos' });
  expect(empate.estado).toBe('sugerida');
  expect(empate.id).toBeNull();
  expect(empate.preseleccion).toBeNull();
  expect(empate.candidatos.map(cuenta => cuenta.id)).toEqual(expect.arrayContaining(['bs.ppe_machinery', 'bs.ppe_furniture']));
});

it('conserva las 71 identidades del PR #10 y enumera cada diferencia de investigación y definición', () => {
  const referencia = JSON.parse(readFileSync(new URL('../fixtures/cuentas-pr10.json', import.meta.url), 'utf8'));
  expect(referencia.archivos).toHaveLength(20);
  expect(referencia.cuentas).toHaveLength(71);
  const auditoria = JSON.parse(readFileSync(new URL('../fixtures/cuentas-revision-investigacion.json', import.meta.url), 'utf8'));
  expect(auditoria.referencia).toBe(referencia.commit);
  for (const cuenta of referencia.cuentas) expect(obtenerCuenta(cuenta.id)).toMatchObject({
    nombreCanonico: cuenta.canonical_name, clasificacion: cuenta.classification,
    rol: cuenta.account_role, politicaAusencia: cuenta.absence_policy
  });
  // Se hacen visibles todas las rebajas locales, sin fingir que los JSON ajenos
  // ya cambiaron. Toda diferencia nueva requiere documentarse y revisarse.
  const diferencias = referencia.cuentas.filter(cuenta => obtenerCuenta(cuenta.id).estadoInvestigacion !== cuenta.research.status);
  expect(diferencias.map(cuenta => cuenta.id).sort()).toEqual(Object.keys(auditoria.rebajasLocales).sort());
  for (const cuenta of referencia.cuentas) expect(obtenerCuenta(cuenta.id).estadoInvestigacion).toBe(
    Object.hasOwn(auditoria.rebajasLocales, cuenta.id) ? 'partially_verified' : cuenta.research.status);
  const definicionesDistintas = referencia.cuentas.filter(cuenta => obtenerCuenta(cuenta.id).definicion !== cuenta.definition);
  expect(definicionesDistintas.map(cuenta => cuenta.id).sort()).toEqual(Object.keys(auditoria.correccionesDefinicion).sort());
  for (const cuenta of referencia.cuentas) {
    const correccion = auditoria.correccionesDefinicion[cuenta.id];
    if (correccion) expect(correccion).toMatchObject({ referencia: cuenta.definition, motivo: expect.any(String), decision: 'D-046' });
    expect(obtenerCuenta(cuenta.id).definicion).toBe(correccion?.local ?? cuenta.definition);
  }
  const cuentas = listarCuentas();
  expect(new Set(cuentas.map(cuenta => cuenta.id)).size).toBe(cuentas.length);
  expect(listarCuentas({ grupo: 'activos' }).every(cuenta => cuenta.grupo === 'activos')).toBe(true);
  cuentas[0].nombreCanonico = 'alterado';
  expect(listarCuentas()[0].nombreCanonico).not.toBe('alterado');
  expect(obtenerCuenta('inexistente')).toBeNull();
  // Al integrarse el PR #10 también se contrastan los JSON vivos, sin sustituir
  // la referencia fijada usada mientras todavía viven en otra rama.
  const documentos = Object.values(import.meta.glob('../../docs/razones_financieras/*.json', { eager: true, import: 'default' }));
  for (const documento of documentos) for (const cuenta of documento.cuentas) expect(obtenerCuenta(cuenta.id)).toMatchObject({
    nombreCanonico: cuenta.canonical_name, clasificacion: cuenta.classification,
    rol: cuenta.account_role, politicaAusencia: cuenta.absence_policy, estadoInvestigacion: cuenta.research.status,
    definicion: cuenta.definition
  });
});

it('cada cuenta verificada conserva una cita específica con ubicación y fuente consultable', () => {
  const verificadas = listarCuentas().filter(cuenta => cuenta.estadoInvestigacion === 'verified');
  expect(verificadas.map(cuenta => cuenta.id)).toEqual(['bs.cash_and_equivalents']);
  for (const cuenta of verificadas) expect(cuenta.fuentes.some(fuente =>
    fuente.cita?.trim() && fuente.ubicacion?.trim() && fuente.url?.startsWith('https://')), cuenta.id).toBe(true);
  expect(obtenerCuenta('is.interest_income').estadoInvestigacion).toBe('partially_verified');
  expect(obtenerCuenta('is.interest_income').fuentes[0].alcance).toContain('no define la cuenta');
});

it('el PGC solo es referencia terminológica y no sostiene una cuenta verificada', () => {
  for (const cuenta of listarCuentas().filter(cuenta => cuenta.estadoInvestigacion === 'verified')) {
    expect(cuenta.fuentes.some(fuente => /PGC|boe\.es/i.test(`${fuente.titulo} ${fuente.url}`)), cuenta.id).toBe(false);
  }
});

it('declara conjunta la cita de depreciación y retira su atribución a amortización', () => {
  const depreciacion = obtenerCuenta('is.operating_depreciation');
  expect(depreciacion.estadoInvestigacion).toBe('partially_verified');
  expect(depreciacion.fuentes.find(fuente => /boe\.es/.test(fuente.url))).toMatchObject({
    ubicacion: expect.stringContaining('conjunta'), alcance: expect.stringContaining('Definición conjunta de 680/681/682')
  });
  const amortizacion = obtenerCuenta('is.operating_amortization');
  expect(amortizacion.estadoInvestigacion).toBe('partially_verified');
  expect(amortizacion.fuentes.find(fuente => /boe\.es/.test(fuente.url))).toMatchObject({
    alcance: expect.stringContaining('no define amortización')
  });
  expect(amortizacion.fuentes.find(fuente => /boe\.es/.test(fuente.url)).cita).toBeUndefined();
});

it('intangibles corrige no monetarios sin alterar su clasificación ni política de ausencia', () => {
  expect(obtenerCuenta('bs.intangible_assets')).toMatchObject({
    definicion: expect.stringContaining('Activos no monetarios'),
    clasificacion: 'activo_no_corriente', politicaAusencia: 'zero_if_not_reported', tipoApp: 'activosFijos'
  });
});

it('D-051 relaciona intereses ganados con ingresos no operativos sin cambiar sus tipos', () => {
  expect(obtenerCuenta('is.interest_income')).toMatchObject({
    agrupadoEn: 'is.nonoperating_income', tipoApp: 'otrosIngresos',
    ambiguedades: [expect.stringContaining('D-051')]
  });
  const agregado = obtenerCuenta('is.nonoperating_income');
  expect(agregado.tipoApp).toBe('otrosIngresos');
  expect(agregado.sinonimos).not.toContain('ingresos financieros no clasificados en otra cuenta específica');
});

it('impide nuevos sinónimos compartidos y conserva las ocho colisiones normalizadas heredadas', () => {
  // D-031 y el corpus conservan ambigüedades que requieren contexto/confirmación.
  // Esta guardia no afirma unicidad absoluta ni cambia la identificación previa.
  const idsPorSinonimo = new Map();
  for (const cuenta of listarCuentas()) for (const sinonimo of cuenta.sinonimos) {
    const normalizado = normalizarCuenta(sinonimo);
    if (!idsPorSinonimo.has(normalizado)) idsPorSinonimo.set(normalizado, new Set());
    idsPorSinonimo.get(normalizado).add(cuenta.id);
  }
  const compartidos = Object.fromEntries([...idsPorSinonimo]
    .filter(([, ids]) => ids.size > 1)
    .map(([sinonimo, ids]) => [sinonimo, [...ids].sort()]));
  expect(compartidos).toEqual({
    'costo bienes vendidos': ['is.cost_of_sales_reported', 'is.merchandise_cost'],
    equipos: ['bs.ppe_furniture', 'bs.ppe_machinery'],
    'otros gastos': ['is.noninterest_nonoperating_expenses', 'is.other_operating_expenses'],
    'otros ingresos': ['is.nonoperating_income', 'is.other_operating_income'],
    'pasivo corto plazo': ['bs.other_current_liabilities', 'bs.short_term_borrowings'],
    provisiones: ['bs.current_provisions', 'bs.long_term_provisions'],
    reservas: ['bs.legal_reserve', 'bs.other_reserves'],
    'utilidad ejercicio': ['bs.current_year_result_equity', 'is.net_income_reported']
  });
});

describe('montos por id y políticas de ausencia', () => {
  const datos = { periods: ['2024'], balanceGeneral: { '2024': { activos: { Efectivo: 12, Inventario: 0 }, pasivos: {}, patrimonio: {} } }, estadoResultados: { '2024': {} } };
  it('devuelve el dato, respeta cero y nunca suma componentes para fabricar un total', () => {
    expect(montoCuenta(datos, '2024', 'bs.cash_and_equivalents')).toBe(12);
    expect(montoCuenta(datos, '2024', 'bs.inventory_total')).toBe(0);
    expect(montoCuenta(datos, '2024', 'bs.total_assets')).toBeNull();
    expect(montoCuenta(datos, '2024', 'bs.trade_payables')).toBe(0);
    expect(montoCuenta(datos, '2024', 'bs.accumulated_depreciation')).toBeNull();
    expect(montoCuenta(datos, '2024', 'supp.credit_sales')).toBeNull();
    expect(montoCuenta(datos, '2023', 'bs.cash_and_equivalents')).toBeNull();
  });
  it('explica los requeridos y los ids desconocidos', () => {
    expect(consultarMontoCuenta(datos, '2024', 'supp.credit_sales').motivo).toBe('missing_required_account_data');
    expect(consultarMontoCuenta(datos, '2024', 'inexistente').valor).toBeNull();
  });
  it('una cuenta ambigua legada no se convierte en ausencia y cero', () => {
    const legado = { ...datos, balanceGeneral: { '2024': { patrimonio: { Reservas: 100 } } } };
    expect(consultarMontoCuenta(legado, '2024', 'bs.legal_reserve')).toEqual({ valor: null, motivo: 'ambiguous_account_match' });
  });
});
