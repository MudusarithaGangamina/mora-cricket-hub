using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MoraCricketHub.Application.Innings.Interfaces;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Domain.Enums;
using MoraCricketHub.Infrastructure.Persistence;

namespace MoraCricketHub.Infrastructure.Services;

public class AutoEventService : IAutoEventService
{
    private readonly AppDbContext _db;

    public AutoEventService(AppDbContext db) => _db = db;

    // ── Entry point — called after every delivery save ─────────────────────
    public async Task ProcessDeliveryAsync(
        Delivery delivery,
        Innings innings,
        CancellationToken ct)
    {
        // Load all deliveries for this innings (including the one just saved)
        var allDeliveries = await _db.Deliveries
            .Where(d => d.InningsId == innings.Id)
            .OrderBy(d => d.DeliverySequence)
            .ToListAsync(ct);

        // 1. Handle wicket events
        if (delivery.IsWicket && delivery.WicketType != WicketType.RetiredHurt)
        {
            await CreateFallOfWicketAsync(delivery, innings, allDeliveries, ct);
        }

        // 2. Update partnerships
        await UpdatePartnershipAsync(delivery, innings, allDeliveries, ct);

        // 3. Check for player milestones
        await CheckPlayerMilestonesAsync(delivery, innings, ct);

        // 4. Check for team milestones (50, 100, 150...)
        await CheckTeamMilestonesAsync(delivery, innings, ct);

        // 5. Check if innings should auto-end
        await CheckInningsEndAsync(delivery, innings, allDeliveries, ct);
    }

    // ── Fall of Wickets ────────────────────────────────────────────────────
    private async Task CreateFallOfWicketAsync(
        Delivery delivery,
        Innings innings,
        List<Delivery> allDeliveries,
        CancellationToken ct)
    {
        // Count legal wickets so far (excluding retired-hurt)
        var wicketNumber = allDeliveries
            .Where(d => d.IsWicket &&
                        d.WicketType != WicketType.RetiredHurt)
            .Count();

        // Calculate score at fall
        var scoreAtFall = allDeliveries.Sum(d => d.TotalRuns);

        // Over at fall
        var overAtFall = delivery.OverNumber - 1 +
                         (decimal)delivery.BallNumber / 10;

        // Determine dismissed player name
        string dismissedName = string.Empty;
        if (delivery.DismissedMoraBatterId.HasValue)
        {
            var player = await _db.Players
                .FindAsync([delivery.DismissedMoraBatterId.Value], ct);
            dismissedName = player?.FullName ?? string.Empty;
        }
        else
        {
            dismissedName = delivery.DismissedBatterName ?? string.Empty;
        }

        // Check not already created for this wicket number
        var existing = await _db.FallOfWickets
            .AnyAsync(f => f.InningsId == innings.Id &&
                           f.WicketNumber == wicketNumber, ct);
        if (existing) return;

        var fow = new FallOfWicket
        {
            InningsId = innings.Id,
            WicketNumber = wicketNumber,
            ScoreAtFall = scoreAtFall,
            OverAtFall = overAtFall,
            DismissedMoraPlayerId = delivery.DismissedMoraBatterId,
            DismissedOppPlayerId = delivery.DismissedOppBatterId,
            DismissedPlayerName = dismissedName,
        };

        _db.FallOfWickets.Add(fow);
        await _db.SaveChangesAsync(ct);

        // Add innings event
        await AddInningsEventAsync(innings.Id,
            "WICKET", overAtFall, scoreAtFall,
            wicketNumber, null,
            $"{wicketNumber}/{scoreAtFall} — {dismissedName} dismissed at {overAtFall}",
            ct);
    }

