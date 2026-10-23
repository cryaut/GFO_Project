import { ESPECIFICACION_RAZONES } from './especificacion-razones.js';
import { CUENTAS_CATALOGO } from '../estados/cuentas-catalogo.js';

const numero = valor => typeof valor === 'number' && Number.isFinite(valor);
const catalogo = new Map(CUENTAS_CATALOGO.map(c => [c.id, c]));
const OPERACIONES = new Set(['account', 'derived', 'ratio', 'constant', 'sum_accounts', 'add', 'subtract', 'multiply', 'divide', 'average', 'reported_or_calculate']);
const valido = (valor, motivos = []) => ({ valor, motivos });
const nd = (codigo, detalles = {}) => valido(null, [{ codigo, ...detalles }]);
const unicos = motivos => [...new Map(motivos.map(m => [JSON.stringify(m), m])).values()];

// Adaptación estructural: las claves de filas solo enlazan sus metadatos; no
// se identifica ninguna cuenta por un nombre financiero ni se calcula un total.
export function crearEntradaRazones(datos, periodo, opciones = {}) {
  const indice = datos.periods?.indexOf(periodo) ?? -1;
  if (indice < 0) throw new Error(`Periodo inexistente: ${periodo}`);
  const anterior = indice > 0 ? datos.periods[indice - 1] : null;
  const cuentas = [];
  const grupos = new Set(['activos', 'pasivos', 'patrimonio', 'estadoResultados', 'suplementario', ...Object.keys(datos.accountIdentities || {})]);
  for (const grupo of grupos) {
    const identidades = datos.accountIdentities?.[grupo] || {};
    const valoresPeriodo = p => grupo === 'estadoResultados' ? datos.estadoResultados?.[p]
      : grupo === 'suplementario' ? datos.supplementaryAccounts?.[p] : datos.balanceGeneral?.[p]?.[grupo];
    const claves = new Set([...Object.keys(identidades), ...Object.keys(valoresPeriodo(periodo) || {}), ...Object.keys(valoresPeriodo(anterior) || {})]);
    for (const clave of claves) {
      const identidad = identidades[clave] || { idCuenta:null, estado:'no_reconocida', origen:'legado', candidatos:[] };
      const fila = { id:identidad.idCuenta, estado:identidad.estado, origen:identidad.origen,
        grupo, tipoApp:datos.accountTypes?.[grupo]?.[clave], candidatos:identidad.candidatos || [] };
      for (const [token, p] of [['current', periodo], ['previous', anterior]]) {
        if (p === null) continue;
        const valores = grupo === 'estadoResultados' ? datos.estadoResultados?.[p]
          : grupo === 'suplementario' ? datos.supplementaryAccounts?.[p] : datos.balanceGeneral?.[p]?.[grupo];
        if (valores && Object.hasOwn(valores, clave)) fila[token] = valores[clave];
        const total = datos.reportedTotals?.[p]?.[identidad.idCuenta];
        if (total) fila[token] = total.importe;
      }
      if (Object.hasOwn(fila, 'current') || Object.hasOwn(fila, 'previous')) cuentas.push(fila);
    }
  }
  // Un total tiene id explícito en reportedTotals aunque falte su metadato
  // por fila; nunca se reconstruye su identidad desde el nombre presentado.
  const idsReportados = new Set([periodo,anterior].filter(Boolean).flatMap(p => Object.keys(datos.reportedTotals?.[p] || {})));
  for (const id of idsReportados) {
    if (cuentas.some(c => c.id === id)) continue;
    const fila = { id, estado:catalogo.has(id) ? 'reconocida' : 'no_reconocida', origen:'legado', grupo:catalogo.get(id)?.grupo, candidatos:[] };
    for (const [token,p] of [['current',periodo],['previous',anterior]]) {
      if (p !== null && Object.hasOwn(datos.reportedTotals?.[p] || {}, id)) fila[token] = datos.reportedTotals[p][id].importe;
    }
    cuentas.push(fila);
  }
  for (const pendiente of datos.pendingAccounts || []) {
    const fila = { id:null, estado:pendiente.identificacion?.estado || 'no_reconocida',
      origen:pendiente.identificacion?.origen, candidatos:pendiente.identificacion?.candidatos || [] };
    for (const [token,p] of [['current',periodo],['previous',anterior]]) {
      if (p !== null && Object.hasOwn(pendiente.importes, p)) fila[token] = pendiente.importes[p];
    }
    cuentas.push(fila);
  }
  return { cuentas, periodos:{ actual:periodo, anterior, cantidad:datos.periods.length, indice },
    composicionIngresos:opciones.composicionIngresos || {} };
}

