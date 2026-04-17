using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

/// <summary>
/// Covers BOTH Mora and Opponent innings.
/// Mora innings:     MoraBatter1Id + MoraBatter2Id set, Opp fields null
/// Opponent innings: OppBatter1Name + OppBatter2Name set, Mora fields null
/// </summary>
public class Partnership : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    public int WicketNumber { get; set; }

    // Mora batting
    public Guid? MoraBatter1Id { get; set; }
    public Player? MoraBatter1 { get; set; }
    public Guid? MoraBatter2Id { get; set; }
    public Player? MoraBatter2 { get; set; }

    // Opponent batting
    public Guid? OppBatter1Id { get; set; }
    public OpponentPlayer? OppBatter1 { get; set; }
    public string? OppBatter1Name { get; set; }
    public Guid? OppBatter2Id { get; set; }
    public OpponentPlayer? OppBatter2 { get; set; }
    public string? OppBatter2Name { get; set; }

    public int Runs { get; set; }
    public int Balls { get; set; }
    public int Batter1Runs { get; set; }
    public int Batter2Runs { get; set; }
    public bool Unbroken { get; set; }

    /// <summary>
    /// True while this partnership is still active (batters still together).
    /// Set to false when partnership ends (wicket/retired/innings end).
    /// Only one partnership per innings should have IsActive = true at any time.
    /// </summary>
    public bool IsActive { get; set; } = true;
    public decimal StartedAtOver { get; set; } = 0;
    public decimal? EndedAtOver { get; set; }
}
