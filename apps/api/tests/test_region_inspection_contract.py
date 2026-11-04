"""Fast isolated contract tests for authenticated region inspection."""
from uuid import uuid4
import pytest

from mmhk_api.map_views import MapNotFound
from mmhk_api.region_inspection import inspect_region


class FakeDB:
    def __init__(self, accessible=True):
        self.accessible = accessible
        self.queries = []

    def execute(self, query, params):
        self.queries.append((query, params))
        if "SELECT w.world_size" in query:
            self.rows = [(100,)] if self.accessible else []
        else:
            self.rows = []
        return self

    def fetchone(self):
        return self.rows[0] if self.rows else None

    def fetchall(self):
        return self.rows


def test_inspection_does_not_query_hidden_world_data():
    db = FakeDB(accessible=False)
    with pytest.raises(MapNotFound):
        inspect_region(db, uuid4(), "private-world", 2, 5)
    assert len(db.queries) == 1
    assert "world_memberships" in db.queries[0][0]


@pytest.mark.parametrize("x,y", [(0, 1), (101, 1), (1, 0), (1, 101)])
def test_outside_coordinates_are_rejected(x, y):
    db = FakeDB()
    with pytest.raises(ValueError):
        inspect_region(db, uuid4(), "visible-world", x, y)
    assert len(db.queries) == 1


def test_unknown_region_is_not_reported_as_empty():
    db = FakeDB()
    result = inspect_region(db, uuid4(), "visible-world", 7, 8)
    assert result["city"] is None
    assert result["city_known"] is False
    assert result["mines_known"] is False
    assert result["terrain_known"] is False
    assert result["colonization_site_qualified"] is False
    assert all("world_id=%s" in query or "w.world_id=%s" in query
               or "city_id=%s" in query for query, _ in db.queries)
