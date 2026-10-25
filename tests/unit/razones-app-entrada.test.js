import { expect, it } from 'vitest';
import { crearContextoRazonesGuardadas, calcularMotorDesdeDatos, evaluarConComposicion } from '../../js/modules/razones/razones-app-entrada.js';

const identidad = idCuenta => ({ idCuenta, estado:'reconocida', metodo:'id', candidatos:[], origen:'manual' });
function documento() {
  return {
    name:'Puente por identificadores', periods:['2023','2024'],
    balanceGeneral:{
      '2023':{ activos:{ 'fila con identidad':10 }, pasivos:{}, patrimonio:{} },
      '2024':{ activos:{ 'fila con identidad':20 }, pasivos:{}, patrimonio:{} }
    },
    estadoResultados:{ '2023':{ 'ingreso declarado':0 }, '2024':{ 'ingreso declarado':0 } },
    accountTypes:{ activos:{ 'fila con identidad':'efectivo' }, estadoResultados:{ 'ingreso declarado':'otrosIngresos' } },
    accountIdentities:{ activos:{ 'fila con identidad':identidad('bs.cash_and_equivalents') },
      estadoResultados:{ 'ingreso declarado':identidad('is.nonoperating_income') },
      suplementario:{ 'dato adicional':identidad('supp.credit_sales') } },
    supplementaryAccounts:{ '2023':{ 'dato adicional':30 }, '2024':{ 'dato adicional':40 } },
    reportedTotals:{ '2023':{ 'bs.total_assets':{ nombre:'total con id', grupo:'activos', importe:50 } },
      '2024':{ 'bs.total_assets':{ nombre:'total con id', grupo:'activos', importe:60 } } },
    pendingAccounts:[{ nombre:'fila pendiente', importes:{ '2024':0 },
      identificacion:{ idCuenta:null, estado:'no_reconocida', metodo:null, candidatos:[], origen:'manual' } }],
    composicionIngresos:{ '2023':'excluye_intereses', '2024':'excluye_intereses' }
  };
}

it('conserva los cinco campos de metadatos y ambos periodos tras guardar y recargar', () => {
  const guardados = JSON.parse(JSON.stringify(documento()));
  const antes = JSON.stringify(guardados);
  const { datos, entrada, fallo } = crearContextoRazonesGuardadas(guardados, '2024');
  expect(fallo).toBeNull();
  for (const campo of ['accountIdentities','accountTypes','pendingAccounts','reportedTotals','supplementaryAccounts']) {
    expect(datos[campo], campo).toBeDefined();
  }
  expect(entrada.periodos).toEqual({ actual:'2024', anterior:'2023', cantidad:2, indice:1 });
  expect(entrada.composicionIngresos).toEqual({ current:'excluye_intereses', previous:'excluye_intereses' });
  expect(entrada.cuentas).toContainEqual(expect.objectContaining({ id:'bs.cash_and_equivalents', current:20, previous:10 }));
  expect(entrada.cuentas).toContainEqual(expect.objectContaining({ id:'supp.credit_sales', current:40, previous:30 }));
  expect(entrada.cuentas).toContainEqual(expect.objectContaining({ id:'bs.total_assets', current:60, previous:50 }));
  expect(entrada.cuentas).toContainEqual(expect.objectContaining({ id:null, current:0, estado:'no_reconocida' }));
  expect(JSON.stringify(guardados)).toBe(antes);
});

it('una etiqueta reconocible sin identidad guardada no se acredita al volver a normalizar', () => {
  const datos = documento();
  datos.balanceGeneral['2024'].activos.Efectivo = 90;
  const { entrada } = crearContextoRazonesGuardadas(datos, '2024');
  const pendiente = entrada.cuentas.find(fila => fila.current === 90);
  expect(pendiente).toMatchObject({ id:null, estado:'no_reconocida', tipoApp:'' });
});

it('una composición antigua ausente se conserva como sin_declarar, sin inferirla del cero', () => {
  const datos = documento();
  delete datos.composicionIngresos;
  expect(crearContextoRazonesGuardadas(datos, '2024').entrada.composicionIngresos)
    .toEqual({ current:'sin_declarar', previous:'sin_declarar' });
  const salida = calcularMotorDesdeDatos(datos, '2024');
  expect(salida.motor.razones.rentabilidad_margen_utilidad_neta).toMatchObject({ valor:null,
    motivos:expect.arrayContaining([expect.objectContaining({ codigo:'composicion_no_declarada' })]) });
  expect(salida.motor.razones.liquidez_razon_corriente.motivos.some(motivo => motivo.codigo === 'composicion_no_declarada')).toBe(false);
});

it('no cambia a otro periodo cuando el solicitado no existe', () => {
  const salida = calcularMotorDesdeDatos(documento(), '2030');
  for (const razon of Object.values(salida.motor.razones)) {
    expect(razon).toMatchObject({ valor:null, motivos:[expect.objectContaining({ codigo:'periodo_no_disponible', periodo:'2030' })] });
  }
});

it('un documento no normalizable descarta sus cifras para todas las razones', () => {
  const datos = documento();
  datos.accountTypes.activos['fila con identidad'] = 'tipo inválido';
  const salida = calcularMotorDesdeDatos(datos, '2024');
  expect(salida.entrada).toBeNull();
  for (const razon of Object.values(salida.motor.razones)) {
    expect(razon).toMatchObject({ valor:null, motivos:[expect.objectContaining({ codigo:'documento_no_normalizable' })] });
  }
});

it('los errores ajenos a los dos casos de composición no se silencian', () => {
  expect(() => evaluarConComposicion(() => { throw new Error('árbol inválido'); }, { composicionIngresos:{} }))
    .toThrow('árbol inválido');
});
