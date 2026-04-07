using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;

namespace MoraCricketHub.Application.Players.Commands;

public class UpdatePlayerValidator : AbstractValidator<UpdatePlayerCommand>
{
    private static readonly string[] ValidBattingStyles = ["RHB", "LHB"];
    private static readonly string[] ValidBowlingStyles =
        ["RF", "RFM", "RM", "RMF", "OB", "LB", "SLA", "SLO", "LM", "LMF", "LF"];

    public UpdatePlayerValidator()
    {
        RuleFor(x => x.PlayerId).NotEmpty();

        RuleFor(x => x.FullName)
            .NotEmpty().MaximumLength(100);

        RuleFor(x => x.ShortName)
            .NotEmpty().MaximumLength(30);

        RuleFor(x => x.BatchYear)
            .InclusiveBetween(17, 30);

        RuleFor(x => x.BattingStyle)
            .NotEmpty()
            .Must(s => ValidBattingStyles.Contains(s));

        RuleFor(x => x.PrimaryBowlingStyle)
            .Must(s => s is null || ValidBowlingStyles.Contains(s));
    }
}
