"""Contraste propio del revisor. Python/Node estándar; esperados con Fraction.

Constantes transcritas de Euro/Metroline/Leonard, La Pinolera y Halley (TEAM.md).
La proyección residual está en Electronicas_analisis_financiero.md, §7.
Comercial Ejemplo usa inputs.json y apertura 2025 de su referencia independiente.
No usa los cálculos JavaScript para formar los resultados esperados.
"""
import json
import math
import subprocess
from fractions import Fraction as F
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
js = """
import {readFileSync} from 'node:fs';
import {CASOS_PROFORMA_DOCENTE as p} from './js/modules/proforma/proforma-docente-ejemplos.js';
import {calcularERDocente as er,calcularBalanceDocente as bg,calcularERResidualDocente as residual} from './js/modules/proforma/proforma-docente-calculations.js';
import {ejemploCajaDocente} from './js/modules/planeacion/caja-docente-ejemplos.js';
import {proyectarCajaDocente} from './js/modules/planeacion/caja-docente-calculations.js';
import {crearCasoComercial,leerPlaneacion} from './js/modules/planeacion/planeacion-escenarios.js';
import {calcularCapitalTrabajo} from './js/modules/planeacion/planeacion-calculations.js';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const f=leerPlaneacion(crearCasoComercial(null,read('propuesta-caso/referencia/referencia_resultados.json'),read('propuesta-caso/referencia/inputs.json')));
console.log(JSON.stringify({euro:er(p.euro.supuestos,'porcentaje'),metro:er(p.metro.supuestos,'porcentaje'),metroFV:er(p.metro.supuestos,'fijo-variable'),leonard:bg(p.leonard.supuestos),leonardAjustado:bg({...p.leonard.supuestos,dividendos:17000}),residual:residual(p.electronicas.supuestos),cajas:Object.fromEntries(['pinolero1','pinolero2','halley','halleyPrestamo','halleyRepago'].map(id=>[id,proyectarCajaDocente(ejemploCajaDocente(id))])),inventario:calcularCapitalTrabajo(f.supuestos,f.escenario.capitalTrabajo,f.base.fechaCorte,f.base.apertura.inventarioValor)}));
"""
app = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT, encoding='utf-8'))
checks = []


def check(path, expected, actual):
    valid = isinstance(actual, (int, float)) and math.isclose(float(expected), actual, rel_tol=1e-11, abs_tol=1e-7)
    checks.append({'control': path, 'esperado': float(expected), 'app': actual, 'conforme': valid})


def walk(path, expected, actual):
    for k, v in expected.items():
        if isinstance(v, dict):
            walk(path + '.' + k, v, actual[k])
        else:
            check(path + '.' + k, v, actual[k])


def er(ventas, costo, gastos, intereses, dividendos):
    bruta = ventas - costo
    uaii = bruta - gastos
    uai = uaii - intereses
    ir = uai * F(2, 5)
    neta = uai - ir
    return dict(ventas=ventas, costo=costo, gastos=gastos, intereses=intereses, bruta=bruta, uaii=uaii, uai=uai, ir=ir, neta=neta, dividendos=dividendos, retenidas=neta - dividendos)


walk('euro', er(3900000, 3900000 * F(1925000, 3500000), 3900000 * F(420000, 3500000), 325000, 320000), app['euro'])
walk('metro', er(1500000, 1500000 * F(910000, 1400000), 1500000 * F(120000, 1400000), 35000, 70000), app['metro'])
walk('metroFV', er(1500000, 210000 + 1500000 * F(700000, 1400000), 36000 + 1500000 * F(84000, 1400000), 35000, 70000), app['metroFV'])
walk('leonard', {'activos': dict(efectivo=50000, valores=15000, cxc=300000, inventario=360000, corrientes=725000, fijosNetos=658000, total=1383000), 'pasivos': dict(cxp=420000, deudasAcumuladas=60000, otrosCorrientes=30000, deudaLargoPlazo=350000, corrientes=510000, total=860000), 'patrimonio': dict(acciones=200000, retenidas=270000, total=470000), 'pasivosPatrimonio': 1330000, 'utilidadNeta': 120000, 'adicionRetenidas': 50000, 'diferencia': 53000, 'financiamiento': 53000, 'dividendoSinFaltante': 17000}, app['leonard'])
check('leonard ajustado: balance', 1383000, app['leonardAjustado']['pasivosPatrimonio'])
check('leonard ajustado: brecha', 0, app['leonardAjustado']['diferencia'])
cost = F(4140000 + 8475000, 2) * 6
sales = cost / F(72, 100)
uai = F(7274000) / F(7, 10)
interest = 8225500 * F(8, 100)
receivables = sales * F(85, 100)
payables = (cost + 8475000 - 4140000) * F(9, 10)
rot_cxc = receivables / 6197500
rot_cxp = payables / 506500
walk('residual', dict(ventas=sales, costo=cost, bruta=sales-cost, gastos=sales-cost-uai-interest, uaii=uai+interest, uai=uai, intereses=interest, ir=uai*F(3,10), neta=7274000, ventasCredito=receivables, comprasCredito=payables, actividad=dict(RotInv=6, edadInventario=F(365,6), RotCxC=rot_cxc, PPC=365/rot_cxc, rotacionCxP=rot_cxp, plazoPago=365/rot_cxp, rotacionActivosFijos=sales/2760000, rotacionActivos=sales/22695500, cicloConversion=F(365,6)+365/rot_cxc-365/rot_cxp)), app['residual'])


