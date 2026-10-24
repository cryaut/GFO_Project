import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLAVES = ['schema_version', 'razon', 'razones_dependientes', 'derivados', 'conjuntos', 'cuentas', 'modo_periodo', 'presentacion', 'reglas_generales'];
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const normalizarLF = texto => texto.replace(/\r\n/g, '\n');

function literal(texto) {
  return "'" + texto.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    .replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + "'";
}

// Emite literales JS con el estilo del proyecto; no omite ni transforma research.
function serializar(valor, nivel = 0) {
  if (typeof valor === 'string') return literal(valor);
  if (valor === null || typeof valor !== 'object') return JSON.stringify(valor);
  const arreglo = Array.isArray(valor);
  const pares = arreglo ? valor.map(v => serializar(v, nivel + 1))
    : Object.entries(valor).map(([k,v]) => `${literal(k)}: ${serializar(v, nivel + 1)}`);
  const [abrir,cerrar] = arreglo ? ['[', ']'] : ['{', '}'];
  return pares.length ? `${abrir}\n${pares.map(p => '  '.repeat(nivel + 1) + p).join(',\n')}\n${'  '.repeat(nivel)}${cerrar}` : abrir + cerrar;
}

export function leerArchivos(directorio = resolve(raiz, 'docs/razones_financieras')) {
  return readdirSync(directorio).filter(n => n.endsWith('.json')).sort()
    .map(nombre => ({ nombre, contenido: readFileSync(resolve(directorio, nombre), 'utf8') }));
}

export function generarContenido(archivos) {
  if (archivos.length !== 20) throw new Error(`Se esperaban 20 JSON; se recibieron ${archivos.length}.`);
  const especificacion = {};
  const huella = createHash('sha256');
  const nombres = new Set();
  for (const { nombre, contenido } of [...archivos].sort((a,b) => a.nombre.localeCompare(b.nombre, 'en'))) {
    if (nombres.has(nombre)) throw new Error(`Archivo duplicado: ${nombre}`);
    nombres.add(nombre);
    const texto = normalizarLF(contenido);
    let documento;
    try { documento = JSON.parse(texto); } catch { throw new Error(`${nombre}: JSON inválido.`); }
    if (documento.schema_version !== '2.0' || Object.keys(documento).length !== CLAVES.length
      || CLAVES.some(k => !Object.hasOwn(documento, k))) throw new Error(`${nombre}: esquema 2.0 o nueve claves inválidos.`);
    const id = documento.razon?.id;
    if (typeof id !== 'string' || !/^[a-z][a-z0-9_]*$/.test(id) || Object.hasOwn(especificacion, id)) throw new Error(`${nombre}: id de razón inválido o duplicado.`);
    especificacion[id] = documento;
    huella.update(nombre).update('\0').update(texto).update('\0');
  }
  return `// GENERADO: no editar a mano.\n// SHA-256: ${huella.digest('hex')}\n// Fuente: 20 JSON de docs/razones_financieras; LF normalizado en la huella.\nexport const ESPECIFICACION_RAZONES = ${serializar(especificacion)};\n`;
}

export function verificarSincronia(archivos, contenidoGuardado) {
  const esperado = generarContenido(archivos);
  const recibido = normalizarLF(contenidoGuardado);
  if (recibido === esperado) return true;
  const huella = texto => texto.match(/^\/\/ SHA-256: ([a-f0-9]{64})$/m)?.[1];
  if (huella(recibido) !== huella(esperado)) throw new Error('Caso 1: la huella no coincide. Corre el generador y confirma el cambio.');
  throw new Error('Caso 2: la huella coincide pero el contenido no. Revierte la edición y regenera desde los JSON.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const contenido = generarContenido(leerArchivos());
  const destino = resolve(raiz, 'js/modules/razones/especificacion-razones.js');
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, contenido, 'utf8');
  console.log(`20 razones generadas; ${Buffer.byteLength(contenido)} bytes.`);
}
