// QA local; el ejercicio emplea los operandos de julio y ceros sintéticos explícitos.
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile, writeFile, mkdir } = require('node:fs/promises');
const { execFileSync } = require('node:child_process');
const { resolve, join, extname, sep } = require('node:path');
const { homedir } = require('node:os');
const { chromium } = require(process.env.GFO_PLAYWRIGHT_PATH || join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = resolve(__dirname, '../../..');
const antes = process.argv.includes('--antes');
const salida = join(__dirname, 'capturas');
const base = '19c5c6f81607d8794938880640034e737fea67af';
const server = createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\//, '') || 'index.html';
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep) || relative.split(/[\\/]/).some(p => p.startsWith('.')) || relative.includes('node_modules')) { res.writeHead(403); res.end(); return; }
    let body;
    if (antes && /^(js|css)\//.test(relative)) {
      try { body = execFileSync('git', ['show', `${base}:${relative}`], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }); }
      catch { body = await readFile(file); }
    } else body = await readFile(file);
    res.writeHead(200, { 'Content-Type': `${({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[extname(file)] || 'application/octet-stream'}; charset=utf-8` }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
(async () => {
  let browser;
  const resultados = { antes, base, escenarios: [] };
  try {
    await mkdir(salida, { recursive: true });
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage();
    const errores = [];
    page.on('pageerror', e => errores.push(e.message));
    page.on('dialog', d => d.accept());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/#/estados`, { waitUntil: 'networkidle' });
    const datos = await page.evaluate(async () => {
      const { ejemploEstadosResueltos } = await import('/tests/fixtures/estados-resueltos.js');
      const { registrarCuenta } = await import('/js/modules/estados/cuentas-registro.js');
      let datos = ejemploEstadosResueltos(['2024', '2025']);
      datos = registrarCuenta(datos, datos.periods.flatMap(periodo => [
        ['bs.cash_and_equivalents', 'Banco propio', 1000], ['bs.trade_receivables', 'Clientes propios', 200],
        ['bs.ppe_machinery', 'Equipo propio', 300], ['bs.accumulated_depreciation', 'Depreciación acumulada', -50],
        ['bs.trade_payables', 'Proveedor propio', 400], ['bs.long_term_borrowings', 'Deuda propia', 200],
        ['bs.additional_paid_in_capital', 'Capital propio', 850]
      ].map(([id, nombre, importe]) => ({ periodo, id, nombre, importe, confirmado: true }))));
      return registrarCuenta(datos, { periodo: '2024', id: 'is.gross_profit_reported', nombre: 'Resultado comercial fuente', importe: 30000 });
    });
    await page.locator('#statesFile').setInputFiles({ name: 'ejercicio-docente.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(datos)) });
    await page.locator('#currentPeriod').waitFor();
    await page.locator('#currentPeriod').selectOption('1');
    const er = page.locator('#accountEditor [data-group="estadoResultados"]');
    resultados.ubEnEditor = await er.locator('[data-readonly-key="resuelto:is.gross_profit_reported"]').count() === 1;
    await er.scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(salida, antes ? 'antes.png' : 'estados-escritorio.png') });
    if (antes) {
      assert.equal(resultados.ubEnEditor, false);
      resultados.regresionReproducida = true;
    } else {
      assert.equal(resultados.ubEnEditor, true);
      const fila = id => er.locator(`[data-readonly-key="resuelto:${id}"]`);
      assert.match(await fila('is.gross_profit_reported').innerText(), /30,000\.00/);
      assert.match(await fila('is.operating_profit_reported').innerText(), /11,000\.00/);
      assert.match(await fila('presentacion.uai').innerText(), /10,000\.00/);
      assert.match(await fila('is.net_income_reported').innerText(), /7,000\.00/);
      const gasto = er.locator('[aria-label="Importe Dato is.other_operating_expenses"]');
      await gasto.fill('20000');
      assert.match(await fila('is.net_income_reported').innerText(), /6,000\.00/);
      assert.equal(await gasto.evaluate(e => e === document.activeElement), true);
      await gasto.fill('19000');
      const impuesto = er.locator('[aria-label="Importe Dato is.income_tax_expense"]');
      await impuesto.fill('');
      assert.match(await fila('is.net_income_reported').innerText(), /N\/D/);
      assert.match(await fila('presentacion.uai').innerText(), /10,000\.00/);
      await impuesto.fill('3000');
      assert.equal(await page.evaluate(() => localStorage.getItem('gfo-toolkit-data')), null);
      await page.locator('details.states-preview').evaluate(e => { e.open = true; });
      const descarga = page.waitForEvent('download');
      await page.locator('#downloadStates').click();
      const archivo = await descarga;
      assert.deepEqual(JSON.parse(await readFile(await archivo.path(), 'utf8')), datos);
      resultados.edicionConFoco = true;
      resultados.exportacionSinCuentasCalculadas = true;
    }
    await page.locator('#saveStates').click();
    const guardados = await page.evaluate(() => localStorage.getItem('gfo-toolkit-data'));
    assert.deepEqual(JSON.parse(guardados).estados, datos);
    if (!antes) {
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const tema of ['light', 'dark']) {
          await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), tema);
          for (const tab of ['estados', 'av', 'ah', 'eoaf', 'efe']) {
            if (tab === 'estados') await page.evaluate(() => { location.hash = '#/estados'; });
            else {
              await page.evaluate(() => { location.hash = '#/analisis'; });
              await page.locator(`[data-tab="${tab}"]`).click();
            }
            await page.waitForFunction(route => document.querySelector(`#page-${route}.active`)?.textContent.trim().length > 30, tab === 'estados' ? 'estados' : 'analisis');
            const medidas = await page.evaluate(() => ({ viewport: innerWidth, ancho: document.documentElement.scrollWidth }));
            assert.ok(medidas.ancho <= medidas.viewport + 1, JSON.stringify({ tab, tema, ...medidas }));
            if (['ah', 'av'].includes(tab)) assert.match(await page.locator('#tab-' + tab).innerText(), /Utilidad bruta/);
            if (tab === 'efe') assert.match(await page.locator('#tab-efe').innerText(), /Efectivo final calculado/);
            resultados.escenarios.push({ tab, tema, ...medidas });
            if (width === 390 && tema === 'dark' && tab === 'av') {
              await page.locator('#tab-av tr').filter({ hasText: 'Utilidad bruta' }).first().scrollIntoViewIfNeeded();
              await page.screenshot({ path: join(salida, 'av-movil-oscuro.png') });
            }
          }
        }
      }
      assert.equal(await page.evaluate(() => localStorage.getItem('gfo-toolkit-data')), guardados);
      resultados.sinEscriturasAlNavegar = true;
    }
    assert.deepEqual(errores, []);
    resultados.errores = errores;
    await writeFile(join(__dirname, antes ? 'verificacion-antes.json' : 'verificacion-visual.json'), JSON.stringify(resultados, null, 2));
    console.log(JSON.stringify({ ...resultados, escenarios: resultados.escenarios.length }));
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
