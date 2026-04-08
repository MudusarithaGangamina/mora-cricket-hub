using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;
using MediatR;
using MoraCricketHub.Application.Tournaments.Interfaces;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Tournaments.Commands;

public class CreateTournamentHandler : IRequestHandler<CreateTournamentCommand, Guid>
{
    private readonly ITournamentRepository _repo;
    public CreateTournamentHandler(ITournamentRepository repo) => _repo = repo;

    public Task<Guid> Handle(CreateTournamentCommand request, CancellationToken ct)
    {
        var t = new Tournament
        {
            SeasonId = request.SeasonId,
            Name = request.Name.Trim(),
            Format = request.Format,
            OversPerSide = request.OversPerSide,
        };
        return _repo.CreateAsync(t, ct);
    }
}

public class UpdateTournamentHandler : IRequestHandler<UpdateTournamentCommand, bool>
{
    private readonly ITournamentRepository _repo;
    public UpdateTournamentHandler(ITournamentRepository repo) => _repo = repo;

    public async Task<bool> Handle(UpdateTournamentCommand request, CancellationToken ct)
    {
        var t = await _repo.FindByIdAsync(request.TournamentId, ct);
        if (t is null) return false;

        t.SeasonId = request.SeasonId;
        t.Name = request.Name.Trim();
        t.Format = request.Format;
        t.OversPerSide = request.OversPerSide;

        return await _repo.UpdateAsync(t, ct);
    }
}

public class CreateTournamentValidator : AbstractValidator<CreateTournamentCommand>
{
    private static readonly string[] ValidFormats = ["ODI", "T20", "Other"];

    public CreateTournamentValidator()
    {
        RuleFor(x => x.SeasonId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Format)
            .NotEmpty()
            .Must(f => ValidFormats.Contains(f))
            .WithMessage("Format must be ODI, T20 or Other.");
        RuleFor(x => x.OversPerSide)
            .InclusiveBetween(10, 50)
            .WithMessage("OversPerSide must be between 10 and 50.");
    }
}

public class UpdateTournamentValidator : AbstractValidator<UpdateTournamentCommand>
{
    private static readonly string[] ValidFormats = ["ODI", "T20", "Other"];

    public UpdateTournamentValidator()
    {
        RuleFor(x => x.TournamentId).NotEmpty();
        RuleFor(x => x.SeasonId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Format)
            .Must(f => ValidFormats.Contains(f));
        RuleFor(x => x.OversPerSide).InclusiveBetween(10, 50);
    }
}
