import { afterEach, expect, it, vi } from 'vitest';
const estado = vi.hoisted(() => ({ inventario:null }));
vi.mock('../../js/store.js', () => ({ default:{ get:clave => clave === 'inventario' ? estado.inventario : null } }));
vi.mock('../../js/modules/planeacion/planeacion-ui.js', () => ({ planeacionUI:vi.fn() }));
import { initPlaneacion } from '../../js/modules/planeacion/index.js';
import { planeacionUI } from '../../js/modules/planeacion/planeacion-ui.js';
import { ejemploInventario } from '../../js/modules/inventario/inventario-calculations.js';
import { transferenciaInventario } from '../../js/utils/transferencias.js';
import { montarProformaDocente } from '../../js/modules/proforma/proforma-docente-ui.js';
import { CASOS_PROFORMA_DOCENTE } from '../../js/modules/proforma/proforma-docente-ejemplos.js';
import { element, llenar, enviar } from './helpers/dom-falso.js';

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

it.each(['USD','UM','C$'])('Planeación conserva la moneda %s al preparar la transferencia de Inventario', moneda => {
  estado.inventario = { ...ejemploInventario(), moneda };
  vi.stubGlobal('document', { getElementById:() => ({}) });
  initPlaneacion();
  const fuente = planeacionUI.mock.lastCall[1].leerInventario();
  const propuesta = transferenciaInventario(fuente, 'demo-camisa', 'C$', {});
  expect(fuente.moneda).toBe(moneda);
  expect(propuesta.origen.moneda).toBe(moneda);
  if (moneda !== 'C$') expect(propuesta.error).toContain('Moneda incompatible');
  else expect(propuesta.error).toBe('');
});

it('el ER docente omite otros ingresos accesorios cero, pero conserva importes, N/D y subtotales cero', async () => {
  const panel = element(); montarProformaDocente(panel);
  const salida = panel.querySelector('#proformaAFODResultado');
  expect(salida.innerHTML).not.toContain('+ Otros ingresos operativos netos');
  expect(salida.innerHTML).not.toContain('+ Otros ingresos no operativos netos');
  const valores = Object.fromEntries(Object.entries(CASOS_PROFORMA_DOCENTE.euro.supuestos)
    .map(([clave, valor]) => ['proformaAFOD-'+clave, clave === 'tasaIR' ? valor * 100 : valor]));
  llenar(panel, { ...valores, 'proformaAFOD-otrosOperativos':'100', 'proformaAFOD-otrosNoOperativos':'' });
  await enviar(panel, 'proformaAFODForm');
  expect(salida.innerHTML).toContain('+ Otros ingresos operativos netos');
  expect(salida.innerHTML).toContain('+ Otros ingresos no operativos netos');
  expect(salida.innerHTML).toContain('N/D');
  llenar(panel, { ...valores, 'proformaAFOD-ventasProyectadas':0 });
  await enviar(panel, 'proformaAFODForm');
  expect(salida.innerHTML).toContain('= Utilidad bruta');
  expect(salida.innerHTML).toContain('USD 0.00');
});
