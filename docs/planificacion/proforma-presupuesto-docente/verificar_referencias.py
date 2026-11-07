"""Referencias académicas independientes; no importa ni modifica la app ni las fuentes."""
from fractions import Fraction as F
import json


def er(ventas, costo, gastos, intereses, impuesto, dividendos):
    bruta = ventas - costo
    uaii = bruta - gastos
    uai = uaii - intereses
    ir = uai * impuesto
    neta = uai - ir
    return dict(ventas=ventas, costo=costo, gastos=gastos, bruta=bruta, uaii=uaii,
                uai=uai, ir=ir, neta=neta, dividendos=dividendos, retenidas=neta-dividendos)


def pinolera(caso):
    ventas = [300000, 290000, 425000, 500000, 600000, 625000, 650000, 700000]
    compras = [F(3, 5) * v for v in ventas]
    cobro = [F(12, 100), F(75, 100), F(13, 100)] if caso == 1 else [F(1, 10), F(8, 10), F(1, 10)]
    pago = [F(6, 10), F(4, 10)] if caso == 1 else [F(4, 10), F(6, 10)]
    tasas = [F(6, 100), F(2, 100), F(3, 100), F(12, 100)] if caso == 1 else [F(5, 100), F(4, 100), F(2, 100), F(1, 100)]
    impuestos = [0, 0, 40000, 0, 0, 45000] if caso == 1 else [0, 0, 30000, 0, 0, 35000]
    filas, saldo = [], F(15000)
    for i, mes in enumerate(['Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']):
        k = i + 2
        entradas = sum(cobro[j] * ventas[k-j] for j in range(3))
        proveedores = sum(pago[j] * compras[k-j] for j in range(2))
        # I+D empieza en agosto; el seguro se paga en diciembre.
        otros = ventas[k] * sum(tasas[:3]) + (ventas[k]*tasas[3] if i else 0)
        salidas = proveedores + otros + (15000 + i*5000) + impuestos[i] + (24000 if i == 5 else 0)
        neto = entradas - salidas
        final = saldo + neto
        filas.append(dict(mes=mes, cobros=entradas, proveedores=proveedores, salidas=salidas,
                          flujo=neto, inicial=saldo, final=final, minimo=15000,
                          financiamiento=max(F(0), 15000-final), exceso=max(F(0), final-15000)))
        saldo = final  # cierre antes de financiamiento: no se contrata un préstamo supuesto
    return filas


def referencias():
    euro = er(F(3900000), F(3900000)*F(1925000, 3500000), F(3900000)*F(420000, 3500000), F(325000), F(2, 5), F(320000))
    metro_pct = er(F(1500000), F(1500000)*F(910000, 1400000), F(1500000)*F(120000, 1400000), F(35000), F(2, 5), F(70000))
    metro_fv = er(F(1500000), F(210000)+F(1500000)*F(700000, 1400000), F(36000)+F(1500000)*F(84000, 1400000), F(35000), F(2, 5), F(70000))
    leonard = dict(activos=F(50000+15000+300000+360000+600000+90000-32000),
                   pasivos=F(420000+60000+30000+350000), patrimonio=F(200000+220000+120000-70000))
    leonard['financiamiento'] = leonard['activos']-leonard['pasivos']-leonard['patrimonio']
    leonard['dividendo_sin_faltante'] = F(70000)-leonard['financiamiento']
    p1, p2 = pinolera(1), pinolera(2)
    assert euro['neta'] == 577200 and euro['retenidas'] == 257200
    assert metro_pct['neta'] == F(1518000, 7) and metro_fv['neta'] == 227400
    assert leonard['financiamiento'] == 53000
    assert [f['final'] for f in p1] == [38150, 37600, 850, 48100, 104350, 79100]
    assert [f['final'] for f in p2] == [51350, 117350, 168850, 290350, 421350, 488850]
    return dict(euro=euro, metro_porcentaje=metro_pct, metro_fijo_variable=metro_fv,
                leonard=leonard, pinolera_1=p1, pinolera_2=p2)


def decimal(v):
    if isinstance(v, F):
        return float(round(v, 2))
    if isinstance(v, dict):
        return {k: decimal(x) for k, x in v.items()}
    if isinstance(v, list):
        return [decimal(x) for x in v]
    return v


if __name__ == '__main__':
    print(json.dumps(decimal(referencias()), ensure_ascii=True, indent=2))
