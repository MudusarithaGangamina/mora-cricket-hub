// ============================================================
// MORA CRICKET HUB — Database Schema v2.0
// Paste this entire file at https://dbdiagram.io
// ============================================================

// ─────────────────────────────────────────────
// ENUMS (stored as varchar with application-level validation)
// ─────────────────────────────────────────────
// batting_style:       RHB | LHB
//
// bowling_style:       RF | RFM | RM | RMF | OB | LB | SLA | SLO | LM | LMF | LF
// bowling_category:    PACE | SPIN  (derived — never stored, always computed)
//
// match_status:        COMPLETED | ABANDONED | ABANDONED_MID | NO_RESULT
// result_type:         WIN | LOSS | TIE_TOSS | TIE_BOWL_OUT | NR | ABANDONED
// result_margin_type:  RUNS | WICKETS
// venue_type:          HOME | AWAY | NEUTRAL
//
// round_type:          LEAGUE | GROUP_STAGE | QUARTER_FINAL | SEMI_FINAL | FINAL | PLAYOFF
//
// innings_type:        NORMAL | SUPER_OVER
// batting_team:        MORA | OPPONENT
//
// extras_type:         WIDE | NO_BALL | LEG_BYE | BYE | PENALTY
// wicket_type:         BOWLED | CAUGHT | LBW | RUN_OUT | STUMPED | HIT_WICKET |
//                      OBSTRUCTING | RETIRED_HURT | TIMED_OUT
//
// shot_type:           DRIVE | PULL | HOOK | CUT | SWEEP | REVERSE_SWEEP | GLANCE |
//                      FLICK | LOFT | DEFENSIVE | LEAVE | PADDLE | SCOOP | OTHER
// direction_zone:      FINE_LEG | SQUARE_LEG | MIDWICKET | MID_ON | STRAIGHT |
//                      MID_OFF | COVER | POINT | THIRD_MAN | OTHER
// commentary_coverage: NONE | KEY | FULL
//
// batting_role:        OPENER | TOP_ORDER | MIDDLE_ORDER | FINISHER | TAIL
//
// surface_type:        MATTING | TURF
// ball_colour:         RED | WHITE
// bowling_side:        OVER | AROUND  (nullable per delivery — only when commentary provides it)
//
// match_status adds:   PRE_TOSS_ABANDONED (washed out before toss — team record only, no player stats)
// round_type adds:     FIRST_ROUND | SECOND_ROUND | PRE_QUARTER_FINAL | CONSOLATION_FINAL
//
// milestone_type:      DEBUT | FIRST_30 | FIRST_50 | FIRST_100 |
//                      FIRST_4FER | FIRST_5FER | FIRST_HATTRICK | FIRST_MOTM

// ─────────────────────────────────────────────
// MORA PLAYERS
// ─────────────────────────────────────────────

Table players {
  id uuid [pk, default: `gen_random_uuid()`]
  full_name varchar(100) [not null]
  short_name varchar(30) [not null]
  batch_year int [not null, note: 'e.g. 18 for 2018 intake']
  batting_style varchar(5) [not null, note: 'RHB | LHB']
  primary_bowling_style varchar(5) [note: 'RF|RFM|RM|OB|SLA|LB|LM|LFM|LF — null if non-bowler']
  debut_date date [note: 'auto-populated from first match played']
  nickname varchar(30) [note: 'e.g. "Gavi", "Muftee" — displayed on player cards']
  photo_url varchar(300) [note: 'URL to profile photo — stored in object storage (e.g. Cloudflare R2 or Supabase Storage)']
  faculty varchar(100) [note: 'e.g. Faculty of Engineering, Faculty of IT']
  degree varchar(100) [note: 'e.g. B.Sc. IT — may be unknown for graduated players']
  is_active boolean [not null, default: true]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    batch_year
    batting_style
    primary_bowling_style
  }
}

// Jersey numbers and batting roles are tracked per season, not per player globally
Table player_seasons {
  id uuid [pk, default: `gen_random_uuid()`]
  player_id uuid [not null, ref: > players.id]
  season_id uuid [not null, ref: > seasons.id]
  jersey_number int [note: 'can change season to season']
  batting_role varchar(15) [note: 'OPENER|TOP_ORDER|MIDDLE_ORDER|FINISHER|TAIL — admin assigned']

  indexes {
    (player_id, season_id) [unique]
    season_id
  }
}

