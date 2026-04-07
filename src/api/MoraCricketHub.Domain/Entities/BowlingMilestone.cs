using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class BowlingMilestone : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;

    // "FOUR_WICKET" | "FIVE_WICKET" | "HATTRICK"
    public string MilestoneType { get; set; } = string.Empty;

    // For hat-tricks — the three consecutive wicket delivery IDs
    public Guid? Delivery1Id { get; set; }
    public Delivery? Delivery1 { get; set; }
    public Guid? Delivery2Id { get; set; }
    public Delivery? Delivery2 { get; set; }
    public Guid? Delivery3Id { get; set; }
    public Delivery? Delivery3 { get; set; }

    public string? Detail { get; set; }            // e.g. "5/32 off 8 overs vs SLIIT"
}
