import { describe, it, expect } from 'vitest';
import { resolveAccountType } from '../../js/modules/estados/estados-calculations.js';
import {
  cuentasOperativas, sugerirComportamiento, resolverComportamiento,
  derivarPeriodo, calcularApalancamiento
} from '../../js/modules/apalancamiento/apalancamiento-calculations.js';

// Casos del paso 03 (docs/planificacion/apalancamiento/03-datos-y-derivacion.md).
// Nombres de cuenta propios y accountTypes explícitos, como pide pruebas-y-documentacion.md.

// Caso A del paso 01 como estados: ventas +10 %, CV 60 % de las ventas, CF 250,000,
// I 50,000, T 30 %, DAP 7,000.
function casoA({ conImpuestos = true, periodos = ['P1', 'P2'] } = {}) {
  const er = {
    P1: {
      'Ingresos por consultoría': 1000000, 'Costo de mercadería': 600000,
      'Sueldos de oficina': 150000, 'Publicidad': 100000, 'Intereses bancarios': 50000
    },
    P2: {
      'Ingresos por consultoría': 1100000, 'Costo de mercadería': 660000,
      'Sueldos de oficina': 150000, 'Publicidad': 100000, 'Intereses bancarios': 50000
    }
  };
  if (conImpuestos) {
    er.P1['IR del periodo'] = 30000; // 30 % de UAI 100,000
    er.P2['IR del periodo'] = 42000; // 30 % de UAI 140,000
  }
  return {
    name: 'Consultora A',
    periods: periodos,
    balanceGeneral: Object.fromEntries(periodos.map(p => [p, {}])),
    estadoResultados: Object.fromEntries(periodos.map(p => [p, er[p]])),
    accountTypes: {
      estadoResultados: {
        'Ingresos por consultoría': 'ventas', 'Costo de mercadería': 'costoVentas',
        'Sueldos de oficina': 'gastosAdmin', 'Publicidad': 'gastosVentas',
        'Intereses bancarios': 'intereses', 'IR del periodo': 'impuestos'
      }
    }
  };
}

const CONFIG_A = {
  comportamiento: { 'Publicidad': { tipo: 'fijo' } },
  dap: { P1: 7000, P2: 7000 },
  tasaDefecto: null
};

// Estado de resultados de la demo MUNO MODA (sin intereses, impuestos ni DAP).
const MUNO = {
  name: 'MUNO MODA S.A.',
  periods: ['2023', '2024'],
  balanceGeneral: { 2023: {}, 2024: {} },
  estadoResultados: {
    2023: {
      'Ventas': 850000, 'Costo de Ventas': 510000, 'Gastos de Administracion': 120000,
      'Gastos de Ventas': 85000, 'Otros Ingresos': 15000, 'Otros Gastos': 10000
    },
    2024: {
      'Ventas': 920000, 'Costo de Ventas': 545000, 'Gastos de Administracion': 130000,
      'Gastos de Ventas': 90000, 'Otros Ingresos': 18000, 'Otros Gastos': 12000
    }
  },
  accountTypes: {
    estadoResultados: {
      'Ventas': 'ventas', 'Costo de Ventas': 'costoVentas', 'Gastos de Administracion': 'gastosAdmin',
      'Gastos de Ventas': 'gastosVentas', 'Otros Ingresos': 'otrosIngresos', 'Otros Gastos': 'otrosGastos'
    }
  }
};

const codigos = resultado => resultado.advertencias.map(a => a.codigo);

describe('resolveAccountType (Estados)', () => {
  it('usa el tipo explícito y, si no hay, lo infiere por el nombre', () => {
    expect(resolveAccountType(casoA(), 'estadoResultados', 'Publicidad')).toBe('gastosVentas');
    expect(resolveAccountType({}, 'estadoResultados', 'Costo de ventas')).toBe('costoVentas');
    expect(resolveAccountType({}, 'estadoResultados', 'Cuenta desconocida')).toBe('');
  });

  it('no toma propiedades heredadas como tipo explícito', () => {
    expect(resolveAccountType({ accountTypes: { estadoResultados: {} } }, 'estadoResultados', 'toString')).toBe('');
  });
});

describe('Clasificación de costos', () => {
  it('lista las cuentas operativas con su tipo, sin repetir', () => {
    expect(cuentasOperativas(casoA())).toEqual([
      { nombre: 'Costo de mercadería', tipo: 'costoVentas' },
      { nombre: 'Sueldos de oficina', tipo: 'gastosAdmin' },
      { nombre: 'Publicidad', tipo: 'gastosVentas' }
    ]);
  });

  it('sugiere variable para costo de ventas y fijo para administración', () => {
    expect(sugerirComportamiento('costoVentas')).toBe('variable');
    expect(sugerirComportamiento('gastosAdmin')).toBe('fijo');
    expect(sugerirComportamiento('gastosVentas')).toBeNull();
  });

  it('prefiere lo guardado, luego la sugerencia, y descarta lo inválido', () => {
    const cuentas = resolverComportamiento(cuentasOperativas(casoA()), {
      'Sueldos de oficina': { tipo: 'mixto', pctVariable: 0.2 },
      'Publicidad': { tipo: 'mixto', pctVariable: 1.5 } // inválido: se ignora
    });
    expect(cuentas.map(c => [c.nombre, c.comportamiento, c.origen])).toEqual([
      ['Costo de mercadería', { tipo: 'variable', pctVariable: 1 }, 'sugerido'],
      ['Sueldos de oficina', { tipo: 'mixto', pctVariable: 0.2 }, 'guardado'],
      ['Publicidad', null, null]
    ]);
  });
});

