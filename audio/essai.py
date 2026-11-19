"""Petit échantillon de voix à comparer (docs/essai/index.html)."""
import asyncio
import os

import edge_tts

WORDS = [
    ("عَصِيرٌ", "عَصِيرْ", "du jus"),
    ("حَلِيبٌ", "حَلِيبْ", "du lait"),
    ("عَسَلٌ", "عَسَلْ", "du miel"),
    ("قَهْوَةٌ", "قَهْوَةْ", "du café"),
    ("زُبْدَةٌ", "زُبْدَةْ", "du beurre"),
]
VARIANTS = [
    ("A", "ar-SA-ZariyahNeural", 0, "Voix de femme, mot complet (avec la fin -oun)"),
    ("B", "ar-SA-HamedNeural", 0, "Voix d'homme, mot complet (avec la fin -oun)"),
    ("C", "ar-SA-ZariyahNeural", 1, "Voix de femme, mot comme en classe (fin arrêtée)"),
    ("D", "ar-SA-HamedNeural", 1, "Voix d'homme, mot comme en classe (fin arrêtée)"),
]
OUT = "docs/essai"


async def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for i, (full, pausal, fr) in enumerate(WORDS):
        cells = []
        for key, voice, use_pausal, _ in VARIANTS:
            text = pausal if use_pausal else full
            name = f"{i}{key}.mp3"
            await edge_tts.Communicate(text, voice).save(os.path.join(OUT, name))
            cells.append(f'<button onclick="new Audio(\'{name}\').play()">{key}</button>')
        rows.append(f'<tr><td class="ar">{full}</td><td>{fr}</td><td>{"".join(cells)}</td></tr>')
    legend = "".join(f"<li><b>{k}</b> : {d}</li>" for k, _, _, d in VARIANTS)
    html = f"""<!doctype html><html lang="fr"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Essai des voix</title>
<style>body{{font-family:system-ui;background:#13285a;color:#fff;padding:16px;max-width:700px;margin:auto}}
table{{width:100%;border-collapse:collapse}}td{{padding:10px;border-bottom:1px solid #fff3}}
.ar{{font-size:34px;direction:rtl}}button{{font-size:22px;padding:10px 18px;margin:4px;border:0;border-radius:12px;background:#f2b705;font-weight:700}}</style>
<h1>Harf FC : quelle voix est la plus claire ?</h1><ul>{legend}</ul><table>{"".join(rows)}</table></html>"""
    open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(html)


asyncio.run(main())
