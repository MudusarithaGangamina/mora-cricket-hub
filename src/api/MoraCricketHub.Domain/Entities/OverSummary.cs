using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

/// <summary>
/// Pre-computed per-over aggregates. Populated by OverSummaryJob after
/// delivery data entry is complete. Powers the worm chart without
/// re-aggregating thousands of delivery rows on every page load.
/// </summary>
public class OverSummary : BaseEntity
{
    public Guid InningsId { get; set; }
    public Innings Innings { get; set; } = null!;

    public int OverNumber { get; set; }

    public int RunsInOver { get; set; }
    public int WicketsInOver { get; set; }
    public int DotsInOver { get; set; }
    public int FoursInOver { get; set; }
    public int SixesInOver { get; set; }
    public int WidesInOver { get; set; }
    public int NoBallsInOver { get; set; }

    // Running totals — used directly by worm chart
    public int CumulativeRuns { get; set; }
    public int CumulativeWickets { get; set; }
}
