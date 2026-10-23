#!/usr/bin/env python3
"""Extract literal city-layout data without evaluating historical JavaScript."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'data/analysis/recovered-assets-2026-10-23.json'
assets = json.loads(MANIFEST.read_text())['assets']
source = next(a for a in assets if a['kind'] == 'client_source'
              and a['source_version'] == '4.1.3-MTR' and a['path'].endswith('.js'))
text = (ROOT / source['path']).read_text()
factions = {}
for match in re.finditer(r'HOMMK\.CITYVIEW_CONF\.CITY_BUILDING_(\w+)=(\{.*?\});', text):
    # These particular literals contain numbers, strings and nested objects.
    # Reject anything outside JSON after quoting the unquoted property names.
    literal = re.sub(r'([,{])([A-Za-z_][A-Za-z_0-9]*):', r'\1"\2":', match[2])
    factions[match[1]] = json.loads(literal)
assert set(factions) == {'HAVEN', 'ACADEMY', 'INFERNO', 'NECROPOLIS', 'SYLVAN'}
assert all(len(buildings) == 43 for buildings in factions.values())
document = {
    'schema_version': 1,
    'evidence': 'OBS-CLIENT-ARCHIVE',
    'source': source,
    'native_canvas': {'width': 680, 'height': 552,
                      'evidence': 'prod.css 4.1.3-MTR, sélecteur .cityViewBase'},
    'extraction': 'Lecture des objets littéraux CITYVIEW_CONF ; aucun JavaScript historique exécuté.',
    'factions': factions,
}
destination = ROOT / 'data/analysis/original-city-layouts-4.1.3.json'
destination.write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n')
print('5 factions ; 215 configurations extraites sans exécution du client historique.')
