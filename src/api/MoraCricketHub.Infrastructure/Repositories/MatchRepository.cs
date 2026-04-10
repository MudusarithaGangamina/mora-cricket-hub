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
        m.ScheduledOvers
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
