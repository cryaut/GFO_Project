import { expect, it } from 'vitest';
import { calcularRazon } from '../../js/modules/razones/razones-motor.js';
import { formatearResultadoRazon } from '../../js/modules/razones/razones-presentacion.js';
import { entradaPiloto } from '../fixtures/razones-piloto.js';

// Sustituciones a mano: CNT=AC-PC; corriente=AC/PC; ácida=(AC-I)/PC.
const casos = [
  ['liquidez_capital_trabajo_neto',210000,237000,'210,000','237,000'],
  ['liquidez_razon_corriente',370000/160000,412000/175000,'2.31','2.35'],
  ['liquidez_prueba_acida',190000/160000,217000/175000,'1.19','1.24']
].flatMap(([id,anterior,actual,textoAnterior,textoActual]) => [
  [id,0,false,anterior,textoAnterior], [id,0,true,anterior,textoAnterior], [id,1,false,actual,textoActual]
]);

it.each(casos)('piloto B5: %s, índice %s, control %s', (id,indice,control,valor,texto) => {
  const resultado = calcularRazon(id, entradaPiloto(indice), { mostrar_calculo_directo_primer_periodo:control });
  expect(resultado.valor).toBeCloseTo(valor, 8);
  expect(formatearResultadoRazon(id, resultado)).toBe(texto);
  expect(resultado.metodo).toBe('direct_closing');
});
