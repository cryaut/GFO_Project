import { escapeHTML as esc } from '../../utils/html.js';
import { exportJSON } from '../../utils/export.js';
import { panelEjemplos, vincularEjemplos, ejemploSeleccionado, prepararEjemplo } from '../../components/ejemplos.js';
import { columnaNumero, columnaLetra, fechaSerial, serialFecha } from '../../utils/hojas-formulas.js';
import { normalizarDocumentoPersonal, comprobarDocumentoPersonal, contrastarActivosPersonales, inventarioDocumentoPersonal, camposRegistroPersonal, agregarRegistroPersonal, quitarRegistroPersonal } from './personales-calculations.js';

const numero=v=>new Intl.NumberFormat('es-NI',{maximumFractionDigits:2}).format(v);
function presentar(c, v) {
  if (v===null) return typeof c?.valor==='string'&&c.valor.startsWith('=')?'N/D':'';
  if (v==='') return '';
  if (c?.fecha && typeof v==='number') return fechaSerial(v).split('-').reverse().join('/');
  if (typeof v==='number') {
    const formato=c?.formato||'General', decimales=/\.([0#]+)/.exec(formato.split(';')[0])?.[1];
    const minimo=decimales?(decimales.match(/0/g)||[]).length:0, maximo=decimales?decimales.length:formato==='General'?10:0;
    if (formato.includes('%')) return new Intl.NumberFormat('es-NI',{style:'percent',minimumFractionDigits:minimo,maximumFractionDigits:maximo}).format(v);
    const cifra=new Intl.NumberFormat('es-NI',{minimumFractionDigits:minimo,maximumFractionDigits:maximo}).format(v);
    return formato.includes('C$')?'C$ '+cifra:formato.includes('$')?'$ '+cifra:cifra;
  }
  return String(v);
}
const referencia = ref => { const m=/^([A-Z]+)(\d+)$/.exec(ref); return {col:columnaNumero(m[1]),fila:Number(m[2])}; };

// Vista acotada al ejemplo que declara su documento. Los ejemplos habituales no entran aquí.
export function documentoPersonalUI(page, { documento, modulo, guardar, alEjemplo, ejemploBase=()=>null, herramientas='' }) {
  let datos=normalizarDocumentoPersonal(documento), indice=0, vacias=false, mensaje='';
  function montar() {
    const calculo=comprobarDocumentoPersonal(datos);
    page.innerHTML=`<div class="personal-source"><header class="personal-source-header"><div><h1>${modulo==='activos'?'Activos del hogar':'Presupuesto personal'}</h1><p class="personal-owner">${esc(datos.nombre)}</p><p class="personal-filename">${esc(datos.archivo)}</p></div>
      <details class="student-tools"><summary>Ejemplos y datos</summary><div class="student-disclosure">${panelEjemplos(modulo,'personalCargarEjemplo')}<div class="student-actions"><button class="btn btn-secondary" id="personalExportar">Descargar respaldo</button>${herramientas}</div></div></details></header>
      <p class="personal-source-status" id="personalMensaje" role="status">${esc(mensaje)}</p>
      ${datos.avisos.length?`<details class="personal-source-notes"${datos.id==='presupuesto-cris'?' open':''}><summary>Observaciones del archivo (${datos.avisos.length})</summary>${datos.avisos.map(a=>`<p>${esc(a)}</p>`).join('')}</details>`:''}
      <nav class="personal-sheet-nav" aria-label="Hojas del archivo original">${datos.hojas.map((h,i)=>`<button class="btn btn-secondary" type="button" data-hoja="${i}" aria-pressed="${i===indice}">${esc(h.nombre)}</button>`).join('')}${datos.tipo==='docx'?'<button class="btn btn-secondary" data-documento aria-pressed="true">Documento original</button>':''}${modulo==='activos'?'<button class="btn btn-secondary" type="button" id="personalCalculos">Cálculos de la app</button>':''}</nav>
      <div id="personalContenido"></div>
      <details class="personal-source-check"><summary>Comprobación de cálculos y procedencia</summary><p>${calculo.formulas} fórmulas originales recalculadas. ${calculo.errores.length} errores de cálculo. ${calculo.diferencias.length} diferencias respecto a los resultados guardados en el archivo.</p>
      ${calculo.sinResultado?`<p>${calculo.sinResultado} fórmulas no tenían resultado guardado en el XLSX; se calculan desde sus expresiones originales.</p>`:''}
      ${calculo.diferencias.length?'<p>Si editaste datos, las diferencias muestran el efecto de tus cambios; no se altera el resultado guardado del archivo de origen.</p>':''}
      ${calculo.errores.map(e=>`<p>${esc(e.hoja)}!${esc(e.ref)}: ${esc(e.motivo)}</p>`).join('')}
      ${calculo.diferencias.slice(0,30).map(d=>`<p>${esc(d.hoja)}!${esc(d.ref)}: original ${esc(String(d.original))}; actual ${esc(String(d.actual))}.</p>`).join('')}
      <p>SHA-256 del archivo recibido: <code>${esc(datos.sha256)}</code>. Las actividades y recomendaciones del documento se conservan como contenido de la fuente.</p></details>
      <dialog class="personal-cell-dialog" id="personalDialogo"><form id="personalEditar"><h2 id="personalCeldaTitulo"></h2><div id="personalCeldaDetalle"></div><div class="student-actions"><button class="btn btn-primary" id="personalGuardarCelda" type="submit">Guardar dato</button><button class="btn btn-secondary" id="personalCerrarCelda" type="button">Cerrar</button></div><p id="personalErrorCelda" role="alert"></p></form></dialog></div>`;
    vincularEjemplos(page,modulo);
    page.querySelector('#personalCargarEjemplo').addEventListener('click',async ()=>{
      if (!window.confirm('¿Reemplazar los datos de este módulo con el ejemplo seleccionado? Puedes descargar un respaldo antes.')) return;
      try { await prepararEjemplo(page,modulo); alEjemplo(ejemploSeleccionado(page,modulo,ejemploBase)); }
      catch(error) { page.querySelector('#personalMensaje').textContent=`No se cargó: ${error.message}`; }
    });
    page.querySelector('#personalExportar').addEventListener('click',()=>exportJSON(modulo==='activos'?{activos:{documento:datos,inventario:inventarioDocumentoPersonal(datos)}}:{presupuesto:{vista:'estudiantil',estudiantil:{version:2,documento:datos}}},datos.id+'.json'));
    page.querySelectorAll('[data-hoja]').forEach(b=>b.addEventListener('click',()=>{indice=Number(b.dataset.hoja);mostrarHoja(calculo);}));
    page.querySelector('[data-documento]')?.addEventListener('click',mostrarDocumento);
    page.querySelector('#personalCalculos')?.addEventListener('click',mostrarCalculos);
    if (datos.tipo==='docx') mostrarDocumento(); else mostrarHoja(calculo);
  }
  function seleccionar(indiceHoja) {
    page.querySelectorAll('[data-hoja]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.hoja)===indiceHoja)));
    page.querySelector('[data-documento]')?.setAttribute('aria-pressed',String(indiceHoja===-1));
    page.querySelector('#personalCalculos')?.setAttribute('aria-pressed',String(indiceHoja===-2));
  }
  function mostrarHoja(calculo) {
    seleccionar(indice); const hoja=datos.hojas[indice], mapa=new Map(hoja.filas.flatMap(f=>f.celdas.map(c=>[c.ref,c])));
    const combinadas=hoja.combinadas.map(m=>{const [a,b]=m.split(':').map(referencia);return {a,b};});
    let filas='';
    const porFila=new Map(hoja.filas.map(f=>[f.n,f]));
    for (let n=1;n<=(hoja.filas.at(-1)?.n||0);n++) {
      const f=porFila.get(n)||{n,celdas:[]};
      const valores=f.celdas.map(c=>calculo.leer(hoja.nombre,c.ref));
      const combinadaVertical=combinadas.some(m=>n>=m.a.fila&&n<=m.b.fila&&m.a.fila!==m.b.fila);
      if (!vacias && !combinadaVertical && valores.every(v=>v===null||v==='')) continue;
      let celdas='';
      for (let col=1;col<=hoja.columnas;col++) {
        const ref=columnaLetra(col)+f.n, c=mapa.get(ref), valor=calculo.leer(hoja.nombre,ref);
        const combinada=combinadas.find(m=>f.n>=m.a.fila&&f.n<=m.b.fila&&col>=m.a.col&&col<=m.b.col);
        if (combinada&&(combinada.a.fila!==f.n||combinada.a.col!==col)) continue;
        const span=combinada?` colspan="${combinada.b.col-col+1}" rowspan="${combinada.b.fila-f.n+1}"`:'';
        const contenido=presentar(c,valor), formula=typeof c?.valor==='string'&&c.valor.startsWith('=');
        celdas+=`<td${span} class="${typeof valor==='number'?'personal-numeric ':''}${c?.negrita?'personal-bold ':''}${formula?'personal-formula':''}">${contenido!==''?`<button type="button" class="personal-cell" data-celda="${ref}" aria-label="${esc(ref+': '+contenido)}">${esc(contenido)}</button>`:''}</td>`;
      }
      filas+=`<tr><th class="personal-row-number" scope="row">${f.n}</th>${celdas}</tr>`;
    }
    page.querySelector('#personalContenido').innerHTML=`<section class="personal-sheet"><div class="personal-sheet-heading"><div><h2>${esc(hoja.nombre)}</h2><p>Columnas y orden del archivo. Selecciona una celda para ver su cálculo o editar su dato.</p>${hoja.oculta?'<p>Esta hoja estaba oculta en el archivo original.</p>':''}</div><label class="personal-empty-toggle"><input type="checkbox" id="personalVacias"${vacias?' checked':''}> Mostrar filas vacías de la plantilla</label></div>
      ${camposRegistroPersonal(datos,indice).length?`<div class="student-actions"><button class="btn btn-primary" id="personalNuevoRegistro">${hoja.nombre==='Inventario'?'Añadir activo':'Registrar movimiento'}</button></div>`:''}<p class="form-hint">La tabla se desplaza horizontalmente para conservar todas las columnas.</p><div class="personal-table-scroll" tabindex="0" role="region" aria-label="${esc(hoja.nombre)}: tabla completa"><table class="personal-sheet-table"><colgroup><col class="personal-index-col">${Array.from({length:hoja.columnas},()=>'<col>').join('')}</colgroup><thead><tr><th aria-label="Fila"></th>${Array.from({length:hoja.columnas},(_,i)=>`<th scope="col">${columnaLetra(i+1)}</th>`).join('')}</tr></thead><tbody>${filas}</tbody></table></div></section>`;
    page.querySelector('#personalNuevoRegistro')?.addEventListener('click',nuevoRegistro);
    page.querySelector('#personalVacias').addEventListener('change',event=>{vacias=event.target.checked;mostrarHoja(calculo);});
    page.querySelectorAll('[data-celda]').forEach(b=>b.addEventListener('click',()=>editarCelda(hoja,mapa.get(b.dataset.celda),calculo)));
    const anexos=[...(datos.textosAdicionales||[]).flatMap(t=>t.textos),...(datos.comentarios||[]).filter(c=>c.hoja===hoja.nombre).map(c=>`${c.ref} · ${c.autor}: ${c.texto}`),...(datos.enlaces||[]).filter(e=>e.hoja===hoja.nombre).map(e=>`${e.ref}: ${e.destino}`)];
    if (anexos.length) page.querySelector('#personalContenido').insertAdjacentHTML('beforeend',`<section class="personal-source-annex"><h3>Notas del archivo</h3>${anexos.map(t=>`<p>${esc(t)}</p>`).join('')}</section>`);
  }
  function editarCelda(hoja,c,calculo) {
    if (!c) return;
    const dialogo=page.querySelector('#personalDialogo'), formula=typeof c.valor==='string'&&c.valor.startsWith('='), numerica=typeof c.valor==='number'||typeof c.resultado==='number';
    page.querySelector('#personalCeldaTitulo').textContent=hoja.nombre+' · '+c.ref;
    page.querySelector('#personalCeldaDetalle').innerHTML=formula?`<p>Resultado recalculado: <strong>${esc(presentar(c,calculo.leer(hoja.nombre,c.ref)))}</strong></p><p>Expresión original:</p><pre>${esc(c.valor)}</pre><p>Resultado guardado en el archivo: ${esc(presentar(c,c.resultado))||'Sin resultado guardado'}</p>`:`<label for="personalValorCelda">Dato del archivo</label><input class="form-input" id="personalValorCelda" type="${c.fecha?'date':numerica?'number':'text'}"${numerica?' step="any"':''} value="${esc(c.fecha?(typeof c.valor==='number'?fechaSerial(c.valor):''):String(c.valor??''))}"><p>Las fórmulas que usan este dato se actualizan al guardar.</p>`;
    page.querySelector('#personalGuardarCelda').hidden=formula;
    const fila=referencia(c.ref).fila;
    if (camposRegistroPersonal(datos,indice).length && typeof calculo.leer(hoja.nombre,'A'+fila)==='number') {
      page.querySelector('#personalCeldaDetalle').insertAdjacentHTML('beforeend','<button type="button" class="btn btn-danger" id="personalQuitarRegistro">Eliminar registro completo</button>');
      page.querySelector('#personalQuitarRegistro').onclick=()=>{
        if (!window.confirm('¿Eliminar la fila '+fila+' completa de '+hoja.nombre+'? Puedes descargar un respaldo antes.')) return;
        try { const limpio=quitarRegistroPersonal(datos,indice,fila);guardar(limpio);datos=limpio;mensaje='Registro eliminado. Se conservaron las demás filas y columnas.';dialogo.close();montar(); }
        catch(error) {page.querySelector('#personalErrorCelda').textContent=`No se guardó: ${error.message}`;}
      };
    }
    page.querySelector('#personalErrorCelda').textContent='';
    page.querySelector('#personalCerrarCelda').onclick=()=>dialogo.close();
    page.querySelector('#personalEditar').onsubmit=event=>{
      event.preventDefault(); if (formula) return;
      const input=page.querySelector('#personalValorCelda'), texto=input.value;
      try {
        if (!input.checkValidity() || texto.startsWith('=') || texto.length>12000) throw new Error('Indique un dato válido; las fórmulas originales se conservan.');
        const candidato=structuredClone(datos), celda=candidato.hojas[indice].filas.flatMap(f=>f.celdas).find(x=>x.ref===c.ref);
        celda.valor=texto===''?null:c.fecha?serialFecha(texto):numerica?Number(texto):texto;
        if (typeof celda.valor==='number'&&!Number.isFinite(celda.valor)) throw new Error('Importe o fecha inválida.');
        const limpio=normalizarDocumentoPersonal(candidato), revision=comprobarDocumentoPersonal(limpio);
        if (revision.errores.length) throw new Error(revision.errores[0].motivo);
        guardar(limpio); datos=limpio;mensaje='Dato guardado. Se recalcularon sus dependencias; el resultado de origen se conserva para comparar.';dialogo.close();montar();
      } catch(error) { page.querySelector('#personalErrorCelda').textContent=`No se guardó: ${error.message}`; }
    };
    dialogo.showModal();
  }
  function mostrarDocumento() {
    seleccionar(-1);
    page.querySelector('#personalContenido').innerHTML=`<section class="personal-document"><h2>Documento original</h2><p>Selecciona un dato de las tablas para editarlo; consulta sus resultados con «Cálculos de la app». Los desarrollos escritos del documento se conservan como referencia.</p>${datos.bloques.map((b,bi)=>b.tipo==='tabla'?`<div class="personal-table-scroll"><table class="statement-table"><tbody>${b.filas.map((f,fi)=>`<tr>${f.map((c,i)=>i===0?`<th scope="row">${esc(c)}</th>`:`<td><button class="personal-cell" data-doc-b="${bi}" data-doc-f="${fi}">${esc(c)}</button></td>`).join('')}</tr>`).join('')}</tbody></table></div>`:/^Ejemplo [A-Z]\.|^[A-ZÁÉÍÓÚÑ ]{10,}$/.test(b.texto)?`<h3>${esc(b.texto)}</h3>`:`<p>${esc(b.texto)}</p>`).join('')}</section>`;
    page.querySelectorAll('[data-doc-b]').forEach(b=>b.addEventListener('click',()=>{
      const bi=Number(b.dataset.docB),fi=Number(b.dataset.docF), dialogo=page.querySelector('#personalDialogo');
      page.querySelector('#personalCeldaTitulo').textContent=datos.bloques[bi].filas[fi][0];
      page.querySelector('#personalCeldaDetalle').innerHTML=`<label for="personalTextoDocumento">Dato original</label><textarea class="form-input" id="personalTextoDocumento" rows="5" maxlength="12000">${esc(datos.bloques[bi].filas[fi][1])}</textarea>`;
      page.querySelector('#personalGuardarCelda').hidden=false;page.querySelector('#personalErrorCelda').textContent='';
      page.querySelector('#personalCerrarCelda').onclick=()=>dialogo.close();
      page.querySelector('#personalEditar').onsubmit=evento=>{
        evento.preventDefault();const candidato=structuredClone(datos);candidato.bloques[bi].filas[fi][1]=page.querySelector('#personalTextoDocumento').value;
        try {
          const limpio=normalizarDocumentoPersonal(candidato), activos=contrastarActivosPersonales(limpio);
          if (activos.some(a=>[a.costoOriginal,a.valorResidual,a.vidaUtil,a.aniosConsumidos,a.costoReposicion].some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0)||a.vidaUtil===0)) throw new Error('Conserva los importes, años y formato de los datos financieros.');
          guardar(limpio);datos=limpio;mensaje='Dato guardado. Consulta los resultados recalculados de la app; el desarrollo escrito se conserva como referencia.';dialogo.close();montar();
        } catch(error) {page.querySelector('#personalErrorCelda').textContent=`No se guardó: ${error.message}`;}
      };dialogo.showModal();
    }));
  }
  function nuevoRegistro() {
    const campos=camposRegistroPersonal(datos,indice), dialogo=page.querySelector('#personalDialogo'), inventario=datos.hojas[indice].nombre==='Inventario';
    page.querySelector('#personalCeldaTitulo').textContent=inventario?'Añadir activo':'Registrar movimiento';
    page.querySelector('#personalCeldaDetalle').innerHTML=`<p>Se conservan las columnas de este archivo. Los campos sin dato se dejan vacíos.</p><div class="student-form-grid">${campos.map(c=>`<div class="student-field"><label for="personalNuevo-${c.col}">${esc(c.nombre)}</label>${!inventario&&c.col==='E'?`<select class="form-select" id="personalNuevo-${c.col}">${['Ingreso','Gasto','Ahorro','Reserva'].map(t=>`<option>${t}</option>`).join('')}</select>`:`<input class="form-input" id="personalNuevo-${c.col}" type="${c.fecha?'date':c.numerico?'number':'text'}"${c.numerico?' step="any" min="0"':''} maxlength="12000">`}</div>`).join('')}</div>`;
    page.querySelector('#personalGuardarCelda').hidden=false;page.querySelector('#personalErrorCelda').textContent='';
    page.querySelector('#personalCerrarCelda').onclick=()=>dialogo.close();
    page.querySelector('#personalEditar').onsubmit=evento=>{
      evento.preventDefault();
      try {
        const valores=Object.fromEntries(campos.map(c=>{const t=page.querySelector('#personalNuevo-'+c.col).value;return [c.col,t===''?null:c.fecha?serialFecha(t):c.numerico?Number(t):t];}));
        const limpio=agregarRegistroPersonal(datos,indice,valores);guardar(limpio);datos=limpio;mensaje='Registro guardado. Las fórmulas del archivo y los totales se actualizaron.';dialogo.close();montar();
      } catch(error) {page.querySelector('#personalErrorCelda').textContent=`No se guardó: ${error.message}`;}
    };dialogo.showModal();
  }
  function mostrarCalculos() {
    seleccionar(-2);
    const activos=contrastarActivosPersonales(datos);
    page.querySelector('#personalContenido').innerHTML=`<section class="personal-sheet"><h2>Cálculos de la app</h2><p>Se usan las funciones existentes de depreciación en línea recta, depreciación acumulada y valor en libros. ${datos.id==='activos-cris'?'Este archivo redondea cada resultado a dos decimales.':'Se conserva precisión interna antes de presentar los importes.'}</p><p>${activos.length} bienes del archivo. ${datos.tipo==='docx'?'El símbolo $ se conserva sin asignarle una moneda.':'Importes en C$.'}</p><div class="personal-table-scroll" tabindex="0"><table class="statement-table"><thead><tr><th>Activo</th><th>Costo original</th><th>Vida útil</th><th>Edad</th><th>Valor residual</th><th>Depreciación anual</th><th>Depreciación acumulada</th><th>Valor en libros</th><th>Clasificación del archivo</th><th>Comprobación</th></tr></thead><tbody>${activos.map(a=>`<tr><th scope="row">${esc(a.nombre)}</th>${[a.costoOriginal,a.vidaUtil,a.aniosConsumidos,a.valorResidual,a.calculado.anual,a.calculado.acumulada,a.calculado.libros].map(n=>`<td class="text-right">${n===null?'N/D':numero(n)}</td>`).join('')}<td>${esc(a.clasificacionOriginal??'')}</td><td>${a.coincide===null?'Ver desarrollo del documento':a.coincide?'Coincide':'Revisar diferencia'}</td></tr>`).join('')}</tbody></table></div><details><summary>Ver procedimiento</summary><p>Depreciación anual = (costo − residual) ÷ vida útil. Depreciación acumulada = anual × mínimo(edad, vida útil). Valor en libros = costo − depreciación acumulada. La condición y la recomendación son las del archivo: no se inventan puntajes.</p></details></section>`;
  }
  montar();
}
