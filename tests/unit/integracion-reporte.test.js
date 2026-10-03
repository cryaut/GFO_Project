import { describe, expect, it } from 'vitest';
import { construirReporteHTML } from '../../js/modules/integracion/integracion-reporte.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';

const estados = () => normalizeFinancialData({
  name: 'Mi Empresa S.A.',
  periods: ['2023', '2024'],
  balanceGeneral: {
    '2023': { activos: { Efectivo: 100 }, pasivos: { Proveedores: 40 }, patrimonio: { Capital: 60 } },
    '2024': { activos: { Efectivo: 150, Bodega: 50 }, pasivos: { Proveedores: 70 }, patrimonio: { Capital: 130 } }
  },
  estadoResultados: { '2023': { Ventas: 500, 'Costo de Ventas': 300 }, '2024': { Ventas: 600, 'Costo de Ventas': 350 } },
  accountTypes: {
    activos: { Efectivo: 'efectivo', Bodega: 'activosFijos' },
    pasivos: { Proveedores: 'cuentasPorPagar' },
    patrimonio: { Capital: 'patrimonio' },
    estadoResultados: { Ventas: 'ventas', 'Costo de Ventas': 'costoVentas' }
  }
});

// Cuenta las celdas de cada fila de las tablas del reporte.
function filas(html) {
  return [...html.matchAll(/<tr>(.*?)<\/tr>/g)].map(([, contenido]) => ({
    contenido,
    celdas: (contenido.match(/<t[dh][ >]/g) || []).length,
    esGrupo: contenido.includes('rowgroup')
  }));
}

describe('construirReporteHTML', () => {
  it('alinea una columna por periodo en cada fila de cada tabla', () => {
    const html = construirReporteHTML({ estados: estados() });
    const tablas = filas(html);
    expect(tablas.length).toBeGreaterThan(10);
    for (const fila of tablas) {
      if (fila.esGrupo) expect(fila.contenido).toContain('colspan="3"');
      else expect(fila.celdas).toBe(3); // cuenta + 2024 + 2023
    }
    expect(html).toContain('<th style="text-align:right">2023</th>');
    expect(html).toContain('<th style="text-align:right">2024</th>');
  });

  it('muestra "—" (no cero) donde una cuenta no existe en un periodo', () => {
    const html = construirReporteHTML({ estados: estados() });
    const bodega = html.match(/<tr><td>Bodega<\/td>(.*?)<\/tr>/)[1];
    expect(bodega).toContain('>—</td>');
    expect(bodega).toContain('50.00');
  });

  it('incluye Balance General, Estado de Resultados y Totales por periodo', () => {
    const html = construirReporteHTML({ estados: estados() });
    expect(html).toContain('<h2>Balance General</h2>');
    expect(html).toContain('<h2>Estado de Resultados</h2>');
    expect(html).toContain('<h2>Totales por periodo</h2>');
    expect(html).toMatch(/<td>Ventas<\/td>.*600\.00/);
    // Utilidad neta 2024 = 600 − 350 = 250
    expect(html).toMatch(/<td>Utilidad neta<\/td>.*250\.00/);
    expect(html).toContain('Mi Empresa S.A.');
  });

  it('escapa nombres de cuenta, periodos y empresa que vengan de un archivo', () => {
    const malicioso = normalizeFinancialData({
      name: '<script>alert("empresa")</script>',
      periods: ['<b>2024</b>'],
      balanceGeneral: { '<b>2024</b>': { activos: { '<img src=x onerror=alert(1)>': 10 }, pasivos: {}, patrimonio: {} } },
      estadoResultados: { '<b>2024</b>': { '"><svg onload=alert(2)>': 5 } },
      accountTypes: {
        activos: { '<img src=x onerror=alert(1)>': 'efectivo' },
        estadoResultados: { '"><svg onload=alert(2)>': 'ventas' }
      }
    });
    const html = construirReporteHTML({ estados: malicioso });
    expect(html).not.toMatch(/<(img|svg|script|b)[ >]/);
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;b&gt;2024&lt;/b&gt;');
    expect(html).toContain('&lt;script&gt;');
  });

  it('muestra N/D en la utilidad si hay cuentas de resultados sin clasificar y lo explica', () => {
    const sinClasificar = {
      name: 'X', periods: ['2024'],
      balanceGeneral: { '2024': { activos: {}, pasivos: {}, patrimonio: {} } },
      estadoResultados: { '2024': { Ventas: 100, 'Rubro <raro>': 20 } }
    };
    const html = construirReporteHTML({ estados: sinClasificar });
    expect(html).toMatch(/<td>Utilidad neta<\/td><td style="text-align:right">N\/D<\/td>/);
    expect(html).toContain('Cuentas sin clasificar');
    expect(html).toContain('Rubro &lt;raro&gt;');
  });

  it('con KPIs muestra el resumen y con valores nulos muestra N/D', () => {
    const kpis = { totalActivos: 1000, totalPasivos: 400, totalPatrimonio: 600, ventas: 500, utilidadNeta: null };
    const html = construirReporteHTML({ kpis, estados: estados() });
    expect(html).toContain('<h2>Resumen</h2>');
    expect(html).toContain('Total Activos: C$');
    expect(html).toContain('Utilidad Neta: N/D');
  });

  it('sin estados guardados explica qué hacer en lugar de generar tablas vacías', () => {
    for (const vacio of [null, { periods: [] }]) {
      const html = construirReporteHTML({ estados: vacio });
      expect(html).toContain('No hay estados financieros guardados');
      expect(html).not.toContain('<table>');
    }
    expect(construirReporteHTML()).toContain('No hay estados financieros guardados');
  });
});
