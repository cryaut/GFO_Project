import store from '../../store.js';
import { normalizeFinancialData } from './estados-normalize.js';
import { estadosUI } from './estados-ui.js';

let editor;
let editorPage;

export const DEMO_MUNOMODA = {
  name: 'MUNO MODA S.A.',
  periods: ['2023', '2024'],
  balanceGeneral: {
    '2023': {
      activos: {
        'Efectivo': 45000,
        'Cuentas por Cobrar': 120000,
        'Inventario': 180000,
        'Activos Corrientes Otros': 25000,
        'Terrenos': 150000,
        'Edificios': 200000,
        'Equipos': 120000,
        'Vehiculos': 60000,
        'Depreciacion Acumulada': -98525
      },
      pasivos: {
        'Cuentas por Pagar': 85000,
        'Pasivo Corto Plazo': 60000,
        'Provisiones': 15000,
        'Pasivo Largo Plazo': 80000,
        'Otros Pasivos': 43860
      },
      patrimonio: {
        'Capital Social': 300000,
        'Reservas': 80000,
        'Utilidades Acumuladas': 137615
      }
    },
    '2024': {
      activos: {
        'Efectivo': 52000,
        'Cuentas por Cobrar': 135000,
        'Inventario': 195000,
        'Activos Corrientes Otros': 30000,
        'Terrenos': 150000,
        'Edificios': 200000,
        'Equipos': 120000,
        'Vehiculos': 60000,
        'Depreciacion Acumulada': -116475
      },
      pasivos: {
        'Cuentas por Pagar': 92000,
        'Pasivo Corto Plazo': 65000,
        'Provisiones': 18000,
        'Pasivo Largo Plazo': 45000,
        'Otros Pasivos': 23085
      },
      patrimonio: {
        'Capital Social': 300000,
        'Reservas': 80000,
        // 137,615 + utilidad neta 104,825 − dividendos 40,000
        'Utilidades Acumuladas': 202440
      }
    }
  },
  estadoResultados: {
    '2023': {
      'Ventas': 850000,
      'Costo de Ventas': 510000,
      'Gastos de Administracion': 120000,
      'Gastos de Ventas': 85000,
      'Otros Ingresos': 15000,
      'Otros Gastos': 10000,
      // 9 % sobre la deuda financiera de 140,000; IR = 30 % de la UAI (127,400)
      'Gastos por Intereses': 12600,
      'Impuesto sobre la Renta': 38220
    },
    '2024': {
      'Ventas': 920000,
      'Costo de Ventas': 545000,
      'Gastos de Administracion': 130000,
      'Gastos de Ventas': 90000,
      'Otros Ingresos': 18000,
      'Otros Gastos': 12000,
      // 9 % sobre la deuda financiera promedio de 125,000; IR = 30 % de la UAI (149,750)
      'Gastos por Intereses': 11250,
      'Impuesto sobre la Renta': 44925
    }
  }
};

export function getDemoData() {
  return DEMO_MUNOMODA;
}

export function loadDemo() {
  store.setPersisted('estados', normalizeFinancialData(DEMO_MUNOMODA));
  return DEMO_MUNOMODA;
}

export function hasUnsavedStates() {
  return editor?.hasUnsavedChanges() ?? false;
}

export function getSavedStates() {
  return {
    name: store.get('estados.name') || 'Datos guardados',
    periods: store.get('estados.periods') || [],
    balanceGeneral: store.get('estados.balanceGeneral') || {},
    estadoResultados: store.get('estados.estadoResultados') || {},
    accountTypes: store.get('estados.accountTypes')
  };
}

export function initEstados() {
  const page = document.getElementById('page-estados');
  if (!page) return;
  // El router oculta la página: conservar también sus campos, selección y eventos.
  if (editorPage === page && hasUnsavedStates()) return;
  editorPage = page;
  editor = estadosUI(page, {
    initial: getSavedStates(),
    demo: DEMO_MUNOMODA,
    save: data => store.setPersisted('estados', normalizeFinancialData(data))
  });
}
