import { inventarioDocumentoPersonal } from '../modules/personales/personales-calculations.js';

// Índice liviano para el selector. Los documentos (1,8 MB) se importan solo al cargar uno de estos
// ejemplos, para no descargarlos al abrir la app. Debe coincidir con datos-personales-defensa.js (lo comprueba un test).
export const INDICE_DEFENSA = [
  { id:'presupuesto-cris', nombre:'Cris Angel Lumbí Rodríguez', archivo:'GFO_Presupuesto_estudiantil_Cris_Angel (1).xlsx' },
  { id:'presupuesto-carlos', nombre:'Carlos Castillo', archivo:'Presupuesto_estudiantil_Carlos_Castillo_Ago-Oct_2026.xlsx' },
  { id:'presupuesto-juan', nombre:'Juan Pablo Sirias Espinoza', archivo:'Presupuesto_personal_octubre_corregido.xlsx' },
  { id:'presupuesto-gabriel', nombre:'Gabriel Eduardo Segovia Fonseca', archivo:'Presupuesto_Trimestre_Gabi.xlsx' },
  { id:'presupuesto-henry', nombre:'Henry David Lopez Sanchez', archivo:'Presupuesto-Estudiantil-Henry-Sanchez-Octubre-The-Last.xlsx' },
  { id:'activos-carlos', nombre:'Carlos Castillo López', archivo:'Analisis_Activos_Hogar_Carlos_Castillo.xlsx' },
  { id:'activos-juan', nombre:'Juan Pablo Sirias Espinoza', archivo:'Analisis_Activos_Hogar_Gestion_Financiera_JuanSirias (1).xlsx' },
  { id:'activos-cris', nombre:'Cris Angel Lumbí Rodríguez', archivo:'Guia Activos_Cris_Angel_Lumbi_Rodriguez_corregido.xlsx' },
  { id:'activos-henry', nombre:'Henry David Lopez Sanchez', archivo:'Inventario_Activos_HenryDavidLopezSanchez.xlsx' },
  { id:'activos-gabriel', nombre:'Gabriel Eduardo Segovia Fonseca', archivo:'Levantamiento_Inventario_Activos_Hogar.docx' }
];

let documentos = null;

export const esEjemploPersonalDefensa = (modulo, id) => ['presupuestoEstudiantil','activos'].includes(modulo) && INDICE_DEFENSA.some(d => d.id === id);

// Debe esperarse antes de crear uno de estos ejemplos.
export async function cargarDocumentosDefensa() {
  documentos ??= (await import('./datos-personales-defensa.js')).DOCUMENTOS_DEFENSA;
  return documentos;
}

export function ejemplosPersonalesDefensa(modulo) {
  const prefijo=modulo==='presupuestoEstudiantil'?'presupuesto-':modulo==='activos'?'activos-':null;
  return prefijo ? INDICE_DEFENSA.filter(d=>d.id.startsWith(prefijo)).map(d=>({id:d.id,nombre:d.nombre,grupo:'Integrantes · defensa',fuente:d.archivo,detalle:'Archivo del integrante. Conserva sus secciones, columnas, orden y reglas de cálculo.'})) : [];
}
export function ejemploPersonalDefensa(id) {
  if (!documentos) throw new Error('Los archivos de los integrantes todavía no se cargaron. Intente de nuevo.');
  const documento=documentos.find(d=>d.id===id);
  if (!documento) throw new Error('No existe el archivo del integrante seleccionado.');
  const d=structuredClone(documento);
  return id.startsWith('presupuesto-')?{version:2,documento:d}:{documento:d,inventario:inventarioDocumentoPersonal(d)};
}
