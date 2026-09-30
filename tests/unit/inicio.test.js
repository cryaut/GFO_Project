import { describe, expect, it } from 'vitest';
import {
  areasClave, finanzasPersonales, kpisPrincipales, panoramaGeneral, resumenActivos, saludGeneral, tendenciaEstados
} from '../../js/modules/inicio/inicio-calculations.js';
import { inicioUI } from '../../js/modules/inicio/inicio-ui.js';
import { construirReporte } from '../../js/modules/proforma/proforma-calculations.js';
import { calcularPresupuestoMaestro, ejemploPlaneacion, normalizarSupuestos } from '../../js/modules/planeacion/planeacion-calculations.js';
import { calcularCVU, ejemploEquilibrio, normalizarEquilibrio } from '../../js/modules/equilibrio/equilibrio-calculations.js';
import { calcularFlujo, ejemploFlujo } from '../../js/modules/flujo/flujo-calculations.js';
import { calcularInventario, ejemploInventario } from '../../js/modules/inventario/inventario-calculations.js';
import { normalizeFinancialData } from '../../js/modules/estados/estados-normalize.js';
import { clic, element } from './helpers/dom-falso.js';

// Estados de MUNO MODA 2023–2024 (mismos de proforma.test.js): ventas 850,000 → 920,000.
function estadosMuno() {
  const balance = (ef, cxc, inv, otros, dep, cxp, pcp, prov, plp, util) => ({
    activos: { 'Efectivo': ef, 'Cuentas por Cobrar': cxc, 'Inventario': inv, 'Otros Activos Corrientes': otros, 'Edificios': 200000, 'Depreciacion Acumulada': dep },
    pasivos: { 'Cuentas por Pagar': cxp, 'Pasivo Corto Plazo': pcp, 'Provisiones': prov, 'Pasivo Largo Plazo': plp },
    patrimonio: { 'Capital Social': 200000, 'Utilidades Acumuladas': util }
  });
  const resultados = (v, cv, ga, gv, oi, og) => ({
    'Ventas': v, 'Costo de Ventas': cv, 'Gastos de Administracion': ga, 'Gastos de Ventas': gv, 'Otros Ingresos': oi, 'Otros Gastos': og
  });
  return normalizeFinancialData({
    name: 'MUNO MODA S.A.', periods: ['2023', '2024'],
    balanceGeneral: {
      2023: balance(45000, 120000, 180000, 25000, -98525, 85000, 60000, 15000, 80000, 31475),
      2024: balance(52000, 135000, 195000, 30000, -116475, 92000, 65000, 18000, 75000, 45525)
    },
    estadoResultados: {
      2023: resultados(850000, 510000, 120000, 85000, 15000, 10000),
      2024: resultados(920000, 545000, 130000, 90000, 18000, 12000)
    }
  });
}

const UMBRALES = { ratioCorrienteMin: 1, ratioRapidoMin: 0.5, endeudamientoMax: 0.6, margenNetoMin: 0.05, roeMin: 0.1, coberturaInteresesMin: 2 };
const RAZONES = {
  RC: 2.35, RR: 1.24, endeudamiento: 0.5, MN: 0.175, ROA: 0.33, deudaPatrimonio: 1, coberturaIntereses: null,
  denominadores: { RC: 1, RR: 1, End: 1, MN: 1, ROA: 1, deudaPatrimonio: 1, coberturaIntereses: 0 }
};

function entradas(extra = {}) {
  return {
    estados: estadosMuno(),
    razones: RAZONES,
    dupont: { PM: 0.175, AT: 1.9, EM: 2.0, ROE: 0.665 },
    apalancamiento: null,
    presupuesto: calcularPresupuestoMaestro(normalizarSupuestos(ejemploPlaneacion())),
    equilibrio: calcularCVU(normalizarEquilibrio(ejemploEquilibrio())),
    flujo: calcularFlujo(ejemploFlujo()),
    inventario: calcularInventario(ejemploInventario()),
    umbrales: UMBRALES,
    ...extra
  };
}

const area = (lista, id) => lista.find(a => a.id === id);

