using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class OpponentBowlingPerformance : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    public Guid? OpponentPlayerId { get; set; }
    public OpponentPlayer? OpponentPlayer { get; set; }

    public string PlayerName { get; set; } = string.Empty;
    public string? BowlingStyle { get; set; }      // Denormalised — key for batter vs bowler-type analysis

    public decimal OversBowled { get; set; }
    public int Maidens { get; set; }
    public int RunsConceded { get; set; }
    public int Wickets { get; set; }
    public int Wides { get; set; }
    public int NoBalls { get; set; }
}
