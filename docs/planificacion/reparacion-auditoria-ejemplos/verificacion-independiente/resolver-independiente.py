"""Solución independiente: biblioteca estándar y Fraction. No importa JS ni resultados de cálculo de la app para obtener esperados.
Entradas ficticias: solo entradas-app.json. Casos docentes: datos transcritos aquí de las fuentes, sumados de nuevo.
La comparación con resultados-app.json ocurre después de preparar la referencia de cada concepto.
"""
from pathlib import Path
from fractions import Fraction as F
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
import json,csv,math,sys
P=Path(__file__).resolve().parent
I=json.loads((P/'entradas-app.json').read_text(encoding='utf-8'))
A=json.loads((P/'resultados-app.json').read_text(encoding='utf-8'))
R={};C=[];D=[]
def f(v):return F(str(v)) if v is not None else None
def num(v):return float(v)if isinstance(v,F)else v
def div(a,b):return None if a is None or b is None or b==0 else f(a)/f(b)
def suma(vs):return sum((f(v)for v in vs),F(0))
def cotejar(caso,seccion,periodo,concepto,esperado,actual,formula='',nota='',clase=None):
 e=num(esperado);a=num(actual)
 if e is None:estado='ND_JUSTIFICADO'if a is None else 'CERO_INDEBIDO'if a==0 else 'DIFERENCIA'
 elif a is None:estado=clase or 'ND_INDEBIDO'
 elif isinstance(e,bool):estado='COINCIDE'if a==e else 'DIFERENCIA'
 else:estado='COINCIDE'if math.isclose(float(e),float(a),rel_tol=1e-12,abs_tol=1e-8)else clase or 'DIFERENCIA'
 C.append(dict(caso=caso,seccion=seccion,periodo=str(periodo),concepto=concepto,independiente=e,app=a,diferencia=None if e is None or a is None else a-e,estado=estado,formula=formula,nota=nota))
 return estado
# Datos docentes leídos de los estados y enunciados originales transcritos; columnas en orden antiguo/nuevo.
# No se usan subtotales del resultado de la app para construir estas sumas.
B={
 'actual':[
 dict(p='2023',cash=45000,cxc=120000,inv=180000,oca=25000,ppe=[150000,200000,120000,60000],dep=-98525,pc=[85000,60000,15000],plp=[80000,43860],equity=[300000,80000,137615],pay=85000,sales=850000,cost=510000,op=[120000,85000],other=15000,otherexp=10000,interest=12600,tax=38220,credit=680000),
 dict(p='2024',cash=52000,cxc=135000,inv=195000,oca=30000,ppe=[150000,200000,120000,60000],dep=-116475,pc=[92000,65000,18000],plp=[45000,23085],equity=[300000,80000,202440],pay=92000,sales=920000,cost=545000,op=[130000,90000],other=18000,otherexp=12000,interest=11250,tax=44925,credit=736000,purchases=553000+92000-85000)],
 'baker':[
 dict(p='2011',cash=500000,cxc=500000,inv=900000,oca=0,ppe=[1050000,1150000],dep=-1200000,pc=[500000,700000,200000],plp=[400000],equity=[100000,120000,380000,500000],pay=500000),
 dict(p='2012',cash=1000000,cxc=400000,inv=600000,oca=0,ppe=[1200000,1300000],dep=-1300000,pc=[700000,600000,100000],plp=[600000],equity=[100000,120000,380000,600000],pay=700000,sales=1700000,cost=1000000,op=[230000,100000],other=0,otherexp=0,interest=70000,tax=120000)],
 'bartlett':[
 dict(p='2011',cash=288000+51000,cxc=365000,inv=300000,oca=0,ppe=[1903000,1693000,316000,314000,96000],dep=-2056000,pc=[270000,99000,114000],plp=[967000],equity=[200000,190000,418000,1012000],pay=270000,sales=2567000,cost=1711000,op=[108000,187000,35000,223000],other=0,otherexp=0,interest=91000,tax=64000),
 dict(p='2012',cash=363000+68000,cxc=503000,inv=289000,oca=0,ppe=[2072000,1866000,358000,275000,98000],dep=-2295000,pc=[382000,79000,159000],plp=[1023000],equity=[200000,191000,428000,1135000],pay=382000,sales=3074000,cost=2088000,op=[100000,194000,35000,239000],other=0,otherexp=0,interest=93000,tax=94000)],
 'practico2':[
 dict(p='2023',cash=50000,cxc=80000,inv=120000,oca=0,net=250000,pc=[70000,30000],plp=[100000],equity=[300000],pay=70000,sales=600000,cost=360000,op=[120000],other=0,otherexp=0,interest=30000,tax=27000),
 dict(p='2024',cash=65000,cxc=100000,inv=150000,oca=0,net=280000,pc=[95000,40000],plp=[115000],equity=[345000],pay=95000,sales=750000,cost=450000,op=[150000],other=0,otherexp=0,interest=40000,tax=33000)]}
