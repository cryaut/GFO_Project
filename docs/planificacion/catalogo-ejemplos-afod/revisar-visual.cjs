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
    const abrirEstados = async () => {
      await ir('estados');
      await page.evaluate(() => { for (const el of document.querySelectorAll('#page-estados details')) if (el.querySelector('#demoStates')) el.open = true; });
    };
    await abrirEstados();
    for (const [id, moneda, un] of [['actual','C$',104825], ['baker','USD',180000], ['bartlett','USD',231000], ['practico2','UM',77000]]) {
      await abrirEstados();
      const antes = JSON.stringify(await almacen());
      await page.locator('#example-estados').selectOption(id);
      assert.equal(JSON.stringify(await almacen()), antes, 'seleccionar no carga');
      assert.ok((await page.locator('#example-info-estados').innerText()).length > 40);
      await page.locator('#demoStates').click();
      await page.locator('#currentPeriod').selectOption('1');
      await page.locator('#saveStates').click();
      const datos = await almacen();
      assert.equal(datos.estados.moneda || 'C$', moneda);
      const visible = await page.locator('#accountEditor').innerText();
      assert.ok(visible.includes(un.toLocaleString('en-US', { minimumFractionDigits:2 })), `${id}: UN visible`);
      await ir('analisis'); await page.locator('#analysis-tab-dupont').click();
      assert.ok((await page.locator('#tab-dupont').innerText()).includes('ROE'));
      console.log('Verificado', resultado.escenarios.length + 1); resultado.escenarios.push({ modulo:'estados', id, moneda, utilidadNeta:un });
    }
    for (const [ruta, boton, ids] of [
      ['flujo','flujoEjemplo',['actual','baker-directo','bartlett-directo']],
      ['equilibrio','eqEjemplo',['actual','tor-base','tor-alto']],
      ['inventario','invEjemplo',['actual','bodega']],
      ['planeacion','planEjemplo',['actual','contado']],
      ['presupuesto','btnEjemploPresupuesto',['actual','salario']]
    ]) {
      for (const id of ids) {
        await ir(ruta);
        const antes = JSON.stringify(await almacen());
        await page.locator('#example-' + ruta).selectOption(id);
        assert.equal(JSON.stringify(await almacen()), antes);
        await page.locator('#' + boton).click();
        const d = await almacen();
        assert.deepEqual(d.estados, JSON.parse(antes).estados, 'otro módulo no reemplaza Estados');
        if (ruta === 'flujo' && id !== 'actual') {
          assert.equal(d.flujo.moneda, 'USD');
          const final = d.flujo.movimientos.reduce((n,m) => n + (m.tipo === 'entrada' ? m.monto : -m.monto), d.flujo.saldoInicial);
          assert.equal(final, id === 'baker-directo' ? 1000000 : 431000);
          assert.ok((await page.locator('#page-flujo').innerText()).includes('USD'));
        }
        if (ruta === 'equilibrio' && id !== 'actual') assert.equal(d.equilibrio.moneda, 'UM');
        if (ruta === 'inventario' && id === 'bodega') assert.equal(d.inventario.movimientos.length, 0);
        if (ruta === 'planeacion' && id === 'contado') assert.equal(d.planeacion.supuestos.pctContado, 1);
        if (ruta === 'presupuesto' && id === 'salario') assert.equal(d.presupuesto.ingresos.reduce((n,i) => n+i.monto,0),18000);
        console.log('Verificado', resultado.escenarios.length + 1); resultado.escenarios.push({ modulo:ruta, id });
      }
    }
    await ir('analisis');
    await page.locator('#analysis-tab-mercado').click();
    await page.locator('#example-mercado').selectOption('sin-dividendos');
    await page.locator('#mercadoEjemplo').click();
    for (const p of Object.values((await almacen()).razonesMercado.periodos)) assert.equal(p.dividendos,0);
    console.log('Verificado', resultado.escenarios.length + 1); resultado.escenarios.push({ modulo:'mercado', id:'sin-dividendos' });
    // La referencia parcial conserva la selección completa disponible y permite cancelar reemplazo.
    await ir('planeacion');
    await page.locator('#planCargarCaso').click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('gfo-toolkit-data')).planeacion.activoId);
    const parcial = JSON.stringify((await almacen()).planeacion);
    await abrirPaneles();
    aceptar = false;
    await page.locator('#example-planeacion').selectOption('contado');
    await page.locator('#planEjemplo').click();
    assert.equal(JSON.stringify((await almacen()).planeacion), parcial);
    aceptar = true;
    await page.locator('#planEjemplo').click();
    assert.equal((await almacen()).planeacion.supuestos.pctContado,1);
    assert.equal((await almacen()).planeacion.activoId, undefined);
    console.log('Verificado', resultado.escenarios.length + 1); resultado.escenarios.push({ modulo:'planeacion', id:'parcial-cancelar-reemplazar' });
    for (const width of [1440,390]) for (const tema of ['light','dark']) for (const ruta of ['estados','flujo','equilibrio','inventario','planeacion','presupuesto']) {
      await page.setViewportSize({ width,height:1000 });
      await ir(ruta);
      await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), tema);
      if (ruta === 'estados') await abrirEstados();
      const panel = page.locator('#example-' + ruta).locator('xpath=ancestor::section[1]');
      await panel.scrollIntoViewIfNeeded();
      const medidas = await page.evaluate(() => ({ ancho:document.documentElement.scrollWidth, viewport:innerWidth }));
      assert.ok(medidas.ancho <= medidas.viewport + 1, JSON.stringify({ ruta,tema,...medidas }));
      if ((width === 1440 && tema === 'light') || (width === 390 && tema === 'dark')) await page.screenshot({ path:join(capturas, `${ruta}-${width}.png`) });
      console.log('Verificado', resultado.escenarios.length + 1); resultado.escenarios.push({ modulo:ruta,width,tema });
    }
    await page.setViewportSize({ width:1440,height:1000 });
    await page.evaluate(() => localStorage.clear());
    await ir('home');
    await page.locator('#example-inicioEmpresa').selectOption('baker');
    await page.locator('#inicioEjemplo').click();
    assert.equal((await almacen()).estados.name,'Baker Corporation · AFOD');
    assert.ok(!(await almacen()).flujo?.movimientos?.length);
    console.log('Verificado', resultado.escenarios.length + 1); resultado.escenarios.push({ modulo:'inicioEmpresa',id:'baker',alcance:'solo Estados' });
    await page.evaluate(() => localStorage.clear()); await ir('home');
    await page.locator('#example-inicioPersonal').selectOption('salario');
    await page.locator('#inicioEjemploPersonal').click();
    assert.equal((await almacen()).presupuesto.ingresos.reduce((n,i)=>n+i.monto,0),18000);
    console.log('Verificado', resultado.escenarios.length + 1); resultado.escenarios.push({ modulo:'inicioPersonal',id:'salario' });
    assert.deepEqual(resultado.errores,[]);
    await writeFile(join(__dirname,'verificacion-visual.json'),JSON.stringify(resultado,null,2));
    console.log(JSON.stringify({ escenarios:resultado.escenarios.length,errores:resultado.errores }));
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
