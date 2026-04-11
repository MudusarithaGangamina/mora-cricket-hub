using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Players.Queries;

public record CareerStatsDto(
    Guid PlayerId,
    string FullName,
    string ShortName,
    string? Nickname,
    string? PhotoUrl,
    string? Faculty,
    string? Degree,
    int BatchYear,
    string BattingStyle,
    string? PrimaryBowlingStyle,
    string? DebutDate,
    bool IsActive,
    BattingCareerDto Batting,
    BowlingCareerDto Bowling,
    FieldingCareerDto Fielding
);

public record BattingCareerDto(
    int Matches,
    int Innings,
    int NotOuts,
    int Runs,
    int HighScore,
    bool HighScoreNotOut,
    decimal? Average,          // null when no dismissals yet
    decimal StrikeRate,
    int Hundreds,
    int Fifties,
    int Thirties,
    int Ducks,
    int Fours,
    int Sixes
);

public record BowlingCareerDto(
    int Matches,
    int Innings,
    decimal OversBowled,
    int Maidens,
    int RunsConceded,
    int Wickets,
    decimal? Average,          // null when no wickets
    decimal Economy,
    decimal? StrikeRate,       // null when no wickets
    int FourWicketHauls,
    int FiveWicketHauls
);

public record FieldingCareerDto(
    int Matches,
    int Catches,
    int RunOuts,
    int Stumpings
);

public record GetPlayerCareerStatsQuery(Guid PlayerId)
    : IRequest<CareerStatsDto?>;
