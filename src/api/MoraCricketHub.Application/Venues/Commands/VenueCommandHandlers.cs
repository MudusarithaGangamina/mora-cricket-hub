using System;
using System.Collections.Generic;
using System.Text;
using FluentValidation;
using MediatR;
using MoraCricketHub.Application.Venues.Interfaces;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Venues.Commands;

public class CreateVenueHandler : IRequestHandler<CreateVenueCommand, Guid>
{
    private readonly IVenueRepository _repo;
    public CreateVenueHandler(IVenueRepository repo) => _repo = repo;

    public Task<Guid> Handle(CreateVenueCommand r, CancellationToken ct)
        => _repo.CreateAsync(new Venue
        {
            Name = r.Name.Trim(),
            City = r.City?.Trim(),
            IsMoraHomeGround = r.IsMoraHomeGround,
        }, ct);
}

public class UpdateVenueHandler : IRequestHandler<UpdateVenueCommand, bool>
{
    private readonly IVenueRepository _repo;
    public UpdateVenueHandler(IVenueRepository repo) => _repo = repo;

    public async Task<bool> Handle(UpdateVenueCommand r, CancellationToken ct)
    {
        var venue = await _repo.FindByIdAsync(r.VenueId, ct);
        if (venue is null) return false;

        venue.Name = r.Name.Trim();
        venue.City = r.City?.Trim();
        venue.IsMoraHomeGround = r.IsMoraHomeGround;

        return await _repo.UpdateAsync(venue, ct);
    }
}

public class CreateVenueValidator : AbstractValidator<CreateVenueCommand>
{
    public CreateVenueValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.City).MaximumLength(100).When(x => x.City is not null);
    }
}

public class UpdateVenueValidator : AbstractValidator<UpdateVenueCommand>
{
    public UpdateVenueValidator()
    {
        RuleFor(x => x.VenueId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.City).MaximumLength(100).When(x => x.City is not null);
    }
}
