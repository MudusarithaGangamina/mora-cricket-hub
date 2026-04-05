# Mora Cricket Hub — Product Requirements Document

**Version:** 2.0  
**Author:** [Your Name]  
**Date:** April 2026  
**Status:** Approved — In Development

---

## 1. Vision

Mora Cricket Hub is a full-stack cricket analytics and team management platform built exclusively for the University of Moratuwa Cricket Club. It serves as the single source of truth for all match data from the 2022 season onwards, enabling data-driven selection decisions, performance tracking, and public-facing team storytelling.

The platform replaces manual Excel-based tracking with a structured, queryable database and delivers insights that are impossible with spreadsheets — batter performance vs left-arm spin, bowler effectiveness against left-handers, captaincy win rates, home/away splits, worm chart match progression, career milestone timelines, and surface/format-aware analytics. The platform also supports the upcoming Inter-University T20 tournament.

---

## 2. Users & Roles

| Role | Description | Access |
|---|---|---|
| **Admin** | Team management (captain, coach, analyst) | Full access — data entry, editing, deletion, all analytics including dropped catches |
| **Player** | Squad member | Read-only access to all analytics including personal detailed stats |
| **Public** | Anyone with the link | Read-only access to public dashboard — team stats, match results, records, leaderboards |

Authentication is JWT-based. Admin and Player accounts are created manually by the Admin — there is no public registration.

---

## 3. Scope

### 3.1 In Scope (v1.0)

- Match data entry portal (Admin only)
- Historical data entry for all 64 matches from 2022 to present
- Delivery-level data storage with optional shot/direction data (tiered coverage)
- Player career statistics — batting, bowling, fielding
- Captaincy records — win %, toss record, contribution in matches captained
- Player of the Match / Man of the Match awards
- Home / Away / Neutral venue classification and split analytics
- Batting milestones: 30s, 50s, 100s
- Bowling milestones: 4-wicket hauls, 5-wicket hauls, hat-tricks
- Auto-detected career milestone events (debut, first 50, first 100, first 5-for, etc.)
- Batting role classification per season (Opener, Top Order, Middle Order, Finisher, Tail)
- Jersey number tracking per season
- Playing XI explicitly recorded per match
- Tournament group stage / knockout stage classification
- Head-to-head W/L records against each opponent
- Win/loss and chasing/setting performance splits for all players
- Phase analysis — both 3-phase (1–10, 11–40, 41–50) and 4-phase (1–6, 7–15, 16–40, 41–50) with toggle
- Bowler-batter matchup on all three axes: LHB/RHB, pace/spin, full bowling style sub-type
- Over-by-over worm chart derived from ball-by-ball data
- Team scoring pattern comparison vs opponent on match page
- Records page — highest team total, lowest, biggest win, best individual performances
- Toss analytics — win rate, batting first vs second win rates and average scores
- Public analytics dashboard
- Player profile photos, nicknames, faculty and degree tracking
- Pitch/surface tracking (matting vs turf) per match
- Ball colour tracking (red vs white) per match
- Bowling side tracking (over/around the wicket) per delivery where available
- T20 format support (Inter-University T20 — data entry begins when tournament starts)
- Wicketkeeper-per-innings tracking (covers mid-innings keeper swaps)

### 3.2 Explicitly Out of Scope (v1.0)

- Live scoring / real-time match updates
- Mobile application
- Push notifications
- Video integration
- Opposition team career analytics (we track their scorecards, not their careers)
- Player availability / injury tracking
- Machine learning models (planned for v2.0)
- Public user registration

---

## 4. Feature Requirements

### 4.1 Match Management

**US-001** As an Admin, I want to create a match with full metadata — date, venue (with Home/Away/Neutral classification), tournament, round type (First Round/Second Round/Pre-Quarter-Final/Quarter-Final/Semi-Final/Consolation Final/Final), opponent, toss details (or flag that no toss was held), result, captain, Player of the Match, playing surface (matting/turf), and ball colour (red/white) — so that all match context is captured.

**US-002** As an Admin, I want to record the playing XI explicitly per match so that selection history is preserved independent of batting/bowling performances.

**US-003** As an Admin, I want to mark a match as Pre-Toss Abandoned (washed out before toss — counts for team records but not player stats), Abandoned (after toss, before play), No Result, Tie (Toss), or Tie (Bowl-out) so that all edge cases are handled correctly and team vs player stat inclusion is respected.

**US-004** As an Admin, I want to flag when DLS or Parabola minimum was applied and store the revised target and overs so that interrupted matches are accurately recorded.

**US-005** As a Public user, I want to view a match scorecard replicating the SLC Cricket Scorers layout — batting, bowling, fall of wickets — so that data accuracy can be verified and results shared.

