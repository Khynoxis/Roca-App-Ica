// public/js/trivia.blocks.js
(function () {
  const $blocks = document.querySelector('.blocks');
  if (!$blocks) return;

  // Barajar Fisher–Yates
  function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  $blocks.addEventListener('click', (e) => {
    const btn = e.target.closest('.block-btn');
    if (!btn) return;

    const block = parseInt(btn.dataset.block, 10);
    if (!(block >= 1 && block <= 5)) return;

    // 50 preguntas totales, bloques de 10
    const start = (block - 1) * 10;   // 0,10,20,30,40
    const order = shuffle(Array.from({ length: 10 }, (_, i) => start + i));

    const state = {
      block,        // 1..5
      order,        // 10 índices barajados del bloque elegido
      index: 0,     // puntero actual en ese orden
      score: 0,
      startedAt: Date.now()
    };
    sessionStorage.setItem('trivia_state', JSON.stringify(state));
    window.location.href = './trivia_play.html';
  });
})();

