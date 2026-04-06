from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

@router.get("/records")
def team_records(db: Session = Depends(get_db)):
    queries = {
        "highest_team_total": text("""
            SELECT i.total_runs, i.total_wickets, i.total_overs_faced,
                   m.match_date, o.name AS opponent, m.venue_type, m.surface_type
            FROM innings i
            JOIN matches m ON m.id = i.match_id
            JOIN opponents o ON o.id = m.opponent_id
            WHERE i.batting_team = 'MORA' AND m.status != 'PRE_TOSS_ABANDONED'
            ORDER BY i.total_runs DESC LIMIT 1
        """),
        "lowest_team_total": text("""
            SELECT i.total_runs, i.total_wickets, i.total_overs_faced,
                   m.match_date, o.name AS opponent, m.venue_type
            FROM innings i
            JOIN matches m ON m.id = i.match_id
            JOIN opponents o ON o.id = m.opponent_id
            WHERE i.batting_team = 'MORA' AND i.total_wickets = 10
              AND m.status != 'PRE_TOSS_ABANDONED'
            ORDER BY i.total_runs ASC LIMIT 1
        """),
        "biggest_win_runs": text("""
            SELECT m.result_margin, m.match_date, o.name AS opponent, m.venue_type
            FROM matches m JOIN opponents o ON o.id = m.opponent_id
            WHERE m.result_type = 'WIN' AND m.result_margin_type = 'RUNS'
              AND m.status != 'PRE_TOSS_ABANDONED'
            ORDER BY m.result_margin DESC LIMIT 1
        """),
        "biggest_win_wickets": text("""
            SELECT m.result_margin, m.match_date, o.name AS opponent, m.venue_type
            FROM matches m JOIN opponents o ON o.id = m.opponent_id
            WHERE m.result_type = 'WIN' AND m.result_margin_type = 'WICKETS'
              AND m.status != 'PRE_TOSS_ABANDONED'
            ORDER BY m.result_margin DESC LIMIT 1
        """),
        "individual_highest_score": text("""
            SELECT p.full_name, mbp.runs, mbp.is_not_out, mbp.balls_faced,
                   m.match_date, o.name AS opponent
            FROM mora_batting_performances mbp
            JOIN players p ON p.id = mbp.player_id
            JOIN innings i ON i.id = mbp.innings_id
            JOIN matches m ON m.id = i.match_id
            JOIN opponents o ON o.id = m.opponent_id
            WHERE m.status != 'PRE_TOSS_ABANDONED'
            ORDER BY mbp.runs DESC LIMIT 1
        """),
        "best_bowling": text("""
            SELECT p.full_name, mbp.wickets, mbp.runs_conceded, mbp.overs_bowled,
                   m.match_date, o.name AS opponent
            FROM mora_bowling_performances mbp
            JOIN players p ON p.id = mbp.player_id
            JOIN innings i ON i.id = mbp.innings_id
            JOIN matches m ON m.id = i.match_id
            JOIN opponents o ON o.id = m.opponent_id
            WHERE m.status != 'PRE_TOSS_ABANDONED'
            ORDER BY mbp.wickets DESC, mbp.runs_conceded ASC LIMIT 1
        """),
    }
    return {key: dict(db.execute(q).mappings().first() or {}) for key, q in queries.items()}


@router.get("/toss")
def toss_analysis(db: Session = Depends(get_db)):
    query = text("""
        SELECT
            COUNT(*)                                                       AS total_matches,
            COUNT(*) FILTER (WHERE toss_held)                              AS matches_with_toss,
            COUNT(*) FILTER (WHERE toss_held AND toss_winner = 'MORA')     AS toss_wins,
            COUNT(*) FILTER (WHERE toss_held AND toss_winner = 'MORA'
                              AND toss_decision = 'BAT')                   AS won_toss_chose_bat,
            COUNT(*) FILTER (WHERE toss_held AND toss_winner = 'MORA'
                              AND toss_decision = 'FIELD')                 AS won_toss_chose_field,
            COUNT(*) FILTER (WHERE mora_batting_first = true)              AS bat_first_matches,
            COUNT(*) FILTER (WHERE mora_batting_first = true
                              AND result_type = 'WIN')                     AS bat_first_wins,
            COUNT(*) FILTER (WHERE mora_batting_first = false)             AS chase_matches,
            COUNT(*) FILTER (WHERE mora_batting_first = false
                              AND result_type = 'WIN')                     AS chase_wins
        FROM matches
        WHERE status != 'PRE_TOSS_ABANDONED'
    """)
    return dict(db.execute(query).mappings().first() or {})


@router.get("/head-to-head")
def head_to_head(db: Session = Depends(get_db)):
    query = text("""
        SELECT
            o.id AS opponent_id, o.name AS opponent, o.short_name,
            COUNT(*)                                                       AS played,
            COUNT(*) FILTER (WHERE m.result_type = 'WIN')                  AS wins,
            COUNT(*) FILTER (WHERE m.result_type = 'LOSS')                 AS losses,
            COUNT(*) FILTER (WHERE m.result_type IN ('TIE_TOSS','TIE_BOWL_OUT')) AS ties,
            COUNT(*) FILTER (WHERE m.status IN ('ABANDONED','NO_RESULT','ABANDONED_MID')) AS no_result,
            ROUND(
                COUNT(*) FILTER (WHERE m.result_type = 'WIN') * 100.0
                / NULLIF(COUNT(*) FILTER (WHERE m.result_type IN ('WIN','LOSS')), 0)
            , 1)                                                           AS win_pct,
            MAX(m.match_date)                                              AS last_played
        FROM opponents o
        JOIN matches m ON m.opponent_id = o.id
        WHERE m.status != 'PRE_TOSS_ABANDONED'
        GROUP BY o.id, o.name, o.short_name
        ORDER BY played DESC
    """)
    return [dict(r) for r in db.execute(query).mappings().all()]


@router.get("/home-away")
def home_away_record(db: Session = Depends(get_db)):
    query = text("""
        SELECT
            venue_type,
            COUNT(*)                                                       AS played,
            COUNT(*) FILTER (WHERE result_type = 'WIN')                    AS wins,
            COUNT(*) FILTER (WHERE result_type = 'LOSS')                   AS losses,
            ROUND(
                COUNT(*) FILTER (WHERE result_type = 'WIN') * 100.0
                / NULLIF(COUNT(*) FILTER (WHERE result_type IN ('WIN','LOSS')), 0)
            , 1)                                                           AS win_pct
        FROM matches
        WHERE status != 'PRE_TOSS_ABANDONED'
        GROUP BY venue_type
    """)
    return [dict(r) for r in db.execute(query).mappings().all()]


@router.get("/surface-split")
def surface_split(db: Session = Depends(get_db)):
    query = text("""
        SELECT
            surface_type,
            COUNT(*)                                                       AS played,
            COUNT(*) FILTER (WHERE result_type = 'WIN')                    AS wins,
            COUNT(*) FILTER (WHERE result_type = 'LOSS')                   AS losses,
            ROUND(
                COUNT(*) FILTER (WHERE result_type = 'WIN') * 100.0
                / NULLIF(COUNT(*) FILTER (WHERE result_type IN ('WIN','LOSS')), 0)
            , 1)                                                           AS win_pct
        FROM matches
        WHERE status = 'COMPLETED'
        GROUP BY surface_type
    """)
    return [dict(r) for r in db.execute(query).mappings().all()]