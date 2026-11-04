import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// T11: la nota es una copia documental. Los JSON del motor se leen y nunca se editan.
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const carpeta = resolve(raiz, 'docs/razones_financieras');
const cuentas = new Map();
const canon = valor => {
  if (Array.isArray(valor)) return valor.map(canon);
  if (valor && typeof valor === 'object') return Object.fromEntries(Object.keys(valor).sort().map(clave => [clave, canon(valor[clave])]));
  return valor;
};
const iguales = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
const errores = [];
for (const nombre of readdirSync(carpeta).filter(nombre => nombre.endsWith('.json')).sort()) {
  const documento = JSON.parse(readFileSync(resolve(carpeta, nombre), 'utf8'));
  for (const cuenta of documento.cuentas) {
    const anterior = cuentas.get(cuenta.id);
    if (anterior && !iguales(anterior, cuenta)) errores.push(`${cuenta.id}: objetos distintos entre JSON.`);
    cuentas.set(cuenta.id, cuenta);
  }
}
const nota = readFileSync(resolve(carpeta, 'notas/02_cuentas_maestras.md'), 'utf8');
const maestras = new Map();
for (const bloque of nota.matchAll(/```json\s*\n([\s\S]*?)\n```/g)) {
  const cuenta = JSON.parse(bloque[1]);
  if (maestras.has(cuenta.id)) errores.push(`${cuenta.id}: objeto duplicado en la nota.`);
  maestras.set(cuenta.id, cuenta);
}
for (const [id, cuenta] of cuentas) {
  const maestra = maestras.get(id);
  if (!maestra) { errores.push(`${id}: falta en la nota.`); continue; }
  for (const campo of ['research', 'definition']) {
    if (!iguales(maestra[campo], cuenta[campo])) errores.push(`${id}.${campo}: diferente entre nota y JSON.`);
  }
}
for (const id of maestras.keys()) if (!cuentas.has(id)) errores.push(`${id}: no existe en los JSON.`);
if (cuentas.size !== 72 || maestras.size !== 72) errores.push(`Conteos inesperados: JSON=${cuentas.size}, nota=${maestras.size}; se esperan 72.`);
console.log(`Cuentas únicas: JSON=${cuentas.size}; nota=${maestras.size}.`);
console.log(`Campos comparados: research y definition. Diferencias: ${errores.length}.`);
for (const error of errores) console.log(error);
if (errores.length) process.exitCode = 1;
