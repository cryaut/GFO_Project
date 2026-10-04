import { describe, expect, it } from 'vitest';
import { validarRespaldo } from '../../js/modules/integracion/integracion-respaldo.js';

// Datos actuales del store simulados (forma mínima de cada módulo).
function actuales() {
  return {
    presupuesto: { ingresoMensual: 0, metaAhorro: 0, mesesDisponibles: 12, gastos: [], semanas: [], ingresos: [] },
    estados: { balanceGeneral: {}, estadoResultados: {}, periods: [] },
    equilibrio: { precio: null, escenario: { precio: 0 } },
    flujo: { saldoInicial: null, periodoBase: '', movimientos: [] },
    planeacion: { supuestos: { crecimiento: 0.1 } },
    theme: 'light'
  };
}

const estadosValidos = () => ({
  periods: ['2024'],
  balanceGeneral: { '2024': { activos: { Efectivo: 100 }, pasivos: {}, patrimonio: { Capital: 100 } } },
  estadoResultados: { '2024': { Ventas: 50 } },
  accountTypes: { activos: { Efectivo: 'efectivo' }, patrimonio: { Capital: 'patrimonio' }, estadoResultados: { Ventas: 'ventas' } }
});

describe('validarRespaldo', () => {
  it('acepta módulos válidos, los devuelve copiados e ignora el tema', () => {
    const base = actuales();
    const archivo = { presupuesto: { ingresoMensual: 900, gastos: [{ nombre: 'Renta', monto: 300 }] }, theme: 'dark' };
    const { modulos, omitidos } = validarRespaldo(archivo, base);
    expect(modulos.presupuesto.ingresoMensual).toBe(900);
    expect(modulos.presupuesto.gastos).toEqual([{ nombre: 'Renta', monto: 300 }]);
    expect(modulos.theme).toBeUndefined();
    expect(omitidos).toEqual([]);
    expect(modulos.presupuesto.gastos).not.toBe(archivo.presupuesto.gastos);
    expect(base.presupuesto.ingresoMensual).toBe(0);
  });

  it('completa con los valores actuales lo que el archivo no trae', () => {
    const { modulos } = validarRespaldo({ presupuesto: { ingresoMensual: 500 } }, actuales());
    expect(modulos.presupuesto).toEqual({
      ingresoMensual: 500, metaAhorro: 0, mesesDisponibles: 12, gastos: [], semanas: [], ingresos: []
    });
  });

  it('normaliza y valida el módulo estados con el mismo motor que Estados', () => {
    const { modulos } = validarRespaldo({ estados: estadosValidos() }, actuales());
    expect(modulos.estados.periods).toEqual(['2024']);
    expect(modulos.estados.balanceGeneral['2024'].activos.Efectivo).toBe(100);

    const invalido = estadosValidos();
    invalido.balanceGeneral['2024'].activos.Efectivo = 'abc';
    expect(() => validarRespaldo({ estados: invalido }, actuales())).toThrow(/Importe inválido/);
  });

  it('omite módulos y campos que la aplicación no conoce', () => {
    const { modulos, omitidos } = validarRespaldo(
      { flujo: { saldoInicial: 10, campoViejo: 1 }, modulofantasma: { a: 1 } }, actuales());
    expect(modulos.flujo.saldoInicial).toBe(10);
    expect(modulos.flujo.campoViejo).toBeUndefined();
    expect(omitidos).toEqual(['flujo.campoViejo', 'modulofantasma']);
  });

  it('rechaza claves que alterarían el prototipo, en cualquier nivel', () => {
    const malicioso = JSON.parse('{"presupuesto":{"__proto__":{"polluted":true}}}');
    expect(() => validarRespaldo(malicioso, actuales())).toThrow(/Clave no permitida/);
    const anidado = JSON.parse('{"flujo":{"movimientos":[{"constructor":1}]}}');
    expect(() => validarRespaldo(anidado, actuales())).toThrow(/Clave no permitida/);
    expect({}.polluted).toBeUndefined();
  });

  it('rechaza tipos incompatibles con el módulo', () => {
    expect(() => validarRespaldo({ presupuesto: { gastos: 'muchos' } }, actuales())).toThrow(/presupuesto\.gastos debe ser una lista/);
    expect(() => validarRespaldo({ presupuesto: { ingresoMensual: 'abc' } }, actuales())).toThrow(/debe ser un número/);
    expect(() => validarRespaldo({ flujo: { periodoBase: 5 } }, actuales())).toThrow(/debe ser texto/);
    expect(() => validarRespaldo({ equilibrio: { escenario: 7 } }, actuales())).toThrow(/debe ser un objeto/);
    expect(() => validarRespaldo({ presupuesto: [] }, actuales())).toThrow(/debe ser un objeto/);
  });

  it('admite null como "sin dato" en campos numéricos y de texto', () => {
    const { modulos } = validarRespaldo({ presupuesto: { metaAhorro: null }, planeacion: { supuestos: null } }, actuales());
    expect(modulos.presupuesto.metaAhorro).toBeNull();
    expect(modulos.planeacion.supuestos).toBeNull();
  });

  it('rechaza archivos que no son un objeto', () => {
    for (const contenido of [null, [], 'texto', 42]) {
      expect(() => validarRespaldo(contenido, actuales())).toThrow(/respaldo de GFO Toolkit/);
    }
  });

  it('rechaza estructuras desproporcionadas', () => {
    let profundo = { fin: 1 };
    for (let i = 0; i < 20; i++) profundo = { nivel: profundo };
    expect(() => validarRespaldo({ equilibrio: { escenario: profundo } }, actuales())).toThrow(/demasiado profunda/);
  });

  it('un JSON de Estados (no un respaldo completo) se rechaza con una pista', () => {
    const deEstados = { name: 'Mi empresa', ...estadosValidos() };
    expect(() => validarRespaldo(deEstados, actuales())).toThrow(/impórtelo desde Estados Financieros/);
  });
});
