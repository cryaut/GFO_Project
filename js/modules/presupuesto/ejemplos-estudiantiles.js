import { nuevoPresupuestoEstudiantil, normalizarEstudiantil } from './presupuesto-calculations.js';
import { MOVIMIENTOS_DOCENTES } from './ejemplo-estudiantil.js';

export function ejemploEstudiantil() {
  const d = nuevoPresupuestoEstudiantil();
  d.meta = { nombre:'', descripcion:'Curso, herramienta, equipo o pequeño emprendimiento', costo:2000, semanas:20, inicio:'2026-08-03' };
  d.movimientos = structuredClone(MOVIMIENTOS_DOCENTES);
  d.proyecciones.real.ingreso = 2400;
  const montos = [700, 500, 200, 100, 0, 250, 250, 400, 0];
  d.proyecciones.real.partidas.forEach((p, i) => { p.monto = montos[i]; });
  return normalizarEstudiantil(d);
}

export function ejemploSoloTransporte() {
  const d = ejemploEstudiantil();
  d.movimientos = [
    { id:'transporte-ingreso', fecha:'2026-08-03', tipo:'Ingreso', categoria:'Apoyo familiar', descripcion:'Apoyo semanal solo para transporte', monto:175, prioridad:'Necesidad', medio:'Efectivo', observacion:'Ejemplo sintético' },
    { id:'transporte-gasto', fecha:'2026-08-04', tipo:'Gasto', categoria:'Transporte', descripcion:'Transporte de la semana', monto:175, prioridad:'Necesidad', medio:'Efectivo', observacion:'' }
  ];
  d.proyecciones.real.ingreso = 175;
  d.proyecciones.real.frecuencia = 'Semanal';
  d.proyecciones.real.partidas.forEach((p, i) => { p.monto = i === 0 ? 175 : 0; });
  return d;
}
