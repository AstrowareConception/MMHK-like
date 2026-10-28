"""Read-only prediction of authorized construction and hero travel milestones.

PostgreSQL and the workers remain the only sources of truth.
Only explicitly launched timed PvE missions are shown; no client-clock authority.
"""
from __future__ import annotations

from datetime import timedelta
from uuid import UUID
import psycopg


def timeline_for_player(
    db: psycopg.Connection, account_id: UUID, *, hours: int = 12, limit: int = 200,
) -> dict:
    if isinstance(hours, bool) or not 1 <= hours <= 48:
        raise ValueError("hours must be between 1 and 48")
    if isinstance(limit, bool) or not 1 <= limit <= 200:
        raise ValueError("limit must be between 1 and 200")
    now = db.execute("SELECT clock_timestamp()").fetchone()[0]
    horizon = now + timedelta(hours=hours)
    rows = db.execute(
        """SELECT o.order_id, o.building_code, o.target_level, o.due_at,
                  c.city_id, c.name, c.world_id
           FROM urban_construction_orders o
           JOIN cities c ON c.city_id = o.city_id
           JOIN world_memberships wm ON wm.world_id = c.world_id
              AND wm.account_id = %s
           WHERE c.owner_account_id = %s
             AND o.status = 'building'
             AND o.due_at <= %s
           ORDER BY o.due_at, o.order_id
           LIMIT %s""",
        (account_id, account_id, horizon, limit + 1),
    ).fetchall()
    # Departure and return are independent, server-scheduled events.
    # The 12h strip never fabricates arrivals from the browser clock.
    missions=db.execute(
        """SELECT m.mission_id,m.stage,m.arrival_due_at,m.return_due_at,
                  h.name,c.city_id,c.name,c.world_id,e.name
           FROM pve_missions m
           JOIN city_heroes h ON h.hero_id=m.hero_id
           JOIN cities c ON c.city_id=m.city_id
           JOIN world_memberships w ON w.world_id=c.world_id AND w.account_id=%s
           JOIN region_encounters e ON e.encounter_id=m.encounter_id
           WHERE m.actor_account_id=%s AND c.owner_account_id=%s
             AND m.stage<>'completed'
             AND (m.arrival_due_at <= %s OR m.return_due_at <= %s)
           ORDER BY m.started_at,m.mission_id LIMIT %s""",
        (account_id,account_id,account_id,horizon,horizon,limit+1),
    ).fetchall()
    # Only truly dispatched, owner-scoped departures are shown. Retried
    # storage checks are not promised as successful arrival times.
    caravan_rows=db.execute(
        """SELECT s.shipment_id,s.status,s.next_attempt_at,
                  src.city_id,src.name,src.world_id,dst.name
           FROM caravan_shipments s
           JOIN cities src ON src.city_id=s.source_city_id
           LEFT JOIN cities dst ON dst.city_id=s.destination_city_id
             AND dst.owner_account_id=%s
           JOIN world_memberships m ON m.world_id=src.world_id AND m.account_id=%s
           WHERE src.owner_account_id=%s AND s.owner_account_id=%s
             AND s.status IN ('in_transit','returning')
             AND s.next_attempt_at<=%s
           ORDER BY s.next_attempt_at,s.shipment_id LIMIT %s""",
        (account_id,account_id,account_id,account_id,horizon,limit+1),
    ).fetchall()
    caravan_events=[{
        "id":"caravan-"+("return-" if status=="returning" else "arrival-")+str(sid),
        "type":"caravan_return" if status=="returning" else "caravan_arrival",
        "title":("Retour du convoi" if status=="returning"
                 else "Convoi vers "+(dst_name or "une destination devenue inaccessible")),
        "occurs_at":due,"world_id":world_id,
        "city_id":str(origin_id),"city_name":origin_name,
        "target_url":"/cities/"+str(origin_id)+"/market#caravans",
        "icon":"timeline.hero_return","priority":"normal",
    } for sid,status,due,origin_id,origin_name,world_id,dst_name in caravan_rows]
    # Program deadlines are *attempts*, never guaranteed cargo departures:
    # every candidate still requires a worker-side stock/authorization check.
    programs=db.execute(
        """SELECT p.program_id,p.status,p.shipments_total,p.shipments_sent,
                  p.next_departure_at,c.city_id,c.name,c.world_id
           FROM caravan_dispatch_programs p
           JOIN cities c ON c.city_id=p.source_city_id
           JOIN world_memberships m ON m.world_id=c.world_id AND m.account_id=%s
           WHERE p.owner_account_id=%s AND c.owner_account_id=%s
             AND p.status IN ('active','waiting_stock')
             AND p.next_departure_at<=%s
           ORDER BY p.next_departure_at,p.program_id LIMIT %s""",
        (account_id,account_id,account_id,horizon,limit+1),
    ).fetchall()
    program_events=[{
        "id":"caravan-program-"+str(pid),
        "type":"caravan_program_attempt",
        "title":("Vérification du stock du convoi"
                 if stage=="waiting_stock" else
                 f"Départ programmé {sent+1}/{total} (sous réserve)"),
        "occurs_at":due,"world_id":world,
        "city_id":str(cid),"city_name":name,
        "target_url":"/cities/"+str(cid)+"/market#caravans",
        "icon":"timeline.hero_return","priority":"normal",
    } for pid,stage,total,sent,due,cid,name,world in programs]
    # Founding arrivals are scheduled server actions, not simulated completed
    # cities. The worker must confirm them before the atlas changes.
    founding=db.execute(
        """SELECT o.order_id,o.due_at,o.colony_name,o.source_city_id,
                  c.name,c.world_id
           FROM colonization_orders o
           JOIN cities c ON c.city_id=o.source_city_id
           JOIN world_memberships m ON m.world_id=o.world_id
             AND m.account_id=%s
           WHERE o.owner_account_id=%s AND c.owner_account_id=%s
             AND o.status='traveling' AND o.due_at<=%s
           ORDER BY o.due_at,o.order_id LIMIT %s""",
        (account_id,account_id,account_id,horizon,limit+1),
    ).fetchall()
    founding_events=[{
        "id":"colony-founding-"+str(oid),"type":"colony_founding",
        "title":"Fondation prévue : "+name,
        "occurs_at":due,"world_id":world,
        "city_id":str(source),"city_name":source_name,
        "target_url":"/worlds/"+world+"/colonize",
        "icon":"timeline.construction","priority":"normal",
    } for oid,due,name,source,source_name,world in founding]
    construction_events=[{
        "id":"construction-"+str(order_id),
        "type":"construction_complete",
        "title":f"{code.replace('_', ' ').capitalize()} — niveau {level}",
        "occurs_at":due,
        "world_id":world_id,
        "city_id":str(city_id),"city_name":city_name,
        "target_url":"/cities/"+str(city_id),
        "icon":"timeline.construction","priority":"normal"
    } for order_id,code,level,due,city_id,city_name,world_id in rows]
    movement_events=[]
    for mid,stage,arrival,return_due,hname,city_id,city_name,world_id,enemy in missions:
        if stage=="outbound" and arrival<=horizon:
            movement_events.append({
                "id":"hero-arrival-"+str(mid),"type":"hero_arrival",
                "title":f"{hname} arrive près de {enemy}",
                "occurs_at":arrival,"world_id":world_id,"city_id":str(city_id),
                "city_name":city_name,"target_url":"/cities/"+str(city_id)+"/region",
                "icon":"timeline.hero_arrival","priority":"normal"
            })
        if return_due<=horizon: movement_events.append({
            "id":"hero-return-"+str(mid),"type":"hero_return",
            "title":f"Retour de {hname}",
            "occurs_at":return_due,"world_id":world_id,"city_id":str(city_id),
            "city_name":city_name,"target_url":"/cities/"+str(city_id)+"/region",
            "icon":"timeline.hero_return","priority":"normal"
        })
    events=sorted(construction_events+movement_events+caravan_events+program_events+
                  founding_events,
                  key=lambda e:(e["occurs_at"],e["id"]))
    return {
        "server_now": now,
        "horizon_hours": hours,
        "truncated": (len(events)>limit or len(rows)>limit or
                      len(missions)>limit or len(caravan_rows)>limit
                      or len(programs)>limit or len(founding)>limit),
        "events": events[:limit],
    }
