using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class MoraBattingPerformance : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;

    public int BattingPosition { get; set; }
    public int Runs { get; set; }
    public int BallsFaced { get; set; }
    public int Fours { get; set; }
    public int Sixes { get; set; }
    public bool IsNotOut { get; set; }
    public int? MinutesBatted { get; set; }

    // Dismissal
    public string? DismissalType { get; set; }    // "BOWLED" | "CAUGHT" | ... | "DNB"

    public Guid? DismissedByOppBowlerId { get; set; }
    public OpponentPlayer? DismissedByOppBowler { get; set; }
    public string? DismissedByOppBowlerName { get; set; }
    public string? DismissedByOppBowlerStyle { get; set; }  // Denormalised — fallback for scorecard-only innings

    public Guid? FieldedByMoraPlayerId { get; set; }
    public Player? FieldedByMoraPlayer { get; set; }
    public string? FieldedByOppName { get; set; }

    // Milestone flags — set by MilestoneDetectionJob after data entry
    public bool IsThirty { get; set; }            // scored 30-49
    public bool IsFifty { get; set; }             // scored 50-99
    public bool IsHundred { get; set; }           // scored 100+
    public bool IsDuck { get; set; }              // out for 0
}
