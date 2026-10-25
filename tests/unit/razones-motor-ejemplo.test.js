import { expect, it } from 'vitest';
import { calcularRazon, evaluarDerivado } from '../../js/modules/razones/razones-motor.js';
import { ejemploV3, entradaEjemplo, valorEnUnidadHoja } from './fixtures/razones-ejemplo.js';

it('conserva las 40 celdas sin control y las 20 del primer periodo con control del ejemplo v3', () => {
  expect(ejemploV3.esperados).toHaveLength(60);
  expect(ejemploV3.esperados.filter(celda => !celda.control)).toHaveLength(40);
  expect(ejemploV3.esperados.filter(celda => celda.control)).toHaveLength(20);
  expect(new Set(ejemploV3.esperados.map(celda => celda.celda)).size).toBe(60);
});

it.each(ejemploV3.esperados)('ejemplo v3: Esperados!$celda, $id, $periodo, control $control', referencia => {
  const entrada = entradaEjemplo(ejemploV3.periodos.indexOf(referencia.periodo));
  const resultado = calcularRazon(referencia.id, entrada, { mostrar_calculo_directo_primer_periodo:referencia.control });
  if (referencia.valor === null) {
    expect(resultado.valor).toBeNull();
    expect(resultado.motivos.length).toBeGreaterThan(0);
  } else {
    expect(valorEnUnidadHoja(referencia, resultado)).toBeCloseTo(referencia.valor, 6);
  }
});

// Regresiones independientes de las razones: suma de componentes de Entradas.
// Activos 2023: 230000 + 305000 + 10000 + 20000 + 5000 = 570000.
// Activos 2024: 272000 + 311000 + 8000 + 20000 + 5000 = 616000.
// UN 2023: 90000 + 4000 + 8000 - 2000 - 12000 - 22000 = 66000.
// UN 2024: 131000 + 3000 + 10000 - 1000 - 11000 - 33000 = 99000.
it.each(ejemploV3.regresiones)('regresión de activos y utilidad del ejemplo v3: $periodo', referencia => {
  const entrada = entradaEjemplo(ejemploV3.periodos.indexOf(referencia.periodo));
  expect(evaluarDerivado('endeudamiento_razon_deuda_total', 'derived.total_assets', entrada).valor).toBe(referencia.activos.valor);
  expect(evaluarDerivado('rentabilidad_roa', 'derived.net_income', entrada).valor).toBe(referencia.utilidad.valor);
});
