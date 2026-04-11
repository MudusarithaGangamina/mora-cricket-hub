using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Players.Interfaces;
using MoraCricketHub.Application.Players.Queries;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Repositories;

public class PlayerRepository : IPlayerRepository
{
    private readonly AppDbContext _db;
    public PlayerRepository(AppDbContext db) => _db = db;

    public async Task<List<PlayerSummaryDto>> GetAllAsync(
        bool activeOnly,
        CancellationToken cancellationToken)
    {
        var query = _db.Players.AsQueryable();

        if (activeOnly)
            query = query.Where(p => p.IsActive);

        return await query
            .OrderBy(p => p.BatchYear)
            .ThenBy(p => p.FullName)
            .Select(p => new PlayerSummaryDto(
                p.Id,
                p.FullName,
                p.ShortName,
                p.Nickname,
                p.PhotoUrl,
                p.Faculty,
                p.Degree,
                p.BatchYear,
                p.BattingStyle.ToString(),
                p.PrimaryBowlingStyle.HasValue
                    ? p.PrimaryBowlingStyle.Value.ToString()
                    : null,
                p.DebutDate.HasValue
                    ? p.DebutDate.Value.ToString("yyyy-MM-dd")
                    : null,
                p.IsActive
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<PlayerDetailDto?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var player = await _db.Players
            .Include(p => p.Seasons)
                .ThenInclude(ps => ps.Season)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (player is null) return null;

        return new PlayerDetailDto(
            player.Id,
            player.FullName,
            player.ShortName,
            player.Nickname,
            player.PhotoUrl,
            player.Faculty,
            player.Degree,
            player.BatchYear,
            player.BattingStyle.ToString(),
            player.PrimaryBowlingStyle?.ToString(),
            player.DebutDate?.ToString("yyyy-MM-dd"),
            player.IsActive,
            player.Seasons.Select(ps => new PlayerSeasonDto(
                ps.SeasonId,
                ps.Season.Name,
                ps.JerseyNumber,
                ps.BattingRole?.ToString()
            )).ToList()
        );
    }

    public async Task<Player?> FindByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
        => await _db.Players
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<Guid> CreateAsync(
        Player player,
        CancellationToken cancellationToken)
    {
        _db.Players.Add(player);
        await _db.SaveChangesAsync(cancellationToken);
        return player.Id;
    }

    public async Task<bool> UpdateAsync(
        Player player,
        CancellationToken cancellationToken)
    {
        _db.Players.Update(player);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<CareerStatsDto?> GetCareerStatsAsync(
    Guid playerId, CancellationToken ct)
    {
        var player = await _db.Players
            .FirstOrDefaultAsync(p => p.Id == playerId, ct);

        if (player is null) return null;

        // Exclude PRE_TOSS_ABANDONED matches always
        var battingPerfs = await _db.MoraBattingPerformances
            .Include(p => p.Innings)
                .ThenInclude(i => i.Match)
            .Where(p => p.PlayerId == playerId
                     && p.Innings.Match.Status != Domain.Enums.MatchStatus.PreTossAbandoned
                     && p.DismissalType != "DNB")
            .ToListAsync(ct);

        var bowlingPerfs = await _db.MoraBowlingPerformances
            .Include(p => p.Innings)
                .ThenInclude(i => i.Match)
            .Where(p => p.PlayerId == playerId
                     && p.Innings.Match.Status != Domain.Enums.MatchStatus.PreTossAbandoned)
            .ToListAsync(ct);

        var fieldingPerfs = await _db.MoraFieldingPerformances
            .Include(p => p.Innings)
                .ThenInclude(i => i.Match)
            .Where(p => p.PlayerId == playerId
                     && p.Innings.Match.Status != Domain.Enums.MatchStatus.PreTossAbandoned)
            .ToListAsync(ct);

        // Batting stats
        var battingMatches = battingPerfs
            .Select(p => p.Innings.MatchId).Distinct().Count();
        var innings = battingPerfs.Count;
        var notOuts = battingPerfs.Count(p => p.IsNotOut);
        var dismissed = innings - notOuts;
        var totalRuns = battingPerfs.Sum(p => p.Runs);
        var totalBalls = battingPerfs.Sum(p => p.BallsFaced);
        var highScorePerf = battingPerfs.MaxBy(p => p.Runs);

        var batting = new BattingCareerDto(
            Matches: battingMatches,
            Innings: innings,
            NotOuts: notOuts,
            Runs: totalRuns,
            HighScore: highScorePerf?.Runs ?? 0,
            HighScoreNotOut: highScorePerf?.IsNotOut ?? false,
            Average: dismissed > 0
                               ? Math.Round((decimal)totalRuns / dismissed, 2)
                               : null,
            StrikeRate: totalBalls > 0
                               ? Math.Round((decimal)totalRuns / totalBalls * 100, 2)
                               : 0,
            Hundreds: battingPerfs.Count(p => p.IsHundred),
            Fifties: battingPerfs.Count(p => p.IsFifty),
            Thirties: battingPerfs.Count(p => p.IsThirty),
            Ducks: battingPerfs.Count(p => p.IsDuck),
            Fours: battingPerfs.Sum(p => p.Fours),
            Sixes: battingPerfs.Sum(p => p.Sixes)
        );

        // Bowling stats
        var bowlingMatches = bowlingPerfs
            .Select(p => p.Innings.MatchId).Distinct().Count();
        var totalOvers = bowlingPerfs.Sum(p => p.OversBowled);
        var totalBallsBowled = bowlingPerfs.Sum(p =>
            (int)Math.Floor(p.OversBowled) * 6 +
            (int)Math.Round((p.OversBowled - Math.Floor(p.OversBowled)) * 10));
        var totalRunsConceded = bowlingPerfs.Sum(p => p.RunsConceded);
        var totalWickets = bowlingPerfs.Sum(p => p.Wickets);

        var bowling = new BowlingCareerDto(
            Matches: bowlingMatches,
            Innings: bowlingPerfs.Count,
            OversBowled: totalOvers,
            Maidens: bowlingPerfs.Sum(p => p.Maidens),
            RunsConceded: totalRunsConceded,
            Wickets: totalWickets,
            Average: totalWickets > 0
                               ? Math.Round((decimal)totalRunsConceded / totalWickets, 2)
                               : null,
            Economy: totalOvers > 0
                               ? Math.Round((decimal)totalRunsConceded / (decimal)totalOvers, 2)
                               : 0,
            StrikeRate: totalWickets > 0
                               ? Math.Round((decimal)totalBallsBowled / totalWickets, 2)
                               : null,
            FourWicketHauls: bowlingPerfs.Count(p => p.IsFourWicketHaul),
            FiveWicketHauls: bowlingPerfs.Count(p => p.IsFiveWicketHaul)
        );

        // Fielding stats
        var fieldingMatches = fieldingPerfs
            .Select(p => p.Innings.MatchId).Distinct().Count();

        var fielding = new FieldingCareerDto(
            Matches: fieldingMatches,
            Catches: fieldingPerfs.Sum(p => p.Catches),
            RunOuts: fieldingPerfs.Sum(p => p.RunOuts),
            Stumpings: fieldingPerfs.Sum(p => p.Stumpings)
        );

        return new CareerStatsDto(
            player.Id,
            player.FullName,
            player.ShortName,
            player.Nickname,
            player.PhotoUrl,
            player.Faculty,
            player.Degree,
            player.BatchYear,
            player.BattingStyle.ToString(),
            player.PrimaryBowlingStyle?.ToString(),
            player.DebutDate?.ToString("yyyy-MM-dd"),
            player.IsActive,
            batting,
            bowling,
            fielding
        );
    }
}
