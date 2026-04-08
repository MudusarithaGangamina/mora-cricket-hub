using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Venues.Commands;

public record CreateVenueCommand(
    string Name,
    string? City,
    bool IsMoraHomeGround
) : IRequest<Guid>;

public record UpdateVenueCommand(
    Guid VenueId,
    string Name,
    string? City,
    bool IsMoraHomeGround
) : IRequest<bool>;
