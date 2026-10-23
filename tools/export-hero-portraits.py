#!/usr/bin/env python3
"""Exporte les 95 portraits de héros accessibles dans le constructeur Jactari.

Découpes de 71x72 depuis les bandes officielles conservées en JPG, sans
redimensionnement. Les PNG produits sont des dérivés locaux, pas des fichiers
originaux individuels Ubisoft.

Usage : python3 tools/export-hero-portraits.py
Pillow est nécessaire. Aucun téléchargement et aucune écriture dans les
dossiers historiques de Jactari.
"""
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/analysis/sprite-manifest.json"
OUT = ROOT / "data/assets-derived/hero-portraits"
PREFIX = "hero.reference."

def main():
    manifest = json.loads(SOURCE.read_text(encoding="utf-8"))
    entries = [
        e for e in manifest["entries"]
        if e["id"].startswith(PREFIX)
        and ".portrait." in e["id"]
        and e.get("status") == "in_bounds"
        and e.get("selectable_in_builder") is True
    ]
    records = []
    for e in entries:
        sheet = ROOT / e["sheet"]
        faction = sheet.stem.split("_")[1].lower()
        number = int(e["id"].split(".")[-1])
        target = OUT / faction / f"portrait-{number:02}.png"
        target.parent.mkdir(parents=True, exist_ok=True)
        x, y, width, height = e["rect"]
        with Image.open(sheet) as img:
            if not (x >= 0 and y >= 0 and x + width <= img.width and y + height <= img.height):
                raise ValueError(f"Rectangle hors limites : {e['id']}")
            img.crop((x, y, x + width, y + height)).save(target, "PNG")
        records.append({
            "sprite_id": e["id"], "faction": faction, "number": number,
            "source_sheet": e["sheet"], "source_rect": e["rect"],
            "path": target.relative_to(ROOT).as_posix(),
            "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
            "type": "cropped_derived_png_not_original_separate_file"
        })
    manifest_out = {
        "scope": "Sélection contrôlée par sprite-manifest.json (5 factions)",
        "count": len(records), "generated": records
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "manifest.json").write_text(json.dumps(manifest_out, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(f"{len(records)} PNG dérivés exportés dans {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
