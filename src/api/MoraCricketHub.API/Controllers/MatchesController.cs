using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MoraCricketHub.Application.Matches.Commands;
using MoraCricketHub.Application.Matches.Queries;

namespace MoraCricketHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly IMediator _mediator;
    public MatchesController(IMediator mediator) => _mediator = mediator;

    // ── GET /api/matches ──────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? tournamentId = null,
        [FromQuery] Guid? opponentId = null,
        [FromQuery] string? season = null,
        [FromQuery] string? resultType = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(
            new GetAllMatchesQuery(
                tournamentId, opponentId, season,
                resultType, page, pageSize), ct);
        return Ok(result);
    }

    // ── GET /api/matches/{id} ─────────────────────────────────────────────────
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetMatchByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    // ── POST /api/matches ─────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateMatchCommand command,
        CancellationToken ct = default)
    {
        try
        {
            var id = await _mediator.Send(command, ct);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new
            {
                errors = ex.Errors.Select(e => new
                { field = e.PropertyName, message = e.ErrorMessage })
            });
        }
    }

    // ── PATCH /api/matches/{id}/result ────────────────────────────────────────
    // Use PATCH not PUT because you're only updating the result fields
    [HttpPatch("{id:guid}/result")]
    public async Task<IActionResult> UpdateResult(
        Guid id,
        [FromBody] UpdateMatchResultCommand command,
        CancellationToken ct = default)
    {
        if (id != command.MatchId)
            return BadRequest(new { message = "Route id does not match body id." });
        try
        {
            var success = await _mediator.Send(command, ct);
            return success ? NoContent() : NotFound();
        }
        catch (ValidationException ex)
        {
            return BadRequest(new
            {
                errors = ex.Errors.Select(e => new
                { field = e.PropertyName, message = e.ErrorMessage })
            });
        }
    }
}