export function revisarEntradaRazones(entrada) {
  return entrada.cuentas.filter(c => c.estado !== 'reconocida' || !catalogo.has(c.id))
    .map(c => ({ id:c.id, estado:c.estado, origen:c.origen, candidatos:c.candidatos || [], revisar:true }));
}

function contexto(entrada, opciones, especificacion, id) {
  if (!Array.isArray(entrada.cuentas) || !entrada.periodos) throw new Error('Se requieren cuentas normalizadas y contexto de periodos.');
  const documentos = new Map();
  const visitando = new Set();
  const terminados = new Set();
  function visitar(razonId) {
    if (visitando.has(razonId)) throw new Error(`${razonId}.json: $.razones_dependientes: ciclo de razones.`);
    if (terminados.has(razonId)) return;
    const doc = especificacion[razonId];
    if (!doc) throw new Error(`${razonId}.json: $.razones_dependientes: razón desconocida.`);
    documentos.set(razonId, doc);
    visitando.add(razonId);
    const declaradas = new Set(doc.razones_dependientes.map(d => d.id));
    function inspeccionar(nodo, ruta) {
      if (!nodo || typeof nodo !== 'object' || !OPERACIONES.has(nodo.op)) throw new Error(`${razonId}.json: ${ruta}: operación desconocida ${nodo?.op}.`);
      if (nodo.op === 'ratio' && !declaradas.has(nodo.id)) throw new Error(`${razonId}.json: ${ruta}: dependencia no declarada ${nodo.id}.`);
      if (nodo.op === 'constant' && !numero(nodo.value)) throw new Error(`${razonId}.json: ${ruta}.value: constante no finita.`);
      if (nodo.period !== undefined && !['current', 'previous'].includes(nodo.period)) throw new Error(`${razonId}.json: ${ruta}.period: periodo desconocido ${nodo.period}.`);
      for (const [k,v] of Object.entries(nodo)) {
        if (Array.isArray(v)) v.forEach((h,i) => inspeccionar(h, `${ruta}.${k}[${i}]`));
        else if (v && typeof v === 'object') inspeccionar(v, `${ruta}.${k}`);
      }
    }
    inspeccionar(doc.razon.formula, '$.razon.formula');
    doc.derivados.forEach((d,i) => inspeccionar(d.formula, `$.derivados[${i}].formula`));
    for (const dependencia of doc.razones_dependientes) visitar(dependencia.id);
    visitando.delete(razonId);
    terminados.add(razonId);
  }
  visitar(id);
  const cuentas = new Map();
  for (const doc of documentos.values()) for (const cuenta of doc.cuentas) cuentas.set(cuenta.id, cuenta);
  const controlId = 'mostrar_calculo_directo_primer_periodo';
  const control = opciones[controlId] ?? false;
  if (typeof control !== 'boolean') throw new Error(`${controlId} debe ser booleano.`);
  const ctx = { entrada, documentos, cuentas, control, memo:new Map(), resolviendo:new Set(), agregados:new Map() };
  // Una cuenta pendiente que pudiera ser un subtotal afecta también a las
  // cuentas que alimentan ese subtotal. El alcance sale de los árboles JSON.
  ctx.influencias = new Map();
  for (const doc of documentos.values()) {
    const derivados = new Map(doc.derivados.map(d => [d.id,d.formula]));
    function ids(nodo, vistos = new Set()) {
      if (nodo.op === 'account') return [nodo.id];
      if (nodo.op === 'sum_accounts') return doc.conjuntos[nodo.account_set] || [];
      if (nodo.op === 'derived') {
        if (vistos.has(nodo.id)) return [];
        return derivados.has(nodo.id) ? ids(derivados.get(nodo.id), new Set([...vistos,nodo.id])) : [];
      }
      const hijos = Object.values(nodo).flatMap(v => Array.isArray(v) ? v : v && typeof v === 'object' ? [v] : []);
      const resultado = hijos.flatMap(n => ids(n, vistos));
      if (nodo.op === 'reported_or_calculate') {
        const miembros = ids(nodo.calculation, vistos);
        ctx.influencias.set(nodo.reported, new Set([...(ctx.influencias.get(nodo.reported) || []), nodo.reported, ...miembros]));
        resultado.push(nodo.reported);
      }
      return resultado;
    }
    ctx.campos ??= new Map();
    for (const d of doc.derivados) ctx.campos.set(d.id, new Set([...(ctx.campos.get(d.id) || []), ...ids(d.formula)]));
    ids(doc.razon.formula);
  }
  return ctx;
}

