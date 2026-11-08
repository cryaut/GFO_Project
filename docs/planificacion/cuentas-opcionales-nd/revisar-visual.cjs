// Contexto desechable de pruebas; no abre ni modifica el perfil del usuario.
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
      try { body = execFileSync('git', ['show', `8197215:${relative}`], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }); }
      catch { body = await readFile(file); }
    } else body = await readFile(file);
    res.writeHead(200, { 'Content-Type': `${({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[extname(file)] || 'application/octet-stream'}; charset=utf-8` }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
(async () => {
  let browser;
  const resultado = { antes, base: '8197215', escenarios: [], errores: [] };
  try {
    await mkdir(capturas, { recursive: true });
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage();
    page.on('pageerror', e => resultado.errores.push(e.message));
    page.on('dialog', d => d.accept());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    const url = `http://127.0.0.1:${server.address().port}/`;
    const cargarDemo = async () => {
      if (!await page.locator('#statesImportPanel').evaluate(e => e.open)) await page.locator('#statesImportPanel > summary').click();
      await page.getByText('Nuevo conjunto o ejemplo', { exact: true }).click();
      await page.locator('#demoStates').click();
    };
    await page.goto(url + '#/estados', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
    await cargarDemo();
    const er = page.locator('#accountEditor [data-group="estadoResultados"]');
    const devolucion = er.getByLabel('Importe Devoluciones sobre ventas', { exact: true });
    assert.equal(await devolucion.isVisible(), antes);
    await er.scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(capturas, antes ? 'antes-estados.png' : 'estados-escritorio.png') });
    if (!antes) {
      const opcionales = er.locator('.statement-optional');
      assert.equal(await opcionales.count(), 1);
      assert.match(await opcionales.locator('summary').innerText(), /\(3\)/);
      await opcionales.locator('summary').focus();
      await opcionales.locator('summary').press('Enter');
      assert.equal(await devolucion.isVisible(), true);
      // La edición de una cuenta compactada mantiene sus eventos e índice original.
      await devolucion.fill('100');
      await page.locator('#saveStates').click();
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('gfo-toolkit-data')).estados.estadoResultados['2023']['Devoluciones sobre ventas']), 100);
      await cargarDemo();
    }
    await page.locator('#saveStates').click();
    const persistido = await page.evaluate(() => localStorage.getItem('gfo-toolkit-data'));
    await page.goto(url + '#/analisis');
    const ah = page.locator('#tab-ah');
    assert.equal(await ah.locator('[data-statement="balance"]').count(), antes ? 0 : 1);
    if (antes) {
      resultado.regresionReproducida = true;
      await page.screenshot({ path: join(capturas, 'antes-ah.png') });
    } else {
      assert.match(await ah.locator('[data-statement="balance"]').innerText(), /Efectivo/);
      assert.doesNotMatch(await ah.locator('[data-statement="balance"]').innerText(), /Impuesto sobre la Renta/);
      assert.doesNotMatch(await ah.locator('[data-statement="resultados"]').innerText(), /Depreciacion Acumulada/);
      assert.equal(await ah.getByText('Devoluciones sobre ventas', { exact: true }).isVisible(), false);
      for (const width of [1440, 390]) for (const tema of ['light', 'dark']) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), tema);
        for (const vista of ['ah', 'av', 'razones', 'estados']) {
          await page.goto(url + '#/' + (vista === 'estados' ? 'estados' : 'analisis'));
          if (vista !== 'estados') await page.locator(`#analysis-tab-${vista}`).click();
          if (vista === 'razones') {
            assert.equal(await page.locator('.analisis-ratio-list > div').count(), 23);
            assert.match(await page.locator('#tab-razones').innerText(), /Por qué hay resultados N\/D/);
            await page.locator('.analisis-availability > summary').click();
            assert.match(await page.locator('.analisis-availability').innerText(), /intereses ganados/);
          }
          const medidas = await page.evaluate(() => ({ ancho: document.documentElement.scrollWidth, viewport: innerWidth }));
          assert.ok(medidas.ancho <= medidas.viewport + 1, JSON.stringify({ vista, tema, ...medidas }));
          resultado.escenarios.push({ vista, tema, ...medidas });
          if (tema === 'light' && width === 1440 && ['ah', 'razones'].includes(vista)) {
            await page.locator(vista === 'ah' ? '#tab-ah' : '.analisis-availability').scrollIntoViewIfNeeded();
            await page.screenshot({ path: join(capturas, `${vista}-escritorio.png`) });
          }
          if (tema === 'dark' && width === 390) {
            await page.locator(vista === 'estados' ? '#accountEditor [data-group="estadoResultados"]' : `#tab-${vista}`).scrollIntoViewIfNeeded();
            await page.screenshot({ path: join(capturas, `${vista}-movil.png`) });
          }
          assert.equal(await page.evaluate(() => localStorage.getItem('gfo-toolkit-data')), persistido);
        }
      }
      // Una razón que da cero sigue presente: no se aplica el filtro de cuentas a indicadores.
      await page.goto(url + '#/estados');
      await page.getByLabel('Importe Costo de Ventas', { exact: true }).fill('850000');
      await page.locator('#saveStates').click();
      await page.goto(url + '#/analisis');
      await page.locator('#analysisPeriod').selectOption('2023');
      await page.locator('#analysis-tab-razones').click();
      const margen = page.locator('.analisis-ratio-list > div').filter({ has: page.getByText('Margen Bruto', { exact: true }) });
      assert.match(await margen.innerText(), /0\.0/);
      resultado.razonCeroVisible = true;
      resultado.edicionOpcionales = true;
      resultado.datosConservados = true;
    }
    assert.deepEqual(resultado.errores, []);
    await writeFile(join(__dirname, antes ? 'verificacion-antes.json' : 'verificacion-visual.json'), JSON.stringify(resultado, null, 2));
    console.log(JSON.stringify({ ...resultado, escenarios: resultado.escenarios.length }));
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
