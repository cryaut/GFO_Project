import { expect, it, vi } from 'vitest';
vi.mock('../../js/components/toast.js', () => ({ showToast:vi.fn() }));
import { ejemploBaker } from '../../js/examples/ejemplos-estados.js';
import { flujoUI } from '../../js/modules/flujo/flujo-ui.js';
import { calcularFlujo, conciliarConBalance, ejemploFlujo } from '../../js/modules/flujo/flujo-calculations.js';
import { planeacionUI } from '../../js/modules/planeacion/planeacion-ui.js';
import { ejemploPlaneacion } from '../../js/modules/planeacion/planeacion-calculations.js';
import { clic, element, cambiar, enviar, mensaje } from './helpers/dom-falso.js';
import { registrarCuenta } from '../../js/modules/estados/cuentas-registro.js';
import { computeFinancialTotals } from '../../js/modules/estados/estados-calculations.js';
import { analisisVerticalCompleto } from '../../js/modules/analisis/analisis-calculations.js';
import { construirEFE } from '../../js/modules/analisis/efe-calculations.js';
import { origenFilaEstado } from '../../js/modules/estados/estados-presentacion-ui.js';

it.each(['USD','UM'])('P1: Flujo conserva destino C$ y no guarda saldos de Estados %s', async moneda => {
  const estados = { ...ejemploBaker(), moneda }, datos = ejemploFlujo(), copia = structuredClone(datos);
  const page = element(), guardar = vi.fn();
  flujoUI(page, { estados, datos, guardar });
  page.querySelector('#flujoPeriodo').value = '2011';
  await clic(page, 'flujoTomarSaldo');
  expect(guardar).not.toHaveBeenCalled();
  expect(mensaje(page, 'flujoMensaje')).toContain('Moneda incompatible');
  expect(datos).toEqual(copia);
});

it.each(['USD','UM'])('P1: Planeación conserva el borrador editado y no guarda importes %s', async moneda => {
  const estados = { ...ejemploBaker(), moneda }, datos = { supuestos:ejemploPlaneacion() };
  const copia = structuredClone(datos), page = element(), guardar = vi.fn();
  planeacionUI(page, { estados, datos, guardar });
  await clic(page, 'planVer-supuestos');
  await cambiar(page, 'plan-saldoInicialCaja', '777', 'input');
  await cambiar(page, 'plan-cxcInicial', '888', 'input');
  const campo = page.querySelector('#plan-saldoInicialCaja');
  await clic(page, 'planTomarBalance');
  expect(mensaje(page, 'planMensaje')).toContain('Moneda incompatible');
  expect(page.querySelector('#plan-saldoInicialCaja')).toBe(campo);
  expect(campo.value).toBe('777');
  expect(guardar).not.toHaveBeenCalled();
  expect(datos).toEqual(copia);
  await enviar(page, 'formPlaneacion');
  expect(guardar.mock.lastCall[0].supuestos).toMatchObject({ saldoInicialCaja:777, cxcInicial:888, cxpInicial:datos.supuestos.cxpInicial });
});

it.each(['USD','C$',undefined])('P1: Flujo permite copiar monedas compatibles (%s), incluido legado C$', async moneda => {
  const estados = { ...ejemploBaker(), moneda }, datos = { ...ejemploFlujo(), moneda };
  const page = element(), guardar = vi.fn();
  flujoUI(page, { estados, datos, guardar });
  page.querySelector('#flujoPeriodo').value = '2011';
  await clic(page, 'flujoTomarSaldo');
  expect(guardar.mock.lastCall[0]).toMatchObject({ saldoInicial:500000, periodoBase:'2011' });
});

it('Flujo solo confirma una coincidencia de saldos en la misma moneda', () => {
  const estados = ejemploBaker();
  const datos = { moneda:'USD', saldoInicial:1000000, periodoBase:'2011', movimientos:[] };
  const resultado = calcularFlujo(datos);
  expect(conciliarConBalance(resultado, estados, '2011')).toMatchObject({ cuadra:true, diferencia:0 });

  const balanceCordobas = { ...estados, moneda:'C$' };
  expect(conciliarConBalance(resultado, balanceCordobas, '2011')).toEqual({
    periodo:'2012', efectivo:null, diferencia:null, cuadra:null, motivo:'moneda_incompatible'
  });
  const page = element();
  flujoUI(page, { estados:balanceCordobas, datos });
  expect(page.innerHTML).toContain('sus monedas son distintas');
  expect(page.innerHTML).not.toContain('El saldo final coincide');
});

it('Flujo conserva su saldo si falta efectivo y acepta el cero declarado', async () => {
  const estados = {
    periods:['2023','2024'],
    balanceGeneral:{
      '2023':{ activos:{ 'Cuentas por cobrar':80 }, pasivos:{}, patrimonio:{} },
      '2024':{ activos:{ Efectivo:0 }, pasivos:{}, patrimonio:{} }
    }
  };
  const page = element(), guardar = vi.fn();
  flujoUI(page, { estados, datos:ejemploFlujo(), guardar });
  page.querySelector('#flujoPeriodo').value = '2023';
  await clic(page, 'flujoTomarSaldo');
  expect(guardar).not.toHaveBeenCalled();
  expect(mensaje(page, 'flujoMensaje')).toContain('N/D');

  page.querySelector('#flujoPeriodo').value = '2024';
  await clic(page, 'flujoTomarSaldo');
  expect(guardar.mock.lastCall[0]).toMatchObject({ saldoInicial:0, periodoBase:'2024' });
});

