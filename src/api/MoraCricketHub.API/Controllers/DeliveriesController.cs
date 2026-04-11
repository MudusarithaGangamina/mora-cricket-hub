using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MoraCricketHub.Application.Deliveries.Commands;
using MoraCricketHub.Application.Deliveries.Queries;

namespace MoraCricketHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DeliveriesController : ControllerBase
{
    private readonly IMediator _mediator;
    public DeliveriesController(IMediator mediator) => _mediator = mediator;

    // ── GET all deliveries for an innings ─────────────────────────────────────
    [HttpGet("innings/{inningsId:guid}")]
    public async Task<IActionResult> GetInningsDeliveries(
        Guid inningsId, CancellationToken ct)
        => Ok(await _mediator.Send(
            new GetInningsDeliveriesQuery(inningsId), ct));

    // ── GET deliveries for one over ───────────────────────────────────────────
    [HttpGet("innings/{inningsId:guid}/over/{overNumber:int}")]
    public async Task<IActionResult> GetOverDeliveries(
        Guid inningsId, int overNumber, CancellationToken ct)
        => Ok(await _mediator.Send(
            new GetOverDeliveriesQuery(inningsId, overNumber), ct));

    // ── GET over summaries (worm chart data) ──────────────────────────────────
    [HttpGet("innings/{inningsId:guid}/over-summaries")]
    public async Task<IActionResult> GetOverSummaries(
        Guid inningsId, CancellationToken ct)
        => Ok(await _mediator.Send(
            new GetOverSummariesQuery(inningsId), ct));

    // ── POST add one delivery ─────────────────────────────────────────────────
    // Called immediately on each confirmed ball — never batch at end of over
    [HttpPost]
    public async Task<IActionResult> Add(
        [FromBody] AddDeliveryCommand command,
        CancellationToken ct)
    {
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

    // ── PUT correct a delivery ────────────────────────────────────────────────
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateDeliveryCommand command,
        CancellationToken ct)
    {
        if (id != command.DeliveryId)
            return BadRequest(new { message = "Id mismatch." });

        var success = await _mediator.Send(command, ct);
        return success ? NoContent() : NotFound();
    }

    // ── DELETE undo last ball ─────────────────────────────────────────────────
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromQuery] Guid inningsId,
        [FromQuery] int overNumber,
        CancellationToken ct)
    {
        var success = await _mediator.Send(
            new DeleteDeliveryCommand(id, inningsId, overNumber), ct);
        return success ? NoContent() : NotFound();
    }

    // ── PATCH mark innings delivery data complete ─────────────────────────────
    // Call this once all balls for an innings are entered
    // Sets HasDeliveryData = true, enabling this innings in analytics
    [HttpPatch("innings/{inningsId:guid}/mark-complete")]
    public async Task<IActionResult> MarkComplete(
        Guid inningsId, CancellationToken ct)
    {
        await _mediator.Send(
            new MarkInningsDeliveryCompleteCommand(inningsId), ct);
        return NoContent();
    }
}
