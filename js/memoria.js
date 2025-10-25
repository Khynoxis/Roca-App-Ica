const grid = document.getElementById('grid');
const status = document.getElementById('status');
const base = ['🍎','🍌','🍇','🍒','🍉','🍑','🥝','🍍']; // 8 pares = 16 cartas
let cartas = shuffle([...base, ...base]).map((v, i) => ({ id:i, v, open:false, matched:false }));
let abierto = [];

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function render(){
  grid.innerHTML = '';
  cartas.forEach(c => {
    const el = document.createElement('div');
    el.className = 'card' + (c.matched ? ' matched':'');
    el.textContent = c.open || c.matched ? c.v : '❓';
    el.onclick = () => click(c);
    grid.appendChild(el);
  });
  const quedan = cartas.filter(c=>!c.matched).length;
  status.textContent = quedan === 0 ? '¡Completado! 🎉' : `Pares restantes: ${quedan/2}`;
}

function click(c){
  if (c.matched || c.open) return;
  if (abierto.length === 2) return;
  c.open = true; abierto.push(c); render();

  if (abierto.length === 2){
    const [a,b] = abierto;
    if (a.v === b.v){
      a.matched = b.matched = true;
      abierto = [];
      render();
    } else {
      setTimeout(() => {
        a.open = b.open = false; abierto = []; render();
      }, 600);
    }
  }
}

render();
