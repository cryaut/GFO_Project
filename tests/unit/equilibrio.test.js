import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  margenContribucionUnitario, margenSeguridad, puntoEquilibrioUnidades, puntoEquilibrioVentas,
  razonMargenContribucion, unidadesUtilidadObjetivo
} from '../../js/utils/calculate.js';
import {
  baseDesdeEstados, calcularCVU, calcularEscenarios, ejemploEquilibrio, normalizarEquilibrio,
  puntosGrafica, resolverBase, validarEquilibrio
} from '../../js/modules/equilibrio/equilibrio-calculations.js';
import { equilibrioUI } from '../../js/modules/equilibrio/equilibrio-ui.js';
import { calcularApalancamiento } from '../../js/modules/apalancamiento/apalancamiento-calculations.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { cambiar, clic, element, enviar, llenar, mensaje } from './helpers/dom-falso.js';

// Referencia independiente de la ronda 1 (calculada fuera de la app).
const REFERENCIA = JSON.parse(
  readFileSync(new URL('./fixtures/equilibrio_ronda1_referencia.json', import.meta.url), 'utf8')
);
// Entrada del bloque A (compartida con las rondas de Estados y EFE).
const ENTRADA_BLOQUE_A = JSON.parse(
  readFileSync(new URL('./fixtures/estados_ronda2_bloque_A.json', import.meta.url), 'utf8')
);

// Caso del paso 01: P 800, CVu 520, CF 42,000, Q 250, utilidad objetivo 42,000.
const ejemplo = normalizarEquilibrio(ejemploEquilibrio());

describe('fórmulas C-V-U', () => {
  it('margen de contribución unitario y razón de margen', () => {
    expect(margenContribucionUnitario(800, 520)).toBe(280);
    expect(razonMargenContribucion(280, 800)).toBeCloseTo(0.35, 10);
    expect(razonMargenContribucion(280, 0)).toBeNull();
    expect(margenContribucionUnitario(null, 520)).toBeNull();
  });

  it('punto de equilibrio en unidades y en C$', () => {
    expect(puntoEquilibrioUnidades(42000, 280)).toBe(150);
    expect(puntoEquilibrioVentas(42000, 0.35)).toBeCloseTo(120000, 6);
    expect(puntoEquilibrioUnidades(0, 280)).toBe(0);
    // Sin margen positivo no existe punto de equilibrio.
    expect(puntoEquilibrioUnidades(42000, 0)).toBeNull();
    expect(puntoEquilibrioUnidades(42000, -20)).toBeNull();
    expect(puntoEquilibrioVentas(42000, -0.1)).toBeNull();
  });

  it('unidades para una utilidad objetivo y margen de seguridad', () => {
    expect(unidadesUtilidadObjetivo(42000, 42000, 280)).toBe(300); // (42,000 + 42,000) / 280
    expect(unidadesUtilidadObjetivo(42000, -50000, 280)).toBeNull();
    expect(margenSeguridad(250, 150)).toBeCloseTo(0.4, 10); // (250 − 150) / 250
    expect(margenSeguridad(100, 150)).toBeCloseTo(-0.5, 10);
    expect(margenSeguridad(0, 150)).toBeNull();
  });
});

describe('caso base', () => {
  it('resultados resueltos a mano', () => {
    const r = calcularCVU(ejemplo);
    expect(r).toMatchObject({
      mcu: 280, peUnidades: 150, unidadesMinimas: 150, ventas: 200000, costoVariableTotal: 130000,
      mcTotal: 70000, costoTotal: 172000, uaii: 28000, msUnidades: 100, unidadesObjetivo: 300, ventasObjetivo: 240000
    });
    expect(r.rmc).toBeCloseTo(0.35, 10);
    expect(r.peVentas).toBeCloseTo(120000, 6);
    expect(r.msVentas).toBeCloseTo(80000, 6);
    expect(r.msPorcentaje).toBeCloseTo(0.4, 10);
    expect(r.gao).toBeCloseTo(2.5, 10); // 70,000 / 28,000
  });

  it('redondea hacia arriba las unidades mínimas y marca N/D sin margen positivo', () => {
    // 42,000 / (800 − 572) = 184.21 → hay que vender 185
    expect(calcularCVU({ ...ejemplo, costoVariableUnitario: 572 }).unidadesMinimas).toBe(185);
    const sinMargen = calcularCVU({ ...ejemplo, precio: 500 });
    expect(sinMargen).toMatchObject({ mcu: -20, peUnidades: null, peVentas: null, msPorcentaje: null, uaii: -47000 });
  });

  it('valida los datos base', () => {
    expect(validarEquilibrio(ejemplo)).toEqual([]);
    expect(validarEquilibrio({ ...ejemplo, precio: 0 }).join(' ')).toContain('precio de venta');
    expect(validarEquilibrio({ ...ejemplo, costosFijos: null }).join(' ')).toContain('costos fijos');
    expect(validarEquilibrio(normalizarEquilibrio(undefined))).toHaveLength(4);
  });
});