it('Flujo distingue efectivo ausente de cero confirmado al conciliar', () => {
  const estados = {
    periods:['2023','2024'],
    balanceGeneral:{ '2024':{ activos:{ 'Cuentas por cobrar':80 }, pasivos:{}, patrimonio:{} } }
  };
  const resultado = calcularFlujo({ saldoInicial:0, movimientos:[] });
  expect(conciliarConBalance(resultado, estados, '2023')).toEqual({
    periodo:'2024', efectivo:null, diferencia:null, cuadra:null, motivo:'efectivo_no_disponible'
  });

  estados.balanceGeneral['2024'].activos.Efectivo = 0;
  expect(conciliarConBalance(resultado, estados, '2023')).toMatchObject({ efectivo:0, cuadra:true, diferencia:0 });
});

it('Planeación toma el cero reportado y conserva los campos ausentes del borrador', async () => {
  const estados = {
    periods:['2024'],
    balanceGeneral:{ '2024':{ activos:{ Efectivo:0 }, pasivos:{}, patrimonio:{} } }
  };
  const supuestos = ejemploPlaneacion(), page = element(), guardar = vi.fn();
  planeacionUI(page, { estados, datos:{ supuestos }, guardar });
  await clic(page, 'planVer-supuestos');
  await cambiar(page, 'plan-cxcInicial', '888', 'input');
  await clic(page, 'planTomarBalance');
  expect(guardar).not.toHaveBeenCalled();
  expect(mensaje(page, 'planMensaje')).toContain('Se conservaron los campos CxC, CxP');
  await enviar(page, 'formPlaneacion');
  expect(guardar.mock.lastCall[0].supuestos).toMatchObject({
    saldoInicialCaja:0, cxcInicial:888, cxpInicial:supuestos.cxpInicial
  });
});

it('EFE conserva la utilidad reportada de cero y avisa que difiere de su desglose', () => {
  const estados = ejemploBaker();
  estados.reportedTotals['2012']['is.net_income_reported'].importe = 0;
  const resultado = construirEFE(estados, '2011', '2012');
  expect(resultado.utilidadNeta).toBe(0);
  expect(resultado.advertencias.join(' ')).toContain('no coincide con su desglose');
});

function balance(total = 1200, fijo = null) {
  const registros = [ ['bs.ppe_buildings','Edificio propio',1000], ['bs.total_liabilities','Pasivos',600], ['bs.total_equity','Patrimonio',600] ];
  if (total !== null) registros.push(['bs.total_assets','Activo reportado',total]);
  if (fijo !== null) registros.push(['bs.fixed_assets_net_total','PPE neto reportado',fijo]);
  return registrarCuenta({ periods:['2030'], balanceGeneral:{ '2030':{ activos:{},pasivos:{},patrimonio:{} } },estadoResultados:{ '2030':{} } },
    registros.map(([id,nombre,importe]) => ({ id,nombre,importe,periodo:'2030',confirmado:true })));
}

it('P2: AV usa activo reportado 1200 con edificio 1000 sin depreciación ni cobertura confirmada', () => {
  const d = balance(), original = structuredClone(d), t = computeFinancialTotals(d, '2030');
  expect(t.totalActivos).toBe(1200);
  expect(t.activosFijos).toBeNull();
  expect(t.notAvailableReasons.find(r => r.name === 'Depreciación acumulada').campos).toEqual(['activosFijos']);
  expect(t.notAvailableReasons.some(r => r.motivo === 'reported_subtotal_mismatch')).toBe(false);
  const av = analisisVerticalCompleto(d, '2030').balanceGeneral;
  expect(av.baseValor).toBe(1200);
  expect(av.rows.find(r => r.id === 'bs.ppe_buildings').pctBase).toBeCloseTo(1000 / 1200, 12);
  const fila = av.rows.find(r => r.id === 'bs.total_assets');
  expect(fila.motivos).toContainEqual(expect.objectContaining({ codigo:'reported_subtotal_unverifiable' }));
  expect(origenFilaEstado(fila)).toContain('Desglose no comprobable');
  expect(d).toEqual(original);
});

it('P2: sin activo reportado conserva N/D; con cero reportado la base cero es válida pero AV es N/D', () => {
  expect(computeFinancialTotals(balance(null), '2030').totalActivos).toBeNull();
  const d = balance(0);
  expect(computeFinancialTotals(d, '2030').totalActivos).toBe(0);
  expect(analisisVerticalCompleto(d, '2030').balanceGeneral.rows.find(r => r.id === 'bs.ppe_buildings').pctBase).toBeNull();
});

it('P2: PPE neto reportado también conserva su valor sin exigir reconstruir depreciación', () => {
  const t = computeFinancialTotals(balance(1200, 1100), '2030');
  expect(t.activosFijos).toBe(1100);
  expect(t.totalActivos).toBe(1200);
});