BGIDS={'bs.cash_and_equivalents':'cash','bs.trade_receivables':'cxc','bs.inventory_total':'inv','bs.current_assets_total':'AC','bs.fixed_assets_net_total':'AF','bs.total_assets':'A','bs.current_liabilities_total':'PC','bs.total_liabilities':'P','bs.total_equity':'E','presentacion.pasivos_patrimonio':'PE'}
from copy import deepcopy
# Nuevo escenario: mismas partidas fuente, premisas explícitas de diapositivas
# 14–15. Se conservan intactos los esperados históricos y los de caja.
B['bartlett-clase']=deepcopy(B['bartlett'])
B['bartlett-clase'][-1].update(credit=3074000,purchases=1461600)
ERIDS={'is.net_sales_reported':'sales','is.cost_of_sales_reported':'cost','is.gross_profit_reported':'UB','presentacion.gastos_operativos':'GOp','is.operating_profit_reported':'UAII','presentacion.uai':'UAI','is.net_income_reported':'UN'}
for caso,periodos in B.items():
 R[caso]={}
 for k,b in enumerate(periodos):
  v={n:f(x)for n,x in b.items()if isinstance(x,(int,float))}
  v['AC']=v['cash']+v['cxc']+v['inv']+v['oca'];v['AF']=f(b['net'])if 'net'in b else suma(b['ppe'])+v['dep'];v['A']=v['AC']+v['AF'];v['PC']=suma(b['pc']);v['P']=v['PC']+suma(b['plp']);v['E']=suma(b['equity']);v['PE']=v['P']+v['E']
  assert v['A']==v['PE'],(caso,b['p'],'A=P+E')
  if 'sales'in b:v.update(UB=v['sales']-v['cost'],GOp=suma(b['op']));v['UAII']=v['UB']-v['GOp'];v['UAI']=v['UAII']+v['other']-v['otherexp']-v['interest'];v['UN']=v['UAI']-v['tax']
  p=b['p'];R[caso][p]=v;out=A['estados'][caso]['periodos'][p]
  for tabla,ids in [('balanceGeneral',BGIDS),('estadoResultados',ERIDS)]:
   for id,key in ids.items():
    filas=[x for x in out['resueltos'][tabla]if x['id']==id]
    fila=filas[0]if filas else None
    if len(filas)>1 and id=='bs.cash_and_equivalents':fila={'valorCalculo':sum(x['valor'] for x in filas)}
    esperado=v.get(key)
    cotejar(caso,'BG/ER',p,id,esperado,fila.get('valorCalculo',fila.get('valor'))if fila else None,'Sumas/restas de partidas fuente; sin sumar subtotales dos veces')
  r={'RC':div(v['AC'],v['PC']),'RR':div(v['AC']-v['inv'],v['PC']),'capitalNetoTrabajo':v['AC']-v['PC'],'pruebaDefensiva':div(v['cash'],v['PC']),'endeudamiento':div(v['P'],v['A']),'deudaPatrimonio':div(v['P'],v['E']),'solvencia':div(v['A'],v['P'])}
  for n,key in [('margenBruto','UB'),('margenOperativo','UAII'),('MN','UN')]:r[n]=div(v.get(key),v.get('sales'))
  r['coberturaIntereses']=div(v.get('UAII'),v.get('interest'));r['rotacionCapitalTrabajo']=div(v.get('sales'),r['capitalNetoTrabajo'])
  # Las diapositivas acreditan promedios con dos balances; no inventar el balance anterior del primer año.
  if k:
   ant=R[caso][periodos[k-1]['p']];prom={n:(v[n]+ant[n])/2 for n in ['A','AF','E','inv','cxc','pay']}
   r.update(RotInv=div(v.get('cost'),prom['inv']),RotCxC=div(v.get('credit'),prom['cxc']),rotacionCxP=div(v.get('purchases'),prom['pay']),rotacionActivos=div(v.get('sales'),prom['A']),rotacionActivosFijos=div(v.get('sales'),prom['AF']),ROA=div(v.get('UN'),prom['A']),roe=div(v.get('UN'),prom['E']),apalancamiento=div(prom['A'],prom['E']))
   r.update(edadInventario=div(365,r['RotInv']),PPC=div(365,r['RotCxC']),plazoPago=div(365,r['rotacionCxP']))
   r['cicloConversion']=r['PPC']+r['edadInventario']-r['plazoPago']if all(r[x]is not None for x in ['PPC','edadInventario','plazoPago'])else None
   dp={'PM':r['MN'],'AT':r['rotacionActivos'],'EM':r['apalancamiento'],'ROA':r['ROA'],'ROE':r['roe']}
   for n,e in dp.items():cotejar(caso,'DuPont',p,n,e,out['dupont'][n],'UN/V × V/A promedio × A promedio/E promedio; ROA sin multiplicador')
  for n,e in r.items():cotejar(caso,'Razones',p,n,e,out['razones'].get(n),'365 días; liquidez al cierre y actividad/rentabilidad con promedio cuando existe')
  if 'sales'in b:
   for key in ['sales','cost','UB','GOp','UAII','UAI','tax','UN']:
    target={'sales':'ventas','cost':'cbv','UB':'utilidadBruta','GOp':'gastosOperacion','UAII':'uaii','UAI':'uai','tax':'ir','UN':'utilidadNeta'}[key]
    if k==len(periodos)-1:cotejar(caso,'Real de Proforma',p,target,v[key],A['estados'][caso]['realProforma'].get(target),'Mismo ER independiente')
 # EOAF: construir una lista de saldos hoja. Inventario, PPE neto y patrimonio total son hoja cuando no hay desglose.
 d=I['estados'][caso];hojas={}
 for b in periodos:
  p=b['p'];hojas[p]={}
  for grupo,cuentas in d['balanceGeneral'][p].items():
   for nombre,monto in cuentas.items():hojas[p][grupo+':'+nombre]=(grupo,f(monto))
  report=d.get('reportedTotals',{}).get(p,{})
  for id in ['bs.inventory_total','bs.fixed_assets_net_total','bs.total_equity']:
   if id not in report:continue
   if id=='bs.fixed_assets_net_total'and 'net'not in b:continue
   if id=='bs.total_equity'and d['balanceGeneral'][p]['patrimonio']:continue
   z=report[id];hojas[p][id]=(z['grupo'],f(z['importe']))
 o=F(0);a=F(0)
 for key in hojas[periodos[0]['p']].keys()|hojas[periodos[1]['p']].keys():
  grupo,m1=hojas[periodos[0]['p']].get(key,(hojas[periodos[1]['p']][key][0],F(0)));m2=hojas[periodos[1]['p']].get(key,(grupo,F(0)))[1];delta=m2-m1
  origen=-delta if grupo=='activos'else delta
  if origen>0:o+=origen
  else:a-=origen
 for n,e in [('totalOrigenes',o),('totalAplicaciones',a),('diferencia',o-a)]:cotejar(caso,'EOAF','comparativo',n,e,A['estados'][caso]['eoaf']['resumen'][n],'Activo que aumenta aplica; pasivo/patrimonio que aumenta origina; excluir subtotales duplicados')
 # Inicio usa un camino distinto y debe coincidir con el ER disponible.
 final=periodos[-1]['p'];un=R[caso][final].get('UN');kpis=A['consumidores'][caso]['inicio']['kpis'];kpi=next((x for x in kpis if x['clave']=='utilidadNeta'),{})
 cotejar(caso,'Inicio',final,'Utilidad neta',un,kpi.get('valor'),'Misma UN que Estados')
