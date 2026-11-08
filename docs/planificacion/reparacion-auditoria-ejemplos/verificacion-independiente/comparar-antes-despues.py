"""Contrasta las 70 celdas erróneas de la auditoría original, sin alterar sus esperados."""
import json
import sys
from pathlib import Path

actual = Path(__file__).resolve().parent
baseline = Path(sys.argv[1])
antes = json.loads((baseline / 'comparacion.json').read_text(encoding='utf-8'))
despues = json.loads((actual / 'comparacion.json').read_text(encoding='utf-8'))
clave = lambda c: tuple(c[k] for k in ['caso', 'seccion', 'periodo', 'concepto'])
indice = {clave(c): c for c in despues}
errores = [c for c in antes if c['estado'] in ['DIFERENCIA', 'ND_INDEBIDO', 'CERO_INDEBIDO']]
assert len(errores) == 70
corregidos = []
for previo in errores:
    nuevo = indice[clave(previo)]
    assert previo['independiente'] == nuevo['independiente'], clave(previo)
    assert nuevo['estado'] in ['COINCIDE', 'ND_JUSTIFICADO'], nuevo
    corregidos.append(dict(caso=previo['caso'], seccion=previo['seccion'], periodo=previo['periodo'],
                          concepto=previo['concepto'], independiente=previo['independiente'],
                          antes=previo['app'], despues=nuevo['app'], estado=nuevo['estado']))
docente = [c for c in despues if c['seccion'] == 'Premisas docentes explícitas']
assert len(docente) == 5 and all(c['estado'] == 'COINCIDE' for c in docente)
assert all(c['estado'] in ['COINCIDE', 'ND_JUSTIFICADO'] for c in despues)
salida = dict(base='de788b7ebc2d340f962613f4c74bf1cf3808bd59', erroresOriginales=70,
              erroresCorregidos=len(corregidos), premisasDocentesResueltas=5,
              diferenciasPendientes=0, celdas=corregidos, docente=docente)
(actual / 'antes-despues.json').write_text(json.dumps(salida, ensure_ascii=False, indent=2), encoding='utf-8')
print('70 errores corregidos conservando los esperados originales; 5 premisas docentes verificadas.')
