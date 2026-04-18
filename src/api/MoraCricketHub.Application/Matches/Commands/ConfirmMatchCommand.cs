using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Matches.Interfaces;

namespace MoraCricketHub.Application.Matches.Commands;

public record ConfirmMatchCommand(Guid MatchId) : IRequest<bool>;

public class ConfirmMatchHandler : IRequestHandler<ConfirmMatchCommand, bool>
{
    private readonly IMatchRepository _repo;
    public ConfirmMatchHandler(IMatchRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        ConfirmMatchCommand r, CancellationToken ct)
    {
        var match = await _repo.FindByIdAsync(r.MatchId, ct);
        if (match is null) return false;

        match.IsConfirmed = true;
        return await _repo.UpdateAsync(match, ct);
    }
}
