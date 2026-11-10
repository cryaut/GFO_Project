// Prueba de navegación en una copia aislada. No usa el perfil del usuario.
const assert = require('node:assert/strict');
const { readFile, writeFile, mkdir } = require('node:fs/promises');
const { createServer } = require('node:http');
const { resolve, join, sep, extname } = require('node:path');
const { homedir } = require('node:os');
const { chromium } = require(process.env.GFO_PLAYWRIGHT_PATH
  || join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = resolve(__dirname, '../../..');
const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html';
    const f = resolve(root, p);
    if (!f.startsWith(root + sep) || p.split(/[\\/]/).some(s => s.startsWith('.')) || p.includes('node_modules')) { res.writeHead(403); res.end(); return; }
    const bytes = await readFile(f);
    res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[extname(f)] || 'application/octet-stream' }); res.end(bytes);
  } catch { res.writeHead(404); res.end(); }
});

(async()=>{
 await mkdir(join(__dirname,'capturas'),{recursive:true});
 let browser;const evidencia={recorridos:[],variantes:[],errores:[]};
 try{
  await new Promise(done=>server.listen(0,'127.0.0.1',done));browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});let aceptar=true;
  page.on('dialog',d=>aceptar?d.accept():d.dismiss());page.on('pageerror',e=>evidencia.errores.push(e.message));
  await page.route('https://cdn.jsdelivr.net/**',r=>r.abort());
  const url=`http://127.0.0.1:${server.address().port}/`;
  const ir=async ruta=>{await page.goto(url+'?qa='+Date.now()+'#/'+ruta,{waitUntil:'domcontentloaded'});await page.locator('#page-'+ruta+'.active').waitFor();};
  const abrir=()=>page.locator('#example-inicioEmpresa').evaluate(el=>el.closest('details').open=true);
  const datos=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('gfo-toolkit-data')||'{}'));
  const cargar=async id=>{await abrir();await page.locator('#example-inicioEmpresa').selectOption(id);await page.locator('#inicioEjemplo').click();};
  await ir('home');await abrir();
  const antes=await datos();await page.locator('#example-inicioEmpresa').selectOption('agricorp-historico');assert.deepEqual(await datos(),antes);
  aceptar=false;await page.locator('#inicioEjemplo').click();assert.deepEqual(await datos(),antes);
  aceptar=true;await page.locator('#inicioEjemplo').click();
  assert.match((await datos()).estados.name,/Corporación/);
  assert.equal(await page.locator('#example-inicioEmpresa').count(),1);
  assert.match(await page.locator('#page-home').innerText(),/190,033,364.00/);
  for(const ruta of ['analisis','flujo','proforma','reportes']){
   await ir(ruta);
   if(ruta==='analisis')await page.locator('#analysis-tab-efe').click();
   if(ruta==='reportes'){await page.locator('[data-tab=export]').click();await page.locator('#btnPreviewHTML').click();}
   const texto=await page.locator('#page-'+ruta).innerText();assert.match(texto,/190,033,364.00/,ruta);assert.ok(!texto.includes('-145,444,600'),ruta);
  }
  evidencia.recorridos.push('Caso real: CFO 190033364 coincidente en Inicio, Análisis, Flujo, Proforma y Reportes');
  await ir('home');const previo=await datos();
  await page.evaluate(()=>{window.qaSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('cuota de prueba');};});
  await cargar('agricorp-simulado');assert.deepEqual(await datos(),previo);
  assert.match(await page.locator('#toast-container').innerText(),/cuota de prueba/);
  await page.evaluate(()=>{Storage.prototype.setItem=window.qaSet;delete window.qaSet;});
  await cargar('agricorp-simulado');assert.match((await datos()).estados.name,/SIMULADA/);
  assert.equal(await page.locator('#example-inicioEmpresa').count(),1);
  assert.match(await page.locator('#page-home').innerText(),/1,075,760.00/);
  for(const ruta of ['analisis','flujo','proforma','reportes']){
   await ir(ruta);
   if(ruta==='analisis')await page.locator('#analysis-tab-efe').click();
   if(ruta==='reportes'){await page.locator('[data-tab=export]').click();await page.locator('#btnPreviewHTML').click();}
   const texto=await page.locator('#page-'+ruta).innerText();assert.match(texto,/1,075,760.00/,ruta);
   assert.match(texto,/2027-06.*2027-09|2027-06[\s\S]*2027-09/,ruta);
  }
  evidencia.recorridos.push('Cuota agotada conserva caso completo y reintento cambia de real a simulado; selector permanente y cancelación sin guardado');
  await ir('planeacion');await page.locator('#planVer-tablas').click();
  assert.match(await page.locator('#page-planeacion').innerText(),/2,380,760.00/);
  await ir('equilibrio');assert.match(await page.locator('#page-equilibrio').innerText(),/1,800/);
  await ir('inventario');assert.match(await page.locator('#page-inventario').innerText(),/1,000/);
  evidencia.recorridos.push('Simulado: caja final 2380760, PE 1800 sacos e inventario final 1000');
  for(const width of [1440,390,320])for(const tema of ['light','dark']){
   await page.setViewportSize({width,height:1000});
   for(const ruta of ['home','analisis','proforma','flujo']){
    await ir(ruta);await page.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important;}'});
    await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),tema);
    if(ruta==='home')await abrir();if(ruta==='analisis')await page.locator('#analysis-tab-efe').click();
    const m=await page.evaluate(()=>({total:document.documentElement.scrollWidth,viewport:innerWidth}));
    if(m.total>m.viewport+1)console.log(JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('#page-'+location.hash.slice(2)+' *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(-25).map(e=>({tag:e.tagName,id:e.id,clase:e.className,texto:e.textContent.slice(0,90),right:e.getBoundingClientRect().right})))));
    assert.ok(m.total<=m.viewport+1,JSON.stringify({ruta,tema,...m}));
    if((width===1440&&tema==='light')||(width===390&&tema==='dark')){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:join(__dirname,'capturas',ruta+'-'+width+'.png'),fullPage:false});}
    evidencia.variantes.push({ruta,width,tema,desborde:false});
   }
  }
  // Editar los estados invalida el documento publicado, sin mostrar una estimación alternativa.
  await page.evaluate(async()=>{const s=(await import('/js/store.js')).default;const d=structuredClone(s.get('estados'));d.balanceGeneral['2027-09'].activos.Efectivo++;s.setPersisted('estados',d);});
  await ir('analisis');await page.locator('#analysis-tab-efe').click();
  assert.match(await page.locator('#tab-efe').innerText(),/Los estados cambiaron/);
  assert.match(await page.locator('#tab-efe').innerText(),/N\/D/);
  evidencia.recorridos.push('Cambiar estados invalida el flujo suministrado y conserva N/D con causa');
  assert.deepEqual(evidencia.errores,[]);
  await writeFile(join(__dirname,'navegador.json'),JSON.stringify(evidencia,null,2));
  console.log(JSON.stringify({recorridos:evidencia.recorridos,variantes:evidencia.variantes.length,errores:evidencia.errores}));
 }finally{if(browser)await browser.close();await new Promise(done=>server.close(done));}
})().catch(e=>{console.error(e);process.exitCode=1;});
