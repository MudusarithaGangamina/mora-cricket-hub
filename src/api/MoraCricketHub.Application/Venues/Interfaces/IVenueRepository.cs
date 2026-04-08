using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Application.Venues.Queries;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Venues.Interfaces;

public interface IVenueRepository
{
    Task<List<VenueDto>> GetAllAsync(CancellationToken ct);
    Task<VenueDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Venue?> FindByIdAsync(Guid id, CancellationToken ct);
    Task<Guid> CreateAsync(Venue venue, CancellationToken ct);
    Task<bool> UpdateAsync(Venue venue, CancellationToken ct);
}
