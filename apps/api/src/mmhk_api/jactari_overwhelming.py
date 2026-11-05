"""US-COM-009 — Jactari overwhelming victory boundary, read-only.

Source: CODE-01-COMBAT (simulation_combat). For strictly unequal total
powers, the winner's overwhelming marker is assigned only if
floor(total_winner)-floor(total_loser) > base_winner.
Equality to the base is NOT overwhelming; -1 is a sentinel for no
simulated winner losses, never a negative unit count.
"""
from __future__ import annotations

from math import floor, isfinite


def explain_overwhelming(outcome: dict) -> dict:
    if type(outcome) is not dict:
        raise ValueError("Expected a Jactari duel report")
    base=outcome.get("basePower")
    total=outcome.get("totalPower")
    losses=outcome.get("losses")
    if any(type(row) is not dict for row in (base,total,losses)):
        raise ValueError("Missing base/total power or losses")
    for side in ("attacker","defender"):
        for row in (base,total):
            value=row.get(side)
            if (type(value) not in (int,float) or not isfinite(value)
                or (row is base and value<=0)):
                raise ValueError("Invalid Jactari power")
        loss=losses.get(side)
        if type(loss) is not int or loss < -1:
            raise ValueError("Invalid Jactari loss sentinel")
    a,d=total["attacker"],total["defender"]
    if a==d:
        if -1 in losses.values():
            raise ValueError("Draw cannot have overwhelming sentinel")
        return {
            "winner":None,"overwhelming":False,
            "power_delta_after_floor":0,"winner_base_power":None,
            "strict_threshold":True,
            "marker_expected":False,
            "source_policy":"jactari-overwhelming-v1",
            "persistent_casualties_applied":False,
        }
    winner="attacker" if a>d else "defender"
    loser="defender" if a>d else "attacker"
    delta=floor(total[winner])-floor(total[loser])
    expected=delta>base[winner]
    if (losses[winner]==-1)!=expected or losses[loser]==-1:
        raise ValueError("Inconsistent overwhelming sentinel")
    return {
        "winner":winner,"overwhelming":expected,
        "power_delta_after_floor":delta,
        "winner_base_power":base[winner],
        "strict_threshold":True,"marker_expected":expected,
        "source_policy":"jactari-overwhelming-v1",
        "persistent_casualties_applied":False,
    }
