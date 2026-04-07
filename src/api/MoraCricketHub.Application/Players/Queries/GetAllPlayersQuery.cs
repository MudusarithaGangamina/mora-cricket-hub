using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Players.Queries;

// ── Response DTO ──────────────────────────────────────────────────────────────
public record PlayerSummaryDto(
    Guid Id,
    string FullName,
    string ShortName,
    string? Nickname,
    string? PhotoUrl,
    string? Faculty,
    string? Degree,
    int BatchYear,
    string BattingStyle,
    string? PrimaryBowlingStyle,
    string? DebutDate,
    bool IsActive
);

// ── Query ─────────────────────────────────────────────────────────────────────
public record GetAllPlayersQuery(bool ActiveOnly = false) : IRequest<List<PlayerSummaryDto>>;
