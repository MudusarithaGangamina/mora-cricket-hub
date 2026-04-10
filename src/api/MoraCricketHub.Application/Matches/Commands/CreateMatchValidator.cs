using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;

namespace MoraCricketHub.Application.Matches.Commands;

public class CreateMatchValidator : AbstractValidator<CreateMatchCommand>
{
    private static readonly string[] VenueTypes = ["HOME", "AWAY", "NEUTRAL"];
    private static readonly string[] SurfaceTypes = ["MATTING", "TURF"];
    private static readonly string[] BallColours = ["RED", "WHITE"];
    private static readonly string[] BallTypes = ["LEATHER", "TAPE", "TENNIS"];
    private static readonly string[] TossWinners = ["MORA", "OPPONENT"];
    private static readonly string[] TossDecisions = ["BAT", "FIELD"];
    private static readonly string[] MotmTeams = ["MORA", "OPPONENT"];

    private static readonly string[] Statuses =
    [
        "COMPLETED", "ABANDONED", "ABANDONED_MID",
        "NO_RESULT", "PRE_TOSS_ABANDONED"
    ];

    private static readonly string[] ResultTypes =
    [
        "WIN", "LOSS", "TIE_TOSS", "TIE_BOWL_OUT", "NR", "ABANDONED"
    ];

    private static readonly string[] RoundTypes =
    [
        "FIRST_ROUND", "SECOND_ROUND", "PRE_QUARTER_FINAL",
        "QUARTER_FINAL", "SEMI_FINAL", "FINAL",
        "CONSOLATION_FINAL", "GROUP_STAGE", "LEAGUE", "PLAYOFF"
    ];

    public CreateMatchValidator()
    {
        RuleFor(x => x.TournamentId).NotEmpty();
        RuleFor(x => x.OpponentId).NotEmpty();

        RuleFor(x => x.MatchDate)
            .NotEmpty()
            .Must(d => DateOnly.TryParse(d, out _))
            .WithMessage("MatchDate must be a valid date (yyyy-MM-dd).");

        RuleFor(x => x.ScheduledOvers)
            .InclusiveBetween(10, 50);

        RuleFor(x => x.VenueType)
            .NotEmpty()
            .Must(v => VenueTypes.Contains(v))
            .WithMessage("VenueType must be HOME, AWAY or NEUTRAL.");

        RuleFor(x => x.SurfaceType)
            .NotEmpty()
            .Must(s => SurfaceTypes.Contains(s))
            .WithMessage("SurfaceType must be MATTING or TURF.");

        RuleFor(x => x.BallColour)
            .NotEmpty()
            .Must(b => BallColours.Contains(b))
            .WithMessage("BallColour must be RED or WHITE.");

        RuleFor(x => x.BallType)
            .NotEmpty()
            .Must(b => BallTypes.Contains(b))
            .WithMessage("BallType must be LEATHER, TAPE or TENNIS.");

        RuleFor(x => x.RoundType)
            .NotEmpty()
            .Must(r => RoundTypes.Contains(r))
            .WithMessage("Invalid RoundType.");

        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(s => Statuses.Contains(s))
            .WithMessage("Invalid Status.");

        RuleFor(x => x.ResultType)
            .Must(r => r is null || ResultTypes.Contains(r))
            .WithMessage("Invalid ResultType.");

        // When toss held, winner and decision are required
        When(x => x.TossHeld, () =>
        {
            RuleFor(x => x.TossWinner)
                .NotEmpty()
                .Must(w => TossWinners.Contains(w!))
                .WithMessage("TossWinner must be MORA or OPPONENT when toss was held.");

            RuleFor(x => x.TossDecision)
                .NotEmpty()
                .Must(d => TossDecisions.Contains(d!))
                .WithMessage("TossDecision must be BAT or FIELD when toss was held.");

            RuleFor(x => x.MoraBattingFirst)
                .NotNull()
                .WithMessage("MoraBattingFirst is required when toss was held.");
        });

        // When toss NOT held (PreTossAbandoned), toss fields must be null
        When(x => !x.TossHeld, () =>
        {
            RuleFor(x => x.TossWinner)
                .Null()
                .WithMessage("TossWinner must be null when toss was not held.");

            RuleFor(x => x.Status)
                .Equal("PRE_TOSS_ABANDONED")
                .WithMessage("Status must be PRE_TOSS_ABANDONED when toss was not held.");
        });

        // DLS fields required when DLS applied
        When(x => x.DlsApplied, () =>
        {
            RuleFor(x => x.DlsTarget)
                .NotNull()
                .GreaterThan(0)
                .WithMessage("DlsTarget is required when DLS was applied.");
        });

        // MOTM team must be set when player name is set
        When(x => x.PlayerOfMatchName is not null, () =>
        {
            RuleFor(x => x.PlayerOfMatchTeam)
                .NotEmpty()
                .Must(t => MotmTeams.Contains(t!))
                .WithMessage("PlayerOfMatchTeam must be MORA or OPPONENT.");
        });

        RuleFor(x => x.RoundLabel)
            .MaximumLength(50).When(x => x.RoundLabel is not null);

        RuleFor(x => x.OpponentCaptainName)
            .MaximumLength(100).When(x => x.OpponentCaptainName is not null);
    }
}
