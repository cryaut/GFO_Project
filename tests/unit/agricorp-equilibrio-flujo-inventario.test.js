// F3 (D-113): Punto de equilibrio, Flujo de efectivo e Inventario de AGRI-CORP.
// Controles resueltos a mano con las cifras de F02–F04 y los supuestos S4–S6 y S16.
import { describe, expect, it } from 'vitest';
import { casoHistoricoReal, COSTO_QUINTAL_SUPUESTO, flujoRealAgricorp, kardexGranzaAgricorp } from '../../js/examples/ejemplos-agricorp.js';
import { crearEjemplo, listarEjemplos } from '../../js/examples/catalogo.js';
import { calcularCVU, normalizarEquilibrio, resolverBase } from '../../js/modules/equilibrio/equilibrio-calculations.js';
import { calcularFlujo, normalizarFlujo } from '../../js/modules/flujo/flujo-calculations.js';
import { construirEFE } from '../../js/modules/analisis/efe-calculations.js';
import { construirFlujoDocumentado, validarFlujosDocumentados } from '../../js/modules/estados/estados-flujo-documentado.js';
import {
  calcularInventario, normalizarComposicion, normalizarInventario, resumenComposicion, validarInventarioRespaldo
} from '../../js/modules/inventario/inventario-calculations.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { validarRespaldo } from '../../js/modules/integracion/integracion-respaldo.js';

const caso = casoHistoricoReal();
const d = caso.estados;

describe('punto de equilibrio consolidado en C$1 de ventas (2024)', () => {
  const resolucion = resolverBase(normalizarEquilibrio(caso.equilibrio), d, caso.apalancamiento);
  const r = calcularCVU({ ...normalizarEquilibrio(caso.equilibrio), ...resolucion.base });

  it('la base sale de los estados: precio 1 y unidades = ventas del periodo', () => {
    expect(resolucion.error).toBeNull();
    expect(resolucion.base.precio).toBe(1);
    expect(resolucion.base.unidades).toBe(9010443238);
    // CVu = CV / ventas = 6,083,418,424 / 9,010,443,238.
    expect(resolucion.base.costoVariableUnitario).toBeCloseTo(6083418424 / 9010443238, 12);
  });

  it('los costos fijos son netos de los otros ingresos operativos: 2,594,352,461 − 24,995,050', () => {
    expect(resolucion.base.costosFijos).toBeCloseTo(2569357411, 3);
  });

  it('la UAII y el GAO de C-V-U son los mismos de Apalancamiento', () => {
    expect(r.uaii).toBeCloseTo(357667403, 2);
    expect(r.gao).toBeCloseTo(2927024814 / 357667403, 8);
  });

  it('PE en C$ = CF / razón de margen de contribución y margen de seguridad = 1 − CF / MC', () => {
    // PE = 2,569,357,411 / (2,927,024,814 / 9,010,443,238) ≈ C$ 7,909 millones.
    expect(r.peVentas).toBeCloseTo(2569357411 * 9010443238 / 2927024814, 0);
    expect(r.peUnidades).toBeCloseTo(r.peVentas, 2);
    expect(r.msPorcentaje).toBeCloseTo(1 - 2569357411 / 2927024814, 10);
  });

  it('al cambiar de periodo las unidades siguen siendo las ventas de ese periodo', () => {
    const b = resolverBase(normalizarEquilibrio({ ...caso.equilibrio, periodo: '2025' }), d, caso.apalancamiento).base;
    expect(b.precio).toBe(1);
    expect(b.unidades).toBe(7895371400);
  });

  it('sin la unidad monetaria se siguen exigiendo unidades físicas', () => {
    const sinUnidad = normalizarEquilibrio({ ...caso.equilibrio, unidadVentas: false });
    expect(Object.hasOwn(sinUnidad, 'unidadVentas')).toBe(false);
    expect(resolverBase(sinUnidad, d, caso.apalancamiento).error).toContain('unidades');
  });
});

