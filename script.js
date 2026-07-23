const bootScreen = document.getElementById('boot-screen');
const output = document.getElementById('boot-output');
const progressFill = document.getElementById('boot-progress-fill');
const progressLabel = document.getElementById('boot-progress-label');
const hero = document.querySelector('.hero');
const body = document.body;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const sequence = [
  { text: 'BOOTING ABHINAV OS...', delay: 220 },
  { text: 'Loading Memories...', delay: 220 },
  { text: '████████░░░░', delay: 220 },
  { text: 'Loading Projects...', delay: 220 },
  { text: '████████████', delay: 220 },
  { text: 'Initializing Humor...', delay: 220 },
  { text: 'OK', delay: 220 },
  { text: 'Initializing Energy...', delay: 220 },
  { text: 'OK', delay: 220 },
  { text: 'Initializing Creativity...', delay: 220 },
  { text: 'OK', delay: 220 },
  { text: 'Preparing Terminal...', delay: 220 },
  { text: 'OK', delay: 220 },
  { text: 'Welcome.', delay: 220 }
];

function typeLine(text, callback) {
  const line = document.createElement('p');
  line.className = 'line';

  const prompt = document.createElement('span');
  prompt.className = 'prompt';
  prompt.textContent = '$';

  const typed = document.createElement('span');
  typed.className = 'boot-screen__typed';

  line.appendChild(prompt);
  line.appendChild(typed);
  output.appendChild(line);

  if (reducedMotion) {
    typed.textContent = text;
    callback();
    return;
  }

  let index = 0;
  const typingSpeed = 32;
  const timer = window.setInterval(() => {
    typed.textContent += text[index];
    index += 1;

    if (index >= text.length) {
      window.clearInterval(timer);
      callback();
    }
  }, typingSpeed);
}

function runBootSequence() {
  body.classList.add('is-booting');
  bootScreen.setAttribute('aria-hidden', 'false');
  hero.setAttribute('aria-hidden', 'true');

  let index = 0;

  function showNextLine() {
    if (index >= sequence.length) {
      finishBoot();
      return;
    }

    const item = sequence[index];
    typeLine(item.text, () => {
      index += 1;
      window.setTimeout(showNextLine, item.delay);
    });
  }

  const totalDuration = reducedMotion ? 900 : 2800;
  const startTime = performance.now();

  function updateProgress() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(100, (elapsed / totalDuration) * 100);
    progressFill.style.width = `${progress}%`;
    progressLabel.textContent = `Loading ${Math.round(progress)}%`;

    if (progress < 100) {
      window.requestAnimationFrame(updateProgress);
    }
  }

  window.requestAnimationFrame(updateProgress);
  showNextLine();
}

function finishBoot() {
  body.classList.remove('is-booting');
  body.classList.add('is-loaded');
  bootScreen.classList.add('is-hidden');
  bootScreen.setAttribute('aria-hidden', 'true');
  hero.setAttribute('aria-hidden', 'false');
}

window.addEventListener('load', () => {
  window.setTimeout(runBootSequence, 180);
});
