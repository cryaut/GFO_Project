import store from '../../store.js';
import { initPresupuestoMensual } from './presupuesto-mensual.js';
import { presupuestoEstudiantilUI } from './presupuesto-ui.js';

export { presupuestoCalculations, ejemploPresupuestoPersonal } from './presupuesto-mensual.js';

export function initPresupuesto() {
  const page = document.getElementById('page-presupuesto');
  if (!page) return;
  const cambiarVista = vista => {
    store.setPersisted('presupuesto', { ...store.get('presupuesto'), vista });
    initPresupuesto();
  };
  if (store.get('presupuesto.vista') === 'mensual') {
    initPresupuestoMensual(() => {
      try { cambiarVista('estudiantil'); }
      catch (error) { page.querySelector('#ppVolverEstudiantil').textContent = `No se pudo cambiar de vista: ${error.message}`; }
    });
    return;
  }
  presupuestoEstudiantilUI(page, {
    inicial:store.get('presupuesto.estudiantil'),
    guardar:datos => store.setPersisted('presupuesto', { ...store.get('presupuesto'), vista:'estudiantil', estudiantil:datos }),
    verMensual:() => cambiarVista('mensual')
  });
}
