/**
 * Ambient constellation canvas.
 * Nodes drift slowly, connect to close neighbours and react to the pointer.
 * Pauses when the tab is hidden and disables itself for reduced-motion users.
 */
export function initParticles(canvas) {
  if (!canvas) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let width = 0;
  let height = 0;
  let nodes = [];
  let frame = 0;
  let running = true;
  const pointer = { x: -9999, y: -9999, active: false };
  const linkDistance = 130;

  function nodeCount() {
    const area = width * height;
    return Math.max(18, Math.min(90, Math.round(area / 26000)));
  }

  function createNode() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: 0.8 + Math.random() * 1.7,
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = reduceMotion ? 26 : nodeCount();
    nodes = Array.from({ length: count }, createNode);

    if (reduceMotion) draw();
  }

  function accent() {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    return value || "#22d3ee";
  }

  function step() {
    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < -20) node.x = width + 20;
      if (node.x > width + 20) node.x = -20;
      if (node.y < -20) node.y = height + 20;
      if (node.y > height + 20) node.y = -20;

      if (pointer.active) {
        const dx = node.x - pointer.x;
        const dy = node.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140 && dist > 0.01) {
          const force = (140 - dist) / 140;
          node.x += (dx / dist) * force * 1.1;
          node.y += (dy / dist) * force * 1.1;
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const color = accent();

    ctx.lineWidth = 0.7;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist > linkDistance) continue;
        ctx.globalAlpha = (1 - dist / linkDistance) * 0.22;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = color;
    for (const node of nodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop() {
    if (!running) return;
    if (!reduceMotion) {
      step();
      draw();
    }
    frame = requestAnimationFrame(loop);
  }

  function onPointerMove(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }

  function onPointerLeave() {
    pointer.active = false;
  }

  function onVisibility() {
    running = !document.hidden;
    if (running && !reduceMotion) {
      cancelAnimationFrame(frame);
      loop();
    }
  }

  resize();
  if (!reduceMotion) loop();

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);
  document.addEventListener("theme:change", draw);

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerleave", onPointerLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    document.removeEventListener("theme:change", draw);
  };
}
