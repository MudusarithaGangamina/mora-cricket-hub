from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import batting, bowling, captaincy, team, match
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Mora Cricket Hub — Analytics API",
    description=(
        "Read-only analytics service for University of Moratuwa Cricket Club. "
        "All writes go through the .NET API. "
        "Ball-by-ball data powers phase analysis, bowling type breakdowns, "
        "partnerships, worm charts, and captaincy records."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Register routers
app.include_router(batting.router,   prefix="/analytics/batting",   tags=["Batting"])
app.include_router(bowling.router,   prefix="/analytics/bowling",   tags=["Bowling"])
app.include_router(captaincy.router, prefix="/analytics/captaincy", tags=["Captaincy"])
app.include_router(team.router,      prefix="/analytics/team",      tags=["Team"])
app.include_router(match.router,     prefix="/analytics/match",     tags=["Match"])

@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": "mora-cricket-analytics",
        "version": "1.0.0",
    }