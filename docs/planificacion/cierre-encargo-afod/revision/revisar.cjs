// Prueba de navegación en una copia aislada. No usa el perfil del usuario.
const assert = require('node:assert/strict');
const { readFile, writeFile, mkdir } = require('node:fs/promises');
const { createServer } = require('node:http');
const { resolve, join, sep, extname } = require('node:path');
const { homedir } = require('node:os');
const { chromium } = require(process.env.GFO_PLAYWRIGHT_PATH
  || join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = resolve(__dirname, '../../../..');
const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html';
    const f = resolve(root, p);
    if (!f.startsWith(root + sep) || p.split(/[\\/]/).some(s => s.startsWith('.')) || p.includes('node_modules')) { res.writeHead(403); res.end(); return; }
    const bytes = await readFile(f);
    res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[extname(f)] || 'application/octet-stream' }); res.end(bytes);
  } catch { res.writeHead(404); res.end(); }
});

(async () => {
 let browser;
 const evidencia={recorridos:[],variantes:[],errores:[]};
 try {
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>evidencia.errores.push(e.message));
  page.on('dialog',d=>d.accept());
  await page.route('https://cdn.jsdelivr.net/**',r=>r.abort());
  const url=`http://127.0.0.1:${server.address().port}/`;
  const ir=async ruta=>{await page.goto(url+'?qa='+Date.now()+'#/'+ruta,{waitUntil:'domcontentloaded'});await page.locator('#page-'+ruta+'.active').waitFor();};
  const abrir=async selector=>page.locator(selector).evaluate(el=>el.closest('details').open=true);
  await mkdir(join(__dirname,'capturas'),{recursive:true});
  for(const ruta of ['home','estados','analisis','flujo','planeacion','proforma','equilibrio','inventario','apalancamiento','reportes','activos'])await ir(ruta);
  evidencia.recorridos.push('Once rutas sin errores de JavaScript');
  await ir('proforma');await abrir('#proformaAFOD');
  assert.ok(!(await page.locator('#proformaAFODResultado').innerText()).includes('+ Otros ingresos operativos netos'));
  for(const [id,cifras]of [['euro',['577,200.00','257,200.00']],['metro',['216,857.14','227,400.00']],['leonard',['53,000.00','17,000.00']],['electronicas',['52,562,500.00','7,274,000.00','106.59']]]){
   await page.locator('#proformaAFODCaso').selectOption(id);
   for(const cifra of cifras)assert.ok((await page.locator('#proformaAFODResultado').innerText()).includes(cifra),id+': '+cifra);
  }
  await page.locator('#proformaAFODCaso').selectOption('leonard');
  await page.locator('#proformaAFOD-dividendos').fill('17000');
  await page.locator('#proformaAFODForm button').click();
  assert.match(await page.locator('#proformaAFODResultado').innerText(),/323,000.00/);
  await page.locator('#proformaAFOD-tasaCxP').fill('');await page.locator('#proformaAFODForm button').click();
  assert.match(await page.locator('#proformaAFODResultado').innerText(),/N\/D/);
  evidencia.recorridos.push('Cuatro ejercicios de Proforma, dos métodos de Metroline, recálculo de Leonard y datos pendientes');
  await ir('planeacion');await page.locator('#planVer-caja').click();
  for(const [id,cifra]of [['pinolero1','14,150.00'],['pinolero2','488,850.00'],['halley','-16,000.00'],['halleyPrestamo','60,000.00'],['halleyRepago','41,000.00']]){
   await page.locator('#cajaDocCaso').selectOption(id);await page.locator('#cajaDocCargar').click();
   assert.ok((await page.locator('#cajaDocResultados').innerText()).includes(cifra),id);
  }
  await page.locator('#formCajaDocente button[value=guardar]').click();
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#planVer-caja').click();
  assert.match(await page.locator('#cajaDocResultados').innerText(),/41,000.00/);
  evidencia.recorridos.push('Cinco calendarios de caja; guardar y recargar conserva caja y presupuesto');
  for(const width of [1440,390,320])for(const tema of ['light','dark']){
   await page.setViewportSize({width,height:1000});await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),tema);
   for(const ruta of ['proforma','planeacion']){
    await ir(ruta);
    await page.addStyleTag({content:'*,*::before,*::after { transition:none!important; animation:none!important; }'});
    await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),tema);
    assert.equal(await page.evaluate(()=>document.documentElement.getAttribute('data-theme')),tema);
    if(ruta==='proforma'){await abrir('#proformaAFOD');await page.locator('#proformaAFODCaso').selectOption('metro');}
    else await page.locator('#planVer-caja').click();
    const sizes=await page.evaluate(()=>({width:innerWidth,total:document.documentElement.scrollWidth}));
    assert.ok(sizes.total<=sizes.width+1,JSON.stringify({ruta,tema,...sizes}));
    if((width===1440&&tema==='light')||(width===390&&tema==='dark')){
     await page.evaluate(()=>window.scrollTo(0,0));
     await page.screenshot({path:join(__dirname,'capturas',ruta+'-'+width+'.png'),fullPage:true});
    }
    evidencia.variantes.push({ruta,width,tema,desborde:false});
   }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(async()=>{
   const store=(await import('/js/store.js')).default;
   const {ejemploInventario}=await import('/js/modules/inventario/inventario-calculations.js');
   const {ejemploPlaneacion}=await import('/js/modules/planeacion/planeacion-calculations.js');
   store.setPersisted('inventario',{...ejemploInventario(),moneda:'USD'});
   store.setPersisted('planeacion',{supuestos:ejemploPlaneacion(),cajaDocente:store.get('planeacion.cajaDocente')});
  });
  await ir('planeacion');await page.locator('#planVer-supuestos').click();await abrir('#planTomarInventario');
  await page.locator('#planTomarInventario').click();
  assert.match(await page.locator('#planTraerVistaPrevia').innerText(),/Moneda incompatible/);
  assert.equal(await page.locator('#planTraerAplicar').isDisabled(),true);
  await page.evaluate(async()=>{const s=(await import('/js/store.js')).default;s.setPersisted('inventario',{...s.get('inventario'),moneda:'C$'});});
  await page.locator('#planTomarInventario').click();
  await page.evaluate(async()=>{const s=(await import('/js/store.js')).default;const d=structuredClone(s.get('inventario'));d.productos[0].existenciaInicial++;s.setPersisted('inventario',d);});
  await page.locator('#planTraerAplicar').click();
  assert.match(await page.locator('#planMensaje').innerText(),/Cambi[oó] la fuente/);
  await page.locator('#planTomarInventario').click();await page.locator('#planTraerAplicar').click();
  await page.locator('#formPlaneacion').evaluate(f=>f.requestSubmit());
  const stock=await page.evaluate(async()=>(await import('/js/store.js')).default.get('planeacion.supuestos.inventarioInicial'));
  assert.equal(stock,36);
  await ir('equilibrio');await abrir('#eqTraerPlaneacion');await page.locator('#eqTraerPlaneacion').click();
  await page.locator('#eqTraerAplicar').click();await page.locator('#formEquilibrio').evaluate(f=>f.requestSubmit());
  const ficha=await page.evaluate(async()=>(await import('/js/store.js')).default.get('equilibrio.procedencia.precio'));
  assert.equal(ficha.origen,'planeacion');
  evidencia.recorridos.push('Inventario → Planeación conserva moneda, bloquea origen desactualizado y guarda; Planeación → C-V-U conserva procedencia');
  await page.evaluate(async()=>{const s=(await import('/js/store.js')).default;const {ejemploEstadosResueltos}=await import('/tests/fixtures/estados-resueltos.js');const {registrarCuenta}=await import('/js/modules/estados/cuentas-registro.js');s.setPersisted('estados',registrarCuenta(ejemploEstadosResueltos(['2024']),{id:'bs.cash_and_equivalents',nombre:'Caja del caso de prueba',periodo:'2024',importe:5000}));});
  await ir('flujo');await abrir('#flujoTomarSaldo');await page.locator('#flujoTomarSaldo').click();
  const inicial=await page.evaluate(async()=>(await import('/js/store.js')).default.get('flujo'));
  await page.evaluate(()=>{window.qaSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('cuota agotada de prueba');};});
  await page.locator('#flujoTraerAplicar').click();
  assert.match(await page.locator('#flujoMensaje').innerText(),/cuota agotada/);
  assert.deepEqual(await page.evaluate(async()=>(await import('/js/store.js')).default.get('flujo')),inicial);
  await page.evaluate(()=>{Storage.prototype.setItem=window.qaSet;delete window.qaSet;});
  await page.locator('#flujoTraerAplicar').click();
  const flujo=await page.evaluate(async()=>(await import('/js/store.js')).default.get('flujo'));
  assert.equal(flujo.procedencia.saldoInicial.origen,'estados');
  evidencia.recorridos.push('Estados → Flujo: cuota agotada conserva estado y reintentar guarda la procedencia');
  await ir('reportes');await page.locator('[data-tab=export]').click();await page.locator('#btnPreviewHTML').click();
  assert.match(await page.locator('#exportPreview').innerText(),/Proyección del presupuesto guardado/);
  evidencia.recorridos.push('Reportes consume la proyección guardada');
  assert.deepEqual(evidencia.errores,[]);
  await writeFile(join(__dirname,'navegador.json'),JSON.stringify(evidencia,null,2));
  console.log(JSON.stringify(evidencia));
 }finally{if(browser)await browser.close();await new Promise(done=>server.close(done));}
})().catch(e=>{console.error(e);process.exitCode=1;});