function posibles(fila, ctx) {
  const candidatas = (fila.candidatos || []).map(c => typeof c === 'string' ? c : c.id).filter(id => catalogo.has(id));
  if (candidatas.length) {
    const alcance = new Set();
    function incluir(id) {
      if (alcance.has(id)) return;
      alcance.add(id);
      for (const miembro of ctx.influencias.get(id) || []) alcance.add(miembro);
      const padre = catalogo.get(id)?.agrupadoEn;
      if (padre) incluir(padre);
    }
    candidatas.forEach(incluir);
    return alcance;
  }
  const grupo = CUENTAS_CATALOGO.some(c => c.grupo === fila.grupo) ? fila.grupo : null;
  const restringidas = CUENTAS_CATALOGO.filter(cuenta => {
    return (!grupo || cuenta?.grupo === grupo)
      && (!fila.tipoApp || cuenta?.tipoApp === fila.tipoApp)
      && (!fila.clasificacion || cuenta?.clasificacion === fila.clasificacion);
  });
  const alcance = restringidas.length ? restringidas : CUENTAS_CATALOGO.filter(c => !grupo || c.grupo === grupo);
  return new Set(alcance.map(c => c.id));
}

function leerBase(id, periodo, ctx) {
  if (periodo === 'previous' && ctx.entrada.periodos.anterior === null) return nd('missing_required_period_balance', { id, periodo });
  const cuenta = ctx.cuentas.get(id);
  const meta = catalogo.get(id);
  if (!cuenta && !meta) return nd('unrecognized_imported_account', { id, periodo });
  const pendientes = ctx.entrada.cuentas.filter(c => (c.estado !== 'reconocida' || !catalogo.has(c.id))
    && Object.hasOwn(c, periodo) && c[periodo] !== 0 && posibles(c, ctx).has(id));
  if (pendientes.length) return valido(null, pendientes.map(c => {
    const alcance = posibles(c, ctx);
    return { codigo:c.estado === 'sugerida' ? 'ambiguous_account_match' : 'unrecognized_imported_account', id, periodo,
      camposAfectados:[...ctx.campos].filter(([,miembros]) => [...miembros].some(m => alcance.has(m))).map(([campo]) => campo) };
  }));
  const filas = ctx.entrada.cuentas.filter(c => c.estado === 'reconocida' && c.id === id && Object.hasOwn(c, periodo));
  if (filas.length) {
    if (filas.some(c => !numero(c[periodo]))) return nd('missing_required_account_data', { id, periodo });
    if ((cuenta?.account_role || meta?.rol) === 'reported_total' && filas.length !== 1) return nd('overlapping_account_aggregation', { id, periodo });
    const suma = filas.reduce((s,c) => s + c[periodo], 0);
    return numero(suma) ? valido(suma) : nd('missing_required_account_data', { id, periodo });
  }
  const politica = cuenta?.absence_policy || meta?.politicaAusencia;
  return politica === 'zero_if_not_reported' ? valido(0) : nd('missing_required_account_data', { id, periodo });
}

