const STORAGE_KEY = 'gfo-toolkit-data';

const defaultData = {
  presupuesto: {
    ingresoMensual: 0,
    metaAhorro: 0,
    mesesDisponibles: 12,
    gastos: [],
    semanas: [],
    // Ingresos por concepto; ingresoMensual queda como su total para el dashboard.
    ingresos: []
  },
  estados: {
    balanceGeneral: {},
    estadoResultados: {},
    periods: []
  },
  analisis: {
    resultados: {}
  },
  activos: {
    inventario: []
  },
  mercados: {
    quizScore: 0,
    quizHistory: []
  },
  // Clasificación fija/variable de costos, DAP por periodo y tasa de impuesto por defecto
  // (null = TASA_IR_DEFECTO). Ver docs/planificacion/apalancamiento/03-datos-y-derivacion.md.
  apalancamiento: {
    comportamiento: {},
    dap: {},
    tasaDefecto: null
  },
  // Módulos de la guía del proyecto final. Formas en docs/contexto/arquitectura.md.
  inventario: {
    productos: [],
    movimientos: []
  },
  equilibrio: {
    precio: null,
    costoVariableUnitario: null,
    costosFijos: null,
    unidades: null,
    utilidadObjetivo: null,
    escenario: { precio: 0, costoVariable: 0, costosFijos: 0, volumen: 0 }
  },
  flujo: {
    saldoInicial: null,
    periodoBase: '',
    movimientos: []
  },
  planeacion: {
    supuestos: null
  },
  // Razones de mercado: por periodo, { acciones, precio, dividendos } (null = sin dato).
  razonesMercado: {
    periodos: {}
  },
  theme: 'light'
};

export const store = {
  _data: null,
  _listeners: [],

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this._data = { ...structuredClone(defaultData), ...(raw ? JSON.parse(raw) : {}) };
    } catch {
      this._data = structuredClone(defaultData);
    }
    return this._data;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    } catch { /* silent */ }
    this._notify();
  },

  get(path) {
    if (!this._data) this.load();
    return path.split('.').reduce((obj, key) => obj?.[key], this._data);
  },

  set(path, value) {
    if (!this._data) this.load();
    const keys = path.split('.');
    const last = keys.pop();
    let obj = this._data;
    for (const k of keys) {
      if (obj[k] === undefined || obj[k] === null || typeof obj[k] !== 'object') {
        obj[k] = {};
      }
      obj = obj[k];
    }
    obj[last] = value;
    this.save();
  },

  // Publish a complete module only after durable storage succeeds. Unlike the
  // legacy set(), a quota/access error propagates and leaves memory unchanged.
  setPersisted(key, value) {
    if (!Object.hasOwn(defaultData, key)) throw new Error('Módulo de datos inválido');
    if (!this._data) this.load();
    const next = { ...this._data, [key]: structuredClone(value) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this._data = next;
    this._notify();
  },

  getAll() {
    if (!this._data) this.load();
    return JSON.parse(JSON.stringify(this._data));
  },

  reset() {
    const next = structuredClone(defaultData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this._data = next;
    this._notify();
  },

  subscribe(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  },

  _notify() {
    this._listeners.forEach(fn => fn(this._data));
  }
};

export default store;
