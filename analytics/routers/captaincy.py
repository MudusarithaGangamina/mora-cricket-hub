from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

@router.get("/leaderboard")
def captaincy_leaderboard(db: Session = Depends(get_db)):
    """
    All captains ranked by win %. PRE_TOSS_ABANDONED excluded from win/loss.
    """
    query = text("""
        SELECT
            m.mora_captain_id                                           AS player_id,
            p.full_name                                                 AS player_name,
            p.batch_year,
            COUNT(*)                                                    AS matches,
            COUNT(*) FILTER (WHERE m.result_type = 'WIN')               AS wins,
            COUNT(*) FILTER (WHERE m.result_type = 'LOSS')              AS losses,
            ROUND(
                COUNT(*) FILTER (WHERE m.result_type = 'WIN') * 100.0
                / NULLIF(COUNT(*) FILTER (WHERE m.result_type IN ('WIN','LOSS')), 0)
            , 1)                                                        AS win_pct,
            COUNT(*) FILTER (WHERE m.toss_held AND m.toss_winner = 'MORA') AS toss_wins,
            COUNT(*) FILTER (WHERE m.toss_held)                         AS toss_matches,
            COUNT(*) FILTER (WHERE m.mora_batting_first AND m.result_type = 'WIN')  AS bat_first_wins,
            COUNT(*) FILTER (WHERE m.mora_batting_first)                AS bat_first_matches,
            COUNT(*) FILTER (WHERE NOT m.mora_batting_first AND m.result_type = 'WIN') AS chase_wins,
            COUNT(*) FILTER (WHERE NOT m.mora_batting_first)            AS chase_matches
        FROM matches m
        JOIN players p ON p.id = m.mora_captain_id
        WHERE m.mora_captain_id IS NOT NULL
          AND m.status != 'PRE_TOSS_ABANDONED'
        GROUP BY m.mora_captain_id, p.full_name, p.batch_year
        ORDER BY win_pct DESC NULLS LAST, matches DESC
    """)
    rows = db.execute(query).mappings().all()
    return [dict(r) for r in rows]


@router.get("/profile/{player_id}")
def captaincy_profile(player_id: str, db: Session = Depends(get_db)):
    """Full profile for one captain."""
    summary_q = text("""
        SELECT
            COUNT(*)                                                    AS matches,
            COUNT(*) FILTER (WHERE result_type = 'WIN')                 AS wins,
            COUNT(*) FILTER (WHERE result_type = 'LOSS')                AS losses,
            ROUND(
                COUNT(*) FILTER (WHERE result_type = 'WIN') * 100.0
                / NULLIF(COUNT(*) FILTER (WHERE result_type IN ('WIN','LOSS')), 0)
            , 1)                                                        AS win_pct,
            COUNT(*) FILTER (WHERE toss_held AND toss_winner = 'MORA')  AS toss_wins,
            COUNT(*) FILTER (WHERE venue_type = 'HOME' AND result_type = 'WIN') AS home_wins,
            COUNT(*) FILTER (WHERE venue_type = 'AWAY' AND result_type = 'WIN') AS away_wins,
            COUNT(*) FILTER (WHERE venue_type = 'NEUTRAL' AND result_type = 'WIN') AS neutral_wins
        FROM matches
        WHERE mora_captain_id = :pid AND status != 'PRE_TOSS_ABANDONED'
    """)

    batting_q = text("""
        SELECT
            CASE WHEN m.mora_captain_id = :pid THEN 'as_captain'
                 ELSE 'not_captain' END                                 AS context,
            COUNT(*)                                                    AS innings,
            SUM(mbp.runs)                                               AS runs,
            COUNT(*) FILTER (WHERE NOT mbp.is_not_out)                  AS dismissals,
            ROUND(SUM(mbp.runs) * 100.0 / NULLIF(SUM(mbp.balls_faced), 0), 2) AS strike_rate
        FROM mora_batting_performances mbp
        JOIN innings i ON i.id = mbp.innings_id
        JOIN matches m ON m.id = i.match_id
        WHERE mbp.player_id = :pid
          AND mbp.dismissal_type != 'DNB'
          AND m.status != 'PRE_TOSS_ABANDONED'
        GROUP BY context
    """)

    best_wins_q = text("""
        SELECT
            m.match_date, o.name AS opponent, m.result_margin,
            m.result_margin_type, m.venue_type, m.surface_type
        FROM matches m
        JOIN opponents o ON o.id = m.opponent_id
        WHERE m.mora_captain_id = :pid AND m.result_type = 'WIN'
        ORDER BY m.result_margin DESC NULLS LAST
        LIMIT 5
    """)

    summary   = db.execute(summary_q,   {"pid": player_id}).mappings().first()
    batting   = db.execute(batting_q,   {"pid": player_id}).mappings().all()
    best_wins = db.execute(best_wins_q, {"pid": player_id}).mappings().all()

    return {
        "player_id":    player_id,
        "summary":      dict(summary) if summary else {},
        "batting_split": [dict(r) for r in batting],
        "best_wins":    [dict(r) for r in best_wins],
    }