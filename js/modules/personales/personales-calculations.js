import { evaluarHojas, fechaSerial } from '../../utils/hojas-formulas.js';
import { depAnualLineaRecta, depAcumulada, valorEnLibros, saldoSemanal } from '../../utils/calculate.js';
import { columnaNumero } from '../../utils/hojas-formulas.js';

const objeto = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const scalar = v => v === null || typeof v === 'boolean' || typeof v === 'number' && Number.isFinite(v) || typeof v === 'string' && v.length <= 12000;
const cadena = (v, max=120) => typeof v === 'string' && v.length <= max;
const peligro = new Set(['__proto__','prototype','constructor']);

export function normalizarDocumentoPersonal(d) {
  let nodos = 0;
  function seguro(v, nivel=0) {
    if (++nodos > 100000 || nivel > 12) throw new Error('Documento personal demasiado grande.');
    if (Array.isArray(v)) v.forEach(x => seguro(x,nivel+1));
    else if (objeto(v)) for (const [k,x] of Object.entries(v)) { if (peligro.has(k)) throw new Error('Clave no permitida.'); seguro(x,nivel+1); }
    else if (!scalar(v)) throw new Error('Dato no válido en el documento personal.');
  }
  seguro(d);
  if (!objeto(d) || d.version !== 1 || !/^((presupuesto)|(activos))-[a-z]+$/.test(d.id) || !cadena(d.nombre) || !d.nombre || !cadena(d.archivo,240) || !/^[a-f0-9]{64}$/.test(d.sha256) || !['xlsx','docx'].includes(d.tipo) || !Array.isArray(d.avisos) || d.avisos.some(v=>!cadena(v,2000)) || !Array.isArray(d.hojas) || d.hojas.length > 20) throw new Error('Documento personal inválido.');
  const nombres = new Set(); let celdas=0;
  for (const h of d.hojas) {
    if (!objeto(h) || !cadena(h.nombre,80) || !h.nombre || nombres.has(h.nombre) || !Number.isInteger(h.columnas) || h.columnas < 1 || h.columnas > 100 || !Array.isArray(h.filas) || h.filas.length > 2000 || !Array.isArray(h.combinadas) || h.combinadas.some(m=>!/^([A-Z]{1,3}\d+):([A-Z]{1,3}\d+)$/.test(m))) throw new Error('Hoja personal inválida.');
    nombres.add(h.nombre); const refs = new Set(); let anterior=0;
    for (const f of h.filas) {
      if (!objeto(f) || !Number.isInteger(f.n) || f.n <= anterior || f.n > 2000 || !Array.isArray(f.celdas)) throw new Error('Fila personal inválida.');
      anterior=f.n;
      for (const c of f.celdas) {
        if (++celdas > 15000 || !objeto(c) || !/^[A-Z]{1,3}[1-9]\d{0,3}$/.test(c.ref) || Number(c.ref.match(/\d+/)[0]) !== f.n || refs.has(c.ref) || !scalar(c.valor) || !scalar(c.resultado) || !cadena(c.formato,500) || typeof c.fecha !== 'boolean' || typeof c.negrita !== 'boolean') throw new Error('Celda personal inválida.');
        refs.add(c.ref);
      }
    }
  }
  if (d.tipo === 'docx' && (!Array.isArray(d.bloques) || d.bloques.some(b=>!objeto(b) || !['parrafo','tabla'].includes(b.tipo) || b.tipo === 'parrafo' && !cadena(b.texto,12000) || b.tipo === 'tabla' && (!Array.isArray(b.filas) || b.filas.some(f=>!Array.isArray(f)||f.some(c=>!cadena(c,12000))))))) throw new Error('Sección del documento de activos inválida.');
  return structuredClone(d);
}

export function comprobarDocumentoPersonal(documento) {
  const e = evaluarHojas(documento), diferencias=[]; let formulas=0, sinResultado=0;
  for (const h of documento.hojas) for (const f of h.filas) for (const c of f.celdas) {
    if (typeof c.valor !== 'string' || !c.valor.startsWith('=')) continue;
    formulas++; const valor=e.leer(h.nombre,c.ref);
    if (c.resultado === null) { sinResultado++; continue; }
    const coincide = typeof valor === 'number' && typeof c.resultado === 'number' ? Math.abs(valor-c.resultado) <= Math.max(1e-8,Math.abs(c.resultado)*1e-12) : valor === c.resultado;
    if (!coincide) diferencias.push({hoja:h.nombre,ref:c.ref,original:c.resultado,actual:valor});
  }
  return { ...e, formulas, sinResultado, diferencias };
}

