using MoraCricketHub.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace MoraCricketHub.Domain.Entities;

public class Tournament : BaseEntity
{
    public Guid SeasonId { get; set; }
    public Season Season { get; set; } = null!;

    public string Name { get; set; } = string.Empty;      // e.g. "CDCA Div III Tournament 2026"
    public string Format { get; set; } = "OD";           // OD | T20 | Other
    public int OversPerSide { get; set; } = 50;

    // Navigation
    public ICollection<Match> Matches { get; set; } = [];
}
