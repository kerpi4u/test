/** Live performance telemetry rendered with the Performance API. */
import { formatNumber } from "../lib/utils.js";

const HISTORY = 48;

function navigationTiming() {
  const [nav] = performance.getEntriesByType?.("navigation") || [];
  if (nav && nav.loadEventEnd > 0) {
    return Math.max(0, nav.loadEventEnd - nav.startTime);
  }

  const timing = performance.timing;
  if (timing && timing.loadEventEnd > 0) {
    return Math.max(0, timing.loadEventEnd - timing.navigationStart);
  }
  return Math.max(0, performance.now());
}

function transferredBytes() {
  const resources = performance.getEntriesByType?.("resource") || [];
  const resourceBytes = resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);

  const [nav] = performance.getEntriesByType?.("navigation") || [];
  return resourceBytes + (nav?.transferSize || 0);
}

function browserLabel() {
  const ua = navigator.userAgent;
  const brands = navigator.userAgentData?.brands;
  const brand = brands?.find((item) => !/Not A|Brand/i.test(item.brand));
  if (brand) return `${brand.brand} ${brand.version}`;

  if (/Firefox\/(\d+)/.test(ua)) return `Firefox ${RegExp.$1}`;
  if (/Edg\/(\d+)/.test(ua)) return `Edge ${RegExp.$1}`;
  if (/Chrome\/(\d+)/.test(ua)) return `Chrome ${RegExp.$1}`;
  if (/Version\/(\d+).*Safari/.test(ua)) return `Safari ${RegExp.$1}`;
  return "Browser";
}

export function initMetrics() {
  const fpsEl = document.getElementById("m-fps");
  const loadEl = document.getElementById("m-load");
  const payloadEl = document.getElementById("m-payload");
  const nodesEl = document.getElementById("m-nodes");
  const envEl = document.getElementById("m-env");
  const spark = document.getElementById("fps-spark");
  if (!fpsEl || !loadEl || !payloadEl || !nodesEl) return () => {};

  const history = [];
  let frames = 0;
  let lastTick = performance.now();
  let raf = 0;
  let timer = 0;

  function drawSpark() {
    if (!spark) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = spark.clientWidth || 240;
    const height = spark.clientHeight || 42;
    if (spark.width !== width * dpr || spark.height !== height * dpr) {
      spark.width = Math.round(width * dpr);
      spark.height = Math.round(height * dpr);
    }

    const ctx = spark.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const color = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#22d3ee";
    const max = Math.max(60, ...history);
    const step = width / Math.max(1, HISTORY - 1);

    ctx.beginPath();
    history.forEach((value, index) => {
      const x = index * step;
      const y = height - (value / max) * (height - 6) - 3;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Baseline for 60 fps
    const baseline = height - (60 / max) * (height - 6) - 3;
    ctx.beginPath();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 1;
    ctx.moveTo(0, baseline);
    ctx.lineTo(width, baseline);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function tick() {
    frames += 1;
  }

  function sample() {
    const now = performance.now();
    const elapsed = now - lastTick;
    const fps = elapsed > 0 ? Math.round((frames * 1000) / elapsed) : 60;
    frames = 0;
    lastTick = now;

    history.push(fps);
    if (history.length > HISTORY) history.shift();

    fpsEl.textContent = String(fps);
    drawSpark();
  }

  function refresh() {
    loadEl.textContent = formatNumber(navigationTiming());
    payloadEl.textContent = String(Math.max(1, Math.round(transferredBytes() / 1024)));
    nodesEl.textContent = formatNumber(document.querySelectorAll("*").length);
    envEl.textContent = `${browserLabel()} · ${window.innerWidth}×${window.innerHeight} · DPR ${
      Math.min(window.devicePixelRatio || 1, 2)
    }`;
  }

  function updateEnv() {
    refresh();
  }

  loadEl.textContent = formatNumber(navigationTiming());
  payloadEl.textContent = String(Math.max(1, Math.round(transferredBytes() / 1024)));
  nodesEl.textContent = formatNumber(document.querySelectorAll("*").length);
  refresh();

  const animation = () => {
    tick();
    raf = requestAnimationFrame(animation);
  };
  raf = requestAnimationFrame(animation);
  timer = setInterval(sample, 1000);

  const onWindowResize = () => {
    updateEnv();
    drawSpark();
  };
  window.addEventListener("resize", onWindowResize, { passive: true });
  document.addEventListener("theme:change", drawSpark);

  drawSpark();
  sample();

  return () => {
    cancelAnimationFrame(raf);
    clearInterval(timer);
    window.removeEventListener("resize", onWindowResize);
    document.removeEventListener("theme:change", drawSpark);
  };
}
