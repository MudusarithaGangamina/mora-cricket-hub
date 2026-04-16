using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Application.Tournaments.Queries;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Tournaments.Interfaces;

public interface ITournamentRepository
{
    Task<List<TournamentDto>> GetAllAsync(Guid? seasonId, CancellationToken ct);
    Task<TournamentDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Tournament?> FindByIdAsync(Guid id, CancellationToken ct);
    Task<Guid> CreateAsync(Tournament tournament, CancellationToken ct);
    Task<bool> UpdateAsync(Tournament tournament, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}
