import { DOCUMENTOS_DEFENSA } from './datos-personales-defensa.js';
import { inventarioDocumentoPersonal } from '../modules/personales/personales-calculations.js';

export function ejemplosPersonalesDefensa(modulo) {
  const prefijo=modulo==='presupuestoEstudiantil'?'presupuesto-':modulo==='activos'?'activos-':null;
  return prefijo ? DOCUMENTOS_DEFENSA.filter(d=>d.id.startsWith(prefijo)).map(d=>({id:d.id,nombre:d.nombre,grupo:'Integrantes · defensa',fuente:d.archivo,detalle:'Archivo del integrante. Conserva sus secciones, columnas, orden y reglas de cálculo.'})) : [];
}
export function ejemploPersonalDefensa(id) {
  const documento=DOCUMENTOS_DEFENSA.find(d=>d.id===id);
  if (!documento) throw new Error('No existe el archivo del integrante seleccionado.');
  const d=structuredClone(documento);
  return id.startsWith('presupuesto-')?{version:2,documento:d}:{documento:d,inventario:inventarioDocumentoPersonal(d)};
}
