// Perfil desechable de QA: nunca abre el perfil ni el almacenamiento del usuario.
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile, writeFile, mkdir } = require('node:fs/promises');
const { resolve, join, extname, sep } = require('node:path');
const { homedir } = require('node:os');
const { chromium } = require(process.env.GFO_PLAYWRIGHT_PATH || join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = resolve(__dirname, '../../..');
const capturas = join(__dirname, 'capturas');
const server = createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\//, '') || 'index.html';
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep) || relative.split(/[\\/]/).some(p => p.startsWith('.')) || relative.includes('node_modules')) { res.writeHead(403); res.end(); return; }
    let body;
    body = await readFile(file);
    res.writeHead(200, { 'Content-Type': `${({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[extname(file)] || 'application/octet-stream'}; charset=utf-8` }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
(async () => {
  let browser;
  const resultado = { escenarios:[], errores:[] };
  try {
    await mkdir(capturas, { recursive:true });
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    browser = await chromium.launch({ channel:'msedge', headless:true });
    const context = await browser.newContext({ viewport:{ width:1440, height:1000 } });
    const page = await context.newPage();
    let aceptar = true;
    page.on('pageerror', e => resultado.errores.push(e.message));
    page.on('dialog', d => aceptar ? d.accept() : d.dismiss());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    const url = `http://127.0.0.1:${server.address().port}/`;
    const ir = async ruta => { await page.goto(url + (ruta === 'home' ? '?perfil=' + Date.now() : '') + '#/' + ruta, { waitUntil:'domcontentloaded' }); await page.locator('#page-' + ruta).waitFor({ state:'visible' }); await abrirPaneles(); };
    const abrirPaneles = async () => { await page.evaluate(() => { for (const el of document.querySelectorAll('details')) if (el.querySelector('.example-picker')) el.open = true; }); if (await page.locator('#planVer-supuestos').isVisible() && await page.locator('#example-planeacion').count() && !await page.locator('#example-planeacion').isVisible()) await page.locator('#planVer-supuestos').click(); };
    const almacen = () => page.evaluate(() => JSON.parse(localStorage.getItem('gfo-toolkit-data') || '{}'));

    await ir('presupuesto');
    const guardado = async () => (await almacen()).presupuesto;
    await page.locator('#ppCargarEjemplo').click();
    assert.equal((await guardado()).estudiantil.movimientos.length,32);
    assert.equal(await page.locator('#ppCancelarEdicion').isVisible(),false);
    const snapshot = JSON.stringify(await guardado());
    for(const vista of ['registro','seguimiento','proyecciones','meta']) await page.locator('#ppVista-'+vista).click();
    assert.equal(JSON.stringify(await guardado()),snapshot,'navegar no guarda');
    assert.match(await page.locator('#ppTotales').innerText(), /2,400.00/);
    assert.match(await page.locator('#ppTotales').innerText(), /1,750.00/);
    assert.match(await page.locator('#ppMetaResultado').innerText(), /20.00%/);
    await page.locator('.student-tools').evaluate(el=>el.open=true);
    await page.locator('#example-presupuestoEstudiantil').selectOption('transporte');
    assert.equal(JSON.stringify(await guardado()),snapshot,'seleccionar no carga');
    aceptar=false; await page.locator('#ppCargarEjemplo').click();
    assert.equal(JSON.stringify(await guardado()),snapshot,'cancelar conserva');
    aceptar=true; await page.locator('#ppCargarEjemplo').click();
    assert.match(await page.locator('#ppMetaResultado').innerText(), /0.00%/);
    await page.locator('.student-tools').evaluate(el=>el.open=true);
    await page.locator('#example-presupuestoEstudiantil').selectOption('actual');
    await page.locator('#ppCargarEjemplo').click();
    await page.locator('#ppVista-registro').click();
    await page.locator('#ppFecha').fill('2026-08-10');
    await page.locator('#ppTipo').selectOption('Gasto');
    await page.locator('#ppDescripcionMovimiento').fill('Compra <b>registrada</b>');
    await page.locator('#ppMonto').fill('25');
    await page.locator('#ppFormMovimiento button[type=submit]').click();
    assert.equal((await guardado()).estudiantil.movimientos.length,33);
    assert.match(await page.locator('#ppTotales').innerText(), /1,775.00/);
    await ir('presupuesto'); await page.locator('#ppVista-registro').click();
    assert.match(await page.locator('#ppRegistroTabla').innerText(), /Compra <b>registrada<\/b>/);
    assert.equal(await page.locator('#ppRegistroTabla b').count(),0);
    await page.locator('#ppEditar-32').click();
    assert.equal(await page.locator('#ppFecha').evaluate(el=>el===document.activeElement),true);
    await page.locator('#ppMonto').fill('75');
    await page.locator('#ppCancelarEdicion').click();
    assert.equal((await guardado()).estudiantil.movimientos.at(-1).monto,25);
    aceptar=false; await page.locator('#ppEliminar-32').click();
    assert.equal((await guardado()).estudiantil.movimientos.length,33);
    aceptar=true; await page.locator('#ppEliminar-32').click();
    assert.equal((await guardado()).estudiantil.movimientos.length,32);
    await page.locator('#ppFecha').fill('2026-08-10');
    await page.locator('#ppMonto').fill('99');
    await page.evaluate(()=>{window.qaSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('QA cuota agotada','QuotaExceededError');};});
    await page.locator('#ppFormMovimiento button[type=submit]').click();
    assert.match(await page.locator('#ppMensaje').innerText(), /No se guardó/);
    assert.equal(await page.locator('#ppMonto').inputValue(),'99');
    assert.equal((await guardado()).estudiantil.movimientos.length,32);
    await page.evaluate(()=>{Storage.prototype.setItem=window.qaSetItem;delete window.qaSetItem;});
    await page.locator('#ppVista-proyecciones').click();
    const real=JSON.stringify((await guardado()).estudiantil.proyecciones.real);
    await page.locator('.student-plan').nth(1).locator('summary').click();
    await page.locator('#ppIngreso-deseada').fill('5000');
    for(let i=0;i<9;i++) await page.locator('#ppMonto-deseada-'+i).fill(i===7 ? '1000':'0');
    await page.locator('#ppPlan-deseada button[type=submit]').click();
    assert.equal((await guardado()).estudiantil.proyecciones.deseada.ingreso,5000);
    assert.equal(JSON.stringify((await guardado()).estudiantil.proyecciones.real),real);
    assert.equal((await guardado()).estudiantil.movimientos.length,32);
    await ir('home');
    assert.match(await page.locator('#page-home').innerText(), /Presupuesto estudiantil/);
    assert.match(await page.locator('#page-home').innerText(), /400.00/);
    await ir('reportes');
    assert.match(await page.locator('#page-reportes').innerText(), /2,400.00/);
    await ir('presupuesto');
    await page.locator('.student-tools').evaluate(el=>el.open=true);
    const descarga = page.waitForEvent('download');
    await page.locator('#ppExportar').click();
    const respaldo = JSON.parse(await readFile(await (await descarga).path(), 'utf8'));
    assert.equal(respaldo.presupuesto.estudiantil.movimientos.length,32);
    await ir('reportes');
    await page.locator('#importFileInput').setInputFiles({name:'presupuesto-estudiantil.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(respaldo))});
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('gfo-toolkit-data')).presupuesto.estudiantil.proyecciones.deseada.ingreso===5000);
    await ir('presupuesto');
    await page.locator('#ppMensual').click();
    await page.locator('#btnEjemploPresupuesto').click();
    assert.equal((await guardado()).ingresoMensual,22500);
    assert.equal((await guardado()).estudiantil.movimientos.length,32);
    await page.locator('#ppVolverEstudiantil').click();
    assert.equal((await guardado()).vista,'estudiantil');
    assert.match(await page.locator('#ppTotales').innerText(), /2,400.00/);
    await page.locator('.student-tools').evaluate(el=>el.open=false);
    resultado.escenarios.push({recorrido:'carga, cancelación, registro, edición, eliminación, recarga, fallo de guardado, planes independientes, Inicio/Reportes y legado',conforme:true});
    for(const width of [1440,390,320]) for(const tema of ['light','dark']) {
      await page.setViewportSize({width,height:1000});
      await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),tema);
      for(const vista of ['meta','registro','seguimiento','proyecciones']) {
        await page.locator('#ppVista-'+vista).click();
        await page.evaluate(()=>window.scrollTo(0,0));
        const contraste=await page.locator('.student-nav [aria-pressed=true]').evaluate(el=>{
          const c=s=>s.match(/[\d.]+/g).map(Number);
          const cs=getComputedStyle(el), fg=c(cs.color), bg=c(cs.backgroundColor), sonda=document.createElement('span');sonda.style.color='var(--bg-primary)';el.append(sonda);const base=c(getComputedStyle(sonda).color);sonda.remove();
          const fondo=bg.slice(0,3).map((v,i)=>v*(bg[3]??1)+base[i]*(1-(bg[3]??1)));
          const lum=a=>a.slice(0,3).map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[0.2126,0.7152,0.0722][i],0);
          const a=lum(fg),b=lum(fondo);return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
        });
        assert.ok(contraste>=4.5,JSON.stringify({tema,contraste}));
        const medidas=await page.evaluate(()=>({ancho:document.documentElement.scrollWidth,viewport:innerWidth}));
        assert.ok(medidas.ancho<=medidas.viewport+1,JSON.stringify({vista,width,tema,...medidas}));
        assert.equal(await page.locator('.student-workspace input, .student-workspace select').evaluateAll(els=>els.filter(el=>!el.labels.length).length),0);
        if((width===1440&&tema==='light')||(width===390&&tema==='dark'))await page.screenshot({path:join(capturas,'despues-'+vista+'-'+width+'.png'),fullPage:true});
        resultado.escenarios.push({vista,width,tema,desborde:false,contrasteNavegacion:Math.round(contraste*100)/100});
      }
    }
    assert.deepEqual(resultado.errores,[]);
    await writeFile(join(__dirname,'verificacion-ui.json'),JSON.stringify(resultado,null,2));
    console.log(JSON.stringify({variantes:24,recorridoCompleto:true,errores:resultado.errores}));
  } finally {
    if(browser)await browser.close();
    await new Promise(done=>server.close(done));
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