// Auto-detected milestone events — populated by background job after data entry
Table player_milestones {
  id uuid [pk, default: `gen_random_uuid()`]
  player_id uuid [not null, ref: > players.id]
  milestone_type varchar(20) [not null, note: 'DEBUT|FIRST_30|FIRST_50|FIRST_100|FIRST_4FER|FIRST_5FER|FIRST_HATTRICK|FIRST_MOTM']
  match_id uuid [not null, ref: > matches.id]
  achieved_at date [not null]
  detail varchar(200) [note: 'e.g. "101* off 98 balls vs Memon SC"']

  indexes {
    player_id
    milestone_type
    (player_id, milestone_type) [unique, note: 'only one first-50, first-100 etc per player']
  }
}

// ─────────────────────────────────────────────
// OPPONENT TEAMS & PLAYERS
// ─────────────────────────────────────────────

Table opponents {
  id uuid [pk, default: `gen_random_uuid()`]
  name varchar(100) [not null, unique]
  short_name varchar(20) [not null]
  created_at timestamptz [not null, default: `now()`]
}

Table opponent_players {
  id uuid [pk, default: `gen_random_uuid()`]
  opponent_id uuid [ref: > opponents.id]
  full_name varchar(100) [not null]
  batting_style varchar(5) [note: 'RHB | LHB — nullable, enter when known']
  bowling_style varchar(5) [note: 'RF|RFM|RM|OB|SLA|LB|LM|LFM|LF — critical for matchup analysis']
  notes varchar(200)
  created_at timestamptz [not null, default: `now()`]

  indexes {
    opponent_id
    bowling_style
    batting_style
  }
}

// ─────────────────────────────────────────────
// SEASONS, TOURNAMENTS, VENUES
// ─────────────────────────────────────────────

Table seasons {
  id uuid [pk, default: `gen_random_uuid()`]
  name varchar(20) [not null, unique, note: 'e.g. 2022/23']
  start_date date [not null]
  end_date date
}

Table tournaments {
  id uuid [pk, default: `gen_random_uuid()`]
  season_id uuid [not null, ref: > seasons.id]
  name varchar(150) [not null]
  format varchar(10) [not null, default: 'ODI', note: 'ODI | T20 | Other']
  overs_per_side int [not null, default: 50]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    season_id
  }
}

Table venues {
  id uuid [pk, default: `gen_random_uuid()`]
  name varchar(150) [not null]
  city varchar(100)
  is_mora_home_ground boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
}

// ─────────────────────────────────────────────
// MATCHES
// ─────────────────────────────────────────────

Table matches {
  id uuid [pk, default: `gen_random_uuid()`]
  tournament_id uuid [not null, ref: > tournaments.id]
  opponent_id uuid [not null, ref: > opponents.id]
  venue_id uuid [ref: > venues.id]
  match_date date [not null]
  scheduled_overs int [not null, default: 50]

  // Venue classification — critical for home/away analytics
  venue_type varchar(10) [not null, note: 'HOME | AWAY | NEUTRAL']

  // Tournament round
  round_type varchar(20) [not null, default: 'FIRST_ROUND', note: 'FIRST_ROUND|SECOND_ROUND|PRE_QUARTER_FINAL|QUARTER_FINAL|SEMI_FINAL|FINAL|CONSOLATION_FINAL|GROUP_STAGE|LEAGUE|PLAYOFF']
  round_label varchar(50) [note: 'e.g. "Group B - Match 3" or "Semi-Final 1"']

  // Toss — nullable when match is PRE_TOSS_ABANDONED
  toss_held boolean [not null, default: true, note: 'false for matches washed out before toss']
  toss_winner varchar(10) [note: 'MORA | OPPONENT — null if toss_held=false']
  toss_decision varchar(5) [note: 'BAT | FIELD — null if toss_held=false']
  mora_batting_first boolean [note: 'null if toss_held=false']

  // Pitch & ball
  surface_type varchar(10) [not null, default: 'MATTING', note: 'MATTING | TURF']
  ball_colour varchar(5) [not null, default: 'RED', note: 'RED | WHITE']

  // Result
  status varchar(25) [not null, note: 'COMPLETED|ABANDONED|ABANDONED_MID|NO_RESULT|PRE_TOSS_ABANDONED']
  result_type varchar(15) [note: 'WIN|LOSS|TIE_TOSS|TIE_BOWL_OUT|NR|ABANDONED']
  result_margin int
  result_margin_type varchar(10) [note: 'RUNS | WICKETS']

  // DLS / Parabola
  dls_applied boolean [not null, default: false]
  dls_target int
  revised_overs int

  // Match officials — Mora side
  mora_captain_id uuid [ref: > players.id]
  mora_wicketkeeper_id uuid [ref: > players.id]

  // Opposition officials
  opponent_captain_name varchar(100)

  // Awards
  player_of_match_mora_id uuid [ref: > players.id, note: 'set if mora player wins MOTM']
  player_of_match_name varchar(100) [note: 'always stored as string — covers opponent MOTM too']
  player_of_match_team varchar(10) [note: 'MORA | OPPONENT']

  // Meta
  ball_type varchar(10) [not null, default: 'LEATHER', note: 'LEATHER|TAPE|TENNIS — material of ball, distinct from ball_colour']
  notes text
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    tournament_id
    opponent_id
    match_date
    status
    result_type
    venue_type [note: 'key for home/away analytics']
    mora_captain_id [note: 'key for captaincy analytics']
    mora_batting_first
  }
}

