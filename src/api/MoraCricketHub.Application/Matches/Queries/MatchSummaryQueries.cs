using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Matches.Queries;

// TV-style match summary — top 4 batters + top 4 bowlers per innings
public record MatchSummaryDataDto(
    Guid MatchId,
    List<InningsSummaryDisplay> Innings
);

public record InningsSummaryDisplay(
    string BattingTeam,
    int TotalRuns,
    int TotalWickets,
    decimal TotalOversFaced,
    List<TopBatterDto> TopBatters,
    List<TopBowlerDto> TopBowlers
);

public record TopBatterDto(
    string Name,
    int Runs,
    int Balls,
    bool IsNotOut,
    int Fours,
    int Sixes
);

public record TopBowlerDto(
    string Name,
    decimal Overs,
    int Runs,
    int Wickets
);

public record GetMatchSummaryDataQuery(Guid MatchId)
    : IRequest<MatchSummaryDataDto?>;
