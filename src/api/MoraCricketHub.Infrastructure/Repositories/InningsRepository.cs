using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Innings.Interfaces;
using MoraCricketHub.Application.Innings.Queries;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Repositories;

public class InningsRepository : IInningsRepository
{
    private readonly AppDbContext _db;
    public InningsRepository(AppDbContext db) => _db = db;

    // ── Queries ───────────────────────────────────────────────────────────────

    public async Task<InningsScorecardDto?> GetScorecardAsync(
        Guid inningsId, CancellationToken ct)
    {
        var innings = await LoadInningsWithAll(inningsId, ct);
        return innings is null ? null : MapToDto(innings);
    }

    public async Task<List<InningsScorecardDto>> GetMatchScorecardsAsync(
        Guid matchId, CancellationToken ct)
    {
        var ids = await _db.Innings
            .Where(i => i.MatchId == matchId)
            .OrderBy(i => i.InningsNumber)
            .Select(i => i.Id)
            .ToListAsync(ct);

        var result = new List<InningsScorecardDto>();
        foreach (var id in ids)
        {
            var innings = await LoadInningsWithAll(id, ct);
            if (innings is not null) result.Add(MapToDto(innings));
        }
        return result;
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public Task<Innings?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.Innings.FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task<Guid> CreateInningsAsync(
        Innings innings, CancellationToken ct)
    {
        _db.Innings.Add(innings);
        await _db.SaveChangesAsync(ct);
        return innings.Id;
    }

    public async Task<bool> UpdateInningsAsync(
        Innings innings, CancellationToken ct)
    {
        _db.Innings.Update(innings);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Mora batting ──────────────────────────────────────────────────────────

    public Task<MoraBattingPerformance?> FindMoraBattingAsync(
        Guid id, CancellationToken ct)
        => _db.MoraBattingPerformances
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Guid> AddMoraBattingAsync(
        MoraBattingPerformance perf, CancellationToken ct)
    {
        _db.MoraBattingPerformances.Add(perf);
        await _db.SaveChangesAsync(ct);
        return perf.Id;
    }

    public async Task<bool> UpdateMoraBattingAsync(
        MoraBattingPerformance perf, CancellationToken ct)
    {
        _db.MoraBattingPerformances.Update(perf);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Opponent batting ──────────────────────────────────────────────────────

    public Task<OpponentBattingPerformance?> FindOpponentBattingAsync(
        Guid id, CancellationToken ct)
        => _db.OpponentBattingPerformances
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Guid> AddOpponentBattingAsync(
        OpponentBattingPerformance perf, CancellationToken ct)
    {
        _db.OpponentBattingPerformances.Add(perf);
        await _db.SaveChangesAsync(ct);
        return perf.Id;
    }

    public async Task<bool> UpdateOpponentBattingAsync(
        OpponentBattingPerformance perf, CancellationToken ct)
    {
        _db.OpponentBattingPerformances.Update(perf);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Mora bowling ──────────────────────────────────────────────────────────

    public Task<MoraBowlingPerformance?> FindMoraBowlingAsync(
        Guid id, CancellationToken ct)
        => _db.MoraBowlingPerformances
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Guid> AddMoraBowlingAsync(
        MoraBowlingPerformance perf, CancellationToken ct)
    {
        _db.MoraBowlingPerformances.Add(perf);
        await _db.SaveChangesAsync(ct);
        return perf.Id;
    }

    public async Task<bool> UpdateMoraBowlingAsync(
        MoraBowlingPerformance perf, CancellationToken ct)
    {
        _db.MoraBowlingPerformances.Update(perf);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Opponent bowling ──────────────────────────────────────────────────────

    public Task<OpponentBowlingPerformance?> FindOpponentBowlingAsync(
        Guid id, CancellationToken ct)
        => _db.OpponentBowlingPerformances
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Guid> AddOpponentBowlingAsync(
        OpponentBowlingPerformance perf, CancellationToken ct)
    {
        _db.OpponentBowlingPerformances.Add(perf);
        await _db.SaveChangesAsync(ct);
        return perf.Id;
    }

    public async Task<bool> UpdateOpponentBowlingAsync(
        OpponentBowlingPerformance perf, CancellationToken ct)
    {
        _db.OpponentBowlingPerformances.Update(perf);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Fall of wickets ───────────────────────────────────────────────────────

    public async Task<Guid> AddFallOfWicketAsync(
        FallOfWicket fow, CancellationToken ct)
    {
        _db.FallOfWickets.Add(fow);
        await _db.SaveChangesAsync(ct);
        return fow.Id;
    }

    // ── Partnerships ──────────────────────────────────────────────────────────

    public async Task<Guid> AddPartnershipAsync(
        Partnership partnership, CancellationToken ct)
    {
        _db.Partnerships.Add(partnership);
        await _db.SaveChangesAsync(ct);
        return partnership.Id;
    }

    // ── Fielding ──────────────────────────────────────────────────────────────

    public Task<MoraFieldingPerformance?> FindMoraFieldingAsync(
        Guid id, CancellationToken ct)
        => _db.MoraFieldingPerformances
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Guid> AddMoraFieldingAsync(
        MoraFieldingPerformance perf, CancellationToken ct)
    {
        _db.MoraFieldingPerformances.Add(perf);
        await _db.SaveChangesAsync(ct);
        return perf.Id;
    }

    public async Task<bool> UpdateMoraFieldingAsync(
        MoraFieldingPerformance perf, CancellationToken ct)
    {
        _db.MoraFieldingPerformances.Update(perf);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async Task<Innings?> LoadInningsWithAll(
        Guid inningsId, CancellationToken ct)
        => await _db.Innings
            .Include(i => i.MoraWickekeeper)
            .Include(i => i.MoraBattingPerformances)
                .ThenInclude(p => p.Player)
            .Include(i => i.MoraBattingPerformances)
                .ThenInclude(p => p.DismissedByOppBowler)
            .Include(i => i.MoraBattingPerformances)
                .ThenInclude(p => p.FieldedByMoraPlayer)
            .Include(i => i.OpponentBattingPerformances)
                .ThenInclude(p => p.DismissedByMoraBowler)
            .Include(i => i.OpponentBattingPerformances)
                .ThenInclude(p => p.FieldedByMoraPlayer)
            .Include(i => i.MoraBowlingPerformances)
                .ThenInclude(p => p.Player)
            .Include(i => i.OpponentBowlingPerformances)
            .Include(i => i.FallOfWickets)
                .ThenInclude(f => f.DismissedMoraPlayer)
            .Include(i => i.Partnerships)
                .ThenInclude(p => p.MoraBatter1)
            .Include(i => i.Partnerships)
                .ThenInclude(p => p.MoraBatter2)
            .FirstOrDefaultAsync(i => i.Id == inningsId, ct);

    private static InningsScorecardDto MapToDto(Innings i) => new(
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
        i.ExtrasPenalty,
        i.HasDeliveryData,
        i.CommentaryCoverage.ToString(),
        i.MoraWickeeperId?.ToString(),
        i.MoraWickekeeper?.FullName,

        i.MoraBattingPerformances
            .OrderBy(p => p.BattingPosition)
            .Select(p => new MoraBattingLineDto(
                p.Id, p.PlayerId,
                p.Player.FullName,
                p.Player.ShortName,
                p.BattingPosition,
                p.Runs, p.BallsFaced, p.Fours, p.Sixes,
                p.IsNotOut, p.MinutesBatted,
                p.DismissalType,
                p.DismissedByOppBowlerName,
                p.DismissedByOppBowlerStyle,
                p.FieldedByOppName,
                p.IsThirty, p.IsFifty, p.IsHundred, p.IsDuck))
            .ToList(),

        i.OpponentBattingPerformances
            .OrderBy(p => p.BattingPosition)
            .Select(p => new OpponentBattingLineDto(
                p.Id, p.PlayerName, p.BattingStyle,
                p.BattingPosition,
                p.Runs, p.BallsFaced, p.Fours, p.Sixes,
                p.IsNotOut, p.MinutesBatted,
                p.DismissalType,
                p.DismissedByMoraBowler?.FullName,
                p.FieldedByMoraPlayer?.FullName))
            .ToList(),

        i.MoraBowlingPerformances
            .OrderBy(p => p.Player.FullName)
            .Select(p => new MoraBowlingLineDto(
                p.Id, p.PlayerId, p.Player.FullName,
                p.OversBowled, p.Maidens, p.RunsConceded,
                p.Wickets, p.Wides, p.NoBalls,
                p.IsFourWicketHaul, p.IsFiveWicketHaul))
            .ToList(),

        i.OpponentBowlingPerformances
            .OrderBy(p => p.PlayerName)
            .Select(p => new OpponentBowlingLineDto(
                p.Id, p.PlayerName, p.BowlingStyle,
                p.OversBowled, p.Maidens, p.RunsConceded,
                p.Wickets, p.Wides, p.NoBalls))
            .ToList(),

        i.FallOfWickets
            .OrderBy(f => f.WicketNumber)
            .Select(f => new FallOfWicketDto(
                f.Id, f.WicketNumber,
                f.ScoreAtFall, f.OverAtFall,
                f.DismissedPlayerName))
            .ToList(),

        i.Partnerships
            .OrderBy(p => p.WicketNumber)
            .Select(p => new PartnershipDto(
                p.Id, p.WicketNumber,
                p.MoraBatter1?.FullName,
                p.MoraBatter2?.FullName,
                p.OppBatter1Name,
                p.OppBatter2Name,
                p.Runs, p.Balls,
                p.Batter1Runs, p.Batter2Runs,
                p.Unbroken))
            .ToList()
    );
}
