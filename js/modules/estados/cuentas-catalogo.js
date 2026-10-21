// Datos de la colección. Investigación y procedencia: docs/planificacion/cuentas/investigacion.md.
export const versionCatalogo = '2026-10-20.1';
export const TIPOS_APP = {
  'activos': [
    'efectivo',
    'cxC',
    'inventario',
    'activosCorrientesOtros',
    'activosFijos',
    'depreciacionAcumulada'
  ],
  'pasivos': [
    'cuentasPorPagar',
    'pasivoCortoPlazo',
    'provisiones',
    'pasivoLargoPlazo'
  ],
  'patrimonio': [
    'patrimonio'
  ],
  'estadoResultados': [
    'ventas',
    'costoVentas',
    'gastosAdmin',
    'gastosVentas',
    'otrosIngresos',
    'otrosGastos',
    'intereses',
    'impuestos'
  ]
};

export const ALIAS_CLASIFICACION = {
  'efectivo': [
    'caja',
    'bancos',
    'banco',
    'equivalentes de efectivo'
  ],
  'cxC': [
    'cxc',
    'cuentas por cobrar',
    'clientes',
    'deudores comerciales'
  ],
  'inventario': [
    'inventarios',
    'existencias',
    'mercaderia',
    'mercaderias'
  ],
  'activosCorrientesOtros': [
    'activos corrientes otros',
    'otros activos corrientes'
  ],
  'activosFijos': [
    'activos fijos',
    'no corriente',
    'propiedad planta y equipo',
    'ppe',
    'inmuebles'
  ],
  'depreciacionAcumulada': [
    'depreciacion acumulada',
    'depreciacion'
  ],
  'cuentasPorPagar': [
    'cuentas por pagar',
    'proveedores',
    'acreedores comerciales'
  ],
  'pasivoCortoPlazo': [
    'pasivo corto plazo',
    'pasivos corrientes',
    'deuda financiera corriente'
  ],
  'provisiones': [
    'provisiones'
  ],
  'pasivoLargoPlazo': [
    'pasivo largo plazo',
    'pasivos no corrientes'
  ],
  'patrimonio': [
    'capital',
    'capital social'
  ],
  'ventas': [
    'ingresos',
    'ingresos operacionales',
    'ingresos por servicios'
  ],
  'costoVentas': [
    'costo de ventas',
    'costos de ventas',
    'costo de lo vendido'
  ],
  'gastosAdmin': [
    'gastos administrativos',
    'gastos de administracion',
    'administracion'
  ],
  'gastosVentas': [
    'gastos de ventas',
    'gastos comerciales',
    'ventas y mercadeo'
  ],
  'otrosIngresos': [
    'otros ingresos'
  ],
  'otrosGastos': [
    'otros gastos'
  ],
  'intereses': [
    'gastos financieros',
    'gastos de intereses'
  ],
  'impuestos': [
    'impuesto sobre la renta',
    'ir'
  ]
};

export const COMPATIBILIDAD_LEGADA = [
  [
    'activos',
    'Equipos',
    'activosFijos'
  ],
  [
    'pasivos',
    'Pasivo Corto Plazo',
    'pasivoCortoPlazo'
  ],
  [
    'pasivos',
    'Provisiones',
    'provisiones'
  ],
  [
    'pasivos',
    'Pasivo Largo Plazo',
    'pasivoLargoPlazo'
  ],
  [
    'pasivos',
    'Pasivo No Corriente',
    'pasivoLargoPlazo'
  ],
  [
    'pasivos',
    'Prestamo Largo Plazo',
    'pasivoLargoPlazo'
  ],
  [
    'patrimonio',
    'Capital',
    'patrimonio'
  ],
  [
    'patrimonio',
    'Reservas',
    'patrimonio'
  ],
  [
    'estadoResultados',
    'Otros Ingresos',
    'otrosIngresos'
  ],
  [
    'estadoResultados',
    'Otros Gastos',
    'otrosGastos'
  ],
  [
    'estadoResultados',
    'Intereses',
    'intereses'
  ]
];

