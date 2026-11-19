"""Fabrique un fichier son (mp3) pour chaque phrase de audio/texts.json.

Voix : voix neuronale arabe de Microsoft (service de lecture à voix haute d'Edge, via edge-tts).
Tourne sur GitHub Actions. Les sons vont dans docs/audio/, avec un sommaire docs/audio/manifest.json.
"""
import asyncio
import json
import os
import re
import shutil

import edge_tts

VOICE = "ar-SA-HamedNeural"
RATE = "+0%"
FIX = "fix3"  # change quand on corrige la prononciation

# Pour chaque mot seul, l'écriture donnée à la voix est choisie par le contrôle automatique
# (tools/audit_audio.py) : on essaie plusieurs écritures, on garde celle que Whisper reconnaît le mieux.
CHOSEN_FILE = "audio/spoken.json"
CHOSEN = json.load(open(CHOSEN_FILE, encoding="utf-8")) if os.path.exists(CHOSEN_FILE) else {}

TANWIN = "\u064B\u064C\u064D"          # ً ٌ ٍ
SUKUN = "\u0652"
SHADDA = "\u0651"
MARKS = re.compile(r"[\u064B-\u0652\u0670]")

OUT = "docs/audio"


def file_name(text: str) -> str:
    h = 0x811C9DC5
    for b in text.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"x{h:08x}.mp3"


def _split_end(word: str):
    i = len(word)
    while i > 0 and MARKS.match(word[i - 1]):
        i -= 1
    return word[: i - 1], word[i - 1] if i else "", word[i:]


def _pausal(word: str, end: str) -> str:
    """Le mot dit « à la pause », comme en classe. end = ce qu'on met sur la dernière lettre."""
    head, last, marks = _split_end(word)
    if not last:
        return word
    if last in "ىا":  # -an / -ā en fin : seulement le « â » long (مُرَبًّى → مُرَبَّا)
        return re.sub("\u064B", "\u064E", head) + "ا"
    # seulement les fins de nom (-u, -un, -in, -an) et le ة ; on garde أَنْتَ / أَنْتِ, حَلَّ…
    if not any(c in marks for c in TANWIN + "\u064F") and not (last == "ة" and marks):
        return word
    keep = SHADDA if SHADDA in marks else ""
    if last == "ة":
        return head + ("ه" + SUKUN if end == "H" else "ة")
    return head + last + keep + (SUKUN if end == "P" else "")


def variants(word: str) -> dict:
    """Les écritures essayées pour un mot seul, de la préférée à la moins préférée (en cas d'égalité)."""
    out = {}
    for k, t in (
        ("H", _pausal(word, "H")),           # pause, ة dit « ah » (écrit هْ), dernière lettre sans marque
        ("N", _pausal(word, "N")),           # pause, aucune marque sur la dernière lettre
        ("P", _pausal(word, "P")),           # pause avec soukoun sur la dernière lettre
        ("U", MARKS.sub("", _pausal(word, "N"))),  # sans aucune voyelle : la voix choisit
        ("F", word),                          # mot complet, avec tanwin
    ):
        if t not in out.values():
            out[k] = t
    return out


def spoken(text: str) -> str:
    text = text.strip()
    if text in CHOSEN:
        return CHOSEN[text]
    if " " not in text:
        return variants(text)["H"]
    # ى en fin de mot se dit « â » : on l'écrit ا pour que la voix ne coupe pas la fin.
    return re.sub(r"ى(?=[\u064B-\u0652]*(?:\s|$|[،؟]))", "ا", text)


async def one(text: str, path: str) -> None:
    for attempt in range(4):
        try:
            await edge_tts.Communicate(spoken(text), VOICE, rate=RATE).save(path)
            if os.path.getsize(path) > 1000:
                return
        except Exception as e:  # réseau capricieux : on réessaie
            print("retry", text, e)
        await asyncio.sleep(2 * (attempt + 1))
    raise RuntimeError(f"échec pour {text}")


async def main() -> None:
    texts = json.load(open("audio/texts.json", encoding="utf-8"))
    tag = f"{VOICE} {RATE} {FIX}"
    tag_file = os.path.join(OUT, "voice.txt")
    if not os.path.exists(tag_file) or open(tag_file).read().strip() != tag:
        shutil.rmtree(OUT, ignore_errors=True)  # nouvelle voix : on refait tout
    os.makedirs(OUT, exist_ok=True)
    said_file = os.path.join(OUT, "said.json")  # ce qu'on a vraiment donné à la voix, pour chaque son
    said = json.load(open(said_file, encoding="utf-8")) if os.path.exists(said_file) else {}
    files = {}
    sem = asyncio.Semaphore(4)

    async def job(text: str) -> None:
        name = file_name(text)
        files[text] = name
        path = os.path.join(OUT, name)
        if os.path.exists(path) and said.get(name) == spoken(text):
            return
        async with sem:
            await one(text, path)
        said[name] = spoken(text)

    await asyncio.gather(*(job(t) for t in texts))
    keep = set(files.values())
    for f in os.listdir(OUT):
        if f.endswith(".mp3") and f not in keep:
            os.remove(os.path.join(OUT, f))
    json.dump(sorted(keep), open(os.path.join(OUT, "manifest.json"), "w"))
    said = {k: v for k, v in said.items() if k in keep}
    json.dump(dict(sorted(said.items())), open(said_file, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    open(tag_file, "w").write(tag + "\n")
    print(len(keep), "sons")


if __name__ == "__main__":
    asyncio.run(main())
