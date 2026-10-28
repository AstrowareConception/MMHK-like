"""Security regression: the map never exposes stored sites, enemy cities, or
 territorial borders without explicit account/world visibility."""
from uuid import uuid4
import psycopg
import pytest
from test_map_navigation_integration import map_fixture, _headers, client, URL
from mmhk_api.world_intel import (
    register_known_site,reveal_site,reveal_city,record_influence,reveal_influence
)

def test_map_intel_is_real_discovered_and_account_scoped(map_fixture):
    f=map_fixture
    owner_h=_headers(f["owner_name"],"strong-owner-map-password")
    enemy_h=_headers(f["foreign_name"],"strong-foreign-map-password")
    url="/api/v1/me/worlds/"+f["world"]+"/overview"
    try:
        with psycopg.connect(URL) as db:
            site=register_known_site(db,world_id=f["world"],x=98,y=4,
                kind="obelisk",label="Obélisque témoin",
                source_ref="TEST-PROVENANCE-ONLY")
            record_influence(db,world_id=f["world"],x=22,y=33,
                controller=f["foreign"],source_ref="TEST-PROVENANCE-ONLY")
        first=client.get(url,headers=owner_h).json()
        assert first["visible_sites"]==[]
        assert first["visible_influence"]==[]
        assert first["discovered_cities"]==[]
        assert "SECRET ENEMY CITY" not in str(first)
        with psycopg.connect(URL) as db:
            reveal_site(db,world_id=f["world"],site_id=site,viewer=f["owner"])
            reveal_city(db,world_id=f["world"],city_id=f["enemy_city"],viewer=f["owner"])
            reveal_influence(db,world_id=f["world"],x=22,y=33,viewer=f["owner"])
        second=client.get(url,headers=owner_h).json()
        assert len(second["visible_sites"])==1
        assert second["visible_sites"][0]["kind"]=="obelisk"
        assert second["visible_sites"][0]["x"]==98
        assert len(second["discovered_cities"])==1
        assert second["discovered_cities"][0]["name"]=="SECRET ENEMY CITY"
        assert len(second["visible_influence"])==1
        assert second["visible_influence"][0]["controller"]==f["foreign_name"]
        assert second["visible_influence"][0]["is_mine"] is False
        # Our discovery does not grant anything to the opposing player.
        other=client.get(url,headers=enemy_h).json()
        assert other["visible_sites"]==[]
        assert other["discovered_cities"]==[]
        assert len(other["visible_influence"])==1 # His own influence only
        assert other["visible_influence"][0]["is_mine"] is True
        # Revoke visibility and check that the data really disappear.
        with psycopg.connect(URL) as db:
            db.execute("DELETE FROM map_site_discoveries WHERE site_id=%s",(site,))
            db.execute("DELETE FROM map_city_discoveries WHERE world_id=%s",(f["world"],))
            db.execute("DELETE FROM map_influence_discoveries WHERE world_id=%s",(f["world"],))
        revoked=client.get(url,headers=owner_h).json()
        assert revoked["visible_sites"]==[]
        assert revoked["discovered_cities"]==[]
        assert revoked["visible_influence"]==[]
    finally:
        with psycopg.connect(URL) as db:
            db.execute("DELETE FROM map_influence_cells WHERE world_id=%s",(f["world"],))
            db.execute("DELETE FROM map_world_sites WHERE world_id=%s",(f["world"],))

def test_map_intel_rejects_invalid_positions_and_wrong_world(map_fixture):
    f=map_fixture
    with psycopg.connect(URL) as db:
        for coord in [(0,1),(101,1),(1,0),(1,101)]:
            with pytest.raises(ValueError):
                register_known_site(db,world_id=f["world"],x=coord[0],y=coord[1],
                    kind="relic",label="Unverified",source_ref="TEST-ONLY")
        with pytest.raises(ValueError):
            register_known_site(db,world_id=f["world"],x=2,y=2,
                kind="unknown",label="Unverified",source_ref="TEST-ONLY")
        with pytest.raises(ValueError):
            reveal_city(db,world_id=f["world"],city_id=uuid4(),viewer=f["owner"])
