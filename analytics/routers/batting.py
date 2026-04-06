from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

@router.get("/vs-bowling-style/{player_id}")
def get_batter_vs_bowling_style(player_id: str, db: Session = Depends(get_db)):
    """
    Batting average and SR broken down by opponent bowling style.
    Combines delivery-level data (accurate) with scorecard fallback
    for innings without ball-by-ball entry.
    PRE_TOSS_ABANDONED matches are always excluded.
    """
    delivery_q = text("""
        SELECT
            d.opp_bowler_style                                          AS bowling_style,
            SUM(d.runs_off_bat)                                         AS runs,
            COUNT(*)                                                    AS balls_faced,
            COUNT(*) FILTER (WHERE d.is_wicket
                AND d.dismissed_mora_batter_id = :pid)                  AS dismissals,
            COUNT(*) FILTER (WHERE d.runs_off_bat = 0
                AND d.extras_type IS NULL)                              AS dots,
            COUNT(DISTINCT d.innings_id)                                AS innings_count
        FROM deliveries d
        JOIN innings i  ON i.id  = d.innings_id
        JOIN matches m  ON m.id  = i.match_id
        WHERE d.mora_batter_id = :pid
          AND d.opp_bowler_style IS NOT NULL
          AND i.batting_team = 'MORA'
          AND m.status != 'PRE_TOSS_ABANDONED'
        GROUP BY d.opp_bowler_style
        ORDER BY runs DESC
    """)

    scorecard_q = text("""
        SELECT
            mbp.dismissed_by_opp_bowler_style                          AS bowling_style,
            SUM(mbp.runs)                                              AS runs,
            SUM(mbp.balls_faced)                                       AS balls_faced,
            COUNT(*) FILTER (WHERE NOT mbp.is_not_out)                 AS dismissals,
            COUNT(*)                                                   AS innings_count
        FROM mora_batting_performances mbp
        JOIN innings i ON i.id = mbp.innings_id
        JOIN matches m ON m.id = i.match_id
        WHERE mbp.player_id = :pid
          AND mbp.dismissed_by_opp_bowler_style IS NOT NULL
          AND i.has_delivery_data = false
          AND m.status != 'PRE_TOSS_ABANDONED'
        GROUP BY mbp.dismissed_by_opp_bowler_style
    """)

    delivery_rows  = db.execute(delivery_q,  {"pid": player_id}).mappings().all()
    scorecard_rows = db.execute(scorecard_q, {"pid": player_id}).mappings().all()

    results: dict = {}

    for r in delivery_rows:
        style = r["bowling_style"]
        balls = r["balls_faced"] or 0
        dism  = r["dismissals"] or 0
        runs  = r["runs"] or 0
        results[style] = {
            "bowling_style":  style,
            "runs":           runs,
            "balls_faced":    balls,
            "dismissals":     dism,
            "innings":        r["innings_count"],
            "average":        round(runs / dism, 2) if dism > 0 else None,
            "strike_rate":    round(runs / balls * 100, 2) if balls > 0 else 0,
            "dot_ball_pct":   round(r["dots"] / balls * 100, 1) if balls > 0 else None,
            "source":         "delivery",
        }

    for r in scorecard_rows:
        style = r["bowling_style"]
        if style in results:
            continue  # already have better delivery-level data
        balls = r["balls_faced"] or 0
        dism  = r["dismissals"] or 0
        runs  = r["runs"] or 0
        results[style] = {
            "bowling_style":  style,
            "runs":           runs,
            "balls_faced":    balls,
            "dismissals":     dism,
            "innings":        r["innings_count"],
            "average":        round(runs / dism, 2) if dism > 0 else None,
            "strike_rate":    round(runs / balls * 100, 2) if balls > 0 else 0,
            "dot_ball_pct":   None,
            "source":         "scorecard",
        }

    return {"player_id": player_id, "breakdown": list(results.values())}


@router.get("/phase-analysis/{player_id}")
def get_phase_analysis(
    player_id: str,
    phase1_label: str = "Powerplay",    phase1_start: int = 1,  phase1_end: int = 10,
    phase2_label: str = "Middle Overs", phase2_start: int = 11, phase2_end: int = 40,
    phase3_label: str = "Death Overs",  phase3_start: int = 41, phase3_end: int = 50,
    phase4_label: str | None = None,    phase4_start: int | None = None, phase4_end: int | None = None,
    db: Session = Depends(get_db),
):
    """
    Phase-wise batting stats. Accepts 3 or 4 phase boundaries as query params
    so the frontend PhaseToggle drives the granularity. Delivery data only.
    """
    phases = [
        (phase1_label, phase1_start, phase1_end),
        (phase2_label, phase2_start, phase2_end),
        (phase3_label, phase3_start, phase3_end),
    ]
    if phase4_label and phase4_start and phase4_end:
        phases.append((phase4_label, phase4_start, phase4_end))

    query = text("""
        SELECT
            d.over_number,
            d.runs_off_bat,
            d.extras_type,
            d.is_wicket,
            d.dismissed_mora_batter_id,
            d.innings_id
        FROM deliveries d
        JOIN innings i ON i.id = d.innings_id
        JOIN matches m ON m.id = i.match_id
        WHERE d.mora_batter_id = :pid
          AND i.batting_team = 'MORA'
          AND m.status != 'PRE_TOSS_ABANDONED'
    """)

    rows = db.execute(query, {"pid": player_id}).mappings().all()

    results = []
    for label, start, end in phases:
        phase_balls = [r for r in rows if start <= r["over_number"] <= end]
        balls   = len(phase_balls)
        runs    = sum(r["runs_off_bat"] for r in phase_balls)
        dots    = sum(1 for r in phase_balls if r["runs_off_bat"] == 0 and not r["extras_type"])
        fours   = sum(1 for r in phase_balls if r["runs_off_bat"] == 4)
        sixes   = sum(1 for r in phase_balls if r["runs_off_bat"] == 6)
        wickets = sum(1 for r in phase_balls if r["is_wicket"] and r["dismissed_mora_batter_id"] == player_id)
        innings = len({r["innings_id"] for r in phase_balls})

        results.append({
            "phase":          label,
            "runs":           runs,
            "balls":          balls,
            "wickets":        wickets,
            "innings":        innings,
            "strike_rate":    round(runs / balls * 100, 2) if balls > 0 else 0,
            "dot_ball_pct":   round(dots / balls * 100, 1) if balls > 0 else 0,
            "boundary_pct":   round((fours + sixes) / balls * 100, 1) if balls > 0 else 0,
        })

    # Coverage note
    coverage_q = text("""
        SELECT
            COUNT(DISTINCT mbp.innings_id)  AS total,
            COUNT(DISTINCT d.innings_id)    AS with_delivery
        FROM mora_batting_performances mbp
        LEFT JOIN deliveries d
            ON d.innings_id = mbp.innings_id AND d.mora_batter_id = :pid
        JOIN innings i ON i.id = mbp.innings_id
        JOIN matches m ON m.id = i.match_id
        WHERE mbp.player_id = :pid AND m.status != 'PRE_TOSS_ABANDONED'
    """)
    cov = db.execute(coverage_q, {"pid": player_id}).mappings().first()

    return {
        "player_id":      player_id,
        "phases":         results,
        "coverage_note":  f"Based on {cov['with_delivery']} of {cov['total']} innings with ball-by-ball data",
    }