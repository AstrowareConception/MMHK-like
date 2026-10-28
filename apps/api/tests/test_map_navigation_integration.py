"""World atlas/region navigation, real SQL account isolation and torus edges."""
from __future__ import annotations

import os
from uuid import uuid4

import psycopg
import pytest
from fastapi.testclient import TestClient

from mmhk_api.main import app
from mmhk_api.db import migrate
from mmhk_api.map_views import MapNotFound, own_region, torus_coordinate, world_overview
from mmhk_api.security import create_account
from mmhk_api.worlds import seed_first_haven_city

URL = os.environ.get("MMHK_TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not URL, reason="No PostgreSQL test URL")
client = TestClient(app)


@pytest.fixture
def map_fixture(monkeypatch):
    assert URL
    monkeypatch.setenv("MMHK_DATABASE_URL", URL)
    with psycopg.connect(URL) as db:
        migrate(db)
        token = uuid4().hex[:12]
        owner_name = "map" + token
        foreign_name = "foe" + token
        owner = create_account(db, owner_name, "strong-owner-map-password")
        foreign = create_account(db, foreign_name, "strong-foreign-map-password")
        world_id = "map-" + token
        city_id = seed_first_haven_city(
            db, world_id=world_id, world_name="Monde de test torique",
            size=100, account_id=owner, city_name="Cité du Havre",
            x=1, y=100,
        )
        # Both players are members of THE SAME WORLD. Client must not learn
        # the other player's city location until proper scouting exists.
        db.execute(
            """INSERT INTO world_memberships(world_id,account_id)
               VALUES(%s,%s)""",
            (world_id, foreign),
        )
        enemy_city = uuid4()
        db.execute(
            """INSERT INTO cities(city_id,world_id,owner_account_id,name,x,y,first_city)
               VALUES(%s,%s,%s,'SECRET ENEMY CITY',22,33,true)""",
            (enemy_city,world_id,foreign),
        )
    yield {
        "world": world_id, "owner": owner, "foreign": foreign,
        "owner_name": owner_name, "foreign_name": foreign_name,
        "city": city_id, "enemy_city": enemy_city,
    }
    with psycopg.connect(URL) as db:
        db.execute("DELETE FROM cities WHERE world_id=%s", (world_id,))
        db.execute("DELETE FROM world_memberships WHERE world_id=%s", (world_id,))
        db.execute("DELETE FROM worlds WHERE world_id=%s", (world_id,))
        db.execute(
            "DELETE FROM accounts WHERE account_id IN (%s,%s)",
            (owner,foreign),
        )


def _headers(username, password):
    result=client.post("/api/v1/sessions",json={
        "username":username,"password":password,
    })
    assert result.status_code==200
    return {"Authorization":"Bearer "+result.json()["access_token"]}


def test_wrapped_one_index_world_coordinates():
    assert torus_coordinate(0,100)==100
    assert torus_coordinate(101,100)==1
    assert torus_coordinate(-100,100)==100
    assert torus_coordinate(200,100)==100
    assert torus_coordinate(1,100)==1
    for n,size in [(1,0),(1,1),(True,100),("4",100),(1,False)]:
        with pytest.raises(ValueError):
            torus_coordinate(n,size)


def test_region_has_exactly_25_unmapped_cells_and_center_owned_city(map_fixture):
    f=map_fixture
    with psycopg.connect(URL) as db:
        region=own_region(db,f["owner"],f["city"])
    assert region["world_x"]==1 and region["world_y"]==100
    assert region["region_width"]==region["region_height"]==5
    assert len(region["cells"])==25
    assert len({(v["i"],v["j"]) for v in region["cells"]})==25
    center=[v for v in region["cells"] if v["kind"]=="owned_city"]
    assert center==[{"i":2,"j":2,"kind":"owned_city","city_id":f["city"]}]
    assert all(c["city_id"] is None for c in region["cells"] if c["kind"]=="unmapped")
    assert set(region["mine_types_unlocated"])=={"gold","wood","ore","crystal"}
    assert region["mine_positions_known"] is False
    assert region["cell_layout"]=="illustrative_unmapped"
    assert region["historical_regional_terrain_certified"] is False
    ring={(v["dx"],v["dy"]):(v["x"],v["y"]) for v in region["surrounding_world_regions"]}
    assert len(ring)==9
    assert ring[(-1,-1)]==(100,99)
    assert ring[(1,1)]==(2,1)
    assert ring[(0,0)]==(1,100)


def test_owned_atlas_hides_foreign_city_in_same_world(map_fixture):
    f=map_fixture
    with psycopg.connect(URL) as db:
        owner_view=world_overview(db,f["owner"],f["world"])
        foreign_view=world_overview(db,f["foreign"],f["world"])
        assert len(owner_view["cities"])==1
        assert len(foreign_view["cities"])==1
        assert owner_view["cities"][0]["city_id"]==f["city"]
        assert foreign_view["cities"][0]["city_id"]==f["enemy_city"]
        assert owner_view["topology"]=="torus"
        assert owner_view["enemy_positions_exposed"] is False
        assert owner_view["world_terrain_loaded"] is False
        assert owner_view["known_scope"]=="owned_cities_only"
        with pytest.raises(MapNotFound):
            own_region(db,f["owner"],f["enemy_city"])
        with pytest.raises(MapNotFound):
            own_region(db,f["foreign"],f["city"])


def test_world_and_region_routes_require_auth_and_scope_accounts(map_fixture):
    f=map_fixture
    overview=f"/api/v1/me/worlds/{f['world']}/overview"
    owned=f"/api/v1/me/cities/{f['city']}/region"
    foreign=f"/api/v1/me/cities/{f['enemy_city']}/region"
    for path in (overview,owned):
        assert client.get(path).status_code==401
        assert client.get(path,headers={"Authorization":"Bearer invalid"}).status_code==401
    owner_headers=_headers(f["owner_name"],"strong-owner-map-password")
    enemy_headers=_headers(f["foreign_name"],"strong-foreign-map-password")
    atlas=client.get(overview,headers=owner_headers)
    assert atlas.status_code==200
    assert atlas.json()["world_size"]==100
    assert [v["city_id"] for v in atlas.json()["cities"]]==[str(f["city"])]
    assert "SECRET ENEMY CITY" not in atlas.text
    region=client.get(owned,headers=owner_headers)
    assert region.status_code==200
    assert region.json()["city_name"]=="Cité du Havre"
    assert client.get(foreign,headers=owner_headers).status_code==404
    assert client.get(owned,headers=enemy_headers).status_code==404
    assert client.get(overview,headers=enemy_headers).json()["cities"]==[{
        "city_id": str(f["enemy_city"]),
        "name":"SECRET ENEMY CITY","x":22,"y":33,"first_city":True,
    }]


def test_no_world_map_enumeration_or_untrusted_intel(map_fixture):
    f=map_fixture
    h=_headers(f["owner_name"],"strong-owner-map-password")
    missing=client.get("/api/v1/me/worlds/does-not-exist/overview",headers=h)
    assert missing.status_code==404
    fake_region=client.get(f"/api/v1/me/cities/{uuid4()}/region",headers=h)
    assert fake_region.status_code==404
    # No endpoint can expose unscouted opponents or issue a military order.
    paths=client.get("/openapi.json").json()["paths"]
    assert not any("/scout" in p or "/attack" in p for p in paths)
