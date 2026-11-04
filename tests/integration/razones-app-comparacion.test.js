import { afterEach, expect, it, vi } from 'vitest';
import { ejemploApp, ejerciciosApp, estadosDesdeReferencia, MAPA_APP_JSON } from '../fixtures/razones-app.js';

const claveApp = Object.fromEntries(Object.entries(MAPA_APP_JSON).map(([clave,id]) => [id,clave]));
const referencias = [
  { ...ejemploApp, archivo:'ejemplo-calculo-a-mano-v3.xlsx' }, ...ejerciciosApp.libros
];
const celdas = referencias.flatMap(referencia => referencia.esperados.map(celda => ({
  ...celda, archivo:referencia.archivo, referencia
})));

afterEach(() => vi.unstubAllGlobals());

it('compara 60 celdas del ejemplo v3 y 240 de los cuatro ejercicios v2 mediante las veinte claves de la app', () => {
  expect(Object.keys(MAPA_APP_JSON)).toHaveLength(20);
  expect(new Set(Object.values(MAPA_APP_JSON)).size).toBe(20);
  expect(referencias[0].esperados).toHaveLength(60);
  expect(ejerciciosApp.libros.flatMap(libro => libro.esperados)).toHaveLength(240);
  expect(celdas).toHaveLength(300);
  for (const libro of ejerciciosApp.libros) {
    expect(Object.values(libro.composicionIngresos)).toEqual(['excluye_intereses','excluye_intereses']);
  }
});

it.each(celdas)('app: $archivo, Esperados!$celda, $id, control $control', async referencia => {
  vi.resetModules();
  const memoria = new Map();
  vi.stubGlobal('localStorage', { getItem:clave => memoria.get(clave) ?? null,
    setItem:(clave,valor) => memoria.set(clave,valor) });
  const { default:store } = await import('../../js/store.js');
  const { computeRazones, refreshSavedStates } = await import('../../js/modules/analisis/index.js');
  const datos = estadosDesdeReferencia(referencia.referencia);
  store.setPersisted('estados', datos);
  refreshSavedStates();
  // El control se pasa exclusivamente desde este harness. La app lo mantiene apagado.
  const salida = computeRazones(referencia.periodo, { mostrar_calculo_directo_primer_periodo:referencia.control });
  const campo = claveApp[referencia.id];
  expect(campo, referencia.id).toBeDefined();
  const obtenido = salida[campo];
  if (referencia.valor === null) {
    expect(obtenido).toBeNull();
    expect(salida.notAvailableReasons.some(motivo => motivo.campo === campo)).toBe(true);
  } else {
    expect(typeof obtenido).toBe('number');
    const enUnidadHoja = obtenido * (referencia.unidad === 'porcentaje' ? 100 : 1);
    expect(Math.abs(enUnidadHoja - referencia.valor)).toBeLessThan(0.0000005);
  }
});
