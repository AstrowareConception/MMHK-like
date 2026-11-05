"""Read-only PvE snapshot audit reports active legacy and corrupted rows."""
from uuid import uuid4

import pytest

from mmhk_api.pve_encounter_snapshot import POLICY_ID
from mmhk_api.pve_snapshot_audit import audit_active_pve_snapshots


class DB:
    def __init__(self,rows):
        self.rows=rows
        self.calls=[]
    def execute(self,sql,params):
        self.calls.append((sql,params))
        return self
    def fetchall(self):
        return self.rows


def test_audit_distinguishes_frozen_legacy_and_corrupt_without_writes():
    valid={
        "policy_id":POLICY_ID,"unit_code":"wolves",
        "unit_count":10,"unit_power":5,
        "source_ref":"LAB-AUDIT",
    }
    db=DB([
        (uuid4(),"outbound",valid),
        (uuid4(),"returning",None),
        (uuid4(),"outbound",{**valid,"unit_count":0}),
    ])
    report=audit_active_pve_snapshots(db)
    assert report["inspected"]==3
    assert report["counts"]=={
        "frozen":1,"legacy_unsnapshotted":1,"corrupt":1,
    }
    assert len(report["findings"])==2
    assert report["read_only"] is True
    assert len(db.calls)==1
    assert db.calls[0][0].strip().startswith("SELECT")


def test_limited_read_only_audit_reports_truncation():
    db=DB([(uuid4(),"outbound",None)]*3)
    result=audit_active_pve_snapshots(db,limit=2)
    assert result["truncated"] is True
    assert result["inspected"]==2
    assert db.calls[0][1]==(3,)


@pytest.mark.parametrize("bad",[0,-1,501,True,1.5])
def test_invalid_limit_rejected_before_query(bad):
    db=DB([])
    with pytest.raises(ValueError):
        audit_active_pve_snapshots(db,limit=bad)
    assert db.calls==[]
