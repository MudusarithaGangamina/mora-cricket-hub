using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Domain.Entities;

public class Innings : BaseEntity
{
    public Guid MatchId { get; set; }
    public Match Match { get; set; } = null!;

    public int InningsNumber { get; set; }         // 1 or 2
    public InningsType InningsType { get; set; } = InningsType.Normal;
    public BattingTeam BattingTeam { get; set; }

    // Wicketkeeper for THIS innings — handles mid-innings keeper swap
    // When set, overrides the match-level MoraWickeeperId for this innings
    public Guid? MoraWickeeperId { get; set; }
    public Player? MoraWickekeeper { get; set; }

    // Scorecard aggregates — always populated even without delivery data
    public int TotalRuns { get; set; }
    public int TotalWickets { get; set; }
    public decimal TotalOversFaced { get; set; }
    public int ExtrasWides { get; set; }
    public int ExtrasNoBalls { get; set; }
    public int ExtrasLegByes { get; set; }
    public int ExtrasByes { get; set; }
    public int ExtrasPenalty { get; set; }

    // Data completeness flags
    public bool HasDeliveryData { get; set; } = false;
    public CommentaryCoverage CommentaryCoverage { get; set; } = CommentaryCoverage.None;

    // Navigation
    public ICollection<Delivery> Deliveries { get; set; } = [];
    public ICollection<OverSummary> OverSummaries { get; set; } = [];
    public ICollection<MoraBattingPerformance> MoraBattingPerformances { get; set; } = [];
    public ICollection<MoraBowlingPerformance> MoraBowlingPerformances { get; set; } = [];
    public ICollection<MoraFieldingPerformance> MoraFieldingPerformances { get; set; } = [];
    public ICollection<OpponentBattingPerformance> OpponentBattingPerformances { get; set; } = [];
    public ICollection<OpponentBowlingPerformance> OpponentBowlingPerformances { get; set; } = [];
    public ICollection<FallOfWicket> FallOfWickets { get; set; } = [];
    public ICollection<Partnership> Partnerships { get; set; } = [];
}
