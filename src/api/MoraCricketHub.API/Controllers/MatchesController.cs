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

    // GET /api/matches/{id}/squad
    [HttpGet("{id:guid}/squad")]
    public async Task<IActionResult> GetSquad(
        Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetMatchSquadQuery(id), ct));

    // POST /api/matches/{id}/squad
    [HttpPost("{id:guid}/squad")]
    public async Task<IActionResult> SetSquad(
        Guid id,
        [FromBody] SetSquadCommand command,
        CancellationToken ct)
    {
        if (id != command.MatchId)
            return BadRequest(new { message = "Id mismatch." });
        var success = await _mediator.Send(command, ct);
        return success ? NoContent() : NotFound();
    }

    // GET /api/matches/{id}/opponent-squad
    [HttpGet("{id:guid}/opponent-squad")]
    public async Task<IActionResult> GetOpponentSquad(
        Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(
            new GetOpponentSquadQuery(id), ct));

    // POST /api/matches/{id}/opponent-squad
    [HttpPost("{id:guid}/opponent-squad")]
    public async Task<IActionResult> SetOpponentSquad(
        Guid id,
        [FromBody] SetOpponentSquadCommand command,
        CancellationToken ct)
    {
        if (id != command.MatchId)
            return BadRequest(new { message = "Id mismatch." });
        await _mediator.Send(command, ct);
        return NoContent();
    }

    // PUT /api/matches/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateMatchCommand command,
        CancellationToken ct)
    {
        if (id != command.MatchId)
            return BadRequest(new { message = "Id mismatch." });
        try
        {
            var success = await _mediator.Send(command, ct);
            if (!success)
                return BadRequest(new
                {
                    message =
                    "Match not found or is confirmed (locked)."
                });
            return NoContent();
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

    // PATCH /api/matches/{id}/confirm
    [HttpPatch("{id:guid}/confirm")]
    public async Task<IActionResult> Confirm(
        Guid id, CancellationToken ct)
    {
        var success = await _mediator.Send(
            new ConfirmMatchCommand(id), ct);
        return success ? NoContent() : NotFound();
    }

    // GET /api/matches/{id}/summary
    [HttpGet("{id:guid}/summary")]
    public async Task<IActionResult> GetSummary(
        Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(
            new GetMatchSummaryDataQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

}
