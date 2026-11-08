// La cobertura describe la fuente, no inserta partidas ni decide sus importes.
export const GRUPOS_COBERTURA = Object.freeze(['activos', 'pasivos', 'patrimonio', 'estadoResultados']);
export const ESTADOS_COBERTURA = Object.freeze(['sin_confirmar', 'parcial', 'completo']);

export function coberturaCompleta(cobertura, grupo) {
  return cobertura?.[grupo] === 'completo';
}
