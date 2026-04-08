using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;
using MediatR;
using MoraCricketHub.Application.Seasons.Interfaces;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Seasons.Commands;

// ── Create ────────────────────────────────────────────────────────────────────
public class CreateSeasonHandler : IRequestHandler<CreateSeasonCommand, Guid>
{
    private readonly ISeasonRepository _repo;
    public CreateSeasonHandler(ISeasonRepository repo) => _repo = repo;

    public Task<Guid> Handle(CreateSeasonCommand request, CancellationToken ct)
    {
        var season = new Season
        {
            Name = request.Name.Trim(),
            StartDate = DateOnly.Parse(request.StartDate),
            EndDate = request.EndDate is null
                          ? null
                          : DateOnly.Parse(request.EndDate),
        };
        return _repo.CreateAsync(season, ct);
    }
}

// ── Update ────────────────────────────────────────────────────────────────────
public class UpdateSeasonHandler : IRequestHandler<UpdateSeasonCommand, bool>
{
    private readonly ISeasonRepository _repo;
    public UpdateSeasonHandler(ISeasonRepository repo) => _repo = repo;

    public async Task<bool> Handle(UpdateSeasonCommand request, CancellationToken ct)
    {
        var season = await _repo.FindByIdAsync(request.SeasonId, ct);
        if (season is null) return false;

        season.Name = request.Name.Trim();
        season.StartDate = DateOnly.Parse(request.StartDate);
        season.EndDate = request.EndDate is null
                             ? null
                             : DateOnly.Parse(request.EndDate);

        return await _repo.UpdateAsync(season, ct);
    }
}

// ── Validators ────────────────────────────────────────────────────────────────
public class CreateSeasonValidator : AbstractValidator<CreateSeasonCommand>
{
    public CreateSeasonValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().MaximumLength(20)
            .WithMessage("Season name required, max 20 chars. e.g. '2022/23'");

        RuleFor(x => x.StartDate)
            .NotEmpty()
            .Must(d => DateOnly.TryParse(d, out _))
            .WithMessage("StartDate must be a valid date (yyyy-MM-dd).");
    }
}

public class UpdateSeasonValidator : AbstractValidator<UpdateSeasonCommand>
{
    public UpdateSeasonValidator()
    {
        RuleFor(x => x.SeasonId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(20);
        RuleFor(x => x.StartDate)
            .NotEmpty()
            .Must(d => DateOnly.TryParse(d, out _));
    }
}