describe('escenarios', () => {
  const porId = Object.fromEntries(calcularEscenarios(ejemplo).map(e => [e.id, e]));

  it('cambios de ±10 % en precio, costo variable, costos fijos y volumen', () => {
    expect(porId['precio-sube'].resultado.uaii).toBeCloseTo(48000, 6); // 250 × 360 − 42,000
    expect(porId['precio-sube'].resultado.peUnidades).toBeCloseTo(116.6667, 3);
    expect(porId['precio-baja'].resultado.uaii).toBeCloseTo(8000, 6); // 250 × 200 − 42,000
    expect(porId['cv-sube'].resultado.uaii).toBeCloseTo(15000, 6); // 250 × 228 − 42,000
    expect(porId['cv-baja'].resultado.uaii).toBeCloseTo(41000, 6);
    expect(porId['cf-sube'].resultado.peUnidades).toBeCloseTo(165, 6); // 46,200 / 280
    expect(porId['cf-baja'].resultado.uaii).toBeCloseTo(32200, 6);
    expect(porId['volumen-baja'].resultado.uaii).toBeCloseTo(21000, 6);
    expect(porId['precio-sube'].deltaUAII).toBeCloseTo(20000, 6);
  });

  it('un 10 % más de volumen sube la UAII en GAO × 10 %', () => {
    expect(porId['volumen-sube'].resultado.uaii).toBeCloseTo(35000, 6); // 275 × 280 − 42,000
    expect(porId['volumen-sube'].pctUAII).toBeCloseTo(0.25, 10); // 2.5 × 10 %
    expect(porId['volumen-sube'].resultado.peUnidades).toBe(150);
  });

  it('escenario personalizado: precio +5 %, CVu +5 % y volumen −10 %', () => {
    const r = porId.personalizado.resultado;
    expect(porId.personalizado.nombre).toContain('precio +5 %');
    expect(r.mcu).toBeCloseTo(294, 6); // 840 − 546
    expect(r.uaii).toBeCloseTo(24150, 6); // 225 × 294 − 42,000
  });

  it('puntos de la gráfica hasta el mayor entre 2 × PE y 1.2 × Q', () => {
    const puntos = puntosGrafica(calcularCVU(ejemplo));
    expect(puntos.ingresos).toHaveLength(21);
    expect(puntos.ingresos.at(-1)).toEqual({ x: 300, y: 240000 });
    expect(puntos.costosTotales[0]).toEqual({ x: 0, y: 42000 });
    expect(puntos.equilibrio.x).toBe(150);
    expect(puntos.equilibrio.y).toBeCloseTo(120000, 6);
  });
});

// Estado de resultados de la demo MUNO MODA 2024 (el balance no interviene).
function muno() {
  return normalizeFinancialData({
    name: 'MUNO MODA S.A.', periods: ['2024'],
    balanceGeneral: { 2024: { activos: {}, pasivos: {}, patrimonio: {} } },
    estadoResultados: { 2024: {
      'Ventas': 920000,
      'Devoluciones sobre ventas': 0, 'Descuentos sobre ventas': 0, 'Rebajas sobre ventas': 0,
      'Costo de Ventas': 545000, 'Gastos de Administracion': 130000,
      'Gastos de Ventas': 90000, 'Otros Ingresos': 18000, 'Otros Gastos': 12000
    } },
    accountIdentities: {
      estadoResultados: {
        'Otros Ingresos': { idCuenta: 'is.nonoperating_income', estado: 'reconocida', metodo: 'contexto', candidatos: [], origen: 'legado' },
        'Otros Gastos': { idCuenta: 'is.noninterest_nonoperating_expenses', estado: 'reconocida', metodo: 'contexto', candidatos: [], origen: 'legado' }
      }
    }
  });
}

