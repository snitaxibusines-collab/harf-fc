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
FIX = "fix2"  # change quand on corrige la prononciation

# Prononciations corrigées : la voix coupe parfois la fin des mots en ى.
SPOKEN: dict = {}

TANWIN = "\u064B\u064C\u064D"          # ً ٌ ٍ
VOWELS = "\u064E\u064F\u0650"          # َ ُ ِ
MARKS = re.compile(r"[\u064B-\u0652\u0670]")


OUT = "docs/audio"


def file_name(text: str) -> str:
    h = 0x811C9DC5
    for b in text.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"w{h:08x}.mp3"


def pausal(word: str) -> str:
    """Un mot seul se dit « à la pause », comme en classe : pas de « n » final, pas de voyelle finale."""
    i = len(word)
    while i > 0 and MARKS.match(word[i - 1]):
        i -= 1
    if i == 0:
        return word
    head, last, marks = word[: i - 1], word[i - 1], word[i:]
    if last in "ىا":
        # -an / -ā en fin : on garde seulement le « â » long (مُرَبًّى → مُرَبَّا)
        head = re.sub("\u064B", "\u064E", head)
        return head + "ا"
    # seulement les terminaisons de nom (-u, -un, -in, -an) et le ة ; on garde أَنْتَ / أَنْتِ, حَلَّ…
    if not any(c in marks for c in TANWIN + "\u064F") and not (last == "ة" and marks):
        return word
    keep = "".join(c for c in marks if c == "\u0651")  # on garde la chadda
    return head + last + keep + "\u0652"


def spoken(text: str) -> str:
    if text in SPOKEN:
        return SPOKEN[text]
    if " " not in text.strip():
        return pausal(text.strip())
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
    files = {}
    sem = asyncio.Semaphore(4)

    async def job(text: str) -> None:
        name = file_name(text)
        files[text] = name
        path = os.path.join(OUT, name)
        if os.path.exists(path):
            return
        async with sem:
            await one(text, path)

    await asyncio.gather(*(job(t) for t in texts))
    keep = set(files.values())
    for f in os.listdir(OUT):
        if f.endswith(".mp3") and f not in keep:
            os.remove(os.path.join(OUT, f))
    json.dump(sorted(keep), open(os.path.join(OUT, "manifest.json"), "w"))
    open(tag_file, "w").write(tag + "\n")
    print(len(keep), "sons")


if __name__ == "__main__":
    asyncio.run(main())