// Explicit playing XI — stored separately from performances
// Allows tracking selection even for roles not reflected in batting/bowling records
Table match_squad {
  id uuid [pk, default: `gen_random_uuid()`]
  match_id uuid [not null, ref: > matches.id]
  player_id uuid [not null, ref: > players.id]
  is_playing_xi boolean [not null, default: true, note: 'false = 12th man / reserve']

  indexes {
    match_id
    player_id
    (match_id, player_id) [unique]
  }
}

// ─────────────────────────────────────────────
// INNINGS
// ─────────────────────────────────────────────

Table innings {
  id uuid [pk, default: `gen_random_uuid()`]
  match_id uuid [not null, ref: > matches.id]
  innings_number int [not null, note: '1 or 2']
  innings_type varchar(10) [not null, default: 'NORMAL', note: 'NORMAL | SUPER_OVER']
  batting_team varchar(10) [not null, note: 'MORA | OPPONENT']
  mora_wicketkeeper_id uuid [ref: > players.id, note: 'keeper for this specific innings — handles mid-innings swap. Overrides match-level keeper when set']

  // Scorecard aggregates — always populated even without delivery data
  total_runs int [not null, default: 0]
  total_wickets int [not null, default: 0]
  total_overs_faced decimal(4,1) [not null, default: 0]
  extras_wides int [not null, default: 0]
  extras_no_balls int [not null, default: 0]
  extras_leg_byes int [not null, default: 0]
  extras_byes int [not null, default: 0]
  extras_penalty int [not null, default: 0]

  // Data completeness flags — used by analytics layer to qualify coverage
  has_delivery_data boolean [not null, default: false]
  commentary_coverage varchar(5) [not null, default: 'NONE', note: 'NONE|KEY|FULL']

  indexes {
    match_id
    batting_team
    has_delivery_data
  }
}

// Pre-computed over summaries — populated after delivery entry
// Drives the worm chart and scoring pattern comparison without re-aggregating deliveries every time
Table over_summaries {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  over_number int [not null, note: '1-indexed']
  runs_in_over int [not null, default: 0]
  wickets_in_over int [not null, default: 0]
  dots_in_over int [not null, default: 0]
  fours_in_over int [not null, default: 0]
  sixes_in_over int [not null, default: 0]
  wides_in_over int [not null, default: 0]
  no_balls_in_over int [not null, default: 0]
  cumulative_runs int [not null, note: 'running total at end of this over — for worm chart']
  cumulative_wickets int [not null, note: 'running wicket count']

  indexes {
    innings_id
    (innings_id, over_number) [unique]
  }
}

// ─────────────────────────────────────────────
// DELIVERIES (Ball-by-Ball)
// ─────────────────────────────────────────────