# CTN/CNO de la pestaña: contraste aritmético con la convención documentada de la app.
for caso,periodos in B.items():
 v=R[caso][periodos[-1]['p']];prov=F(18000)if caso=='actual'else F(0);opsAC=v['cxc']+v['inv'];opsPC=v['pay']+prov
 valores=dict(CNT=v['AC']-v['PC'],CNO=opsAC-opsPC,activosCorrientesOps=opsAC,pasivosCorrientesOps=opsPC,excluidosAC=v['cash']+v['oca'],excluidosPC=v['PC']-opsPC)
 for n,e in valores.items():cotejar(caso,'CTN/CNO',periodos[-1]['p'],n,e,A['consumidores'][caso]['capitalTrabajo'][n],'CNO=(CxC+Inventario)−(CxP+Provisiones), definición vigente de la app','La fuente docente disponible no acredita una definición universal de CNO ni la clasificación de cada provisión')
# AH/AV: resolver las filas desde entradas originales y subtotales independientes. La convención abs(base) es de la app, no acreditada para bases negativas en las diapositivas disponibles.
def monto_fila(caso,p,fila):
 d=I['estados'][caso];clave=fila['clave'];id=fila.get('id');v=R[caso][p]
 if clave.startswith('resuelto:'):
  if id=='is.sales_total':return v.get('sales')if caso=='actual'else None
  campo=(BGIDS|ERIDS).get(id)
  return v.get(campo)if campo else None
 if clave.startswith('reportado:'):
  return f(d.get('reportedTotals',{}).get(p,{}).get(id,{}).get('importe'))
 grupo,nombre=clave.split(':',1)
 if grupo=='estadoResultados':return f(d['estadoResultados'].get(p,{}).get(nombre))
 if grupo in ['activos','pasivos','patrimonio']:return f(d['balanceGeneral'].get(p,{}).get(grupo,{}).get(nombre))
 if grupo=='suplementario':return f(d.get('supplementaryAccounts',{}).get(p,{}).get(nombre))
 return None
