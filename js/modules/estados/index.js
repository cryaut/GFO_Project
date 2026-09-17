import store from '../../store.js';
import { normalizeFinancialData } from './estados-normalize.js';
import { estadosUI } from './estados-ui.js';

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
        'Utilidades Acumuladas': 207815
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
        'Pasivo Largo Plazo': 75000,
        'Otros Pasivos': 33860
      },
      patrimonio: {
        'Capital Social': 300000,
        'Reservas': 80000,
        'Utilidades Acumuladas': 207815
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
      'Otros Gastos': 10000
    },
    '2024': {
      'Ventas': 920000,
      'Costo de Ventas': 545000,
      'Gastos de Administracion': 130000,
      'Gastos de Ventas': 90000,
      'Otros Ingresos': 18000,
      'Otros Gastos': 12000
    }
  }
};

export function getDemoData() {
  return DEMO_MUNOMODA;
}

export function loadDemo() {
  store.set('estados.balanceGeneral', DEMO_MUNOMODA.balanceGeneral);
  store.set('estados.estadoResultados', DEMO_MUNOMODA.estadoResultados);
  store.set('estados.periods', DEMO_MUNOMODA.periods);
  return DEMO_MUNOMODA;
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
  estadosUI(page, {
    initial: getSavedStates(),
    demo: DEMO_MUNOMODA,
    save: data => store.setPersisted('estados', normalizeFinancialData(data))
  });
}
