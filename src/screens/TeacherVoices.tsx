import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { WORLDS, withAl } from '../data/content';
import { recorderErrorText, startRecording, type Recording } from '../lib/recorder';
import { deleteTeacher, saveTeacher, subscribeTeacher, teacherUrl, teacherVersion } from '../lib/teacher';
import { normalizeSpeech } from '../lib/speechKey';
import { sayArabic, sayComputer } from '../lib/speech';
import { Ar, Icon } from '../components/ui';

// « Écouter et vérifier les mots » : le parent écoute chaque mot, dit s'il est juste ou faux,
// et enregistre sa propre voix pour les mots faux (sa voix remplace alors celle de l'ordinateur, sur cet iPad).

type Verdict = 'ok' | 'bad';
type Filter = 'todo' | 'bad' | 'all';
interface Item { text: string; fr: string; world: string }
interface Check { ok: boolean; heard: string }

const VERDICT_KEY = 'harf-fc-verdicts';
function loadVerdicts(): Record<string, Verdict> {
  try {
    return JSON.parse(localStorage.getItem(VERDICT_KEY) || '{}');
  } catch {
    return {};
  }
}
function saveVerdicts(v: Record<string, Verdict>) {
  try {
    localStorage.setItem(VERDICT_KEY, JSON.stringify(v));
  } catch {
    /* pas de stockage */
  }
}

function allItems(): Item[] {
  const seen = new Set<string>();
  const out: Item[] = [];
  for (const world of WORLDS) {
    for (const w of world.words) {
      const forms: [string, string][] = [[w.ar, w.fr], ...(w.sing ? [[w.sing.ar, w.sing.fr] as [string, string]] : [])];
      if (!w.long && !w.ar.includes(' ')) forms.push([withAl(w.ar), `${w.fr} (avec « al »)`]);
      for (const [text, fr] of forms) {
        const k = normalizeSpeech(text);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ text, fr, world: world.title });
      }
    }
  }
  const add = (text: string, fr: string, group: string) => {
    const k = normalizeSpeech(text);
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ text, fr, world: group });
  };
  for (const [text, fr] of RULE_WORDS) add(text, fr, 'Petits mots des règles');
  for (const world of WORLDS)
    for (const pair of world.sounds?.pairs ?? []) for (const t of pair) add(t, `son ${world.sounds!.letters.join(' ou ')}`, 'Sons proches');
  return out;
}

const RULE_WORDS: [string, string][] = [
  ['هٰذَا', 'ceci, celui-ci (masculin)'],
  ['هٰذِهِ', 'ceci, celle-ci (féminin)'],
  ['فَوْقَ', 'au-dessus de'],
  ['تَحْتَ', 'en dessous de'],
  ['أَمَامَ', 'devant'],
  ['خَلْفَ', 'derrière'],
  ['أَنَا', 'moi, je'],
  ['أَنْتَ', 'toi (un garçon)'],
  ['أَنْتِ', 'toi (une fille)'],
  ['هُوَ', 'lui, il'],
  ['هِيَ', 'elle'],
];

