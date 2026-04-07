using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Players.Queries;

// ── Detailed DTO (includes season info) ──────────────────────────────────────
public record PlayerDetailDto(
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
    bool IsActive,
    List<PlayerSeasonDto> Seasons
);

public record PlayerSeasonDto(
    Guid SeasonId,
    string SeasonName,
    int? JerseyNumber,
    string? BattingRole
);

// ── Query ─────────────────────────────────────────────────────────────────────
public record GetPlayerByIdQuery(Guid PlayerId) : IRequest<PlayerDetailDto?>;
