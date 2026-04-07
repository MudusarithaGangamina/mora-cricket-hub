using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Players.Interfaces;
using MoraCricketHub.Application.Players.Queries;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Repositories;

public class PlayerRepository : IPlayerRepository
{
    private readonly AppDbContext _db;
    public PlayerRepository(AppDbContext db) => _db = db;

    public async Task<List<PlayerSummaryDto>> GetAllAsync(
        bool activeOnly,
        CancellationToken cancellationToken)
    {
        var query = _db.Players.AsQueryable();

        if (activeOnly)
            query = query.Where(p => p.IsActive);

        return await query
            .OrderBy(p => p.BatchYear)
            .ThenBy(p => p.FullName)
            .Select(p => new PlayerSummaryDto(
                p.Id,
                p.FullName,
                p.ShortName,
                p.Nickname,
                p.PhotoUrl,
                p.Faculty,
                p.Degree,
                p.BatchYear,
                p.BattingStyle.ToString(),
                p.PrimaryBowlingStyle.HasValue
                    ? p.PrimaryBowlingStyle.Value.ToString()
                    : null,
                p.DebutDate.HasValue
                    ? p.DebutDate.Value.ToString("yyyy-MM-dd")
                    : null,
                p.IsActive
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<PlayerDetailDto?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var player = await _db.Players
            .Include(p => p.Seasons)
                .ThenInclude(ps => ps.Season)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (player is null) return null;

        return new PlayerDetailDto(
            player.Id,
            player.FullName,
            player.ShortName,
            player.Nickname,
            player.PhotoUrl,
            player.Faculty,
            player.Degree,
            player.BatchYear,
            player.BattingStyle.ToString(),
            player.PrimaryBowlingStyle?.ToString(),
            player.DebutDate?.ToString("yyyy-MM-dd"),
            player.IsActive,
            player.Seasons.Select(ps => new PlayerSeasonDto(
                ps.SeasonId,
                ps.Season.Name,
                ps.JerseyNumber,
                ps.BattingRole?.ToString()
            )).ToList()
        );
    }

    public async Task<Player?> FindByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
        => await _db.Players
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<Guid> CreateAsync(
        Player player,
        CancellationToken cancellationToken)
    {
        _db.Players.Add(player);
        await _db.SaveChangesAsync(cancellationToken);
        return player.Id;
    }

    public async Task<bool> UpdateAsync(
        Player player,
        CancellationToken cancellationToken)
    {
        _db.Players.Update(player);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
