// GENERADO: no editar a mano.
// SHA-256: 9b3e07df1c6b7ee55ccc448975405099411a49629518fecb3726990d6fcaec6c
// Fuente: 20 JSON de docs/razones_financieras; LF normalizado en la huella.
export const ESPECIFICACION_RAZONES = {
  'actividad_ciclo_conversion_efectivo': {
    'schema_version': '2.0',
    'razon': {
      'id': 'actividad_ciclo_conversion_efectivo',
      'name': 'Ciclo de conversión de efectivo',
      'category': 'actividad',
      'formula_as_provided': 'Edad del inventario + Período de cobro − Período de pago',
      'unit': 'dias',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'subtract',
        'left': {
          'op': 'add',
          'operands': [
            {
              'op': 'ratio',
              'id': 'actividad_edad_promedio_inventario'
            },
            {
              'op': 'ratio',
              'id': 'actividad_periodo_promedio_cobro'
            }
          ]
        },
        'right': {
          'op': 'ratio',
          'id': 'actividad_periodo_promedio_pago'
        }
      },
      'notes': []
    },
    'razones_dependientes': [
      {
        'id': 'actividad_rotacion_inventarios',
        'name': 'Rotación de inventarios',
        'category': 'actividad',
        'formula_as_provided': 'Costo de ventas / Inventario promedio',
        'unit': 'veces',
        'period_mode': 'flow_with_average_balance',
        'formula': {
          'op': 'divide',
          'numerator': {
            'op': 'derived',
            'id': 'derived.cost_of_sales'
          },
          'denominator': {
            'op': 'average',
            'of': {
              'op': 'derived',
              'id': 'derived.inventory_total'
            }
          }
        },
        'notes': []
      },
      {
        'id': 'actividad_edad_promedio_inventario',
        'name': 'Edad promedio del inventario',
        'category': 'actividad',
        'formula_as_provided': '365 / Rotación de inventarios',
        'unit': 'dias',
        'period_mode': 'flow_with_average_balance',
        'formula': {
          'op': 'divide',
          'numerator': {
            'op': 'constant',
            'value': 365
          },
          'denominator': {
            'op': 'ratio',
            'id': 'actividad_rotacion_inventarios'
          }
        },
        'notes': []
      },
      {
        'id': 'actividad_rotacion_cuentas_por_cobrar',
        'name': 'Rotación de cuentas por cobrar',
        'category': 'actividad',
        'formula_as_provided': 'Ventas a crédito / CxC promedio',
        'unit': 'veces',
        'period_mode': 'flow_with_average_balance',
        'formula': {
          'op': 'divide',
          'numerator': {
            'op': 'account',
            'id': 'supp.credit_sales'
          },
          'denominator': {
            'op': 'average',
            'of': {
              'op': 'account',
              'id': 'bs.trade_receivables'
            }
          }
        },
        'notes': []
      },
      {
        'id': 'actividad_periodo_promedio_cobro',
        'name': 'Período promedio de cobro',
        'category': 'actividad',
        'formula_as_provided': '365 / Rotación de CxC',
        'unit': 'dias',
        'period_mode': 'flow_with_average_balance',
        'formula': {
          'op': 'divide',
          'numerator': {
            'op': 'constant',
            'value': 365
          },
          'denominator': {
            'op': 'ratio',
            'id': 'actividad_rotacion_cuentas_por_cobrar'
          }
        },
        'notes': []
      },
      {
        'id': 'actividad_rotacion_cuentas_por_pagar',
        'name': 'Rotación de cuentas por pagar',
        'category': 'actividad',
        'formula_as_provided': 'Compras a crédito / CxP promedio',
        'unit': 'veces',
        'period_mode': 'flow_with_average_balance',
        'formula': {
          'op': 'divide',
          'numerator': {
            'op': 'derived',
            'id': 'derived.credit_purchases'
          },
          'denominator': {
            'op': 'average',
            'of': {
              'op': 'account',
              'id': 'bs.trade_payables'
            }
          }
        },
        'notes': []
      },
      {
        'id': 'actividad_periodo_promedio_pago',
        'name': 'Período promedio de pago',
        'category': 'actividad',
        'formula_as_provided': '365 / Rotación de CxP',
        'unit': 'dias',
        'period_mode': 'flow_with_average_balance',
        'formula': {
          'op': 'divide',
          'numerator': {
            'op': 'constant',
            'value': 365
          },
          'denominator': {
            'op': 'ratio',
            'id': 'actividad_rotacion_cuentas_por_pagar'
          }
        },
        'notes': []
      }
    ],
    'derivados': [
      {
        'id': 'derived.cost_of_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.cost_of_sales_reported',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'cost_of_sales_components'
          }
        }
      },
      {
        'id': 'derived.inventory_total',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.inventory_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'inventory_components'
          }
        }
      },
      {
        'id': 'derived.credit_purchases',
        'kind': 'flow',
        'formula': {
          'op': 'subtract',
          'left': {
            'op': 'add',
            'operands': [
              {
                'op': 'account',
                'id': 'supp.supplier_payments'
              },
              {
                'op': 'account',
                'id': 'bs.trade_payables',
                'period': 'current'
              }
            ]
          },
          'right': {
            'op': 'account',
            'id': 'bs.trade_payables',
            'period': 'previous'
          }
        }
      }
    ],
    'conjuntos': {
      'cost_of_sales_components': [
        'is.merchandise_cost',
        'is.product_cost',
        'is.service_cost'
      ],
      'inventory_components': [
        'bs.inventory_merchandise',
        'bs.inventory_raw_materials',
        'bs.inventory_work_in_process',
        'bs.inventory_finished_goods'
      ]
    },
    'cuentas': [
      {
        'id': 'is.cost_of_sales_reported',
        'canonical_name': 'Costo de ventas reportado',
        'definition': 'Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Costo de ventas',
          'costo de los bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.merchandise_cost',
        'canonical_name': 'Costo de mercadería vendida',
        'definition': 'Coste de las mercaderías vendidas en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de ventas de mercaderías',
          'costo de bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.product_cost',
        'canonical_name': 'Costo de productos vendidos',
        'definition': 'Coste de producción de los productos vendidos en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de producción vendido',
          'costo de productos vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de productos vendidos» (is.product_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_cost',
        'canonical_name': 'Costo de servicios',
        'definition': 'Coste directo de los servicios prestados en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costos de servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.trade_receivables',
        'canonical_name': 'Cuentas por cobrar comerciales',
        'definition': 'Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxC',
          'clientes',
          'cuentas por cobrar a clientes',
          'deudores comerciales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_total',
        'canonical_name': 'Inventario total',
        'definition': 'Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Inventario',
          'existencias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_merchandise',
        'canonical_name': 'Inventario de mercaderías',
        'definition': 'Bienes adquiridos para revender sin transformación; mide su coste de adquisición.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mercaderías',
          'mercancías',
          'inventario para la venta'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"Inventories are measured at the lower of cost and net realisable value". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de mercaderías» (bs.inventory_merchandise) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_raw_materials',
        'canonical_name': 'Inventario de materias primas',
        'definition': 'Materiales adquiridos para la producción que aún no se han transformado.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Materias primas',
          'materiales en almacén para producción'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de materias primas» (bs.inventory_raw_materials) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_work_in_process',
        'canonical_name': 'Inventario de productos en proceso',
        'definition': 'Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Producción en proceso',
          'productos en proceso'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"costs of conversion (direct labour and production overhead)". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos en proceso» (bs.inventory_work_in_process) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_finished_goods',
        'canonical_name': 'Inventario de productos terminados',
        'definition': 'Producto terminado listo para la venta; se lleva a costo de ventas al venderse.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Productos terminados',
          'bienes terminados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos terminados» (bs.inventory_finished_goods) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.trade_payables',
        'canonical_name': 'Cuentas por pagar comerciales',
        'definition': 'Obligaciones con proveedores por compras a crédito; su saldo crece con las compras y disminuye con los pagos.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxP',
          'proveedores',
          'cuentas por pagar a proveedores'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'supp.credit_sales',
        'canonical_name': 'Ventas a crédito',
        'definition': 'Ventas cobrables a crédito del periodo actual; es el numerador de la rotación de CxC. Nunca se aproxima con ventas netas ni totales (D8): si falta, la razón es N/D.',
        'statement': 'supplemental_data',
        'classification': 'suplementario',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'requires_data',
        'synonyms': [
          'Ventas a crédito del periodo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Dato suplementario del caso (D8): ventas a crédito reportadas solo por el caso; sin fuente externa. Se usa con requires_data y nunca se iguala a ventas netas.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'supp.supplier_payments',
        'canonical_name': 'Pagos a proveedores',
        'definition': 'Pagos efectuados a proveedores en el periodo actual; forma con la CxP el numerador de compras a crédito (D10). Si falta, la razón es N/D con `missing_required_account_data`.',
        'statement': 'supplemental_data',
        'classification': 'suplementario',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'requires_data',
        'synonyms': [
          'Pagos a proveedores del periodo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Dato suplementario del caso (D10): pagos a proveedores reportados solo por el caso; sin fuente externa. Se usa con requires_data para derivar compras a crédito.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'actividad_edad_promedio_inventario': {
    'schema_version': '2.0',
    'razon': {
      'id': 'actividad_edad_promedio_inventario',
      'name': 'Edad promedio del inventario',
      'category': 'actividad',
      'formula_as_provided': '365 / Rotación de inventarios',
      'unit': 'dias',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'constant',
          'value': 365
        },
        'denominator': {
          'op': 'ratio',
          'id': 'actividad_rotacion_inventarios'
        }
      },
      'notes': [
        'DIFERENCIA_CONOCIDA_PROFESOR: Edad promedio del inventario 2024 — profesor: 130.60; este trabajo: 125.57 — motivo: D1: promedio.'
      ]
    },
    'razones_dependientes': [
      {
        'id': 'actividad_rotacion_inventarios',
        'name': 'Rotación de inventarios',
        'category': 'actividad',
        'formula_as_provided': 'Costo de ventas / Inventario promedio',
        'unit': 'veces',
        'period_mode': 'flow_with_average_balance',
        'formula': {
          'op': 'divide',
          'numerator': {
            'op': 'derived',
            'id': 'derived.cost_of_sales'
          },
          'denominator': {
            'op': 'average',
            'of': {
              'op': 'derived',
              'id': 'derived.inventory_total'
            }
          }
        },
        'notes': []
      }
    ],
    'derivados': [
      {
        'id': 'derived.cost_of_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.cost_of_sales_reported',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'cost_of_sales_components'
          }
        }
      },
      {
        'id': 'derived.inventory_total',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.inventory_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'inventory_components'
          }
        }
      }
    ],
    'conjuntos': {
      'cost_of_sales_components': [
        'is.merchandise_cost',
        'is.product_cost',
        'is.service_cost'
      ],
      'inventory_components': [
        'bs.inventory_merchandise',
        'bs.inventory_raw_materials',
        'bs.inventory_work_in_process',
        'bs.inventory_finished_goods'
      ]
    },
    'cuentas': [
      {
        'id': 'is.cost_of_sales_reported',
        'canonical_name': 'Costo de ventas reportado',
        'definition': 'Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Costo de ventas',
          'costo de los bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.merchandise_cost',
        'canonical_name': 'Costo de mercadería vendida',
        'definition': 'Coste de las mercaderías vendidas en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de ventas de mercaderías',
          'costo de bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.product_cost',
        'canonical_name': 'Costo de productos vendidos',
        'definition': 'Coste de producción de los productos vendidos en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de producción vendido',
          'costo de productos vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de productos vendidos» (is.product_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_cost',
        'canonical_name': 'Costo de servicios',
        'definition': 'Coste directo de los servicios prestados en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costos de servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_total',
        'canonical_name': 'Inventario total',
        'definition': 'Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Inventario',
          'existencias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_merchandise',
        'canonical_name': 'Inventario de mercaderías',
        'definition': 'Bienes adquiridos para revender sin transformación; mide su coste de adquisición.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mercaderías',
          'mercancías',
          'inventario para la venta'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"Inventories are measured at the lower of cost and net realisable value". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de mercaderías» (bs.inventory_merchandise) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_raw_materials',
        'canonical_name': 'Inventario de materias primas',
        'definition': 'Materiales adquiridos para la producción que aún no se han transformado.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Materias primas',
          'materiales en almacén para producción'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de materias primas» (bs.inventory_raw_materials) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_work_in_process',
        'canonical_name': 'Inventario de productos en proceso',
        'definition': 'Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Producción en proceso',
          'productos en proceso'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"costs of conversion (direct labour and production overhead)". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos en proceso» (bs.inventory_work_in_process) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_finished_goods',
        'canonical_name': 'Inventario de productos terminados',
        'definition': 'Producto terminado listo para la venta; se lleva a costo de ventas al venderse.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Productos terminados',
          'bienes terminados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos terminados» (bs.inventory_finished_goods) (D-035).'
            }
          ]
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'actividad_periodo_promedio_cobro': {
    'schema_version': '2.0',
    'razon': {
      'id': 'actividad_periodo_promedio_cobro',
      'name': 'Período promedio de cobro',
      'category': 'actividad',
      'formula_as_provided': '365 / Rotación de CxC',
      'unit': 'dias',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'constant',
          'value': 365
        },
        'denominator': {
          'op': 'ratio',
          'id': 'actividad_rotacion_cuentas_por_cobrar'
        }
      },
      'notes': [
        'DIFERENCIA_CONOCIDA_PROFESOR: Período promedio de cobro 2023 y 2024 — profesor: 51.53 y 53.56; este trabajo: N/D — motivo: D8: sin ventas a crédito.'
      ]
    },
    'razones_dependientes': [
      {
        'id': 'actividad_rotacion_cuentas_por_cobrar',
        'name': 'Rotación de cuentas por cobrar',
        'category': 'actividad',
        'formula_as_provided': 'Ventas a crédito / CxC promedio',
        'unit': 'veces',
        'period_mode': 'flow_with_average_balance',
        'formula': {
          'op': 'divide',
          'numerator': {
            'op': 'account',
            'id': 'supp.credit_sales'
          },
          'denominator': {
            'op': 'average',
            'of': {
              'op': 'account',
              'id': 'bs.trade_receivables'
            }
          }
        },
        'notes': []
      }
    ],
    'derivados': [],
    'conjuntos': {},
    'cuentas': [
      {
        'id': 'bs.trade_receivables',
        'canonical_name': 'Cuentas por cobrar comerciales',
        'definition': 'Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxC',
          'clientes',
          'cuentas por cobrar a clientes',
          'deudores comerciales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'supp.credit_sales',
        'canonical_name': 'Ventas a crédito',
        'definition': 'Ventas cobrables a crédito del periodo actual; es el numerador de la rotación de CxC. Nunca se aproxima con ventas netas ni totales (D8): si falta, la razón es N/D.',
        'statement': 'supplemental_data',
        'classification': 'suplementario',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'requires_data',
        'synonyms': [
          'Ventas a crédito del periodo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Dato suplementario del caso (D8): ventas a crédito reportadas solo por el caso; sin fuente externa. Se usa con requires_data y nunca se iguala a ventas netas.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'actividad_periodo_promedio_pago': {
    'schema_version': '2.0',
    'razon': {
      'id': 'actividad_periodo_promedio_pago',
      'name': 'Período promedio de pago',
      'category': 'actividad',
      'formula_as_provided': '365 / Rotación de CxP',
      'unit': 'dias',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'constant',
          'value': 365
        },
        'denominator': {
          'op': 'ratio',
          'id': 'actividad_rotacion_cuentas_por_pagar'
        }
      },
      'notes': []
    },
    'razones_dependientes': [
      {
        'id': 'actividad_rotacion_cuentas_por_pagar',
        'name': 'Rotación de cuentas por pagar',
        'category': 'actividad',
        'formula_as_provided': 'Compras a crédito / CxP promedio',
        'unit': 'veces',
        'period_mode': 'flow_with_average_balance',
        'formula': {
          'op': 'divide',
          'numerator': {
            'op': 'derived',
            'id': 'derived.credit_purchases'
          },
          'denominator': {
            'op': 'average',
            'of': {
              'op': 'account',
              'id': 'bs.trade_payables'
            }
          }
        },
        'notes': []
      }
    ],
    'derivados': [
      {
        'id': 'derived.credit_purchases',
        'kind': 'flow',
        'formula': {
          'op': 'subtract',
          'left': {
            'op': 'add',
            'operands': [
              {
                'op': 'account',
                'id': 'supp.supplier_payments'
              },
              {
                'op': 'account',
                'id': 'bs.trade_payables',
                'period': 'current'
              }
            ]
          },
          'right': {
            'op': 'account',
            'id': 'bs.trade_payables',
            'period': 'previous'
          }
        }
      }
    ],
    'conjuntos': {},
    'cuentas': [
      {
        'id': 'bs.trade_payables',
        'canonical_name': 'Cuentas por pagar comerciales',
        'definition': 'Obligaciones con proveedores por compras a crédito; su saldo crece con las compras y disminuye con los pagos.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxP',
          'proveedores',
          'cuentas por pagar a proveedores'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'supp.supplier_payments',
        'canonical_name': 'Pagos a proveedores',
        'definition': 'Pagos efectuados a proveedores en el periodo actual; forma con la CxP el numerador de compras a crédito (D10). Si falta, la razón es N/D con `missing_required_account_data`.',
        'statement': 'supplemental_data',
        'classification': 'suplementario',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'requires_data',
        'synonyms': [
          'Pagos a proveedores del periodo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Dato suplementario del caso (D10): pagos a proveedores reportados solo por el caso; sin fuente externa. Se usa con requires_data para derivar compras a crédito.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'actividad_rotacion_activos_fijos': {
    'schema_version': '2.0',
    'razon': {
      'id': 'actividad_rotacion_activos_fijos',
      'name': 'Rotación de activos fijos',
      'category': 'actividad',
      'formula_as_provided': 'Ventas netas / Activos fijos netos promedio',
      'unit': 'veces',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.net_sales'
        },
        'denominator': {
          'op': 'average',
          'of': {
            'op': 'derived',
            'id': 'derived.fixed_assets_net'
          }
        }
      },
      'notes': [
        'DIFERENCIA_CONOCIDA_PROFESOR: Rotación de activos fijos 2024 — profesor: 2.22; este trabajo: 2.18 — motivo: D1: promedio.'
      ]
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.gross_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.sales_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'gross_sales_components'
          }
        }
      },
      {
        'id': 'derived.sales_deductions',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'sales_deduction_components'
        }
      },
      {
        'id': 'derived.net_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_sales_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.gross_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.sales_deductions'
            }
          }
        }
      },
      {
        'id': 'derived.fixed_assets_net',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.fixed_assets_net_total',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'sum_accounts',
                'account_set': 'ppe_components'
              },
              {
                'op': 'account',
                'id': 'bs.accumulated_depreciation'
              }
            ]
          }
        }
      }
    ],
    'conjuntos': {
      'gross_sales_components': [
        'is.product_sales',
        'is.service_revenue',
        'is.other_sales_revenue'
      ],
      'sales_deduction_components': [
        'is.sales_returns',
        'is.sales_discounts',
        'is.sales_allowances'
      ],
      'ppe_components': [
        'bs.ppe_land',
        'bs.ppe_buildings',
        'bs.ppe_machinery',
        'bs.ppe_vehicles',
        'bs.ppe_furniture',
        'bs.ppe_other'
      ]
    },
    'cuentas': [
      {
        'id': 'is.sales_total',
        'canonical_name': 'Ventas totales',
        'definition': 'Total de ingresos por ventas sin desglose de componentes (R5); se reconoce al entregar los bienes o prestar los servicios.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas',
          'ventas ordinarias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.product_sales',
        'canonical_name': 'Ventas de productos',
        'definition': 'Ingresos por venta de bienes; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de mercaderías',
          'ventas de bienes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ventas de productos» (is.product_sales) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_revenue',
        'canonical_name': 'Ingresos por servicios',
        'definition': 'Ingresos por servicios prestados; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de servicios',
          'ingresos por servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ingresos por servicios» (is.service_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.other_sales_revenue',
        'canonical_name': 'Otras ventas ordinarias',
        'definition': 'Ventas operativas menores sin cuenta específica; solo si efectivamente son ventas.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otras ventas',
          'otras ventas operativas si efectivamente son ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Otras ventas ordinarias» (is.other_sales_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.sales_returns',
        'canonical_name': 'Devoluciones sobre ventas',
        'definition': 'Contra-ingreso por bienes devueltos por clientes; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Devoluciones de ventas',
          'ventas devueltas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_discounts',
        'canonical_name': 'Descuentos sobre ventas',
        'definition': 'Contra-ingreso por descuentos concedidos; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Descuentos concedidos sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_allowances',
        'canonical_name': 'Rebajas sobre ventas',
        'definition': 'Contra-ingreso por rebajas y bonificaciones; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Rebajas y bonificaciones sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.net_sales_reported',
        'canonical_name': 'Ventas netas reportadas',
        'definition': 'Ventas netas de devoluciones, descuentos y rebajas, reportadas directamente por el ejercicio.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas netas',
          'ventas netas totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.fixed_assets_net_total',
        'canonical_name': 'Total de activos fijos netos',
        'definition': 'Subtotal neto de activos fijos reportado por el ejercicio; si existe, sustituye a la suma de componentes con depreciación (D3).',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Activo fijo neto',
          'propiedad planta y equipo neto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Total de activos fijos netos» (bs.fixed_assets_net_total) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_land',
        'canonical_name': 'Terrenos',
        'definition': 'Terrenos ocupados o destinados a la operación; no se deprecian.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Terrenos de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Terrenos» (bs.ppe_land) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_buildings',
        'canonical_name': 'Edificios e instalaciones',
        'definition': 'Construcciones usadas en la operación; su coste se deprecia a lo largo de su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Edificios',
          'construcciones de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Edificios e instalaciones» (bs.ppe_buildings) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_machinery',
        'canonical_name': 'Maquinaria y equipo',
        'definition': 'Maquinaria y equipo utilizados en la producción o la operación; se deprecian por uso o por tiempo.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Maquinaria',
          'equipo productivo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Equipos»: el detalle de la cuenta es incierto, pero su clasificación en activo fijo es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Maquinaria y equipo» (bs.ppe_machinery).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_vehicles',
        'canonical_name': 'Vehículos',
        'definition': 'Vehículos usados en la operación; se deprecian a lo largo de su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Equipo de transporte',
          'vehículos de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Vehículos» (bs.ppe_vehicles) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_furniture',
        'canonical_name': 'Mobiliario y equipo de oficina',
        'definition': 'Mobiliario y equipo de oficina en servicio; se deprecian por su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mobiliario',
          'muebles y enseres',
          'equipo de oficina'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Mobiliario y equipo de oficina» (bs.ppe_furniture) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_other',
        'canonical_name': 'Otros activos fijos tangibles',
        'definition': 'Bienes tangibles de la operación sin una cuenta específica; se deprecian según su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Propiedad, planta y equipo',
          'otros activos fijos tangibles'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Otros activos fijos tangibles» (bs.ppe_other) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.accumulated_depreciation',
        'canonical_name': 'Depreciación acumulada',
        'definition': 'Cuenta correctora que acumula el desgaste reconocido de los activos fijos; llega negativa y se suma con su signo (D13).',
        'statement': 'balance_general',
        'classification': 'correctora_activo',
        'account_role': 'contra_account',
        'normal_balance': 'acreedor',
        'value_semantics': 'contra_asset',
        'absence_policy': 'requires_data',
        'synonyms': [
          'Depreciación acumulada de activos fijos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'actividad_rotacion_activos_totales': {
    'schema_version': '2.0',
    'razon': {
      'id': 'actividad_rotacion_activos_totales',
      'name': 'Rotación de activos totales',
      'category': 'actividad',
      'formula_as_provided': 'Ventas netas / Activos totales promedio',
      'unit': 'veces',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.net_sales'
        },
        'denominator': {
          'op': 'average',
          'of': {
            'op': 'derived',
            'id': 'derived.total_assets'
          }
        }
      },
      'notes': [
        'DIFERENCIA_CONOCIDA_PROFESOR: Rotación de activos totales 2024 — profesor: 1.11; este trabajo: 1.13 — motivo: D1: promedio.'
      ]
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.gross_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.sales_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'gross_sales_components'
          }
        }
      },
      {
        'id': 'derived.sales_deductions',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'sales_deduction_components'
        }
      },
      {
        'id': 'derived.net_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_sales_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.gross_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.sales_deductions'
            }
          }
        }
      },
      {
        'id': 'derived.inventory_total',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.inventory_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'inventory_components'
          }
        }
      },
      {
        'id': 'derived.current_assets',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_assets_total',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'sum_accounts',
                'account_set': 'current_assets_excluding_inventory'
              },
              {
                'op': 'derived',
                'id': 'derived.inventory_total'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.fixed_assets_net',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.fixed_assets_net_total',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'sum_accounts',
                'account_set': 'ppe_components'
              },
              {
                'op': 'account',
                'id': 'bs.accumulated_depreciation'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.total_assets',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.total_assets',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'derived',
                'id': 'derived.current_assets'
              },
              {
                'op': 'derived',
                'id': 'derived.fixed_assets_net'
              },
              {
                'op': 'account',
                'id': 'bs.intangible_assets'
              },
              {
                'op': 'sum_accounts',
                'account_set': 'other_noncurrent_assets_components'
              }
            ]
          }
        }
      }
    ],
    'conjuntos': {
      'gross_sales_components': [
        'is.product_sales',
        'is.service_revenue',
        'is.other_sales_revenue'
      ],
      'sales_deduction_components': [
        'is.sales_returns',
        'is.sales_discounts',
        'is.sales_allowances'
      ],
      'current_assets_excluding_inventory': [
        'bs.cash_and_equivalents',
        'bs.short_term_investments',
        'bs.trade_receivables',
        'bs.other_current_receivables',
        'bs.prepaid_expenses',
        'bs.other_current_assets'
      ],
      'inventory_components': [
        'bs.inventory_merchandise',
        'bs.inventory_raw_materials',
        'bs.inventory_work_in_process',
        'bs.inventory_finished_goods'
      ],
      'ppe_components': [
        'bs.ppe_land',
        'bs.ppe_buildings',
        'bs.ppe_machinery',
        'bs.ppe_vehicles',
        'bs.ppe_furniture',
        'bs.ppe_other'
      ],
      'other_noncurrent_assets_components': [
        'bs.long_term_investments',
        'bs.other_noncurrent_assets'
      ]
    },
    'cuentas': [
      {
        'id': 'is.sales_total',
        'canonical_name': 'Ventas totales',
        'definition': 'Total de ingresos por ventas sin desglose de componentes (R5); se reconoce al entregar los bienes o prestar los servicios.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas',
          'ventas ordinarias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.product_sales',
        'canonical_name': 'Ventas de productos',
        'definition': 'Ingresos por venta de bienes; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de mercaderías',
          'ventas de bienes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ventas de productos» (is.product_sales) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_revenue',
        'canonical_name': 'Ingresos por servicios',
        'definition': 'Ingresos por servicios prestados; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de servicios',
          'ingresos por servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ingresos por servicios» (is.service_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.other_sales_revenue',
        'canonical_name': 'Otras ventas ordinarias',
        'definition': 'Ventas operativas menores sin cuenta específica; solo si efectivamente son ventas.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otras ventas',
          'otras ventas operativas si efectivamente son ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Otras ventas ordinarias» (is.other_sales_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.sales_returns',
        'canonical_name': 'Devoluciones sobre ventas',
        'definition': 'Contra-ingreso por bienes devueltos por clientes; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Devoluciones de ventas',
          'ventas devueltas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_discounts',
        'canonical_name': 'Descuentos sobre ventas',
        'definition': 'Contra-ingreso por descuentos concedidos; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Descuentos concedidos sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_allowances',
        'canonical_name': 'Rebajas sobre ventas',
        'definition': 'Contra-ingreso por rebajas y bonificaciones; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Rebajas y bonificaciones sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.net_sales_reported',
        'canonical_name': 'Ventas netas reportadas',
        'definition': 'Ventas netas de devoluciones, descuentos y rebajas, reportadas directamente por el ejercicio.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas netas',
          'ventas netas totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_assets_total',
        'canonical_name': 'Total de activos corrientes',
        'definition': 'Subtotal de activos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total activo corriente',
          'total activo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.cash_and_equivalents',
        'canonical_name': 'Efectivo y equivalentes',
        'definition': 'Medios de pago disponibles y equivalentes de efectivo; su saldo crece con cobros y disminuye con pagos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Efectivo',
          'caja',
          'bancos',
          'caja y bancos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_investments',
        'canonical_name': 'Inversiones de corto plazo',
        'definition': 'Valores negociables u otros instrumentos con vencimiento o disponibilidad dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Inversiones temporales',
          'valores negociables de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 7 Statement of Cash Flows',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/',
              'source_type': 'accounting_standard',
              'supports': '"Cash equivalents are short-term, highly liquid investments". Frase textual de IAS 7 Statement of Cash Flows, abierto el 2026-10-15; confirma la definición de «Inversiones de corto plazo» (bs.short_term_investments) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.trade_receivables',
        'canonical_name': 'Cuentas por cobrar comerciales',
        'definition': 'Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxC',
          'clientes',
          'cuentas por cobrar a clientes',
          'deudores comerciales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_receivables',
        'canonical_name': 'Otras cuentas por cobrar corrientes',
        'definition': 'Cobros distintos de las ventas comerciales con recuperación dentro del corto plazo (anticipos, deudores varios).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudores varios corrientes',
          'otras cuentas por cobrar de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_total',
        'canonical_name': 'Inventario total',
        'definition': 'Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Inventario',
          'existencias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_merchandise',
        'canonical_name': 'Inventario de mercaderías',
        'definition': 'Bienes adquiridos para revender sin transformación; mide su coste de adquisición.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mercaderías',
          'mercancías',
          'inventario para la venta'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"Inventories are measured at the lower of cost and net realisable value". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de mercaderías» (bs.inventory_merchandise) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_raw_materials',
        'canonical_name': 'Inventario de materias primas',
        'definition': 'Materiales adquiridos para la producción que aún no se han transformado.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Materias primas',
          'materiales en almacén para producción'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de materias primas» (bs.inventory_raw_materials) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_work_in_process',
        'canonical_name': 'Inventario de productos en proceso',
        'definition': 'Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Producción en proceso',
          'productos en proceso'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"costs of conversion (direct labour and production overhead)". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos en proceso» (bs.inventory_work_in_process) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_finished_goods',
        'canonical_name': 'Inventario de productos terminados',
        'definition': 'Producto terminado listo para la venta; se lleva a costo de ventas al venderse.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Productos terminados',
          'bienes terminados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos terminados» (bs.inventory_finished_goods) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.prepaid_expenses',
        'canonical_name': 'Gastos pagados por anticipado',
        'definition': 'Pagos realizados por adelantado que se consumen como gasto en periodos futuros (seguros, rentas).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Pagos anticipados',
          'seguros pagados por anticipado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_assets',
        'canonical_name': 'Otros activos corrientes',
        'definition': 'Activos corrientes que no tienen una cuenta específica (anticipos, impuestos a favor de corto plazo).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros activos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.fixed_assets_net_total',
        'canonical_name': 'Total de activos fijos netos',
        'definition': 'Subtotal neto de activos fijos reportado por el ejercicio; si existe, sustituye a la suma de componentes con depreciación (D3).',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Activo fijo neto',
          'propiedad planta y equipo neto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Total de activos fijos netos» (bs.fixed_assets_net_total) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_land',
        'canonical_name': 'Terrenos',
        'definition': 'Terrenos ocupados o destinados a la operación; no se deprecian.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Terrenos de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Terrenos» (bs.ppe_land) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_buildings',
        'canonical_name': 'Edificios e instalaciones',
        'definition': 'Construcciones usadas en la operación; su coste se deprecia a lo largo de su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Edificios',
          'construcciones de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Edificios e instalaciones» (bs.ppe_buildings) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_machinery',
        'canonical_name': 'Maquinaria y equipo',
        'definition': 'Maquinaria y equipo utilizados en la producción o la operación; se deprecian por uso o por tiempo.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Maquinaria',
          'equipo productivo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Equipos»: el detalle de la cuenta es incierto, pero su clasificación en activo fijo es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Maquinaria y equipo» (bs.ppe_machinery).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_vehicles',
        'canonical_name': 'Vehículos',
        'definition': 'Vehículos usados en la operación; se deprecian a lo largo de su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Equipo de transporte',
          'vehículos de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Vehículos» (bs.ppe_vehicles) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_furniture',
        'canonical_name': 'Mobiliario y equipo de oficina',
        'definition': 'Mobiliario y equipo de oficina en servicio; se deprecian por su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mobiliario',
          'muebles y enseres',
          'equipo de oficina'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Mobiliario y equipo de oficina» (bs.ppe_furniture) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_other',
        'canonical_name': 'Otros activos fijos tangibles',
        'definition': 'Bienes tangibles de la operación sin una cuenta específica; se deprecian según su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Propiedad, planta y equipo',
          'otros activos fijos tangibles'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Otros activos fijos tangibles» (bs.ppe_other) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.accumulated_depreciation',
        'canonical_name': 'Depreciación acumulada',
        'definition': 'Cuenta correctora que acumula el desgaste reconocido de los activos fijos; llega negativa y se suma con su signo (D13).',
        'statement': 'balance_general',
        'classification': 'correctora_activo',
        'account_role': 'contra_account',
        'normal_balance': 'acreedor',
        'value_semantics': 'contra_asset',
        'absence_policy': 'requires_data',
        'synonyms': [
          'Depreciación acumulada de activos fijos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.intangible_assets',
        'canonical_name': 'Activos intangibles',
        'definition': 'Activos no monetarios no financieros identificables sin sustancia física (software, patentes); se amortizan. Si no se reportan, aportan cero a activos totales (D12).',
        'statement': 'balance_general',
        'classification': 'activo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Intangibles',
          'software capitalizado',
          'patentes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 38 Intangible Assets',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/',
              'source_type': 'accounting_standard',
              'supports': '"An intangible asset is an identifiable non-monetary asset without physical substance". Frase textual de IAS 38 Intangible Assets, abierto el 2026-10-15; confirma la definición de «Activos intangibles» (bs.intangible_assets) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.long_term_investments',
        'canonical_name': 'Inversiones de largo plazo',
        'definition': 'Inversiones con disponibilidad o recuperación más allá del corto plazo.',
        'statement': 'balance_general',
        'classification': 'activo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Inversiones permanentes',
          'inversiones no corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_noncurrent_assets',
        'canonical_name': 'Otros activos no corrientes',
        'definition': 'Activos no corrientes sin cuenta específica (derechos a largo plazo, anticipos a largo plazo).',
        'statement': 'balance_general',
        'classification': 'activo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros activos a largo plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.total_assets',
        'canonical_name': 'Total de activos',
        'definition': 'Total de activos reportado por el ejercicio; si existe, sustituye al cálculo activo corriente + activos fijos netos + intangibles (D4).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total activo',
          'activo total',
          'total de recursos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'actividad_rotacion_cuentas_por_cobrar': {
    'schema_version': '2.0',
    'razon': {
      'id': 'actividad_rotacion_cuentas_por_cobrar',
      'name': 'Rotación de cuentas por cobrar',
      'category': 'actividad',
      'formula_as_provided': 'Ventas a crédito / CxC promedio',
      'unit': 'veces',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'account',
          'id': 'supp.credit_sales'
        },
        'denominator': {
          'op': 'average',
          'of': {
            'op': 'account',
            'id': 'bs.trade_receivables'
          }
        }
      },
      'notes': [
        'DIFERENCIA_CONOCIDA_PROFESOR: Rotación de cuentas por cobrar 2023 y 2024 — profesor: 7.08 y 6.81; este trabajo: N/D — motivo: D8: sin ventas a crédito.'
      ]
    },
    'razones_dependientes': [],
    'derivados': [],
    'conjuntos': {},
    'cuentas': [
      {
        'id': 'bs.trade_receivables',
        'canonical_name': 'Cuentas por cobrar comerciales',
        'definition': 'Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxC',
          'clientes',
          'cuentas por cobrar a clientes',
          'deudores comerciales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'supp.credit_sales',
        'canonical_name': 'Ventas a crédito',
        'definition': 'Ventas cobrables a crédito del periodo actual; es el numerador de la rotación de CxC. Nunca se aproxima con ventas netas ni totales (D8): si falta, la razón es N/D.',
        'statement': 'supplemental_data',
        'classification': 'suplementario',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'requires_data',
        'synonyms': [
          'Ventas a crédito del periodo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Dato suplementario del caso (D8): ventas a crédito reportadas solo por el caso; sin fuente externa. Se usa con requires_data y nunca se iguala a ventas netas.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'actividad_rotacion_cuentas_por_pagar': {
    'schema_version': '2.0',
    'razon': {
      'id': 'actividad_rotacion_cuentas_por_pagar',
      'name': 'Rotación de cuentas por pagar',
      'category': 'actividad',
      'formula_as_provided': 'Compras a crédito / CxP promedio',
      'unit': 'veces',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.credit_purchases'
        },
        'denominator': {
          'op': 'average',
          'of': {
            'op': 'account',
            'id': 'bs.trade_payables'
          }
        }
      },
      'notes': []
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.credit_purchases',
        'kind': 'flow',
        'formula': {
          'op': 'subtract',
          'left': {
            'op': 'add',
            'operands': [
              {
                'op': 'account',
                'id': 'supp.supplier_payments'
              },
              {
                'op': 'account',
                'id': 'bs.trade_payables',
                'period': 'current'
              }
            ]
          },
          'right': {
            'op': 'account',
            'id': 'bs.trade_payables',
            'period': 'previous'
          }
        }
      }
    ],
    'conjuntos': {},
    'cuentas': [
      {
        'id': 'bs.trade_payables',
        'canonical_name': 'Cuentas por pagar comerciales',
        'definition': 'Obligaciones con proveedores por compras a crédito; su saldo crece con las compras y disminuye con los pagos.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxP',
          'proveedores',
          'cuentas por pagar a proveedores'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'supp.supplier_payments',
        'canonical_name': 'Pagos a proveedores',
        'definition': 'Pagos efectuados a proveedores en el periodo actual; forma con la CxP el numerador de compras a crédito (D10). Si falta, la razón es N/D con `missing_required_account_data`.',
        'statement': 'supplemental_data',
        'classification': 'suplementario',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'requires_data',
        'synonyms': [
          'Pagos a proveedores del periodo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Dato suplementario del caso (D10): pagos a proveedores reportados solo por el caso; sin fuente externa. Se usa con requires_data para derivar compras a crédito.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'actividad_rotacion_inventarios': {
    'schema_version': '2.0',
    'razon': {
      'id': 'actividad_rotacion_inventarios',
      'name': 'Rotación de inventarios',
      'category': 'actividad',
      'formula_as_provided': 'Costo de ventas / Inventario promedio',
      'unit': 'veces',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.cost_of_sales'
        },
        'denominator': {
          'op': 'average',
          'of': {
            'op': 'derived',
            'id': 'derived.inventory_total'
          }
        }
      },
      'notes': [
        'DIFERENCIA_CONOCIDA_PROFESOR: Rotación de inventarios 2024 — profesor: 2.79; este trabajo: 2.91 — motivo: D1: promedio.'
      ]
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.cost_of_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.cost_of_sales_reported',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'cost_of_sales_components'
          }
        }
      },
      {
        'id': 'derived.inventory_total',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.inventory_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'inventory_components'
          }
        }
      }
    ],
    'conjuntos': {
      'cost_of_sales_components': [
        'is.merchandise_cost',
        'is.product_cost',
        'is.service_cost'
      ],
      'inventory_components': [
        'bs.inventory_merchandise',
        'bs.inventory_raw_materials',
        'bs.inventory_work_in_process',
        'bs.inventory_finished_goods'
      ]
    },
    'cuentas': [
      {
        'id': 'is.cost_of_sales_reported',
        'canonical_name': 'Costo de ventas reportado',
        'definition': 'Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Costo de ventas',
          'costo de los bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.merchandise_cost',
        'canonical_name': 'Costo de mercadería vendida',
        'definition': 'Coste de las mercaderías vendidas en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de ventas de mercaderías',
          'costo de bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.product_cost',
        'canonical_name': 'Costo de productos vendidos',
        'definition': 'Coste de producción de los productos vendidos en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de producción vendido',
          'costo de productos vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de productos vendidos» (is.product_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_cost',
        'canonical_name': 'Costo de servicios',
        'definition': 'Coste directo de los servicios prestados en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costos de servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_total',
        'canonical_name': 'Inventario total',
        'definition': 'Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Inventario',
          'existencias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_merchandise',
        'canonical_name': 'Inventario de mercaderías',
        'definition': 'Bienes adquiridos para revender sin transformación; mide su coste de adquisición.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mercaderías',
          'mercancías',
          'inventario para la venta'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"Inventories are measured at the lower of cost and net realisable value". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de mercaderías» (bs.inventory_merchandise) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_raw_materials',
        'canonical_name': 'Inventario de materias primas',
        'definition': 'Materiales adquiridos para la producción que aún no se han transformado.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Materias primas',
          'materiales en almacén para producción'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de materias primas» (bs.inventory_raw_materials) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_work_in_process',
        'canonical_name': 'Inventario de productos en proceso',
        'definition': 'Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Producción en proceso',
          'productos en proceso'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"costs of conversion (direct labour and production overhead)". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos en proceso» (bs.inventory_work_in_process) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_finished_goods',
        'canonical_name': 'Inventario de productos terminados',
        'definition': 'Producto terminado listo para la venta; se lleva a costo de ventas al venderse.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Productos terminados',
          'bienes terminados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos terminados» (bs.inventory_finished_goods) (D-035).'
            }
          ]
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'endeudamiento_cobertura_interes': {
    'schema_version': '2.0',
    'razon': {
      'id': 'endeudamiento_cobertura_interes',
      'name': 'Cobertura de interés',
      'category': 'endeudamiento',
      'formula_as_provided': 'Utilidad operativa / Gastos por intereses',
      'unit': 'veces',
      'period_mode': 'point_in_time',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.operating_profit'
        },
        'denominator': {
          'op': 'account',
          'id': 'is.interest_expense'
        }
      },
      'notes': []
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.gross_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.sales_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'gross_sales_components'
          }
        }
      },
      {
        'id': 'derived.sales_deductions',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'sales_deduction_components'
        }
      },
      {
        'id': 'derived.net_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_sales_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.gross_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.sales_deductions'
            }
          }
        }
      },
      {
        'id': 'derived.cost_of_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.cost_of_sales_reported',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'cost_of_sales_components'
          }
        }
      },
      {
        'id': 'derived.gross_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.gross_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.net_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.cost_of_sales'
            }
          }
        }
      },
      {
        'id': 'derived.operating_expenses',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'operating_expense_components'
        }
      },
      {
        'id': 'derived.operating_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.operating_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'add',
              'operands': [
                {
                  'op': 'derived',
                  'id': 'derived.gross_profit'
                },
                {
                  'op': 'account',
                  'id': 'is.other_operating_income'
                }
              ]
            },
            'right': {
              'op': 'derived',
              'id': 'derived.operating_expenses'
            }
          }
        }
      }
    ],
    'conjuntos': {
      'gross_sales_components': [
        'is.product_sales',
        'is.service_revenue',
        'is.other_sales_revenue'
      ],
      'sales_deduction_components': [
        'is.sales_returns',
        'is.sales_discounts',
        'is.sales_allowances'
      ],
      'cost_of_sales_components': [
        'is.merchandise_cost',
        'is.product_cost',
        'is.service_cost'
      ],
      'operating_expense_components': [
        'is.selling_expenses',
        'is.administrative_expenses',
        'is.operating_depreciation',
        'is.operating_amortization',
        'is.other_operating_expenses'
      ]
    },
    'cuentas': [
      {
        'id': 'is.sales_total',
        'canonical_name': 'Ventas totales',
        'definition': 'Total de ingresos por ventas sin desglose de componentes (R5); se reconoce al entregar los bienes o prestar los servicios.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas',
          'ventas ordinarias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.product_sales',
        'canonical_name': 'Ventas de productos',
        'definition': 'Ingresos por venta de bienes; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de mercaderías',
          'ventas de bienes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ventas de productos» (is.product_sales) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_revenue',
        'canonical_name': 'Ingresos por servicios',
        'definition': 'Ingresos por servicios prestados; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de servicios',
          'ingresos por servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ingresos por servicios» (is.service_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.other_sales_revenue',
        'canonical_name': 'Otras ventas ordinarias',
        'definition': 'Ventas operativas menores sin cuenta específica; solo si efectivamente son ventas.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otras ventas',
          'otras ventas operativas si efectivamente son ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Otras ventas ordinarias» (is.other_sales_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.sales_returns',
        'canonical_name': 'Devoluciones sobre ventas',
        'definition': 'Contra-ingreso por bienes devueltos por clientes; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Devoluciones de ventas',
          'ventas devueltas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_discounts',
        'canonical_name': 'Descuentos sobre ventas',
        'definition': 'Contra-ingreso por descuentos concedidos; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Descuentos concedidos sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_allowances',
        'canonical_name': 'Rebajas sobre ventas',
        'definition': 'Contra-ingreso por rebajas y bonificaciones; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Rebajas y bonificaciones sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.net_sales_reported',
        'canonical_name': 'Ventas netas reportadas',
        'definition': 'Ventas netas de devoluciones, descuentos y rebajas, reportadas directamente por el ejercicio.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas netas',
          'ventas netas totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.cost_of_sales_reported',
        'canonical_name': 'Costo de ventas reportado',
        'definition': 'Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Costo de ventas',
          'costo de los bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.merchandise_cost',
        'canonical_name': 'Costo de mercadería vendida',
        'definition': 'Coste de las mercaderías vendidas en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de ventas de mercaderías',
          'costo de bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.product_cost',
        'canonical_name': 'Costo de productos vendidos',
        'definition': 'Coste de producción de los productos vendidos en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de producción vendido',
          'costo de productos vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de productos vendidos» (is.product_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_cost',
        'canonical_name': 'Costo de servicios',
        'definition': 'Coste directo de los servicios prestados en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costos de servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.gross_profit_reported',
        'canonical_name': 'Utilidad bruta reportada',
        'definition': 'Diferencia entre ventas netas y costo de ventas, reportada por el ejercicio; una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ganancia bruta',
          'resultado bruto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.selling_expenses',
        'canonical_name': 'Gastos de ventas',
        'definition': 'Gastos de distribución y promoción de ventas del periodo (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos comerciales',
          'gastos de distribución si el criterio de clase los clasifica como operativos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.administrative_expenses',
        'canonical_name': 'Gastos administrativos',
        'definition': 'Gastos de la administración general del periodo (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos de administración',
          'gastos generales y administrativos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_depreciation',
        'canonical_name': 'Depreciación operativa',
        'definition': 'Gasto de depreciación del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación con costo de ventas o gastos administrativos.',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Depreciación de activos usados en operaciones, solo si no está incluida ya en otra cuenta agregada utilizada'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_amortization',
        'canonical_name': 'Amortización operativa',
        'definition': 'Gasto de amortización del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación.',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Amortización de activos usados en operaciones, bajo la misma regla de no duplicación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.other_operating_expenses',
        'canonical_name': 'Otros gastos operativos',
        'definition': 'Gastos operativos menores sin cuenta específica (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros gastos de operación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.other_operating_income',
        'canonical_name': 'Otros ingresos operativos',
        'definition': 'Ingresos derivados de la actividad operativa que no son ventas (participaciones, excedentes operativos).',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros ingresos de operación si pertenecen a la actividad operativa'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_profit_reported',
        'canonical_name': 'Utilidad operativa reportada',
        'definition': 'Utilidad de la operación reportada por el ejercicio (utilidad bruta menos gastos operativos); una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Resultado operativo',
          'utilidad de operación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.interest_expense',
        'canonical_name': 'Gastos por intereses',
        'definition': 'Costos de financiación de deudas; si es cero, la cobertura de intereses queda en `zero_denominator` (D, razón 11).',
        'statement': 'estado_resultados',
        'classification': 'financiero',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Intereses pagados o devengados',
          'gastos financieros por intereses'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 23 Borrowing Costs',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/',
              'source_type': 'accounting_standard',
              'supports': '"Borrowing costs are interest and other costs that an entity incurs". Frase textual de IAS 23 Borrowing Costs, abierto el 2026-10-15; confirma la definición de «Gastos por intereses» (is.interest_expense) (D-035).'
            }
          ]
        }
      }
    ],
    'modo_periodo': {
      'name': 'point_in_time',
      'value': 'saldos de cierre del periodo',
      'average': null,
      'control_global': null
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'endeudamiento_razon_deuda_patrimonio': {
    'schema_version': '2.0',
    'razon': {
      'id': 'endeudamiento_razon_deuda_patrimonio',
      'name': 'Razón deuda-patrimonio',
      'category': 'endeudamiento',
      'formula_as_provided': 'Total pasivo / Total patrimonio',
      'unit': 'veces',
      'period_mode': 'point_in_time',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.total_liabilities'
        },
        'denominator': {
          'op': 'derived',
          'id': 'derived.total_equity'
        }
      },
      'notes': []
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.current_liabilities',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_liabilities_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'current_liabilities_components'
          }
        }
      },
      {
        'id': 'derived.noncurrent_liabilities',
        'kind': 'balance',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'noncurrent_liabilities_components'
        }
      },
      {
        'id': 'derived.total_liabilities',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.total_liabilities',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'derived',
                'id': 'derived.current_liabilities'
              },
              {
                'op': 'derived',
                'id': 'derived.noncurrent_liabilities'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.total_equity',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.total_equity',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'patrimony_components'
          }
        }
      }
    ],
    'conjuntos': {
      'current_liabilities_components': [
        'bs.trade_payables',
        'bs.short_term_borrowings',
        'bs.current_portion_long_term_debt',
        'bs.taxes_payable',
        'bs.accrued_expenses_payable',
        'bs.current_provisions',
        'bs.other_current_liabilities'
      ],
      'noncurrent_liabilities_components': [
        'bs.long_term_borrowings',
        'bs.long_term_provisions',
        'bs.other_noncurrent_liabilities'
      ],
      'patrimony_components': [
        'bs.share_capital',
        'bs.additional_paid_in_capital',
        'bs.legal_reserve',
        'bs.other_reserves',
        'bs.retained_earnings',
        'bs.current_year_result_equity',
        'bs.other_equity_components'
      ]
    },
    'cuentas': [
      {
        'id': 'bs.current_liabilities_total',
        'canonical_name': 'Total de pasivos corrientes',
        'definition': 'Subtotal de pasivos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total pasivo corriente',
          'total pasivo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.trade_payables',
        'canonical_name': 'Cuentas por pagar comerciales',
        'definition': 'Obligaciones con proveedores por compras a crédito; su saldo crece con las compras y disminuye con los pagos.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxP',
          'proveedores',
          'cuentas por pagar a proveedores'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_borrowings',
        'canonical_name': 'Préstamos de corto plazo',
        'definition': 'Deudas financieras con vencimiento dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudas bancarias de corto plazo',
          'obligaciones financieras corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_portion_long_term_debt',
        'canonical_name': 'Porción corriente de deuda de largo plazo',
        'definition': 'Parte de una deuda a largo plazo que vence en los próximos doce meses.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Vencimientos corrientes de deuda a largo plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.taxes_payable',
        'canonical_name': 'Impuestos por pagar',
        'definition': 'Obligaciones tributarias devengadas sin pagar dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Tributos por pagar',
          'impuestos corrientes por pagar'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 12 Income Taxes',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/',
              'source_type': 'accounting_standard',
              'supports': '"to the extent that it is unpaid, recognised as a liability". Frase textual de IAS 12 Income Taxes, abierto el 2026-10-15; confirma la definición de «Impuestos por pagar» (bs.taxes_payable) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.accrued_expenses_payable',
        'canonical_name': 'Gastos acumulados por pagar',
        'definition': 'Gastos devengados ya reconocidos y aún no pagados (sueldos, servicios).',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos devengados por pagar',
          'obligaciones acumuladas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_provisions',
        'canonical_name': 'Provisiones corrientes',
        'definition': 'Pasivos de tiempo o importe incierto con salida de recursos prevista dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Provisiones de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 37 Provisions, Contingent Liabilities and Contingent Assets',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/',
              'source_type': 'accounting_standard',
              'supports': '"A provision is a liability of uncertain timing or amount". Frase textual de IAS 37 Provisions, Contingent Liabilities and Contingent Assets, abierto el 2026-10-15; confirma la definición de «Provisiones corrientes» (bs.current_provisions) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.other_current_liabilities',
        'canonical_name': 'Otros pasivos corrientes',
        'definition': 'Pasivos corrientes sin cuenta específica (anticipos de clientes, dividendos por pagar de corto plazo).',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros pasivos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Pasivo Corto Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 1 Presentation of Financial Statements',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Otros pasivos corrientes» (bs.other_current_liabilities).'
            }
          ]
        }
      },
      {
        'id': 'bs.long_term_borrowings',
        'canonical_name': 'Deudas de largo plazo',
        'definition': 'Deudas financieras con vencimiento más allá del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Préstamos a largo plazo',
          'obligaciones financieras no corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Pasivo Largo Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo no corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IFRS 9 Financial Instruments',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/',
              'source_type': 'accounting_standard',
              'supports': 'NIIF 9 clasifica los activos financieros según el modelo de negocio y las características de los flujos de efectivo contractuales (por ejemplo, costo amortizado) y establece cuándo se reconoce un activo financiero. Confirma la definición de «Deudas de largo plazo» (bs.long_term_borrowings).'
            },
            {
              'title': 'IAS 32 Financial Instruments: Presentation',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 32 clasifica los instrumentos financieros en activos, pasivos e instrumentos de patrimonio; la distinción entre pasivo financiero y patrimonio depende de la obligación de entregar. Confirma la definición de «Deudas de largo plazo» (bs.long_term_borrowings).'
            }
          ]
        }
      },
      {
        'id': 'bs.long_term_provisions',
        'canonical_name': 'Provisiones de largo plazo',
        'definition': 'Pasivos de tiempo o importe incierto cuya salida de recursos se prevé más allá del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Provisiones no corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 37 Provisions, Contingent Liabilities and Contingent Assets',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/',
              'source_type': 'accounting_standard',
              'supports': '"A provision is a liability of uncertain timing or amount". Frase textual de IAS 37 Provisions, Contingent Liabilities and Contingent Assets, abierto el 2026-10-15; confirma la definición de «Provisiones de largo plazo» (bs.long_term_provisions) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.other_noncurrent_liabilities',
        'canonical_name': 'Otros pasivos no corrientes',
        'definition': 'Pasivos no corrientes sin cuenta específica (obligaciones a largo plazo diversas).',
        'statement': 'balance_general',
        'classification': 'pasivo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros pasivos a largo plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.total_liabilities',
        'canonical_name': 'Total de pasivos',
        'definition': 'Total de pasivos reportado por el ejercicio; si existe, sustituye a pasivo corriente + pasivo no corriente (D14).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Pasivo total',
          'total pasivo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.total_equity',
        'canonical_name': 'Total patrimonio',
        'definition': 'Total del patrimonio reportado por el ejercicio; si existe, sustituye a la suma de `bs.patrimony_components`.',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Patrimonio total',
          'capital contable total',
          'patrimonio neto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.share_capital',
        'canonical_name': 'Capital social',
        'definition': 'Aportes de los propietores representados en títulos; su saldo cambia con aportes y retiros, no con utilidades.',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Capital emitido',
          'capital aportado',
          'capital social pagado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 32 Financial Instruments: Presentation',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/',
              'source_type': 'accounting_standard',
              'supports': '"financial instruments are classified into financial assets, financial liabilities and equity instruments". Frase textual de IAS 32 Financial Instruments: Presentation, abierto el 2026-10-15; confirma la definición de «Capital social» (bs.share_capital) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.additional_paid_in_capital',
        'canonical_name': 'Aportes adicionales de capital',
        'definition': 'Excedente aportado por encima del valor nominal de las acciones.',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Prima en emisión',
          'aportes adicionales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.legal_reserve',
        'canonical_name': 'Reserva legal',
        'definition': 'Porción de utilidades retenidas legalmente reservada; no está disponible para distribución.',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Reserva legal acumulada'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Reserva legal: figura del marco legal local, fuera de NIIF; el nombre puede aludir a reservas legales de distintos regímenes. Se clasifica como patrimonio por el nombre y se marca ambiguous porque ninguna norma NIIF la define.'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': []
        }
      },
      {
        'id': 'bs.other_reserves',
        'canonical_name': 'Otras reservas patrimoniales',
        'definition': 'Reservas patrimoniales distintas de la reserva legal (revaluación, estatutarias).',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Reservas',
          'otras reservas de capital o patrimonio'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Reservas»: el detalle de la reserva es incierto, pero su clasificación en el patrimonio es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 1 Presentation of Financial Statements',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Otras reservas patrimoniales» (bs.other_reserves).'
            }
          ]
        }
      },
      {
        'id': 'bs.retained_earnings',
        'canonical_name': 'Utilidades retenidas',
        'definition': 'Utilidades acumuladas no distribuidas; su saldo se actualiza con la utilidad del periodo menos dividendos.',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Resultados acumulados',
          'utilidades acumuladas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_year_result_equity',
        'canonical_name': 'Resultado del período incluido en patrimonio',
        'definition': 'Resultado del periodo presentado como línea separada del patrimonio; puede residir en otro archivo o estar ya incluido en utilidades retenidas.',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Utilidad del ejercicio',
          'pérdida del ejercicio',
          'resultado del período dentro del patrimonio'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_equity_components',
        'canonical_name': 'Otros componentes del patrimonio',
        'definition': 'Partidas patrimoniales diversas sin identificador más específico (ajustes de conversión, acciones propias).',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otras cuentas patrimoniales que no tengan un identificador más específico'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'point_in_time',
      'value': 'saldos de cierre del periodo',
      'average': null,
      'control_global': null
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'endeudamiento_razon_deuda_total': {
    'schema_version': '2.0',
    'razon': {
      'id': 'endeudamiento_razon_deuda_total',
      'name': 'Razón de deuda total',
      'category': 'endeudamiento',
      'formula_as_provided': 'Total pasivo / Total activo',
      'unit': 'porcentaje',
      'period_mode': 'point_in_time',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.total_liabilities'
        },
        'denominator': {
          'op': 'derived',
          'id': 'derived.total_assets'
        }
      },
      'notes': []
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.inventory_total',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.inventory_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'inventory_components'
          }
        }
      },
      {
        'id': 'derived.current_assets',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_assets_total',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'sum_accounts',
                'account_set': 'current_assets_excluding_inventory'
              },
              {
                'op': 'derived',
                'id': 'derived.inventory_total'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.current_liabilities',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_liabilities_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'current_liabilities_components'
          }
        }
      },
      {
        'id': 'derived.fixed_assets_net',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.fixed_assets_net_total',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'sum_accounts',
                'account_set': 'ppe_components'
              },
              {
                'op': 'account',
                'id': 'bs.accumulated_depreciation'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.noncurrent_liabilities',
        'kind': 'balance',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'noncurrent_liabilities_components'
        }
      },
      {
        'id': 'derived.total_liabilities',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.total_liabilities',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'derived',
                'id': 'derived.current_liabilities'
              },
              {
                'op': 'derived',
                'id': 'derived.noncurrent_liabilities'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.total_assets',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.total_assets',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'derived',
                'id': 'derived.current_assets'
              },
              {
                'op': 'derived',
                'id': 'derived.fixed_assets_net'
              },
              {
                'op': 'account',
                'id': 'bs.intangible_assets'
              },
              {
                'op': 'sum_accounts',
                'account_set': 'other_noncurrent_assets_components'
              }
            ]
          }
        }
      }
    ],
    'conjuntos': {
      'current_assets_excluding_inventory': [
        'bs.cash_and_equivalents',
        'bs.short_term_investments',
        'bs.trade_receivables',
        'bs.other_current_receivables',
        'bs.prepaid_expenses',
        'bs.other_current_assets'
      ],
      'inventory_components': [
        'bs.inventory_merchandise',
        'bs.inventory_raw_materials',
        'bs.inventory_work_in_process',
        'bs.inventory_finished_goods'
      ],
      'current_liabilities_components': [
        'bs.trade_payables',
        'bs.short_term_borrowings',
        'bs.current_portion_long_term_debt',
        'bs.taxes_payable',
        'bs.accrued_expenses_payable',
        'bs.current_provisions',
        'bs.other_current_liabilities'
      ],
      'ppe_components': [
        'bs.ppe_land',
        'bs.ppe_buildings',
        'bs.ppe_machinery',
        'bs.ppe_vehicles',
        'bs.ppe_furniture',
        'bs.ppe_other'
      ],
      'other_noncurrent_assets_components': [
        'bs.long_term_investments',
        'bs.other_noncurrent_assets'
      ],
      'noncurrent_liabilities_components': [
        'bs.long_term_borrowings',
        'bs.long_term_provisions',
        'bs.other_noncurrent_liabilities'
      ]
    },
    'cuentas': [
      {
        'id': 'bs.current_assets_total',
        'canonical_name': 'Total de activos corrientes',
        'definition': 'Subtotal de activos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total activo corriente',
          'total activo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.cash_and_equivalents',
        'canonical_name': 'Efectivo y equivalentes',
        'definition': 'Medios de pago disponibles y equivalentes de efectivo; su saldo crece con cobros y disminuye con pagos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Efectivo',
          'caja',
          'bancos',
          'caja y bancos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_investments',
        'canonical_name': 'Inversiones de corto plazo',
        'definition': 'Valores negociables u otros instrumentos con vencimiento o disponibilidad dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Inversiones temporales',
          'valores negociables de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 7 Statement of Cash Flows',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/',
              'source_type': 'accounting_standard',
              'supports': '"Cash equivalents are short-term, highly liquid investments". Frase textual de IAS 7 Statement of Cash Flows, abierto el 2026-10-15; confirma la definición de «Inversiones de corto plazo» (bs.short_term_investments) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.trade_receivables',
        'canonical_name': 'Cuentas por cobrar comerciales',
        'definition': 'Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxC',
          'clientes',
          'cuentas por cobrar a clientes',
          'deudores comerciales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_receivables',
        'canonical_name': 'Otras cuentas por cobrar corrientes',
        'definition': 'Cobros distintos de las ventas comerciales con recuperación dentro del corto plazo (anticipos, deudores varios).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudores varios corrientes',
          'otras cuentas por cobrar de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_total',
        'canonical_name': 'Inventario total',
        'definition': 'Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Inventario',
          'existencias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_merchandise',
        'canonical_name': 'Inventario de mercaderías',
        'definition': 'Bienes adquiridos para revender sin transformación; mide su coste de adquisición.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mercaderías',
          'mercancías',
          'inventario para la venta'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"Inventories are measured at the lower of cost and net realisable value". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de mercaderías» (bs.inventory_merchandise) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_raw_materials',
        'canonical_name': 'Inventario de materias primas',
        'definition': 'Materiales adquiridos para la producción que aún no se han transformado.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Materias primas',
          'materiales en almacén para producción'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de materias primas» (bs.inventory_raw_materials) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_work_in_process',
        'canonical_name': 'Inventario de productos en proceso',
        'definition': 'Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Producción en proceso',
          'productos en proceso'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"costs of conversion (direct labour and production overhead)". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos en proceso» (bs.inventory_work_in_process) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_finished_goods',
        'canonical_name': 'Inventario de productos terminados',
        'definition': 'Producto terminado listo para la venta; se lleva a costo de ventas al venderse.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Productos terminados',
          'bienes terminados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos terminados» (bs.inventory_finished_goods) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.prepaid_expenses',
        'canonical_name': 'Gastos pagados por anticipado',
        'definition': 'Pagos realizados por adelantado que se consumen como gasto en periodos futuros (seguros, rentas).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Pagos anticipados',
          'seguros pagados por anticipado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_assets',
        'canonical_name': 'Otros activos corrientes',
        'definition': 'Activos corrientes que no tienen una cuenta específica (anticipos, impuestos a favor de corto plazo).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros activos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.fixed_assets_net_total',
        'canonical_name': 'Total de activos fijos netos',
        'definition': 'Subtotal neto de activos fijos reportado por el ejercicio; si existe, sustituye a la suma de componentes con depreciación (D3).',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Activo fijo neto',
          'propiedad planta y equipo neto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Total de activos fijos netos» (bs.fixed_assets_net_total) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_land',
        'canonical_name': 'Terrenos',
        'definition': 'Terrenos ocupados o destinados a la operación; no se deprecian.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Terrenos de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Terrenos» (bs.ppe_land) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_buildings',
        'canonical_name': 'Edificios e instalaciones',
        'definition': 'Construcciones usadas en la operación; su coste se deprecia a lo largo de su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Edificios',
          'construcciones de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Edificios e instalaciones» (bs.ppe_buildings) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_machinery',
        'canonical_name': 'Maquinaria y equipo',
        'definition': 'Maquinaria y equipo utilizados en la producción o la operación; se deprecian por uso o por tiempo.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Maquinaria',
          'equipo productivo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Equipos»: el detalle de la cuenta es incierto, pero su clasificación en activo fijo es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Maquinaria y equipo» (bs.ppe_machinery).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_vehicles',
        'canonical_name': 'Vehículos',
        'definition': 'Vehículos usados en la operación; se deprecian a lo largo de su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Equipo de transporte',
          'vehículos de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Vehículos» (bs.ppe_vehicles) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_furniture',
        'canonical_name': 'Mobiliario y equipo de oficina',
        'definition': 'Mobiliario y equipo de oficina en servicio; se deprecian por su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mobiliario',
          'muebles y enseres',
          'equipo de oficina'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Mobiliario y equipo de oficina» (bs.ppe_furniture) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_other',
        'canonical_name': 'Otros activos fijos tangibles',
        'definition': 'Bienes tangibles de la operación sin una cuenta específica; se deprecian según su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Propiedad, planta y equipo',
          'otros activos fijos tangibles'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Otros activos fijos tangibles» (bs.ppe_other) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.accumulated_depreciation',
        'canonical_name': 'Depreciación acumulada',
        'definition': 'Cuenta correctora que acumula el desgaste reconocido de los activos fijos; llega negativa y se suma con su signo (D13).',
        'statement': 'balance_general',
        'classification': 'correctora_activo',
        'account_role': 'contra_account',
        'normal_balance': 'acreedor',
        'value_semantics': 'contra_asset',
        'absence_policy': 'requires_data',
        'synonyms': [
          'Depreciación acumulada de activos fijos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.intangible_assets',
        'canonical_name': 'Activos intangibles',
        'definition': 'Activos no monetarios no financieros identificables sin sustancia física (software, patentes); se amortizan. Si no se reportan, aportan cero a activos totales (D12).',
        'statement': 'balance_general',
        'classification': 'activo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Intangibles',
          'software capitalizado',
          'patentes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 38 Intangible Assets',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/',
              'source_type': 'accounting_standard',
              'supports': '"An intangible asset is an identifiable non-monetary asset without physical substance". Frase textual de IAS 38 Intangible Assets, abierto el 2026-10-15; confirma la definición de «Activos intangibles» (bs.intangible_assets) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.long_term_investments',
        'canonical_name': 'Inversiones de largo plazo',
        'definition': 'Inversiones con disponibilidad o recuperación más allá del corto plazo.',
        'statement': 'balance_general',
        'classification': 'activo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Inversiones permanentes',
          'inversiones no corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_noncurrent_assets',
        'canonical_name': 'Otros activos no corrientes',
        'definition': 'Activos no corrientes sin cuenta específica (derechos a largo plazo, anticipos a largo plazo).',
        'statement': 'balance_general',
        'classification': 'activo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros activos a largo plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.total_assets',
        'canonical_name': 'Total de activos',
        'definition': 'Total de activos reportado por el ejercicio; si existe, sustituye al cálculo activo corriente + activos fijos netos + intangibles (D4).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total activo',
          'activo total',
          'total de recursos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_liabilities_total',
        'canonical_name': 'Total de pasivos corrientes',
        'definition': 'Subtotal de pasivos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total pasivo corriente',
          'total pasivo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.trade_payables',
        'canonical_name': 'Cuentas por pagar comerciales',
        'definition': 'Obligaciones con proveedores por compras a crédito; su saldo crece con las compras y disminuye con los pagos.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxP',
          'proveedores',
          'cuentas por pagar a proveedores'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_borrowings',
        'canonical_name': 'Préstamos de corto plazo',
        'definition': 'Deudas financieras con vencimiento dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudas bancarias de corto plazo',
          'obligaciones financieras corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_portion_long_term_debt',
        'canonical_name': 'Porción corriente de deuda de largo plazo',
        'definition': 'Parte de una deuda a largo plazo que vence en los próximos doce meses.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Vencimientos corrientes de deuda a largo plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.taxes_payable',
        'canonical_name': 'Impuestos por pagar',
        'definition': 'Obligaciones tributarias devengadas sin pagar dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Tributos por pagar',
          'impuestos corrientes por pagar'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 12 Income Taxes',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/',
              'source_type': 'accounting_standard',
              'supports': '"to the extent that it is unpaid, recognised as a liability". Frase textual de IAS 12 Income Taxes, abierto el 2026-10-15; confirma la definición de «Impuestos por pagar» (bs.taxes_payable) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.accrued_expenses_payable',
        'canonical_name': 'Gastos acumulados por pagar',
        'definition': 'Gastos devengados ya reconocidos y aún no pagados (sueldos, servicios).',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos devengados por pagar',
          'obligaciones acumuladas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_provisions',
        'canonical_name': 'Provisiones corrientes',
        'definition': 'Pasivos de tiempo o importe incierto con salida de recursos prevista dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Provisiones de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 37 Provisions, Contingent Liabilities and Contingent Assets',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/',
              'source_type': 'accounting_standard',
              'supports': '"A provision is a liability of uncertain timing or amount". Frase textual de IAS 37 Provisions, Contingent Liabilities and Contingent Assets, abierto el 2026-10-15; confirma la definición de «Provisiones corrientes» (bs.current_provisions) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.other_current_liabilities',
        'canonical_name': 'Otros pasivos corrientes',
        'definition': 'Pasivos corrientes sin cuenta específica (anticipos de clientes, dividendos por pagar de corto plazo).',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros pasivos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Pasivo Corto Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 1 Presentation of Financial Statements',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Otros pasivos corrientes» (bs.other_current_liabilities).'
            }
          ]
        }
      },
      {
        'id': 'bs.long_term_borrowings',
        'canonical_name': 'Deudas de largo plazo',
        'definition': 'Deudas financieras con vencimiento más allá del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Préstamos a largo plazo',
          'obligaciones financieras no corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Pasivo Largo Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo no corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IFRS 9 Financial Instruments',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/',
              'source_type': 'accounting_standard',
              'supports': 'NIIF 9 clasifica los activos financieros según el modelo de negocio y las características de los flujos de efectivo contractuales (por ejemplo, costo amortizado) y establece cuándo se reconoce un activo financiero. Confirma la definición de «Deudas de largo plazo» (bs.long_term_borrowings).'
            },
            {
              'title': 'IAS 32 Financial Instruments: Presentation',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 32 clasifica los instrumentos financieros en activos, pasivos e instrumentos de patrimonio; la distinción entre pasivo financiero y patrimonio depende de la obligación de entregar. Confirma la definición de «Deudas de largo plazo» (bs.long_term_borrowings).'
            }
          ]
        }
      },
      {
        'id': 'bs.long_term_provisions',
        'canonical_name': 'Provisiones de largo plazo',
        'definition': 'Pasivos de tiempo o importe incierto cuya salida de recursos se prevé más allá del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Provisiones no corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 37 Provisions, Contingent Liabilities and Contingent Assets',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/',
              'source_type': 'accounting_standard',
              'supports': '"A provision is a liability of uncertain timing or amount". Frase textual de IAS 37 Provisions, Contingent Liabilities and Contingent Assets, abierto el 2026-10-15; confirma la definición de «Provisiones de largo plazo» (bs.long_term_provisions) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.other_noncurrent_liabilities',
        'canonical_name': 'Otros pasivos no corrientes',
        'definition': 'Pasivos no corrientes sin cuenta específica (obligaciones a largo plazo diversas).',
        'statement': 'balance_general',
        'classification': 'pasivo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros pasivos a largo plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.total_liabilities',
        'canonical_name': 'Total de pasivos',
        'definition': 'Total de pasivos reportado por el ejercicio; si existe, sustituye a pasivo corriente + pasivo no corriente (D14).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Pasivo total',
          'total pasivo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'point_in_time',
      'value': 'saldos de cierre del periodo',
      'average': null,
      'control_global': null
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'liquidez_capital_trabajo_neto': {
    'schema_version': '2.0',
    'razon': {
      'id': 'liquidez_capital_trabajo_neto',
      'name': 'Capital de trabajo neto',
      'category': 'liquidez',
      'formula_as_provided': 'Activo corriente − Pasivo corriente',
      'unit': 'moneda',
      'period_mode': 'point_in_time',
      'formula': {
        'op': 'subtract',
        'left': {
          'op': 'derived',
          'id': 'derived.current_assets'
        },
        'right': {
          'op': 'derived',
          'id': 'derived.current_liabilities'
        }
      },
      'notes': []
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.inventory_total',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.inventory_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'inventory_components'
          }
        }
      },
      {
        'id': 'derived.current_assets',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_assets_total',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'sum_accounts',
                'account_set': 'current_assets_excluding_inventory'
              },
              {
                'op': 'derived',
                'id': 'derived.inventory_total'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.current_liabilities',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_liabilities_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'current_liabilities_components'
          }
        }
      }
    ],
    'conjuntos': {
      'current_assets_excluding_inventory': [
        'bs.cash_and_equivalents',
        'bs.short_term_investments',
        'bs.trade_receivables',
        'bs.other_current_receivables',
        'bs.prepaid_expenses',
        'bs.other_current_assets'
      ],
      'inventory_components': [
        'bs.inventory_merchandise',
        'bs.inventory_raw_materials',
        'bs.inventory_work_in_process',
        'bs.inventory_finished_goods'
      ],
      'current_liabilities_components': [
        'bs.trade_payables',
        'bs.short_term_borrowings',
        'bs.current_portion_long_term_debt',
        'bs.taxes_payable',
        'bs.accrued_expenses_payable',
        'bs.current_provisions',
        'bs.other_current_liabilities'
      ]
    },
    'cuentas': [
      {
        'id': 'bs.current_assets_total',
        'canonical_name': 'Total de activos corrientes',
        'definition': 'Subtotal de activos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total activo corriente',
          'total activo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.cash_and_equivalents',
        'canonical_name': 'Efectivo y equivalentes',
        'definition': 'Medios de pago disponibles y equivalentes de efectivo; su saldo crece con cobros y disminuye con pagos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Efectivo',
          'caja',
          'bancos',
          'caja y bancos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_investments',
        'canonical_name': 'Inversiones de corto plazo',
        'definition': 'Valores negociables u otros instrumentos con vencimiento o disponibilidad dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Inversiones temporales',
          'valores negociables de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 7 Statement of Cash Flows',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/',
              'source_type': 'accounting_standard',
              'supports': '"Cash equivalents are short-term, highly liquid investments". Frase textual de IAS 7 Statement of Cash Flows, abierto el 2026-10-15; confirma la definición de «Inversiones de corto plazo» (bs.short_term_investments) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.trade_receivables',
        'canonical_name': 'Cuentas por cobrar comerciales',
        'definition': 'Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxC',
          'clientes',
          'cuentas por cobrar a clientes',
          'deudores comerciales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_receivables',
        'canonical_name': 'Otras cuentas por cobrar corrientes',
        'definition': 'Cobros distintos de las ventas comerciales con recuperación dentro del corto plazo (anticipos, deudores varios).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudores varios corrientes',
          'otras cuentas por cobrar de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_total',
        'canonical_name': 'Inventario total',
        'definition': 'Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Inventario',
          'existencias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_merchandise',
        'canonical_name': 'Inventario de mercaderías',
        'definition': 'Bienes adquiridos para revender sin transformación; mide su coste de adquisición.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mercaderías',
          'mercancías',
          'inventario para la venta'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"Inventories are measured at the lower of cost and net realisable value". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de mercaderías» (bs.inventory_merchandise) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_raw_materials',
        'canonical_name': 'Inventario de materias primas',
        'definition': 'Materiales adquiridos para la producción que aún no se han transformado.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Materias primas',
          'materiales en almacén para producción'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de materias primas» (bs.inventory_raw_materials) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_work_in_process',
        'canonical_name': 'Inventario de productos en proceso',
        'definition': 'Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Producción en proceso',
          'productos en proceso'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"costs of conversion (direct labour and production overhead)". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos en proceso» (bs.inventory_work_in_process) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_finished_goods',
        'canonical_name': 'Inventario de productos terminados',
        'definition': 'Producto terminado listo para la venta; se lleva a costo de ventas al venderse.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Productos terminados',
          'bienes terminados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos terminados» (bs.inventory_finished_goods) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.prepaid_expenses',
        'canonical_name': 'Gastos pagados por anticipado',
        'definition': 'Pagos realizados por adelantado que se consumen como gasto en periodos futuros (seguros, rentas).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Pagos anticipados',
          'seguros pagados por anticipado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_assets',
        'canonical_name': 'Otros activos corrientes',
        'definition': 'Activos corrientes que no tienen una cuenta específica (anticipos, impuestos a favor de corto plazo).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros activos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_liabilities_total',
        'canonical_name': 'Total de pasivos corrientes',
        'definition': 'Subtotal de pasivos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total pasivo corriente',
          'total pasivo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.trade_payables',
        'canonical_name': 'Cuentas por pagar comerciales',
        'definition': 'Obligaciones con proveedores por compras a crédito; su saldo crece con las compras y disminuye con los pagos.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxP',
          'proveedores',
          'cuentas por pagar a proveedores'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_borrowings',
        'canonical_name': 'Préstamos de corto plazo',
        'definition': 'Deudas financieras con vencimiento dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudas bancarias de corto plazo',
          'obligaciones financieras corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_portion_long_term_debt',
        'canonical_name': 'Porción corriente de deuda de largo plazo',
        'definition': 'Parte de una deuda a largo plazo que vence en los próximos doce meses.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Vencimientos corrientes de deuda a largo plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.taxes_payable',
        'canonical_name': 'Impuestos por pagar',
        'definition': 'Obligaciones tributarias devengadas sin pagar dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Tributos por pagar',
          'impuestos corrientes por pagar'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 12 Income Taxes',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/',
              'source_type': 'accounting_standard',
              'supports': '"to the extent that it is unpaid, recognised as a liability". Frase textual de IAS 12 Income Taxes, abierto el 2026-10-15; confirma la definición de «Impuestos por pagar» (bs.taxes_payable) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.accrued_expenses_payable',
        'canonical_name': 'Gastos acumulados por pagar',
        'definition': 'Gastos devengados ya reconocidos y aún no pagados (sueldos, servicios).',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos devengados por pagar',
          'obligaciones acumuladas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_provisions',
        'canonical_name': 'Provisiones corrientes',
        'definition': 'Pasivos de tiempo o importe incierto con salida de recursos prevista dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Provisiones de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 37 Provisions, Contingent Liabilities and Contingent Assets',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/',
              'source_type': 'accounting_standard',
              'supports': '"A provision is a liability of uncertain timing or amount". Frase textual de IAS 37 Provisions, Contingent Liabilities and Contingent Assets, abierto el 2026-10-15; confirma la definición de «Provisiones corrientes» (bs.current_provisions) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.other_current_liabilities',
        'canonical_name': 'Otros pasivos corrientes',
        'definition': 'Pasivos corrientes sin cuenta específica (anticipos de clientes, dividendos por pagar de corto plazo).',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros pasivos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Pasivo Corto Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 1 Presentation of Financial Statements',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Otros pasivos corrientes» (bs.other_current_liabilities).'
            }
          ]
        }
      }
    ],
    'modo_periodo': {
      'name': 'point_in_time',
      'value': 'saldos de cierre del periodo',
      'average': null,
      'control_global': null
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'liquidez_prueba_acida': {
    'schema_version': '2.0',
    'razon': {
      'id': 'liquidez_prueba_acida',
      'name': 'Prueba ácida',
      'category': 'liquidez',
      'formula_as_provided': '(Activo corriente − Inventarios) / Pasivo corriente',
      'unit': 'veces',
      'period_mode': 'point_in_time',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'subtract',
          'left': {
            'op': 'derived',
            'id': 'derived.current_assets'
          },
          'right': {
            'op': 'derived',
            'id': 'derived.inventory_total'
          }
        },
        'denominator': {
          'op': 'derived',
          'id': 'derived.current_liabilities'
        }
      },
      'notes': []
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.inventory_total',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.inventory_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'inventory_components'
          }
        }
      },
      {
        'id': 'derived.current_assets',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_assets_total',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'sum_accounts',
                'account_set': 'current_assets_excluding_inventory'
              },
              {
                'op': 'derived',
                'id': 'derived.inventory_total'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.current_liabilities',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_liabilities_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'current_liabilities_components'
          }
        }
      }
    ],
    'conjuntos': {
      'current_assets_excluding_inventory': [
        'bs.cash_and_equivalents',
        'bs.short_term_investments',
        'bs.trade_receivables',
        'bs.other_current_receivables',
        'bs.prepaid_expenses',
        'bs.other_current_assets'
      ],
      'inventory_components': [
        'bs.inventory_merchandise',
        'bs.inventory_raw_materials',
        'bs.inventory_work_in_process',
        'bs.inventory_finished_goods'
      ],
      'current_liabilities_components': [
        'bs.trade_payables',
        'bs.short_term_borrowings',
        'bs.current_portion_long_term_debt',
        'bs.taxes_payable',
        'bs.accrued_expenses_payable',
        'bs.current_provisions',
        'bs.other_current_liabilities'
      ]
    },
    'cuentas': [
      {
        'id': 'bs.current_assets_total',
        'canonical_name': 'Total de activos corrientes',
        'definition': 'Subtotal de activos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total activo corriente',
          'total activo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.cash_and_equivalents',
        'canonical_name': 'Efectivo y equivalentes',
        'definition': 'Medios de pago disponibles y equivalentes de efectivo; su saldo crece con cobros y disminuye con pagos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Efectivo',
          'caja',
          'bancos',
          'caja y bancos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_investments',
        'canonical_name': 'Inversiones de corto plazo',
        'definition': 'Valores negociables u otros instrumentos con vencimiento o disponibilidad dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Inversiones temporales',
          'valores negociables de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 7 Statement of Cash Flows',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/',
              'source_type': 'accounting_standard',
              'supports': '"Cash equivalents are short-term, highly liquid investments". Frase textual de IAS 7 Statement of Cash Flows, abierto el 2026-10-15; confirma la definición de «Inversiones de corto plazo» (bs.short_term_investments) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.trade_receivables',
        'canonical_name': 'Cuentas por cobrar comerciales',
        'definition': 'Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxC',
          'clientes',
          'cuentas por cobrar a clientes',
          'deudores comerciales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_receivables',
        'canonical_name': 'Otras cuentas por cobrar corrientes',
        'definition': 'Cobros distintos de las ventas comerciales con recuperación dentro del corto plazo (anticipos, deudores varios).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudores varios corrientes',
          'otras cuentas por cobrar de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_total',
        'canonical_name': 'Inventario total',
        'definition': 'Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Inventario',
          'existencias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_merchandise',
        'canonical_name': 'Inventario de mercaderías',
        'definition': 'Bienes adquiridos para revender sin transformación; mide su coste de adquisición.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mercaderías',
          'mercancías',
          'inventario para la venta'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"Inventories are measured at the lower of cost and net realisable value". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de mercaderías» (bs.inventory_merchandise) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_raw_materials',
        'canonical_name': 'Inventario de materias primas',
        'definition': 'Materiales adquiridos para la producción que aún no se han transformado.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Materias primas',
          'materiales en almacén para producción'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de materias primas» (bs.inventory_raw_materials) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_work_in_process',
        'canonical_name': 'Inventario de productos en proceso',
        'definition': 'Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Producción en proceso',
          'productos en proceso'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"costs of conversion (direct labour and production overhead)". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos en proceso» (bs.inventory_work_in_process) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_finished_goods',
        'canonical_name': 'Inventario de productos terminados',
        'definition': 'Producto terminado listo para la venta; se lleva a costo de ventas al venderse.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Productos terminados',
          'bienes terminados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos terminados» (bs.inventory_finished_goods) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.prepaid_expenses',
        'canonical_name': 'Gastos pagados por anticipado',
        'definition': 'Pagos realizados por adelantado que se consumen como gasto en periodos futuros (seguros, rentas).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Pagos anticipados',
          'seguros pagados por anticipado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_assets',
        'canonical_name': 'Otros activos corrientes',
        'definition': 'Activos corrientes que no tienen una cuenta específica (anticipos, impuestos a favor de corto plazo).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros activos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_liabilities_total',
        'canonical_name': 'Total de pasivos corrientes',
        'definition': 'Subtotal de pasivos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total pasivo corriente',
          'total pasivo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.trade_payables',
        'canonical_name': 'Cuentas por pagar comerciales',
        'definition': 'Obligaciones con proveedores por compras a crédito; su saldo crece con las compras y disminuye con los pagos.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxP',
          'proveedores',
          'cuentas por pagar a proveedores'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_borrowings',
        'canonical_name': 'Préstamos de corto plazo',
        'definition': 'Deudas financieras con vencimiento dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudas bancarias de corto plazo',
          'obligaciones financieras corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_portion_long_term_debt',
        'canonical_name': 'Porción corriente de deuda de largo plazo',
        'definition': 'Parte de una deuda a largo plazo que vence en los próximos doce meses.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Vencimientos corrientes de deuda a largo plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.taxes_payable',
        'canonical_name': 'Impuestos por pagar',
        'definition': 'Obligaciones tributarias devengadas sin pagar dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Tributos por pagar',
          'impuestos corrientes por pagar'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 12 Income Taxes',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/',
              'source_type': 'accounting_standard',
              'supports': '"to the extent that it is unpaid, recognised as a liability". Frase textual de IAS 12 Income Taxes, abierto el 2026-10-15; confirma la definición de «Impuestos por pagar» (bs.taxes_payable) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.accrued_expenses_payable',
        'canonical_name': 'Gastos acumulados por pagar',
        'definition': 'Gastos devengados ya reconocidos y aún no pagados (sueldos, servicios).',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos devengados por pagar',
          'obligaciones acumuladas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_provisions',
        'canonical_name': 'Provisiones corrientes',
        'definition': 'Pasivos de tiempo o importe incierto con salida de recursos prevista dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Provisiones de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 37 Provisions, Contingent Liabilities and Contingent Assets',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/',
              'source_type': 'accounting_standard',
              'supports': '"A provision is a liability of uncertain timing or amount". Frase textual de IAS 37 Provisions, Contingent Liabilities and Contingent Assets, abierto el 2026-10-15; confirma la definición de «Provisiones corrientes» (bs.current_provisions) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.other_current_liabilities',
        'canonical_name': 'Otros pasivos corrientes',
        'definition': 'Pasivos corrientes sin cuenta específica (anticipos de clientes, dividendos por pagar de corto plazo).',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros pasivos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Pasivo Corto Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 1 Presentation of Financial Statements',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Otros pasivos corrientes» (bs.other_current_liabilities).'
            }
          ]
        }
      }
    ],
    'modo_periodo': {
      'name': 'point_in_time',
      'value': 'saldos de cierre del periodo',
      'average': null,
      'control_global': null
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'liquidez_razon_corriente': {
    'schema_version': '2.0',
    'razon': {
      'id': 'liquidez_razon_corriente',
      'name': 'Razón corriente',
      'category': 'liquidez',
      'formula_as_provided': 'Activo corriente / Pasivo corriente',
      'unit': 'veces',
      'period_mode': 'point_in_time',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.current_assets'
        },
        'denominator': {
          'op': 'derived',
          'id': 'derived.current_liabilities'
        }
      },
      'notes': []
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.inventory_total',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.inventory_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'inventory_components'
          }
        }
      },
      {
        'id': 'derived.current_assets',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_assets_total',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'sum_accounts',
                'account_set': 'current_assets_excluding_inventory'
              },
              {
                'op': 'derived',
                'id': 'derived.inventory_total'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.current_liabilities',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_liabilities_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'current_liabilities_components'
          }
        }
      }
    ],
    'conjuntos': {
      'current_assets_excluding_inventory': [
        'bs.cash_and_equivalents',
        'bs.short_term_investments',
        'bs.trade_receivables',
        'bs.other_current_receivables',
        'bs.prepaid_expenses',
        'bs.other_current_assets'
      ],
      'inventory_components': [
        'bs.inventory_merchandise',
        'bs.inventory_raw_materials',
        'bs.inventory_work_in_process',
        'bs.inventory_finished_goods'
      ],
      'current_liabilities_components': [
        'bs.trade_payables',
        'bs.short_term_borrowings',
        'bs.current_portion_long_term_debt',
        'bs.taxes_payable',
        'bs.accrued_expenses_payable',
        'bs.current_provisions',
        'bs.other_current_liabilities'
      ]
    },
    'cuentas': [
      {
        'id': 'bs.current_assets_total',
        'canonical_name': 'Total de activos corrientes',
        'definition': 'Subtotal de activos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total activo corriente',
          'total activo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.cash_and_equivalents',
        'canonical_name': 'Efectivo y equivalentes',
        'definition': 'Medios de pago disponibles y equivalentes de efectivo; su saldo crece con cobros y disminuye con pagos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Efectivo',
          'caja',
          'bancos',
          'caja y bancos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_investments',
        'canonical_name': 'Inversiones de corto plazo',
        'definition': 'Valores negociables u otros instrumentos con vencimiento o disponibilidad dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Inversiones temporales',
          'valores negociables de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 7 Statement of Cash Flows',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/',
              'source_type': 'accounting_standard',
              'supports': '"Cash equivalents are short-term, highly liquid investments". Frase textual de IAS 7 Statement of Cash Flows, abierto el 2026-10-15; confirma la definición de «Inversiones de corto plazo» (bs.short_term_investments) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.trade_receivables',
        'canonical_name': 'Cuentas por cobrar comerciales',
        'definition': 'Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxC',
          'clientes',
          'cuentas por cobrar a clientes',
          'deudores comerciales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_receivables',
        'canonical_name': 'Otras cuentas por cobrar corrientes',
        'definition': 'Cobros distintos de las ventas comerciales con recuperación dentro del corto plazo (anticipos, deudores varios).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudores varios corrientes',
          'otras cuentas por cobrar de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_total',
        'canonical_name': 'Inventario total',
        'definition': 'Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Inventario',
          'existencias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_merchandise',
        'canonical_name': 'Inventario de mercaderías',
        'definition': 'Bienes adquiridos para revender sin transformación; mide su coste de adquisición.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mercaderías',
          'mercancías',
          'inventario para la venta'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"Inventories are measured at the lower of cost and net realisable value". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de mercaderías» (bs.inventory_merchandise) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_raw_materials',
        'canonical_name': 'Inventario de materias primas',
        'definition': 'Materiales adquiridos para la producción que aún no se han transformado.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Materias primas',
          'materiales en almacén para producción'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de materias primas» (bs.inventory_raw_materials) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_work_in_process',
        'canonical_name': 'Inventario de productos en proceso',
        'definition': 'Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Producción en proceso',
          'productos en proceso'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"costs of conversion (direct labour and production overhead)". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos en proceso» (bs.inventory_work_in_process) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_finished_goods',
        'canonical_name': 'Inventario de productos terminados',
        'definition': 'Producto terminado listo para la venta; se lleva a costo de ventas al venderse.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Productos terminados',
          'bienes terminados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos terminados» (bs.inventory_finished_goods) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.prepaid_expenses',
        'canonical_name': 'Gastos pagados por anticipado',
        'definition': 'Pagos realizados por adelantado que se consumen como gasto en periodos futuros (seguros, rentas).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Pagos anticipados',
          'seguros pagados por anticipado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_assets',
        'canonical_name': 'Otros activos corrientes',
        'definition': 'Activos corrientes que no tienen una cuenta específica (anticipos, impuestos a favor de corto plazo).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros activos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_liabilities_total',
        'canonical_name': 'Total de pasivos corrientes',
        'definition': 'Subtotal de pasivos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total pasivo corriente',
          'total pasivo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.trade_payables',
        'canonical_name': 'Cuentas por pagar comerciales',
        'definition': 'Obligaciones con proveedores por compras a crédito; su saldo crece con las compras y disminuye con los pagos.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxP',
          'proveedores',
          'cuentas por pagar a proveedores'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_borrowings',
        'canonical_name': 'Préstamos de corto plazo',
        'definition': 'Deudas financieras con vencimiento dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudas bancarias de corto plazo',
          'obligaciones financieras corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_portion_long_term_debt',
        'canonical_name': 'Porción corriente de deuda de largo plazo',
        'definition': 'Parte de una deuda a largo plazo que vence en los próximos doce meses.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Vencimientos corrientes de deuda a largo plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.taxes_payable',
        'canonical_name': 'Impuestos por pagar',
        'definition': 'Obligaciones tributarias devengadas sin pagar dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Tributos por pagar',
          'impuestos corrientes por pagar'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 12 Income Taxes',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/',
              'source_type': 'accounting_standard',
              'supports': '"to the extent that it is unpaid, recognised as a liability". Frase textual de IAS 12 Income Taxes, abierto el 2026-10-15; confirma la definición de «Impuestos por pagar» (bs.taxes_payable) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.accrued_expenses_payable',
        'canonical_name': 'Gastos acumulados por pagar',
        'definition': 'Gastos devengados ya reconocidos y aún no pagados (sueldos, servicios).',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos devengados por pagar',
          'obligaciones acumuladas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_provisions',
        'canonical_name': 'Provisiones corrientes',
        'definition': 'Pasivos de tiempo o importe incierto con salida de recursos prevista dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Provisiones de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 37 Provisions, Contingent Liabilities and Contingent Assets',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/',
              'source_type': 'accounting_standard',
              'supports': '"A provision is a liability of uncertain timing or amount". Frase textual de IAS 37 Provisions, Contingent Liabilities and Contingent Assets, abierto el 2026-10-15; confirma la definición de «Provisiones corrientes» (bs.current_provisions) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.other_current_liabilities',
        'canonical_name': 'Otros pasivos corrientes',
        'definition': 'Pasivos corrientes sin cuenta específica (anticipos de clientes, dividendos por pagar de corto plazo).',
        'statement': 'balance_general',
        'classification': 'pasivo_corriente',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros pasivos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Pasivo Corto Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 1 Presentation of Financial Statements',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 1 fija los requisitos generales de presentación, las pautas de estructura y el contenido mínimo de los estados financieros, y rige la clasificación corriente y no corriente (doce meses para los pasivos); la norma adoptó la presentación de activos y pasivos corrientes. Confirma la definición de «Otros pasivos corrientes» (bs.other_current_liabilities).'
            }
          ]
        }
      }
    ],
    'modo_periodo': {
      'name': 'point_in_time',
      'value': 'saldos de cierre del periodo',
      'average': null,
      'control_global': null
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'rentabilidad_margen_utilidad_bruta': {
    'schema_version': '2.0',
    'razon': {
      'id': 'rentabilidad_margen_utilidad_bruta',
      'name': 'Margen de utilidad bruta',
      'category': 'rentabilidad',
      'formula_as_provided': 'Utilidad bruta / Ventas',
      'unit': 'porcentaje',
      'period_mode': 'point_in_time',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.gross_profit'
        },
        'denominator': {
          'op': 'derived',
          'id': 'derived.net_sales'
        }
      },
      'notes': []
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.gross_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.sales_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'gross_sales_components'
          }
        }
      },
      {
        'id': 'derived.sales_deductions',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'sales_deduction_components'
        }
      },
      {
        'id': 'derived.net_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_sales_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.gross_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.sales_deductions'
            }
          }
        }
      },
      {
        'id': 'derived.cost_of_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.cost_of_sales_reported',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'cost_of_sales_components'
          }
        }
      },
      {
        'id': 'derived.gross_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.gross_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.net_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.cost_of_sales'
            }
          }
        }
      }
    ],
    'conjuntos': {
      'gross_sales_components': [
        'is.product_sales',
        'is.service_revenue',
        'is.other_sales_revenue'
      ],
      'sales_deduction_components': [
        'is.sales_returns',
        'is.sales_discounts',
        'is.sales_allowances'
      ],
      'cost_of_sales_components': [
        'is.merchandise_cost',
        'is.product_cost',
        'is.service_cost'
      ]
    },
    'cuentas': [
      {
        'id': 'is.sales_total',
        'canonical_name': 'Ventas totales',
        'definition': 'Total de ingresos por ventas sin desglose de componentes (R5); se reconoce al entregar los bienes o prestar los servicios.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas',
          'ventas ordinarias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.product_sales',
        'canonical_name': 'Ventas de productos',
        'definition': 'Ingresos por venta de bienes; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de mercaderías',
          'ventas de bienes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ventas de productos» (is.product_sales) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_revenue',
        'canonical_name': 'Ingresos por servicios',
        'definition': 'Ingresos por servicios prestados; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de servicios',
          'ingresos por servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ingresos por servicios» (is.service_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.other_sales_revenue',
        'canonical_name': 'Otras ventas ordinarias',
        'definition': 'Ventas operativas menores sin cuenta específica; solo si efectivamente son ventas.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otras ventas',
          'otras ventas operativas si efectivamente son ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Otras ventas ordinarias» (is.other_sales_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.sales_returns',
        'canonical_name': 'Devoluciones sobre ventas',
        'definition': 'Contra-ingreso por bienes devueltos por clientes; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Devoluciones de ventas',
          'ventas devueltas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_discounts',
        'canonical_name': 'Descuentos sobre ventas',
        'definition': 'Contra-ingreso por descuentos concedidos; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Descuentos concedidos sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_allowances',
        'canonical_name': 'Rebajas sobre ventas',
        'definition': 'Contra-ingreso por rebajas y bonificaciones; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Rebajas y bonificaciones sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.net_sales_reported',
        'canonical_name': 'Ventas netas reportadas',
        'definition': 'Ventas netas de devoluciones, descuentos y rebajas, reportadas directamente por el ejercicio.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas netas',
          'ventas netas totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.cost_of_sales_reported',
        'canonical_name': 'Costo de ventas reportado',
        'definition': 'Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Costo de ventas',
          'costo de los bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.merchandise_cost',
        'canonical_name': 'Costo de mercadería vendida',
        'definition': 'Coste de las mercaderías vendidas en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de ventas de mercaderías',
          'costo de bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.product_cost',
        'canonical_name': 'Costo de productos vendidos',
        'definition': 'Coste de producción de los productos vendidos en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de producción vendido',
          'costo de productos vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de productos vendidos» (is.product_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_cost',
        'canonical_name': 'Costo de servicios',
        'definition': 'Coste directo de los servicios prestados en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costos de servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.gross_profit_reported',
        'canonical_name': 'Utilidad bruta reportada',
        'definition': 'Diferencia entre ventas netas y costo de ventas, reportada por el ejercicio; una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ganancia bruta',
          'resultado bruto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'point_in_time',
      'value': 'saldos de cierre del periodo',
      'average': null,
      'control_global': null
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'rentabilidad_margen_utilidad_neta': {
    'schema_version': '2.0',
    'razon': {
      'id': 'rentabilidad_margen_utilidad_neta',
      'name': 'Margen de utilidad neta',
      'category': 'rentabilidad',
      'formula_as_provided': 'Utilidad neta / Ventas',
      'unit': 'porcentaje',
      'period_mode': 'point_in_time',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.net_income'
        },
        'denominator': {
          'op': 'derived',
          'id': 'derived.net_sales'
        }
      },
      'notes': []
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.gross_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.sales_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'gross_sales_components'
          }
        }
      },
      {
        'id': 'derived.sales_deductions',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'sales_deduction_components'
        }
      },
      {
        'id': 'derived.net_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_sales_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.gross_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.sales_deductions'
            }
          }
        }
      },
      {
        'id': 'derived.cost_of_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.cost_of_sales_reported',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'cost_of_sales_components'
          }
        }
      },
      {
        'id': 'derived.gross_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.gross_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.net_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.cost_of_sales'
            }
          }
        }
      },
      {
        'id': 'derived.operating_expenses',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'operating_expense_components'
        }
      },
      {
        'id': 'derived.operating_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.operating_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'add',
              'operands': [
                {
                  'op': 'derived',
                  'id': 'derived.gross_profit'
                },
                {
                  'op': 'account',
                  'id': 'is.other_operating_income'
                }
              ]
            },
            'right': {
              'op': 'derived',
              'id': 'derived.operating_expenses'
            }
          }
        }
      },
      {
        'id': 'derived.net_income',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_income_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'add',
              'operands': [
                {
                  'op': 'derived',
                  'id': 'derived.operating_profit'
                },
                {
                  'op': 'account',
                  'id': 'is.nonoperating_income'
                }
              ]
            },
            'right': {
              'op': 'add',
              'operands': [
                {
                  'op': 'account',
                  'id': 'is.noninterest_nonoperating_expenses'
                },
                {
                  'op': 'account',
                  'id': 'is.interest_expense'
                },
                {
                  'op': 'account',
                  'id': 'is.income_tax_expense'
                }
              ]
            }
          }
        }
      }
    ],
    'conjuntos': {
      'gross_sales_components': [
        'is.product_sales',
        'is.service_revenue',
        'is.other_sales_revenue'
      ],
      'sales_deduction_components': [
        'is.sales_returns',
        'is.sales_discounts',
        'is.sales_allowances'
      ],
      'cost_of_sales_components': [
        'is.merchandise_cost',
        'is.product_cost',
        'is.service_cost'
      ],
      'operating_expense_components': [
        'is.selling_expenses',
        'is.administrative_expenses',
        'is.operating_depreciation',
        'is.operating_amortization',
        'is.other_operating_expenses'
      ]
    },
    'cuentas': [
      {
        'id': 'is.sales_total',
        'canonical_name': 'Ventas totales',
        'definition': 'Total de ingresos por ventas sin desglose de componentes (R5); se reconoce al entregar los bienes o prestar los servicios.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas',
          'ventas ordinarias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.product_sales',
        'canonical_name': 'Ventas de productos',
        'definition': 'Ingresos por venta de bienes; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de mercaderías',
          'ventas de bienes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ventas de productos» (is.product_sales) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_revenue',
        'canonical_name': 'Ingresos por servicios',
        'definition': 'Ingresos por servicios prestados; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de servicios',
          'ingresos por servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ingresos por servicios» (is.service_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.other_sales_revenue',
        'canonical_name': 'Otras ventas ordinarias',
        'definition': 'Ventas operativas menores sin cuenta específica; solo si efectivamente son ventas.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otras ventas',
          'otras ventas operativas si efectivamente son ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Otras ventas ordinarias» (is.other_sales_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.sales_returns',
        'canonical_name': 'Devoluciones sobre ventas',
        'definition': 'Contra-ingreso por bienes devueltos por clientes; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Devoluciones de ventas',
          'ventas devueltas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_discounts',
        'canonical_name': 'Descuentos sobre ventas',
        'definition': 'Contra-ingreso por descuentos concedidos; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Descuentos concedidos sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_allowances',
        'canonical_name': 'Rebajas sobre ventas',
        'definition': 'Contra-ingreso por rebajas y bonificaciones; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Rebajas y bonificaciones sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.net_sales_reported',
        'canonical_name': 'Ventas netas reportadas',
        'definition': 'Ventas netas de devoluciones, descuentos y rebajas, reportadas directamente por el ejercicio.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas netas',
          'ventas netas totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.cost_of_sales_reported',
        'canonical_name': 'Costo de ventas reportado',
        'definition': 'Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Costo de ventas',
          'costo de los bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.merchandise_cost',
        'canonical_name': 'Costo de mercadería vendida',
        'definition': 'Coste de las mercaderías vendidas en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de ventas de mercaderías',
          'costo de bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.product_cost',
        'canonical_name': 'Costo de productos vendidos',
        'definition': 'Coste de producción de los productos vendidos en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de producción vendido',
          'costo de productos vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de productos vendidos» (is.product_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_cost',
        'canonical_name': 'Costo de servicios',
        'definition': 'Coste directo de los servicios prestados en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costos de servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.gross_profit_reported',
        'canonical_name': 'Utilidad bruta reportada',
        'definition': 'Diferencia entre ventas netas y costo de ventas, reportada por el ejercicio; una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ganancia bruta',
          'resultado bruto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.selling_expenses',
        'canonical_name': 'Gastos de ventas',
        'definition': 'Gastos de distribución y promoción de ventas del periodo (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos comerciales',
          'gastos de distribución si el criterio de clase los clasifica como operativos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.administrative_expenses',
        'canonical_name': 'Gastos administrativos',
        'definition': 'Gastos de la administración general del periodo (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos de administración',
          'gastos generales y administrativos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_depreciation',
        'canonical_name': 'Depreciación operativa',
        'definition': 'Gasto de depreciación del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación con costo de ventas o gastos administrativos.',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Depreciación de activos usados en operaciones, solo si no está incluida ya en otra cuenta agregada utilizada'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_amortization',
        'canonical_name': 'Amortización operativa',
        'definition': 'Gasto de amortización del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación.',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Amortización de activos usados en operaciones, bajo la misma regla de no duplicación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.other_operating_expenses',
        'canonical_name': 'Otros gastos operativos',
        'definition': 'Gastos operativos menores sin cuenta específica (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros gastos de operación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.other_operating_income',
        'canonical_name': 'Otros ingresos operativos',
        'definition': 'Ingresos derivados de la actividad operativa que no son ventas (participaciones, excedentes operativos).',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros ingresos de operación si pertenecen a la actividad operativa'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_profit_reported',
        'canonical_name': 'Utilidad operativa reportada',
        'definition': 'Utilidad de la operación reportada por el ejercicio (utilidad bruta menos gastos operativos); una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Resultado operativo',
          'utilidad de operación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.nonoperating_income',
        'canonical_name': 'Ingresos no operativos',
        'definition': 'Ingresos ajenos a la operación principal (arrendamientos, plusvalías, intereses ganados); entran en utilidad neta, no en la operativa (D5).',
        'statement': 'estado_resultados',
        'classification': 'no_operativo',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros ingresos no operativos',
          'ingresos financieros no clasificados en otra cuenta específica'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.noninterest_nonoperating_expenses',
        'canonical_name': 'Gastos no operativos distintos de intereses',
        'definition': 'Gastos ajenos a la operación que no son intereses; entran en utilidad neta, no en la operativa (D5).',
        'statement': 'estado_resultados',
        'classification': 'no_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros gastos no operativos',
          'gastos no operacionales excluyendo intereses identificados por separado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.interest_expense',
        'canonical_name': 'Gastos por intereses',
        'definition': 'Costos de financiación de deudas; si es cero, la cobertura de intereses queda en `zero_denominator` (D, razón 11).',
        'statement': 'estado_resultados',
        'classification': 'financiero',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Intereses pagados o devengados',
          'gastos financieros por intereses'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 23 Borrowing Costs',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/',
              'source_type': 'accounting_standard',
              'supports': '"Borrowing costs are interest and other costs that an entity incurs". Frase textual de IAS 23 Borrowing Costs, abierto el 2026-10-15; confirma la definición de «Gastos por intereses» (is.interest_expense) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.income_tax_expense',
        'canonical_name': 'Gasto por impuesto sobre la renta',
        'definition': 'Impuesto corriente sobre la utilidad del periodo; se resta después de la utilidad antes de impuestos (D6).',
        'statement': 'estado_resultados',
        'classification': 'impuesto',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Impuesto sobre la renta',
          'impuesto a las ganancias del período'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 12 Income Taxes',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/',
              'source_type': 'accounting_standard',
              'supports': '"Income taxes include all domestic and foreign taxes that are based on taxable profits". Frase textual de IAS 12 Income Taxes, abierto el 2026-10-15; confirma la definición de «Gasto por impuesto sobre la renta» (is.income_tax_expense) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.net_income_reported',
        'canonical_name': 'Utilidad neta reportada',
        'definition': 'Resultado final después de impuestos reportado por el ejercicio; una pérdida conserva signo negativo (D6).',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Utilidad del ejercicio',
          'ganancia neta',
          'resultado neto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'point_in_time',
      'value': 'saldos de cierre del periodo',
      'average': null,
      'control_global': null
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'rentabilidad_margen_utilidad_operativa': {
    'schema_version': '2.0',
    'razon': {
      'id': 'rentabilidad_margen_utilidad_operativa',
      'name': 'Margen de utilidad operativa',
      'category': 'rentabilidad',
      'formula_as_provided': 'Utilidad operativa / Ventas',
      'unit': 'porcentaje',
      'period_mode': 'point_in_time',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.operating_profit'
        },
        'denominator': {
          'op': 'derived',
          'id': 'derived.net_sales'
        }
      },
      'notes': []
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.gross_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.sales_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'gross_sales_components'
          }
        }
      },
      {
        'id': 'derived.sales_deductions',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'sales_deduction_components'
        }
      },
      {
        'id': 'derived.net_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_sales_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.gross_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.sales_deductions'
            }
          }
        }
      },
      {
        'id': 'derived.cost_of_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.cost_of_sales_reported',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'cost_of_sales_components'
          }
        }
      },
      {
        'id': 'derived.gross_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.gross_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.net_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.cost_of_sales'
            }
          }
        }
      },
      {
        'id': 'derived.operating_expenses',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'operating_expense_components'
        }
      },
      {
        'id': 'derived.operating_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.operating_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'add',
              'operands': [
                {
                  'op': 'derived',
                  'id': 'derived.gross_profit'
                },
                {
                  'op': 'account',
                  'id': 'is.other_operating_income'
                }
              ]
            },
            'right': {
              'op': 'derived',
              'id': 'derived.operating_expenses'
            }
          }
        }
      }
    ],
    'conjuntos': {
      'gross_sales_components': [
        'is.product_sales',
        'is.service_revenue',
        'is.other_sales_revenue'
      ],
      'sales_deduction_components': [
        'is.sales_returns',
        'is.sales_discounts',
        'is.sales_allowances'
      ],
      'cost_of_sales_components': [
        'is.merchandise_cost',
        'is.product_cost',
        'is.service_cost'
      ],
      'operating_expense_components': [
        'is.selling_expenses',
        'is.administrative_expenses',
        'is.operating_depreciation',
        'is.operating_amortization',
        'is.other_operating_expenses'
      ]
    },
    'cuentas': [
      {
        'id': 'is.sales_total',
        'canonical_name': 'Ventas totales',
        'definition': 'Total de ingresos por ventas sin desglose de componentes (R5); se reconoce al entregar los bienes o prestar los servicios.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas',
          'ventas ordinarias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.product_sales',
        'canonical_name': 'Ventas de productos',
        'definition': 'Ingresos por venta de bienes; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de mercaderías',
          'ventas de bienes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ventas de productos» (is.product_sales) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_revenue',
        'canonical_name': 'Ingresos por servicios',
        'definition': 'Ingresos por servicios prestados; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de servicios',
          'ingresos por servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ingresos por servicios» (is.service_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.other_sales_revenue',
        'canonical_name': 'Otras ventas ordinarias',
        'definition': 'Ventas operativas menores sin cuenta específica; solo si efectivamente son ventas.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otras ventas',
          'otras ventas operativas si efectivamente son ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Otras ventas ordinarias» (is.other_sales_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.sales_returns',
        'canonical_name': 'Devoluciones sobre ventas',
        'definition': 'Contra-ingreso por bienes devueltos por clientes; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Devoluciones de ventas',
          'ventas devueltas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_discounts',
        'canonical_name': 'Descuentos sobre ventas',
        'definition': 'Contra-ingreso por descuentos concedidos; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Descuentos concedidos sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_allowances',
        'canonical_name': 'Rebajas sobre ventas',
        'definition': 'Contra-ingreso por rebajas y bonificaciones; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Rebajas y bonificaciones sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.net_sales_reported',
        'canonical_name': 'Ventas netas reportadas',
        'definition': 'Ventas netas de devoluciones, descuentos y rebajas, reportadas directamente por el ejercicio.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas netas',
          'ventas netas totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.cost_of_sales_reported',
        'canonical_name': 'Costo de ventas reportado',
        'definition': 'Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Costo de ventas',
          'costo de los bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.merchandise_cost',
        'canonical_name': 'Costo de mercadería vendida',
        'definition': 'Coste de las mercaderías vendidas en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de ventas de mercaderías',
          'costo de bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.product_cost',
        'canonical_name': 'Costo de productos vendidos',
        'definition': 'Coste de producción de los productos vendidos en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de producción vendido',
          'costo de productos vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de productos vendidos» (is.product_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_cost',
        'canonical_name': 'Costo de servicios',
        'definition': 'Coste directo de los servicios prestados en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costos de servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.gross_profit_reported',
        'canonical_name': 'Utilidad bruta reportada',
        'definition': 'Diferencia entre ventas netas y costo de ventas, reportada por el ejercicio; una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ganancia bruta',
          'resultado bruto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.selling_expenses',
        'canonical_name': 'Gastos de ventas',
        'definition': 'Gastos de distribución y promoción de ventas del periodo (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos comerciales',
          'gastos de distribución si el criterio de clase los clasifica como operativos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.administrative_expenses',
        'canonical_name': 'Gastos administrativos',
        'definition': 'Gastos de la administración general del periodo (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos de administración',
          'gastos generales y administrativos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_depreciation',
        'canonical_name': 'Depreciación operativa',
        'definition': 'Gasto de depreciación del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación con costo de ventas o gastos administrativos.',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Depreciación de activos usados en operaciones, solo si no está incluida ya en otra cuenta agregada utilizada'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_amortization',
        'canonical_name': 'Amortización operativa',
        'definition': 'Gasto de amortización del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación.',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Amortización de activos usados en operaciones, bajo la misma regla de no duplicación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.other_operating_expenses',
        'canonical_name': 'Otros gastos operativos',
        'definition': 'Gastos operativos menores sin cuenta específica (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros gastos de operación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.other_operating_income',
        'canonical_name': 'Otros ingresos operativos',
        'definition': 'Ingresos derivados de la actividad operativa que no son ventas (participaciones, excedentes operativos).',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros ingresos de operación si pertenecen a la actividad operativa'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_profit_reported',
        'canonical_name': 'Utilidad operativa reportada',
        'definition': 'Utilidad de la operación reportada por el ejercicio (utilidad bruta menos gastos operativos); una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Resultado operativo',
          'utilidad de operación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'point_in_time',
      'value': 'saldos de cierre del periodo',
      'average': null,
      'control_global': null
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'rentabilidad_roa': {
    'schema_version': '2.0',
    'razon': {
      'id': 'rentabilidad_roa',
      'name': 'ROA',
      'category': 'rentabilidad',
      'formula_as_provided': 'Utilidad neta / Activos totales promedio',
      'unit': 'porcentaje',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.net_income'
        },
        'denominator': {
          'op': 'average',
          'of': {
            'op': 'derived',
            'id': 'derived.total_assets'
          }
        }
      },
      'notes': [
        'DIFERENCIA_CONOCIDA_PROFESOR: ROA 2024 — profesor: 12.70 %; este trabajo: 12.89 % — motivo: D1: promedio.'
      ]
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.gross_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.sales_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'gross_sales_components'
          }
        }
      },
      {
        'id': 'derived.sales_deductions',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'sales_deduction_components'
        }
      },
      {
        'id': 'derived.net_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_sales_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.gross_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.sales_deductions'
            }
          }
        }
      },
      {
        'id': 'derived.cost_of_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.cost_of_sales_reported',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'cost_of_sales_components'
          }
        }
      },
      {
        'id': 'derived.gross_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.gross_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.net_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.cost_of_sales'
            }
          }
        }
      },
      {
        'id': 'derived.operating_expenses',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'operating_expense_components'
        }
      },
      {
        'id': 'derived.operating_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.operating_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'add',
              'operands': [
                {
                  'op': 'derived',
                  'id': 'derived.gross_profit'
                },
                {
                  'op': 'account',
                  'id': 'is.other_operating_income'
                }
              ]
            },
            'right': {
              'op': 'derived',
              'id': 'derived.operating_expenses'
            }
          }
        }
      },
      {
        'id': 'derived.net_income',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_income_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'add',
              'operands': [
                {
                  'op': 'derived',
                  'id': 'derived.operating_profit'
                },
                {
                  'op': 'account',
                  'id': 'is.nonoperating_income'
                }
              ]
            },
            'right': {
              'op': 'add',
              'operands': [
                {
                  'op': 'account',
                  'id': 'is.noninterest_nonoperating_expenses'
                },
                {
                  'op': 'account',
                  'id': 'is.interest_expense'
                },
                {
                  'op': 'account',
                  'id': 'is.income_tax_expense'
                }
              ]
            }
          }
        }
      },
      {
        'id': 'derived.inventory_total',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.inventory_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'inventory_components'
          }
        }
      },
      {
        'id': 'derived.current_assets',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.current_assets_total',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'sum_accounts',
                'account_set': 'current_assets_excluding_inventory'
              },
              {
                'op': 'derived',
                'id': 'derived.inventory_total'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.fixed_assets_net',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.fixed_assets_net_total',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'sum_accounts',
                'account_set': 'ppe_components'
              },
              {
                'op': 'account',
                'id': 'bs.accumulated_depreciation'
              }
            ]
          }
        }
      },
      {
        'id': 'derived.total_assets',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.total_assets',
          'calculation': {
            'op': 'add',
            'operands': [
              {
                'op': 'derived',
                'id': 'derived.current_assets'
              },
              {
                'op': 'derived',
                'id': 'derived.fixed_assets_net'
              },
              {
                'op': 'account',
                'id': 'bs.intangible_assets'
              },
              {
                'op': 'sum_accounts',
                'account_set': 'other_noncurrent_assets_components'
              }
            ]
          }
        }
      }
    ],
    'conjuntos': {
      'gross_sales_components': [
        'is.product_sales',
        'is.service_revenue',
        'is.other_sales_revenue'
      ],
      'sales_deduction_components': [
        'is.sales_returns',
        'is.sales_discounts',
        'is.sales_allowances'
      ],
      'cost_of_sales_components': [
        'is.merchandise_cost',
        'is.product_cost',
        'is.service_cost'
      ],
      'operating_expense_components': [
        'is.selling_expenses',
        'is.administrative_expenses',
        'is.operating_depreciation',
        'is.operating_amortization',
        'is.other_operating_expenses'
      ],
      'current_assets_excluding_inventory': [
        'bs.cash_and_equivalents',
        'bs.short_term_investments',
        'bs.trade_receivables',
        'bs.other_current_receivables',
        'bs.prepaid_expenses',
        'bs.other_current_assets'
      ],
      'inventory_components': [
        'bs.inventory_merchandise',
        'bs.inventory_raw_materials',
        'bs.inventory_work_in_process',
        'bs.inventory_finished_goods'
      ],
      'ppe_components': [
        'bs.ppe_land',
        'bs.ppe_buildings',
        'bs.ppe_machinery',
        'bs.ppe_vehicles',
        'bs.ppe_furniture',
        'bs.ppe_other'
      ],
      'other_noncurrent_assets_components': [
        'bs.long_term_investments',
        'bs.other_noncurrent_assets'
      ]
    },
    'cuentas': [
      {
        'id': 'is.sales_total',
        'canonical_name': 'Ventas totales',
        'definition': 'Total de ingresos por ventas sin desglose de componentes (R5); se reconoce al entregar los bienes o prestar los servicios.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas',
          'ventas ordinarias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.product_sales',
        'canonical_name': 'Ventas de productos',
        'definition': 'Ingresos por venta de bienes; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de mercaderías',
          'ventas de bienes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ventas de productos» (is.product_sales) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_revenue',
        'canonical_name': 'Ingresos por servicios',
        'definition': 'Ingresos por servicios prestados; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de servicios',
          'ingresos por servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ingresos por servicios» (is.service_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.other_sales_revenue',
        'canonical_name': 'Otras ventas ordinarias',
        'definition': 'Ventas operativas menores sin cuenta específica; solo si efectivamente son ventas.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otras ventas',
          'otras ventas operativas si efectivamente son ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Otras ventas ordinarias» (is.other_sales_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.sales_returns',
        'canonical_name': 'Devoluciones sobre ventas',
        'definition': 'Contra-ingreso por bienes devueltos por clientes; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Devoluciones de ventas',
          'ventas devueltas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_discounts',
        'canonical_name': 'Descuentos sobre ventas',
        'definition': 'Contra-ingreso por descuentos concedidos; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Descuentos concedidos sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_allowances',
        'canonical_name': 'Rebajas sobre ventas',
        'definition': 'Contra-ingreso por rebajas y bonificaciones; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Rebajas y bonificaciones sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.net_sales_reported',
        'canonical_name': 'Ventas netas reportadas',
        'definition': 'Ventas netas de devoluciones, descuentos y rebajas, reportadas directamente por el ejercicio.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas netas',
          'ventas netas totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.cost_of_sales_reported',
        'canonical_name': 'Costo de ventas reportado',
        'definition': 'Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Costo de ventas',
          'costo de los bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.merchandise_cost',
        'canonical_name': 'Costo de mercadería vendida',
        'definition': 'Coste de las mercaderías vendidas en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de ventas de mercaderías',
          'costo de bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.product_cost',
        'canonical_name': 'Costo de productos vendidos',
        'definition': 'Coste de producción de los productos vendidos en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de producción vendido',
          'costo de productos vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de productos vendidos» (is.product_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_cost',
        'canonical_name': 'Costo de servicios',
        'definition': 'Coste directo de los servicios prestados en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costos de servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.gross_profit_reported',
        'canonical_name': 'Utilidad bruta reportada',
        'definition': 'Diferencia entre ventas netas y costo de ventas, reportada por el ejercicio; una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ganancia bruta',
          'resultado bruto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.selling_expenses',
        'canonical_name': 'Gastos de ventas',
        'definition': 'Gastos de distribución y promoción de ventas del periodo (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos comerciales',
          'gastos de distribución si el criterio de clase los clasifica como operativos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.administrative_expenses',
        'canonical_name': 'Gastos administrativos',
        'definition': 'Gastos de la administración general del periodo (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos de administración',
          'gastos generales y administrativos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_depreciation',
        'canonical_name': 'Depreciación operativa',
        'definition': 'Gasto de depreciación del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación con costo de ventas o gastos administrativos.',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Depreciación de activos usados en operaciones, solo si no está incluida ya en otra cuenta agregada utilizada'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_amortization',
        'canonical_name': 'Amortización operativa',
        'definition': 'Gasto de amortización del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación.',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Amortización de activos usados en operaciones, bajo la misma regla de no duplicación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.other_operating_expenses',
        'canonical_name': 'Otros gastos operativos',
        'definition': 'Gastos operativos menores sin cuenta específica (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros gastos de operación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.other_operating_income',
        'canonical_name': 'Otros ingresos operativos',
        'definition': 'Ingresos derivados de la actividad operativa que no son ventas (participaciones, excedentes operativos).',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros ingresos de operación si pertenecen a la actividad operativa'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_profit_reported',
        'canonical_name': 'Utilidad operativa reportada',
        'definition': 'Utilidad de la operación reportada por el ejercicio (utilidad bruta menos gastos operativos); una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Resultado operativo',
          'utilidad de operación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.nonoperating_income',
        'canonical_name': 'Ingresos no operativos',
        'definition': 'Ingresos ajenos a la operación principal (arrendamientos, plusvalías, intereses ganados); entran en utilidad neta, no en la operativa (D5).',
        'statement': 'estado_resultados',
        'classification': 'no_operativo',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros ingresos no operativos',
          'ingresos financieros no clasificados en otra cuenta específica'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.noninterest_nonoperating_expenses',
        'canonical_name': 'Gastos no operativos distintos de intereses',
        'definition': 'Gastos ajenos a la operación que no son intereses; entran en utilidad neta, no en la operativa (D5).',
        'statement': 'estado_resultados',
        'classification': 'no_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros gastos no operativos',
          'gastos no operacionales excluyendo intereses identificados por separado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.interest_expense',
        'canonical_name': 'Gastos por intereses',
        'definition': 'Costos de financiación de deudas; si es cero, la cobertura de intereses queda en `zero_denominator` (D, razón 11).',
        'statement': 'estado_resultados',
        'classification': 'financiero',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Intereses pagados o devengados',
          'gastos financieros por intereses'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 23 Borrowing Costs',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/',
              'source_type': 'accounting_standard',
              'supports': '"Borrowing costs are interest and other costs that an entity incurs". Frase textual de IAS 23 Borrowing Costs, abierto el 2026-10-15; confirma la definición de «Gastos por intereses» (is.interest_expense) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.income_tax_expense',
        'canonical_name': 'Gasto por impuesto sobre la renta',
        'definition': 'Impuesto corriente sobre la utilidad del periodo; se resta después de la utilidad antes de impuestos (D6).',
        'statement': 'estado_resultados',
        'classification': 'impuesto',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Impuesto sobre la renta',
          'impuesto a las ganancias del período'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 12 Income Taxes',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/',
              'source_type': 'accounting_standard',
              'supports': '"Income taxes include all domestic and foreign taxes that are based on taxable profits". Frase textual de IAS 12 Income Taxes, abierto el 2026-10-15; confirma la definición de «Gasto por impuesto sobre la renta» (is.income_tax_expense) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.net_income_reported',
        'canonical_name': 'Utilidad neta reportada',
        'definition': 'Resultado final después de impuestos reportado por el ejercicio; una pérdida conserva signo negativo (D6).',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Utilidad del ejercicio',
          'ganancia neta',
          'resultado neto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_assets_total',
        'canonical_name': 'Total de activos corrientes',
        'definition': 'Subtotal de activos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total activo corriente',
          'total activo circulante'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.cash_and_equivalents',
        'canonical_name': 'Efectivo y equivalentes',
        'definition': 'Medios de pago disponibles y equivalentes de efectivo; su saldo crece con cobros y disminuye con pagos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Efectivo',
          'caja',
          'bancos',
          'caja y bancos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.short_term_investments',
        'canonical_name': 'Inversiones de corto plazo',
        'definition': 'Valores negociables u otros instrumentos con vencimiento o disponibilidad dentro del corto plazo.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Inversiones temporales',
          'valores negociables de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 7 Statement of Cash Flows',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/',
              'source_type': 'accounting_standard',
              'supports': '"Cash equivalents are short-term, highly liquid investments". Frase textual de IAS 7 Statement of Cash Flows, abierto el 2026-10-15; confirma la definición de «Inversiones de corto plazo» (bs.short_term_investments) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.trade_receivables',
        'canonical_name': 'Cuentas por cobrar comerciales',
        'definition': 'Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'CxC',
          'clientes',
          'cuentas por cobrar a clientes',
          'deudores comerciales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_receivables',
        'canonical_name': 'Otras cuentas por cobrar corrientes',
        'definition': 'Cobros distintos de las ventas comerciales con recuperación dentro del corto plazo (anticipos, deudores varios).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Deudores varios corrientes',
          'otras cuentas por cobrar de corto plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_total',
        'canonical_name': 'Inventario total',
        'definition': 'Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Inventario',
          'existencias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.inventory_merchandise',
        'canonical_name': 'Inventario de mercaderías',
        'definition': 'Bienes adquiridos para revender sin transformación; mide su coste de adquisición.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mercaderías',
          'mercancías',
          'inventario para la venta'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"Inventories are measured at the lower of cost and net realisable value". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de mercaderías» (bs.inventory_merchandise) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_raw_materials',
        'canonical_name': 'Inventario de materias primas',
        'definition': 'Materiales adquiridos para la producción que aún no se han transformado.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Materias primas',
          'materiales en almacén para producción'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de materias primas» (bs.inventory_raw_materials) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_work_in_process',
        'canonical_name': 'Inventario de productos en proceso',
        'definition': 'Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Producción en proceso',
          'productos en proceso'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"costs of conversion (direct labour and production overhead)". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos en proceso» (bs.inventory_work_in_process) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.inventory_finished_goods',
        'canonical_name': 'Inventario de productos terminados',
        'definition': 'Producto terminado listo para la venta; se lleva a costo de ventas al venderse.',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Productos terminados',
          'bienes terminados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Inventario de productos terminados» (bs.inventory_finished_goods) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.prepaid_expenses',
        'canonical_name': 'Gastos pagados por anticipado',
        'definition': 'Pagos realizados por adelantado que se consumen como gasto en periodos futuros (seguros, rentas).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Pagos anticipados',
          'seguros pagados por anticipado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_current_assets',
        'canonical_name': 'Otros activos corrientes',
        'definition': 'Activos corrientes que no tienen una cuenta específica (anticipos, impuestos a favor de corto plazo).',
        'statement': 'balance_general',
        'classification': 'activo_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros activos circulantes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.fixed_assets_net_total',
        'canonical_name': 'Total de activos fijos netos',
        'definition': 'Subtotal neto de activos fijos reportado por el ejercicio; si existe, sustituye a la suma de componentes con depreciación (D3).',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Activo fijo neto',
          'propiedad planta y equipo neto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Total de activos fijos netos» (bs.fixed_assets_net_total) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_land',
        'canonical_name': 'Terrenos',
        'definition': 'Terrenos ocupados o destinados a la operación; no se deprecian.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Terrenos de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Terrenos» (bs.ppe_land) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_buildings',
        'canonical_name': 'Edificios e instalaciones',
        'definition': 'Construcciones usadas en la operación; su coste se deprecia a lo largo de su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Edificios',
          'construcciones de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Edificios e instalaciones» (bs.ppe_buildings) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_machinery',
        'canonical_name': 'Maquinaria y equipo',
        'definition': 'Maquinaria y equipo utilizados en la producción o la operación; se deprecian por uso o por tiempo.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Maquinaria',
          'equipo productivo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Equipos»: el detalle de la cuenta es incierto, pero su clasificación en activo fijo es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 16 trata elementos tangibles mantenidos para usarlos en la producción o suministro de bienes o servicios y exige reconocerlos como activo por su costo. Confirma la definición de «Maquinaria y equipo» (bs.ppe_machinery).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_vehicles',
        'canonical_name': 'Vehículos',
        'definition': 'Vehículos usados en la operación; se deprecian a lo largo de su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Equipo de transporte',
          'vehículos de uso operativo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Vehículos» (bs.ppe_vehicles) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_furniture',
        'canonical_name': 'Mobiliario y equipo de oficina',
        'definition': 'Mobiliario y equipo de oficina en servicio; se deprecian por su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Mobiliario',
          'muebles y enseres',
          'equipo de oficina'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Mobiliario y equipo de oficina» (bs.ppe_furniture) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.ppe_other',
        'canonical_name': 'Otros activos fijos tangibles',
        'definition': 'Bienes tangibles de la operación sin una cuenta específica; se deprecian según su vida útil.',
        'statement': 'balance_general',
        'classification': 'activo_fijo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Propiedad, planta y equipo',
          'otros activos fijos tangibles'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 16 Property, Plant and Equipment',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
              'source_type': 'accounting_standard',
              'supports': '"Property, plant and equipment are tangible items". Frase textual de IAS 16 Property, Plant and Equipment, abierto el 2026-10-15; confirma la definición de «Otros activos fijos tangibles» (bs.ppe_other) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.accumulated_depreciation',
        'canonical_name': 'Depreciación acumulada',
        'definition': 'Cuenta correctora que acumula el desgaste reconocido de los activos fijos; llega negativa y se suma con su signo (D13).',
        'statement': 'balance_general',
        'classification': 'correctora_activo',
        'account_role': 'contra_account',
        'normal_balance': 'acreedor',
        'value_semantics': 'contra_asset',
        'absence_policy': 'requires_data',
        'synonyms': [
          'Depreciación acumulada de activos fijos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.intangible_assets',
        'canonical_name': 'Activos intangibles',
        'definition': 'Activos no monetarios no financieros identificables sin sustancia física (software, patentes); se amortizan. Si no se reportan, aportan cero a activos totales (D12).',
        'statement': 'balance_general',
        'classification': 'activo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Intangibles',
          'software capitalizado',
          'patentes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 38 Intangible Assets',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/',
              'source_type': 'accounting_standard',
              'supports': '"An intangible asset is an identifiable non-monetary asset without physical substance". Frase textual de IAS 38 Intangible Assets, abierto el 2026-10-15; confirma la definición de «Activos intangibles» (bs.intangible_assets) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.long_term_investments',
        'canonical_name': 'Inversiones de largo plazo',
        'definition': 'Inversiones con disponibilidad o recuperación más allá del corto plazo.',
        'statement': 'balance_general',
        'classification': 'activo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Inversiones permanentes',
          'inversiones no corrientes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_noncurrent_assets',
        'canonical_name': 'Otros activos no corrientes',
        'definition': 'Activos no corrientes sin cuenta específica (derechos a largo plazo, anticipos a largo plazo).',
        'statement': 'balance_general',
        'classification': 'activo_no_corriente',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros activos a largo plazo'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.total_assets',
        'canonical_name': 'Total de activos',
        'definition': 'Total de activos reportado por el ejercicio; si existe, sustituye al cálculo activo corriente + activos fijos netos + intangibles (D4).',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Total activo',
          'activo total',
          'total de recursos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  },
  'rentabilidad_roe': {
    'schema_version': '2.0',
    'razon': {
      'id': 'rentabilidad_roe',
      'name': 'ROE',
      'category': 'rentabilidad',
      'formula_as_provided': 'Utilidad neta / Patrimonio promedio',
      'unit': 'porcentaje',
      'period_mode': 'flow_with_average_balance',
      'formula': {
        'op': 'divide',
        'numerator': {
          'op': 'derived',
          'id': 'derived.net_income'
        },
        'denominator': {
          'op': 'average',
          'of': {
            'op': 'derived',
            'id': 'derived.total_equity'
          }
        }
      },
      'notes': [
        'DIFERENCIA_CONOCIDA_PROFESOR: ROE 2024 — profesor: 18.00 %; este trabajo: 19.06 % — motivo: D1: promedio.'
      ]
    },
    'razones_dependientes': [],
    'derivados': [
      {
        'id': 'derived.gross_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.sales_total',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'gross_sales_components'
          }
        }
      },
      {
        'id': 'derived.sales_deductions',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'sales_deduction_components'
        }
      },
      {
        'id': 'derived.net_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_sales_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.gross_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.sales_deductions'
            }
          }
        }
      },
      {
        'id': 'derived.cost_of_sales',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.cost_of_sales_reported',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'cost_of_sales_components'
          }
        }
      },
      {
        'id': 'derived.gross_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.gross_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'derived',
              'id': 'derived.net_sales'
            },
            'right': {
              'op': 'derived',
              'id': 'derived.cost_of_sales'
            }
          }
        }
      },
      {
        'id': 'derived.operating_expenses',
        'kind': 'flow',
        'formula': {
          'op': 'sum_accounts',
          'account_set': 'operating_expense_components'
        }
      },
      {
        'id': 'derived.operating_profit',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.operating_profit_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'add',
              'operands': [
                {
                  'op': 'derived',
                  'id': 'derived.gross_profit'
                },
                {
                  'op': 'account',
                  'id': 'is.other_operating_income'
                }
              ]
            },
            'right': {
              'op': 'derived',
              'id': 'derived.operating_expenses'
            }
          }
        }
      },
      {
        'id': 'derived.net_income',
        'kind': 'flow',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'is.net_income_reported',
          'calculation': {
            'op': 'subtract',
            'left': {
              'op': 'add',
              'operands': [
                {
                  'op': 'derived',
                  'id': 'derived.operating_profit'
                },
                {
                  'op': 'account',
                  'id': 'is.nonoperating_income'
                }
              ]
            },
            'right': {
              'op': 'add',
              'operands': [
                {
                  'op': 'account',
                  'id': 'is.noninterest_nonoperating_expenses'
                },
                {
                  'op': 'account',
                  'id': 'is.interest_expense'
                },
                {
                  'op': 'account',
                  'id': 'is.income_tax_expense'
                }
              ]
            }
          }
        }
      },
      {
        'id': 'derived.total_equity',
        'kind': 'balance',
        'formula': {
          'op': 'reported_or_calculate',
          'reported': 'bs.total_equity',
          'calculation': {
            'op': 'sum_accounts',
            'account_set': 'patrimony_components'
          }
        }
      }
    ],
    'conjuntos': {
      'gross_sales_components': [
        'is.product_sales',
        'is.service_revenue',
        'is.other_sales_revenue'
      ],
      'sales_deduction_components': [
        'is.sales_returns',
        'is.sales_discounts',
        'is.sales_allowances'
      ],
      'cost_of_sales_components': [
        'is.merchandise_cost',
        'is.product_cost',
        'is.service_cost'
      ],
      'operating_expense_components': [
        'is.selling_expenses',
        'is.administrative_expenses',
        'is.operating_depreciation',
        'is.operating_amortization',
        'is.other_operating_expenses'
      ],
      'patrimony_components': [
        'bs.share_capital',
        'bs.additional_paid_in_capital',
        'bs.legal_reserve',
        'bs.other_reserves',
        'bs.retained_earnings',
        'bs.current_year_result_equity',
        'bs.other_equity_components'
      ]
    },
    'cuentas': [
      {
        'id': 'is.sales_total',
        'canonical_name': 'Ventas totales',
        'definition': 'Total de ingresos por ventas sin desglose de componentes (R5); se reconoce al entregar los bienes o prestar los servicios.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas',
          'ventas ordinarias totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo.'
        ],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.product_sales',
        'canonical_name': 'Ventas de productos',
        'definition': 'Ingresos por venta de bienes; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de mercaderías',
          'ventas de bienes'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ventas de productos» (is.product_sales) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_revenue',
        'canonical_name': 'Ingresos por servicios',
        'definition': 'Ingresos por servicios prestados; contribuyen a ventas brutas cuando no existe total reportado.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Ventas de servicios',
          'ingresos por servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Ingresos por servicios» (is.service_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.other_sales_revenue',
        'canonical_name': 'Otras ventas ordinarias',
        'definition': 'Ventas operativas menores sin cuenta específica; solo si efectivamente son ventas.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otras ventas',
          'otras ventas operativas si efectivamente son ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IFRS 15 Revenue from Contracts with Customers',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
              'source_type': 'accounting_standard',
              'supports': '"recognises revenue to depict the transfer of promised goods or services to the customer". Frase textual de IFRS 15 Revenue from Contracts with Customers, abierto el 2026-10-15; confirma la definición de «Otras ventas ordinarias» (is.other_sales_revenue) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.sales_returns',
        'canonical_name': 'Devoluciones sobre ventas',
        'definition': 'Contra-ingreso por bienes devueltos por clientes; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Devoluciones de ventas',
          'ventas devueltas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_discounts',
        'canonical_name': 'Descuentos sobre ventas',
        'definition': 'Contra-ingreso por descuentos concedidos; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Descuentos concedidos sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.sales_allowances',
        'canonical_name': 'Rebajas sobre ventas',
        'definition': 'Contra-ingreso por rebajas y bonificaciones; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
        'statement': 'estado_resultados',
        'classification': 'deduccion_ingreso',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'other',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Rebajas y bonificaciones sobre ventas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.net_sales_reported',
        'canonical_name': 'Ventas netas reportadas',
        'definition': 'Ventas netas de devoluciones, descuentos y rebajas, reportadas directamente por el ejercicio.',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ventas netas',
          'ventas netas totales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.cost_of_sales_reported',
        'canonical_name': 'Costo de ventas reportado',
        'definition': 'Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'reported_total',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Costo de ventas',
          'costo de los bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de ventas reportado» (is.cost_of_sales_reported) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.merchandise_cost',
        'canonical_name': 'Costo de mercadería vendida',
        'definition': 'Coste de las mercaderías vendidas en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de ventas de mercaderías',
          'costo de bienes vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"the carrying amount of those inventories is recognised as an expense". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de mercadería vendida» (is.merchandise_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.product_cost',
        'canonical_name': 'Costo de productos vendidos',
        'definition': 'Coste de producción de los productos vendidos en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costo de producción vendido',
          'costo de productos vendidos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 2 Inventories',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
              'source_type': 'accounting_standard',
              'supports': '"The cost of inventories includes all costs of purchase, costs of conversion". Frase textual de IAS 2 Inventories, abierto el 2026-10-15; confirma la definición de «Costo de productos vendidos» (is.product_cost) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.service_cost',
        'canonical_name': 'Costo de servicios',
        'definition': 'Coste directo de los servicios prestados en el periodo.',
        'statement': 'estado_resultados',
        'classification': 'costo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Costos de servicios prestados'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.gross_profit_reported',
        'canonical_name': 'Utilidad bruta reportada',
        'definition': 'Diferencia entre ventas netas y costo de ventas, reportada por el ejercicio; una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Ganancia bruta',
          'resultado bruto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.selling_expenses',
        'canonical_name': 'Gastos de ventas',
        'definition': 'Gastos de distribución y promoción de ventas del periodo (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos comerciales',
          'gastos de distribución si el criterio de clase los clasifica como operativos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.administrative_expenses',
        'canonical_name': 'Gastos administrativos',
        'definition': 'Gastos de la administración general del periodo (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Gastos de administración',
          'gastos generales y administrativos'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_depreciation',
        'canonical_name': 'Depreciación operativa',
        'definition': 'Gasto de depreciación del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación con costo de ventas o gastos administrativos.',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Depreciación de activos usados en operaciones, solo si no está incluida ya en otra cuenta agregada utilizada'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_amortization',
        'canonical_name': 'Amortización operativa',
        'definition': 'Gasto de amortización del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación.',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Amortización de activos usados en operaciones, bajo la misma regla de no duplicación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.other_operating_expenses',
        'canonical_name': 'Otros gastos operativos',
        'definition': 'Gastos operativos menores sin cuenta específica (magnitudes positivas que se restan, D13).',
        'statement': 'estado_resultados',
        'classification': 'gasto_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros gastos de operación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.other_operating_income',
        'canonical_name': 'Otros ingresos operativos',
        'definition': 'Ingresos derivados de la actividad operativa que no son ventas (participaciones, excedentes operativos).',
        'statement': 'estado_resultados',
        'classification': 'ingreso',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros ingresos de operación si pertenecen a la actividad operativa'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.operating_profit_reported',
        'canonical_name': 'Utilidad operativa reportada',
        'definition': 'Utilidad de la operación reportada por el ejercicio (utilidad bruta menos gastos operativos); una pérdida conserva signo negativo.',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Resultado operativo',
          'utilidad de operación'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.nonoperating_income',
        'canonical_name': 'Ingresos no operativos',
        'definition': 'Ingresos ajenos a la operación principal (arrendamientos, plusvalías, intereses ganados); entran en utilidad neta, no en la operativa (D5).',
        'statement': 'estado_resultados',
        'classification': 'no_operativo',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'revenue',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros ingresos no operativos',
          'ingresos financieros no clasificados en otra cuenta específica'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.noninterest_nonoperating_expenses',
        'canonical_name': 'Gastos no operativos distintos de intereses',
        'definition': 'Gastos ajenos a la operación que no son intereses; entran en utilidad neta, no en la operativa (D5).',
        'statement': 'estado_resultados',
        'classification': 'no_operativo',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otros gastos no operativos',
          'gastos no operacionales excluyendo intereses identificados por separado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'is.interest_expense',
        'canonical_name': 'Gastos por intereses',
        'definition': 'Costos de financiación de deudas; si es cero, la cobertura de intereses queda en `zero_denominator` (D, razón 11).',
        'statement': 'estado_resultados',
        'classification': 'financiero',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Intereses pagados o devengados',
          'gastos financieros por intereses'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 23 Borrowing Costs',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/',
              'source_type': 'accounting_standard',
              'supports': '"Borrowing costs are interest and other costs that an entity incurs". Frase textual de IAS 23 Borrowing Costs, abierto el 2026-10-15; confirma la definición de «Gastos por intereses» (is.interest_expense) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.income_tax_expense',
        'canonical_name': 'Gasto por impuesto sobre la renta',
        'definition': 'Impuesto corriente sobre la utilidad del periodo; se resta después de la utilidad antes de impuestos (D6).',
        'statement': 'estado_resultados',
        'classification': 'impuesto',
        'account_role': 'detail',
        'normal_balance': 'deudor',
        'value_semantics': 'expense',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Impuesto sobre la renta',
          'impuesto a las ganancias del período'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 12 Income Taxes',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/',
              'source_type': 'accounting_standard',
              'supports': '"Income taxes include all domestic and foreign taxes that are based on taxable profits". Frase textual de IAS 12 Income Taxes, abierto el 2026-10-15; confirma la definición de «Gasto por impuesto sobre la renta» (is.income_tax_expense) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'is.net_income_reported',
        'canonical_name': 'Utilidad neta reportada',
        'definition': 'Resultado final después de impuestos reportado por el ejercicio; una pérdida conserva signo negativo (D6).',
        'statement': 'estado_resultados',
        'classification': 'resultado',
        'account_role': 'reported_total',
        'normal_balance': 'depends_on_context',
        'value_semantics': 'signed_balance',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Utilidad del ejercicio',
          'ganancia neta',
          'resultado neto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.total_equity',
        'canonical_name': 'Total patrimonio',
        'definition': 'Total del patrimonio reportado por el ejercicio; si existe, sustituye a la suma de `bs.patrimony_components`.',
        'statement': 'balance_general',
        'classification': 'total',
        'account_role': 'reported_total',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'not_applicable',
        'synonyms': [
          'Patrimonio total',
          'capital contable total',
          'patrimonio neto'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.share_capital',
        'canonical_name': 'Capital social',
        'definition': 'Aportes de los propietores representados en títulos; su saldo cambia con aportes y retiros, no con utilidades.',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Capital emitido',
          'capital aportado',
          'capital social pagado'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': [
            {
              'title': 'IAS 32 Financial Instruments: Presentation',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/',
              'source_type': 'accounting_standard',
              'supports': '"financial instruments are classified into financial assets, financial liabilities and equity instruments". Frase textual de IAS 32 Financial Instruments: Presentation, abierto el 2026-10-15; confirma la definición de «Capital social» (bs.share_capital) (D-035).'
            }
          ]
        }
      },
      {
        'id': 'bs.additional_paid_in_capital',
        'canonical_name': 'Aportes adicionales de capital',
        'definition': 'Excedente aportado por encima del valor nominal de las acciones.',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Prima en emisión',
          'aportes adicionales'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.legal_reserve',
        'canonical_name': 'Reserva legal',
        'definition': 'Porción de utilidades retenidas legalmente reservada; no está disponible para distribución.',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Reserva legal acumulada'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Reserva legal: figura del marco legal local, fuera de NIIF; el nombre puede aludir a reservas legales de distintos regímenes. Se clasifica como patrimonio por el nombre y se marca ambiguous porque ninguna norma NIIF la define.'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': []
        }
      },
      {
        'id': 'bs.other_reserves',
        'canonical_name': 'Otras reservas patrimoniales',
        'definition': 'Reservas patrimoniales distintas de la reserva legal (revaluación, estatutarias).',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Reservas',
          'otras reservas de capital o patrimonio'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [
          'Nombre genérico del caso «Reservas»: el detalle de la reserva es incierto, pero su clasificación en el patrimonio es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
        ],
        'research': {
          'status': 'ambiguous',
          'sources': [
            {
              'title': 'IAS 1 Presentation of Financial Statements',
              'organization_or_author': 'IFRS Foundation',
              'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
              'source_type': 'accounting_standard',
              'supports': 'NIC 1 exige presentar un juego completo de estados financieros con pautas de estructura y requisitos mínimos de contenido; es el marco de las partidas y subtotales de cada estado. Confirma la definición de «Otras reservas patrimoniales» (bs.other_reserves).'
            }
          ]
        }
      },
      {
        'id': 'bs.retained_earnings',
        'canonical_name': 'Utilidades retenidas',
        'definition': 'Utilidades acumuladas no distribuidas; su saldo se actualiza con la utilidad del periodo menos dividendos.',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Resultados acumulados',
          'utilidades acumuladas'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.current_year_result_equity',
        'canonical_name': 'Resultado del período incluido en patrimonio',
        'definition': 'Resultado del periodo presentado como línea separada del patrimonio; puede residir en otro archivo o estar ya incluido en utilidades retenidas.',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Utilidad del ejercicio',
          'pérdida del ejercicio',
          'resultado del período dentro del patrimonio'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      },
      {
        'id': 'bs.other_equity_components',
        'canonical_name': 'Otros componentes del patrimonio',
        'definition': 'Partidas patrimoniales diversas sin identificador más específico (ajustes de conversión, acciones propias).',
        'statement': 'balance_general',
        'classification': 'patrimonio',
        'account_role': 'detail',
        'normal_balance': 'acreedor',
        'value_semantics': 'positive_magnitude',
        'absence_policy': 'zero_if_not_reported',
        'synonyms': [
          'Otras cuentas patrimoniales que no tengan un identificador más específico'
        ],
        'doubtful_synonyms': [],
        'ambiguities': [],
        'research': {
          'status': 'partially_verified',
          'sources': []
        }
      }
    ],
    'modo_periodo': {
      'name': 'flow_with_average_balance',
      'average': '(cierre del periodo anterior + cierre del periodo actual) / 2',
      'flow_period': 'current',
      'politica_sin_periodo_anterior': {
        'por_defecto': 'not_available',
        'un_solo_periodo_en_el_estado': 'direct_closing',
        'primer_periodo_con_control_activo': 'direct_closing'
      },
      'control_global': {
        'id': 'mostrar_calculo_directo_primer_periodo',
        'label': 'Mostrar cálculo directo del primer periodo',
        'default': false,
        'alcance': 'Un solo control para todas las razones de flujo. Solo afecta al primer periodo de cada serie. No existe un control por razón.'
      }
    },
    'presentacion': {
      'marca_directa': 'Saldo directo, sin promedio',
      'marca_promedio': 'Promedio {periodo_anterior}–{periodo_actual}',
      'nota_directa': 'Cálculo con saldos de cierre del periodo {periodo}, sin promedio.',
      'separador_decimal': '.',
      'separador_miles': ',',
      'sufijo_porcentaje': ' %',
      'decimales': {
        'veces': 2,
        'dias': 2,
        'porcentaje': 2,
        'moneda': 0
      }
    },
    'reglas_generales': {
      'principios': [
        'Las fórmulas están en este archivo. No hay fórmulas en código.',
        'Un dato faltante nunca se convierte en número: el resultado es not_available con motivo.',
        'Ninguna decisión de fórmula se toma durante el cálculo.'
      ],
      'normalizacion': {
        'nombres': 'minúsculas, sin tildes, espacios simples para comparar; el nombre original se conserva.',
        'montos': 'se conserva el monto original y el monto normalizado.',
        'signos': 'gastos y costos son magnitudes positivas que se restan explícitamente; la depreciación acumulada es negativa y se suma con su signo; una pérdida conserva su signo negativo.'
      },
      'orden_de_identificacion': [
        'id explícito válido',
        'nombre canónico exacto',
        'sinónimo exacto',
        'regla contextual definida',
        'revisión si hay más de un candidato o ninguno'
      ],
      'cuenta_no_reconocida': 'se marca para revisión. Nunca se convierte en cero.',
      'cuenta_ausente': {
        'zero_if_not_reported': 'vale cero dentro de la suma.',
        'requires_data': 'el resultado es not_available con motivo missing_required_account_data.'
      },
      'total_reportado_y_componentes': {
        'seleccion': 'si el total reportado existe con valor numérico, se usa. Sus componentes no se suman en esa agregación.',
        'conciliacion': 'si el total y sus componentes son comparables, se comparan. Si la diferencia supera la tolerancia, se registra reported_subtotal_mismatch. Se usa el total reportado.',
        'tolerancia': 0.01,
        'cero_explicito': 'un total reportado de cero es un valor válido, no una ausencia.'
      },
      'total_sin_desglose': 'R5: el total de categoría se usa y sus componentes quedan en cero en esa agregación.',
      'denominador_cero': 'not_available con motivo zero_denominator.',
      'motivos_permitidos': [
        'missing_required_account_data',
        'missing_required_period_balance',
        'zero_denominator',
        'unrecognized_imported_account',
        'ambiguous_account_match',
        'reported_subtotal_mismatch',
        'overlapping_account_aggregation',
        'assumption_applied'
      ],
      'supuestos': 'toda aproximación se declara con el motivo assumption_applied. En este proyecto no hay aproximaciones activas: D8 y D10 no las usan.',
      'metodo_resultado': 'cada resultado indica su método: average, direct_closing o not_applicable. Si el resultado es N/D, el método es not_applicable.'
    }
  }
};
