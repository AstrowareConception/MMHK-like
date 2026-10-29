"""Four-day map influence: real PostgreSQL isolation, snapshot repeat, rival privacy.

Lab data is operator-supplied; no historical S2 power formula assumed.
"""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import UTC,date,datetime,timedelta
from uuid import uuid4
import psycopg
import pytest

from test_map_navigation_integration import map_fixture,_headers,client,URL
from mmhk_api.dynamic_influence import (
    LAB_POLICY,calculate_cells,configure_influence,
    record_daily_domination,run_influence_batch,radius,
)
from mmhk_api.world_intel import record_influence,reveal_influence
from mmhk_api.colonization import (
    configure_colonization_policy,configure_colony_site,quote_colony,
    ColonizationConflict,
)
from mmhk_api.worlds import RESOURCE_NAMES

pytestmark=pytest.mark.skipif(not URL,reason="PostgreSQL required")


def _now():
    return datetime.now(UTC).replace(microsecond=0)


def _record(db,f,*,cid,owner,power=30000,days=4,at=None,build=0):
    today=(at or _now()).date()
    for n in range(1,days+1):
        record_daily_domination(
            db,world_id=f["world"],city_id=cid,owner=owner,
            day=today-timedelta(days=n),military_power=power,
            building_domination=build,source_ref="LAB-POWER-SNAPSHOT-TEST",
        )


def _run(at):
    with psycopg.connect(URL,autocommit=True) as db:
        return run_influence_batch(db,now_at=at)


def test_four_day_thresholds_and_toroidal_contested_ties():
    assert [radius(v) for v in (0,29999,30000,99999,100000,249999,250000,
      499999,500000,999999,1000000)]==[1,1,2,2,3,3,4,4,5,5,6]
    a,b=uuid4(),uuid4()
    model=[
        {"city_id":uuid4(),"owner":a,"x":2,"y":1,"power":1000000},
        {"city_id":uuid4(),"owner":b,"x":6,"y":1,"power":1000000},
    ]
    cells=calculate_cells(model,50)
    assert cells[(4,1)][1]=="contested"
    assert cells[(2,1)][0]==a and cells[(6,1)][0]==b
    assert cells[(1,1)][0]==a
    # Tiny torus may repeat the same coordinates within a six-cell radius:
    # a single city must not artificially multiply its own score.
    one=calculate_cells([model[0]],2)
    assert set(one)=={(1,1),(1,2),(2,1),(2,2)}
    assert one[(2,1)][2]==1000000


def test_opt_in_worker_projection_private_world_and_recalculation(map_fixture):
    f=map_fixture
    owner_h=_headers(f["owner_name"],"strong-owner-map-password")
    foreign_h=_headers(f["foreign_name"],"strong-foreign-map-password")
    now=_now()
    with psycopg.connect(URL) as db:
        configure_influence(db,world_id=f["world"],next_refresh_at=now)
        _record(db,f,cid=f["city"],owner=f["owner"],at=now,power=30000)
        _record(db,f,cid=f["enemy_city"],owner=f["foreign"],at=now,power=30000)
        # An existing operator-qualified map row must never be overwritten.
        record_influence(db,world_id=f["world"],x=34,y=40,controller=f["owner"],
                         source_ref="PRESERVE-OPERATOR-REFERENCE")
    try:
        assert client.get("/api/v1/me/worlds/"+f["world"]+"/influence").status_code==401
        assert client.get("/api/v1/me/worlds/"+f["world"]+"/influence",
                          headers=owner_h).json()["revision"]==0
        with psycopg.connect(URL,autocommit=True) as db:
            assert run_influence_batch(db,now_at=now-timedelta(seconds=1))==[]
            first=run_influence_batch(db,now_at=now)
            assert len(first)==1 and first[0]["revision"]==1
            assert run_influence_batch(db,now_at=now)==[]
            manual=db.execute(
                """SELECT source_ref,controller_account_id
                   FROM map_influence_cells WHERE world_id=%s AND x=34 AND y=40""",
                (f["world"],),
            ).fetchone()
            assert manual==("PRESERVE-OPERATOR-REFERENCE",f["owner"])
            assert db.execute(
                "SELECT count(*) FROM world_influence_runs WHERE world_id=%s",
                (f["world"],),
            ).fetchone()[0]==1
        summary=client.get("/api/v1/me/worlds/"+f["world"]+"/influence",headers=owner_h)
        assert summary.status_code==200,summary.text
        assert summary.json()["lookback_days"]==4
        assert summary.json()["cities"][0]["radius"]==2
        assert summary.json()["cities"][0]["military_average"]=="30000"
        assert summary.json()["historically_certified_s2"] is False
        view=client.get("/api/v1/me/worlds/"+f["world"]+"/overview",headers=owner_h)
        assert view.status_code==200
        data=view.json()
        assert data["influence_mode"]=="experimental_dynamic"
        assert data["influence_revision"]==1
        assert data["visible_influence"]
        assert all(c["is_mine"] for c in data["visible_influence"])
        # The opponent can only inspect its own calculated cells.
        enemy=client.get("/api/v1/me/worlds/"+f["world"]+"/overview",
                         headers=foreign_h).json()
        assert all(c["is_mine"] for c in enemy["visible_influence"])
        assert client.get("/api/v1/me/worlds/"+f["otherworld"]+"/influence",
                          headers=owner_h).status_code==404
        # Disable the profile then the old authoritative manually recorded
        # information becomes visible again, without loss or mutation.
        with psycopg.connect(URL) as db:
            db.execute("UPDATE world_influence_policies SET enabled=false WHERE world_id=%s",
                       (f["world"],))
        reverted=client.get("/api/v1/me/worlds/"+f["world"]+"/overview",
                            headers=owner_h).json()
        assert reverted["influence_mode"]=="qualified_manual"
        assert any(cell["x"]==34 for cell in reverted["visible_influence"])
    finally:
        with psycopg.connect(URL) as db:
            db.execute("DELETE FROM map_influence_cells WHERE world_id=%s",(f["world"],))


