using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Opponents.Queries;

public record OpponentDto(
    Guid Id,
    string Name,
    string ShortName,
    int RegisteredPlayers
);

public record OpponentPlayerDto(
    Guid Id,
    string FullName,
    string? BattingStyle,
    string? BowlingStyle,
    string? Notes
);

public record OpponentDetailDto(
    Guid Id,
    string Name,
    string ShortName,
    List<OpponentPlayerDto> Players
);

public record GetAllOpponentsQuery : IRequest<List<OpponentDto>>;
public record GetOpponentByIdQuery(Guid OpponentId) : IRequest<OpponentDetailDto?>;
