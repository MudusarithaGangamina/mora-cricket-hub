using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Matches.Interfaces;
using MoraCricketHub.Application.Matches.Queries;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Repositories;

public class MatchRepository : IMatchRepository
{
    private readonly AppDbContext _db;
    public MatchRepository(AppDbContext db) => _db = db;

    public async Task<PagedMatchesDto> GetAllAsync(
        GetAllMatchesQuery query, CancellationToken ct)
    {
        var q = _db.Matches
            .Include(m => m.Tournament).ThenInclude(t => t.Season)
            .Include(m => m.Opponent)
            .Include(m => m.Venue)
            .Include(m => m.MoraCaptain)
            .AsQueryable();

        // Filters
        if (query.TournamentId.HasValue)
            q = q.Where(m => m.TournamentId == query.TournamentId.Value);

        if (query.OpponentId.HasValue)
            q = q.Where(m => m.OpponentId == query.OpponentId.Value);

        if (!string.IsNullOrEmpty(query.Season))
            q = q.Where(m => m.Tournament.Season.Name == query.Season);

        if (!string.IsNullOrEmpty(query.ResultType))
            q = q.Where(m => m.ResultType.HasValue &&
                              m.ResultType.Value.ToString() == query.ResultType);

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderByDescending(m => m.MatchDate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new PagedMatchesDto(
            items.Select(ToSummary).ToList(),
            total,
            query.Page,
            query.PageSize);
    }

    public async Task<MatchDetailDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var m = await _db.Matches
            .Include(m => m.Tournament).ThenInclude(t => t.Season)
            .Include(m => m.Opponent)
            .Include(m => m.Venue)
            .Include(m => m.MoraCaptain)
            .Include(m => m.MoraWickekeeper)
            .Include(m => m.PlayerOfMatchMora)
            .Include(m => m.Innings)
            .FirstOrDefaultAsync(m => m.Id == id, ct);

        if (m is null) return null;

        return new MatchDetailDto(
            m.Id,
            m.MatchDate.ToString("yyyy-MM-dd"),
            m.TournamentId.ToString(),
            m.Tournament.Name,
            m.Tournament.Format,
            m.Tournament.OversPerSide,
            m.Tournament.Season.Name,
            m.OpponentId.ToString(),
            m.Opponent.Name,
            m.Opponent.ShortName,
            m.VenueId?.ToString(),
            m.Venue?.Name,
            m.Venue?.City,
            m.VenueType.ToString(),
            m.SurfaceType.ToString(),
            m.BallColour.ToString(),
            m.BallType.ToString(),
            m.RoundType.ToString(),
            m.RoundLabel,
            m.TossHeld,
            m.TossWinner,
            m.TossDecision,
            m.MoraBattingFirst,
            m.Status.ToString(),
            m.ResultType?.ToString(),
            m.ResultMargin,
            m.ResultMarginType,
            m.DlsApplied,
            m.DlsTarget,
            m.RevisedOvers,
            m.MoraCaptainId?.ToString(),
            m.MoraCaptain is null
                ? null
                : $"{m.MoraCaptain.FullName}",
            m.MoraWickeeperId?.ToString(),
            m.MoraWickekeeper is null
                ? null
                : $"{m.MoraWickekeeper.FullName}",
            m.OpponentCaptainName,
            m.PlayerOfMatchMoraId?.ToString(),
            m.PlayerOfMatchName,
            m.PlayerOfMatchTeam,
            m.Notes,
            m.ScheduledOvers,
            m.IsConfirmed,
            m.Innings
                .OrderBy(i => i.InningsNumber)
                .Select(ToInningsSummary)
                .ToList()
        );
    }

    public Task<Match?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.Matches.FirstOrDefaultAsync(m => m.Id == id, ct);

    public async Task<Guid> CreateAsync(Match match, CancellationToken ct)
    {
        _db.Matches.Add(match);
        await _db.SaveChangesAsync(ct);
        return match.Id;
    }

