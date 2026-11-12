// D-113: de qué caso vienen los datos de cada módulo de empresa (AGRI-CORP consolidado, su línea
// de arroz u otro ejemplo) y aviso cuando una pantalla mezcla casos distintos.
// El registro vive en store.casos: { [claveDelStore]: { caso, nombre, huella? } }.
// La huella resume la parte REAL del módulo al cargarlo. Si esa parte cambia (se edita una cifra,
// se importa otro archivo o se restaura un respaldo), el módulo deja de atribuirse al caso. Los
// supuestos S1–S16 quedan fuera de la huella: son editables y editarlos no cambia el origen.
import store from '../store.js';
import { escapeHTML as esc } from './html.js';

export const CLAVES_EMPRESA = ['estados', 'apalancamiento', 'razonesMercado', 'flujo', 'inventario', 'equilibrio', 'planeacion'];
export const CASOS_VALIDOS = ['agricorp-consolidado', 'agricorp-arroz', 'otro'];
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
// Campos con los datos del caso. Estados: los estados publicados (las ventas a crédito y los pagos
// a proveedores de S1–S3 viven en supplementaryAccounts y no cuentan). Flujo: los flujos
// publicados. Inventario: la composición por categoría (el kárdex es S16). Los demás módulos son
// supuestos o parámetros del caso: su registro basta.
const PARTE_REAL = {
  estados: ['periods', 'balanceGeneral', 'estadoResultados'],
  flujo: ['saldoInicial', 'periodoBase', 'movimientos', 'efectoConversion'],
  inventario: ['composicion']
};

const esObjeto = v => v !== null && typeof v === 'object' && !Array.isArray(v);

