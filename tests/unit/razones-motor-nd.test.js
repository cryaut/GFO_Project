import { describe, expect, it } from 'vitest';
import { ESPECIFICACION_RAZONES } from '../../js/modules/razones/especificacion-razones.js';
import { calcularRazon, calcularRazonConTraza, calcularRazones, crearEntradaRazones, evaluarDerivado } from '../../js/modules/razones/razones-motor.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { entradaManual } from './fixtures/razones-casos.js';

const fila = (id,current,extra = {}) => ({ id, current, estado:'reconocida', origen:'importacion', ...extra });
const campo = (entrada,id) => entrada.cuentas.find(c => c.id === id);
const corriente = entrada => calcularRazon('liquidez_razon_corriente', entrada);

describe('N/D y cuentas pendientes', () => {
  it.each([null,undefined,NaN,Infinity])('no transforma el dato no numérico %s en cero', valor => {
    const entrada = entradaManual();
    campo(entrada, 'bs.cash_and_equivalents').current = valor;
    expect(corriente(entrada)).toMatchObject({ valor:null, metodo:'not_applicable' });
    expect(corriente(entrada).motivos).toEqual(expect.arrayContaining([expect.objectContaining({ codigo:'missing_required_account_data' })]));
  });
  it('un denominador cero es N/D; un numerador explícito cero puede ser cero', () => {
    const entrada = entradaManual();
    entrada.cuentas.push(fila('bs.current_liabilities_total',0));
    expect(corriente(entrada)).toMatchObject({ valor:null, motivos:expect.arrayContaining([expect.objectContaining({ codigo:'zero_denominator' })]) });
    entrada.cuentas.push(fila('bs.current_assets_total',0));
    campo(entrada, 'bs.current_liabilities_total').current = 10;
    expect(corriente(entrada).valor).toBe(0);
  });
  it('conserva total reportado cero aunque un componente no utilizado sea N/D', () => {
    const entrada = entradaManual();
    campo(entrada,'bs.cash_and_equivalents').current = null;
    entrada.cuentas.push(fila('bs.current_assets_total',0));
    expect(corriente(entrada)).toMatchObject({ valor:0, motivos:[] });
  });
  it('si el total reportado es null, calcula desde sus componentes', () => {
    const entrada = entradaManual();
    entrada.cuentas.push(fila('bs.current_assets_total',null));
    expect(corriente(entrada).valor).toBe(4.75);
  });
  it('usa el total y advierte discrepancia sin sumar total y componentes', () => {
    const entrada = entradaManual();
    entrada.cuentas.push(fila('bs.current_assets_total',900));
    expect(corriente(entrada)).toMatchObject({ valor:4.5, motivos:expect.arrayContaining([
      expect.objectContaining({ codigo:'reported_subtotal_mismatch', reportado:900, calculado:950 })
    ]) });
  });
  it('un total sin desglose no genera una discrepancia contra componentes no reportados', () => {
    const resultado = calcularRazon('actividad_rotacion_inventarios',entradaManual());
    expect(resultado.valor).toBe(1);
    expect(resultado.motivos).toEqual([]);
  });
  it('la tolerancia de conciliación incluye exactamente un centavo', () => {
    const entrada = entradaManual();
    entrada.cuentas = [fila('bs.cash_and_equivalents',1),fila('bs.current_assets_total',1.01),fila('bs.trade_payables',1),fila('bs.current_liabilities_total',1)];
    expect(corriente(entrada).motivos.some(m => m.codigo === 'reported_subtotal_mismatch')).toBe(false);
    campo(entrada,'bs.current_assets_total').current = 1.0101;
    expect(corriente(entrada).motivos.some(m => m.codigo === 'reported_subtotal_mismatch')).toBe(true);
  });
  it('requires_data ausente no se aproxima con ventas totales ni con cero', () => {
    const entrada = entradaManual();
    entrada.cuentas = entrada.cuentas.filter(c => c.id !== 'supp.credit_sales');
    const resultado = calcularRazon('actividad_rotacion_cuentas_por_cobrar', entrada);
    expect(resultado).toMatchObject({ valor:null, motivos:expect.arrayContaining([
      expect.objectContaining({ codigo:'missing_required_account_data', id:'supp.credit_sales' })
    ]) });
  });
  it('cuenta ausente zero_if_not_reported vale cero dentro de la suma', () => {
    const entrada = entradaManual();
    entrada.cuentas = entrada.cuentas.filter(c => c.id !== 'bs.cash_and_equivalents');
    expect(corriente(entrada).valor).toBe(4);
  });
  it('una cuenta desconocida con cero conserva revisión y no bloquea', () => {
    const entrada = entradaManual();
    entrada.cuentas.push(fila(null,0,{ estado:'no_reconocida', grupo:'activos' }));
    const resultado = calcularRazones(entrada);
    expect(resultado.razones.liquidez_razon_corriente.valor).toBe(4.75);
    expect(resultado.revision).toEqual([expect.objectContaining({ revisar:true, estado:'no_reconocida' })]);
  });
  it('una desconocida con monto afecta solo el grupo posible y ese periodo', () => {
    const entrada = entradaManual();
    entrada.cuentas.push(fila(null,30,{ estado:'no_reconocida', grupo:'activos', tipoApp:'activosFijos' }));
    expect(corriente(entrada).valor).toBe(4.75);
    const resultado = calcularRazon('rentabilidad_roa', entrada);
    expect(resultado.valor).toBeNull();
    expect(resultado.motivos).toEqual(expect.arrayContaining([expect.objectContaining({ codigo:'unrecognized_imported_account', periodo:'current', camposAfectados:expect.arrayContaining(['derived.total_assets']) })]));
    expect(calcularRazon('rentabilidad_margen_utilidad_neta', entrada).valor).toBe(0.325);
  });
  it('la sugerencia con monto limita la anulación a sus candidatos', () => {
    const entrada = entradaManual();
    entrada.cuentas.push(fila(null,30,{ estado:'sugerida', grupo:'activos', candidatos:[{ id:'bs.cash_and_equivalents' }] }));
    expect(corriente(entrada).valor).toBeNull();
    expect(corriente(entrada).motivos[0].codigo).toBe('ambiguous_account_match');
    expect(evaluarDerivado('endeudamiento_razon_deuda_total','derived.total_liabilities',entrada).valor).toBe(500);
  });
  it('un candidato inválido no permite omitir una cuenta desconocida con monto', () => {
    const entrada = entradaManual();
    entrada.cuentas.push(fila(null,30,{ estado:'sugerida', grupo:'activos', candidatos:[{ id:'id_inexistente' }] }));
    expect(corriente(entrada).valor).toBeNull();
  });
  it('una sugerencia de intereses señala el agregado afectado sin anular utilidad operativa', () => {
    const entrada = entradaManual();
    entrada.cuentas.push(fila(null,5,{ estado:'sugerida', grupo:'estadoResultados', candidatos:[{ id:'is.interest_income' }] }));
    const resultado = calcularRazon('rentabilidad_margen_utilidad_neta',entrada);
    expect(resultado.valor).toBeNull();
    expect(resultado.motivos).toEqual(expect.arrayContaining([expect.objectContaining({ camposAfectados:expect.arrayContaining(['derived.net_income']) })]));
    expect(evaluarDerivado('rentabilidad_margen_utilidad_neta','derived.operating_profit',entrada).valor).toBe(280);
  });
});

