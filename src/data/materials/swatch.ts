// ── Procedural material swatch generator ─────────────────────────────────────
//
// No real material photography exists for this project yet. Rather than use
// stock/internet photos (explicitly disallowed), we render small canvas-based
// texture swatches that approximate how each material actually looks —
// corrugation for painted steel, a glossy speckled surface for epoxy, grain
// lines for wood-look vinyl, seams for PVC panels, etc. Each MaterialItem also
// carries an optional `thumbnail` field for a real photo path; when present
// (future upgrade) that always wins over the generated swatch — see
// `resolveSwatchUrl` in `types.ts` and its usage in `MaterialCard`.
//
// Everything here runs client-side only (canvas) and results are memoized so
// repeated renders (e.g. re-render on selection change) don't redraw.

export type SwatchPattern =
  | "corrugated" // painted container steel — vertical ribs + diagonal sheen
  | "glossy" // epoxy floor — saturated color, speckle, glossy sheen band
  | "woodgrain" // vinyl/laminate/plywood — grain lines + plank seams
  | "panelseam" // PVC / isothermal panel — subtle vertical seams
  | "stipple" // rubber flooring — small raised dot studs
  | "speckle" // porcelain tile — fine speckle + grout grid
  | "mottled" // cimento queimado — blotchy cloud tones
  | "brushed" // metal / naval floor — fine brush lines + diamond plate
  | "flat" // drywall / MDF — near-flat with faint noise
  | "glass" // window glass — gradient + diagonal reflections
  | "louvered" // basculante window — horizontal glass slats
  | "osb"; // OSB board — wood chip/flake pattern

export interface SwatchSpec {
  pattern: SwatchPattern;
  color: string; // base hex color, e.g. "#4B5563"
  accent?: string; // optional secondary hex (pattern-dependent)
}

type RGB = [number, number, number];

const cache = new Map<string, string>();

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const norm = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(norm, 16) || 0;
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function rgbToCss(rgb: RGB, a = 1): string {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

function shade(rgb: RGB, amt: number): RGB {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)));
  return [c(rgb[0]), c(rgb[1]), c(rgb[2])];
}

function seedRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return function next() {
    h = (Math.imul(h, 1664525) + 1013904223) | 0;
    return (h >>> 0) / 4294967296;
  };
}

function drawCorrugated(ctx: CanvasRenderingContext2D, W: number, H: number, base: RGB) {
  const cycles = 16;
  const cw = W / cycles;
  for (let i = 0; i < cycles; i++) {
    const x = i * cw;
    const grad = ctx.createLinearGradient(x, 0, x + cw, 0);
    grad.addColorStop(0.0, rgbToCss(shade(base, -35)));
    grad.addColorStop(0.3, rgbToCss(shade(base, 10)));
    grad.addColorStop(0.55, rgbToCss(shade(base, 45)));
    grad.addColorStop(0.75, rgbToCss(shade(base, 5)));
    grad.addColorStop(1.0, rgbToCss(shade(base, -35)));
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, cw + 1, H);
  }
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, "rgba(255,255,255,0.10)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);
}

