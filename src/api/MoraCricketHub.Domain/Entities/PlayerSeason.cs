using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Common;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Domain.Entities;

public class PlayerSeason : BaseEntity
{
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;

    public Guid SeasonId { get; set; }
    public Season Season { get; set; } = null!;

    public int? JerseyNumber { get; set; }
    public BattingRole? BattingRole { get; set; }  // Admin assigned per season
}
