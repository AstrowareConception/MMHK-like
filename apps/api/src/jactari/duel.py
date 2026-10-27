"""Bounded, DOM-free Jactari single-stack duel Python port.

Source: tools/jactari-port/core.mjs, ultimately derived from historical
Jactari simulation_combat. SPDX-License-Identifier: GPL-3.0-or-later.

Experimental only: historical equivalence for every battle is NOT certified.
The original JavaScript module is retained as a differential test oracle.
"""
from __future__ import annotations

from math import floor, isfinite
from typing import Any, Mapping

_SAFE_INTEGER = 2**53 - 1
_KEYS = (
    "attackStackHero", "attackUnitsHero", "attackWeapon", "attackSpecial",
    "defendStackHero", "defendUnitsHero", "defendWeapon", "defendSpecial",
    "defendFortification",
)
_NOTE = (
    "Jactari -1 loss sentinel means overwhelming victory; "
    "do not interpret as negative casualties"
)


def _js_number(value: object, label: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"Invalid {label}")
    result = float(value)
    if not isfinite(result):
        raise ValueError(f"Nonfinite {label}")
    return result


def _stack(value: Mapping[str, Any] | None, label: str) -> tuple[int, float]:
    if not isinstance(value, dict):
        raise ValueError(f"Invalid {label}")
    count = value.get("count")
    if isinstance(count, bool) or not isinstance(count, int):
        raise ValueError(f"Invalid {label} count")
    if not (0 < count <= _SAFE_INTEGER):
        raise ValueError(f"Invalid {label} count")
    power = _js_number(value.get("unitPower"), f"{label} unit power")
    if power <= 0:
        raise ValueError(f"Invalid {label} unit power")
    return count, power


def _floor(value: float) -> int:
    if not isfinite(value):
        raise ValueError("Unrepresentable intermediate Jactari power")
    return floor(value)


def resolve_stack_duel(request: Mapping[str, Any]) -> dict[str, Any]:
    """Match the bounded JS resolveStackDuel arithmetic and object contract.

    JS Number semantics use IEEE 754 doubles even for integer arithmetic;
    cast inputs to float before computation, preserve the nested floor calls
    and the historical -1 'overwhelming victory' sentinel.
    """
    if not isinstance(request, dict):
        raise ValueError("Invalid duel request")
    ac, ap = _stack(request.get("attacker"), "attacker")
    dc, dp = _stack(request.get("defender"), "defender")
    raw = request.get("modifiers") or {}
    if not isinstance(raw, dict):
        raise ValueError("Invalid modifiers")
    bonus = {
        key: _js_number(raw.get(key, 0) if raw.get(key) is not None else 0,
                        f"modifier {key}")
        for key in _KEYS
    }
    ba = float(ac) * ap
    bd = float(dc) * dp
    xa = ba * (
        bonus["attackStackHero"] + bonus["attackWeapon"] +
        bonus["attackSpecial"]
    ) + float(ac) * bonus["attackUnitsHero"]
    xd = bd * (
        bonus["defendStackHero"] + bonus["defendWeapon"] +
        bonus["defendSpecial"] + bonus["defendFortification"]
    ) + float(dc) * bonus["defendUnitsHero"]
    pa, pd = ba + xa, bd + xd
    if not all(isfinite(v) for v in (ba, bd, xa, xd, pa, pd)):
        raise ValueError("Nonfinite intermediate Jactari power")

    la: int
    ld: int
    ra, rd = ac, dc
    da = dd = draw = False
    false_draw = 0
    if pa > pd:
        ld, rd, dd = dc, 0, True
        delta = _floor(pa) - _floor(pd)
        if delta > ba:
            la = -1
        else:
            la = _floor((_floor(pd) - _floor(xa)) / ap)
            ra -= la
            if ra == 0:
                false_draw = 1
    else:
        la, ra, da = ac, 0, True
        delta = _floor(pd) - _floor(pa)
        if delta > bd:
            ld = -1
        else:
            ld = _floor((_floor(pa) - _floor(xd)) / dp)
            if delta > 0:
                rd -= ld
                if rd == 0:
                    false_draw = -1
            else:
                ld, rd, dd, draw = dc, 0, True, True

    return {
        "basePower": {"attacker": ba, "defender": bd},
        "bonusPower": {"attacker": xa, "defender": xd},
        "totalPower": {"attacker": pa, "defender": pd},
        "losses": {"attacker": la, "defender": ld},
        "remaining": {"attacker": ra, "defender": rd},
        "dispersed": {"attacker": da, "defender": dd},
        "draw": draw,
        "falseDraw": false_draw,
        "scope": "single-stack-only",
        "note": _NOTE,
    }
