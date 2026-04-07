using MoraCricketHub.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace MoraCricketHub.Domain.Entities;

public class Opponent : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;

    // Navigation
    public ICollection<OpponentPlayer> Players { get; set; } = [];
    public ICollection<Match> Matches { get; set; } = [];
}
