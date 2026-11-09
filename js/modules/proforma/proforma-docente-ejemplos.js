// Importes y premisas de Ejercicios E.R proformas.md, sin resultados precalculados.
export const CASOS_PROFORMA_DOCENTE = {
  euro: {
    nombre: 'Euro Designs, Inc.',
    tipo: 'resultados',
    supuestos: {
      ventasBase: 3500000, costoBase: 1925000, gastosBase: 420000,
      ventasProyectadas: 3900000, intereses: 325000, tasaIR: 0.4, dividendos: 320000,
      otrosOperativos: 0, otrosNoOperativos: 0
    }
  },
  metro: {
    nombre: 'Metroline Manufacturing',
    tipo: 'comparativo',
    supuestos: {
      ventasBase: 1400000, costoBase: 910000, gastosBase: 120000,
      costoFijo: 210000, costoVariable: 700000, gastosFijos: 36000, gastosVariables: 84000,
      ventasProyectadas: 1500000, intereses: 35000, tasaIR: 0.4, dividendos: 70000,
      otrosOperativos: 0, otrosNoOperativos: 0
    }
  },
  leonard: {
    nombre: 'Leonard Industries',
    tipo: 'balance',
    supuestos: {
      ventasProyectadas: 3000000, efectivoMinimo: 50000, valoresNegociables: 15000,
      tasaCxC: 0.10, tasaInventario: 0.12, fijosNetosBase: 600000, compraMaquina: 90000, depreciacion: 32000,
      tasaCxP: 0.14, deudasAcumuladas: 60000, otrosPasivosCorrientes: 30000, deudaLargoPlazo: 350000,
      accionesComunes: 200000, retenidasBase: 220000, tasaUtilidadNeta: 0.04, dividendos: 70000
    }
  },
  electronicas: {
    nombre: 'Exportaciones Electrónicas · Proyección residual 2019',
    tipo: 'residual',
    supuestos: {
      inventarioInicial: 4140000, inventarioFinal: 8475000, rotacionObjetivo: 6, costoSobreVentas: 0.72,
      utilidadObjetivo: 7274000, tasaIR: 0.30, deudaPromedio: 8225500, tasaInteres: 0.08,
      tasaVentasCredito: 0.85, tasaComprasCredito: 0.90, cxcPromedio: 6197500, cxpPromedio: 506500,
      activoFijoPromedio: 2760000, activoPromedio: 22695500
    }
  }
};
