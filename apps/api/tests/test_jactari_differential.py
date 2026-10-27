"""Python-vs-JavaScript differential; JS is still the historical reference."""
import json
import math
import random
import shutil
import subprocess
from pathlib import Path

import pytest

from jactari import resolve_stack_duel

ROOT = Path(__file__).resolve().parents[3]
ORACLE = ROOT / "tools" / "jactari-port" / "python-duel-oracle.mjs"
MODIFIERS = (
    "attackStackHero", "attackUnitsHero", "attackWeapon", "attackSpecial",
    "defendStackHero", "defendUnitsHero", "defendWeapon", "defendSpecial",
    "defendFortification",
)


def _cases():
    rng = random.Random(20261027)
    powers = [0.1, 0.25, 1, 1.125, 2.5, 3.33, 10, 17, 100, 500.5]
    cases = [
        {"attacker": {"count": 100, "unitPower": 10},
         "defender": {"count": 50, "unitPower": 10}},
        {"attacker": {"count": 50, "unitPower": 10},
         "defender": {"count": 100, "unitPower": 10}},
        {"attacker": {"count": 100, "unitPower": 10},
         "defender": {"count": 100, "unitPower": 10}},
    ]
    for _ in range(400):
        a, d = rng.randint(1, 400), rng.randint(1, 400)
        pa, pd = rng.choice(powers), rng.choice(powers)
        modifiers = {
            key: rng.choice([0, 0, -0.3, -0.1, 0.05, 0.1, 0.25, 0.5])
            for key in MODIFIERS
        }
        # Test no-modifier, single-modifier, and combined-modifier branches.
        if rng.random() < 0.20:
            modifiers = {}
        cases.append({
            "attacker": {"count": a, "unitPower": pa},
            "defender": {"count": d, "unitPower": pd},
            "modifiers": modifiers,
        })
    return cases


def _assert_equivalent(actual, expected, location="root"):
    assert type(actual) is type(expected) or (
        type(actual) in (float, int) and type(expected) in (float, int)
    ), f"{location}: unexpected types"
    if isinstance(expected, dict):
        assert set(actual) == set(expected), location
        for k in expected:
            _assert_equivalent(actual[k], expected[k], f"{location}.{k}")
    elif isinstance(expected, (int, float)) and not isinstance(expected, bool):
        assert math.isclose(actual, expected, rel_tol=1e-13, abs_tol=1e-9), (
            location, expected, actual
        )
    else:
        assert actual == expected, (location, expected, actual)


def test_403_deterministic_duels_against_js_core():
    assert shutil.which("node"), "Node.js 22 required for the historical oracle"
    cases = _cases()
    run = subprocess.run(
        ["node", str(ORACLE)],
        input=json.dumps(cases), text=True, capture_output=True,
        check=True, timeout=20,
    )
    reference = json.loads(run.stdout)
    assert len(reference) == len(cases) == 403
    for index, (case, original) in enumerate(zip(cases, reference)):
        result = resolve_stack_duel(case)
        _assert_equivalent(result, original, f"case[{index}]")


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"attacker": {"count": 0, "unitPower": 10},
         "defender": {"count": 1, "unitPower": 10}},
        {"attacker": {"count": True, "unitPower": 10},
         "defender": {"count": 1, "unitPower": 10}},
        {"attacker": {"count": 1, "unitPower": float("nan")},
         "defender": {"count": 1, "unitPower": 10}},
        {"attacker": {"count": 2**53, "unitPower": 10},
         "defender": {"count": 1, "unitPower": 10}},
    ],
)
def test_reject_invalid_stacks(payload):
    with pytest.raises(ValueError):
        resolve_stack_duel(payload)