describe('periodos y operaciones del intérprete', () => {
  it('primer periodo: apagado N/D, encendido directo; un único periodo directo sin control', () => {
    const entrada = entradaManual();
    entrada.periodos = { actual:'2024', anterior:null, cantidad:2, indice:0 };
    expect(calcularRazon('rentabilidad_roa', entrada).valor).toBeNull();
    expect(calcularRazon('rentabilidad_roa', entrada, { mostrar_calculo_directo_primer_periodo:true })).toMatchObject({ valor:260/1450, metodo:'direct_closing' });
    entrada.periodos.cantidad = 1;
    expect(calcularRazon('rentabilidad_roa', entrada)).toMatchObject({ valor:260/1450, metodo:'direct_closing' });
    expect(calcularRazon('actividad_rotacion_cuentas_por_pagar', entrada).valor).toBeNull();
  });
  it('un saldo anterior null no se sustituye por el cierre actual', () => {
    const entrada = entradaManual();
    campo(entrada,'bs.accumulated_depreciation').previous = null;
    expect(calcularRazon('rentabilidad_roa', entrada).valor).toBeNull();
  });
  it('implementa multiply con un árbol sintético, sin editar los JSON reales', () => {
    const especificacion = structuredClone(ESPECIFICACION_RAZONES);
    especificacion.liquidez_razon_corriente.razon.formula = { op:'multiply', operands:[{ op:'constant', value:3 },{ op:'constant', value:4 }] };
    expect(calcularRazon('liquidez_razon_corriente', entradaManual(), {}, especificacion).valor).toBe(12);
  });
  it('operación desconocida nombra el archivo y la ruta exacta', () => {
    const especificacion = structuredClone(ESPECIFICACION_RAZONES);
    especificacion.liquidez_razon_corriente.razon.formula.numerator = { op:'desconocida' };
    expect(() => calcularRazon('liquidez_razon_corriente', entradaManual(), {}, especificacion)).toThrow('liquidez_razon_corriente.json: $.razon.formula.numerator: operación desconocida');
  });
  it('detecta ciclos de dependencias y referencias no declaradas', () => {
    const especificacion = structuredClone(ESPECIFICACION_RAZONES);
    const a = especificacion.liquidez_razon_corriente;
    const b = especificacion.liquidez_prueba_acida;
    a.razones_dependientes = [{ id:b.razon.id }];
    b.razones_dependientes = [{ id:a.razon.id }];
    expect(() => calcularRazon(a.razon.id, entradaManual(), {}, especificacion)).toThrow('ciclo de razones');
    b.razones_dependientes = [];
    b.razon.formula = { op:'ratio', id:a.razon.id };
    expect(() => calcularRazon(a.razon.id, entradaManual(), {}, especificacion)).toThrow('dependencia no declarada');
  });
  it('no muta la entrada ni las especificaciones y conserva precisión', () => {
    const entrada = entradaManual();
    const anterior = JSON.stringify(entrada);
    const especificacionAnterior = JSON.stringify(ESPECIFICACION_RAZONES);
    expect(calcularRazon('actividad_rotacion_activos_totales',entrada).valor).toBe(800/1225);
    expect(JSON.stringify(entrada)).toBe(anterior);
    expect(JSON.stringify(ESPECIFICACION_RAZONES)).toBe(especificacionAnterior);
  });
});