describe('desde los estados financieros', () => {
  const config = { comportamiento: { 'Gastos de Ventas': { tipo: 'fijo' } }, dap: {}, tasaDefecto: null };

  it('P = Ventas / Q, CVu = CV / Q y CF de la clasificación; la UAII coincide con los estados', () => {
    const { base, error } = baseDesdeEstados(muno(), config, '2024', 1150);
    expect(error).toBeUndefined();
    expect(base.precio).toBeCloseTo(800, 6); // 920,000 / 1,150
    expect(base.costoVariableUnitario).toBeCloseTo(545000 / 1150, 6);
    expect(base.costosFijos).toBe(220000); // administración (sugerida fija) + ventas
    // UAII = 920,000 − 545,000 − 130,000 − 90,000
    expect(calcularCVU({ ...base, utilidadObjetivo: null }).uaii).toBeCloseTo(155000, 4);
  });

  it('pide clasificar las cuentas sin comportamiento y unidades positivas', () => {
    expect(baseDesdeEstados(muno(), {}, '2024', 1150).error).toContain('Gastos de Ventas');
    expect(baseDesdeEstados(muno(), config, '2024', 0).error).toContain('unidades');
    expect(baseDesdeEstados(muno(), config, '2030', 10).error).toContain('periodo');
  });
});

