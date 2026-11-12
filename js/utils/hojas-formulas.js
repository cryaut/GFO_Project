// Intérprete de la notación de las hojas aportadas, sin ejecutar JavaScript ni macros.
// No define fórmulas financieras: evalúa las expresiones originales y conserva sus reglas.
const DIA = 86400000, ORIGEN = Date.UTC(1899, 11, 30);
export const serialFecha = fecha => (Date.parse(fecha.slice(0, 10) + 'T00:00:00Z') - ORIGEN) / DIA;
export const fechaSerial = numero => new Date(ORIGEN + numero * DIA).toISOString().slice(0, 10);
export function columnaNumero(nombre) { return [...nombre].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0); }
export function columnaLetra(n) { let s = ''; while (n) { n--; s = String.fromCharCode(65 + n % 26) + s; n = Math.floor(n / 26); } return s; }
const plano = valor => Array.isArray(valor) ? valor.flat(Infinity) : [valor];
const numero = valor => valor === null || valor === '' ? 0 : typeof valor === 'boolean' ? Number(valor) : typeof valor === 'number' && Number.isFinite(valor) ? valor : (() => { throw new Error('El operando no es numérico.'); })();
const texto = valor => valor === null ? '' : String(valor);
const igual = (a, b) => (a === null || a === '') && (b === null || b === '') || typeof a === 'string' && typeof b === 'string' ? texto(a).toLocaleLowerCase() === texto(b).toLocaleLowerCase() : a === b;
const comparar = (a, b, op) => op === '=' ? igual(a, b) : op === '<>' ? !igual(a, b) : op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b;

function analizar(formula) {
  const tokens = []; let i = 1;
  while (i < formula.length) {
    const resto = formula.slice(i);
    if (/^\s/.test(resto)) { i++; continue; }
    const m = /^("(?:[^"]|"")*"|'(?:[^']|'')*'|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|\$?[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ_0-9.$]*|<>|<=|>=|[+\-*/^&=<>(),!:%])/.exec(resto);
    if (!m) throw new Error('Sintaxis de hoja no admitida.');
    tokens.push(m[0]); i += m[0].length;
  }
  let p = 0;
  const tomar = t => { if (tokens[p] !== t) throw new Error(`Se esperaba ${t}.`); p++; };
  function atomo() {
    const t = tokens[p++]; let n;
    if (t === undefined) throw new Error('Expresión incompleta.');
    if (t === '+' || t === '-') return { tipo:'signo', signo:t, hijo:atomo() };
    if (t === '(') { n = expresion(); tomar(')'); }
    else if (t.startsWith('"')) n = { tipo:'valor', valor:t.slice(1,-1).replaceAll('""','"') };
    else if (/^(?:\d|\.)/.test(t)) n = { tipo:'valor', valor:Number(t) };
    else if (tokens[p] === '(') {
      p++; const args = [];
      if (tokens[p] !== ')') { do { if (tokens[p] === ',') p++; args.push(expresion()); } while (tokens[p] === ','); }
      tomar(')'); n = { tipo:'funcion', nombre:t.toUpperCase(), args };
    } else if (t === 'TRUE' || t === 'FALSE') n = { tipo:'valor', valor:t === 'TRUE' };
    else {
      let hoja = null, ref = t;
      if (tokens[p] === '!') { p++; hoja = t.startsWith("'") ? t.slice(1,-1).replaceAll("''", "'") : t; ref = tokens[p++]; }
      ref = ref?.replaceAll('$','');
      if (!/^[A-Z]{1,3}[1-9]\d{0,5}$/.test(ref)) throw new Error('Referencia no admitida.');
      n = { tipo:'ref', hoja, ref };
      if (tokens[p] === ':') { p++; const fin = tokens[p++]?.replaceAll('$',''); if (!/^[A-Z]{1,3}[1-9]\d{0,5}$/.test(fin)) throw new Error('Rango inválido.'); n.fin = fin; }
    }
    if (tokens[p] === '%') { p++; n = { tipo:'binario', op:'/', a:n, b:{tipo:'valor', valor:100} }; }
    return n;
  }
  const niveles = { '=':1, '<>':1, '<':1, '>':1, '<=':1, '>=':1, '&':2, '+':3, '-':3, '*':4, '/':4, '^':5 };
  function expresion(min = 0) {
    let a = atomo();
    while (niveles[tokens[p]] >= min) { const op = tokens[p++], b = expresion(niveles[op] + 1); a = {tipo:'binario', op, a, b}; }
    return a;
  }
  const resultado = expresion();
  if (p !== tokens.length) throw new Error('Sobran elementos en la expresión.');
  return resultado;
}

