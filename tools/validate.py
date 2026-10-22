#!/usr/bin/env python3
"""Contrôle du dossier et de ses données ; ne teste pas un jeu exécutable."""
from pathlib import Path
from collections import Counter
import json
import math
import re
import sys
import hashlib
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
errors, notes = [], []
checks = 0

def check(ok, message):
    global checks
    checks += 1
    if not ok:
        errors.append(message)

def read(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))

data = {}
for p in sorted((ROOT / 'data').rglob('*.json')):
    try:
        data[str(p.relative_to(ROOT))] = json.loads(p.read_text(encoding='utf-8'))
        check(True, str(p))
    except Exception as e:
        check(False, f'JSON invalide {p.name}: {e}')
if errors:
    print('\n'.join(errors)); sys.exit(1)

def group(n):
    return data['data/reference/' + n + '.json']

u, b, h, s, a, g = [group(n) for n in ['creatures','batiments','heros','sorts','artefacts','general']]
counts = group('counts')
actual = {
    'creatures': len(u['_unites']),
    'buildings': len(b['_batiments'])-1,
    'regional_buildings': len(b['_batiments_region']),
    'spells': len(s['_sorts']),
    'hero_archetypes': len(h['_archetypes']),
    'careers': len(h['_carrieres']),
    'talent_groups': len(h['_talents']),
    'talents': sum(map(len, h['_talents'])),
    'artifacts': len(a['_artefacts'])-1,
    'artifact_effects': len(a['_effets'])-1,
    'artifact_sets': len(a['_sets_artefacts']),
}
check(actual == counts, 'Comptages incohérents')
manifest = read('data/source-manifest.json')
for name in ['general','creatures','batiments','heros','sorts','artefacts','bonus']:
    check(group(name)['_provenance']['commit'] == manifest['commit'], f'Provenance {name}')
for f in manifest['files']:
    check(bool(re.fullmatch('[0-9a-f]{40}', f['git_blob_sha'])), f'Empreinte Git {f["file"]}')
    check(bool(re.fullmatch('[0-9a-f]{64}', f['sha256'])), f'Empreinte SHA256 {f["file"]}')

# La complétude contrôlée porte sur les cinq lignées ordinaires, pas sur les PNJ.
for faction in range(5):
    for rank in range(1,8):
        for upgrade in [0,1]:
            matches = [x for x in u['_unites'] if (x.get('faction'),x.get('rang'),x.get('plus')) == (faction,rank,upgrade)]
            check(len(matches) == 1, f'Lignée non unique faction={faction}, rang={rank}, plus={upgrade}')
for i,x in enumerate(u['_unites']):
    check(x['puissance'] > 0, f'Puissance invalide unité {i}')
    check(x.get('arme') in ['I','R','C','E'], f'Arme inconnue unité {i}: {x.get("arme")}')
    if 'id' in x:
        check(x['id'] == i, f'ID explicite différent de l’indice unité {i}')
    if isinstance(x.get('cout'), dict):
        check(set(x['cout']).issubset(g['_ressources']), f'Ressource inconnue unité {i}')
        check(all(v >= 0 for v in x['cout'].values()), f'Coût négatif unité {i}')
notes.append(f"{sum('id' not in x for x in u['_unites'])} unités sans champ id : les indices sont les identifiants de référence.")
notes.append(f"{sum('prod' not in x for x in u['_unites'])} unités sans production : aucune recrue par défaut ne doit être inventée.")

check(len(h['_niveaux']) == 41, 'Table de niveaux 0–40 attendue')
for i,x in enumerate(h['_archetypes']):
    check(all(0 <= x[k] < len(h['_progression']) for k in ['attaque','defense','magie']), f'Courbe héros {i}')
for c, talents in enumerate(h['_talents']):
    for t,x in enumerate(talents):
        check(isinstance(x.get('v'), list), f'Valeurs talent {c}/{t}')
notes.append('8 groupes de talents supplémentaires sans nom de carrière dans _carrieres : extensions à qualifier.')

for i,x in enumerate(s['_sorts']):
    for key, arr in [('ecole','_ecoles_magie'),('type','_types_sorts'),('cible','_cibles_sorts'),('unite','_unites_sorts')]:
        check(0 <= x[key] < len(s[arr]), f'Référence {key} sort {i}')
    check(1 <= x['cercle'] <= 5, f'Cercle sort {i}')
check(Counter(x['ecole'] for x in s['_sorts']) == {0:9,1:9,2:9,3:9}, 'Répartition des écoles')

bad_effects, placeholder_refs, empty_forts = [], [], 0
effect_ids = {x['id'] for x in a['_effets'] if isinstance(x,dict) and 'id' in x}
for i,x in enumerate(a['_artefacts']):
    for e in x.get('effets',[]):
        if e.get('id') not in effect_ids:
            bad_effects.append(f"artéfact {i}, effet {e.get('id')}")
