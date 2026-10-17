import { afterEach, expect, it, vi } from 'vitest';
import store from '../../js/store.js';
import { tableTextToFinancialData } from '../../js/modules/estados/estados-import.js';
import { aplicarDisponibilidadRazones } from '../../js/modules/estados/cuentas-disponibilidad.js';

afterEach(() => { store._data = null; store._listeners = []; vi.unstubAllGlobals(); });

it('propaga N/D a las razones afectadas por activos sin alterar márgenes de resultados completos', () => {
  const entrada = { RC: 0, MN: 0.2, ROA: 0, rotacionActivos: 3 };
  const salida = aplicarDisponibilidadRazones(entrada, { notAvailableReasons: [{ group: 'activos', motivo: 'ambiguous_account_match' }] });
  expect(salida).toMatchObject({ RC: null, MN: 0.2, ROA: null, rotacionActivos: null });
  expect(salida.motivosNoDisponible.RC).toEqual(['ambiguous_account_match']);
  expect(entrada.RC).toBe(0);
});

it('Análisis conserva metadatos y no transforma activos pendientes en ratios de cero', async () => {
  vi.stubGlobal('document', { getElementById: () => null });
  vi.stubGlobal('localStorage', { getItem: () => null, setItem() {} });
  const estados = tableTextToFinancialData('Cuenta,Grupo,Estado,2024\nEfetivo,activos,Balance,50\nCuentas por Pagar,pasivos,Balance,20\nCapital Social,patrimonio,Balance,30\nVentas,,Resultados,100');
  store.setPersisted('estados', estados);
  const { refreshSavedStates, computeRazones } = await import('../../js/modules/analisis/index.js');
  expect(refreshSavedStates().accountIdentities.activos.Efetivo.estado).toBe('sugerida');
  const razones = computeRazones('2024');
  expect(razones.RC).toBeNull();
  expect(razones.ROA).toBeNull();
  expect(razones.MN).toBe(1);
  expect(razones.motivosNoDisponible.RC).toContain('ambiguous_account_match');
});
