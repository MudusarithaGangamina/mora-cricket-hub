using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Common;
using MoraCricketHub.Application.Deliveries.Interfaces;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Application.Deliveries.Commands;

// ── Add delivery ──────────────────────────────────────────────────────────────
public class AddDeliveryHandler : IRequestHandler<AddDeliveryCommand, Guid>
{
    private readonly IDeliveryRepository _repo;
    public AddDeliveryHandler(IDeliveryRepository repo) => _repo = repo;

    public async Task<Guid> Handle(
        AddDeliveryCommand r, CancellationToken ct)
    {
        var delivery = new Delivery
        {
            InningsId = r.InningsId,
            OverNumber = r.OverNumber,
            BallNumber = r.BallNumber,
            DeliverySequence = r.DeliverySequence,

            MoraBatterId = r.MoraBatterId,
            OppBatterId = r.OppBatterId,
            OppBatterName = r.OppBatterName,
            OppBatterStyle = r.OppBatterStyle,

            MoraBowlerId = r.MoraBowlerId,
            OppBowlerId = r.OppBowlerId,
            OppBowlerName = r.OppBowlerName,
            OppBowlerStyle = r.OppBowlerStyle,

            RunsOffBat = r.RunsOffBat,
            ExtrasType = EnumParser.ParseNullable<ExtrasType>(r.ExtrasType),
            ExtrasRuns = r.ExtrasRuns,
            TotalRuns = r.RunsOffBat + r.ExtrasRuns,

            IsWicket = r.IsWicket,
            WicketType = EnumParser.ParseNullable<WicketType>(r.WicketType),
            DismissedMoraBatterId = r.DismissedMoraBatterId,
            DismissedOppBatterId = r.DismissedOppBatterId,
            DismissedBatterName = r.DismissedBatterName,
            MoraFielderId = r.MoraFielderId,
            OppFielderName = r.OppFielderName,

            BowlingSide = EnumParser.ParseNullable<BowlingSide>(r.BowlingSide),
            ShotType = EnumParser.ParseNullable<ShotType>(r.ShotType),
            DirectionZone = EnumParser.ParseNullable<DirectionZone>(r.DirectionZone),
        };

        var id = await _repo.AddDeliveryAsync(delivery, ct);

        // Recompute this over's summary immediately after every ball
        // This keeps OverSummary always up to date for the worm chart
        await _repo.RecomputeOverSummaryAsync(r.InningsId, r.OverNumber, ct);

        return id;
    }
}

// ── Update delivery ───────────────────────────────────────────────────────────
public class UpdateDeliveryHandler : IRequestHandler<UpdateDeliveryCommand, bool>
{
    private readonly IDeliveryRepository _repo;
    public UpdateDeliveryHandler(IDeliveryRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdateDeliveryCommand r, CancellationToken ct)
    {
        var delivery = await _repo.FindByIdAsync(r.DeliveryId, ct);
        if (delivery is null) return false;

        delivery.RunsOffBat = r.RunsOffBat;
        delivery.ExtrasType = EnumParser.ParseNullable<ExtrasType>(r.ExtrasType);
        delivery.ExtrasRuns = r.ExtrasRuns;
        delivery.TotalRuns = r.RunsOffBat + r.ExtrasRuns;
        delivery.IsWicket = r.IsWicket;
        delivery.WicketType = EnumParser.ParseNullable<WicketType>(r.WicketType);
        delivery.DismissedMoraBatterId = r.DismissedMoraBatterId;
        delivery.DismissedOppBatterId = r.DismissedOppBatterId;
        delivery.DismissedBatterName = r.DismissedBatterName;
        delivery.MoraFielderId = r.MoraFielderId;
        delivery.OppFielderName = r.OppFielderName;
        delivery.BowlingSide = EnumParser.ParseNullable<BowlingSide>(r.BowlingSide);
        delivery.ShotType = EnumParser.ParseNullable<ShotType>(r.ShotType);
        delivery.DirectionZone = EnumParser.ParseNullable<DirectionZone>(r.DirectionZone);

        var success = await _repo.UpdateDeliveryAsync(delivery, ct);

        // Recompute over summary after correction
        await _repo.RecomputeOverSummaryAsync(
            delivery.InningsId, delivery.OverNumber, ct);

        return success;
    }
}

// ── Delete delivery (undo) ────────────────────────────────────────────────────
public class DeleteDeliveryHandler : IRequestHandler<DeleteDeliveryCommand, bool>
{
    private readonly IDeliveryRepository _repo;
    public DeleteDeliveryHandler(IDeliveryRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        DeleteDeliveryCommand r, CancellationToken ct)
    {
        var success = await _repo.DeleteDeliveryAsync(r.DeliveryId, ct);
        if (!success) return false;

        // Recompute over summary after deletion
        await _repo.RecomputeOverSummaryAsync(r.InningsId, r.OverNumber, ct);
        return true;
    }
}

// ── Mark innings delivery complete ────────────────────────────────────────────
public class MarkInningsDeliveryCompleteHandler
    : IRequestHandler<MarkInningsDeliveryCompleteCommand, bool>
{
    private readonly IDeliveryRepository _repo;
    public MarkInningsDeliveryCompleteHandler(IDeliveryRepository repo)
        => _repo = repo;

    public Task<bool> Handle(
        MarkInningsDeliveryCompleteCommand r, CancellationToken ct)
        => _repo.MarkInningsHasDeliveryDataAsync(r.InningsId, ct)
            .ContinueWith(_ => true, ct);
}
