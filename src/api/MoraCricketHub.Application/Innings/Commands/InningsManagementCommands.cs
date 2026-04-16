using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Innings.Commands;

/// <summary>
/// Update the max overs for an innings (revised due to rain etc.)
/// </summary>
public record UpdateInningsOversCommand(
    Guid InningsId,
    int MaxOvers,
    int? Target           // for second innings DLS target
) : IRequest<bool>;

/// <summary>
/// Mark innings as completed.
/// Called automatically when 10 wickets fall, overs run out,
/// or target is reached. Also callable manually.
/// </summary>
public record CompleteInningsCommand(
    Guid InningsId,
    decimal EndedAtOver,
    string Reason       // "WICKETS" | "OVERS" | "TARGET" | "MANUAL"
) : IRequest<bool>;

/// <summary>
/// Confirm innings data is fully entered and correct.
/// Locks the innings from manual edits.
/// </summary>
public record ConfirmInningsCommand(
    Guid InningsId
) : IRequest<bool>;

/// <summary>
/// Add an event to an innings (drinks, rain, etc.)
/// </summary>
public record AddInningsEventCommand(
    Guid InningsId,
    string EventType,
    decimal? AtOver,
    int? TeamScoreAtEvent,
    int? TeamWicketsAtEvent,
    int? RevisedOvers,
    string Description,
    Guid? PlayerId
) : IRequest<Guid>;

/// <summary>
/// Change the bowler mid-over due to injury.
/// Records the change on the delivery and updates bowler figures.
/// </summary>
public record ChangeBowlerMidOverCommand(
    Guid InningsId,
    Guid NewBowlerId,
    int OverNumber,
    int FromBallNumber    // the ball number the new bowler starts from
) : IRequest<bool>;

/// <summary>
/// Change the wicketkeeper for this innings.
/// Records the change as an innings event.
/// </summary>
public record ChangeKeeperCommand(
    Guid InningsId,
    Guid NewKeeperId,
    int OverNumber,
    int BallNumber
) : IRequest<bool>;