// El original determina sus cortes, sus etiquetas y si el saldo es acumulado.
// No se impone lunes–domingo ni se convierte una proyección en movimientos.
export function resumenPresupuestoPersonal(documento) {
  const e = evaluarHojas(documento), leer=e.leer;
  if (documento.id === 'presupuesto-gabriel') return { estudiantil:true, soloProyeccion:true, ingresos:null, gastos:null, ahorro:null, reserva:null, saldo:null, avance:null, metaAhorro:null,
    planes:documento.hojas.map(h=>({periodo:h.nombre,total:leer(h.nombre,'D29'),ahorro:leer(h.nombre,'D30')})) };
  const h='Inicio y meta';
  const inicio=leer(h,'B11'), final=leer(h,documento.id === 'presupuesto-cris' || documento.id === 'presupuesto-carlos' ? 'B12' : 'B13');
  const ingresos=leer(h,'F6'),gastos=leer(h,'F7'),ahorro=leer(h,'F8'),reserva=leer(h,'F9'),saldoDelArchivo=leer(h,'F10');
  const saldoMovimientos=saldoSemanal(ingresos,gastos,ahorro,reserva);
  return { estudiantil:true, ingresos,gastos,ahorro,reserva,saldo:saldoDelArchivo,saldoDelArchivo,saldoMovimientos,diferenciaSaldo:saldoMovimientos===null||saldoDelArchivo===null?null:saldoDelArchivo-saldoMovimientos,
    periodo:documento.id==='presupuesto-carlos'?'agosto a octubre de 2026':null, avance:leer(h,'F11'), metaAhorro:leer(h,'B8'),
    semanas:documento.id === 'presupuesto-carlos' ? null : leer(h,'B9'), desde:typeof inicio === 'number' ? fechaSerial(inicio) : null, hasta:typeof final === 'number' ? fechaSerial(final) : null };
}

export function inventarioDocumentoPersonal(documento) {
  if (documento.tipo === 'docx') {
    let encabezado=''; const inventario=[];
    for (const b of documento.bloques) {
      if (b.tipo === 'parrafo' && /^Ejemplo [A-Z]\./.test(b.texto)) encabezado=b.texto;
      if (b.tipo === 'parrafo' && inventario.length) {
        const clave=/^Depreciación anual/.test(b.texto)?'anual':/^Depreciación acumulada/.test(b.texto)?'acumulada':/^Valor en libros =/.test(b.texto)?'libros':null;
        const resultado=clave?b.texto.split('=').at(-1).match(/[\d,]+(?:\.\d+)?/):null;
        if (resultado) { const a=inventario.at(-1); a.resultadosOriginales??={};a.resultadosOriginales[clave]=Number(resultado[0].replaceAll(',','')); }
      }
      if (b.tipo !== 'tabla') continue;
      const datos=Object.fromEntries(b.filas.filter(f=>f.length===2));
      if (!datos['Costo original / valor residual']) continue;
      const numeros = texto => (texto.match(/-?\d[\d,]*(?:\.\d+)?/g)||[]).map(n=>Number(n.replaceAll(',','')));
      const costos=numeros(datos['Costo original / valor residual']), vida=numeros(datos['Vida útil / restante contable']), edad=/\/ (\d+) años?/.exec(datos['Año de compra / edad']);
      inventario.push({nombre:encabezado.split(': ').slice(1).join(': '), categoria:datos['Categoría / activo'].split(' / ')[0], costoOriginal:costos[0],valorResidual:costos[1],vidaUtil:vida[0],aniosConsumidos:edad?Number(edad[1]):null,costoReposicion:numeros(datos['Costo actual de reposición'])[0],
        condicionOriginal:datos['Condición real'],clasificacionOriginal:datos['Clasificación sugerida'],recomendacionOriginal:datos.Recomendación,moneda:'UM',simbolo:'$',fuente:documento.archivo,redondeoOriginal:true});
    }
    return inventario;
  }
  const e=evaluarHojas(documento), hoja=documento.hojas.find(h=>h.nombre==='Inventario');
  if (!hoja) return [];
  const extensa=documento.id==='activos-carlos'||documento.id==='activos-juan';
  const columnas=extensa?{vida:'I',edad:'J',residual:'N',depAnual:'P',depAcumulada:'R',libros:'S',condicion:'T',clasificacion:'AB',reposicion:'AC',recomendacion:'AH'}:{vida:'H',edad:'I',residual:'L',depAnual:'M',depAcumulada:'N',libros:'O',condicion:'P',clasificacion:'X',reposicion:'Y',recomendacion:'AA'};
  return hoja.filas.filter(f=>f.n>=5 && typeof e.leer('Inventario','A'+f.n)==='number' && e.leer('Inventario','B'+f.n)).map(f=>{
    const v=col=>e.leer('Inventario',col+f.n);
    return {nombre:v('B'),categoria:v('C'),costoOriginal:v('F'),vidaUtil:v(columnas.vida),valorResidual:v(columnas.residual),aniosConsumidos:v(columnas.edad),costoReposicion:v(columnas.reposicion),
      condicionOriginal:v(columnas.condicion),clasificacionOriginal:v(columnas.clasificacion),recomendacionOriginal:v(columnas.recomendacion),moneda:'C$',filaOriginal:f.n,
      resultadosOriginales:{anual:v(columnas.depAnual),acumulada:v(columnas.depAcumulada),libros:v(columnas.libros)},redondeoOriginal:documento.id==='activos-cris'};
  });
}

