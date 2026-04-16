using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MoraCricketHub.Application.Common;
using MoraCricketHub.Application.Seasons.Commands;
using MoraCricketHub.Application.Seasons.Queries;

namespace MoraCricketHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeasonsController : ControllerBase
{
    private readonly IMediator _mediator;
    public SeasonsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetAllSeasonsQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSeasonByIdQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateSeasonCommand command, CancellationToken ct)
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
        Guid id, [FromBody] UpdateSeasonCommand command, CancellationToken ct)
    {
        if (id != command.SeasonId)
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
        var success = await _mediator.Send(new DeleteSeasonCommand(id), ct);
        return success ? NoContent() : NotFound();
    }
}