    // ── Partnerships ───────────────────────────────────────────────────────
    private async Task UpdatePartnershipAsync(
        Delivery delivery,
        Innings innings,
        List<Delivery> allDeliveries,
        CancellationToken ct)
    {
        var isMoraBatting = innings.BattingTeam == BattingTeam.Mora;

        // Find current active partnership for this innings
        var activePartnership = await _db.Partnerships
            .Where(p => p.InningsId == innings.Id && p.IsActive)
            .FirstOrDefaultAsync(ct);

        decimal currentOver = delivery.OverNumber - 1 +
                              (decimal)delivery.BallNumber / 10;

        // ── Case 1: Wicket (permanent dismissal) ─────────────────────────
        if (delivery.IsWicket && delivery.WicketType != WicketType.RetiredHurt)
        {
            if (activePartnership is not null)
            {
                // Close current partnership
                var (r1, r2) = CalculatePartnershipRuns(
                    activePartnership, allDeliveries, isMoraBatting, ct);

                activePartnership.IsActive = false;
                activePartnership.EndedAtOver = currentOver;
                activePartnership.Unbroken = false;

                // Update individual batter runs within partnership
                activePartnership.Batter1Runs = r1;
                activePartnership.Batter2Runs = r2;

                // Total runs from when this partnership started
                var partnershipDeliveries = allDeliveries
                    .Where(d => d.DeliverySequence >=
                                GetSequenceAtOver(allDeliveries,
                                    activePartnership.StartedAtOver))
                    .ToList();
                activePartnership.Runs = partnershipDeliveries.Sum(d => d.TotalRuns);
                activePartnership.Balls = partnershipDeliveries
                    .Count(d => d.ExtrasType != ExtrasType.Wide);

                await _db.SaveChangesAsync(ct);
            }

            // Start new partnership (if not 10th wicket)
            var wicketCount = allDeliveries
                .Count(d => d.IsWicket && d.WicketType != WicketType.RetiredHurt);

            if (wicketCount < 10)
            {
                await StartNewPartnershipAsync(
                    innings, delivery, allDeliveries,
                    currentOver, isMoraBatting, ct);
            }
            return;
        }

        // ── Case 2: Retired Hurt ──────────────────────────────────────────
        if (delivery.IsWicket && delivery.WicketType == WicketType.RetiredHurt)
        {
            if (activePartnership is not null)
            {
                // Close as "not out" partnership
                activePartnership.IsActive = false;
                activePartnership.EndedAtOver = currentOver;
                activePartnership.Unbroken = true;  // not broken by wicket
                await _db.SaveChangesAsync(ct);
            }

            // New partnership starts (retired-hurt batter replaced)
            await StartNewPartnershipAsync(
                innings, delivery, allDeliveries,
                currentOver, isMoraBatting, ct);
            return;
        }

        // ── Case 3: No wicket — create opening partnership if none exists ─
        if (activePartnership is null && allDeliveries.Count == 1)
        {
            // First ball of innings
            await StartNewPartnershipAsync(
                innings, delivery, allDeliveries,
                0.0m, isMoraBatting, ct);
        }
    }

    private async Task StartNewPartnershipAsync(
        Innings innings,
        Delivery delivery,
        List<Delivery> allDeliveries,
        decimal startedAtOver,
        bool isMoraBatting,
        CancellationToken ct)
    {
        var wicketNumber = allDeliveries
            .Count(d => d.IsWicket && d.WicketType != WicketType.RetiredHurt);

        // Determine who the current batters are from recent deliveries
        string? batter1Id = null, batter2Id = null;
        string? batter1Name = null, batter2Name = null;
        Guid? opp1Id = null, opp2Id = null;

        if (isMoraBatting)
        {
            // Find the two distinct Mora batters in most recent deliveries
            var recentBatters = allDeliveries
                .Where(d => d.MoraBatterId.HasValue)
                .OrderByDescending(d => d.DeliverySequence)
                .Select(d => d.MoraBatterId!.Value.ToString())
                .Distinct()
                .Take(2)
                .ToList();

            batter1Id = recentBatters.ElementAtOrDefault(0);
            batter2Id = recentBatters.ElementAtOrDefault(1);
        }
        else
        {
            var recentBatters = allDeliveries
                .Where(d => !string.IsNullOrEmpty(d.OppBatterName))
                .OrderByDescending(d => d.DeliverySequence)
                .Select(d => d.OppBatterName!)
                .Distinct()
                .Take(2)
                .ToList();

            batter1Name = recentBatters.ElementAtOrDefault(0);
            batter2Name = recentBatters.ElementAtOrDefault(1);
        }

        var partnership = new Partnership
        {
            InningsId = innings.Id,
            WicketNumber = wicketNumber + 1,
            IsActive = true,
            StartedAtOver = startedAtOver,
            Unbroken = true,
            Runs = 0,
            Balls = 0,
            Batter1Runs = 0,
            Batter2Runs = 0,
        };

        if (isMoraBatting)
        {
            if (Guid.TryParse(batter1Id, out var b1))
                partnership.MoraBatter1Id = b1;
            if (Guid.TryParse(batter2Id, out var b2))
                partnership.MoraBatter2Id = b2;
        }
        else
        {
            partnership.OppBatter1Name = batter1Name;
            partnership.OppBatter2Name = batter2Name;
        }

        _db.Partnerships.Add(partnership);
        await _db.SaveChangesAsync(ct);
    }

