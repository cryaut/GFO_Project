import { expect, it } from 'vitest';
import { calcularRazon } from '../../js/modules/razones/razones-motor.js';
import { formatearResultadoRazon } from '../../js/modules/razones/razones-presentacion.js';
import { ejemploV3, entradaEjemplo, valorEnUnidadHoja } from './fixtures/razones-ejemplo.js';

// Los nueve valores vienen de Esperados!D16:F18 del ejemplo v3.
const casos = ejemploV3.esperados.filter(celda => celda.id.startsWith('liquidez_'));
const textos = {
  liquidez_capital_trabajo_neto:{ '2023':'92,000', '2024':'127,000' },
  liquidez_prueba_acida:{ '2023':'1.01', '2024':'1.15' },
  liquidez_razon_corriente:{ '2023':'1.67', '2024':'1.88' }
};

it.each(casos)('piloto ejemplo v3: Esperados!$celda, $id, control $control', referencia => {
  const indice = ejemploV3.periodos.indexOf(referencia.periodo);
  const resultado = calcularRazon(referencia.id, entradaEjemplo(indice), { mostrar_calculo_directo_primer_periodo:referencia.control });
  expect(valorEnUnidadHoja(referencia, resultado)).toBeCloseTo(referencia.valor, 6);
  expect(formatearResultadoRazon(referencia.id, resultado)).toBe(textos[referencia.id][referencia.periodo]);
  expect(resultado.metodo).toBe('direct_closing');
});
