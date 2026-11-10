import { ahorroMensual, saldoSemanal, tasaAhorro } from '../../utils/calculate.js';

export const TIPOS_MOVIMIENTO = ['Ingreso', 'Gasto', 'Ahorro', 'Reserva'];
export const CATEGORIAS_ESTUDIANTE = ['Apoyo familiar', 'Ingreso extra', 'Transporte', 'Alimentación', 'Datos/Internet', 'Copias y materiales', 'Salud', 'Personal/Ocio', 'Reserva imprevistos', 'Meta de ahorro', 'Otro'];
export const PRIORIDADES = ['Necesidad', 'Deseo', 'Meta'];
export const MEDIOS = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'];
export const CATEGORIAS_PLAN = ['Transporte', 'Alimentación', 'Datos/Internet', 'Copias y materiales', 'Salud', 'Personal/Ocio', 'Reserva imprevistos', 'Meta de ahorro', 'Otro'];
export const TIPOS_PLAN = ['Necesidad', 'Deseo', 'Reserva', 'Ahorro', 'Según el caso'];
const SEMANAS_POR_BLOQUE = 4; // La plantilla agrupa su seguimiento y el ejemplo mensual en cuatro semanas.
const DIA = 86400000;
const numero = v => typeof v === 'number' && Number.isFinite(v);
const objeto = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const importe = (v, nombre, opcional = false) => {
  if (opcional && v === null) return v;
  if (!numero(v) || v < 0) throw new Error(`${nombre}: indique un monto positivo o cero.`);
  return v;
};
const texto = (v, nombre, max = 120) => {
  if (typeof v !== 'string' || v.length > max) throw new Error(`${nombre}: texto inválido (máximo ${max} caracteres).`);
  return v;
};