export function contrastarActivosPersonales(documento) {
  return inventarioDocumentoPersonal(documento).map(a=>{
    const anual=depAnualLineaRecta(a.costoOriginal,a.valorResidual,a.vidaUtil), acumulada=depAcumulada(anual,a.aniosConsumidos,a.vidaUtil);
    const redondear=v=>v===null?null:a.redondeoOriginal?Math.round((v+Number.EPSILON)*100)/100:v;
    const actual={anual:redondear(anual),acumulada:redondear(acumulada),libros:redondear(valorEnLibros(a.costoOriginal,documento.id==='activos-cris'?redondear(acumulada):acumulada))};
    return {...a,calculado:actual,coincide:!a.resultadosOriginales?null:Object.entries(actual).every(([k,v])=>v!==null&&Math.abs(v-a.resultadosOriginales[k])<0.000001)};
  });
}

export function camposRegistroPersonal(documento, indice) {
  const hoja=documento.hojas[indice];
  if (!hoja || !['Inventario','Registro semanal','Registro Agosto','Registro Septiembre','Registro Octubre'].includes(hoja.nombre)) return [];
  const e=evaluarHojas(documento), inventario=hoja.nombre==='Inventario', cabecera=hoja.filas.find(f=>f.n===(inventario?4:5));
  const modelo=hoja.filas.find(f=>f.n>=(inventario?5:6)&&e.leer(hoja.nombre,'B'+f.n)!==null&&e.leer(hoja.nombre,'A'+f.n)!==null)||documento.modelosRegistro?.[hoja.nombre];
  if (!cabecera || !modelo) return [];
  return cabecera.celdas.map(c=>{
    const col=c.ref.replace(/\d+$/,''), ejemplo=modelo.celdas.find(x=>x.ref===col+modelo.n);
    return {col,nombre:String(c.valor),fecha:ejemplo?.fecha||false,numerico:typeof ejemplo?.valor==='number',formula:typeof ejemplo?.valor==='string'&&ejemplo.valor.startsWith('=')};
  }).filter(c=>inventario?c.col!=='A'&&!c.formula:!['B','C','D'].includes(c.col));
}