for caso,doc in I['estados'].items():
 for p,out in A['estados'][caso]['periodos'].items():
  for section,base in [('balanceGeneral',R[caso][p]['A']),('estadoResultados',R[caso][p].get('sales'))]:
   for fila in out['av'][section]['rows']:
    e=monto_fila(caso,p,fila);cotejar(caso,'AV',p,fila['clave'],div(e,base),fila['pctBase'],'Cuenta/Total Activos en BG; cuenta/Ventas netas en ER; base sin dato o cero → N/D','Verificación del criterio del sistema; transcripciones disponibles no detallan todos los casos de base negativa')
 for par in A['estados'][caso]['ah']:
  for fila in par['rows']:
   p1,p2=par['inicial'],par['final'];v1=monto_fila(caso,p1,fila);v2=monto_fila(caso,p2,fila);delta=v2-v1 if v1 is not None and v2 is not None else None
   cotejar(caso,'AH diferencia',p1+'→'+p2,fila['clave'],delta,fila['delta'],'Final−inicial; dato ausente → N/D')
   cotejar(caso,'AH porcentaje',p1+'→'+p2,fila['clave'],div(delta,abs(v1))if v1 is not None else None,fila['pctDelta'],'(Final−inicial)/abs(inicial), decisión del sistema; base cero → N/D','No atribuir al profesor el uso de abs(base) en saldos negativos sin una diapositiva que lo acredite')
# Flujos: movimientos se recalculan por actividad. Para docente se reconstruyen también desde BG/ER.
for id,d in I['flujo'].items():
 flujo={g:suma((m['monto']if m['tipo']=='entrada'else -m['monto'])for m in d['movimientos']if m['actividad']==g)for g in ['operacion','inversion','financiamiento']}
 flujo['variacionNeta']=sum(flujo.values());flujo['saldoFinal']=f(d['saldoInicial'])+flujo['variacionNeta'];R['flujo/'+id]=flujo
 for n,e in flujo.items():cotejar(id,'Flujo directo','2012'if id!='actual'else 'anual',n,e,A['flujo'][id]['neto'][n]if n in A['flujo'][id]['neto']else A['flujo'][id][n],'Sumar entradas y restar salidas clasificadas; inicial + variación = final')
for caso,ref in [('baker',dict(un=180000,cfo=180000+100000+100000+300000+200000-100000,cfi=-150000-150000,cff=-100000+200000-80000)),('bartlett',dict(un=231000,cfo=231000+239000-138000+11000+112000+45000,cfi=-169000-173000-42000+39000-2000,cff=-20000+56000+1000+10000-108000))]:
 R['EFE/'+caso]=ref
 for n,e in ref.items():
  app=A['estados'][caso]['efe'];actual=app['utilidadNeta']if n=='un'else app[{'cfo':'operacion','cfi':'inversion','cff':'financiamiento'}[n]]['total'];cotejar(caso,'EFE indirecto','2012',n,e,actual,'UN + depreciación ± variaciones operativas; inversión y financiamiento según fuente')
# Contraste del flujo directo contra la reconstrucción independiente de la fuente, además de la suma de sus movimientos.
for caso in ['baker','bartlett']:
 for campo,actividad in [('cfo','operacion'),('cfi','inversion'),('cff','financiamiento')]:cotejar(caso,'Flujo directo vs fuente','2012',actividad,R['EFE/'+caso][campo],A['flujo'][caso+'-directo']['neto'][actividad],'Reconstrucción docente BG/ER contrastada con el ejemplo de movimientos')
# MUNO: estimación condicional, no un registro de movimientos real. La identidad declarada de otros pasivos corrientes es operativa.
refM=dict(un=F(104825),cfo=F(104825+17950-15000-15000-5000+7000+5000+3000),cfi=F(0),cff=F(-35000-20775-40000));R['EFE/actual']=refM
for n,e in refM.items():
 dato=A['estados']['actual']['efe'];valor=dato['utilidadNeta']if n=='un'else dato[{'cfo':'operacion','cfi':'inversion','cff':'financiamiento'}[n]]['total'];cotejar('actual','EFE estimado (condicional)','2024',n,e,valor,'UN + Δdepreciación acumulada ± saldos, con la clasificación declarada del caso ficticio','Coincidencia condicional: no certifica movimientos reales ni que toda la variación de depreciación sea gasto del periodo')
# Práctico 2: la UN está acreditada; otros flujos no se infieren sin depreciación, aportes y movimientos.
cotejar('practico2','EFE indirecto','2024','un',77000,A['estados']['practico2']['efe']['utilidadNeta'],'77000 reportado y recalculado; su ausencia no se justifica por falta de detalle de otros flujos')
# C-V-U: recalcular todos los escenarios independientemente de la función aplicarCambios.
def cvu(d,c=None):
 c=c or{};pr=f(d['precio'])*(1+f(c.get('precio',0)));cv=f(d['costoVariableUnitario'])*(1+f(c.get('costoVariable',0)));cf=f(d['costosFijos'])*(1+f(c.get('costosFijos',0)));q=f(d['unidades'])*(1+f(c.get('volumen',0)));m=pr-cv;pe=div(cf,m);uaii=q*m-cf;ventas=pr*q
 return dict(precio=pr,cvu=cv,cf=cf,q=q,mcu=m,rmc=div(m,pr),peUnidades=pe,peVentas=None if pe is None else pe*pr,unidadesMinimas=None if pe is None else math.ceil(pe),ventas=ventas,costoVariableTotal=cv*q,mcTotal=q*m,costoTotal=cf+cv*q,uaii=uaii,msUnidades=None if pe is None else q-pe,msVentas=None if pe is None else ventas-pe*pr,msPorcentaje=div(q-pe,q)if pe is not None else None,gao=div(q*m,uaii),utilidadObjetivo=f(d.get('utilidadObjetivo')),unidadesObjetivo=div(cf+f(d['utilidadObjetivo']),m)if d.get('utilidadObjetivo')is not None else None,ventasObjetivo=div(cf+f(d['utilidadObjetivo']),m)*pr if d.get('utilidadObjetivo')is not None else None)
