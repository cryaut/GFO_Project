// D-113: de qué caso vienen los datos de cada módulo de empresa (AGRI-CORP consolidado, su línea
// de arroz u otro ejemplo) y aviso cuando una pantalla mezcla casos distintos.
// El registro vive en store.casos: { [claveDelStore]: { caso, nombre } }.
import store from '../store.js';
import { escapeHTML as esc } from './html.js';

export const CLAVES_EMPRESA = ['estados', 'apalancamiento', 'razonesMercado', 'flujo', 'inventario', 'equilibrio', 'planeacion'];
const NOMBRE_MODULO = {
  estados: 'Estados', apalancamiento: 'Apalancamiento', razonesMercado: 'Razones de mercado', flujo: 'Flujo de efectivo',
  inventario: 'Inventario', equilibrio: 'Punto de equilibrio', planeacion: 'Presupuesto maestro'
};
// Módulos cuyos datos usa cada pantalla.
export const CLAVES_RUTA = {
  estados: ['estados'], analisis: ['estados', 'razonesMercado'], apalancamiento: ['estados', 'apalancamiento'],
  equilibrio: ['estados', 'apalancamiento', 'equilibrio'], flujo: ['estados', 'flujo'], planeacion: ['estados', 'planeacion'],
  inventario: ['estados', 'inventario'], proforma: CLAVES_EMPRESA, reportes: CLAVES_EMPRESA
};

// Un módulo vacío no pertenece a ningún caso, aunque conserve su registro.
export function tieneDatos(clave, datos) {
  const d = datos?.[clave];
  if (!d) return false;
  if (clave === 'estados') return Array.isArray(d.periods) && d.periods.length > 0;
  if (clave === 'flujo') return (d.movimientos?.length ?? 0) > 0;
  if (clave === 'inventario') return (d.productos?.length ?? 0) > 0;
  if (clave === 'equilibrio') return d.origen === 'estados' || d.precio != null;
  if (clave === 'planeacion') return Boolean(d.supuestos || d.escenarios?.length);
  if (clave === 'razonesMercado') return Object.keys(d.periodos || {}).length > 0;
  if (clave === 'apalancamiento') return Object.keys(d.comportamiento || {}).length > 0 || Object.keys(d.dap || {}).length > 0;
  return false;
}

export function registrarCasos(asignaciones) {
  try {
    store.setPersisted('casos', { ...(store.get('casos') || {}), ...asignaciones });
  } catch {
    // El registro es informativo: si no se puede guardar, los datos del módulo no cambian.
  }
}

// { tipo: 'caso' | 'mezcla', caso?, nombre?, detalle? } o null si no hay nada que avisar.
export function avisoCaso(ruta, datos) {
  const claves = CLAVES_RUTA[ruta];
  if (!claves) return null;
  const casos = datos?.casos || {};
  const registrados = claves.filter(c => tieneDatos(c, datos) && casos[c]?.caso).map(c => ({ clave: c, ...casos[c] }));
  if (!registrados.length) return null;
  const referencia = registrados.find(r => r.clave === 'estados') || registrados[0];
  const distintos = registrados.filter(r => r.caso !== referencia.caso || (r.caso === 'otro' && r.nombre !== referencia.nombre));
  if (distintos.length) {
    return { tipo: 'mezcla', detalle: [referencia, ...distintos].map(r => ({ modulo: NOMBRE_MODULO[r.clave], nombre: r.nombre })) };
  }
  return referencia.caso === 'otro' ? null : { tipo: 'caso', caso: referencia.caso, nombre: referencia.nombre };
}

export function bannerCaso(aviso) {
  if (!aviso) return '';
  if (aviso.tipo === 'mezcla') {
    return `<div class="card mb-4" role="alert" style="border-left:4px solid var(--color-warning)"><strong>Empresas mezcladas.</strong>
      Esta pantalla combina datos de casos distintos: ${aviso.detalle.map(d => `${esc(d.modulo)} tiene «${esc(d.nombre)}»`).join('; ')}.
      Las cifras que se cruzan entre módulos no son comparables. Cargue el mismo caso en todos o use <a href="#/home">Inicio</a> para cargar un caso completo.</div>`;
  }
  const texto = aviso.caso === 'agricorp-consolidado'
    ? 'Datos reales de los estados auditados 2022–2025 con supuestos declarados. <a href="#/home">Ver el mapa de supuestos</a>.'
    : 'Escenario simulado con datos inventados con fines docentes: no son cifras reales de AGRI-CORP.';
  return `<p class="form-hint mb-4" role="note"><span class="badge ${aviso.caso === 'agricorp-consolidado' ? 'badge-success' : 'badge-warning'}">${esc(aviso.nombre)}</span> ${texto}</p>`;
}
