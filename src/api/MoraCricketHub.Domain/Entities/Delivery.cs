using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Domain.Entities;

public class Delivery : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    public int OverNumber { get; set; }
    public int BallNumber { get; set; }            // Legal delivery in over (1-6)
    public int DeliverySequence { get; set; }      // Absolute sequence including wides/no-balls

    // ── Mora batter (when Mora bats) ──────────────────────────────────────────
    public Guid? MoraBatterId { get; set; }
    public Player? MoraBatter { get; set; }

    // ── Opponent batter (when opponent bats) ──────────────────────────────────
    public Guid? OppBatterId { get; set; }
    public OpponentPlayer? OppBatter { get; set; }
    public string? OppBatterName { get; set; }     // Always stored as string fallback
    public string? OppBatterStyle { get; set; }    // Denormalised RHB/LHB for bowler vs hand analysis

    // ── Mora bowler (when Mora bowls) ─────────────────────────────────────────
    public Guid? MoraBowlerId { get; set; }
    public Player? MoraBowler { get; set; }

    // ── Opponent bowler (when Mora bats) ──────────────────────────────────────
    public Guid? OppBowlerId { get; set; }
    public OpponentPlayer? OppBowler { get; set; }
    public string? OppBowlerName { get; set; }     // Always stored as string fallback
    public string? OppBowlerStyle { get; set; }    // Denormalised — KEY index for batter vs bowling style

    // ── Ball outcome ──────────────────────────────────────────────────────────
    public int RunsOffBat { get; set; }
    public ExtrasType? ExtrasType { get; set; }
    public int ExtrasRuns { get; set; }
    public int TotalRuns { get; set; }             // RunsOffBat + ExtrasRuns

    // ── Wicket ────────────────────────────────────────────────────────────────
    public bool IsWicket { get; set; }
    public WicketType? WicketType { get; set; }

    // Who was dismissed (may differ from striker in run-outs)
    public Guid? DismissedMoraBatterId { get; set; }
    public Player? DismissedMoraBatter { get; set; }
    public Guid? DismissedOppBatterId { get; set; }
    public OpponentPlayer? DismissedOppBatter { get; set; }
    public string? DismissedBatterName { get; set; }

    // Fielder
    public Guid? MoraFielderId { get; set; }
    public Player? MoraFielder { get; set; }
    public string? OppFielderName { get; set; }

    // ── Optional enrichment ───────────────────────────────────────────────────
    // Bowling side: nullable, only set when commentary explicitly states it
    public BowlingSide? BowlingSide { get; set; }

    /// <summary>
    /// True when this delivery was bowled by a replacement bowler
    /// due to original bowler being injured mid-over.
    /// The original bowler's figures will show e.g. 1.3 overs.
    /// </summary>
    public bool IsMidOverBowlerChange { get; set; } = false;

    // Shot & direction: always nullable, innings CommentaryCoverage explains why
    public ShotType? ShotType { get; set; }
    public DirectionZone? DirectionZone { get; set; }
}