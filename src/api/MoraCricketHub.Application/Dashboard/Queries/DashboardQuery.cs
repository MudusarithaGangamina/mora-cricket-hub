using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Dashboard.Queries;

public record DashboardSummaryDto(
    int TotalMatches,
    int Wins,
    int Losses,
    int NoResults,
    decimal WinPercentage,
    int TotalPlayers,
    int TotalRuns,
    int TotalWickets,
    string TopScorerName,
    int TopScorerRuns,
    string TopWicketTakerName,
    int TopWicketTakerWickets,
    List<RecentMatchDto> RecentMatches
);

public record RecentMatchDto(
    Guid Id,
    string MatchDate,
    string OpponentName,
    string ResultType,
    int? ResultMargin,
    string? ResultMarginType,
    string VenueType
);

public record GetDashboardSummaryQuery : IRequest<DashboardSummaryDto>;
