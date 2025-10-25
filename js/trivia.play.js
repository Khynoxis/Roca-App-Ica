// public/js/trivia.play.js
import TimerLine, { resolveTimerDuration } from './timerLine.js';

(async function () {
  const state = JSON.parse(sessionStorage.getItem('trivia_state') || 'null');
  if (!state || !Array.isArray(state.order)) {
    window.location.replace('./trivia.html');
    return;
  }

  // Carga preguntas
  const DATA_URL = './data/trivia.json';
  let questions = [];
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('No se pudo cargar trivia.json');
    const data = await res.json();
    const all = Array.isArray(data?.preguntas) ? data.preguntas : [];
    questions = state.order.map(i => all[i]).filter(Boolean);
  } catch (err) {
    console.error(err);
    alert('Error cargando preguntas.');
    window.location.replace('./trivia.html');
    return;
  }

  const $hdr = document.getElementById('hdr');
  const $qtext = document.getElementById('qtext');
  const $answers = document.getElementById('answers');
  const $timerBox = document.querySelector('.timer');
  const $timerBar = document.getElementById('timerBar');

  // === Config del cronómetro ===
  // Puedes cambiar la duración de 3 maneras:
  // A) <div class="timer" data-duration="60000">   ← ms o "60s"
  // B) URL .../trivia-play.html?t=45               ← segundos
  // C) sessionStorage.setItem('trivia_timer_ms', 45000);
  const DURATION_MS = resolveTimerDuration($timerBox);
  const timer = new TimerLine($timerBar, {
    duration: DURATION_MS,
    onEnd: () => onTimeout()
  });

  function renderHeader() {
    $hdr.textContent = `Bloque ${state.block} — Pregunta ${state.index + 1} / ${questions.length}`;
  }

  function renderQuestion() {
    const q = questions[state.index];
    if (!q) return finish();

    // Texto y respuestas
    $qtext.textContent = q.q || '—';
    $answers.innerHTML = '';
    q.a.forEach((txt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'ans';
      btn.innerHTML = `<span>${txt}</span>`;
      btn.addEventListener('click', () => onAnswer(idx));
      $answers.appendChild(btn);
    });

    renderHeader();

    // (Re)inicia el cronómetro para esta pregunta
    timer.reset();
    timer.start();
  }

  function markAnswers(correctIdx, pickedIdx) {
    const buttons = [...document.querySelectorAll('.ans')];
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === correctIdx) b.classList.add('ok');
      if (pickedIdx != null && i === pickedIdx && pickedIdx !== correctIdx) {
        b.classList.add('bad');
      }
    });
  }

  function onAnswer(idx) {
    const q = questions[state.index];
    const isOk = idx === q.c;
    timer.stop(); // parar cronómetro al responder
    if (isOk) state.score++;
    markAnswers(q.c, idx);

    setTimeout(nextQuestion, 900);
  }

  function onTimeout() {
    // Se acabó el tiempo: no se seleccionó nada -> solo marcar la correcta
    const q = questions[state.index];
    markAnswers(q.c, null);
    setTimeout(nextQuestion, 900);
  }

  function nextQuestion() {
    state.index++;
    sessionStorage.setItem('trivia_state', JSON.stringify(state));
    if (state.index >= questions.length) return finish();
    renderQuestion();
  }

  function finish() {
    sessionStorage.setItem('trivia_state', JSON.stringify(state));
    alert(`¡Listo! Puntaje: ${state.score}/${questions.length}`);
    window.location.replace('./trivia.html');
  }

  // Arranque
  renderQuestion();
})();
