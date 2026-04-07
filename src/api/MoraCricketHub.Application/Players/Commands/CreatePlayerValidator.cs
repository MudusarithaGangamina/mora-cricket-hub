using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;

namespace MoraCricketHub.Application.Players.Commands;

public class CreatePlayerValidator : AbstractValidator<CreatePlayerCommand>
{
    private static readonly string[] ValidBattingStyles = ["RHB", "LHB"];

    private static readonly string[] ValidBowlingStyles =
    [
        "RF","RFM","RM","RMF","OB","LB","SLA","SLO","LM","LMF","LF"
    ];

    public CreatePlayerValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(100);

        RuleFor(x => x.ShortName)
            .NotEmpty().WithMessage("Short name is required.")
            .MaximumLength(30);

        RuleFor(x => x.Nickname)
            .MaximumLength(30)
            .When(x => x.Nickname is not null);

        RuleFor(x => x.BatchYear)
            .InclusiveBetween(17, 30)
            .WithMessage("Batch year must be between 17 and 30 (e.g. 18 for 2018 intake).");

        RuleFor(x => x.BattingStyle)
            .NotEmpty()
            .Must(s => ValidBattingStyles.Contains(s))
            .WithMessage("BattingStyle must be RHB or LHB.");

        RuleFor(x => x.PrimaryBowlingStyle)
            .Must(s => s is null || ValidBowlingStyles.Contains(s))
            .WithMessage($"PrimaryBowlingStyle must be one of: {string.Join(", ", ValidBowlingStyles)}.");

        RuleFor(x => x.PhotoUrl)
            .MaximumLength(300)
            .When(x => x.PhotoUrl is not null);
    }
}
