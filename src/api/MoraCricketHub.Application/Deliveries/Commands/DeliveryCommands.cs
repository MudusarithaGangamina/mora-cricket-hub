using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Deliveries.Commands;

/// <summary>
/// Add a single delivery. Called immediately when each ball is confirmed
/// in the data entry UI so nothing is lost if the browser crashes.
/// After saving the delivery, the over summary is automatically recomputed.
/// </summary>
public record AddDeliveryCommand(
    Guid InningsId,
    int OverNumber,
    int BallNumber,         // Legal ball in over (1-6)
    int DeliverySequence,   // Absolute position including wides/no-balls

    // Exactly one of these pairs is set depending on who is batting
    Guid? MoraBatterId,
    Guid? OppBatterId,
    string? OppBatterName,
    string? OppBatterStyle,     // RHB | LHB — denormalised

    // Exactly one of these pairs is set depending on who is bowling
    Guid? MoraBowlerId,
    Guid? OppBowlerId,
    string? OppBowlerName,
    string? OppBowlerStyle,     // RF | SLA etc — denormalised for analysis

    // Outcome
    int RunsOffBat,
    string? ExtrasType,         // WIDE | NO_BALL | LEG_BYE | BYE | PENALTY | null
    int ExtrasRuns,

    // Wicket
    bool IsWicket,
    string? WicketType,
    Guid? DismissedMoraBatterId,
    Guid? DismissedOppBatterId,
    string? DismissedBatterName,
    Guid? MoraFielderId,
    string? OppFielderName,

    // Optional enrichment — all nullable
    string? BowlingSide,        // OVER | AROUND — only when commentary states it
    string? ShotType,
    string? DirectionZone
) : IRequest<Guid>;

/// <summary>
/// Correct a delivery that was entered incorrectly.
/// Over summary is recomputed automatically after correction.
/// </summary>
public record UpdateDeliveryCommand(
    Guid DeliveryId,
    int RunsOffBat,
    string? ExtrasType,
    int ExtrasRuns,
    bool IsWicket,
    string? WicketType,
    Guid? DismissedMoraBatterId,
    Guid? DismissedOppBatterId,
    string? DismissedBatterName,
    Guid? MoraFielderId,
    string? OppFielderName,
    string? BowlingSide,
    string? ShotType,
    string? DirectionZone
) : IRequest<bool>;

/// <summary>
/// Delete the last delivery in an over (undo last ball).
/// Over summary recomputed after deletion.
/// </summary>
public record DeleteDeliveryCommand(
    Guid DeliveryId,
    Guid InningsId,
    int OverNumber
) : IRequest<bool>;

/// <summary>
/// Explicitly mark an innings as having full delivery data entered.
/// Called when the admin confirms data entry for an innings is complete.
/// This flag controls which innings appear in delivery-dependent analytics.
/// </summary>
public record MarkInningsDeliveryCompleteCommand(
    Guid InningsId
) : IRequest<bool>;