describe('flujos publicados de 2022 a 2025', () => {
  it.each([
    ['2022', -31168276, -140875763, 292479444, 323599, 230869144],
    ['2023', 353489244, -196931342, -316769981, 180394, 70837459],
    ['2024', 190033364, -78516767, 102282062, undefined, 284636118],
    ['2025', 37782108, 214423000, -387590055, undefined, 149251171]
  ])('%s: actividades, efecto de conversión y efectivo final de la fuente', (anio, op, inv, fin, efecto, final) => {
    const r = calcularFlujo(flujoRealAgricorp(anio));
    expect(r.neto).toEqual({ operacion: op, inversion: inv, financiamiento: fin });
    expect(r.efectoConversion).toBe(efecto);
    expect(r.saldoFinal).toBe(final);
  });

  it('2022 → 2023 cuadra en Análisis con el efecto de conversión aparte de las actividades', () => {
    const efe = construirEFE(d, '2022', '2023');
    // 230,869,144 − 160,212,079 + 180,394 = 70,837,459.
    expect(efe).toMatchObject({ naturaleza: 'flujo_reportado', estado: 'cuadra', diferencia: 0,
      totalFlujos: -160212079, efectoConversion: 180394, efectivoFinalCalculado: 70837459 });
  });

  it('2022 usa la apertura declarada por el documento (no hay balance de 2021)', () => {
    const f = construirFlujoDocumentado(d, '2021', '2022');
    expect(f).toMatchObject({ estado: 'cuadra', efectivoInicial: 110110140, efectoConversion: 323599, diferencia: 0 });
    expect(f.advertencias.join(' ')).toContain('apertura del intervalo está declarada');
  });

  it('sin efecto de conversión la forma guardada del flujo no cambia', () => {
    expect(Object.hasOwn(normalizarFlujo(flujoRealAgricorp('2024')), 'efectoConversion')).toBe(false);
    expect(Object.hasOwn(calcularFlujo(flujoRealAgricorp('2024')), 'efectoConversion')).toBe(false);
  });

  it('un efecto de conversión que no es número invalida el documento', () => {
    const ficha = structuredClone(d.flujosDocumentados.find(f => f.periodoFinal === '2023'));
    ficha.datos.efectoConversion = 'mucho';
    expect(() => validarFlujosDocumentados([ficha])).toThrow('efecto de conversión');
  });

  it('el selector de Flujo ofrece los cuatro años de AGRI-CORP en C$', () => {
    const ids = listarEjemplos('flujo').map(e => e.id);
    expect(ids).toEqual(expect.arrayContaining(['agricorp-2022', 'agricorp-2023', 'agricorp-2024', 'agricorp-2025']));
    expect(crearEjemplo('flujo', 'agricorp-2023', () => ({}))).toMatchObject({ moneda: 'C$', efectoConversion: 180394, saldoInicial: 230869144 });
  });
});

describe('inventario: composición real y kárdex de granza', () => {
  const inv = caso.inventario;

  it('la composición por categoría reproduce el inventario neto de cada balance', () => {
    const resumen = resumenComposicion(normalizarComposicion(inv.composicion));
    expect(resumen.map(r => r.bruto)).toEqual([1412682659, 1183066982, 1623803126, 1553580129]);
    expect(resumen.map(r => r.neto)).toEqual([1410622339, 1180606300, 1621305239, 1546028593]);
    for (const r of resumen) expect(r.neto).toBe(computeFinancialTotals(d, r.periodo).inventario);
    // La granza es el 52.2 % del inventario antes de deterioro en 2024: 848,279,169 / 1,623,803,126.
    expect(resumen[2].categorias[0].participacion).toBeCloseTo(848279169 / 1623803126, 12);
  });

  it('el kárdex abre con la granza real de 2024 y cierra con la real de 2025', () => {
    const k = kardexGranzaAgricorp();
    expect(k.producto.existenciaInicial * COSTO_QUINTAL_SUPUESTO).toBeCloseTo(848279169, 4);
    const r = calcularInventario(normalizarInventario(inv));
    expect(r.productos[0].valor).toBeCloseTo(902648496, 2);
    expect(r.productos[0].existenciaFinal).toBeCloseTo(902648496 / 620, 6);
  });

  it('consumo = rotación 2025 × granza promedio; compras = consumo + variación de granza', () => {
    // Rotación 2025 = 6,461,733,590 / ((1,621,305,239 + 1,546,028,593) / 2) = 4.0802.
    const rotacion = 6461733590 / ((1621305239 + 1546028593) / 2);
    const consumo = rotacion * (848279169 + 902648496) / 2;
    const k = kardexGranzaAgricorp();
    expect(k.consumo).toBeCloseTo(consumo, 2);
    expect(k.compras - k.consumo).toBeCloseTo(902648496 - 848279169, 2);
    expect(k.producto.stockMinimo).toBeCloseTo(consumo / 620 / 12, 4);
    expect(k.movimientos.filter(m => m.tipo === 'entrada').every(m => m.costoUnitario === 620)).toBe(true);
  });

  it('no hay alerta de reposición ni existencias negativas en ningún trimestre', () => {
    const r = calcularInventario(normalizarInventario(inv));
    expect(r.porReponer).toEqual([]);
    expect(() => validarInventarioRespaldo(inv)).not.toThrow();
  });

  it('una composición con años e importes desalineados se descarta y se avisa', () => {
    const mala = { ...inv.composicion, deterioro: [1, 2] };
    expect(normalizarComposicion(mala)).toBeNull();
    expect(normalizarInventario({ ...inv, composicion: mala }).descartados.map(x => x.motivo)).toContain('Composición del inventario inválida');
    expect(() => validarInventarioRespaldo({ ...inv, composicion: mala })).toThrow('descartados');
  });
});

