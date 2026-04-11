using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Deliveries.Queries;

public record DeliveryDto(
    Guid Id,
    int OverNumber,
    int BallNumber,
    int DeliverySequence,

    // Batter
    Guid? MoraBatterId,
    string? MoraBatterName,
    string? OppBatterName,
    string? OppBatterStyle,

    // Bowler
    Guid? MoraBowlerId,
    string? MoraBowlerName,
    string? OppBowlerName,
    string? OppBowlerStyle,

    // Outcome
    int RunsOffBat,
    string? ExtrasType,
    int ExtrasRuns,
    int TotalRuns,

    // Wicket
    bool IsWicket,
    string? WicketType,
    string? DismissedBatterName,
    string? MoraFielderName,
    string? OppFielderName,

    // Optional enrichment
    string? BowlingSide,
    string? ShotType,
    string? DirectionZone
);

public record OverSummaryDto(
    int OverNumber,
    int RunsInOver,
    int WicketsInOver,
    int DotsInOver,
    int FoursInOver,
    int SixesInOver,
    int WidesInOver,
    int NoBallsInOver,
    int CumulativeRuns,
    int CumulativeWickets
);

// ── Queries ───────────────────────────────────────────────────────────────────

// Get all deliveries for an innings
public record GetInningsDeliveriesQuery(Guid InningsId)
    : IRequest<List<DeliveryDto>>;

// Get deliveries for one specific over
public record GetOverDeliveriesQuery(Guid InningsId, int OverNumber)
    : IRequest<List<DeliveryDto>>;

// Get all over summaries for an innings (worm chart data)
public record GetOverSummariesQuery(Guid InningsId)
    : IRequest<List<OverSummaryDto>>;
