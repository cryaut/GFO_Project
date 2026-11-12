import { describe, it, expect } from 'vitest';
import { casoHistoricoReal } from '../../js/examples/ejemplos-agricorp.js';
import { validarSupuestos, calcularPresupuestoMaestro } from '../../js/modules/planeacion/planeacion-calculations.js';
import { balanceProforma } from '../../js/modules/proforma/proforma-balance-calculations.js';
describe('aplicaciones del balance', () => {
  it('rechaza desembolsos sin conciliar y conserva el cuadre al repartirlos', () => {
    const c = casoHistoricoReal();
    const s = c.planeacion.supuestos;
    s.otrosDesembolsos[0] += 1000;
    expect(validarSupuestos(s).join(' ')).toContain('debe sumar');
    s.desgloseOtrosDesembolsos.inversion += 1000;
    expect(validarSupuestos(s)).toEqual([]);
    expect(balanceProforma(c.estados, calcularPresupuestoMaestro(s)).cuadra).toBe(true);
  });
  it('rechaza aplicaciones vacías o negativas', () => {
    for (const valor of [null, -1, NaN]) {
      const s = casoHistoricoReal().planeacion.supuestos;
      s.desgloseOtrosDesembolsos.impuestos = valor;
      expect(validarSupuestos(s).join(' ')).toContain('no negativos');
    }
  });
});
import { planeacionUI } from '../../js/modules/planeacion/planeacion-ui.js';
import { element, cambiar, enviar } from './helpers/dom-falso.js';
it('edita las aplicaciones y recalcula el balance después de guardar', async () => {
  const c = casoHistoricoReal();
  const page = element();
  let guardado;
  planeacionUI(page, { datos: c.planeacion, guardar: d => { guardado = d; } });
  expect(page.innerHTML).toContain('Aplicaciones para el balance proforma');
  await cambiar(page, 'planReparto-inversion', String(c.planeacion.supuestos.desgloseOtrosDesembolsos.inversion + 1000));
  await cambiar(page, 'planOtros-0', String(c.planeacion.supuestos.otrosDesembolsos[0] + 1000));
  await enviar(page, 'formPlaneacion');
  expect(guardado).toBeDefined();
  expect(balanceProforma(c.estados, calcularPresupuestoMaestro(guardado.supuestos)).cuadra).toBe(true);
});
