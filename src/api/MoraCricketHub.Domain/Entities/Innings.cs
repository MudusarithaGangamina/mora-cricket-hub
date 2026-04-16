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

    // ── Overs management ──────────────────────────────────────────────────────
    /// <summary>
    /// Overs scheduled at the start of this innings.
    /// Copied from Match.ScheduledOvers when innings is created.
    /// </summary>
    public int ScheduledOvers { get; set; } = 50;

    /// <summary>
    /// Current maximum overs — may be reduced during innings due to
    /// rain/bad light/slow over rate. Starts equal to ScheduledOvers.
    /// </summary>
    public int MaxOvers { get; set; } = 50;

    /// <summary>
    /// Target for second innings. Set when first innings completes.
    /// For DLS/Parabola matches this may differ from first innings total + 1.
    /// </summary>
    public int? Target { get; set; }

    /// <summary>
    /// True when innings has ended (10 wickets / overs up / target reached /
    /// admin manually ended). No more deliveries can be added after this.
    /// </summary>
    public bool IsCompleted { get; set; } = false;

    /// <summary>
    /// True when admin has confirmed the innings data is fully entered
    /// and correct. Locks the innings scorecard from manual edits.
    /// </summary>
    public bool IsConfirmed { get; set; } = false;

    /// <summary>
    /// Which over/ball the innings ended on — stored for display purposes.
    /// </summary>
    public decimal? EndedAtOver { get; set; }

    // Navigation
    public ICollection<InningsEvent> Events { get; set; } = [];

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
