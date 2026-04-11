using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;

namespace MoraCricketHub.Application.Deliveries.Commands;

public class AddDeliveryValidator : AbstractValidator<AddDeliveryCommand>
{
    private static readonly string[] ValidExtras =
        ["WIDE", "NO_BALL", "LEG_BYE", "BYE", "PENALTY"];

    private static readonly string[] ValidWickets =
        ["BOWLED","CAUGHT","LBW","RUN_OUT","STUMPED",
         "HIT_WICKET","RETIRED_HURT","OBSTRUCTING","TIMED_OUT"];

    private static readonly string[] ValidBowlingSides = ["OVER", "AROUND"];

    private static readonly string[] ValidShots =
        ["DRIVE","PULL","HOOK","CUT","SWEEP","REVERSE_SWEEP",
         "GLANCE","FLICK","LOFT","DEFENSIVE","LEAVE","PADDLE","SCOOP","OTHER"];

    private static readonly string[] ValidZones =
        ["FINE_LEG","SQUARE_LEG","MIDWICKET","MID_ON","STRAIGHT",
         "MID_OFF","COVER","POINT","THIRD_MAN","OTHER"];

    public AddDeliveryValidator()
    {
        RuleFor(x => x.InningsId).NotEmpty();

        RuleFor(x => x.OverNumber)
            .InclusiveBetween(1, 50)
            .WithMessage("OverNumber must be between 1 and 50.");

        RuleFor(x => x.BallNumber)
            .InclusiveBetween(1, 6)
            .WithMessage("BallNumber must be between 1 and 6.");

        RuleFor(x => x.DeliverySequence)
            .GreaterThan(0);

        // Exactly one batter must be set
        RuleFor(x => x)
            .Must(x => (x.MoraBatterId.HasValue) != (x.OppBatterName != null
                        || x.OppBatterId.HasValue))
            .WithMessage("Set either MoraBatterId or opponent batter — not both.");

        // Exactly one bowler must be set
        RuleFor(x => x)
            .Must(x => (x.MoraBowlerId.HasValue) != (x.OppBowlerName != null
                        || x.OppBowlerId.HasValue))
            .WithMessage("Set either MoraBowlerId or opponent bowler — not both.");

        RuleFor(x => x.RunsOffBat)
            .InclusiveBetween(0, 7)
            .WithMessage("RunsOffBat must be 0-7.");

        RuleFor(x => x.ExtrasRuns)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.ExtrasType)
            .Must(e => e is null || ValidExtras.Contains(e))
            .WithMessage("Invalid ExtrasType.");

        // Wicket fields required when IsWicket is true
        When(x => x.IsWicket, () =>
        {
            RuleFor(x => x.WicketType)
                .NotEmpty()
                .Must(w => ValidWickets.Contains(w!))
                .WithMessage("WicketType is required when IsWicket is true.");

            RuleFor(x => x.DismissedBatterName)
                .NotEmpty()
                .WithMessage("DismissedBatterName required when IsWicket is true.");
        });

        // Optional enrichment fields
        RuleFor(x => x.BowlingSide)
            .Must(b => b is null || ValidBowlingSides.Contains(b))
            .WithMessage("BowlingSide must be OVER or AROUND.");

        RuleFor(x => x.ShotType)
            .Must(s => s is null || ValidShots.Contains(s))
            .WithMessage("Invalid ShotType.");

        RuleFor(x => x.DirectionZone)
            .Must(d => d is null || ValidZones.Contains(d))
            .WithMessage("Invalid DirectionZone.");
    }
}
