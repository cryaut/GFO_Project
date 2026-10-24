const VACIAS = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'en', 'por', 'a']);

export function normalizarCuenta(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(palabra => palabra && !VACIAS.has(palabra)).join(' ');
}

// Damerau–Levenshtein sin restricciones: una transposición contigua cuenta como una edición.
export function distanciaDamerau(a, b) {
  const maximo = a.length + b.length;
  const d = Array.from({ length: a.length + 2 }, () => Array(b.length + 2).fill(0));
  d[0][0] = maximo;
  for (let i = 0; i <= a.length; i++) { d[i + 1][0] = maximo; d[i + 1][1] = i; }
  for (let j = 0; j <= b.length; j++) { d[0][j + 1] = maximo; d[1][j + 1] = j; }
  const ultima = new Map();
  for (let i = 1; i <= a.length; i++) {
    let coincidencia = 0;
    for (let j = 1; j <= b.length; j++) {
      const i1 = ultima.get(b[j - 1]) || 0;
      const j1 = coincidencia;
      const igual = a[i - 1] === b[j - 1];
      if (igual) coincidencia = j;
      d[i + 1][j + 1] = Math.min(d[i][j] + (igual ? 0 : 1), d[i + 1][j] + 1, d[i][j + 1] + 1,
        d[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1));
    }
    ultima.set(a[i - 1], i);
  }
  return d[a.length + 1][b.length + 1];
}

export function similitudCuentas(texto, candidato) {
  const a = normalizarCuenta(texto);
  const b = normalizarCuenta(candidato);
  if (!a || !b) return 0;
  if (a === b) return 1;
  // Un año, plazo o código distinto no es un error de letras.
  if (JSON.stringify(a.match(/\d+/g) || []) !== JSON.stringify(b.match(/\d+/g) || [])) return 0;
  const principal = 1 - distanciaDamerau(a, b) / Math.max(a.length, b.length);
  const palabrasA = a.split(' ');
  const palabrasB = b.split(' ');
  // Longitud combinada en el apoyo: Efetivo/Efectivo = 1 - 1/15 = 0.9333.
  // La comparación simétrica penaliza las palabras omitidas (p. ej. «no corriente»).
  const apoyo = (origen, destino) => origen.reduce((suma, palabra) => suma + Math.max(...destino.map(otra =>
    1 - distanciaDamerau(palabra, otra) / (palabra.length + otra.length))), 0) / origen.length;
  return Math.max(principal, (apoyo(palabrasA, palabrasB) + apoyo(palabrasB, palabrasA)) / 2);
}

export const UMBRALES_SIMILITUD = { minimo: 0.80, preseleccion: 0.92, ventaja: 0.05, maximos: 5 };

export function sugerirCuentas(texto, cuentas) {
  const candidatos = cuentas.map(cuenta => ({ id: cuenta.id, puntuacion: Math.max(
    ...[cuenta.nombreCanonico, ...cuenta.sinonimos].map(nombre => similitudCuentas(texto, nombre))) }))
    .filter(candidato => candidato.puntuacion >= UMBRALES_SIMILITUD.minimo)
    .sort((a, b) => b.puntuacion - a.puntuacion || a.id.localeCompare(b.id));
  const primero = candidatos[0];
  const segundo = candidatos[1];
  const preseleccion = primero && primero.puntuacion >= UMBRALES_SIMILITUD.preseleccion
    && (!segundo || primero.puntuacion - segundo.puntuacion >= UMBRALES_SIMILITUD.ventaja) ? primero.id : null;
  return { candidatos: candidatos.slice(0, UMBRALES_SIMILITUD.maximos), preseleccion };
}
