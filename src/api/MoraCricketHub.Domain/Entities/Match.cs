using System;
using System.Collections.Generic;
using System.Text;

using MoraCricketHub.Domain.Common;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Domain.Entities;

public class Match : BaseEntity
{
    public Guid TournamentId { get; set; }
    public Tournament Tournament { get; set; } = null!;

    public Guid OpponentId { get; set; }
    public Opponent Opponent { get; set; } = null!;

    public Guid? VenueId { get; set; }
    public Venue? Venue { get; set; }

    public DateOnly MatchDate { get; set; }
    public int ScheduledOvers { get; set; } = 50;

    // Venue & conditions
    public VenueType VenueType { get; set; }
    public SurfaceType SurfaceType { get; set; } = SurfaceType.Matting;
    public BallColour BallColour { get; set; } = BallColour.Red;
    public BallType BallType { get; set; } = BallType.Leather;

    // Tournament round
    public RoundType RoundType { get; set; } = RoundType.FirstRound;
    public string? RoundLabel { get; set; }        // e.g. "Group B - Match 3"

    // Toss — all nullable when PreTossAbandoned
    public bool TossHeld { get; set; } = true;
    public string? TossWinner { get; set; }        // "MORA" | "OPPONENT" | null
    public string? TossDecision { get; set; }      // "BAT" | "FIELD" | null
    public bool? MoraBattingFirst { get; set; }

    // Result
    public MatchStatus Status { get; set; }
    public ResultType? ResultType { get; set; }
    public int? ResultMargin { get; set; }
    public string? ResultMarginType { get; set; }  // "RUNS" | "WICKETS"

    // DLS / Parabola
    public bool DlsApplied { get; set; } = false;
    public int? DlsTarget { get; set; }
    public int? RevisedOvers { get; set; }

    // Match officials
    public Guid? MoraCaptainId { get; set; }
    public Player? MoraCaptain { get; set; }

    public Guid? MoraWickeeperId { get; set; }
    public Player? MoraWickekeeper { get; set; }

    public string? OpponentCaptainName { get; set; }

    // Player of the Match
    public Guid? PlayerOfMatchMoraId { get; set; }
    public Player? PlayerOfMatchMora { get; set; }
    public string? PlayerOfMatchName { get; set; }
    public string? PlayerOfMatchTeam { get; set; } // "MORA" | "OPPONENT"

    public string? Notes { get; set; }

    // Navigation
    public ICollection<Innings> Innings { get; set; } = [];
    public ICollection<MatchSquad> Squad { get; set; } = [];
}
