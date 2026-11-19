"""Contrôle automatique des sons, avec Whisper (reconnaissance vocale).

  python tools/audit_audio.py words  I N   -> pour chaque mot seul (part I sur N), essaie chaque écriture
                                             de variants(), fait réécouter par Whisper, note chaque essai.
  python tools/audit_audio.py sentences I N -> réécoute les phrases déjà fabriquées (docs/audio).
  python tools/audit_audio.py merge        -> choisit l'écriture de chaque mot (audio/spoken.json)
                                             et écrit le bilan pour la page d'écoute (docs/audio/check.json).
"""
import asyncio, difflib, glob, importlib.util, json, os, re, sys

spec = importlib.util.spec_from_file_location("m", "audio/make_audio.py")
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)

MARKS = re.compile(r"[ً-ْٰـ]")
def norm(t):
    t = MARKS.sub("", t)
    t = re.sub(r"[أإآٱ]", "ا", t).replace("ة", "ه").replace("ى", "ا").replace("ؤ", "و").replace("ئ", "ي")
    t = re.sub(r"[^ء-ي ]", " ", t)
    return re.sub(r"\s+", " ", t).strip()
def score(heard, text):
    return round(difflib.SequenceMatcher(None, norm(heard), norm(text)).ratio(), 3)

TEXTS = json.load(open("audio/texts.json", encoding="utf-8"))
WORDS = [t for t in TEXTS if " " not in t.strip()]
SENTS = [t for t in TEXTS if " " in t.strip()]
PARTS = "tools/audit/parts"

async def tts(text, path):
    import edge_tts
    for i in range(5):
        try:
            await edge_tts.Communicate(text, m.VOICE, rate=m.RATE).save(path)
            if os.path.getsize(path) > 1000: return
        except Exception as e: print("retry", e)
        await asyncio.sleep(2 * (i + 1))

def model():
    from faster_whisper import WhisperModel
    w = WhisperModel(os.environ.get("WMODEL", "large-v3-turbo"), device="cpu", compute_type="int8",
                     cpu_threads=os.cpu_count() or 4)
    def hear(path):
        segs, _ = w.transcribe(path, language="ar", beam_size=5, vad_filter=False,
                               condition_on_previous_text=False, without_timestamps=True)
        return " ".join(s.text for s in segs).strip()
    return hear

def shard(items, i, n):
    return [x for k, x in enumerate(items) if k % n == i]

def words(i, n):
    mine = shard(WORDS, i, n)
    d = "/tmp/variants"; os.makedirs(d, exist_ok=True)
    jobs = [(w, k, t, os.path.join(d, f"{k}_{m.file_name(w)}")) for w in mine for k, t in m.variants(w).items()]
    async def run():
        sem = asyncio.Semaphore(4)
        async def one(t, p):
            async with sem: await tts(t, p)
        await asyncio.gather(*(one(t, p) for _, _, t, p in jobs))
    asyncio.run(run())
    hear = model()
    res = {}
    for w, k, t, p in jobs:
        heard = hear(p) if os.path.exists(p) else ""
        res.setdefault(w, {})[k] = {"sent": t, "heard": heard, "score": score(heard, w)}
        print(w, k, t, "->", heard, res[w][k]["score"], flush=True)
    os.makedirs(PARTS, exist_ok=True)
    json.dump(res, open(f"{PARTS}/words-{i}.json", "w", encoding="utf-8"), ensure_ascii=False)

def sentences(i, n):
    hear = model()
    res = {}
    for t in shard(SENTS, i, n):
        p = os.path.join("docs/audio", m.file_name(t))
        heard = hear(p) if os.path.exists(p) else ""
        res[t] = {"sent": m.spoken(t), "heard": heard, "score": score(heard, t.replace("…", " "))}
        print(t, "->", heard, res[t]["score"], flush=True)
    os.makedirs(PARTS, exist_ok=True)
    json.dump(res, open(f"{PARTS}/sentences-{i}.json", "w", encoding="utf-8"), ensure_ascii=False)

CHECK = "tools/audit/check.json"

def merge_sentences():
    S = {}
    for f in glob.glob(f"{PARTS}/sentences-*.json"): S.update(json.load(open(f, encoding="utf-8")))
    check = json.load(open(CHECK, encoding="utf-8")) if os.path.exists(CHECK) else {}
    for t, v in S.items():
        check[t] = {"ok": v["score"] >= 0.9, "score": v["score"], "heard": v["heard"], "how": "S"}
    json.dump(check, open(CHECK, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"phrases reconnues (>= 90 %) : {sum(1 for t in S if check[t]['ok'])}/{len(S)}")
    for t in sorted(S, key=lambda t: S[t]["score"])[:60]: print(S[t]["score"], t, "->", S[t]["heard"])

def merge():
    W, S = {}, {}
    for f in glob.glob(f"{PARTS}/words-*.json"): W.update(json.load(open(f, encoding="utf-8")))
    chosen, check = {}, {}
    order = ["H", "N", "P", "U", "F"]
    for w, vs in W.items():
        # jamais le tanwin (« -un ») : un mot seul se dit à la pause, comme en classe
        vs = {k: v for k, v in vs.items() if k != "F"} or vs
        # on garde la pause (H) sauf si une autre écriture est nettement mieux reconnue
        best = max(vs, key=lambda k: (vs[k]["score"] - (0 if k == "H" else 0.1), -order.index(k)))
        chosen[w] = vs[best]["sent"]
        check[w] = {"ok": vs[best]["score"] >= 0.99, "score": vs[best]["score"], "heard": vs[best]["heard"], "how": best}
    json.dump(dict(sorted(chosen.items())), open("audio/spoken.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    os.makedirs("tools/audit", exist_ok=True)
    json.dump(check, open(CHECK, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"mots reconnus : {sum(1 for w in W if check[w]['ok'])}/{len(W)}")
    for w in sorted(W, key=lambda w: check[w]["score"]): 
        if not check[w]["ok"]: print(check[w]["score"], w, check[w]["how"], "->", check[w]["heard"])
    from collections import Counter
    print(Counter(check[w]["how"] for w in W))

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "merge": merge()
    elif cmd == "merge-sentences": merge_sentences()
    else: {"words": words, "sentences": sentences}[cmd](int(sys.argv[2]), int(sys.argv[3]))
