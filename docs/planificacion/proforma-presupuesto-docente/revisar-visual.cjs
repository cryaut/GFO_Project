const assert = require('node:assert/strict');
const { readFile, writeFile, mkdir } = require('node:fs/promises');
const { execFileSync } = require('node:child_process');
const { createServer } = require('node:http');
const { resolve, join, sep, extname } = require('node:path');
const { homedir } = require('node:os');
const { chromium } = require(process.env.GFO_PLAYWRIGHT_PATH || join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = resolve(__dirname, '../../..'), capturas = join(__dirname, 'capturas');
const antes = process.argv.includes('--antes'), base = 'dc4d96b1d39f63ad787a8ba4daa118ba68a6e76c';
const server = createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html';
    const path = resolve(root, relative);
    if (!path.startsWith(root + sep) || relative.split(/[\\/]/).some(p => p.startsWith('.')) || relative.includes('node_modules')) { res.writeHead(403); res.end(); return; }
    let body;
    if (antes && /^(js|css)\//.test(relative)) {
      try { body = execFileSync('git', ['show', `${base}:${relative}`], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }); }
      catch { body = await readFile(path); }
    } else body = await readFile(path);
    res.writeHead(200, { 'Content-Type': `${({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[extname(path)] || 'application/octet-stream'}; charset=utf-8` }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
(async () => {
  let browser;
  const resultado = { antes, escenarios: [] };
  try {
    await mkdir(capturas, { recursive: true });
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errores = [];
    page.on('pageerror', e => errores.push(e.message));
    page.on('dialog', d => d.accept());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/#/planeacion`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
    await page.evaluate(async () => {
      const { default: store } = await import('/js/store.js');
      const { ejemploPlaneacion, normalizarSupuestos } = await import('/js/modules/planeacion/planeacion-calculations.js');
      const { ejemploEstadosResueltos } = await import('/tests/fixtures/estados-resueltos.js');
      store.setPersisted('estados', ejemploEstadosResueltos(['2024', '2025']));
      store.setPersisted('planeacion', { supuestos: normalizarSupuestos(ejemploPlaneacion()) });
      (await import('/js/modules/planeacion/index.js')).initPlaneacion();
    });
    await page.screenshot({ path: join(capturas, antes ? 'antes-presupuesto.png' : 'presupuesto-escritorio.png') });
    resultado.detalleInicial = await page.locator('#planDetalleTitulo').innerText();
    if (antes) assert.equal(resultado.detalleInicial, 'Cobros del periodo');
    else {
      assert.equal(resultado.detalleInicial, 'Estado de resultados presupuestado');
      assert.match(await page.locator('#planDetalleContenido').innerText(), /119,000\.00/);
      await page.locator('#planTarjetaCaja').click();
      await page.locator('#planPeriodoConsulta').selectOption('0');
      assert.match(await page.locator('#planDetalleContenido').innerText(), /Trimestre 1/);
      await page.locator('#planPeriodoConsulta').selectOption('-1');
      assert.match(await page.locator('#planDetalleContenido').innerText(), /antes de financiamiento/);
      await page.locator('#planTarjetaResultado').click();
    }
    const guardado = await page.evaluate(() => localStorage.getItem('gfo-toolkit-data'));
    await page.evaluate(() => { location.hash = '#/proforma'; });
    await page.locator('#page-proforma.active').waitFor();
    resultado.UAIVisible = (await page.locator('#page-proforma').innerText()).includes('Utilidad antes de impuestos (UAI)');
    assert.equal(resultado.UAIVisible, !antes);
    if (!antes) {
      assert.match(await page.locator('#page-proforma').innerText(), /170,000\.00/);
      assert.match(await page.locator('#page-proforma').innerText(), /119,000\.00/);
      assert.match(await page.locator('#page-proforma').innerText(), /7,000\.00/);
      await page.screenshot({ path: join(capturas, 'proforma-escritorio.png') });
      for (const modo of ['completo', 'parcial']) {
        if (modo === 'parcial') {
          await page.evaluate(() => { location.hash = '#/planeacion'; });
          await page.locator('#planVer-supuestos').click();
          await page.locator('#planCargarCaso').click();
          await page.getByText('Capital de trabajo · cálculo parcial', { exact: true }).waitFor();
          assert.equal(await page.locator('#planTarjetaResultado').count(), 0);
        }
        const persistido = await page.evaluate(() => localStorage.getItem('gfo-toolkit-data'));
        for (const width of [1440, 390, 320]) for (const tema of ['light', 'dark']) {
          await page.setViewportSize({ width, height: 1000 });
          await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), tema);
          for (const route of ['planeacion', 'proforma']) {
            await page.evaluate(r => { location.hash = '#/' + r; }, route);
            await page.locator(`#page-${route}.active`).waitFor();
            const medidas = await page.evaluate(() => ({ viewport: innerWidth, ancho: document.documentElement.scrollWidth }));
            if (medidas.ancho > medidas.viewport + 1) {
              console.log(await page.evaluate(() => [...document.querySelectorAll('.page.active *')].filter(e => {
                const r = e.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1;
              }).slice(0, 12).map(e => ({ tag: e.tagName, id: e.id, clase: e.className, ancho: e.getBoundingClientRect().width }))));
            }
            assert.ok(medidas.ancho <= medidas.viewport + 1, JSON.stringify({ modo, route, tema, ...medidas }));
            if (modo === 'parcial' && route === 'proforma') assert.match(await page.locator('#page-proforma').innerText(), /presupuesto parcial de capital de trabajo/);
            resultado.escenarios.push({ modo, route, tema, ...medidas });
            await page.evaluate(() => scrollTo(0, 0));
            if (width === 390 && tema === 'dark') await page.screenshot({ path: join(capturas, `${route}-${modo}-movil.png`) });
            if (modo === 'completo' && width === 390 && tema === 'dark') {
              const selector = route === 'planeacion' ? '#planDetalleContenido tr' : '.proforma-desarrollo[open] tr';
              await page.locator(selector).filter({ hasText: 'Utilidad neta' }).last().scrollIntoViewIfNeeded();
              await page.screenshot({ path: join(capturas, `desarrollo-${route}-movil.png`) });
            }
          }
        }
        assert.equal(await page.evaluate(() => localStorage.getItem('gfo-toolkit-data')), persistido);
        if (modo === 'completo') assert.equal(persistido, guardado);
      }
    }
    assert.deepEqual(errores, []);
    resultado.errores = errores;
    await writeFile(join(__dirname, antes ? 'verificacion-antes.json' : 'verificacion-visual.json'), JSON.stringify(resultado, null, 2));
    console.log(JSON.stringify({ ...resultado, escenarios: resultado.escenarios.length }));
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
