using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Domain.Entities;

public class Player : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string? Nickname { get; set; }
    public string? PhotoUrl { get; set; }           // URL in object storage (Cloudflare R2)
    public string? Faculty { get; set; }
    public string? Degree { get; set; }
    public int BatchYear { get; set; }              // e.g. 18 for 2018 intake
    public BattingStyle BattingStyle { get; set; }
    public BowlingStyle? PrimaryBowlingStyle { get; set; }
    public DateOnly? DebutDate { get; set; }        // Auto-populated from first match
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<PlayerSeason> Seasons { get; set; } = [];
    public ICollection<PlayerMilestone> Milestones { get; set; } = [];
    public ICollection<MoraBattingPerformance> BattingPerformances { get; set; } = [];
    public ICollection<MoraBowlingPerformance> BowlingPerformances { get; set; } = [];
    public ICollection<MoraFieldingPerformance> FieldingPerformances { get; set; } = [];
    public ICollection<MatchSquad> MatchSquads { get; set; } = [];
}