describe('tendencia y KPIs', () => {
  it('serie por periodo y variación contra el periodo anterior', () => {
    const t = tendenciaEstados(estadosMuno());
    expect(t.periodos).toEqual(['2023', '2024']);
    expect(t.ventas).toEqual([850000, 920000]);
    // UN 2023 = 850,000 − 510,000 − 120,000 − 85,000 + 15,000 − 10,000 = 140,000; 2024 = 161,000.
    expect(t.utilidadNeta).toEqual([140000, 161000]);
    const kpis = kpisPrincipales(entradas());
    const ventas = kpis.find(k => k.clave === 'ventas');
    expect(ventas.valor).toBe(920000);
    expect(ventas.cambio).toBeCloseTo(70000 / 850000, 10);
    expect(kpis.find(k => k.clave === 'utilidadNeta').cambio).toBeCloseTo(21000 / 140000, 10);
    expect(kpis.find(k => k.clave === 'efectivo')).toMatchObject({ etiqueta: 'Saldo de efectivo', valor: calcularFlujo(ejemploFlujo()).saldoFinal });
  });

  it('sin estados no hay tendencia ni KPIs de estados', () => {
    expect(tendenciaEstados(null)).toBeNull();
    expect(kpisPrincipales({ estados: null })).toEqual([]);
  });

  it('una razón con denominador 0 queda N/D (null), no 0', () => {
    const kpis = kpisPrincipales(entradas({ razones: { RC: 0, endeudamiento: 0, denominadores: { RC: 0, End: 0 } } }));
    expect(kpis.find(k => k.clave === 'liquidez').valor).toBeNull();
    expect(kpis.find(k => k.clave === 'endeudamiento').valor).toBeNull();
  });
});

describe('áreas clave e interpretación', () => {
  it('liquidez holgada, rentabilidad y endeudamiento en orden', () => {
    const areas = areasClave(entradas());
    expect(area(areas, 'liquidez')).toMatchObject({ estado: 'ok' });
    expect(area(areas, 'liquidez').interpretacion).toContain('Liquidez holgada');
    expect(area(areas, 'liquidez').interpretacion).toContain('C$ 2.35');
    expect(area(areas, 'rentabilidad').estado).toBe('ok');
    expect(area(areas, 'rentabilidad').interpretacion).toContain('C$ 17.50 por cada C$ 100');
    expect(area(areas, 'endeudamiento').estado).toBe('ok');
    // Sin intereses la cobertura es N/D, no un valor que dispare la alerta.
    expect(area(areas, 'endeudamiento').puntos.find(p => p.etiqueta === 'Cobertura de intereses').valor).toBeNull();
  });

  it('marca alertas de liquidez, pérdida y endeudamiento alto', () => {
    const areas = areasClave(entradas({
      razones: { RC: 0.8, RR: 0.4, endeudamiento: 0.75, MN: -0.02, ROA: -0.01, denominadores: { RC: 1, RR: 1, End: 1, MN: 1, ROA: 1 } }
    }));
    expect(area(areas, 'liquidez').estado).toBe('alerta');
    expect(area(areas, 'liquidez').interpretacion).toContain('no alcanza');
    expect(area(areas, 'rentabilidad').interpretacion).toContain('pierde 2.00%');
    expect(area(areas, 'endeudamiento').interpretacion).toContain('75.00%');
  });

  it('presupuesto con financiamiento e inventario por reponer piden revisión', () => {
    const areas = areasClave(entradas());
    expect(area(areas, 'presupuesto').estado).toBe('alerta');
    expect(area(areas, 'presupuesto').interpretacion).toContain('C$ 20,800.00');
    expect(area(areas, 'inventario').interpretacion).toContain('2 producto(s)');
    expect(area(areas, 'flujo').estado).toBe('ok');
  });

  it('solo incluye los módulos con datos', () => {
    expect(areasClave({ umbrales: UMBRALES })).toEqual([]);
    const ids = areasClave(entradas({ razones: null, presupuesto: null })).map(a => a.id);
    expect(ids).toEqual(['equilibrio', 'flujo', 'inventario']);
  });
});

