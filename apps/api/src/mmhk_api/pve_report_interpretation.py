"""Interpret Jactari single-stack outputs without inventing persistent casualties.

US-COM-017 candidate: combat report semantics. The historical -1 sentinel
means an overwhelming victory without the corresponding losses, not -1
dead soldiers. False draws are kept explicit and never treated as loot rights.
"""
from __future__ import annotations

from .pve_casualties import ordinary_hero_permanent_losses
from .jactari_duel_ending import classify_jactari_exchange
from .jactari_overwhelming import explain_overwhelming


def interpret_duel(outcome: dict) -> dict:
    if not isinstance(outcome,dict):
        raise ValueError("Invalid duel outcome")
    losses=outcome.get("losses")
    remaining=outcome.get("remaining")
    dispersed=outcome.get("dispersed")
    if not isinstance(losses,dict) or not isinstance(remaining,dict) or not isinstance(dispersed,dict):
        raise ValueError("Incomplete Jactari outcome")
    la,ld=losses.get("attacker"),losses.get("defender")
    ra,rd=remaining.get("attacker"),remaining.get("defender")
    if any(type(v) is not int for v in (la,ld,ra,rd)):
        raise ValueError("Invalid numeric duel values")
    if min(la,ld)<-1 or min(ra,rd)<0:
        raise ValueError("Invalid duel sentinel or remaining count")
    attacker_disperse=dispersed.get("attacker")
    defender_disperse=dispersed.get("defender")
    if type(attacker_disperse) is not bool or type(defender_disperse) is not bool:
        raise ValueError("Invalid dispersion flag")
    draw=outcome.get("draw")
    if type(draw) is not bool:
        raise ValueError("Invalid draw flag")
    # Jactari's falseDraw=+1/-1 is a deliberate tiebreak,
    # NOT a failed duel and NOT necessarily a true mutual draw.
    ending=classify_jactari_exchange(outcome)
    verdict=ending["verdict"]
    return {
        "verdict":verdict,
        "false_draw":ending["false_draw_marker"],
        "ending":ending,
        "overwhelming":explain_overwhelming(outcome)
          if "basePower" in outcome and "totalPower" in outcome else None,
        "attacker": {
            "simulated_losses":0 if la==-1 else la,
            "overwhelming_victory":la==-1,
            "remaining":ra,
            "dispersed":attacker_disperse,
        },
        "defender":{
            "simulated_losses":0 if ld==-1 else ld,
            "overwhelming_victory":ld==-1,
            "remaining":rd,
            "dispersed":defender_disperse,
        },
        # Only the attacking ordinary hero stack has a qualified baseline.
        # This is a conditional PREVIEW, never applied to hero_army_units.
        "ordinary_attacker_loss_projection":ordinary_hero_permanent_losses(
            0 if la==-1 else la,
        ),
        "persistent_effects_applied":False,
        "terrain_liberated":False,
        "xp_awarded":False,
        "loot_awarded":False,
        "model":"Jactari single-stack laboratory",
    }
