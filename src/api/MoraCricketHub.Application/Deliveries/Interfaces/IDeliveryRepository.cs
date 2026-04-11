using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Application.Deliveries.Queries;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Deliveries.Interfaces;

public interface IDeliveryRepository
{
    // Queries
    Task<List<DeliveryDto>> GetInningsDeliveriesAsync(
        Guid inningsId, CancellationToken ct);

    Task<List<DeliveryDto>> GetOverDeliveriesAsync(
        Guid inningsId, int overNumber, CancellationToken ct);

    Task<List<OverSummaryDto>> GetOverSummariesAsync(
        Guid inningsId, CancellationToken ct);

    Task<Delivery?> FindByIdAsync(
        Guid id, CancellationToken ct);

    // Commands
    Task<Guid> AddDeliveryAsync(
        Delivery delivery, CancellationToken ct);

    Task<bool> UpdateDeliveryAsync(
        Delivery delivery, CancellationToken ct);

    Task<bool> DeleteDeliveryAsync(
        Guid id, CancellationToken ct);

    // Over summary — recomputed after every ball in an over
    Task RecomputeOverSummaryAsync(
        Guid inningsId, int overNumber, CancellationToken ct);

    // Mark innings as having delivery data
    Task MarkInningsHasDeliveryDataAsync(
        Guid inningsId, CancellationToken ct);
}
