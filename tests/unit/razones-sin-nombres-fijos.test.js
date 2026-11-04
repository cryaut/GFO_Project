import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('Análisis e Integración no acceden a cuentas mediante nombres fijos', () => {
  const nombres = ['Ventas', 'Costo de Ventas', 'Gastos de Administracion', 'Gastos de Ventas',
    'Otros Ingresos', 'Otros Gastos', 'Gastos por Intereses', 'Impuestos', 'Efectivo',
    'Cuentas por Cobrar', 'Inventario', 'Activos Corrientes Otros', 'Cuentas por Pagar',
    'Pasivo Corto Plazo', 'Provisiones'];
  for (const archivo of ['analisis/index.js', 'integracion/index.js']) {
    const codigo = readFileSync(new URL(`../../js/modules/${archivo}`, import.meta.url), 'utf8');
    for (const nombre of nombres) {
      // Detecta acceso literal; no prohíbe las etiquetas visibles en tablas.
      expect(codigo, `${archivo}: ${nombre}`).not.toMatch(new RegExp(`\\[\\s*['"]${nombre}['"]\\s*\\]`));
    }
  }
});
