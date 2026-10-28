import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from PIL import Image, PngImagePlugin

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("perceptual", ROOT / "tools/perceptual-duplicates.py")
perceptual = importlib.util.module_from_spec(spec)
spec.loader.exec_module(perceptual)


class SimilarityTest(unittest.TestCase):
    def test_near_duplicate_candidates_only(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            art = root / "data" / "assets-recovered"
            art.mkdir(parents=True)
            first, second = art / "picture-a.png", art / "picture-b.png"
            picture = Image.new("RGB", (40, 30), (27, 58, 90))
            for x in range(8, 30):
                for y in range(6, 22):
                    picture.putpixel((x, y), (233, 191, 99))
            picture.save(first)
            info = PngImagePlugin.PngInfo()
            info.add_text("variant", "different PNG bytes, same visible pixels")
            picture.save(second, pnginfo=info)
            self.assertEqual(perceptual.distance(perceptual.dhash(first), perceptual.dhash(second)), 0)
            entries = [
                dict(path=str(path.relative_to(root)).replace("\\", "/"),
                     sha256=str(index), kind="image", format="png")
                for index, path in enumerate([first, second])
            ]
            out = root / "data/asset-catalog/generated/inventory.json"
            out.parent.mkdir(parents=True)
            out.write_text(json.dumps(dict(assets=entries)), encoding="utf-8")
            result = perceptual.run(root)
            self.assertEqual(result["candidate_pairs"], 1)
            self.assertTrue(result["candidates"][0]["requires_manual_review"])


if __name__ == "__main__":
    unittest.main()
