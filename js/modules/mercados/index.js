import store from '../../store.js';

export const glosario = [
  { termino: 'Mercado', definicion: 'Lugar físico o virtual donde se encuentran compradores y vendedores para intercambiar bienes, servicios o instrumentos financieros.' },
  { termino: 'Bono', definicion: 'Instrumento de deuda mediante el cual una entidad se compromete a pagar el capital invertido más intereses en un plazo determinado.' },
  { termino: 'Acción', definicion: 'Título valor que representa una parte del capital social de una empresa, otorgando al poseedor derechos de propiedad y voto.' },
  { termino: 'Tasa de Interés', definicion: 'Costo del dinero expresado como porcentaje, representando la remuneración por el uso del capital ajeno.' },
  { termino: 'Inflación', definicion: 'Aumento generalizado y sostenido de los precios de bienes y servicios en un período determinado.' },
  { termino: 'Capital de Trabajo', definicion: 'Diferencia entre los activos corrientes y los pasivos corrientes; representa la liquidez operativa de una empresa.' },
  { termino: 'Liquidez', definicion: 'Capacidad de una entidad para convertir sus activos en efectivo rápidamente sin pérdida significativa de valor.' },
  { termino: 'Rentabilidad', definicion: 'Capacidad de una inversión para generar ganancias, medida como retorno sobre la inversión.' },
  { termino: 'Riesgo Financiero', definicion: 'Probabilidad de que una inversión genere pérdidas en lugar de ganancias, o que una empresa no pueda cumplir sus obligaciones.' },
  { termino: 'BCN (Banco Central de Nicaragua)', definicion: 'Institución rectora del sistema financiero nicaraguense, encargada de la política monetaria y regulación bancaria.' },
  { termino: 'SIBOIF', definicion: 'Superintendencia de Bancos y de Otras Instituciones Financieras, organismo regulador del sistema financiero de Nicaragua.' },
  { termino: 'Bolsa de Comercio de Managua', definicion: 'Mercado organizado donde se negocian valores (acciones y bonos) en Nicaragua.' },
  { termino: 'Mercado Monetario', definicion: 'Segmento del mercado financiero donde se negocian instrumentos de deuda a corto plazo (menos de un año).' },
  { termino: 'Mercado de Capitales', definicion: 'Mercado donde se negocian instrumentos financieros a largo plazo, como acciones y bonos.' },
  { termino: 'Depreciación', definicion: 'Pérdida de valor de un activo a lo largo del tiempo por uso, desgaste u obsolescencia. Se calcula método línea recta.' },
  { termino: 'Balance General', definicion: 'Estado financiero que muestra la situación patrimonial de una empresa en un momento dado: Activos = Pasivos + Patrimonio.' },
  { termino: 'Estado de Resultados', definicion: 'Estado financiero que resume los ingresos, costos y gastos de un período, resultando la utilidad o pérdida neta.' },
  { termino: 'Análisis Horizontal', definicion: 'Técnica que compara partidas financieras entre dos períodos, calculando variaciones absolutas y relativas.' },
  { termino: 'Análisis Vertical', definicion: 'Técnica que expresa cada cuenta como porcentaje de una base (Total Activo o Ventas) dentro del mismo período.' },
  { termino: 'Ratio Corriente', definicion: 'Indicador de liquidez que mide la capacidad de cubrir obligaciones a corto plazo: AC / PC.' },
  { termino: 'ROA (Retorno sobre Activos)', definicion: 'Indicador de rentabilidad que mide cuánta utilidad genera cada córdoba invertido en activos: UN / Total Activos.' },
  { termino: 'ROE (Retorno sobre Patrimonio)', definicion: 'Indicador que mide la rentabilidad para los accionistas: Utilidad Neta / Patrimonio. Se descompone en PM × AT × EM.' },
  { termino: 'Modelo DuPont', definicion: 'Framework que descompone el ROE en tres factores: Margen Neto × Rotación de Activos × Multiplicador de Capital.' },
  { termino: 'EOAF', definicion: 'Estado de Origen y Aplicación de Fondos, que muestra de dónde vinieron los recursos y en qué se utilizaron.' },
  { termino: 'Presupuesto', definicion: 'Plan financiero que estima los ingresos, gastos y ahorros para un período determinado, sirviendo como herramienta de control.' }
];

