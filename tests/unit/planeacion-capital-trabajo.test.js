import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { calcularCapitalTrabajo, validarCapitalTrabajo } from '../../js/modules/planeacion/planeacion-calculations.js';
import { crearCasoComercial, leerPlaneacion } from '../../js/modules/planeacion/planeacion-escenarios.js';

const entradas = JSON.parse(readFileSync(new URL('../../propuesta-caso/referencia/inputs.json', import.meta.url), 'utf8'));
const referencia = JSON.parse(readFileSync(new URL('./fixtures/caso_ficticio_referencia.json', import.meta.url), 'utf8'));
const fuente = leerPlaneacion(crearCasoComercial(null, referencia, entradas));
const capital = fuente.escenario.capitalTrabajo;
const proyectar = (supuestos = {}, configuracion = {}, valorInventarioInicial = fuente.base.apertura.inventarioValor) => calcularCapitalTrabajo(
  { ...fuente.supuestos, ...supuestos }, { ...capital, ...configuracion }, fuente.base.fechaCorte, valorInventarioInicial
);

function cotejarCuotas(obtenidas, esperadas) {
  expect(obtenidas).toHaveLength(esperadas.length);
  esperadas.forEach(({ origen, vence, importe }, i) => {
    expect(obtenidas[i]).toMatchObject({ origen, vence });
    expect(obtenidas[i].importe).toBeCloseTo(importe, 6);
  });
}

