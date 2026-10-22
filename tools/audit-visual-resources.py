#!/usr/bin/env python3
"""Inventaire reproductible des ressources importées. Dépendance : Pillow.
Ne modifie jamais data/Jactari ni data/Screenshots.
"""
from pathlib import Path
from collections import Counter
import hashlib, json, re, subprocess
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'data/analysis';OUT.mkdir(exist_ok=True)
COMMIT='71f8ec79cbea19246c539394bf33d75fc21f26b3'
# Vérification contre les blobs du corpus épinglé, pas contre un inventaire
# régénéré à partir de fichiers qui auraient été modifiés.
pinned={}
for record in subprocess.check_output(['git','ls-tree','-rz',COMMIT,'--','data/Screenshots','data/Jactari/src'],cwd=ROOT).split(b'\0'):
 if record:
  head,name=record.split(b'\t',1);pinned[name.decode()]=head.decode().split()[2]
def meta(p):
 b=p.read_bytes()
 relative=p.relative_to(ROOT).as_posix()
 blob=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
 if pinned.get(relative)!=blob:raise ValueError('Fichier différent du corpus épinglé : '+relative)
 return dict(path=p.relative_to(ROOT).as_posix(),bytes=len(b),git_blob_sha=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),sha256=hashlib.sha256(b).hexdigest())
def imeta(p):
 d=meta(p)
 with Image.open(p) as im:
  d.update(width=im.width,height=im.height,format=im.format,mode=im.mode,has_alpha='A' in im.getbands() or 'transparency' in im.info)
 return d
def save(name,obj):
 (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
shots=[];seen={}
for i,p in enumerate(sorted(p for p in (ROOT/'data/Screenshots').rglob('*') if p.is_file()),1):
 d=imeta(p);d['id']=f'SS-{i:03}';d['duplicate_of']=seen.get(d['git_blob_sha']);seen.setdefault(d['git_blob_sha'],d['id']);shots.append(d)
save('screenshots-inventory.json',dict(source_commit=COMMIT,count=len(shots),unique_count=len(seen),files=shots))
files=[];images=[]
for p in sorted((ROOT/'data/Jactari/src').rglob('*')):
 if not p.is_file():continue
 if p.suffix.lower() in ['.png','.jpg','.gif','.jpeg','.webp']:
  d=imeta(p);images.append(d)
 else:d=meta(p)
 files.append(d)
# Mentions littérales, pas graphe complet de chargement : les noms dynamiques et
# les branches non exécutées sont séparés de l'affirmation « dépendance requise ».
mentions={}
for p in sorted((ROOT/'data/Jactari/src').rglob('*')):
 if p.suffix.lower() not in ['.js','.css','.html']:continue
 for name in set(re.findall(r'[A-Za-z0-9_-]+\.(?:png|jpg|gif)',p.read_text(errors='replace'))):
  mentions.setdefault(name,[]).append(p.relative_to(ROOT).as_posix())
known={Path(x['path']).name for x in images}
missing=[dict(name=n,mentioned_by=ps,status='literal_mention_missing_not_necessarily_loaded') for n,ps in sorted(mentions.items()) if n not in known]
reference=json.loads((ROOT/'data/source-manifest.json').read_text())
comparison=[]
for f in reference['files']:
 p=ROOT/'data/Jactari/src/scripts'/f['file']
 if p.exists():
  d=meta(p);comparison.append(dict(file=f['file'],git_blob_sha=d['git_blob_sha'],matches_pinned_reference=d['git_blob_sha']==f['git_blob_sha']))
save('jactari-inventory.json',dict(source_commit=COMMIT,file_count=len(files),image_count=len(images),extensions=dict(sorted(Counter(Path(x['path']).suffix for x in files).items())),files=files,images=images,missing_literal_mentions=missing,reference_comparison=comparison))
print(f'{len(shots)} captures / {len(seen)} distinctes ; {len(files)} fichiers Jactari / {len(images)} images ; {len(missing)} noms mentionnés absents.')
