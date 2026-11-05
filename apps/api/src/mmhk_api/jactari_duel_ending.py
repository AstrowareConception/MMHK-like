"""Classify exact Jactari duel endings without inventing a random tie-break.

US-COM-010 / US-COM-013. The JS oracle has three distinct outcomes when
both stacks finish at zero: an ordinary draw, attacker falseDraw=+1 and
defender falseDraw=-1. In a false draw, the nominal winner is NOT marked
dispersed by Jactari even though its remaining count is zero.

Keep both facts: the *winner marker* and the *empty combat line*. An empty
stack cannot fight again. This does not settle permanent deaths or prizes.
"""
from __future__ import annotations


def classify_jactari_exchange(outcome: dict) -> dict:
    if type(outcome) is not dict:
        raise ValueError("Jactari exchange must be a mapping")
    remaining=outcome.get("remaining")
    flags=outcome.get("dispersed")
    losses=outcome.get("losses")
    if any(type(x) is not dict for x in (remaining,flags,losses)):
        raise ValueError("Missing Jactari count/dispersion details")
    for side in ("attacker","defender"):
        if (type(remaining.get(side)) is not int or remaining[side]<0 or
            type(flags.get(side)) is not bool or
            type(losses.get(side)) is not int or losses[side]<-1):
            raise ValueError("Invalid Jactari count, sentinel or dispersion")
        if flags[side] and remaining[side]!=0:
            raise ValueError("Dispersed stack cannot still be active")
    draw=outcome.get("draw")
    false_draw=outcome.get("falseDraw")
    if type(draw) is not bool or type(false_draw) is not int or false_draw not in (-1,0,1):
        raise ValueError("Invalid Jactari equality flags")
    ra,rd=remaining["attacker"],remaining["defender"]
    da,dd=flags["attacker"],flags["defender"]
    if false_draw:
        if (draw or ra!=0 or rd!=0 or
            (false_draw==1 and (da or not dd)) or
            (false_draw==-1 and (not da or dd))):
            raise ValueError("Inconsistent Jactari false draw")
        verdict="attacker" if false_draw==1 else "defender"
        kind="false_draw"
    elif draw:
        if ra!=0 or rd!=0 or not (da and dd):
            raise ValueError("Inconsistent Jactari true draw")
        verdict="draw"
        kind="true_draw"
    else:
        if da and not dd and rd>0:
            verdict="defender"
        elif dd and not da and ra>0:
            verdict="attacker"
        else:
            raise ValueError("Unrecognized or nonterminal Jactari duel ending")
        kind="ordinary"
    return {
        "kind":kind,"verdict":verdict,
        "false_draw_marker":false_draw,
        "remaining":{"attacker":ra,"defender":rd},
        "dispersed":{"attacker":da,"defender":dd},
        "removed_from_line":{
            "attacker":da or ra==0,
            "defender":dd or rd==0,
        },
        "exhausted_without_dispersion":{
            "attacker":ra==0 and not da,
            "defender":rd==0 and not dd,
        },
        "theoretical_dispersions":{
            "attacker":0 if losses["attacker"]==-1 else losses["attacker"],
            "defender":0 if losses["defender"]==-1 else losses["defender"],
        },
        "overwhelming_sentinel":{
            "attacker":losses["attacker"]==-1,
            "defender":losses["defender"]==-1,
        },
        "permanent_deaths_applied":False,
        "profile":"jactari-duel-ending-v1",
        "historically_certified_s2":False,
    }
