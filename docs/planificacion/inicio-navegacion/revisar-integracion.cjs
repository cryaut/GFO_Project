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
    await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
    assert.match(await page.locator('#page-home').innerText(), /Bienvenido a GFO Toolkit/);
    for (const route of ['home', 'inventario', 'mercados', 'analisis', 'flujo', 'proforma', 'planeacion', 'estados', 'presupuesto', 'activos', 'reportes', 'apalancamiento', 'equilibrio', 'glosario', 'home']) {
      await page.evaluate(route => { location.hash = '#/' + route; }, route);
      await page.waitForFunction(route => document.querySelector(`#page-${route}.active`)?.textContent.trim().length > 30, route);
    }
    assert.deepEqual(errors, []);
    const fallido = await browser.newPage();
    const erroresFallido = [];
    fallido.on('pageerror', e => erroresFallido.push(e.message));
    await fallido.route('https://cdn.jsdelivr.net/**', r => r.abort());
    await fallido.route('**/js/modules/inicio/index.js', async route => {
      const response = await route.fetch();
      const body = (await response.text()).replace('export function initInicio() {',
        'export function initInicio() { if (!globalThis.__falloInicioProbado) { globalThis.__falloInicioProbado = true; throw new Error("Fallo inducido de prueba"); }');
      await route.fulfill({ response, body });
    });
    await fallido.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
    assert.match(await fallido.locator('#page-home').innerText(), /No se pudo cargar Inicio/);
    await fallido.locator('#reintentarRuta').click();
    assert.match(await fallido.locator('#page-home').innerText(), /Bienvenido a GFO Toolkit/);
    await fallido.evaluate(() => { location.hash = '#/inventario'; });
    await fallido.waitForFunction(() => document.querySelector('#page-inventario.active')?.textContent.includes('Inventario'));
    assert.deepEqual(erroresFallido, []);
    console.log(JSON.stringify({ rutas: 14, inicioVacio: true, reintentoTrasFallo: true, navegacionTrasFallo: true, errores: errors }));
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
