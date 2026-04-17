using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Matches.Queries;

// ── List view — shown on matches page ────────────────────────────────────────
public record MatchSummaryDto(
    Guid Id,
    string MatchDate,
    string TournamentName,
    string TournamentFormat,
    string OpponentName,
    string OpponentShortName,
    string VenueName,
    string VenueType,        // HOME | AWAY | NEUTRAL
    string SurfaceType,      // MATTING | TURF
    string BallColour,       // RED | WHITE
    string RoundType,
    string? RoundLabel,
    string Status,
    string? ResultType,
    int? ResultMargin,
    string? ResultMarginType,
    bool DlsApplied,
    string? MoraCaptainName,
    string? PlayerOfMatchName,
    string? PlayerOfMatchTeam,
    int ScheduledOvers
);

// ── Detail view — full match info ─────────────────────────────────────────────
public record MatchDetailDto(
    Guid Id,
    string MatchDate,
    string TournamentId,
    string TournamentName,
    string TournamentFormat,
    int OversPerSide,
    string SeasonName,
    string OpponentId,
    string OpponentName,
    string OpponentShortName,
    string? VenueId,
    string? VenueName,
    string? VenueCity,
    string VenueType,
    string SurfaceType,
    string BallColour,
    string BallType,
    string RoundType,
    string? RoundLabel,
    bool TossHeld,
    string? TossWinner,
    string? TossDecision,
    bool? MoraBattingFirst,
    string Status,
    string? ResultType,
    int? ResultMargin,
    string? ResultMarginType,
    bool DlsApplied,
    int? DlsTarget,
    int? RevisedOvers,
    string? MoraCaptainId,
    string? MoraCaptainName,
    string? MoraWickeeperId,
    string? MoraWickeeperName,
    string? OpponentCaptainName,
    string? PlayerOfMatchMoraId,
    string? PlayerOfMatchName,
    string? PlayerOfMatchTeam,
    string? Notes,
    int ScheduledOvers,
    List<InningsSummaryDto> Innings
);

public record InningsSummaryDto(
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
    bool HasDeliveryData,
    string CommentaryCoverage
);

// ── Queries ───────────────────────────────────────────────────────────────────
public record GetAllMatchesQuery(
    Guid? TournamentId = null,
    Guid? OpponentId = null,
    string? Season = null,
    string? ResultType = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedMatchesDto>;

public record PagedMatchesDto(
    List<MatchSummaryDto> Items,
    int TotalCount,
    int Page,
    int PageSize
);

public record SquadMemberDto(
    Guid PlayerId,
    string FullName,
    string ShortName,
    string BattingStyle,
    string? PrimaryBowlingStyle,
    bool IsPlayingXi
);

public record OpponentSquadMemberDto(
    Guid? OpponentPlayerId,
    string PlayerName,
    string? BattingStyle,
    string? BowlingStyle,
    int? BattingOrder
);

public record SetSquadCommand(
    Guid MatchId,
    List<Guid> PlayerIds   // All XI players
) : IRequest<bool>;

public record MatchOpponentSquadEntry(
    Guid? OpponentPlayerId,
    string PlayerName,
    string? BattingStyle,
    string? BowlingStyle,
    int? BattingOrder
);

public record SetOpponentSquadCommand(
    Guid MatchId,
    List<MatchOpponentSquadEntry> Entries
) : IRequest<bool>;

public record GetMatchSquadQuery(Guid MatchId) : IRequest<List<SquadMemberDto>>;
public record GetMatchByIdQuery(Guid MatchId) : IRequest<MatchDetailDto?>;