describe('pantalla de punto de equilibrio', () => {
  function montar(datos = undefined, extra = {}) {
    const page = element();
    const guardar = vi.fn();
    const graficar = vi.fn();
    equilibrioUI(page, { datos, guardar, graficar, ...extra });
    return { page, guardar, graficar };
  }

  it('sin datos pide completarlos o cargar el ejemplo', () => {
    const { page, graficar } = montar();
    expect(page.innerHTML).toContain('Complete el precio');
    expect(graficar).not.toHaveBeenCalled();
  });

  it('con el ejemplo muestra resultados, cálculo, escenarios y gráfica', async () => {
    const { page, guardar, graficar } = montar();
    page.querySelector('#example-equilibrio').value = 'actual'; // AGRI-CORP va preseleccionado (D-113)
    await clic(page, 'eqEjemplo');
    expect(guardar).toHaveBeenCalledWith(expect.objectContaining({ precio: 800, costosFijos: 42000 }));
    const html = page.innerHTML;
    expect(html).toContain('150 u');
    expect(html).toContain('C$ 120,000.00');
    expect(html).toContain('C$ 28,000.00');
    expect(html).toContain('40.00%');
    expect(html).toContain('2.50 veces');
    expect(html).toContain('42,000 / 280');
    expect(html).toContain('+25.00%');
    expect(html).toContain('al menos <strong>150 unidades</strong>');
    expect(graficar).toHaveBeenLastCalledWith('equilibrioChart', expect.objectContaining({ type: 'line' }));
  });

  it('no guarda datos inválidos', async () => {
    const { page, guardar } = montar();
    llenar(page, { eqPrecio: '0', eqCVu: '520', eqCF: '42000', eqUnidades: '250', eqUtilidad: '' });
    await enviar(page, 'formEquilibrio');
    expect(guardar).not.toHaveBeenCalled();
    expect(mensaje(page, 'equilibrioMensaje')).toContain('precio de venta');
  });

  it('guarda los datos del formulario y el escenario personalizado', async () => {
    const { page, guardar } = montar();
    llenar(page, { eqPrecio: '800', eqCVu: '520', eqCF: '42000', eqUnidades: '250', eqUtilidad: '' });
    await enviar(page, 'formEquilibrio');
    expect(guardar).toHaveBeenLastCalledWith(expect.objectContaining({ precio: 800, unidades: 250, utilidadObjetivo: null }));
    llenar(page, { escPrecio: '0', escCV: '0', escCF: '10', escVolumen: '-10' });
    await enviar(page, 'formEscenario');
    expect(guardar.mock.lastCall[0].escenario).toEqual({ precio: 0, costoVariable: 0, costosFijos: 0.1, volumen: -0.1 });
    expect(page.innerHTML).toContain('Personalizado: CF +10 %, volumen −10 %');
  });

  it('con origen estados guarda solo origen, periodo y unidades, y muestra los derivados', async () => {
    const config = { comportamiento: { 'Gastos de Ventas': { tipo: 'fijo' } } };
    const { page, guardar } = montar(undefined, { estados: muno(), configApalancamiento: config });
    await cambiar(page, 'eqOrigen', 'estados');
    llenar(page, { eqPeriodo: '2024', eqUnidades: '1150' });
    await enviar(page, 'formEquilibrio');
    const guardado = guardar.mock.lastCall[0];
    // D-074: sin copias de precio, CVu o CF; solo el origen, el periodo y las unidades.
    expect(guardado).toMatchObject({ origen: 'estados', periodo: '2024', unidades: 1150 });
    expect(guardado.precio).toBeUndefined();
    expect(guardado.costoVariableUnitario).toBeUndefined();
    expect(guardado.costosFijos).toBeUndefined();
    // Los derivados se muestran: P = 920,000 / 1,150 = 800.
    expect(page.innerHTML).toContain('value="800"');
    expect(page.innerHTML).toContain('value="220000"');
    expect(page.innerHTML).toContain('precio promedio');
    expect(mensaje(page, 'equilibrioMensaje')).toContain('se derivan de los estados de 2024');
  });

  it('el motivo del GAO se muestra cuando es N/D (D-073)', () => {
    const { page } = montar({ precio: 100, costoVariableUnitario: 120, costosFijos: 50, unidades: 10 });
    expect(page.innerHTML).toContain('margen de contribución no positivo');
  });

  it('pantalla: el dato dañado muestra el error y se corrige reenviando el formulario', async () => {
    const { page, guardar } = montar({
      ...ejemploEquilibrio(), escenario: { precio: 'abc', costoVariable: 0, costosFijos: 0, volumen: 0 }
    });
    expect(page.innerHTML).toContain('El cambio de precio del escenario');
    expect(page.innerHTML).not.toContain('Personalizado:');
    llenar(page, { escPrecio: '5', escCV: '0', escCF: '0', escVolumen: '0' });
    await enviar(page, 'formEscenario');
    expect(guardar.mock.lastCall[0].escenario).toEqual({ precio: 0.05, costoVariable: 0, costosFijos: 0, volumen: 0 });
    expect(page.innerHTML).toContain('Personalizado: precio +5 %');
  });
});

describe('matriz manual de la ronda 1 (D-073)', () => {
  // Tolerancias del encargo: 0.01 en montos y unidades; 0.0001 en GAO.
  const cerca = (obtenido, esperado, tolerancia) => {
    if (esperado === null || esperado === undefined) {
      expect(obtenido, `esperaba N/D y llegó ${obtenido}`).toBeNull();
      return;
    }
    expect(obtenido, `esperaba ${esperado} y llegó ${obtenido}`).not.toBeNull();
    expect(Math.abs(obtenido - esperado), `esperaba ${esperado} y llegó ${obtenido}`).toBeLessThanOrEqual(tolerancia);
  };

  for (const caso of REFERENCIA.casos_manuales) {
    it(`${caso.id}: ${caso.descripcion}`, () => {
      const r = calcularCVU(normalizarEquilibrio(caso.entrada));
      const e = caso.esperado;
      cerca(r.mcu, e.mcu, 0.01);
      cerca(r.rmc, e.rmc, 0.01);
      cerca(r.peUnidades, e.peUnidades, 0.01);
      cerca(r.peVentas, e.peVentas, 0.01);
      cerca(r.unidadesMinimas, e.unidadesMinimas, 0.01);
      cerca(r.msPorcentaje, e.msPorcentaje, 0.01);
      cerca(r.uaii, e.uaii, 0.01);
      cerca(r.gao, e.gao, 0.0001);
      expect(r.motivoGao, 'motivoGao').toBe(e.motivoGao);
      cerca(r.unidadesObjetivo, e.unidadesObjetivo, 0.01);
    });
  }
});

