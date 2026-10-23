"""Laboratoire d'influence MMHK-like. Seuils de puissance synthétiques, moyenne quotidienne sur 4/6 jours.
Ce module n'est pas une reconstitution certifiée du serveur Ubisoft.
"""
from dataclasses import dataclass
from math import hypot
from collections import Counter

THRESHOLDS=(0,10000,30000,75000,150000,300000,500000)  # valeurs PROPOSEES

@dataclass(frozen=True)
class City:
    name:str
    alliance:str
    x:int
    y:int
    samples:tuple[int,...]
    building_domination:int=0

def military_mean(samples, days=6):
    assert days in (4,6) and samples and all(v>=0 for v in samples)
    last=samples[-days:]
    return sum(last)/len(last)

def city_power(city,days=6):
    return military_mean(city.samples,days)+city.building_domination

def radius(power,thresholds=THRESHOLDS):
    return max(1,min(6,sum(power>=t for t in thresholds[1:])))

def toric_distance(a,b,width,height):
    dx=min(abs(a[0]-b[0]),width-abs(a[0]-b[0]))
    dy=min(abs(a[1]-b[1]),height-abs(a[1]-b[1]))
    return hypot(dx,dy)

def city_score(city,cell,width,height,days=6,falloff_exponent=2):
    power=city_power(city,days)
    distance=toric_distance((city.x,city.y),cell,width,height)
    if distance>radius(power): return 0.
    return power/(1+distance)**falloff_exponent

def cell_owner(cell,cities,width,height,days=6,allied_aggregation='sum',tie_epsilon=1e-8):
    scores={}
    for city in cities:
        s=city_score(city,cell,width,height,days)
        if s<=0: continue
        if allied_aggregation=='sum': scores[city.alliance]=scores.get(city.alliance,0)+s
        else: scores[city.alliance]=max(scores.get(city.alliance,0),s)
    if not scores: return None
    ranking=sorted(scores.items(),key=lambda kv:(-kv[1],kv[0]))
    if len(ranking)>1 and abs(ranking[0][1]-ranking[1][1])<=tie_epsilon: return 'contested'
    return ranking[0][0]

def smoke_test():
    a=City('A','alliance-a',10,10,(500000,)*6)
    b=City('B','alliance-b',20,10,(500000,)*6)
    assert radius(city_power(a))==6
    assert radius(military_mean((0,0,0,0,0,500000)))<6
    assert toric_distance((0,0),(39,0),40,30)==1
    assert cell_owner((15,10),(a,b),40,30)=='contested'
    values=Counter(cell_owner((x,y),(a,b),40,30) for y in range(30) for x in range(40))
    return {'tests':'passed','areas':{str(k):v for k,v in values.items()},'note':'all thresholds/falloff are illustrative, NOT Ubisoft S2'}

if __name__=='__main__':
    import json
    print(json.dumps(smoke_test(),ensure_ascii=False,indent=2))
