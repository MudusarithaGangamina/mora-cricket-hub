using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class OpponentBattingPerformance : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    // Optional link — set when opponent player is registered
    public Guid? OpponentPlayerId { get; set; }
    public OpponentPlayer? OpponentPlayer { get; set; }

    // Always store name as string — data entry never blocked by missing FK
    public string PlayerName { get; set; } = string.Empty;
    public string? BattingStyle { get; set; }      // Denormalised at time of match

    public int BattingPosition { get; set; }
    public int Runs { get; set; }
    public int BallsFaced { get; set; }
    public int Fours { get; set; }
    public int Sixes { get; set; }
    public bool IsNotOut { get; set; }
    public int? MinutesBatted { get; set; }
    public string? DismissalType { get; set; }

    public Guid? DismissedByMoraBowlerId { get; set; }
    public Player? DismissedByMoraBowler { get; set; }

    public Guid? FieldedByMoraPlayerId { get; set; }
    public Player? FieldedByMoraPlayer { get; set; }
}
