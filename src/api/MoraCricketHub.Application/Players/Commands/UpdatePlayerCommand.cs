using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Players.Commands;

public record UpdatePlayerCommand(
    Guid PlayerId,
    string FullName,
    string ShortName,
    string? Nickname,
    string? PhotoUrl,
    string? Faculty,
    string? Degree,
    int BatchYear,
    string BattingStyle,
    string? PrimaryBowlingStyle,
    bool IsActive
) : IRequest<bool>;
