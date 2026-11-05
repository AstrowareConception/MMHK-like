"""G11 read-only costs, durations and baseline production, no mutation."""
from uuid import uuid4
import psycopg
import pytest
from fastapi.testclient import TestClient
from mmhk_api.main import app
from mmhk_api.mine_level_reference import (
    G11_UPGRADE_GOLD_COSTS,G11_BASE_DAILY_PER_LEVEL,
    g11_level_steps,owned_city_mine_level_reference,
)
from test_construction_integration import city,headers,client,URL


@pytest.mark.parametrize("kind,per_level",[
    ("gold",2000),("wood",2),("ore",2),
    ("crystal",1),("gems",1),("sulfur",1),("mercury",1),
])
def test_g11_reference_baseline_and_nine_steps(kind,per_level):
    steps=g11_level_steps(kind)
    assert len(steps)==9
    assert [s["from_level"] for s in steps]==list(range(1,10))
    assert [s["to_level"] for s in steps]==list(range(2,11))
    assert [s["cost_gold"] for s in steps]==list(G11_UPGRADE_GOLD_COSTS)
    assert [s["base_duration_hours"] for s in steps]==[
        1,2,3,5,8,13,21,34,55,
    ]
    assert [s["base_daily_after"] for s in steps]==[
        per_level*i for i in range(2,11),
    ]
    assert all(s["production_continues_during_level_work"] for s in steps)
    assert all(s["reference_only"] for s in steps)


@pytest.mark.parametrize("bad",["","leather",None,0,True,[],{}])
def test_unknown_resource_is_not_given_a_price_or_yield(bad):
    with pytest.raises(ValueError):
        g11_level_steps(bad)


def test_g11_owner_reference_is_read_only_and_missing_city_refused(city):
    root=f"/api/v1/me/cities/{city['city']}/mines/level-reference"
    owner=headers(city["username"])
    other=headers(city["enemyname"])
    with psycopg.connect(URL) as db:
        before_mines=db.execute("SELECT resource FROM city_mines "
            "WHERE city_id=%s ORDER BY resource",(city["city"],)).fetchall()
        before_stocks=db.execute("SELECT resource,amount FROM city_stocks "
            "WHERE city_id=%s ORDER BY resource",(city["city"],)).fetchall()
        before_rates=db.execute("SELECT count(*) FROM city_mine_rates "
            "WHERE city_id=%s",(city["city"],)).fetchone()[0]
    response=client.get(root,headers=owner)
    assert response.status_code==200,response.text
    body=response.json()
    assert body["documentary_only"] is True
    assert body["current_mine_levels_known"] is False
    assert body["upgrades_executable"] is False
    assert body["hero_prerequisites_qualified"] is False
    assert body["mine_max_level"]==10
    assert [mine["resource"] for mine in body["mines"]]==[
        "crystal","gold","ore","wood",
    ]
    assert client.get(root,headers=other).status_code==404
    assert client.get("/api/v1/me/cities/"+str(uuid4())+
        "/mines/level-reference",headers=owner).status_code==404
    assert client.get(root).status_code==401
    with psycopg.connect(URL) as db:
        assert db.execute("SELECT resource FROM city_mines "
            "WHERE city_id=%s ORDER BY resource",(city["city"],)).fetchall()==before_mines
        assert db.execute("SELECT resource,amount FROM city_stocks "
            "WHERE city_id=%s ORDER BY resource",(city["city"],)).fetchall()==before_stocks
        assert db.execute("SELECT count(*) FROM city_mine_rates "
            "WHERE city_id=%s",(city["city"],)).fetchone()[0]==before_rates
