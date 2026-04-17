using System;
using System.Collections.Generic;
using System.Text;

using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

/// <summary>
/// Tracks events within an innings:
/// drinks breaks, rain stoppages, bad light, injury delays,
/// revised overs announcements, and key milestones
/// (team 50, team 100, batter 50 etc — auto-generated).
/// </summary>
public class InningsEvent : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    /// <summary>
    /// DRINKS | RAIN | BAD_LIGHT | INJURY | REVISED_OVERS |
    /// TEAM_MILESTONE | BATTER_MILESTONE | BOWLER_MILESTONE | OTHER
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// Over at which this event occurred e.g. 12.4
    /// </summary>
    public decimal? AtOver { get; set; }

    /// <summary>
    /// Score at this event e.g. 87/3
    /// </summary>
    public int? TeamScoreAtEvent { get; set; }
    public int? TeamWicketsAtEvent { get; set; }

    /// <summary>
    /// For REVISED_OVERS — the new maximum overs
    /// </summary>
    public int? RevisedOvers { get; set; }

    /// <summary>
    /// Human readable description e.g.
    /// "Gavin reaches 50 off 43 balls"
    /// "Team reaches 100 at 22.4"
    /// "Rain stops play — revised target 178 in 35 overs"
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Optional link to a Mora player for player milestones
    /// </summary>
    public Guid? PlayerId { get; set; }
    public Player? Player { get; set; }
}
