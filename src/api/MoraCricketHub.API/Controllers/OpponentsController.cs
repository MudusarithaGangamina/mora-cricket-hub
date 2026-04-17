using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MoraCricketHub.Application.Common;
using MoraCricketHub.Application.Opponents.Commands;
using MoraCricketHub.Application.Opponents.Queries;

namespace MoraCricketHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OpponentsController : ControllerBase
{
    private readonly IMediator _mediator;
    public OpponentsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAllOpponentsQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOpponentByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateOpponentCommand command, CancellationToken ct)
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

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id, [FromBody] UpdateOpponentCommand command, CancellationToken ct)
    {
        if (id != command.OpponentId)
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

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var success = await _mediator.Send(new DeleteOpponentCommand(id), ct);
        return success ? NoContent() : NotFound();
    }

    // ── Opponent Players ──────────────────────────────────────────────────────

    [HttpPost("{opponentId:guid}/players")]
    public async Task<IActionResult> CreatePlayer(
        Guid opponentId,
        [FromBody] CreateOpponentPlayerCommand command,
        CancellationToken ct)
    {
        if (opponentId != command.OpponentId)
            return BadRequest(new { message = "Route opponentId does not match body." });
        try
        {
            var id = await _mediator.Send(command, ct);
            return Created(string.Empty, new { id });
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

    [HttpPut("players/{playerId:guid}")]
    public async Task<IActionResult> UpdatePlayer(
        Guid playerId,
        [FromBody] UpdateOpponentPlayerCommand command,
        CancellationToken ct)
    {
        if (playerId != command.OpponentPlayerId)
            return BadRequest(new { message = "Route playerId does not match body." });
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

    [HttpDelete("players/{playerId:guid}")]
    public async Task<IActionResult> DeletePlayer(
        Guid playerId, CancellationToken ct)
    {
        var success = await _mediator.Send(
            new DeleteOpponentPlayerCommand(playerId), ct);
        return success ? NoContent() : NotFound();
    }
}