export const CUENTAS_CATALOGO = [
  {
    'id': 'bs.accrued_expenses_payable',
    'nombreCanonico': 'Gastos acumulados por pagar',
    'definicion': 'Gastos devengados ya reconocidos y aún no pagados (sueldos, servicios).',
    'grupo': 'pasivos',
    'clasificacion': 'pasivo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Gastos devengados por pagar',
      'obligaciones acumuladas'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'pasivoCortoPlazo',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.accumulated_depreciation',
    'nombreCanonico': 'Depreciación acumulada',
    'definicion': 'Cuenta correctora que acumula el desgaste reconocido de los activos fijos; llega negativa y se suma con su signo (D13).',
    'grupo': 'activos',
    'clasificacion': 'correctora_activo',
    'rol': 'contra_account',
    'politicaAusencia': 'requires_data',
    'convencionSigno': 'negativo',
    'sinonimos': [
      'Depreciación acumulada de activos fijos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'depreciacionAcumulada',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 16 Property, Plant and Equipment',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '281',
        'cita': 'Corrección de valor por la depreciación del inmovilizado material',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (281); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.additional_paid_in_capital',
    'nombreCanonico': 'Aportes adicionales de capital',
    'definicion': 'Excedente aportado por encima del valor nominal de las acciones.',
    'grupo': 'patrimonio',
    'clasificacion': 'patrimonio',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Prima en emisión',
      'aportes adicionales'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'patrimonio',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.cash_and_equivalents',
    'nombreCanonico': 'Efectivo y equivalentes',
    'definicion': 'Medios de pago disponibles y equivalentes de efectivo; su saldo crece con cobros y disminuye con pagos.',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Efectivo',
      'caja',
      'bancos',
      'caja y bancos',
      'Banco',
      'Equivalentes de efectivo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'efectivo',
    'ambiguedades': [],
    'estadoInvestigacion': 'verified',
    'fuentes': [
      {
        'titulo': 'IAS 7 Statement of Cash Flows',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/',
        'consulta': '2026-10-18',
        'alcance': 'Fragmentos consecutivos que definen efectivo y equivalentes; las condiciones completas se consultan en la fuente. No verifica todos los alias.',
        'ubicacion': 'About, IAS 7',
        'cita': 'Cash comprises cash on hand and demand deposits. Cash equivalents are short-term, highly liquid investments'
      }
    ]
  },
  {
    'id': 'bs.current_assets_total',
    'nombreCanonico': 'Total de activos corrientes',
    'definicion': 'Subtotal de activos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
    'grupo': 'activos',
    'clasificacion': 'total',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Total activo corriente',
      'total activo circulante'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.current_liabilities_total',
    'nombreCanonico': 'Total de pasivos corrientes',
    'definicion': 'Subtotal de pasivos corrientes reportado por el ejercicio; si existe, sustituye a la suma de componentes (regla del subtotal).',
    'grupo': 'pasivos',
    'clasificacion': 'total',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Total pasivo corriente',
      'total pasivo circulante'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.current_portion_long_term_debt',
    'nombreCanonico': 'Porción corriente de deuda de largo plazo',
    'definicion': 'Parte de una deuda a largo plazo que vence en los próximos doce meses.',
    'grupo': 'pasivos',
    'clasificacion': 'pasivo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Vencimientos corrientes de deuda a largo plazo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'pasivoCortoPlazo',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.current_provisions',
    'nombreCanonico': 'Provisiones corrientes',
    'definicion': 'Pasivos de tiempo o importe incierto con salida de recursos prevista dentro del corto plazo.',
    'grupo': 'pasivos',
    'clasificacion': 'pasivo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Provisiones de corto plazo',
      'Provisiones'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'provisiones',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 37 Provisions, Contingent Liabilities and Contingent Assets',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '14 y 529',
        'cita': 'provisiones cuya cancelación se prevea en el corto plazo',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (14 y 529); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.current_year_result_equity',
    'nombreCanonico': 'Resultado del período incluido en patrimonio',
    'definicion': 'Resultado del periodo presentado como línea separada del patrimonio; puede residir en otro archivo o estar ya incluido en utilidades retenidas.',
    'grupo': 'patrimonio',
    'clasificacion': 'patrimonio',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'conservar',
    'sinonimos': [
      'Utilidad del ejercicio',
      'pérdida del ejercicio',
      'resultado del período dentro del patrimonio'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'patrimonio',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 1 Presentation of Financial Statements',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '129',
        'cita': 'Resultado, positivo o negativo, del último ejercicio cerrado, pendiente de aplicación.',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (129); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.fixed_assets_net_total',
    'nombreCanonico': 'Total de activos fijos netos',
    'definicion': 'Subtotal neto de activos fijos reportado por el ejercicio; si existe, sustituye a la suma de componentes con depreciación (D3).',
    'grupo': 'activos',
    'clasificacion': 'activo_fijo',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Activo fijo neto',
      'propiedad planta y equipo neto'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 16 Property, Plant and Equipment',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'El enlace a IAS 16 no define este subtotal reportado ni su precedencia interna sobre componentes.'
    }
  },
  {
    'id': 'bs.intangible_assets',
    'nombreCanonico': 'Activos intangibles',
    'definicion': 'Activos no monetarios no financieros identificables sin sustancia física (software, patentes); se amortizan. Si no se reportan, aportan cero a activos totales (D12).',
    'grupo': 'activos',
    'clasificacion': 'activo_no_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Intangibles',
      'software capitalizado',
      'patentes'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosFijos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 38 Intangible Assets',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La definición local cambia monetarios por no monetarios según la corrección autorizada D-046. Se mantiene parcialmente verificada y se declara la diferencia con los JSON del PR #10, aún sin modificar.'
    }
  },
  {
    'id': 'bs.inventory_finished_goods',
    'nombreCanonico': 'Inventario de productos terminados',
    'definicion': 'Producto terminado listo para la venta; se lleva a costo de ventas al venderse.',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Productos terminados',
      'bienes terminados'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'inventario',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 2 Inventories',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '35',
        'cita': 'Los fabricados por la empresa y destinados al consumo final',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (35); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.inventory_merchandise',
    'nombreCanonico': 'Inventario de mercaderías',
    'definicion': 'Bienes adquiridos para revender sin transformación; mide su coste de adquisición.',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Mercaderías',
      'mercancías',
      'inventario para la venta',
      'Mercadería'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'inventario',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 2 Inventories',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '30',
        'cita': 'destinados a la venta sin transformación',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (30); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.inventory_raw_materials',
    'nombreCanonico': 'Inventario de materias primas',
    'definicion': 'Materiales adquiridos para la producción que aún no se han transformado.',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Materias primas',
      'materiales en almacén para producción'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'inventario',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 2 Inventories',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '31',
        'cita': 'se destinan a formar parte de los productos fabricados',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (31); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.inventory_total',
    'nombreCanonico': 'Inventario total',
    'definicion': 'Total de inventarios sin desglose de componentes (R5). El inventario se reconoce a coste y se expensa como costo de ventas cuando se vende.',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Inventario',
      'existencias totales',
      'Inventarios',
      'Existencias'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'inventario',
    'ambiguedades': [
      'Cuenta interna del caso (R5): el caso reporta un total de inventario sin desglose; la definición viene de la construcción del caso, no de una norma. Se usa el total reportado primero y los componentes solo si el total falta.'
    ],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.inventory_work_in_process',
    'nombreCanonico': 'Inventario de productos en proceso',
    'definicion': 'Producto con transformación iniciada pero sin terminar; acumula materiales, mano de obra y costes indirectos.',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Producción en proceso',
      'productos en proceso'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'inventario',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 2 Inventories',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '33',
        'cita': 'se encuentran en fase de formación o transformación',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (33); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.legal_reserve',
    'nombreCanonico': 'Reserva legal',
    'definicion': 'Porción de utilidades retenidas legalmente reservada; no está disponible para distribución.',
    'grupo': 'patrimonio',
    'clasificacion': 'patrimonio',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Reserva legal acumulada',
      'Reservas'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'patrimonio',
    'ambiguedades': [
      'Reserva legal: figura del marco legal local, fuera de NIIF; el nombre puede aludir a reservas legales de distintos regímenes. Se clasifica como patrimonio por el nombre y se marca ambiguous porque ninguna norma NIIF la define.'
    ],
    'estadoInvestigacion': 'ambiguous',
    'fuentes': []
  },
  {
    'id': 'bs.long_term_borrowings',
    'nombreCanonico': 'Deudas de largo plazo',
    'definicion': 'Deudas financieras con vencimiento más allá del corto plazo.',
    'grupo': 'pasivos',
    'clasificacion': 'pasivo_no_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Préstamos a largo plazo',
      'obligaciones financieras no corrientes',
      'Pasivo Largo Plazo',
      'Pasivo No Corriente'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'pasivoLargoPlazo',
    'ambiguedades': [
      'Nombre genérico del caso «Pasivo Largo Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo no corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
    ],
    'estadoInvestigacion': 'ambiguous',
    'fuentes': [
      {
        'titulo': 'IFRS 9 Financial Instruments',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'IAS 32 Financial Instruments: Presentation',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      }
    ]
  },
  {
    'id': 'bs.long_term_investments',
    'nombreCanonico': 'Inversiones de largo plazo',
    'definicion': 'Inversiones con disponibilidad o recuperación más allá del corto plazo.',
    'grupo': 'activos',
    'clasificacion': 'activo_no_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Inversiones permanentes',
      'inversiones no corrientes'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosFijos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.long_term_provisions',
    'nombreCanonico': 'Provisiones de largo plazo',
    'definicion': 'Pasivos de tiempo o importe incierto cuya salida de recursos se prevé más allá del corto plazo.',
    'grupo': 'pasivos',
    'clasificacion': 'pasivo_no_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Provisiones no corrientes',
      'Provisiones'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'pasivoLargoPlazo',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 37 Provisions, Contingent Liabilities and Contingent Assets',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '14',
        'cita': 'Obligaciones expresas o tácitas a largo plazo',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (14); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.other_current_assets',
    'nombreCanonico': 'Otros activos corrientes',
    'definicion': 'Activos corrientes que no tienen una cuenta específica (anticipos, impuestos a favor de corto plazo).',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Otros activos circulantes',
      'Activos Corrientes Otros'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosCorrientesOtros',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.other_current_liabilities',
    'nombreCanonico': 'Otros pasivos corrientes',
    'definicion': 'Pasivos corrientes sin cuenta específica (anticipos de clientes, dividendos por pagar de corto plazo).',
    'grupo': 'pasivos',
    'clasificacion': 'pasivo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Otros pasivos circulantes',
      'Pasivo Corto Plazo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'pasivoCortoPlazo',
    'ambiguedades': [
      'Nombre genérico del caso «Pasivo Corto Plazo»: el detalle de la cuenta es incierto, pero su clasificación en pasivo corriente es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
    ],
    'estadoInvestigacion': 'ambiguous',
    'fuentes': [
      {
        'titulo': 'IAS 1 Presentation of Financial Statements',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      }
    ]
  },
  {
    'id': 'bs.other_current_receivables',
    'nombreCanonico': 'Otras cuentas por cobrar corrientes',
    'definicion': 'Cobros distintos de las ventas comerciales con recuperación dentro del corto plazo (anticipos, deudores varios).',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Deudores varios corrientes',
      'otras cuentas por cobrar de corto plazo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosCorrientesOtros',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.other_equity_components',
    'nombreCanonico': 'Otros componentes del patrimonio',
    'definicion': 'Partidas patrimoniales diversas sin identificador más específico (ajustes de conversión, acciones propias).',
    'grupo': 'patrimonio',
    'clasificacion': 'patrimonio',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Otras cuentas patrimoniales que no tengan un identificador más específico'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'patrimonio',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.other_noncurrent_assets',
    'nombreCanonico': 'Otros activos no corrientes',
    'definicion': 'Activos no corrientes sin cuenta específica (derechos a largo plazo, anticipos a largo plazo).',
    'grupo': 'activos',
    'clasificacion': 'activo_no_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Otros activos a largo plazo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosFijos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.other_noncurrent_liabilities',
    'nombreCanonico': 'Otros pasivos no corrientes',
    'definicion': 'Pasivos no corrientes sin cuenta específica (obligaciones a largo plazo diversas).',
    'grupo': 'pasivos',
    'clasificacion': 'pasivo_no_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Otros pasivos a largo plazo',
      'Otros Pasivos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'pasivoLargoPlazo',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.other_reserves',
    'nombreCanonico': 'Otras reservas patrimoniales',
    'definicion': 'Reservas patrimoniales distintas de la reserva legal (revaluación, estatutarias).',
    'grupo': 'patrimonio',
    'clasificacion': 'patrimonio',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Reservas',
      'otras reservas de capital o patrimonio'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'patrimonio',
    'ambiguedades': [
      'Nombre genérico del caso «Reservas»: el detalle de la reserva es incierto, pero su clasificación en el patrimonio es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
    ],
    'estadoInvestigacion': 'ambiguous',
    'fuentes': [
      {
        'titulo': 'IAS 1 Presentation of Financial Statements',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-1-presentation-of-financial-statements/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      }
    ]
  },
  {
    'id': 'bs.ppe_buildings',
    'nombreCanonico': 'Edificios e instalaciones',
    'definicion': 'Construcciones usadas en la operación; su coste se deprecia a lo largo de su vida útil.',
    'grupo': 'activos',
    'clasificacion': 'activo_fijo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Edificios',
      'construcciones de uso operativo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosFijos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 16 Property, Plant and Equipment',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '211',
        'cita': 'Edificaciones en general',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (211); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.ppe_furniture',
    'nombreCanonico': 'Mobiliario y equipo de oficina',
    'definicion': 'Mobiliario y equipo de oficina en servicio; se deprecian por su vida útil.',
    'grupo': 'activos',
    'clasificacion': 'activo_fijo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Mobiliario',
      'muebles y enseres',
      'equipo de oficina',
      'Equipos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosFijos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 16 Property, Plant and Equipment',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '216',
        'cita': 'Mobiliario, material y equipos de oficina',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (216); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.ppe_land',
    'nombreCanonico': 'Terrenos',
    'definicion': 'Terrenos ocupados o destinados a la operación; no se deprecian.',
    'grupo': 'activos',
    'clasificacion': 'activo_fijo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Terrenos de uso operativo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosFijos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 16 Property, Plant and Equipment',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '210',
        'cita': 'Solares de naturaleza urbana, fincas rústicas',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (210); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.ppe_machinery',
    'nombreCanonico': 'Maquinaria y equipo',
    'definicion': 'Maquinaria y equipo utilizados en la producción o la operación; se deprecian por uso o por tiempo.',
    'grupo': 'activos',
    'clasificacion': 'activo_fijo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Maquinaria',
      'equipo productivo',
      'Equipos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosFijos',
    'ambiguedades': [
      'Nombre genérico del caso «Equipos»: el detalle de la cuenta es incierto, pero su clasificación en activo fijo es segura y el detalle no altera ningún resultado (tabla de mapeo, F1).'
    ],
    'estadoInvestigacion': 'ambiguous',
    'fuentes': [
      {
        'titulo': 'IAS 16 Property, Plant and Equipment',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      }
    ]
  },
  {
    'id': 'bs.ppe_other',
    'nombreCanonico': 'Otros activos fijos tangibles',
    'definicion': 'Bienes tangibles de la operación sin una cuenta específica; se deprecian según su vida útil.',
    'grupo': 'activos',
    'clasificacion': 'activo_fijo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Propiedad, planta y equipo',
      'otros activos fijos tangibles'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosFijos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 16 Property, Plant and Equipment',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '219',
        'cita': 'inmovilizaciones materiales no incluidas en las demás cuentas',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (219); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.ppe_vehicles',
    'nombreCanonico': 'Vehículos',
    'definicion': 'Vehículos usados en la operación; se deprecian a lo largo de su vida útil.',
    'grupo': 'activos',
    'clasificacion': 'activo_fijo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Equipo de transporte',
      'vehículos de uso operativo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosFijos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 16 Property, Plant and Equipment',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '218',
        'cita': 'Vehículos de todas clases utilizables para el transporte',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (218); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.prepaid_expenses',
    'nombreCanonico': 'Gastos pagados por anticipado',
    'definicion': 'Pagos realizados por adelantado que se consumen como gasto en periodos futuros (seguros, rentas).',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Pagos anticipados',
      'seguros pagados por anticipado'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosCorrientesOtros',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.retained_earnings',
    'nombreCanonico': 'Utilidades retenidas',
    'definicion': 'Utilidades acumuladas no distribuidas; su saldo se actualiza con la utilidad del periodo menos dividendos.',
    'grupo': 'patrimonio',
    'clasificacion': 'patrimonio',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'conservar',
    'sinonimos': [
      'Resultados acumulados',
      'utilidades acumuladas',
      'Utilidad acumulada'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'patrimonio',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.share_capital',
    'nombreCanonico': 'Capital social',
    'definicion': 'Aportes de los propietores representados en títulos; su saldo cambia con aportes y retiros, no con utilidades.',
    'grupo': 'patrimonio',
    'clasificacion': 'patrimonio',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Capital emitido',
      'capital aportado',
      'capital social pagado'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'patrimonio',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 32 Financial Instruments: Presentation',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-32-financial-instruments-presentation/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '100',
        'cita': 'Capital escriturado en las sociedades',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (100); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.short_term_borrowings',
    'nombreCanonico': 'Préstamos de corto plazo',
    'definicion': 'Deudas financieras con vencimiento dentro del corto plazo.',
    'grupo': 'pasivos',
    'clasificacion': 'pasivo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Deudas bancarias de corto plazo',
      'obligaciones financieras corrientes',
      'Pasivo Corto Plazo',
      'Documentos por Pagar a Corto Plazo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'pasivoCortoPlazo',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.short_term_investments',
    'nombreCanonico': 'Inversiones de corto plazo',
    'definicion': 'Valores negociables u otros instrumentos con vencimiento o disponibilidad dentro del corto plazo.',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Inversiones temporales',
      'valores negociables de corto plazo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'activosCorrientesOtros',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 7 Statement of Cash Flows',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '54',
        'cita': 'con vencimiento no superior a un año',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (54); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.taxes_payable',
    'nombreCanonico': 'Impuestos por pagar',
    'definicion': 'Obligaciones tributarias devengadas sin pagar dentro del corto plazo.',
    'grupo': 'pasivos',
    'clasificacion': 'pasivo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Tributos por pagar',
      'impuestos corrientes por pagar'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'pasivoCortoPlazo',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 12 Income Taxes',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '475',
        'cita': 'Tributos a favor de las Administraciones Públicas, pendientes de pago',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (475); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'bs.total_assets',
    'nombreCanonico': 'Total de activos',
    'definicion': 'Total de activos reportado por el ejercicio; si existe, sustituye al cálculo activo corriente + activos fijos netos + intangibles (D4).',
    'grupo': 'activos',
    'clasificacion': 'total',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Total activo',
      'activo total',
      'total de recursos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.total_equity',
    'nombreCanonico': 'Total patrimonio',
    'definicion': 'Total del patrimonio reportado por el ejercicio; si existe, sustituye a la suma de `bs.patrimony_components`.',
    'grupo': 'patrimonio',
    'clasificacion': 'total',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Patrimonio total',
      'capital contable total',
      'patrimonio neto'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.total_liabilities',
    'nombreCanonico': 'Total de pasivos',
    'definicion': 'Total de pasivos reportado por el ejercicio; si existe, sustituye a pasivo corriente + pasivo no corriente (D14).',
    'grupo': 'pasivos',
    'clasificacion': 'total',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Pasivo total',
      'total pasivo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.trade_payables',
    'nombreCanonico': 'Cuentas por pagar comerciales',
    'definicion': 'Obligaciones con proveedores por compras a crédito; su saldo crece con las compras y disminuye con los pagos.',
    'grupo': 'pasivos',
    'clasificacion': 'pasivo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'CxP',
      'proveedores',
      'cuentas por pagar a proveedores',
      'Cuentas por Pagar'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'cuentasPorPagar',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'bs.trade_receivables',
    'nombreCanonico': 'Cuentas por cobrar comerciales',
    'definicion': 'Derechos de cobro generados por ventas o servicios a crédito; nacen al entregar el bien o prestar el servicio.',
    'grupo': 'activos',
    'clasificacion': 'activo_corriente',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'CxC',
      'clientes',
      'cuentas por cobrar a clientes',
      'deudores comerciales',
      'Cuentas por Cobrar'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'cxC',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.administrative_expenses',
    'nombreCanonico': 'Gastos administrativos',
    'definicion': 'Gastos de la administración general del periodo (magnitudes positivas que se restan, D13).',
    'grupo': 'estadoResultados',
    'clasificacion': 'gasto_operativo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Gastos de administración',
      'gastos generales y administrativos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'gastosAdmin',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.cost_of_sales_reported',
    'nombreCanonico': 'Costo de ventas reportado',
    'definicion': 'Costo de lo vendido reportado por el ejercicio (total sin desglose); si existe, sustituye a la suma de componentes.',
    'grupo': 'estadoResultados',
    'clasificacion': 'costo',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Costo de ventas',
      'costo de los bienes vendidos',
      'Costos de ventas',
      'Costo de lo vendido'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'costoVentas',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 2 Inventories',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'IAS 2 explica el gasto por inventarios vendidos, pero no define este total reportado con precedencia interna.'
    }
  },
  {
    'id': 'is.gross_profit_reported',
    'nombreCanonico': 'Utilidad bruta reportada',
    'definicion': 'Diferencia entre ventas netas y costo de ventas, reportada por el ejercicio; una pérdida conserva signo negativo.',
    'grupo': 'estadoResultados',
    'clasificacion': 'resultado',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'conservar',
    'sinonimos': [
      'Ganancia bruta',
      'resultado bruto'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.income_tax_expense',
    'nombreCanonico': 'Gasto por impuesto sobre la renta',
    'definicion': 'Impuesto corriente sobre la utilidad del periodo; se resta después de la utilidad antes de impuestos (D6).',
    'grupo': 'estadoResultados',
    'clasificacion': 'impuesto',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Impuesto sobre la renta',
      'impuesto a las ganancias del período',
      'Impuestos',
      'IR'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'impuestos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 12 Income Taxes',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '630 y 6300',
        'cita': 'Importe del impuesto sobre beneficios devengado en el ejercicio',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (630 y 6300); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'is.interest_expense',
    'nombreCanonico': 'Gastos por intereses',
    'definicion': 'Costos de financiación de deudas; si es cero, la cobertura de intereses queda en `zero_denominator` (D, razón 11).',
    'grupo': 'estadoResultados',
    'clasificacion': 'financiero',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Intereses pagados o devengados',
      'gastos financieros por intereses',
      'Gastos de intereses',
      'Gastos financieros',
      'Intereses pagados'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'intereses',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 23 Borrowing Costs',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-23-borrowing-costs/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '662',
        'cita': 'Importe de los intereses de los préstamos recibidos y otras deudas',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (662); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'is.interest_income',
    'nombreCanonico': 'Ingresos por intereses',
    'definicion': 'Ingreso financiero por intereses ganados; no es un gasto por financiación.',
    'grupo': 'estadoResultados',
    'clasificacion': 'ingreso_financiero',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Intereses ganados',
      'Intereses devengados a favor'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'otrosIngresos',
    'agrupadoEn': 'is.nonoperating_income',
    'ambiguedades': [
      'Se suma a is.nonoperating_income como componente de los ingresos no operativos al calcular la utilidad neta sin utilidad reportada, según D-051.'
    ],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IFRS: Presentation of interest revenue',
        'url': 'https://www.ifrs.org/projects/completed-projects/2018/presentation-of-interest-revenue-for-particular-financial-instruments-ifrs-9-and-ias-1/',
        'consulta': '2026-10-17',
        'alcance': 'Título de proyecto; no define la cuenta. No respalda por sí solo su verificación.'
      }
    ]
  },
  {
    'id': 'is.merchandise_cost',
    'nombreCanonico': 'Costo de mercadería vendida',
    'definicion': 'Coste de las mercaderías vendidas en el periodo.',
    'grupo': 'estadoResultados',
    'clasificacion': 'costo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Costo de ventas de mercaderías',
      'costo de bienes vendidos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'costoVentas',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 2 Inventories',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La fuente anterior describe inventarios en general, sin definir esta cuenta específica de mercaderías vendidas.'
    }
  },
  {
    'id': 'is.net_income_reported',
    'nombreCanonico': 'Utilidad neta reportada',
    'definicion': 'Resultado final después de impuestos reportado por el ejercicio; una pérdida conserva signo negativo (D6).',
    'grupo': 'estadoResultados',
    'clasificacion': 'resultado',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'conservar',
    'sinonimos': [
      'Utilidad del ejercicio',
      'ganancia neta',
      'resultado neto'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.net_sales_reported',
    'nombreCanonico': 'Ventas netas reportadas',
    'definicion': 'Ventas netas de devoluciones, descuentos y rebajas, reportadas directamente por el ejercicio.',
    'grupo': 'estadoResultados',
    'clasificacion': 'ingreso',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Ventas netas',
      'ventas netas totales'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'ventas',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.noninterest_nonoperating_expenses',
    'nombreCanonico': 'Gastos no operativos distintos de intereses',
    'definicion': 'Gastos ajenos a la operación que no son intereses; entran en utilidad neta, no en la operativa (D5).',
    'grupo': 'estadoResultados',
    'clasificacion': 'no_operativo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Otros gastos no operativos',
      'gastos no operacionales excluyendo intereses identificados por separado',
      'Otros Gastos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'otrosGastos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.nonoperating_income',
    'nombreCanonico': 'Ingresos no operativos',
    'definicion': 'Ingresos ajenos a la operación principal (arrendamientos, plusvalías, intereses ganados); entran en utilidad neta, no en la operativa (D5).',
    'grupo': 'estadoResultados',
    'clasificacion': 'no_operativo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Otros ingresos no operativos',
      'Otros Ingresos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'otrosIngresos',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.operating_amortization',
    'nombreCanonico': 'Amortización operativa',
    'definicion': 'Gasto de amortización del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación.',
    'grupo': 'estadoResultados',
    'clasificacion': 'gasto_operativo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Amortización de activos usados en operaciones, bajo la misma regla de no duplicación'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 38 Intangible Assets',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '680 (definición conjunta 680/681/682)',
        'alcance': 'Texto conjunto de 680/681/682: la frase sobre depreciación no define amortización y se retira como cita específica. Solo referencia terminológica; no sostiene verified ni verifica alias o convenciones internas.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La frase del PGC es conjunta para 680/681/682 y describe depreciación, no define amortización. Se retira como cita específica; las fuentes restantes solo aportan contexto conceptual.'
    }
  },
  {
    'id': 'is.operating_depreciation',
    'nombreCanonico': 'Depreciación operativa',
    'definicion': 'Gasto de depreciación del periodo reconocido fuera de otras cuentas ya agregadas; evitar duplicación con costo de ventas o gastos administrativos.',
    'grupo': 'estadoResultados',
    'clasificacion': 'gasto_operativo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Depreciación de activos usados en operaciones, solo si no está incluida ya en otra cuenta agregada utilizada'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 16 Property, Plant and Equipment',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '681 (definición conjunta 680/681/682)',
        'cita': 'Expresión de la depreciación sistemática anual efectiva',
        'alcance': 'Definición conjunta de 680/681/682, no propia de depreciación operativa. Solo referencia terminológica española; no sostiene verified ni verifica alias, signos o reglas internas.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La definición del PGC es conjunta para 680/681/682, no propia de depreciación operativa. Solo es referencia terminológica; IAS 16 aporta contexto conceptual sin cita específica de esta cuenta.'
    }
  },
  {
    'id': 'is.operating_profit_reported',
    'nombreCanonico': 'Utilidad operativa reportada',
    'definicion': 'Utilidad de la operación reportada por el ejercicio (utilidad bruta menos gastos operativos); una pérdida conserva signo negativo.',
    'grupo': 'estadoResultados',
    'clasificacion': 'resultado',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'conservar',
    'sinonimos': [
      'Resultado operativo',
      'utilidad de operación'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.other_operating_expenses',
    'nombreCanonico': 'Otros gastos operativos',
    'definicion': 'Gastos operativos menores sin cuenta específica (magnitudes positivas que se restan, D13).',
    'grupo': 'estadoResultados',
    'clasificacion': 'gasto_operativo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Otros gastos de operación',
      'Otros Gastos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.other_operating_income',
    'nombreCanonico': 'Otros ingresos operativos',
    'definicion': 'Ingresos derivados de la actividad operativa que no son ventas (participaciones, excedentes operativos).',
    'grupo': 'estadoResultados',
    'clasificacion': 'ingreso',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Otros ingresos de operación si pertenecen a la actividad operativa',
      'Otros Ingresos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.other_sales_revenue',
    'nombreCanonico': 'Otras ventas ordinarias',
    'definicion': 'Ventas operativas menores sin cuenta específica; solo si efectivamente son ventas.',
    'grupo': 'estadoResultados',
    'clasificacion': 'ingreso',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Otras ventas',
      'otras ventas operativas si efectivamente son ventas'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'ventas',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IFRS 15 Revenue from Contracts with Customers',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'IFRS 15 describe ingresos de contratos, sin definir una cuenta residual de otras ventas.'
    }
  },
  {
    'id': 'is.product_cost',
    'nombreCanonico': 'Costo de productos vendidos',
    'definicion': 'Coste de producción de los productos vendidos en el periodo.',
    'grupo': 'estadoResultados',
    'clasificacion': 'costo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Costo de producción vendido',
      'costo de productos vendidos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'costoVentas',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IAS 2 Inventories',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La fuente anterior describe inventarios en general, sin definir específicamente el coste de producción de los productos vendidos.'
    }
  },
  {
    'id': 'is.product_sales',
    'nombreCanonico': 'Ventas de productos',
    'definicion': 'Ingresos por venta de bienes; contribuyen a ventas brutas cuando no existe total reportado.',
    'grupo': 'estadoResultados',
    'clasificacion': 'ingreso',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Ventas de mercaderías',
      'ventas de bienes'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'ventas',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IFRS 15 Revenue from Contracts with Customers',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '701 (definición conjunta 700/705)',
        'cita': 'Transacciones, con salida o entrega de los bienes o servicios',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (701 (definición conjunta 700/705)); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'is.sales_allowances',
    'nombreCanonico': 'Rebajas sobre ventas',
    'definicion': 'Contra-ingreso por rebajas y bonificaciones; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
    'grupo': 'estadoResultados',
    'clasificacion': 'deduccion_ingreso',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Rebajas y bonificaciones sobre ventas'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.sales_discounts',
    'nombreCanonico': 'Descuentos sobre ventas',
    'definicion': 'Contra-ingreso por descuentos concedidos; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
    'grupo': 'estadoResultados',
    'clasificacion': 'deduccion_ingreso',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Descuentos concedidos sobre ventas'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.sales_returns',
    'nombreCanonico': 'Devoluciones sobre ventas',
    'definicion': 'Contra-ingreso por bienes devueltos por clientes; se suma con signo positivo en deducciones y se resta de ventas brutas (D7).',
    'grupo': 'estadoResultados',
    'clasificacion': 'deduccion_ingreso',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Devoluciones de ventas',
      'ventas devueltas'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.sales_total',
    'nombreCanonico': 'Ventas totales',
    'definicion': 'Total de ingresos por ventas sin desglose de componentes (R5); se reconoce al entregar los bienes o prestar los servicios.',
    'grupo': 'estadoResultados',
    'clasificacion': 'ingreso',
    'rol': 'reported_total',
    'politicaAusencia': 'not_applicable',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Ventas',
      'ventas ordinarias totales',
      'Ingresos operacionales'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'ventas',
    'ambiguedades': [
      'Cuenta interna del caso (R5): total de ventas reportado por el caso; se usa como ingreso bruto de ventas sin desglose (D7 y D11). No es una cuenta de un catálogo normativo.'
    ],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.selling_expenses',
    'nombreCanonico': 'Gastos de ventas',
    'definicion': 'Gastos de distribución y promoción de ventas del periodo (magnitudes positivas que se restan, D13).',
    'grupo': 'estadoResultados',
    'clasificacion': 'gasto_operativo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Gastos comerciales',
      'gastos de distribución si el criterio de clase los clasifica como operativos'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'gastosVentas',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.service_cost',
    'nombreCanonico': 'Costo de servicios',
    'definicion': 'Coste directo de los servicios prestados en el periodo.',
    'grupo': 'estadoResultados',
    'clasificacion': 'costo',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Costos de servicios prestados'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'costoVentas',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'is.service_revenue',
    'nombreCanonico': 'Ingresos por servicios',
    'definicion': 'Ingresos por servicios prestados; contribuyen a ventas brutas cuando no existe total reportado.',
    'grupo': 'estadoResultados',
    'clasificacion': 'ingreso',
    'rol': 'detail',
    'politicaAusencia': 'zero_if_not_reported',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Ventas de servicios',
      'ingresos por servicios prestados'
    ],
    'sinonimosDudosos': [],
    'tipoApp': 'ventas',
    'ambiguedades': [],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': [
      {
        'titulo': 'IFRS 15 Revenue from Contracts with Customers',
        'url': 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/',
        'consulta': '2026-10-17',
        'alcance': 'Respaldo conceptual; los alias españoles se documentan por separado en investigacion.md.'
      },
      {
        'titulo': 'PGC de España, quinta parte: definiciones y relaciones contables',
        'url': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884',
        'consulta': '2026-10-18',
        'ubicacion': '705 (definición conjunta 700/705)',
        'cita': 'Transacciones, con salida o entrega de los bienes o servicios',
        'alcance': 'Definición del concepto en su cuenta o subgrupo específico. Referencia terminológica; no impone normativa española en Nicaragua ni verifica alias, signos o reglas internas del proyecto.'
      }
    ],
    'revisionInvestigacion': {
      'fecha': '2026-10-18',
      'motivo': 'La cita específica procede del PGC español (705 (definición conjunta 700/705)); solo sirve de referencia terminológica. El enlace NIIF/NIC restante es conceptual y no verifica esta cuenta específica.'
    }
  },
  {
    'id': 'supp.credit_sales',
    'nombreCanonico': 'Ventas a crédito',
    'definicion': 'Ventas cobrables a crédito del periodo actual; es el numerador de la rotación de CxC. Nunca se aproxima con ventas netas ni totales (D8): si falta, la razón es N/D.',
    'grupo': 'suplementario',
    'clasificacion': 'suplementario',
    'rol': 'detail',
    'politicaAusencia': 'requires_data',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Ventas a crédito del periodo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [
      'Dato suplementario del caso (D8): ventas a crédito reportadas solo por el caso; sin fuente externa. Se usa con requires_data y nunca se iguala a ventas netas.'
    ],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  },
  {
    'id': 'supp.supplier_payments',
    'nombreCanonico': 'Pagos a proveedores',
    'definicion': 'Pagos efectuados a proveedores en el periodo actual; forma con la CxP el numerador de compras a crédito (D10). Si falta, la razón es N/D con `missing_required_account_data`.',
    'grupo': 'suplementario',
    'clasificacion': 'suplementario',
    'rol': 'detail',
    'politicaAusencia': 'requires_data',
    'convencionSigno': 'positivo',
    'sinonimos': [
      'Pagos a proveedores del periodo'
    ],
    'sinonimosDudosos': [],
    'tipoApp': null,
    'ambiguedades': [
      'Dato suplementario del caso (D10): pagos a proveedores reportados solo por el caso; sin fuente externa. Se usa con requires_data para derivar compras a crédito.'
    ],
    'estadoInvestigacion': 'partially_verified',
    'fuentes': []
  }
];
