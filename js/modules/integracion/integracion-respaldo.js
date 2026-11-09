import { normalizeFinancialData } from '../estados/estados-normalize.js';
import { leerEstados } from '../../utils/estados-guardados.js';
import { validarInventarioRespaldo } from '../inventario/inventario-calculations.js';
import { tieneEscenarios, validarEscenarios } from '../planeacion/planeacion-escenarios.js';
import { validarCajaDocente } from '../planeacion/caja-docente-calculations.js';
import { PROCEDENCIA_CVU, PROCEDENCIA_FLUJO, PROCEDENCIA_PLANEACION, validarProcedencia } from '../../utils/transferencias.js';

// Validación de un respaldo JSON (el que genera "Exportar JSON" en Reportes) antes de
// tocar el store. Es pura: recibe el archivo ya parseado y los datos actuales, y devuelve
// los módulos listos para guardar o lanza un Error en español con la causa.

export const MAX_RESPALDO_BYTES = 5 * 1024 * 1024;

const CLAVES_PELIGROSAS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_PROFUNDIDAD = 12;
const MAX_NODOS = 200000;
// El tema es una preferencia del equipo que importa, no un dato financiero.
const CLAVES_IGNORADAS = new Set(['theme']);
const CAMPOS_PROCEDENCIA = new Map([
  ['planeacion', PROCEDENCIA_PLANEACION], ['flujo', PROCEDENCIA_FLUJO], ['equilibrio', PROCEDENCIA_CVU]
]);

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
  if (clave === 'planeacion' && esObjeto(importado)) {
    if (Object.hasOwn(importado, 'cajaDocente') && importado.cajaDocente !== null) {
      validarCajaDocente(importado.cajaDocente);
    }
    if (tieneEscenarios(importado)) return structuredClone(validarEscenarios(importado));
    if (['bases', 'escenarios', 'activoId'].some(campo => Object.hasOwn(importado, campo))) {
      throw new Error('Falta la versión del respaldo de escenarios de Planeación.');
    }
    if (Object.hasOwn(importado, 'supuestos')) {
      if (importado.supuestos !== null && !esObjeto(importado.supuestos)) {
        throw new Error('Los supuestos de Planeación deben ser un objeto o N/D.');
      }
      // Un respaldo anterior reemplaza Planeación con su presupuesto sin base conocida.
      if (tieneEscenarios(actual)) actual = {
        supuestos: null,
        ...(Object.hasOwn(actual, 'cajaDocente') ? { cajaDocente: actual.cajaDocente } : {})
      };
    }
  }
  if (clave === 'estados') {
    // D-080: si los estados del respaldo no se pueden leer, el respaldo completo
    // se rechaza — un dato que las pantallas no pueden usar no debe quedar guardado.
    const lectura = leerEstados(importado);
    if (lectura.error) {
      throw new Error(`No se pudieron leer los estados del respaldo: ${lectura.error}. No se importó nada.`);
    }
    return lectura.estados ?? normalizeFinancialData(importado);
  }
  if (clave === 'inventario') {
    // D-083 (ronda 2): primero las mismas validaciones de forma que el resto de
    // módulos y después la validación del kardex.
    if (!esObjeto(importado)) throw new Error(`El módulo "${clave}" debe ser un objeto.`);
    for (const [campo, valor] of Object.entries(importado)) {
      if (!Object.hasOwn(actual, campo)) {
        omitidos.push(`${clave}.${campo}`);
        continue;
      }
      validarTipo(valor, actual[campo], `${clave}.${campo}`);
    }
    return validarInventarioRespaldo(importado);
  }
  if (!esObjeto(importado)) throw new Error(`El módulo "${clave}" debe ser un objeto.`);
  const camposProcedencia = CAMPOS_PROCEDENCIA.get(clave);
  // Lo que el archivo no trae se conserva del módulo actual para que no quede incompleto.
  const resultado = structuredClone(actual);
  for (const [campo, valor] of Object.entries(importado)) {
    if (clave === 'planeacion' && campo === 'cajaDocente') {
      resultado.cajaDocente = structuredClone(valor);
      continue;
    }
    if (camposProcedencia && campo === 'procedencia') {
      resultado.procedencia = structuredClone(validarProcedencia(valor, camposProcedencia));
      continue;
    }
    if (!Object.hasOwn(actual, campo)) {
      omitidos.push(`${clave}.${campo}`);
      continue;
    }
    validarTipo(valor, actual[campo], `${clave}.${campo}`);
    resultado[campo] = structuredClone(valor);
  }
  if (camposProcedencia && !Object.hasOwn(importado, 'procedencia') && resultado.procedencia) {
    for (const campo of camposProcedencia) {
      if (Object.hasOwn(importado, clave === 'planeacion' ? 'supuestos' : campo)) delete resultado.procedencia[campo];
    }
    if (!Object.keys(resultado.procedencia).length) delete resultado.procedencia;
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
