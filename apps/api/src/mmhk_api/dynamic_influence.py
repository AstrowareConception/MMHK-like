"""Four-day dynamic influence LAB, not a certified MMHK season-two algorithm.

Historical witnesses corroborate a four-day military mean and the six
domination thresholds. Inverse-square falloff, zero-filling missing days,
per-owner aggregation and exact-tie neutrality are explicitly EXPERIMENTAL.
Sources are trusted operator snapshots, never guessed from unit counts.
"""
from __future__ import annotations
from datetime import UTC,date,datetime,timedelta
from decimal import Decimal,localcontext
from uuid import UUID
import psycopg

THRESHOLDS=(0,30000,100000,250000,500000,1000000)
LOOKBACK_DAYS=4
MAX_CITIES=250
MAX_CELLS=25000
LAB_POLICY="LAB-FOUR-DAY-INVERSE-SQUARE-V1"

class InfluenceNotFound(Exception):
    pass

def _now(db):
    return db.execute("SELECT clock_timestamp()").fetchone()[0]

def _utc(value):
    if not isinstance(value,datetime) or value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("Timezone-aware clock required")
    return value.astimezone(UTC)

def radius(power):
    p=Decimal(power)
    if p<0:raise ValueError("Invalid negative domination")
    return max(i+1 for i,t in enumerate(THRESHOLDS) if p>=t)

def wrap(v,size):
    return (v-1)%size+1

def configure_influence(db,*,world_id,policy_id=LAB_POLICY,enabled=True,
                        period_seconds=86400,next_refresh_at=None):
    if (not isinstance(world_id,str) or not 1<=len(world_id)<=64
        or not isinstance(policy_id,str) or not 3<=len(policy_id)<=100
        or type(enabled) is not bool or type(period_seconds) is not int
        or not 3600<=period_seconds<=86400):
        raise ValueError("Invalid operator influence policy")
    at=_utc(next_refresh_at) if next_refresh_at is not None else _now(db)
    with db.transaction():
        db.execute(
            """INSERT INTO world_influence_policies
               (world_id,policy_id,enabled,period_seconds,next_refresh_at)
               VALUES(%s,%s,%s,%s,%s)""",
            (world_id,policy_id,enabled,period_seconds,at),
        )

def record_daily_domination(db,*,world_id,city_id,owner,day,
                            military_power,building_domination,source_ref):
    if (not isinstance(day,date) or isinstance(day,datetime)
        or type(military_power) is not int or type(building_domination) is not int
        or not 0<=military_power<=1000000000000
        or not 0<=building_domination<=1000000000000
        or not isinstance(source_ref,str) or not 3<=len(source_ref)<=255):
        raise ValueError("Invalid evidenced domination snapshot")
    with db.transaction():
        allowed=db.execute(
            """SELECT 1 FROM cities c JOIN world_memberships m
               ON m.world_id=c.world_id AND m.account_id=%s
               WHERE c.world_id=%s AND c.city_id=%s AND c.owner_account_id=%s""",
            (owner,world_id,city_id,owner),
        ).fetchone()
        if not allowed:
            raise ValueError("Snapshot must belong to a current member and city owner")
        db.execute(
            """INSERT INTO city_domination_samples
               (world_id,city_id,owner_account_id,sample_day,
                military_power,building_domination,source_ref)
               VALUES(%s,%s,%s,%s,%s,%s,%s)""",
            (world_id,city_id,owner,day,military_power,
             building_domination,source_ref),
        )

def calculate_cells(cities,size):
    """Pure deterministic toroidal disk; exact score ties remain contested."""
    if type(size) is not int or not 2<=size<=100000 or len(cities)>MAX_CITIES:
        raise ValueError("Unsupported experimental world size/city count")
    sums={}
    with localcontext() as ctx:
        ctx.prec=44
        for c in sorted(cities,key=lambda city:str(city["city_id"])):
            power=Decimal(c["power"])
            r=radius(power)
            # Torus wrapping may map multiple offset pairs to one actual
            # square on tiny worlds. A city contributes ONLY its best,
            # nearest score, rather than multiplying domination by wrapping.
            nearest={}
            for dx in range(-r,r+1):
                for dy in range(-r,r+1):
                    sq=dx*dx+dy*dy
                    if sq>r*r:continue
                    point=(wrap(c["x"]+dx,size),wrap(c["y"]+dy,size))
                    # Squared torus distance is local to this radius-6 window.
                    part=max(Decimal(1),power)/(1+Decimal(sq).sqrt())**2
                    if point not in nearest or part>nearest[point]:
                        nearest[point]=part
            for point,part in nearest.items():
                owners=sums.setdefault(point,{})
                own=c["owner"]
                owners[own]=owners.get(own,Decimal(0))+part
                if len(sums)>MAX_CELLS:
                    raise ValueError("Too many calculated cells for this lab profile")
        output={}
        for point,by_owner in sums.items():
            ranking=sorted(by_owner.items(),key=lambda kv:(-kv[1],str(kv[0])))
            score=ranking[0][1]
            if len(ranking)>1 and score==ranking[1][1]:
                output[point]=(None,"contested",score)
            else:
                output[point]=(ranking[0][0],"controlled",score)
        return output

