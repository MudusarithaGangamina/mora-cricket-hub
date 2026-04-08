using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Tournaments.Interfaces;
using MoraCricketHub.Application.Tournaments.Queries;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Repositories;

public class TournamentRepository : ITournamentRepository
{
    private readonly AppDbContext _db;
    public TournamentRepository(AppDbContext db) => _db = db;

    public async Task<List<TournamentDto>> GetAllAsync(
        Guid? seasonId, CancellationToken ct)
    {
        var query = _db.Tournaments.Include(t => t.Season).AsQueryable();
        if (seasonId.HasValue)
            query = query.Where(t => t.SeasonId == seasonId.Value);

        return await query
            .OrderByDescending(t => t.Season.StartDate)
            .Select(t => new TournamentDto(
                t.Id, t.SeasonId, t.Season.Name,
                t.Name, t.Format, t.OversPerSide))
            .ToListAsync(ct);
    }

    public async Task<TournamentDto?> GetByIdAsync(Guid id, CancellationToken ct)
        => await _db.Tournaments
            .Include(t => t.Season)
            .Where(t => t.Id == id)
            .Select(t => new TournamentDto(
                t.Id, t.SeasonId, t.Season.Name,
                t.Name, t.Format, t.OversPerSide))
            .FirstOrDefaultAsync(ct);

    public Task<Tournament?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.Tournaments.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<Guid> CreateAsync(Tournament tournament, CancellationToken ct)
    {
        _db.Tournaments.Add(tournament);
        await _db.SaveChangesAsync(ct);
        return tournament.Id;
    }

    public async Task<bool> UpdateAsync(Tournament tournament, CancellationToken ct)
    {
        _db.Tournaments.Update(tournament);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
