// Validación del registro; las fórmulas de depreciación siguen en utils/calculate.js.
export function validarActivo(activo) {
  const errores = [];
  if (!activo.nombre?.trim()) errores.push('Ingrese un nombre');
  if (!activo.categoria?.trim()) errores.push('Seleccione una categoría');
  for (const [campo, etiqueta] of [['costoOriginal', 'Costo original'], ['valorResidual', 'Valor residual'], ['costoReposicion', 'Costo de reposición']]) {
    if (!Number.isFinite(activo[campo]) || activo[campo] < 0) errores.push(`${etiqueta}: ingrese un importe no negativo`);
  }
  if (!Number.isInteger(activo.vidaUtil) || activo.vidaUtil < 1) errores.push('Vida útil: ingrese un número entero mayor que cero');
  if (!Number.isInteger(activo.aniosConsumidos) || activo.aniosConsumidos < 0) errores.push('Años consumidos: ingrese un número entero no negativo');
  if (activo.valorResidual > activo.costoOriginal) errores.push('El valor residual no puede superar el costo original');
  const scores = activo.condicion?.scores;
  if (!Array.isArray(scores) || scores.length !== 8 || scores.some(score => !Number.isInteger(score) || score < 0 || score > 10)) {
    errores.push('Condición: complete los ocho puntajes enteros entre 0 y 10');
  }
  return errores;
}
