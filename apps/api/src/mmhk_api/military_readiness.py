"""Read-only military readiness for a selected world region.

This is NOT a battle quote, loot calculation, dispatch, or PvP authority.
Unknown targets are not resolved by querying hidden city coordinates.
"""
from __future__ import annotations

from uuid import UUID
import psycopg

from .map_views import MapNotFound


def military_readiness(db:psycopg.Connection,owner:UUID,
                       world_id:str,x:int,y:int)->dict:
    world=db.execute(
        """SELECT w.world_size FROM world_memberships m
           JOIN worlds w ON w.world_id=m.world_id
           WHERE m.world_id=%s AND m.account_id=%s""",
        (world_id,owner),
    ).fetchone()
    if world is None:
        raise MapNotFound
    size=world[0]
    if type(x) is not int or type(y) is not int or not (
        1<=x<=size and 1<=y<=size
    ):
        raise ValueError("Invalid world coordinates")

    # Only previously discovered opponent settlements may appear here.
    target=db.execute(
        """SELECT c.city_id,c.name FROM map_city_discoveries d
           JOIN cities c ON c.city_id=d.city_id AND c.world_id=d.world_id
           WHERE d.world_id=%s AND d.viewer_account_id=%s
             AND c.owner_account_id<>%s AND c.x=%s AND c.y=%s""",
        (world_id,owner,owner,x,y),
    ).fetchone()
    own=db.execute(
        """SELECT city_id FROM cities
           WHERE world_id=%s AND x=%s AND y=%s AND owner_account_id=%s""",
        (world_id,x,y,owner),
    ).fetchone()

    rows=db.execute(
        """SELECT c.city_id,c.name,c.x,c.y,h.hero_id,h.name,h.status,
                  COALESCE(SUM(a.quantity),0)
           FROM cities c
           JOIN city_heroes h ON h.city_id=c.city_id
             AND h.owner_account_id=c.owner_account_id
           LEFT JOIN hero_army_units a ON a.hero_id=h.hero_id
           WHERE c.world_id=%s AND c.owner_account_id=%s
           GROUP BY c.city_id,c.name,c.x,c.y,h.hero_id,h.name,h.status
           ORDER BY c.name,h.name,h.hero_id""",
        (world_id,owner),
    ).fetchall()
    heroes=[]
    for cid,city,cx,cy,hid,name,status,total in rows:
        dx=abs(cx-x);dy=abs(cy-y)
        distance=min(dx,size-dx)+min(dy,size-dy)
        heroes.append({
            "city_id":str(cid),"city_name":city,
            "hero_id":str(hid),"hero_name":name,
            "status":status,"troop_count":int(total),
            "distance_steps":distance,
            "preparation_ready":status=="idle" and total>0,
        })

    # Never imply a target is empty merely because it is undiscovered.
    reason=("own_city" if own else "discovered_opponent" if target
            else "target_not_identified")
    return {
        "world_id":world_id,"x":x,"y":y,
        "target_kind":reason,
        "target_name":target[1] if target else None,
        "heroes":heroes,
        "attack_enabled":False,"raid_enabled":False,
        "combat_quote_available":False,
        "blocking_reasons":[
            "pvp_orders_not_implemented",
            "pvp_protection_and_battle_policy_not_validated",
        ] + (["target_not_identified"] if reason=="target_not_identified" else
             ["self_attack_forbidden"] if reason=="own_city" else []),
        "note":"Preparation only; no army is dispatched and no target intelligence is inferred.",
    }