describe('fuente única de costos (D-074)', () => {
  // Configuración de referencia: costo variable; gastos administrativos y de ventas fijos.
  // «Gastos administrativos» ya es fija por la sugerencia; «Gastos de ventas» se fija aquí.
  const CONFIG = { comportamiento: { 'Gastos de ventas': { tipo: 'fijo' } } };
  const UNIDADES = 1000;

  for (const fila of REFERENCIA.bloque_A_estados) {
    it(`${fila.conjunto} ${fila.periodo}: base derivada, UAII y GAO contra la referencia`, () => {
      const estados = normalizeFinancialData(
        ENTRADA_BLOQUE_A.conjuntos.find(c => c.id === fila.conjunto).entrada
      );
      const datos = { origen: 'estados', periodo: fila.periodo, unidades: UNIDADES };
      const resolucion = resolverBase(datos, estados, CONFIG);
      expect(resolucion.error).toBeNull();
      // Ventas netas = precio × unidades; CV = CVu × unidades; CF igual a la referencia.
      expect(resolucion.base.precio * UNIDADES).toBeCloseTo(fila.ventasNetas, 2);
      expect(resolucion.base.costoVariableUnitario * UNIDADES).toBeCloseTo(fila.costoVariable, 2);
      expect(resolucion.base.costosFijos).toBeCloseTo(fila.costosFijos, 2);
      const r = calcularCVU({ ...datos, ...resolucion.base });
      expect(r.uaii).toBeCloseTo(fila.uaii, 2);
      if (fila.gao === null) {
        expect(r.gao).toBeNull();
        expect(r.motivoGao).toBe(fila.motivoGao);
      } else {
        expect(r.gao).toBeCloseTo(fila.gao, 4);
        expect(r.motivoGao).toBeNull();
      }
      // El GAO de Equilibrio es el mismo que el de Apalancamiento con la misma configuración.
      const apal = calcularApalancamiento(estados, CONFIG);
      const gaoApal = apal.periodos.find(p => p.periodo === fila.periodo).grados.gao;
      if (fila.gao === null) expect(gaoApal).toBeNull();
      else expect(gaoApal).toBeCloseTo(r.gao, 4);
    });
  }

  it('vínculo vivo: «Gastos de ventas» a variable baja el CF en su monto y cambia el GAO, sin reguardar nada', () => {
    const estados = normalizeFinancialData(ENTRADA_BLOQUE_A.conjuntos.find(c => c.id === 'A1').entrada);
    const datos = { origen: 'estados', periodo: '2025', unidades: UNIDADES };
    const conVentasFijas = resolverBase(datos, estados, { comportamiento: { 'Gastos de ventas': { tipo: 'fijo' } } });
    const conVentasVariables = resolverBase(datos, estados, { comportamiento: { 'Gastos de ventas': { tipo: 'variable' } } });
    // El CF baja justo en el monto de «Gastos de ventas» (90) y el GAO cambia.
    expect(conVentasVariables.base.costosFijos)
      .toBeCloseTo(conVentasFijas.base.costosFijos - 90, 6);
    const cvuFijas = calcularCVU({ ...datos, ...conVentasFijas.base });
    const cvuVariables = calcularCVU({ ...datos, ...conVentasVariables.base });
    expect(cvuVariables.gao).not.toBe(cvuFijas.gao);
  });

  it('aviso de CF: sin aviso cuando coincide; aviso con 10 % más; sin aviso sin estados', () => {
    const config = { comportamiento: { 'Gastos de Ventas': { tipo: 'fijo' } } };
    const manual = {
      origen: 'manual', precio: 800, costoVariableUnitario: 520,
      costosFijos: 220000, unidades: 250
    };
    expect(resolverBase(manual, muno(), config).avisoCF).toBeNull();
    const inflado = resolverBase({ ...manual, costosFijos: 242000 }, muno(), config);
    expect(inflado.avisoCF).not.toBeNull();
    expect(inflado.avisoCF.cfManual).toBe(242000);
    expect(inflado.avisoCF.cfEstados).toBe(220000);
    expect(inflado.avisoCF.diferenciaPct).toBeCloseTo(0.1, 6);
    expect(resolverBase(manual, null, config).avisoCF).toBeNull();
  });

  it('migración: datos sin origen se leen como manuales y dan los mismos resultados (M1)', () => {
    const m1 = REFERENCIA.casos_manuales.find(caso => caso.id === 'M1');
    const datos = normalizarEquilibrio(m1.entrada); // formato de hoy: sin campo origen
    expect(datos.origen).toBe('manual');
    const resolucion = resolverBase(datos, null, {});
    expect(resolucion.base).toEqual({
      precio: 100, costoVariableUnitario: 60, costosFijos: 2000, unidades: 100
    });
    const r = calcularCVU({ ...datos, ...resolucion.base });
    expect(r.uaii).toBe(2000);
    expect(r.gao).toBeCloseTo(2, 10);
  });
});

