import { afterEach, expect, it, vi } from 'vitest';
import { element } from './helpers/dom-falso.js';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

it('muestra cuentas y periodos importados como texto en AV, AH y evolución', async () => {
  const periodos = ['2023 <b>Anterior</b>', '2024 <img src=x>'];
  const cuenta = '<img src=x onerror=alert(1)>';
  const datos = { name: 'Importada', periods: periodos,
    balanceGeneral: Object.fromEntries(periodos.map(p => [p, { activos: { [cuenta]: 100 }, pasivos: {}, patrimonio: { Capital: 100 } }])),
    estadoResultados: Object.fromEntries(periodos.map(p => [p, { Servicios: 100 }])),
    accountTypes: { activos: { [cuenta]: 'efectivo' }, pasivos: {}, patrimonio: { Capital: 'patrimonio' }, estadoResultados: { Servicios: 'ventas' } } };
  const page = element();
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ estados: datos }) });
  vi.stubGlobal('document', { getElementById: id => id === 'page-analisis' ? page : null });
  const { initAnalisis } = await import('../../js/modules/analisis/index.js');
  initAnalisis();
  expect(page.innerHTML).not.toContain('<img');
  expect(page.innerHTML).not.toContain('<b>Anterior</b>');
  expect(page.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
  expect(page.innerHTML).toContain('2023 &lt;b&gt;Anterior&lt;/b&gt; → 2024 &lt;img src=x&gt;');
});
