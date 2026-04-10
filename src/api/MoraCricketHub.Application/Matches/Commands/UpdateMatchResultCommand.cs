using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;
using MediatR;

namespace MoraCricketHub.Application.Matches.Commands;

// Separate command for updating result only after match is played
// Full match edit uses UpdateMatchCommand below
public record UpdateMatchResultCommand(
    Guid MatchId,
    string Status,
    string? ResultType,
    int? ResultMargin,
    string? ResultMarginType,
    bool DlsApplied,
    int? DlsTarget,
    int? RevisedOvers,
    string? PlayerOfMatchName,
    Guid? PlayerOfMatchMoraId,
    string? PlayerOfMatchTeam,
    string? Notes
) : IRequest<bool>;

public class UpdateMatchResultValidator : AbstractValidator<UpdateMatchResultCommand>
{
    private static readonly string[] Statuses =
    [
        "COMPLETED", "ABANDONED", "ABANDONED_MID",
        "NO_RESULT", "PRE_TOSS_ABANDONED"
    ];

    private static readonly string[] ResultTypes =
    [
        "WIN", "LOSS", "TIE_TOSS", "TIE_BOWL_OUT", "NR", "ABANDONED"
    ];

    public UpdateMatchResultValidator()
    {
        RuleFor(x => x.MatchId).NotEmpty();

        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(s => Statuses.Contains(s));

        RuleFor(x => x.ResultType)
            .Must(r => r is null || ResultTypes.Contains(r));

        When(x => x.DlsApplied, () =>
        {
            RuleFor(x => x.DlsTarget)
                .NotNull().GreaterThan(0);
        });
    }
}
