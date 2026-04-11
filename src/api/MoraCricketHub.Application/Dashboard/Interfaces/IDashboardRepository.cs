using System;
using System.Collections.Generic;
using System.Text;
using MoraCricketHub.Application.Dashboard.Queries;

namespace MoraCricketHub.Application.Dashboard.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct);
}
