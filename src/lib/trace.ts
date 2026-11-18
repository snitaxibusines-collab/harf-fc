// Vérifier un tracé au doigt, sans internet.
// On dessine la lettre modèle en cachette, puis on compare avec le tracé de l'enfant :
// - couverture : quelle part de la lettre a été repassée ;
// - précision : quelle part du tracé reste près de la lettre.

export const ARABIC_FONT = '"Noto Naskh Arabic", serif';

export interface Point {
  x: number;
  y: number;
}

export interface TraceLayout {
  width: number;
  height: number;
  fontSize: number;
  baseline: number;
}

export function layoutFor(text: string, width: number, height: number): TraceLayout {
  // On mesure la lettre pour qu'elle remplisse bien la zone, sans dépasser.
  const c = document.createElement('canvas').getContext('2d')!;
  c.font = `700 100px ${ARABIC_FONT}`;
  const m = c.measureText(text);
  const asc = Math.max(m.actualBoundingBoxAscent || 60, 30);
  const desc = Math.max(m.actualBoundingBoxDescent || 20, 10);
  const w = Math.max(m.width, 20);
  const fontSize = Math.min((100 * height * 0.78) / (asc + desc), (100 * width * 0.8) / w, 600);
  const k = fontSize / 100;
  const top = (height - (asc + desc) * k) / 2;
  return { width, height, fontSize, baseline: top + asc * k };
}

export function drawGuide(ctx: CanvasRenderingContext2D, text: string, L: TraceLayout, color: string) {
  ctx.font = `700 ${L.fontSize}px ${ARABIC_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(text, L.width / 2, L.baseline);
}

const CELL = 3; // on travaille sur une grille réduite pour aller vite

function mask(L: TraceLayout, paint: (ctx: CanvasRenderingContext2D) => void): Uint8Array {
  const w = Math.ceil(L.width / CELL);
  const h = Math.ceil(L.height / CELL);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(1 / CELL, 1 / CELL);
  paint(ctx);
  const data = ctx.getImageData(0, 0, w, h).data;
  const out = new Uint8Array(w * h);
  for (let i = 0; i < out.length; i++) out[i] = data[i * 4 + 3] > 100 ? 1 : 0;
  return out;
}

export interface TraceScore {
  coverage: number;
  precision: number;
  stars: number; // 0 à 3
}

export function scoreTrace(text: string, L: TraceLayout, strokes: Point[][]): TraceScore {
  const pts = strokes.reduce((n, s) => n + s.length, 0);
  if (pts < 4) return { coverage: 0, precision: 0, stars: 0 };
  const glyph = mask(L, (c) => drawGuide(c, text, L, '#000'));
  const glyphWide = mask(L, (c) => {
    drawGuide(c, text, L, '#000');
    c.lineWidth = L.fontSize * 0.09;
    c.lineJoin = 'round';
    c.strokeStyle = '#000';
    c.strokeText(text, L.width / 2, L.baseline);
  });
  const paintStrokes = (c: CanvasRenderingContext2D, width: number) => {
    c.strokeStyle = '#000';
    c.fillStyle = '#000';
    c.lineWidth = width;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const s of strokes) {
      if (s.length === 1) {
        c.beginPath();
        c.arc(s[0].x, s[0].y, width / 2, 0, Math.PI * 2);
        c.fill();
        continue;
      }
      c.beginPath();
      c.moveTo(s[0].x, s[0].y);
      for (const p of s.slice(1)) c.lineTo(p.x, p.y);
      c.stroke();
    }
  };
  const userWide = mask(L, (c) => paintStrokes(c, L.fontSize * 0.16));
  const user = mask(L, (c) => paintStrokes(c, 6));

  let g = 0, gHit = 0, u = 0, uHit = 0;
  for (let i = 0; i < glyph.length; i++) {
    if (glyph[i]) {
      g++;
      if (userWide[i]) gHit++;
    }
    if (user[i]) {
      u++;
      if (glyphWide[i]) uHit++;
    }
  }
  const coverage = g ? gHit / g : 0;
  const precision = u ? uHit / u : 0;
  let stars = 0;
  if (coverage >= 0.8 && precision >= 0.82) stars = 3;
  else if (coverage >= 0.62 && precision >= 0.68) stars = 2;
  else if (coverage >= 0.42 && precision >= 0.5) stars = 1;
  return { coverage, precision, stars };
}
