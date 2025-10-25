const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const out = document.getElementById('resultado');
const sectores = 8;

spinBtn.onclick = () => {
  const ganador = Math.floor(Math.random() * sectores); // 0..7
  const gradosPorSector = 360 / sectores;
  const offset = gradosPorSector / 2; // apunta al centro del sector
  const vueltas = 6 * 360;
  const giro = vueltas + (360 - (ganador * gradosPorSector + offset));
  wheel.style.transform = `rotate(${giro}deg)`;
  out.textContent = '';
  setTimeout(() => out.textContent = `Salió: ${ganador + 1}`, 4200);
};
