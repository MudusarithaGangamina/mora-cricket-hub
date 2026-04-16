using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Application.Opponents.Queries;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Opponents.Interfaces;

public interface IOpponentRepository
{
    Task<List<OpponentDto>> GetAllAsync(CancellationToken ct);
    Task<OpponentDetailDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Opponent?> FindByIdAsync(Guid id, CancellationToken ct);
    Task<Guid> CreateAsync(Opponent opponent, CancellationToken ct);
    Task<bool> UpdateAsync(Opponent opponent, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);

    // Opponent players
    Task<OpponentPlayer?> FindPlayerByIdAsync(Guid id, CancellationToken ct);
    Task<Guid> CreatePlayerAsync(OpponentPlayer player, CancellationToken ct);
    Task<bool> UpdatePlayerAsync(OpponentPlayer player, CancellationToken ct);
    Task<bool> DeletePlayerAsync(Guid playerId, CancellationToken ct);
}
