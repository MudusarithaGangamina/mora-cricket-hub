using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MoraCricketHub.Application.Innings.Commands;
using MoraCricketHub.Application.Innings.Queries;

namespace MoraCricketHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InningsController : ControllerBase
{
    private readonly IMediator _mediator;
    public InningsController(IMediator mediator) => _mediator = mediator;

    // ── GET scorecard for one innings ─────────────────────────────────────────
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetScorecard(
        Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(
            new GetInningsScorecardQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    // ── GET all innings for a match ───────────────────────────────────────────
    [HttpGet("match/{matchId:guid}")]
    public async Task<IActionResult> GetMatchScorecards(
        Guid matchId, CancellationToken ct)
        => Ok(await _mediator.Send(
            new GetMatchScorecardsQuery(matchId), ct));

    // ── POST create innings ───────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> CreateInnings(
        [FromBody] CreateInningsCommand command, CancellationToken ct)
    {
        try
        {
            var id = await _mediator.Send(command, ct);
            return CreatedAtAction(nameof(GetScorecard), new { id }, new { id });
        }
        catch (ValidationException ex)
        {
            return BadRequest(BuildErrors(ex));
        }
    }

    // ── PATCH update innings totals ───────────────────────────────────────────
    [HttpPatch("{id:guid}/totals")]
    public async Task<IActionResult> UpdateTotals(
        Guid id,
        [FromBody] UpdateInningsTotalsCommand command,
        CancellationToken ct)
    {
        if (id != command.InningsId)
            return BadRequest(new { message = "Id mismatch." });
        var success = await _mediator.Send(command, ct);
        return success ? NoContent() : NotFound();
    }

    // ── Mora batting ──────────────────────────────────────────────────────────
    [HttpPost("{inningsId:guid}/mora-batting")]
    public async Task<IActionResult> AddMoraBatting(
        Guid inningsId,
        [FromBody] AddMoraBattingCommand command,
        CancellationToken ct)
    {
        if (inningsId != command.InningsId)
            return BadRequest(new { message = "Id mismatch." });
        try
        {
            var id = await _mediator.Send(command, ct);
            return Created(string.Empty, new { id });
        }
        catch (ValidationException ex) { return BadRequest(BuildErrors(ex)); }
    }

    [HttpPut("mora-batting/{id:guid}")]
    public async Task<IActionResult> UpdateMoraBatting(
        Guid id,
        [FromBody] UpdateMoraBattingCommand command,
        CancellationToken ct)
    {
        if (id != command.PerformanceId)
            return BadRequest(new { message = "Id mismatch." });
        var success = await _mediator.Send(command, ct);
        return success ? NoContent() : NotFound();
    }

    // ── Opponent batting ──────────────────────────────────────────────────────
    [HttpPost("{inningsId:guid}/opponent-batting")]
    public async Task<IActionResult> AddOpponentBatting(
        Guid inningsId,
        [FromBody] AddOpponentBattingCommand command,
        CancellationToken ct)
    {
        if (inningsId != command.InningsId)
            return BadRequest(new { message = "Id mismatch." });
        try
        {
            var id = await _mediator.Send(command, ct);
            return Created(string.Empty, new { id });
        }
        catch (ValidationException ex) { return BadRequest(BuildErrors(ex)); }
    }

    [HttpPut("opponent-batting/{id:guid}")]
    public async Task<IActionResult> UpdateOpponentBatting(
        Guid id,
        [FromBody] UpdateOpponentBattingCommand command,
        CancellationToken ct)
    {
        if (id != command.PerformanceId)
            return BadRequest(new { message = "Id mismatch." });
        var success = await _mediator.Send(command, ct);
        return success ? NoContent() : NotFound();
    }

    // ── Mora bowling ──────────────────────────────────────────────────────────
    [HttpPost("{inningsId:guid}/mora-bowling")]
    public async Task<IActionResult> AddMoraBowling(
        Guid inningsId,
        [FromBody] AddMoraBowlingCommand command,
        CancellationToken ct)
    {
        if (inningsId != command.InningsId)
            return BadRequest(new { message = "Id mismatch." });
        try
        {
            var id = await _mediator.Send(command, ct);
            return Created(string.Empty, new { id });
        }
        catch (ValidationException ex) { return BadRequest(BuildErrors(ex)); }
    }

    [HttpPut("mora-bowling/{id:guid}")]
    public async Task<IActionResult> UpdateMoraBowling(
        Guid id,
        [FromBody] UpdateMoraBowlingCommand command,
        CancellationToken ct)
    {
        if (id != command.PerformanceId)
            return BadRequest(new { message = "Id mismatch." });
        var success = await _mediator.Send(command, ct);
        return success ? NoContent() : NotFound();
    }

    // ── Opponent bowling ──────────────────────────────────────────────────────
    [HttpPost("{inningsId:guid}/opponent-bowling")]
    public async Task<IActionResult> AddOpponentBowling(
        Guid inningsId,
        [FromBody] AddOpponentBowlingCommand command,
        CancellationToken ct)
    {
        if (inningsId != command.InningsId)
            return BadRequest(new { message = "Id mismatch." });
        try
        {
            var id = await _mediator.Send(command, ct);
            return Created(string.Empty, new { id });
        }
        catch (ValidationException ex) { return BadRequest(BuildErrors(ex)); }
    }

    [HttpPut("opponent-bowling/{id:guid}")]
    public async Task<IActionResult> UpdateOpponentBowling(
        Guid id,
        [FromBody] UpdateOpponentBowlingCommand command,
        CancellationToken ct)
    {
        if (id != command.PerformanceId)
            return BadRequest(new { message = "Id mismatch." });
        var success = await _mediator.Send(command, ct);
        return success ? NoContent() : NotFound();
    }

    // ── Fall of wickets ───────────────────────────────────────────────────────
    [HttpPost("{inningsId:guid}/fall-of-wickets")]
    public async Task<IActionResult> AddFallOfWicket(
        Guid inningsId,
        [FromBody] AddFallOfWicketCommand command,
        CancellationToken ct)
    {
        if (inningsId != command.InningsId)
            return BadRequest(new { message = "Id mismatch." });
        var id = await _mediator.Send(command, ct);
        return Created(string.Empty, new { id });
    }

    // ── Partnerships ──────────────────────────────────────────────────────────
    [HttpPost("{inningsId:guid}/partnerships")]
    public async Task<IActionResult> AddPartnership(
        Guid inningsId,
        [FromBody] AddPartnershipCommand command,
        CancellationToken ct)
    {
        if (inningsId != command.InningsId)
            return BadRequest(new { message = "Id mismatch." });
        var id = await _mediator.Send(command, ct);
        return Created(string.Empty, new { id });
    }

    // ── Fielding ──────────────────────────────────────────────────────────────
    [HttpPost("{inningsId:guid}/fielding")]
    public async Task<IActionResult> AddFielding(
        Guid inningsId,
        [FromBody] AddMoraFieldingCommand command,
        CancellationToken ct)
    {
        if (inningsId != command.InningsId)
            return BadRequest(new { message = "Id mismatch." });
        var id = await _mediator.Send(command, ct);
        return Created(string.Empty, new { id });
    }

    [HttpPut("fielding/{id:guid}")]
    public async Task<IActionResult> UpdateFielding(
        Guid id,
        [FromBody] UpdateMoraFieldingCommand command,
        CancellationToken ct)
    {
        if (id != command.PerformanceId)
            return BadRequest(new { message = "Id mismatch." });
        var success = await _mediator.Send(command, ct);
        return success ? NoContent() : NotFound();
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private static object BuildErrors(ValidationException ex) => new
    {
        errors = ex.Errors.Select(e => new
        { field = e.PropertyName, message = e.ErrorMessage })
    };
}