def pending(series, weights, month):
    return sum((value * sum(weights[month-origin+1:]) for origin, value in enumerate(series[:month+1])), F(0))


for case in ['pinolero1', 'pinolero2', 'halley', 'halleyPrestamo', 'halleyRepago']:
    pinolera = case.startswith('pinolero')
    first = case == 'pinolero1'
    if pinolera:
        sales = list(map(F, [300000,290000,425000,500000,600000,625000,650000,700000]))
        collection = list(map(F, ['.12','.75','.13'] if first else ['.10','.80','.10']))
        payment = list(map(F, ['.60','.40'] if first else ['.40','.60']))
        purchases = [v * F('.60') for v in sales]
        balance, minimum = F(15000), F(15000)
    else:
        sales = list(map(F, [100000,200000,400000,300000,200000]))
        collection, payment = list(map(F, ['.20','.50','.30'])), list(map(F, ['.10','.70','.20']))
        purchases = [v * F('.70') for v in sales]
        balance, minimum = F(50000), F(25000)
    debt, needs = F(0), []
    for m, i in enumerate(range(2, len(sales))):
        collected = sum((sales[i-k]*w for k,w in enumerate(collection)), F(0))
        paid = sum((purchases[i-k]*w for k,w in enumerate(payment)), F(0))
        if pinolera:
            rate = F('.11')  # Sueldos + renta + publicidad: 6+2+3 o 5+4+2.
            research = sales[i] * (F('.12') if first else F('.01')) if m >= 1 else 0
            tax = (40000 if first else 30000) if m == 2 else (45000 if first else 35000) if m == 5 else 0
            extra = sales[i]*rate + research + [15000,20000,25000,30000,35000,40000][m] + tax + (24000 if m == 5 else 0)
            other = loan = repayment = F(0)
        else:
            extra = 8000 + sales[i]*F('.10') + 5000 + [20000,130000,55000][m]
            other = 30000 if m == 2 else 0
            loan = 76000 if case != 'halley' and m == 1 else 0
            repayment = 35000 if case == 'halleyRepago' and m == 2 else 0
        inflow, outflow = collected + other, paid + extra
        net = inflow - outflow
        before = balance + net
        need = max(F(0), minimum-before)
        debt += loan-repayment
        final = before + loan-repayment
        expected = dict(ventas=sales[i], compras=purchases[i], cobros={'importe':collected}, proveedores={'importe':paid}, entradas=inflow, salidas=outflow, neto=net, inicial=balance, antes=before, minimo=minimum, necesidad=need, exceso=max(F(0),before-minimum), final=final, deudaAdicional=debt, cxcInicial=pending(sales,collection,i-1), cxcFinal=pending(sales,collection,i), cxpInicial=pending(purchases,payment,i-1), cxpFinal=pending(purchases,payment,i))
        walk(case+'.'+str(m+1), expected, app['cajas'][case]['meses'][m])
        needs.append(need)
        balance = final
    check(case+'.financiamientoMaximo', max(needs), app['cajas'][case]['financiamientoMaximo'])

raw = json.loads((ROOT/'propuesta-caso/referencia/inputs.json').read_text(encoding='utf-8'))['proyeccion_2026']
units, value, total_cost = F(800), F(80000), F(0)
for i, sold in enumerate(raw['unidades_vendidas']):
    target = F(str(raw['objetivo_inventario_siguiente'])) * raw['unidades_vendidas'][i+1] if i < 11 else F(raw['inventario_final_diciembre'])
    bought = max(F(0), sold+target-units)
    cost = bought * raw['costo_compra_unitario'][i]
    ending_units = units+bought-sold
    average = (value+cost)/(units+bought)
    ending_value = ending_units*average
    cost_of_sales = sold*average
    walk('inventario.'+str(i+1), dict(inicial=value, compras=cost, costoVentas=cost_of_sales, final=ending_value), app['inventario']['valoracion']['meses'][i])
    check('inventario.unidades.'+str(i+1), ending_units, app['inventario']['existencias'][i]['final'])
    total_cost += cost_of_sales
    units, value = ending_units, ending_value
check('inventario.costoVentasTotal', total_cost, app['inventario']['valoracion']['costoVentasTotal'])
report = {'controles':len(checks), 'diferencias':[c for c in checks if not c['conforme']], 'resultados':checks}
(HERE/'contraste.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items()if k!='resultados'},ensure_ascii=True))
raise SystemExit(bool(report['diferencias']))
