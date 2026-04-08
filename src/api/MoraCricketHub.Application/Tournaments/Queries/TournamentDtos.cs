using System;
using System.Collections.Generic;
using System.Text;
using MediatR;

namespace MoraCricketHub.Application.Tournaments.Queries;

public record TournamentDto(
    Guid Id,
    Guid SeasonId,
    string SeasonName,
    string Name,
    string Format,
    int OversPerSide
);

public record GetAllTournamentsQuery(Guid? SeasonId = null)
    : IRequest<List<TournamentDto>>;

public record GetTournamentByIdQuery(Guid TournamentId)
    : IRequest<TournamentDto?>;
