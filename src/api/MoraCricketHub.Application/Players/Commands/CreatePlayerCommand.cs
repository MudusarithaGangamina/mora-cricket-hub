using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Players.Commands;

public record CreatePlayerCommand(
    string FullName,
    string ShortName,
    string? Nickname,
    string? PhotoUrl,
    string? Faculty,
    string? Degree,
    int BatchYear,
    string BattingStyle,
    string? PrimaryBowlingStyle
) : IRequest<Guid>;