function drawGlossy(ctx: CanvasRenderingContext2D, W: number, H: number, base: RGB, rand: () => number) {
  const vg = ctx.createLinearGradient(0, 0, 0, H);
  vg.addColorStop(0, rgbToCss(shade(base, 12)));
  vg.addColorStop(1, rgbToCss(shade(base, -18)));
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    const x = rand() * W, y = rand() * H, r = rand() * 1.1 + 0.3;
    ctx.fillStyle = `rgba(255,255,255,${(rand() * 0.1 + 0.02).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0.15, "rgba(255,255,255,0)");
  sheen.addColorStop(0.32, "rgba(255,255,255,0.24)");
  sheen.addColorStop(0.45, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);
}

function drawWoodgrain(ctx: CanvasRenderingContext2D, W: number, H: number, base: RGB, rand: () => number) {
  const rows = 26;
  for (let i = 0; i < rows; i++) {
    const y = (i / rows) * H;
    ctx.strokeStyle = rgbToCss(shade(base, rand() * 30 - 15));
    ctx.lineWidth = 1 + rand() * 1.5;
    ctx.globalAlpha = 0.35 + rand() * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 20) {
      ctx.lineTo(x, y + Math.sin(x / 40 + i) * (2 + rand() * 2));
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 1.5;
  for (let x = 80; x < W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
}

function drawPanelSeam(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const seams = 4;
  const sw = W / seams;
  for (let i = 1; i < seams; i++) {
    const x = i * sw;
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(x - 1, 0, 2, H);
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(x + 1, 0, 1, H);
  }
  const sheen = ctx.createLinearGradient(0, 0, W, 0);
  sheen.addColorStop(0, "rgba(255,255,255,0.05)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.14)");
  sheen.addColorStop(1, "rgba(255,255,255,0.05)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);
}

function drawStipple(ctx: CanvasRenderingContext2D, W: number, H: number, base: RGB) {
  const cols = 18, rows = 11;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) * (W / cols) + (r % 2 ? W / cols / 2 : 0);
      const y = (r + 0.5) * (H / rows);
      ctx.fillStyle = rgbToCss(shade(base, -25));
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.beginPath();
      ctx.arc(x - 0.6, y - 0.6, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSpeckle(ctx: CanvasRenderingContext2D, W: number, H: number, base: RGB, rand: () => number) {
  for (let i = 0; i < 420; i++) {
    const x = rand() * W, y = rand() * H;
    ctx.fillStyle = rgbToCss(shade(base, rand() * 40 - 20));
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.strokeStyle = "rgba(0,0,0,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();
}

function drawMottled(ctx: CanvasRenderingContext2D, W: number, H: number, base: RGB, rand: () => number) {
  for (let i = 0; i < 40; i++) {
    const x = rand() * W, y = rand() * H, r = 20 + rand() * 60;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const s = shade(base, rand() * 36 - 18);
    g.addColorStop(0, rgbToCss(s, 0.5));
    g.addColorStop(1, rgbToCss(s, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBrushed(ctx: CanvasRenderingContext2D, W: number, H: number, base: RGB) {
  for (let y = 0; y < H; y++) {
    const n = (Math.sin(y * 0.7) + 1) / 2;
    ctx.fillStyle = rgbToCss(shade(base, n * 14 - 7));
    ctx.fillRect(0, y, W, 1);
  }
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0.2, "rgba(255,255,255,0)");
  sheen.addColorStop(0.4, "rgba(255,255,255,0.18)");
  sheen.addColorStop(0.55, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(0,0,0,0.10)";
  for (let x = 10; x < W; x += 26) {
    for (let y = 10; y < H; y += 26) {
      ctx.beginPath();
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x, y - 5);
      ctx.lineTo(x + 5, y);
      ctx.lineTo(x, y + 5);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function drawFlatNoise(ctx: CanvasRenderingContext2D, W: number, H: number, rand: () => number) {
  for (let i = 0; i < 600; i++) {
    const x = rand() * W, y = rand() * H;
    ctx.fillStyle = `rgba(0,0,0,${(rand() * 0.04).toFixed(3)})`;
    ctx.fillRect(x, y, 1, 1);
  }
  const vg = ctx.createLinearGradient(0, 0, 0, H);
  vg.addColorStop(0, "rgba(255,255,255,0.06)");
  vg.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

function drawGlass(ctx: CanvasRenderingContext2D, W: number, H: number, base: RGB) {
  const vg = ctx.createLinearGradient(0, 0, W, H);
  vg.addColorStop(0, rgbToCss(shade(base, 20)));
  vg.addColorStop(1, rgbToCss(shade(base, -30)));
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.moveTo(W * 0.1, H);
  ctx.lineTo(W * 0.35, 0);
  ctx.lineTo(W * 0.5, 0);
  ctx.lineTo(W * 0.25, H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.beginPath();
  ctx.moveTo(W * 0.55, H);
  ctx.lineTo(W * 0.7, 0);
  ctx.lineTo(W * 0.78, 0);
  ctx.lineTo(W * 0.63, H);
  ctx.closePath();
  ctx.fill();
}

function drawLouvered(ctx: CanvasRenderingContext2D, W: number, H: number, base: RGB) {
  drawGlass(ctx, W, H, base);
  const slats = 7;
  for (let i = 0; i < slats; i++) {
    const y = (i / slats) * H;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(0, y, W, 3);
  }
}

function drawOSB(ctx: CanvasRenderingContext2D, W: number, H: number, base: RGB, rand: () => number) {
  for (let i = 0; i < 160; i++) {
    const x = rand() * W, y = rand() * H;
    const w = 8 + rand() * 22, h = 3 + rand() * 6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand() * Math.PI);
    ctx.fillStyle = rgbToCss(shade(base, rand() * 50 - 25), 0.85);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

/** Renders (and memoizes) a procedural texture swatch as a data URL. */
export function generateSwatch(spec: SwatchSpec): string {
  const key = `${spec.pattern}|${spec.color}|${spec.accent ?? ""}`;
  const hit = cache.get(key);
  if (hit) return hit;

  if (typeof document === "undefined") return "";

  const W = 320, H = 200;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const base = hexToRgb(spec.color);
  const rand = seedRandom(key);

  ctx.fillStyle = rgbToCss(base);
  ctx.fillRect(0, 0, W, H);

  switch (spec.pattern) {
    case "corrugated": drawCorrugated(ctx, W, H, base); break;
    case "glossy": drawGlossy(ctx, W, H, base, rand); break;
    case "woodgrain": drawWoodgrain(ctx, W, H, base, rand); break;
    case "panelseam": drawPanelSeam(ctx, W, H); break;
    case "stipple": drawStipple(ctx, W, H, base); break;
    case "speckle": drawSpeckle(ctx, W, H, base, rand); break;
    case "mottled": drawMottled(ctx, W, H, base, rand); break;
    case "brushed": drawBrushed(ctx, W, H, base); break;
    case "flat": drawFlatNoise(ctx, W, H, rand); break;
    case "glass": drawGlass(ctx, W, H, base); break;
    case "louvered": drawLouvered(ctx, W, H, base); break;
    case "osb": drawOSB(ctx, W, H, base, rand); break;
  }

  // Subtle rounded vignette so swatches feel like a physical sample, not a flat rect
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.14)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  const url = canvas.toDataURL("image/webp", 0.85);
  cache.set(key, url);
  return url;
}
