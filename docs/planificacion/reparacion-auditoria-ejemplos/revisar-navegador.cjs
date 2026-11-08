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
    for (const [id, un, origenes, cfo] of [
      ['actual',104825,null,102775], ['baker',180000,1000000,780000],
      ['bartlett',231000,636000,500000], ['bartlett-clase',231000,636000,500000],
      ['practico2',77000,95000,null]
    ]) {
      await abrirEstados();
      await page.locator('#example-estados').selectOption(id);
      if (id === 'bartlett-clase') assert.match(await page.locator('#example-info-estados').innerText(), /70 %/);
      await page.locator('#demoStates').click();
      await page.locator('#currentPeriod').selectOption('1');
      await page.locator('#saveStates').click();
      const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
      await ir('home');
      assert.ok((await page.locator('#page-home').innerText()).includes(fmt(un)), id + ': UN en Inicio');
      await ir('analisis');
      for (const tab of ['ah','av','razones','dupont','eoaf','efe']) {
        await page.locator('#analysis-tab-' + tab).click();
        assert.ok((await page.locator('#tab-' + tab).innerText()).length > 150);
      }
      const efe = await page.locator('#tab-efe').innerText();
      assert.ok(efe.includes(fmt(un)), id + ': UN en EFE');
      if (cfo !== null) assert.ok(efe.includes(fmt(cfo)), id + ': CFO correcto');
      else assert.match(efe, /necesita desglose/);
      await page.locator('#analysis-tab-eoaf').click();
      if (origenes !== null) assert.ok((await page.locator('#tab-eoaf').innerText()).includes(fmt(origenes)));
      await page.locator('#analysis-tab-mercado').click();
      await abrirPaneles();
      await page.locator('#mercadoEjemplo').click();
      const mercado = await page.locator('#tab-mercado').innerText();
      assert.ok(mercado.includes(fmt(un / 30000)), id + ': UPA correcta');
      if (id === 'baker') {
        const filaInicial = page.locator('#tab-mercado table').nth(1).locator('tbody tr').first();
        assert.match(await filaInicial.innerText(), /2011.*N\/D.*N\/D/);
      }
      if (id === 'bartlett-clase') {
        await page.locator('#analysis-tab-razones').click();
        const r = await page.locator('#tab-razones').innerText();
        for (const esperado of ['7.08','51.53','4.48','81.41','21.60']) assert.ok(r.includes(esperado), esperado + ': docente');
      }
      resultado.escenarios.push({ id, un, origenes, cfo, rutas:['estados','home','analisis'], paneles:['ah','av','razones','dupont','eoaf','efe','mercado'] });
      console.log('Caso verificado:', id);
    }
    for (const width of [1440,390]) for (const tema of ['light','dark']) {
      await page.setViewportSize({ width,height:1000 });
      await ir('analisis'); await page.locator('#analysis-tab-efe').click();
      await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), tema);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path:join(capturas, 'efe-' + width + '-' + tema + '.png'), fullPage:true });
      resultado.escenarios.push({ width,tema,panel:'efe',desborde:false });
    }
    assert.deepEqual(resultado.errores,[]);
    await writeFile(join(__dirname,'verificacion-visual.json'),JSON.stringify(resultado,null,2));
    console.log(JSON.stringify({ casos:5, vistas:45, variantes:4, errores:resultado.errores }));
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
