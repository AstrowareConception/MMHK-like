#!/usr/bin/env python3
"""Optional perceptual *candidates* for manual review; never edits images.

Usage: node tools/audit-graphic-assets.mjs
       python3 tools/perceptual-duplicates.py [--threshold 4] [--root PATH]
Requires Pillow; output is ignored by Git.
"""
import argparse
from collections import defaultdict
import json
from pathlib import Path
import sys

try:
    from PIL import Image, ImageOps, UnidentifiedImageError
except ImportError:
    sys.exit("Pillow unavailable. Install locally: python3 -m pip install Pillow")


def dhash(filename: Path) -> int:
    with Image.open(filename) as frame:
        frame.seek(0)
        image = ImageOps.exif_transpose(frame).convert("L").resize((9, 8), Image.Resampling.LANCZOS)
        pixels = list(image.getdata())
        bits = 0
        for row in range(8):
            for x in range(8):
                bits = (bits << 1) | int(pixels[row * 9 + x] > pixels[row * 9 + x + 1])
        return bits


def distance(a: int, b: int) -> int:
    return (a ^ b).bit_count()


def run(root: Path, threshold: int = 4) -> dict:
    manifest = root / "data/asset-catalog/generated/inventory.json"
    records = json.loads(manifest.read_text(encoding="utf-8"))["assets"]
    unique = {}
    for record in records:
        if record["kind"] == "image" and record["format"] in {"png", "gif", "jpg", "jpeg", "webp"}:
            unique.setdefault(record["sha256"], []).append(record)
    processed, unreadable = [], []
    for sha, entries in unique.items():
        chosen = entries[0]
        try:
            filename = root / chosen["path"]
            with Image.open(filename) as image:
                width, height = image.size
            if width == 0 or height == 0:
                continue
            processed.append({"sha256": sha, "paths": [a["path"] for a in entries],
                              "width": width, "height": height, "hash": dhash(filename)})
        except (OSError, ValueError, UnidentifiedImageError) as exc:
            unreadable.append({"path": chosen["path"], "error": type(exc).__name__})

    # Deliberately conservative: dimensions and ratio must both be comparable.
    # This reports candidates, NOT definitive duplicates.
    groups = []
    for index, left in enumerate(processed):
        for right in processed[index+1:]:
            width_ratio = left["width"] / right["width"]
            height_ratio = left["height"] / right["height"]
            if not 0.85 <= width_ratio <= 1.15 or not 0.85 <= height_ratio <= 1.15:
                continue
            hamming = distance(left["hash"], right["hash"])
            if hamming <= threshold:
                groups.append({"path_a": left["paths"][0], "path_b": right["paths"][0],
                               "sha256_a": left["sha256"], "sha256_b": right["sha256"],
                               "hamming_distance": hamming, "requires_manual_review": True})
    groups.sort(key=lambda x: (x["hamming_distance"], x["path_a"], x["path_b"]))
    result = {
        "algorithm": "dHash64", "hamming_threshold": threshold,
        "unique_binary_images_analyzed": len(processed),
        "candidate_pairs": len(groups), "unreadable_count": len(unreadable),
        "notice": "Similarity is heuristic: visually different flat-color graphics may collide. No automatic deduplication.",
        "candidates": groups, "unreadable": unreadable
    }
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--threshold", type=int, default=4)
    args = parser.parse_args()
    if not 0 <= args.threshold <= 16:
        parser.error("threshold must be between 0 and 16")
    root = args.root.resolve()
    result = run(root, args.threshold)
    output = root / "data/asset-catalog/generated/perceptual-candidates.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k not in {"candidates", "unreadable"}}, indent=2))
