"""Trusted internal map-intelligence writes. There is intentionally NO HTTP write route.

An operator or future verified world-generator calls these functions only after
checking the origin of data. Every disclosed item has an explicit viewer grant.
"""
from __future__ import annotations
from uuid import UUID, uuid4
import psycopg

ALLOWED_SITES=frozenset(("sphinx","obelisk","dolmen","portal","relic","special"))

def _world_size(db:psycopg.Connection,world_id:str)->int:
    result=db.execute("SELECT world_size FROM worlds WHERE world_id=%s",(world_id,)).fetchone()
    if not result:raise ValueError("World not found")
    return result[0]

def _coords(db:psycopg.Connection,world_id:str,x:int,y:int)->None:
    size=_world_size(db,world_id)
    if isinstance(x,bool) or isinstance(y,bool) or not isinstance(x,int) or not isinstance(y,int) or not(1<=x<=size and 1<=y<=size):
        raise ValueError("Coordinates outside world")

def _member(db:psycopg.Connection,world_id:str,account_id:UUID)->None:
    found=db.execute("SELECT 1 FROM world_memberships WHERE world_id=%s AND account_id=%s",
       (world_id,account_id)).fetchone()
    if not found:raise ValueError("Account is not a world member")

def register_known_site(db:psycopg.Connection,*,world_id:str,x:int,y:int,kind:str,
                        label:str,source_ref:str)->UUID:
    _coords(db,world_id,x,y)
    if kind not in ALLOWED_SITES:raise ValueError("Unknown site kind")
    if not(1<=len(label)<=100 and 3<=len(source_ref)<=255):raise ValueError("Source and label required")
    site_id=uuid4()
    db.execute("""INSERT INTO map_world_sites(site_id,world_id,x,y,kind,label,source_ref)
                   VALUES(%s,%s,%s,%s,%s,%s,%s)""",
                   (site_id,world_id,x,y,kind,label,source_ref))
    return site_id

def reveal_site(db:psycopg.Connection,*,world_id:str,site_id:UUID,viewer:UUID)->None:
    _member(db,world_id,viewer)
    if not db.execute("SELECT 1 FROM map_world_sites WHERE world_id=%s AND site_id=%s",
                      (world_id,site_id)).fetchone():raise ValueError("Site not in world")
    db.execute("""INSERT INTO map_site_discoveries(world_id,site_id,viewer_account_id)
                  VALUES(%s,%s,%s) ON CONFLICT DO NOTHING""",(world_id,site_id,viewer))

def reveal_city(db:psycopg.Connection,*,world_id:str,city_id:UUID,viewer:UUID)->None:
    _member(db,world_id,viewer)
    if not db.execute("SELECT 1 FROM cities WHERE world_id=%s AND city_id=%s",
                      (world_id,city_id)).fetchone():raise ValueError("City not in world")
    db.execute("""INSERT INTO map_city_discoveries(world_id,city_id,viewer_account_id)
                  VALUES(%s,%s,%s) ON CONFLICT DO NOTHING""",(world_id,city_id,viewer))

def record_influence(db:psycopg.Connection,*,world_id:str,x:int,y:int,
                     controller:UUID,source_ref:str)->None:
    _coords(db,world_id,x,y);_member(db,world_id,controller)
    if not 3<=len(source_ref)<=255:raise ValueError("Influence provenance required")
    db.execute("""INSERT INTO map_influence_cells(world_id,x,y,controller_account_id,source_ref)
                  VALUES(%s,%s,%s,%s,%s)
                  ON CONFLICT(world_id,x,y) DO UPDATE SET
                    controller_account_id=EXCLUDED.controller_account_id,
                    source_ref=EXCLUDED.source_ref,observed_at=clock_timestamp()""",
               (world_id,x,y,controller,source_ref))

def reveal_influence(db:psycopg.Connection,*,world_id:str,x:int,y:int,viewer:UUID)->None:
    _coords(db,world_id,x,y);_member(db,world_id,viewer)
    if not db.execute("SELECT 1 FROM map_influence_cells WHERE world_id=%s AND x=%s AND y=%s",
                      (world_id,x,y)).fetchone():raise ValueError("Influence cell not known")
    db.execute("""INSERT INTO map_influence_discoveries(world_id,x,y,viewer_account_id)
                  VALUES(%s,%s,%s,%s) ON CONFLICT DO NOTHING""",(world_id,x,y,viewer))