describe('activos', () => {
  it('valor en libros con depreciación en línea recta y activos que requieren atención', () => {
    // (10,000 − 1,000) / 5 = 1,800 por año; 2 años → 3,600; libros 6,400.
    // (5,000 − 0) / 10 = 500 por año; 12 años topan en 10 → 5,000; libros 0.
    const r = resumenActivos([
      { costoOriginal: 10000, valorResidual: 1000, vidaUtil: 5, aniosConsumidos: 2, estado: 'Bueno' },
      { costoOriginal: 5000, valorResidual: 0, vidaUtil: 10, aniosConsumidos: 12, estado: 'Obsoleto' }
    ]);
    expect(r).toMatchObject({ cantidad: 2, costoTotal: 15000, valorLibros: 6400, requierenAtencion: 1 });
    expect(r.pctDepreciado).toBeCloseTo(8600 / 15000, 10);
    expect(resumenActivos([])).toBeNull();
  });
});

describe('finanzas personales (separadas de la empresa)', () => {
  it('capacidad y tasa de ahorro, y si alcanza para la meta', () => {
    // Ejemplo del presupuesto personal: 22,500 − 17,200 = 5,300 (23.56 %); meta 36,000 / 12 = 3,000 al mes.
    const [pp] = finanzasPersonales({ ingresos: 22500, gastos: 17200, metaAhorro: 36000, mesesDisponibles: 12 });
    expect(pp).toMatchObject({ id: 'presupuestoPersonal', estado: 'ok', ruta: '#/presupuesto' });
    expect(pp.puntos.find(p => p.etiqueta === 'Capacidad de ahorro').valor).toBe(5300);
    expect(pp.puntos.find(p => p.etiqueta === 'Tasa de ahorro').valor).toBeCloseTo(5300 / 22500, 10);
    expect(pp.puntos.find(p => p.etiqueta === 'Ahorro necesario para la meta').valor).toBe(3000);
    expect(pp.interpretacion).toContain('Alcanza para la meta de C$ 36,000.00 en 12 meses');
  });

  it('avisa si no alcanza para la meta o si los gastos superan los ingresos', () => {
    // Meta 72,000 / 12 = 6,000 al mes; capacidad 5,300 → faltan 700.
    const [corto] = finanzasPersonales({ ingresos: 22500, gastos: 17200, metaAhorro: 72000, mesesDisponibles: 12 });
    expect(corto.estado).toBe('alerta');
    expect(corto.interpretacion).toContain('Faltan C$ 700.00 al mes');
    const [deficit] = finanzasPersonales({ ingresos: 10000, gastos: 12000 });
    expect(deficit.interpretacion).toContain('superan los ingresos en C$ 2,000.00');
  });

  it('activos del hogar y bloque vacío', () => {
    const lista = finanzasPersonales(null, [{ costoOriginal: 1000, valorResidual: 0, vidaUtil: 10, aniosConsumidos: 5, estado: 'Deficiente' }]);
    expect(lista.map(a => a.id)).toEqual(['activos']);
    expect(lista[0].titulo).toBe('Activos del hogar');
    expect(lista[0].estado).toBe('alerta');
    expect(finanzasPersonales({ ingresos: 0, gastos: 0 }, [])).toEqual([]);
  });

  it('no cuentan para la salud ni para las áreas de la empresa', () => {
    const e = entradas();
    const sin = panoramaGeneral(e, construirReporte(e));
    const con = panoramaGeneral(e, construirReporte(e), {
      presupuesto: { ingresos: 10000, gastos: 12000 },
      activos: [{ costoOriginal: 1000, vidaUtil: 5, aniosConsumidos: 1, estado: 'Obsoleto' }]
    });
    expect(con.salud).toEqual(sin.salud);
    expect(con.areas.map(a => a.id)).toEqual(sin.areas.map(a => a.id));
    expect(con.areas.some(a => a.id === 'activos')).toBe(false);
    expect(con.personal.map(a => a.id)).toEqual(['presupuestoPersonal', 'activos']);
  });

  it('la pantalla muestra el bloque personal aparte', () => {
    const e = entradas();
    const page = element();
    inicioUI(page, { panorama: panoramaGeneral(e, construirReporte(e), { presupuesto: { ingresos: 22500, gastos: 17200 } }) });
    expect(page.innerHTML).toContain('Mis finanzas personales');
    expect(page.innerHTML).toContain('no afecta la salud general');
    expect(page.innerHTML).toContain('Finanzas personales');
    expect(page.innerHTML).toContain('Activos del Hogar');
  });
});

