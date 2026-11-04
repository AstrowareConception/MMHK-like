"""Persist four distinct deposit positions for one pre-provisioned region.

A natural deposit is not a city mine. Existing city mine coordinates are
preferred when resource types match; additional duplicate deposits use other
free cells. Readers never synthesize or write layouts.
"""
from __future__ import annotations

from collections import Counter
from hashlib import sha256

import psycopg

POLICY = "deposits-layout-v1"


class DepositLayoutConflict(ValueError):
    """A persisted region cannot safely receive its required deposit layout."""



def calculate_deposit_positions(
    world_id: str, x: int, y: int, resources: list[str],
    mine_positions: list[tuple[str,int,int]] | None = None,
) -> list[dict]:
    if len(resources) != 4:
        raise ValueError("A region must have exactly four resource slots")
    if any(not isinstance(r, str) or not r for r in resources):
        raise ValueError("Invalid resource slot")
    mine_positions = mine_positions or []
    occupied: set[tuple[int,int]] = set()
    resource_mines: dict[str, list[tuple[int,int]]] = {}
    for resource, i, j in mine_positions:
        if (resource not in resources or
            type(i) is not int or type(j) is not int or
            not 0 <= i <= 4 or not 0 <= j <= 4 or (i,j)==(2,2) or
            (i,j) in occupied):
            raise ValueError("Invalid existing mine layout")
        occupied.add((i,j))
        resource_mines.setdefault(resource,[]).append((i,j))
    for positions in resource_mines.values():
        positions.sort()
    if any(len(positions) > Counter(resources)[resource]
           for resource,positions in resource_mines.items()):
        raise ValueError("More existing mines than matching deposits")
    reserved: set[tuple[int,int]] = set()
    result=[]
    for slot,resource in enumerate(resources):
        available=resource_mines.get(resource,[])
        if available:
            i,j=available.pop(0)
        else:
            candidates=[
                (i,j) for i in range(5) for j in range(5)
                if (i,j)!=(2,2) and (i,j) not in reserved
                and (i,j) not in occupied
            ]
            if not candidates:
                raise ValueError("No space for resource deposit")
            def score(point:tuple[int,int])->bytes:
                i0,j0=point
                return sha256(
                    f"{POLICY}:{world_id}:{x}:{y}:{slot}:{i0}:{j0}".encode()
                ).digest()
            i,j=min(candidates,key=score)
        reserved.add((i,j))
        result.append({"slot":slot,"resource":resource,"i":i,"j":j})
    return result


def provision_deposits(
    db:psycopg.Connection, *, world_id:str,x:int,y:int,
)->list[dict]:
    """Operator-only, repeatable and serialized by regional row lock.

    Existing mine positions are preserved. An incomplete persisted four-slot
    layout fails closed instead of silently being reshuffled.
    """
    row=db.execute(
        """SELECT resources FROM world_region_resources
           WHERE world_id=%s AND x=%s AND y=%s FOR UPDATE""",
        (world_id,x,y),
    ).fetchone()
    if row is None:
        raise DepositLayoutConflict("Provision the region resources first")
    resources=list(row[0])
    existing=db.execute(
        """SELECT slot,resource,i,j FROM world_region_deposits
           WHERE world_id=%s AND x=%s AND y=%s ORDER BY slot""",
        (world_id,x,y),
    ).fetchall()
    if existing:
        result=[{"slot":slot,"resource":resource,"i":i,"j":j}
                for slot,resource,i,j in existing]
        if (len(result)!=4 or [p["resource"] for p in result]!=resources
            or [p["slot"] for p in result]!=list(range(4))):
            raise DepositLayoutConflict("Persisted deposit layout is incomplete or inconsistent")
        return result
    city=db.execute(
        "SELECT city_id FROM cities WHERE world_id=%s AND x=%s AND y=%s",
        (world_id,x,y),
    ).fetchone()
    mine_positions=[]
    if city:
        mine_positions=db.execute(
            """SELECT resource,i,j FROM city_mine_positions
               WHERE city_id=%s ORDER BY resource""",(city[0],),
        ).fetchall()
    try:
        result=calculate_deposit_positions(
            world_id,x,y,resources,mine_positions,
        )
    except ValueError as exc:
        raise DepositLayoutConflict(str(exc)) from exc
    for p in result:
        db.execute(
            """INSERT INTO world_region_deposits
               (world_id,x,y,slot,resource,i,j)
               VALUES(%s,%s,%s,%s,%s,%s,%s)""",
            (world_id,x,y,p["slot"],p["resource"],p["i"],p["j"]),
        )
    return result
