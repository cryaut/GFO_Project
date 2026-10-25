import { expect, it } from 'vitest';
import { MAPA_RAZONES_APP, computarRazonesDesdeDatos, obtenerUtilidadNetaMotor } from '../../js/modules/razones/razones-app-adapter.js';
import { ESPECIFICACION_RAZONES } from '../../js/modules/razones/especificacion-razones.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { CUENTAS_CATALOGO } from '../../js/modules/estados/cuentas-catalogo.js';
import { ejemploV3 } from './fixtures/razones-ejemplo.js';

// Correspondencia independiente que debe conservar el adaptador de la app.
const mapa = {
  capitalNetoTrabajo:'liquidez_capital_trabajo_neto', RC:'liquidez_razon_corriente', RR:'liquidez_prueba_acida',
  margenBruto:'rentabilidad_margen_utilidad_bruta', margenOperativo:'rentabilidad_margen_utilidad_operativa',
  MN:'rentabilidad_margen_utilidad_neta', ROA:'rentabilidad_roa', roe:'rentabilidad_roe',
  endeudamiento:'endeudamiento_razon_deuda_total', deudaPatrimonio:'endeudamiento_razon_deuda_patrimonio',
  coberturaIntereses:'endeudamiento_cobertura_interes', RotInv:'actividad_rotacion_inventarios',
  edadInventario:'actividad_edad_promedio_inventario', RotCxC:'actividad_rotacion_cuentas_por_cobrar',
  PPC:'actividad_periodo_promedio_cobro', rotacionCxP:'actividad_rotacion_cuentas_por_pagar',
  plazoPago:'actividad_periodo_promedio_pago', rotacionActivosFijos:'actividad_rotacion_activos_fijos',
  rotacionActivos:'actividad_rotacion_activos_totales', cicloConversion:'actividad_ciclo_conversion_efectivo'
};
const contrato = ['RC','RR','RotInv','RotCxC','PPC','endeudamiento','MN','ROA','roe','margenBruto','margenOperativo',
  'coberturaIntereses','deudaPatrimonio','cicloConversion','edadInventario','plazoPago','rotacionActivosFijos',
  'rotacionCxP','rotacionActivos','pruebaDefensiva','rotacionCapitalTrabajo','apalancamiento','solvencia',
  'usaPromedios','usaComprasReales','invProm','cxcProm','activoProm','patrimonioProm','notAvailableReasons','denominadores'];

function datosEjemplo() {
  const periodos = ejemploV3.periodos;
  const catalogo = new Map(CUENTAS_CATALOGO.map(cuenta => [cuenta.id,cuenta]));
  return registrarCuenta({ name:'Contrato con ejemplo v3', periods:periodos,
    balanceGeneral:Object.fromEntries(periodos.map(periodo => [periodo,{ activos:{}, pasivos:{}, patrimonio:{} }])),
    estadoResultados:Object.fromEntries(periodos.map(periodo => [periodo,{}])),
    composicionIngresos:Object.fromEntries(periodos.map(periodo => [periodo,'excluye_intereses']))
  }, ejemploV3.entradas.flatMap((cuenta, indice) => periodos.filter(periodo => cuenta[periodo].presente).map(periodo => ({
    id:cuenta.id, nombre:`fila del ejemplo ${indice}`, grupo:catalogo.get(cuenta.id).grupo,
    importe:cuenta[periodo].valor, periodo, origen:'manual', confirmado:true
  }))));
}

it('expone la correspondencia de los 20 JSON y conserva las 31 claves anteriores más CNT', () => {
  expect(MAPA_RAZONES_APP).toEqual(mapa);
  expect(new Set(Object.values(MAPA_RAZONES_APP)).size).toBe(20);
  expect(Object.keys(computarRazonesDesdeDatos(datosEjemplo(), '2024')).sort())
    .toEqual([...contrato,'capitalNetoTrabajo'].sort());
});

