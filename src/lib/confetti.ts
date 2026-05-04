import confetti from 'canvas-confetti';

export function launchSuccessConfetti() {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    confetti({
      particleCount: 40,
      spread: 55,
      origin: { y: 0.75 },
      scalar: 0.8,
      disableForReducedMotion: true,
    });
    return;
  }

  const defaults = {
    spread: 65,
    ticks: 180,
    gravity: 0.9,
    decay: 0.91,
    scalar: 0.9,
  };

  confetti({
    ...defaults,
    particleCount: 70,
    origin: { x: 0.18, y: 0.78 },
  });

  window.setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 85,
      origin: { x: 0.82, y: 0.78 },
    });
  }, 140);

  window.setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 45,
      spread: 85,
      origin: { x: 0.5, y: 0.72 },
    });
  }, 280);
}
