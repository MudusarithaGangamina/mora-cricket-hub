using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Venues.Interfaces;
using MoraCricketHub.Application.Venues.Queries;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Repositories;

public class VenueRepository : IVenueRepository
{
    private readonly AppDbContext _db;
    public VenueRepository(AppDbContext db) => _db = db;

    public async Task<List<VenueDto>> GetAllAsync(CancellationToken ct)
        => await _db.Venues
            .OrderBy(v => v.Name)
            .Select(v => new VenueDto(v.Id, v.Name, v.City, v.IsMoraHomeGround))
            .ToListAsync(ct);

    public async Task<VenueDto?> GetByIdAsync(Guid id, CancellationToken ct)
        => await _db.Venues
            .Where(v => v.Id == id)
            .Select(v => new VenueDto(v.Id, v.Name, v.City, v.IsMoraHomeGround))
            .FirstOrDefaultAsync(ct);

    public Task<Venue?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.Venues.FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task<Guid> CreateAsync(Venue venue, CancellationToken ct)
    {
        _db.Venues.Add(venue);
        await _db.SaveChangesAsync(ct);
        return venue.Id;
    }

    public async Task<bool> UpdateAsync(Venue venue, CancellationToken ct)
    {
        _db.Venues.Update(venue);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var venue = await _db.Venues.FirstOrDefaultAsync(v => v.Id == id, ct);
        if (venue is null) return false;
        _db.Venues.Remove(venue);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
