/** Rotating typewriter for the hero line. */
export function initTypewriter(element, phrases) {
  if (!element || !phrases.length) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    element.textContent = phrases[0];
    return () => {};
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let timer = 0;

  function tick() {
    const phrase = phrases[phraseIndex];
    element.textContent = phrase.slice(0, charIndex);

    let delay = deleting ? 38 : 62;

    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      delay = 1800;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 320;
    } else {
      charIndex += deleting ? -1 : 1;
    }

    timer = window.setTimeout(tick, delay);
  }

  timer = window.setTimeout(tick, 600);

  return () => window.clearTimeout(timer);
}