function leerCuenta(id, periodo, ctx) {
  const fuentes = CUENTAS_CATALOGO.filter(c => c.agrupadoEn === id);
  if (!fuentes.length) return leerBase(id, periodo, ctx);
  const clave = `${id}:${periodo}`;
  if (ctx.agregados.has(clave)) return ctx.agregados.get(clave);
  const filas = ctx.entrada.cuentas.filter(c => c.estado === 'reconocida' && c.id === id && Object.hasOwn(c, periodo));
  const composicion = ctx.entrada.composicionIngresos?.[periodo];
  if (filas.length && composicion === 'incluye_intereses') throw new Error(`${id}: entrada inválida; otros ingresos ya incluye intereses (D-051 opción A).`);
  if (filas.some(c => numero(c[periodo]))) {
    if (composicion !== 'excluye_intereses') throw new Error(`${id}: falta declarar composición excluye_intereses para ${periodo}; no se infiere de nombres ni importes.`);
  }
  // D-051: formación trazable del agregado de entrada, sin alterar el árbol
  // financiero que consume ese agregado. Cada fila participa una sola vez.
  const componentes = [id, ...fuentes.map(c => c.id)].map(cuenta => ({ id:cuenta, ...leerBase(cuenta, periodo, ctx) }));
  const resultado = combinar(componentes, valores => valores.reduce((s,v) => s+v, 0));
  resultado.traza = componentes.map(c => ({ id:c.id, valor:c.valor, periodo }));
  ctx.agregados.set(clave, resultado);
  return resultado;
}

function combinar(resultados, operacion) {
  const motivos = resultados.flatMap(r => r.motivos);
  if (resultados.some(r => r.valor === null)) return valido(null, motivos);
  const valor = operacion(resultados.map(r => r.valor));
  return numero(valor) ? valido(valor, motivos) : nd('missing_required_account_data', { detalle:'Resultado no finito' });
}

function modo(doc, ctx) {
  if (doc.modo_periodo.name === 'point_in_time') return 'direct_closing';
  if (ctx.entrada.periodos.anterior !== null) return 'average';
  const politica = doc.modo_periodo.politica_sin_periodo_anterior;
  if (ctx.entrada.periodos.cantidad === 1 && politica.un_solo_periodo_en_el_estado === 'direct_closing') return 'direct_closing';
  if (ctx.entrada.periodos.indice === 0 && ctx.control && politica.primer_periodo_con_control_activo === 'direct_closing') return 'direct_closing';
  return 'not_applicable';
}

function evaluarRazon(id, ctx) {
  const clave = `ratio:${id}`;
  if (ctx.memo.has(clave)) return ctx.memo.get(clave);
  const doc = ctx.documentos.get(id);
  for (const d of doc.razones_dependientes) evaluarRazon(d.id, ctx);
  const metodo = modo(doc, ctx);
  const calculo = metodo === 'not_applicable' ? nd('missing_required_period_balance', { id, periodo:'previous' })
    : evaluar(doc.razon.formula, 'current', doc, ctx, '$.razon.formula');
  const resultado = { valor:calculo.valor, metodo:calculo.valor === null ? 'not_applicable' : metodo, motivos:unicos(calculo.motivos) };
  ctx.memo.set(clave, resultado);
  return resultado;
}

