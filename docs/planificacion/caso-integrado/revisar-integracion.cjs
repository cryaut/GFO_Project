// Prueba de navegación en una copia aislada. No usa el perfil del usuario.
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { createServer } = require('node:http');
const { resolve, join, sep, extname } = require('node:path');
const { homedir } = require('node:os');
const { chromium } = require(process.env.GFO_PLAYWRIGHT_PATH
  || join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
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

    const costo = page.locator('#planTarjetaCostoVentas');
    const inventario = page.locator('#planTarjetaInventario');
    const periodo = page.locator('#planPeriodoConsulta');
    const detalle = page.locator('#planDetalleContenido td');
    const valorTarjeta = tarjeta => tarjeta.locator('.kpi-value').innerText();
    assert.equal(await valorTarjeta(costo), 'C$ 380,300.04');
    assert.equal(await valorTarjeta(inventario), 'C$ 8,099.96');
    await costo.click();
    await periodo.selectOption('0');
    assert.equal(await detalle.innerText(), 'C$ 28,000.00');
    await inventario.click();
    assert.equal(await detalle.innerText(), 'C$ 52,000.00');

    const tabla = titulo => page.locator('#planVista-tablas .card').filter({
      has: page.getByRole('heading', { name: titulo, exact: true })
    });
    const celdas = (seccion, fila) => seccion.getByRole('row').filter({ hasText: fila }).getByRole('cell');
    const valoracion = tabla('Inventario valorizado y costo de ventas');
    const inventarioFisico = tabla('Inventario en unidades');
    const unidades = () => Promise.all(['Unidades a comprar', 'Existencia final proyectada'].map(fila =>
      celdas(inventarioFisico, fila).allTextContents()));
    const costoMensual = celdas(valoracion, 'Costo de ventas');
    const inventarioMensual = celdas(valoracion, 'Inventario final valorizado');
    await page.locator('#planVer-tablas').click();
    assert.equal(await costoMensual.nth(1).innerText(), 'C$ 28,000.00');
    assert.equal(await costoMensual.last().innerText(), 'C$ 380,300.04');
    assert.equal(await inventarioMensual.nth(1).innerText(), 'C$ 52,000.00');
    assert.equal(await inventarioMensual.last().innerText(), 'C$ 8,099.96');
    const unidadesBase = await unidades();
    assert.equal(unidadesBase[0][3], '147.50');
    assert.equal(unidadesBase[1][3], '77.50');

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
    const costoMarzo = page.locator('#planCostoCompra-2');
    await costoMarzo.fill('');
    await page.locator('#planVer-resumen').click();
    assert.equal(await valorTarjeta(costo), 'C$ 380,300.04');
    await page.locator('#planVer-supuestos').click();
    assert.equal(await page.locator('#plan-precio').inputValue(), '235');
    assert.equal(await costoMarzo.inputValue(), '');
    await page.locator('#formPlaneacion').evaluate(form => form.requestSubmit());
    assert.match(await page.locator('#planMensaje').innerText(), /guardad/i);
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#planVer-supuestos').click();
    assert.equal(await page.locator('#plan-precio').inputValue(), '235');
    assert.equal(await costoMarzo.inputValue(), '');
    const data = await page.evaluate(async () => (await import('/js/store.js')).default.get('planeacion'));
    assert.equal(data.escenarios.length, 2);
    const copia = data.escenarios.find(e => e.id === data.activoId);
    assert.equal(copia.nombre, 'Revisión de integración');
    assert.equal(copia.capitalTrabajo.costosCompra[2], null);
    assert.equal(data.escenarios.find(e => e.id === copia.origenId).capitalTrabajo.costosCompra[2], 100);

    await page.locator('#planVer-resumen').click();
    assert.equal(await valorTarjeta(costo), 'N/D');
    assert.equal(await valorTarjeta(inventario), 'N/D');
    await costo.click();
    await periodo.selectOption('2');
    assert.equal(await detalle.innerText(), 'N/D');
    await page.locator('#planVer-tablas').click();
    assert.equal(await costoMensual.nth(1).innerText(), 'C$ 28,000.00');
    assert.equal(await inventarioMensual.nth(1).innerText(), 'C$ 52,000.00');
    assert.equal(await celdas(valoracion, 'Compras del periodo').nth(3).innerText(), 'N/D');
    assert.equal(await costoMensual.nth(3).innerText(), 'N/D');
    assert.equal(await inventarioMensual.nth(3).innerText(), 'N/D');
    assert.deepEqual(await unidades(), unidadesBase);

    assert.deepEqual(errors, []);
    console.log(JSON.stringify({
      rutas: 5, escenariosVisuales: 18, borradorEntreVistas: true, copiaGuardadaYRecargada: true,
      valoracionBaseVerificada: true, costoPendienteConUnidadesConservadas: true, errores: errors
    }));
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
