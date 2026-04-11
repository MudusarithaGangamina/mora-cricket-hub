using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Dashboard.Interfaces;

namespace MoraCricketHub.Application.Dashboard.Queries;

public class GetDashboardSummaryHandler
    : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
{
    private readonly IDashboardRepository _repo;
    public GetDashboardSummaryHandler(IDashboardRepository repo) => _repo = repo;

    public Task<DashboardSummaryDto> Handle(
        GetDashboardSummaryQuery request, CancellationToken ct)
        => _repo.GetSummaryAsync(ct);
}
