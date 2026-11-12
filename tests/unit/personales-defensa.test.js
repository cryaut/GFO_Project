import { describe, expect, it, vi } from 'vitest';
vi.mock('../../js/components/toast.js',()=>({showToast:vi.fn()}));
import { DOCUMENTOS_DEFENSA } from '../../js/examples/datos-personales-defensa.js';
import { ejemplosPersonalesDefensa, ejemploPersonalDefensa } from '../../js/examples/ejemplos-personales-defensa.js';
import { listarEjemplos, crearEjemplo } from '../../js/examples/catalogo.js';
import { evaluarHojas, serialFecha, fechaSerial } from '../../js/utils/hojas-formulas.js';
import { normalizarDocumentoPersonal, comprobarDocumentoPersonal, inventarioDocumentoPersonal, contrastarActivosPersonales, resumenPresupuestoPersonal, agregarRegistroPersonal, quitarRegistroPersonal, camposRegistroPersonal } from '../../js/modules/personales/personales-calculations.js';
import { normalizarEstudiantil, resumenEstudiantilGuardado, calcularSeguimiento } from '../../js/modules/presupuesto/presupuesto-calculations.js';
import { ejemploEstudiantil } from '../../js/modules/presupuesto/ejemplos-estudiantiles.js';
import { validarRespaldo } from '../../js/modules/integracion/integracion-respaldo.js';
import { finanzasPersonales } from '../../js/modules/inicio/inicio-calculations.js';
import { resumenPresupuestoEstudiantil } from '../../js/modules/integracion/integracion-reporte.js';

const documento=id=>structuredClone(DOCUMENTOS_DEFENSA.find(d=>d.id===id));
const editar=(d,hoja,ref,valor)=>{d.hojas.find(h=>h.nombre===hoja).filas.flatMap(f=>f.celdas).find(c=>c.ref===ref).valor=valor;};

