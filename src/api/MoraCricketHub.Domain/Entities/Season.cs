using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;

namespace MoraCricketHub.Domain.Entities;

public class Season : BaseEntity
{
    public string Name { get; set; } = string.Empty;       // e.g. "2022/23"
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }

    // Navigation
    public ICollection<Tournament> Tournaments { get; set; } = [];
}
