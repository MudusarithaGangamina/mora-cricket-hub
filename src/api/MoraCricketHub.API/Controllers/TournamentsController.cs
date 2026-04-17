using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MoraCricketHub.Application.Common;
using MoraCricketHub.Application.Tournaments.Commands;
using MoraCricketHub.Application.Tournaments.Queries;

namespace MoraCricketHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TournamentsController : ControllerBase
{
    private readonly IMediator _mediator;
    public TournamentsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? seasonId, CancellationToken ct)
        => Ok(await _mediator.Send(new GetAllTournamentsQuery(seasonId), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTournamentByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateTournamentCommand command, CancellationToken ct)
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
        Guid id, [FromBody] UpdateTournamentCommand command, CancellationToken ct)
    {
        if (id != command.TournamentId)
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
        var success = await _mediator.Send(new DeleteTournamentCommand(id), ct);
        return success ? NoContent() : NotFound();
    }
}
