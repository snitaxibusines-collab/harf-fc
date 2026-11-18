"""Fabrique un fichier son (mp3) pour chaque phrase de audio/texts.json.

Voix : Piper (libre), voix arabe ar_JO-kareem. Tourne sur GitHub Actions.
Les sons vont dans docs/audio/, avec un sommaire docs/audio/manifest.json.
"""
import json
import os
import subprocess
import sys
import wave

from piper import PiperVoice

try:
    from piper import SynthesisConfig
    CONFIG = SynthesisConfig(length_scale=1.1)
except Exception:  # ancienne version de piper
    CONFIG = None


def file_name(text: str) -> str:
    h = 0x811C9DC5
    for b in text.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}.mp3"


def main() -> None:
    model = sys.argv[1]
    texts = json.load(open("audio/texts.json", encoding="utf-8"))
    out_dir = "docs/audio"
    os.makedirs(out_dir, exist_ok=True)
    voice = PiperVoice.load(model)
    files = {}
    for text in texts:
        name = file_name(text)
        files[text] = name
        mp3 = os.path.join(out_dir, name)
        if os.path.exists(mp3):
            continue
        wav = "/tmp/one.wav"
        with wave.open(wav, "wb") as wf:
            if CONFIG is not None:
                voice.synthesize_wav(text, wf, syn_config=CONFIG)
            else:
                voice.synthesize_wav(text, wf)
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-ar", "22050", "-b:a", "48k", mp3],
            check=True,
        )
    keep = set(files.values())
    for f in os.listdir(out_dir):
        if f.endswith(".mp3") and f not in keep:
            os.remove(os.path.join(out_dir, f))
    json.dump(sorted(keep), open(os.path.join(out_dir, "manifest.json"), "w"))
    print(len(keep), "sons")


if __name__ == "__main__":
    main()
