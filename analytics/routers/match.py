from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

@router.get("/worm/{match_id}")
def worm_chart(match_id: str, db: Session = Depends(get_db)):
    """
    Over-by-over cumulative runs for both innings.
    Uses pre-computed over_summaries table — one fast query.
    """
    query = text("""
        SELECT
            os.over_number,
            os.runs_in_over,
            os.wickets_in_over,
            os.dots_in_over,
            os.fours_in_over,
            os.sixes_in_over,
            os.cumulative_runs,
            os.cumulative_wickets,
            i.batting_team,
            i.innings_number
        FROM over_summaries os
        JOIN innings i ON i.id = os.innings_id
        WHERE i.match_id = :mid AND i.innings_type = 'NORMAL'
        ORDER BY i.innings_number, os.over_number
    """)
    rows = db.execute(query, {"mid": match_id}).mappings().all()
    mora = [dict(r) for r in rows if r["batting_team"] == "MORA"]
    opp  = [dict(r) for r in rows if r["batting_team"] == "OPPONENT"]
    return {"match_id": match_id, "mora": mora, "opponent": opp}


@router.get("/scoring-comparison/{match_id}")
def scoring_comparison(match_id: str, db: Session = Depends(get_db)):
    """10-over block comparison between both innings."""
    query = text("""
        SELECT
            CASE
                WHEN os.over_number BETWEEN 1  AND 10 THEN '1-10'
                WHEN os.over_number BETWEEN 11 AND 20 THEN '11-20'
                WHEN os.over_number BETWEEN 21 AND 30 THEN '21-30'
                WHEN os.over_number BETWEEN 31 AND 40 THEN '31-40'
                WHEN os.over_number BETWEEN 41 AND 50 THEN '41-50'
            END                             AS block,
            i.batting_team,
            SUM(os.runs_in_over)            AS runs,
            SUM(os.wickets_in_over)         AS wickets,
            SUM(os.dots_in_over)            AS dots,
            SUM(os.fours_in_over)           AS fours,
            SUM(os.sixes_in_over)           AS sixes
        FROM over_summaries os
        JOIN innings i ON i.id = os.innings_id
        WHERE i.match_id = :mid AND i.innings_type = 'NORMAL'
        GROUP BY block, i.batting_team
        ORDER BY block, i.batting_team
    """)
    return [dict(r) for r in db.execute(query, {"mid": match_id}).mappings().all()]