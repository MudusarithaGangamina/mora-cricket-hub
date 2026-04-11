using MediatR;
using Microsoft.AspNetCore.Mvc;
using MoraCricketHub.Application.Dashboard.Queries;

namespace MoraCricketHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;
    public DashboardController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
        => Ok(await _mediator.Send(new GetDashboardSummaryQuery(), ct));
}
