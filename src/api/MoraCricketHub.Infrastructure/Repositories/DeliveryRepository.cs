using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Deliveries.Interfaces;
using MoraCricketHub.Application.Deliveries.Queries;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Repositories;

public class DeliveryRepository : IDeliveryRepository
{
    private readonly AppDbContext _db;
    public DeliveryRepository(AppDbContext db) => _db = db;

    // ── Queries ───────────────────────────────────────────────────────────────

    public async Task<List<DeliveryDto>> GetInningsDeliveriesAsync(
        Guid inningsId, CancellationToken ct)
    {
        var deliveries = await _db.Deliveries
            .Include(d => d.MoraBatter)
            .Include(d => d.MoraBowler)
            .Include(d => d.MoraFielder)
            .Include(d => d.DismissedMoraBatter)
            .Where(d => d.InningsId == inningsId)
            .OrderBy(d => d.OverNumber)
            .ThenBy(d => d.DeliverySequence)
            .ToListAsync(ct);

        return deliveries.Select(MapToDto).ToList();
    }

    public async Task<List<DeliveryDto>> GetOverDeliveriesAsync(
        Guid inningsId, int overNumber, CancellationToken ct)
    {
        var deliveries = await _db.Deliveries
            .Include(d => d.MoraBatter)
            .Include(d => d.MoraBowler)
            .Include(d => d.MoraFielder)
            .Where(d => d.InningsId == inningsId
                     && d.OverNumber == overNumber)
            .OrderBy(d => d.DeliverySequence)
            .ToListAsync(ct);

        return deliveries.Select(MapToDto).ToList();
    }

    public async Task<List<OverSummaryDto>> GetOverSummariesAsync(
        Guid inningsId, CancellationToken ct)
        => await _db.OverSummaries
            .Where(os => os.InningsId == inningsId)
            .OrderBy(os => os.OverNumber)
            .Select(os => new OverSummaryDto(
                os.OverNumber,
                os.RunsInOver,
                os.WicketsInOver,
                os.DotsInOver,
                os.FoursInOver,
                os.SixesInOver,
                os.WidesInOver,
                os.NoBallsInOver,
                os.CumulativeRuns,
                os.CumulativeWickets))
            .ToListAsync(ct);

    public Task<Delivery?> FindByIdAsync(Guid id, CancellationToken ct)
        => _db.Deliveries.FirstOrDefaultAsync(d => d.Id == id, ct);

    // ── Commands ──────────────────────────────────────────────────────────────

    public async Task<Guid> AddDeliveryAsync(
        Delivery delivery, CancellationToken ct)
    {
        _db.Deliveries.Add(delivery);
        await _db.SaveChangesAsync(ct);
        return delivery.Id;
    }

