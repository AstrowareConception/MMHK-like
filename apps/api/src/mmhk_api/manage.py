"""Operator-only provisioning for the first account, world and first Haven city.

Never expose these commands through FastAPI. No public self-signup or world
spawn. Production password provisioning should move to a secrets service.
"""
from __future__ import annotations

import argparse
import getpass
import json

from .db import connect, migrate
from .login_limits import prune_login_history
from .economy import configure_haven_mines
from .construction import configure_building_profile
from .building_effects import configure_effect_profile, set_building_operational
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
    benefits = sub.add_parser(
        "create-building-effects", help="Operator-only explicit building effects; insert-only",
    )
    benefits.add_argument("--code",required=True)
    benefits.add_argument("--level",required=True,type=int)
    benefits.add_argument("--policy-id",required=True)
    benefits.add_argument("--prerequisites",default="{}",
                          help='JSON mapping of building IDs to required levels')
    benefits.add_argument("--mine-bonuses",default="{}",
                          help='JSON decimal additive mine bonuses')
    benefits.add_argument("--capacity-bonuses",default="{}",
                          help='JSON integer additional storage capacities')
    switch = sub.add_parser(
        "set-building-operational", help="Operator-only suspension or reactivation",
    )
    switch.add_argument("--city-id",type=UUID,required=True)
    switch.add_argument("--code",required=True)
    switch.add_argument("--enabled",choices=("yes","no"),required=True)
    prune = sub.add_parser(
        "prune-auth-history",
        help="Delete expired authentication buckets and old anonymous events",
    )
    prune.add_argument("--retention-days", type=int, default=30)
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
        elif args.command == "prune-auth-history":
            buckets, events = prune_login_history(
                db, retention_days=args.retention_days,
            )
            print(f"Pruned {buckets} expired login buckets and {events} old audit events")
        elif args.command=="create-building-effects":
            configure_effect_profile(
                db,building_code=args.code,target_level=args.level,
                policy_id=args.policy_id,
                prerequisites=json.loads(args.prerequisites),
                mine_additive_bonus=json.loads(args.mine_bonuses),
                capacity_bonus=json.loads(args.capacity_bonuses),
            )
            print(f"Configured explicit effects {args.code} level {args.level}")
        elif args.command=="set-building-operational":
            state=set_building_operational(
                db,city_id=args.city_id,building_code=args.code,
                enabled=args.enabled=="yes",
            )
            print(json.dumps(state,ensure_ascii=False))


if __name__ == "__main__":
    main()
