// QA local: navegador aislado, demo existente y capturas. No usa el perfil del usuario.
// Playwright se toma del runtime ya instalado; no se añade a package.json.
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile, mkdir, writeFile } = require('node:fs/promises');
const { resolve, join, extname, sep } = require('node:path');
const { homedir } = require('node:os');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.GFO_PLAYWRIGHT_PATH || join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = resolve(__dirname, '../../..');
const capturas = join(__dirname, 'capturas');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
const originales = new Map(['css/pages.css', 'js/modules/estados/estados-ui.js'].map(path => [path,
  execFileSync('git', ['show', `origin/main:${path}`], { cwd: root })]));
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const antes = url.pathname.startsWith('/antes/');
    const relative = decodeURIComponent(url.pathname.replace(/^\/(antes|ahora)\//, '')) || 'index.html';
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep) || relative.split(/[\\/]/).some(p => p.startsWith('.')) || relative.includes('node_modules')) {
      res.writeHead(403); res.end(); return;
    }
    const body = antes && originales.has(relative) ? originales.get(relative) : await readFile(file);
    res.writeHead(200, { 'Content-Type': `${mime[extname(file)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});

(async () => {
  let browser;
  const resultados = { base: execFileSync('git', ['rev-parse', 'origin/main'], { cwd: root, encoding: 'utf8' }).trim(),
    navegador: 'Edge headless, contextos nuevos sin datos del usuario', deviceScaleFactor: 2, escenarios: [] };
  try {
    await mkdir(capturas, { recursive: true });
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    const base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const payloads = {};
    for (const version of ['antes', 'ahora']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, locale: 'es-NI' });
      const page = await context.newPage();
      const errores = [];
      page.on('pageerror', error => errores.push(error.message));
      page.on('dialog', dialog => dialog.accept());
      // Esta pantalla no dibuja gráficas. Evita peticiones externas durante QA.
      await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
      await page.goto(`${base}/${version}/#/estados`, { waitUntil: 'networkidle' });
      // Captura los colores finales; evita fotografiar la transición entre temas.
      await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }' });
      await page.locator('#companyName').waitFor();
      await page.screenshot({ path: join(capturas, `${version}-vacio.png`) });
      if (version === 'ahora') {
        assert.equal(await page.locator('#statesImportPanel').evaluate(e => e.open), true);
        assert.equal(await page.locator('.states-preview').evaluate(e => e.open), false);
        await page.getByText('Nuevo conjunto o ejemplo', { exact: true }).click();
      }
      await page.locator('#demoStates').click();
      await page.locator('#currentPeriod').waitFor();
      if (version === 'ahora') {
        assert.equal(await page.locator('#statesImportPanel').evaluate(e => e.open), false);
        await page.getByText('Datos complementarios del periodo', { exact: true }).click();
        await page.locator('#ventasCredito').waitFor({ state: 'visible' });
        await page.getByText('Datos complementarios del periodo', { exact: true }).click();
        // El summary nativo se abre con teclado y conserva los campos originales.
        const summary = page.locator('#statesImportPanel > summary');
        await summary.focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('#statesImportPanel').evaluate(e => e.open), true);
        await summary.press('Enter');
      }
      await page.locator('#companyName').fill('Empresa de revisión visual');
      await page.locator('#currentPeriod').selectOption('1');
      await page.locator('#currentPeriod').selectOption('0');
      assert.equal(await page.locator('#companyName').inputValue(), 'Empresa de revisión visual');
      for (const [nombre, width, height, tema] of [
        ['escritorio-claro', 1440, 1000, 'light'], ['escritorio-oscuro', 1440, 1000, 'dark'],
        ['movil-claro', 390, 844, 'light'], ['movil-oscuro', 390, 844, 'dark']
      ]) {
        await page.setViewportSize({ width, height });
        await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), tema);
        await page.evaluate(() => window.scrollTo(0, 0));
        const medidas = await page.evaluate(() => ({ viewport: innerWidth, ancho: document.documentElement.scrollWidth }));
        if (version === 'ahora') assert.ok(medidas.ancho <= medidas.viewport + 1, JSON.stringify(medidas));
        await page.screenshot({ path: join(capturas, `${version}-${nombre}.png`) });
        resultados.escenarios.push({ version, nombre, ...medidas });
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
      if (version === 'ahora') {
        await page.locator('#statesImportPanel > summary').click();
        await page.getByText('Formato de importes y ayuda', { exact: true }).click();
        await page.locator('#numberFormat').waitFor({ state: 'visible' });
        await page.getByText('Administrar periodos', { exact: true }).click();
        await page.locator('#statesRenamePeriod').waitFor({ state: 'visible' });
        await page.screenshot({ path: join(capturas, 'ahora-opciones-abiertas.png') });
        await page.locator('.states-preview > summary').click();
        await page.locator('#downloadStates').waitFor({ state: 'visible' });
        await page.locator('#periodSelector').waitFor({ state: 'visible' });
        await page.locator('.states-add-account > summary').first().click();
        await page.locator('.states-add-form input[name="account"]').first().fill('Cuenta de revisión visual');
        const revisarCajas = () => page.locator('.states-account-group').evaluateAll(grupos => grupos.map(grupo => {
          const caja = getComputedStyle(grupo);
          const cabecera = getComputedStyle(grupo.querySelector('summary'));
          const cuerpo = getComputedStyle(grupo.querySelector('.states-account-body'));
          return { radio: parseFloat(caja.borderTopLeftRadius), margen: parseFloat(caja.marginTop),
            cabecera: parseFloat(cabecera.paddingLeft), contenido: parseFloat(cuerpo.paddingLeft),
            alineaciones: [...grupo.querySelectorAll('input, .states-add-form label')].map(e => getComputedStyle(e).textAlign) };
        }));
        const comprobarCajas = async () => {
          const cajas = await revisarCajas();
          assert.equal(cajas.length, 4);
          cajas.forEach(caja => {
            assert.ok(caja.radio >= 12 && caja.margen >= 24);
            assert.ok(caja.cabecera >= 16 && caja.contenido >= 16);
            assert.ok(caja.alineaciones.every(alineacion => alineacion === 'left'));
          });
          return cajas;
        };
        resultados.cajasDeCuentas = await comprobarCajas();
        await page.locator('.states-account-group').first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(capturas, 'ahora-cuentas.png') });
        await page.locator('.states-account-group').first().screenshot({ path: join(capturas, 'ahora-cuenta-formulario.png') });
        await page.locator('.states-preview').scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(capturas, 'ahora-vista-multiperiodo.png') });
        // Las opciones abiertas tampoco deben estirar la página en móvil.
        for (const width of [390, 320]) {
          await page.setViewportSize({ width, height: 844 });
          await page.locator('#statesImportPanel').scrollIntoViewIfNeeded();
          const medidas = await page.evaluate(() => ({ viewport: innerWidth, ancho: document.documentElement.scrollWidth }));
          assert.ok(medidas.ancho <= medidas.viewport + 1, JSON.stringify(medidas));
          await comprobarCajas();
          resultados.escenarios.push({ version, nombre: 'movil-opciones-abiertas', ...medidas });
          await page.screenshot({ path: join(capturas, `ahora-opciones-movil-${width}.png`) });
        }
        await page.locator('.states-add-form input[name="account"]').first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(capturas, 'ahora-cuenta-formulario-movil.png') });
      }
      assert.equal(await page.evaluate(() => localStorage.getItem('gfo-toolkit-data')), null);
      await page.locator('#saveStates').click();
      payloads[version] = await page.evaluate(() => JSON.parse(localStorage.getItem('gfo-toolkit-data')).estados);
      assert.match(await page.locator('#estadoMessage').innerText(), /Datos guardados/);
      assert.deepEqual(errores, []);
      await context.close();
    }
    assert.deepEqual(payloads.ahora, payloads.antes);
    resultados.guardadoIdentico = true;
    resultados.sinEscriturasAntesDeGuardar = true;
    resultados.sinErroresDePagina = true;
    resultados.panelesYTeclado = 'verificados';
    await writeFile(join(__dirname, 'verificacion-visual.json'), JSON.stringify(resultados, null, 2) + '\n');
    console.log(JSON.stringify(resultados));
  } finally {
    if (browser) await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
