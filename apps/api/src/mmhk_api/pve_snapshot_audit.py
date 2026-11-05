"""Read-only operator audit of outstanding PvE mission snapshots (V100)."""
from __future__ import annotations

import psycopg

from .pve_encounter_snapshot import validate_defender_snapshot


def audit_active_pve_snapshots(db:psycopg.Connection,*,limit:int=200)->dict:
    if type(limit) is not int or not 1<=limit<=500:
        raise ValueError("PvE audit limit must be between 1 and 500")
    rows=db.execute(
        """SELECT mission_id,stage,defender_snapshot
           FROM pve_missions WHERE stage<>'completed'
           ORDER BY started_at,mission_id LIMIT %s""",
        (limit+1,),
    ).fetchall()
    counts={"frozen":0,"legacy_unsnapshotted":0,"corrupt":0}
    findings=[]
    for mid,stage,snapshot in rows[:limit]:
        if snapshot is None:
            counts["legacy_unsnapshotted"]+=1
            findings.append({"mission_id":str(mid),"stage":stage,
                             "issue":"legacy_unsnapshotted"})
        else:
            try:
                validate_defender_snapshot(snapshot)
            except ValueError:
                counts["corrupt"]+=1
                findings.append({"mission_id":str(mid),"stage":stage,
                                 "issue":"invalid_frozen_snapshot"})
            else:
                counts["frozen"]+=1
    return {
        "inspected":min(len(rows),limit),
        "truncated":len(rows)>limit,
        "counts":counts,
        "findings":findings,
        "read_only":True,
    }
