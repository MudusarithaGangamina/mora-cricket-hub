using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;
using MediatR;
using MoraCricketHub.Application.Opponents.Interfaces;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Application.Opponents.Commands;

// ── Opponent team handlers ────────────────────────────────────────────────────
public class CreateOpponentHandler : IRequestHandler<CreateOpponentCommand, Guid>
{
    private readonly IOpponentRepository _repo;
    public CreateOpponentHandler(IOpponentRepository repo) => _repo = repo;

    public Task<Guid> Handle(CreateOpponentCommand r, CancellationToken ct)
        => _repo.CreateAsync(new Opponent
        {
            Name = r.Name.Trim(),
            ShortName = r.ShortName.Trim(),
        }, ct);
}

public class UpdateOpponentHandler : IRequestHandler<UpdateOpponentCommand, bool>
{
    private readonly IOpponentRepository _repo;
    public UpdateOpponentHandler(IOpponentRepository repo) => _repo = repo;

    public async Task<bool> Handle(UpdateOpponentCommand r, CancellationToken ct)
    {
        var o = await _repo.FindByIdAsync(r.OpponentId, ct);
        if (o is null) return false;
        o.Name = r.Name.Trim();
        o.ShortName = r.ShortName.Trim();
        return await _repo.UpdateAsync(o, ct);
    }
}

// ── Opponent player handlers ──────────────────────────────────────────────────
public class CreateOpponentPlayerHandler
    : IRequestHandler<CreateOpponentPlayerCommand, Guid>
{
    private readonly IOpponentRepository _repo;
    public CreateOpponentPlayerHandler(IOpponentRepository repo) => _repo = repo;

    public Task<Guid> Handle(CreateOpponentPlayerCommand r, CancellationToken ct)
        => _repo.CreatePlayerAsync(new OpponentPlayer
        {
            OpponentId = r.OpponentId,
            FullName = r.FullName.Trim(),
            BattingStyle = r.BattingStyle is null
                             ? null
                             : Enum.Parse<BattingStyle>(r.BattingStyle),
            BowlingStyle = r.BowlingStyle is null
                             ? null
                             : Enum.Parse<BowlingStyle>(r.BowlingStyle),
            Notes = r.Notes?.Trim(),
        }, ct);
}

public class UpdateOpponentPlayerHandler
    : IRequestHandler<UpdateOpponentPlayerCommand, bool>
{
    private readonly IOpponentRepository _repo;
    public UpdateOpponentPlayerHandler(IOpponentRepository repo) => _repo = repo;

    public async Task<bool> Handle(UpdateOpponentPlayerCommand r, CancellationToken ct)
    {
        var p = await _repo.FindPlayerByIdAsync(r.OpponentPlayerId, ct);
        if (p is null) return false;

        p.FullName = r.FullName.Trim();
        p.BattingStyle = r.BattingStyle is null
                           ? null
                           : Enum.Parse<BattingStyle>(r.BattingStyle);
        p.BowlingStyle = r.BowlingStyle is null
                           ? null
                           : Enum.Parse<BowlingStyle>(r.BowlingStyle);
        p.Notes = r.Notes?.Trim();

        return await _repo.UpdatePlayerAsync(p, ct);
    }
}

// ── Validators ────────────────────────────────────────────────────────────────
public class CreateOpponentValidator : AbstractValidator<CreateOpponentCommand>
{
    public CreateOpponentValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ShortName).NotEmpty().MaximumLength(20);
    }
}

public class UpdateOpponentValidator : AbstractValidator<UpdateOpponentCommand>
{
    public UpdateOpponentValidator()
    {
        RuleFor(x => x.OpponentId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ShortName).NotEmpty().MaximumLength(20);
    }
}

public class CreateOpponentPlayerValidator
    : AbstractValidator<CreateOpponentPlayerCommand>
{
    private static readonly string[] ValidBattingStyles = ["RHB", "LHB"];
    private static readonly string[] ValidBowlingStyles =
        ["RF", "RFM", "RM", "RMF", "OB", "LB", "SLA", "SLO", "LM", "LMF", "LF"];

    public CreateOpponentPlayerValidator()
    {
        RuleFor(x => x.OpponentId).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BattingStyle)
            .Must(s => s is null || ValidBattingStyles.Contains(s))
            .WithMessage("BattingStyle must be RHB or LHB.");
        RuleFor(x => x.BowlingStyle)
            .Must(s => s is null || ValidBowlingStyles.Contains(s))
            .WithMessage($"BowlingStyle must be one of the valid styles.");
        RuleFor(x => x.Notes).MaximumLength(200).When(x => x.Notes is not null);
    }
}

public class UpdateOpponentPlayerValidator
    : AbstractValidator<UpdateOpponentPlayerCommand>
{
    private static readonly string[] ValidBattingStyles = ["RHB", "LHB"];
    private static readonly string[] ValidBowlingStyles =
        ["RF", "RFM", "RM", "RMF", "OB", "LB", "SLA", "SLO", "LM", "LMF", "LF"];

    public UpdateOpponentPlayerValidator()
    {
        RuleFor(x => x.OpponentPlayerId).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BattingStyle)
            .Must(s => s is null || ValidBattingStyles.Contains(s));
        RuleFor(x => x.BowlingStyle)
            .Must(s => s is null || ValidBowlingStyles.Contains(s));
    }
}