for id,d in I['equilibrio'].items():
 R['CVU/'+id]=cvu(d)
 for n,e in R['CVU/'+id].items():cotejar(id,'C-V-U','base',n,e,A['equilibrio'][id][n],'P×Q − CVu×Q − CF; PE=CF/(P−CVu)')
 cambiosReferencia={'base':{},'precio-sube':{'precio':F(1,10)},'precio-baja':{'precio':F(-1,10)},'cv-sube':{'costoVariable':F(1,10)},'cv-baja':{'costoVariable':F(-1,10)},'cf-sube':{'costosFijos':F(1,10)},'cf-baja':{'costosFijos':F(-1,10)},'volumen-sube':{'volumen':F(1,10)},'volumen-baja':{'volumen':F(-1,10)},'personalizado':d.get('escenario',{})}
 for sc in A['equilibrio'][id]['escenarios']:
  for n,e in cvu(d,cambiosReferencia[sc['id']]).items():cotejar(id,'C-V-U escenario',sc['id'],n,e,sc['resultado'][n],'Aplicar cambios declarados a entradas; resolver de nuevo con fracciones exactas')
# Presupuesto: libro independiente con ventas, existencias, cobros y pagos; impuesto devengado separado del pago.
for id,d in I['planeacion'].items():
 saldo=f(d['saldoInicialCaja']);inv=f(d['inventarioInicial']);cxcanterior=f(d['cxcInicial']);cxpanterior=f(d['cxpInicial']);r=[]
 for k,q0 in enumerate(d['ventasUnidades']):
  q=f(q0);v=q*f(d['precio']);final=f(d['inventarioFinalUltimo'])if k==len(d['ventasUnidades'])-1 else f(d['ventasUnidades'][k+1])*f(d['pctInventarioFinal']);compra=max(F(0),q+final-inv);stock=inv+compra-q
  CxC=v*(1-f(d['pctContado']));cobros=v*f(d['pctContado'])+cxcanterior;importeCompra=compra*f(d['costoUnitario']);CxP=importeCompra*(1-f(d['pctComprasContado']));pagos=importeCompra*f(d['pctComprasContado'])+cxpanterior
  cbv=(inv+compra-stock)*f(d['costoUnitario']);gastoVariable=v*f(d['pctGastosVariables']);gop=gastoVariable+f(d['gastosFijos'])+f(d['depreciacion']);ub=v-cbv;uaii=ub-gop;uai=uaii-f(d['intereses']);ir=max(F(0),uai)*f(d['tasaIR']);un=uai-ir;desembolsos=pagos+gop-f(d['depreciacion'])+f(d['intereses'])+f(d['otrosDesembolsos'][k]);sf=saldo+cobros-desembolsos
  z=dict(ventas=v,cbv=cbv,utilidadBruta=ub,gastosOperacion=gop,uaii=uaii,uai=uai,ir=ir,utilidadNeta=un,cobros=cobros,comprasUnidades=compra,compras=importeCompra,pagosProveedores=pagos,inventarioInicial=inv,inventarioFinal=stock,saldoInicial=saldo,saldoFinal=sf,desembolsos=desembolsos,flujoNeto=cobros-desembolsos,financiamiento=max(F(0),f(d['saldoMinimoCaja'])-sf),cxc=CxC,cxp=CxP)
  r.append(z);saldo=sf;inv=stock;cxcanterior=CxC;cxpanterior=CxP
  for n in ['ventas','cbv','utilidadBruta','gastosOperacion','uaii','uai','ir','utilidadNeta']:cotejar(id,'Presupuesto ER',k+1,n,z[n],A['planeacion'][id]['resultados'][n][k],'Ventas−CBV=UB; UB−gastos=UAII; −I=UAI; −IR=UN')
  for n in ['saldoInicial','cobros','pagosProveedores','desembolsos','flujoNeto','saldoFinal','financiamiento']:cotejar(id,'Presupuesto caja',k+1,n,z[n],A['planeacion'][id]['caja'][n][k],'Cobros y pagos por vencimiento; depreciación no desembolsable; IR pendiente según D-014')
  cotejar(id,'Presupuesto compras',k+1,'Unidades',compra,A['planeacion'][id]['compras']['unidades'][k],'Ventas + inv final deseado − inv inicial, sin compras negativas')
 R['Presupuesto/'+id]=r
 for n in ['ventas','cbv','utilidadBruta','gastosOperacion','uaii','uai','ir','utilidadNeta']:
  cotejar(id,'Proforma', 'horizonte',n,sum(z[n]for z in r),A['planeacion'][id]['proforma'][n],'Suma de los resultados de los cuatro trimestres')
 for n in ['cxc','cxp','efectivo','inventarioUnidades','inventarioValor','irPorPagar']:
  e={'cxc':cxcanterior,'cxp':cxpanterior,'efectivo':saldo,'inventarioUnidades':inv,'inventarioValor':inv*f(d['costoUnitario']),'irPorPagar':sum(z['ir']for z in r)}[n];cotejar(id,'Presupuesto cierre','2025',n,e,A['planeacion'][id]['cierre'][n],'Conciliación independiente de saldos')
