#!/usr/bin/env python3
"""Télécharge un petit lot d'images Ubisoft depuis leurs captures Wayback.

Conserve les originaux sans transformation et refuse les réponses HTML, les
fichiers invalides et les empreintes ne correspondant pas aux captures CDX.

Exemples :
  python3 tools/recover-wayback-assets.py --dry-run --priority-max 2 --limit 30
  python3 tools/recover-wayback-assets.py --category ville/planche_miniatures --limit 5
  python3 tools/recover-wayback-assets.py --id 'cdn:img/cityBuildingList/sylvan_building.gif'
  node tools/build-assets-catalog.mjs

Prérequis : Pillow (déjà utilisé par l'audit visuel). Les écritures sont limitées
au dossier data/assets-recovered/ubisoft-archive. Ne pas utiliser pour sonder
massivement le service ; respecter les limites de débit et les refus de Wayback.
"""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from io import BytesIO

from PIL import Image, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data/analysis/assets-catalog.json"
DEST_ROOT = ROOT / "data/assets-recovered/ubisoft-archive"
VERSION = re.compile(r"/(\d+\.\d+\.\d+(?:\.\d+)?(?:-\d+)?-MTR)/")
SAFE_LOGICAL = re.compile(r"^img/[a-zA-Z0-9_./\-]+$")


def arguments():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--category", default=None,
                        help="Catégorie exacte (ex. ville/planche_miniatures)")
    parser.add_argument("--priority-max", type=int, default=2,
                        help="Priorité maximale ; 1 très urgent, 4 faible (défaut 2)")
    parser.add_argument("--id", default=None, help="Identifiant complet d'un fichier")
    parser.add_argument("--limit", type=int, default=20,
                        help="Nombre maximal de candidats par exécution (défaut 20)")
    parser.add_argument("--pause", type=float, default=2.0,
                        help="Pause entre requêtes HTTP, en secondes (défaut 2)")
    parser.add_argument("--timeout", type=int, default=25,
                        help="Durée maximale d'une requête en secondes")
    parser.add_argument("--dry-run", action="store_true",
                        help="Affiche les URL et chemins ciblés, sans connexion")
    return parser.parse_args()


def local_path(asset):
    match = VERSION.search(asset.get("original_url") or "")
    relative = asset["logical_path"]
    if not match or not SAFE_LOGICAL.fullmatch(relative):
        raise ValueError("Version ou chemin non sûr : " + relative)
    # Chaque chemin provient du manifeste vérifié, jamais d'une redirection réseau.
    path = DEST_ROOT / match.group(1) / relative
    if not path.resolve().is_relative_to(DEST_ROOT.resolve()):
        raise ValueError("Sortie hors dépôt : " + str(path))
    return path


def image_info(blob):
    try:
        with Image.open(BytesIO(blob)) as im:
            im.verify()
        with Image.open(BytesIO(blob)) as im:
            return {"width": im.width, "height": im.height, "format": im.format}
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise ValueError("Réponse non décodable comme image : " + str(exc)) from exc


def main():
    args = arguments()
    if args.limit < 1 or args.pause < 0 or args.timeout < 1:
        sys.exit("Paramètres --limit, --pause ou --timeout invalides")
    dataset = json.loads(CATALOG.read_text(encoding="utf-8"))
    images = [
        a for a in dataset["images"]
        if a["availability"] == "wayback_index_only"
        and a.get("archive_url") and a["id"].startswith("cdn:")
        and (args.id is None or a["id"] == args.id)
        and (args.category is None or a["category"] == args.category)
        and (args.id is not None or a["priority"] <= args.priority_max)
    ][:args.limit]
    if args.id and not images:
        sys.exit("Aucune entrée Wayback téléchargeable ne correspond à cet identifiant")

    print(f"{len(images)} candidat(s) sélectionné(s) — dry-run={args.dry_run}")
    successes = 0
    for position, asset in enumerate(images, 1):
        try:
            target = local_path(asset)
            print(f"[{position}/{len(images)}] {asset['logical_path']}")
            print("  " + asset["archive_url"])
            print("  -> " + str(target.relative_to(ROOT)))
            if target.exists():
                print("  Déjà présent : laissé intact")
                continue
            if args.dry_run:
                continue
            if position > 1:
                time.sleep(args.pause)
            req = Request(asset["archive_url"], headers={
                "User-Agent": "MMHK-historical-research/1.0 (educational-asset-audit)",
                "Accept": "image/*",
            })
            with urlopen(req, timeout=args.timeout) as response:
                # Limite défensive, évite de stocker une page ou un objet énorme.
                blob = response.read(16 * 1024 * 1024 + 1)
            if len(blob) > 16 * 1024 * 1024:
                raise ValueError("Fichier supérieur à 16 Mio")
            info = image_info(blob)
            digest = base64.b32encode(hashlib.sha1(blob).digest()).decode("ascii").rstrip("=")
            if digest not in asset.get("cdx_digests", []):
                raise ValueError("SHA-1 différent de l'index CDX ; version à qualifier")
            target.parent.mkdir(parents=True, exist_ok=True)
            temp = target.with_name(target.name + ".partial")
            try:
                temp.write_bytes(blob)
                temp.replace(target)
            finally:
                temp.unlink(missing_ok=True)
            successes += 1
            print("  OK", info, "SHA256", hashlib.sha256(blob).hexdigest())
        except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
            print("  ÉCHEC :", str(exc), file=sys.stderr)
    print(f"Terminé : {successes} fichier(s) nouvellement récupéré(s) sur {len(images)} candidats.")
    if successes:
        print("Regénérer l'inventaire : node tools/build-assets-catalog.mjs")


if __name__ == "__main__":
    main()