export function TeacherVoices() {
  useSyncExternalStore(subscribeTeacher, teacherVersion);
  const items = useMemo(allItems, []);
  const [rec, setRec] = useState<{ text: string; r: Recording } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>(loadVerdicts);
  const [check, setCheck] = useState<Record<string, Check>>({});
  const [filter, setFilter] = useState<Filter>('todo');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.querySelector('.teacher')?.scrollIntoView({ behavior: 'smooth' });
    fetch(`audio/check.json?${Date.now()}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then(setCheck)
      .catch(() => undefined);
  }, []);

  function judge(text: string, v: Verdict) {
    const next = { ...verdicts, [normalizeSpeech(text)]: v };
    setVerdicts(next);
    saveVerdicts(next);
  }
  async function start(text: string) {
    setError(null);
    if (rec) return;
    try {
      setRec({ text, r: await startRecording() });
    } catch (e) {
      setError(recorderErrorText(e));
    }
  }
  async function stop() {
    if (!rec) return;
    const url = await rec.r.stop();
    const blob = await fetch(url).then((x) => x.blob());
    URL.revokeObjectURL(url);
    setRec(null);
    if (blob.size > 0) {
      await saveTeacher(rec.text, blob);
      void sayArabic(rec.text);
    }
  }

  const verdictOf = (t: string) => verdicts[normalizeSpeech(t)];
  const doubtful = (t: string) => check[normalizeSpeech(t)]?.ok === false;
  const counts = {
    ok: items.filter((i) => verdictOf(i.text) === 'ok').length,
    bad: items.filter((i) => verdictOf(i.text) === 'bad').length,
    mine: items.filter((i) => teacherUrl(i.text)).length,
  };
  const todo = items.length - counts.ok - counts.bad;
  const shown = items
    .filter((i) => (filter === 'all' ? true : filter === 'bad' ? verdictOf(i.text) === 'bad' : !verdictOf(i.text)))
    .sort((a, b) => Number(doubtful(b.text)) - Number(doubtful(a.text)));

  async function copyBad() {
    const list = items.filter((i) => verdictOf(i.text) === 'bad' && !teacherUrl(i.text));
    const txt = list.map((i) => `${i.text} : ${i.fr}`).join('\n') || 'Aucun mot faux.';
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Copie impossible. Tu peux me donner les mots de la liste « Faux ».');
    }
  }

  return (
    <section className="card teacher">
      <h2>Écouter et vérifier les mots</h2>
      <p className="muted">
        Écoute chaque mot. S'il est bien dit, touche « Juste ». Sinon, touche « Faux », puis « Ma voix » pour l'enregistrer
        toi-même : ta voix remplacera celle de l'ordinateur sur cet iPad. Les mots marqués ⚠ sont ceux que la machine a eu
        du mal à reconnaître : ils sont en premier.
      </p>
      <p className="teacher-count">
        {items.length} mots. Justes : <b>{counts.ok}</b> · Faux : <b>{counts.bad}</b> · À écouter : <b>{todo}</b> · Avec ta voix :{' '}
        <b>{counts.mine}</b>
      </p>
      <div className="row teacher-filters">
        <button type="button" className={`btn ${filter === 'todo' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setFilter('todo')}>
          À écouter ({todo})
        </button>
        <button type="button" className={`btn ${filter === 'bad' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setFilter('bad')}>
          Faux ({counts.bad})
        </button>
        <button type="button" className={`btn ${filter === 'all' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setFilter('all')}>
          Tous
        </button>
        <button type="button" className="btn btn-ghost" onClick={copyBad}>
          {copied ? 'Copié ✓' : 'Copier la liste des mots faux'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {shown.length === 0 && <p className="muted">Rien ici pour l'instant.</p>}
      <ul className="teacher-list">
        {shown.map(({ text, fr, world }) => {
          const mine = !!teacherUrl(text);
          const v = verdictOf(text);
          const recording = rec?.text === text;
          return (
            <li key={text} className={v === 'ok' ? 'ok' : v === 'bad' ? (mine ? 'has' : 'bad') : ''}>
              <div className="teacher-word">
                <Ar className="teacher-ar">{text}</Ar>
                <span className="teacher-fr">
                  {doubtful(text) && <span title="À bien écouter">⚠ </span>}
                  {fr}
                </span>
                <span className="teacher-state">
                  {world}
                  {mine ? ' · ✓ ta voix' : ''}
                </span>
              </div>
              <div className="row">
                <button type="button" className="btn btn-blue" onClick={() => sayComputer(text)}>
                  <Icon name="play" /> Écouter
                </button>
                <button type="button" className={`btn ${v === 'ok' ? 'btn-green' : 'btn-ghost'}`} onClick={() => judge(text, 'ok')}>
                  ✓ Juste
                </button>
                <button type="button" className={`btn ${v === 'bad' ? 'btn-red' : 'btn-ghost'}`} onClick={() => judge(text, 'bad')}>
                  ✗ Faux
                </button>
                {recording ? (
                  <button type="button" className="btn btn-red" onClick={stop}>
                    <Icon name="stop" /> Stop
                  </button>
                ) : (
                  <button type="button" className="btn btn-gold" disabled={!!rec} onClick={() => start(text)}>
                    <Icon name="mic" /> Ma voix
                  </button>
                )}
                {mine && (
                  <>
                    <button type="button" className="btn btn-ghost" onClick={() => sayArabic(text)} aria-label="Écouter ma voix">
                      <Icon name="play" /> Ma voix
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => deleteTeacher(text)}>
                      Effacer
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
