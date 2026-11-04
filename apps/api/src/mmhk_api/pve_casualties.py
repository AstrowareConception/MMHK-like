"""Jactari ordinary-hero durable casualty formula (US-COM-014 slice).

This pure function covers the STANDARD with-hero case only. It MUST NOT be
called as a complete PvE settlement operation: NPC defenders, summons,
resurrections, loss reductions, and special campaign effects need their
separate verified branches. No database state is mutated here.
"""
from __future__ import annotations

from decimal import Decimal, ROUND_DOWN

BASE_FACTOR = Decimal("0.30")


class UnsupportedCasualtyProfile(ValueError):
    pass


def ordinary_hero_permanent_losses(
    dispersed: int, *,
    loss_factor: Decimal = BASE_FACTOR,
    with_hero: bool = True,
    ordinary_units: bool = True,
    modifiers_verified: bool = False,
) -> dict:
    """Convert ordinary-unit dispersions to durable deaths with a trace.

    The factor is the versioned historical code baseline (0.30). Nondefault
    factors are accepted only when callers attest verified modifiers; using
    them without that explicit qualification fails closed.
    """
    if type(dispersed) is not int or dispersed < 0 or dispersed > 1_000_000_000:
        raise ValueError("Dispersed unit count must be a nonnegative integer")
    if type(with_hero) is not bool or type(ordinary_units) is not bool:
        raise ValueError("Casualty profile flags must be boolean")
    if not with_hero or not ordinary_units:
        raise UnsupportedCasualtyProfile("Special casualty branch not qualified")
    if not isinstance(loss_factor, Decimal) or not loss_factor.is_finite():
        raise ValueError("Loss factor must be a finite Decimal")
    if not Decimal("0") <= loss_factor <= Decimal("1"):
        raise ValueError("Loss factor outside the supported bound")
    if loss_factor != BASE_FACTOR and modifiers_verified is not True:
        raise UnsupportedCasualtyProfile("Unverified casualty modifier")

    raw = Decimal(dispersed) * loss_factor
    if dispersed == 0 or raw == 0:
        deaths = 0
    elif 0 < raw < 1:
        deaths = 1
    else:
        deaths = int(raw.to_integral_value(rounding=ROUND_DOWN))
    return {
        "dispersed":dispersed,
        "factor":str(loss_factor),
        "unrounded":str(raw),
        "permanent_deaths":deaths,
        "nonfatal_dispersions":dispersed-deaths,
        "policy_id":"jactari-ordinary-hero-0.30-v1",
        "special_branches_excluded":True,
        "effects_applied":False,
    }
