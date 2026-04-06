from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

@router.get("/vs-batter-hand/{player_id}")
def get_bowler_vs_batter_hand(player_id: str, db: Session = Depends(get_db)):
    """
    Mora bowler's economy, wickets, dot % vs RHB and LHB.
    Uses denormalised opp_batter_style on deliveries.
    """
    query = text("""
        SELECT
            d.opp_batter_style                                         AS batter_hand,
            SUM(d.total_runs)                                          AS runs,
            COUNT(*)                                                   AS balls,
            SUM(d.extras_runs)                                         AS extras,
            COUNT(*) FILTER (WHERE d.is_wicket
                AND d.wicket_type NOT IN ('RUN_OUT','RETIRED_HURT'))   AS wickets,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 0
                AND d.extras_type IS NULL)                             AS dots,
            COUNT(*) FILTER (WHERE d.runs_off_bat >= 4)                AS boundaries,
            COUNT(DISTINCT d.innings_id)                               AS innings_count
        FROM deliveries d
        JOIN innings i ON i.id = d.innings_id
        JOIN matches m ON m.id = i.match_id
        WHERE d.mora_bowler_id = :pid
          AND d.opp_batter_style IS NOT NULL
          AND m.status != 'PRE_TOSS_ABANDONED'
        GROUP BY d.opp_batter_style
    """)
    rows = db.execute(query, {"pid": player_id}).mappings().all()

    def overs(balls: int) -> float:
        return balls // 6 + (balls % 6) / 10

    return {
        "player_id": player_id,
        "breakdown": [
            {
                "batter_hand":   r["batter_hand"],
                "overs":         overs(r["balls"]),
                "runs":          r["runs"],
                "wickets":       r["wickets"],
                "economy":       round(r["runs"] / overs(r["balls"]), 2) if r["balls"] >= 6 else None,
                "dot_ball_pct":  round(r["dots"] / r["balls"] * 100, 1) if r["balls"] > 0 else 0,
                "boundary_pct":  round(r["boundaries"] / r["balls"] * 100, 1) if r["balls"] > 0 else 0,
                "innings":       r["innings_count"],
            }
            for r in rows
        ],
    }