describe('Derivación — caso A del paso 01', () => {
  const resultado = calcularApalancamiento(casoA(), CONFIG_A);

  it('deriva las variables del periodo 1', () => {
    const v = resultado.periodos[0].variables;
    // CV 600,000; CF 150,000 + 100,000; MC 400,000; UAII 150,000; UAI 100,000; UN 70,000; UDAC 63,000
    expect(v).toMatchObject({
      ventas: 1000000, cv: 600000, cf: 250000, mc: 400000, uaii: 150000,
      oi: 0, og: 0, i: 50000, uai: 100000, ir: 30000, un: 70000, dap: 7000, udac: 63000,
      origenT: 'efectiva'
    });
    expect(v.t).toBeCloseTo(0.3, 6);
    expect(v.denominadorGaf).toBeCloseTo(90000, 6); // 100,000 − 7,000 / 0.7
  });

  it('reproduce los grados estructurales del caso A', () => {
    const [p1, p2] = resultado.periodos.map(p => p.grados);
    expect(p1.gao).toBeCloseTo(8 / 3, 6);
    expect(p1.gaf).toBeCloseTo(5 / 3, 6);
    expect(p1.gat).toBeCloseTo(40 / 9, 6);
    expect(p2.gao).toBeCloseTo(44 / 19, 6);
    expect(p2.gaf).toBeCloseTo(19 / 13, 6);
    expect(p2.gat).toBeCloseTo(44 / 13, 6);
  });

  it('por variación coincide con el estructural del periodo base', () => {
    expect(resultado.variaciones).toHaveLength(1);
    const variacion = resultado.variaciones[0];
    expect(variacion).toMatchObject({ desde: 'P1', hasta: 'P2' });
    expect(variacion.gao).toBeCloseTo(8 / 3, 6);
    expect(variacion.gaf).toBeCloseTo(5 / 3, 6);
    expect(variacion.gat).toBeCloseTo(40 / 9, 6);
    expect(codigos(resultado)).not.toContain('estructura-cambio');
  });

  it('avisa que hay comportamientos sugeridos sin guardar', () => {
    const aviso = resultado.advertencias.find(a => a.codigo === 'clasificacion-sugerida');
    expect(aviso.cuentas).toEqual(['Costo de mercadería', 'Sueldos de oficina']);
    expect(codigos(resultado)).not.toContain('tasa-por-defecto');
  });

  it('deja la traza cuenta → concepto → fórmula → resultado', () => {
    const traza = resultado.periodos[0].traza;
    const cv = traza.find(t => t.concepto === 'CV');
    expect(cv.valor).toBe(600000);
    expect(cv.cuentas).toEqual([
      { nombre: 'Costo de mercadería', importe: 600000, comportamiento: 'variable', origen: 'sugerido' }
    ]);
    expect(traza.find(t => t.concepto === 'GAF').formula).toBe('UAII / (UAI − DAP / (1 − T))');
    expect(traza.map(t => t.concepto)).toEqual([
      'Ventas', 'CV', 'CF', 'MC', 'UAII', 'OI', 'OG', 'I', 'UAI', 'IR', 'T', 'UN', 'DAP', 'UDAC',
      'GAO', 'GAF', 'GAT'
    ]);
  });
});

describe('Derivación — MUNO MODA', () => {
  it('sin clasificar gastos de ventas: GAO y GAT N/D, GAF y variación disponibles', () => {
    const resultado = calcularApalancamiento(MUNO, {});
    const p2023 = resultado.periodos[0];
    expect(p2023.variables.cv).toBeNull();
    // GAO y GAT necesitan el MC; el GAF (UAII / UAI) no depende de la clasificación
    expect(p2023.grados.gao).toBeNull();
    expect(p2023.grados.gat).toBeNull();
    expect(p2023.grados.gaf).toBeCloseTo(0.964286, 6);
    expect(p2023.faltantes).toContainEqual({ tipo: 'sinComportamiento', cuenta: 'Gastos de Ventas' });
    // %ΔUAII = 20,000 / 135,000; %ΔVentas = 70,000 / 850,000
    expect(resultado.variaciones[0].gao).toBeCloseTo(1.798942, 6);
    expect(resultado.advertencias).toContainEqual({ codigo: 'sin-comportamiento', cuentas: ['Gastos de Ventas'] });
  });

  it('con gastos de ventas fijos: GAO 2023 = 340,000 / 135,000', () => {
    const resultado = calcularApalancamiento(MUNO, { comportamiento: { 'Gastos de Ventas': { tipo: 'fijo' } } });
    const p2023 = resultado.periodos[0];
    expect(p2023.grados.gao).toBeCloseTo(2.518519, 6);
    // GAF con la UAI (D-007): 135,000 / (135,000 + 15,000 − 10,000)
    expect(p2023.grados.gaf).toBeCloseTo(0.964286, 6);
    expect(codigos(resultado)).toContain('clasificacion-sugerida');
    // 1.80 frente a 2.52: difiere más de 10 %
    expect(resultado.advertencias).toContainEqual(
      expect.objectContaining({ codigo: 'estructura-cambio', desde: '2023', hasta: '2024' })
    );
  });
});

