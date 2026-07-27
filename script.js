const bootScreen = document.getElementById('boot-screen');
const output = document.getElementById('boot-output');
const progressFill = document.getElementById('boot-progress-fill');
const progressLabel = document.getElementById('boot-progress-label');
const hero = document.querySelector('.hero');
const body = document.body;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroOutput = document.getElementById('hero-output');
const heroCommand = document.getElementById('hero-command');
const heroCursor = document.getElementById('hero-cursor');
const heroPromptLine = document.querySelector('.hero__prompt-line');
const heroCommands = document.getElementById('hero-commands');
const heroContinuation = document.getElementById('hero-continuation');
const heroClock = document.getElementById('hero-clock');

const sequence = [
  { text: 'BOOTING ABHINAV OS...', delay: 300 },
  { text: 'Loading Memories...', delay: 300 },
  { text: '████████░░░░', delay: 300 },
  { text: 'Loading Projects...', delay: 300 },
  { text: '████████████', delay: 300 },
  { text: 'Initializing Humor...', delay: 300 },
  { text: 'OK', delay: 300 },
  { text: 'Initializing Energy...', delay: 300 },
  { text: 'OK', delay: 300 },
  { text: 'Initializing Creativity...', delay: 300 },
  { text: 'OK', delay: 300 },
  { text: 'Preparing Terminal...', delay: 300 },
  { text: 'OK', delay: 300 },
  { text: 'Welcome.', delay: 300 }
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

  window.setTimeout(() => {
    runHeroSequence();
  }, 220);
}

function wait(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function attachCursorToLine(line) {
  if (heroCursor.parentNode && heroCursor.parentNode !== line) {
    heroCursor.parentNode.removeChild(heroCursor);
  }

  heroCursor.classList.remove('is-hidden');
  line.appendChild(heroCursor);
}

function detachCursor() {
  if (heroCursor.parentNode) {
    heroCursor.parentNode.removeChild(heroCursor);
  }
  heroCursor.classList.add('is-hidden');
}

function typePromptText(text) {
  heroCommand.textContent = '';

  if (heroCursor.parentNode) {
    heroCursor.parentNode.removeChild(heroCursor);
  }

  heroPromptLine.appendChild(heroCursor);
  heroCursor.classList.remove('is-hidden');

  if (reducedMotion) {
    heroCommand.textContent = text;
    detachCursor();
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let index = 0;
    const timer = window.setInterval(() => {
      heroCommand.textContent += text[index];
      index += 1;

      if (index >= text.length) {
        window.clearInterval(timer);
        detachCursor();
        resolve();
      }
    }, 38);
  });
}

function typeHeroLine(text, options = {}) {
  const line = document.createElement('p');
  line.className = options.lineClass || 'line hero__typed-line';
  heroOutput.appendChild(line);

  const segments = Array.isArray(text) ? text : [{ text, className: '' }];
  const spans = segments.map((segment) => {
    const span = document.createElement('span');
    span.className = segment.className || '';
    line.appendChild(span);
    return span;
  });

  attachCursorToLine(line);

  if (reducedMotion) {
    spans.forEach((span, index) => {
      span.textContent = segments[index].text;
    });

    if (!options.keepCursor) {
      detachCursor();
    }
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let segmentIndex = 0;
    let charIndex = 0;

    const timer = window.setInterval(() => {
      const currentSegment = segments[segmentIndex];
      const currentSpan = spans[segmentIndex];
      currentSpan.textContent += currentSegment.text[charIndex];
      charIndex += 1;

      if (charIndex >= currentSegment.text.length) {
        segmentIndex += 1;
        charIndex = 0;
      }

      if (segmentIndex >= segments.length) {
        window.clearInterval(timer);
        if (!options.keepCursor) {
          detachCursor();
        }
        resolve();
      }
    }, options.speed || 34);
  });
}

function renderCommands() {
  heroCommands.innerHTML = '';
  heroCommands.hidden = false;

  const commands = [
    { label: 'whoami', target: '#whoami' },
    { label: 'history', target: '#history' },
    { label: 'projects', target: '#projects' },
    { label: 'passions', target: '#passions' },
    { label: 'future', target: '#future' }
  ];

  commands.forEach((command) => {
    const link = document.createElement('a');
    link.className = 'hero__command-link';
    link.href = command.target;
    link.textContent = `> ${command.label}`;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(command.target);
      if (target) {
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
    heroCommands.appendChild(link);
  });
}

async function runHeroSequence() {
  heroOutput.innerHTML = '';
  heroCommands.innerHTML = '';
  heroCommands.hidden = true;
  heroContinuation.hidden = true;
  heroCursor.classList.remove('is-hidden');

  await typePromptText('boot abhinaav-os');
  await wait(280);

  await typeHeroLine('Microsoft Windows [Version 11.x]', { lineClass: 'line hero__typed-line hero__typed-line--title' });
  await wait(220);
  await typeHeroLine('(c) Microsoft Corporation. All rights reserved.', { lineClass: 'line hero__typed-line' });
  await wait(220);
  await typeHeroLine('Initializing...', { lineClass: 'line hero__status-line' });
  await wait(220);
  await typeHeroLine('System Ready.', { lineClass: 'line hero__status-line hero__status-line--ready' });
  await wait(420);

  const introLines = [
    'Hello.',
    [
      { text: "I'm ", className: '' },
      { text: 'ABHINAV SHARMA', className: 'hero__name' },
      { text: '.', className: '' }
    ],
    'Student.',
    'Builder.',
    'Designer.',
    'Developer.',
    'Cricket enthusiast.',
    'Professional overthinker.',
    'Currently making impossible ideas happen.'
  ];

  for (const [index, line] of introLines.entries()) {
    await typeHeroLine(line, {
      lineClass: 'line hero__intro-line',
      keepCursor: index === introLines.length - 1
    });
    await wait(180);
  }

  renderCommands();
  heroContinuation.hidden = false;
  heroContinuation.innerHTML = '<span class="prompt">&gt;</span> Press ENTER to continue...';
}

function updateClock() {
  if (!heroClock) {
    return;
  }

  const now = new Date();
  heroClock.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
}

window.addEventListener('load', () => {
  updateClock();
  window.setInterval(updateClock, 1000);
  window.setTimeout(runBootSequence, 180);
});
