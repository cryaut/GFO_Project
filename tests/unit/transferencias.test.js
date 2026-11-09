import { expect, it, vi } from 'vitest';
import { equilibrioUI } from '../../js/modules/equilibrio/equilibrio-ui.js';
import { calcularPresupuestoMaestro, ejemploPlaneacion } from '../../js/modules/planeacion/planeacion-calculations.js';
import { validarRespaldo } from '../../js/modules/integracion/integracion-respaldo.js';
import {
  fichaTransferencia, filaTransferible, firmaTransferencia, procedenciaVigente,
  transferenciaCvuInventario, transferenciaCvuPlaneacion
} from '../../js/utils/transferencias.js';
import { aplicarVistaPrevia, clic, element, enviar, llenar, mensaje } from './helpers/dom-falso.js';

const fuente = () => {
  const supuestos = ejemploPlaneacion();
  const resultado = calcularPresupuestoMaestro(supuestos);
  return { supuestos, resultado, periodos: resultado.etiquetas, unidad: 'prenda' };
};

it('C-V-U usa el mismo periodo y la misma base de costos que Planeación', () => {
  const plan = fuente();
  const periodo = plan.periodos[0];
  const propuesta = transferenciaCvuPlaneacion(plan, periodo, 'C$', {});
  expect(propuesta.origen.periodo).toBe(periodo);
  expect(Object.fromEntries(propuesta.filas.map(f => [f.campo, f.valor]))).toEqual({
    precio: plan.supuestos.precio, unidades: plan.supuestos.ventasUnidades[0],
    costoVariableUnitario: plan.resultado.equilibrio.cvu, costosFijos: plan.resultado.equilibrio.costosFijos
  });
  expect(transferenciaCvuPlaneacion(plan, periodo, 'USD', {}).error).toMatch(/Moneda incompatible/);
  const parcial = transferenciaCvuPlaneacion({ ...plan, resultado: null }, periodo, 'C$', {});
  expect(parcial.filas.filter(filaTransferible).map(f => f.campo)).toEqual(['precio', 'unidades']);
});

it('una actualización de la fuente invalida la vista previa y conserva la ficha restaurable', () => {
  const plan = fuente();
  const periodo = plan.periodos[0];
  const antes = transferenciaCvuPlaneacion(plan, periodo, 'C$', {});
  const precio = fichaTransferencia(antes.origen, antes.filas[0]);
  plan.supuestos.precio = 900;
  const despues = transferenciaCvuPlaneacion(plan, periodo, 'C$', {});
  expect(firmaTransferencia(despues)).not.toBe(firmaTransferencia(antes));
  expect(procedenciaVigente(precio, despues)).toBe(false);
  const respaldo = validarRespaldo({ equilibrio: { precio: 800, procedencia: { precio } } }, { equilibrio: { precio: null } });
  expect(respaldo.modulos.equilibrio.procedencia.precio).toEqual(precio);
});

it('Inventario requiere confirmar el alcance del costo variable y no trae unidades de venta', () => {
  const inventario = { productos: [{ id: 'a', nombre: 'Camisa', unidad: 'prenda', existenciaFinal: 7, costoPromedio: 80 }] };
  expect(transferenciaCvuInventario(inventario, 'a', 'C$', {}, false).filas.filter(filaTransferible)).toEqual([]);
  const { filas } = transferenciaCvuInventario(inventario, 'a', 'C$', {}, true);
  expect(filas).toHaveLength(1);
  expect(filas[0]).toMatchObject({ campo: 'costoVariableUnitario', valor: 80, unidad: 'C$/prenda', motivo: '' });
});

it('aplica al borrador de C-V-U y conserva el último guardado si falla la escritura', async () => {
  const plan = fuente();
  const page = element();
  const guardar = vi.fn().mockImplementationOnce(() => { throw new Error('almacenamiento lleno'); });
  equilibrioUI(page, {
    datos: null, guardar, confirmar: () => true,
    leerFuentes: () => ({ planeacion: plan })
  });
  llenar(page, { eqTraerPeriodo: plan.periodos[0] });
  await clic(page, 'eqTraerPlaneacion');
  expect(guardar).not.toHaveBeenCalled();
  await aplicarVistaPrevia(page, 'eqTraer', ['precio', 'costoVariableUnitario', 'costosFijos', 'unidades']);
  expect(page.querySelector('#eqPrecio').value).toBe('800');
  expect(guardar).not.toHaveBeenCalled();
  await enviar(page, 'formEquilibrio');
  expect(mensaje(page, 'equilibrioMensaje')).toMatch(/almacenamiento lleno/);
  expect(page.querySelector('#eqPrecio').value).toBe('800');
  await enviar(page, 'formEquilibrio');
  expect(guardar.mock.lastCall[0].procedencia.precio).toMatchObject({ origen: 'planeacion', valor: 800 });
});
