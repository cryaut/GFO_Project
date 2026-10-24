import { expect, it } from 'vitest';
import { calcularRazon } from '../../js/modules/razones/razones-motor.js';
import { entradaManual } from './fixtures/razones-casos.js';

// Caso resuelto a mano: AC=950, PC=200, AF=500, AT=1450, pasivo=500,
// patrimonio=950; anteriores AC=600, AF=400, AT=1000, patrimonio=650.
// Ventas=800, costo=400, gastos operativos=120, UAII=280, UN=260.
const casos = [
  ['liquidez_capital_trabajo_neto',750], // 950-200
  ['liquidez_razon_corriente',4.75], // 950/200
  ['liquidez_prueba_acida',2.25], // (950-500)/200
  ['rentabilidad_margen_utilidad_bruta',0.5], // (800-400)/800
  ['rentabilidad_margen_utilidad_operativa',0.35], // (400-80-40)/800
  ['rentabilidad_margen_utilidad_neta',0.325], // (280+20-10-10-20)/800
  ['rentabilidad_roa',260/1225], // 260/((1000+1450)/2)
  ['rentabilidad_roe',0.325], // 260/((650+950)/2)
  ['endeudamiento_razon_deuda_total',500/1450],
  ['endeudamiento_razon_deuda_patrimonio',500/950],
  ['endeudamiento_cobertura_interes',28], // 280/10
  ['actividad_rotacion_inventarios',1], // 400/((300+500)/2)
  ['actividad_edad_promedio_inventario',365], // 365/1
  ['actividad_rotacion_cuentas_por_cobrar',2.8], // 700/((200+300)/2)
  ['actividad_periodo_promedio_cobro',365/2.8],
  ['actividad_rotacion_cuentas_por_pagar',2.8], // (300+150-100)/((100+150)/2)
  ['actividad_periodo_promedio_pago',365/2.8],
  ['actividad_rotacion_activos_fijos',800/450],
  ['actividad_rotacion_activos_totales',800/1225],
  ['actividad_ciclo_conversion_efectivo',365] // 365+365/2.8-365/2.8
];

it.each(casos)('caso independiente a mano: %s', (id,esperado) => {
  expect(calcularRazon(id, entradaManual()).valor).toBeCloseTo(esperado, 9);
});