function fechaUTC(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
  const t = Date.parse(`${fecha}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === fecha ? t : null;
}

export function desplazarFecha(fecha, dias) {
  const t = fechaUTC(fecha);
  if (t === null || !Number.isInteger(dias)) return null;
  return new Date(t + dias * DIA).toISOString().slice(0, 10);
}

export function semanaDeFecha(fecha, inicio, duracion) {
  const t = fechaUTC(fecha), origen = fechaUTC(inicio);
  if (t === null || origen === null || !Number.isInteger(duracion) || duracion < 1) return null;
  const semana = Math.floor((t - origen) / (7 * DIA)) + 1;
  return semana >= 1 && semana <= duracion ? semana : null;
}

export function nuevoPresupuestoEstudiantil() {
  const plan = () => ({ frecuencia:'Mensual', ingreso:null, partidas:CATEGORIAS_PLAN.map(categoria => ({ categoria, monto:null,
    tipo:categoria === 'Meta de ahorro' ? 'Ahorro' : categoria === 'Reserva imprevistos' ? 'Reserva' : categoria === 'Personal/Ocio' ? 'Deseo' : categoria === 'Otro' ? 'Según el caso' : 'Necesidad', comentario:'' })) });
  return { version:1, meta:{ nombre:'', descripcion:'', costo:null, semanas:20, inicio:null }, movimientos:[],
    proyecciones:{ real:plan(), deseada:plan() } };
}

// Normaliza un documento completo antes de escribirlo; no cambia el objeto recibido.
export function normalizarEstudiantil(d) {
  if (!objeto(d) || d.version !== 1 || !objeto(d.meta) || !objeto(d.proyecciones) || !Array.isArray(d.movimientos)) throw new Error('El presupuesto estudiantil no tiene una estructura válida.');
  const meta = { nombre:texto(d.meta.nombre, 'Nombre'), descripcion:texto(d.meta.descripcion, 'Meta', 240), costo:importe(d.meta.costo, 'Costo de la meta', true), semanas:d.meta.semanas, inicio:d.meta.inicio };
  if (!Number.isInteger(meta.semanas) || meta.semanas < 1 || meta.semanas > 52) throw new Error('La duración debe ser de 1 a 52 semanas.');
  if (meta.inicio !== null && (fechaUTC(meta.inicio) === null || new Date(`${meta.inicio}T00:00:00Z`).getUTCDay() !== 1)) throw new Error('El inicio del seguimiento debe ser una fecha válida de lunes.');
  if (d.movimientos.length > 5000) throw new Error('El registro admite hasta 5000 movimientos.');
  const ids = new Set();
  const movimientos = d.movimientos.map(m => {
    if (!objeto(m) || !TIPOS_MOVIMIENTO.includes(m.tipo) || !CATEGORIAS_ESTUDIANTE.includes(m.categoria) || !PRIORIDADES.includes(m.prioridad) || !MEDIOS.includes(m.medio)) throw new Error('Revise el tipo, categoría, prioridad y medio del movimiento.');
    if (typeof m.id !== 'string' || !m.id || m.id.length > 100 || ids.has(m.id)) throw new Error('Identificador de movimiento inválido o repetido.');
    ids.add(m.id);
    if (semanaDeFecha(m.fecha, meta.inicio, meta.semanas) === null) throw new Error('La fecha del movimiento debe pertenecer al seguimiento. Revise el lunes inicial y la duración.');
    return { id:m.id, fecha:m.fecha, tipo:m.tipo, categoria:m.categoria, descripcion:texto(m.descripcion, 'Descripción', 240), monto:importe(m.monto, 'Monto'), prioridad:m.prioridad, medio:m.medio, observacion:texto(m.observacion, 'Observación', 500) };
  });
  const proyecciones = {};
  for (const id of ['real', 'deseada']) {
    const p = d.proyecciones[id];
    if (!objeto(p) || !['Mensual', 'Semanal'].includes(p.frecuencia) || !Array.isArray(p.partidas) || p.partidas.length < 1 || p.partidas.length > 100) throw new Error('Proyección inválida. Revise su frecuencia y partidas.');
    if (p.partidas.length !== CATEGORIAS_PLAN.length || CATEGORIAS_PLAN.some((categoria, i) => p.partidas[i]?.categoria !== categoria)) throw new Error('Conserve las nueve categorías y el orden de la plantilla estudiantil.');
    proyecciones[id] = { frecuencia:p.frecuencia, ingreso:importe(p.ingreso, 'Ingreso proyectado', true), partidas:p.partidas.map(f => {
      if (!objeto(f) || !TIPOS_PLAN.includes(f.tipo)) throw new Error('Clasifique cada partida proyectada.');
      return { categoria:texto(f.categoria, 'Categoría'), monto:importe(f.monto, 'Monto planificado', true), tipo:f.tipo, comentario:texto(f.comentario, 'Comentario', 240) };
    }) };
  }
  return { version:1, meta, movimientos, proyecciones };
}

function sumar(valores) {
  if (valores.some(v => !numero(v))) return null;
  const suma = valores.reduce((s, v) => s + v, 0);
  return numero(suma) ? suma : null;
}

// D-112: evita que la representación binaria cree un saldo negativo ficticio.
// Cota relativa a los operandos y operaciones, siempre menor de medio centavo.
// No redondea importes guardados ni borra diferencias de un centavo.
function ajustarResiduoBinario(resultado, operandos) {
  if (!numero(resultado)) return null;
  const escala = operandos.reduce((s, v) => s + Math.abs(v), 0);
  const cota = Number.EPSILON * escala * (operandos.length + 2);
  return Math.abs(resultado) <= cota && Math.abs(resultado) < 0.005 ? 0 : resultado;
}

export function calcularProyeccion(plan) {
  const total = sumar(plan.partidas.map(p => p.monto));
  // En el libro E8 apunta a B19 (Meta de ahorro): el tipo es descriptivo.
  const porCategoria = categoria => sumar(plan.partidas.filter(p => p.categoria === categoria).map(p => p.monto));
  const ahorro = porCategoria('Meta de ahorro'), reserva = porCategoria('Reserva imprevistos');
  const diferencia = ajustarResiduoBinario(saldoSemanal(plan.ingreso, total, 0, 0), [plan.ingreso, ...plan.partidas.map(p => p.monto)]);
  const libre = ajustarResiduoBinario(saldoSemanal(plan.ingreso, 0, ahorro, reserva), [plan.ingreso, ahorro, reserva]);
  return { total, ahorro, reserva, diferencia, porcentaje:total === null ? null : tasaAhorro(total, plan.ingreso),
    estado:diferencia === null ? 'Datos pendientes' : diferencia === 0 ? 'Balanceado' : diferencia > 0 ? 'Falta asignar' : 'Excede ingreso',
    limiteSemanal:libre === null ? null : libre / (plan.frecuencia === 'Mensual' ? SEMANAS_POR_BLOQUE : 1),
    partidas:plan.partidas.map(p => ({ ...p, porcentaje:p.monto === null ? null : tasaAhorro(p.monto, plan.ingreso) })) };
}

export function calcularSeguimiento(datos) {
  const d = normalizarEstudiantil(datos), m = d.meta;
  let acumulado = 0;
  const semanas = Array.from({ length:m.semanas }, (_, i) => {
    const numeroSemana = i + 1, filas = d.movimientos.filter(f => semanaDeFecha(f.fecha, m.inicio, m.semanas) === numeroSemana);
    const total = tipo => sumar(filas.filter(f => f.tipo === tipo).map(f => f.monto));
    const ingreso = total('Ingreso'), gasto = total('Gasto'), ahorro = total('Ahorro'), reserva = total('Reserva');
    acumulado = sumar([acumulado, ahorro]);
    return { semana:numeroSemana, bloque:Math.ceil(numeroSemana / SEMANAS_POR_BLOQUE), desde:desplazarFecha(m.inicio, i * 7), hasta:desplazarFecha(m.inicio, i * 7 + 6),
      ingreso, gasto, ahorro, reserva, saldo:ajustarResiduoBinario(saldoSemanal(ingreso, gasto, ahorro, reserva), filas.map(f => f.monto)), acumulado, avance:tasaAhorro(acumulado, m.costo), movimientos:filas.length };
  });
  const total = campo => sumar(semanas.map(s => s[campo]));
  const ahorro = total('ahorro');
  return { semanas, ingreso:total('ingreso'), gasto:total('gasto'), ahorro, reserva:total('reserva'), saldo:ajustarResiduoBinario(total('saldo'), semanas.map(s => s.saldo)), avance:tasaAhorro(ahorro, m.costo),
    aporteRecomendado:ahorroMensual(m.costo, m.semanas), final:desplazarFecha(m.inicio, m.semanas * 7 - 1) };
}

export function resumenEstudiantilGuardado(presupuesto) {
  if (!presupuesto?.estudiantil || presupuesto.vista === 'mensual') return null;
  try {
    const d = normalizarEstudiantil(presupuesto.estudiantil), r = calcularSeguimiento(d);
    return { estudiantil:true, ingresos:r.ingreso, gastos:r.gasto, ahorro:r.ahorro, reserva:r.reserva, saldo:r.saldo, avance:r.avance,
      metaAhorro:d.meta.costo, semanas:d.meta.semanas, desde:d.meta.inicio, hasta:r.final };
  } catch (error) {
    return { estudiantil:true, ingresos:null, gastos:null, metaAhorro:null, error:error.message };
  }
}