Table deliveries {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  over_number int [not null]
  ball_number int [not null, note: 'legal delivery in over (1-6)']
  delivery_sequence int [not null, note: 'absolute sequence including wides/no-balls']

  // Mora batter (when mora bats) — exactly one of mora/opp batter is set per delivery
  mora_batter_id uuid [ref: > players.id]

  // Opponent batter (when opponent bats)
  opp_batter_id uuid [ref: > opponent_players.id]
  opp_batter_name varchar(100) [note: 'string fallback — always populated']
  opp_batter_style varchar(5) [note: 'LHB|RHB — denormalised for bowler vs batter-hand analysis']

  // Mora bowler (when mora bowls)
  mora_bowler_id uuid [ref: > players.id]

  // Opponent bowler (when mora bats)
  opp_bowler_id uuid [ref: > opponent_players.id]
  opp_bowler_name varchar(100) [note: 'string fallback — always populated']
  opp_bowler_style varchar(5) [note: 'DENORMALISED — RF|OB|SLA etc. Key index for batter vs bowling style analysis. Copied from opponent_players at time of entry so historical records survive profile edits']

  // Ball outcome
  runs_off_bat int [not null, default: 0]
  extras_type varchar(10) [note: 'WIDE|NO_BALL|LEG_BYE|BYE|PENALTY — null if clean delivery']
  extras_runs int [not null, default: 0]
  total_runs int [not null, note: 'runs_off_bat + extras_runs']

  // Wicket
  is_wicket boolean [not null, default: false]
  wicket_type varchar(15) [note: 'BOWLED|CAUGHT|LBW|RUN_OUT|STUMPED|HIT_WICKET|RETIRED_HURT']
  dismissed_mora_batter_id uuid [ref: > players.id]
  dismissed_opp_batter_id uuid [ref: > opponent_players.id]
  dismissed_batter_name varchar(100) [note: 'string fallback — always populated']
  mora_fielder_id uuid [ref: > players.id, note: 'set when mora player catches/runs out']
  opp_fielder_name varchar(100) [note: 'set when opponent fields against mora batting']

  // Bowling side — nullable, only recorded when commentary explicitly states it
  bowling_side varchar(6) [note: 'OVER | AROUND — null when not in commentary']

  // Shot & Direction — always nullable regardless of innings coverage tier
  shot_type varchar(15) [note: 'DRIVE|PULL|HOOK|CUT|SWEEP|REV_SWEEP|GLANCE|FLICK|LOFT|DEFENSIVE|LEAVE|PADDLE|SCOOP|OTHER']
  direction_zone varchar(12) [note: 'FINE_LEG|SQ_LEG|MIDWICKET|MID_ON|STRAIGHT|MID_OFF|COVER|POINT|THIRD_MAN|OTHER']

  created_at timestamptz [not null, default: `now()`]

  indexes {
    innings_id
    over_number
    mora_batter_id
    mora_bowler_id
    opp_bowler_id
    opp_bowler_style [note: 'PRIMARY analytics index — batter vs bowling style']
    opp_batter_style [note: 'bowler vs batter-hand analysis']
    mora_fielder_id
    is_wicket
    (innings_id, over_number, delivery_sequence) [unique]
  }
}

// ─────────────────────────────────────────────
// BATTING PERFORMANCES (Scorecard level)
// Always entered regardless of delivery data status
// ─────────────────────────────────────────────

Table mora_batting_performances {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  player_id uuid [not null, ref: > players.id]
  batting_position int [not null]

  runs int [not null, default: 0]
  balls_faced int [not null, default: 0]
  fours int [not null, default: 0]
  sixes int [not null, default: 0]
  is_not_out boolean [not null, default: false]
  minutes_batted int

  // Dismissal
  dismissal_type varchar(15) [note: 'BOWLED|CAUGHT|LBW|RUN_OUT|STUMPED|HIT_WICKET|RETIRED_HURT|DNB']
  dismissed_by_opp_bowler_id uuid [ref: > opponent_players.id]
  dismissed_by_opp_bowler_name varchar(100)
  dismissed_by_opp_bowler_style varchar(5) [note: 'DENORMALISED — key for batter vs bowling type analysis in scorecard-only innings']
  fielded_by_mora_player_id uuid [ref: > players.id]
  fielded_by_opp_name varchar(100)

  // Milestone flags — set by background job
  is_thirty boolean [not null, default: false, note: 'scored 30-49']
  is_fifty boolean [not null, default: false, note: 'scored 50-99']
  is_hundred boolean [not null, default: false, note: 'scored 100-149']
  is_duck boolean [not null, default: false, note: 'out for 0']

  indexes {
    innings_id
    player_id
    dismissed_by_opp_bowler_style [note: 'critical — batter vs bowling style without delivery data']
    is_fifty
    is_hundred
  }
}