    private (int batter1Runs, int batter2Runs) CalculatePartnershipRuns(
        Partnership partnership,
        List<Delivery> allDeliveries,
        bool isMoraBatting,
        CancellationToken ct)
    {
        // Deliveries since partnership started
        var partnershipDeliveries = allDeliveries
            .Where(d => d.DeliverySequence >=
                        GetSequenceAtOver(allDeliveries, partnership.StartedAtOver))
            .ToList();

        if (isMoraBatting)
        {
            var r1 = partnershipDeliveries
                .Where(d => d.MoraBatterId == partnership.MoraBatter1Id)
                .Sum(d => d.RunsOffBat);
            var r2 = partnershipDeliveries
                .Where(d => d.MoraBatterId == partnership.MoraBatter2Id)
                .Sum(d => d.RunsOffBat);
            return (r1, r2);
        }
        else
        {
            var r1 = partnershipDeliveries
                .Where(d => d.OppBatterName == partnership.OppBatter1Name)
                .Sum(d => d.RunsOffBat);
            var r2 = partnershipDeliveries
                .Where(d => d.OppBatterName == partnership.OppBatter2Name)
                .Sum(d => d.RunsOffBat);
            return (r1, r2);
        }
    }

    private int GetSequenceAtOver(List<Delivery> deliveries, decimal atOver)
    {
        if (atOver == 0) return 0;
        var overNum = (int)Math.Floor(atOver) + 1;
        var ballNum = (int)((atOver - Math.Floor(atOver)) * 10);
        var delivery = deliveries.FirstOrDefault(d =>
            d.OverNumber == overNum && d.BallNumber == ballNum);
        return delivery?.DeliverySequence ?? 0;
    }

    // ── Player Milestones ──────────────────────────────────────────────────
    private async Task CheckPlayerMilestonesAsync(
        Delivery delivery,
        Innings innings,
        CancellationToken ct)
    {
        if (innings.BattingTeam != BattingTeam.Mora) return;
        if (!delivery.MoraBatterId.HasValue) return;

        var playerId = delivery.MoraBatterId.Value;

        // Get total runs for this batter in this innings so far
        var batterRuns = await _db.Deliveries
            .Where(d => d.InningsId == innings.Id &&
                        d.MoraBatterId == playerId)
            .SumAsync(d => d.RunsOffBat, ct);

        var match = await _db.Innings
            .Include(i => i.Match)
            .Where(i => i.Id == innings.Id)
            .Select(i => i.Match)
            .FirstOrDefaultAsync(ct);

        if (match is null) return;

        // Check debut
        var hasPrevious = await _db.MoraBattingPerformances
            .Include(p => p.Innings).ThenInclude(i => i.Match)
            .Where(p => p.PlayerId == playerId &&
                        p.Innings.Match.MatchDate < match.MatchDate)
            .AnyAsync(ct);

        if (!hasPrevious)
        {
            await RecordMilestoneAsync(playerId, MilestoneType.Debut,
                match.Id, match.MatchDate, "Debut", ct);
        }

        // Check run milestones
        var thresholds = new[]
        {
            (30, MilestoneType.First30),
            (50, MilestoneType.First50),
            (100, MilestoneType.First100),
        };

        foreach (var (threshold, milestoneType) in thresholds)
        {
            // Only trigger at exact threshold (not every ball above it)
            var prevTotal = batterRuns - delivery.RunsOffBat;
            if (prevTotal < threshold && batterRuns >= threshold)
            {
                await RecordMilestoneAsync(
                    playerId, milestoneType,
                    match.Id, match.MatchDate,
                    $"{threshold} reached in this innings", ct);

                // Add innings event
                var overDisplay = $"{delivery.OverNumber - 1}.{delivery.BallNumber}";
                await AddInningsEventAsync(innings.Id,
                    "BATTER_MILESTONE",
                    delivery.OverNumber - 1 + (decimal)delivery.BallNumber / 10,
                    null, null, null,
                    $"Milestone: {threshold} runs reached at {overDisplay}",
                    ct);
            }
        }
    }

