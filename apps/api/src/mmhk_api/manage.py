"""Operator-only provisioning for the first account, world and first Haven city.

Never expose these commands through FastAPI. No public self-signup or world
spawn. Production password provisioning should move to a secrets service.
"""
from __future__ import annotations

import argparse
import getpass

from .db import connect, migrate
from .economy import configure_haven_mines
from .construction import configure_building_profile
from uuid import UUID
from .security import create_account, USERNAME
from .worlds import seed_first_haven_city


def main() -> None:
    parser = argparse.ArgumentParser(description="MMHK-like trusted maintenance")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("migrate", help="Create or update database schema under maintenance")
    account = sub.add_parser("create-account", help="Create an account via interactive prompt")
    account.add_argument("--username", required=True)
    world = sub.add_parser("create-haven-world", help="Provision a first Haven city (no economy)")
    world.add_argument("--username", required=True)
    world.add_argument("--world-id", required=True)
    world.add_argument("--world-name", required=True)
    world.add_argument("--size", type=int, required=True)
    world.add_argument("--city-name", required=True)
    world.add_argument("--x", type=int, required=True)
    world.add_argument("--y", type=int, required=True)
    economic = sub.add_parser(
        "configure-haven-economy",
        help="Activate explicitly supplied mine rates and capacity; not historic defaults",
    )
    economic.add_argument("--city-id", type=UUID, required=True)
    economic.add_argument("--tick-seconds", type=int, required=True)
    economic.add_argument("--capacity", type=int, required=True)
    for resource in ("gold", "wood", "ore", "crystal"):
        economic.add_argument(f"--rate-{resource}", required=True)
    building = sub.add_parser(
        "create-building-profile",
        help="Operator-only experimental urban price/time profile",
    )
    building.add_argument("--code",required=True)
    building.add_argument("--level",required=True,type=int)
    building.add_argument("--policy-id",required=True)
    building.add_argument("--duration-seconds",required=True,type=int)
    for resource in ("gold","wood","ore","crystal","gems","sulfur","mercury"):
        building.add_argument(f"--cost-{resource}",required=True,type=int)
    args = parser.parse_args()

    with connect() as db:
        if args.command == "migrate":
            applied = migrate(db)
            print("Applied schema revisions:", applied or "already current")
        elif args.command == "create-account":
            if not USERNAME.fullmatch(args.username):
                parser.error("username must be 3..32 lowercase letters, digits or underscore")
            password = getpass.getpass("New password (12-128 chars): ")
            confirm = getpass.getpass("Confirm password: ")
            if password != confirm:
                parser.error("passwords do not match")
            account_id = create_account(db, args.username, password)
            print(f"Created account {args.username} ({account_id})")
        elif args.command == "create-haven-world":
            row = db.execute(
                "SELECT account_id FROM accounts WHERE username=%s",
                (args.username,),
            ).fetchone()
            if row is None:
                parser.error("unknown account; create account first")
            city_id = seed_first_haven_city(
                db, world_id=args.world_id, world_name=args.world_name,
                size=args.size, account_id=row[0],
                city_name=args.city_name, x=args.x, y=args.y,
                amounts={},  # zero is explicit; never invent starter capital
            )
            print(f"Created world {args.world_id}, first Haven city {city_id}")
        elif args.command == "configure-haven-economy":
            configure_haven_mines(
                db, city_id=args.city_id,
                rates_per_day={
                    r: getattr(args, f"rate_{r}")
                    for r in ("gold", "wood", "ore", "crystal")
                },
                capacities={
                    r: args.capacity for r in ("gold", "wood", "ore", "crystal")
                },
                tick_seconds=args.tick_seconds,
            )
            print(f"Configured first Haven city {args.city_id} with explicit experimental rates")
        elif args.command=="create-building-profile":
            configure_building_profile(
                db,building_code=args.code,target_level=args.level,
                policy_id=args.policy_id,base_seconds=args.duration_seconds,
                base_costs={
                    resource:getattr(args,f"cost_{resource}")
                    for resource in ("gold","wood","ore","crystal","gems","sulfur","mercury")
                },
            )
            print(f"Created experimental building profile {args.code} level {args.level}")


if __name__ == "__main__":
    main()
