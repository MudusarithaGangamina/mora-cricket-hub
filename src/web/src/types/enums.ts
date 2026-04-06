// â”€â”€â”€ Batting & Bowling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export enum BattingStyle {
  RHB = 'RHB',
  LHB = 'LHB',
}

export enum BowlingStyle {
  RF  = 'RF',
  RFM = 'RFM',
  RM  = 'RM',
  RMF = 'RMF',
  OB  = 'OB',
  LB  = 'LB',
  SLA = 'SLA',
  SLO = 'SLO',
  LM  = 'LM',
  LMF = 'LMF',
  LF  = 'LF',
}

export const BowlingStyleLabels: Record<BowlingStyle, string> = {
  [BowlingStyle.RF]:  'Right-arm Fast',
  [BowlingStyle.RFM]: 'Right-arm Fast-Medium',
  [BowlingStyle.RM]:  'Right-arm Medium',
  [BowlingStyle.RMF]: 'Right-arm Medium-Fast',
  [BowlingStyle.OB]:  'Off-break',
  [BowlingStyle.LB]:  'Leg-break',
  [BowlingStyle.SLA]: 'Slow Left-arm Orthodox',
  [BowlingStyle.SLO]: 'Slow Left-arm Unorthodox (Chinaman)',
  [BowlingStyle.LM]:  'Left-arm Medium',
  [BowlingStyle.LMF]: 'Left-arm Medium-Fast',
  [BowlingStyle.LF]:  'Left-arm Fast',
}

export type BowlingCategory = 'PACE' | 'SPIN'

export const toBowlingCategory = (style: BowlingStyle): BowlingCategory =>
  [BowlingStyle.OB, BowlingStyle.LB, BowlingStyle.SLA, BowlingStyle.SLO].includes(style)
    ? 'SPIN'
    : 'PACE'

// â”€â”€â”€ Match â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export enum VenueType {
  HOME    = 'HOME',
  AWAY    = 'AWAY',
  NEUTRAL = 'NEUTRAL',
}

export enum SurfaceType {
  MATTING = 'MATTING',
  TURF    = 'TURF',
}

export enum BallColour {
  RED   = 'RED',
  WHITE = 'WHITE',
}

export enum MatchStatus {
  COMPLETED           = 'COMPLETED',
  ABANDONED           = 'ABANDONED',
  ABANDONED_MID       = 'ABANDONED_MID',
  NO_RESULT           = 'NO_RESULT',
  PRE_TOSS_ABANDONED  = 'PRE_TOSS_ABANDONED',
}

export enum ResultType {
  WIN          = 'WIN',
  LOSS         = 'LOSS',
  TIE_TOSS     = 'TIE_TOSS',
  TIE_BOWL_OUT = 'TIE_BOWL_OUT',
  NR           = 'NR',
  ABANDONED    = 'ABANDONED',
}

export enum RoundType {
  FIRST_ROUND       = 'FIRST_ROUND',
  SECOND_ROUND      = 'SECOND_ROUND',
  PRE_QUARTER_FINAL = 'PRE_QUARTER_FINAL',
  QUARTER_FINAL     = 'QUARTER_FINAL',
  SEMI_FINAL        = 'SEMI_FINAL',
  FINAL             = 'FINAL',
  CONSOLATION_FINAL = 'CONSOLATION_FINAL',
  GROUP_STAGE       = 'GROUP_STAGE',
  LEAGUE            = 'LEAGUE',
  PLAYOFF           = 'PLAYOFF',
}

export const RoundTypeLabels: Record<RoundType, string> = {
  [RoundType.FIRST_ROUND]:       'First Round',
  [RoundType.SECOND_ROUND]:      'Second Round',
  [RoundType.PRE_QUARTER_FINAL]: 'Pre-Quarter Final',
  [RoundType.QUARTER_FINAL]:     'Quarter Final',
  [RoundType.SEMI_FINAL]:        'Semi Final',
  [RoundType.FINAL]:             'Final',
  [RoundType.CONSOLATION_FINAL]: 'Consolation Final',
  [RoundType.GROUP_STAGE]:       'Group Stage',
  [RoundType.LEAGUE]:            'League Match',
  [RoundType.PLAYOFF]:           'Playoff',
}

