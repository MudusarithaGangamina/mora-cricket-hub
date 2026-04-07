using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class MoraFieldingPerformance : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;

    public int Catches { get; set; }
    public int RunOuts { get; set; }
    public int Stumpings { get; set; }
    public int DroppedCatches { get; set; }       // Admin-only — never exposed publicly
}
