using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

/// <summary>
/// Explicit batting order for Mora innings.
/// Independent of MoraBattingPerformance so we can record
/// who was supposed to bat even if they were not out or DNB.
/// </summary>
public class MoraBattingOrder : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;

    public int Position { get; set; }              // 1-11
}
