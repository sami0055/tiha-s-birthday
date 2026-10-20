const gate = document.querySelector('.gift-gate');
const mainPage = document.querySelector('#birthday-page');
const pageFooter = document.querySelector('footer');
const openButton = document.querySelector('.open-gift');
const soundToggle = document.querySelector('.sound-toggle');
const soundLabel = document.querySelector('.sound-label');
const progressBar = document.querySelector('.scroll-progress span');
const confettiLayer = document.querySelector('#confetti-layer');
const countdownCard = document.querySelector('.countdown-card');
const countdownNumber = document.querySelector('.countdown-number');
const countdownButton = document.querySelector('.start-countdown');
const surpriseStage = document.querySelector('.surprise-stage');
const cake = document.querySelector('.cake');
const againButton = document.querySelector('.again-button');

let soundOn = true;
let audioContext;
let countdownRunning = false;

function unlockPage() {
  mainPage.removeAttribute('inert');
  mainPage.setAttribute('aria-hidden', 'false');
  pageFooter.removeAttribute('inert');
  pageFooter.setAttribute('aria-hidden', 'false');
  soundToggle.tabIndex = 0;
  document.body.classList.add('gift-opened');
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioContext = new AudioContext();
  }
  return audioContext;
}

function playNotes(notes = [523.25, 659.25, 783.99], duration = 0.55) {
  if (!soundOn) return;
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') context.resume();

  const now = context.currentTime;
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + index * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.075, now + index * 0.1 + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + index * 0.1);
    oscillator.stop(now + index * 0.1 + duration + 0.05);
  });
}

function celebrate(amount = 70, heartRatio = 0.18) {
  const colors = ['#704777', '#b894c8', '#f0b8cd', '#f2da84', '#fffaf4'];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement('span');
    const isHeart = Math.random() < heartRatio;
    piece.className = `confetti-piece${isHeart ? ' heart' : ''}`;
    if (isHeart) piece.textContent = '♡';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.color = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--fall-time', `${3.2 + Math.random() * 3.1}s`);
    piece.style.setProperty('--sway', `${-90 + Math.random() * 180}px`);
    piece.style.setProperty('--turn', `${360 + Math.random() * 720}deg`);
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    fragment.appendChild(piece);
    window.setTimeout(() => piece.remove(), 7000);
  }

  confettiLayer.appendChild(fragment);
}

openButton.addEventListener('click', () => {
  playNotes([523.25, 659.25, 783.99, 1046.5], 0.7);
  celebrate(55, 0.24);
  gate.classList.add('is-opening');
  unlockPage();
  window.setTimeout(() => {
    gate.hidden = true;
    document.querySelector('#top').focus({ preventScroll: true });
  }, 850);
});

// Handy for private preview links and visual QA; the regular shared URL still opens as a sealed gift.
if (new URLSearchParams(window.location.search).get('open') === '1') {
  gate.hidden = true;
  unlockPage();
}

soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.setAttribute('aria-pressed', String(soundOn));
  soundToggle.setAttribute('aria-label', soundOn ? 'Turn little sounds off' : 'Turn little sounds on');
  soundLabel.textContent = soundOn ? 'little sounds on' : 'little sounds off';
  if (soundOn) playNotes([659.25, 783.99], 0.35);
});

document.querySelectorAll('.compliment-card').forEach((card, index) => {
  card.addEventListener('click', () => {
    const isOpen = card.classList.toggle('is-open');
    card.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) playNotes([523.25 + index * 60, 659.25 + index * 70], 0.3);
  });
});

function showSurprise() {
  countdownCard.classList.add('is-revealed');
  surpriseStage.setAttribute('aria-hidden', 'false');
  countdownRunning = false;
  celebrate(95, 0.25);
  playNotes([523.25, 659.25, 783.99, 1046.5], 0.8);
  window.setTimeout(() => cake.focus(), 700);
}

function startCountdown() {
  if (countdownRunning) return;
  countdownRunning = true;
  countdownButton.disabled = true;
  let count = 3;
  countdownNumber.classList.add('is-counting');
  countdownNumber.textContent = count;
  playNotes([392], 0.22);

  const interval = window.setInterval(() => {
    count -= 1;
    countdownNumber.classList.remove('is-counting');
    void countdownNumber.offsetWidth;
    countdownNumber.classList.add('is-counting');

    if (count > 0) {
      countdownNumber.textContent = count;
      playNotes([392 + (3 - count) * 64], 0.22);
      return;
    }

    window.clearInterval(interval);
    countdownNumber.textContent = '✦';
    window.setTimeout(showSurprise, 600);
  }, 900);
}

countdownButton.addEventListener('click', startCountdown);

cake.addEventListener('click', () => {
  if (cake.classList.contains('candles-out')) return;
  cake.classList.add('candles-out');
  playNotes([783.99, 659.25, 523.25, 1046.5], 0.72);
  celebrate(130, 0.33);
  window.setTimeout(() => surpriseStage.classList.add('wish-made'), 550);
});

againButton.addEventListener('click', () => {
  surpriseStage.classList.remove('wish-made');
  cake.classList.remove('candles-out');
  celebrate(50, 0.3);
  playNotes([659.25, 783.99, 1046.5], 0.55);
  window.setTimeout(() => cake.focus(), 450);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  progressBar.style.width = `${ratio * 100}%`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}