check(not bad_effects, 'Références d’effets absentes: '+', '.join(bad_effects[:12]))
for i,x in enumerate(b['_batiments']):
    p = x.get('prerequis',{}).get('batiment')
    refs = p if isinstance(p,list) else [p]
    for r in refs:
        if isinstance(r,int):
            check(0 <= r < len(b['_batiments']), f'Prérequis bâtiment {i}: {r}')
        elif isinstance(r,str):
            placeholder_refs.append(f'ville {i}: {r}')
for i,x in enumerate(b['_batiments_region']):
    p = x.get('prerequis',{}).get('batiment',x.get('batiment'))
    if isinstance(p,str):
        placeholder_refs.append(f'région {i}: {p}')
notes.extend(['Références régionales symboliques conservées : '+', '.join(placeholder_refs),
              'Catalogue régional limité à dix entrées, non exhaustif.',
              f"{sum(not x for x in g['_fortifications'])} positions vides dans la table de fortifications, indices conservés."])

# Arithmétique de contrôle : duels fictifs, sans prétendre implémenter le moteur.
fixtures = read('data/combat-reference-cases.json')
counter = {('I','C'),('R','I'),('C','R')}
def death(n):
    v = n * .3
    return math.floor(max(1,v)) if v > 0 else 0
for case in fixtures['duels']:
    aa,dd = case['a'],case['d']
    ba,bd = aa['count']*100,dd['count']*100
    xa = ba*.5 if (aa['arm'],dd['arm']) in counter else 0
    xd = bd*.5 if (dd['arm'],aa['arm']) in counter else 0
    ta,td = ba+xa,bd+xd
    check(ta != td, 'Le jeu de fixtures simplifiées exclut les égalités')
    if ta > td:
        overrun = math.floor(ta)-math.floor(td) > ba
        da = 0 if overrun else math.floor((math.floor(td)-math.floor(xa))/100)
        d_d = dd['count']; winner='a'
    else:
        overrun = math.floor(td)-math.floor(ta) > bd
        d_d = 0 if overrun else math.floor((math.floor(ta)-math.floor(xd))/100)
        da = aa['count']; winner='d'
    result = dict(winner=winner,dispersed_a=da,dispersed_d=d_d,deaths_a=death(da),deaths_d=death(d_d),overrun=overrun)
    check(result == case['expected'], f'Cas arithmétique {case["id"]}: {result}')
for case in fixtures['admission']:
    ratio = case['attack']/case['defense']
    if case['mode']=='pve':
        result = 'flee' if ratio <= 1/7 else 'battle'
    else:
        q = math.floor(ratio*30)
        result = 'capture' if q<=2 else {3:'wound24',4:'wound18',5:'wound12',6:'wound6',7:'flee'}.get(q,'battle')
    check(result == case['expected'], f'Admission {case["id"]}: {result}')

# Ressources importées : identité des fichiers, annotation exhaustive et atlas.
visual = read('data/analysis/screenshots-inventory.json')
assets = read('data/analysis/jactari-inventory.json')
annotations = read('data/analysis/screenshots-observations.json')['observations']
sprites = read('data/analysis/sprite-manifest.json')
check(len(visual['files']) == visual['count'] == 57, 'Nombre de captures')
check(len({x['git_blob_sha'] for x in visual['files']}) == visual['unique_count'] == 53, 'Captures distinctes')
check(len(assets['files']) == assets['file_count'] == 153, 'Inventaire Jactari')
check(len(assets['images']) == assets['image_count'] == 96, 'Images Jactari')
by_shot = {x['id']:x for x in visual['files']}
check(len(by_shot) == 57, 'IDs captures uniques')
check(len(annotations) == 57 and {x['id'] for x in annotations} == set(by_shot), 'Couverture annotations')
for x in annotations:
    check(x['path'] == by_shot[x['id']]['path'] and bool(x['observed']) and bool(x['limits']), 'Annotation contextualisée '+x['id'])
for x in visual['files']:
    if x['duplicate_of']:
        check(by_shot[x['duplicate_of']]['git_blob_sha']==x['git_blob_sha'], 'Doublon exact '+x['id'])
for x in visual['files'] + assets['files']:
    p = ROOT/x['path']
    check(p.is_file(), 'Ressource absente '+x['path'])
    if p.is_file():
        raw=p.read_bytes()
        check(hashlib.sha256(raw).hexdigest()==x['sha256'], 'Empreinte ressource '+x['path'])
        check(hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==x['git_blob_sha'], 'Blob ressource '+x['path'])
