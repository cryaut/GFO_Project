import { writeFile, readFile } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { pathToFileURL } from 'node:url';
const root=resolve(process.argv[2]), salida=resolve(process.argv[3]||'.');
globalThis.document={getElementById:()=>null,addEventListener:()=>{}};
globalThis.window={addEventListener:()=>{}};
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const cargar=p=>import(pathToFileURL(join(root,p)));
const cat=await cargar('js/examples/catalogo.js');
const estados=await cargar('js/modules/estados/index.js');
const presentacion=await cargar('js/modules/estados/estados-presentacion-calculations.js');
const razones=await cargar('js/modules/razones/razones-app-adapter.js');
const analisis=await cargar('js/modules/analisis/analisis-calculations.js');
const flujo=await cargar('js/modules/flujo/flujo-calculations.js');
const equilibrio=await cargar('js/modules/equilibrio/equilibrio-calculations.js');
const planeacion=await cargar('js/modules/planeacion/planeacion-calculations.js');
const escenarios=await cargar('js/modules/planeacion/planeacion-escenarios.js');
const inventario=await cargar('js/modules/inventario/inventario-calculations.js');
const personal=await cargar('js/modules/presupuesto/index.js');
const mercado=await cargar('js/modules/analisis/mercado-calculations.js');
const proforma=await cargar('js/modules/proforma/proforma-calculations.js');
const efe=await cargar('js/modules/analisis/efe-calculations.js');
const eoaf=await cargar('js/modules/analisis/eoaf-calculations.js');
const apal=await cargar('js/modules/apalancamiento/apalancamiento-calculations.js');
const activos=await cargar('js/modules/activos/index.js');
const cal=await cargar('js/utils/calculate.js');
const entrada={catalogo:{},estados:{},flujo:{},equilibrio:{},planeacion:{},inventario:{},presupuesto:{},mercado:{},activos:activos.ejemploActivos()}, app={estados:{},flujo:{},equilibrio:{},planeacion:{},inventario:{},presupuesto:{},mercado:{},activos:[]};
for(const m of ['estados','flujo','equilibrio','planeacion','inventario','presupuesto','mercado','inicioEmpresa','inicioPersonal'])entrada.catalogo[m]=cat.listarEjemplos(m);
const seguro=fn=>{try{return fn();}catch(e){return {error:e.message};}};
for(const {id} of entrada.catalogo.estados){
 const d=cat.crearEjemplo('estados',id,()=>estados.DEMO_MUNOMODA);entrada.estados[id]=d;
 const p=d.periods;app.estados[id]={periodos:{},ah:analisis.analisisHorizontalCompleto(d,p),efe:seguro(()=>efe.construirEFE(d,p[0],p.at(-1))),eoaf:seguro(()=>eoaf.construirEOAF(d,p[0],p.at(-1))),realProforma:proforma.resultadosReales(d),apalancamiento:seguro(()=>apal.calcularApalancamiento(d))};
 for(const periodo of p)app.estados[id].periodos[periodo]={resueltos:presentacion.estadosResueltos(d,periodo),razones:razones.computarRazonesDesdeDatos(d,periodo),dupont:analisis.detalleDuPont(d,periodo),av:analisis.analisisVerticalCompleto(d,periodo)};
 for(const {id:mid}of entrada.catalogo.mercado){const clave=id+'/'+mid,dato=cat.crearEjemplo('mercado',mid,()=>mercado.ejemploMercado(p));entrada.mercado[clave]=dato;app.mercado[clave]=mercado.calcularRazonesMercado(d,dato);}
}
for(const [m,fabrica,normalizar,calcular]of [
 ['flujo',flujo.ejemploFlujo,flujo.normalizarFlujo,flujo.calcularFlujo],
 ['equilibrio',equilibrio.ejemploEquilibrio,equilibrio.normalizarEquilibrio,equilibrio.calcularCVU],
 ['planeacion',planeacion.ejemploPlaneacion,planeacion.normalizarSupuestos,planeacion.calcularPresupuestoMaestro],
 ['inventario',inventario.ejemploInventario,inventario.normalizarInventario,inventario.calcularInventario]
])for(const{id}of entrada.catalogo[m]){const d=normalizar(cat.crearEjemplo(m,id,fabrica));entrada[m][id]=d;app[m][id]=calcular(d);if(m==='equilibrio')app[m][id].escenarios=equilibrio.calcularEscenarios(d);if(m==='planeacion')app[m][id].proforma=proforma.resultadosProforma(app[m][id]);}
for(const{id}of entrada.catalogo.presupuesto){const d=cat.crearEjemplo('presupuesto',id,personal.ejemploPresupuestoPersonal);entrada.presupuesto[id]=d;const c=personal.presupuestoCalculations,I=c.totalIngresos(d.ingresos),G=c.totalGastos(d.gastos),A=c.ahorroMensual(d.metaAhorro,d.mesesDisponibles);app.presupuesto[id]={ingresos:I,gastos:G,ahorroMensual:A,capacidad:cal.capacidadAhorro(I,G),tasaAhorro:cal.tasaAhorro(cal.capacidadAhorro(I,G),I),distribucion:c.distribucion(d.gastos),saldoDisponible:cal.saldoSemanal(I,G,A),balance:c.validarBalance(I,d.gastos,A,0)};}
for(const d of entrada.activos){const anual=cal.depAnualLineaRecta(d.costoOriginal,d.valorResidual,d.vidaUtil),acum=cal.depAcumulada(anual,d.aniosConsumidos,d.vidaUtil);app.activos.push({nombre:d.nombre,anual,acumulada:acum,libros:cal.valorEnLibros(d.costoOriginal,acum),score:d.condicion.score,estado:activos.calcularEstado(d)});}
const ref=JSON.parse(await readFile(join(root,escenarios.ARCHIVO_REFERENCIA),'utf8')),ins=JSON.parse(await readFile(join(root,escenarios.ARCHIVO_ENTRADAS),'utf8'));
const caso=escenarios.crearCasoComercial(null,ref,ins),lectura=escenarios.leerPlaneacion(caso);entrada.referencia={inputs:ins,referencia:ref,caso,lectura};app.referencia=planeacion.calcularCapitalTrabajo(lectura.supuestos,lectura.escenario.capitalTrabajo,lectura.base.fechaCorte);
const inicio=await cargar('js/modules/inicio/inicio-calculations.js');
const analisisIndex=await cargar('js/modules/analisis/index.js');
const recoleccion=await cargar('js/modules/proforma/index.js');
const store=(await cargar('js/store.js')).default;
app.consumidores={};
for(const [id,d]of Object.entries(entrada.estados)){
 store.setPersisted('estados',d);store.setPersisted('planeacion',{supuestos:entrada.planeacion.actual});
 const e=recoleccion.reunirEntradas(),reporte=proforma.construirReporte(e);
 app.consumidores[id]={capitalTrabajo:analisisIndex.computeCNTCNO(d.periods.at(-1)),inicio:inicio.panoramaGeneral(e,reporte),proforma:reporte};
}
app.diagnosticos={mercadoDocente:{},tor:{}};
for(const [id,shares]of [['baker',[100000,100000]],['bartlett',[76244,76262]]]){
 const d=entrada.estados[id],datos={periodos:Object.fromEntries(d.periods.map((p,i)=>[p,{acciones:shares[i],precio:null,dividendos:null}]))};
 app.diagnosticos.mercadoDocente[id]=mercado.calcularRazonesMercado(d,datos,Object.fromEntries(d.periods.map(p=>[p,10000])));
}
for(const q of [100000,120000]){const mc=q*4.5,uaii=mc-250000,uai=uaii-80000;app.diagnosticos.tor[q]={gao:cal.gao(mc,uaii),gaf:cal.gaf(uaii,uai,40000,.4),gat:cal.gat(mc,uai,40000,.4),upa:cal.utilidadPorAccion(uai*.6-40000,20000)};}
await writeFile(join(salida,'entradas-app.json'),JSON.stringify(entrada,null,2));
await writeFile(join(salida,'resultados-app.json'),JSON.stringify(app,null,2));
console.log(JSON.stringify({estados:Object.keys(app.estados),flujos:Object.keys(app.flujo),equilibrio:Object.keys(app.equilibrio),planeacion:Object.keys(app.planeacion),inventario:Object.keys(app.inventario),personal:Object.keys(app.presupuesto),mercado:Object.keys(app.mercado),activos:app.activos.length,referencia:!!app.referencia}));
