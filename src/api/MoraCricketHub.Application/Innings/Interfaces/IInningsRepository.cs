using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Application.Innings.Queries;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Innings.Interfaces;

public interface IInningsRepository
{
    Task<InningsScorecardDto?> GetScorecardAsync(
        Guid inningsId, CancellationToken ct);

    Task<List<InningsScorecardDto>> GetMatchScorecardsAsync(
        Guid matchId, CancellationToken ct);

    Task<MoraCricketHub.Domain.Entities.Innings?> FindByIdAsync(Guid inningsId, CancellationToken ct);
    Task<Guid> CreateInningsAsync(MoraCricketHub.Domain.Entities.Innings innings, CancellationToken ct);
    Task<bool> UpdateInningsAsync(MoraCricketHub.Domain.Entities.Innings innings, CancellationToken ct);

    // Batting
    Task<Guid> AddMoraBattingAsync(
        MoraBattingPerformance perf, CancellationToken ct);
    Task<bool> UpdateMoraBattingAsync(
        MoraBattingPerformance perf, CancellationToken ct);
    Task<MoraBattingPerformance?> FindMoraBattingAsync(
        Guid id, CancellationToken ct);

    Task<Guid> AddOpponentBattingAsync(
        OpponentBattingPerformance perf, CancellationToken ct);
    Task<bool> UpdateOpponentBattingAsync(
        OpponentBattingPerformance perf, CancellationToken ct);
    Task<OpponentBattingPerformance?> FindOpponentBattingAsync(
        Guid id, CancellationToken ct);

    // Bowling
    Task<Guid> AddMoraBowlingAsync(
        MoraBowlingPerformance perf, CancellationToken ct);
    Task<bool> UpdateMoraBowlingAsync(
        MoraBowlingPerformance perf, CancellationToken ct);
    Task<MoraBowlingPerformance?> FindMoraBowlingAsync(
        Guid id, CancellationToken ct);

    Task<Guid> AddOpponentBowlingAsync(
        OpponentBowlingPerformance perf, CancellationToken ct);
    Task<bool> UpdateOpponentBowlingAsync(
        OpponentBowlingPerformance perf, CancellationToken ct);
    Task<OpponentBowlingPerformance?> FindOpponentBowlingAsync(
        Guid id, CancellationToken ct);

    // Fall of wickets
    Task<Guid> AddFallOfWicketAsync(
        FallOfWicket fow, CancellationToken ct);

    // Partnerships
    Task<Guid> AddPartnershipAsync(
        Partnership partnership, CancellationToken ct);

    // Fielding
    Task<Guid> AddMoraFieldingAsync(
        MoraFieldingPerformance perf, CancellationToken ct);
    Task<bool> UpdateMoraFieldingAsync(
        MoraFieldingPerformance perf, CancellationToken ct);
    Task<MoraFieldingPerformance?> FindMoraFieldingAsync(
        Guid id, CancellationToken ct);

    // Add these to the existing interface:
    Task<Guid> AddInningsEventAsync(InningsEvent ev, CancellationToken ct);
    Task<List<InningsEvent>> GetInningsEventsAsync(Guid inningsId, CancellationToken ct);
}