export const comparadorBonosAcciones = [
  { criterio: 'Tipo de instrumento', bono: 'Deuda', accion: 'Patrimonio' },
  { criterio: 'Retorno', bono: 'Intereses fijos', accion: 'Dividendos + ganancia de capital' },
  { criterio: 'Riesgo', bono: 'Menor', accion: 'Mayor' },
  { criterio: 'Prioridad en liquidación', bono: 'Primero', accion: 'Después de acreedores' },
  { criterio: 'Voto en empresa', bono: 'No', accion: 'Sí' },
  { criterio: 'Plazo', bono: 'Corto a largo plazo', accion: 'Indefinido' },
  { criterio: 'Garantía', bono: 'Puede tener garantía', accion: 'No garantizado' }
];

export const sistemaFinancieroNic = {
  nivel1: [
    { nombre: 'Banco Central de Nicaragua (BCN)', tipo: 'primary' }
  ],
  nivel2: [
    { nombre: 'SIBOIF', tipo: 'success' },
    { nombre: 'Bolsa de Comercio de Managua', tipo: 'success' }
  ],
  nivel3: [
    { nombre: 'Bancos Comerciales', tipo: '' },
    { nombre: 'Financieras', tipo: '' },
    { nombre: ' Cooperativas', tipo: '' },
    { nombre: 'Aseguradoras', tipo: '' }
  ]
};

export const quizPreguntas = [
  { pregunta: '¿Qué institución es el ente rector del sistema financiero en Nicaragua?', opciones: ['SIBOIF', 'BCN', 'Bolsa de Managua', 'BAC'], respuesta: 1 },
  { pregunta: '¿Qué representa una acción?', opciones: ['Una deuda', 'Una parte del capital social', 'Un préstamo', 'Un bono'], respuesta: 1 },
  { pregunta: '¿Cuál es la fórmula del Ratio Corriente?', opciones: ['PC / AC', 'AC / PC', 'AC / PC', 'PA / TA'], respuesta: 1 },
  { pregunta: '¿En qué mercado se negocian instrumentos a corto plazo?', opciones: ['Mercado de Capitales', 'Mercado Monetario', 'Mercado Bursátil', 'Mercado Primario'], respuesta: 1 },
  { pregunta: '¿Qué dice la ecuación contable fundamental?', opciones: ['AC = PC + OP', 'A = P + O', 'A = P - O', 'AC = PC'], respuesta: 1 },
  { pregunta: '¿Cómo se calcula la depreciación en línea recta?', opciones: ['Costo / Vida Útil', '(Costo - Residual) / Vida Útil', 'Costo × Vida Útil', 'Costo - Residual'], respuesta: 1 },
  { pregunta: '¿Qué mide el ROA?', opciones: ['Retorno sobre patrimonio', 'Retorno sobre activos', 'Retorno sobre deuda', 'Retorno sobre ventas'], respuesta: 1 },
  { pregunta: '¿Qué es el EOAF?', opciones: ['Estado de Flujo de Efectivo', 'Estado de Origen y Aplicación de Fondos', 'Estado de Evaluación', 'Estado de Operaciones'], respuesta: 1 },
  { pregunta: '¿Qué modelo descompone el ROE en PM × AT × EM?', opciones: ['Modelo de Markowitz', 'Modelo DuPont', 'Modelo CAPM', 'Modelo Black-Scholes'], respuesta: 1 },
  { pregunta: '¿Qué es el Capital Neto de Trabajo?', opciones: ['PC - AC', 'AC - PC', 'AC + PC', 'TA - TP'], respuesta: 1 },
  { pregunta: '¿Cuántos días tiene un año para el cálculo de PPC?', opciones: ['365', '300', '360', '350'], respuesta: 0 },
  { pregunta: '¿Qué tipo de retorno ofrece un bono?', opciones: ['Dividendos', 'Intereses fijos', 'Ganancia de capital', 'Utilidades'], respuesta: 1 }
];

