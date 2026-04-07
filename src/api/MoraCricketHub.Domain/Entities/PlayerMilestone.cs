using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Domain.Entities;

public class PlayerMilestone : BaseEntity
{
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;

    public MilestoneType MilestoneType { get; set; }

    public Guid MatchId { get; set; }
    public Match Match { get; set; } = null!;

    public DateOnly AchievedAt { get; set; }
    public string? Detail { get; set; }            // e.g. "101* off 98 balls vs Memon SC"
}