check(len(assets['reference_comparison'])==7 and all(x['matches_pinned_reference'] for x in assets['reference_comparison']), 'Identité des sept sources CODE-01')
by_image = {x['path']:x for x in assets['images']}
check(len({x['id'] for x in sprites['entries']})==len(sprites['entries'])==1317, 'IDs de sprites uniques')
for x in sprites['entries']:
    asset=by_image.get(x['sheet']);xx,yy,w,hh=x['rect']
    actual_status='missing_file' if not asset else 'in_bounds' if xx>=0 and yy>=0 and xx+w<=asset['width'] and yy+hh<=asset['height'] else 'out_of_bounds'
    check(x['status']==actual_status, 'Diagnostic sprite '+x['id'])
    if x['status']=='missing_file':
        check(x['sheet'].endswith('/artefact-inconnu.png') and x['id'].startswith('artifact.'), 'Absence non documentée '+x['id'])
    if x['status']=='out_of_bounds':
        check(x['id'] in ['unit.reference.106.small.normal','unit.reference.106.small.grey'], 'Débordement non documenté '+x['id'])
check(Counter(x['status'] for x in sprites['entries'])==sprites['counts']=={'in_bounds':1152,'out_of_bounds':2,'missing_file':163}, 'Comptage diagnostics sprites')
for i,x in enumerate(u['_unites']):
    if x.get('faction') in range(5) and x.get('rang') in range(1,8) and x.get('plus') in [0,1]:
        matches=[s for s in sprites['entries'] if s.get('unit_index')==i]
        check(len(matches)==4 and all(s['status']=='in_bounds' for s in matches),'Sprites lignée ordinaire '+str(i))
notes.append('Corpus visuel : 57 captures / 53 distinctes, 153 fichiers Jactari dont 96 images ; empreintes recalculées.')
notes.append('1 317 correspondances : 1 152 bornées, 163 placeholders d’artefact absents, 2 rectangles Forteresse débordant d’un pixel. Anomalies historiques explicitement conservées.')

markdown = list(ROOT.rglob('*.md'))
requirements = set(re.findall(r'REQ-[A-Z]+-\d+', (ROOT/'docs/specifications/FONCTIONNEL.md').read_text()))
acceptance = (ROOT/'docs/specifications/RECETTE.md').read_text()
covered = set(re.findall(r'REQ-[A-Z]+-\d+', acceptance))
check(requirements <= covered, 'Exigences sans scénario: '+', '.join(sorted(requirements-covered)))
scenario_ids = re.findall(r'^\| (T\d+) \|', acceptance, re.M)
check(len(set(scenario_ids)) == len(scenario_ids), 'Scénarios de recette dupliqués')
notes.append(f'{len(requirements)} exigences fonctionnelles reliées à {len(scenario_ids)} scénarios spécifiés, non exécutés sur un jeu.')
for p in markdown:
    body = p.read_text(encoding='utf-8')
    check('[object Object]' not in body, f'Objet mal rendu dans {p.relative_to(ROOT)}')
    for target in re.findall(r'\[[^\]\n]+\]\(([^)]+)\)',body):
        if target.startswith(('http://','https://','mailto:','#')):
            continue
        local=unquote(target.split('#')[0])
        check((p.parent/local).exists(),f'Lien cassé {p.relative_to(ROOT)} -> {target}')

status='ÉCHEC' if errors else 'RÉUSSI'
report = '# Validation du dossier\n\n'
report += f"État : **{status}**. Référentiel documentaire du {manifest['retrieved_on']}.\n\n"
report += f"{checks} assertions de cohérence, {len(data)} fichiers JSON lus, {len(markdown)} fichiers Markdown inspectés. "
report += f"{len(fixtures['duels'])} duels synthétiques et {len(fixtures['admission'])} cas d’admission contrôlés arithmétiquement.\n\n"
report += '**Portée :** cohérence documentaire et extraction, pas test d’un jeu, d’un serveur, d’une interface ou validation contre des rapports historiques. Les empreintes des six tables déclaratives sont vérifiées par l’extracteur ; celles des 210 ressources importées sont recalculées ici. Les bornes de sprites et anomalies connues sont contrôlées ; aucune fidélité de rendu navigateur n’est revendiquée.\n\n'
report += '## Inventaire contrôlé\n\n| Groupe | Entrées |\n| --- | --- |\n'
report += ''.join(f'| {k} | {v} |\n' for k,v in actual.items())
report += '\n## Particularités conservées\n\n'+''.join('- '+x+'\n' for x in notes)
report += '\nCes particularités sont des limites du référentiel, pas des erreurs masquées. Les anomalies fonctionnelles du simulateur sont décrites dans [Combat](../game-design/04-COMBAT.md) et [Incertitudes](INCERTITUDES.md).\n'
if errors:
    report += '\n## Erreurs bloquantes\n\n'+''.join('- '+x+'\n' for x in errors)
(ROOT/'docs/research/VALIDATION.md').write_text(report,encoding='utf-8')
print(f'{status}: {checks} contrôles, {len(errors)} erreur(s). Rapport: docs/research/VALIDATION.md')
for e in errors: print(e)
sys.exit(bool(errors))
