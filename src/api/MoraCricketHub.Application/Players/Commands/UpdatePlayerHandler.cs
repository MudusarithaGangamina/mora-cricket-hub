using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Players.Interfaces;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Application.Players.Commands;

public class UpdatePlayerHandler : IRequestHandler<UpdatePlayerCommand, bool>
{
    private readonly IPlayerRepository _repo;
    public UpdatePlayerHandler(IPlayerRepository repo) => _repo = repo;

    public async Task<bool> Handle(
        UpdatePlayerCommand request,
        CancellationToken cancellationToken)
    {
        var player = await _repo.FindByIdAsync(request.PlayerId, cancellationToken);
        if (player is null) return false;

        player.FullName = request.FullName.Trim();
        player.ShortName = request.ShortName.Trim();
        player.Nickname = request.Nickname?.Trim();
        player.PhotoUrl = request.PhotoUrl?.Trim();
        player.Faculty = request.Faculty?.Trim();
        player.Degree = request.Degree?.Trim();
        player.BatchYear = request.BatchYear;
        player.BattingStyle = Enum.Parse<BattingStyle>(request.BattingStyle);
        player.PrimaryBowlingStyle = request.PrimaryBowlingStyle is null
                                       ? null
                                       : Enum.Parse<BowlingStyle>(request.PrimaryBowlingStyle);
        player.IsActive = request.IsActive;

        return await _repo.UpdateAsync(player, cancellationToken);
    }
}
