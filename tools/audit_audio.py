"""Contrôle des sons : un logiciel de reconnaissance (Whisper) réécoute chaque son et le compare au texte.

Pour chaque mot seul, on essaie aussi d'autres façons d'écrire le mot pour la voix,
et on garde celle que Whisper reconnaît le mieux. Résultat : tools/audit/report.json
"""
import asyncio, difflib, importlib.util, json, os, re, sys
import edge_tts
from faster_whisper import WhisperModel

spec = importlib.util.spec_from_file_location("m", "audio/make_audio.py")
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)

MARKS = re.compile(r"[ً-ْٰـ]")
def norm(t):
    t = MARKS.sub("", t)
    t = re.sub(r"[أإآٱ]", "ا", t).replace("ة", "ه").replace("ى", "ا").replace("ؤ", "و").replace("ئ", "ي")
    t = re.sub(r"[^ء-ي ]", " ", t)
    return re.sub(r"\s+", " ", t).strip()
def score(a, b):
    return difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()

def bare_end(w):  # mot à la pause sans le sukun final
    return re.sub(r"ْ$", "", m.spoken(w))
def undiac(w):    # sans aucune voyelle : la voix choisit seule
    return MARKS.sub("", m.spoken(w))

VARIANTS = {"P": m.spoken, "N": bare_end, "U": undiac}

async def tts(text, path):
    for i in range(4):
        try:
            await edge_tts.Communicate(text, m.VOICE, rate=m.RATE).save(path)
            if os.path.getsize(path) > 1000: return
        except Exception as e: print("retry", e)
        await asyncio.sleep(2 * (i + 1))

async def make_variants(words, d):
    sem = asyncio.Semaphore(4)
    async def job(w, k, f):
        p = os.path.join(d, f"{k}_{m.file_name(w)}")
        if k != "P" or not os.path.exists(p):
            async with sem: await tts(f(w), p)
    await asyncio.gather(*(job(w, k, f) for w in words for k, f in VARIANTS.items() if k != "P"))

def main():
    texts = json.load(open("audio/texts.json", encoding="utf-8"))
    only_words = "--words" in sys.argv
    words = [t for t in texts if " " not in t.strip()]
    d = "/tmp/variants"; os.makedirs(d, exist_ok=True)
    asyncio.run(make_variants(words, d))
    model = WhisperModel(os.environ.get("WMODEL", "large-v3-turbo"), device="cpu", compute_type="int8")
    def hear(path):
        segs, _ = model.transcribe(path, language="ar", beam_size=5, vad_filter=False,
                                   condition_on_previous_text=False, without_timestamps=True)
        return " ".join(s.text for s in segs).strip()
    report = {"words": [], "sentences": []}
    for i, w in enumerate(words):
        row = {"text": w, "variants": {}}
        for k, f in VARIANTS.items():
            p = os.path.join("docs/audio", m.file_name(w)) if k == "P" else os.path.join(d, f"{k}_{m.file_name(w)}")
            heard = hear(p) if os.path.exists(p) else ""
            row["variants"][k] = {"sent": f(w), "heard": heard, "score": round(score(heard, w), 3)}
        report["words"].append(row)
        print(i, w, {k: (v["heard"], v["score"]) for k, v in row["variants"].items()}, flush=True)
    if not only_words:
        for t in texts:
            if " " in t.strip():
                heard = hear(os.path.join("docs/audio", m.file_name(t)))
                report["sentences"].append({"text": t, "heard": heard, "score": round(score(heard, t), 3)})
    os.makedirs("tools/audit", exist_ok=True)
    json.dump(report, open("tools/audit/report.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

main()