    private async Task RecordMilestoneAsync(
        Guid playerId,
        MilestoneType milestoneType,
        Guid matchId,
        DateOnly achievedAt,
        string detail,
        CancellationToken ct)
    {
        var already = await _db.PlayerMilestones
            .AnyAsync(m => m.PlayerId == playerId &&
                           m.MilestoneType == milestoneType, ct);
        if (already) return;

        _db.PlayerMilestones.Add(new PlayerMilestone
        {
            PlayerId = playerId,
            MilestoneType = milestoneType,
            MatchId = matchId,
            AchievedAt = achievedAt,
            Detail = detail,
        });
        await _db.SaveChangesAsync(ct);
    }

    // ── Team Milestones ────────────────────────────────────────────────────
    private async Task CheckTeamMilestonesAsync(
        Delivery delivery,
        Innings innings,
        CancellationToken ct)
    {
        // Running team total after this delivery
        var teamTotal = await _db.Deliveries
            .Where(d => d.InningsId == innings.Id)
            .SumAsync(d => d.TotalRuns, ct);

        var prevTotal = teamTotal - delivery.TotalRuns;

        // Check each 50-run milestone
        var milestones = new[] { 50, 100, 150, 200, 250, 300 };
        foreach (var milestone in milestones)
        {
            if (prevTotal < milestone && teamTotal >= milestone)
            {
                var overDisplay =
                    $"{delivery.OverNumber - 1}.{delivery.BallNumber}";
                var wickets = await _db.Deliveries
                    .Where(d => d.InningsId == innings.Id && d.IsWicket &&
                                d.WicketType != WicketType.RetiredHurt)
                    .CountAsync(ct);

                await AddInningsEventAsync(
                    innings.Id, "TEAM_MILESTONE",
                    delivery.OverNumber - 1 + (decimal)delivery.BallNumber / 10,
                    teamTotal, wickets, null,
                    $"Team {milestone} — {teamTotal}/{wickets} at {overDisplay}",
                    ct);
            }
        }
    }

    // ── Innings Auto-End ───────────────────────────────────────────────────
    private async Task CheckInningsEndAsync(
        Delivery delivery,
        Innings innings,
        List<Delivery> allDeliveries,
        CancellationToken ct)
    {
        if (innings.IsCompleted) return;

        var legalBalls = allDeliveries
            .Count(d => d.ExtrasType != ExtrasType.Wide &&
                        d.ExtrasType != ExtrasType.NoBall);

        var wickets = allDeliveries
            .Count(d => d.IsWicket &&
                        d.WicketType != WicketType.RetiredHurt);

        var currentOver = delivery.OverNumber - 1 +
                           (decimal)delivery.BallNumber / 10;
        var teamTotal = allDeliveries.Sum(d => d.TotalRuns);

        string? endReason = null;

        // All out
        if (wickets >= 10)
            endReason = "WICKETS";

        // Overs complete
        else if (legalBalls >= innings.MaxOvers * 6)
            endReason = "OVERS";

        // Target achieved (second innings only)
        else if (innings.Target.HasValue && teamTotal >= innings.Target.Value)
            endReason = "TARGET";

        if (endReason is null) return;

        // Auto-complete the innings
        innings.IsCompleted = true;
        innings.EndedAtOver = currentOver;

        await ProcessInningsEndAsync(innings, ct);
        await _db.SaveChangesAsync(ct);
    }

