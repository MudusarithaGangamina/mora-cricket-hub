using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Domain.Entities;

public class OpponentPlayer : BaseEntity
{
    public Guid? OpponentId { get; set; }
    public Opponent? Opponent { get; set; }

    public string FullName { get; set; } = string.Empty;

    // Nullable — enter when known, critical for matchup analysis
    public BattingStyle? BattingStyle { get; set; }
    public BowlingStyle? BowlingStyle { get; set; }

    public string? Notes { get; set; }
}
