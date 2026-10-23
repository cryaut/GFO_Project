import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { calcularRazon, evaluarDerivado } from '../../js/modules/razones/razones-motor.js';
import { formatearResultadoRazon } from '../../js/modules/razones/razones-presentacion.js';
import { DEMO_MUNOMODA } from '../../js/modules/estados/index.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { entradaMuno } from '../fixtures/razones-casos.js';

const checks = readFileSync(new URL('../../docs/razones_financieras/notas/05_checks.md', import.meta.url), 'utf8');
const celdas = [];
let razon;
for (const linea of checks.split(/\r?\n/)) {
  const encabezado = linea.match(/^#### \d+\. .* — `([^`]+)\.json`/);
  if (encabezado) razon = encabezado[1];
  const celda = linea.match(/^- \*\*(2023, control apagado|2023, control encendido|2024)\*\*.* = \*\*([^*]+)\*\* \(referencia:/);
  if (celda && razon) celdas.push([razon,celda[1],celda[2]]);
}

it('mantiene las 60 celdas de referencia, sin bloquear dividendos que los árboles no usan', () => {
  expect(celdas).toHaveLength(60);
});

it.each(celdas)('MUNO MODA B5: %s, %s', (id,escenario,esperado) => {
  const entrada = entradaMuno(escenario === '2024' ? 1 : 0);
  const resultado = calcularRazon(id, entrada, { mostrar_calculo_directo_primer_periodo:escenario.includes('encendido') });
  expect(formatearResultadoRazon(id, resultado)).toBe(esperado);
  if (esperado === 'N/D') expect(resultado.motivos.length).toBeGreaterThan(0);
});

it.each([[0,801475,89180],[1,825525,104825]])('regresión de activos y utilidad, periodo índice %s', (indice,activos,utilidad) => {
  const entrada = entradaMuno(indice);
  const app = computeFinancialTotals(DEMO_MUNOMODA, entrada.periodos.actual);
  expect(evaluarDerivado('endeudamiento_razon_deuda_total', 'derived.total_assets', entrada).valor).toBe(activos);
  expect(evaluarDerivado('rentabilidad_roa', 'derived.net_income', entrada).valor).toBe(utilidad);
  expect(app.totalActivos).toBe(activos);
  expect(app.utilidadNeta).toBe(utilidad);
});
