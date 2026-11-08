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
    await page.locator('#example-estados').selectOption('baker');
    await page.locator('#demoStates').click();
    await page.locator('#saveStates').click();
    await ir('flujo');
    await page.locator('#example-flujo').selectOption('actual');
    await page.locator('#flujoEjemplo').click();
    const flujoAntes = JSON.stringify((await almacen()).flujo);
    await page.locator('#flujoPeriodo').selectOption('2011');
    await page.locator('#flujoTomarSaldo').click();
    assert.match(await page.locator('#flujoMensaje').innerText(), /Moneda incompatible/);
    assert.equal(JSON.stringify((await almacen()).flujo), flujoAntes);
    resultado.escenarios.push({ caso:'Flujo USD a C$', escritura:false });
    await ir('planeacion');
    await page.locator('#example-planeacion').selectOption('actual');
    await page.locator('#planEjemplo').click();
    await page.locator('#planVer-supuestos').click();
    await page.locator('#plan-saldoInicialCaja').fill('777');
    await page.locator('#plan-cxcInicial').fill('888');
    const planAntes = JSON.stringify((await almacen()).planeacion);
    await page.locator('#planTomarBalance').click();
    assert.match(await page.locator('#planMensaje').innerText(), /Moneda incompatible/);
    assert.equal(await page.locator('#plan-saldoInicialCaja').inputValue(), '777');
    assert.equal(await page.locator('#plan-cxcInicial').inputValue(), '888');
    assert.equal(JSON.stringify((await almacen()).planeacion), planAntes);
    await page.locator('#formPlaneacion button[type=submit]').click();
    assert.equal((await almacen()).planeacion.supuestos.saldoInicialCaja,777);
    assert.equal((await almacen()).planeacion.supuestos.cxcInicial,888);
    resultado.escenarios.push({ caso:'Planeación USD a C$', borradorConservado:true,guardadoPosterior:777 });
    await page.evaluate(async () => {
      const { registrarCuenta } = await import('/js/modules/estados/cuentas-registro.js');
      const { default:store } = await import('/js/store.js');
      const registros=[['bs.ppe_buildings','Edificio propio',1000],['bs.total_assets','Activo reportado',1200],['bs.total_liabilities','Pasivos',600],['bs.total_equity','Patrimonio',600]];
      store.setPersisted('estados',registrarCuenta({ periods:['2030'],balanceGeneral:{'2030':{activos:{},pasivos:{},patrimonio:{}}},estadoResultados:{'2030':{}}},registros.map(([id,nombre,importe])=>({id,nombre,importe,periodo:'2030',confirmado:true}))));
    });
    await ir('analisis');
    await page.locator('#analysis-tab-av').click();
    const edificio = page.locator('#tab-av tr').filter({ hasText:'Edificio propio' });
    assert.match(await edificio.innerText(), /83.33/);
    resultado.escenarios.push({caso:'AV activo reportado',participacion:'83.33 %',base:1200});
    assert.deepEqual(resultado.errores,[]);
    await writeFile(join(__dirname,'revision-carlos-navegador.json'),JSON.stringify(resultado,null,2));
    console.log(JSON.stringify(resultado));
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