Table opponent_batting_performances {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  opponent_player_id uuid [ref: > opponent_players.id, note: 'nullable — optional enrichment']
  player_name varchar(100) [not null, note: 'always stored as string']
  batting_style varchar(5) [note: 'denormalised at time of match']
  batting_position int [not null]
  runs int [not null, default: 0]
  balls_faced int [not null, default: 0]
  fours int [not null, default: 0]
  sixes int [not null, default: 0]
  is_not_out boolean [not null, default: false]
  minutes_batted int
  dismissal_type varchar(15)
  dismissed_by_mora_bowler_id uuid [ref: > players.id]
  fielded_by_mora_player_id uuid [ref: > players.id]

  indexes {
    innings_id
    opponent_player_id
    dismissed_by_mora_bowler_id
    batting_style
  }
}

// ─────────────────────────────────────────────
// BOWLING PERFORMANCES (Scorecard level)
// ─────────────────────────────────────────────

Table mora_bowling_performances {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  player_id uuid [not null, ref: > players.id]
  overs_bowled decimal(4,1) [not null]
  maidens int [not null, default: 0]
  runs_conceded int [not null, default: 0]
  wickets int [not null, default: 0]
  wides int [not null, default: 0]
  no_balls int [not null, default: 0]

  // Milestone flags — set by background job
  is_four_wicket_haul boolean [not null, default: false]
  is_five_wicket_haul boolean [not null, default: false]

  indexes {
    innings_id
    player_id
    is_five_wicket_haul
    is_four_wicket_haul
  }
}

Table opponent_bowling_performances {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  opponent_player_id uuid [ref: > opponent_players.id, note: 'nullable']
  player_name varchar(100) [not null]
  bowling_style varchar(5) [note: 'denormalised — key for batter vs bowler-type analysis']
  overs_bowled decimal(4,1) [not null]
  maidens int [not null, default: 0]
  runs_conceded int [not null, default: 0]
  wickets int [not null, default: 0]
  wides int [not null, default: 0]
  no_balls int [not null, default: 0]

  indexes {
    innings_id
    opponent_player_id
    bowling_style
  }
}

// ─────────────────────────────────────────────
// BOWLING MILESTONES
// Hat-tricks require delivery data; 4/5-fers from scorecard
// ─────────────────────────────────────────────

Table bowling_milestones {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  player_id uuid [not null, ref: > players.id]
  milestone_type varchar(15) [not null, note: 'FOUR_WICKET | FIVE_WICKET | HATTRICK']
  // For hat-tricks — the three delivery IDs
  delivery_1_id uuid [ref: > deliveries.id, note: 'set for hat-tricks only']
  delivery_2_id uuid [ref: > deliveries.id]
  delivery_3_id uuid [ref: > deliveries.id]
  detail varchar(200) [note: 'e.g. "5/32 off 8 overs vs SLIIT"']

  indexes {
    player_id
    milestone_type
    innings_id
  }
}

// ─────────────────────────────────────────────
// FIELDING PERFORMANCES
// ─────────────────────────────────────────────

Table mora_fielding_performances {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  player_id uuid [not null, ref: > players.id]
  catches int [not null, default: 0]
  run_outs int [not null, default: 0]
  stumpings int [not null, default: 0]
  dropped_catches int [not null, default: 0, note: 'admin-only — never exposed publicly']

  indexes {
    innings_id
    player_id
  }
}

// ─────────────────────────────────────────────
// FALL OF WICKETS
// ─────────────────────────────────────────────

Table fall_of_wickets {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  wicket_number int [not null, note: '1-10']
  score_at_fall int [not null]
  over_at_fall decimal(4,1) [not null]
  dismissed_mora_player_id uuid [ref: > players.id]
  dismissed_opp_player_id uuid [ref: > opponent_players.id]
  dismissed_player_name varchar(100) [not null, note: 'string fallback']

  indexes {
    innings_id
    (innings_id, wicket_number) [unique]
  }
}

// ─────────────────────────────────────────────
// PARTNERSHIPS (computed after delivery entry)
// ─────────────────────────────────────────────

