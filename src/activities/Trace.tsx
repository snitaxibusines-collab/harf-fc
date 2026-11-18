import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_WORDS } from '../data/content';
import { letterForms, POSITION_FR, stripHarakat } from '../lib/arabic';
import { ARABIC_FONT, drawGuide, layoutFor, scoreTrace, type Point } from '../lib/trace';
import { beep, sayArabic } from '../lib/speech';
import { Ar, Balls, Icon } from '../components/ui';
import type { ActivityProps } from './types';

interface Step {
  wordId: string;
  text: string; // ce qu'on trace
  label: string;
  letterIndex: number | null; // null = le mot entier
}

// « J'écris » : chaque lettre du mot dans sa forme (début, milieu, fin), puis le mot entier.
export function Trace({ words, onDone }: ActivityProps & { words: string[] }) {
  const steps = useMemo<Step[]>(
    () =>
      words.flatMap((id) => {
        const w = ALL_WORDS[id];
        const forms = letterForms(w.ar);
        return [
          ...forms.map((f, k) => ({ wordId: id, text: f.display, label: `La lettre ${f.letter}, ${POSITION_FR[f.position]}`, letterIndex: k })),
          { wordId: id, text: stripHarakat(w.ar), label: 'Le mot entier', letterIndex: null },
        ];
      }),
    [words],
  );
  const [i, setI] = useState(0);
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0, missed: [] as string[] });
  const step = steps[i];
  const w = ALL_WORDS[step.wordId];
  const forms = useMemo(() => letterForms(w.ar), [w.ar]);

  const wrap = useRef<HTMLDivElement>(null);
  const guide = useRef<HTMLCanvasElement>(null);
  const ink = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const [size, setSize] = useState({ w: 800, h: 360 });
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    document.fonts.load(`700 120px ${ARABIC_FONT}`, 'خبز').then(() => setFontReady(true), () => setFontReady(true));
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => layoutFor(step.text, size.w, size.h), [step.text, size, fontReady]);

  // Dessine le modèle en gris clair.
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    for (const c of [guide.current, ink.current]) {
      if (!c) continue;
      c.width = size.w * dpr;
      c.height = size.h * dpr;
      c.style.width = `${size.w}px`;
      c.style.height = `${size.h}px`;
      c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const g = guide.current!.getContext('2d')!;
    g.clearRect(0, 0, size.w, size.h);
    g.strokeStyle = '#D5DBE8';
    g.setLineDash([10, 10]);
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(30, layout.baseline);
    g.lineTo(size.w - 30, layout.baseline);
    g.stroke();
    g.setLineDash([]);
    drawGuide(g, step.text, layout, '#D6DCEA');
    strokes.current = [];
    setResult(null);
  }, [layout, step.text, size]);

  function pos(e: React.PointerEvent): Point {
    const r = ink.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function redraw() {
    const c = ink.current!.getContext('2d')!;
    c.clearRect(0, 0, size.w, size.h);
    c.strokeStyle = '#1B3A7A';
    c.fillStyle = '#1B3A7A';
    c.lineWidth = Math.max(10, layout.fontSize * 0.07);
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const s of strokes.current) {
      c.beginPath();
      c.moveTo(s[0].x, s[0].y);
      for (const p of s.slice(1)) c.lineTo(p.x, p.y);
      if (s.length === 1) c.lineTo(s[0].x + 0.1, s[0].y);
      c.stroke();
    }
  }
  const drawing = useRef(false);
  function down(e: React.PointerEvent) {
    if (result !== null) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    drawing.current = true;
    strokes.current.push([pos(e)]);
    redraw();
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    strokes.current[strokes.current.length - 1].push(pos(e));
    redraw();
  }
  function up() {
    drawing.current = false;
  }
  function clear() {
    strokes.current = [];
    setResult(null);
    redraw();
  }
  function check() {
    const s = scoreTrace(step.text, layout, strokes.current);
    setResult(s.stars);
    setTries((t) => t + 1);
    beep(s.stars >= 2 ? 'good' : 'bad');
  }
  function next() {
    const ok = (result ?? 0) >= 2;
    const missed = !ok && step.letterIndex === null ? [...score.missed, step.wordId] : score.missed;
    const nextScore = { correct: score.correct + (ok ? 1 : 0), total: score.total + 1, missed };
    setScore(nextScore);
    setTries(0);
    if (i + 1 < steps.length) setI(i + 1);
    else onDone(nextScore);
  }

  const messages = ['Essaie encore : repasse bien sur la lettre grise.', 'Pas mal ! Tu peux faire mieux.', 'Bien tracé !', 'Magnifique, quel joueur !'];

  return (
    <div className="activity trace">
      <div className="trace-head">
        <p className="activity-title">
          J'écris : <Ar className="inline-ar">{w.ar}</Ar> <span className="muted">({w.fr})</span>
        </p>
        <button type="button" className="btn btn-ghost" onClick={() => sayArabic(w.ar)}>
          <Icon name="speaker" /> Écouter
        </button>
      </div>
      <div className="forms" dir="rtl">
        {forms.map((f, k) => {
          const state = step.letterIndex === null || k < step.letterIndex ? 'done' : k === step.letterIndex ? 'now' : 'later';
          return (
            <div key={k} className={`form-chip ${state}`}>
              <Ar className="form-ar">{f.display}</Ar>
              <span dir="ltr">{POSITION_FR[f.position]}</span>
            </div>
          );
        })}
      </div>
      <p className="hint">{step.label}. On écrit de droite à gauche : commence à droite et repasse sur le modèle gris.</p>
      <div className="trace-pad" ref={wrap}>
        <canvas ref={guide} aria-hidden="true" />
        <canvas
          ref={ink}
          className="ink"
          role="img"
          aria-label={`Zone pour tracer ${step.label}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </div>
      <div className="trace-actions">
        <button type="button" className="btn btn-ghost" onClick={clear}>
          <Icon name="redo" /> Effacer
        </button>
        <div className="trace-feedback" aria-live="polite">
          {result !== null && (
            <>
              <Balls n={result} size={28} /> <span>{messages[result]}</span>
            </>
          )}
        </div>
        {result === null ? (
          <button type="button" className="btn btn-navy" onClick={check}>
            Valider
          </button>
        ) : result >= 1 || tries >= 2 ? (
          <div className="row">
            {result < 3 && (
              <button type="button" className="btn btn-ghost" onClick={clear}>
                Réessayer
              </button>
            )}
            <button type="button" className="btn btn-navy" onClick={next}>
              Suivant
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-navy" onClick={clear}>
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}
