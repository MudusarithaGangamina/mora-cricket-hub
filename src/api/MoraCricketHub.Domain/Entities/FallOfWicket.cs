using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class FallOfWicket : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    public int WicketNumber { get; set; }          // 1-10
    public int ScoreAtFall { get; set; }
    public decimal OverAtFall { get; set; }        // e.g. 12.4

    // Mora innings dismissal
    public Guid? DismissedMoraPlayerId { get; set; }
    public Player? DismissedMoraPlayer { get; set; }

    // Opponent innings dismissal
    public Guid? DismissedOppPlayerId { get; set; }
    public OpponentPlayer? DismissedOppPlayer { get; set; }

    // String fallback — always populated
    public string DismissedPlayerName { get; set; } = string.Empty;
}
