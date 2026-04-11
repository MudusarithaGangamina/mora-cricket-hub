using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MoraCricketHub.Application.Players.Commands;
using MoraCricketHub.Application.Players.Queries;

namespace MoraCricketHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly IMediator _mediator;
    public PlayersController(IMediator mediator) => _mediator = mediator;

    // ── GET /api/players ──────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool activeOnly = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetAllPlayersQuery(activeOnly), cancellationToken);
        return Ok(result);
    }

    // ── GET /api/players/{id} ─────────────────────────────────────────────────
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(
            new GetPlayerByIdQuery(id), cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    // ── POST /api/players ─────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreatePlayerCommand command,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var id = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new
            {
                errors = ex.Errors.Select(e => new
                {
                    field = e.PropertyName,
                    message = e.ErrorMessage,
                })
            });
        }
    }

    // ── PUT /api/players/{id} ─────────────────────────────────────────────────
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdatePlayerCommand command,
        CancellationToken cancellationToken = default)
    {
        // Ensure the route id matches the command id
        if (id != command.PlayerId)
            return BadRequest(new { message = "Route id does not match body id." });

        try
        {
            var success = await _mediator.Send(command, cancellationToken);
            return success ? NoContent() : NotFound();
        }
        catch (ValidationException ex)
        {
            return BadRequest(new
            {
                errors = ex.Errors.Select(e => new
                {
                    field = e.PropertyName,
                    message = e.ErrorMessage,
                })
            });
        }
    }

    // GET /api/players/{id}/career-stats
    [HttpGet("{id:guid}/career-stats")]
    public async Task<IActionResult> GetCareerStats(
        Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(
            new GetPlayerCareerStatsQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }
}
