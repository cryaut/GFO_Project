import { normalizeFinancialData } from '../estados/estados-normalize.js';

// Validación de un respaldo JSON (el que genera "Exportar JSON" en Reportes) antes de
// tocar el store. Es pura: recibe el archivo ya parseado y los datos actuales, y devuelve
// los módulos listos para guardar o lanza un Error en español con la causa.

export const MAX_RESPALDO_BYTES = 5 * 1024 * 1024;

const CLAVES_PELIGROSAS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_PROFUNDIDAD = 12;
const MAX_NODOS = 200000;
// El tema es una preferencia del equipo que importa, no un dato financiero.
const CLAVES_IGNORADAS = new Set(['theme']);

const esObjeto = valor => valor !== null && typeof valor === 'object' && !Array.isArray(valor);

// Recorre todo el árbol una sola vez: rechaza claves peligrosas, números no finitos y
// estructuras desproporcionadas que podrían colgar la pestaña.
function revisarSeguro(valor, ruta, estado, profundidad = 0) {
  if (profundidad > MAX_PROFUNDIDAD) throw new Error(`Estructura demasiado profunda en ${ruta}.`);
  if (++estado.nodos > MAX_NODOS) throw new Error('El archivo contiene demasiados datos.');
  if (typeof valor === 'number' && !Number.isFinite(valor)) {
    throw new Error(`Número inválido en ${ruta}.`);
  }
  if (Array.isArray(valor)) {
    valor.forEach((item, index) => revisarSeguro(item, `${ruta}[${index}]`, estado, profundidad + 1));
  } else if (esObjeto(valor)) {
    for (const [clave, hijo] of Object.entries(valor)) {
      if (CLAVES_PELIGROSAS.has(clave)) throw new Error(`Clave no permitida en ${ruta}: ${clave}`);
      revisarSeguro(hijo, `${ruta}.${clave}`, estado, profundidad + 1);
    }
  }
}

// Comprueba que un valor importado tiene el mismo tipo que el actual. Donde el actual es
// null, número o texto se admite también null (= sin dato); varios campos nacen en null y se
// llenan después con objetos, así que un actual null no restringe nada.
function validarTipo(importado, actual, ruta) {
  if (Array.isArray(actual)) {
    if (!Array.isArray(importado)) throw new Error(`${ruta} debe ser una lista.`);
  } else if (esObjeto(actual)) {
    if (importado !== null && !esObjeto(importado)) throw new Error(`${ruta} debe ser un objeto.`);
  } else if (typeof actual === 'number') {
    if (importado !== null && typeof importado !== 'number') throw new Error(`${ruta} debe ser un número.`);
  } else if (typeof actual === 'string') {
    if (importado !== null && typeof importado !== 'string') throw new Error(`${ruta} debe ser texto.`);
  }
}

function validarModulo(clave, importado, actual, omitidos) {
  if (clave === 'estados') return normalizeFinancialData(importado);
  if (!esObjeto(importado)) throw new Error(`El módulo "${clave}" debe ser un objeto.`);
  // Lo que el archivo no trae se conserva del módulo actual para que no quede incompleto.
  const resultado = structuredClone(actual);
  for (const [campo, valor] of Object.entries(importado)) {
    if (!Object.hasOwn(actual, campo)) {
      omitidos.push(`${clave}.${campo}`);
      continue;
    }
    validarTipo(valor, actual[campo], `${clave}.${campo}`);
    resultado[campo] = structuredClone(valor);
  }
  return resultado;
}

// Devuelve { modulos, omitidos }: modulos = { clave: valor validado } con solo las claves que
// el store conoce; omitidos = claves o campos del archivo que no se importaron.
export function validarRespaldo(contenido, actuales) {
  if (!esObjeto(contenido)) {
    throw new Error('El archivo no es un respaldo de GFO Toolkit (se esperaba un objeto JSON).');
  }
  revisarSeguro(contenido, 'archivo', { nodos: 0 });
  const conocidas = new Set(Object.keys(actuales));
  const modulos = {};
  const omitidos = [];
  for (const [clave, valor] of Object.entries(contenido)) {
    if (CLAVES_IGNORADAS.has(clave)) continue;
    if (!conocidas.has(clave)) { omitidos.push(clave); continue; }
    modulos[clave] = validarModulo(clave, valor, actuales[clave], omitidos);
  }
  if (Object.keys(modulos).length === 0) {
    throw new Error('El archivo no contiene módulos de GFO Toolkit reconocibles. Si es un JSON de estados financieros, impórtelo desde Estados Financieros.');
  }
  return { modulos, omitidos };
}