    public async Task<bool> UpdateDeliveryAsync(
        Delivery delivery, CancellationToken ct)
    {
        _db.Deliveries.Update(delivery);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteDeliveryAsync(Guid id, CancellationToken ct)
    {
        var delivery = await _db.Deliveries
            .FirstOrDefaultAsync(d => d.Id == id, ct);
        if (delivery is null) return false;

        _db.Deliveries.Remove(delivery);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Over summary recomputation ────────────────────────────────────────────
    // Called automatically after every AddDelivery, UpdateDelivery, DeleteDelivery
    // Keeps the worm chart data always current without a separate background job

    public async Task RecomputeOverSummaryAsync(
        Guid inningsId, int overNumber, CancellationToken ct)
    {
        // Load all deliveries in this over
        var balls = await _db.Deliveries
            .Where(d => d.InningsId == inningsId
                     && d.OverNumber == overNumber)
            .ToListAsync(ct);

        // Compute this over's stats
        var runsInOver = balls.Sum(b => b.TotalRuns);
        var wicketsInOver = balls.Count(b => b.IsWicket);
        var dots = balls.Count(b => b.RunsOffBat == 0
                                          && b.ExtrasType == null);
        var fours = balls.Count(b => b.RunsOffBat == 4);
        var sixes = balls.Count(b => b.RunsOffBat == 6);
        var wides = balls.Count(b => b.ExtrasType ==
                                Domain.Enums.ExtrasType.Wide);
        var noBalls = balls.Count(b => b.ExtrasType ==
                                Domain.Enums.ExtrasType.NoBall);

        // Compute cumulative totals up to and including this over
        // by summing all previous overs' runs and wickets
        var previousOvers = await _db.OverSummaries
            .Where(os => os.InningsId == inningsId
                      && os.OverNumber < overNumber)
            .ToListAsync(ct);

        var cumRunsBefore = previousOvers.Sum(os => os.RunsInOver);
        var cumWicketsBefore = previousOvers.Sum(os => os.WicketsInOver);

        // Upsert — update if exists, insert if new
        var existing = await _db.OverSummaries
            .FirstOrDefaultAsync(os => os.InningsId == inningsId
                                    && os.OverNumber == overNumber, ct);

        if (existing is not null)
        {
            existing.RunsInOver = runsInOver;
            existing.WicketsInOver = wicketsInOver;
            existing.DotsInOver = dots;
            existing.FoursInOver = fours;
            existing.SixesInOver = sixes;
            existing.WidesInOver = wides;
            existing.NoBallsInOver = noBalls;
            existing.CumulativeRuns = cumRunsBefore + runsInOver;
            existing.CumulativeWickets = cumWicketsBefore + wicketsInOver;
            _db.OverSummaries.Update(existing);
        }
        else
        {
            _db.OverSummaries.Add(new OverSummary
            {
                InningsId = inningsId,
                OverNumber = overNumber,
                RunsInOver = runsInOver,
                WicketsInOver = wicketsInOver,
                DotsInOver = dots,
                FoursInOver = fours,
                SixesInOver = sixes,
                WidesInOver = wides,
                NoBallsInOver = noBalls,
                CumulativeRuns = cumRunsBefore + runsInOver,
                CumulativeWickets = cumWicketsBefore + wicketsInOver,
            });
        }

        // Also update all SUBSEQUENT over summaries' cumulative totals
        // because adding/removing a ball in over 5 affects overs 6, 7, 8...
        var subsequentOvers = await _db.OverSummaries
            .Where(os => os.InningsId == inningsId
                      && os.OverNumber > overNumber)
            .OrderBy(os => os.OverNumber)
            .ToListAsync(ct);

        var runningRuns = cumRunsBefore + runsInOver;
        var runningWickets = cumWicketsBefore + wicketsInOver;

        foreach (var over in subsequentOvers)
        {
            runningRuns += over.RunsInOver;
            runningWickets += over.WicketsInOver;
            over.CumulativeRuns = runningRuns;
            over.CumulativeWickets = runningWickets;
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task MarkInningsHasDeliveryDataAsync(
        Guid inningsId, CancellationToken ct)
    {
        var innings = await _db.Innings
            .FirstOrDefaultAsync(i => i.Id == inningsId, ct);
        if (innings is null) return;

        innings.HasDeliveryData = true;
        await _db.SaveChangesAsync(ct);
    }

    // ── Mapping helper ────────────────────────────────────────────────────────

    private static DeliveryDto MapToDto(Delivery d) => new(
        d.Id,
        d.OverNumber,
        d.BallNumber,
        d.DeliverySequence,
        d.MoraBatterId,
        d.MoraBatter?.FullName,
        d.OppBatterName,
        d.OppBatterStyle,
        d.MoraBowlerId,
        d.MoraBowler?.FullName,
        d.OppBowlerName,
        d.OppBowlerStyle,
        d.RunsOffBat,
        d.ExtrasType?.ToString(),
        d.ExtrasRuns,
        d.TotalRuns,
        d.IsWicket,
        d.WicketType?.ToString(),
        d.DismissedMoraBatter?.FullName ?? d.DismissedBatterName,
        d.MoraFielder?.FullName,
        d.OppFielderName,
        d.BowlingSide?.ToString(),
        d.ShotType?.ToString(),
        d.DirectionZone?.ToString()
    );
}
