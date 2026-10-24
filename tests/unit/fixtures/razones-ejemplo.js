import { readFileSync } from 'node:fs';

export const ejemploV3 = JSON.parse(readFileSync(new URL('./razones-ejemplo-v3.json', import.meta.url), 'utf8'));

// Snapshot literal del libro v3. Su origen, hash y celdas están en el JSON.
// Las celdas vacías no crean una cuenta; cero y null explícitos se conservan.
export function entradaEjemplo(indice = 1) {
  const actual = ejemploV3.periodos[indice];
  const anterior = indice > 0 ? ejemploV3.periodos[indice - 1] : null;
  const cuentas = ejemploV3.entradas.flatMap(dato => {
    const fila = { id:dato.id, estado:'reconocida', origen:'manual' };
    for (const [token, periodo] of [['current',actual], ['previous',anterior]]) {
      if (periodo !== null && dato[periodo].presente) fila[token] = dato[periodo].valor;
    }
    return Object.hasOwn(fila, 'current') || Object.hasOwn(fila, 'previous') ? [fila] : [];
  });
  return { cuentas, periodos:{ actual, anterior, cantidad:ejemploV3.periodos.length, indice },
    composicionIngresos:{ current:'excluye_intereses', previous:'excluye_intereses' } };
}

export const valorEnUnidadHoja = (referencia, resultado) => resultado.valor === null
  ? null : resultado.valor * (referencia.unidad === 'porcentaje' ? 100 : 1);
