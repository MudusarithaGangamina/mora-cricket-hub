using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Innings.Interfaces;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Application.Innings.Commands;

public class UpdateInningsOversHandler
    : IRequestHandler<UpdateInningsOversCommand, bool>
{
    private readonly IInningsRepository _repo;
    public UpdateInningsOversHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdateInningsOversCommand r, CancellationToken ct)
    {
        var innings = await _repo.FindByIdAsync(r.InningsId, ct);
        if (innings is null) return false;

        innings.MaxOvers = r.MaxOvers;
        if (r.Target.HasValue) innings.Target = r.Target;

        return await _repo.UpdateInningsAsync(innings, ct);
    }
}

public class CompleteInningsHandler
    : IRequestHandler<CompleteInningsCommand, bool>
{
    private readonly IInningsRepository _repo;
    public CompleteInningsHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        CompleteInningsCommand r, CancellationToken ct)
    {
        var innings = await _repo.FindByIdAsync(r.InningsId, ct);
        if (innings is null) return false;

        innings.IsCompleted = true;
        innings.EndedAtOver = r.EndedAtOver;

        // Add completion event
        var ev = new InningsEvent
        {
            InningsId = r.InningsId,
            EventType = "INNINGS_END",
            AtOver = r.EndedAtOver,
            Description = r.Reason switch
            {
                "WICKETS" => "All out",
                "OVERS" => "Innings completed — overs finished",
                "TARGET" => "Target achieved",
                _ => "Innings ended",
            },
        };
        await _repo.AddInningsEventAsync(ev, ct);

        return await _repo.UpdateInningsAsync(innings, ct);
    }
}

public class ConfirmInningsHandler
    : IRequestHandler<ConfirmInningsCommand, bool>
{
    private readonly IInningsRepository _repo;
    public ConfirmInningsHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        ConfirmInningsCommand r, CancellationToken ct)
    {
        var innings = await _repo.FindByIdAsync(r.InningsId, ct);
        if (innings is null) return false;

        innings.IsConfirmed = true;
        return await _repo.UpdateInningsAsync(innings, ct);
    }
}

public class AddInningsEventHandler
    : IRequestHandler<AddInningsEventCommand, Guid>
{
    private readonly IInningsRepository _repo;
    public AddInningsEventHandler(IInningsRepository repo) => _repo = repo;

    public Task<Guid> Handle(
        AddInningsEventCommand r, CancellationToken ct)
        => _repo.AddInningsEventAsync(new InningsEvent
        {
            InningsId = r.InningsId,
            EventType = r.EventType,
            AtOver = r.AtOver,
            TeamScoreAtEvent = r.TeamScoreAtEvent,
            TeamWicketsAtEvent = r.TeamWicketsAtEvent,
            RevisedOvers = r.RevisedOvers,
            Description = r.Description,
            PlayerId = r.PlayerId,
        }, ct);
}

public class ChangeBowlerMidOverHandler
    : IRequestHandler<ChangeBowlerMidOverCommand, bool>
{
    private readonly IInningsRepository _repo;
    public ChangeBowlerMidOverHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        ChangeBowlerMidOverCommand r, CancellationToken ct)
    {
        // Record event
        var ev = new InningsEvent
        {
            InningsId = r.InningsId,
            EventType = "BOWLER_CHANGE",
            Description = $"Bowler change at over {r.OverNumber}.{r.FromBallNumber}",
        };
        await _repo.AddInningsEventAsync(ev, ct);
        return true;
    }
}

public class ChangeKeeperHandler
    : IRequestHandler<ChangeKeeperCommand, bool>
{
    private readonly IInningsRepository _repo;
    public ChangeKeeperHandler(IInningsRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        ChangeKeeperCommand r, CancellationToken ct)
    {
        var innings = await _repo.FindByIdAsync(r.InningsId, ct);
        if (innings is null) return false;

        // Update the innings-level keeper
        innings.MoraWickeeperId = r.NewKeeperId;

        var ev = new InningsEvent
        {
            InningsId = r.InningsId,
            EventType = "KEEPER_CHANGE",
            AtOver = r.OverNumber + (decimal)r.BallNumber / 10,
            Description = "Wicketkeeper changed",
            PlayerId = r.NewKeeperId,
        };
        await _repo.AddInningsEventAsync(ev, ct);

        return await _repo.UpdateInningsAsync(innings, ct);
    }
}
