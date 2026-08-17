const STORAGE_KEY = 'gfo-toolkit-data';

const defaultData = {
  presupuesto: {
    ingresoMensual: 0,
    metaAhorro: 0,
    mesesDisponibles: 12,
    gastos: [],
    semanas: []
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
  theme: 'light'
};

export const store = {
  _data: null,
  _listeners: [],

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this._data = raw ? { ...defaultData, ...JSON.parse(raw) } : { ...defaultData };
    } catch {
      this._data = { ...defaultData };
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

  getAll() {
    if (!this._data) this.load();
    return JSON.parse(JSON.stringify(this._data));
  },

  reset() {
    this._data = { ...defaultData };
    this.save();
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
