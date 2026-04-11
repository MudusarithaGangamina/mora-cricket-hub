using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Dashboard.Interfaces;
using MoraCricketHub.Application.Dashboard.Queries;
using MoraCricketHub.Domain.Enums;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly AppDbContext _db;
    public DashboardRepository(AppDbContext db) => _db = db;

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct)
    {
        // All completed matches excluding pre-toss abandonments
        var matches = await _db.Matches
            .Include(m => m.Opponent)
            .Where(m => m.Status != MatchStatus.PreTossAbandoned)
            .ToListAsync(ct);

        var completed = matches
            .Where(m => m.Status == MatchStatus.Completed).ToList();

        var wins = completed.Count(m => m.ResultType == ResultType.Win);
        var losses = completed.Count(m => m.ResultType == ResultType.Loss);
        var noResult = matches.Count(m =>
            m.Status is MatchStatus.Abandoned
                     or MatchStatus.Drawn
                     or MatchStatus.NoResult);

        var winPct = completed.Count > 0
            ? Math.Round((decimal)wins / completed.Count * 100, 1)
            : 0;

        // Top scorer
        var topScorer = await _db.MoraBattingPerformances
            .Include(p => p.Player)
            .Include(p => p.Innings).ThenInclude(i => i.Match)
            .Where(p => p.Innings.Match.Status != MatchStatus.PreTossAbandoned)
            .GroupBy(p => new { p.PlayerId, p.Player.FullName })
            .Select(g => new
            {
                g.Key.FullName,
                TotalRuns = g.Sum(p => p.Runs)
            })
            .OrderByDescending(x => x.TotalRuns)
            .FirstOrDefaultAsync(ct);

        // Top wicket taker
        var topBowler = await _db.MoraBowlingPerformances
            .Include(p => p.Player)
            .Include(p => p.Innings).ThenInclude(i => i.Match)
            .Where(p => p.Innings.Match.Status != MatchStatus.PreTossAbandoned)
            .GroupBy(p => new { p.PlayerId, p.Player.FullName })
            .Select(g => new
            {
                g.Key.FullName,
                TotalWickets = g.Sum(p => p.Wickets)
            })
            .OrderByDescending(x => x.TotalWickets)
            .FirstOrDefaultAsync(ct);

        // Total runs scored by Mora
        var totalRuns = await _db.Innings
            .Include(i => i.Match)
            .Where(i => i.BattingTeam == BattingTeam.Mora
                     && i.Match.Status != MatchStatus.PreTossAbandoned)
            .SumAsync(i => i.TotalRuns, ct);

        // Total wickets taken by Mora
        var totalWickets = await _db.MoraBowlingPerformances
            .Include(p => p.Innings).ThenInclude(i => i.Match)
            .Where(p => p.Innings.Match.Status != MatchStatus.PreTossAbandoned)
            .SumAsync(p => p.Wickets, ct);

        // Recent 5 matches
        var recent = matches
            .Where(m => m.Status == MatchStatus.Completed)
            .OrderByDescending(m => m.MatchDate)
            .Take(5)
            .Select(m => new RecentMatchDto(
                m.Id,
                m.MatchDate.ToString("yyyy-MM-dd"),
                m.Opponent.Name,
                m.ResultType?.ToString() ?? "NR",
                m.ResultMargin,
                m.ResultMarginType,
                m.VenueType.ToString()))
            .ToList();

        return new DashboardSummaryDto(
            TotalMatches: matches.Count,
            Wins: wins,
            Losses: losses,
            NoResults: noResult,
            WinPercentage: winPct,
            TotalPlayers: await _db.Players.CountAsync(ct),
            TotalRuns: totalRuns,
            TotalWickets: totalWickets,
            TopScorerName: topScorer?.FullName ?? "—",
            TopScorerRuns: topScorer?.TotalRuns ?? 0,
            TopWicketTakerName: topBowler?.FullName ?? "—",
            TopWicketTakerWickets: topBowler?.TotalWickets ?? 0,
            RecentMatches: recent
        );
    }
}
