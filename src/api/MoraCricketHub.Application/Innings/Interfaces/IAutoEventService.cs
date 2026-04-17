using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Innings.Interfaces;

/// <summary>
/// Triggered after every delivery save.
/// Handles all automatic side-effect events:
/// fall of wickets, partnerships, milestones, innings end.
/// </summary>
public interface IAutoEventService
{
    Task ProcessDeliveryAsync(
        Delivery delivery,
        MoraCricketHub.Domain.Entities.Innings innings,
        CancellationToken ct);

    /// <summary>
    /// Called when an innings ends (all wickets or overs up).
    /// Closes the active partnership and records innings-end event.
    /// </summary>
    Task ProcessInningsEndAsync(
        MoraCricketHub.Domain.Entities.Innings innings,
        CancellationToken ct);
}