# Inventario: kardex al costo promedio, con costos iniciales declarados cuando no hay costo nuevo en las entradas del ejemplo.
for id,d in I['inventario'].items():
 total=F(0);unidades=F(0);repo=F(0);detalle=[]
 for p in d['productos']:
  q=f(p['existenciaInicial']);valor=q*f(p['costoUnitario']);entradas=F(0);salidas=F(0);costoSalidas=F(0)
  for m in sorted([m for m in d['movimientos']if m['productoId']==p['id']],key=lambda m:(m['fecha'],m['id'])):
   cantidad=f(m['cantidad'])
   if m['tipo']=='entrada':valor+=cantidad*f(m.get('costoUnitario',p['costoUnitario']));q+=cantidad;entradas+=cantidad
   else:coste=div(valor,q)*cantidad;valor-=coste;q-=cantidad;salidas+=cantidad;costoSalidas+=coste
  faltante=max(F(0),f(p['stockMinimo'])-q);prom=div(valor,q)if q else f(p['costoUnitario']);rr=dict(existenciaFinal=q,entradas=entradas,salidas=salidas,costoPromedio=prom,costoSalidas=costoSalidas,valor=valor,faltante=faltante,costoReposicion=faltante*prom)
  target=next(x for x in A['inventario'][id]['productos']if x['id']==p['id'])
  for n,e in rr.items():cotejar(id,'Inventario',p['nombre'],n,e,target[n],'Existencia inicial + entradas − salidas; costo por promedio; faltante hasta mínimo')
  detalle.append(dict(nombre=p['nombre'],**rr));total+=valor;unidades+=q;repo+=faltante*prom
 for n,e in [('valorTotal',total),('unidadesTotales',unidades),('costoReposicionTotal',repo)]:cotejar(id,'Inventario total','enero 2025',n,e,A['inventario'][id][n],'Sumar cantidades de la misma unidad y valores')
 R['Inventario/'+id]=detalle
# Personal: no se inventa reserva en ejemplos que no la traen; separar capacidad de meta y saldo disponible.
for id,d in I['presupuesto'].items():
 ingreso=suma(x['monto']for x in d['ingresos']);gastos=suma(x['monto']for x in d['gastos']);ahorro=div(d['metaAhorro'],d['mesesDisponibles']);rr=dict(ingresos=ingreso,gastos=gastos,ahorroMensual=ahorro,capacidad=ingreso-gastos,tasaAhorro=div(ingreso-gastos,ingreso),saldoDisponible=ingreso-gastos-ahorro,balance=ingreso==gastos+ahorro)
 for n,e in rr.items():cotejar(id,'Personal','mes',n,e,A['presupuesto'][id][n],'Ingresos−gastos; meta/meses; saldo después del ahorro')
 rr['limiteSemanalSinReserva']=(ingreso-ahorro)/4;R['Personal/'+id]=rr
# Mercado: mismos datos ficticios elegidos en el módulo, aplicados a cada BG/ER; no confundirlos con acciones docentes.
for clave,d in I['mercado'].items():
 caso,id=clave.split('/');R['Mercado/'+clave]=[]
 for p,stock in d['periodos'].items():
  v=R[caso][p];acciones=stock['acciones'];upa=div(v.get('UN'),acciones);vl=div(v['E'],acciones);dpa=div(stock['dividendos'],acciones);rr=dict(un=v.get('UN'),upa=upa,pu=div(stock['precio'],upa),vlpa=vl,pvl=div(stock['precio'],vl),dpa=dpa,pago=div(dpa,upa),rendimiento=div(dpa,stock['precio']))
  target=next(x for x in A['mercado'][clave]if x['periodo']==p)
  for n,e in rr.items():cotejar(clave,'Mercado',p,n,e,target[n],'UPA=(UN−DAP)/acciones; DAP ficticio declarado cero; VL=E/acciones; P/U y pagos')
  R['Mercado/'+clave].append(dict(periodo=p,**rr))