describe('Derivación — casos especiales', () => {
  it('cuenta mixta: reparte el importe entre CV y CF', () => {
    const config = { ...CONFIG_A, comportamiento: { 'Publicidad': { tipo: 'mixto', pctVariable: 0.4 } } };
    const v = derivarPeriodo(casoA(), 'P1', config).variables;
    expect(v.cv).toBeCloseTo(640000, 6); // 600,000 + 40 % de 100,000
    expect(v.cf).toBeCloseTo(210000, 6); // 150,000 + 60 % de 100,000
    expect(v.mc - v.cf).toBeCloseTo(v.uaii, 6);
  });

  it('sin cuenta de impuestos: IR null, T por defecto y aviso si hay DAP', () => {
    const resultado = calcularApalancamiento(casoA({ conImpuestos: false }), CONFIG_A);
    const v = resultado.periodos[0].variables;
    expect(v.ir).toBeNull();
    expect(v.t).toBe(0.3);
    expect(v.origenT).toBe('defecto');
    expect(v.un).toBe(100000);
    expect(resultado.advertencias).toContainEqual({ codigo: 'tasa-por-defecto', periodo: 'P1' });
  });

  it('usa la tasa por defecto configurada', () => {
    const config = { ...CONFIG_A, tasaDefecto: 0.25 };
    const v = derivarPeriodo(casoA({ conImpuestos: false }), 'P1', config).variables;
    expect(v.t).toBe(0.25);
  });

  it('una cuenta del estado de resultados sin tipo deja el periodo en N/D', () => {
    const datos = casoA();
    datos.estadoResultados.P1['Partida rara'] = 1000;
    const periodo = derivarPeriodo(datos, 'P1', CONFIG_A);
    expect(periodo.variables.uaii).toBeNull();
    expect(periodo.grados).toEqual({ gao: null, gaf: null, gat: null });
    expect(periodo.faltantes).toContainEqual({ tipo: 'sinClasificacion', cuenta: 'Partida rara' });
  });

  it('un solo periodo no tiene resultados por variación', () => {
    const resultado = calcularApalancamiento(casoA({ periodos: ['P1'] }), CONFIG_A);
    expect(resultado.periodos).toHaveLength(1);
    expect(resultado.variaciones).toEqual([]);
  });

  it('ignora comportamientos de cuentas que ya no existen', () => {
    const config = { ...CONFIG_A, comportamiento: { ...CONFIG_A.comportamiento, 'Cuenta vieja': { tipo: 'fijo' } } };
    expect(() => calcularApalancamiento(casoA(), config)).not.toThrow();
    expect(calcularApalancamiento(casoA(), config).cuentas.map(c => c.nombre)).not.toContain('Cuenta vieja');
  });

  it('DAP inválido da N/D en GAF y GAT, pero no en GAO', () => {
    const periodo = derivarPeriodo(casoA(), 'P1', { ...CONFIG_A, dap: { P1: -5 } });
    expect(periodo.variables.dap).toBeNull();
    expect(periodo.grados.gao).toBeCloseTo(8 / 3, 6);
    expect(periodo.grados.gaf).toBeNull();
    expect(periodo.faltantes).toContainEqual({ tipo: 'dapInvalido', periodo: 'P1' });
  });

  it('UAII negativa: grado negativo con advertencia', () => {
    // Ventas 400,000; CV 240,000; CF 150,000 + 100,000 → UAII −90,000
    const datos = casoA({ conImpuestos: false, periodos: ['P1'] });
    Object.assign(datos.estadoResultados.P1, { 'Ingresos por consultoría': 400000, 'Costo de mercadería': 240000 });
    const resultado = calcularApalancamiento(datos, CONFIG_A);
    expect(resultado.periodos[0].grados.gao).toBeCloseTo(160000 / -90000, 6);
    expect(codigos(resultado)).toContain('bajo-equilibrio-operativo');
    expect(codigos(resultado)).toContain('bajo-equilibrio-financiero');
  });

  it('sin periodos devuelve listas vacías', () => {
    const resultado = calcularApalancamiento({ periods: [], balanceGeneral: {}, estadoResultados: {} }, {});
    expect(resultado).toEqual({ periodos: [], variaciones: [], cuentas: [], advertencias: [] });
  });
});