    // ── Innings End — close active partnership ─────────────────────────────
    public async Task ProcessInningsEndAsync(
        Innings innings,
        CancellationToken ct)
    {
        var activePartnership = await _db.Partnerships
            .Where(p => p.InningsId == innings.Id && p.IsActive)
            .FirstOrDefaultAsync(ct);

        if (activePartnership is not null)
        {
            var allDeliveries = await _db.Deliveries
                .Where(d => d.InningsId == innings.Id)
                .OrderBy(d => d.DeliverySequence)
                .ToListAsync(ct);

            var isMoraBatting = innings.BattingTeam == BattingTeam.Mora;
            var (r1, r2) = CalculatePartnershipRuns(
                activePartnership, allDeliveries, isMoraBatting, ct);

            activePartnership.IsActive = false;
            activePartnership.EndedAtOver = innings.EndedAtOver;
            activePartnership.Batter1Runs = r1;
            activePartnership.Batter2Runs = r2;
            activePartnership.Unbroken = innings.IsCompleted &&
                                             innings.BattingTeam == BattingTeam.Mora;

            var partnershipDeliveries = allDeliveries
                .Where(d => d.DeliverySequence >=
                            GetSequenceAtOver(allDeliveries,
                                activePartnership.StartedAtOver))
                .ToList();
            activePartnership.Runs = partnershipDeliveries.Sum(d => d.TotalRuns);
            activePartnership.Balls = partnershipDeliveries
                .Count(d => d.ExtrasType != ExtrasType.Wide);

            await _db.SaveChangesAsync(ct);
        }

        // Final innings event
        await AddInningsEventAsync(
            innings.Id, "INNINGS_END",
            innings.EndedAtOver, null, null, null,
            "Innings completed", ct);
    }

    // ── Bowling Milestones (4W/5W) ─────────────────────────────────────────
    private async Task CheckBowlingMilestonesAsync(
        Delivery delivery,
        Innings innings,
        CancellationToken ct)
    {
        if (innings.BattingTeam != BattingTeam.Opponent) return;
        if (!delivery.MoraBowlerId.HasValue) return;
        if (!delivery.IsWicket) return;

        // Wicket types that count for bowler
        var bowlerWicketTypes = new[]
        {
            WicketType.Bowled, WicketType.Caught,
            WicketType.Lbw, WicketType.Stumped,
            WicketType.HitWicket,
        };
        if (!bowlerWicketTypes.Contains(delivery.WicketType!.Value)) return;

        var bowlerId = delivery.MoraBowlerId.Value;

        var wicketsInInnings = await _db.Deliveries
            .Where(d => d.InningsId == innings.Id &&
                        d.MoraBowlerId == bowlerId &&
                        d.IsWicket &&
                        bowlerWicketTypes.Contains(d.WicketType!.Value))
            .CountAsync(ct);

        var match = await _db.Innings
            .Include(i => i.Match)
            .Where(i => i.Id == innings.Id)
            .Select(i => i.Match)
            .FirstOrDefaultAsync(ct);

        if (match is null) return;

        if (wicketsInInnings == 4)
        {
            await RecordMilestoneAsync(
                bowlerId, MilestoneType.First4Fer,
                match.Id, match.MatchDate,
                "First 4-wicket haul", ct);
        }

        if (wicketsInInnings == 5)
        {
            await RecordMilestoneAsync(
                bowlerId, MilestoneType.First5Fer,
                match.Id, match.MatchDate,
                "First 5-wicket haul", ct);
        }
    }

    // ── Helper ─────────────────────────────────────────────────────────────
    private async Task AddInningsEventAsync(
        Guid inningsId,
        string eventType,
        decimal? atOver,
        int? teamScore,
        int? teamWickets,
        int? revisedOvers,
        string description,
        CancellationToken ct)
    {
        // Don't duplicate events of the same type at the same over
        var existing = await _db.InningsEvents
            .AnyAsync(e => e.InningsId == inningsId &&
                           e.EventType == eventType &&
                           e.AtOver == atOver, ct);
        if (existing) return;

        _db.InningsEvents.Add(new InningsEvent
        {
            InningsId = inningsId,
            EventType = eventType,
            AtOver = atOver,
            TeamScoreAtEvent = teamScore,
            TeamWicketsAtEvent = teamWickets,
            RevisedOvers = revisedOvers,
            Description = description,
        });
        await _db.SaveChangesAsync(ct);
    }
}