    public async Task<bool> UpdateAsync(Match match, CancellationToken ct)
    {
        _db.Matches.Update(match);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<List<SquadMemberDto>> GetSquadAsync(
    Guid matchId, CancellationToken ct)
    => await _db.MatchSquads
        .Include(ms => ms.Player)
        .Where(ms => ms.MatchId == matchId)
        .Select(ms => new SquadMemberDto(
            ms.PlayerId,
            ms.Player.FullName,
            ms.Player.ShortName,
            ms.Player.BattingStyle.ToString(),
            ms.Player.PrimaryBowlingStyle != null
                ? ms.Player.PrimaryBowlingStyle.Value.ToString()
                : null,
            ms.IsPlayingXi))
        .ToListAsync(ct);

    public async Task<bool> SetSquadAsync(
        Guid matchId, List<Guid> playerIds, CancellationToken ct)
    {
        // Remove existing squad entries for this match
        var existing = await _db.MatchSquads
            .Where(ms => ms.MatchId == matchId)
            .ToListAsync(ct);
        _db.MatchSquads.RemoveRange(existing);

        // Add fresh entries
        foreach (var pid in playerIds)
        {
            _db.MatchSquads.Add(new MatchSquad
            {
                MatchId = matchId,
                PlayerId = pid,
                IsPlayingXi = true,
            });
        }

        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<List<OpponentSquadMemberDto>> GetOpponentSquadAsync(
    Guid matchId, CancellationToken ct)
    => await _db.MatchOpponentSquads
        .Where(m => m.MatchId == matchId)
        .OrderBy(m => m.BattingOrder)
        .ThenBy(m => m.PlayerName)
        .Select(m => new OpponentSquadMemberDto(
            m.OpponentPlayerId,
            m.PlayerName,
            m.BattingStyle,
            m.BowlingStyle,
            m.BattingOrder))
        .ToListAsync(ct);

    public async Task<bool> SetOpponentSquadAsync(
        Guid matchId,
        List<MatchOpponentSquadEntry> entries,
        CancellationToken ct)
    {
        // Remove existing
        var existing = await _db.MatchOpponentSquads
            .Where(m => m.MatchId == matchId)
            .ToListAsync(ct);
        _db.MatchOpponentSquads.RemoveRange(existing);

        // Add new
        foreach (var e in entries)
        {
            _db.MatchOpponentSquads.Add(new Domain.Entities.MatchOpponentSquad
            {
                MatchId = matchId,
                OpponentPlayerId = e.OpponentPlayerId,
                PlayerName = e.PlayerName.Trim(),
                BattingStyle = e.BattingStyle,
                BowlingStyle = e.BowlingStyle,
                BattingOrder = e.BattingOrder,
            });
        }

        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<MatchSummaryDataDto?> GetMatchSummaryDataAsync(
    Guid matchId, CancellationToken ct)
    {
        var match = await _db.Matches
            .Include(m => m.Innings)
                .ThenInclude(i => i.MoraBattingPerformances)
                    .ThenInclude(p => p.Player)
            .Include(m => m.Innings)
                .ThenInclude(i => i.OpponentBattingPerformances)
            .Include(m => m.Innings)
                .ThenInclude(i => i.MoraBowlingPerformances)
                    .ThenInclude(p => p.Player)
            .Include(m => m.Innings)
                .ThenInclude(i => i.OpponentBowlingPerformances)
            .FirstOrDefaultAsync(m => m.Id == matchId, ct);

        if (match is null) return null;

        var inningsDisplays = match.Innings
            .OrderBy(i => i.InningsNumber)
            .Select(i =>
            {
                var isMora = i.BattingTeam == Domain.Enums.BattingTeam.Mora;

                // Top 4 batters (by runs)
                List<TopBatterDto> topBatters;
                if (isMora)
                {
                    topBatters = i.MoraBattingPerformances
                        .Where(p => p.DismissalType != "DNB")
                        .OrderByDescending(p => p.Runs)
                        .Take(4)
                        .Select(p => new TopBatterDto(
                            p.Player.ShortName,
                            p.Runs, p.BallsFaced,
                            p.IsNotOut, p.Fours, p.Sixes))
                        .ToList();
                }
                else
                {
                    topBatters = i.OpponentBattingPerformances
                        .Where(p => p.DismissalType != "DNB")
                        .OrderByDescending(p => p.Runs)
                        .Take(4)
                        .Select(p => new TopBatterDto(
                            p.PlayerName,
                            p.Runs, p.BallsFaced,
                            p.IsNotOut, p.Fours, p.Sixes))
                        .ToList();
                }

                // Top 4 bowlers (by wickets then economy)
                List<TopBowlerDto> topBowlers;
                if (!isMora)
                {
                    topBowlers = i.MoraBowlingPerformances
                        .OrderByDescending(p => p.Wickets)
                        .ThenBy(p => p.OversBowled > 0
                            ? p.RunsConceded / p.OversBowled : 99)
                        .Take(4)
                        .Select(p => new TopBowlerDto(
                            p.Player.ShortName,
                            p.OversBowled,
                            p.RunsConceded,
                            p.Wickets))
                        .ToList();
                }
                else
                {
                    topBowlers = i.OpponentBowlingPerformances
                        .OrderByDescending(p => p.Wickets)
                        .ThenBy(p => p.OversBowled > 0
                            ? p.RunsConceded / p.OversBowled : 99)
                        .Take(4)
                        .Select(p => new TopBowlerDto(
                            p.PlayerName,
                            p.OversBowled,
                            p.RunsConceded,
                            p.Wickets))
                        .ToList();
                }

                return new InningsSummaryDisplay(
                    i.BattingTeam.ToString(),
                    i.TotalRuns,
                    i.TotalWickets,
                    i.TotalOversFaced,
                    topBatters,
                    topBowlers);
            })
            .ToList();

        return new MatchSummaryDataDto(matchId, inningsDisplays);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private static MatchSummaryDto ToSummary(Match m) => new(
        m.Id,
        m.MatchDate.ToString("yyyy-MM-dd"),
        m.Tournament.Name,
        m.Tournament.Format,
        m.Opponent.Name,
        m.Opponent.ShortName,
        m.Venue?.Name ?? "Unknown",
        m.VenueType.ToString(),
        m.SurfaceType.ToString(),
        m.BallColour.ToString(),
        m.RoundType.ToString(),
        m.RoundLabel,
        m.Status.ToString(),
        m.ResultType?.ToString(),
        m.ResultMargin,
        m.ResultMarginType,
        m.DlsApplied,
        m.MoraCaptain is null ? null : m.MoraCaptain.FullName,
        m.PlayerOfMatchName,
        m.PlayerOfMatchTeam,
        m.ScheduledOvers,
        m.IsConfirmed
    );

    private static InningsSummaryDto ToInningsSummary(Innings i) => new(
        i.Id,
        i.InningsNumber,
        i.InningsType.ToString(),
        i.BattingTeam.ToString(),
        i.TotalRuns,
        i.TotalWickets,
        i.TotalOversFaced,
        i.ExtrasWides,
        i.ExtrasNoBalls,
        i.ExtrasLegByes,
        i.ExtrasByes,
        i.HasDeliveryData,
        i.CommentaryCoverage.ToString()
    );
}
