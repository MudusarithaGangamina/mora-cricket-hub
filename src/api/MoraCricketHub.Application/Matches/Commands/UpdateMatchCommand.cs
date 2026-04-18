using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;
using MediatR;

namespace MoraCricketHub.Application.Matches.Commands;

public record UpdateMatchCommand(
    Guid MatchId,
    Guid TournamentId,
    Guid OpponentId,
    Guid? VenueId,
    string MatchDate,
    int ScheduledOvers,
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
    Guid? MoraCaptainId,
    Guid? MoraWickeeperId,
    string? OpponentCaptainName,
    Guid? PlayerOfMatchMoraId,
    string? PlayerOfMatchName,
    string? PlayerOfMatchTeam,
    string? Notes
) : IRequest<bool>;

public class UpdateMatchValidator : AbstractValidator<UpdateMatchCommand>
{
    private static readonly string[] VenueTypes = ["HOME", "AWAY", "NEUTRAL"];
    private static readonly string[] SurfaceTypes = ["MATTING", "TURF"];
    private static readonly string[] BallColours = ["RED", "WHITE"];
    private static readonly string[] BallTypes = ["LEATHER", "TAPE", "TENNIS"];

    private static readonly string[] Statuses =
    [
        "COMPLETED","ABANDONED","ABANDONED_MID",
        "NO_RESULT","PRE_TOSS_ABANDONED"
    ];

    public UpdateMatchValidator()
    {
        RuleFor(x => x.MatchId).NotEmpty();
        RuleFor(x => x.TournamentId).NotEmpty();
        RuleFor(x => x.OpponentId).NotEmpty();
        RuleFor(x => x.MatchDate)
            .NotEmpty()
            .Must(d => DateOnly.TryParse(d, out _));
        RuleFor(x => x.ScheduledOvers).InclusiveBetween(10, 50);
        RuleFor(x => x.VenueType)
            .Must(v => VenueTypes.Contains(v));
        RuleFor(x => x.SurfaceType)
            .Must(s => SurfaceTypes.Contains(s));
        RuleFor(x => x.BallColour)
            .Must(b => BallColours.Contains(b));
        RuleFor(x => x.BallType)
            .Must(b => BallTypes.Contains(b));
        RuleFor(x => x.Status)
            .Must(s => Statuses.Contains(s));
    }
}