# Casos TOR completos: la referencia procede del enunciado; comprobar funciones públicas, distinguiéndolo del selector C-V-U que solo llega a UAII.
for q in [100000,120000]:
 mc=f(q)*F(9,2);uaii=mc-250000;uai=uaii-80000;un=uai*F(3,5);udac=un-40000;den=uai-F(40000)/F(3,5);rr=dict(ventas=f(q)*F(15,2),mc=mc,uaii=uaii,uai=uai,ir=uai*F(2,5),un=un,udac=udac,upa=udac/20000,gao=mc/uaii,gaf=uaii/den,gat=mc/den)
 R['TOR/'+str(q)]=rr
 for n in ['gao','gaf','gat','upa']:cotejar('TOR','Funciones públicas (diagnóstico)',q,n,rr[n],A['diagnosticos']['tor'][str(q)][n],'GAF=UAII/[UAI−DAP/(1−T)]; UPA=(UN−DAP)/acciones')
for caso,shares in [('baker',100000),('bartlett',76262)]:
 p=B[caso][-1]['p'];v=R[caso][p];e=(v['UN']-10000)/shares;target=A['diagnosticos']['mercadoDocente'][caso][-1]['upa'];cotejar(caso,'UPA docente (diagnóstico)',p,'upa',e,target,'(UN−10000)/acciones de la fuente, sin reemplazar por acciones ficticias')
# Bartlett en la presentación de razones: escenario docente distinto del de movimientos reales; no combinar compras estimadas con pagos del EFE.
v=R['bartlett']['2012'];prev=R['bartlett']['2011'];inv=(v['inv']+prev['inv'])/2;cxc=(v['cxc']+prev['cxc'])/2;cxp=(v['pay']+prev['pay'])/2;compras=F(2088000)*F(7,10)
rr=dict(RotCxC=v['sales']/cxc,PPC=cxc*365/v['sales'],rotacionCxP=compras/cxp,plazoPago=cxp*365/compras);rr['cicloConversion']=inv*365/v['cost']+rr['PPC']-rr['plazoPago'];R['Bartlett/diapositivas14-15']=dict(comprasEstimadas=compras,**rr)
for n,e in rr.items():cotejar('bartlett-clase','Premisas docentes explícitas','2012',n,e,A['estados']['bartlett-clase']['periodos']['2012']['razones'][n],'Ventas 100% crédito y compras estimadas 70% del costo, diapositivas 14–15; escenario histórico separado')
# Bienes del hogar incluidos al cargar ejemplo personal: fórmula aritmética; la clasificación por score es propia de la app, no acreditada en las diapositivas.
for d,t in zip(I['activos'],A['activos']):
 anual=(f(d['costoOriginal'])-f(d['valorResidual']))/f(d['vidaUtil']);acum=anual*min(f(d['aniosConsumidos']),f(d['vidaUtil']));rr=dict(anual=anual,acumulada=acum,libros=f(d['costoOriginal'])-acum,score=suma(d['condicion']['scores'])/len(d['condicion']['scores'])*10)
 R['Activo/'+d['nombre']]=rr
 for n,e in rr.items():cotejar(d['nombre'],'Activo hogar','anual',n,e,t[n],'(Costo−residual)/vida; depreciación acumulada; costo−acumulada; score promedio')
# Referencia Comercial Ejemplo parcial: resolver el calendario sin leer los resultados históricos de referencia como esperado.
original=I['referencia']['inputs']
hist={k:f(x) for k,x in original['apertura_2023'].items() if isinstance(x,(int,float))}
R['Comercial Ejemplo históricos']={}
for h in original['historicos']:
 venta=f(h['unidades_vendidas'])*f(h['precio_unitario'])
 compra=f(h['compras_unidades'])*f(h['costo_compra_unitario'])
 promedio=(hist['inventario_valor']+compra)/(hist['inventario_unidades']+f(h['compras_unidades']))
 cbv=f(h['unidades_vendidas'])*promedio
 interes=hist['deuda']*f(h['tasa_interes'])
 uai=venta-cbv-f(h['gastos_operativos'])-f(h['depreciacion'])-interes
 ir=max(F(0),uai)*f(h['tasa_impuesto'])
 un=uai-ir
 hist['efectivo']+=venta*f(h['venta_contado'])+f(h['cobros_cxc'])-compra*f(h['compra_contado'])-f(h['pagos_cxp'])-f(h['gastos_operativos'])-interes-f(h['pago_impuesto'])-f(h['inversion'])+f(h['prestamo'])-f(h['principal'])-f(h['dividendos'])
 hist['cxc']+=venta*(1-f(h['venta_contado']))-f(h['cobros_cxc'])
 hist['cxp']+=compra*(1-f(h['compra_contado']))-f(h['pagos_cxp'])
 hist['inventario_unidades']+=f(h['compras_unidades'])-f(h['unidades_vendidas'])
 hist['inventario_valor']=hist['inventario_unidades']*promedio
 hist['deuda']+=f(h['prestamo'])-f(h['principal'])
 hist['depreciacion_acumulada']-=f(h['depreciacion'])
 hist['resultados_acumulados']+=un-f(h['dividendos'])
 hist['impuesto_por_pagar']+=ir-f(h['pago_impuesto'])
 year=h['periodo'];R['Comercial Ejemplo históricos'][year]=dict(hist,ventas=venta,cbv=cbv,uai=uai,ir=ir,un=un)
 referencia=I['referencia']['referencia']['historicos'][year]
 for campo in ['efectivo','cxc','cxp','inventario_unidades','inventario_valor','resultados_acumulados']:
  cotejar('Comercial Ejemplo','Histórico de referencia',year,campo,hist[campo],referencia['cierre'][campo],'Libro independiente desde apertura 2023 y movimientos 2024/2025; no usar cierres de la app como premisas')
 cotejar('Comercial Ejemplo','Histórico de referencia',year,'UN',un,referencia['estado_resultados']['utilidad_neta'],'Ventas−CBV−gastos−depreciación−intereses−IR')