describe('Capital de trabajo mensual de Planeación', () => {
  it('coteja los doce meses y sus vencimientos con la referencia independiente', () => {
    const resultado = proyectar();
    const esperado = referencia.proyeccion_2026;
    expect(resultado.etiquetas).toEqual(esperado.meses.map(mes => mes.periodo));
    esperado.meses.forEach((mes, i) => {
      const movimientos = mes.movimientos;
      const ventas = resultado.ventas.meses[i];
      const compras = resultado.compras.meses[i];
      expect(resultado.unidadesVendidas[i]).toBe(movimientos.unidades_vendidas);
      expect(resultado.costosCompra[i]).toBe(mes.inventario.costo_compra_unitario);
      expect(resultado.existencias[i]).toEqual({
        inicial: mes.apertura.inventario_unidades, objetivo: mes.inventario.objetivo_unidades,
        compras: movimientos.compras_unidades, final: mes.cierre.inventario_unidades
      });
      expect(ventas.importe).toBeCloseTo(mes.estado_resultados.ventas, 6);
      expect(ventas.contado).toBeCloseTo(movimientos.ventas_contado, 6);
      expect(ventas.credito).toBeCloseTo(movimientos.ventas_credito, 6);
      expect(ventas.liquidado).toBeCloseTo(movimientos.cobros_cxc, 6);
      expect(ventas.total).toBeCloseTo(movimientos.cobros, 6);
      expect(ventas.apertura).toBeCloseTo(mes.apertura.cxc, 6);
      expect(ventas.cierre).toBeCloseTo(mes.cierre.cxc, 6);
      expect(compras.importe).toBeCloseTo(movimientos.compras_valor, 6);
      expect(compras.contado).toBeCloseTo(movimientos.compras_contado, 6);
      expect(compras.credito).toBeCloseTo(movimientos.compras_credito, 6);
      expect(compras.liquidado).toBeCloseTo(movimientos.pagos_cxp, 6);
      expect(compras.total).toBeCloseTo(movimientos.pagos_proveedores, 6);
      expect(compras.apertura).toBeCloseTo(mes.apertura.cxp, 6);
      expect(compras.cierre).toBeCloseTo(mes.cierre.cxp, 6);
      cotejarCuotas(ventas.vencimientos, mes.vencimientos_aplicados.cobros_cxc.map(c => ({ ...c, vence: mes.periodo })));
      cotejarCuotas(compras.vencimientos, mes.vencimientos_aplicados.pagos_cxp.map(c => ({ ...c, vence: mes.periodo })));
    });
    cotejarCuotas(resultado.ventas.pendientes, esperado.vencimientos_pendientes.cobros_cxc);
    cotejarCuotas(resultado.compras.pendientes, esperado.vencimientos_pendientes.pagos_cxp);
    expect(resultado.ventas.totales.total).toBeCloseTo(esperado.anual.movimientos.cobros, 6);
    expect(resultado.compras.totales.total).toBeCloseTo(esperado.anual.movimientos.pagos_proveedores, 6);
  });

  it('coteja la valoración de los doce meses y el costo anual con la referencia independiente', () => {
    const { meses, costoVentasTotal } = proyectar().valoracion;
    const esperado = referencia.proyeccion_2026;
    expect(meses).toHaveLength(12);
    esperado.meses.forEach((mes, i) => {
      const { inicial, compras, costoVentas, final } = meses[i];
      expect(inicial).toBeCloseTo(mes.apertura.inventario_valor, 2);
      expect(compras).toBeCloseTo(mes.movimientos.compras_valor, 2);
      expect(costoVentas).toBeCloseTo(mes.estado_resultados.costo_ventas, 2);
      expect(final).toBeCloseTo(mes.inventario.valor_final, 2);
      expect(inicial + compras - costoVentas).toBeCloseTo(final, 8);
      if (i > 0) expect(inicial).toBe(meses[i - 1].final);
    });
    expect(costoVentasTotal).toBeCloseTo(esperado.anual.estado_resultados.costo_ventas, 2);
    expect(meses[0].inicial + esperado.anual.movimientos.compras_valor - costoVentasTotal)
      .toBeCloseTo(meses.at(-1).final, 8);
  });

  it('distribuye saldos de apertura y créditos nuevos con plazos distintos y meses sin vencimientos', () => {
    const supuestos = {
      ...fuente.supuestos, periodos: 3, ventasUnidades: [10, 10, 0], precio: 10,
      pctContado: 0.25, cxcInicial: 40, pctComprasContado: 0.5, cxpInicial: 60,
      inventarioInicial: 3, pctInventarioFinal: 0.2, inventarioFinalUltimo: 1
    };
    const configuracion = {
      costosCompra: [3, 4, 5], cobrosApertura: [0, 0, 1], cobrosCredito: [0, 0.5, 0.5],
      pagosApertura: [0.5, 0, 0.5], pagosCredito: [0, 1]
    };
    const p = calcularCapitalTrabajo(supuestos, configuracion, '2025-11-30');
    expect(p.etiquetas).toEqual(['2025-12', '2026-01', '2026-02']);
    expect(p.existencias.map(f => f.compras)).toEqual([9, 8, 1]);
    expect(p.ventas.meses.map(m => m.total)).toEqual([25, 25, 77.5]);
    expect(p.ventas.meses.map(m => m.cierre)).toEqual([115, 190, 112.5]);
    expect(p.compras.meses.map(m => m.total)).toEqual([43.5, 16, 46]);
    expect(p.compras.meses.map(m => m.cierre)).toEqual([43.5, 59.5, 18.5]);
    expect(p.compras.pendientes).toEqual([
      { origen: '2026-01', vence: '2026-03', importe: 16 },
      { origen: '2026-02', vence: '2026-04', importe: 2.5 }
    ]);
  });

  it('conserva lo que se puede calcular cuando faltan un precio y algunos costos', () => {
    const p = proyectar({ precio: null, pctContado: 0 }, { costosCompra: [null, null, null, ...capital.costosCompra.slice(3)] });
    expect(p.ventas.meses[0]).toMatchObject({ importe: null, contado: 0, credito: null, total: 17040, cierre: null });
    expect(p.ventas.meses[1].liquidado).toBeNull();
    expect(p.ventas.totales.importe).toBeNull();
    expect(p.existencias[2].compras).toBe(147.5);
    expect(p.compras.meses[0]).toMatchObject({ importe: 0, credito: 0, total: 25000, cierre: 0 });
    expect(p.compras.meses[2]).toMatchObject({ importe: null, liquidado: 0, cierre: null });
    expect(p.compras.meses[3].liquidado).toBeNull();
    expect(p.compras.meses[3].cierre).toBeGreaterThan(0);
    expect(p.valoracion.meses[0]).toMatchObject({ inicial: 80000, compras: 0, costoVentas: 28000, final: 52000 });
    expect(p.valoracion.meses[2]).toMatchObject({ inicial: 23000, compras: null, costoVentas: null, final: null });
    expect(p.valoracion.meses[3]).toMatchObject({ inicial: null, compras: 31250, costoVentas: null, final: null });
    expect(p.valoracion.costoVentasTotal).toBeNull();
  });

  it('muestra N/D cuando el valor positivo de apertura contradice las cero unidades', () => {
    const { valoracion } = proyectar({
      periodos: 1, ventasUnidades: [0], inventarioInicial: 0, inventarioFinalUltimo: 0
    }, { costosCompra: [100] }, 100);
    expect(valoracion.meses).toEqual([{ inicial: null, compras: 0, costoVentas: 0, final: 0 }]);
  });

  it('conserva el costo de ventas cero en un mes sin ventas con compras de valor desconocido', () => {
    const p = proyectar({
      periodos: 2, ventasUnidades: [0, 10], inventarioInicial: 0, pctInventarioFinal: 0.5, inventarioFinalUltimo: 0
    }, { costosCompra: [null, 4] }, 0);
    expect(p.existencias[0].compras).toBe(5);
    expect(p.valoracion.meses[0]).toMatchObject({ inicial: 0, compras: null, costoVentas: 0, final: null });
  });

  it('recupera la valoración después de agotar una existencia de costo desconocido', () => {
    const p = proyectar({
      periodos: 3, ventasUnidades: [10, 4, 3], inventarioInicial: 3, pctInventarioFinal: 0, inventarioFinalUltimo: 2
    }, { costosCompra: [null, 4, 5] }, 9);
    expect(p.valoracion.meses).toMatchObject([
      { inicial: 9, compras: null, costoVentas: null, final: 0 },
      { inicial: 0, compras: 16, costoVentas: 16, final: 0 },
      { inicial: 0, compras: 25, costoVentas: 15, final: 10 }
    ]);
    expect(p.valoracion.costoVentasTotal).toBeNull();
  });

  it('deja N/D la valoración cuando falta el valor de apertura', () => {
    const p = proyectar({}, {}, null);
    expect(p.existencias[0].final).toBe(520);
    expect(p.valoracion.meses[0]).toMatchObject({ inicial: null, compras: 0, costoVentas: null, final: null });
    expect(p.valoracion.costoVentasTotal).toBeNull();
  });

  it('deja pendientes los vencimientos de un crédito sin calendario y mantiene el saldo del mes de origen', () => {
    const p = proyectar({}, { cobrosCredito: null });
    expect(p.ventas.meses[0]).toMatchObject({ liquidado: 17040, total: 41680, cierre: 48320 });
    expect(p.ventas.meses[1]).toMatchObject({ importe: 63800, liquidado: null, total: null, cierre: null });
    expect(p.ventas.pendientes).toBeNull();
    expect(p.compras.totales.total).toBeCloseTo(311530, 6);
  });

  it('acepta ventas al contado y saldos de apertura cero sin exigir calendarios inactivos', () => {
    const p = proyectar({ pctContado: 1, cxcInicial: 0, pctComprasContado: 1, cxpInicial: 0 }, {
      cobrosApertura: null, cobrosCredito: null, pagosApertura: null, pagosCredito: null
    });
    expect(p.ventas.meses[0]).toMatchObject({ importe: 61600, credito: 0, liquidado: 0, total: 61600, cierre: 0 });
    expect(p.compras.meses[0].total).toBe(0);
    expect(p.ventas.pendientes).toEqual([]);
    expect(p.compras.pendientes).toEqual([]);
  });

  it('limita los resultados a cifras finitas aun si un importe proyectado excede la precisión disponible', () => {
    const p = proyectar({ precio: Number.MAX_VALUE });
    expect(p.ventas.totales.importe).toBeNull();
    expect(p.ventas.meses[0].liquidado).toBe(17040);
    expect(p.compras.totales.total).toBeCloseTo(311530, 6);
  });

  it.each([
    [0.4, 0.5], [0.6, 0.5], [1.1, -0.1], ['0.5', 0.5], [null, 1],
    [], Array(13).fill(1 / 13), Array(1)
  ].map(distribucion => [distribucion]))('rechaza la distribución inválida %j', distribucion => {
    const errores = validarCapitalTrabajo({ ...capital, pagosCredito: distribucion }, fuente.supuestos);
    expect(errores).toEqual([expect.stringContaining('Pago de compras a crédito')]);
  });

  it('valida los costos mensuales y descarta una segunda fuente de costo', () => {
    expect(validarCapitalTrabajo({ ...capital, costosCompra: [100] }, fuente.supuestos)).toHaveLength(1);
    expect(validarCapitalTrabajo({ ...capital, costosCompra: [null, ...capital.costosCompra.slice(1)] }, fuente.supuestos)).toEqual([]);
    expect(validarCapitalTrabajo(capital, { ...fuente.supuestos, costoUnitario: 100 })).toHaveLength(1);
    expect(validarCapitalTrabajo(capital, { ...fuente.supuestos, tipoPeriodo: 'Trimestre' })).toHaveLength(1);
  });

  it('siembra las ventas desde las entradas aunque no haya cifras proyectadas en el archivo de referencia', () => {
    const otrosSupuestos = structuredClone(entradas);
    otrosSupuestos.proyeccion_2026.precio_unitario = 250;
    otrosSupuestos.proyeccion_2026.unidades_vendidas[0] = 12;
    const { supuestos } = leerPlaneacion(crearCasoComercial(null, { ...referencia, proyeccion_2026: null }, otrosSupuestos));
    expect(supuestos.precio).toBe(250);
    expect(supuestos.ventasUnidades[0]).toBe(12);
    expect(() => crearCasoComercial(null, referencia, { ...otrosSupuestos, empresa: 'Otra empresa' })).toThrow('mismo caso');
  });
});
