using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Matches.Commands;

public record CreateMatchCommand(
    Guid TournamentId,
    Guid OpponentId,
    Guid? VenueId,
    string MatchDate,         // "yyyy-MM-dd"
    int ScheduledOvers,
    string VenueType,         // HOME | AWAY | NEUTRAL
    string SurfaceType,       // MATTING | TURF
    string BallColour,        // RED | WHITE
    string BallType,          // LEATHER | TAPE | TENNIS
    string RoundType,
    string? RoundLabel,

    // Toss — all nullable for PreTossAbandoned
    bool TossHeld,
    string? TossWinner,
    string? TossDecision,
    bool? MoraBattingFirst,

    // Result
    string Status,
    string? ResultType,
    int? ResultMargin,
    string? ResultMarginType,

    // DLS
    bool DlsApplied,
    int? DlsTarget,
    int? RevisedOvers,

    // Officials
    Guid? MoraCaptainId,
    Guid? MoraWickeeperId,
    string? OpponentCaptainName,

    // Player of the Match
    Guid? PlayerOfMatchMoraId,
    string? PlayerOfMatchName,
    string? PlayerOfMatchTeam,

    string? Notes
) : IRequest<Guid>;
