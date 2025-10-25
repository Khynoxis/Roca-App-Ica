(async function () {
  const root = document.getElementById('trivia');

  // ---- Utils ----
  async function loadData() {
    const res = await fetch('./data/trivia.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo cargar trivia.json');
    return res.json();
  }
  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---- Estado ----
  let pool = [];           // todas las preguntas (esperadas 50)
  let preguntas = [];      // bloque activo (10)
  let idx = 0;             // índice en bloque
  let aciertos = 0;        // puntaje
  let blockIndex = null;   // 0..4

  // ---- Vistas ----
  function renderBloques() {
    const total = pool.length;
    const blocks = Array.from({ length: 5 }, (_, i) => {
      const start = i * 10;
      const end = Math.min(start + 10, total);
      const enabled = end - start === 10;
      return { i, start, end, enabled, label: `Bloque ${i + 1}`, rango: `${start + 1}–${end}` };
    });

    root.innerHTML = `
      <div class="trivia-header">
        <div class="pill">Elige un bloque</div>
        <div class="pill score">${total} preguntas totales</div>
      </div>

      <div class="block-grid">
        ${blocks.map(b => `
          <button class="btn block-btn" data-i="${b.i}" ${b.enabled ? '' : 'disabled'}>
            <span>${b.label}</span>
            <small>${b.rango}</small>
          </button>
        `).join('')}
      </div>

      <div class="actions">
        <a class="btn small" href="index.html">← Volver al inicio</a>
      </div>
    `;

    root.querySelectorAll('.block-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        startBlock(i);
      }, { passive: true });
    });
  }

  function startBlock(i) {
    blockIndex = i;
    const start = i * 10;
    const end = start + 10;
    preguntas = pool.slice(start, end).map(p => ({
      q: p.q,
      a: p.a.slice(),
      c: p.c
    }));
    idx = 0;
    aciertos = 0;
    renderPregunta();
  }

  function renderPregunta() {
    const total = preguntas.length;
    if (idx >= total) return renderResultado();

    const p = preguntas[idx];
    const opciones = shuffle(p.a);
    const correcta = p.a[p.c];

    root.innerHTML = `
      <div class="trivia-header">
        <div class="pill">Bloque ${blockIndex + 1} · Pregunta ${idx + 1} / ${total}</div>
        <div class="pill score">Aciertos: ${aciertos}</div>
      </div>

      <h3 class="q">${p.q}</h3>

      <div class="answers">
        ${opciones.map(op => `
          <button class="ans" data-correct="${op === correcta}">
            <span>${op}</span>
          </button>
        `).join('')}
      </div>

      <div class="actions two">
        <button id="backBlocks" class="btn small">Elegir bloque</button>
        <button id="nextBtn" class="btn small" disabled>Siguiente</button>
      </div>
    `;

    let locked = false;
    const buttons = [...root.querySelectorAll('.ans')];
    const nextBtn = root.querySelector('#nextBtn');
    const backBtn = root.querySelector('#backBlocks');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (locked) return;
        locked = true;

        const isCorrect = btn.dataset.correct === 'true';
        if (isCorrect) {
          aciertos++;
          btn.classList.add('ok');
        } else {
          btn.classList.add('bad');
          const right = buttons.find(b => b.dataset.correct === 'true');
          if (right) right.classList.add('ok');
        }
        buttons.forEach(b => b.disabled = true);
        nextBtn.disabled = false;
      }, { passive: true });
    });

    nextBtn.addEventListener('click', () => { idx++; renderPregunta(); });
    backBtn.addEventListener('click', () => { renderBloques(); });
  }

  function renderResultado() {
    const total = preguntas.length;
    root.innerHTML = `
      <div class="trivia-result">
        <h3>Bloque ${blockIndex + 1} completado</h3>
        <p>Acertaste <strong>${aciertos}</strong> de <strong>${total}</strong>.</p>
        <div class="result-actions">
          <button id="replay" class="btn">Repetir bloque</button>
          <button id="choose" class="btn">Elegir otro bloque</button>
          <a class="btn" href="index.html">Volver al inicio</a>
        </div>
      </div>
    `;

    root.querySelector('#replay').onclick = () => startBlock(blockIndex);
    root.querySelector('#choose').onclick = renderBloques;
  }

  function initData(data) {
    pool = (data.preguntas || []).slice(0); // esperamos 50
  }

  async function init() {
    root.innerHTML = `<div class="loading">Cargando preguntas…</div>`;
    try {
      const data = await loadData();
      initData(data);
      renderBloques();
    } catch (e) {
      root.innerHTML = `<div class="error">Error: ${e.message}</div>`;
      console.error(e);
    }
  }

  init();
})();
