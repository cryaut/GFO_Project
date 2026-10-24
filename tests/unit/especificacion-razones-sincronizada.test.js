import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generarContenido, leerArchivos, verificarSincronia } from '../../scripts/generar-especificacion-razones.mjs';
import { ESPECIFICACION_RAZONES } from '../../js/modules/razones/especificacion-razones.js';

const sinteticos = () => Array.from({ length:20 }, (_,i) => ({ nombre:`razon_${String(i).padStart(2, '0')}.json`, contenido:JSON.stringify({
  schema_version:'2.0', razon:{ id:`razon_${i}` }, razones_dependientes:[], derivados:[], conjuntos:{}, cuentas:[], modo_periodo:{}, presentacion:{}, reglas_generales:{}
}) }));

describe('especificación generada', () => {
  it('coincide exactamente con los 20 JSON, incluido research', () => {
    const archivos = leerArchivos();
    expect(verificarSincronia(archivos, readFileSync(new URL('../../js/modules/razones/especificacion-razones.js', import.meta.url), 'utf8'))).toBe(true);
    for (const archivo of archivos) {
      const original = JSON.parse(archivo.contenido);
      expect(ESPECIFICACION_RAZONES[original.razon.id]).toEqual(original);
    }
  });
  it('detecta huella distinta con datos sintéticos', () => {
    const archivos = sinteticos();
    const anterior = generarContenido(archivos);
    archivos[0].contenido += '\n';
    expect(() => verificarSincronia(archivos, anterior)).toThrow('Caso 1: la huella no coincide');
  });
  it('detecta contenido editado aunque la huella coincida, sin tocar JSON reales', () => {
    const archivos = sinteticos();
    const editado = generarContenido(archivos).replace("'razon_0':", "'razon_editada':");
    expect(() => verificarSincronia(archivos, editado)).toThrow('Caso 2: la huella coincide pero el contenido no');
  });
  it('es determinista, ordena archivos y tolera CRLF sin huellas distintas', () => {
    const archivos = sinteticos();
    const una = generarContenido(archivos);
    expect(generarContenido([...archivos].reverse())).toBe(una);
    expect(generarContenido(archivos.map(a => ({ ...a, contenido:a.contenido.replace(/\n/g, '\r\n') })))).toBe(una);
    expect(verificarSincronia(archivos, una.replace(/\n/g, '\r\n'))).toBe(true);
  });
  it('rechaza número de archivos y esquema inválidos antes de generar', () => {
    expect(() => generarContenido([])).toThrow('20 JSON');
    const archivos = sinteticos();
    archivos[0].contenido = '{"schema_version":"1.0"}';
    expect(() => generarContenido(archivos)).toThrow('esquema 2.0');
  });
});
