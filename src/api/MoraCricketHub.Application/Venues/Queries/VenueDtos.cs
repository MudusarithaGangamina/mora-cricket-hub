using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Venues.Queries;

public record VenueDto(
    Guid Id,
    string Name,
    string? City,
    bool IsMoraHomeGround
);

public record GetAllVenuesQuery : IRequest<List<VenueDto>>;
public record GetVenueByIdQuery(Guid VenueId) : IRequest<VenueDto?>;