it('toma las 20 razones de la referencia v3 sin cambiar unidades ni precisión', () => {
  const salida = computarRazonesDesdeDatos(datosEjemplo(), '2024');
  for (const referencia of ejemploV3.esperados.filter(celda => celda.periodo === '2024')) {
    const campo = Object.keys(mapa).find(clave => mapa[clave] === referencia.id);
    const valor = salida[campo] * (referencia.unidad === 'porcentaje' ? 100 : 1);
    expect(valor, `Esperados!${referencia.celda}`).toBeCloseTo(referencia.valor, 6);
  }
});

it('conserva metadatos y obtiene denominadores de la misma entrada acreditada', () => {
  const salida = computarRazonesDesdeDatos(datosEjemplo(), '2024');
  expect(salida).toMatchObject({ usaPromedios:true, usaComprasReales:true,
    invProm:97500, cxcProm:85000, activoProm:593000, patrimonioProm:316500,
    notAvailableReasons:[], denominadores:{ RC:145000, RR:145000, RotInv:97500, RotCxC:85000,
      End:616000, MN:700000, ROA:593000, coberturaIntereses:11000 } });
});

it('conserva las cuatro funciones extra con las entradas del motor', () => {
  const salida = computarRazonesDesdeDatos(datosEjemplo(), '2024');
  expect(salida.pruebaDefensiva).toBe(55000 / 145000);
  expect(salida.rotacionCapitalTrabajo).toBe(700000 / 127000);
  expect(salida.apalancamiento).toBe(593000 / 316500);
  expect(salida.solvencia).toBe(616000 / 250000);
});

it.each([['sin_declarar','composicion_no_declarada'],['incluye_intereses','composicion_incluye_intereses']])(
  'la composición %s convierte solo las razones afectadas a N/D', (declaracion, motivo) => {
    const datos = datosEjemplo();
    datos.composicionIngresos['2024'] = declaracion;
    const salida = computarRazonesDesdeDatos(datos, '2024');
    expect(salida.MN).toBeNull();
    expect(salida.ROA).toBeNull();
    expect(salida.RC).toBeCloseTo(272000 / 145000, 6);
    expect(salida.notAvailableReasons).toContainEqual({ campo:'MN', periodo:'2024', motivo, operandos:['is.nonoperating_income'] });
  }
);

it('la utilidad neta para Reportes viene del derivado con el mismo contrato de motivos', () => {
  expect(obtenerUtilidadNetaMotor(datosEjemplo(), '2024')).toEqual({ valor:99000, metodo:'direct_closing', motivos:[] });
  const datos = datosEjemplo();
  datos.composicionIngresos['2024'] = 'sin_declarar';
  expect(obtenerUtilidadNetaMotor(datos, '2024')).toMatchObject({ valor:null, metodo:'not_applicable',
    motivos:[{ codigo:'composicion_no_declarada', id:'is.nonoperating_income', periodo:'current' }] });
});

it('el control del harness afecta al primer periodo sin cambiar el valor por defecto', () => {
  const datos = datosEjemplo();
  expect(computarRazonesDesdeDatos(datos, '2023').ROA).toBeNull();
  expect(computarRazonesDesdeDatos(datos, '2023', { mostrar_calculo_directo_primer_periodo:true }).ROA).toBe(66000 / 570000);
});

it('una indisponibilidad global conserva el contrato y nunca usa otro periodo', () => {
  const salida = computarRazonesDesdeDatos(datosEjemplo(), '2099');
  expect(Object.keys(salida).sort()).toEqual([...contrato,'capitalNetoTrabajo'].sort());
  for (const campo of [...Object.keys(mapa),'pruebaDefensiva','rotacionCapitalTrabajo','apalancamiento','solvencia']) {
    expect(salida[campo], campo).toBeNull();
    expect(salida.notAvailableReasons).toContainEqual({ campo, periodo:'2099', motivo:'periodo_no_disponible', operandos:[] });
  }
});

it('las consultas no mutan el documento ni la especificación del motor', () => {
  const datos = datosEjemplo();
  const antes = JSON.stringify(datos);
  const especificacion = JSON.stringify(ESPECIFICACION_RAZONES);
  computarRazonesDesdeDatos(datos, '2024');
  expect(JSON.stringify(datos)).toBe(antes);
  expect(JSON.stringify(ESPECIFICACION_RAZONES)).toBe(especificacion);
});