base={'saldoInicialCaja':hist['efectivo'],'cxcInicial':hist['cxc'],'cxpInicial':hist['cxp'],'inventarioInicial':hist['inventario_unidades']}
d=original['proyeccion_2026'];n=len(d['unidades_vendidas']);inv=f(base['inventarioInicial']);cxc=f(base['cxcInicial']);cxp=f(base['cxpInicial']);creditoVentas=[];creditoCompras=[];r=[]
for k in range(n):
 q=f(d['unidades_vendidas'][k]);objetivo=f(d['inventario_final_diciembre'])if k==n-1 else f(d['unidades_vendidas'][k+1])*f(d['objetivo_inventario_siguiente']);compras=max(F(0),q+objetivo-inv);stock=inv+compras-q;importe=q*f(d['precio_unitario']);vc=importe*(1-f(d['venta_contado']));importeCompras=compras*f(d['costo_compra_unitario'][k]);pc=importeCompras*(1-f(d['compra_contado']));creditoVentas.append(vc);creditoCompras.append(pc)
 cobroApertura=f(base['cxcInicial'])*f(d['distribucion_cobro_apertura'][k])if k<len(d['distribucion_cobro_apertura'])else F(0);cobroNuevo=sum((creditoVentas[k-j-1]*f(pct)for j,pct in enumerate(d['distribucion_cobro_credito'])if k-j-1>=0),F(0));cobros=importe*f(d['venta_contado'])+cobroApertura+cobroNuevo
 pagos=importeCompras*f(d['compra_contado'])+(f(base['cxpInicial'])if k+1==d['mes_pago_cxp_apertura']else F(0))+(creditoCompras[k-d['meses_hasta_pago_credito']]if k>=d['meses_hasta_pago_credito']else F(0));cxc+=importe-cobros;cxp+=importeCompras-pagos
 rr=dict(ventas=importe,compras=importeCompras,unidadesCompras=compras,inventarioFinal=stock,cobros=cobros,pagos=pagos,cxc=cxc,cxp=cxp);r.append(rr);inv=stock;t=A['referencia']
 for key,e in rr.items():
  actual={'ventas':t['ventas']['meses'][k]['importe'],'compras':t['compras']['meses'][k]['importe'],'unidadesCompras':t['existencias'][k]['compras'],'inventarioFinal':t['existencias'][k]['final'],'cobros':t['ventas']['meses'][k]['total'],'pagos':t['compras']['meses'][k]['total'],'cxc':t['ventas']['meses'][k]['cierre'],'cxp':t['compras']['meses'][k]['cierre']}[key];cotejar('Comercial Ejemplo','Referencia parcial',k+1,key,e,actual,'Calendario a varios meses; apertura + devengo − liquidación = cierre')
R['Comercial Ejemplo']=r
# Guardar soluciones y comparador; serialize solo al final mantiene cálculo racional exacto.
def serial(x):
 if isinstance(x,F):return dict(exacto=str(x),decimal=float(x))
 raise TypeError(type(x))
(P/'soluciones-independientes.json').write_text(json.dumps(R,ensure_ascii=False,indent=2,default=serial),encoding='utf-8')
(P/'datos-docentes-independientes.json').write_text(json.dumps(B,ensure_ascii=False,indent=2),encoding='utf-8')
(P/'comparacion.json').write_text(json.dumps(C,ensure_ascii=False,indent=2),encoding='utf-8')
with (P/'comparacion.csv').open('w',encoding='utf-8-sig',newline='')as out:
 w=csv.DictWriter(out,fieldnames=list(C[0]));w.writeheader();w.writerows(C)
res={'totalComprobaciones':len(C),'estados':dict(Counter(c['estado']for c in C)),'porSeccion':{k:dict(Counter(c['estado']for c in C if c['seccion']==k))for k in sorted(set(c['seccion']for c in C))}}
(P/'resumen.json').write_text(json.dumps(res,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(res,ensure_ascii=True));print('Diferencias:',json.dumps([c for c in C if c['estado']not in ['COINCIDE','ND_JUSTIFICADO']],ensure_ascii=True)[:1800])