function evaluar(nodo, periodo, doc, ctx, ruta) {
  const p = nodo.period || periodo;
  const hijo = (n,k) => evaluar(n, p, doc, ctx, `${ruta}.${k}`);
  switch (nodo.op) {
    case 'constant': return valido(nodo.value);
    case 'account': return leerCuenta(nodo.id, p, ctx);
    case 'ratio': return evaluarRazon(nodo.id, ctx);
    case 'derived': {
      const clave = `${doc.razon.id}:${nodo.id}:${p}`;
      if (ctx.memo.has(clave)) return ctx.memo.get(clave);
      if (ctx.resolviendo.has(clave)) throw new Error(`${doc.razon.id}.json: ${ruta}: ciclo de derivados ${nodo.id}.`);
      const indice = doc.derivados.findIndex(d => d.id === nodo.id);
      if (indice < 0) throw new Error(`${doc.razon.id}.json: ${ruta}: derivado desconocido ${nodo.id}.`);
      ctx.resolviendo.add(clave);
      const resultado = evaluar(doc.derivados[indice].formula, p, doc, ctx, `$.derivados[${indice}].formula`);
      ctx.resolviendo.delete(clave);
      ctx.memo.set(clave, resultado);
      return resultado;
    }
    case 'sum_accounts': {
      const miembros = doc.conjuntos[nodo.account_set];
      if (!miembros) throw new Error(`${doc.razon.id}.json: ${ruta}: conjunto desconocido ${nodo.account_set}.`);
      return combinar(miembros.map(id => leerCuenta(id, p, ctx)), valores => valores.reduce((s,v) => s+v, 0));
    }
    case 'add': return combinar(nodo.operands.map((n,i) => hijo(n, `operands[${i}]`)), valores => valores.reduce((s,v) => s+v, 0));
    case 'multiply': return combinar(nodo.operands.map((n,i) => hijo(n, `operands[${i}]`)), valores => valores.reduce((s,v) => s*v, 1));
    case 'subtract': return combinar([hijo(nodo.left, 'left'), hijo(nodo.right, 'right')], ([a,b]) => a-b);
    case 'divide': {
      const numerador = hijo(nodo.numerator, 'numerator');
      const denominador = hijo(nodo.denominator, 'denominator');
      if (denominador.valor === 0) return valido(null, unicos([...numerador.motivos, ...denominador.motivos, { codigo:'zero_denominator', archivo:`${doc.razon.id}.json`, ruta }]));
      return combinar([numerador,denominador], ([a,b]) => a/b);
    }
    case 'average': {
      const actual = hijo(nodo.of, 'of');
      if (modo(doc, ctx) === 'direct_closing') return actual;
      const anterior = evaluar(nodo.of, 'previous', doc, ctx, `${ruta}.of`);
      return combinar([anterior,actual], ([a,b]) => (a+b)/2);
    }
    case 'reported_or_calculate': {
      const reportado = leerCuenta(nodo.reported, p, ctx);
      if (!numero(reportado.valor)) return hijo(nodo.calculation, 'calculation');
      const calculado = hijo(nodo.calculation, 'calculation');
      const tolerancia = doc.reglas_generales.total_reportado_y_componentes.tolerancia;
      const componentes = ctx.influencias.get(nodo.reported) || new Set();
      const comparable = ctx.entrada.cuentas.some(c => c.estado === 'reconocida' && c.id !== nodo.reported
        && componentes.has(c.id) && Object.hasOwn(c, p) && numero(c[p]));
      if (numero(calculado.valor) && comparable) {
        // Misma convención de precisión de las comprobaciones existentes:
        // un centavo exacto no supera el umbral por representación binaria.
        const margen = Number.EPSILON * Math.max(1, Math.abs(reportado.valor), Math.abs(calculado.valor));
        if (Math.abs(reportado.valor-calculado.valor) > tolerancia + margen) {
          return valido(reportado.valor, [...reportado.motivos, { codigo:'reported_subtotal_mismatch', id:nodo.reported, periodo:p, reportado:reportado.valor, calculado:calculado.valor }]);
        }
      }
      return reportado;
    }
    default: throw new Error(`${doc.razon.id}.json: ${ruta}: operación desconocida ${nodo.op}.`);
  }
}

export function calcularRazon(id, entrada, opciones = {}, especificacion = ESPECIFICACION_RAZONES) {
  return evaluarRazon(id, contexto(entrada, opciones, especificacion, id));
}

export function calcularRazonConTraza(id, entrada, opciones = {}, especificacion = ESPECIFICACION_RAZONES) {
  const ctx = contexto(entrada, opciones, especificacion, id);
  const resultado = evaluarRazon(id, ctx);
  return { resultado, agregaciones:[...ctx.agregados].map(([clave,datos]) => ({ clave, valor:datos.valor, componentes:datos.traza })) };
}

export function evaluarDerivado(idRazon, idDerivado, entrada, opciones = {}, especificacion = ESPECIFICACION_RAZONES) {
  const ctx = contexto(entrada, opciones, especificacion, idRazon);
  const resultado = evaluar({ op:'derived', id:idDerivado }, 'current', ctx.documentos.get(idRazon), ctx, '$.consultaDerivado');
  return { valor:resultado.valor, metodo:resultado.valor === null ? 'not_applicable' : 'direct_closing', motivos:unicos(resultado.motivos) };
}

export function calcularRazones(entrada, opciones = {}, especificacion = ESPECIFICACION_RAZONES) {
  return { razones:Object.fromEntries(Object.keys(especificacion).map(id => [id, calcularRazon(id, entrada, opciones, especificacion)])),
    revision:revisarEntradaRazones(entrada) };
}
