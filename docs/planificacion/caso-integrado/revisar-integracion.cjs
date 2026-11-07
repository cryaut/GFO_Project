// Prueba de navegación en una copia aislada. No usa el perfil del usuario.
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { createServer } = require('node:http');
const { resolve, join, sep, extname } = require('node:path');
const { homedir } = require('node:os');
const { chromium } = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
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
(async () => {
  let browser;
  try {
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/#/analisis`, { waitUntil: 'networkidle' });
    for (const route of ['analisis', 'flujo', 'proforma', 'planeacion', 'estados']) {
      await page.evaluate(route => { location.hash = '#/' + route; }, route);
      await page.waitForFunction(route => document.querySelector(`#page-${route}.active`)?.textContent.trim().length > 30, route);
    }
    page.on('dialog', d => d.accept());
    await page.evaluate(() => { location.hash = '#/planeacion'; });
    await page.locator('#planCargarCaso').click();
    await page.locator('#planTarjetaCxC').waitFor();
    await page.locator('#planTarjetaCxC').click();
    assert.match(await page.locator('#planDetalleContenido').innerText(), /2027-02/);
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
        for (const view of ['resumen', 'supuestos', 'tablas']) {
          await page.locator('#planVer-' + view).click();
          const sizes = await page.evaluate(() => ({ width: innerWidth, total: document.documentElement.scrollWidth }));
          assert.ok(sizes.total <= sizes.width + 1, JSON.stringify({ view, theme, ...sizes }));
        }
      }
    }
    await page.locator('#planVer-supuestos').click();
    await page.locator('#planDuplicarEscenario').click();
    await page.locator('#planNombreEscenario').fill('Revisión de integración');
    await page.locator('#plan-precio').fill('235');
    await page.locator('#plan-precio').dispatchEvent('input');
    await page.locator('#planVer-resumen').click();
    await page.locator('#planVer-supuestos').click();
    assert.equal(await page.locator('#plan-precio').inputValue(), '235');
    await page.locator('#formPlaneacion').evaluate(form => form.requestSubmit());
    assert.match(await page.locator('#planMensaje').innerText(), /guardad/i);
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#planVer-supuestos').click();
    assert.equal(await page.locator('#plan-precio').inputValue(), '235');
    const data = await page.evaluate(async () => (await import('/js/store.js')).default.get('planeacion'));
    assert.equal(data.escenarios.length, 2);
    assert.equal(data.escenarios.find(e => e.id === data.activoId).nombre, 'Revisión de integración');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ rutas: 5, escenariosVisuales: 18, borradorEntreVistas: true, copiaGuardadaYRecargada: true, errores: errors }));
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