describe('escenarios inválidos (D-075)', () => {
  it('un valor de escenario que no es número se conserva como null y se reporta por campo', () => {
    const datos = normalizarEquilibrio({
      ...ejemploEquilibrio(), escenario: { precio: 'abc', costoVariable: 0, costosFijos: 0, volumen: 0 }
    });
    expect(datos.escenario.precio).toBeNull();
    expect(datos.escenario.costoVariable).toBe(0);
    const errores = validarEquilibrio(datos);
    expect(errores.join(' ')).toContain('El cambio de precio del escenario');
  });

  it('un escenario vacío sigue siendo 0 y no produce errores', () => {
    const datos = normalizarEquilibrio({
      escenario: { precio: '', costoVariable: undefined, costosFijos: null, volumen: 0 }
    });
    expect(datos.escenario).toEqual({ precio: 0, costoVariable: 0, costosFijos: 0, volumen: 0 });
    expect(validarEquilibrio({ ...ejemploEquilibrio(), escenario: datos.escenario })).toEqual([]);
  });

  it('el escenario personalizado no se calcula con un null; los predefinidos sí', () => {
    const danado = normalizarEquilibrio({
      ...ejemploEquilibrio(), escenario: { precio: 'abc', costoVariable: 0, costosFijos: 0, volumen: 0 }
    });
    const porId = Object.fromEntries(calcularEscenarios(danado).map(e => [e.id, e]));
    expect(porId.personalizado).toBeUndefined();
    expect(porId['precio-sube']).toBeDefined();
    expect(porId['volumen-baja'].resultado.uaii).toBeCloseTo(21000, 6);
  });
});

describe('motivos precisos en baseDesdeEstados (D-076)', () => {
  const CONFIG = { comportamiento: { 'Gastos de ventas': { tipo: 'fijo' } } };

  it('una cuenta renombrada (fuera del catálogo) pide revisar su nombre en Estados', () => {
    const entrada = JSON.parse(JSON.stringify(ENTRADA_BLOQUE_A.conjuntos.find(c => c.id === 'A1').entrada));
    const er = entrada.estadoResultados['2025'];
    er['Gastos de venta del periodo'] = er['Gastos de ventas'];
    delete er['Gastos de ventas'];
    const estados = normalizeFinancialData(entrada);
    const r = resolverBase({ origen: 'estados', periodo: '2025', unidades: 1000 }, estados, CONFIG);
    expect(r.error).toContain('Gastos de venta del periodo');
    expect(r.error).toContain('no está en el catálogo de cuentas');
    expect(r.error).not.toContain('Clasifique en Apalancamiento');
  });

  it('una cuenta del catálogo sin fijo o variable pide clasificarla en Apalancamiento', () => {
    const estados = normalizeFinancialData(ENTRADA_BLOQUE_A.conjuntos.find(c => c.id === 'A1').entrada);
    const r = resolverBase({ origen: 'estados', periodo: '2025', unidades: 1000 }, estados, {});
    expect(r.error).toContain('Clasifique en Apalancamiento como fijas o variables: Gastos de ventas.');
    expect(r.error).not.toContain('no está en el catálogo');
  });
});
