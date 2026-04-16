using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Seasons.Interfaces;
using MoraCricketHub.Application.Seasons.Queries;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Repositories;

public class SeasonRepository : ISeasonRepository
{
    private readonly AppDbContext _db;
    public SeasonRepository(AppDbContext db) => _db = db;

    public async Task<List<SeasonDto>> GetAllAsync(CancellationToken ct)
        => await _db.Seasons
            .OrderByDescending(s => s.StartDate)
            .Select(s => new SeasonDto(
                s.Id, s.Name,
                s.StartDate.ToString("yyyy-MM-dd"),
                s.EndDate.HasValue ? s.EndDate.Value.ToString("yyyy-MM-dd") : null))
            .ToListAsync(ct);

    public async Task<SeasonDto?> GetByIdAsync(Guid id, CancellationToken ct)
        => await _db.Seasons
            .Where(s => s.Id == id)
            .Select(s => new SeasonDto(
                s.Id, s.Name,
                s.StartDate.ToString("yyyy-MM-dd"),
                s.EndDate.HasValue ? s.EndDate.Value.ToString("yyyy-MM-dd") : null))
            .FirstOrDefaultAsync(ct);

    public Task<Season?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.Seasons.FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<Guid> CreateAsync(Season season, CancellationToken ct)
    {
        _db.Seasons.Add(season);
        await _db.SaveChangesAsync(ct);
        return season.Id;
    }

    public async Task<bool> UpdateAsync(Season season, CancellationToken ct)
    {
        _db.Seasons.Update(season);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var season = await _db.Seasons.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (season is null) return false;
        _db.Seasons.Remove(season);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
