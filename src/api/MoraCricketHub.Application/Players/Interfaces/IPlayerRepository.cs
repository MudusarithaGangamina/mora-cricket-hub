using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Application.Players.Queries;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Players.Interfaces;

public interface IPlayerRepository
{
    Task<List<PlayerSummaryDto>> GetAllAsync(
        bool activeOnly, CancellationToken cancellationToken);

    Task<PlayerDetailDto?> GetByIdAsync(
        Guid id, CancellationToken cancellationToken);

    Task<Guid> CreateAsync(
        Player player, CancellationToken cancellationToken);

    Task<bool> UpdateAsync(
        Player player, CancellationToken cancellationToken);

    Task<Player?> FindByIdAsync(
        Guid id, CancellationToken cancellationToken);
}
