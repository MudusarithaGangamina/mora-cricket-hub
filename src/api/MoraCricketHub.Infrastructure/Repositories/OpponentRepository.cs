using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Opponents.Interfaces;
using MoraCricketHub.Application.Opponents.Queries;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Repositories;

public class OpponentRepository : IOpponentRepository
{
    private readonly AppDbContext _db;
    public OpponentRepository(AppDbContext db) => _db = db;

    public async Task<List<OpponentDto>> GetAllAsync(CancellationToken ct)
        => await _db.Opponents
            .OrderBy(o => o.Name)
            .Select(o => new OpponentDto(
                o.Id, o.Name, o.ShortName,
                o.Players.Count))
            .ToListAsync(ct);

    public async Task<OpponentDetailDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var o = await _db.Opponents
            .Include(o => o.Players)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

        if (o is null) return null;

        return new OpponentDetailDto(
            o.Id, o.Name, o.ShortName,
            o.Players.Select(p => new OpponentPlayerDto(
                p.Id, p.FullName,
                p.BattingStyle?.ToString(),
                p.BowlingStyle?.ToString(),
                p.Notes)).ToList());
    }

    public Task<Opponent?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.Opponents.FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<Guid> CreateAsync(Opponent opponent, CancellationToken ct)
    {
        _db.Opponents.Add(opponent);
        await _db.SaveChangesAsync(ct);
        return opponent.Id;
    }

    public async Task<bool> UpdateAsync(Opponent opponent, CancellationToken ct)
    {
        _db.Opponents.Update(opponent);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public Task<OpponentPlayer?> FindPlayerByIdAsync(Guid id, CancellationToken ct)
        => _db.OpponentPlayers.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Guid> CreatePlayerAsync(OpponentPlayer player, CancellationToken ct)
    {
        _db.OpponentPlayers.Add(player);
        await _db.SaveChangesAsync(ct);
        return player.Id;
    }

    public async Task<bool> UpdatePlayerAsync(OpponentPlayer player, CancellationToken ct)
    {
        _db.OpponentPlayers.Update(player);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
