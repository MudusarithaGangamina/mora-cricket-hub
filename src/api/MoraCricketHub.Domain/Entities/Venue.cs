using MoraCricketHub.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace MoraCricketHub.Domain.Entities;

public class Venue : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? City { get; set; }
    public bool IsMoraHomeGround { get; set; } = false;

    // Navigation
    public ICollection<Match> Matches { get; set; } = [];
}