using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Innings.Queries;

// ── Full scorecard for one innings ────────────────────────────────────────────
public record InningsScorecardDto(
    Guid Id,
    int InningsNumber,
    string InningsType,
    string BattingTeam,
    int TotalRuns,
    int TotalWickets,
    decimal TotalOversFaced,
    int ExtrasWides,
    int ExtrasNoBalls,
    int ExtrasLegByes,
    int ExtrasByes,
    int ExtrasPenalty,
    bool HasDeliveryData,
    string CommentaryCoverage,
    string? MoraWickeeperId,
    string? MoraWickeeperName,
    List<MoraBattingLineDto> MoraBatting,
    List<OpponentBattingLineDto> OpponentBatting,
    List<MoraBowlingLineDto> MoraBowling,
    List<OpponentBowlingLineDto> OpponentBowling,
    List<FallOfWicketDto> FallOfWickets,
    List<PartnershipDto> Partnerships
);

// ── Batting lines ─────────────────────────────────────────────────────────────
public record MoraBattingLineDto(
    Guid Id,
    Guid PlayerId,
    string PlayerFullName,
    string PlayerShortName,
    int BattingPosition,
    int Runs,
    int BallsFaced,
    int Fours,
    int Sixes,
    bool IsNotOut,
    int? MinutesBatted,
    string? DismissalType,
    string? DismissedByOppBowlerName,
    string? DismissedByOppBowlerStyle,
    string? FieldedByOppName,
    bool IsThirty,
    bool IsFifty,
    bool IsHundred,
    bool IsDuck
);

public record OpponentBattingLineDto(
    Guid Id,
    string PlayerName,
    string? BattingStyle,
    int BattingPosition,
    int Runs,
    int BallsFaced,
    int Fours,
    int Sixes,
    bool IsNotOut,
    int? MinutesBatted,
    string? DismissalType,
    string? DismissedByMoraPlayerName,
    string? FieldedByMoraPlayerName
);

// ── Bowling lines ─────────────────────────────────────────────────────────────
public record MoraBowlingLineDto(
    Guid Id,
    Guid PlayerId,
    string PlayerFullName,
    decimal OversBowled,
    int Maidens,
    int RunsConceded,
    int Wickets,
    int Wides,
    int NoBalls,
    bool IsFourWicketHaul,
    bool IsFiveWicketHaul
);

public record OpponentBowlingLineDto(
    Guid Id,
    string PlayerName,
    string? BowlingStyle,
    decimal OversBowled,
    int Maidens,
    int RunsConceded,
    int Wickets,
    int Wides,
    int NoBalls
);

// ── Fall of wickets ───────────────────────────────────────────────────────────
public record FallOfWicketDto(
    Guid Id,
    int WicketNumber,
    int ScoreAtFall,
    decimal OverAtFall,
    string DismissedPlayerName
);

// ── Partnerships ──────────────────────────────────────────────────────────────
public record PartnershipDto(
    Guid Id,
    int WicketNumber,
    string? MoraBatter1Name,
    string? MoraBatter2Name,
    string? OppBatter1Name,
    string? OppBatter2Name,
    int Runs,
    int Balls,
    int Batter1Runs,
    int Batter2Runs,
    bool Unbroken
);

// ── Queries ───────────────────────────────────────────────────────────────────
public record GetInningsScorecardQuery(Guid InningsId)
    : IRequest<InningsScorecardDto?>;

public record GetMatchScorecardsQuery(Guid MatchId)
    : IRequest<List<InningsScorecardDto>>;
