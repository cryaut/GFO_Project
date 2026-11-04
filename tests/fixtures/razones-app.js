import { readFileSync } from 'node:fs';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { CUENTAS_CATALOGO } from '../../js/modules/estados/cuentas-catalogo.js';

export const ejemploApp = JSON.parse(readFileSync(new URL('../unit/fixtures/razones-ejemplo-v3.json', import.meta.url), 'utf8'));
export const ejerciciosApp = JSON.parse(readFileSync(new URL('./razones-app-ejercicios-v2.json', import.meta.url), 'utf8'));
const catalogo = new Map(CUENTAS_CATALOGO.map(cuenta => [cuenta.id, cuenta]));

// Contrato independiente app → JSON de las veinte referencias de aceptación.
export const MAPA_APP_JSON = {
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

export function estadosDesdeReferencia(referencia) {
  const periods = [...referencia.periodos];
  const registros = referencia.entradas.flatMap((dato, indice) => periods.flatMap(periodo => {
    const importe = dato[periodo];
    if (!importe.presente) return [];
    return [{ id:dato.id, nombre:`fila acreditada ${indice}`, grupo:catalogo.get(dato.id).grupo,
      periodo, importe:importe.valor, origen:'manual', confirmado:true }];
  }));
  const datos = registrarCuenta({ name:'Aceptación por identificadores', periods,
    balanceGeneral:Object.fromEntries(periods.map(periodo => [periodo,{ activos:{}, pasivos:{}, patrimonio:{} }])),
    estadoResultados:Object.fromEntries(periods.map(periodo => [periodo,{}])),
    composicionIngresos:referencia.composicionIngresos || Object.fromEntries(periods.map(periodo => [periodo,'excluye_intereses']))
  }, registros);
  return datos;
}

// Sustituciones independientes: AC=650; PC=175; AF=350; AT=1000; UN=350.
// Se escriben ceros explícitos para las cuentas existentes sin movimiento.
export function documentoAceptacion(conAnterior = true) {
  const periodos = conAnterior ? ['2031','2032'] : ['2032'];
  const valores = {
    'bs.cash_and_equivalents':200, 'bs.trade_receivables':100, 'bs.inventory_merchandise':300,
    'bs.other_current_assets':50, 'bs.ppe_buildings':400, 'bs.accumulated_depreciation':-50,
    'bs.trade_payables':100, 'bs.short_term_borrowings':50, 'bs.current_provisions':25,
    'bs.long_term_borrowings':225, 'bs.share_capital':600,
    'is.product_sales':1000, 'is.merchandise_cost':400, 'is.administrative_expenses':100,
    'is.selling_expenses':50, 'is.nonoperating_income':20,
    'is.noninterest_nonoperating_expenses':30, 'is.interest_expense':40, 'is.income_tax_expense':50,
    'supp.credit_sales':800, 'supp.supplier_payments':350
  };
  const entradas = ejemploApp.entradas.filter(dato => catalogo.get(dato.id).rol !== 'reported_total')
    .map(dato => ({ id:dato.id, ...Object.fromEntries(periodos.map(periodo => [periodo,
      { presente:true, valor:valores[dato.id] ?? 0 }])) }));
  return estadosDesdeReferencia({ periodos, entradas });
}

export function filaConId(datos, id) {
  for (const [grupo, identidades] of Object.entries(datos.accountIdentities)) {
    for (const [nombre, identidad] of Object.entries(identidades)) {
      if (identidad.idCuenta === id) return { grupo, nombre };
    }
  }
  throw new Error(`No existe la cuenta de aceptación: ${id}`);
}

export function cambiarImporte(datos, id, valor) {
  const { grupo, nombre } = filaConId(datos, id);
  for (const periodo of datos.periods) {
    const cuentas = grupo === 'estadoResultados' ? datos.estadoResultados[periodo]
      : grupo === 'suplementario' ? datos.supplementaryAccounts[periodo] : datos.balanceGeneral[periodo][grupo];
    if (valor === undefined) delete cuentas[nombre];
    else cuentas[nombre] = valor;
  }
  return datos;
}

export function renombrarFila(datos, id) {
  const { grupo, nombre } = filaConId(datos, id);
  const nuevo = 'denominación propia conservando acreditación';
  for (const periodo of datos.periods) {
    const cuentas = grupo === 'estadoResultados' ? datos.estadoResultados[periodo]
      : grupo === 'suplementario' ? datos.supplementaryAccounts[periodo] : datos.balanceGeneral[periodo][grupo];
    cuentas[nuevo] = cuentas[nombre]; delete cuentas[nombre];
  }
  datos.accountIdentities[grupo][nuevo] = datos.accountIdentities[grupo][nombre];
  delete datos.accountIdentities[grupo][nombre];
  if (datos.accountTypes[grupo]) {
    datos.accountTypes[grupo][nuevo] = datos.accountTypes[grupo][nombre]; delete datos.accountTypes[grupo][nombre];
  }
  return datos;
}

export function retirarIdentidad(datos, id) {
  const { grupo, nombre } = filaConId(datos, id);
  datos.accountIdentities[grupo][nombre] = {
    idCuenta:null, estado:'no_reconocida', metodo:null, candidatos:[{ id }], origen:'manual'
  };
  return datos;
}