export function evaluarHojas(documento) {
  const hojas = new Map(documento.hojas.map(h => [h.nombre, new Map(h.filas.flatMap(f => f.celdas.map(c => [c.ref, c])))]));
  const cache = new Map(), arboles = new Map(), pendientes = new Set(), errores = [];
  let operaciones = 0;
  function criterio(valor, condicion) {
    if (typeof condicion !== 'string') return igual(valor, condicion);
    const m = /^(<=|>=|<>|=|<|>)(.*)$/.exec(condicion);
    if (m) return comparar(valor, m[2] !== '' && Number.isFinite(Number(m[2])) ? Number(m[2]) : m[2], m[1]);
    if (/[?*~]/.test(condicion)) {
      let patron = '';
      const escapar = c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      for (let i=0; i<condicion.length; i++) {
        const c = condicion[i];
        patron += c === '~' && i+1 < condicion.length ? escapar(condicion[++i]) : c === '*' ? '.*' : c === '?' ? '.' : escapar(c);
      }
      return new RegExp('^'+patron+'$', 'i').test(texto(valor));
    }
    return igual(valor, condicion);
  }
  function rango(n, hoja) {
    const [, ca, ra] = /^([A-Z]+)(\d+)$/.exec(n.ref), [, cb, rb] = /^([A-Z]+)(\d+)$/.exec(n.fin);
    const a = columnaNumero(ca), b = columnaNumero(cb), filas = Number(rb) - Number(ra) + 1;
    if (filas < 1 || b < a || filas * (b-a+1) > 20000) throw new Error('Rango excesivo o invertido.');
    return Array.from({length:filas}, (_, i) => Array.from({length:b-a+1}, (_, j) => celda(n.hoja || hoja, columnaLetra(a+j) + (Number(ra)+i))));
  }
  function evaluar(n, hoja) {
    if (++operaciones > 1000000) throw new Error('El cálculo excede el límite de operaciones.');
    if (n.tipo === 'valor') return n.valor;
    if (n.tipo === 'ref') return n.fin ? rango(n, hoja) : celda(n.hoja || hoja, n.ref);
    if (n.tipo === 'signo') return (n.signo === '-' ? -1 : 1) * numero(evaluar(n.hijo, hoja));
    if (n.tipo === 'binario') {
      const a = evaluar(n.a, hoja), b = evaluar(n.b, hoja);
      if (['=','<>','<','>','<=','>='].includes(n.op)) return comparar(a,b,n.op);
      if (n.op === '&') return texto(a) + texto(b);
      const x = numero(a), y = numero(b);
      if (n.op === '/' && y === 0) throw new Error('División por cero en el archivo.');
      return n.op === '+' ? x+y : n.op === '-' ? x-y : n.op === '*' ? x*y : n.op === '/' ? x/y : x**y;
    }
    const obtener = i => evaluar(n.args[i], hoja);
    if (n.nombre === 'IF') return obtener(0) ? obtener(1) : n.args[2] ? obtener(2) : false;
    if (n.nombre === 'OR') return n.args.some((_, i) => Boolean(obtener(i)));
    const args = n.args.map((_, i) => obtener(i)), valores = args.flat(Infinity);
    switch (n.nombre) {
      case 'SUM': return valores.filter(v => typeof v === 'number').reduce((a,b) => a+b, 0);
      case 'MIN': return Math.min(...valores.filter(v => typeof v === 'number'));
      case 'MAX': return Math.max(...valores.filter(v => typeof v === 'number'));
      case 'ABS': return Math.abs(numero(args[0]));
      case 'COUNT': return valores.filter(v => typeof v === 'number').length;
      case 'COUNTA': return valores.filter(v => v !== null).length;
      case 'ROUND': { const f = 10**numero(args[1]), x = numero(args[0]); return Math.sign(x) * Math.round(Math.abs(x)*f + Number.EPSILON*Math.abs(x)*f) / f; }
      case 'ROUNDUP': { const f = 10**numero(args[1]), x = numero(args[0]); return Math.sign(x)*Math.ceil(Math.abs(x)*f)/f; }
      case 'LEFT': return texto(args[0]).slice(0,args[1] === undefined ? 1 : numero(args[1]));
      case 'DATE': return (Date.UTC(numero(args[0]), numero(args[1])-1, numero(args[2])) - ORIGEN) / DIA;
      case 'YEAR': return new Date(ORIGEN + numero(args[0])*DIA).getUTCFullYear();
      case 'MONTH': return new Date(ORIGEN + numero(args[0])*DIA).getUTCMonth()+1;
      case 'EOMONTH': { const fecha = new Date(ORIGEN + numero(args[0])*DIA); return (Date.UTC(fecha.getUTCFullYear(),fecha.getUTCMonth()+numero(args[1])+1,0)-ORIGEN)/DIA; }
      case 'INDEX': { const a = args[0], fila = numero(args[1])-1, col = args[2] === undefined ? 0 : numero(args[2])-1; if (!Array.isArray(a) || !a[fila] || col < 0 || col >= a[fila].length) throw new Error('INDEX fuera del rango.'); return a[fila][col]; }
      case 'MATCH': { const a = plano(args[1]), modo = args[2] ?? 1; let encontrado = -1; for (let i = 0; i < a.length; i++) { if (modo === 0 ? igual(a[i],args[0]) : a[i] !== null && (modo === 1 ? a[i] <= args[0] : a[i] >= args[0])) { encontrado = i; if (modo === 0) break; } } if (encontrado < 0) throw new Error('MATCH no encontró coincidencia.'); return encontrado+1; }
      case 'COUNTIF': return plano(args[0]).filter(v => criterio(v,args[1])).length;
      case 'SUMIF': { const a = plano(args[0]), suma = plano(args[2] ?? args[0]); return a.reduce((s,v,i) => criterio(v,args[1]) && typeof suma[i] === 'number' ? s+suma[i] : s, 0); }
      case 'SUMIFS': { const suma = plano(args[0]); const filtros = []; for (let i=1; i<args.length; i+=2) filtros.push([plano(args[i]), args[i+1]]); return suma.reduce((s,v,i) => typeof v === 'number' && filtros.every(([a,c]) => criterio(a[i],c)) ? s+v : s,0); }
      default: throw new Error(`Función de hoja no admitida: ${n.nombre}.`);
    }
  }
  function celda(hoja, ref) {
    if (!hojas.has(hoja)) throw new Error('La hoja referenciada no existe.');
    const clave = hoja + '!' + ref;
    if (cache.has(clave)) return cache.get(clave);
    const c = hojas.get(hoja).get(ref);
    if (!c) return null;
    if (pendientes.has(clave) || pendientes.size > 100) throw new Error('Referencia circular o demasiado profunda.');
    pendientes.add(clave);
    try {
      let valor = c.valor;
      if (typeof valor === 'string' && valor.startsWith('=')) {
        if (!arboles.has(valor)) arboles.set(valor,analizar(valor));
        valor = evaluar(arboles.get(valor),hoja);
      }
      if (typeof valor === 'number' && !Number.isFinite(valor)) throw new Error('Resultado no finito.');
      cache.set(clave,valor); return valor;
    } finally { pendientes.delete(clave); }
  }
  const leer = (hoja, ref) => { try { return celda(hoja,ref); } catch (error) { errores.push({hoja,ref,motivo:error.message}); return null; } };
  return { leer, errores };
}
