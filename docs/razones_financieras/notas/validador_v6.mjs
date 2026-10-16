#!/usr/bin/env node
/**
 * validador_v6.mjs — validador de los 20 JSON de razones financieras (schema 2.0)
 * Orden de referencia: prompt_correccion_agente_razones_v6.md (2026-10-15)
 * Ubicación: docs/razones_financieras/notas/validador_v6.mjs (forma parte del repo, H8)
 *
 * Uso:
 *   node notas/validador_v6.mjs                     → valida V0..V17 + conteos (raíz por defecto)
 *   node notas/validador_v6.mjs --solo V1,V2,V3,V5  → solo las validaciones indicadas (bloques B1..B5)
 *   node notas/validador_v6.mjs --raiz <ruta>       → valida otra copia (G3: worktree temporal)
 *
 * Salida: una línea por validación ("OK  Vx ..." o "FALLO Vx: detalle"), conteos y resultado.
 * Código de salida: 0 sin fallos, 1 con fallos.
 *
 * Reglas de diseño (no se modifican para que algo pase):
 * - V14 exige que la URL de cada fuente esté en REGISTRO_APERTURAS (aperturas de esta ejecución,
 *   2026-10-15) y que exista una fila en notas/03_fuentes.md con id de cuenta + URL + "sí".
 * - V12/V13 buscan marcadores-placeholder: "[información faltante]"/"[DATO FALTANTE]" entre
 *   corchetes o como token en MAYÚSCULAS, TODO (palabra completa, mayúsculas), pendiente/pendientes
 *   (palabra completa, sin distinción de mayúsculas), "DECISION_PENDIENTE" y "???".
 * - V16 cuenta una cuenta como presente en un árbol si aparece como nodo `account`, como
 *   `reported` de un `reported_or_calculate`, o como miembro de un conjunto referenciado por un árbol.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  let root = path.resolve(__dirname, ".."); // docs/razones_financieras
  let solo = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--raiz") root = path.resolve(args[++i]);
    else if (args[i] === "--solo") solo = args[++i].split(",").map((s) => s.trim().toUpperCase());
  }
  return { root, solo };
}

// URLs de normas abiertas y verificadas por HTTP en esta ejecución (2026-10-15):
// NIC 1, NIC 2, NIC 7, NIC 12, NIC 16, NIC 23, NIC 32, NIC 37, NIC 38, NIIF 9, NIIF 15.
// El Marco Conceptual se abrió (página 200) pero su texto de definiciones requiere cuenta IFRS,
// por lo que NO se usa como respaldo de ninguna cuenta ni figura aquí.
const BASE = "https://www.ifrs.org/issued-standards/list-of-standards/";
const REGISTRO_APERTURAS = new Set([
  BASE + "ias-1-presentation-of-financial-statements/",
  BASE + "ias-2-inventories/",
  BASE + "ias-7-statement-of-cash-flows/",
  BASE + "ias-12-income-taxes/",
  BASE + "ias-16-property-plant-and-equipment/",
  BASE + "ias-23-borrowing-costs/",
  BASE + "ias-32-financial-instruments-presentation/",
  BASE + "ias-37-provisions-contingent-liabilities-and-contingent-assets/",
  BASE + "ias-38-intangible-assets/",
  BASE + "ifrs-15-revenue-from-contracts-with-customers/",
  BASE + "ifrs-9-financial-instruments/",
]);

const CUENTAS_INTERNAS = ["bs.inventory_total", "is.sales_total"];
const esInterna = (id) => CUENTAS_INTERNAS.includes(id) || id.startsWith("supp.");

const OP_SCHEMA = {
  account: { req: ["id"], opt: ["period"] },
  derived: { req: ["id"], opt: ["period"] },
  ratio: { req: ["id"], opt: [] },
  constant: { req: ["value"], opt: [] },
  sum_accounts: { req: ["account_set"], opt: ["period"] },
  add: { req: ["operands"], opt: [] },
  subtract: { req: ["left", "right"], opt: [] },
  multiply: { req: ["operands"], opt: [] },
  divide: { req: ["numerator", "denominator"], opt: [] },
  average: { req: ["of"], opt: [] },
  reported_or_calculate: { req: ["reported", "calculation"], opt: [] },
};
const PERIODOS = new Set(["current", "previous"]);

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const canon = (o) => JSON.stringify(sortKeys(o));
function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    const out = {};
    for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
    return out;
  }
  return v;
}
function arbolesDe(doc) {
  const trees = [];
  if (doc.razon && doc.razon.formula) trees.push({ de: "razon", node: doc.razon.formula });
  for (const r of doc.razones_dependientes || [])
    if (r && r.formula) trees.push({ de: `razones_dependientes[${r.id}]`, node: r.formula });
  for (const d of doc.derivados || []) if (d && d.formula) trees.push({ de: `derivados[${d.id}]`, node: d.formula });
  return trees;
}
function* walk(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) yield* walk(item);
    return;
  }
  if (typeof node.op === "string") {
    yield node;
    for (const [k, v] of Object.entries(node)) if (k !== "op") yield* walk(v);
    return;
  }
  for (const v of Object.values(node)) yield* walk(v);
}
function recorrerArboles(doc, fn) {
  for (const { de, node } of arbolesDe(doc)) for (const n of walk(node)) fn(n, de);
}
function collectUsados(doc) {
  const used = { cuentas: new Set(), derivados: new Set(), conjuntos: new Set(), ratios: new Set() };
  const derivMap = new Map((doc.derivados || []).map((d) => [d.id, d]));
  const vistos = new Set();
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    if (typeof node.op === "string") {
      switch (node.op) {
        case "account":
          if (typeof node.id === "string") used.cuentas.add(node.id);
          break;
        case "derived":
          used.derivados.add(node.id);
          if (!vistos.has(node.id)) {
            vistos.add(node.id);
            const d = derivMap.get(node.id);
            if (d) visit(d.formula);
          }
          break;
        case "ratio":
          used.ratios.add(node.id);
          break;
        case "sum_accounts":
          used.conjuntos.add(node.account_set);
          for (const m of (doc.conjuntos || {})[node.account_set] || []) used.cuentas.add(m);
          break;
        case "reported_or_calculate":
          if (typeof node.reported === "string") used.cuentas.add(node.reported);
          visit(node.calculation);
          break;
        default:
          break;
      }
      for (const [k, v] of Object.entries(node)) if (k !== "op") visit(v);
    } else {
      for (const v of Object.values(node)) visit(v);
    }
  };
  for (const { node } of arbolesDe(doc)) visit(node);
  return used;
}
function idsCuentas(doc) {
  return new Set((doc.cuentas || []).map((c) => c.id));
}
function buscarStrings(v, ruta, out) {
  if (typeof v === "string") {
    if (v.includes("DIFERENCIA_CONOCIDA_PROFESOR")) out.push({ ruta, valor: v });
    return;
  }
  if (Array.isArray(v)) {
    v.forEach((item, i) => buscarStrings(item, `${ruta}[${i}]`, out));
    return;
  }
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v)) buscarStrings(val, ruta ? `${ruta}.${k}` : k, out);
  }
}

// ---------------------------------------------------------------------------
// Carga
// ---------------------------------------------------------------------------
const { root, solo } = parseArgs();
const archivos = fs.existsSync(root) ? fs.readdirSync(root).filter((f) => f.endsWith(".json")).sort() : [];
const docs = new Map();
const erroresParse = [];
for (const f of archivos) {
  try {
    docs.set(f, JSON.parse(fs.readFileSync(path.join(root, f), "utf8")));
  } catch (e) {
    erroresParse.push(`${f}: ${e.message}`);
  }
}
const leidos = [...docs.entries()];
const modo = (doc) => (doc.razon && doc.razon.period_mode) || "(sin razon)";
const flujo = leidos.filter(([, d]) => modo(d) === "flow_with_average_balance");
const saldo = leidos.filter(([, d]) => modo(d) === "point_in_time");
const fuentesPath = path.join(root, "notas", "03_fuentes.md");
const tablaFuentes = fs.existsSync(fuentesPath) ? fs.readFileSync(fuentesPath, "utf8") : null;

// ---------------------------------------------------------------------------
// Validaciones por archivo
// ---------------------------------------------------------------------------
const resultados = [];
const add = (id, ok, detalles) => resultados.push({ id, ok, detalles: Array.isArray(detalles) ? detalles : [detalles] });

function v1() {
  const d = [];
  if (erroresParse.length) d.push(...errocesFix(erroresParse));
  if (!leidos.length && !erroresParse.length) d.push("no hay archivos JSON en la raíz");
  const sinRazon = leidos.filter(([, o]) => !o.razon).map(([f]) => f);
  if (sinRazon.length) d.push(`sin objeto razon: ${sinRazon.join(", ")}`);
  return { ok: d.length === 0, d };
}
function erroresFix(list) {
  return list.map((x) => `JSON inválido → ${x}`);
}

function v2() {
  const d = [];
  for (const [f, o] of leidos) {
    const stem = f.replace(/\.json$/, "");
    if (!o.razon || o.razon.id !== stem) d.push(`${f}: razon.id="${o.razon && o.razon.id}" ≠ "${stem}"`);
  }
  return { ok: d.length === 0, d };
}

function v3() {
  const d = [];
  for (const [f, o] of leidos) {
    const usados = collectUsados(o);
    const tieneC = idsCuentas(o);
    const tieneD = new Set((o.derivados || []).map((x) => x.id));
    const tieneS = new Set(Object.keys(o.conjuntos || {}));
    const tieneR = new Set((o.razones_dependientes || []).map((x) => x.id));
    for (const id of usados.cuentas) if (!tieneC.has(id)) d.push(`${f}: cuenta usada sin definir: ${id}`);
    for (const id of usados.derivados) if (!tieneD.has(id)) d.push(`${f}: derivado usado sin definir: ${id}`);
    for (const id of usados.conjuntos) if (!tieneS.has(id)) d.push(`${f}: conjunto usado sin definir: ${id}`);
    for (const id of usados.ratios) if (!tieneR.has(id)) d.push(`${f}: ratio usado sin estar en razones_dependientes: ${id}`);
    for (const id of tieneD) if (!usados.derivados.has(id)) d.push(`${f}: derivado definido sin usarse: ${id}`);
    for (const id of tieneS) if (!usados.conjuntos.has(id)) d.push(`${f}: conjunto definido sin usarse: ${id}`);
    for (const id of tieneR) if (!usados.ratios.has(id)) d.push(`${f}: razones_dependientes definida sin usarse: ${id}`);
  }
  return { ok: d.length === 0, d };
}

function v4() {
  const d = [];
  const stems = new Set(leidos.map(([f]) => f.replace(/\.json$/, "")));
  const grafo = new Map();
  for (const [f, o] of leidos) {
    const dep = (o.razones_dependientes || []).map((x) => x.id);
    const vistos = new Set();
    for (const id of dep) {
      if (vistos.has(id)) d.push(`${f}: razones_dependientes con id repetido: ${id}`);
      vistos.add(id);
      if (!stems.has(id)) d.push(`${f}: razones_dependientes apunta a una razón inexistente: ${id}`);
    }
    grafo.set(o.razon && o.razon.id, dep);
  }
  const estado = new Map();
  const enRuta = [];
  const dfs = (n) => {
    if (estado.get(n) === 2) return;
    if (estado.get(n) === 1) {
      d.push(`ciclo entre razones: ${[...enRuta, n].join(" → ")}`);
      return;
    }
    estado.set(n, 1);
    enRuta.push(n);
    for (const m of grafo.get(n) || []) dfs(m);
    enRuta.pop();
    estado.set(n, 2);
  };
  for (const n of grafo.keys()) dfs(n);
  return { ok: d.length === 0, d };
}

function v5() {
  const d = [];
  for (const [f, o] of leidos) {
    for (const { de, node } of arbolesDe(o)) {
      for (const n of walk(node)) {
        const schema = OP_SCHEMA[n.op];
        if (!schema) {
          d.push(`${f}: op no permitido "${n.op}" en ${de}`);
          continue;
        }
        for (const k of Object.keys(n)) {
          if (k === "op") continue;
          if (!schema.req.includes(k) && !schema.opt.includes(k))
            d.push(`${f}: campo no permitido "${k}" en op "${n.op}" (${de})`);
        }
        for (const k of schema.req) if (!(k in n)) d.push(`${f}: falta "${k}" en op "${n.op}" (${de})`);
        if ("period" in n && !PERIODOS.has(n.period))
          d.push(`${f}: period inválido "${n.period}" en op "${n.op}" (${de})`);
        if (n.op === "constant" && typeof n.value !== "number") d.push(`${f}: constant.value no numérico (${de})`);
        if ((n.op === "add" || n.op === "multiply") && (!Array.isArray(n.operands) || !n.operands.length))
          d.push(`${f}: ${n.op}.operands vacío (${de})`);
        if (n.op === "reported_or_calculate" && typeof n.reported !== "string")
          d.push(`${f}: reported_or_calculate.reported debe ser id de cuenta (${de})`);
      }
    }
  }
  return { ok: d.length === 0, d };
}

function v6() {
  const d = [];
  for (const [f, o] of leidos) {
    const cuentaPorId = new Map((o.cuentas || []).map((c) => [c.id, c]));
    for (const [nombre, miembros] of Object.entries(o.conjuntos || {})) {
      for (const m of miembros) {
        const c = cuentaPorId.get(m);
        if (!c) d.push(`${f}: conjunto "${nombre}" con id que no es cuenta del archivo: ${m}`);
        else if (c.account_role === "reported_total")
          d.push(`${f}: conjunto "${nombre}" mezcla un total reportado con componentes: ${m}`);
      }
    }
  }
  return { ok: d.length === 0, d };
}

function v7() {
  const d = [];
  const registro = new Map(); // tipo|id → {canon, archivo}
  const poner = (tipo, id, valor, f) => {
    const clave = `${tipo}|${id}`;
    const c = canon(valor);
    const prev = registro.get(clave);
    if (!prev) registro.set(clave, { c, f });
    else if (prev.c !== c) d.push(`${tipo} "${id}" difiere entre ${prev.f} y ${f}`);
  };
  for (const [f, o] of leidos) {
    for (const c of o.cuentas || []) poner("cuenta", c.id, c, f);
    for (const dv of o.derivados || []) poner("derivado", dv.id, dv, f);
    for (const [k, v] of Object.entries(o.conjuntos || {})) poner("conjunto", k, v, f);
  }
  return { ok: d.length === 0, d };
}

function v8() {
  const d = [];
  const grupos = new Map();
  for (const [f, o] of leidos) {
    const g = modo(o);
    if (!grupos.has(g)) grupos.set(g, []);
    grupos.get(g).push([f, o]);
  }
  for (const [g, lista] of grupos) {
    for (const bloque of ["reglas_generales", "modo_periodo", "presentacion"]) {
      const ref = lista[0];
      for (const [f, o] of lista.slice(1)) {
        if (canon(o[bloque]) !== canon(ref[1][bloque]))
          d.push(`bloque "${bloque}" distinto entre ${ref[0]} y ${f} (modo ${g})`);
      }
    }
  }
  return { ok: d.length === 0, d };
}

function v9() {
  const d = [];
  const idsControl = [];
  const clavesPermitidas = {
    flow_with_average_balance: ["name", "average", "flow_period", "politica_sin_periodo_anterior", "control_global"],
    point_in_time: ["name", "value", "average", "control_global"],
  };
  const buscarClave = (obj, objetivo, ruta = "") => {
    const hits = [];
    if (!obj || typeof obj !== "object") return hits;
    for (const [k, v] of Object.entries(obj)) {
      if (k === objetivo) hits.push(ruta ? `${ruta}.${k}` : k);
      hits.push(...buscarClave(v, objetivo, ruta ? `${ruta}.${k}` : k));
    }
    return hits;
  };
  for (const [f, o] of leidos) {
    const g = modo(o);
    const mp = o.modo_periodo || {};
    const pres = o.presentacion || {};
    const tieneAverage = [...arbolesDe(o)].some(({ node }) => [...walk(node)].some((n) => n.op === "average"));
    if (g === "flow_with_average_balance") {
      if (!tieneAverage) d.push(`${f}: modo flujo sin ningún nodo average`);
      if (!("marca_promedio" in pres)) d.push(`${f}: presentacion sin marca_promedio`);
      const cg = mp.control_global;
      if (!cg || typeof cg !== "object") d.push(`${f}: falta modo_periodo.control_global`);
      else {
        if (cg.default !== false) d.push(`${f}: control_global.default debe ser false`);
        if (typeof cg.id !== "string" || !cg.id) d.push(`${f}: control_global sin id`);
        else idsControl.push(cg.id);
      }
      const claves = Object.keys(mp);
      const permitidas = clavesPermitidas[g];
      for (const c of claves) if (!permitidas.includes(c)) d.push(`${f}: modo_periodo con clave propia por razón: "${c}"`);
      const propios = buscarClave(o, "first_period_toggle");
      if (propios.length) d.push(`${f}: control por razón presente en ${propios.join(", ")}`);
    } else if (g === "point_in_time") {
      if (tieneAverage) d.push(`${f}: modo saldo de cierre con nodo average`);
      if (mp.control_global !== null) d.push(`${f}: control_global debe ser null en saldo de cierre`);
      if ("marca_promedio" in pres) d.push(`${f}: saldo de cierre no debe tener marca_promedio`);
      const claves = Object.keys(mp);
      const permitidas = clavesPermitidas[g];
      for (const c of claves) if (!permitidas.includes(c)) d.push(`${f}: modo_periodo con claves no previstas: "${c}"`);
      const propios = buscarClave(o, "first_period_toggle");
      if (propios.length) d.push(`${f}: control por razón presente en ${propios.join(", ")}`);
    } else {
      d.push(`${f}: period_mode desconocido "${g}"`);
    }
  }
  if (idsControl.length && new Set(idsControl).size > 1)
    d.push(`control_global con ids distintos: ${[...new Set(idsControl)].join(", ")}`);
  return { ok: d.length === 0, d };
}

function v10() {
  const d = [];
  for (const [f, o] of leidos) {
    const m = o.presentacion && o.presentacion.marca_directa;
    if (typeof m !== "string" || !m.trim()) d.push(`${f}: presentacion.marca_directa ausente o vacía`);
  }
  return { ok: d.length === 0, d };
}

function v11() {
  const d = [];
  if (leidos.length !== 20) d.push(`hay ${leidos.length} archivos JSON, se esperan 20`);
  if (flujo.length !== 11) d.push(`hay ${flujo.length} razones de flujo, se esperan 11`);
  if (saldo.length !== 9) d.push(`hay ${saldo.length} razones de saldo de cierre, se esperan 9`);
  for (const [f, o] of leidos) {
    const esperado = (o.razon && o.razon.period_mode) || "(sin razon)";
    const enBloque = o.modo_periodo && o.modo_periodo.name;
    if (esperado !== enBloque) d.push(`${f}: razon.period_mode="${esperado}" ≠ modo_periodo.name="${enBloque}"`);
  }
  const cgFlujo = flujo.map(([, o]) => canon((o.modo_periodo || {}).control_global));
  if (cgFlujo.length && new Set(cgFlujo).size > 1) d.push("los 11 control_global no son idénticos entre sí");
  const ids = flujo
    .map(([, o]) => ((o.modo_periodo || {}).control_global || {}).id)
    .filter((x) => typeof x === "string");
  if (ids.length !== 11 || new Set(ids).size !== 1)
    d.push(`se esperaba el mismo id de control_global en los 11 archivos (hay: ${[...new Set(ids)].join(", ")})`);
  return { ok: d.length === 0, d };
}

// R3 prohibe los marcadores-placeholder: `[informacion faltante]`, `[DATO FALTANTE]`, `TODO`,
// `pendiente`, `DECISION_PENDIENTE`, `???`. Se buscan como placeholder entre corchetes o token en
// mayúsculas (la prosa en minúsculas del bloque textual `reglas_generales` —«Un dato faltante nunca
// se convierte en número…»— no es un marcador; excluirlo es obligado para poder copiar ese bloque
// sin cambios, que V8 exige).
const MARCADORES = [
  { nom: "[informacion faltante]", re: /\[(informaci[oó]n|DATO) faltante\]/i },
  { nom: "DATO FALTANTE (mayúsculas)", re: /\bDATO FALTANTE\b/ },
  { nom: "INFORMACION FALTANTE (mayúsculas)", re: /\bINFORMACI[ÓO]N FALTANTE\b/ },
  { nom: "TODO", re: /\bTODO\b/ },
  { nom: "pendiente", re: /\bpendiente(s)?\b/i },
  { nom: "DECISION_PENDIENTE", re: /DECISION_PENDIENTE/i },
  { nom: "???", re: /\?\?\?/ },
];
function v12() {
  const d = [];
  for (const f of archivos) {
    const texto = fs.readFileSync(path.join(root, f), "utf8");
    for (const { nom, re } of MARCADORES) {
      const m = texto.match(re);
      if (m) d.push(`${f}: marcador "${nom}" → "${m[0]}"`);
    }
  }
  return { ok: d.length === 0, d };
}

function v13() {
  const d = [];
  for (const [f, o] of leidos) {
    const notas = (o.razon && o.razon.notes) || null;
    if (!Array.isArray(notas)) {
      d.push(`${f}: razon.notes no es un array`);
    } else {
      notas.forEach((n, i) => {
        if (typeof n !== "string" || !n.includes("DIFERENCIA_CONOCIDA_PROFESOR:"))
          d.push(`${f}: razon.notes[${i}] sin prefijo DIFERENCIA_CONOCIDA_PROFESOR:`);
        else if (!/DIFERENCIA_CONOCIDA_PROFESOR:\s*\S/.test(n))
          d.push(`${f}: razon.notes[${i}] sin motivo después del prefijo`);
      });
    }
    const hits = [];
    buscarStrings(o, "", hits);
    for (const h of hits) if (!h.ruta.startsWith("razon.notes")) d.push(`${f}: DIFERENCIA fuera de razon.notes → ${h.ruta}`);
    if (JSON.stringify(o).includes("DECISION_PENDIENTE")) d.push(`${f}: DECISION_PENDIENTE presente`);
  }
  return { ok: d.length === 0, d };
}

function v14() {
  const d = [];
  if (tablaFuentes === null) d.push("no existe notas/03_fuentes.md (auditoría de fuentes)");
  const filas = tablaFuentes === null ? [] : tablaFuentes.split("\n");
  for (const [f, o] of leidos) {
    for (const c of o.cuentas || []) {
      if (c.research && c.research.status !== "verified") continue;
      const fuentes = (c.research && c.research.sources) || [];
      if (!fuentes.length) {
        d.push(`${f}: ${c.id} es verified sin fuentes`);
        continue;
      }
      for (const s of fuentes) {
        if (!s.url || !REGISTRO_APERTURAS.has(s.url))
          d.push(`${f}: ${c.id} con fuente fuera del registro de aperturas de esta ejecución: ${s.url}`);
        if (!s.supports || !s.supports.trim()) d.push(`${f}: ${c.id} con fuente sin "supports": ${s.title}`);
        if (tablaFuentes !== null) {
          const fila = filas.find((l) => l.includes(c.id) && l.includes(String(s.url || "")));
          if (!fila) d.push(`03_fuentes.md: falta fila cuenta–fuente para ${c.id} + ${s.url}`);
          else if (!fila.includes("sí")) d.push(`03_fuentes.md: la fila de ${c.id} + ${s.url} no marca "sí" de apertura`);
        }
      }
    }
  }
  return { ok: d.length === 0, d };
}

function v15() {
  const d = [];
  for (const [f, o] of leidos) {
    for (const c of o.cuentas || []) {
      if (!esInterna(c.id)) continue;
      if (!c.research || c.research.status !== "partially_verified")
        d.push(`${f}: ${c.id} es cuenta interna y debe ser partially_verified (tiene: ${c.research && c.research.status})`);
      if (!Array.isArray(c.ambiguities) || c.ambiguities.length === 0)
        d.push(`${f}: ${c.id} es cuenta interna y su ambiguities debe explicarlo`);
    }
  }
  return { ok: d.length === 0, d };
}

function v16() {
  const d = [];
  for (const [f, o] of leidos) {
    const usados = collectUsados(o);
    for (const c of o.cuentas || []) {
      if (!usados.cuentas.has(c.id)) d.push(`${f}: ${c.id} definida pero no aparece en ningún árbol`);
    }
  }
  return { ok: d.length === 0, d };
}

function v17() {
  const d = [];
  for (const [f, o] of leidos) {
    const p = o.presentacion || {};
    if (p.separador_decimal !== ".") d.push(`${f}: separador_decimal="${p.separador_decimal}" (esperado ".")`);
    if (p.separador_miles !== ",") d.push(`${f}: separador_miles="${p.separador_miles}" (esperado ",")`);
  }
  return { ok: d.length === 0, d };
}

function v0() {
  try {
    const salida = execSync("git status --porcelain", { cwd: root, encoding: "utf8" }).trim();
    if (salida) return { ok: false, d: [`árbol sucio:\n${salida}`] };
    return { ok: true, d: [] };
  } catch (e) {
    return { ok: false, d: [`no se pudo ejecutar git status: ${e.message}`] };
  }
}

const TODAS = {
  V0: v0, V1: v1, V2: v2, V3: v3, V4: v4, V5: v5, V6: v6, V7: v7, V8: v8, V9: v9,
  V10: v10, V11: v11, V12: v12, V13: v13, V14: v14, V15: v15, V16: v16, V17: v17,
};

// ---------------------------------------------------------------------------
// Ejecución
// ---------------------------------------------------------------------------
const orden = Object.keys(TODAS);
const aEjecutar = solo ? orden.filter((k) => solo.includes(k)) : orden;
if (solo) {
  const desconocidas = solo.filter((k) => !orden.includes(k));
  if (desconocidas.length) {
    console.error(`Validaciones desconocidas: ${desconocidas.join(", ")}`);
    process.exit(2);
  }
}
console.log(`validador_v6 | raiz=${root} | archivos JSON=${archivos.length} | ${aEjecutar.length} validaciones`);
let fallos = 0;
for (const id of aEjecutar) {
  let r;
  try {
    r = TODAS[id]();
  } catch (e) {
    r = { ok: false, d: [`error de ejecución: ${e.message}`] };
  }
  if (r.ok) {
    console.log(`OK   ${id}`);
  } else {
    fallos++;
    for (const det of r.d) console.log(`FALLO ${id}: ${det}`);
    console.log(`FALLO ${id} → ${r.d.length} problema(s)`);
  }
}

// Conteos del conjunto (informativos)
const estados = new Map();
let notasDif = 0;
for (const [, o] of leidos) {
  for (const c of o.cuentas || []) if (!estados.has(c.id)) estados.set(c.id, c.research && c.research.status);
  notasDif += ((o.razon && o.razon.notes) || []).filter((n) => String(n).includes("DIFERENCIA_CONOCIDA_PROFESOR")).length;
}
let ver = 0, par = 0, amb = 0;
for (const s of estados.values()) {
  if (s === "verified") ver++;
  else if (s === "partially_verified") par++;
  else if (s === "ambiguous") amb++;
}
console.log(
  `CONTEOS: archivos=${leidos.length} flujo=${flujo.length} saldo=${saldo.length} cuentas=${estados.size} ` +
    `verified=${ver} partially=${par} ambiguous=${amb} notas_DIFERENCIA=${notasDif}`
);
console.log(
  fallos === 0
    ? `RESULTADO: ${aEjecutar.length}/${aEjecutar.length} validaciones sin fallos`
    : `RESULTADO: ${fallos} validación(es) con fallo`
);
process.exit(fallos === 0 ? 0 : 1);
