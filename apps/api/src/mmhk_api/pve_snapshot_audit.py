"""Read-only operator audit of outstanding PvE mission snapshots (V100)."""
from __future__ import annotations

import psycopg

from .pve_encounter_snapshot import validate_defender_snapshot
from .pve_ordinary_line_snapshot import validate_ordinary_line_snapshot


def audit_active_pve_snapshots(db:psycopg.Connection,*,limit:int=200)->dict:
    if type(limit) is not int or not 1<=limit<=500:
        raise ValueError("PvE audit limit must be between 1 and 500")
    rows=db.execute(
        """SELECT mission_id,stage,defender_snapshot
                 ,ordinary_line_snapshot
           FROM pve_missions WHERE stage<>'completed'
           ORDER BY started_at,mission_id LIMIT %s""",
        (limit+1,),
    ).fetchall()
    counts={"frozen":0,"legacy_unsnapshotted":0,"corrupt":0}
    ordinary_lines={"frozen":0,"not_available":0,"corrupt":0}
    findings=[]
    for mid,stage,snapshot,ordinary in rows[:limit]:
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
                if ordinary is None:
                    counts["frozen"]+=1
                    ordinary_lines["not_available"]+=1
                else:
                    try:
                        validate_ordinary_line_snapshot(ordinary,snapshot)
                    except ValueError:
                        counts["corrupt"]+=1
                        ordinary_lines["corrupt"]+=1
                        findings.append({"mission_id":str(mid),"stage":stage,
                                         "issue":"invalid_frozen_ordinary_line"})
                    else:
                        counts["frozen"]+=1
                        ordinary_lines["frozen"]+=1
    return {
        "inspected":min(len(rows),limit),
        "truncated":len(rows)>limit,
        "counts":counts,
        "ordinary_lines":ordinary_lines,
        "findings":findings,
        "read_only":True,
    }
