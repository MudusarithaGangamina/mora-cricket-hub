using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Opponents.Commands;

// ── Opponent team ─────────────────────────────────────────────────────────────
public record CreateOpponentCommand(
    string Name,
    string ShortName
) : IRequest<Guid>;

public record UpdateOpponentCommand(
    Guid OpponentId,
    string Name,
    string ShortName
) : IRequest<bool>;

// ── Opponent player ───────────────────────────────────────────────────────────
public record CreateOpponentPlayerCommand(
    Guid OpponentId,
    string FullName,
    string? BattingStyle,
    string? BowlingStyle,
    string? Notes
) : IRequest<Guid>;

public record UpdateOpponentPlayerCommand(
    Guid OpponentPlayerId,
    string FullName,
    string? BattingStyle,
    string? BowlingStyle,
    string? Notes
) : IRequest<bool>;
