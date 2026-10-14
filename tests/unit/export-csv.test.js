import { afterEach, expect, it, vi } from 'vitest';
import { exportCSV } from '../../js/utils/export.js';

afterEach(() => vi.unstubAllGlobals());

it('exporta nombres como texto y conserva los importes numéricos negativos', async () => {
  let downloaded;
  const anchor = { click: vi.fn() };
  vi.stubGlobal('document', { createElement: () => anchor, body: { appendChild() {}, removeChild() {} } });
  vi.stubGlobal('URL', { createObjectURL: blob => { downloaded = blob; return 'blob:test'; }, revokeObjectURL: vi.fn() });
  exportCSV([
    ['=HYPERLINK("https://example.com")', -500], ['+SUM(1,2)', 100], ['-Nombre', 0],
    ['@SUM(A1)', 5], ['  =1+1', 5], ['\ttexto', 5], ['Cuenta, "especial"\rOtra', null], ['Banco regional', 10]
  ], ['Cuenta', 'Importe']);
  const csv = await downloaded.text();
  expect(csv).toContain('"\'=HYPERLINK(""https://example.com"")",-500');
  expect(csv).toContain('"\'+SUM(1,2)",100');
  expect(csv).toContain("'-Nombre,0");
  expect(csv).toContain("'@SUM(A1),5");
  expect(csv).toContain("'  =1+1,5");
  expect(csv).toContain("'\ttexto,5");
  expect(csv).toContain('"Cuenta, ""especial""\rOtra",');
  expect(csv).toContain('Banco regional,10');
  expect(anchor.click).toHaveBeenCalledOnce();
});
