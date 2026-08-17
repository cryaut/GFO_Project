export function depAnualLineaRectaModule(costo, residual, vida) {
  if (vida <= 0) return 0;
  return (costo - residual) / vida;
}
