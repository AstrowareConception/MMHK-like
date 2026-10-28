"""One-shot LOCAL sandbox provisioning. No HTTP route, no fixed credentials.

Intentionally fictitious values! Nothing here represents certified season 2
prices, rates, cities or terrain. This command is restricted to the
mmhk_local PostgreSQL database and requires explicit local enablement.
"""
from __future__ import annotations

import argparse
import os
import secrets
from uuid import UUID

import psycopg

from .building_effects import configure_effect_profile
from .construction import configure_building_profile
from .db import connect
from .economy import configure_haven_mines
from .security import USERNAME, create_account
from .worlds import seed_first_haven_city

_WORLD = "local-sandbox"
_PRICES = ("gold", "wood", "ore", "crystal", "gems", "sulfur", "mercury")


def _costs(*, gold: int = 0, wood: int = 0, ore: int = 0) -> dict[str, int]:
    values = {"gold": gold, "wood": wood, "ore": ore}
    return {kind: values.get(kind, 0) for kind in _PRICES}


def seed_local_demo(db: psycopg.Connection, *, username: str, password: str) -> UUID:
    """All-or-nothing sandbox seed. Never available from the player-facing API."""
    if not USERNAME.fullmatch(username):
        raise ValueError("Username must be 3..32 lowercase letters, digits or underscore")
    # Explicitly prevent accidental repopulation or overriding of user data.
    if db.execute("SELECT 1 FROM worlds WHERE world_id=%s", (_WORLD,)).fetchone():
        raise ValueError("The local demo world already exists; no existing data was modified")

    with db.transaction():
        account_id = create_account(db, username, password)
        city_id = seed_first_haven_city(
            db, world_id=_WORLD, world_name="Royaume de démonstration",
            size=100, account_id=account_id,
            city_name="Premier Havre", x=17, y=23,
            # EXPLICIT synthetic starting stocks, not MMHK history.
            amounts={"gold": 120, "wood": 90, "ore": 70, "crystal": 30},
        )
        configure_haven_mines(
            db, city_id=city_id, tick_seconds=60,
            rates_per_day={
                "gold": "1440", "wood": "720",
                "ore": "720", "crystal": "360",
            },
            capacities={kind: 1000 for kind in ("gold", "wood", "ore", "crystal")},
        )
        profiles = [
            ("village_hall", 1, 45, _costs(gold=10, wood=5, ore=2),
             {}, {"gold": "0.10"}, {}),
            ("village_hall", 2, 60, _costs(gold=20, wood=10, ore=5),
             {}, {"gold": "0.20"}, {}),
            ("marketplace", 1, 60, _costs(gold=15, wood=10, ore=3),
             {"village_hall": 1}, {"wood": "0.15"}, {}),
            ("resource_silo", 1, 90, _costs(gold=20, wood=15, ore=5),
             {"marketplace": 1}, {}, {"gold": 200, "wood": 200}),
        ]
        for code, level, seconds, costs, prerequisite, bonuses, capacities in profiles:
            configure_building_profile(
                db, building_code=code, target_level=level,
                policy_id="LOCAL-SANDBOX-NOT-HISTORICAL",
                base_seconds=seconds, base_costs=costs,
            )
            configure_effect_profile(
                db, building_code=code, target_level=level,
                policy_id="LOCAL-SANDBOX-NOT-HISTORICAL",
                prerequisites=prerequisite,
                mine_additive_bonus=bonuses,
                capacity_bonus=capacities,
            )
    return city_id


def main() -> None:
    parser = argparse.ArgumentParser(description="One-time local MMHK-like sandbox")
    parser.add_argument("--username", default="joueurdemo")
    args = parser.parse_args()
    if (os.environ.get("MMHK_LOCAL_DEMO_ENABLED") != "true" or
        os.environ.get("PGDATABASE") != "mmhk_local"):
        parser.error("Refusing to seed outside the explicit local sandbox")
    password = secrets.token_urlsafe(24)
    with connect() as db:
        city = seed_local_demo(db, username=args.username, password=password)
    # Print only after successful COMMIT. No default password in Git or Docker.
    print("\nLOCAL EXPERIMENTAL SANDBOX CREATED — NOT MMHK HISTORICAL VALUES")
    print("URL: http://localhost:3000")
    print("Username:", args.username)
    print("One-time generated password:", password)
    print("City:", city)
    print("World: local-sandbox")
    print("Save the password now; it is not shown again. Avoid sharing terminal logs.")
    print("You may now construct village_hall, marketplace, and resource_silo.")
    print("All rates, construction times and stocks are synthetic lab fixtures.\n")


if __name__ == "__main__":
    main()
