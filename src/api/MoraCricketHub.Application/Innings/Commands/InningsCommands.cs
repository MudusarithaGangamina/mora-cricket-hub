using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Innings.Commands;

// ── Create innings ────────────────────────────────────────────────────────────
public record CreateInningsCommand(
    Guid MatchId,
    int InningsNumber,
    string InningsType,       // NORMAL | SUPER_OVER
    string BattingTeam,       // MORA | OPPONENT
    Guid? MoraWickeeperId,
    string CommentaryCoverage, // NONE | KEY | FULL
    int scheduledOvers
) : IRequest<Guid>;

// ── Update innings totals (scorecard aggregates) ──────────────────────────────
public record UpdateInningsTotalsCommand(
    Guid InningsId,
    int TotalRuns,
    int TotalWickets,
    decimal TotalOversFaced,
    int ExtrasWides,
    int ExtrasNoBalls,
    int ExtrasLegByes,
    int ExtrasByes,
    int ExtrasPenalty
) : IRequest<bool>;

// ── Mora batting performance ──────────────────────────────────────────────────
public record AddMoraBattingCommand(
    Guid InningsId,
    Guid PlayerId,
    int BattingPosition,
    int Runs,
    int BallsFaced,
    int Fours,
    int Sixes,
    bool IsNotOut,
    int? MinutesBatted,
    string? DismissalType,
    Guid? DismissedByOppBowlerId,
    string? DismissedByOppBowlerName,
    string? DismissedByOppBowlerStyle,
    Guid? FieldedByMoraPlayerId,
    string? FieldedByOppName
) : IRequest<Guid>;

public record UpdateMoraBattingCommand(
    Guid PerformanceId,
    int Runs,
    int BallsFaced,
    int Fours,
    int Sixes,
    bool IsNotOut,
    int? MinutesBatted,
    string? DismissalType,
    Guid? DismissedByOppBowlerId,
    string? DismissedByOppBowlerName,
    string? DismissedByOppBowlerStyle,
    Guid? FieldedByMoraPlayerId,
    string? FieldedByOppName
) : IRequest<bool>;

// ── Opponent batting performance ──────────────────────────────────────────────
public record AddOpponentBattingCommand(
    Guid InningsId,
    Guid? OpponentPlayerId,
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
    Guid? DismissedByMoraBowlerId,
    Guid? FieldedByMoraPlayerId
) : IRequest<Guid>;

public record UpdateOpponentBattingCommand(
    Guid PerformanceId,
    int Runs,
    int BallsFaced,
    int Fours,
    int Sixes,
    bool IsNotOut,
    int? MinutesBatted,
    string? DismissalType,
    Guid? DismissedByMoraBowlerId,
    Guid? FieldedByMoraPlayerId
) : IRequest<bool>;

// ── Mora bowling performance ──────────────────────────────────────────────────
public record AddMoraBowlingCommand(
    Guid InningsId,
    Guid PlayerId,
    decimal OversBowled,
    int Maidens,
    int RunsConceded,
    int Wickets,
    int Wides,
    int NoBalls
) : IRequest<Guid>;

public record UpdateMoraBowlingCommand(
    Guid PerformanceId,
    decimal OversBowled,
    int Maidens,
    int RunsConceded,
    int Wickets,
    int Wides,
    int NoBalls
) : IRequest<bool>;

// ── Opponent bowling performance ──────────────────────────────────────────────
public record AddOpponentBowlingCommand(
    Guid InningsId,
    Guid? OpponentPlayerId,
    string PlayerName,
    string? BowlingStyle,
    decimal OversBowled,
    int Maidens,
    int RunsConceded,
    int Wickets,
    int Wides,
    int NoBalls
) : IRequest<Guid>;

public record UpdateOpponentBowlingCommand(
    Guid PerformanceId,
    decimal OversBowled,
    int Maidens,
    int RunsConceded,
    int Wickets,
    int Wides,
    int NoBalls
) : IRequest<bool>;

// ── Fall of wickets ───────────────────────────────────────────────────────────
public record AddFallOfWicketCommand(
    Guid InningsId,
    int WicketNumber,
    int ScoreAtFall,
    decimal OverAtFall,
    Guid? DismissedMoraPlayerId,
    Guid? DismissedOppPlayerId,
    string DismissedPlayerName
) : IRequest<Guid>;

// ── Partnership ───────────────────────────────────────────────────────────────
public record AddPartnershipCommand(
    Guid InningsId,
    int WicketNumber,
    Guid? MoraBatter1Id,
    Guid? MoraBatter2Id,
    Guid? OppBatter1Id,
    string? OppBatter1Name,
    Guid? OppBatter2Id,
    string? OppBatter2Name,
    int Runs,
    int Balls,
    int Batter1Runs,
    int Batter2Runs,
    bool Unbroken
) : IRequest<Guid>;

// ── Fielding ──────────────────────────────────────────────────────────────────
public record AddMoraFieldingCommand(
    Guid InningsId,
    Guid PlayerId,
    int Catches,
    int RunOuts,
    int Stumpings,
    int DroppedCatches    // stored but never exposed publicly
) : IRequest<Guid>;

public record UpdateMoraFieldingCommand(
    Guid PerformanceId,
    int Catches,
    int RunOuts,
    int Stumpings,
    int DroppedCatches
) : IRequest<bool>;
