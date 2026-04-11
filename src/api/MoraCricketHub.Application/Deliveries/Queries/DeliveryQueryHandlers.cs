using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Deliveries.Interfaces;

namespace MoraCricketHub.Application.Deliveries.Queries;

public class GetInningsDeliveriesHandler
    : IRequestHandler<GetInningsDeliveriesQuery, List<DeliveryDto>>
{
    private readonly IDeliveryRepository _repo;
    public GetInningsDeliveriesHandler(IDeliveryRepository repo) => _repo = repo;

    public Task<List<DeliveryDto>> Handle(
        GetInningsDeliveriesQuery request, CancellationToken ct)
        => _repo.GetInningsDeliveriesAsync(request.InningsId, ct);
}

public class GetOverDeliveriesHandler
    : IRequestHandler<GetOverDeliveriesQuery, List<DeliveryDto>>
{
    private readonly IDeliveryRepository _repo;
    public GetOverDeliveriesHandler(IDeliveryRepository repo) => _repo = repo;

    public Task<List<DeliveryDto>> Handle(
        GetOverDeliveriesQuery request, CancellationToken ct)
        => _repo.GetOverDeliveriesAsync(
            request.InningsId, request.OverNumber, ct);
}

public class GetOverSummariesHandler
    : IRequestHandler<GetOverSummariesQuery, List<OverSummaryDto>>
{
    private readonly IDeliveryRepository _repo;
    public GetOverSummariesHandler(IDeliveryRepository repo) => _repo = repo;

    public Task<List<OverSummaryDto>> Handle(
        GetOverSummariesQuery request, CancellationToken ct)
        => _repo.GetOverSummariesAsync(request.InningsId, ct);
}
