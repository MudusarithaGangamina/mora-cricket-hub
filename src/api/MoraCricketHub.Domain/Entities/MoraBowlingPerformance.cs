using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class MoraBowlingPerformance : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;

    public decimal OversBowled { get; set; }
    public int Maidens { get; set; }
    public int RunsConceded { get; set; }
    public int Wickets { get; set; }
    public int Wides { get; set; }
    public int NoBalls { get; set; }

    // Milestone flags — set by MilestoneDetectionJob
    public bool IsFourWicketHaul { get; set; }
    public bool IsFiveWicketHaul { get; set; }
}