describe('salud general', () => {
  const a = estado => ({ estado });
  it('sólida, estable, atención y sin datos', () => {
    expect(saludGeneral([a('ok'), a('ok'), a('ok'), a('ok'), a('info')])).toMatchObject({ nivel: 'solida', puntaje: 1, ok: 4, alerta: 0 });
    expect(saludGeneral([a('ok'), a('ok'), a('ok'), a('alerta')]).nivel).toBe('estable');
    expect(saludGeneral([a('ok'), a('ok'), a('ok'), a('ok')], [{ nivel: 'alta' }]).nivel).toBe('estable');
    expect(saludGeneral([a('ok'), a('alerta'), a('alerta')]).nivel).toBe('atencion');
    expect(saludGeneral([a('ok'), a('ok')], [{ nivel: 'alta' }, { nivel: 'alta' }]).nivel).toBe('atencion');
    expect(saludGeneral([a('info')])).toMatchObject({ nivel: 'sin-datos', puntaje: null });
  });
});

describe('pantalla de Inicio', () => {
  it('muestra empresa, KPIs, áreas y alertas escapadas, y dibuja la tendencia', () => {
    const e = entradas({ estados: { ...estadosMuno(), name: '<b>MUNO</b>' } });
    const panorama = panoramaGeneral(e, construirReporte(e));
    const page = element();
    const graficas = [];
    inicioUI(page, { panorama, graficar: (id, config) => graficas.push({ id, config }) });
    expect(page.innerHTML).toContain('&lt;b&gt;MUNO&lt;/b&gt;');
    expect(page.innerHTML).not.toContain('<b>MUNO</b>');
    expect(page.innerHTML).toContain('Periodo 2024');
    expect(page.innerHTML).toContain('vs 2023');
    expect(page.innerHTML).toContain('Puntos clave de la empresa');
    expect(page.innerHTML).toContain('Alertas prioritarias');
    expect(graficas).toHaveLength(1);
    expect(graficas[0].config.data.labels).toEqual(['2023', '2024']);
  });

  it('sin datos muestra cómo empezar y los módulos, sin gráfica', () => {
    const panorama = panoramaGeneral({ umbrales: UMBRALES }, construirReporte({}));
    const page = element();
    const graficas = [];
    inicioUI(page, { panorama, graficar: () => graficas.push(1) });
    expect(page.innerHTML).toContain('Bienvenido a GFO Toolkit');
    expect(page.innerHTML).toContain('Cómo empezar');
    expect(page.innerHTML).toContain('href="#/estados"');
    expect(page.innerHTML).not.toContain('inicioTendencia');
    expect(graficas).toHaveLength(0);
  });

  it('el botón de ejemplo aparece solo sin datos y llama a cargarEjemplo', async () => {
    const vacio = panoramaGeneral({ umbrales: UMBRALES }, construirReporte({}));
    const page = element();
    let llamadas = 0;
    inicioUI(page, { panorama: vacio, cargarEjemploEmpresa: () => { llamadas += 1; }, cargarEjemploPersonal: () => { llamadas += 10; } });
    await clic(page, 'inicioEjemploPersonal');
    await clic(page, 'inicioEjemplo');
    expect(llamadas).toBe(11);

    const e = entradas();
    const conDatos = element();
    inicioUI(conDatos, { panorama: panoramaGeneral(e, construirReporte(e)), cargarEjemploEmpresa: () => {} });
    expect(conDatos.querySelector('#inicioEjemplo')).toBeNull();
  });
});