describe('respaldo JSON con los datos de AGRI-CORP', () => {
  const actuales = {
    equilibrio: { precio: null, costoVariableUnitario: null, costosFijos: null, unidades: null, utilidadObjetivo: null,
      escenario: { precio: 0, costoVariable: 0, costosFijos: 0, volumen: 0 } },
    flujo: { saldoInicial: null, periodoBase: '', movimientos: [] },
    apalancamiento: { comportamiento: {}, dap: {}, tasaDefecto: null },
    razonesMercado: { periodos: {} },
    inventario: { productos: [], movimientos: [] }
  };
  const archivo = {
    equilibrio: normalizarEquilibrio(caso.equilibrio), flujo: normalizarFlujo(flujoRealAgricorp('2023')),
    apalancamiento: caso.apalancamiento, razonesMercado: caso.razonesMercado, inventario: caso.inventario
  };

  it('importa los campos propios del caso sin listarlos como omitidos', () => {
    const { modulos, omitidos } = validarRespaldo(structuredClone(archivo), actuales);
    expect(omitidos).toEqual([]);
    expect(modulos.equilibrio).toMatchObject({ origen: 'estados', periodo: '2024', unidadVentas: true });
    expect(modulos.flujo.efectoConversion).toBe(180394);
    expect(modulos.apalancamiento.depreciacionAmortizacion['2024']).toBe(149241420);
    expect(modulos.razonesMercado.nota).toContain('ilustrativo');
    expect(modulos.inventario.composicion.categorias).toHaveLength(9);
  });

  it('un respaldo de otro caso no hereda los campos de AGRI-CORP del módulo actual', () => {
    const conAgricorp = { ...actuales, ...structuredClone(archivo) };
    const otro = { equilibrio: { precio: 800, costoVariableUnitario: 520, costosFijos: 42000, unidades: 250 },
      razonesMercado: { periodos: {} }, flujo: { saldoInicial: 5, periodoBase: '', movimientos: [] } };
    const { modulos } = validarRespaldo(otro, conAgricorp);
    expect(Object.hasOwn(modulos.equilibrio, 'unidadVentas')).toBe(false);
    expect(Object.hasOwn(modulos.razonesMercado, 'nota')).toBe(false);
    expect(Object.hasOwn(modulos.flujo, 'efectoConversion')).toBe(false);
  });

  it('rechaza un campo propio con un valor inválido', () => {
    expect(() => validarRespaldo({ equilibrio: { unidadVentas: 'sí' } }, actuales)).toThrow('equilibrio.unidadVentas');
    expect(() => validarRespaldo({ inventario: { ...caso.inventario, composicion: { fuente: 'x' } } }, actuales)).toThrow();
  });
});