export function initMercados() {
  const page = document.getElementById('page-mercados');
  if (!page) return;

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Mercados e Instituciones Financieras</h1>
      <p class="page-subtitle">Glosario, comparador, mapa financiero y quiz</p>
    </div>
    <div class="tabs">
      <button class="tab-btn active" data-tab="glosario">Glosario</button>
      <button class="tab-btn" data-tab="comparador">Bonos vs Acciones</button>
      <button class="tab-btn" data-tab="mapa">Sistema Financiero</button>
      <button class="tab-btn" data-tab="quiz">Quiz</button>
    </div>
    <div class="tab-content active" id="tab-glosario">
      <div class="glossary-grid" id="glossaryGrid"></div>
    </div>
    <div class="tab-content" id="tab-comparador">
      <div class="card">
        <h3 class="mb-4">Comparador: Bonos vs Acciones</h3>
        <div class="table-wrapper" id="comparadorTable"></div>
      </div>
    </div>
    <div class="tab-content" id="tab-mapa">
      <div class="card">
        <h3 class="mb-4">Sistema Financiero Nicaragüense</h3>
        <div class="financial-map" id="financialMap"></div>
      </div>
    </div>
    <div class="tab-content" id="tab-quiz">
      <div class="card">
        <h3 class="mb-4">Quiz de Mercados</h3>
        <div id="quizContainer"></div>
      </div>
    </div>`;

  page.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      page.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      page.querySelector(`#tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });

  renderGlossary(page);
  renderComparador(page);
  renderMapa(page);
  renderQuiz(page);
}

function renderGlossary(page) {
  const el = page.querySelector('#glossaryGrid');
  el.innerHTML = glosario.map(g => `
    <div class="glossary-item">
      <h4>${g.termino}</h4>
      <p>${g.definicion}</p>
    </div>`).join('');
}

function renderComparador(page) {
  const el = page.querySelector('#comparadorTable');
  el.innerHTML = `
    <table class="comparison-table">
      <thead><tr><th>Criterio</th><th>Bono</th><th>Acción</th></tr></thead>
      <tbody>${comparadorBonosAcciones.map(r => `
        <tr><td class="font-bold">${r.criterio}</td><td>${r.bono}</td><td>${r.accion}</td></tr>
      `).join('')}</tbody>
    </table>`;
}

function renderMapa(page) {
  const el = page.querySelector('#financialMap');
  const renderLevel = (items) => items.map(n => `<div class="map-node ${n.tipo}">${n.nombre}</div>`).join('');
  el.innerHTML = `
    <div class="map-level">${renderLevel(sistemaFinancieroNic.nivel1)}</div>
    <div class="map-connector"></div>
    <div class="map-level">${renderLevel(sistemaFinancieroNic.nivel2)}</div>
    <div class="map-connector"></div>
    <div class="map-level">${renderLevel(sistemaFinancieroNic.nivel3)}</div>`;
}

let quizState = { actual: 0, respuestas: [], completado: false };

function renderQuiz(page) {
  const el = page.querySelector('#quizContainer');
  quizState = { actual: 0, respuestas: [], completado: false };

  function render() {
    if (quizState.completado) {
      const correctas = quizState.respuestas.filter((r, i) => r === quizPreguntas[i].respuesta).length;
      const total = quizPreguntas.length;
      const pct = (correctas / total) * 100;
      el.innerHTML = `
        <div class="quiz-result">
          <div class="quiz-score">${correctas} / ${total}</div>
          <p class="mt-4">Tu puntaje: ${pct.toFixed(0)}%</p>
          <p class="text-muted">${pct >= 70 ? '¡Excelente! Has aprobado.' : 'Sigue estudiando. ¡Tú puedes!'}</p>
          <button class="btn btn-primary mt-6" id="btnRetryQuiz">Reintentar</button>
        </div>`;
      el.querySelector('#btnRetryQuiz')?.addEventListener('click', () => {
        quizState = { actual: 0, respuestas: [], completado: false };
        render();
      });

      store.set('mercados.quizScore', correctas);
      return;
    }
    const q = quizPreguntas[quizState.actual];
    el.innerHTML = `
      <p class="text-muted mb-4">Pregunta ${quizState.actual + 1} de ${quizPreguntas.length}</p>
      <div class="quiz-question">
        <h4>${q.pregunta}</h4>
        <div class="quiz-options">
          ${q.opciones.map((opt, i) => `
            <div class="quiz-option" data-idx="${i}">${opt}</div>
          `).join('')}
        </div>
      </div>`;

    el.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const idx = parseInt(opt.dataset.idx);
        quizState.respuestas[quizState.actual] = idx;
        if (quizState.actual < quizPreguntas.length - 1) {
          quizState.actual++;
          render();
        } else {
          quizState.completado = true;
          render();
        }
      });
    });
  }
  render();
}