// Partnerships cover BOTH Mora and Opponent innings
// For Mora innings: mora_batter1_id + mora_batter2_id are set, opp fields null
// For Opponent innings: opp_batter1_name + opp_batter2_name stored, mora fields null
Table partnerships {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  wicket_number int [not null]

  // Mora batting innings
  mora_batter1_id uuid [ref: > players.id]
  mora_batter2_id uuid [ref: > players.id]

  // Opponent batting innings (string fallback — mirrors opponent_batting_performances pattern)
  opp_batter1_id uuid [ref: > opponent_players.id]
  opp_batter1_name varchar(100)
  opp_batter2_id uuid [ref: > opponent_players.id]
  opp_batter2_name varchar(100)

  runs int [not null, default: 0]
  balls int [not null, default: 0]
  batter1_runs int [not null, default: 0]
  batter2_runs int [not null, default: 0]
  unbroken boolean [not null, default: false]

  indexes {
    innings_id
    mora_batter1_id
    mora_batter2_id
    (mora_batter1_id, mora_batter2_id)
  }
}

// ─────────────────────────────────────────────
// BATTING ORDER (explicit, independent of performances)
// ─────────────────────────────────────────────

Table mora_batting_order {
  id uuid [pk, default: `gen_random_uuid()`]
  innings_id uuid [not null, ref: > innings.id]
  player_id uuid [not null, ref: > players.id]
  position int [not null]

  indexes {
    innings_id
    (innings_id, position) [unique]
    (innings_id, player_id) [unique]
  }
}

// ─────────────────────────────────────────────
// NOTES ON KEY ANALYTICS PATTERNS
// (Not stored — computed at query time by FastAPI)
// ─────────────────────────────────────────────
//
// CAPTAINCY ANALYTICS:
//   SELECT mora_captain_id, COUNT(*) as matches,
//          SUM(CASE WHEN result_type='WIN' THEN 1 ELSE 0 END) as wins
//   FROM matches WHERE status='COMPLETED'
//   GROUP BY mora_captain_id
//
// HOME/AWAY SPLITS:
//   Add WHERE venue_type = 'HOME'|'AWAY'|'NEUTRAL' to any match-joined query
//
// BATTER VS BOWLING STYLE (delivery-level, most accurate):
//   WHERE d.mora_batter_id = :id AND d.opp_bowler_style = 'SLA'
//
// BATTER VS BOWLING STYLE (scorecard fallback):
//   WHERE mbp.player_id = :id AND mbp.dismissed_by_opp_bowler_style = 'SLA'
//   AND innings.has_delivery_data = false
//
// BOWLING CATEGORY (pace vs spin — derived, never stored):
//   CASE WHEN opp_bowler_style IN ('OB','LB','SLA','SLO') THEN 'SPIN' ELSE 'PACE' END
//
// BOWLER VS BATTER HAND (mora bowler perspective):
//   JOIN opponent_batting_performances obp ON obp.innings_id = d.innings_id
//   WHERE d.mora_bowler_id = :id AND d.opp_batter_style = 'LHB'
//
// WIN/LOSS SPLIT:
//   JOIN matches m ON m.id = innings.match_id
//   WHERE m.result_type = 'WIN'|'LOSS'
//
// CHASING VS SETTING:
//   WHERE m.mora_batting_first = false (chasing) | true (setting)
//
// WORM CHART:
//   SELECT over_number, cumulative_runs, cumulative_wickets
//   FROM over_summaries WHERE innings_id = :id ORDER BY over_number
//   (one query per innings, compare both on same chart)
//
// SURFACE SPLIT:
//   WHERE m.surface_type = 'MATTING'|'TURF'
//
// FORMAT SPLIT (ODI vs T20):
//   WHERE t.format = 'ODI'|'T20'
//   JOIN tournaments t ON t.id = i.match_id (via matches)
//
// PRE_TOSS_ABANDONED exclusion from player stats:
//   WHERE m.status != 'PRE_TOSS_ABANDONED'
//   (always apply this filter on any player-level query)
//
// RECORDS (all derived — no separate table needed):
//   Highest team total:  MAX(total_runs) from innings WHERE batting_team='MORA'
//   Best bowling:        MAX(wickets) from mora_bowling_performances
//   Most runs season:    SUM with JOIN to tournament.season_id
