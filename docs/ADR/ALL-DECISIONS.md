# ADR-001: Database — PostgreSQL on Neon.tech

**Date:** April 2026 | **Status:** Accepted

## Decision
PostgreSQL on Neon.tech (serverless).

## Reasoning
Cricket data is deeply relational — deliveries join to batters, bowlers, innings, matches, fielders, and opponents. The analytical queries needed (phase splits, bowling style breakdowns, captaincy win rates) use SQL window functions, conditional aggregates (`AVG(runs) FILTER (WHERE opp_bowler_style='SLA')`), and multi-table joins that are natural in SQL and painful in document stores.

PostgreSQL specifically over MySQL: superior window functions, native `FILTER` clause on aggregates, UUID support, and best ecosystem fit for both EF Core (Npgsql) and Python (psycopg2/SQLAlchemy).

Neon.tech over self-hosted: free tier (0.5GB, sufficient), serverless branching like Git branches for safe migration testing, built-in connection pooling (critical for Railway's serverless .NET), and standard PostgreSQL — zero vendor lock-in.

## Consequences
- Schema migrations owned exclusively by EF Core. Python FastAPI is read-only — never writes.
- Connection pooling via Neon's built-in PgBouncer to handle Railway cold-start connection spikes.

---

# ADR-002: Dual API — ASP.NET Core + FastAPI

**Date:** April 2026 | **Status:** Accepted

## Decision
Two services sharing one database: ASP.NET Core 8 (CRUD + auth) and FastAPI Python 3.12 (analytics).

## Responsibility Split

| Category | Service |
|---|---|
| Auth, player/match/opponent CRUD | .NET |
| Scorecard-level career stats | .NET |
| Phase analysis, bowling style breakdown | FastAPI |
| Captaincy analytics, home/away splits | FastAPI |
| Win/loss + chasing/setting splits | FastAPI |
| Partnership analysis, worm chart data | FastAPI |
| Wagon wheel aggregation | FastAPI |
| Records page queries | FastAPI |
| ML models (v2.0) | FastAPI |

## Reasoning
Python's analytics ecosystem (Pandas, NumPy, scikit-learn) has no real .NET equivalent. When v2.0 adds win probability models and player clustering, Python is the only practical choice. But EF Core's migrations, FluentValidation, and ASP.NET Identity make the .NET side far superior for write operations where data integrity is critical.

FastAPI is strictly read-only on the database. Two ORMs writing simultaneously creates integrity risk — this constraint prevents that entirely.

---

# ADR-003: Shot/Direction Data — Tiered Coverage

**Date:** April 2026 | **Status:** Accepted

## Decision
Store `shot_type` and `direction_zone` as always-nullable columns on every delivery. Store a `commentary_coverage` enum (NONE/KEY/FULL) on each innings. Standardise direction input to 9 fixed zones entered via wagon wheel UI — never free text.

## Reasoning
Our 64 matches have three tiers: no shot data, boundaries/wickets only, and full per-ball data. Partial data with known provenance is analytically valid. The `commentary_coverage` flag lets every query self-report: *"Based on 14 of 47 innings."*

The fixed 9-zone wagon wheel picker eliminates scorer inconsistency (the "midwicket vs cover point" problem) for all future matches. Historical inconsistencies are handled by the NONE/KEY coverage flag excluding them from shot analysis.

---

# ADR-004: Opponent Players — Lightweight Registry with Denormalised Style

**Date:** April 2026 | **Status:** Accepted

## Decision
`opponent_players` is an optional enrichment registry, not a required entity. Every performance table stores `player_name varchar` as a mandatory string alongside a nullable `opponent_player_id` FK. `bowling_style` and `batting_style` are denormalised onto deliveries and performances at time of entry.

## Reasoning
Forcing FK relationships would block data entry for any unregistered opponent — impractical for 64 historical matches. The denormalised style on deliveries is intentional: if an opponent player record is later corrected, historical deliveries retain the style as originally known, preventing retroactive corruption of matchup analytics.

The `dismissed_by_opp_bowler_style` column on `mora_batting_performances` is the critical fallback — it enables batter vs bowling type analysis even for innings with no delivery data, purely from scorecard-level dismissal records.

---

# ADR-005: Player Seasons — Jersey Numbers and Roles Per Season

**Date:** April 2026 | **Status:** Accepted

## Decision
Jersey numbers and batting roles (Opener, Top Order, Middle Order, Finisher, Tail) are stored in a `player_seasons` junction table, not on the `players` entity.

## Reasoning
Jersey numbers change between seasons for some players. Batting roles evolve — a player who bats 6 in their first season may become a top-order batter by their third. Storing these per-season preserves historical accuracy and enables role-based analytics (e.g. "how do our finishers perform in death overs?") with correct historical role assignment.

---

# ADR-006: Over Summaries — Pre-computed Worm Chart Data

**Date:** April 2026 | **Status:** Accepted

## Decision
Maintain an `over_summaries` table with pre-computed per-over aggregates (runs, wickets, cumulative totals) populated by a background process after delivery data entry.

## Reasoning
The worm chart needs `cumulative_runs` at every over for both innings on the same chart. Computing this live from deliveries requires a window function aggregation over thousands of rows on every page load. Pre-computing it once and storing it makes the match page fast. The background job runs automatically when delivery entry for an innings is marked complete.

---

# ADR-007: Milestone Detection — Background Job, Not Triggers

**Date:** April 2026 | **Status:** Accepted

## Decision
Career milestone events (debut, first 50, first 100, first 5-for, hat-trick, etc.) are detected and written to `player_milestones` by a background job triggered after data entry, not by database triggers.

## Reasoning
Database triggers are hard to debug, invisible to application developers, and can cause unexpected side effects during bulk historical data import (all 64 matches entered at once would fire triggers thousands of times in undefined order). A background job runs explicitly after entry is complete, processes milestones in chronological order, and can be re-run safely if logic changes.

---

# ADR-008: Records Page — Derived Queries, No Separate Table

**Date:** April 2026 | **Status:** Accepted

## Decision
The Records page is powered entirely by analytic queries against existing tables. No separate `team_records` table is maintained.

## Reasoning
Records are definitionally derived from the underlying data — storing them separately creates a synchronisation problem (what if a match is edited?). The queries are simple maximums and minimums against indexed columns: `MAX(total_runs)` from innings, `MAX(wickets)` from bowling performances, etc. These are fast even without pre-computation at this data scale (64–200 matches). Caching at the API layer (5-minute TTL) handles repeated requests without hitting the database.

---

# ADR-009: Phase Boundaries — Configurable, Not Hardcoded

**Date:** April 2026 | **Status:** Accepted

## Decision
Phase analysis supports two modes toggled by the user: 3-phase (1–10 / 11–40 / 41–50) and 4-phase (1–6 / 7–15 / 16–40 / 41–50). Phase boundaries are passed as parameters to FastAPI endpoints, not hardcoded.

## Reasoning
3-phase aligns with traditional cricket analysis and is more readable for non-technical stakeholders. 4-phase aligns more closely with how modern ODI cricket is tactically divided (with the powerplay as overs 1–6 specifically). Passing boundaries as query parameters means the analytics SQL uses `CASE WHEN over_number BETWEEN :phase1_start AND :phase1_end` — the same query serves both modes. No schema change needed to support additional phase configurations in future.

---

# ADR-010: Hosting — Vercel + Railway + Render + Neon

**Date:** April 2026 | **Status:** Accepted

| Service | Host | Reason |
|---|---|---|
| React frontend | Vercel | Best React/Vite deployment, free forever, global CDN, PR preview deploys |
| ASP.NET Core API | Railway | Best free-tier .NET support, GitHub auto-deploy, $5 credit monthly |
| FastAPI analytics | Render | Excellent Python/Docker support, free tier sufficient for read-only service |
| PostgreSQL | Neon.tech | See ADR-001 |

All services communicate over public HTTPS. CORS configured on both APIs to allow the Vercel domain. Cold starts on Railway/Render free tiers (~30s after inactivity) are acceptable for a portfolio project and documented in the README.


---

# ADR-011: PRE_TOSS_ABANDONED — Separate Status from ABANDONED

**Date:** April 2026 | **Status:** Accepted

## Decision
Introduce a distinct `PRE_TOSS_ABANDONED` match status for matches washed out before the toss was held, separate from `ABANDONED` (which means toss held, no play).

## Reasoning
The business rule is explicit: matches washed out before the toss count toward the team's match tally but not toward any player's statistics — because no playing XI was submitted and no toss was held. Conflating these with post-toss abandonments would either wrongly exclude team-level records or wrongly include matches in player stat denominators. The separate status makes this rule enforceable by a single WHERE clause: `WHERE status != 'PRE_TOSS_ABANDONED'` on any player-level query.

## Consequences
- Every player-level analytics query in FastAPI must include `AND m.status != 'PRE_TOSS_ABANDONED'`
- This filter is documented as a mandatory comment in the analytics query template
- Team-level queries (overall win/loss record) include PRE_TOSS_ABANDONED in the match count but exclude from win/loss ratio
- `toss_held`, `toss_winner`, `toss_decision`, `mora_batting_first` are all nullable to accommodate this status

---

# ADR-012: Surface & Ball Colour — Match-Level Attributes

**Date:** April 2026 | **Status:** Accepted

## Decision
Store `surface_type` (MATTING/TURF) and `ball_colour` (RED/WHITE) as match-level attributes, not delivery-level. Store `ball_type` (LEATHER/TAPE/TENNIS) separately as the material.

## Reasoning
Surface and ball colour are consistent for the entire match — they never change mid-match. Storing at match level is accurate and avoids denormalisation. The distinction between `ball_colour` and `ball_type` is important: a white leather ball is both WHITE and LEATHER; a red tape ball is RED and TAPE. They are orthogonal dimensions. Surface analytics (matting vs turf win rates, average scores) are a useful and simple addition given that UoM plays on both surfaces.

---

# ADR-013: T20 Format — In Scope from Inception

**Date:** April 2026 | **Status:** Accepted

## Decision
T20 format is in scope from v1.0 schema design, with data entry beginning when the Inter-University T20 tournament starts.

## Reasoning
The schema already accommodates T20 via `tournaments.format` and `tournaments.overs_per_side`. Phase boundaries differ (powerplay is overs 1–6 in both ODI and T20, but middle/death phases are compressed in T20). The `PhaseToggle` component's configurable boundaries handle this naturally. Moving T20 to in-scope now rather than v2.0 avoids a schema migration later and allows the team to start using the system for T20 from day one of that tournament.

---

# ADR-014: Bowling Side — Nullable Delivery Attribute, No Coverage Flag

**Date:** April 2026 | **Status:** Accepted

## Decision
Store `bowling_side` (OVER/AROUND) as a nullable column on the `deliveries` table. No innings-level coverage flag for this field — unlike shot/direction data, bowling side is per-delivery optional enrichment, not a tiered coverage concept.

## Reasoning
Shot/direction data has three coherent tiers (NONE/KEY/FULL) because some scorers record it for all balls, some for key moments, some never. Bowling side is simpler: it's mentioned in commentary when the bowler switches, and absent otherwise. A null value simply means "not recorded for this delivery" — no inference about coverage tier is needed. Queries that use bowling side just filter `WHERE bowling_side IS NOT NULL` on the deliveries they need.

---

# ADR-015: Player Profile Photos — Object Storage URL Pattern

**Date:** April 2026 | **Status:** Accepted

## Decision
Store player profile photos as URL strings in the `players.photo_url` column, not as binary data in PostgreSQL. Photos are stored in an object storage service (recommended: Cloudflare R2 free tier or Supabase Storage free tier).

## Reasoning
Storing binary image data in PostgreSQL is an antipattern — it bloats the database, slows backups, and bypasses CDN caching. Object storage provides a public URL that React can use directly in `<img src={player.photoUrl} />` with zero backend involvement. Cloudflare R2 is free for up to 10GB and serves files via CDN. The .NET API only handles the upload (receives file → uploads to R2 → stores the resulting URL). Photos for graduated/unknown players simply have `photo_url = null` and the UI shows a default avatar.