// Extiende solo la tabla seleccionada. Los rangos que ya cubren filas vacías no cambian.
export function agregarRegistroPersonal(documento, indice, valores) {
  const d=normalizarDocumentoPersonal(documento), hoja=d.hojas[indice], campos=camposRegistroPersonal(d,indice);
  if (!campos.length) throw new Error('Esta hoja no es un registro de movimientos o activos.');
  const inventario=hoja.nombre==='Inventario', e=evaluarHojas(d), desde=inventario?5:6;
  const existentes=hoja.filas.filter(f=>f.n>=desde&&typeof e.leer(hoja.nombre,'A'+f.n)==='number'&&(inventario?e.leer(hoja.nombre,'B'+f.n)!==null:['Ingreso','Gasto','Ahorro','Reserva'].includes(e.leer(hoja.nombre,'E'+f.n))));
  const anterior=existentes.at(-1)||d.modelosRegistro?.[hoja.nombre];
  if (!anterior) throw new Error('Falta una fila de referencia del archivo.');
  const n=existentes.length?anterior.n+1:desde;
  if (n>=(inventario?1000:206)) throw new Error('Se alcanzó el límite de filas de la plantilla.');
  for (const c of campos) {
    const v=valores[c.col]??null;
    if (!scalar(v) || typeof v==='string'&&v.startsWith('=')) throw new Error('Revise los datos del registro.');
    if (c.numerico&&v!==null&&(typeof v!=='number'||v<0)) throw new Error(`${c.nombre}: indique un número no negativo.`);
  }
  const trasladar=formula=>formula.replace(/"(?:[^"]|"")*"|(?<![A-Za-z_])(\$?[A-Z]{1,3})(\$?)(\d+)\b/g,(m,col,fija,fila)=>col?(col+fija+(fija?fila:Number(fila)+n-anterior.n)):m);
  let celdas=anterior.celdas.filter(c=>typeof c.valor==='string'&&c.valor.startsWith('=')).map(c=>({...c,ref:c.ref.replace(/\d+$/,String(n)),valor:trasladar(c.valor),resultado:null}));
  const poner=(col,valor,fecha=false)=>{ const ref=col+n, modelo=anterior.celdas.find(c=>c.ref===col+anterior.n);celdas=celdas.filter(c=>c.ref!==ref);celdas.push({ref,valor,resultado:null,fecha,formato:modelo?.formato||'General',negrita:false}); };
  campos.forEach(c=>poner(c.col,valores[c.col]??null,c.fecha));
  if (inventario) {
    const extensa=['activos-carlos','activos-juan'].includes(d.id);
    if (!valores.B || valores.F===null || valores.F===undefined || !Number.isFinite(valores.E) || !(valores[extensa?'I':'H']>0) || !Number.isFinite(valores[extensa?'N':'L'])) throw new Error('Complete nombre, año, costo, vida útil y valor residual.');
    poner('A',Math.max(0,...existentes.map(f=>e.leer('Inventario','A'+f.n)))+1);
  } else {
    if (!Number.isFinite(valores.A)||!['Ingreso','Gasto','Ahorro','Reserva'].includes(valores.E)||typeof valores.F!=='string'||!valores.F||typeof valores.H!=='number'||valores.H<0) throw new Error('Complete fecha, tipo, categoría y monto.');
    const seguimiento=d.hojas.find(h=>h.nombre==='Seguimiento');
    const corte=seguimiento?.filas.find(f=>{const a=e.leer('Seguimiento','C'+f.n), b=e.leer('Seguimiento','D'+f.n);return typeof a==='number'&&typeof b==='number'&&valores.A>=a&&valores.A<=b;});
    if (!corte) throw new Error('La fecha no pertenece a los cortes del archivo.');
    if (hoja.nombre!=='Registro semanal') {
      const meses=['Agosto','Septiembre','Octubre'], mes=new Date(fechaSerial(valores.A)+'T00:00:00Z').getUTCMonth();
      if (hoja.nombre!=='Registro '+meses[mes-7]) throw new Error('Seleccione la hoja del mes correspondiente a la fecha.');
    }
    poner('B',e.leer('Seguimiento','B'+corte.n));poner('C',e.leer('Seguimiento','C'+corte.n),true);poner('D',e.leer('Seguimiento','D'+corte.n),true);
  }
  celdas.sort((a,b)=>columnaNumero(a.ref.replace(/\d+$/,''))-columnaNumero(b.ref.replace(/\d+$/,'')));
  hoja.filas=hoja.filas.filter(f=>f.n!==n);hoja.filas.push({n,celdas});hoja.filas.sort((a,b)=>a.n-b.n);
  if (inventario) {
    for (const h of d.hojas) for (const f of h.filas) for (const c of f.celdas) if (typeof c.valor==='string'&&c.valor.startsWith('=')) {
      c.valor=c.valor.replace(/(Inventario!\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?)(\d+)/g,(m,pref,fin)=>Number(fin)===anterior.n?pref+n:m);
    }
    const evaluacion=d.hojas.find(h=>h.nombre==='Evaluación'), ultima=evaluacion?.filas.at(-1);
    if (ultima) evaluacion.filas.push({n:ultima.n+1,celdas:ultima.celdas.map(c=>({...c,ref:c.ref.replace(/\d+$/,String(ultima.n+1)),valor:typeof c.valor==='string'&&c.valor.startsWith('=')?c.valor.replace(/(Inventario![A-Z]+)(\d+)/g,(m,col,fila)=>col+(Number(fila)+1)):c.valor,resultado:null}))});
  }
  // Mantiene las columnas originales, incluyendo las que no tenían datos en la nueva fila.
  hoja.columnas=Math.max(hoja.columnas,...celdas.map(c=>columnaNumero(c.ref.replace(/\d+$/,''))));
  const resultado=normalizarDocumentoPersonal(d), prueba=comprobarDocumentoPersonal(resultado);
  if (prueba.errores.length) throw new Error(prueba.errores[0].motivo);
  return resultado;
}

export function quitarRegistroPersonal(documento, indice, fila) {
  const d=normalizarDocumentoPersonal(documento), h=d.hojas[indice];
  if (!camposRegistroPersonal(d,indice).length||fila<(h.nombre==='Inventario'?5:6)) throw new Error('No se puede eliminar esta fila.');
  h.filas=h.filas.filter(f=>f.n!==fila);
  return d;
}
