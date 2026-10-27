"""One-shot urban construction worker; explicitly scheduled by operator only."""
from __future__ import annotations
import argparse
import json
from .db import connect
from .construction import run_construction_batch

def main():
    parser=argparse.ArgumentParser(description="MMHK-like urban construction worker")
    parser.add_argument("--once",action="store_true")
    parser.add_argument("--max-orders",type=int,default=25)
    args=parser.parse_args()
    if not args.once:
        parser.error("--once is required; no autonomous worker is installed")
    with connect() as db:
        db.commit()
        db.autocommit=True
        events=run_construction_batch(db,max_orders=args.max_orders)
    print(json.dumps({"processed":len(events),"events":events,
                      "historically_certified":False},ensure_ascii=False))

if __name__=="__main__":
    main()