// JSON con las claves ordenadas: el mismo contenido da el mismo texto aunque cambie el orden.
function canonico(valor) {
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(',')}]`;
  if (esObjeto(valor)) {
    return `{${Object.keys(valor).sort().filter(k => valor[k] !== undefined)
      .map(k => `${JSON.stringify(k)}:${canonico(valor[k])}`).join(',')}}`;
  }
  return JSON.stringify(valor ?? null);
}

// FNV-1a de 32 bits en hexadecimal. Solo compara contenidos; no es una medida de seguridad.
function fnv1a(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// Huella de la parte real de un módulo, o null si el módulo no tiene parte real que vigilar.
export function huellaCaso(clave, modulo) {
  const campos = PARTE_REAL[clave];
  if (!campos) return null;
  return fnv1a(canonico(Object.fromEntries(campos.map(campo => [campo, modulo?.[campo] ?? null]))));
}

// Registro de un módulo recién cargado desde un caso: { caso, nombre } más la huella si aplica.
export function registroCaso(clave, caso, modulo) {
  const huella = huellaCaso(clave, modulo);
  return { caso: caso.caso, nombre: caso.nombre, ...(huella ? { huella } : {}) };
}

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

// Registra los módulos ya guardados en el store con el caso del que vienen ({ clave: { caso, nombre } }).
export function registrarCasos(asignaciones) {
  const registros = Object.fromEntries(Object.entries(asignaciones)
    .map(([clave, caso]) => [clave, registroCaso(clave, caso, store.get(clave))]));
  try {
    store.setPersisted('casos', { ...(store.get('casos') || {}), ...registros });
  } catch {
    // El registro es informativo: si no se puede guardar, los datos del módulo no cambian.
  }
}

// { clave, caso, nombre, vigente } o null si el módulo está vacío o no tiene registro.
// vigente = la parte real sigue igual que al cargar el caso. Un registro sin huella en un módulo
// con parte real no se puede comprobar y no cuenta como vigente.
export function estadoCaso(clave, datos) {
  const registro = datos?.casos?.[clave];
  if (!registro?.caso || !tieneDatos(clave, datos)) return null;
  const vigente = !PARTE_REAL[clave] || (Boolean(registro.huella) && registro.huella === huellaCaso(clave, datos[clave]));
  return { clave, caso: registro.caso, nombre: registro.nombre, vigente };
}

// Caso del módulo si sus datos siguen siendo los del caso; null si no.
export function casoVigente(datos, clave) {
  const estado = estadoCaso(clave, datos);
  return estado?.vigente ? estado.caso : null;
}

// Qué supuestos de AGRI-CORP consolidado alimentan las cifras de cada pantalla. Solo se etiquetan
// mientras el módulo que los guarda sigue siendo del caso. credito: S1–S3 (Estados, datos
// suplementarios); costos: S4–S6 (Apalancamiento); presupuesto: S8–S15; kardex: S16. El precio
// por acción (S7) lo rotula la nota de Razones de mercado.
export function supuestosActivos(datos) {
  const es = clave => casoVigente(datos, clave) === 'agricorp-consolidado';
  return { credito: es('estados'), costos: es('apalancamiento'), presupuesto: es('planeacion'), kardex: es('inventario') };
}

// { tipo: 'caso' | 'mezcla' | 'modificado', caso?, nombre?, detalle?, modificados? } o null si no hay nada que avisar.
export function avisoCaso(ruta, datos) {
  const claves = CLAVES_RUTA[ruta];
  if (!claves) return null;
  const registrados = claves.map(clave => estadoCaso(clave, datos)).filter(Boolean);
  if (!registrados.length) return null;
  const vigentes = registrados.filter(r => r.vigente);
  // Un módulo de «otro» ejemplo que se editó ya es del usuario: no se afirmaba nada de él.
  const modificados = registrados.filter(r => !r.vigente && r.caso !== 'otro')
    .map(r => ({ modulo: NOMBRE_MODULO[r.clave], nombre: r.nombre }));
  const referencia = vigentes.find(r => r.clave === 'estados') || vigentes[0];
  if (referencia) {
    const distintos = vigentes.filter(r => r.caso !== referencia.caso || (r.caso === 'otro' && r.nombre !== referencia.nombre));
    if (distintos.length) {
      return {
        tipo: 'mezcla', modificados,
        detalle: [referencia, ...distintos].map(r => ({ modulo: NOMBRE_MODULO[r.clave], nombre: r.nombre }))
      };
    }
  }
  if (modificados.length) return { tipo: 'modificado', detalle: modificados };
  return !referencia || referencia.caso === 'otro' ? null : { tipo: 'caso', caso: referencia.caso, nombre: referencia.nombre };
}

const textoModificados = lista => `${lista.map(d => `${esc(d.modulo)} ya no coincide con «${esc(d.nombre)}» tal como se cargó`).join('; ')}
  (se editó una cifra, se importó otro archivo o se restauró un respaldo), así que sus cifras no se atribuyen al caso.`;

export function bannerCaso(aviso) {
  if (!aviso) return '';
  const alerta = contenido => `<div class="card mb-4" role="alert" style="border-left:4px solid var(--color-warning)">${contenido}</div>`;
  if (aviso.tipo === 'mezcla') {
    const extra = aviso.modificados?.length ? ` Además, ${textoModificados(aviso.modificados)}` : '';
    return alerta(`<strong>Empresas mezcladas.</strong>
      Esta pantalla combina datos de casos distintos: ${aviso.detalle.map(d => `${esc(d.modulo)} tiene «${esc(d.nombre)}»`).join('; ')}.
      Las cifras que se cruzan entre módulos no son comparables.${extra} Cargue el mismo caso en todos o use <a href="#/home">Inicio</a> para cargar un caso completo.`);
  }
  if (aviso.tipo === 'modificado') {
    return alerta(`<strong>Datos modificados.</strong> ${textoModificados(aviso.detalle)}
      Para recuperar los datos del caso, cárguelo de nuevo desde <a href="#/home">Inicio</a>.`);
  }
  const texto = aviso.caso === 'agricorp-consolidado'
    ? 'Datos reales de los estados auditados 2022–2025 con supuestos declarados (S1–S16). <a href="#/home">Ver el mapa de supuestos</a>.'
    : 'Escenario simulado con datos inventados con fines docentes: no son cifras reales de AGRI-CORP.';
  return `<p class="form-hint mb-4" role="note"><span class="badge ${aviso.caso === 'agricorp-consolidado' ? 'badge-success' : 'badge-warning'}">${esc(aviso.nombre)}</span> ${texto}</p>`;
}

// Texto plano del aviso para el reporte exportado (sin enlaces: el archivo no abre la app).
export function textoProcedencia(aviso) {
  if (!aviso) return '';
  const lista = detalle => detalle.map(d => `${d.modulo} (${d.nombre})`).join(', ');
  if (aviso.tipo === 'mezcla') {
    const extra = aviso.modificados?.length ? ` Ya no coinciden con el caso que se cargó: ${lista(aviso.modificados)}.` : '';
    return `Empresas mezcladas: ${lista(aviso.detalle)}. Las cifras que se cruzan entre módulos no son comparables.${extra}`;
  }
  if (aviso.tipo === 'modificado') {
    return `Datos modificados: ${lista(aviso.detalle)} ya no coinciden con el caso tal como se cargó; sus cifras no se atribuyen al caso.`;
  }
  return aviso.caso === 'agricorp-consolidado'
    ? `${aviso.nombre}: datos reales de los estados auditados 2022–2025 con supuestos declarados (S1–S16). Las cifras que dependen de un supuesto lo indican con «SUPUESTO».`
    : `${aviso.nombre}: escenario simulado con datos inventados con fines docentes; no son cifras reales de AGRI-CORP.`;
}

// Etiqueta visible de una cifra que depende de un supuesto. ids: texto como 'S4–S6'.
export function etiquetaSupuesto(ids, titulo = '') {
  const ayuda = titulo ? ` title="${esc(titulo)}"` : '';
  return `<span class="badge badge-warning"${ayuda}>SUPUESTO ${esc(ids)}</span>`;
}

// Respaldo JSON: valida el registro de casos importado. Solo admite claves de empresa; las demás
// se informan como omitidas. Lanza un Error si un registro no tiene la forma esperada.
export function validarRegistroCasos(valor, omitidos = []) {
  if (!esObjeto(valor)) throw new Error('El registro de casos del respaldo debe ser un objeto. No se importó nada.');
  const resultado = {};
  for (const [clave, registro] of Object.entries(valor)) {
    if (!CLAVES_EMPRESA.includes(clave)) { omitidos.push(`casos.${clave}`); continue; }
    const valido = esObjeto(registro) && CASOS_VALIDOS.includes(registro.caso)
      && typeof registro.nombre === 'string' && registro.nombre.length > 0 && registro.nombre.length <= 120
      && (registro.huella === undefined || /^[0-9a-f]{8}$/.test(registro.huella));
    if (!valido) throw new Error(`El registro de casos del respaldo no es válido en casos.${clave}. No se importó nada.`);
    resultado[clave] = { caso: registro.caso, nombre: registro.nombre, ...(registro.huella ? { huella: registro.huella } : {}) };
  }
  return resultado;
}