def test_one_day_sample_missing_days_zero_filled_and_owner_not_transferred(map_fixture):
    f=map_fixture;now=_now()
    with psycopg.connect(URL) as db:
        configure_influence(db,world_id=f["world"],next_refresh_at=now)
        _record(db,f,cid=f["city"],owner=f["owner"],days=1,power=1000000,at=now)
        with pytest.raises(psycopg.errors.UniqueViolation):
            with db.transaction():
                _record(db,f,cid=f["city"],owner=f["owner"],days=1,power=1000000,at=now)
    result=_run(now)
    assert result[0]["city_count"]==1
    own=client.get("/api/v1/me/worlds/"+f["world"]+"/influence",
                   headers=_headers(f["owner_name"],"strong-owner-map-password")).json()
    assert own["cities"][0]["sample_days"]==1
    assert own["cities"][0]["total_domination"]=="250000"
    assert own["cities"][0]["radius"]==4
    with psycopg.connect(URL) as db:
        # No forged owner transfer: old source snapshots cannot be inherited.
        db.execute(
            "UPDATE cities SET owner_account_id=%s WHERE city_id=%s",
            (f["foreign"],f["city"]),
        )
        db.execute(
            """UPDATE world_influence_policies
               SET next_refresh_at=%s WHERE world_id=%s""",
            (now,f["world"]),
        )
    try:
        next_result=_run(now+timedelta(days=1))
        assert next_result[0]["city_count"]==0
    finally:
        # Shared test fixture must be able to delete the player's own city.
        with psycopg.connect(URL) as db:
            db.execute("UPDATE cities SET owner_account_id=%s WHERE city_id=%s",
                       (f["owner"],f["city"]))


def test_two_workers_do_not_double_publish_a_revision(map_fixture):
    f=map_fixture;now=_now()
    with psycopg.connect(URL) as db:
        configure_influence(db,world_id=f["world"],next_refresh_at=now)
        _record(db,f,cid=f["city"],owner=f["owner"],at=now,power=100000)
    def worker():
        with psycopg.connect(URL,autocommit=True) as db:
            return run_influence_batch(db,now_at=now,max_worlds=1)
    with ThreadPoolExecutor(max_workers=2) as pool:
        a,b=[job.result(timeout=30) for job in
             [pool.submit(worker),pool.submit(worker)]]
    assert sorted([len(a),len(b)])==[0,1]
    with psycopg.connect(URL) as db:
        assert db.execute(
            "SELECT count(*) FROM world_influence_runs WHERE world_id=%s",
            (f["world"],),
        ).fetchone()[0]==1


def test_recording_requires_real_membership_and_valid_provenance(map_fixture):
    f=map_fixture;today=_now().date()
    with psycopg.connect(URL) as db:
        with pytest.raises(ValueError):
            record_daily_domination(
                db,world_id=f["world"],city_id=f["city"],
                owner=f["foreign"],day=today,
                military_power=100,building_domination=0,
                source_ref="BAD-CLAIM",
            )
        with pytest.raises(ValueError):
            record_daily_domination(
                db,world_id=f["world"],city_id=f["city"],
                owner=f["owner"],day=today,
                military_power=-1,building_domination=0,
                source_ref="BAD-POWER",
            )
        with pytest.raises(ValueError):
            configure_influence(db,world_id=f["world"],period_seconds=0)


def test_active_dynamic_border_prevents_outdated_manual_colonization_site(map_fixture):
    # Lab owner could own a manually proven colonization profile in a given
    # square, but an enabled revised dynamic border must be checked as well.
    from mmhk_api.colonization import _approved_site
    f=map_fixture;now=_now()
    with psycopg.connect(URL) as db:
        record_influence(db,world_id=f["world"],x=10,y=10,
                         controller=f["owner"],source_ref="LAB-OLD-TERRITORY")
        configure_colony_site(db,world_id=f["world"],x=10,y=10,
            source_ref="LAB-QUALIFIED-PLOT",mines=["gold","wood","ore","crystal"],
            rates_per_day={"gold":24,"wood":12,"ore":12,"crystal":6},
            capacities={k:200 for k in RESOURCE_NAMES},tick_seconds=60)
        configure_influence(db,world_id=f["world"],next_refresh_at=now)
        _record(db,f,cid=f["city"],owner=f["owner"],at=now,power=30000)
    try:
        with psycopg.connect(URL) as db:
            assert _approved_site(db,world_id=f["world"],owner=f["owner"],
                                  x=10,y=10)[0]==["crystal","gold","ore","wood"]
        _run(now)
        with psycopg.connect(URL) as db:
            with pytest.raises(ColonizationConflict):
                _approved_site(db,world_id=f["world"],owner=f["owner"],
                               x=10,y=10)
    finally:
        with psycopg.connect(URL) as db:
            db.execute("DELETE FROM colonization_site_profiles WHERE world_id=%s",
                       (f["world"],))
            db.execute("DELETE FROM map_influence_cells WHERE world_id=%s",
                       (f["world"],))