**US-006** As a Public user, I want to see a worm chart showing over-by-over score progression for both innings so that match momentum is visually clear.

**US-007** As a Public user, I want to see a 10-over block run-rate comparison between our innings and the opponent's innings on the match page so that scoring pattern differences are visible.

### 4.2 Data Entry — Deliveries

**US-008** As an Admin, I want to enter ball-by-ball delivery data including batter, bowler, runs, extras, and wicket details so that phase and matchup analyses are possible.

**US-009** As an Admin, I want to select shot type and direction zone from a visual wagon wheel UI (not free text) so that shot data is consistent across all scorers.

**US-009b** As an Admin, I want to optionally record whether the bowler was bowling over or around the wicket for each delivery where the commentary provides it so that bowling angle data is preserved where available.

**US-010** As an Admin, I want to set the commentary coverage tier (NONE / KEY / FULL) per innings so that analytics queries correctly interpret missing shot/direction data.

**US-010b** As an Admin, I want to record the wicketkeeper separately per innings so that mid-innings keeper swaps (where the original keeper comes on to bowl) are accurately tracked.

**US-011** As an Admin, I want to skip delivery entry and use scorecard-level data only so that data entry is never blocked on imperfect coverage.

### 4.3 Player Management — Mora Squad

**US-012** As an Admin, I want to create and edit player profiles including name, batch year, batting style, bowling style, and jersey number per season so that career tracking is accurate.

**US-012b** As an Admin, I want to add a profile photo, nickname, faculty, and degree to each player profile so that the public dashboard feels personal and connected to the university identity.

**US-013** As an Admin, I want to assign a batting role (Opener, Top Order, Middle Order, Finisher, Tail) to each player per season so that role-based analytics are possible.

**US-014** As a Public user, I want to view a player profile page showing career batting stats, bowling stats, fielding stats, captaincy record, awards, and milestone timeline so that a complete player story is visible.

**US-015** As a Public user, I want to see a player's batting stats split by: (a) bowling style faced, (b) bowling category (pace vs spin), (c) batter's hand vs bowler's arm combination, (d) match phase, (e) home/away/neutral, (f) win/loss, and (g) batting first/chasing so that technical strengths and contexts are fully understood.

**US-016** As a Public user, I want to compare two players head-to-head across all career metrics so that selection discussions are data-driven.

**US-017** As a Public user, I want to see auto-detected career milestone events (debut, first 30, first 50, first 100, first 5-for, first hat-trick) on a player's timeline so that career progression is celebrated.

### 4.4 Opponent Management

**US-018** As an Admin, I want to register opponent teams and optionally register individual opponent players with their batting style and bowling style so that matchup analysis is enriched.

**US-019** As an Admin, I want to enter opponent batting and bowling performances using either a linked player record or just a name string so that data entry is never blocked.

**US-020** As a Public user, I want to see our head-to-head record against each opponent (matches played, wins, losses, ties, abandoned) so that rivalry context is clear.

### 4.5 Analytics — Batting

**US-021** As a Public user, I want to see a batting leaderboard ranked by Batting Index (composite of average, SR, consistency, duck rate) so that overall best batters are immediately obvious.

**US-022** As a Public user, I want to see the Average vs Strike Rate quadrant chart divided by team means so that batter roles are visually classified.

**US-023** As a Public user, I want to toggle between 3-phase (1–10, 11–40, 41–50) and 4-phase (1–6, 7–15, 16–40, 41–50) views for all phase-based analytics so that I can choose the granularity appropriate to my question.

**US-024** As a Public user, I want to see each batter's average and SR against: right-arm pace, right-arm medium, off-spin, leg-spin, left-arm pace, left-arm medium, and left-arm orthodox spin individually so that matchup selection is precise.

**US-025** As a Public user, I want to see each batter's home/away/neutral split so that ground-specific strengths are visible.

**US-026** As a Public user, I want to see each batter's win/loss split and chasing/setting split so that clutch performance is quantifiable.

**US-027** As a Public user, I want to see partnership data — which pairs score most, fastest, and most reliably so that batting order decisions are data-driven.

**US-028** As a Public user, I want to see a wagon wheel for batters in innings with FULL or KEY coverage with a clear disclaimer showing coverage basis so that shot analysis is available where data permits.

**US-029** As a Public user, I want to see batting milestone counts (30s, 50s, 100s) per player on leaderboards so that scoring consistency is visible.

### 4.6 Analytics — Bowling

**US-030** As a Public user, I want to see a bowling leaderboard ranked by wickets, economy, and strike rate so that our best bowling options are clear.

**US-031** As a Public user, I want to see each bowler's economy, wicket rate, dot ball %, and boundary conceded % split by (a) RHB vs LHB faced, (b) match phase, (c) home/away/neutral, and (d) win/loss so that bowling matchup decisions are fully informed.

