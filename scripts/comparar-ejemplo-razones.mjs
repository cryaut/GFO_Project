import { calcularRazon } from '../js/modules/razones/razones-motor.js';
import { ejemploV3, entradaEjemplo, valorEnUnidadHoja } from '../tests/unit/fixtures/razones-ejemplo.js';

// Compara el snapshot literal de Esperados sin redondear el valor del motor.
// Tolerancia de toBeCloseTo(..., 6), según docs/reglas/pruebas-y-documentacion.md.
const filas = ejemploV3.esperados.map(referencia => {
  const entrada = entradaEjemplo(ejemploV3.periodos.indexOf(referencia.periodo));
  const resultado = calcularRazon(referencia.id, entrada, { mostrar_calculo_directo_primer_periodo:referencia.control });
  const obtenido = valorEnUnidadHoja(referencia, resultado);
  const coincide = referencia.valor === null
    ? obtenido === null && resultado.motivos.length > 0
    : obtenido !== null && Math.abs(obtenido - referencia.valor) < 0.0000005;
  return { ...referencia, obtenido, coincide, motivos:resultado.motivos };
});
const fallas = filas.filter(fila => !fila.coincide);
console.log('# Comparación A5 contra el ejemplo v3\n');
console.log(`Fuente inmutable: \`${ejemploV3.fuente.archivo}\`. SHA-256: \`${ejemploV3.fuente.sha256}\`.\n`);
console.log('Comando reproducible: `node scripts/comparar-ejemplo-razones.mjs`.\n');
console.log('Control apagado: 40 celdas. Control encendido: 20 celdas de 2023.');
console.log(`Resultado: ${filas.length - fallas.length}/60 coinciden; ${fallas.length} diferencias.\n`);
console.log('Los porcentajes se comparan en puntos porcentuales, como Esperados. El motor conserva su fracción sin redondear. Los valores de la hoja se conservan completos; la tolerancia decimal es 0.0000005 (6 decimales).\n');
console.log('| Celda de Esperados | Razón | Periodo | Control | Esperado (unidad de hoja) | Obtenido (unidad de hoja) | Resultado | Motivo N/D |');
console.log('|---|---|---|---|---:|---:|---|---|');
for (const fila of filas) {
  const motivos = fila.motivos.map(motivo => JSON.stringify(motivo)).join('; ').replaceAll('|', '\\|');
  console.log(`| ${fila.celda} | ${fila.id} | ${fila.periodo} | ${fila.control ? 'encendido' : 'apagado'} | ${fila.original} | ${fila.obtenido === null ? 'N/D' : fila.obtenido} | ${fila.coincide ? 'coincide' : 'DIFERENCIA'} | ${fila.obtenido === null ? motivos : '—'} |`);
}
if (fallas.length) process.exitCode = 1;