describe('fuentes personales de la defensa',()=>{
  // Henry declara un plan de 16 semanas, pero registra 13 cortes hasta el 31 de octubre.
  it.each([['presupuesto-cris',20],['presupuesto-carlos',12],['presupuesto-juan',13],['presupuesto-henry',13],['presupuesto-gabriel',0]])('lee los cortes de %s sin volver a contar los resúmenes mensuales',(id,cantidad)=>{
    expect(calcularSeguimiento(ejemploPersonalDefensa(id)).semanas).toHaveLength(cantidad);
  });
  it('incluye los diez documentos, con nombres, hojas y procedencia independientes',()=>{
    expect(DOCUMENTOS_DEFENSA).toHaveLength(10);
    expect(ejemplosPersonalesDefensa('activos')).toHaveLength(5);
    expect(ejemplosPersonalesDefensa('presupuestoEstudiantil')).toHaveLength(5);
    for (const modulo of ['activos','presupuestoEstudiantil']) {
      expect(listarEjemplos(modulo).filter(e=>e.grupo==='Integrantes · defensa')).toHaveLength(5);
      for (const e of ejemplosPersonalesDefensa(modulo)) expect(crearEjemplo(modulo,e.id,vi.fn())).toEqual(ejemploPersonalDefensa(e.id));
    }
    const copia=ejemploPersonalDefensa('presupuesto-cris');copia.documento.nombre='Editado';
    expect(ejemploPersonalDefensa('presupuesto-cris').documento.nombre).toBe('Cris Angel Lumbí Rodríguez');
    expect(documento('activos-carlos').hojas[0].columnas).toBe(36);
    expect(documento('activos-cris').hojas[0].columnas).toBe(27);
    expect(documento('presupuesto-gabriel').hojas.map(h=>h.nombre)).toEqual(['Agosto','Septiembre','Octubre']);
    expect(crearEjemplo('presupuestoEstudiantil','actual',vi.fn())).toEqual(ejemploEstudiantil());
  });

  it.each(DOCUMENTOS_DEFENSA.filter(d=>d.tipo==='xlsx').map(d=>[d.id]))('recalcula todas las fórmulas de %s y contrasta sus resultados guardados',id=>{
    const d=documento(id), original=structuredClone(d), r=comprobarDocumentoPersonal(normalizarDocumentoPersonal(d));
    expect(r.formulas).toBeGreaterThan(0);expect(r.errores).toEqual([]);expect(r.diferencias).toEqual([]);expect(d).toEqual(original);
  });

  it.each([
    ['presupuesto-cris',6965,3780,2310,280,805,3000,595],
    ['presupuesto-carlos',2100,1420,620,60,0,2400],
    ['presupuesto-juan',12000,10290,1200,510,0,1200],
    ['presupuesto-henry',9000,6460,1500,900,140,2000]
  ])('reproduce el resumen de %s y lo comparte con Inicio/Reportes',(id,ingresos,gastos,ahorro,reserva,saldo,metaAhorro,saldoMovimientos=saldo)=>{
    // Control independiente: ingresos - gasto - ahorro - reserva = saldo.
    expect(ingresos-gastos-ahorro-reserva).toBe(saldoMovimientos);
    const d=ejemploPersonalDefensa(id), resumen=resumenEstudiantilGuardado({vista:'estudiantil',estudiantil:d});
    expect(normalizarEstudiantil(d)).toEqual(d);
    expect(resumen).toMatchObject({ingresos,gastos,ahorro,reserva,saldo,metaAhorro,saldoMovimientos,diferenciaSaldo:saldo-saldoMovimientos});
    expect(resumen.avance).toBeCloseTo(ahorro/metaAhorro,12);
  });

  it('no inventa ingresos ni transacciones para los planes de Gabriel',()=>{
    const d=documento('presupuesto-gabriel'), r=resumenPresupuestoPersonal(d);
    expect(r).toMatchObject({soloProyeccion:true,ingresos:null,gastos:null,ahorro:null,reserva:null,saldo:null});
    // Agosto: (10+40+60+60+30)*30 +720+120*4+50+200+300+150 = 7900.
    expect(r.planes).toEqual([{periodo:'Agosto',total:7900,ahorro:900},{periodo:'Septiembre',total:5740,ahorro:900},{periodo:'Octubre',total:6040,ahorro:900}]);
    editar(d,'Agosto','B9',11);expect(resumenPresupuestoPersonal(d).planes[0].total).toBe(7930);
  });

  it.each([['activos-cris',20,187600,71504.53],['activos-carlos',33,234900,78096.4285714286],['activos-juan',18,1115100,830824.0476190476],['activos-henry',33,258400,84563.21428571429]])('usa las funciones existentes y reproduce cada bien y total de %s',(id,cantidad,costo,libros)=>{
    const d=documento(id), a=contrastarActivosPersonales(d);
    expect(a).toHaveLength(cantidad);expect(a.every(a=>a.coincide)).toBe(true);
    expect(a.reduce((s,a)=>s+a.costoOriginal,0)).toBe(costo);
    expect(a.reduce((s,a)=>s+a.calculado.libros,0)).toBeCloseTo(libros,6);
    expect(a.every(a=>!Object.hasOwn(a,'condicion'))).toBe(true); // Sin puntajes ficticios.
  });

  it('conserva los doce bienes y todos los desarrollos del Word de Gabriel',()=>{
    const d=documento('activos-gabriel'), a=contrastarActivosPersonales(d);
    expect(a).toHaveLength(12);expect(a.every(a=>a.coincide)).toBe(true);
    // Laptop: (750-120)/5=126; 126*1=126; 750-126=624.
    expect(a[1]).toMatchObject({nombre:'Laptop (ASUS TUF Gaming)',moneda:'UM',simbolo:'$',calculado:{anual:126,acumulada:126,libros:624}});
    expect(a[9]).toMatchObject({vidaUtil:15,aniosConsumidos:15,calculado:{anual:29.67,acumulada:445,libros:55}});
    expect(d.bloques.at(-1).texto).toContain('CAPEX');
  });

  it.each(['presupuesto-cris','presupuesto-carlos','presupuesto-juan','presupuesto-henry'])('mantiene los cortes y categorías propios de %s al añadir movimientos',id=>{
      const d=documento(id), i=d.hojas.findIndex(h=>h.nombre.startsWith('Registro')), antes=resumenPresupuestoPersonal(d);
      const fecha=id==='presupuesto-cris'?'2026-07-30':'2026-08-01';
      const nuevo=agregarRegistroPersonal(d,i,{A:serialFecha(fecha),E:'Ingreso',F:'Ingreso extra',G:'Control',H:10,I:'Necesidad',J:'Efectivo',K:'Sin inventar otros movimientos'});
      expect(resumenPresupuestoPersonal(nuevo).ingresos).toBe(antes.ingresos+10);
      expect(comprobarDocumentoPersonal(nuevo).errores).toEqual([]);
      expect(d).toEqual(documento(id));
      expect(()=>agregarRegistroPersonal(d,i,{A:serialFecha('2027-01-01'),E:'Ingreso',F:'Ingreso extra',H:10})).toThrow();
  });

  it.each(['activos-cris','activos-carlos','activos-juan','activos-henry'])('añade y elimina un activo sin descartar columnas ni desajustar resúmenes: %s',id=>{
    const d=documento(id), i=d.hojas.findIndex(h=>h.nombre==='Inventario'), extensa=['activos-carlos','activos-juan'].includes(id);
    const valores={B:'Bien de control',C:'Herramientas',E:2026,F:1200,[extensa?'I':'H']:4,[extensa?'N':'L']:200};
    const antes=inventarioDocumentoPersonal(d), nuevo=agregarRegistroPersonal(d,i,valores), a=inventarioDocumentoPersonal(nuevo);
    expect(a).toHaveLength(antes.length+1);expect(a.at(-1)).toMatchObject({nombre:'Bien de control',costoOriginal:1200,vidaUtil:4,valorResidual:200,aniosConsumidos:0});
    expect(comprobarDocumentoPersonal(nuevo).errores).toEqual([]);expect(nuevo.hojas[i].columnas).toBe(d.hojas[i].columnas);
    const eliminado=quitarRegistroPersonal(nuevo,i,a.at(-1).filaOriginal);expect(inventarioDocumentoPersonal(eliminado)).toHaveLength(antes.length);
    expect(camposRegistroPersonal(eliminado,i).map(c=>c.nombre)).toContain('Activo');
  });

  it('recalcula cambios pero conserva los resultados de origen para contrastarlos',()=>{
    const d=documento('presupuesto-cris');editar(d,'Registro semanal','H6',500);
    const r=comprobarDocumentoPersonal(d);
    expect(r.errores).toEqual([]);expect(r.diferencias.length).toBeGreaterThan(0);
    expect(r.leer('Inicio y meta','F6')).toBe(7015);
    expect(r.diferencias.find(v=>v.hoja==='Inicio y meta'&&v.ref==='F6')).toMatchObject({original:6965,actual:7015});
    expect(fechaSerial(serialFecha('2026-07-30'))).toBe('2026-07-30');
  });

  it('restaura ambos módulos completos y elimina la procedencia al restaurar activos antiguos',()=>{
    const p=ejemploPersonalDefensa('presupuesto-henry'), a=ejemploPersonalDefensa('activos-carlos');
    const actuales={presupuesto:{vista:'estudiantil',estudiantil:null},activos:{inventario:[]}};
    const r=validarRespaldo({presupuesto:{vista:'estudiantil',estudiantil:p},activos:a},actuales);
    expect(r.omitidos).toEqual([]);expect(r.modulos.presupuesto.estudiantil).toEqual(p);expect(r.modulos.activos).toEqual(a);
    const antiguo=validarRespaldo({activos:{inventario:[]}},{activos:a});expect(antiguo.modulos.activos).toEqual({inventario:[]});
  });

  it('rechaza claves peligrosas y evita evaluar expresiones arbitrarias o referencias circulares',()=>{
    const d=documento('presupuesto-gabriel');
    const ataque=JSON.parse(JSON.stringify(d).replace('"version":1','"__proto__":{"x":1},"version":1'));
    expect(()=>normalizarDocumentoPersonal(ataque)).toThrow('Clave');
    editar(d,'Agosto','D9','=HYPERLINK("https://example.invalid")');
    expect(comprobarDocumentoPersonal(d).errores.some(e=>e.motivo.includes('no admitida'))).toBe(true);
    editar(d,'Agosto','D9','=D9');expect(comprobarDocumentoPersonal(d).errores.some(e=>e.motivo.includes('circular'))).toBe(true);
    editar(d,'Agosto','D9','=1/0');expect(evaluarHojas(d).leer('Agosto','D9')).toBeNull();
    expect({}.x).toBeUndefined();
  });

  it('explica el ajuste de Cris sin inventar un ingreso en Inicio y Reportes',()=>{
    const p=resumenPresupuestoPersonal(documento('presupuesto-cris')), area=finanzasPersonales(p)[0], html=resumenPresupuestoEstudiantil(p);
    expect(area.puntos.find(f=>f.etiqueta==='Saldo solo de movimientos').valor).toBe(595);
    expect(area.puntos.find(f=>f.etiqueta==='Ajuste sin movimiento registrado').valor).toBe(210);
    expect(area.puntos.find(f=>f.etiqueta==='Ingresos registrados').valor).toBe(6965);
    expect(html).toContain('805.00');expect(html).toContain('595.00');expect(html).toContain('210.00');
  });

  it('no llama movimientos realizados a los planes de Gabriel ni muestra semanas null para Carlos',()=>{
    const g=resumenPresupuestoPersonal(documento('presupuesto-gabriel')), c=resumenPresupuestoPersonal(documento('presupuesto-carlos'));
    expect(finanzasPersonales(g)[0].titulo).toContain('previsto');
    expect(resumenPresupuestoEstudiantil(g)).toContain('7,900.00');
    expect(resumenPresupuestoEstudiantil(c)).toContain('agosto a octubre de 2026');
    expect(finanzasPersonales(c)[0].interpretacion).not.toContain('null');
  });

  it('mantiene la moneda sin identificar de los activos de Gabriel en Inicio',()=>{
    const bienes=inventarioDocumentoPersonal(documento('activos-gabriel'));
    const area=finanzasPersonales(null,bienes)[0];
    expect(area.moneda).toBe('UM');
    expect(area.puntos.find(f=>f.etiqueta==='Valor en libros').valor).toBeCloseTo(3649,8);
  });
});