// â”€â”€â”€ Innings & Delivery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export enum InningsType {
  NORMAL     = 'NORMAL',
  SUPER_OVER = 'SUPER_OVER',
}

export enum BattingTeam {
  MORA     = 'MORA',
  OPPONENT = 'OPPONENT',
}

export enum CommentaryCoverage {
  NONE = 'NONE',
  KEY  = 'KEY',
  FULL = 'FULL',
}

export enum ExtrasType {
  WIDE    = 'WIDE',
  NO_BALL = 'NO_BALL',
  LEG_BYE = 'LEG_BYE',
  BYE     = 'BYE',
  PENALTY = 'PENALTY',
}

export enum WicketType {
  BOWLED        = 'BOWLED',
  CAUGHT        = 'CAUGHT',
  LBW           = 'LBW',
  RUN_OUT       = 'RUN_OUT',
  STUMPED       = 'STUMPED',
  HIT_WICKET    = 'HIT_WICKET',
  RETIRED_HURT  = 'RETIRED_HURT',
  OBSTRUCTING   = 'OBSTRUCTING',
  TIMED_OUT     = 'TIMED_OUT',
}

export enum BowlingSide {
  OVER   = 'OVER',
  AROUND = 'AROUND',
}

export enum ShotType {
  DRIVE         = 'DRIVE',
  PULL          = 'PULL',
  HOOK          = 'HOOK',
  CUT           = 'CUT',
  SWEEP         = 'SWEEP',
  REVERSE_SWEEP = 'REVERSE_SWEEP',
  GLANCE        = 'GLANCE',
  FLICK         = 'FLICK',
  LOFT          = 'LOFT',
  DEFENSIVE     = 'DEFENSIVE',
  LEAVE         = 'LEAVE',
  PADDLE        = 'PADDLE',
  SCOOP         = 'SCOOP',
  OTHER         = 'OTHER',
}

export enum DirectionZone {
  FINE_LEG   = 'FINE_LEG',
  SQUARE_LEG = 'SQUARE_LEG',
  MIDWICKET  = 'MIDWICKET',
  MID_ON     = 'MID_ON',
  STRAIGHT   = 'STRAIGHT',
  MID_OFF    = 'MID_OFF',
  COVER      = 'COVER',
  POINT      = 'POINT',
  THIRD_MAN  = 'THIRD_MAN',
  OTHER      = 'OTHER',
}

// â”€â”€â”€ Player â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export enum BattingRole {
  OPENER       = 'OPENER',
  TOP_ORDER    = 'TOP_ORDER',
  MIDDLE_ORDER = 'MIDDLE_ORDER',
  FINISHER     = 'FINISHER',
  TAIL         = 'TAIL',
}

export const BattingRoleLabels: Record<BattingRole, string> = {
  [BattingRole.OPENER]:       'Opener',
  [BattingRole.TOP_ORDER]:    'Top Order',
  [BattingRole.MIDDLE_ORDER]: 'Middle Order',
  [BattingRole.FINISHER]:     'Finisher',
  [BattingRole.TAIL]:         'Tail',
}

export enum MilestoneType {
  DEBUT          = 'DEBUT',
  FIRST_30       = 'FIRST_30',
  FIRST_50       = 'FIRST_50',
  FIRST_100      = 'FIRST_100',
  FIRST_4FER     = 'FIRST_4FER',
  FIRST_5FER     = 'FIRST_5FER',
  FIRST_HATTRICK = 'FIRST_HATTRICK',
  FIRST_MOTM     = 'FIRST_MOTM',
}

export const MilestoneLabels: Record<MilestoneType, string> = {
  [MilestoneType.DEBUT]:          'Debut',
  [MilestoneType.FIRST_30]:       'First 30+',
  [MilestoneType.FIRST_50]:       'First Half-Century',
  [MilestoneType.FIRST_100]:      'First Century',
  [MilestoneType.FIRST_4FER]:     'First 4-Wicket Haul',
  [MilestoneType.FIRST_5FER]:     'First 5-Wicket Haul',
  [MilestoneType.FIRST_HATTRICK]: 'First Hat-trick',
  [MilestoneType.FIRST_MOTM]:     'First Player of the Match',
}