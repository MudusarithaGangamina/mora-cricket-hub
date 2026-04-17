using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

/// <summary>
/// Tracks which opponent players participated in a specific match.
/// Supports both registered players (OpponentPlayerId set) and
/// unregistered players (just a name string).
/// </summary>
public class MatchOpponentSquad : BaseEntity
{
    public Guid MatchId { get; set; }
    public Match Match { get; set; } = null!;

    // Nullable — set when player is in the opponent registry
    public Guid? OpponentPlayerId { get; set; }
    public OpponentPlayer? OpponentPlayer { get; set; }

    // Always set — even for registered players (string fallback)
    public string PlayerName { get; set; } = string.Empty;

    // Denormalised at time of match — may differ from registry
    public string? BattingStyle { get; set; }
    public string? BowlingStyle { get; set; }

    public int? BattingOrder { get; set; }  // 1-11 if known
}
