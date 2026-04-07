using System;
using System.Collections.Generic;
using System.Text;
using MediatR;
using MoraCricketHub.Application.Players.Interfaces;
using MoraCricketHub.Domain.Entities;
using MoraCricketHub.Domain.Enums;

namespace MoraCricketHub.Application.Players.Commands;

public class CreatePlayerHandler : IRequestHandler<CreatePlayerCommand, Guid>
{
    private readonly IPlayerRepository _repo;
    public CreatePlayerHandler(IPlayerRepository repo) => _repo = repo;

    public Task<Guid> Handle(
        CreatePlayerCommand request,
        CancellationToken cancellationToken)
    {
        var player = new Player
        {
            FullName = request.FullName.Trim(),
            ShortName = request.ShortName.Trim(),
            Nickname = request.Nickname?.Trim(),
            PhotoUrl = request.PhotoUrl?.Trim(),
            Faculty = request.Faculty?.Trim(),
            Degree = request.Degree?.Trim(),
            BatchYear = request.BatchYear,
            BattingStyle = Enum.Parse<BattingStyle>(request.BattingStyle),
            PrimaryBowlingStyle = request.PrimaryBowlingStyle is null
                                    ? null
                                    : Enum.Parse<BowlingStyle>(request.PrimaryBowlingStyle),
            IsActive = true,
        };

        return _repo.CreateAsync(player, cancellationToken);
    }
}