**US-032** As a Public user, I want to see 4-wicket haul, 5-wicket haul, and hat-trick counts per bowler as career stats so that bowling peaks are celebrated.

### 4.7 Analytics — Fielding

**US-033** As a Public user, I want to see fielding contribution per player (catches, run-outs, stumpings) as career totals and per-match averages so that fielding is a first-class tracked dimension.

**US-034** As an Admin, I want to optionally record dropped catches per player per innings so that fielding reliability is tracked (Admin-only — not publicly visible).

### 4.8 Captaincy Analytics

**US-035** As a Public user, I want to see a captaincy leaderboard showing who has captained most, with their win %, toss record, and average team score while captaining so that leadership effectiveness is visible.

**US-036** As a Public user, I want to see each captain's full captaincy profile — matches as captain, wins/losses, toss win/decision breakdown, biggest wins, and their own batting and bowling contributions in matches they captained vs matches they didn't so that captain impact is measurable.


### 4.9 Team Records Page

**US-038** As a Public user, I want a dedicated Records page showing:
- Highest team total (batting)
- Lowest team total (batting)  
- Highest total conceded (bowling)
- Lowest total conceded (bowling, i.e. best bowling dismissals)
- Biggest win by runs
- Biggest win by wickets
- Narrowest win by runs / wickets
- Individual: highest score, best bowling figures, most catches in a match
- Most runs in a season (per player)
- Most wickets in a season (per player)

So that team and individual peaks are celebrated and easy to find.

### 4.10 Team & Batch Analytics

**US-039** As a Public user, I want to see season-by-season team performance trends — win/loss ratio, average score batting first and second, average wickets taken so that team trajectory is visible.

**US-040** As a Public user, I want to see batch/cohort comparisons — average runs, wickets, matches, and contribution per batch year so that the impact of each intake is clear.

**US-041** As a Public user, I want to see toss analytics — our toss win rate, what decision we make when we win the toss, our win rate batting first vs chasing, and average scores in each scenario so that toss strategy is informed.

**US-042** As a Public user, I want to see home/away/neutral win rates for the team overall and per season so that ground advantage is quantified.

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time | < 2s for dashboard (cached/computed stats) |
| Data entry | Full match enterable in under 60 minutes |
| Uptime | Best-effort on free hosting tiers |
| Browser support | Chrome, Firefox, Safari — latest two versions |
| Mobile | Dashboard readable on mobile; data entry portal desktop-optimised |
| Data integrity | All FK constraints enforced; no orphaned records |
| Security | JWT auth; Admin endpoints protected; dropped catches never publicly exposed |

---

## 6. Data Coverage Policy

All analytics queries must state their data coverage basis:

| Source | Coverage label | When displayed |
|---|---|---|
| Scorecard data | "All X matches" | Always — runs, wickets, economy from scorecard |
| Delivery data | "X of Y matches with ball-by-ball data" | Phase analysis, dot balls, partnerships, matchups |
| Shot/direction data | "Based on X innings with shot data" | Wagon wheel, shot type breakdowns |

This policy is enforced in the UI via the `DataCoverageDisclaimer` component which is mandatory on any chart using delivery or shot data.

---

## 7. Special Match Handling

| Situation | Status | Result Type | Notes |
|---|---|---|---|
| Normal completed match | COMPLETED | WIN / LOSS | Standard |
| Washed out before toss | PRE_TOSS_ABANDONED | ABANDONED | No toss, no XIs, no innings. Counts in team match tally only — excluded from all player stats |
| Abandoned after toss, before play | ABANDONED | ABANDONED | Toss recorded, no innings records |
| Abandoned mid-match | ABANDONED_MID | ABANDONED | Partial innings kept |
| DLS/Parabola applied | COMPLETED | WIN / LOSS | dls_applied=true, revised fields set |
| Tie resolved by toss | COMPLETED | TIE_TOSS | — |
| Tie resolved by bowl-out | COMPLETED | TIE_BOWL_OUT | — |
| No result | NO_RESULT | NR | — |

---

## 8. Success Metrics (v1.0)

- All 64 historical matches entered and verified
- Public dashboard live and shareable via URL
- Delivery-level data entered for at least 30 matches
- Shot/direction data available for at least 10 innings
- Records page live with all team and individual records populated
- Captaincy, home/away, and phase analytics working end-to-end
- System actively used by team management for the 2026 season

---

## 9. Future Roadmap (v2.0 — Post Final Exam)

- Win probability model (ML — scikit-learn, trained on over-by-over state)
- Optimal batting order recommendation engine
- Player form index (exponentially weighted recent vs historical)
- Opposition scouting report generator (based on their scorecard patterns)
- Mobile-optimised data entry PWA
- Player comparison radar chart (multi-dimensional)