describe('opción A y adaptación por identificadores', () => {
  function datos() {
    return registrarCuenta({ name:'Caso opción A', periods:['2024'], balanceGeneral:{ '2024':{ activos:{}, pasivos:{}, patrimonio:{} } }, estadoResultados:{ '2024':{} } }, [
      ['is.sales_total',100], ['is.cost_of_sales_reported',0], ['is.nonoperating_income',0], ['is.interest_income',20], ['is.interest_expense',5]
    ].map(([id,importe],i) => ({ id,importe,nombre:`fila propia ${i}`,periodo:'2024',grupo:'estadoResultados',origen:'importacion' })));
  }
  it('ingresos ilustrativos: 100 + 20 − 5 = 115', () => {
    const normalizados = datos();
    const entrada = crearEntradaRazones(normalizados,'2024',{ composicionIngresos:{ current:'excluye_intereses' } });
    expect(evaluarDerivado('rentabilidad_margen_utilidad_neta','derived.net_income',entrada).valor).toBe(115);
    expect(computeFinancialTotals(normalizados,'2024').utilidadNeta).toBe(115);
    const traza = calcularRazonConTraza('rentabilidad_margen_utilidad_neta',entrada);
    expect(traza.agregaciones).toEqual([]);
    expect(traza.lecturas).toEqual(expect.arrayContaining([
      { clave:'is.nonoperating_income:current', valor:0 }, { clave:'is.interest_income:current', valor:20 }
    ]));
  });
  it('rechaza otros ingresos que ya incluyen intereses, sin aplicar opción B', () => {
    const entrada = crearEntradaRazones(datos(),'2024',{ composicionIngresos:{ current:'incluye_intereses' } });
    campo(entrada,'is.nonoperating_income').current = 25;
    expect(() => calcularRazon('rentabilidad_margen_utilidad_neta',entrada)).toThrow('entrada inválida');
    entrada.composicionIngresos.current = undefined;
    expect(() => calcularRazon('rentabilidad_margen_utilidad_neta',entrada)).toThrow('falta declarar composición');
  });
  it('un agregado cero también exige composición y rechaza intereses ya incluidos', () => {
    const entrada = crearEntradaRazones(datos(),'2024',{ composicionIngresos:{ current:'incluye_intereses' } });
    expect(campo(entrada,'is.nonoperating_income').current).toBe(0);
    expect(() => calcularRazon('rentabilidad_margen_utilidad_neta',entrada)).toThrow('entrada inválida');
    entrada.composicionIngresos.current = undefined;
    expect(() => calcularRazon('rentabilidad_margen_utilidad_neta',entrada)).toThrow('falta declarar composición');
  });
  it('el adaptador conserva una fila sin identidad como pendiente, sin omitirla', () => {
    const entrada = crearEntradaRazones({ periods:['2024'], balanceGeneral:{ '2024':{ activos:{ 'rótulo externo':100 } } } }, '2024');
    expect(entrada.cuentas).toHaveLength(1);
    expect(entrada.cuentas[0]).toMatchObject({ id:null, estado:'no_reconocida', current:100 });
    expect(corriente(entrada).valor).toBeNull();
  });
});