def _city_powers(db,world_id,cutoff):
    """Last four completed UTC dates; absent observations count as zero."""
    start=cutoff-timedelta(days=LOOKBACK_DAYS)
    rows=db.execute(
        """SELECT c.city_id,c.owner_account_id,c.x,c.y,s.sample_day,
                  s.military_power,s.building_domination
           FROM cities c JOIN city_domination_samples s
             ON s.world_id=c.world_id AND s.city_id=c.city_id
             AND s.owner_account_id=c.owner_account_id
           JOIN world_memberships m
             ON m.world_id=c.world_id AND m.account_id=c.owner_account_id
           WHERE c.world_id=%s AND s.sample_day>=%s AND s.sample_day<%s
           ORDER BY c.city_id,s.sample_day""",
        (world_id,start,cutoff),
    ).fetchall()
    histories={}
    for cid,owner,x,y,day,mil,building in rows:
        e=histories.setdefault(cid,{"city_id":cid,"owner":owner,"x":x,"y":y,
                                    "daily":{},"building":0})
        e["daily"][day]=mil
        e["building"]=building
    result=[]
    for e in histories.values():
        mil=Decimal(sum(e["daily"].values()))/LOOKBACK_DAYS
        p=mil+e["building"]
        result.append({**e,"power":p,"radius":radius(p),
                       "military_average":mil,"sample_count":len(e["daily"])})
    return result

def _recalculate(db,world,policy,now):
    policy_id,period,revision,due=policy
    size_row=db.execute(
        "SELECT world_size FROM worlds WHERE world_id=%s",(world,),
    ).fetchone()
    if not size_row:raise RuntimeError("Active influence world disappeared")
    cutoff=now.date()
    cities=_city_powers(db,world,cutoff)
    cells=calculate_cells(cities,size_row[0])
    number=revision+1
    # One commit replaces all cells. No partial/mixed revisions can leak.
    db.execute("DELETE FROM world_influence_cells WHERE world_id=%s",(world,))
    for (x,y),(owner,state,score) in sorted(cells.items()):
        db.execute(
            """INSERT INTO world_influence_cells
               (world_id,x,y,owner_account_id,state,score,revision,policy_id,refreshed_at)
               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (world,x,y,owner,state,score.quantize(Decimal("0.000000000001")),
             number,policy_id,now),
        )
    controlled=sum(state=="controlled" for _,state,_ in cells.values())
    contested=len(cells)-controlled
    db.execute(
        """INSERT INTO world_influence_runs
           (world_id,revision,policy_id,cutoff_day,city_count,
            controlled_cells,contested_cells,calculated_at)
           VALUES(%s,%s,%s,%s,%s,%s,%s,%s)""",
        (world,number,policy_id,cutoff,len(cities),controlled,contested,now),
    )
    next_at=due+timedelta(seconds=period)
    if next_at<=now:next_at=now+timedelta(seconds=period)
    db.execute(
        """UPDATE world_influence_policies SET revision=%s,
           last_refresh_at=%s,next_refresh_at=%s
           WHERE world_id=%s AND revision=%s""",
        (number,now,next_at,world,revision),
    )
    return {"world_id":world,"revision":number,"city_count":len(cities),
            "controlled_cells":controlled,"contested_cells":contested,
            "historically_certified_s2":False}

def run_influence_batch(db,*,now_at=None,max_worlds=1):
    if not db.autocommit:raise ValueError("Autocommit required for influence worker")
    if type(max_worlds) is not int or not 1<=max_worlds<=10:
        raise ValueError("Invalid bounded world batch")
    now=_utc(now_at) if now_at is not None else _utc(_now(db))
    events=[]
    for _ in range(max_worlds):
        with db.transaction():
            row=db.execute(
                """SELECT world_id,policy_id,period_seconds,revision,next_refresh_at
                   FROM world_influence_policies
                   WHERE enabled AND next_refresh_at<=%s
                   ORDER BY next_refresh_at,world_id
                   FOR UPDATE SKIP LOCKED LIMIT 1""",(now,),
            ).fetchone()
            if row is None:break
            world,policy,period,revision,due=row
            events.append(_recalculate(db,world,(policy,period,revision,due),now))
    return events

def influence_for_world(db,*,owner,world_id):
    member=db.execute(
        "SELECT 1 FROM world_memberships WHERE world_id=%s AND account_id=%s",
        (world_id,owner),
    ).fetchone()
    if not member:raise InfluenceNotFound
    policy=db.execute(
        """SELECT policy_id,enabled,revision,last_refresh_at,next_refresh_at
           FROM world_influence_policies WHERE world_id=%s""",(world_id,),
    ).fetchone()
    now=_now(db)
    cutoff=(policy[3] if policy and policy[3] else now).date()
    models={entry["city_id"]:entry for entry in _city_powers(db,world_id,cutoff)
            if entry["owner"]==owner}
    cities=db.execute(
        """SELECT city_id,name FROM cities WHERE world_id=%s AND owner_account_id=%s
           ORDER BY name,city_id""",(world_id,owner),
    ).fetchall()
    count=db.execute(
        """SELECT count(*) FROM world_influence_cells
           WHERE world_id=%s AND owner_account_id=%s AND state='controlled'""",
        (world_id,owner),
    ).fetchone()[0]
    return {"world_id":world_id,"policy_id":policy[0] if policy else None,
            "enabled":bool(policy and policy[1]),
            "revision":policy[2] if policy else 0,
            "last_refresh_at":policy[3].isoformat() if policy and policy[3] else None,
            "next_refresh_at":policy[4].isoformat() if policy else None,
            "lookback_days":LOOKBACK_DAYS,"owned_cells":count,
            "cities":[{
                "city_id":str(cid),"name":name,
                "military_average":str(models[cid]["military_average"]) if cid in models else None,
                "building_domination":models[cid]["building"] if cid in models else None,
                "total_domination":str(models[cid]["power"]) if cid in models else None,
                "radius":models[cid]["radius"] if cid in models else None,
                "sample_days":models[cid]["sample_count"] if cid in models else 0,
            } for cid,name in cities],
            "historically_certified_s2":False,
            "spatial_method":"EXPERIMENTAL inverse-square",
            "historical_reference":"2009/2013 four-day mean and 30k..1M thresholds"}
