// Revisión reproducible con contextos desechables: no usa datos ni el perfil del usuario.
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile, mkdir, writeFile } = require('node:fs/promises');
const { resolve, join, extname, sep } = require('node:path');
const { homedir } = require('node:os');
const { chromium } = require(process.env.GFO_PLAYWRIGHT_PATH || join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = resolve(__dirname, '../../..');
const capturas = join(__dirname, 'capturas');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\//, '') || 'index.html';
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep) || relative.split(/[\\/]/).some(p => p.startsWith('.')) || relative.includes('node_modules')) {
      res.writeHead(403); res.end(); return;
    }
    res.writeHead(200, { 'Content-Type': `${mime[extname(file)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});

(async () => {
  let browser;
  const resultados = { navegador: 'Edge headless, contexto aislado', escenarios: [] };
  try {
    await mkdir(capturas, { recursive: true });
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1.5 });
    const page = await context.newPage();
    const errores = [];
    page.on('pageerror', error => errores.push(error.message));
    await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/#/analisis`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }' });
    await page.screenshot({ path: join(capturas, 'sin-datos.png') });
    const tabs = ['ah', 'av', 'razones', 'cnt-cno', 'eoaf', 'efe', 'dupont', 'interpretacion', 'mercado'];
    // Datos sintéticos con los cuatro operandos de clase. Los cierres son
    // elegidos para el test; el profesor solo proporciona los promedios.
    await page.evaluate(async () => {
      const { registrarCuenta } = await import('/js/modules/estados/cuentas-registro.js');
      const { default: store } = await import('/js/store.js');
      const datos = registrarCuenta({ name: 'Ejemplo DuPont · prueba con cierres sintéticos', periods: ['2024', '2025'],
        balanceGeneral: { '2024': { activos: {}, pasivos: {}, patrimonio: {} }, '2025': { activos: {}, pasivos: {}, patrimonio: {} } },
        estadoResultados: { '2024': {}, '2025': {} } }, [
        ['2024', 'bs.total_assets', 'Activos declarados', 90000], ['2025', 'bs.total_assets', 'Activos declarados', 110000],
        ['2024', 'bs.total_equity', 'Patrimonio declarado', 50000], ['2025', 'bs.total_equity', 'Patrimonio declarado', 70000],
        ['2025', 'is.net_sales_reported', 'Ventas netas declaradas', 200000], ['2025', 'is.net_income_reported', 'Utilidad declarada', 12000]
      ].map(([periodo, id, nombre, importe]) => ({ periodo, id, nombre, importe, confirmado: true })));
      store.setPersisted('estados', datos);
      (await import('/js/modules/analisis/index.js')).initAnalisis();
    });
    const guardado = await page.evaluate(() => localStorage.getItem('gfo-toolkit-data'));
    assert.ok(guardado, 'El respaldo de estados existe antes de navegar');
    await page.locator('[data-tab="mercado"]').click();
    const borrador = { 'mer-acciones-0': '12345', 'mer-precio-0': '10', 'mer-dividendos-0': '100',
      'mer-acciones-1': '0', 'mer-precio-1': '', 'mer-dividendos-1': '25.50' };
    for (const [id, valor] of Object.entries(borrador)) await page.locator('#' + id).fill(valor);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: width === 1440 ? 1100 : 844 });
      for (const tema of ['light', 'dark']) {
        await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), tema);
        for (const tab of tabs) {
          await page.locator(`[data-tab="${tab}"]`).click();
          const panel = page.locator(`#tab-${tab}`);
          assert.equal(await panel.isVisible(), true);
          assert.equal(await page.locator('.tab-content.active').count(), 1);
          const metodo = panel.locator('.analisis-method');
          if (!await metodo.evaluate(e => e.open)) await metodo.locator('summary').click();
          assert.ok((await metodo.innerText()).length > 50);
          const medidas = await page.evaluate(() => ({ viewport: innerWidth, ancho: document.documentElement.scrollWidth }));
          if (medidas.ancho > medidas.viewport + 1) {
            await page.screenshot({ path: join(capturas, 'desbordamiento.png') });
            console.log(await page.evaluate(() => [...document.querySelectorAll('#page-analisis *')].filter(e => {
              const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && getComputedStyle(e).position !== 'absolute';
            }).slice(0, 12).map(e => ({ tag: e.tagName, clase: e.className, ancho: e.getBoundingClientRect().width, texto: e.textContent.slice(0, 75) }))));
          }
          assert.ok(medidas.ancho <= medidas.viewport + 1, JSON.stringify({ tab, tema, ...medidas }));
          resultados.escenarios.push({ tab, tema, ...medidas });
          if (width !== 320 && ['ah', 'razones', 'dupont', 'mercado'].includes(tab)) {
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.screenshot({ path: join(capturas, `${tab}-${width}-${tema}.png`) });
            await panel.screenshot({ path: join(capturas, `${tab}-panel-${width}-${tema}.png`) });
          }
        }
      }
    }
    await page.locator('[data-tab="dupont"]').click();
    assert.match(await page.locator('#tab-dupont').innerText(), /12\.00%/);
    assert.match(await page.locator('#tab-dupont').innerText(), /20\.00%/);
    await page.locator('#analysisPeriod').selectOption('2024');
    assert.equal(await page.locator('#tab-dupont').isVisible(), true);
    assert.match(await page.locator('#tab-dupont').innerText(), /N\/D/);
    await page.locator('#analysisPeriod').selectOption('2025');
    assert.equal(await page.evaluate(() => localStorage.getItem('gfo-toolkit-data')), guardado);
    await page.locator('[data-tab="mercado"]').click();
    for (const [id, valor] of Object.entries(borrador)) assert.equal(await page.locator('#' + id).inputValue(), valor);
    await page.locator('#analysisPeriod').selectOption('2024');
    for (const [id, valor] of Object.entries(borrador)) assert.equal(await page.locator('#' + id).inputValue(), valor);
    assert.equal(await page.locator('#tab-mercado').isVisible(), true);
    assert.equal(await page.evaluate(() => localStorage.getItem('gfo-toolkit-data')), guardado);
    resultados.borradorMercadoConservado = true;
    // Guardar sigue leyendo el mismo formulario después de cambiar periodo.
    await page.locator('#mer-acciones-1').fill('1000');
    await page.locator('#mer-precio-1').fill('15');
    await page.locator('#mercadoGuardar').click();
    assert.match(await page.locator('#mercadoMensaje').innerText(), /Datos guardados/);
    assert.equal(await page.evaluate(async () => (await import('/js/store.js')).default.get('razonesMercado').periodos['2024'].acciones), 12345);
    resultados.guardadoMercadoOperativo = true;
    assert.deepEqual(errores, []);
    resultados.sinErrores = true;
    resultados.sinEscriturasAlNavegar = true;
    resultados.dupontClase = { ROA: '12.00%', ROE: '20.00%', cierres: 'sintéticos' };
    resultados.selectorConservaSeccion = true;
    await writeFile(join(__dirname, 'verificacion-visual.json'), JSON.stringify(resultados, null, 2) + '\n');
    console.log(JSON.stringify({ escenarios: resultados.escenarios.length, sinErrores: true, sinDesbordamiento: true, sinEscriturasAlNavegar: true, dupontClase: resultados.dupontClase }));
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
