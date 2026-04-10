using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Application.Matches.Queries;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Matches.Interfaces;

public interface IMatchRepository
{
    Task<PagedMatchesDto> GetAllAsync(GetAllMatchesQuery query, CancellationToken ct);
    Task<MatchDetailDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Match?> FindByIdAsync(Guid id, CancellationToken ct);
    Task<Guid> CreateAsync(Match match, CancellationToken ct);
    Task<bool> UpdateAsync(Match match, CancellationToken ct);
}
