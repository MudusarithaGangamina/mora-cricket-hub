using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Venues.Interfaces;

namespace MoraCricketHub.Application.Venues.Queries;

public class GetAllVenuesHandler : IRequestHandler<GetAllVenuesQuery, List<VenueDto>>
{
    private readonly IVenueRepository _repo;
    public GetAllVenuesHandler(IVenueRepository repo) => _repo = repo;
    public Task<List<VenueDto>> Handle(GetAllVenuesQuery r, CancellationToken ct)
        => _repo.GetAllAsync(ct);
}

public class GetVenueByIdHandler : IRequestHandler<GetVenueByIdQuery, VenueDto?>
{
    private readonly IVenueRepository _repo;
    public GetVenueByIdHandler(IVenueRepository repo) => _repo = repo;
    public Task<VenueDto?> Handle(GetVenueByIdQuery r, CancellationToken ct)
        => _repo.GetByIdAsync(r.VenueId, ct);
}
