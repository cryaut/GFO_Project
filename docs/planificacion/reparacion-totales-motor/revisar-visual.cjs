// Perfil desechable de QA: nunca abre el perfil ni el almacenamiento del usuario.
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile, writeFile, mkdir } = require('node:fs/promises');
const { execFileSync } = require('node:child_process');
const { resolve, join, extname, sep } = require('node:path');
const { homedir } = require('node:os');
const { chromium } = require(process.env.GFO_PLAYWRIGHT_PATH || join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = resolve(__dirname, '../../..'), antes = process.argv.includes('--antes');
const capturas = join(__dirname, 'capturas');
const server = createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\//, '') || 'index.html';
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep) || relative.split(/[\\/]/).some(p => p.startsWith('.')) || relative.includes('node_modules')) { res.writeHead(403); res.end(); return; }
    let body;
    if (antes && /^(js|css)\//.test(relative)) {
      try { body = execFileSync('git', ['show', `0b91ac6:${relative}`], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }); }
      catch { body = await readFile(file); }
    } else body = await readFile(file);
    res.writeHead(200, { 'Content-Type': `${({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[extname(file)] || 'application/octet-stream'}; charset=utf-8` }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
(async () => {
  let browser;
  const resultado = { antes, base:'0b91ac6', escenarios:[], errores:[] };
  try {
    await mkdir(capturas, { recursive:true });
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    browser = await chromium.launch({ channel:'msedge', headless:true });
    const context = await browser.newContext({ viewport:{ width:1440, height:1000 }, acceptDownloads:true });
    const page = await context.newPage();
    page.on('pageerror', e => resultado.errores.push(e.message));
    page.on('dialog', d => d.accept());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    const url = `http://127.0.0.1:${server.address().port}/`;
    const ir = async ruta => {
      await page.goto(url + '#/' + ruta);
      await page.addStyleTag({ content:'*,*::before,*::after{animation:none!important;transition:none!important}' });
    };
    await ir('estados');
    await page.getByText('Nuevo conjunto o ejemplo', { exact:true }).click();
    await page.locator('#demoStates').click();
    await page.locator('#currentPeriod').selectOption('1');
    const er = page.locator('#accountEditor [data-group="estadoResultados"]');
    const fila = id => er.locator(`[data-readonly-key="resuelto:${id}"]`);
    await er.scrollIntoViewIfNeeded();
    if (antes) {
      assert.match(await fila('is.net_income_reported').innerText(), /N\/D/);
      assert.equal(await page.locator('#statesCoveragePanel').count(), 0);
      await page.screenshot({ path:join(capturas, 'antes-ER.png') });
      resultado.regresionReproducida = true;
    } else {
      for (const [id, valor] of [['is.gross_profit_reported','375,000.00'], ['is.operating_profit_reported','155,000.00'],
        ['presentacion.uai','149,750.00'], ['is.net_income_reported','104,825.00']]) assert.ok((await fila(id).innerText()).includes(valor));
      await page.screenshot({ path:join(capturas, 'ER-escritorio.png') });
      await page.locator('#statesCoveragePanel > summary').click();
      await page.locator('#coverage-estadoResultados').selectOption('parcial');
      assert.match(await fila('is.net_income_reported').innerText(), /N\/D/);
      await page.locator('#coverage-estadoResultados').selectOption('completo');
      assert.match(await fila('is.net_income_reported').innerText(), /104,825\.00/);
      const impuesto = er.getByLabel('Importe Impuesto sobre la Renta', { exact:true });
      await impuesto.fill('');
      assert.match(await fila('is.net_income_reported').innerText(), /N\/D/);
      assert.match(await fila('presentacion.uai').innerText(), /149,750\.00/);
      assert.equal(await impuesto.evaluate(e => e === document.activeElement), true);
      await impuesto.fill('44925');
      await page.locator('#statesCoveragePanel').scrollIntoViewIfNeeded();
      await page.screenshot({ path:join(capturas, 'alcance-escritorio.png') });
      resultado.coberturaReversibleYBorrador = true;
    }
    await page.locator('#saveStates').click();
    const persistido = await page.evaluate(() => localStorage.getItem('gfo-toolkit-data'));
    if (!antes) {
      await page.locator('.states-preview > summary').click();
      const descarga = page.waitForEvent('download');
      await page.locator('#downloadStates').click();
      const archivo = await descarga;
      const exportado = JSON.parse(await readFile(await archivo.path(), 'utf8'));
      assert.deepEqual(exportado, JSON.parse(persistido).estados);
      assert.equal(exportado.coberturaEstados['2024'].activos, 'completo');
      resultado.exportacionConservada = true;
      for (const width of [1440, 390]) for (const tema of ['light', 'dark']) for (const vista of ['estados','razones','dupont','proforma']) {
        await page.setViewportSize({ width, height:1000 });
        await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), tema);
        await ir(['razones','dupont'].includes(vista) ? 'analisis' : vista);
        if (['razones','dupont'].includes(vista)) await page.locator(`#analysis-tab-${vista}`).click();
        if (vista === 'estados') await page.locator('#statesCoveragePanel > summary').click();
        if (vista === 'razones') {
          assert.equal(await page.locator('.analisis-ratio-list > div').count(), 23);
          const rc = page.locator('.analisis-ratio-list > div').filter({ has:page.getByText('Ratio Corriente', { exact:true }) });
          assert.match(await rc.innerText(), /2\.35/);
          assert.match(await page.locator('#tab-razones').innerText(), /N\/D \(5\)/);
        }
        if (vista === 'dupont') {
          const texto = await page.locator('#tab-dupont').innerText();
          assert.match(texto, /12\.89/); assert.match(texto, /19\.06/);
        }
        if (vista === 'proforma') assert.match(await page.locator('#page-proforma').innerText(), /104,825\.00/);
        const medidas = await page.evaluate(() => ({ ancho:document.documentElement.scrollWidth, viewport:innerWidth }));
        assert.ok(medidas.ancho <= medidas.viewport + 1, JSON.stringify({ vista, tema, ...medidas }));
        resultado.escenarios.push({ vista, tema, ...medidas });
        if ((width === 1440 && tema === 'light') || (width === 390 && tema === 'dark')) {
          const selector = vista === 'estados' ? '#statesCoveragePanel' : vista === 'proforma' ? '#page-proforma' : `#tab-${vista}`;
          await page.locator(selector).scrollIntoViewIfNeeded();
          await page.screenshot({ path:join(capturas, `${vista}-${width}.png`) });
        }
        assert.equal(await page.evaluate(() => localStorage.getItem('gfo-toolkit-data')), persistido);
      }
      // Totales suficientes más detalle que no puede comprobarse: el margen sigue 10%.
      await ir('estados');
      const doc = await page.evaluate(async () => {
        const { registrarCuenta } = await import('/js/modules/estados/cuentas-registro.js');
        return registrarCuenta({ name:'Totales suficientes', periods:['2024'],
          balanceGeneral:{ '2024':{ activos:{}, pasivos:{}, patrimonio:{} } }, estadoResultados:{ '2024':{} } }, [
          ['bs.current_assets_total',1000], ['bs.current_liabilities_total',400],
          ['is.net_sales_reported',1000], ['is.net_income_reported',100], ['is.nonoperating_income',20]
        ].map(([id, importe]) => ({ id, importe, periodo:'2024', nombre:`Dato ${id}`, confirmado:true })));
      });
      await page.locator('#statesFile').setInputFiles({ name:'totales.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(doc)) });
      await page.locator('#saveStates').click();
      await ir('analisis'); await page.locator('#analysis-tab-razones').click();
      assert.match(await page.locator('#tab-razones').innerText(), /Resultados con advertencias/);
      const mn = page.locator('.analisis-ratio-list > div').filter({ has:page.getByText('Margen Neto', { exact:true }) });
      assert.match(await mn.innerText(), /10\.00/);
      await page.getByText('Resultados con advertencias', { exact:true }).click();
      assert.match(await page.locator('#tab-razones').innerText(), /Se usa el total reportado/);
      resultado.totalReportadoYAdvertenciaSeparados = true;
    }
    assert.deepEqual(resultado.errores, []);
    await writeFile(join(__dirname, antes ? 'verificacion-antes.json' : 'verificacion-visual.json'), JSON.stringify(resultado, null, 2));
    console.log(JSON.stringify({ ...resultado, escenarios:resultado.escenarios.length }));
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
