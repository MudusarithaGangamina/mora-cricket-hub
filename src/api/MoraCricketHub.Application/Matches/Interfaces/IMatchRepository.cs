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
    Task<bool> SetSquadAsync(Guid matchId, List<Guid> playerIds, CancellationToken ct);
    Task<List<SquadMemberDto>> GetSquadAsync(Guid matchId, CancellationToken ct);
    Task<List<OpponentSquadMemberDto>> GetOpponentSquadAsync(Guid matchId, CancellationToken ct);
    Task<bool> SetOpponentSquadAsync(Guid matchId, List<MatchOpponentSquadEntry> entries, CancellationToken ct);
    Task<MatchSummaryDataDto?> GetMatchSummaryDataAsync(Guid matchId, CancellationToken ct);
}
