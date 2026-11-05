"""Bounded Jactari pre-shot phase, US-COM-007.

Reference: data/Jactari/src/scripts/combat.min.js / tir_engins_siege.
The historical sequence computes *both sides* from intact pre-duel
snapshots, accumulates provisional stack losses, and applies them only
after all barrages, ballistae and conditional bombardment.

Only explicit operator-qualified shot percentages are usable. This is
a read-only laboratory: its losses are pre-duel simulated dispersions,
NOT permanent casualties, XP, loot, or territorial liberation.
"""
from __future__ import annotations

from decimal import Decimal
from math import floor, isfinite

POLICY="jactari-pre-shots-lab-v1"
# Source CODE-01-COMBAT: attacker barrage, defender barrage, attacker
# ballista, defender ballista, defender bombardment. Never order by arrival.
_ORDER={("attacker","barrage"):0,("defender","barrage"):1,
        ("attacker","ballista"):2,("defender","ballista"):3,
        ("defender","bombardment"):4}
_MAX_STACKS=7
_MAX_COUNT=1_000_000
_MAX_PERCENT=Decimal("1000")


def _line(stacks: list[dict], side: str)->list[dict]:
    if not isinstance(stacks,list) or not 1<=len(stacks)<=_MAX_STACKS:
        raise ValueError(f"{side}: expected one to seven stacks")
    result=[]
    for i,entry in enumerate(stacks):
        if not isinstance(entry,dict):
            raise ValueError(f"{side}: invalid stack")
        count,power=entry.get("count"),entry.get("unit_power")
        weapon=entry.get("weapon_code")
        siege=entry.get("siege",False)
        if (type(count) is not int or not 1<=count<=_MAX_COUNT or
            type(power) not in (int,float) or not isfinite(power) or
            power<=0 or power>1_000_000 or
            weapon not in (None,"I","R","C","E") or
            type(siege) is not bool):
            raise ValueError(f"{side}: unqualified pre-shot stack")
        result.append({"position":i+1,"count":count,"unit_power":float(power),
                       "weapon_code":weapon,"siege":siege})
    return result


def resolve_pre_shots(
    attacker:list[dict], defender:list[dict], actions:list[dict], *,
    attacker_has_hero:bool=False, defender_has_hero:bool=False,
    season:int|None=None, location_code:int|None=None,
)->dict:
    """Deterministic, simultaneous pre-shot calculations on original stacks.

    `actions` are trusted policy events, not player-supplied casualty
    orders. Every active event needs an explicit decimal percentage and
    provenance. No event => no automatic fire. Where independent volleys
    over-allocate one stack (a historical edge case), the final effective
    simulated loss is capped at that original stack count.
    """
    a,d=_line(attacker,"attacker"),_line(defender,"defender")
    if (type(attacker_has_hero) is not bool or
        type(defender_has_hero) is not bool):
        raise ValueError("Hero flags must be explicit booleans")
    if not isinstance(actions,list) or len(actions)>5:
        raise ValueError("At most five qualified pre-shot events")
    if season is not None and (type(season) is not int or season<1):
        raise ValueError("Invalid season")
    if location_code is not None and type(location_code) is not int:
        raise ValueError("Invalid location code")
    chosen={}
    for action in actions:
        if not isinstance(action,dict) or set(action)!={"side","kind","percent","source_ref"}:
            raise ValueError("Malformed pre-shot policy")
        side,kind=action["side"],action["kind"]
        key=(side,kind)
        if key not in _ORDER or key in chosen:
            raise ValueError("Unsupported or duplicate pre-shot event")
        pct=action["percent"]
        ref=action["source_ref"]
        if (type(pct) is not Decimal or not pct.is_finite() or
            not Decimal("0")<pct<=_MAX_PERCENT):
            raise ValueError("A positive qualified Decimal percentage is required")
        if (not isinstance(ref,str) or not 3<=len(ref.strip())<=255 or
            any(ord(ch)<32 or ord(ch)==127 for ch in ref)):
            raise ValueError("A printable source reference is required")
        if kind=="barrage" and not (
            attacker_has_hero if side=="attacker" else defender_has_hero
        ):
            raise ValueError("A barrage requires a present hero")
        if kind=="bombardment" and not (
            side=="defender" and season is not None and season>1 and
            location_code==3 and defender_has_hero and pct==100
        ):
            raise ValueError("Bombardment is not authorized in this context")
        chosen[key]={"side":side,"kind":kind,"percent":pct,"source_ref":ref.strip()}
    # All shots read these same original stacks; no shot can preempt the
    # opposing shot by changing the source's units before the calculation.
    projected={"attacker":[0]*len(a),"defender":[0]*len(d)}
    events=[]
    for key,policy in sorted(chosen.items(),key=lambda item:_ORDER[item[0]]):
        side,kind=key
        source=a if side=="attacker" else d
        target=d if side=="attacker" else a
        target_side="defender" if side=="attacker" else "attacker"
        eligible=[
            stack for stack in source
            if (kind=="barrage" and stack["weapon_code"]=="R") or
               kind=="ballista" or
               (kind=="bombardment" and stack["siege"])
        ]
        # Historical siege-unit exception: power 300 => 1100, else 1600.
        total=sum(
            (1100 if stack["unit_power"]==300 else 1600)
              *stack["count"] if kind=="bombardment"
            else stack["unit_power"]*stack["count"]
            for stack in eligible
        )
        power=float(total)*float(policy["percent"])/100.0
        if not isfinite(power):
            raise ValueError("Nonfinite pre-shot strength")
        available=power
        contribution=[0]*len(target)
        for index,stack in enumerate(target):
            if available<=0:
                break
            stack_power=stack["unit_power"]*stack["count"]
            if available<=stack_power:
                hit=floor(available/stack["unit_power"])
                available=0
            else:
                hit=stack["count"]
                available-=stack_power
            contribution[index]=int(hit)
            projected[target_side][index]+=int(hit)
        events.append({
            "order":_ORDER[key],"side":side,"kind":kind,
            "source_ref":policy["source_ref"],
            "percent":str(policy["percent"]),
            "eligible_positions":[x["position"] for x in eligible],
            "shot_power":power,
            "projected_losses":contribution,
            "target_side":target_side,
            "historically_certified_s2":False,
        })
    effective={
        "attacker":[min(v,stack["count"]) for v,stack in zip(projected["attacker"],a)],
        "defender":[min(v,stack["count"]) for v,stack in zip(projected["defender"],d)],
    }
    after={
        "attacker":[stack["count"]-v for stack,v in zip(a,effective["attacker"])],
        "defender":[stack["count"]-v for stack,v in zip(d,effective["defender"])],
    }
    return {
        "policy_id":POLICY,"phase":"pre_duel",
        "configured":bool(actions),"events":events,
        "original_counts":{"attacker":[v["count"] for v in a],
                           "defender":[v["count"] for v in d]},
        "projected_losses":projected,
        "simulated_losses":effective,"remaining_after_shots":after,
        "overlap_capped":any(
            x!=y for side in ("attacker","defender")
            for x,y in zip(projected[side],effective[side])
        ),
        "simultaneous":True,
        "effects_applied_to_database":False,
        "historically_certified_s2":False,
    }
